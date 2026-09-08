import jwt from 'jsonwebtoken';
import { dbGet } from '../db/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lokiva_super_secure_jwt_secret_key_2026_hackathon';

function bearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

export async function requireAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ detail: 'Not authenticated' });
  try {
    const claims = jwt.verify(token, JWT_SECRET);
    const user = await dbGet('SELECT id, role, is_active FROM users WHERE id = ?', [claims.sub]);
    if (!user || !user.is_active) return res.status(401).json({ detail: 'User is inactive or not found' });
    req.userId = user.id;
    req.userRole = user.role;
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return next();
  try {
    const claims = jwt.verify(token, JWT_SECRET);
    const user = await dbGet('SELECT id, role, is_active FROM users WHERE id = ?', [claims.sub]);
    if (user?.is_active) {
      req.userId = user.id;
      req.userRole = user.role;
      req.user = user;
    }
  } catch {
    // Preserve the existing anonymous concierge behavior for invalid optional tokens.
  }
  next();
}
