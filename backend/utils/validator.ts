import { CopilotRecommendationSchema, CopilotRecommendation } from '../models/copilotTypes';

/**
 * Validates raw JSON string or object against the CopilotRecommendation Zod schema.
 * Rejects malformed responses cleanly.
 *
 * @param rawResponse String or parsed object from Gemini
 * @returns Validated CopilotRecommendation object
 */
export function validateCopilotResponse(rawResponse: unknown): CopilotRecommendation {
  let objectToValidate = rawResponse;

  if (typeof rawResponse === 'string') {
    // Clean up code block markdown fences if present
    const cleaned = rawResponse
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      objectToValidate = JSON.parse(cleaned);
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini output as JSON: ${(parseError as Error).message}`);
    }
  }

  const result = CopilotRecommendationSchema.safeParse(objectToValidate);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('; ');
    throw new Error(`Gemini response failed schema validation: ${errorDetails}`);
  }

  return result.data;
}
