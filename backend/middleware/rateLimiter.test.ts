import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from './rateLimiter';

describe('rateLimiter Middleware', () => {
  it('should allow requests within the rate limit threshold', () => {
    // Force nodeEnv to 'development' during this test block to bypass the 'test' mode check
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      const limiter = rateLimiter(10000, 3);
      const req = {
        headers: {},
        socket: { remoteAddress: '192.168.1.1' },
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as NextFunction;

      // Make 3 requests (limit is 3)
      limiter(req, res, next);
      limiter(req, res, next);
      limiter(req, res, next);

      expect(next).toHaveBeenCalledTimes(3);
      expect(res.status).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('should block requests exceeding the rate limit and return 429 status', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      // Use unique IP to isolate from other tests
      const limiter = rateLimiter(10000, 2);
      const req = {
        headers: {},
        socket: { remoteAddress: '192.168.1.2' },
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as NextFunction;

      // First 2 requests pass
      limiter(req, res, next);
      limiter(req, res, next);
      expect(next).toHaveBeenCalledTimes(2);

      // Third request is blocked
      limiter(req, res, next);
      expect(next).toHaveBeenCalledTimes(2); // Still 2
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Too many requests'),
        })
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('should automatically bypass limits when in test mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    try {
      const limiter = rateLimiter(10000, 1);
      const req = {
        headers: {},
        socket: { remoteAddress: '192.168.1.3' },
      } as unknown as Request;

      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const next = vi.fn() as NextFunction;

      // Limit is 1, but we send 3 requests in 'test' mode
      limiter(req, res, next);
      limiter(req, res, next);
      limiter(req, res, next);

      expect(next).toHaveBeenCalledTimes(3);
      expect(res.status).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
