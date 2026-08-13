const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'inventrack_super_secret_jwt_key_2026_cscd602';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Real-time account active check against the database
    const user = await userRepository.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ 
        error: 'ACCOUNT_DEACTIVATED', 
        message: 'Your account has been deactivated by an administrator. You have been signed out.' 
      });
    }

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient role permissions' });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole
};
