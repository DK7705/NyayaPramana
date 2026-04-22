import { INITIAL_LEADERBOARD } from '../data/questions.js';

export default function LeaderboardPage({ user, progress, onBack }) {
  const userScore = progress.totalScore || 0;
  const allEntries = [
    ...INITIAL_LEADERBOARD,
    { name: user.name + ' (You)', role: 'student', score: userScore, level: (progress.completedLevels || []).length, badge: 'Explorer' }
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }} onClick={onBack}>← Back</button>
        <div>
          <div className="dashboard-title">🏆 Leaderboard</div>
          <div style={{ fontSize: 13, color: 'var(--text-faded)', marginTop: 2 }}>Nyaya Pramana Champions</div>
        </div>
      </div>

      <div className="glass-strong" style={{ padding: 28, borderRadius: 24, maxWidth: 680 }}>
        {allEntries.map((entry, i) => (
          <div key={i} className="leaderboard-item" style={{
            padding: '16px 0',
            background: entry.name.includes('(You)') ? 'rgba(247,201,72,0.05)' : 'transparent',
            borderRadius: 12, paddingLeft: entry.name.includes('(You)') ? 12 : 0
          }}>
            <div className={`lb-rank ${i < 3 ? `lb-rank-${i + 1}` : 'lb-rank-n'}`} style={{ width: 36, height: 36, fontSize: 14 }}>
              {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </div>
            <div className="lb-info">
              <div className="lb-name" style={{ fontSize: 15, color: entry.name.includes('(You)') ? 'var(--gold)' : 'white' }}>{entry.name}</div>
              <div className="lb-badge" style={{ fontSize: 12 }}>{entry.badge} • Level {entry.level}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="lb-score" style={{ fontSize: 18 }}>{entry.score}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faded)' }}>points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
