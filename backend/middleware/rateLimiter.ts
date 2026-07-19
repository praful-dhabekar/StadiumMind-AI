import { Request, Response, NextFunction } from 'express';

const ipCache = new Map<string, { count: number; resetTime: number }>();

// Simple background task to prune expired cache entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipCache.entries()) {
      if (now > record.resetTime) {
        ipCache.delete(ip);
      }
    }
  }, 300000); // 5 minutes
}

/**
 * High-performance, zero-dependency in-memory rate limiting middleware.
 * Prevents API spamming to protect Gemini tokens and backend compute.
 *
 * @param windowMs Time window in milliseconds (default 1 minute)
 * @param maxRequests Maximum requests allowed per IP inside the window (default 20 requests)
 */
export function rateLimiter(windowMs = 60000, maxRequests = 20) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    const ipHeader = req.headers['x-forwarded-for'];
    const ip = Array.isArray(ipHeader)
      ? ipHeader[0]
      : typeof ipHeader === 'string'
      ? ipHeader.split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown';

    const now = Date.now();
    const record = ipCache.get(ip);

    if (!record || now > record.resetTime) {
      ipCache.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      
      // Clean structure returning JSON error matching errorHandler format
      res.status(429).json({
        success: false,
        error: `Too many requests from this IP. Please try again after ${retryAfter} seconds.`,
        requestId: req.requestId || 'unknown',
      });
      return;
    }

    next();
  };
}
