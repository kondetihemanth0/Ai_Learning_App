'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function WavesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [waveType, setWaveType] = useState<'transverse' | 'longitudinal' | 'standing'>('transverse');
  const [amplitude, setAmplitude] = useState(60);
  const [frequency, setFrequency] = useState(2);
  const [speed, setSpeed] = useState(1);
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 320;

    const W = canvas.width, H = canvas.height;
    const cy = H / 2;

    const draw = () => {
      timeRef.current += 0.03 * speed;
      const t = timeRef.current;
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

      // Center line
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke();

      if (waveType === 'transverse') {
        // Wave 1
        ctx.beginPath();
        for (let x = 0; x <= W; x++) {
          const y = cy + amplitude * Math.sin((x / W) * Math.PI * 2 * frequency - t * 3);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const g1 = ctx.createLinearGradient(0, cy - amplitude, 0, cy + amplitude);
        g1.addColorStop(0, '#7c3aed'); g1.addColorStop(1, '#3b82f6');
        ctx.strokeStyle = g1; ctx.lineWidth = 3; ctx.stroke();

        // Wave 2 (interference)
        if (showSecond) {
          ctx.beginPath();
          for (let x = 0; x <= W; x++) {
            const y = cy + (amplitude * 0.7) * Math.sin((x / W) * Math.PI * 2 * frequency * 1.5 + t * 2);
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);

          // Resultant
          ctx.beginPath();
          for (let x = 0; x <= W; x++) {
            const y1 = amplitude * Math.sin((x / W) * Math.PI * 2 * frequency - t * 3);
            const y2 = (amplitude * 0.7) * Math.sin((x / W) * Math.PI * 2 * frequency * 1.5 + t * 2);
            const y = cy + y1 + y2;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5; ctx.stroke();
        }

        // Particle (red dot moving along wave)
        const px = (t * 40) % W;
        const py = cy + amplitude * Math.sin((px / W) * Math.PI * 2 * frequency - t * 3);
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#f87171'; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#f8717140'; ctx.fill();

      } else if (waveType === 'longitudinal') {
        const numParticles = 30;
        for (let i = 0; i < numParticles; i++) {
          const baseX = (i / numParticles) * W;
          const displacement = amplitude * 0.3 * Math.sin((baseX / W) * Math.PI * 2 * frequency - t * 3);
          const x = baseX + displacement;
          const density = Math.abs(displacement) < 5 ? 1 : (displacement > 0 ? 0.3 : 1.8);
          const alpha = Math.min(1, density * 0.6 + 0.2);
          ctx.beginPath();
          ctx.arc(x, cy, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`;
          ctx.fill();
          // Arrow
          if (Math.abs(displacement) > 3) {
            const dir = displacement > 0 ? 1 : -1;
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x, cy - 15); ctx.lineTo(x + dir * 12, cy - 15); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + dir * 12, cy - 15); ctx.lineTo(x + dir * 8, cy - 19); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + dir * 12, cy - 15); ctx.lineTo(x + dir * 8, cy - 11); ctx.stroke();
          }
        }
        // Label zones
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px Outfit,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Compression', W * 0.25, cy + 50);
        ctx.fillText('Rarefaction', W * 0.75, cy + 50);

      } else {
        // Standing wave
        for (let harm = 1; harm <= 3; harm++) {
          const yOff = (harm - 2) * 90;
          ctx.beginPath();
          for (let x = 0; x <= W; x++) {
            const y = cy + yOff + (amplitude / harm) * Math.sin((x / W) * Math.PI * harm) * Math.cos(t * 3 * harm);
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          const colors = ['#7c3aed', '#3b82f6', '#10b981'];
          ctx.strokeStyle = colors[harm - 1]; ctx.lineWidth = harm === 1 ? 3 : 2; ctx.stroke();
          ctx.fillStyle = colors[harm - 1]; ctx.font = '12px Outfit,sans-serif'; ctx.textAlign = 'left';
          ctx.fillText(`n=${harm}`, 8, cy + yOff - (amplitude / harm) - 8);

          // Nodes
          for (let n = 0; n <= harm; n++) {
            const nx = (n / harm) * W;
            ctx.beginPath(); ctx.arc(nx, cy + yOff, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#f87171'; ctx.fill();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [waveType, amplitude, frequency, speed, showSecond]);

  const waveTypes = [
    { id: 'transverse', label: '↕ Transverse', desc: 'Displacement ⊥ to propagation (light, water)' },
    { id: 'longitudinal', label: '↔ Longitudinal', desc: 'Displacement ∥ to propagation (sound)' },
    { id: 'standing', label: '〰 Standing', desc: 'Superposition of two opposite waves' },
  ] as const;

  const facts = [
    { icon: '🌊', title: 'Wavelength (λ)', desc: 'Distance between two consecutive crests or troughs.' },
    { icon: '📐', title: 'Amplitude (A)', desc: 'Maximum displacement from the equilibrium position.' },
    { icon: '⏱️', title: 'Frequency (f)', desc: 'Number of complete oscillations per second (Hz).' },
    { icon: '🔊', title: 'Wave Speed (v)', desc: 'v = fλ — speed equals frequency times wavelength.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link href="/subjects" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>← Back</Link>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', color: '#f0f4ff', margin: 0 }}>〰️ Wave Simulator</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Explore transverse, longitudinal and standing waves interactively</p>
          </div>
        </div>

        {/* Wave type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {waveTypes.map(w => (
            <button key={w.id} onClick={() => setWaveType(w.id)} style={{ padding: '14px', borderRadius: '14px', border: `1px solid ${waveType === w.id ? '#7c3aed60' : 'rgba(255,255,255,0.06)'}`, background: waveType === w.id ? 'rgba(124,58,237,0.15)' : '#111827', color: waveType === w.id ? '#f0f4ff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', fontFamily: 'Outfit,sans-serif' }}>{w.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>{w.desc}</div>
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '320px', display: 'block', borderRadius: '12px' }} />
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[{ label: '🔊 Amplitude', value: amplitude, set: setAmplitude, min: 10, max: 100 },
            { label: '〰️ Frequency', value: frequency, set: setFrequency, min: 1, max: 5 },
            { label: '⚡ Speed', value: speed, set: setSpeed, min: 0, max: 3 }].map(c => (
            <div key={c.label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{c.label}</span>
                <span style={{ fontSize: '13px', color: '#7c3aed', fontWeight: 700 }}>{c.value}</span>
              </div>
              <input type="range" min={c.min} max={c.max} value={c.value} onChange={e => c.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed' }} />
            </div>
          ))}
          {waveType === 'transverse' && (
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={showSecond} onChange={e => setShowSecond(e.target.checked)} style={{ accentColor: '#10b981', width: '16px', height: '16px' }} />
                Show Interference
              </label>
            </div>
          )}
        </div>

        {/* Facts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {facts.map(f => (
            <div key={f.title} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, color: '#f0f4ff', marginBottom: '4px', fontFamily: 'Outfit,sans-serif' }}>{f.title}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
