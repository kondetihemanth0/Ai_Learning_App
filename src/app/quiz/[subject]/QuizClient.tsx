'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { generateQuiz, RateLimitError, DailyQuotaError, type QuizQuestion } from '@/lib/gemini';
import { getSubject, SUBJECTS } from '@/lib/subjects';
import Link from 'next/link';

export default function QuizClient({ subjectId }: { subjectId: string }) {
  const subject = getSubject(subjectId) || SUBJECTS[0];
  const { apiKey, learningLevel, addQuizResult } = useStore();
  const [topic, setTopic] = useState(subject.topics[0]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [mode, setMode] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = await generateQuiz(apiKey, topic, subject.name, learningLevel, 10);
      setQuiz(q);
      setAnswers(new Array(q.length).fill(-1));
      setSubmitted(false);
      setCurrentQ(0);
      setMode('quiz');
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      const msg = err?.message || '';
      if (err instanceof DailyQuotaError || msg.includes('Daily free-tier') || msg.includes('GenerateRequestsPerDay') || msg.includes('insufficient_quota')) {
        setError('📅 API Quota/Balance Exhausted — Your key is out of daily quota or has a $0.00 balance. Get a free Llama 3 key from Groq at console.groq.com or Gemini key at aistudio.google.com.');
      } else if (err instanceof RateLimitError || msg.includes('429') || msg.includes('quota')) {
        setError('⏳ Rate Limited — Too many requests. Please wait a minute and try again.');
      } else if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        setError('🔑 Invalid API Key — Your key was rejected. Click the button in the navbar to update it.');
      } else {
        setError(`⚠️ Error: ${msg || 'Failed to generate quiz. Check the console.'}`);
      }
      setMode('setup');
    }
    setLoading(false);
  };

  const submitQuiz = () => {
    setSubmitted(true);
    const score = quiz.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    addQuizResult({ subject: subject.name, topic, score, total: quiz.length, date: new Date().toISOString() });
    setMode('results');
  };

  const score = quiz.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  const pct = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${subject.color}20`, border: `1px solid ${subject.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{subject.icon}</div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', color: '#f0f4ff' }}>{subject.name} Quiz</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>AI-generated adaptive quiz • Instant feedback</p>
          </div>
        </div>

        {/* Setup */}
        {mode === 'setup' && (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f4ff', marginBottom: '24px' }}>📝 Configure Your Quiz</h2>
            {error && (
              <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: subject.color, marginBottom: '10px' }}>Select Topic</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {subject.topics.map(t => (
                  <button key={t} onClick={() => setTopic(t)} style={{ padding: '8px 16px', borderRadius: '100px', border: `1px solid ${topic === t ? subject.color + '60' : 'rgba(255,255,255,0.06)'}`, background: topic === t ? subject.color + '15' : 'transparent', color: topic === t ? subject.color : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: topic === t ? 700 : 500, transition: 'all 0.2s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[{ icon: '📊', label: '10 Questions' }, { icon: '🤖', label: 'AI Generated' }, { icon: '⚡', label: 'Instant Feedback' }, { icon: '📈', label: 'Score Tracked' }].map(f => (
                  <div key={f.label} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>{f.icon}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={startQuiz} disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: `linear-gradient(135deg,${subject.color},${subject.color}aa)`, color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: '16px', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Generating Quiz...' : `🚀 Start ${topic} Quiz`}
            </button>
          </div>
        )}

        {/* Quiz (one at a time mode) */}
        {mode === 'quiz' && quiz.length > 0 && (
          <div>
            {/* Progress bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Question {currentQ + 1} of {quiz.length}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {quiz.map((_, i) => (
                  <div key={i} onClick={() => setCurrentQ(i)} style={{ width: '28px', height: '6px', borderRadius: '3px', cursor: 'pointer', background: i === currentQ ? subject.color : answers[i] !== -1 ? (answers[i] === quiz[i].answer ? '#10b981' : subject.color + '66') : 'rgba(255,255,255,0.1)', transition: 'all 0.2s' }} />
                ))}
              </div>
              <button onClick={() => setMode('setup')} style={{ padding: '5px 10px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>✕ Exit</button>
            </div>

            {/* Question card */}
            <div style={{ background: '#111827', border: `1px solid ${subject.color}20`, borderRadius: '20px', padding: '32px', marginBottom: '20px', minHeight: '400px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '28px' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${subject.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: subject.color, flexShrink: 0, fontSize: '15px' }}>{currentQ + 1}</span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', lineHeight: 1.5 }}>{quiz[currentQ].question}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quiz[currentQ].options.map((opt, oi) => (
                  <button key={oi} onClick={() => { const a = [...answers]; a[currentQ] = oi; setAnswers(a); }}
                    style={{ padding: '16px 20px', borderRadius: '12px', border: `2px solid ${answers[currentQ] === oi ? subject.color : 'rgba(255,255,255,0.06)'}`, background: answers[currentQ] === oi ? `${subject.color}15` : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', fontSize: '15px', color: answers[currentQ] === oi ? '#f0f4ff' : '#94a3b8', transition: 'all 0.2s', fontWeight: answers[currentQ] === oi ? 600 : 400 }}
                    onMouseEnter={e => { if (answers[currentQ] !== oi) { e.currentTarget.style.borderColor = `${subject.color}40`; e.currentTarget.style.background = `${subject.color}08`; } }}
                    onMouseLeave={e => { if (answers[currentQ] !== oi) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}>
                    <span style={{ fontWeight: 800, marginRight: '10px', color: subject.color }}>{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, opacity: currentQ === 0 ? 0.3 : 1 }}>
                ← Previous
              </button>
              {currentQ < quiz.length - 1 ? (
                <button onClick={() => setCurrentQ(q => q + 1)} style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg,${subject.color},${subject.color}aa)`, color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  Next →
                </button>
              ) : (
                <button onClick={submitQuiz} disabled={answers.includes(-1)} style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: 'white', cursor: 'pointer', fontWeight: 700, opacity: answers.includes(-1) ? 0.5 : 1 }}>
                  ✅ Submit Quiz
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {mode === 'results' && (
          <div>
            {/* Score card */}
            <div style={{ background: '#111827', border: `1px solid ${pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'}30`, borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>
                {pct >= 80 ? '🏆' : pct >= 60 ? '📈' : '📚'}
              </div>
              <div style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', color: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444', marginBottom: '8px' }}>{pct}%</div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f4ff', marginBottom: '8px' }}>
                {pct >= 80 ? 'Excellent! 🎉' : pct >= 60 ? 'Good Job! 👍' : 'Keep Practicing! 💪'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>{score} out of {quiz.length} correct</p>
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { setMode('setup'); setQuiz([]); }} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg,${subject.color},${subject.color}aa)`, color: 'white', cursor: 'pointer', fontWeight: 700 }}>🔄 New Quiz</button>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#f0f4ff', cursor: 'pointer', fontWeight: 600 }}>📊 Dashboard</button>
                </Link>
              </div>
            </div>

            {/* Answer Review */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '20px' }}>📋 Answer Review</h2>
              {quiz.map((q, qi) => {
                const correct = answers[qi] === q.answer;
                return (
                  <div key={qi} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, background: correct ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ fontSize: '16px' }}>{correct ? '✅' : '❌'}</span>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff', lineHeight: 1.5 }}>{q.question}</p>
                    </div>
                    {!correct && <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', fontSize: '13px', color: '#10b981', marginBottom: '8px' }}>
                      ✓ Correct: {q.options[q.answer]}
                    </div>}
                    <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '12px', color: '#94a3b8' }}>
                      💡 {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
