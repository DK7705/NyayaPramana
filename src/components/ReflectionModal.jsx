import React, { useState } from 'react';

export default function ReflectionModal({ onSave, onSkip }) {
  const [entry, setEntry] = useState('');

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="glass-strong" style={{ padding: 32, borderRadius: 20, maxWidth: 500, width: '90%', position: 'relative' }}>
        <h2 style={{ color: 'var(--gold)', marginBottom: 16 }}>Nyaya Reflection Journal</h2>
        <p style={{ color: 'var(--text-faded)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          Taking a moment to reflect deepens your understanding. What did you learn about the different Pramanas during this challenge? How did you apply your cognitive skills?
        </p>

        <textarea
          className="form-input"
          style={{ height: 120, resize: 'vertical', marginBottom: 20 }}
          placeholder="Write your reflections here..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn-outline" onClick={onSkip}>
            Skip for now
          </button>
          <button 
            className="btn-primary" 
            onClick={() => onSave(entry)}
            disabled={!entry.trim()}
          >
            Save Journal Entry
          </button>
        </div>
      </div>
    </div>
  );
}
