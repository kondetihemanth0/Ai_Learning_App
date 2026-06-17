'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SUBJECTS } from '@/lib/subjects';

export default function SubjectsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = SUBJECTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = [
    { label: 'All', value: null },
    { label: 'Science', value: 'science' },
    { label: 'Tech', value: 'tech' },
    { label: 'Humanities', value: 'humanities' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '16px' }}>
            Choose Your <span className="gradient-text">Learning Path</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '32px' }}>
            Explore 12 subjects with AI tutoring, 3D models, and interactive simulations
          </p>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search subjects, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '48px' }}
            />
          </div>
        </div>

        {/* Subject Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
          {filtered.map(subject => (
            <div key={subject.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ padding: '24px', background: `linear-gradient(135deg, ${subject.color}15, ${subject.color}08)`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '40px' }}>{subject.icon}</div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4ff' }}>{subject.name}</h3>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '100px', background: `${subject.color}20`, color: subject.color, fontWeight: 600 }}>
                      {subject.topics.length} topics
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>{subject.description}</p>
              </div>

              {/* Topics preview */}
              <div style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {subject.topics.slice(0, 4).map(topic => (
                    <span key={topic} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {topic}
                    </span>
                  ))}
                  {subject.topics.length > 4 && (
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#4b5563' }}>
                      +{subject.topics.length - 4} more
                    </span>
                  )}
                </div>

                {/* Modules */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  {subject.modules.slice(0, 2).map(mod => (
                    <Link key={mod.id} href={mod.path} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${subject.color}10`; e.currentTarget.style.borderColor = `${subject.color}30`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                        <span style={{ fontSize: '16px' }}>{mod.icon}</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4ff' }}>{mod.title}</div>
                          <div style={{ fontSize: '11px', color: '#4b5563' }}>{mod.type}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '12px', color: subject.color }}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link href={`/workspace/${subject.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <button style={{ width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: `${subject.color}20`, color: subject.color, border: `1px solid ${subject.color}30`, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${subject.color}30`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${subject.color}20`; }}>
                    🤖 Open AI Workspace →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
