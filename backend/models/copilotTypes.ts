import { z } from 'zod';
import { Gate, Parking, Volunteer, Incident, Restroom } from '../../src/types';

export type FanLanguage = 'English' | 'Spanish' | 'French' | 'German' | 'Japanese' | 'Portuguese';
export type FanType = 'Individual' | 'Family' | 'Senior Citizen' | 'Wheelchair User' | 'VIP';
export type DestinationType = 'Gate' | 'Section' | 'Restroom' | 'Parking';
export type RecommendationEngine = 'Gemini' | 'Fallback';

/**
 * Situation input request payload from frontend copilot UI.
 */
export interface CopilotRequest {
  fanLanguage: FanLanguage;
  fanType: FanType;
  destination: DestinationType;
  currentGate: string;
  notes?: string;
}

/**
 * Live Firestore stadium state data bundle provided to Gemini.
 */
export interface StadiumLiveData {
  gates: Gate[];
  parking: Parking[];
  volunteers: Volunteer[];
  incidents: Incident[];
  restrooms: Restroom[];
}

/**
 * Zod schema for strict validation of Gemini JSON response.
 */
export const CopilotRecommendationSchema = z.object({
  recommendedGate: z.string(),
  reasoning: z.array(z.string()).min(1),
  walkingDifference: z.string(),
  waitTimeSaved: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  confidence: z.number().min(0).max(1),
  translatedMessage: z.string(),
});

export type CopilotRecommendation = z.infer<typeof CopilotRecommendationSchema>;

/**
 * Observability telemetry metrics.
 */
export interface ObservabilityMetrics {
  latencyMs: number;
  promptSizeBytes: number;
  completionSizeBytes: number;
  estimatedTokens: number;
  model: string;
  engine: RecommendationEngine;
  errorDetails?: string;
}

/**
 * Complete Copilot API response structure.
 */
export interface CopilotResponsePayload {
  success: boolean;
  data?: CopilotRecommendation;
  observability?: ObservabilityMetrics;
  error?: string;
  recommendationId?: string;
  engine?: RecommendationEngine;
}

/**
 * Backend Health Endpoint response structure.
 */
export interface CopilotHealthResponse {
  geminiConfigured: boolean;
  firestoreConnected: boolean;
  model: string;
  uptime: number;
}
