'use client';
import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { analyzePDF, generateQuiz, RateLimitError, DailyQuotaError, type QuizQuestion, type PDFAnalysis } from '@/lib/gemini';

export default function UploadPage() {
  const { apiKey } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysis, setAnalysis] = useState<PDFAnalysis | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'analysis' | 'quiz'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    if (!f.type.includes('pdf') && !f.type.includes('text') && !f.name.endsWith('.txt')) {
      alert('Please upload a PDF or text file');
      return;
    }
    setFile(f);
    setStep('preview');
    setError(null);
    // Read file as text
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string || '';
      setExtractedText(text.substring(0, 5000));
    };
    reader.readAsText(f);
  };

  const analyzeFile = async () => {
    if (!extractedText && !file) return;
    setLoading(true);
    setError(null);
    setProgress(20);

    let textToAnalyze = extractedText;
    if (!textToAnalyze && file) {
      textToAnalyze = `File: ${file.name}. This is a document about the topic indicated by the filename.`;
    }

    setProgress(50);
    try {
      const result = await analyzePDF(apiKey, textToAnalyze || `Document: ${file?.name}`);
      setAnalysis(result);
      setProgress(100);
      setStep('analysis');
    } catch (err: any) {
      console.error('PDF analysis error:', err);
      const msg = err?.message || '';
      if (err instanceof DailyQuotaError || msg.includes('Daily free-tier') || msg.includes('GenerateRequestsPerDay') || msg.includes('insufficient_quota')) {
        setError('📅 API Quota/Balance Exhausted — Your key is out of daily quota or has a $0.00 balance. Get a free Llama 3 key from Groq at console.groq.com or Gemini key at aistudio.google.com.');
      } else if (err instanceof RateLimitError || msg.includes('429') || msg.includes('quota')) {
        setError('⏳ Rate Limited — Too many requests. Please wait a minute and try again.');
      } else if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        setError('🔑 Invalid API Key — Your key was rejected. Update it in the navbar.');
      } else {
        setError(`⚠️ Error: ${msg || 'Analysis failed. Check your API key and connection.'}`);
      }
      setAnalysis({
        title: file?.name || 'Uploaded Document',
        subject: 'General',
        summary: 'Unable to analyze document due to API limits or configuration errors. Please check the error message above.',
        keyConceptsArray: ['Analysis failed'],
        learningObjectives: ['Check API key status'],
        difficulty: 'beginner',
        topics: ['Troubleshooting']
      });
      setProgress(100);
      setStep('analysis');
    }
    setLoading(false);
  };

  const generateQuizFromPDF = async () => {
    if (!analysis) return;
    setLoadingQuiz(true);
    setError(null);
    try {
      const q = await generateQuiz(apiKey, analysis.title, analysis.subject, analysis.difficulty, 8);
      setQuiz(q);
      setQuizAnswers(new Array(q.length).fill(-1));
      setQuizSubmitted(false);
      setStep('quiz');
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      const msg = err?.message || '';
      if (err instanceof DailyQuotaError || msg.includes('Daily free-tier') || msg.includes('GenerateRequestsPerDay') || msg.includes('insufficient_quota')) {
        setError('📅 API Quota/Balance Exhausted — Your key is out of daily quota or has a $0.00 balance. Get a free Llama 3 key from Groq at console.groq.com or Gemini key at aistudio.google.com.');
      } else if (err instanceof RateLimitError || msg.includes('429') || msg.includes('quota')) {
        setError('⏳ Rate Limited — Too many requests. Please wait a minute and try again.');
      } else if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        setError('🔑 Invalid API Key — Your key was rejected. Update it in the navbar.');
      } else {
        setError(`⚠️ Error: ${msg || 'Failed to generate quiz. Check the console.'}`);
      }
      setQuiz([]);
    }
    setLoadingQuiz(false);
  };

  const STEPS = [
    { id: 'upload', label: '📄 Upload', num: 1 },
    { id: 'preview', label: '👁️ Preview', num: 2 },
    { id: 'analysis', label: '🤖 Analysis', num: 3 },
    { id: 'quiz', label: '📝 Quiz', num: 4 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            📄 <span className="gradient-text">PDF Learning Assistant</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Upload any PDF or text document. AI will analyze it, extract concepts, and generate a custom quiz.</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '32px', alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { if (s.id === 'upload' || (s.id === 'preview' && file) || (s.id === 'analysis' && analysis) || (s.id === 'quiz' && quiz.length > 0)) { setStep(s.id as any); setError(null); } }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, background: step === s.id ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : STEPS.findIndex(ss => ss.id === step) > i ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', color: step === s.id ? 'white' : STEPS.findIndex(ss => ss.id === step) > i ? '#10b981' : '#4b5563', border: `1px solid ${step === s.id ? 'rgba(124,58,237,0.5)' : STEPS.findIndex(ss => ss.id === step) > i ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                  {STEPS.findIndex(ss => ss.id === step) > i ? '✓' : s.num}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: step === s.id ? '#f0f4ff' : '#94a3b8' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: '1px', background: STEPS.findIndex(ss => ss.id === step) > i ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)', margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${dragOver ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, borderRadius: '20px', padding: '80px 40px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.01)', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>📄</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>Drop your PDF or text file here</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Supports PDF, TXT files • Max 10MB</p>
            <button style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
              📁 Browse Files
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.text" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && file && (
          <div>
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📄</div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff' }}>{file.name}</h2>
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>{(file.size / 1024).toFixed(1)} KB • {file.type || 'document'}</p>
                </div>
                <button onClick={() => { setFile(null); setStep('upload'); setExtractedText(''); }} style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>
                  ✕ Remove
                </button>
              </div>

              {extractedText && (
                <div style={{ background: '#0d1117', borderRadius: '10px', padding: '16px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '8px', fontFamily: 'monospace' }}>PREVIEW (first 2000 chars):</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{extractedText.substring(0, 2000)}{extractedText.length > 2000 ? '...' : ''}</p>
                </div>
              )}

              <button onClick={analyzeFile} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
                {loading ? `🤖 Analyzing... ${progress}%` : '🤖 Analyze with AI'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Analysis */}
        {step === 'analysis' && analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '36px' }}>🤖</span>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f0f4ff' }}>{analysis.title}</h2>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '100px', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', fontSize: '11px', fontWeight: 600 }}>{analysis.subject}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '100px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>{analysis.difficulty}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', marginBottom: '8px' }}>📋 Summary</h3>
                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>{analysis.summary}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>🎯 Key Concepts</h3>
                  {analysis.keyConceptsArray.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0, marginTop: '6px' }} />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{c}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>📚 Learning Objectives</h3>
                  {analysis.learningObjectives.map((o, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#10b981', flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{o}</span>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.topics.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff', marginBottom: '10px' }}>🏷️ Topics Covered</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysis.topics.map(t => (
                      <span key={t} style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '12px' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={generateQuizFromPDF} disabled={loadingQuiz} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px', opacity: loadingQuiz ? 0.7 : 1 }}>
                {loadingQuiz ? '⏳ Generating Quiz...' : '📝 Generate Quiz from this Document'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Quiz */}
        {step === 'quiz' && quiz.length > 0 && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f0f4ff' }}>📝 Document Quiz</h2>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>Based on: {analysis?.title}</p>
              </div>
              {quizSubmitted && (
                <div style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{quiz.reduce((a, q, i) => a + (quizAnswers[i] === q.answer ? 1 : 0), 0)}/{quiz.length}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Score</div>
                </div>
              )}
            </div>

            {quiz.map((q, qi) => (
              <div key={qi} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#a78bfa', flexShrink: 0, fontSize: '12px' }}>{qi + 1}</span>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff', lineHeight: 1.5 }}>{q.question}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {q.options.map((opt, oi) => {
                    let bg = 'rgba(255,255,255,0.02)', border = 'rgba(255,255,255,0.06)', color = '#94a3b8';
                    if (quizAnswers[qi] === oi) { border = '#7c3aed'; color = '#f0f4ff'; bg = 'rgba(124,58,237,0.12)'; }
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
              <button onClick={() => setQuizSubmitted(true)} disabled={quizAnswers.includes(-1)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700, opacity: quizAnswers.includes(-1) ? 0.5 : 1 }}>
                Submit Quiz
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { setStep('upload'); setFile(null); setAnalysis(null); setQuiz([]); setExtractedText(''); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#f0f4ff', cursor: 'pointer', fontWeight: 700 }}>
                  📄 New Document
                </button>
                <button onClick={generateQuizFromPDF} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  🔄 New Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
