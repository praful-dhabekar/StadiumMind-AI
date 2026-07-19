import { describe, it, expect } from 'vitest';
import { buildCopilotPrompt } from './promptBuilder';
import { CopilotRequest, StadiumLiveData } from '../models/copilotTypes';

describe('promptBuilder', () => {
  it('should format system instructions, live telemetry, and user request into a unified prompt string', () => {
    const mockRequest: CopilotRequest = {
      fanLanguage: 'French',
      fanType: 'Family',
      destination: 'Gate',
      currentGate: 'Gate A',
      notes: 'Family has two children and a stroller.',
    };

    const mockLiveData: StadiumLiveData = {
      gates: [
        {
          id: 'A',
          name: 'Gate A',
          status: 'CONGESTED',
          waitTime: 18,
          crowdLevel: 'HIGH',
          queueLength: 240,
          capacity: 1200,
          currentOccupancy: 950,
          languages: ['English', 'Spanish'],
        },
        {
          id: 'B',
          name: 'Gate B',
          status: 'OPEN',
          waitTime: 4,
          crowdLevel: 'LOW',
          queueLength: 35,
          capacity: 1200,
          currentOccupancy: 310,
          languages: ['English', 'French'],
        },
      ],
      parking: [],
      volunteers: [],
      incidents: [],
      restrooms: [],
    };

    const prompt = buildCopilotPrompt(mockRequest, mockLiveData);

    expect(prompt).toContain('=== SYSTEM INSTRUCTION ===');
    expect(prompt).toContain('FIFA World Cup 2026');
    expect(prompt).toContain('=== LIVE STADIUM FIRESTORE TELEMETRY DATA ===');
    expect(prompt).toContain('Gate A');
    expect(prompt).toContain('Gate B');
    expect(prompt).toContain('Fan Language: French');
    expect(prompt).toContain('Family has two children and a stroller.');
  });
});
