import React, { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function LeaderboardPage({ user, progress, onBack }) {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedScope, setSelectedScope] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === 'student') {
      api.getMyEnrollments().then(res => {
        // Enrolled classes are where status is approved
        setEnrollments(res.filter(r => r.status === 'approved'));
      }).catch(e => console.error(e));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    if (selectedScope === 'global') {
      api.getLeaderboard()
        .then(res => setLeaderboardData(res))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    } else {
      api.getClassLeaderboard(selectedScope)
        .then(res => setLeaderboardData(res))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [selectedScope]);

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }} onClick={onBack}>← Back</button>
        <div style={{ flex: 1 }}>
          <div className="dashboard-title">🏆 Leaderboard</div>
          <div style={{ fontSize: 13, color: 'var(--text-faded)', marginTop: 2 }}>Nyaya Pramana Champions</div>
        </div>
        {enrollments.length > 0 && (
          <select 
            className="form-input" 
            style={{ width: 'auto', padding: '8px 16px' }}
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
          >
            <option value="global">Global Rankings</option>
            {enrollments.map(e => (
              <option key={e.class_id} value={e.class_id}>{e.class_name || 'Class ' + e.class_code}</option>
            ))}
          </select>
        )}
      </div>

      <div className="glass-strong" style={{ padding: 28, borderRadius: 24, maxWidth: 680 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--gold)' }}>Loading rankings...</div>
        ) : leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data available for this leaderboard.</div>
        ) : (
          leaderboardData.map((entry, i) => (
          <div key={i} className="leaderboard-item" style={{
            padding: '16px 0',
            background: entry.name.includes('(You)') ? 'rgba(247,201,72,0.05)' : 'transparent',
            borderRadius: 12, paddingLeft: entry.name.includes('(You)') ? 12 : 0
          }}>
            <div className={`lb-rank ${i < 3 ? `lb-rank-${i + 1}` : 'lb-rank-n'}`} style={{ width: 36, height: 36, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </div>
            <div className="lb-info" style={{ flex: 1, marginLeft: 16 }}>
              <div className="lb-name" style={{ fontSize: 15, color: entry.name.includes('(You)') ? 'var(--gold)' : 'var(--text-main)', fontWeight: 'bold' }}>{entry.name}</div>
              <div className="lb-badge" style={{ fontSize: 12, color: 'var(--text-faded)' }}>Level {entry.level || 1}</div>
            </div>
            {selectedScope !== 'global' && entry.improvement_delta != null && (
              <div style={{ marginRight: 16, textAlign: 'right', fontSize: 12, color: entry.improvement_delta > 0 ? '#86efac' : 'var(--text-faded)' }}>
                {entry.improvement_delta > 0 ? `+${entry.improvement_delta}% Diff` : 'No Diff'}
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <div className="lb-score" style={{ fontSize: 18, color: 'var(--gold)', fontWeight: 'bold' }}>{entry.score}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faded)' }}>points</div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
