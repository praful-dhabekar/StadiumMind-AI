import { Parking } from '../types';
import { initialParking } from './seedService';
import {
  subscribeToCollection,
  fetchCollection,
  updateDocumentFields,
  saveDocument,
} from './firestoreBase';

const COLLECTION_NAME = 'parking';

/**
 * Subscribe to realtime updates for parking collection in Firestore.
 */
export function subscribeToParking(callback: (parking: Parking[]) => void) {
  return subscribeToCollection<Parking>(COLLECTION_NAME, callback, initialParking);
}

/**
 * Fetch parking snapshot from Firestore.
 */
export async function getParking(): Promise<Parking[]> {
  return fetchCollection<Parking>(COLLECTION_NAME, initialParking);
}

/**
 * Update parking document in Firestore.
 */
export async function updateParking(id: string, updates: Partial<Parking>): Promise<void> {
  return updateDocumentFields<Parking>(COLLECTION_NAME, id, updates, initialParking);
}

/**
 * Save parking document in Firestore.
 */
export async function saveParking(parking: Parking): Promise<void> {
  return saveDocument<Parking>(COLLECTION_NAME, parking, initialParking);
}

/**
 * Adjust available parking spaces for a parking lot in Firestore.
 */
export async function adjustParkingUsage(id: string, deltaAvailable: number): Promise<void> {
  const parkingLots = await getParking();
  const target = parkingLots.find((p) => p.id === id);
  if (!target) return;

  const newAvailable = Math.max(0, Math.min(target.total, target.available + deltaAvailable));
  const newStatus: Parking['status'] =
    newAvailable === 0
      ? 'FULL'
      : newAvailable < target.total * 0.15
      ? 'LIMITED'
      : 'AVAILABLE';

  await updateParking(id, {
    available: newAvailable,
    status: newStatus,
  });
}
