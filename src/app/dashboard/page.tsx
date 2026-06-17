'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { SUBJECTS } from '@/lib/subjects';
import Link from 'next/link';

export default function DashboardPage() {
  const { quizResults, lessonHistory, achievements, totalTimeSpent, streak, updateStreak } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateStreak();
  }, []);

  if (!mounted) return null;

  // Compute stats
  const totalQuizzes = quizResults.length;
  const avgScore = totalQuizzes > 0 ? Math.round(quizResults.reduce((a, r) => a + (r.score / r.total) * 100, 0) / totalQuizzes) : 0;
  const completedLessons = lessonHistory.filter(l => l.completed).length;
  const subjectProgress: Record<string, { done: number; total: number; scores: number[] }> = {};
  SUBJECTS.forEach(s => { subjectProgress[s.id] = { done: 0, total: s.modules.length, scores: [] }; });
  lessonHistory.forEach(l => {
    const key = SUBJECTS.find(s => s.name === l.subject)?.id || '';
    if (key && subjectProgress[key]) subjectProgress[key].done++;
  });
  quizResults.forEach(r => {
    const key = SUBJECTS.find(s => s.name === r.subject)?.id || '';
    if (key && subjectProgress[key]) subjectProgress[key].scores.push((r.score / r.total) * 100);
  });

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const recentResults = [...quizResults].reverse().slice(0, 5);

  const statCards = [
    { label: 'Learning Streak', value: `${streak} days`, icon: '🔥', color: '#f97316', sub: 'Keep it up!' },
    { label: 'Total Time', value: `${totalTimeSpent} min`, icon: '⏱️', color: '#06b6d4', sub: `${Math.round(totalTimeSpent / 60 * 10) / 10}h total` },
    { label: 'Quizzes Done', value: totalQuizzes, icon: '📝', color: '#8b5cf6', sub: `Avg score ${avgScore}%` },
    { label: 'Lessons Done', value: completedLessons, icon: '📚', color: '#10b981', sub: 'Keep exploring!' },
    { label: 'Achievements', value: `${unlockedAchievements.length}/${achievements.length}`, icon: '🏆', color: '#f59e0b', sub: 'Unlock more!' },
    { label: 'Avg Quiz Score', value: `${avgScore}%`, icon: '🎯', color: '#ec4899', sub: totalQuizzes === 0 ? 'Take a quiz!' : avgScore >= 80 ? 'Excellent!' : 'Keep practicing!' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
              📊 <span className="gradient-text">Learning Dashboard</span>
            </h1>
            <p style={{ color: '#94a3b8' }}>Track your progress, achievements, and learning analytics.</p>
          </div>
          <Link href="/subjects" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
              + Start Learning
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px', marginBottom: '32px' }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}40`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: s.color, fontFamily: 'Outfit,sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#f0f4ff', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Subject Progress */}
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '20px' }}>📚 Subject Progress</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SUBJECTS.slice(0, 8).map(subject => {
                const prog = subjectProgress[subject.id];
                const pct = prog ? Math.round((prog.done / Math.max(prog.total, 1)) * 100) : 0;
                const avgSubScore = prog?.scores.length ? Math.round(prog.scores.reduce((a, b) => a + b, 0) / prog.scores.length) : 0;
                return (
                  <Link key={subject.id} href={`/workspace/${subject.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{subject.icon}</span>
                          <span style={{ fontSize: '13px', color: '#f0f4ff', fontWeight: 500 }}>{subject.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {avgSubScore > 0 && <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>{avgSubScore}%</span>}
                          <span style={{ fontSize: '11px', color: subject.color, fontWeight: 700 }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.max(pct, 2)}%`, borderRadius: '3px', background: `linear-gradient(90deg,${subject.color},${subject.color}aa)`, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Quiz Results */}
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '20px' }}>📝 Recent Quiz Results</h2>
            {recentResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No quizzes taken yet.</p>
                <Link href="/subjects" style={{ textDecoration: 'none' }}>
                  <button style={{ marginTop: '12px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Start a Quiz</button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentResults.map((r, i) => {
                  const pct = Math.round((r.score / r.total) * 100);
                  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color, fontSize: '14px', flexShrink: 0 }}>{pct}%</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4ff' }}>{r.topic}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.subject} • {r.score}/{r.total} correct</div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#4b5563' }}>{new Date(r.date).toLocaleDateString()}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '20px' }}>🏆 Achievements</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '12px' }}>
            {achievements.map(achievement => (
              <div key={achievement.id} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${achievement.unlocked ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`, background: achievement.unlocked ? 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(249,115,22,0.05))' : 'rgba(255,255,255,0.01)', opacity: achievement.unlocked ? 1 : 0.5, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '28px', filter: achievement.unlocked ? 'none' : 'grayscale(1)' }}>{achievement.icon}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: achievement.unlocked ? '#f0f4ff' : '#4b5563' }}>{achievement.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>{achievement.description}</div>
                    {achievement.unlocked && achievement.date && (
                      <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px' }}>✓ {new Date(achievement.date).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '16px' }}>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
            {[
              { href: '/explore/cell', label: '🔬 Cell Explorer', color: '#10b981' },
              { href: '/explore/periodic-table', label: '⚗️ Periodic Table', color: '#f59e0b' },
              { href: '/simulate/physics', label: '⚡ Physics Lab', color: '#3b82f6' },
              { href: '/simulate/math', label: '🔢 Math Tutor', color: '#8b5cf6' },
              { href: '/explore/data-structures', label: '💻 Data Structures', color: '#06b6d4' },
              { href: '/explore/solar-system', label: '🪐 Solar System', color: '#f97316' },
              { href: '/upload', label: '📄 Upload PDF', color: '#ec4899' },
              { href: '/subjects', label: '📚 All Subjects', color: '#94a3b8' },
            ].map(action => (
              <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px', borderRadius: '12px', border: `1px solid ${action.color}20`, background: `${action.color}08`, cursor: 'pointer', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: action.color, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${action.color}18`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${action.color}08`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  {action.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
