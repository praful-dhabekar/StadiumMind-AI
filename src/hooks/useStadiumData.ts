import { useQuery } from '@tanstack/react-query';
import { getGates } from '../services/gateService';
import { getIncidents } from '../services/incidentService';
import { getVolunteers } from '../services/volunteerService';
import { Gate, Incident, Volunteer } from '../types';

/**
 * Fetch gates data feed from Firestore using TanStack React Query.
 */
export function useGates() {
  return useQuery<Gate[], Error>({
    queryKey: ['gates'],
    queryFn: async () => {
      return getGates();
    },
  });
}

/**
 * Fetch stadium incidents feed from Firestore.
 */
export function useIncidents() {
  return useQuery<Incident[], Error>({
    queryKey: ['incidents'],
    queryFn: async () => {
      return getIncidents();
    },
  });
}

/**
 * Fetch volunteer roster feed from Firestore.
 */
export function useVolunteers() {
  return useQuery<Volunteer[], Error>({
    queryKey: ['volunteers'],
    queryFn: async () => {
      return getVolunteers();
    },
  });
}
