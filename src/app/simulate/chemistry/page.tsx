'use client';
import { useState, useRef, useEffect } from 'react';

interface Atom { x: number; y: number; symbol: string; color: string; vx: number; vy: number; id: number; }

const REACTIONS = [
  { name: 'Water Formation', reactants: 'H₂ + O₂', products: 'H₂O', equation: '2H₂ + O₂ → 2H₂O', type: 'Synthesis', color: '#06b6d4', desc: 'Hydrogen and oxygen combine to form water molecules' },
  { name: 'Combustion of Methane', reactants: 'CH₄ + O₂', products: 'CO₂ + H₂O', equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O', type: 'Combustion', color: '#f97316', desc: 'Methane burns in oxygen to produce carbon dioxide and water' },
  { name: 'Photosynthesis', reactants: 'CO₂ + H₂O', products: 'C₆H₁₂O₆ + O₂', equation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', type: 'Biochemical', color: '#10b981', desc: 'Plants convert carbon dioxide and water into glucose using sunlight' },
  { name: 'Acid-Base Neutralization', reactants: 'HCl + NaOH', products: 'NaCl + H₂O', equation: 'HCl + NaOH → NaCl + H₂O', type: 'Neutralization', color: '#8b5cf6', desc: 'Hydrochloric acid reacts with sodium hydroxide to form salt and water' },
  { name: 'Rusting of Iron', reactants: 'Fe + O₂ + H₂O', products: 'Fe₂O₃·nH₂O', equation: '4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃', type: 'Oxidation', color: '#ef4444', desc: 'Iron oxidizes in the presence of oxygen and water to form rust' },
];

export default function ChemistrySimPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const atomsRef = useRef<Atom[]>([]);
  const [selected, setSelected] = useState(REACTIONS[0]);
  const [running, setRunning] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [concentration, setConcentration] = useState(1.0);

  const initAtoms = (reaction: typeof REACTIONS[0]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    const atoms: Atom[] = [];
    const speed = 1 + temperature / 100;

    // Reactant atoms
    for (let i = 0; i < Math.round(6 * concentration); i++) {
      atoms.push({
        id: i, x: Math.random() * W * 0.4 + 20, y: Math.random() * (H - 60) + 30,
        symbol: reaction.reactants.split('+')[0].trim().substring(0, 3),
        color: reaction.color,
        vx: (Math.random() - 0.5) * speed * 2, vy: (Math.random() - 0.5) * speed * 2,
      });
    }
    for (let i = 0; i < Math.round(6 * concentration); i++) {
      atoms.push({
        id: i + 100, x: Math.random() * W * 0.4 + W * 0.55, y: Math.random() * (H - 60) + 30,
        symbol: (reaction.reactants.split('+')[1] || 'O₂').trim().substring(0, 3),
        color: '#94a3b8',
        vx: (Math.random() - 0.5) * speed * 2, vy: (Math.random() - 0.5) * speed * 2,
      });
    }
    atomsRef.current = atoms;
    setReacted(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initAtoms(selected);
  }, [selected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;

    const draw = () => {
      timeRef.current += 0.02;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#050810'; ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(99,102,241,0.06)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Divider line (before reaction)
      if (!reacted) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#4b5563'; ctx.font = '12px Inter'; ctx.textAlign = 'center';
        ctx.fillText('Reactants', W * 0.25, H - 12);
        ctx.fillText('React →', W * 0.75, H - 12);
      }

      if (running) {
        // Update atom positions
        atomsRef.current.forEach(atom => {
          atom.x += atom.vx;
          atom.y += atom.vy;

          // Bounce off walls
          if (atom.x < 20 || atom.x > W - 20) atom.vx *= -1;
          if (atom.y < 20 || atom.y > H - 40) atom.vy *= -1;

          // Check for reaction (atoms from different sides getting close)
          if (!reacted && Math.abs(atom.x - W / 2) < 40) {
            const nearby = atomsRef.current.filter(a => a.id !== atom.id && Math.sqrt((a.x - atom.x) ** 2 + (a.y - atom.y) ** 2) < 50 && a.id >= 100 !== atom.id >= 100);
            if (nearby.length > 2) {
              setTimeout(() => setReacted(true), 300);
            }
          }

          if (reacted) {
            // Move to center when reacted
            const targetX = W / 2 + (Math.random() - 0.5) * 200;
            const targetY = H / 2 + (Math.random() - 0.5) * 100;
            atom.vx += (targetX - atom.x) * 0.001;
            atom.vy += (targetY - atom.y) * 0.001;
            atom.color = selected.color;
          }
        });
      }

      // Draw atoms
      atomsRef.current.forEach(atom => {
        // Glow
        ctx.shadowColor = atom.color; ctx.shadowBlur = 15;
        const grad = ctx.createRadialGradient(atom.x - 6, atom.y - 6, 0, atom.x, atom.y, 18);
        grad.addColorStop(0, atom.color + 'ff');
        grad.addColorStop(1, atom.color + '33');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(atom.x, atom.y, 18, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Symbol
        ctx.fillStyle = '#f0f4ff'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(atom.symbol, atom.x, atom.y);

        // Bonds between close atoms of same group
        if (reacted) {
          atomsRef.current.forEach(other => {
            if (other.id > atom.id) {
              const d = Math.sqrt((other.x - atom.x) ** 2 + (other.y - atom.y) ** 2);
              if (d < 60) {
                ctx.strokeStyle = atom.color + '44'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(atom.x, atom.y); ctx.lineTo(other.x, other.y); ctx.stroke();
              }
            }
          });
        }
      });

      // Reaction flash
      if (reacted) {
        const flash = Math.max(0, Math.sin(timeRef.current * 5) * 0.15);
        ctx.fillStyle = `rgba(${selected.color === '#f97316' ? '249,115,22' : '16,185,129'},${flash})`;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = selected.color; ctx.font = 'bold 18px Outfit'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.shadowColor = selected.color; ctx.shadowBlur = 20;
        ctx.fillText('⚡ REACTION: ' + selected.products, W / 2, 10);
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [running, reacted, selected]);

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            🧪 <span className="gradient-text">Chemistry Reaction Simulator</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Watch atoms collide and react in real time. Adjust temperature and concentration.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '500px', borderRadius: '16px', border: `1px solid ${selected.color}30`, display: 'block' }} />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px' }}>
              <button onClick={() => { setRunning(true); }} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>▶ Start</button>
              <button onClick={() => setRunning(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>⏸ Pause</button>
              <button onClick={() => { setRunning(false); initAtoms(selected); }} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>↺ Reset</button>
            </div>
            {reacted && (
              <div style={{ position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', borderRadius: '100px', background: selected.color + '20', border: `1px solid ${selected.color}50`, color: selected.color, fontWeight: 800, fontSize: '16px', animation: 'pulse-glow 1s ease infinite', textAlign: 'center' }}>
                ✨ {selected.products} formed!
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Reactions */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Reactions</h3>
              {REACTIONS.map(r => (
                <button key={r.name} onClick={() => { setSelected(r); setRunning(false); initAtoms(r); }}
                  style={{ display: 'block', width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${selected.name === r.name ? r.color + '40' : 'rgba(255,255,255,0.04)'}`, background: selected.name === r.name ? r.color + '10' : 'rgba(255,255,255,0.01)', cursor: 'pointer', textAlign: 'left', marginBottom: '6px', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: selected.name === r.name ? '#f0f4ff' : '#94a3b8' }}>{r.name}</div>
                  <div style={{ fontSize: '10px', color: selected.name === r.name ? r.color : '#4b5563' }}>{r.type}</div>
                </button>
              ))}
            </div>

            {/* Selected Reaction Info */}
            <div style={{ background: '#111827', border: `1px solid ${selected.color}20`, borderRadius: '14px', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff', marginBottom: '10px' }}>{selected.name}</h3>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontFamily: 'monospace', fontSize: '12px', color: selected.color, marginBottom: '10px', textAlign: 'center' }}>
                {selected.equation}
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>{selected.desc}</p>
            </div>

            {/* Controls */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', flex: 1 }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '14px', textTransform: 'uppercase' }}>Parameters</h3>
              {[
                { label: '🌡️ Temperature', value: temperature, set: setTemperature, min: 0, max: 200, step: 5, fmt: (v: number) => `${v}°C` },
                { label: '⚗️ Concentration', value: concentration, set: setConcentration, min: 0.1, max: 3, step: 0.1, fmt: (v: number) => `${v} mol/L` },
              ].map(p => (
                <div key={p.label} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{p.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: selected.color }}>{p.fmt(p.value)}</span>
                  </div>
                  <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
                    onChange={e => p.set(Number(e.target.value))} className="slider-custom" />
                </div>
              ))}
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '11px', color: '#94a3b8', lineHeight: 1.6 }}>
                <div style={{ marginBottom: '4px' }}>⚡ Higher temp → faster collisions</div>
                <div>🧪 Higher concentration → more reactants</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
