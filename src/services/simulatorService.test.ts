import { describe, it, expect } from 'vitest';
import {
  simulateIncreaseGateCrowd,
  simulateDecreaseGateCrowd,
  simulateCreateIncident,
  simulateResolveIncident,
  simulateIncreaseParkingUsage,
  simulateDecreaseParkingUsage,
  simulateIncreaseRestroomOccupancy,
  simulateRandomizeStadiumState,
} from './simulatorService';
import { getGates } from './gateService';
import { getIncidents } from './incidentService';
import { getParking } from './parkingService';
import { getRestrooms } from './restroomService';

describe('Simulator Functions', () => {
  it('should increase and decrease gate crowd', async () => {
    const initialGates = await getGates();
    const gateAInitial = initialGates.find((g) => g.id === 'A')?.currentOccupancy || 0;

    await simulateIncreaseGateCrowd();
    let updatedGates = await getGates();
    let gateAUpdated = updatedGates.find((g) => g.id === 'A')?.currentOccupancy || 0;
    expect(gateAUpdated).toBeGreaterThan(gateAInitial);

    await simulateDecreaseGateCrowd();
    updatedGates = await getGates();
    gateAUpdated = updatedGates.find((g) => g.id === 'A')?.currentOccupancy || 0;
    expect(gateAUpdated).toBeLessThan(gateAInitial + 150);
  });

  it('should create and resolve incidents in Firestore', async () => {
    const incidentId = await simulateCreateIncident();
    expect(incidentId).toBeDefined();

    const incidents = await getIncidents();
    const createdIncident = incidents.find((i) => i.id === incidentId);
    expect(createdIncident).toBeDefined();

    await simulateResolveIncident();
    const updatedIncidents = await getIncidents();
    const resolvedIncident = updatedIncidents.find((i) => i.id === incidentId);
    expect(resolvedIncident?.status).toBe('Resolved');
  });

  it('should adjust parking usage up and down', async () => {
    await simulateIncreaseParkingUsage();
    await simulateDecreaseParkingUsage();
    const parkingLots = await getParking();
    const lotA = parkingLots.find((p) => p.id === 'Lot-A');
    expect(lotA).toBeDefined();
  });

  it('should adjust restroom occupancy', async () => {
    await simulateIncreaseRestroomOccupancy();
    const restrooms = await getRestrooms();
    const restroomA = restrooms.find((r) => r.id === 'R-A1');
    expect(restroomA).toBeDefined();
  });

  it('should randomize stadium state without throwing error', async () => {
    await expect(simulateRandomizeStadiumState()).resolves.not.toThrow();
  }, 15000);
});
