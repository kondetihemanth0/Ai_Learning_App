'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const ELEMENTS = [
  { name: 'Hydrogen', symbol: 'H', atomic: 1, protons: 1, neutrons: 0, electrons: [1], color: '#60a5fa', fact: 'The most abundant element in the universe, making up about 75% of all matter.' },
  { name: 'Helium', symbol: 'He', atomic: 2, protons: 2, neutrons: 2, electrons: [2], color: '#fbbf24', fact: 'An inert noble gas used in balloons and MRI machines.' },
  { name: 'Lithium', symbol: 'Li', atomic: 3, protons: 3, neutrons: 4, electrons: [2, 1], color: '#a78bfa', fact: 'The lightest metal, used in batteries for phones and electric vehicles.' },
  { name: 'Carbon', symbol: 'C', atomic: 6, protons: 6, neutrons: 6, electrons: [2, 4], color: '#94a3b8', fact: 'The basis of all known life on Earth. Can form diamonds and graphite.' },
  { name: 'Oxygen', symbol: 'O', atomic: 8, protons: 8, neutrons: 8, electrons: [2, 6], color: '#34d399', fact: 'Essential for breathing. Makes up 21% of Earth\'s atmosphere.' },
  { name: 'Sodium', symbol: 'Na', atomic: 11, protons: 11, neutrons: 12, electrons: [2, 8, 1], color: '#fb923c', fact: 'A soft, reactive metal. Combined with chlorine it makes table salt.' },
  { name: 'Iron', symbol: 'Fe', atomic: 26, protons: 26, neutrons: 30, electrons: [2, 8, 14, 2], color: '#f87171', fact: 'The most common element on Earth by mass, forming much of the planet\'s core.' },
  { name: 'Gold', symbol: 'Au', atomic: 79, protons: 79, neutrons: 118, electrons: [2, 8, 18, 32, 18, 1], color: '#fcd34d', fact: 'One of the least reactive metals. Prized throughout human history.' },
];

const SHELL_RADII = [60, 100, 140, 180, 220, 260];

export default function AtomBuilderPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [selected, setSelected] = useState(ELEMENTS[3]);
  const [activeShell, setActiveShell] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 420;
    const cx = W / 2, cy = H / 2;

    const draw = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      // Background glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
      grad.addColorStop(0, selected.color + '22');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Electron shells
      selected.electrons.forEach((_, i) => {
        const r = SHELL_RADII[i];
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = activeShell === i ? selected.color + 'aa' : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = activeShell === i ? 2 : 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Electrons on this shell
        const count = selected.electrons[i];
        for (let e = 0; e < count; e++) {
          const angle = (e / count) * Math.PI * 2 + t * (1.2 - i * 0.15);
          const ex = cx + Math.cos(angle) * r;
          const ey = cy + Math.sin(angle) * r;
          const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
          glow.addColorStop(0, selected.color);
          glow.addColorStop(1, selected.color + '00');
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fillStyle = selected.color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex, ey, 10, 0, Math.PI * 2);
          ctx.fillStyle = selected.color + '30';
          ctx.fill();
        }
      });

      // Nucleus
      const nucR = Math.min(28, 14 + selected.protons * 0.25);
      const nucGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, nucR);
      nucGrad.addColorStop(0, '#fff');
      nucGrad.addColorStop(0.3, selected.color);
      nucGrad.addColorStop(1, selected.color + '88');
      ctx.beginPath();
      ctx.arc(cx, cy, nucR, 0, Math.PI * 2);
      ctx.fillStyle = nucGrad;
      ctx.fill();
      // Nucleus glow
      const gGrad = ctx.createRadialGradient(cx, cy, nucR * 0.5, cx, cy, nucR * 2);
      gGrad.addColorStop(0, selected.color + '44');
      gGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, nucR * 2, 0, Math.PI * 2);
      ctx.fillStyle = gGrad;
      ctx.fill();
      // Symbol
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${nucR > 20 ? 18 : 14}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selected.symbol, cx, cy);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [selected, activeShell]);

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link href="/subjects" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>← Back</Link>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', color: '#f0f4ff', margin: 0 }}>⚛️ Atom Builder</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Explore atomic structure with interactive Bohr model visualization</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Canvas */}
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', padding: '16px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '420px', display: 'block' }} />
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
              {selected.electrons.map((count, i) => (
                <button key={i} onClick={() => setActiveShell(activeShell === i ? null : i)}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${activeShell === i ? selected.color : 'rgba(255,255,255,0.1)'}`, background: activeShell === i ? selected.color + '22' : 'transparent', color: activeShell === i ? selected.color : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                  Shell {i + 1}: {count}e⁻
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Atom info */}
            <div style={{ background: '#111827', border: `1px solid ${selected.color}33`, borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: selected.color + '22', border: `2px solid ${selected.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: selected.color, fontFamily: 'Outfit,sans-serif' }}>{selected.symbol}</div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#f0f4ff' }}>{selected.name}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>Atomic Number: {selected.atomic}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {[{ label: 'Protons', value: selected.protons, color: '#f87171' }, { label: 'Neutrons', value: selected.neutrons, color: '#94a3b8' }, { label: 'Electrons', value: selected.electrons.reduce((a, b) => a + b, 0), color: selected.color }, { label: 'Shells', value: selected.electrons.length, color: '#fbbf24' }].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{selected.fact}</p>
            </div>

            {/* Element selector */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Element</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {ELEMENTS.map(el => (
                  <button key={el.symbol} onClick={() => setSelected(el)} style={{ padding: '8px 4px', borderRadius: '10px', border: `1px solid ${selected.symbol === el.symbol ? el.color + '60' : 'rgba(255,255,255,0.06)'}`, background: selected.symbol === el.symbol ? el.color + '18' : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: el.color }}>{el.symbol}</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>{el.atomic}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Electron config */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Electron Config</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: selected.color, fontFamily: 'monospace', letterSpacing: '4px' }}>
                {selected.electrons.join(' · ')}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>electrons per shell (inner → outer)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
