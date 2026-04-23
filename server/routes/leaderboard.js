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

router.get('/class/:classId', (req, res) => {
  try {
    const classId = req.params.classId;
    
    const leaderboard = db.prepare(`
      SELECT 
        u.id, u.name, u.role, up.total_score as score,
        json_array_length(up.completed_levels) as level,
        (SELECT score FROM pre_post_tests WHERE student_id = u.id AND test_type = 'pre' ORDER BY timestamp DESC LIMIT 1) as pre_score,
        (SELECT score FROM pre_post_tests WHERE student_id = u.id AND test_type = 'post' ORDER BY timestamp DESC LIMIT 1) as post_score
      FROM users u
      JOIN user_progress up ON u.id = up.user_id
      JOIN class_enrollments ce ON u.id = ce.student_id
      WHERE u.role = 'student' AND ce.class_id = ? AND ce.status = 'approved'
      ORDER BY up.total_score DESC
    `).all(classId);

    // Compute improvement delta
    const enriched = leaderboard.map(student => ({
      ...student,
      improvement_delta: student.post_score && student.pre_score ? student.post_score - student.pre_score : 0
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
