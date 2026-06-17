'use client';
import { useState } from 'react';
import Link from 'next/link';

type System = 'all' | 'cardiovascular' | 'respiratory' | 'digestive' | 'nervous';

interface Organ {
  id: string;
  name: string;
  emoji: string;
  system: Exclude<System, 'all'>;
  color: string;
  x: number; // percent
  y: number; // percent
  function: string;
  facts: string[];
  stat: string;
}

const ORGANS: Organ[] = [
  {
    id: 'brain', name: 'Brain', emoji: '🧠', system: 'nervous', color: '#f59e0b',
    x: 50, y: 8,
    function: 'The brain is the command center of the nervous system. It controls thought, memory, emotion, vision, breathing, motor skills, and virtually every process that regulates the body.',
    facts: ['Contains ~86 billion neurons', 'Uses 20% of the body\'s energy', 'Generates about 23 watts of power'],
    stat: 'Weight: ~1.4 kg',
  },
  {
    id: 'heart', name: 'Heart', emoji: '❤️', system: 'cardiovascular', color: '#ef4444',
    x: 42, y: 32,
    function: 'The heart is a muscular pump that circulates blood throughout the body, delivering oxygen and nutrients to tissues and removing carbon dioxide and waste products.',
    facts: ['Beats ~100,000 times per day', 'Pumps ~5 liters of blood per minute', 'Generates the body\'s strongest electrical field'],
    stat: 'Weight: ~300 g',
  },
  {
    id: 'lungs', name: 'Lungs', emoji: '🫁', system: 'respiratory', color: '#3b82f6',
    x: 60, y: 30,
    function: 'The lungs are the primary organs of the respiratory system. They facilitate gas exchange — breathing in oxygen for the bloodstream and expelling carbon dioxide as waste.',
    facts: ['Surface area: size of a tennis court (~70 m²)', 'Take ~20,000 breaths per day', 'Left lung is slightly smaller than the right'],
    stat: 'Combined weight: ~1 kg',
  },
  {
    id: 'stomach', name: 'Stomach', emoji: '🟡', system: 'digestive', color: '#10b981',
    x: 48, y: 47,
    function: 'The stomach is a muscular sac that mixes food with digestive acids and enzymes. It breaks down proteins and controls the rate at which food enters the small intestine.',
    facts: ['Can stretch to hold ~1 liter of food', 'Produces ~2 liters of acid per day', 'Acid is strong enough to dissolve metal'],
    stat: 'Length: ~25 cm',
  },
  {
    id: 'liver', name: 'Liver', emoji: '🟤', system: 'digestive', color: '#a78bfa',
    x: 38, y: 43,
    function: 'The liver is the largest solid organ, performing over 500 functions. It detoxifies chemicals, metabolizes drugs, produces bile for digestion, and synthesizes proteins.',
    facts: ['Performs 500+ metabolic functions', 'Can regenerate from just 25% of tissue', 'Produces 800–1000 ml of bile daily'],
    stat: 'Weight: ~1.5 kg',
  },
  {
    id: 'kidneys', name: 'Kidneys', emoji: '🫘', system: 'digestive', color: '#ec4899',
    x: 62, y: 53,
    function: 'The kidneys filter blood to produce urine, regulate blood pressure, maintain electrolyte balance, and produce hormones like erythropoietin that stimulate red blood cell production.',
    facts: ['Filter ~180 liters of blood daily', 'Each kidney has ~1 million filtering units (nephrons)', 'Regulate blood pH and fluid balance'],
    stat: 'Each: ~150 g',
  },
  {
    id: 'spine', name: 'Spine', emoji: '🦴', system: 'nervous', color: '#94a3b8',
    x: 52, y: 55,
    function: 'The spinal cord is the primary communication pathway between the brain and the body. It also coordinates reflex actions that don\'t require brain involvement.',
    facts: ['Contains 31 pairs of spinal nerves', 'Transmits signals at up to 270 km/h', '33 vertebrae protect the cord'],
    stat: 'Length: ~45 cm',
  },
];

const SYSTEMS: { id: System; label: string; color: string }[] = [
  { id: 'all', label: 'All Systems', color: '#94a3b8' },
  { id: 'cardiovascular', label: '❤️ Cardiovascular', color: '#ef4444' },
  { id: 'respiratory', label: '🫁 Respiratory', color: '#3b82f6' },
  { id: 'digestive', label: '🍽️ Digestive', color: '#10b981' },
  { id: 'nervous', label: '🧠 Nervous', color: '#f59e0b' },
];

export default function AnatomyPage() {
  const [selected, setSelected] = useState<Organ>(ORGANS[0]);
  const [activeSystem, setActiveSystem] = useState<System>('all');

  const visible = activeSystem === 'all' ? ORGANS : ORGANS.filter(o => o.system === activeSystem);

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Link href="/subjects" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>← Back</Link>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', color: '#f0f4ff', margin: 0 }}>🫁 Human Anatomy</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Click on organs to explore the human body</p>
          </div>
        </div>

        {/* System filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {SYSTEMS.map(s => (
            <button key={s.id} onClick={() => setActiveSystem(s.id)}
              style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${activeSystem === s.id ? s.color + '80' : 'rgba(255,255,255,0.08)'}`, background: activeSystem === s.id ? s.color + '20' : 'transparent', color: activeSystem === s.id ? s.color : '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Body SVG */}
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', position: 'relative', minHeight: '520px' }}>
            <div style={{ position: 'relative', width: '100%', height: '520px' }}>
              {/* Human body silhouette SVG */}
              <svg viewBox="0 0 200 520" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                {/* Head */}
                <ellipse cx="100" cy="45" rx="28" ry="35" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                {/* Neck */}
                <rect x="90" y="78" width="20" height="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                {/* Torso */}
                <path d="M60 96 L40 200 L40 330 L160 330 L160 200 L140 96 Z" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                {/* Left arm */}
                <path d="M60 96 L20 180 L16 280" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                {/* Right arm */}
                <path d="M140 96 L180 180 L184 280" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                {/* Left leg */}
                <path d="M70 330 L65 450 L60 510" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                {/* Right leg */}
                <path d="M130 330 L135 450 L140 510" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                {/* Spine line */}
                <line x1="100" y1="96" x2="100" y2="330" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Organ hotspots */}
              {ORGANS.map(organ => {
                const isVisible = visible.some(v => v.id === organ.id);
                const isSelected = selected.id === organ.id;
                return (
                  <button key={organ.id} onClick={() => setSelected(organ)}
                    style={{
                      position: 'absolute',
                      left: `${organ.x}%`,
                      top: `${organ.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: isSelected ? '36px' : '28px',
                      height: isSelected ? '36px' : '28px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? organ.color : isVisible ? organ.color + '80' : 'rgba(255,255,255,0.1)'}`,
                      background: isSelected ? organ.color + '40' : isVisible ? organ.color + '20' : 'rgba(255,255,255,0.04)',
                      boxShadow: isSelected ? `0 0 20px ${organ.color}88, 0 0 40px ${organ.color}44` : isVisible ? `0 0 10px ${organ.color}44` : 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isSelected ? '16px' : '12px',
                      transition: 'all 0.3s',
                      opacity: isVisible ? 1 : 0.2,
                      zIndex: isSelected ? 10 : 1,
                    }}>
                    {organ.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Selected organ info */}
            <div style={{ background: '#111827', border: `1px solid ${selected.color}33`, borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: selected.color + '20', border: `2px solid ${selected.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                  {selected.emoji}
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#f0f4ff', fontFamily: 'Outfit,sans-serif' }}>{selected.name}</div>
                  <div style={{ fontSize: '12px', color: selected.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selected.system} system</div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '16px' }}>{selected.function}</p>

              <div style={{ background: selected.color + '15', border: `1px solid ${selected.color}30`, borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: selected.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Quick Stat</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f0f4ff' }}>{selected.stat}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Key Facts</div>
                {selected.facts.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: selected.color + '25', border: `1px solid ${selected.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: selected.color, flexShrink: 0, marginTop: '1px' }}>{i + 1}</div>
                    <span style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Organ list */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>All Organs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ORGANS.map(o => (
                  <button key={o.id} onClick={() => setSelected(o)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px', border: `1px solid ${selected.id === o.id ? o.color + '50' : 'transparent'}`, background: selected.id === o.id ? o.color + '15' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '16px' }}>{o.emoji}</span>
                    <span style={{ fontSize: '13px', color: selected.id === o.id ? '#f0f4ff' : '#94a3b8', fontWeight: selected.id === o.id ? 700 : 400 }}>{o.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', background: o.color + '25', color: o.color, padding: '2px 8px', borderRadius: '10px', fontWeight: 600, textTransform: 'capitalize' }}>{o.system}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
