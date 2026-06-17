'use client';
import { useState, useRef, useEffect } from 'react';

export default function FinanceSimPage() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(20);
  const [monthlyContrib, setMonthlyContrib] = useState(500);
  const [simType, setSimType] = useState<'compound' | 'stock' | 'savings'>('compound');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [results, setResults] = useState({ finalAmount: 0, totalContributed: 0, totalInterest: 0, multiplier: 0 });

  useEffect(() => {
    // Calculate results
    let final = 0;
    let totalContrib = principal;

    if (simType === 'compound') {
      // Compound interest with monthly contributions: FV = P(1+r/n)^nt + PMT*[(1+r/n)^nt - 1]/(r/n)
      const n = 12, r = rate / 100, t = years;
      final = principal * Math.pow(1 + r / n, n * t) + monthlyContrib * (Math.pow(1 + r / n, n * t) - 1) / (r / n);
      totalContrib = principal + monthlyContrib * 12 * years;
    } else if (simType === 'savings') {
      const r = rate / 100 / 12;
      final = principal * Math.pow(1 + r, years * 12) + monthlyContrib * (Math.pow(1 + r, years * 12) - 1) / r;
      totalContrib = principal + monthlyContrib * 12 * years;
    } else {
      // Stock market (variable returns simulation)
      final = principal * Math.pow(1 + rate / 100, years);
      totalContrib = principal;
    }

    setResults({
      finalAmount: Math.round(final),
      totalContributed: Math.round(totalContrib),
      totalInterest: Math.round(final - totalContrib),
      multiplier: Math.round((final / totalContrib) * 10) / 10
    });

    // Draw chart
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    const pad = { top: 30, right: 30, bottom: 50, left: 80 };
    const cw = W - pad.left - pad.right, ch = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, W, H);

    // Generate data points
    const points: { year: number; value: number; contrib: number }[] = [];
    for (let y = 0; y <= years; y++) {
      let val = 0, contrib = principal + monthlyContrib * 12 * y;
      if (simType === 'compound' || simType === 'savings') {
        const n = 12, r = rate / 100, t = y;
        val = principal * Math.pow(1 + r / n, n * t) + monthlyContrib * (Math.pow(1 + r / n, n * t) - 1) / (r / n);
      } else {
        val = principal * Math.pow(1 + rate / 100, y);
        contrib = principal;
      }
      points.push({ year: y, value: Math.round(val), contrib: Math.round(contrib) });
    }

    const maxVal = Math.max(...points.map(p => p.value));

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + ch - (i / 5) * ch;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
      const val = (i / 5) * maxVal;
      ctx.fillStyle = '#4b5563'; ctx.font = '11px Inter'; ctx.textAlign = 'right';
      ctx.fillText('$' + (val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val.toFixed(0)), pad.left - 6, y + 4);
    }

    // X labels
    ctx.fillStyle = '#4b5563'; ctx.textAlign = 'center';
    for (let y = 0; y <= years; y += Math.max(1, Math.floor(years / 5))) {
      const px = pad.left + (y / years) * cw;
      ctx.fillText(`Y${y}`, px, H - pad.bottom + 18);
    }

    // Contributed area
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + ch);
    points.forEach(p => {
      const px = pad.left + (p.year / years) * cw;
      const py = pad.top + ch - (p.contrib / maxVal) * ch;
      ctx.lineTo(px, py);
    });
    ctx.lineTo(pad.left + cw, pad.top + ch);
    ctx.closePath();
    const contribGrad = ctx.createLinearGradient(0, 0, 0, H);
    contribGrad.addColorStop(0, 'rgba(59,130,246,0.3)');
    contribGrad.addColorStop(1, 'rgba(59,130,246,0.05)');
    ctx.fillStyle = contribGrad; ctx.fill();

    // Investment growth area
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + ch);
    points.forEach(p => {
      const px = pad.left + (p.year / years) * cw;
      const py = pad.top + ch - (p.value / maxVal) * ch;
      ctx.lineTo(px, py);
    });
    ctx.lineTo(pad.left + cw, pad.top + ch);
    ctx.closePath();
    const growthGrad = ctx.createLinearGradient(0, 0, 0, H);
    growthGrad.addColorStop(0, 'rgba(16,185,129,0.2)');
    growthGrad.addColorStop(1, 'rgba(16,185,129,0.02)');
    ctx.fillStyle = growthGrad; ctx.fill();

    // Growth line
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5; ctx.shadowColor = '#10b981'; ctx.shadowBlur = 8;
    ctx.beginPath();
    points.forEach((p, i) => {
      const px = pad.left + (p.year / years) * cw;
      const py = pad.top + ch - (p.value / maxVal) * ch;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Contributions line
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath();
    points.forEach((p, i) => {
      const px = pad.left + (p.year / years) * cw;
      const py = pad.top + ch - (p.contrib / maxVal) * ch;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke(); ctx.setLineDash([]);

    // Legend
    ctx.fillStyle = '#10b981'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'left';
    ctx.fillText('━ Total Value', pad.left + 10, pad.top + 16);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('╌ Amount Contributed', pad.left + 130, pad.top + 16);

  }, [principal, rate, years, monthlyContrib, simType]);

  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;

  const SIM_TYPES = [
    { id: 'compound', label: '📈 Compound Interest', desc: 'Monthly compounding with contributions' },
    { id: 'savings', label: '🏦 Savings Account', desc: 'Regular savings with interest' },
    { id: 'stock', label: '📊 Stock Market', desc: 'Lump sum investment growth' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            💰 <span className="gradient-text">Finance Simulator</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>See the power of compound interest and investment growth in real time.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          {/* Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '400px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', display: 'block' }} />

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
              {[
                { label: 'Final Amount', value: fmt(results.finalAmount), color: '#10b981' },
                { label: 'Total Invested', value: fmt(results.totalContributed), color: '#3b82f6' },
                { label: 'Interest Earned', value: fmt(results.totalInterest), color: '#f59e0b' },
                { label: 'Money Multiplied', value: `${results.multiplier}×`, color: '#ec4899' },
              ].map(m => (
                <div key={m.label} style={{ padding: '16px', borderRadius: '12px', background: '#111827', border: `1px solid ${m.color}20`, textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: m.color, fontFamily: 'Outfit,sans-serif' }}>{m.value}</div>
                  <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>💡 Key Insight</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                By investing ${principal.toLocaleString()} initially and ${monthlyContrib}/month at {rate}% annual return for {years} years,
                your money grows to <strong style={{ color: '#10b981' }}>{fmt(results.finalAmount)}</strong> — that's <strong style={{ color: '#f59e0b' }}>{fmt(results.totalInterest)}</strong> in interest earned on top of your <strong style={{ color: '#3b82f6' }}>{fmt(results.totalContributed)}</strong> invested.
                This demonstrates the power of <strong style={{ color: '#f0f4ff' }}>compound interest</strong>!
              </p>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Sim type */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' }}>Simulation Type</h3>
              {SIM_TYPES.map(st => (
                <button key={st.id} onClick={() => setSimType(st.id as any)} style={{ display: 'block', width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${simType === st.id ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.04)'}`, background: simType === st.id ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', marginBottom: '6px', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: simType === st.id ? '#f0f4ff' : '#94a3b8' }}>{st.label}</div>
                  <div style={{ fontSize: '11px', color: '#4b5563' }}>{st.desc}</div>
                </button>
              ))}
            </div>

            {/* Parameters */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', flex: 1 }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '14px', textTransform: 'uppercase' }}>Parameters</h3>
              {[
                { label: '💰 Initial Investment', value: principal, set: setPrincipal, min: 1000, max: 1000000, step: 1000, fmt: (v: number) => `$${v.toLocaleString()}` },
                { label: '📅 Monthly Contribution', value: monthlyContrib, set: setMonthlyContrib, min: 0, max: 10000, step: 100, fmt: (v: number) => `$${v.toLocaleString()}` },
                { label: '📈 Annual Return Rate', value: rate, set: setRate, min: 0.5, max: 30, step: 0.5, fmt: (v: number) => `${v}%` },
                { label: '⏳ Time Period', value: years, set: setYears, min: 1, max: 50, step: 1, fmt: (v: number) => `${v} years` },
              ].map(p => (
                <div key={p.label} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{p.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>{p.fmt(p.value)}</span>
                  </div>
                  <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
                    onChange={e => p.set(Number(e.target.value))} className="slider-custom" />
                </div>
              ))}
            </div>

            {/* Key Formulas */}
            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '14px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', marginBottom: '10px' }}>📐 Formula</h3>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', lineHeight: 2 }}>
                <div>A = P(1 + r/n)^(nt)</div>
                <div>+ PMT × [(1+r/n)^(nt)-1]</div>
                <div style={{ marginTop: '8px', color: '#4b5563' }}>P = Principal, r = Rate</div>
                <div style={{ color: '#4b5563' }}>n = 12 (monthly), t = Years</div>
                <div style={{ color: '#4b5563' }}>PMT = Monthly contribution</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
