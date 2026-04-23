import React, { useState, useEffect, useRef } from 'react';
import { shuffle } from '../utils/shuffle.js';
import GuruHintModal from '../components/GuruHintModal.jsx';
import { api } from '../api.js';

const SYLLOGISMS = [
  {
    id: 1,
    steps: [
      { type: "Pratijna", text: "The hill has fire." },
      { type: "Hetu", text: "Because it has smoke." },
      { type: "Udaharana", text: "Whatever has smoke has fire, for example, an oven." },
      { type: "Upanaya", text: "This hill has smoke which is invariably associated with fire." },
      { type: "Nigamana", text: "Therefore, this hill has fire." }
    ]
  },
  {
    id: 2,
    steps: [
      { type: "Pratijna", text: "Sound is non-eternal." },
      { type: "Hetu", text: "Because it is produced." },
      { type: "Udaharana", text: "Whatever is produced is non-eternal, for example, a pot." },
      { type: "Upanaya", text: "Sound is such a produced thing." },
      { type: "Nigamana", text: "Therefore, sound is non-eternal." }
    ]
  },
  {
    id: 3,
    steps: [
      { type: "Pratijna", text: "This man is sick." },
      { type: "Hetu", text: "Because he has a high fever." },
      { type: "Udaharana", text: "Whoever has a high fever is sick, for example, the patient in bed 3." },
      { type: "Upanaya", text: "This man has a fever invariably associated with sickness." },
      { type: "Nigamana", text: "Therefore, this man is sick." }
    ]
  }
];



export default function SequenceGame({ gameType, level, user, onComplete, onExit }) {
  const [questions] = useState(() => shuffle(SYLLOGISMS).slice(0, 3));
  const [qIndex, setQIndex] = useState(0);
  const [scrambled, setScrambled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeStart] = useState(Date.now());
  const seqResultsRef = useRef([]);

  useEffect(() => {
    if (questions[qIndex]) {
      setupRound(questions[qIndex]);
    }
  }, [qIndex, questions]);

  function setupRound(q) {
    const mixed = shuffle(q.steps.map((step, idx) => ({ ...step, originalIndex: idx })));
    setScrambled(mixed);
    setSelected([]);
    setFeedback(null);
  }

  const handleSelect = (item) => {
    setScrambled(prev => prev.filter(x => x !== item));
    setSelected(prev => [...prev, item]);
  };

  const handleDeselect = (item) => {
    setSelected(prev => prev.filter(x => x !== item));
    setScrambled(prev => [...prev, item]);
  };

  const verifySequence = () => {
    let isCorrect = true;
    for (let i = 0; i < selected.length; i++) {
       if (selected[i].originalIndex !== i) {
          isCorrect = false;
          break;
       }
    }

    if (isCorrect) {
       setScore(s => s + 100);
       setCorrect(c => c + 1);
       seqResultsRef.current.push({ pramana: 'anumana', correct: true });
       setFeedback('correct');
    } else {
       seqResultsRef.current.push({ pramana: 'anumana', correct: false });
       setFeedback('wrong');
    }
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= questions.length) {
       const totalTime = Math.round((Date.now() - timeStart) / 1000);
       onComplete({
         score,
         accuracy: Math.round((correct / questions.length) * 100),
         correct,
         total: questions.length,
         hintsUsed: 0,
         time: totalTime,
         pramanaResults: seqResultsRef.current
       });
    } else {
       setQIndex(i => i + 1);
    }
  };

  const handleHint = async () => {
    setHintsUsed(h => h + 1);
    setShowGuruModal(true);
    setScore(s => Math.max(0, s - 10)); // penalty
    try {
      await api.logHint({
        gameMode: gameType,
        questionId: questions[qIndex].id.toString(),
        hintNumber: 1
      });
    } catch (e) {}
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="game-page">
      <div className="game-header">
         <div className="game-progress-info">
             <div className="game-level-badge" style={{ background: 'rgba(247,201,72,0.15)', color: 'var(--gold)', border: '1px solid rgba(247,201,72,0.35)' }}>
               {gameType === 'chain' ? 'INFERENCE CHAIN' : 'SYLLOGISM BUILDER'}
             </div>
             <div className="question-counter">
                Sequence {qIndex + 1} / {questions.length}
             </div>
         </div>
         <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="score-display">
               ✦ {score}
            </div>
            <button className="btn-outline" style={{ padding: '8px 16px', fontSize: 12 }} onClick={onExit}>✕ Exit</button>
         </div>
      </div>

      <div style={{ width: '100%', maxWidth: '780px' }}>
         <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20, textAlign: 'center', fontSize: 16 }}>
           Construct the correct 5-membered Nyaya syllogism by selecting the statements in order.
           <br/>
           <button className="btn-outline" onClick={handleHint} style={{ marginTop: 12, padding: '4px 12px', fontSize: 14 }}>
             🧘🏽‍♂️ Consult the Guru (−10 pts)
           </button>
         </div>

         {/* Sequence Area */}
         <div className="glass-strong" style={{ padding: 20, minHeight: 400, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
           <h3 style={{ marginBottom: 10, color: 'var(--gold)' }}>Your Syllogism Sequence</h3>
           {selected.map((item, idx) => (
             <div 
               key={idx} 
               onClick={() => !feedback && handleDeselect(item)}
               style={{
                 padding: 16,
                 background: feedback === 'correct' ? 'rgba(34,197,94,0.15)' : feedback === 'wrong' ? (item.originalIndex === idx ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.15)') : 'rgba(255,255,255,0.05)',
                 border: feedback === 'correct' ? '1px solid rgba(34,197,94,0.5)' : feedback === 'wrong' ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                 borderRadius: 8,
                 cursor: feedback ? 'default' : 'pointer',
                 display: 'flex', alignItems: 'center', gap: 16
               }}
             >
               <div style={{ width: 24, height: 24, background: 'var(--gold)', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                 {idx + 1}
               </div>
               <div style={{ flex: 1 }}>{item.text}</div>
               {!feedback && <div style={{ opacity: 0.5 }}>✕</div>}
             </div>
           ))}
           {selected.length === 0 && (
             <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: 20, textAlign: 'center' }}>
               Click items from the pool below to place them here.
             </div>
           )}
         </div>

         {/* Pool Area */}
         {!feedback && (
           <div className="glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
             <h3 style={{ marginBottom: 10, color: 'var(--text-main)' }}>Available Statements</h3>
             {scrambled.map((item, idx) => (
               <div 
                 key={idx} 
                 onClick={() => handleSelect(item)}
                 style={{
                   padding: 16,
                   background: 'rgba(10,191,188,0.1)',
                   border: '1px solid rgba(10,191,188,0.3)',
                   borderRadius: 8,
                   cursor: 'pointer',
                   display: 'flex', alignItems: 'center', gap: 16,
                   transition: 'transform 0.2s'
                 }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
               >
                 <div>{item.text}</div>
               </div>
             ))}
           </div>
         )}
      </div>

      <div style={{ marginTop: 24 }}>
        {selected.length === 5 && !feedback && (
           <button className="btn-primary" onClick={verifySequence} style={{ padding: '14px 40px', fontSize: 16 }}>Verify Sequence</button>
        )}
        {feedback && (
           <button className="btn-primary" onClick={nextQuestion} style={{ padding: '14px 40px', fontSize: 16 }}>
             {qIndex + 1 >= questions.length ? 'Finish Game' : 'Next Sequence →'}
           </button>
        )}
      </div>

      {showGuruModal && (
        <GuruHintModal 
          hint="The Nyaya order is: Hypothesis (Pratijna) -> Reason (Hetu) -> Example (Udaharana) -> Application (Upanaya) -> Conclusion (Nigamana)."
          guruHint="Consider, dear student... Establish the hypothesis first, state the reason, provide a universal example, tie it to the present case, and finalize your conclusion."
          onClose={() => setShowGuruModal(false)}
        />
      )}
    </div>
  );
}
