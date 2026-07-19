import { StadiumLiveData, CopilotRequest, CopilotRecommendation, ObservabilityMetrics } from '../models/copilotTypes';
import { getGates } from '../../src/services/gateService';
import { getParking } from '../../src/services/parkingService';
import { getVolunteers } from '../../src/services/volunteerService';
import { getIncidents } from '../../src/services/incidentService';
import { getRestrooms } from '../../src/services/restroomService';
import { addDocument } from '../../src/services/firestoreBase';

/**
 * Fetches current live stadium data snapshot across all Firestore collections.
 */
export async function getLiveStadiumData(): Promise<StadiumLiveData> {
  const [gates, parking, volunteers, incidents, restrooms] = await Promise.all([
    getGates(),
    getParking(),
    getVolunteers(),
    getIncidents(),
    getRestrooms(),
  ]);

  return {
    gates,
    parking,
    volunteers,
    incidents,
    restrooms,
  };
}

/**
 * Saves generated AI Copilot recommendation log entry into Firestore 'recommendations' collection.
 *
 * @param request Situation input request
 * @param recommendation Validated Gemini response
 * @param observability Performance & token metrics
 * @returns Document ID of saved recommendation log
 */
export async function saveRecommendationLog(
  request: CopilotRequest,
  recommendation: CopilotRecommendation,
  observability: ObservabilityMetrics
): Promise<string> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    request,
    response: recommendation,
    confidence: recommendation.confidence,
    reasoning: recommendation.reasoning,
    responseSource: observability.engine || 'Fallback',
    engine: observability.engine || 'Fallback',
    duration: observability.latencyMs,
    model: observability.model,
    observability,
  };

  try {
    const id = await addDocument('recommendations', logEntry);
    return id;
  } catch (error) {
    const msg = (error as Error).message || 'Unknown error';
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Firestore] Failed to persist recommendation log: ${msg}`);
    }
    return `local_${Date.now()}`;
  }
}
