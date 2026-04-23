import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { QUESTIONS } from '../data/questions.js';

function getTestQuestions() {
  // Take 5 questions from each pramana (level 1-3)
  const pList = [...QUESTIONS.pratyaksa[1], ...QUESTIONS.pratyaksa[2], ...QUESTIONS.pratyaksa[3]].slice(0, 5);
  const aList = [...QUESTIONS.anumana[1], ...QUESTIONS.anumana[2], ...QUESTIONS.anumana[3]].slice(0, 5);
  const sList = [...QUESTIONS.sabda[1], ...QUESTIONS.sabda[2], ...QUESTIONS.sabda[3]].slice(0, 5);
  
  return [...pList, ...aList, ...sList];
}

export default function PrePostTest({ user, type = 'pre', onComplete }) {
  const [questions] = useState(getTestQuestions());
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState({ pratyaksa: 0, anumana: 0, sabda: 0 });
  const [responses, setResponses] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const currentQ = questions[qIndex];

  async function handleAnswer(selectedIdx) {
    const isCorrect = selectedIdx === currentQ.answer;
    
    setScores(prev => ({
      ...prev,
      [currentQ.pramana]: prev[currentQ.pramana] + (isCorrect ? 1 : 0)
    }));

    setResponses(prev => [
      ...prev,
      { questionId: currentQ.id, pramana: currentQ.pramana, isCorrect }
    ]);

    if (qIndex + 1 < questions.length) {
      setQIndex(i => i + 1);
    } else {
      await finishTest(isCorrect);
    }
  }

  async function finishTest(lastWasCorrect) {
    setSubmitting(true);
    
    // Calculate final scores
    const finalScores = { ...scores };
    finalScores[currentQ.pramana] += (lastWasCorrect ? 1 : 0);
    
    const finalResponses = [
      ...responses,
      { questionId: currentQ.id, pramana: currentQ.pramana, isCorrect: lastWasCorrect }
    ];

    const totalScore = finalScores.pratyaksa + finalScores.anumana + finalScores.sabda;

    try {
      await api.savePrePostTest({
        testType: type,
        score: totalScore,
        pramanaBreakdown: finalScores,
        responses: finalResponses
      });
      if (onComplete) onComplete({ score: totalScore, breakdown: finalScores, type });
    } catch (e) {
      console.error(e);
      // Even if offline fails, complete it locally to not block user
      if (onComplete) onComplete({ score: totalScore, breakdown: finalScores, type });
    }
  }

  if (submitting) {
    return (
      <div className="glass-strong" style={{ padding: 40, textAlign: 'center', maxWidth: 600, margin: '100px auto' }}>
        <h2>Saving Test Results...</h2>
      </div>
    );
  }

  return (
    <div className="game-page" style={{ justifyContent: 'center', paddingTop: 60 }}>
      <div className="glass-strong" style={{ padding: 40, maxWidth: 600, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ color: 'var(--saffron)' }}>
            {type === 'pre' ? 'Initial Knowledge Check' : 'Final Assessment'}
          </h2>
          <div style={{ color: 'var(--text-faded)', fontSize: 14 }}>
            Question {qIndex + 1} of {questions.length}
          </div>
        </div>

        <div style={{ marginBottom: 32, fontSize: 18, lineHeight: 1.5 }}>
          {currentQ.question}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentQ.options.map((opt, idx) => (
            <button 
              key={idx} 
              className="btn-outline" 
              style={{ padding: '16px', textAlign: 'left', display: 'block', width: '100%' }}
              onClick={() => handleAnswer(idx)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
