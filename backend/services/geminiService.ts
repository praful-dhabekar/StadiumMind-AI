import { GoogleGenAI } from '@google/genai';
import { CopilotRequest, CopilotRecommendation, StadiumLiveData, ObservabilityMetrics } from '../models/copilotTypes';
import { buildCopilotPrompt } from './promptBuilder';
import { validateCopilotResponse } from '../utils/validator';
import { calculateObservability } from '../utils/observability';

/**
 * Service handling Gemini API calls, prompt construction, strict Zod validation,
 * engine logging (Gemini vs. Fallback), and observability telemetry.
 */
export async function generateCopilotRecommendation(
  request: CopilotRequest,
  liveData: StadiumLiveData
): Promise<{ recommendation: CopilotRecommendation; observability: ObservabilityMetrics }> {
  const rawKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined;
  const apiKey = rawKey ? rawKey.trim().replace(/^["']|["']$/g, '') : undefined;
  const startTime = Date.now();
  const prompt = buildCopilotPrompt(request, liveData);

  if (apiKey && apiKey.length > 5) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Support gemini-2.5-flash primarily, falling back to gemini-2.0-flash / gemini-1.5-flash if 404 NOT_FOUND
      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let response: { text?: string } | null = null;
      let lastError: Error | null = null;
      let usedModel = 'gemini-2.5-flash';

      for (const modelName of modelsToTry) {
        try {
          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API call timed out after 10,000ms')), 10000)
          );

          response = await Promise.race([generatePromise, timeoutPromise]);
          usedModel = modelName;
          lastError = null;
          break;
        } catch (modelErr: unknown) {
          const err = modelErr as Error;
          lastError = err;
          const msg = err.message || String(err);
          if (msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('not available')) {
            console.warn(`[AI MODEL INFO] Model ${modelName} returned NOT_FOUND. Trying next available Gemini Flash variant...`);
            continue;
          }
          throw modelErr;
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      const rawText = response ? response.text || '' : '';
      const validatedRecommendation = validateCopilotResponse(rawText);
      const observability = calculateObservability(
        prompt,
        rawText,
        startTime,
        usedModel,
        'Gemini'
      );

      console.log(`[AI ENGINE: Gemini] Recommendation successfully generated using Gemini API (${usedModel})`);

      return {
        recommendation: validatedRecommendation,
        observability,
      };
    } catch (apiError: unknown) {
      const err = apiError as Error;
      let errorCategory = 'Gemini API Error';
      const msg = err.message || String(err);

      if (msg.includes('API key') || msg.includes('400') || msg.includes('403') || msg.includes('API_KEY_INVALID')) {
        errorCategory = 'Invalid API Key';
      } else if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        errorCategory = 'Quota Exceeded (429)';
      } else if (msg.includes('timed out')) {
        errorCategory = 'Timeout (10s)';
      } else if (msg.includes('ZodValidation') || msg.includes('JSON')) {
        errorCategory = 'Invalid JSON Schema Response';
      }

      console.warn(`[AI ENGINE: Fallback] Gemini API call failed (${errorCategory}). Cause: ${msg}. Switching to Local Fallback Engine.`);

      const reasoningResult = generateDataDrivenRecommendation(request, liveData);
      const rawFallbackJson = JSON.stringify(reasoningResult, null, 2);
      const validatedRecommendation = validateCopilotResponse(rawFallbackJson);
      const observability = calculateObservability(
        prompt,
        rawFallbackJson,
        startTime,
        'gemini-2.5-flash-local',
        'Fallback',
        `${errorCategory}: ${msg}`
      );

      return {
        recommendation: validatedRecommendation,
        observability,
      };
    }
  } else {
    console.warn('[AI ENGINE: Fallback] GEMINI_API_KEY is not configured or invalid in backend environment. Utilizing Local Fallback Engine.');
  }

  // Fallback reasoning engine analyzing live Firestore telemetry data directly
  const reasoningResult = generateDataDrivenRecommendation(request, liveData);
  const rawFallbackJson = JSON.stringify(reasoningResult, null, 2);
  const validatedRecommendation = validateCopilotResponse(rawFallbackJson);
  const observability = calculateObservability(
    prompt,
    rawFallbackJson,
    startTime,
    'gemini-2.5-flash-local',
    'Fallback',
    'GEMINI_API_KEY not configured in backend environment'
  );

  return {
    recommendation: validatedRecommendation,
    observability,
  };
}

/**
 * Fallback reasoning engine analyzing live Firestore stadium state metrics directly.
 */
function generateDataDrivenRecommendation(
  request: CopilotRequest,
  liveData: StadiumLiveData
): CopilotRecommendation {
  const currentGateObj =
    liveData.gates.find((g) => g.name === request.currentGate || g.id === request.currentGate) ||
    liveData.gates[0];

  // Find lowest wait time gate with matching language support if possible
  const openGates = liveData.gates.filter((g) => g.status !== 'CLOSED');
  const sortedGates = [...openGates].sort((a, b) => a.waitTime - b.waitTime);
  const bestGate = sortedGates[0] || currentGateObj;

  const waitSavedMinutes = Math.max(0, currentGateObj.waitTime - bestGate.waitTime);
  const isDiffGate = bestGate.id !== currentGateObj.id;

  const reasoning: string[] = [];
  if (isDiffGate) {
    reasoning.push(
      `${bestGate.name} currently has a wait time of only ${bestGate.waitTime} minutes compared to ${currentGateObj.waitTime} minutes at ${currentGateObj.name}.`
    );
    reasoning.push(
      `Queue length at ${bestGate.name} is ${bestGate.queueLength} people versus ${currentGateObj.queueLength} at ${currentGateObj.name}.`
    );
  } else {
    reasoning.push(
      `${currentGateObj.name} is currently the optimal entry point with a wait time of ${currentGateObj.waitTime} minutes.`
    );
  }

  if (request.fanType === 'Wheelchair User' || request.fanType === 'Senior Citizen') {
    reasoning.push(
      `Selected entry path provides step-free accessibility ramps and dedicated volunteer guide escort.`
    );
  } else if (request.fanType === 'Family') {
    reasoning.push(`Stroller-friendly dedicated lanes available to accommodate families with children.`);
  }

  if (bestGate.languages.includes(request.fanLanguage)) {
    reasoning.push(`On-duty volunteers at ${bestGate.name} speak fluent ${request.fanLanguage}.`);
  }

  const translations: Record<string, string> = {
    English: isDiffGate
      ? `Head to ${bestGate.name} for a faster entry. Save approximately ${waitSavedMinutes} minutes!`
      : `Proceed through ${bestGate.name}. Flow is optimal.`,
    Spanish: isDiffGate
      ? `Diríjase a la ${bestGate.name} para una entrada más rápida. ¡Ahorre aproximadamente ${waitSavedMinutes} minutos!`
      : `Proceda por la ${bestGate.name}. El flujo es óptimo.`,
    French: isDiffGate
      ? `Rendez-vous à la ${bestGate.name} pour une entrée plus rapide. Économisez environ ${waitSavedMinutes} minutes !`
      : `Procédez par la ${bestGate.name}. Le flux est optimal.`,
    German: isDiffGate
      ? `Gehen Sie zu ${bestGate.name} für einen schnelleren Einlass. Sparen Sie etwa ${waitSavedMinutes} Minuten!`
      : `Gehen Sie durch ${bestGate.name}. Der Fluss ist optimal.`,
    Japanese: isDiffGate
      ? `より迅速に入場するには${bestGate.name}へ向かってください。約${waitSavedMinutes}分節約できます！`
      : `${bestGate.name}からお進みください。スムーズに入場できます。`,
    Portuguese: isDiffGate
      ? `Dirija-se ao ${bestGate.name} para uma entrada mais rápida. Economize cerca de ${waitSavedMinutes} minutos!`
      : `Proceda pelo ${bestGate.name}. O fluxo está ótimo.`,
  };

  return {
    recommendedGate: bestGate.name,
    reasoning,
    walkingDifference: isDiffGate ? '3 minutes longer walk' : 'Direct entry',
    waitTimeSaved: waitSavedMinutes > 0 ? `${waitSavedMinutes} minutes saved` : 'Optimal route',
    priority: waitSavedMinutes > 10 || request.fanType === 'Wheelchair User' ? 'HIGH' : 'MEDIUM',
    confidence: 0.94,
    translatedMessage: translations[request.fanLanguage] || translations['English'],
  };
}
