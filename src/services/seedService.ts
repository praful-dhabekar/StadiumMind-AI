import { Gate, Parking, Volunteer, Incident, Restroom } from '../types';

export const initialGates: Gate[] = [
  {
    id: 'A',
    name: 'Gate A',
    status: 'OPEN',
    waitTime: 18,
    crowdLevel: 'MEDIUM',
    queueLength: 240,
    capacity: 1200,
    currentOccupancy: 780,
    languages: ['English', 'Spanish'],
  },
  {
    id: 'B',
    name: 'Gate B',
    status: 'OPEN',
    waitTime: 5,
    crowdLevel: 'LOW',
    queueLength: 45,
    capacity: 800,
    currentOccupancy: 280,
    languages: ['English', 'French'],
  },
  {
    id: 'C',
    name: 'Gate C',
    status: 'CONGESTED',
    waitTime: 35,
    crowdLevel: 'HIGH',
    queueLength: 520,
    capacity: 1500,
    currentOccupancy: 1420,
    languages: ['English', 'Spanish', 'Portuguese'],
  },
  {
    id: 'D',
    name: 'Gate D',
    status: 'OPEN',
    waitTime: 12,
    crowdLevel: 'LOW',
    queueLength: 110,
    capacity: 1000,
    currentOccupancy: 450,
    languages: ['English', 'German'],
  },
];

export const initialParking: Parking[] = [
  {
    id: 'Lot-A',
    available: 160,
    total: 300,
    status: 'AVAILABLE',
  },
  {
    id: 'Lot-B',
    available: 15,
    total: 250,
    status: 'LIMITED',
  },
];

export const initialVolunteers: Volunteer[] = [
  {
    id: 'VOL-001',
    name: 'Volunteer 1',
    zone: 'Gate A',
    available: true,
    languages: ['English', 'French'],
  },
  {
    id: 'VOL-002',
    name: 'Volunteer 2',
    zone: 'Gate C',
    available: true,
    languages: ['English', 'Spanish'],
  },
  {
    id: 'VOL-003',
    name: 'Volunteer 3',
    zone: 'Gate B',
    available: false,
    languages: ['English', 'German'],
  },
  {
    id: 'VOL-004',
    name: 'Volunteer 4',
    zone: 'Gate D',
    available: true,
    languages: ['English', 'Portuguese'],
  },
];

export const initialIncidents: Incident[] = [
  {
    id: 'INC-100',
    type: 'Medical',
    severity: 'Medium',
    location: 'Gate B',
    status: 'Open',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'INC-101',
    type: 'Technical',
    severity: 'High',
    location: 'Gate C',
    status: 'In Progress',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export const initialRestrooms: Restroom[] = [
  {
    id: 'R-A1',
    location: 'North Wing',
    occupancy: 65,
    status: 'Available',
  },
  {
    id: 'R-B1',
    location: 'East Wing',
    occupancy: 92,
    status: 'Occupied',
  },
  {
    id: 'R-C1',
    location: 'South Wing',
    occupancy: 30,
    status: 'Available',
  },
];
