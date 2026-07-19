import { Restroom } from '../types';
import { initialRestrooms } from './seedService';
import {
  subscribeToCollection,
  fetchCollection,
  updateDocumentFields,
  saveDocument,
} from './firestoreBase';

const COLLECTION_NAME = 'restrooms';

/**
 * Subscribe to realtime updates for restrooms collection in Firestore.
 */
export function subscribeToRestrooms(callback: (restrooms: Restroom[]) => void) {
  return subscribeToCollection<Restroom>(COLLECTION_NAME, callback, initialRestrooms);
}

/**
 * Fetch restrooms snapshot from Firestore.
 */
export async function getRestrooms(): Promise<Restroom[]> {
  return fetchCollection<Restroom>(COLLECTION_NAME, initialRestrooms);
}

/**
 * Update restroom document in Firestore.
 */
export async function updateRestroom(
  id: string,
  updates: Partial<Restroom>
): Promise<void> {
  return updateDocumentFields<Restroom>(COLLECTION_NAME, id, updates, initialRestrooms);
}

/**
 * Save restroom document in Firestore.
 */
export async function saveRestroom(restroom: Restroom): Promise<void> {
  return saveDocument<Restroom>(COLLECTION_NAME, restroom, initialRestrooms);
}

/**
 * Adjust occupancy percentage for a restroom document.
 */
export async function adjustRestroomOccupancy(
  id: string,
  deltaOccupancy: number
): Promise<void> {
  const restrooms = await getRestrooms();
  const target = restrooms.find((r) => r.id === id);
  if (!target) return;

  const newOccupancy = Math.max(0, Math.min(100, target.occupancy + deltaOccupancy));
  const newStatus: Restroom['status'] =
    newOccupancy > 85
      ? 'Occupied'
      : target.status === 'Cleaning'
      ? 'Cleaning'
      : 'Available';

  await updateRestroom(id, {
    occupancy: newOccupancy,
    status: newStatus,
  });
}
