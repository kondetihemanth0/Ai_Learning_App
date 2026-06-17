'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';

interface Props { onClose: () => void; }

const PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    badge: '⚡ Recommended · Free',
    badgeColor: '#10b981',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)',
    prefix: 'gsk_',
    placeholder: 'gsk_xxxxxxxxxxxxxxxxxxxx',
    url: 'https://console.groq.com/keys',
    urlLabel: 'console.groq.com/keys',
    model: 'Llama 3.3 70B',
    description: 'Fastest free LLM API. No credit card needed. 14,400 requests/day.',
    steps: ['Go to console.groq.com', 'Sign up for free', 'Click "Create API Key"', 'Paste key below'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    badge: 'Free',
    badgeColor: '#a78bfa',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    prefix: 'AIzaSy',
    placeholder: 'AIzaSy...',
    url: 'https://aistudio.google.com/app/apikey',
    urlLabel: 'aistudio.google.com',
    model: 'Gemini 2.0 Flash',
    description: 'Google\'s free AI. Daily quota resets at midnight.',
    steps: ['Go to AI Studio', 'Sign in with Google', 'Click "Get API key"', 'Paste key below'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'Free Models',
    badgeColor: '#f59e0b',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    prefix: 'sk-or-',
    placeholder: 'sk-or-xxxx...',
    url: 'https://openrouter.ai/keys',
    urlLabel: 'openrouter.ai/keys',
    model: 'Llama 3.1 405B',
    description: 'Access 100+ models. Free tier available with meta-llama/llama-3.1-405b.',
    steps: ['Go to openrouter.ai', 'Create account', 'Generate API key', 'Paste key below'],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    badge: 'Local · Offline',
    badgeColor: '#ec4899',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.25)',
    prefix: 'ollama',
    placeholder: 'ollama',
    url: 'https://ollama.com',
    urlLabel: 'ollama.com',
    model: 'llama3.2',
    description: 'Run AI models locally. Completely private, no internet needed.',
    steps: ['Download Ollama', 'Run "ollama serve"', 'Pull a model (e.g. ollama pull llama3.2)', 'Type "ollama" below'],
  },
];

export default function APIKeyModal({ onClose }: Props) {
  const { apiKey, setApiKey, learningLevel, setLearningLevel } = useStore();
  const [key, setKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeProvider, setActiveProvider] = useState(0); // Groq selected by default

  const provider = PROVIDERS[activeProvider];

  const detectProvider = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.startsWith('gsk_')) setActiveProvider(0);
    else if (trimmed.startsWith('AIzaSy')) setActiveProvider(1);
    else if (trimmed.startsWith('sk-or-')) setActiveProvider(2);
    else if (trimmed.toLowerCase() === 'ollama' || trimmed.startsWith('http://localhost')) setActiveProvider(3);
  };

  const handleSave = () => {
    setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const handleKeyChange = (val: string) => {
    setKey(val);
    detectProvider(val);
  };

  const isValidKey = () => {
    const k = key.trim();
    if (activeProvider === 0) return k.startsWith('gsk_') && k.length > 10;
    if (activeProvider === 1) return k.startsWith('AIzaSy') && k.length > 10;
    if (activeProvider === 2) return k.startsWith('sk-or-') && k.length > 10;
    if (activeProvider === 3) return k.toLowerCase() === 'ollama' || k.startsWith('http://');
    return k.length > 5;
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#0f172a', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '24px', padding: '0', width: '100%', maxWidth: '520px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.06))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f0f4ff', marginBottom: '4px', fontFamily: 'Outfit,sans-serif' }}>⚙️ AI Provider Settings</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Connect a free AI provider to power your learning</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Provider tabs */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Choose Provider</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {PROVIDERS.map((p, i) => (
                <button key={p.id} onClick={() => setActiveProvider(i)} style={{
                  padding: '10px 6px', borderRadius: '12px', border: `1.5px solid ${activeProvider === i ? p.color + '60' : 'rgba(255,255,255,0.06)'}`,
                  background: activeProvider === i ? p.bg : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: activeProvider === i ? p.color : '#64748b', fontFamily: 'Outfit,sans-serif' }}>{p.name}</div>
                  <div style={{ fontSize: '9px', color: activeProvider === i ? p.color + 'bb' : '#374151', marginTop: '2px', fontWeight: 600 }}>{p.badge.split('·')[0].trim()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active provider card */}
          <div style={{ background: provider.bg, border: `1.5px solid ${provider.border}`, borderRadius: '16px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span style={{ fontWeight: 800, color: provider.color, fontSize: '15px', fontFamily: 'Outfit,sans-serif' }}>{provider.name}</span>
                <span style={{ marginLeft: '8px', background: provider.color + '22', color: provider.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{provider.badge}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '8px' }}>Model: {provider.model}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.5 }}>{provider.description}</p>
            
            {/* Steps */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {provider.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.25)', padding: '4px 9px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: provider.color + '30', color: provider.color, fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{step}</span>
                </div>
              ))}
            </div>
            
            <a href={provider.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: provider.color, textDecoration: 'none', fontWeight: 600 }}>
              🔗 {provider.urlLabel} ↗
            </a>
          </div>

          {/* Key input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔑 Paste Your API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder={provider.placeholder}
                autoComplete="off"
                style={{ width: '100%', padding: '13px 48px 13px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${key && isValidKey() ? provider.color + '60' : 'rgba(255,255,255,0.1)'}`, color: '#f0f4ff', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}
              />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {key && (
                  <span style={{ fontSize: '12px' }}>
                    {isValidKey() ? '✅' : '⚠️'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
            {key && !isValidKey() && (
              <p style={{ fontSize: '11px', color: '#f59e0b', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⚠️ Key format looks incorrect. {provider.name} keys start with <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>{provider.prefix}</code>
              </p>
            )}
            <p style={{ fontSize: '11px', color: '#374151', margin: '6px 0 0' }}>Stored only in your browser — never sent to our servers.</p>
          </div>

          {/* Learning level */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎓 Learning Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(['beginner', 'intermediate', 'expert'] as const).map(level => (
                <button key={level} onClick={() => setLearningLevel(level)} style={{
                  padding: '12px 8px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                  background: learningLevel === level ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.03)',
                  color: learningLevel === level ? '#fff' : '#64748b',
                  border: learningLevel === level ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{level === 'beginner' ? '🌱' : level === 'intermediate' ? '🔥' : '⚡'}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', fontFamily: 'Outfit,sans-serif' }}>{level}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button onClick={handleSave} style={{
            width: '100%', padding: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '15px',
            background: saved ? 'linear-gradient(135deg,#10b981,#06b6d4)' : `linear-gradient(135deg,${provider.color},#7c3aed)`,
            color: 'white', transition: 'all 0.3s', fontFamily: 'Outfit,sans-serif',
            boxShadow: saved ? '0 8px 24px rgba(16,185,129,0.3)' : `0 8px 24px ${provider.color}33`,
          }}>
            {saved ? '✅ Saved! Starting...' : `💾 Save & Use ${provider.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}
