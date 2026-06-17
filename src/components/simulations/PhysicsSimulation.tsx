'use client';
import { useState, useRef, useEffect } from 'react';

interface Particle { x: number; y: number; vx: number; vy: number; mass: number; color: string; trail: {x:number;y:number}[]; }

export default function PhysicsSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [simType, setSimType] = useState<'gravity' | 'projectile' | 'pendulum' | 'waves'>('gravity');
  const [gravity, setGravity] = useState(9.8);
  const [mass, setMass] = useState(5);
  const [velocity, setVelocity] = useState(20);
  const [angle, setAngle] = useState(45);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [info, setInfo] = useState({ height: 0, speed: 0, force: 0 });
  const timeRef = useRef(0);
  const runningRef = useRef(false);
  const pendulumRef = useRef({ angle: 45, angularVel: 0, length: 200 });
  const waveRef = useRef(0);

  const reset = () => {
    setRunning(false);
    runningRef.current = false;
    timeRef.current = 0;
    setTime(0);
    particlesRef.current = [];
    pendulumRef.current = { angle: 45, angularVel: 0, length: 200 };
    waveRef.current = 0;
  };

  const start = () => {
    reset();
    setTimeout(() => {
      setRunning(true);
      runningRef.current = true;
      if (simType === 'gravity') initGravity();
      if (simType === 'projectile') initProjectile();
    }, 100);
  };

  const initGravity = () => {
    particlesRef.current = Array.from({ length: 6 }, (_, i) => ({
      x: 80 + i * 90,
      y: 50 + i * 30,
      vx: (Math.random() - 0.5) * 3,
      vy: 0,
      mass: 1 + i,
      color: ['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6','#7c3aed'][i],
      trail: [],
    }));
  };

  const initProjectile = () => {
    particlesRef.current = [{
      x: 60, y: 0, vx: velocity * Math.cos(angle * Math.PI / 180),
      vy: -velocity * Math.sin(angle * Math.PI / 180),
      mass, color: '#3b82f6', trail: [],
    }];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(99,102,241,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

      const ground = canvas.height - 60;
      // Ground
      ctx.fillStyle = 'rgba(16,185,129,0.15)';
      ctx.fillRect(0, ground, canvas.width, canvas.height - ground);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(canvas.width, ground); ctx.stroke();

      if (runningRef.current) {
        timeRef.current += 0.016;
        setTime(Math.round(timeRef.current * 10) / 10);

        if (simType === 'gravity' || simType === 'projectile') {
          particlesRef.current.forEach(p => {
            p.trail.push({ x: p.x, y: p.y + ground - canvas.height + 60 });
            if (p.trail.length > 40) p.trail.shift();
            p.vy += gravity * 0.016;
            p.x += p.vx;
            p.y += p.vy;
            if (p.y + ground - canvas.height + 60 >= ground - 10) {
              if (simType === 'gravity') { p.vy *= -0.6; p.vx *= 0.9; p.y = canvas.height - ground - 10; }
              else { p.vy = 0; p.vx = 0; }
            }
            const realY = p.y + ground - canvas.height + 60;
            if (realY < 0) { setRunning(false); runningRef.current = false; }

            // Trail
            ctx.beginPath();
            p.trail.forEach((pt, ti) => {
              ctx.strokeStyle = p.color + Math.floor((ti / p.trail.length) * 255).toString(16).padStart(2, '0');
              ctx.lineWidth = 1.5;
              if (ti === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();

            // Particle
            ctx.shadowColor = p.color; ctx.shadowBlur = 15;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, realY, 6 + p.mass, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Mass label
            ctx.fillStyle = '#f0f4ff'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
            ctx.fillText(`${p.mass}kg`, p.x, realY - 14 - p.mass);

            setInfo({ height: Math.round((ground - realY) * 0.1), speed: Math.round(Math.sqrt(p.vx**2 + p.vy**2) * 10) / 10, force: Math.round(p.mass * gravity * 10) / 10 });
          });
        }

        if (simType === 'pendulum') {
          const L = pendulumRef.current.length;
          const g = gravity;
          const dt = 0.05;
          pendulumRef.current.angularVel += (-g / L) * Math.sin(pendulumRef.current.angle * Math.PI / 180) * dt;
          pendulumRef.current.angle += pendulumRef.current.angularVel * (180 / Math.PI) * dt;
          pendulumRef.current.angularVel *= 0.999;

          const cx = canvas.width / 2;
          const pivotY = 80;
          const a = pendulumRef.current.angle * Math.PI / 180;
          const bx = cx + L * Math.sin(a);
          const by = pivotY + L * Math.cos(a);

          // Rope
          ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(cx, pivotY); ctx.lineTo(bx, by); ctx.stroke();
          // Pivot
          ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(cx, pivotY, 6, 0, Math.PI * 2); ctx.fill();
          // Bob
          ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 20;
          ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          // Force arrows
          const tension = mass * gravity / Math.cos(a);
          ctx.fillStyle = '#f0f4ff'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
          ctx.fillText(`T = ${Math.round(tension * 10) / 10}N`, bx + 30, by - 10);
          ctx.fillText(`θ = ${Math.round(Math.abs(pendulumRef.current.angle))}°`, cx - 40, pivotY + 30);
          setInfo({ height: Math.round(L * (1 - Math.cos(a)) * 0.1), speed: Math.round(Math.abs(pendulumRef.current.angularVel) * L * 0.01), force: Math.round(mass * gravity * 10) / 10 });
        }

        if (simType === 'waves') {
          waveRef.current += 0.05;
          const midY = canvas.height / 2;
          ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5;
          ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 10;
          ctx.beginPath();
          for (let x = 0; x < canvas.width; x++) {
            const y = midY + Math.sin((x / canvas.width) * Math.PI * 4 + waveRef.current) * 80 * (velocity / 30) + Math.sin((x / canvas.width) * Math.PI * 8 + waveRef.current * 1.5) * 30;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          // Second wave
          ctx.strokeStyle = '#f97316'; ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let x = 0; x < canvas.width; x++) {
            const y = midY + Math.sin((x / canvas.width) * Math.PI * 6 - waveRef.current) * 50;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
          // Labels
          ctx.fillStyle = '#94a3b8'; ctx.font = '12px Inter'; ctx.textAlign = 'left';
          ctx.fillStyle = '#3b82f6'; ctx.fillText('▬ Wave 1 (Primary)', 20, 30);
          ctx.fillStyle = '#f97316'; ctx.fillText('— Wave 2 (Reflected)', 20, 50);
          setInfo({ height: Math.round(velocity * 2.8), speed: velocity, force: Math.round(mass * 0.3) });
        }
      } else {
        // Static guide
        ctx.fillStyle = '#94a3b8'; ctx.font = '16px Inter'; ctx.textAlign = 'center';
        ctx.fillText('Configure parameters and press Start', canvas.width / 2, canvas.height / 2);
        ctx.font = '14px Inter'; ctx.fillStyle = '#4b5563';
        ctx.fillText(`Mode: ${simType.toUpperCase()}`, canvas.width / 2, canvas.height / 2 + 30);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [simType, gravity, mass, velocity, angle]);

  const SIM_TYPES = [
    { id: 'gravity', label: '🌍 Gravity', desc: 'Objects falling under gravity' },
    { id: 'projectile', label: '🚀 Projectile', desc: 'Projectile motion' },
    { id: 'pendulum', label: '🕰️ Pendulum', desc: 'Simple pendulum' },
    { id: 'waves', label: '〰️ Waves', desc: 'Wave interference' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', minHeight: '620px' }}>
      {/* Canvas */}
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} className="sim-canvas" style={{ width: '100%', height: '560px', display: 'block' }} />
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
          {running ? (
            <button onClick={() => { setRunning(false); runningRef.current = false; }} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>⏸ Pause</button>
          ) : null}
          <button onClick={start} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>▶ {running ? 'Restart' : 'Start'}</button>
          <button onClick={reset} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>↺ Reset</button>
        </div>
        {running && (
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '10px' }}>
            {[{ label: 'Time', value: `${time}s`, color: '#06b6d4' }, { label: 'Height', value: `${info.height}m`, color: '#10b981' }, { label: 'Speed', value: `${info.speed}m/s`, color: '#f59e0b' }, { label: 'Force', value: `${info.force}N`, color: '#ef4444' }].map(m => (
              <div key={m.label} style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Simulation type */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulation Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SIM_TYPES.map(st => (
              <button key={st.id} onClick={() => { setSimType(st.id as any); reset(); }} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${simType === st.id ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.04)'}`, background: simType === st.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: simType === st.id ? '#f0f4ff' : '#94a3b8' }}>{st.label}</div>
                <div style={{ fontSize: '11px', color: '#4b5563' }}>{st.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', flex: 1 }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parameters</h3>
          {[
            { label: '🌍 Gravity (m/s²)', value: gravity, set: setGravity, min: 0.1, max: 25, step: 0.1, display: `${gravity} m/s²` },
            { label: '⚖️ Mass (kg)', value: mass, set: setMass, min: 0.5, max: 20, step: 0.5, display: `${mass} kg` },
            ...(simType === 'projectile' || simType === 'waves' ? [
              { label: '🚀 Velocity (m/s)', value: velocity, set: setVelocity, min: 1, max: 50, step: 1, display: `${velocity} m/s` },
            ] : []),
            ...(simType === 'projectile' ? [
              { label: '📐 Launch Angle', value: angle, set: setAngle, min: 0, max: 90, step: 1, display: `${angle}°` },
            ] : []),
          ].map(param => (
            <div key={param.label} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{param.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f0f4ff' }}>{param.display}</span>
              </div>
              <input type="range" min={param.min} max={param.max} step={param.step} value={param.value}
                onChange={e => param.set(Number(e.target.value))} className="slider-custom" />
            </div>
          ))}
        </div>

        {/* Formulas */}
        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '14px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', marginBottom: '10px' }}>📐 Key Formulas</h3>
          {simType === 'gravity' && ['F = mg', 'v = gt', 'h = ½gt²'].map(f => <div key={f} style={{ fontSize: '13px', fontFamily: 'monospace', color: '#cbd5e1', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{f}</div>)}
          {simType === 'projectile' && ['x = v₀cos(θ)t', 'y = v₀sin(θ)t - ½gt²', 'Range = v₀²sin(2θ)/g'].map(f => <div key={f} style={{ fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1', padding: '4px 0' }}>{f}</div>)}
          {simType === 'pendulum' && ['T = 2π√(L/g)', 'ω = -g/L × sin(θ)', 'E = ½mv²+mgh'].map(f => <div key={f} style={{ fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1', padding: '4px 0' }}>{f}</div>)}
          {simType === 'waves' && ['v = fλ', 'I ∝ A²', 'Δφ = 2πd/λ'].map(f => <div key={f} style={{ fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1', padding: '4px 0' }}>{f}</div>)}
        </div>
      </div>
    </div>
  );
}
