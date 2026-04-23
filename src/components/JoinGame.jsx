import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function JoinGame({ user, notify, onPlayGame }) {
  const [code, setCode] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => { loadEnrollments(); }, []);

  async function loadEnrollments() {
    try {
      setLoading(true);
      const data = await api.getMyEnrollments();
      setEnrollments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!code.trim()) {
      notify('Please enter a class code.', 'error');
      return;
    }

    try {
      setJoining(true);
      const result = await api.joinClass({ classCode: code.trim().toUpperCase() });
      notify(result.message || 'Join request sent!', 'success');
      setCode('');
      loadEnrollments();
    } catch (e) {
      notify(e.message || 'Failed to join. Check the code and try again.', 'error');
    } finally {
      setJoining(false);
    }
  }

  const approved = enrollments.filter(e => e.status === 'approved');

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="welcome-text">✦ Join a Game</div>
          <div className="dashboard-title">Enter Game Code</div>
          <div style={{ fontSize: 13, color: 'var(--text-faded)', marginTop: 4 }}>
            Get a code from your teacher to join their quiz or game
          </div>
        </div>
      </div>

      {/* Code Input */}
      <div className="glass-strong" style={{ padding: 32, borderRadius: 24, marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
          Enter the 6-character game code shared by your teacher
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{
              maxWidth: 280, textAlign: 'center', fontSize: 24, fontWeight: 700,
              letterSpacing: 8, fontFamily: 'monospace', textTransform: 'uppercase',
              padding: '16px 24px'
            }}
            placeholder="ABC123"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            maxLength={6}
          />
          <button className="btn-primary" onClick={handleJoin} disabled={joining || code.length < 4}
            style={{ padding: '16px 32px', opacity: (joining || code.length < 4) ? 0.5 : 1 }}>
            {joining ? '⏳ Joining...' : '🚀 Join Now'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gold)' }}>Loading your games...</div>
      ) : (
        <>
          {/* Approved Enrollments */}
          {approved.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div className="section-title">✅ Joined Games/Quizzes ({approved.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                {approved.map(e => (
                  <div key={e.enrollment_id} className="glass-strong" style={{
                    padding: 24, borderRadius: 20, transition: 'transform 0.3s'
                  }}
                    onMouseEnter={ev => ev.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={ev => ev.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{e.class_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-faded)', marginTop: 2 }}>{e.description || 'No description'}</div>
                      </div>
                      <span className="pramana-tag" style={{
                        background: e.type === 'quiz' ? 'rgba(247,201,72,0.15)' : e.type === 'game' ? 'rgba(10,191,188,0.15)' : 'rgba(255,107,53,0.15)',
                        color: e.type === 'quiz' ? 'var(--gold)' : e.type === 'game' ? 'var(--sacred-teal)' : 'var(--saffron)',
                        border: `1px solid ${e.type === 'quiz' ? 'var(--gold)' : e.type === 'game' ? 'var(--sacred-teal)' : 'var(--saffron)'}40`,
                        textTransform: 'capitalize'
                      }}>{e.type}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--saffron), var(--gold))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, color: 'white', fontWeight: 700, flexShrink: 0
                      }}>
                        {e.teacher_name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{e.teacher_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-faded)' }}>{e.institution || ''}</div>
                      </div>
                    </div>

                    {e.type !== 'class' && e.questions?.length > 0 && (
                      <button className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13, marginTop: 4 }}
                        onClick={() => onPlayGame && onPlayGame(e)}>
                        🎮 Play ({e.questions.length} questions)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {enrollments.length === 0 && (
            <div className="glass" style={{ padding: 40, textAlign: 'center', borderRadius: 20, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No games joined yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-faded)' }}>Enter a game code above to play!</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
