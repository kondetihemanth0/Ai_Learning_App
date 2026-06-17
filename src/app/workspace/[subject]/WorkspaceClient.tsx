'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { askGemini, generateTopicContent, generateQuiz, RateLimitError, DailyQuotaError, getMockChatResponse, type QuizQuestion } from '@/lib/gemini';
import { SUBJECTS, getSubject } from '@/lib/subjects';
import Link from 'next/link';

interface Message { role: 'user' | 'ai'; content: string; timestamp: Date; }

export default function WorkspaceClient({ subjectId }: { subjectId: string }) {
  const subject = getSubject(subjectId) || SUBJECTS[0];
  const { addLesson, addTime } = useStore();
  // Always read apiKey fresh from store at call time to avoid stale closure
  // (Zustand persist rehydrates asynchronously from localStorage)
  const getApiKey = () => useStore.getState().apiKey;
  const getLevel = () => useStore.getState().learningLevel;
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `👋 Hello! I'm your AI tutor for **${subject.name}**. I can explain concepts, generate examples, answer questions, and create quizzes!\n\nTry asking me:\n- "Explain ${subject.topics[0]} in simple terms"\n- "Give me a real-world example"\n- "Create a quiz on ${subject.topics[1]}"\n- "What are the key concepts I should know?"`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [topicContent, setTopicContent] = useState<any>(null);
  const [topicInput, setTopicInput] = useState('');
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'topic' | 'quiz'>('chat');
  const [topicError, setTopicError] = useState<string | null>(null);

  const changeTab = (tab: 'chat' | 'topic' | 'quiz') => {
    setActiveTab(tab);
    setTopicError(null);
  };
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { addTime(1); addLesson({ subject: subject.name, topic: subject.topics[0], completed: false, timeSpent: 1, date: new Date().toISOString() }); }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setLoading(true);
    const currentKey = getApiKey() || process.env.NEXT_PUBLIC_DEFAULT_API_KEY || '';
    try {
      if (!currentKey) {
        setMessages(prev => [...prev, { role: 'ai', content: `🔑 **API Key / Host Required**\n\nPlease click the **Add API Key** button in the navbar to configure an AI provider.\n\n💡 **Tip:** You can get a completely free Llama 3 key from **Groq** at [console.groq.com](https://console.groq.com) or **Gemini** at [aistudio.google.com](https://aistudio.google.com). Alternatively, run local Llama with **Ollama** by typing \`ollama\`.`, timestamp: new Date() }]);
        setLoading(false);
        return;
      }
      const prompt = `Subject: ${subject.name}. Learning level: ${getLevel()}. Student question: ${userInput}`;
      const response = await askGemini(currentKey, prompt, `You are an expert ${subject.name} tutor. Give clear, engaging, educational responses. Use emojis sparingly. Format with markdown.`);
      setMessages(prev => [...prev, { role: 'ai', content: response, timestamp: new Date() }]);
      if (isSpeaking) speakText(response.replace(/[#*`]/g, '').substring(0, 500));
    } catch (err: any) {
      console.error('Gemini error:', err);
      const msg = err?.message || '';
      let errContent = '';
      let mockFallback = false;

      if (err instanceof DailyQuotaError || msg.includes('Daily free-tier') || msg.includes('GenerateRequestsPerDay') || msg.includes('insufficient_quota')) {
        errContent = `📅 **API Quota/Balance Exhausted** — The API key has run out of daily quota or has a $0.00 credit balance (common with expired OpenAI keys).\n\n💡 **Tip:** You can get a completely free key for **Groq (Llama 3)** at [console.groq.com](https://console.groq.com) or **Gemini** at [aistudio.google.com](https://aistudio.google.com). Stored locally. switching to **Offline Demo Mode**!`;
        mockFallback = true;
      } else if (err instanceof RateLimitError || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        const secs = err instanceof RateLimitError ? err.retryAfterSeconds : 60;
        errContent = `⏳ **Rate Limited** — Please wait **${secs} seconds** then try again.\n\nThis happens when too many requests are sent quickly on the free tier. Switching to **Offline Demo Mode** for this message!`;
        mockFallback = true;
        setRetryCountdown(secs);
        if (retryTimerRef.current) clearInterval(retryTimerRef.current);
        retryTimerRef.current = setInterval(() => {
          setRetryCountdown(prev => {
            if (prev <= 1) { clearInterval(retryTimerRef.current!); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        errContent = `🔑 **Invalid API Key** — Your key was rejected. Click the navbar button to update it. Switching to **Offline Demo Mode**!`;
        mockFallback = true;
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
        errContent = `🌐 **Network Error** — Check your internet connection. Switching to **Offline Demo Mode**!`;
        mockFallback = true;
      } else {
        errContent = `⚠️ **Error:** ${msg || 'Unknown error — check the browser console.'}`;
      }

      if (mockFallback) {
        const mockResponse = getMockChatResponse(subject.name, userInput, currentKey);
        setMessages(prev => [
          ...prev,
          { role: 'ai', content: errContent, timestamp: new Date() },
          { role: 'ai', content: mockResponse, timestamp: new Date() }
        ]);
        if (isSpeaking) speakText(mockResponse.replace(/[#*`]/g, '').substring(0, 500));
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: errContent, timestamp: new Date() }]);
      }
    }
    setLoading(false);
  };


  const loadTopic = async () => {
    if (!topicInput.trim()) return;
    setLoadingTopic(true);
    setTopicError(null);
    try {
      const currentKey = getApiKey();
      const currentLevel = getLevel();
      const content = await generateTopicContent(currentKey, topicInput, subject.name, currentLevel);
      setTopicContent(content);
      const quizData = await generateQuiz(currentKey, topicInput, subject.name, currentLevel);
      setQuiz(quizData);
      setQuizAnswers(new Array(quizData.length).fill(-1));
      setQuizSubmitted(false);
      addLesson({ subject: subject.name, topic: topicInput, completed: true, timeSpent: 5, date: new Date().toISOString() });
    } catch (err: any) {
      console.error('Error generating topic content:', err);
      const msg = err?.message || '';
      let errStr = '';
      if (err instanceof DailyQuotaError || msg.includes('Daily free-tier') || msg.includes('GenerateRequestsPerDay') || msg.includes('insufficient_quota')) {
        errStr = '📅 API Quota/Balance Exhausted — Your key is out of daily quota or has a $0.00 balance. Get a free Llama 3 key from Groq at console.groq.com or Gemini key at aistudio.google.com.';
      } else if (err instanceof RateLimitError || msg.includes('429') || msg.includes('quota')) {
        errStr = '⏳ Rate Limited — Too many requests. Wait a minute and try again.';
      } else if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        errStr = '🔑 Invalid API Key — Your key was rejected. Update it in the navbar.';
      } else {
        errStr = `⚠️ Error: ${msg || 'Failed to generate topic content. Try again.'}`;
      }
      setTopicError(errStr);
      setTopicContent({
        title: topicInput,
        summary: errStr,
        keyPoints: ['Failed to load content', 'Check your API key and quota', 'Make sure you are connected'],
        explanation: 'We encountered an error while generating learning materials for this topic. Please see the error message above for details and troubleshooting steps.',
        realWorldApplications: ['Troubleshoot API status in navbar'],
        funFact: 'Did you know? You can switch to a different Gemini API key by clicking the API Connection status in the top bar.',
        difficulty: getLevel()
      });
    }
    setLoadingTopic(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert('Voice not supported in this browser. Try Chrome.'); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
    setIsListening(true);
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceOutput = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
    else setIsSpeaking(true);
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    const score = quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.answer ? 1 : 0), 0);
    useStore.getState().addQuizResult({ subject: subject.name, topic: topicInput || subject.topics[0], score, total: quiz.length, date: new Date().toISOString() });
  };

  const TABS = [
    { id: 'chat', label: '🤖 AI Chat', icon: '🤖' },
    { id: 'topic', label: '📖 Learn Topic', icon: '📖' },
    { id: 'quiz', label: '📝 Quiz', icon: '📝' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${subject.color}20`, border: `1px solid ${subject.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{subject.icon}</div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f0f4ff', fontFamily: 'Outfit,sans-serif' }}>{subject.name} Workspace</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>AI Tutor • Interactive Learning • Quizzes</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {subject.modules.map(mod => (
              <Link key={mod.id} href={mod.path} style={{ textDecoration: 'none' }}>
                <button style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {mod.icon} {mod.title}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => changeTab(tab.id as any)} style={{
              padding: '12px 20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, background: 'transparent',
              color: activeTab === tab.id ? '#f0f4ff' : '#94a3b8',
              borderBottom: activeTab === tab.id ? `2px solid ${subject.color}` : '2px solid transparent',
              transition: 'all 0.2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '600px' }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user' ? `linear-gradient(135deg,${subject.color},${subject.color}cc)` : '#1a2234',
                      border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      fontSize: '14px', lineHeight: 1.7, color: '#f0f4ff',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.role === 'ai' && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', color: subject.color, fontWeight: 700 }}>{subject.icon} AI Tutor</div>}
                      {msg.content}
                    </div>
                    <span suppressHydrationWarning style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: '#1a2234', width: 'fit-content' }}>
                    <span style={{ color: subject.color, fontSize: '12px', fontWeight: 700 }}>{subject.icon} Thinking...</span>
                    {[0,1,2].map(i => <div key={i} className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject.color }} />)}
                  </div>
                )}
                {!loading && retryCountdown > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', width: 'fit-content' }}>
                    <span style={{ fontSize: '18px' }}>⏳</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>Rate limited — ready in {retryCountdown}s</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Free tier limit hit. You can send again when the timer reaches 0.</div>
                    </div>
                  </div>
                )}

                <div ref={messagesEnd} />
              </div>
              {/* Input */}
              <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`Ask anything about ${subject.name}...`}
                  rows={2}
                  className="input-field"
                  style={{ flex: 1, resize: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button onClick={startListening} title="Voice input" style={{ padding: '9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)', color: isListening ? '#ef4444' : '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>
                    {isListening ? '🔴' : '🎤'}
                  </button>
                  <button onClick={toggleVoiceOutput} title="Voice output" style={{ padding: '9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: isSpeaking ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)', color: isSpeaking ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>
                    {isSpeaking ? '🔊' : '🔈'}
                  </button>
                  <button onClick={sendMessage} disabled={loading || !input.trim() || retryCountdown > 0} style={{ padding: '9px 14px', borderRadius: '8px', border: 'none', background: retryCountdown > 0 ? 'rgba(245,158,11,0.3)' : `linear-gradient(135deg,${subject.color},${subject.color}cc)`, color: 'white', cursor: retryCountdown > 0 ? 'not-allowed' : 'pointer', fontSize: retryCountdown > 0 ? '11px' : '16px', fontWeight: 700, opacity: loading || !input.trim() || retryCountdown > 0 ? 0.7 : 1, minWidth: '44px' }}>
                    {retryCountdown > 0 ? `${retryCountdown}s` : '➤'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick prompts sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>💡 Quick Prompts</h3>
                {[
                  `Explain ${subject.topics[0]} simply`,
                  `Give a real-world example`,
                  `What are the key formulas?`,
                  `Create a practice problem`,
                  `Explain like I'm 10`,
                  `What should I study next?`,
                ].map((prompt, i) => (
                  <button key={i} onClick={() => { setInput(prompt); }} style={{ display: 'block', width: '100%', padding: '8px 10px', marginBottom: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${subject.color}15`; e.currentTarget.style.color = '#f0f4ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = '#94a3b8'; }}>
                    {prompt}
                  </button>
                ))}
              </div>
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>📚 Topics</h3>
                {subject.topics.map((topic, i) => (
                  <button key={i} onClick={() => setInput(`Explain ${topic}`)} style={{ display: 'block', width: '100%', padding: '7px 10px', marginBottom: '5px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', fontSize: '12px' }}
                    onMouseEnter={e => { e.currentTarget.style.color = subject.color; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; }}>
                    • {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Topic Tab */}
        {activeTab === 'topic' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input
                type="text"
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadTopic()}
                placeholder={`Enter a ${subject.name} topic (e.g. "${subject.topics[0]}")`}
                className="input-field"
                style={{ flex: 1 }}
              />
              <button onClick={loadTopic} disabled={loadingTopic || !topicInput.trim()} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, background: `linear-gradient(135deg,${subject.color},${subject.color}cc)`, color: 'white', opacity: loadingTopic || !topicInput.trim() ? 0.6 : 1, minWidth: '140px' }}>
                {loadingTopic ? '⏳ Generating...' : '🤖 Generate Content'}
              </button>
            </div>

            {/* Suggested Topics */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {subject.topics.map(topic => (
                <button key={topic} onClick={() => { setTopicInput(topic); }} style={{ padding: '5px 12px', borderRadius: '100px', border: `1px solid ${subject.color}30`, background: `${subject.color}10`, color: subject.color, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                  {topic}
                </button>
              ))}
            </div>

            {topicError && (
              <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                {topicError}
              </div>
            )}

            {topicContent && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
                {/* Main content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '32px' }}>{subject.icon}</span>
                      <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f0f4ff' }}>{topicContent.title}</h2>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '100px', background: `${subject.color}20`, color: subject.color }}>{topicContent.difficulty}</span>
                      </div>
                    </div>
                    <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '20px' }}>{topicContent.summary}</p>
                    <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', lineHeight: 1.8, fontSize: '14px' }}>{topicContent.explanation}</div>
                  </div>

                  {topicContent.realWorldApplications && (
                    <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '16px' }}>🌍 Real-World Applications</h3>
                      {topicContent.realWorldApplications.map((app: string, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${subject.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>✨</span>
                          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{app}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {topicContent.funFact && (
                    <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(249,115,22,0.08))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>💡 Fun Fact</h3>
                      <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{topicContent.funFact}</p>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4ff', marginBottom: '16px' }}>🎯 Key Points</h3>
                    {topicContent.keyPoints?.map((point: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: subject.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, flexShrink: 0, color: 'white' }}>{i + 1}</span>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>{point}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => changeTab('quiz')} style={{ padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, background: `linear-gradient(135deg,${subject.color},${subject.color}99)`, color: 'white', fontSize: '15px' }}>
                    📝 Take Quiz on This Topic
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {quiz.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>📝</div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>No Quiz Generated Yet</h2>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Go to the "Learn Topic" tab, enter a topic, and generate content to get a quiz.</p>
                <button onClick={() => setActiveTab('topic')} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${subject.color},${subject.color}cc)`, color: 'white', fontWeight: 700 }}>
                  Go to Learn Topic →
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f0f4ff' }}>Quiz: {topicInput}</h2>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>{quiz.length} questions • {subject.name}</p>
                  </div>
                  {quizSubmitted && (
                    <div style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
                        {quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.answer ? 1 : 0), 0)}/{quiz.length}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Score</div>
                    </div>
                  )}
                </div>

                {quiz.map((q, qi) => (
                  <div key={qi} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${subject.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: subject.color, flexShrink: 0 }}>{qi + 1}</span>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#f0f4ff', lineHeight: 1.5 }}>{q.question}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, oi) => {
                        let bg = 'rgba(255,255,255,0.03)';
                        let border = 'rgba(255,255,255,0.06)';
                        let color = '#94a3b8';
                        if (quizAnswers[qi] === oi) { border = subject.color; color = '#f0f4ff'; bg = `${subject.color}15`; }
                        if (quizSubmitted && oi === q.answer) { bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; color = '#10b981'; }
                        if (quizSubmitted && quizAnswers[qi] === oi && oi !== q.answer) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#ef4444'; }
                        return (
                          <button key={oi} onClick={() => { if (!quizSubmitted) { const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); } }}
                            style={{ padding: '12px 16px', borderRadius: '10px', border: `1px solid ${border}`, background: bg, color, cursor: quizSubmitted ? 'default' : 'pointer', textAlign: 'left', fontSize: '14px', transition: 'all 0.2s' }}>
                            <span style={{ fontWeight: 700, marginRight: '8px' }}>{String.fromCharCode(65 + oi)}.</span> {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', color: '#94a3b8' }}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button onClick={submitQuiz} disabled={quizAnswers.includes(-1)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px', background: `linear-gradient(135deg,${subject.color},${subject.color}cc)`, color: 'white', opacity: quizAnswers.includes(-1) ? 0.5 : 1 }}>
                    Submit Quiz
                  </button>
                ) : (
                  <button onClick={() => { setQuiz([]); setQuizAnswers([]); setQuizSubmitted(false); setTopicInput(''); changeTab('topic'); }} style={{ width: '100%', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '16px', background: 'rgba(255,255,255,0.05)', color: '#f0f4ff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🔄 Try Another Topic
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
