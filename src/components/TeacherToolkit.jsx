export default function TeacherToolkit({ user }) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="welcome-text">✦ Educator Toolkit</div>
          <div className="dashboard-title">Resources & Materials</div>
          <div style={{ fontSize: 13, color: 'var(--text-faded)', marginTop: 4 }}>
            IKS frameworks, assessment instruments, and teaching aids
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {[
          { icon: '📋', title: 'IKS Framework Document', desc: 'Complete Nyaya Pramana to game mechanics mapping document with Pratyaksa, Anumana, and Sabda translations.', tag: 'PDF Download', color: 'var(--saffron)' },
          { icon: '📊', title: 'Pramana-Mechanics Chart', desc: 'Visual mapping of all three Pramanas to cognitive outcomes, game mechanics, and learning indicators.', tag: 'Interactive', color: 'var(--gold)' },
          { icon: '📝', title: 'Assessment Instruments', desc: 'Pre-test and post-test cognitive assessment instruments validated against Nyaya epistemological framework.', tag: 'Printable', color: 'var(--sacred-teal)' },
          { icon: '🗂', title: 'Lesson Integration Guide', desc: 'Step-by-step guide for integrating Nyaya game into existing curriculum aligned with NEP 2020 objectives.', tag: 'Educator Guide', color: 'var(--lotus-pink)' },
          { icon: '📈', title: 'Evaluation Rubrics', desc: 'Standardized rubrics for assessing student cognitive growth across observation, inference, and testimony skills.', tag: 'Rubrics', color: 'var(--saffron)' },
          { icon: '🌐', title: 'Public Release Package', desc: 'User manual, deployment guide, and maintenance documentation for institutional adoption and scaling.', tag: 'Documentation', color: 'var(--gold)' },
        ].map(tool => (
          <div key={tool.title} className="glass-strong" style={{ padding: 24, borderRadius: 20, transition: 'transform 0.3s', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{tool.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{tool.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{tool.desc}</div>
            <span className="pramana-tag" style={{ background: `rgba(${tool.color === 'var(--saffron)' ? '255,107,53' : tool.color === 'var(--gold)' ? '247,201,72' : tool.color === 'var(--sacred-teal)' ? '10,191,188' : '232,113,154'},0.15)`, color: tool.color, border: `1px solid ${tool.color}40`, marginBottom: 16, display: 'inline-block' }}>
              {tool.tag}
            </span>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn-primary" style={{ flex: 1, padding: '8px 0', fontSize: 12 }} onClick={() => alert('Download Started')}>Download</button>
              <button className="btn-outline" style={{ flex: 1, padding: '8px 0', fontSize: 12 }} onClick={() => alert('Link Copied')}>Copy Link</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
