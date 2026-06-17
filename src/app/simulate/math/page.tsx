'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { askGemini, generateQuiz, type QuizQuestion } from '@/lib/gemini';

export default function MathSimPage() {
  const { apiKey, learningLevel } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [equation, setEquation] = useState('x^2 - 4');
  const [expression, setExpression] = useState('x^2 - 4');
  const [aiSolution, setAiSolution] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'graph' | 'solver' | 'quiz'>('graph');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [zoom, setZoom] = useState(30);

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(99,102,241,0.1)';
    ctx.lineWidth = 1;
    for (let x = cx % zoom; x < W; x += zoom) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = cy % zoom; y < H; y += zoom) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#4b5563'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      ctx.fillText(i.toString(), cx + i * zoom, cy + 16);
      ctx.fillText((-i).toString(), cx - 10, cy - i * zoom + 4);
    }
    ctx.fillStyle = '#f0f4ff'; ctx.font = 'bold 12px monospace';
    ctx.fillText('x', W - 16, cy - 8);
    ctx.fillText('y', cx + 14, 16);

    // Plot function
    const evalFn = (xVal: number): number | null => {
      try {
        const expr = expression
          .replace(/\^/g, '**')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/abs\(/g, 'Math.abs(')
          .replace(/log\(/g, 'Math.log(')
          .replace(/pi/g, 'Math.PI')
          .replace(/e(?![a-z])/g, 'Math.E')
          .replace(/x/g, `(${xVal})`);
        const result = Function(`"use strict"; return (${expr})`)();
        return typeof result === 'number' && isFinite(result) ? result : null;
      } catch { return null; }
    };

    // Draw curves (multiple functions separated by ;)
    const fns = expression.split(';').filter(f => f.trim());
    const colors = ['#3b82f6', '#f97316', '#10b981', '#ec4899', '#f59e0b'];

    fns.forEach((fn, fi) => {
      const origExpr = expression;
      // Temporarily set single function
      const fnExpr = fn.trim();
      ctx.strokeStyle = colors[fi % colors.length];
      ctx.lineWidth = 2.5;
      ctx.shadowColor = colors[fi % colors.length]; ctx.shadowBlur = 6;
      ctx.beginPath();
      let started = false;

      for (let px = 0; px < W; px++) {
        const xVal = (px - cx) / zoom;
        try {
          const expr = fnExpr.replace(/\^/g, '**').replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/sqrt\(/g, 'Math.sqrt(').replace(/abs\(/g, 'Math.abs(').replace(/log\(/g, 'Math.log(').replace(/pi/g, 'Math.PI').replace(/e(?![a-z])/g, 'Math.E').replace(/x/g, `(${xVal})`);
          const yVal = Function(`"use strict"; return (${expr})`)();
          if (typeof yVal === 'number' && isFinite(yVal)) {
            const py = cy - yVal * zoom;
            if (!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
          } else started = false;
        } catch { started = false; }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Function label
      ctx.fillStyle = colors[fi % colors.length]; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`f${fi + 1}(x) = ${fnExpr}`, 12, 20 + fi * 20);
    });

    // X-intercepts (rough)
    ctx.fillStyle = '#ef4444';
    for (let px = 0; px < W - 1; px++) {
      const x1 = (px - cx) / zoom, x2 = (px + 1 - cx) / zoom;
      try {
        const fn = fns[0]?.replace(/\^/g, '**').replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/sqrt\(/g, 'Math.sqrt(').replace(/abs\(/g, 'Math.abs(').replace(/log\(/g, 'Math.log(').replace(/pi/g, 'Math.PI');
        const y1 = Function(`"use strict"; const x = ${x1}; return (${fn})`)();
        const y2 = Function(`"use strict"; const x = ${x2}; return (${fn})`)();
        if (typeof y1 === 'number' && typeof y2 === 'number' && isFinite(y1) && isFinite(y2) && y1 * y2 < 0) {
          ctx.beginPath(); ctx.arc(px + 0.5, cy, 5, 0, Math.PI * 2); ctx.fill();
        }
      } catch {}
    }
  }, [expression, zoom]);

  const plotGraph = () => { setExpression(equation); };

  const solveProblem = async () => {
    if (!problem.trim()) return;
    setLoadingAI(true);
    setSolution('');
    try {
      const resp = await askGemini(apiKey, `Solve this math problem step by step for a ${learningLevel} student:\n\n${problem}\n\nProvide: 1) Clear step-by-step solution 2) Final answer 3) Key concepts used`, 'You are a math tutor. Give clear numbered steps.');
      setSolution(resp);
    } catch {
      setSolution('⚠️ Add your Gemini API key (🔑 in navbar) to get AI-powered step-by-step solutions!\n\nExample solution would appear here with detailed steps.');
    }
    setLoadingAI(false);
  };

  const generateMathQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const q = await generateQuiz(apiKey, 'algebra and functions', 'Mathematics', learningLevel, 6);
      setQuiz(q);
      setQuizAnswers(new Array(q.length).fill(-1));
      setQuizSubmitted(false);
    } catch {
      setQuiz([]);
    }
    setLoadingQuiz(false);
  };

  const PRESET_FUNCTIONS = [
    { label: 'Quadratic', expr: 'x^2 - 4' },
    { label: 'Cubic', expr: 'x^3 - 3*x' },
    { label: 'Sine', expr: '3*sin(x)' },
    { label: 'Cosine', expr: '2*cos(x)' },
    { label: 'Parabola', expr: '-x^2 + 6' },
    { label: 'Abs', expr: 'abs(x) - 3' },
    { label: 'Exponential', expr: 'e^(x/3)' },
    { label: 'Combined', expr: 'sin(x);cos(x)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            🔢 <span className="gradient-text">AI Math Tutor</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Interactive graph plotter, AI step-by-step solver, and adaptive quizzes.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {[{ id: 'graph', label: '📈 Graph Plotter' }, { id: 'solver', label: '🤖 AI Solver' }, { id: 'quiz', label: '📝 Math Quiz' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid ${activeTab === tab.id ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`, background: activeTab === tab.id ? 'rgba(139,92,246,0.1)' : 'transparent', color: activeTab === tab.id ? '#a78bfa' : '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Graph Tab */}
        {activeTab === 'graph' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: '520px', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.2)', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                <button onClick={() => setZoom(z => Math.min(z + 10, 80))} style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4ff', cursor: 'pointer' }}>+</button>
                <button onClick={() => setZoom(z => Math.max(z - 10, 10))} style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4ff', cursor: 'pointer' }}>−</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#111827', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>f(x) = (use x, ^, sin, cos, pi)</label>
                <input value={equation} onChange={e => setEquation(e.target.value)} onKeyDown={e => e.key === 'Enter' && plotGraph()} className="input-field" placeholder="e.g. x^2 - 4" />
                <p style={{ fontSize: '11px', color: '#4b5563', marginTop: '6px' }}>Separate multiple functions with ;</p>
                <button onClick={plotGraph} style={{ width: '100%', marginTop: '10px', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                  📊 Plot Graph
                </button>
              </div>
              <div style={{ background: '#111827', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Preset Functions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {PRESET_FUNCTIONS.map(pf => (
                    <button key={pf.label} onClick={() => { setEquation(pf.expr); setExpression(pf.expr); }} style={{ padding: '7px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', cursor: 'pointer', fontSize: '11px', textAlign: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                      {pf.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '14px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', marginBottom: '10px' }}>🔴 Red dots = X-intercepts (zeros)</h3>
                <p style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.6 }}>Scroll to zoom in/out. Click + and − buttons to adjust scale.</p>
              </div>
            </div>
          </div>
        )}

        {/* Solver Tab */}
        {activeTab === 'solver' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4ff', marginBottom: '16px' }}>🤖 AI Step-by-Step Solver</h2>
              <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder="Enter any math problem...\n\nExamples:\n• Solve 2x² + 5x - 3 = 0\n• Find the derivative of f(x) = x³ + 2x² - 5x\n• Integrate ∫(3x² + 2x)dx\n• Find the area of a triangle with sides 3, 4, 5" rows={8} className="input-field" style={{ resize: 'none', marginBottom: '12px' }} />
              <button onClick={solveProblem} disabled={loadingAI || !problem.trim()} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', opacity: loadingAI || !problem.trim() ? 0.6 : 1 }}>
                {loadingAI ? '⏳ Solving...' : '🤖 Solve with AI'}
              </button>
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>Quick Problems:</h3>
                {['Solve x² - 5x + 6 = 0', 'Derivative of sin(x)·cos(x)', 'Sum of 1 to 100', 'Pythagorean theorem for sides 5, 12'].map(p => (
                  <button key={p} onClick={() => setProblem(p)} style={{ display: 'block', width: '100%', padding: '7px 10px', marginBottom: '5px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; }}>
                    • {p}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4ff', marginBottom: '16px' }}>📐 Solution</h2>
              {solution ? (
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.8, maxHeight: '460px', overflowY: 'auto' }}>{solution}</div>
              ) : loadingAI ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '16px' }}>
                  <div style={{ fontSize: '40px' }}>🤔</div>
                  <p style={{ color: '#94a3b8' }}>AI is solving your problem...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '16px' }}>
                  <div style={{ fontSize: '48px' }}>🧮</div>
                  <p style={{ color: '#94a3b8', textAlign: 'center' }}>Enter a problem and click "Solve with AI" to see detailed step-by-step solution</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {quiz.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>🧮</div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>Math Quiz</h2>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Generate an AI-powered adaptive math quiz.</p>
                <button onClick={generateMathQuiz} disabled={loadingQuiz} style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', opacity: loadingQuiz ? 0.6 : 1 }}>
                  {loadingQuiz ? '⏳ Generating...' : '🤖 Generate Math Quiz'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f0f4ff' }}>Mathematics Quiz</h2>
                  {quizSubmitted && (
                    <div style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{quiz.reduce((a, q, i) => a + (quizAnswers[i] === q.answer ? 1 : 0), 0)}/{quiz.length}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Score</div>
                    </div>
                  )}
                </div>
                {quiz.map((q, qi) => (
                  <div key={qi} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#a78bfa', flexShrink: 0, fontSize: '13px' }}>{qi + 1}</span>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff', lineHeight: 1.5 }}>{q.question}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {q.options.map((opt, oi) => {
                        let bg = 'rgba(255,255,255,0.02)', border = 'rgba(255,255,255,0.06)', color = '#94a3b8';
                        if (quizAnswers[qi] === oi) { border = '#8b5cf6'; color = '#f0f4ff'; bg = 'rgba(139,92,246,0.12)'; }
                        if (quizSubmitted && oi === q.answer) { bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; color = '#10b981'; }
                        if (quizSubmitted && quizAnswers[qi] === oi && oi !== q.answer) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#ef4444'; }
                        return (
                          <button key={oi} onClick={() => { if (!quizSubmitted) { const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); } }}
                            style={{ padding: '11px 14px', borderRadius: '9px', border: `1px solid ${border}`, background: bg, color, cursor: quizSubmitted ? 'default' : 'pointer', textAlign: 'left', fontSize: '13px', transition: 'all 0.2s' }}>
                            <span style={{ fontWeight: 700, marginRight: '8px' }}>{String.fromCharCode(65 + oi)}.</span> {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && <div style={{ marginTop: '10px', padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '12px', color: '#94a3b8' }}>💡 {q.explanation}</div>}
                  </div>
                ))}
                {!quizSubmitted ? (
                  <button onClick={() => { setQuizSubmitted(true); useStore.getState().addQuizResult({ subject: 'Mathematics', topic: 'Algebra', score: quiz.reduce((a, q, i) => a + (quizAnswers[i] === q.answer ? 1 : 0), 0), total: quiz.length, date: new Date().toISOString() }); }} disabled={quizAnswers.includes(-1)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', cursor: 'pointer', fontWeight: 700, opacity: quizAnswers.includes(-1) ? 0.5 : 1 }}>
                    Submit Quiz
                  </button>
                ) : (
                  <button onClick={() => { setQuiz([]); setQuizAnswers([]); setQuizSubmitted(false); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#f0f4ff', cursor: 'pointer', fontWeight: 700 }}>
                    🔄 New Quiz
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
