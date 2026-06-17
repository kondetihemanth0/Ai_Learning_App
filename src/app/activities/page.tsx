'use client';
import { useState } from 'react';

interface DragItem { id: string; label: string; category: string; emoji: string; }
interface DropZone { id: string; label: string; color: string; }

const ACTIVITIES = [
  {
    id: 'cell-match',
    title: 'Cell Organelle Matching',
    desc: 'Match each organelle to its function',
    subject: 'Biology',
    icon: '🔬',
    items: [
      { id: 'nucleus', label: 'Nucleus', category: 'control', emoji: '🔵' },
      { id: 'mitochondria', label: 'Mitochondria', category: 'energy', emoji: '🟡' },
      { id: 'ribosome', label: 'Ribosome', category: 'synthesis', emoji: '⚪' },
      { id: 'golgi', label: 'Golgi Apparatus', category: 'transport', emoji: '🟢' },
      { id: 'lysosome', label: 'Lysosome', category: 'digestion', emoji: '🔴' },
      { id: 'er', label: 'Endoplasmic Reticulum', category: 'synthesis', emoji: '🟠' },
    ] as DragItem[],
    zones: [
      { id: 'control', label: '🧠 Control Center', color: '#6366f1' },
      { id: 'energy', label: '⚡ Energy Production', color: '#f59e0b' },
      { id: 'synthesis', label: '🏭 Protein Synthesis', color: '#10b981' },
      { id: 'transport', label: '📦 Packaging & Transport', color: '#06b6d4' },
      { id: 'digestion', label: '♻️ Cellular Digestion', color: '#ef4444' },
    ] as DropZone[],
  },
  {
    id: 'element-sort',
    title: 'Element Classification',
    desc: 'Sort elements into their correct categories',
    subject: 'Chemistry',
    icon: '⚗️',
    items: [
      { id: 'h', label: 'H - Hydrogen', category: 'nonmetal', emoji: '🔵' },
      { id: 'na', label: 'Na - Sodium', category: 'metal', emoji: '🔴' },
      { id: 'si', label: 'Si - Silicon', category: 'metalloid', emoji: '🟢' },
      { id: 'fe', label: 'Fe - Iron', category: 'metal', emoji: '🟠' },
      { id: 'cl', label: 'Cl - Chlorine', category: 'nonmetal', emoji: '🟡' },
      { id: 'ge', label: 'Ge - Germanium', category: 'metalloid', emoji: '⚪' },
    ] as DragItem[],
    zones: [
      { id: 'metal', label: '🔩 Metals', color: '#f59e0b' },
      { id: 'nonmetal', label: '💨 Non-Metals', color: '#06b6d4' },
      { id: 'metalloid', label: '⚙️ Metalloids', color: '#10b981' },
    ] as DropZone[],
  },
];

export default function ActivitiesPage() {
  const [activityIdx, setActivityIdx] = useState(0);
  const [dropped, setDropped] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const activity = ACTIVITIES[activityIdx];

  const handleDragStart = (id: string) => setDragging(id);
  const handleDrop = (zoneId: string) => {
    if (!dragging) return;
    setDropped(prev => ({ ...prev, [dragging]: zoneId }));
    setDragging(null);
    setChecked(false);
  };

  const checkAnswers = () => {
    let correct = 0;
    activity.items.forEach(item => {
      if (dropped[item.id] === item.category) correct++;
    });
    setScore(correct);
    setChecked(true);
  };

  const reset = () => { setDropped({}); setChecked(false); setScore(0); setDragging(null); };

  const undropped = activity.items.filter(item => !dropped[item.id]);
  const pct = activity.items.length > 0 ? Math.round((score / activity.items.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            🎯 <span className="gradient-text">Interactive Activities</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Drag and drop exercises to reinforce your learning.</p>
        </div>

        {/* Activity selector */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          {ACTIVITIES.map((a, i) => (
            <button key={a.id} onClick={() => { setActivityIdx(i); reset(); }} style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${activityIdx === i ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`, background: activityIdx === i ? 'rgba(124,58,237,0.1)' : 'transparent', color: activityIdx === i ? '#a78bfa' : '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {a.icon} {a.title}
            </button>
          ))}
        </div>

        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f4ff', marginBottom: '4px' }}>{activity.icon} {activity.title}</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>{activity.desc} • {activity.subject}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={checkAnswers} disabled={Object.keys(dropped).length < activity.items.length} style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px', opacity: Object.keys(dropped).length < activity.items.length ? 0.5 : 1 }}>✓ Check</button>
              <button onClick={reset} style={{ padding: '8px 14px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>↺ Reset</button>
            </div>
          </div>

          {/* Score banner */}
          {checked && (
            <div style={{ padding: '16px', borderRadius: '12px', background: pct === 100 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${pct === 100 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: pct === 100 ? '#10b981' : '#f59e0b', fontFamily: 'Outfit,sans-serif' }}>
                {score}/{activity.items.length} {pct === 100 ? '🏆 Perfect!' : '📚 Keep Going!'}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
            {/* Draggable items */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Items to Sort ({undropped.length} left)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {undropped.map(item => (
                  <div key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.08)', cursor: 'grab', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#f0f4ff', userSelect: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                    <span>{item.emoji}</span>
                    <span style={{ fontSize: '12px' }}>{item.label}</span>
                  </div>
                ))}
                {undropped.length === 0 && <p style={{ color: '#4b5563', fontSize: '12px', textAlign: 'center', padding: '12px' }}>All items placed!</p>}
              </div>
            </div>

            {/* Drop zones */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Drop Zones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activity.zones.map(zone => {
                  const itemsInZone = activity.items.filter(item => dropped[item.id] === zone.id);
                  return (
                    <div key={zone.id}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(zone.id)}
                      style={{ minHeight: '64px', borderRadius: '12px', border: `2px dashed ${zone.color}40`, background: `${zone.color}06`, padding: '12px', transition: 'all 0.2s' }}
                      onDragEnter={e => { e.currentTarget.style.borderColor = zone.color; e.currentTarget.style.background = `${zone.color}15`; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = `${zone.color}40`; e.currentTarget.style.background = `${zone.color}06`; }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: zone.color, marginBottom: '8px' }}>{zone.label}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {itemsInZone.map(item => {
                          const correct = checked ? item.category === zone.id : null;
                          return (
                            <div key={item.id}
                              onClick={() => { const d = { ...dropped }; delete d[item.id]; setDropped(d); setChecked(false); }}
                              style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center',
                                background: checked ? (correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : `${zone.color}20`,
                                border: `1px solid ${checked ? (correct ? '#10b981' : '#ef4444') : zone.color + '40'}`,
                                color: checked ? (correct ? '#10b981' : '#ef4444') : '#f0f4ff',
                              }}>
                              <span>{item.emoji}</span> {item.label} {checked ? (correct ? '✓' : '✗') : '×'}
                            </div>
                          );
                        })}
                        {itemsInZone.length === 0 && <span style={{ fontSize: '11px', color: '#4b5563', padding: '2px' }}>Drop items here</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
