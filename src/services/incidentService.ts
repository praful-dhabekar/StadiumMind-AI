import { Incident } from '../types';
import { initialIncidents } from './seedService';
import {
  subscribeToCollection,
  fetchCollection,
  addDocument,
  updateDocumentFields,
} from './firestoreBase';

const COLLECTION_NAME = 'incidents';

/**
 * Subscribe to realtime updates for incidents collection in Firestore.
 */
export function subscribeToIncidents(callback: (incidents: Incident[]) => void) {
  return subscribeToCollection<Incident>(COLLECTION_NAME, callback, initialIncidents);
}

/**
 * Fetch incidents snapshot from Firestore.
 */
export async function getIncidents(): Promise<Incident[]> {
  return fetchCollection<Incident>(COLLECTION_NAME, initialIncidents);
}

/**
 * Create a new incident in Firestore.
 */
export async function addIncident(
  incidentData: Omit<Incident, 'id' | 'timestamp'> & { id?: string }
): Promise<string> {
  const newDoc = {
    ...incidentData,
    timestamp: new Date().toISOString(),
  };
  return addDocument<Incident>(COLLECTION_NAME, newDoc, initialIncidents);
}

/**
 * Update incident status in Firestore.
 */
export async function updateIncidentStatus(
  id: string,
  status: Incident['status']
): Promise<void> {
  return updateDocumentFields<Incident>(COLLECTION_NAME, id, { status }, initialIncidents);
}

/**
 * Mark the latest active incident as resolved in Firestore.
 */
export async function resolveLatestIncident(): Promise<void> {
  const incidents = await getIncidents();
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  if (activeIncidents.length > 0) {
    const latest = [...activeIncidents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    await updateIncidentStatus(latest.id, 'Resolved');
  }
}
