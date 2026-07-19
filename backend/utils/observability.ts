import { ObservabilityMetrics, RecommendationEngine } from '../models/copilotTypes';

/**
 * Calculates telemetry observability metrics for a Gemini API or Fallback invocation.
 * Works seamlessly in both Node.js server and Browser client environments using TextEncoder.
 *
 * @param promptText Full prompt string sent to Gemini
 * @param completionText Raw output text returned by Gemini
 * @param startTimeMs Performance timestamp before API call
 * @param model Model identifier used
 * @param engine Active recommendation engine ('Gemini' | 'Fallback')
 * @param errorDetails Optional error string if fallback was triggered
 * @returns ObservabilityMetrics object
 */
export function calculateObservability(
  promptText: string,
  completionText: string,
  startTimeMs: number,
  model = 'gemini-2.5-flash',
  engine: RecommendationEngine = 'Gemini',
  errorDetails?: string
): ObservabilityMetrics {
  const endTimeMs = Date.now();
  const latencyMs = endTimeMs - startTimeMs;

  const encoder = new TextEncoder();
  const promptSizeBytes = encoder.encode(promptText).length;
  const completionSizeBytes = encoder.encode(completionText).length;

  // Approximation: ~4 characters per token
  const totalChars = promptText.length + completionText.length;
  const estimatedTokens = Math.ceil(totalChars / 4);

  return {
    latencyMs,
    promptSizeBytes,
    completionSizeBytes,
    estimatedTokens,
    model,
    engine,
    errorDetails,
  };
}
