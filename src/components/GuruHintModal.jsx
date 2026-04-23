import React from 'react';

export default function GuruHintModal({ hint, guruHint, onClose }) {
  if (!hint && !guruHint) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="glass-strong" style={{ padding: 32, borderRadius: 20, maxWidth: 400, width: '90%', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 60, background: 'linear-gradient(to right, var(--saffron), var(--gold))', opacity: 0.2 }}></div>
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 32, opacity: 0.1 }}>🕉️</div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          {/* Guru Avatar (Emoji-based or SVG-based) */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: 'var(--midnight)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
            border: '2px solid var(--saffron)',
            marginBottom: 20, boxShadow: '0 4px 15px rgba(255, 153, 51, 0.3)'
          }}>
            🧘🏽‍♂️
          </div>

          <h3 style={{ color: 'var(--saffron)', marginBottom: 8 }}>The Guru Says...</h3>
          
          <div style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic', color: 'var(--text-bright)' }}>
            "{guruHint || hint}"
          </div>

          <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
