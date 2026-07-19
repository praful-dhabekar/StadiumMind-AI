import { Gate, Incident, Volunteer } from '../types';

export const mockGates: Gate[] = [
  {
    id: 'A',
    name: 'Gate A',
    status: 'CONGESTED',
    waitTime: 18,
    crowdLevel: 'HIGH',
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

export const mockIncidents: Incident[] = [
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
    timestamp: new Date().toISOString(),
  },
];

export const mockVolunteers: Volunteer[] = [
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
];
