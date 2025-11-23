/**
 * Mock Authentication Middleware
 * 
 * This middleware provides a simple mock authentication system for development.
 * 
 * TO REPLACE WITH REAL AUTH:
 * 1. Replace this file with a real JWT verification middleware
 * 2. Use libraries like jsonwebtoken, passport, or Firebase Admin SDK
 * 3. Verify tokens against your auth provider
 * 4. Extract user info from verified token payload
 * 
 * Current implementation:
 * - Accepts Authorization: Bearer <token>
 * - If token format is "test-token-<userId>", extracts userId
 * - Sets req.user with { userId, role: 'user' }
 */

const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';

/**
 * Mock authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const mockAuth = (req, res, next) => {
  if (!USE_MOCK_AUTH) {
    // If mock auth is disabled, skip authentication
    // TODO: Replace with real auth middleware
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Use: Authorization: Bearer <token>',
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Simple mock token format: "test-token-<userId>"
  // In production, decode and verify JWT here
  if (token.startsWith('test-token-')) {
    const userId = token.replace('test-token-', '');
    req.user = {
      userId,
      role: 'user', // Default role
    };
    return next();
  }

  // Try to decode as JWT (mock implementation)
  // TODO: Replace with real JWT verification using jsonwebtoken library
  try {
    // Simple base64 decode for demo (NOT SECURE - replace with proper JWT verification)
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      req.user = {
        userId: payload.userId || payload.sub || 'unknown',
        role: payload.role || 'user',
      };
      return next();
    }
  } catch (err) {
    // Not a valid token format
  }

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Invalid token format',
  });
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work with or without auth
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7);

  if (token.startsWith('test-token-')) {
    const userId = token.replace('test-token-', '');
    req.user = { userId, role: 'user' };
    return next();
  }

  // Try JWT decode
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      req.user = {
        userId: payload.userId || payload.sub || 'unknown',
        role: payload.role || 'user',
      };
      return next();
    }
  } catch (err) {
    // Ignore
  }

  req.user = null;
  next();
};

module.exports = { mockAuth, optionalAuth };

