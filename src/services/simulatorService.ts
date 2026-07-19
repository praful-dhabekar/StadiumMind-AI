import { adjustGateCrowd, getGates } from './gateService';
import { adjustParkingUsage, getParking } from './parkingService';
import { addIncident, resolveLatestIncident } from './incidentService';
import { adjustRestroomOccupancy, getRestrooms } from './restroomService';
import { IncidentType, IncidentSeverity } from '../types';

/**
 * Increase crowd at Gate A in Firestore.
 */
export async function simulateIncreaseGateCrowd(): Promise<void> {
  const gates = await getGates();
  const gateA = gates.find((g) => g.id === 'A') || gates[0];
  if (gateA) {
    await adjustGateCrowd(gateA.id, +150);
  }
}

/**
 * Decrease crowd at Gate A in Firestore.
 */
export async function simulateDecreaseGateCrowd(): Promise<void> {
  const gates = await getGates();
  const gateA = gates.find((g) => g.id === 'A') || gates[0];
  if (gateA) {
    await adjustGateCrowd(gateA.id, -120);
  }
}

/**
 * Create a new random incident in Firestore.
 */
export async function simulateCreateIncident(): Promise<string> {
  const types: IncidentType[] = ['Medical', 'Crowd', 'Security', 'Technical'];
  const severities: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
  const locations = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Lot-A', 'North Wing'];

  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomSev = severities[Math.floor(Math.random() * severities.length)];
  const randomLoc = locations[Math.floor(Math.random() * locations.length)];

  return addIncident({
    type: randomType,
    severity: randomSev,
    location: randomLoc,
    status: 'Open',
  });
}

/**
 * Resolve latest active incident in Firestore.
 */
export async function simulateResolveIncident(): Promise<void> {
  await resolveLatestIncident();
}

/**
 * Increase parking lot usage (decrease available spaces) in Firestore.
 */
export async function simulateIncreaseParkingUsage(): Promise<void> {
  const parkingLots = await getParking();
  const lotA = parkingLots.find((p) => p.id === 'Lot-A') || parkingLots[0];
  if (lotA) {
    await adjustParkingUsage(lotA.id, -30); // 30 spaces filled
  }
}

/**
 * Decrease parking lot usage (increase available spaces) in Firestore.
 */
export async function simulateDecreaseParkingUsage(): Promise<void> {
  const parkingLots = await getParking();
  const lotA = parkingLots.find((p) => p.id === 'Lot-A') || parkingLots[0];
  if (lotA) {
    await adjustParkingUsage(lotA.id, +35); // 35 spaces freed
  }
}

/**
 * Increase restroom occupancy percentage in Firestore.
 */
export async function simulateIncreaseRestroomOccupancy(): Promise<void> {
  const restrooms = await getRestrooms();
  const restroomA = restrooms.find((r) => r.id === 'R-A1') || restrooms[0];
  if (restroomA) {
    await adjustRestroomOccupancy(restroomA.id, +20);
  }
}

/**
 * Randomize all stadium collections state in Firestore.
 */
export async function simulateRandomizeStadiumState(): Promise<void> {
  const gates = await getGates();
  for (const gate of gates) {
    const randomDelta = Math.floor(Math.random() * 300) - 150;
    await adjustGateCrowd(gate.id, randomDelta);
  }

  const parkingLots = await getParking();
  for (const lot of parkingLots) {
    const randomDelta = Math.floor(Math.random() * 40) - 20;
    await adjustParkingUsage(lot.id, randomDelta);
  }

  const restrooms = await getRestrooms();
  for (const restroom of restrooms) {
    const randomDelta = Math.floor(Math.random() * 30) - 15;
    await adjustRestroomOccupancy(restroom.id, randomDelta);
  }
}
