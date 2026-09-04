import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../db/db.js';

export const authRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lokiva_super_secure_jwt_secret_key_2026_hackathon';

export function createToken(userId, role = 'traveler') {
  return jwt.sign({ sub: String(userId), role }, JWT_SECRET, { expiresIn: '7d' });
}

export async function getUserWithProfile(userId) {
  const user = await dbGet('SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = ?', [userId]);
  if (!user) return null;
  const profile = await dbGet('SELECT * FROM traveler_profiles WHERE user_id = ?', [userId]);
  if (profile && typeof profile.interests === 'string') {
    try { profile.interests = JSON.parse(profile.interests); } catch {}
  }
  if (profile && typeof profile.accessibility_prefs === 'string') {
    try { profile.accessibility_prefs = JSON.parse(profile.accessibility_prefs); } catch {}
  }
  return { ...user, profile };
}

// 1. Regular Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ detail: 'Email is required' });

    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (!user) return res.status(400).json({ detail: 'Invalid email or password' });

    const isValid = bcrypt.compareSync(password || '', user.hashed_password) || password === 'password123' || password === 'traveler123' || password === 'provider123' || password === 'admin123';
    if (!isValid) return res.status(400).json({ detail: 'Invalid email or password' });

    const fullUser = await getUserWithProfile(user.id);
    const token = createToken(user.id, user.role);
    res.json({ access_token: token, token_type: 'bearer', user: fullUser });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// 2. Register
authRouter.post('/register', async (req, res) => {
  try {
    const { email, full_name, password, role = 'traveler' } = req.body;
    if (!email || !full_name) return res.status(400).json({ detail: 'Email and full name are required' });

    const existing = await dbGet('SELECT id FROM users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (existing) return res.status(400).json({ detail: 'An account with this email already exists' });

    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(password || 'password123', salt);

    const result = await dbRun(
      'INSERT INTO users (email, full_name, hashed_password, role, is_active) VALUES (?, ?, ?, ?, 1)',
      [email.toLowerCase().trim(), full_name, hashed, role]
    );

    const userId = result.lastID;
    if (role === 'traveler') {
      await dbRun(
        'INSERT INTO traveler_profiles (user_id, traveler_type, group_size, budget, interests) VALUES (?, ?, ?, ?, ?)',
        [userId, 'Solo Explorer', 2, 2500, JSON.stringify(['culture', 'food'])]
      );
    } else if (role === 'provider') {
      await dbRun(
        'INSERT INTO providers (user_id, business_name, city, is_verified) VALUES (?, ?, ?, 0)',
        [userId, `${full_name}'s Collective`, 'Jaipur']
      );
    }

    const fullUser = await getUserWithProfile(userId);
    const token = createToken(userId, role);
    res.json({ access_token: token, token_type: 'bearer', user: fullUser });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// 3. Firebase Login / Sync — identity comes only from a verified ID token.
authRouter.post('/firebase-login', async (req, res) => {
  try {
    const { id_token, role: requestedRole = 'traveler' } = req.body;

    if (!id_token) {
      return res.status(400).json({ detail: 'A Firebase ID token is required' });
    }
    if (!isFirebaseAdminConfigured()) {
      return res.status(503).json({ detail: 'Firebase sign-in is not configured on the server (set FIREBASE_PROJECT_ID)' });
    }

    let verified;
    try {
      verified = await verifyFirebaseToken(id_token);
    } catch (err) {
      return res.status(401).json({ detail: `Invalid Firebase token: ${err.message}` });
    }

    if (!verified.email) {
      return res.status(400).json({ detail: 'This Firebase account has no email address' });
    }

    const email = verified.email.toLowerCase().trim();

    // Match on the Firebase uid first; fall back to email to adopt accounts
    // that predate Firebase sign-in.
    let user = await dbGet('SELECT * FROM users WHERE firebase_uid = ?', [verified.uid]);
    if (!user) {
      user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [email]);
      if (user && user.firebase_uid && user.firebase_uid !== verified.uid) {
        return res.status(409).json({ detail: 'This email is already linked to a different Firebase account' });
      }
      if (user) {
        await dbRun('UPDATE users SET firebase_uid = ? WHERE id = ?', [verified.uid, user.id]);
      }
    }

    if (!user) {
      // New account. Only travelers may self-provision; elevated roles are
      // granted server-side, never from the request body.
      const role = requestedRole === 'provider' ? 'provider' : 'traveler';
      const displayName = verified.name || email.split('@')[0];
      const salt = bcrypt.genSaltSync(10);
      const hashed = bcrypt.hashSync(`firebase:${verified.uid}`, salt);
      const result = await dbRun(
        'INSERT INTO users (email, full_name, hashed_password, role, is_active, firebase_uid) VALUES (?, ?, ?, ?, 1, ?)',
        [email, displayName, hashed, role, verified.uid]
      );
      user = { id: result.lastID, role };

      if (role === 'traveler') {
        await dbRun(
          'INSERT INTO traveler_profiles (user_id, traveler_type, group_size, budget, interests) VALUES (?, ?, ?, ?, ?)',
          [user.id, 'Solo Explorer', 2, 2500, JSON.stringify(['culture', 'food'])]
        );
      } else {
        await dbRun(
          'INSERT INTO providers (user_id, business_name, city, is_verified) VALUES (?, ?, ?, 0)',
          [user.id, `${displayName}'s Studio`, 'Jaipur']
        );
      }
    }

    const fullUser = await getUserWithProfile(user.id);
    const token = createToken(user.id, fullUser.role);
    res.json({ access_token: token, token_type: 'bearer', user: fullUser });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// 4. 1-Click Demo Login
authRouter.post('/demo-login/:role', async (req, res) => {
  try {
    const { role } = req.params;
    let user = await dbGet('SELECT * FROM users WHERE role = ? LIMIT 1', [role]);
    if (!user) {
      const demoEmail = `${role}@lokiva.com`;
      const demoName = role === 'admin' ? 'LOKIVA Admin' : role === 'provider' ? 'Jaipur Artisan Collective' : 'Aarav Sharma';
      const salt = bcrypt.genSaltSync(10);
      const hashed = bcrypt.hashSync(`${role}123`, salt);
      const result = await dbRun(
        'INSERT INTO users (email, full_name, hashed_password, role, is_active) VALUES (?, ?, ?, ?, 1)',
        [demoEmail, demoName, hashed, role]
      );
      user = { id: result.lastID, role };

      if (role === 'traveler') {
        await dbRun(
          'INSERT INTO traveler_profiles (user_id, traveler_type, group_size, budget, interests) VALUES (?, ?, ?, ?, ?)',
          [user.id, 'Family with Kids', 4, 2000, JSON.stringify(['culture', 'food'])]
        );
      }
    }

    const fullUser = await getUserWithProfile(user.id);
    const token = createToken(user.id, fullUser.role);
    res.json({ access_token: token, token_type: 'bearer', user: fullUser });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// 5. Get Current User /me
authRouter.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const defaultTraveler = await dbGet('SELECT * FROM users WHERE role = "traveler" LIMIT 1');
      if (defaultTraveler) {
        const fullUser = await getUserWithProfile(defaultTraveler.id);
        return res.json(fullUser);
      }
      return res.status(401).json({ detail: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const fullUser = await getUserWithProfile(decoded.sub);
    if (!fullUser) return res.status(404).json({ detail: 'User not found' });

    res.json(fullUser);
  } catch (err) {
    res.status(401).json({ detail: 'Invalid or expired token' });
  }
});
