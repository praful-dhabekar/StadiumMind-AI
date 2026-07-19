import { Router, Request, Response } from 'express';
import { CopilotRequest } from '../models/copilotTypes';
import { getLiveStadiumData, saveRecommendationLog } from '../services/firestoreBackendService';
import { generateCopilotRecommendation } from '../services/geminiService';
import { getLocalStore } from '../../src/services/firestoreBase';

export const copilotRouter = Router();

/**
 * GET /api/copilot/health
 * Returns health status of Gemini API configuration & Firestore telemetry connections.
 */
copilotRouter.get('/health', async (_req: Request, res: Response) => {
  const rawKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined;
  const apiKey = rawKey ? rawKey.trim().replace(/^["']|["']$/g, '') : undefined;
  const geminiConfigured = Boolean(apiKey && apiKey.length > 5);

  let firestoreConnected = false;
  try {
    const liveData = await getLiveStadiumData();
    firestoreConnected = Array.isArray(liveData.gates) && liveData.gates.length > 0;
  } catch (_e) {
    firestoreConnected = false;
  }

  return res.json({
    geminiConfigured,
    firestoreConnected,
    model: 'gemini-2.5-flash',
    uptime: Math.round(process.uptime()),
  });
});

/**
 * POST /api/copilot/recommend
 * Generates an AI recommendation by reasoning over live Firestore stadium telemetry using Gemini 2.5 Flash.
 */
copilotRouter.post('/recommend', async (req: Request, res: Response) => {
  try {
    const { fanLanguage, fanType, destination, currentGate, notes } = req.body as CopilotRequest;

    if (!fanLanguage || !fanType || !destination || !currentGate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required situation fields: fanLanguage, fanType, destination, and currentGate are required.',
      });
    }

    const copilotReq: CopilotRequest = {
      fanLanguage,
      fanType,
      destination,
      currentGate,
      notes,
    };

    // Fetch live Firestore stadium state
    const liveData = await getLiveStadiumData();

    if (!liveData.gates || liveData.gates.length === 0) {
      return res.status(503).json({
        success: false,
        error: 'No active Firestore stadium telemetry data available.',
      });
    }

    // Reason using Gemini 2.5 Flash
    const { recommendation, observability } = await generateCopilotRecommendation(copilotReq, liveData);

    // Save audit log to Firestore 'recommendations' collection
    const recommendationId = await saveRecommendationLog(copilotReq, recommendation, observability);

    return res.json({
      success: true,
      data: recommendation,
      observability,
      recommendationId,
      engine: observability.engine,
    });
  } catch (error) {
    const msg = (error as Error).message || 'An error occurred while generating the AI copilot recommendation.';
    // Structured error log — captured by Cloud Logging in production
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify({ severity: 'ERROR', route: 'POST /recommend', error: msg }));
    } else if (process.env.NODE_ENV !== 'test') {
      console.error('[POST /recommend] Error generating recommendation:', msg);
    }
    return res.status(500).json({
      success: false,
      error: msg,
    });
  }
});

/**
 * GET /api/copilot/history
 * Retrieves recent recommendation logs saved in Firestore.
 */
copilotRouter.get('/history', async (_req: Request, res: Response) => {
  try {
    const localStore = getLocalStore('recommendations', []);
    const logs = localStore.getAll();
    // Sort descending by timestamp
    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({
      success: true,
      logs: sortedLogs.slice(0, 20),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recommendation logs.',
    });
  }
});
