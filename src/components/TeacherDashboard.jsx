import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function TeacherDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [studentData, classData] = await Promise.all([
        api.getAllStudents().catch(() => []),
        api.getMyClasses().catch(() => [])
      ]);
      setStudents(studentData);
      setClasses(classData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const totalStudents = students.length;
  const avgAccuracy = totalStudents > 0 ? Math.round(students.reduce((s, st) => s + (st.overall_accuracy || 0), 0) / totalStudents) : 0;
  const avgScore = totalStudents > 0 ? Math.round(students.reduce((s, st) => s + (st.total_score || 0), 0) / totalStudents) : 0;
  const highPerformers = students.filter(s => (s.overall_accuracy || 0) >= 80).length;

  // Build pramana averages from real student data
  const pramanaData = (() => {
    if (totalStudents === 0) return [
      { label: 'Pratyaksa', avg: 0, color: 'var(--saffron)' },
      { label: 'Anumana', avg: 0, color: 'var(--gold)' },
      { label: 'Sabda', avg: 0, color: 'var(--sacred-teal)' },
    ];
    const sums = { pratyaksa: 0, anumana: 0, sabda: 0 };
    students.forEach(s => {
      const pa = s.pramana_accuracy || {};
      sums.pratyaksa += pa.pratyaksa || 0;
      sums.anumana += pa.anumana || 0;
      sums.sabda += pa.sabda || 0;
    });
    return [
      { label: 'Pratyaksa', avg: Math.round(sums.pratyaksa / totalStudents), color: 'var(--saffron)' },
      { label: 'Anumana', avg: Math.round(sums.anumana / totalStudents), color: 'var(--gold)' },
      { label: 'Sabda', avg: Math.round(sums.sabda / totalStudents), color: 'var(--sacred-teal)' },
    ];
  })();

  // Level completion counts from real data
  const levelData = (() => {
    const counts = {};
    students.forEach(s => {
      (s.completed_levels || []).forEach(l => {
        counts[l] = (counts[l] || 0) + 1;
      });
    });
    const maxLevel = Math.max(10, ...Object.keys(counts).map(Number));
    const result = [];
    for (let i = 1; i <= Math.min(maxLevel, 10); i++) {
      result.push({
        label: `Level ${i}`,
        completed: counts[i] || 0,
        color: i <= 3 ? 'var(--saffron)' : i <= 6 ? 'var(--gold)' : 'var(--sacred-teal)'
      });
    }
    return result;
  })();

  const handleExportCSV = async () => {
    try {
      const data = await api.getResearchExport();
      if (!data || data.length === 0) {
        alert('No data available to export.');
        return;
      }
      
      const keys = Object.keys(data[0]);
      const csvLines = [keys.join(',')];
      data.forEach(row => {
        csvLines.push(keys.map(k => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(','));
      });
      
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nyaya_research_export_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert('Failed to generate export');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="welcome-text">✦ Teacher Portal</div>
          <div className="dashboard-title">{user.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-faded)', marginTop: 4 }}>
            {user.institution || 'IKS Research Institute'} • {totalStudents} Student{totalStudents !== 1 ? 's' : ''} Enrolled
          </div>
        </div>
        <div className="dashboard-header-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <button className="btn-outline" onClick={handleExportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, color: 'var(--sacred-teal)' }}>
            📊 Export Research Data (CSV)
          </button>
          
          <div className="wisdom-quote-inline" style={{ marginTop: 0 }}>
            <div className="wisdom-label">📿 Nyaya Wisdom</div>
            <div className="wisdom-sanskrit">
              "प्रत्यक्षानुमानोपमानशब्दाः प्रमाणानि"
            </div>
            <div className="wisdom-english">
              "Perception, inference, comparison, and verbal testimony are the means of valid knowledge." — Nyaya Sutra 1.1.3
            </div>
          </div>
        </div>
      </div>

      {/* Internal sub-tabs within the dashboard */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['overview', 'students', 'analytics'].map(tab => (
          <button key={tab} className={`nav-btn ${activeTab === tab ? 'nav-btn-active' : 'nav-btn-inactive'}`}
            onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize', fontSize: 13 }}>
            {tab === 'overview' ? '📊' : tab === 'students' ? '👥' : '📈'} {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gold)' }}>Loading dashboard data...</div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                {[
                  { icon: '👥', val: totalStudents, label: 'ENROLLED STUDENTS', color: 'var(--saffron)', cls: 'stat-card-1' },
                  { icon: '📊', val: avgAccuracy + '%', label: 'AVG ACCURACY', color: 'var(--gold)', cls: 'stat-card-2' },
                  { icon: '🎯', val: highPerformers, label: '80%+ ACCURACY', color: 'var(--sacred-teal)', cls: 'stat-card-3' },
                  { icon: '📚', val: classes.length, label: 'CLASSES CREATED', color: 'var(--lotus-pink)', cls: 'stat-card-4' },
                ].map(s => (
                  <div key={s.label} className={`stat-card ${s.cls} glass`}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="teacher-grid">
                <div className="glass analytics-card">
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Pramana Mastery</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faded)', marginBottom: 16 }}>Average accuracy by Pramana type</div>
                  {pramanaData.map(p => (
                    <div key={p.label} className="chart-bar-row" style={{ marginBottom: 14 }}>
                      <div className="chart-bar-label">{p.label}</div>
                      <div className="chart-bar-bg">
                        <div className="chart-bar" style={{ width: `${p.avg}%`, background: p.color }} />
                      </div>
                      <div className="chart-bar-val" style={{ color: p.color }}>{p.avg}%</div>
                    </div>
                  ))}
                </div>

                <div className="glass analytics-card">
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Level Completion</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faded)', marginBottom: 16 }}>Students who completed each level</div>
                  {levelData.slice(0, 5).map(l => (
                    <div key={l.label} className="chart-bar-row" style={{ marginBottom: 14 }}>
                      <div className="chart-bar-label">{l.label}</div>
                      <div className="chart-bar-bg">
                        <div className="chart-bar" style={{ width: `${totalStudents > 0 ? (l.completed / totalStudents) * 100 : 0}%`, background: l.color }} />
                      </div>
                      <div className="chart-bar-val" style={{ color: l.color }}>{l.completed}/{totalStudents}</div>
                    </div>
                  ))}
                </div>

                <div className="glass analytics-card">
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Engagement Metrics</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faded)', marginBottom: 20 }}>Aggregated student data</div>
                  {[
                    { label: 'Total Students', val: totalStudents, color: 'var(--saffron)' },
                    { label: 'Avg Score', val: avgScore, color: 'var(--gold)' },
                    { label: 'Avg Hints/Student', val: totalStudents > 0 ? (students.reduce((s, st) => s + (st.hints_used || 0), 0) / totalStudents).toFixed(1) : '0', color: 'var(--sacred-teal)' },
                    { label: 'Active Classes', val: classes.length, color: 'var(--lotus-pink)' },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid var(--glass-border)', paddingBottom: 14 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.label}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <div className="glass-strong" style={{ padding: 24, borderRadius: 24, overflowX: 'auto' }}>
              {students.length > 0 ? (
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Student</th><th>Classes</th><th>Score</th><th>Accuracy</th>
                      <th>Levels</th><th>Hints</th><th>Games</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const acc = s.overall_accuracy || 0;
                      const status = acc >= 80 ? 'excellent' : acc >= 60 ? 'good' : 'needs-help';
                      return (
                        <tr key={s.id || i}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-faded)' }}>{s.email}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {(s.class_names || '').split(',').filter(Boolean).map(cls => (
                                <span key={cls} className="pramana-tag" style={{
                                  background: 'rgba(255,255,255,0.05)', fontSize: 10,
                                  color: 'var(--text-muted)', border: '1px solid var(--glass-border)'
                                }}>{cls.trim()}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{s.total_score || 0}</td>
                          <td style={{ color: acc >= 75 ? '#86efac' : acc >= 60 ? 'var(--gold)' : '#fca5a5' }}>{acc}%</td>
                          <td>
                            <div style={{
                              display: 'inline-flex', width: 28, height: 28, borderRadius: 8,
                              alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12,
                              background: 'rgba(247,201,72,0.2)', color: 'var(--gold)'
                            }}>{(s.completed_levels || []).length}</div>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{s.hints_used || 0}</td>
                          <td style={{ color: 'var(--text-faded)' }}>{s.games_played || 0}</td>
                          <td>
                            <span className={`pill ${status === 'excellent' ? 'pill-green' : status === 'good' ? 'pill-yellow' : 'pill-red'}`}>
                              {status === 'excellent' ? '✓ Excellent' : status === 'good' ? '◎ Good' : '⚠ Needs Help'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No students enrolled yet</div>
                  <div style={{ fontSize: 13, color: 'var(--text-faded)' }}>Create a class and share the code to get students enrolled.</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div className="glass-strong" style={{ padding: 24, borderRadius: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📉 Score Distribution</div>
                  {[
                    { label: 'Below 40%', count: students.filter(s => (s.overall_accuracy || 0) < 40).length, color: '#ef4444' },
                    { label: '40–60%', count: students.filter(s => (s.overall_accuracy || 0) >= 40 && (s.overall_accuracy || 0) < 60).length, color: 'var(--gold)' },
                    { label: '60–80%', count: students.filter(s => (s.overall_accuracy || 0) >= 60 && (s.overall_accuracy || 0) < 80).length, color: 'var(--sacred-teal)' },
                    { label: 'Above 80%', count: students.filter(s => (s.overall_accuracy || 0) >= 80).length, color: '#22c55e' },
                  ].map(r => (
                    <div key={r.label} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.count} student{r.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="progress-bar-bg" style={{ height: 8 }}>
                        <div className="progress-bar-fill" style={{ width: `${totalStudents > 0 ? (r.count / totalStudents) * 100 : 0}%`, background: r.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-strong" style={{ padding: 24, borderRadius: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🧠 Pramana Breakdown</div>
                  {pramanaData.map(p => (
                    <div key={p.label} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.avg}%</span>
                      </div>
                      <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'var(--glass-bg-strong)', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${p.avg}%`, background: p.color, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-class breakdown */}
              {classes.length > 0 && (
                <div className="glass-strong" style={{ padding: 24, borderRadius: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📚 Class-wise Overview</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {classes.map(cls => (
                      <div key={cls.id} className="glass" style={{ padding: 16, borderRadius: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{cls.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-faded)', marginBottom: 8, textTransform: 'capitalize' }}>{cls.type}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: 'var(--sacred-teal)' }}>👥 {cls.student_count}</span>
                          <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 700 }}>{cls.class_code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
