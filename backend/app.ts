import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLoggerMiddleware } from './middleware/requestLogger';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { copilotRouter } from './routes/copilot';

export const app = express();

// Request ID assignment & tracing middleware
app.use(requestIdMiddleware);

// Request & response logging middleware
app.use(requestLoggerMiddleware);

app.use(cors());
app.use(express.json());

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
