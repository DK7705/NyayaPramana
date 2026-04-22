import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authenticate, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

const SESSION_DURATION_MINUTES = 15;

router.post('/register', async (req, res) => {
  const { name, email, password, role, institution } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    
    db.prepare('INSERT INTO users (id, name, email, password_hash, role, institution) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, name, email, hash, role || 'student', institution || null);

    db.prepare('INSERT INTO user_progress (user_id) VALUES (?)').run(id);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '15m' });
    const sessionId = uuidv4();
    
    // Invalidate old sessions for this user to keep it clean (optional, but good practice)
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);

    db.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, last_activity) 
      VALUES (?, ?, ?, datetime('now', '+${SESSION_DURATION_MINUTES} minutes'), datetime('now'))
    `).run(sessionId, user.id, token);

    const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(user.id);

    // Compute hintsUsed from game_results
    const hintsRow = db.prepare('SELECT COALESCE(SUM(hints_used),0) as total FROM game_results WHERE user_id = ?').get(user.id);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, institution: user.institution },
      progress: progress ? {
        completedLevels: JSON.parse(progress.completed_levels),
        totalScore: progress.total_score,
        pramanaAccuracy: JSON.parse(progress.pramana_accuracy),
        accuracy: progress.overall_accuracy || 0,
        hintsUsed: hintsRow.total || 0
      } : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', authenticate, (req, res) => {
  try {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(req.token);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/session', authenticate, (req, res) => {
  try {
    // Update last activity
    db.prepare(`UPDATE sessions SET last_activity = datetime('now'), expires_at = datetime('now', '+15 minutes') WHERE token = ?`).run(req.token);
    
    const user = db.prepare('SELECT id, name, email, role, institution FROM users WHERE id = ?').get(req.user.id);
    const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(user.id);
    const hintsRow = db.prepare('SELECT COALESCE(SUM(hints_used),0) as total FROM game_results WHERE user_id = ?').get(user.id);

    res.json({
      user,
      progress: progress ? {
        completedLevels: JSON.parse(progress.completed_levels),
        totalScore: progress.total_score,
        pramanaAccuracy: JSON.parse(progress.pramana_accuracy),
        accuracy: progress.overall_accuracy || 0,
        hintsUsed: hintsRow.total || 0
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/heartbeat', authenticate, (req, res) => {
  try {
    db.prepare(`UPDATE sessions SET last_activity = datetime('now'), expires_at = datetime('now', '+15 minutes') WHERE token = ?`).run(req.token);
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
