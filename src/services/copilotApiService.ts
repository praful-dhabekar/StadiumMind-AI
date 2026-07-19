import {
  CopilotRequest,
  CopilotResponsePayload,
} from '../../backend/models/copilotTypes';
import { getLiveStadiumData } from '../../backend/services/firestoreBackendService';
import { generateCopilotRecommendation } from '../../backend/services/geminiService';
import { saveRecommendationLog } from '../../backend/services/firestoreBackendService';

/**
 * Frontend client service for requesting AI Copilot recommendations from Express backend server.
 * Includes client-side fallback if backend port is not currently connected.
 */
export async function requestCopilotRecommendation(
  requestPayload: CopilotRequest
): Promise<CopilotResponsePayload> {
  try {
    const response = await fetch('/api/copilot/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (response.ok) {
      const result: CopilotResponsePayload = await response.json();
      return result;
    }
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || `Server responded with status ${response.status}`);
  } catch (clientErr) {
    console.warn('Backend Express proxy unreachable. Executing client-side fallback reasoning engine:', clientErr);
    // Direct fallback execution
    const liveData = await getLiveStadiumData();
    const { recommendation, observability } = await generateCopilotRecommendation(requestPayload, liveData);
    const recommendationId = await saveRecommendationLog(requestPayload, recommendation, observability);

    return {
      success: true,
      data: recommendation,
      observability,
      recommendationId,
    };
  }
}

/**
 * Fetch recent recommendation audit logs from Firestore.
 */
export async function fetchRecommendationLogs(): Promise<any[]> {
  try {
    const response = await fetch('/api/copilot/history');
    if (response.ok) {
      const data = await response.json();
      return data.logs || [];
    }
  } catch (_e) {
    //
  }
  return [];
}
