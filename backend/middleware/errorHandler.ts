import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * Catch-all 404 handler for routes that are not matched.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl || req.url}`,
    requestId: req.requestId || 'unknown',
  });
}

/**
 * Centralized Error Handling Middleware.
 * Catches unhandled exceptions or route errors and returns consistent JSON structures.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = typeof err.status === 'number' ? err.status : typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  const errorLog = {
    severity: 'ERROR',
    requestId: req.requestId || 'unknown',
    method: req.method,
    url: req.originalUrl || req.url,
    status: statusCode,
    error: message,
    stack: config.isProduction ? undefined : err.stack,
    timestamp: new Date().toISOString(),
  };

  if (config.isProduction) {
    console.error(JSON.stringify(errorLog));
  } else if (config.nodeEnv !== 'test') {
    console.error(`❌ [ERROR HANDLING - ID: ${errorLog.requestId}] ${message}`, err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    requestId: req.requestId || 'unknown',
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}
