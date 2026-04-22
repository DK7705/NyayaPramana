import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/result', authenticate, (req, res) => {
  const { gameType, level, score, accuracy, correct, total, hintsUsed, timeSeconds, pramanaData } = req.body;
  const userId = req.user.id;
  const id = uuidv4();

  try {
    db.transaction(() => {
      // 1. Insert the specific game result
      db.prepare(`
        INSERT INTO game_results 
        (id, user_id, game_type, level, score, accuracy, correct, total, hints_used, time_seconds, pramana_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, gameType, level, score, accuracy, correct, total, hintsUsed, timeSeconds, JSON.stringify(pramanaData));

      // 2. Update overall user progress
      const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId);
      let completedLevels = JSON.parse(progress.completed_levels || '[]');
      if (!completedLevels.includes(level)) {
        completedLevels.push(level);
      }
      const newTotalScore = (progress.total_score || 0) + score;

      // 3. Calculate new overall accuracy based on all historical results
      const totalResults = db.prepare('SELECT COUNT(*) as count, SUM(accuracy) as sum FROM game_results WHERE user_id = ?').get(userId);
      const newOverallAccuracy = totalResults.count > 0 ? Math.round(totalResults.sum / totalResults.count) : accuracy;
      
      // 4. Correct aggregation of pramana accuracy from the array format
      let pAcc = JSON.parse(progress.pramana_accuracy || '{"pratyaksa":0,"anumana":0,"sabda":0}');
      
      if (pramanaData && Array.isArray(pramanaData) && pramanaData.length > 0) {
        const stats = pramanaData.reduce((acc, item) => {
          if (!acc[item.pramana]) acc[item.pramana] = { correct: 0, total: 0 };
          acc[item.pramana].total++;
          if (item.correct) acc[item.pramana].correct++;
          return acc;
        }, {});

        Object.keys(stats).forEach(type => {
          const gameAcc = Math.round((stats[type].correct / stats[type].total) * 100);
          // Moving average: new = (old + current) / 2
          pAcc[type] = pAcc[type] === 0 ? gameAcc : Math.round((pAcc[type] + gameAcc) / 2);
        });
      }

      db.prepare(`
        UPDATE user_progress 
        SET completed_levels = ?, total_score = ?, pramana_accuracy = ?, overall_accuracy = ?
        WHERE user_id = ?
      `).run(JSON.stringify(completedLevels), newTotalScore, JSON.stringify(pAcc), newOverallAccuracy, userId);
    })();

    res.json({ message: 'Result saved successfully' });
  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/progress', authenticate, (req, res) => {
  try {
    const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(req.user.id);
    const hintsRow = db.prepare('SELECT COALESCE(SUM(hints_used),0) as total FROM game_results WHERE user_id = ?').get(req.user.id);
    res.json({
      completedLevels: JSON.parse(progress.completed_levels),
      totalScore: progress.total_score,
      pramanaAccuracy: JSON.parse(progress.pramana_accuracy),
      accuracy: progress.overall_accuracy || 0,
      hintsUsed: hintsRow.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
