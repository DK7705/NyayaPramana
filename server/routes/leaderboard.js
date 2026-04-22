import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const leaderboard = db.prepare(`
      SELECT 
        u.id, u.name, u.role, up.total_score as score,
        json_array_length(up.completed_levels) as level
      FROM users u
      JOIN user_progress up ON u.id = up.user_id
      WHERE u.role = 'student' AND up.total_score > 0
      ORDER BY up.total_score DESC
      LIMIT 50
    `).all();

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
