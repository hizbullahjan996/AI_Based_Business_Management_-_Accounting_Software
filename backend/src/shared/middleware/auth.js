const jwt = require('jsonwebtoken');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/auth.log' }),
    new winston.transports.Console(),
  ],
});

/**
 * Authenticate middleware
 * - Verifies JWT token in `Authorization: Bearer <token>` header
 * - On success attaches `req.user = { id, companyId, role, ... }`
 * - Supports DEV_BYPASS_AUTH=true to allow a default admin user for local development
 */
function authenticate(req, res, next) {
  try {
    // Development bypass (explicit opt-in)
    if (process.env.DEV_BYPASS_AUTH === 'true') {
      req.user = {
        id: 1,
        companyId: 1,
        role: 'admin',
        name: 'dev-admin',
      };
      return next();
    }

    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'change-this-secret';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      logger.warn('Invalid JWT token', { err: err.message });
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Expected payload contains at least: id, companyId, role
    req.user = {
      id: decoded.id || decoded.userId || null,
      companyId: decoded.companyId || decoded.company_id || null,
      role: decoded.role || decoded.user_role || 'user',
      email: decoded.email || null,
    };

    next();
  } catch (error) {
    logger.error('Authentication middleware error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
}

/**
 * Authorize middleware
 * - Usage: authorize(['admin','manager'])
 */
function authorize(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // If no roles provided, allow any authenticated user
      if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        return next();
      }

      if (allowedRoles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({ success: false, message: 'Forbidden - insufficient privileges' });
    } catch (error) {
      logger.error('Authorization middleware error', { error: error.message });
      return res.status(500).json({ success: false, message: 'Authorization error' });
    }
  };
}

module.exports = {
  authenticate,
  authorize,
};
