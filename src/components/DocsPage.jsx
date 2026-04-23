import React from 'react';

export default function DocsPage({ setPage }) {
  return (
    <div className="game-page" style={{ padding: '80px 20px 40px', justifyContent: 'flex-start', overflowY: 'auto' }}>
      <div className="glass-strong" style={{ maxWidth: 800, margin: '0 auto', width: '100%', padding: 40, borderRadius: 20 }}>
        <h1 style={{ color: 'var(--saffron)', marginBottom: 32, textAlign: 'center', lineHeight: 1.3 }}>
          NyayaPramana Platform Documentation
        </h1>
        
        <div style={{ lineHeight: 1.8, color: 'var(--text-bright)', fontSize: 16 }}>
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ color: 'var(--gold)', marginBottom: 16, marginTop: 32, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, lineHeight: 1.4 }}>
              1. Introduction
            </h2>
            <p>
              Welcome to the NyayaPramana learning platform! NyayaPramana is a serious games platform designed to teach the ancient Indian philosophical (IKS) system of epistemology — specifically the four valid means of knowledge (Pramanas): <strong>Pratyaksa, Anumana, Upamana, and Sabda</strong>.
            </p>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ color: 'var(--gold)', marginBottom: 16, marginTop: 32, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, lineHeight: 1.4 }}>
              2. For Students
            </h2>
            <p>
              As a student, you will embark on a 10-level journey to master the Pramanas.
            </p>
            <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
              <li style={{ marginBottom: 8 }}><strong>Dashboard:</strong> View your cognitive skill breakdown and radar chart.</li>
              <li style={{ marginBottom: 8 }}><strong>Games:</strong> Play various minigames like Image Classifier and Syllogism Sequence.</li>
              <li style={{ marginBottom: 8 }}><strong>Hints:</strong> If stuck, you can consult the Guru for a hint, though it will cost you points.</li>
              <li style={{ marginBottom: 8 }}><strong>Reflections:</strong> After each level, take a moment to record your thoughts in the Reflection Journal.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ color: 'var(--gold)', marginBottom: 16, marginTop: 32, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, lineHeight: 1.4 }}>
              3. For Teachers
            </h2>
            <p>
              Educators have access to robust classroom management and analytics tools.
            </p>
            <ul style={{ paddingLeft: 24, margin: '12px 0' }}>
              <li style={{ marginBottom: 8 }}><strong>Create Classes:</strong> Generate custom class codes and invite students.</li>
              <li style={{ marginBottom: 8 }}><strong>Custom Games:</strong> Author custom question banks for your students.</li>
              <li style={{ marginBottom: 8 }}><strong>Analytics:</strong> Download PDF summary reports and CSV datasets for research.</li>
              <li style={{ marginBottom: 8 }}><strong>Approve Students:</strong> Manage the roster of students attempting to join your virtual classroom.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ color: 'var(--gold)', marginBottom: 16, marginTop: 32, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, lineHeight: 1.4 }}>
              4. The Framework
            </h2>
            <p>
              To learn deeply about the specific definitions of Pratyaksa, Anumana, Upamana, and Sabda, visit the <a href="#" onClick={(e) => { e.preventDefault(); if(setPage) setPage('framework'); }} style={{ color: 'var(--sacred-teal)' }}>IKS Framework Explorer</a> via the main navigation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
