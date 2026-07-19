import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Timeout wrapper helper for Firestore network operations in test/offline environments.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 800): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Firestore Network Timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

/**
 * Reactive fallback listener store for seamless offline/demo operation.
 */
class LocalFirestoreStore<T extends { id: string }> {
  private data: Map<string, T> = new Map();
  private listeners: Set<(items: T[]) => void> = new Set();

  constructor(initialData: T[] = []) {
    initialData.forEach((item) => this.data.set(item.id, item));
  }

  public getAll(): T[] {
    return Array.from(this.data.values());
  }

  public setAll(items: T[]): void {
    this.data.clear();
    items.forEach((item) => this.data.set(item.id, item));
    this.notify();
  }

  public setItem(item: T): void {
    this.data.set(item.id, item);
    this.notify();
  }

  public updateItem(id: string, updates: Partial<T>): void {
    const existing = this.data.get(id);
    if (existing) {
      this.data.set(id, { ...existing, ...updates });
      this.notify();
    }
  }

  public deleteItem(id: string): void {
    this.data.delete(id);
    this.notify();
  }

  public subscribe(callback: (items: T[]) => void): Unsubscribe {
    this.listeners.add(callback);
    // Initial emit
    callback(this.getAll());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    const current = this.getAll();
    this.listeners.forEach((cb) => cb(current));
  }
}

const localStores: Map<string, LocalFirestoreStore<any>> = new Map();

/**
 * Get or create local reactive store fallback for collection.
 */
export function getLocalStore<T extends { id: string }>(
  collectionName: string,
  seedData: T[] = []
): LocalFirestoreStore<T> {
  if (!localStores.has(collectionName)) {
    localStores.set(collectionName, new LocalFirestoreStore<T>(seedData));
  }
  return localStores.get(collectionName)!;
}

/**
 * Generic Firestore collection subscription using modular SDK with local fallback.
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  callback: (items: T[]) => void,
  seedData: T[] = []
): Unsubscribe {
  const localStore = getLocalStore<T>(collectionName, seedData);

  try {
    const colRef = collection(db, collectionName);
    const unsubscribeFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: T[] = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as unknown as T
          );
          localStore.setAll(items);
        } else if (seedData.length > 0 && localStore.getAll().length === 0) {
          localStore.setAll(seedData);
        }
      },
      (_err) => {
        // Fallback to local store on permission/network error
      }
    );

    const unsubscribeLocal = localStore.subscribe(callback);

    return () => {
      unsubscribeFirestore();
      unsubscribeLocal();
    };
  } catch (_e) {
    return localStore.subscribe(callback);
  }
}

/**
 * Save or update document in Firestore collection and local store.
 */
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  docData: T,
  seedData: T[] = []
): Promise<void> {
  const localStore = getLocalStore<T>(collectionName, seedData);
  localStore.setItem(docData);

  try {
    const docRef = doc(db, collectionName, docData.id);
    await withTimeout(setDoc(docRef, docData as DocumentData, { merge: true }), 400);
  } catch (_e) {
    // Local store updated
  }
}

/**
 * Update document fields in Firestore collection and local store.
 */
export async function updateDocumentFields<T extends { id: string }>(
  collectionName: string,
  id: string,
  updates: Partial<T>,
  seedData: T[] = []
): Promise<void> {
  const localStore = getLocalStore<T>(collectionName, seedData);
  localStore.updateItem(id, updates);

  try {
    const docRef = doc(db, collectionName, id);
    await withTimeout(updateDoc(docRef, updates as DocumentData), 400);
  } catch (_e) {
    // Local store updated
  }
}

/**
 * Add a new document with generated ID to Firestore collection and local store.
 */
export async function addDocument<T extends { id: string }>(
  collectionName: string,
  docData: Omit<T, 'id'> & { id?: string },
  seedData: T[] = []
): Promise<string> {
  const generatedId = docData.id || `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const fullItem = { ...docData, id: generatedId } as T;
  const localStore = getLocalStore<T>(collectionName, seedData);
  localStore.setItem(fullItem);

  try {
    const colRef = collection(db, collectionName);
    const docRef = doc(colRef, generatedId);
    await withTimeout(setDoc(docRef, fullItem as DocumentData), 400);
  } catch (_e) {
    // Local store updated
  }

  return generatedId;
}

/**
 * Delete document from Firestore collection and local store.
 */
export async function deleteDocument<T extends { id: string }>(
  collectionName: string,
  id: string,
  seedData: T[] = []
): Promise<void> {
  const localStore = getLocalStore<T>(collectionName, seedData);
  localStore.deleteItem(id);

  try {
    const docRef = doc(db, collectionName, id);
    await withTimeout(deleteDoc(docRef), 400);
  } catch (_e) {
    // Local store deleted
  }
}

/**
 * Fetch collection snapshot once.
 */
export async function fetchCollection<T extends { id: string }>(
  collectionName: string,
  seedData: T[] = []
): Promise<T[]> {
  const localStore = getLocalStore<T>(collectionName, seedData);
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await withTimeout(getDocs(colRef), 400);
    if (!snapshot.empty) {
      const items = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as unknown as T
      );
      localStore.setAll(items);
      return items;
    }
  } catch (_e) {
    // return local store
  }
  return localStore.getAll();
}
