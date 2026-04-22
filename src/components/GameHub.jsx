import React from 'react';

const GAMES = [
  { id: 'quiz', num: 1, name: "Pramana Quiz", sanskrit: "प्रमाण प्रश्नोत्तरी", desc: "Multi-level quiz on Pratyaksa, Anumana, Sabda.", xp: 150, time: "20 min", icon: "🧠", color: "var(--saffron)", tag: "Essential" },
  { id: 'classifier', num: 2, name: "Pramana Classifier", sanskrit: "प्रमाण वर्गीकरण", desc: "Rapid-fire scenarios — classify each as Pratyaksa, Anumana, or Sabda.", xp: 200, time: "10 min", icon: "⚡", color: "var(--sacred-teal)", tag: "Speed" },
  { id: 'syllogism', num: 3, name: "Syllogism Builder", sanskrit: "पञ्चावयव अनुमान", desc: "Build valid 5-membered syllogisms (Pratijna→Nigamana).", xp: 300, time: "25 min", icon: "🧩", color: "var(--gold)", tag: "Advanced" },
  { id: 'detective', num: 4, name: "Hetvabhasa Detective", sanskrit: "हेत्वाभास अन्वेषण", desc: "Identify fallacious reasoning (Hetvabhasa) in given arguments.", xp: 250, time: "15 min", icon: "🔍", color: "var(--lotus-pink)", tag: "Logic" },
  { id: 'vyapti', num: 5, name: "Vyapti Validator", sanskrit: "व्याप्ति निर्णय", desc: "Evaluate whether given universal concomitance statements are valid.", xp: 200, time: "10 min", icon: "⚖️", color: "var(--saffron)", tag: "Testing" },
  { id: 'authority', num: 6, name: "Sabda Authority", sanskrit: "शब्द प्रामाण्य", desc: "Determine if a testimony source qualifies as Aptha (reliable).", xp: 150, time: "10 min", icon: "📜", color: "var(--sacred-teal)", tag: "Ethics" },
  { id: 'perception', num: 7, name: "Perception Lab", sanskrit: "प्रत्यक्ष प्रयोग", desc: "Distinguish Nirvikalpa vs Savikalpa Pratyaksa.", xp: 250, time: "20 min", icon: "👁️", color: "var(--gold)", tag: "Analysis" },
  { id: 'chain', num: 8, name: "Inference Chain", sanskrit: "अनुमान शृङ्खला", desc: "Order the steps of an inference chain correctly.", xp: 200, time: "15 min", icon: "🔗", color: "var(--lotus-pink)", tag: "Sequence" },
  { id: 'debate', num: 9, name: "Debate Arena", sanskrit: "वाद विवाद", desc: "Defend/attack a thesis using Pramana principles.", xp: 300, time: "30 min", icon: "🗣️", color: "var(--saffron)", tag: "Mastery" },
  { id: 'blitz', num: 10, name: "Speed Pramana", sanskrit: "त्वरित प्रमाण", desc: "60-second blitz — classify as many scenarios as possible.", xp: 500, time: "1 min", icon: "⏱️", color: "var(--sacred-teal)", tag: "Challenge" },
];

export default function GameHub({ progress, onStartGame }) {
  const completedLevels = progress?.completedLevels || [];

  return (
    <div className="levels-section">
      <div className="section-title">🎮 Nyaya Game Hub</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {GAMES.map((game, idx) => {
          // All games are unlocked — play in any order
          const isUnlocked = true;
          const isCompleted = completedLevels.includes(game.num);
          
          return (
            <div key={game.id} 
              className={`level-card glass ${!isUnlocked ? 'level-card-locked' : isCompleted ? 'level-card-completed' : 'level-card-available'}`}
              onClick={() => isUnlocked && onStartGame(game.id, game.num)}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 0 }}
            >
              <div className="level-card-header" style={{ marginBottom: 16 }}>
                <div className="level-badge">
                  <div className="level-num" style={{ background: `rgba(${game.color.replace('var(--', '').replace(')', '')}, 0.2)`, border: `1px solid ${game.color}`, color: 'white' }}>
                    {!isUnlocked ? '🔒' : game.icon}
                  </div>
                  <div>
                    <div className="level-name" style={{ fontSize: 17 }}>{game.name}</div>
                    <div style={{ fontFamily: "'Tiro Devanagari Sanskrit', serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{game.sanskrit}</div>
                  </div>
                </div>
              </div>

              <div className="level-desc" style={{ flex: 1, fontSize: 14 }}>{game.desc}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="pramana-tag" style={{ background: `rgba(255,255,255,0.05)`, color: game.color, border: `1px solid ${game.color}40` }}>
                  {game.tag}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>+{game.xp} XP</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{game.time}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
