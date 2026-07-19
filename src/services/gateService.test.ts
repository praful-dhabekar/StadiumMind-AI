import { describe, it, expect, vi } from 'vitest';
import { getGates, updateGate, adjustGateCrowd, subscribeToGates } from './gateService';

describe('Gate Service', () => {
  it('should fetch initial gates collection dataset', async () => {
    const gates = await getGates();
    expect(gates).toBeDefined();
    expect(gates.length).toBeGreaterThan(0);
    expect(gates[0]).toHaveProperty('id');
    expect(gates[0]).toHaveProperty('status');
  });

  it('should update gate fields in Firestore store', async () => {
    await updateGate('A', { waitTime: 25 });
    const gates = await getGates();
    const gateA = gates.find((g) => g.id === 'A');
    expect(gateA?.waitTime).toBe(25);
  });

  it('should adjust gate crowd levels and recalculate wait time and status', async () => {
    await adjustGateCrowd('A', 300);
    const gates = await getGates();
    const gateA = gates.find((g) => g.id === 'A');
    expect(gateA?.currentOccupancy).toBeGreaterThan(700);
  });

  it('should subscribe to realtime gate updates', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToGates(callback);
    expect(callback).toHaveBeenCalled();
    unsubscribe();
  });
});
