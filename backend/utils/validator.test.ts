import { describe, it, expect } from 'vitest';
import { validateCopilotResponse } from './validator';

describe('validator', () => {
  it('should parse and validate a valid JSON response string', () => {
    const validJsonString = JSON.stringify({
      recommendedGate: 'Gate B',
      reasoning: [
        'Gate B wait time is 4 minutes vs 18 minutes at Gate A.',
        'On-duty volunteers at Gate B speak French.',
      ],
      walkingDifference: '3 minutes longer',
      waitTimeSaved: '14 minutes',
      priority: 'HIGH',
      confidence: 0.95,
      translatedMessage: 'Rendez-vous à la Porte B pour une entrée plus rapide.',
    });

    const result = validateCopilotResponse(validJsonString);

    expect(result.recommendedGate).toBe('Gate B');
    expect(result.priority).toBe('HIGH');
    expect(result.confidence).toBe(0.95);
    expect(result.reasoning).toHaveLength(2);
  });

  it('should strip markdown code block fences automatically', () => {
    const fencedJson = `\`\`\`json
{
  "recommendedGate": "Gate C",
  "reasoning": ["Direct lane access"],
  "walkingDifference": "Direct",
  "waitTimeSaved": "5 minutes",
  "priority": "LOW",
  "confidence": 0.90,
  "translatedMessage": "Head to Gate C."
}
\`\`\``;

    const result = validateCopilotResponse(fencedJson);
    expect(result.recommendedGate).toBe('Gate C');
    expect(result.priority).toBe('LOW');
  });

  it('should throw error when receiving malformed JSON or invalid schema properties', () => {
    const invalidJson = JSON.stringify({
      recommendedGate: 'Gate B',
      // missing reasoning array and invalid priority
      priority: 'URGENT_INVALID',
    });

    expect(() => validateCopilotResponse(invalidJson)).toThrow();
  });
});
