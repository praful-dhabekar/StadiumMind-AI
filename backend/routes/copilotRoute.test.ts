import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('Express Copilot Route Endpoint', () => {
  it('should return health status on GET /api/copilot/health', async () => {
    const res = await request(app).get('/api/copilot/health');

    expect(res.status).toBe(200);
    expect(res.body.geminiConfigured).toBeTypeOf('boolean');
    expect(res.body.firestoreConnected).toBeTypeOf('boolean');
    expect(res.body.model).toBe('gemini-2.5-flash');
    expect(res.body.uptime).toBeTypeOf('number');
  });

  it('should return 400 if required situation fields are missing', async () => {
    const res = await request(app).post('/api/copilot/recommend').send({
      fanLanguage: 'English',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Missing required situation fields');
  });

  it('should process a valid recommendation request and return observability metrics', async () => {
    const res = await request(app).post('/api/copilot/recommend').send({
      fanLanguage: 'English',
      fanType: 'Family',
      destination: 'Gate',
      currentGate: 'Gate A',
      notes: 'Testing express endpoint',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.recommendedGate).toBeDefined();
    expect(res.body.observability).toBeDefined();
    expect(res.body.observability.latencyMs).toBeTypeOf('number');
    expect(res.body.observability.engine).toBeDefined();
  });

  it('should respond with history logs on GET /api/copilot/history', async () => {
    const res = await request(app).get('/api/copilot/history');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });
});
