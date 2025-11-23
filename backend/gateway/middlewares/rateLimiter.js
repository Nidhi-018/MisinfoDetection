/**
 * Simple Token Bucket Rate Limiter
 * 
 * This is a basic in-memory rate limiter for demo purposes.
 * 
 * TODO: Replace with production-ready solution:
 * - Use redis-based rate limiting (e.g., express-rate-limit with Redis store)
 * - Implement distributed rate limiting for multi-instance deployments
 * - Add rate limit headers to responses
 * - Consider different limits for different endpoints
 */

const rateLimitStore = new Map(); // IP -> { tokens, lastRefill }

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const REFILL_RATE = MAX_REQUESTS / (WINDOW_MS / 1000); // tokens per second

/**
 * Get client IP address
 */
const getClientIp = (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    'unknown'
  );
};

/**
 * Token bucket rate limiter middleware
 */
const rateLimiter = (req, res, next) => {
  const ip = getClientIp(req);
  const now = Date.now();

  // Get or create bucket for this IP
  let bucket = rateLimitStore.get(ip);

  if (!bucket) {
    bucket = {
      tokens: MAX_REQUESTS,
      lastRefill: now,
    };
    rateLimitStore.set(ip, bucket);
  }

  // Refill tokens based on time passed
  const timePassed = (now - bucket.lastRefill) / 1000; // seconds
  const tokensToAdd = timePassed * REFILL_RATE;
  bucket.tokens = Math.min(MAX_REQUESTS, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Check if request can be processed
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens));
    res.setHeader('X-RateLimit-Reset', new Date(now + WINDOW_MS).toISOString());
    return next();
  }

  // Rate limit exceeded
  res.status(429).json({
    error: {
      status: 429,
      message: 'Too Many Requests',
      details: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per ${WINDOW_MS / 1000} seconds.`,
    },
  });
};

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateLimitStore.entries()) {
    if (now - bucket.lastRefill > WINDOW_MS * 2) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

module.exports = rateLimiter;

