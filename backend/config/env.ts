import dotenv from 'dotenv';

dotenv.config();

/**
 * Validated Environment and Production Configuration.
 * Enforces schema checks and logs startup validation status.
 */
export interface ProductionConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  geminiApiKey?: string;
  isProduction: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

function loadAndValidateEnv(): ProductionConfig {
  const rawPort = process.env.PORT || '3001';
  const port = parseInt(rawPort, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`[ENV VALIDATION ERROR] Invalid PORT specified: ${rawPort}`);
  }

  const rawEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  const nodeEnv: 'development' | 'production' | 'test' =
    rawEnv === 'production' ? 'production' : rawEnv === 'test' ? 'test' : 'development';

  const rawKey = process.env.GEMINI_API_KEY;
  const geminiApiKey = rawKey ? rawKey.trim().replace(/^["']|["']$/g, '') : undefined;

  const isProduction = nodeEnv === 'production';
  const logLevel = isProduction ? 'info' : 'debug';

  // Startup Validation Checks
  if (nodeEnv !== 'test') {
    if (!geminiApiKey || geminiApiKey.length < 5) {
      if (isProduction) {
        console.warn(
          '⚠️ [PROD CONFIG WARNING] GEMINI_API_KEY is not configured or too short. AI Copilot will operate using dynamic local fallback reasoning engine.'
        );
      } else {
        console.info('ℹ️ [DEV CONFIG INFO] GEMINI_API_KEY is not set. Local fallback engine active.');
      }
    } else {
      console.info(`✅ [ENV VALIDATION] Environment loaded for [${nodeEnv.toUpperCase()}]. Gemini API configured.`);
    }
  }

  return {
    port,
    nodeEnv,
    geminiApiKey,
    isProduction,
    logLevel,
  };
}

export const config: ProductionConfig = loadAndValidateEnv();
