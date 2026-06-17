'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SUBJECTS } from '@/lib/subjects';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const { streak, totalTimeSpent, quizResults, lessonHistory } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const stats = [
    { label: 'Subjects Available', value: '12+', icon: '📚', color: '#7c3aed' },
    { label: 'Interactive Modules', value: '30+', icon: '🎮', color: '#3b82f6' },
    { label: 'Learning Streak', value: `${streak} days`, icon: '🔥', color: '#f97316' },
    { label: 'Time Learned', value: `${totalTimeSpent}m`, icon: '⏱️', color: '#10b981' },
  ];

  const features = [
    { icon: '🤖', title: 'AI Tutor', desc: 'Gemini-powered explanations, examples & voice interaction', color: '#7c3aed' },
    { icon: '🌐', title: '3D Models', desc: 'Rotate, explore & interact with 3D educational models', color: '#3b82f6' },
    { icon: '🔬', title: 'Simulations', desc: 'Physics, chemistry & finance real-time experiments', color: '#06b6d4' },
    { icon: '📝', title: 'Smart Quizzes', desc: 'AI-generated quizzes with instant feedback & analytics', color: '#10b981' },
    { icon: '📄', title: 'PDF Learning', desc: 'Upload PDFs and get instant AI analysis & quizzes', color: '#f59e0b' },
    { icon: '📊', title: 'Progress Tracking', desc: 'Charts, achievements, badges & learning analytics', color: '#ec4899' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 100px', textAlign: 'center' }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-100px', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', top: '50px', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '40%', width: '600px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          {/* Grid */}
          <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
        </div>

        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: '32px', fontSize: '13px', color: '#a78bfa', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block', boxShadow: '0 0 8px #7c3aed' }} />
            AI-Powered Interactive Learning Platform
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, marginBottom: '24px', fontFamily: 'Outfit, sans-serif' }}>
            Learn Anything with{' '}
            <span className="gradient-text">AI & 3D</span>
            <br />Visualizations
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Master Biology, Physics, Chemistry, Math, CS and more through interactive 3D models, simulations, AI explanations, and personalized quizzes.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/subjects" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '16px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', boxShadow: '0 8px 32px rgba(124,58,237,0.4)', transition: 'all 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                🚀 Start Learning Free
              </button>
            </Link>
            <Link href="/explore/cell" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '16px 32px', borderRadius: '14px', cursor: 'pointer', fontWeight: 600, fontSize: '16px', background: 'rgba(255,255,255,0.05)', color: '#f0f4ff', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                🔬 Try 3D Cell Explorer
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginTop: '64px' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color, fontFamily: 'Outfit,sans-serif' }}>{mounted ? stat.value : '—'}</div>
                <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, fontFamily: 'Outfit,sans-serif', marginBottom: '16px' }}>
            Everything You Need to{' '}<span className="gradient-text">Master Any Subject</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '18px' }}>Powered by cutting-edge AI and immersive visualizations</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: '28px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${f.color}20`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f0f4ff' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subject Cards */}
      <section style={{ padding: '0 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, fontFamily: 'Outfit,sans-serif', marginBottom: '16px' }}>
            Explore <span className="gradient-text">12 Subjects</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>Click any subject to start your AI-powered learning journey</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px' }}>
          {SUBJECTS.map(subject => (
            <Link key={subject.id} href={`/workspace/${subject.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '24px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${subject.color}12`; e.currentTarget.style.borderColor = `${subject.color}40`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${subject.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{subject.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff', marginBottom: '6px' }}>{subject.name}</div>
                <div style={{ fontSize: '11px', color: '#4b5563' }}>{subject.topics.length} topics</div>
                <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '100px', background: `${subject.color}20`, color: subject.color, fontSize: '11px', fontWeight: 600 }}>
                  Explore →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px', background: 'rgba(124,58,237,0.05)', borderTop: '1px solid rgba(124,58,237,0.1)', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, fontFamily: 'Outfit,sans-serif', marginBottom: '20px' }}>
            Ready to Transform <span className="gradient-text">How You Learn?</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px', lineHeight: 1.7 }}>
            Join thousands of students mastering complex subjects through AI-powered interactive learning. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/subjects" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '16px 40px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', color: 'white', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
                🎓 Start Learning Now
              </button>
            </Link>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '16px 40px', borderRadius: '14px', cursor: 'pointer', fontWeight: 600, fontSize: '16px', background: 'transparent', color: '#f0f4ff', border: '1px solid rgba(255,255,255,0.15)' }}>
                📊 View Dashboard
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', color: '#4b5563', fontSize: '14px' }}>
        <p>🧠 LearnAI — AI-Powered Interactive Learning Platform</p>
        <p style={{ marginTop: '8px' }}>Built with Next.js, Three.js, Google Gemini AI & ❤️</p>
      </footer>
    </div>
  );
}
