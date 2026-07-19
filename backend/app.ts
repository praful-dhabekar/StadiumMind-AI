import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLoggerMiddleware } from './middleware/requestLogger';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { copilotRouter } from './routes/copilot';

export const app = express();

// Security headers — prevents XSS, clickjacking, MIME sniffing
app.use(helmet());

/**
 * CORS: restrict to Firebase Hosting origin in production.
 * In development/test, allow all origins for convenience.
 */
const allowedOrigins = config.isProduction
  ? ['https://praful-workspace.web.app', 'https://praful-workspace.firebaseapp.com']
  : true; // allow all in dev/test

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  })
);

// Request ID assignment & tracing middleware
app.use(requestIdMiddleware);

// Request & response logging middleware
app.use(requestLoggerMiddleware);

// Limit JSON payload to 64kb to prevent DoS via large payloads
app.use(express.json({ limit: '64kb' }));

// Root Health Check endpoint (Cloud Run container health probes)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'StadiumMind AI Copilot Engine',
    nodeEnv: config.nodeEnv,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/copilot', copilotRouter);

// Catch-all 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);
