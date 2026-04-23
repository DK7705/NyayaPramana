import React, { useState } from 'react';

const FRAMEWORK_DATA = [
  {
    sanskrit: "प्रत्यक्ष (Pratyaksa)",
    english: "Direct Perception",
    color: "var(--saffron)",
    short: "Knowledge gained through the senses.",
    detail: "In Nyaya epistemology, Pratyaksa refers to the knowledge that arises from the contact of a sense organ with its corresponding object. It is considered the most fundamental and reliable source of knowledge. There are two stages: Nirvikalpa (raw, unnamed sensation) and Savikalpa (conceptualized perception)."
  },
  {
    sanskrit: "अनुमान (Anumana)",
    english: "Inference",
    color: "var(--gold)",
    short: "Knowledge through logical deduction.",
    detail: "Anumana is the process of deriving a conclusion from a known sign (Hetu). It requires the knowledge of invariable concomitance (Vyapti) between the sign and the inferred object. The classic example is inferring fire on a hill because there is smoke."
  },
  {
    sanskrit: "उपमान (Upamana)",
    english: "Comparison / Analogy",
    color: "#a78bfa",
    short: "Knowledge via comparative resemblance.",
    detail: "Upamana is learning the connection between a name and the object it denotes based on a given description of its similarity to a familiar object. For instance, knowing what a wild ox (gavaya) looks like because a forester told you it resembles a cow."
  },
  {
    sanskrit: "शब्द (Sabda)",
    english: "Verbal Testimony",
    color: "var(--sacred-teal)",
    short: "Knowledge from a reliable source or authority.",
    detail: "Sabda is defined as the statement of a trustworthy person (Apta) and consists in understanding its meaning. It plays a crucial role in acquiring knowledge about things we cannot directly perceive or infer, such as historical facts or spiritual truths."
  }
];

export default function FrameworkPage() {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <div className="game-page" style={{ padding: '80px 20px 40px', justifyContent: 'flex-start', overflowY: 'auto' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ color: 'var(--saffron)', marginBottom: 32, lineHeight: 1.3 }}>Nyaya Pramana Framework</h1>
          <p style={{ color: 'var(--text-faded)', fontSize: 18, lineHeight: 1.6 }}>
            According to the Nyaya school of Indian philosophy, valid knowledge (Prama) is attained through four reliable pathways or means (Pramanas). Explore the foundational pillars of this ancient epistemological system below.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FRAMEWORK_DATA.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx} 
                className="glass-strong"
                style={{
                  padding: 24,
                  borderRadius: 16,
                  borderLeft: `4px solid ${item.color}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 24, color: item.color, fontWeight: 'bold', marginBottom: 4 }}>
                      {item.sanskrit}
                    </div>
                    <div style={{ fontSize: 18, color: 'var(--text-bright)' }}>
                      {item.english}
                    </div>
                  </div>
                  <div style={{ fontSize: 24, opacity: 0.5, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    ▼
                  </div>
                </div>
                
                {isExpanded && (
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: 'var(--text-main)' }}>
                      {item.short}
                    </div>
                    <div style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-faded)' }}>
                      {item.detail}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
