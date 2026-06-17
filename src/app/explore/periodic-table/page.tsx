'use client';
import { useState, useRef, useEffect } from 'react';

interface Element {
  number: number; symbol: string; name: string; mass: number;
  category: string; group: number; period: number; color: string;
  electron: string; description: string;
}

const ELEMENT_COLORS: Record<string, string> = {
  'alkali-metal': '#ef4444', 'alkaline-earth': '#f97316', 'transition-metal': '#f59e0b',
  'post-transition': '#84cc16', 'metalloid': '#10b981', 'nonmetal': '#06b6d4',
  'halogen': '#3b82f6', 'noble-gas': '#8b5cf6', 'lanthanide': '#ec4899', 'actinide': '#f43f5e',
};

const ELEMENTS: Element[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', group: 1, period: 1, color: '#06b6d4', electron: '1s¹', description: 'Most abundant element in the universe. Forms water.' },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4.003, category: 'noble-gas', group: 18, period: 1, color: '#8b5cf6', electron: '1s²', description: 'Second lightest element. Used in balloons.' },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.941, category: 'alkali-metal', group: 1, period: 2, color: '#ef4444', electron: '[He]2s¹', description: 'Lightest metal. Used in batteries.' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, category: 'alkaline-earth', group: 2, period: 2, color: '#f97316', electron: '[He]2s²', description: 'Light, strong metal. Used in aerospace.' },
  { number: 5, symbol: 'B', name: 'Boron', mass: 10.811, category: 'metalloid', group: 13, period: 2, color: '#10b981', electron: '[He]2s²2p¹', description: 'Essential for plant growth. Used in glass.' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'nonmetal', group: 14, period: 2, color: '#06b6d4', electron: '[He]2s²2p²', description: 'Basis of all known life. Diamond and graphite.' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'nonmetal', group: 15, period: 2, color: '#06b6d4', electron: '[He]2s²2p³', description: '78% of Earth\'s atmosphere.' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'nonmetal', group: 16, period: 2, color: '#06b6d4', electron: '[He]2s²2p⁴', description: 'Essential for respiration. Second most abundant in atmosphere.' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'halogen', group: 17, period: 2, color: '#3b82f6', electron: '[He]2s²2p⁵', description: 'Most electronegative element. Reactive nonmetal.' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, category: 'noble-gas', group: 18, period: 2, color: '#8b5cf6', electron: '[He]2s²2p⁶', description: 'Used in neon signs. Inert gas.' },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.99, category: 'alkali-metal', group: 1, period: 3, color: '#ef4444', electron: '[Ne]3s¹', description: 'Highly reactive metal. Found in table salt (NaCl).' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'alkaline-earth', group: 2, period: 3, color: '#f97316', electron: '[Ne]3s²', description: 'Light structural metal. Essential for chlorophyll.' },
  { number: 13, symbol: 'Al', name: 'Aluminum', mass: 26.982, category: 'post-transition', group: 13, period: 3, color: '#84cc16', electron: '[Ne]3s²3p¹', description: 'Most abundant metal in Earth\'s crust.' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.086, category: 'metalloid', group: 14, period: 3, color: '#10b981', electron: '[Ne]3s²3p²', description: 'Basis of computer chips and solar cells.' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'nonmetal', group: 15, period: 3, color: '#06b6d4', electron: '[Ne]3s²3p³', description: 'Essential for DNA, RNA, and ATP.' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'nonmetal', group: 16, period: 3, color: '#06b6d4', electron: '[Ne]3s²3p⁴', description: 'Yellow solid. Used in gunpowder and rubber vulcanization.' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen', group: 17, period: 3, color: '#3b82f6', electron: '[Ne]3s²3p⁵', description: 'Used to disinfect water. Forms table salt with sodium.' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'noble-gas', group: 18, period: 3, color: '#8b5cf6', electron: '[Ne]3s²3p⁶', description: 'Third most abundant gas in atmosphere. Used in welding.' },
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, category: 'alkali-metal', group: 1, period: 4, color: '#ef4444', electron: '[Ar]4s¹', description: 'Essential for nerve function. Highly reactive in water.' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, category: 'alkaline-earth', group: 2, period: 4, color: '#f97316', electron: '[Ar]4s²', description: 'Most abundant mineral in the human body. Forms bones and teeth.' },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, category: 'transition-metal', group: 8, period: 4, color: '#f59e0b', electron: '[Ar]3d⁶4s²', description: 'Most used metal. Component of hemoglobin.' },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, category: 'transition-metal', group: 11, period: 4, color: '#f59e0b', electron: '[Ar]3d¹⁰4s¹', description: 'Excellent electrical conductor. Used in wiring.' },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition-metal', group: 12, period: 4, color: '#f59e0b', electron: '[Ar]3d¹⁰4s²', description: 'Essential trace element. Used in galvanization.' },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.868, category: 'transition-metal', group: 11, period: 5, color: '#f59e0b', electron: '[Kr]4d¹⁰5s¹', description: 'Best electrical conductor. Used in jewelry and photography.' },
  { number: 79, symbol: 'Au', name: 'Gold', mass: 196.967, category: 'transition-metal', group: 11, period: 6, color: '#f59e0b', electron: '[Xe]4f¹⁴5d¹⁰6s¹', description: 'Precious metal. Excellent conductor. Used in electronics.' },
  { number: 82, symbol: 'Pb', name: 'Lead', mass: 207.2, category: 'post-transition', group: 14, period: 6, color: '#84cc16', electron: '[Xe]4f¹⁴5d¹⁰6s²6p²', description: 'Dense, soft metal. Used in batteries and radiation shielding.' },
  { number: 92, symbol: 'U', name: 'Uranium', mass: 238.029, category: 'actinide', group: 3, period: 7, color: '#f43f5e', electron: '[Rn]5f³6d¹7s²', description: 'Radioactive metal. Used as nuclear fuel.' },
];

export default function PeriodicTable() {
  const [selected, setSelected] = useState<Element | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [aiInfo, setAiInfo] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [bohrMode, setBohrMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  const filtered = ELEMENTS.filter(el =>
    (search === '' || el.name.toLowerCase().includes(search.toLowerCase()) || el.symbol.toLowerCase().includes(search.toLowerCase()) || el.number.toString().includes(search)) &&
    (filterCategory === null || el.category === filterCategory)
  );

  useEffect(() => {
    if (!bohrMode || !selected || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let t = 0;

    const shells = getShells(selected.number);

    const draw = () => {
      t += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Nucleus
      const nucGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
      nucGrad.addColorStop(0, selected.color + 'ff');
      nucGrad.addColorStop(1, selected.color + '44');
      ctx.fillStyle = nucGrad;
      ctx.shadowColor = selected.color; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f0f4ff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(selected.symbol, cx, cy);

      // Shells
      shells.forEach((electrons, si) => {
        const r = 45 + si * 38;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

        for (let ei = 0; ei < electrons; ei++) {
          const angle = (ei / electrons) * Math.PI * 2 + t * (1 / (si + 1));
          const ex = cx + r * Math.cos(angle);
          const ey = cy + r * Math.sin(angle);
          ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 10;
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [bohrMode, selected]);

  const getShells = (atomicNumber: number) => {
    const shells: number[] = [];
    let remaining = atomicNumber;
    const maxPerShell = [2, 8, 18, 32, 32, 18, 8];
    for (const max of maxPerShell) {
      if (remaining <= 0) break;
      const inShell = Math.min(remaining, max);
      shells.push(inShell);
      remaining -= inShell;
    }
    return shells;
  };

  const categories = [...new Set(ELEMENTS.map(e => e.category))];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            ⚗️ <span className="gradient-text">AI Periodic Table</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Click any element to explore its properties, electron configuration, and AI-generated insights.</p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search element name or symbol..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ flex: 1, minWidth: '200px' }} />
          <button onClick={() => setFilterCategory(null)} style={{ padding: '10px 16px', borderRadius: '10px', border: `1px solid ${filterCategory === null ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`, background: filterCategory === null ? 'rgba(124,58,237,0.15)' : 'transparent', color: filterCategory === null ? '#a78bfa' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? null : cat)} style={{ padding: '8px 14px', borderRadius: '10px', border: `1px solid ${filterCategory === cat ? ELEMENT_COLORS[cat] + '60' : 'rgba(255,255,255,0.06)'}`, background: filterCategory === cat ? ELEMENT_COLORS[cat] + '20' : 'transparent', color: filterCategory === cat ? ELEMENT_COLORS[cat] : '#94a3b8', cursor: 'pointer', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
          {/* Element Grid */}
          <div style={{ background: '#0d1117', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {filtered.map(el => (
                <div key={el.number} onClick={() => { setSelected(el); setAiInfo(''); setBohrMode(false); }}
                  style={{
                    width: '68px', height: '68px', borderRadius: '10px', border: `1px solid ${selected?.number === el.number ? el.color : 'rgba(255,255,255,0.06)'}`,
                    background: selected?.number === el.number ? el.color + '20' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                    boxShadow: selected?.number === el.number ? `0 0 20px ${el.color}40` : 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) translateZ(0)'; e.currentTarget.style.zIndex = '10'; e.currentTarget.style.boxShadow = `0 8px 24px ${el.color}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '1'; e.currentTarget.style.boxShadow = selected?.number === el.number ? `0 0 20px ${el.color}40` : 'none'; }}>
                  <div style={{ fontSize: '9px', color: ELEMENT_COLORS[el.category] || '#94a3b8', fontWeight: 700, position: 'absolute', top: '4px', left: '5px' }}>{el.number}</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: el.color || '#f0f4ff', lineHeight: 1 }}>{el.symbol}</div>
                  <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px', textAlign: 'center' }}>{el.name}</div>
                  <div style={{ fontSize: '8px', color: '#4b5563' }}>{el.mass}</div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center', width: '100%' }}>No elements match your search.</div>}
            </div>

            {/* Legend */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(ELEMENT_COLORS).map(([cat, color]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
                  <span style={{ fontSize: '10px', color: '#4b5563', textTransform: 'capitalize' }}>{cat.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selected ? (
              <>
                <div style={{ background: '#111827', border: `1px solid ${selected.color}30`, borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '14px', background: `${selected.color}20`, border: `2px solid ${selected.color}60`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${selected.color}30` }}>
                      <span style={{ fontSize: '10px', color: selected.color, fontWeight: 700 }}>{selected.number}</span>
                      <span style={{ fontSize: '28px', fontWeight: 900, color: selected.color }}>{selected.symbol}</span>
                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>{selected.mass}</span>
                    </div>
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f0f4ff' }}>{selected.name}</h2>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', background: `${ELEMENT_COLORS[selected.category]}20`, color: ELEMENT_COLORS[selected.category], fontWeight: 600, textTransform: 'capitalize' }}>
                        {selected.category.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { label: 'Atomic No.', value: selected.number },
                      { label: 'Atomic Mass', value: `${selected.mass} u` },
                      { label: 'Period', value: selected.period },
                      { label: 'Group', value: selected.group },
                    ].map(m => (
                      <div key={m.label} style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '10px', color: '#4b5563' }}>{m.label}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Electron Config</div>
                    <div style={{ fontSize: '14px', fontFamily: 'monospace', color: selected.color }}>{selected.electron}</div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '14px' }}>{selected.description}</p>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setBohrMode(!bohrMode)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${selected.color}40`, background: bohrMode ? `${selected.color}20` : 'transparent', color: bohrMode ? selected.color : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      ⚛️ {bohrMode ? 'Hide Bohr Model' : 'Bohr Model'}
                    </button>
                  </div>
                </div>

                {bohrMode && (
                  <div style={{ background: '#111827', border: `1px solid ${selected.color}20`, borderRadius: '14px', padding: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff', marginBottom: '10px' }}>⚛️ Bohr Model — {selected.name}</h3>
                    <canvas ref={canvasRef} width={320} height={240} style={{ width: '100%', borderRadius: '10px', display: 'block' }} />
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>⚗️</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '8px' }}>Select an Element</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>Click any element card to explore its properties, electron configuration, and Bohr model.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
