import { Gate } from '../types';
import { initialGates } from './seedService';
import {
  subscribeToCollection,
  fetchCollection,
  updateDocumentFields,
  saveDocument,
} from './firestoreBase';

const COLLECTION_NAME = 'gates';

/**
 * Subscribe to realtime updates for gates collection in Firestore.
 *
 * @param callback Listener function receiving updated gates array
 * @returns Unsubscribe function
 */
export function subscribeToGates(callback: (gates: Gate[]) => void) {
  return subscribeToCollection<Gate>(COLLECTION_NAME, callback, initialGates);
}

/**
 * Fetch gates snapshot from Firestore.
 */
export async function getGates(): Promise<Gate[]> {
  return fetchCollection<Gate>(COLLECTION_NAME, initialGates);
}

/**
 * Update gate document in Firestore.
 */
export async function updateGate(id: string, updates: Partial<Gate>): Promise<void> {
  return updateDocumentFields<Gate>(COLLECTION_NAME, id, updates, initialGates);
}

/**
 * Save gate document in Firestore.
 */
export async function saveGate(gate: Gate): Promise<void> {
  return saveDocument<Gate>(COLLECTION_NAME, gate, initialGates);
}

/**
 * Adjust crowd occupancy and queue length for a gate.
 */
export async function adjustGateCrowd(id: string, deltaOccupancy: number): Promise<void> {
  const gates = await getGates();
  const target = gates.find((g) => g.id === id);
  if (!target) return;

  const newOccupancy = Math.max(0, Math.min(target.capacity, target.currentOccupancy + deltaOccupancy));
  const newQueue = Math.max(0, target.queueLength + Math.round(deltaOccupancy * 0.4));
  const occupancyPercentage = (newOccupancy / target.capacity) * 100;

  const newStatus: Gate['status'] =
    occupancyPercentage > 90 ? 'CONGESTED' : occupancyPercentage === 0 ? 'CLOSED' : 'OPEN';

  const newCrowdLevel: Gate['crowdLevel'] =
    occupancyPercentage > 80 ? 'HIGH' : occupancyPercentage > 45 ? 'MEDIUM' : 'LOW';

  const newWaitTime = Math.round(newQueue / 15); // ~15 people cleared per min

  await updateGate(id, {
    currentOccupancy: newOccupancy,
    queueLength: newQueue,
    status: newStatus,
    crowdLevel: newCrowdLevel,
    waitTime: newWaitTime,
  });
}
