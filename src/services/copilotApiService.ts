import {
  CopilotRequest,
  CopilotResponsePayload,
  RecommendationLog,
} from '../../backend/models/copilotTypes';

/**
 * Frontend client service for requesting AI Copilot recommendations from the Express backend.
 * ALL AI reasoning and Gemini calls happen on the backend — this file never imports
 * backend services directly, preventing accidental key/logic exposure in the browser bundle.
 */
export async function requestCopilotRecommendation(
  requestPayload: CopilotRequest
): Promise<CopilotResponsePayload> {
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

  // Surface structured backend error to the caller
  const errorJson = await response.json().catch(() => ({}));
  throw new Error(
    errorJson.error || `Copilot API responded with status ${response.status}`
  );
}

/**
 * Fetch recent recommendation audit logs from the Express backend.
 */
export async function fetchRecommendationLogs(): Promise<RecommendationLog[]> {
  try {
    const response = await fetch('/api/copilot/history');
    if (response.ok) {
      const data = await response.json();
      return data.logs || [];
    }
  } catch (_e) {
    // History fetch is non-critical — silently return empty on failure
  }
  return [];
}
