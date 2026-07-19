import { useEffect, useState } from 'react';
import { Gate, Parking, Volunteer, Incident, Restroom } from '../types';
import { subscribeToGates } from '../services/gateService';
import { subscribeToParking } from '../services/parkingService';
import { subscribeToVolunteers } from '../services/volunteerService';
import { subscribeToIncidents } from '../services/incidentService';
import { subscribeToRestrooms } from '../services/restroomService';

export interface StadiumRealtimeData {
  gates: Gate[];
  parking: Parking[];
  volunteers: Volunteer[];
  incidents: Incident[];
  restrooms: Restroom[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Custom React hook subscribing to realtime Firestore updates across all stadium collections.
 *
 * @returns Realtime stadium state
 */
export function useStadiumRealtimeData(): StadiumRealtimeData {
  const [gates, setGates] = useState<Gate[]>([]);
  const [parking, setParking] = useState<Parking[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    try {
      const unsubGates = subscribeToGates((data) => {
        if (isMounted) setGates(data);
      });

      const unsubParking = subscribeToParking((data) => {
        if (isMounted) setParking(data);
      });

      const unsubVolunteers = subscribeToVolunteers((data) => {
        if (isMounted) setVolunteers(data);
      });

      const unsubIncidents = subscribeToIncidents((data) => {
        if (isMounted) setIncidents(data);
      });

      const unsubRestrooms = subscribeToRestrooms((data) => {
        if (isMounted) setRestrooms(data);
        if (isMounted) setIsLoading(false);
      });

      return () => {
        isMounted = false;
        unsubGates();
        unsubParking();
        unsubVolunteers();
        unsubIncidents();
        unsubRestrooms();
      };
    } catch (err) {
      if (isMounted) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('Firestore Subscription Error'));
        setIsLoading(false);
      }
      return () => {
        isMounted = false;
      };
    }
  }, []);

  return {
    gates,
    parking,
    volunteers,
    incidents,
    restrooms,
    isLoading,
    isError,
    error,
  };
}
