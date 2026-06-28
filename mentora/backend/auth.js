const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production-please';
const TOKEN_EXPIRY = '30d';

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// Express middleware: requires a valid session cookie
function requireAuth(req, res, next) {
  const token = req.cookies?.mentora_session;
  if (!token) return res.status(401).json({ error: 'Daxil olmamısan' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Sessiya bitib, yenidən daxil ol' });
  req.userId = decoded.userId;
  next();
}

// Optional auth: attaches userId if present, doesn't block if not
function optionalAuth(req, res, next) {
  const token = req.cookies?.mentora_session;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) req.userId = decoded.userId;
  }
  next();
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, requireAuth, optionalAuth };
