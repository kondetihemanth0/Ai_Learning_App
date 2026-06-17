'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { askGemini } from '@/lib/gemini';

const PLANETS = [
  { name: 'Sun', color: '#fbbf24', size: 60, distance: 0, speed: 0, emoji: '☀️', fact: 'The Sun contains 99.86% of the solar system\'s mass', temp: '5,500°C surface', moons: 0 },
  { name: 'Mercury', color: '#9ca3af', size: 8, distance: 100, speed: 4.7, emoji: '⚫', fact: 'Mercury has no atmosphere and extreme temperature variations', temp: '167°C avg', moons: 0 },
  { name: 'Venus', color: '#f97316', size: 14, distance: 150, speed: 3.5, emoji: '🟠', fact: 'Venus is the hottest planet despite not being closest to the Sun', temp: '464°C avg', moons: 0 },
  { name: 'Earth', color: '#3b82f6', size: 15, distance: 210, speed: 3.0, emoji: '🌍', fact: 'Earth is the only known planet with active life', temp: '15°C avg', moons: 1 },
  { name: 'Mars', color: '#ef4444', size: 11, distance: 280, speed: 2.4, emoji: '🔴', fact: 'Mars has the largest volcano in the solar system - Olympus Mons', temp: '-65°C avg', moons: 2 },
  { name: 'Jupiter', color: '#f59e0b', size: 40, distance: 380, speed: 1.3, emoji: '🟡', fact: 'Jupiter\'s Great Red Spot is a storm larger than Earth', temp: '-110°C avg', moons: 95 },
  { name: 'Saturn', color: '#eab308', size: 34, distance: 500, speed: 0.97, emoji: '🪐', fact: 'Saturn\'s rings are made of ice and rock particles', temp: '-140°C avg', moons: 146 },
  { name: 'Uranus', color: '#67e8f9', size: 22, distance: 610, speed: 0.68, emoji: '🔵', fact: 'Uranus rotates on its side with a 98° axial tilt', temp: '-195°C avg', moons: 27 },
  { name: 'Neptune', color: '#6366f1', size: 20, distance: 700, speed: 0.54, emoji: '🔷', fact: 'Neptune has the strongest winds in the solar system at 2,100 km/h', temp: '-200°C avg', moons: 14 },
];

export default function SolarSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const [selected, setSelected] = useState<typeof PLANETS[0] | null>(null);
  const [speed, setSpeed] = useState(1);
  const [aiInfo, setAiInfo] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const { apiKey } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      timeRef.current += 0.008 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Starfield
      ctx.fillStyle = '#030711';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 200; i++) {
        const x = (Math.sin(i * 127.34) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 89.71) * 0.5 + 0.5) * canvas.height;
        const s = Math.sin(timeRef.current * 0.5 + i) * 0.5 + 1;
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(i * 0.37) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, s * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      const cx = canvas.width * 0.4;
      const cy = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) / 800;

      // Draw orbits
      PLANETS.forEach(planet => {
        if (planet.distance === 0) return;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 8]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, planet.distance * scale, planet.distance * scale * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw planets
      PLANETS.forEach((planet, i) => {
        let px = cx;
        let py = cy;
        if (planet.distance > 0) {
          const angle = timeRef.current * planet.speed * 0.1;
          px = cx + Math.cos(angle) * planet.distance * scale;
          py = cy + Math.sin(angle) * planet.distance * scale * 0.38;
        }

        // Glow
        if (selected?.name === planet.name) {
          ctx.shadowColor = planet.color;
          ctx.shadowBlur = 30;
        }

        // Planet glow
        const glow = ctx.createRadialGradient(px - planet.size * 0.3 * scale, py - planet.size * 0.3 * scale, 0, px, py, planet.size * scale);
        glow.addColorStop(0, planet.color + 'ff');
        glow.addColorStop(0.6, planet.color + 'aa');
        glow.addColorStop(1, planet.color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, planet.size * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Saturn rings
        if (planet.name === 'Saturn') {
          ctx.strokeStyle = `${planet.color}88`;
          ctx.lineWidth = 4 * scale;
          ctx.beginPath();
          ctx.ellipse(px, py, planet.size * scale * 1.8, planet.size * scale * 0.5, 0.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label on hover/select
        if (selected?.name === planet.name) {
          ctx.fillStyle = '#f0f4ff';
          ctx.font = `bold ${14 * scale}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(planet.name, px, py - planet.size * scale - 8);
        }

        // Earth's moon
        if (planet.name === 'Earth') {
          const moonAngle = timeRef.current * 2;
          const mx = px + Math.cos(moonAngle) * 28 * scale;
          const my = py + Math.sin(moonAngle) * 28 * scale * 0.5;
          ctx.fillStyle = '#d1d5db';
          ctx.beginPath();
          ctx.arc(mx, my, 4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [selected, speed]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width * 0.4;
    const cy = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 800;
    const t = timeRef.current;

    const clicked = PLANETS.find(planet => {
      let px = cx, py = cy;
      if (planet.distance > 0) {
        const angle = t * planet.speed * 0.1;
        px = cx + Math.cos(angle) * planet.distance * scale;
        py = cy + Math.sin(angle) * planet.distance * scale * 0.38;
      }
      return Math.sqrt((mouseX - px) ** 2 + (mouseY - py) ** 2) < planet.size * scale * 2;
    });

    if (clicked) {
      setSelected(clicked);
      setAiInfo('');
      if (apiKey) {
        setLoadingAI(true);
        askGemini(apiKey, `Give 3 fascinating facts about ${clicked.name} that would interest a student. Keep it engaging and educational.`)
          .then(r => { setAiInfo(r); setLoadingAI(false); })
          .catch(() => setLoadingAI(false));
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', height: '640px' }}>
      <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)' }}>
        <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }} />
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.7)', borderRadius: '10px', padding: '8px 14px' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>⏩ Speed:</span>
          <input type="range" min="0.1" max="5" step="0.1" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="slider-custom" style={{ width: '100px' }} />
          <span style={{ color: '#f0f4ff', fontSize: '12px', minWidth: '30px' }}>{speed.toFixed(1)}x</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        {selected ? (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '36px' }}>{selected.emoji}</span>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#f0f4ff' }}>{selected.name}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Click for AI facts</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Avg Temperature</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>{selected.temp}</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Moons</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#a78bfa' }}>{selected.moons}</div>
              </div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>💡 {selected.fact}</p>
            </div>
            {loadingAI && <p style={{ fontSize: '13px', color: '#94a3b8' }}>🤖 Loading AI facts...</p>}
            {aiInfo && <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aiInfo}</div>}
          </div>
        ) : (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪐</div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Click any planet to learn about it</p>
          </div>
        )}

        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>🌌 Solar System</h3>
          {PLANETS.map(planet => (
            <div key={planet.name} onClick={() => setSelected(planet)} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: selected?.name === planet.name ? `${planet.color}15` : 'transparent', border: `1px solid ${selected?.name === planet.name ? planet.color + '30' : 'transparent'}`, transition: 'all 0.2s' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: planet.color, flexShrink: 0, boxShadow: `0 0 6px ${planet.color}` }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: selected?.name === planet.name ? '#f0f4ff' : '#94a3b8' }}>{planet.name}</div>
                {planet.moons > 0 && <div style={{ fontSize: '10px', color: '#4b5563' }}>{planet.moons} moon{planet.moons > 1 ? 's' : ''}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
