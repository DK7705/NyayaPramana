import GameHub from './GameHub.jsx';

export default function StudentDashboard({ user, progress, onStartLevel, onViewLeaderboard }) {
  const completedLevel = progress?.completedLevels || [];
  const totalScore = progress?.totalScore || 0;
  const accuracy = progress?.accuracy || 0;
  const pramanaStats = progress?.pramanaAccuracy || { pratyaksa: 0, anumana: 0, sabda: 0 };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="welcome-text">✦ Welcome Back</div>
          <div className="dashboard-title">{user.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-faded)', marginTop: 4 }}>
            {completedLevel.length === 0 ? 'Begin your Nyaya journey today' : `${completedLevel.length} level${completedLevel.length > 1 ? 's' : ''} completed • Pramana Scholar`}
          </div>
        </div>
        <div className="dashboard-header-right">
          <div className="wisdom-quote-inline">
            <div className="wisdom-label">📿 Nyaya Wisdom</div>
            <div className="wisdom-sanskrit">
              "प्रत्यक्षानुमानोपमानशब्दाः प्रमाणानि"
            </div>
            <div className="wisdom-english">
              "Perception, inference, comparison, and verbal testimony are the means of valid knowledge." — Nyaya Sutra 1.1.3
            </div>
          </div>
          {totalScore > 0 && (
            <button className="btn-outline" onClick={onViewLeaderboard}>🏆 Leaderboard</button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-1 glass">
          <div className="stat-icon">🏅</div>
          <div className="stat-value" style={{ color: 'var(--saffron)' }}>{totalScore}</div>
          <div className="stat-label">TOTAL SCORE</div>
        </div>
        <div className="stat-card stat-card-2 glass">
          <div className="stat-icon">🎯</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{accuracy}%</div>
          <div className="stat-label">ACCURACY</div>
        </div>
        <div className="stat-card stat-card-3 glass">
          <div className="stat-icon">⚡</div>
          <div className="stat-value" style={{ color: 'var(--sacred-teal)' }}>{completedLevel.length}/10</div>
          <div className="stat-label">GAMES WON</div>
        </div>
        <div className="stat-card stat-card-4 glass">
          <div className="stat-icon">💡</div>
          <div className="stat-value" style={{ color: 'var(--lotus-pink)' }}>{progress?.hintsUsed || 0}</div>
          <div className="stat-label">HINTS USED</div>
        </div>
      </div>

      {completedLevel.length > 0 && (
        <div className="glass" style={{ padding: 24, borderRadius: 20, marginBottom: 28 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>📊 Pramana Skill Breakdown</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {[
              { key: 'pratyaksa', label: 'Pratyaksa (Observation)', color: 'var(--saffron)', val: pramanaStats.pratyaksa || 0 },
              { key: 'anumana', label: 'Anumana (Inference)', color: 'var(--gold)', val: pramanaStats.anumana || 0 },
              { key: 'sabda', label: 'Sabda (Testimony)', color: 'var(--sacred-teal)', val: pramanaStats.sabda || 0 },
            ].map(p => (
              <div key={p.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{p.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.val}%</span>
                </div>
                <div className="progress-bar-bg" style={{ height: 8 }}>
                  <div className="progress-bar-fill" style={{ width: `${p.val}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <GameHub progress={progress} onStartGame={onStartLevel} />
    </div>
  );
}
