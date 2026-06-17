'use client';
import { useState, useRef, useEffect } from 'react';

export default function ClimateSimPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [co2, setCo2] = useState(400);
  const [deforestation, setDeforestation] = useState(20);
  const [industrialization, setIndustrialization] = useState(50);
  const [renewableEnergy, setRenewableEnergy] = useState(20);
  const [timeRef2] = useState({ val: 0 });

  const temp = (co2 - 280) * 0.008 + deforestation * 0.04 + industrialization * 0.03 - renewableEnergy * 0.02;
  const seaLevel = Math.max(0, (temp - 0.5) * 8);
  const iceExtent = Math.max(0, 100 - temp * 15);
  const biodiversity = Math.max(0, 100 - deforestation * 0.8 - (temp - 1) * 5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    let t = 0;
    let animId: number;

    const draw = () => {
      t += 0.02;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Sky gradient (changes with temperature)
      const skyRed = Math.min(255, 15 + temp * 20);
      const skyGreen = Math.max(20, 60 - temp * 5);
      const skyBlue = Math.max(20, 120 - temp * 15);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      skyGrad.addColorStop(0, `rgb(${Math.round(skyRed * 0.3)},${Math.round(skyGreen * 0.4)},${Math.round(skyBlue)})`);
      skyGrad.addColorStop(1, `rgb(${Math.round(skyRed * 0.6)},${Math.round(skyGreen * 0.8)},${Math.round(skyBlue * 1.1)})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Sun (gets redder and hotter with temperature)
      const sunColor = temp > 2 ? '#ef4444' : temp > 1 ? '#f97316' : '#fbbf24';
      ctx.shadowColor = sunColor; ctx.shadowBlur = 40 + temp * 10;
      ctx.fillStyle = sunColor;
      ctx.beginPath(); ctx.arc(W * 0.85, 80, 40 + temp * 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // CO2 haze overlay
      if (temp > 1) {
        ctx.fillStyle = `rgba(255,100,0,${Math.min(0.15, (temp - 1) * 0.05)})`;
        ctx.fillRect(0, 0, W, H * 0.7);
      }

      // Sea level indicator
      const seaY = H * 0.7 - seaLevel * 2;
      const seaGrad = ctx.createLinearGradient(0, seaY, 0, H);
      seaGrad.addColorStop(0, `rgba(59,130,${Math.round(246 - temp * 20)},0.9)`);
      seaGrad.addColorStop(1, `rgba(14,60,${Math.round(120 - temp * 10)},1)`);
      ctx.fillStyle = seaGrad;
      ctx.beginPath();
      ctx.moveTo(0, seaY + Math.sin(t) * 8);
      for (let x = 0; x <= W; x += 10) {
        ctx.lineTo(x, seaY + Math.sin(t + x * 0.02) * 8);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

      // Land
      const landY = H * 0.68;
      const greenness = Math.max(0, biodiversity / 100);
      ctx.fillStyle = `rgb(${Math.round(80 + (1 - greenness) * 80)},${Math.round(120 * greenness + 40)},30)`;
      ctx.beginPath();
      ctx.moveTo(0, landY);
      for (let x = 0; x <= W; x += 10) {
        ctx.lineTo(x, landY + Math.sin(x * 0.015) * 15 + 5);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

      // Trees (reduce with deforestation)
      const treeCount = Math.round((100 - deforestation) / 15);
      for (let i = 0; i < treeCount; i++) {
        const tx = 60 + i * (W / (treeCount + 1));
        const ty = landY - 10;
        const treeHealth = Math.max(0.1, greenness);
        ctx.fillStyle = `rgba(${Math.round(30 + (1-treeHealth)*60)},${Math.round(120 * treeHealth)},30,0.9)`;
        // Trunk
        ctx.fillStyle = '#5c3d0a'; ctx.fillRect(tx - 4, ty, 8, 20);
        // Canopy
        ctx.fillStyle = `rgb(${Math.round(30 + (1-treeHealth)*80)},${Math.round(110 * treeHealth + 20)},30)`;
        ctx.beginPath(); ctx.arc(tx, ty - 20, 22 * treeHealth + 8, 0, Math.PI * 2); ctx.fill();
      }

      // Ice caps (shrink with temperature)
      const iceWidth = (iceExtent / 100) * W * 0.3;
      ctx.fillStyle = `rgba(200,230,255,${iceExtent / 100})`;
      ctx.beginPath(); ctx.ellipse(W * 0.15, H * 0.12, iceWidth, 25, 0, 0, Math.PI * 2); ctx.fill();

      // Factories
      const factoryCount = Math.round(industrialization / 25);
      for (let i = 0; i < factoryCount; i++) {
        const fx = W * 0.1 + i * 80;
        ctx.fillStyle = '#374151'; ctx.fillRect(fx, landY - 35, 28, 35);
        // Smoke
        for (let s = 0; s < 4; s++) {
          const sx = fx + 14 + Math.sin(t + s + i) * 8;
          const sy = landY - 35 - s * 20;
          ctx.fillStyle = `rgba(100,100,100,${0.4 - s * 0.08})`;
          ctx.beginPath(); ctx.arc(sx, sy, 10 + s * 3, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Wind turbines (renewable energy)
      const turbineCount = Math.round(renewableEnergy / 20);
      for (let i = 0; i < turbineCount; i++) {
        const tx = W * 0.5 + i * 70;
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tx, landY - 5); ctx.lineTo(tx, landY - 55); ctx.stroke();
        ctx.save(); ctx.translate(tx, landY - 55);
        ctx.rotate(t * (1 + renewableEnergy * 0.02));
        for (let b = 0; b < 3; b++) {
          ctx.rotate(Math.PI * 2 / 3);
          ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18); ctx.stroke();
        }
        ctx.restore();
      }

      // HUD labels
      ctx.fillStyle = '#f0f4ff'; ctx.font = 'bold 13px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`🌡️ Temp: +${temp.toFixed(1)}°C`, 16, 16);
      ctx.fillStyle = temp > 2 ? '#ef4444' : temp > 1 ? '#f97316' : '#10b981';
      ctx.fillText(`🌊 Sea Rise: +${seaLevel.toFixed(0)}cm`, 16, 38);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`🧊 Ice: ${iceExtent.toFixed(0)}%  🌿 Biodiv: ${biodiversity.toFixed(0)}%`, 16, 60);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [co2, deforestation, industrialization, renewableEnergy, temp, seaLevel, iceExtent, biodiversity]);

  const riskLevel = temp < 1 ? 'Low' : temp < 2 ? 'Moderate' : temp < 3 ? 'High' : 'Critical';
  const riskColor = temp < 1 ? '#10b981' : temp < 2 ? '#f59e0b' : temp < 3 ? '#f97316' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            🌍 <span className="gradient-text">Climate Change Simulator</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Adjust environmental factors and see their impact on Earth's climate in real time.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          <div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '460px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', display: 'block', marginBottom: '16px' }} />
            {/* Risk indicator */}
            <div style={{ padding: '16px', borderRadius: '12px', background: `${riskColor}10`, border: `1px solid ${riskColor}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: riskColor }}>Climate Risk: {riskLevel}</span>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  {temp < 1 ? 'Climate is stable. Good environmental policies in place.' :
                   temp < 2 ? 'Concerning changes. Action needed to prevent further warming.' :
                   temp < 3 ? 'High risk! Significant impacts on ecosystems and sea levels.' :
                   '🚨 Crisis level! Immediate and drastic action required!'}
                </p>
              </div>
              <div style={{ fontSize: '40px' }}>{temp < 1 ? '😊' : temp < 2 ? '😐' : temp < 3 ? '😰' : '🆘'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', flex: 1 }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '14px', textTransform: 'uppercase' }}>Environmental Controls</h3>
              {[
                { label: '💨 CO₂ Levels (ppm)', value: co2, set: setCo2, min: 280, max: 800, step: 10, color: '#f97316', fmt: (v: number) => `${v}ppm` },
                { label: '🌲 Deforestation Rate', value: deforestation, set: setDeforestation, min: 0, max: 100, step: 5, color: '#ef4444', fmt: (v: number) => `${v}%` },
                { label: '🏭 Industrialization', value: industrialization, set: setIndustrialization, min: 0, max: 100, step: 5, color: '#94a3b8', fmt: (v: number) => `${v}%` },
                { label: '🌱 Renewable Energy', value: renewableEnergy, set: setRenewableEnergy, min: 0, max: 100, step: 5, color: '#10b981', fmt: (v: number) => `${v}%` },
              ].map(p => (
                <div key={p.label} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{p.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: p.color }}>{p.fmt(p.value)}</span>
                  </div>
                  <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
                    onChange={e => p.set(Number(e.target.value))} className="slider-custom" />
                </div>
              ))}
            </div>
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>📊 Current Metrics</h3>
              {[
                { label: 'Temp Increase', value: `+${temp.toFixed(2)}°C`, color: temp < 1 ? '#10b981' : temp < 2 ? '#f59e0b' : '#ef4444' },
                { label: 'Sea Level Rise', value: `+${seaLevel.toFixed(0)} cm`, color: '#3b82f6' },
                { label: 'Arctic Ice Coverage', value: `${iceExtent.toFixed(0)}%`, color: '#06b6d4' },
                { label: 'Biodiversity Index', value: `${biodiversity.toFixed(0)}%`, color: '#10b981' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                  <span style={{ color: '#94a3b8' }}>{m.label}</span>
                  <span style={{ fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
