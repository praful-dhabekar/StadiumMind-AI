import { Volunteer } from '../types';
import { initialVolunteers } from './seedService';
import {
  subscribeToCollection,
  fetchCollection,
  updateDocumentFields,
  saveDocument,
} from './firestoreBase';

const COLLECTION_NAME = 'volunteers';

/**
 * Subscribe to realtime updates for volunteers collection in Firestore.
 */
export function subscribeToVolunteers(callback: (volunteers: Volunteer[]) => void) {
  return subscribeToCollection<Volunteer>(COLLECTION_NAME, callback, initialVolunteers);
}

/**
 * Fetch volunteers snapshot from Firestore.
 */
export async function getVolunteers(): Promise<Volunteer[]> {
  return fetchCollection<Volunteer>(COLLECTION_NAME, initialVolunteers);
}

/**
 * Update volunteer document in Firestore.
 */
export async function updateVolunteer(
  id: string,
  updates: Partial<Volunteer>
): Promise<void> {
  return updateDocumentFields<Volunteer>(COLLECTION_NAME, id, updates, initialVolunteers);
}

/**
 * Save volunteer document in Firestore.
 */
export async function saveVolunteer(volunteer: Volunteer): Promise<void> {
  return saveDocument<Volunteer>(COLLECTION_NAME, volunteer, initialVolunteers);
}

/**
 * Toggle volunteer availability status in Firestore.
 */
export async function toggleVolunteerAvailability(id: string): Promise<void> {
  const volunteers = await getVolunteers();
  const target = volunteers.find((v) => v.id === id);
  if (target) {
    await updateVolunteer(id, { available: !target.available });
  }
}
