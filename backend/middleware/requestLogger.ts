import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * Middleware that logs HTTP requests with request IDs, method, path, status, and duration.
 * Outputs structured JSON when running in production (`NODE_ENV=production`) for Cloud Run Stackdriver logging.
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startMs = Date.now();

  res.on('finish', () => {
    // Avoid noisy logging during unit tests unless there's an error status
    if (config.nodeEnv === 'test' && res.statusCode < 400) {
      return;
    }

    const durationMs = Date.now() - startMs;
    const logData = {
      severity: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARNING' : 'INFO',
      requestId: req.requestId || 'unknown',
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.socket.remoteAddress || '',
      timestamp: new Date().toISOString(),
    };

    if (config.isProduction) {
      // Structured JSON format automatically parsed by Google Cloud Logging on Cloud Run
      console.log(JSON.stringify(logData));
    } else {
      const icon = res.statusCode >= 500 ? '❌' : res.statusCode >= 400 ? '⚠️' : '✅';
      console.log(
        `${icon} [ID: ${logData.requestId}] ${req.method} ${logData.url} - ${res.statusCode} (${durationMs}ms)`
      );
    }
  });

  next();
}
