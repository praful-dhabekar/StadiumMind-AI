import { CopilotRequest, StadiumLiveData } from '../models/copilotTypes';

/**
 * Builds a structured, prompt-engineered text payload for Gemini 2.5 Flash.
 * Clearly separates SYSTEM, CONTEXT, LIVE DATA, and USER REQUEST sections.
 *
 * @param request Volunteer situation request
 * @param liveData Realtime Firestore stadium data snapshot
 * @returns Formatted prompt string
 */
export function buildCopilotPrompt(
  request: CopilotRequest,
  liveData: StadiumLiveData
): string {
  const systemInstruction = `
=== SYSTEM INSTRUCTION ===
You are an AI volunteer copilot assisting volunteers during FIFA World Cup 2026 stadium operations.
Your Primary Objectives:
1. Minimize waiting time for fans.
2. Avoid bottleneck congestion at gates and entryways.
3. Prioritize accessibility for families, senior citizens, and wheelchair users.
4. Provide clear, logical explanations rooted strictly in real-time data.
5. Translate your friendly recommendation message into the fan's spoken language.

CRITICAL RULES:
- Never invent or fabricate data.
- Only reason from the provided live stadium telemetry JSON data.
- Output MUST be strict valid JSON with no markdown extra text except standard JSON structure.
  Required Keys:
  - "recommendedGate": string (Name of recommended gate or entry point, e.g. "Gate B")
  - "reasoning": array of strings (At least 2-4 concise bullet points explaining WHY this recommendation was made using exact data metrics)
  - "walkingDifference": string (e.g. "3 minutes longer walk", "Direct entry")
  - "waitTimeSaved": string (e.g. "13 minutes saved", "Immediate entry")
  - "priority": string ('HIGH' | 'MEDIUM' | 'LOW')
  - "confidence": number (between 0.0 and 1.0)
  - "translatedMessage": string (Warm, helpful direct message to the fan written in their selected language: ${request.fanLanguage})
`;

  const contextInstruction = `
=== CONTEXT ===
Match Event: FIFA World Cup 2026 - Group Stage Match 14
Venue: MetLife Stadium, East Rutherford, NJ
Total Attendance Capacity: 82,500 fans
Goal: Guide fans seamlessly to optimal entry gates, restrooms, and parking lots based on live crowd flow telemetry.
`;

  const liveDataJson = JSON.stringify(liveData, null, 2);

  const userRequestSection = `
=== USER REQUEST & FAN SITUATION ===
Fan Language: ${request.fanLanguage}
Fan Type / Demographic: ${request.fanType}
Destination Requested: ${request.destination}
Current Location / Gate: ${request.currentGate}
Additional Volunteer Notes: ${request.notes || 'None provided.'}
`;

  return `${systemInstruction}\n${contextInstruction}\n=== LIVE STADIUM FIRESTORE TELEMETRY DATA ===\n${liveDataJson}\n${userRequestSection}\n=== REQUIRED RESPONSE FORMAT ===\nProvide only the JSON response.`;
}
