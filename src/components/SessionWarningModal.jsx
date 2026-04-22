import React from 'react';

export default function SessionWarningModal({ timeRemainingMs, onExtend, onLogout }) {
  const seconds = Math.floor(timeRemainingMs / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeString = `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)'
    }}>
      <div className="glass-strong" style={{
        padding: '32px 40px', maxWidth: 420, width: '100%', textAlign: 'center',
        background: 'rgba(13,6,32,0.95)', border: '1px solid rgba(255,107,53,0.5)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,107,53,0.2)'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontFamily: "'Yatra One', cursive", fontSize: 24, marginBottom: 12, color: 'var(--saffron)' }}>
          Session Expiring Soon
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 24 }}>
          For your security, your session will automatically expire due to inactivity in:
          <strong style={{ display: 'block', fontSize: 32, color: 'white', margin: '12px 0' }}>{timeString}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <button className="btn-primary" onClick={onExtend} style={{ padding: '14px', width: '100%' }}>
            Stay Logged In
          </button>
          <button className="btn-outline" onClick={onLogout} style={{ padding: '14px', width: '100%' }}>
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
