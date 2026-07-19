import { describe, it, expect } from 'vitest';
import { generateCopilotRecommendation } from './geminiService';
import { CopilotRequest, StadiumLiveData } from '../models/copilotTypes';

describe('geminiService', () => {
  it('should analyze live Firestore telemetry and return a structured recommendation with observability metrics', async () => {
    const mockRequest: CopilotRequest = {
      fanLanguage: 'Spanish',
      fanType: 'Wheelchair User',
      destination: 'Gate',
      currentGate: 'Gate A',
      notes: 'Requires accessible ramp access.',
    };

    const mockLiveData: StadiumLiveData = {
      gates: [
        {
          id: 'A',
          name: 'Gate A',
          status: 'CONGESTED',
          waitTime: 22,
          crowdLevel: 'HIGH',
          queueLength: 320,
          capacity: 1200,
          currentOccupancy: 1100,
          languages: ['English'],
        },
        {
          id: 'B',
          name: 'Gate B',
          status: 'OPEN',
          waitTime: 5,
          crowdLevel: 'LOW',
          queueLength: 40,
          capacity: 1200,
          currentOccupancy: 400,
          languages: ['English', 'Spanish'],
        },
      ],
      parking: [],
      volunteers: [],
      incidents: [],
      restrooms: [],
    };

    const result = await generateCopilotRecommendation(mockRequest, mockLiveData);

    expect(result.recommendation).toBeDefined();
    expect(result.recommendation.recommendedGate).toBe('Gate B');
    expect(result.recommendation.waitTimeSaved).toContain('minutes');
    expect(result.recommendation.translatedMessage).toContain('Gate B');
    expect(result.observability).toBeDefined();
    expect(result.observability.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.observability.estimatedTokens).toBeGreaterThan(0);
  });
});
