import { useState, useEffect } from 'react';
import Confetti from './Confetti.jsx';

export default function LevelComplete({ result, onContinue, onRetry }) {
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => { setTimeout(() => setShowConfetti(false), 3000); }, []);

  const grade = result.accuracy >= 80 ? 'Excellent' : result.accuracy >= 60 ? 'Good' : 'Keep Practicing';
  const emoji = result.accuracy >= 80 ? '🏆' : result.accuracy >= 60 ? '🌟' : '💪';
  const medals = result.accuracy >= 80 ? 3 : result.accuracy >= 60 ? 2 : 1;

  return (
    <div className="level-complete">
      <Confetti show={showConfetti && result.accuracy >= 60} />
      <div className="complete-card glass-strong">
        <span className="trophy-icon">{emoji}</span>
        <div className="complete-title">Level {result.level} {grade}!</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
          {'⭐'.repeat(medals)}{'☆'.repeat(3 - medals)}
        </div>

        <div className="score-breakdown">
          <div className="score-item">
            <div className="score-item-val" style={{ color: 'var(--gold)' }}>{result.score}</div>
            <div className="score-item-label">Score</div>
          </div>
          <div className="score-item">
            <div className="score-item-val" style={{ color: result.accuracy >= 70 ? '#86efac' : '#fca5a5' }}>{result.accuracy}%</div>
            <div className="score-item-label">Accuracy</div>
          </div>
          <div className="score-item">
            <div className="score-item-val" style={{ color: 'var(--sacred-teal)' }}>{result.correct}/{result.total}</div>
            <div className="score-item-label">Correct</div>
          </div>
        </div>

        <div className="glass" style={{ padding: '14px 20px', borderRadius: 14, marginBottom: 24, textAlign: 'left' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: 1 }}>PERFORMANCE INSIGHTS</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ⏱ Avg time: ~{Math.round(result.time / result.total)}s per question &nbsp;•&nbsp;
            💡 Hints used: {result.hintsUsed} &nbsp;•&nbsp;
            🎯 Pramana mastery: {result.accuracy >= 70 ? 'Strong' : 'Developing'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {result.accuracy < 60 && (
            <button className="btn-outline" onClick={onRetry}>↩ Retry Level</button>
          )}
          <button className="btn-gold" onClick={onContinue}>
            {result.level < 3 ? '→ Next Level' : '🏠 Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
