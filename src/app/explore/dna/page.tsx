'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const INFO_CARDS = [
  {
    id: 'base-pairs',
    title: 'Base Pairs',
    icon: '🧬',
    color: '#06b6d4',
    summary: 'The rungs of the DNA ladder',
    detail:
      'DNA contains four nitrogenous bases: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C). A always pairs with T via two hydrogen bonds, and G always pairs with C via three hydrogen bonds. This complementary base-pairing — discovered by Chargaff — is the molecular foundation of heredity. The human genome contains ~3.2 billion base pairs, encoding ~20,000 genes.',
  },
  {
    id: 'double-helix',
    title: 'Double Helix',
    icon: '🌀',
    color: '#7c3aed',
    summary: 'The iconic twisted ladder structure',
    detail:
      'The double helix model was proposed by Watson and Crick in 1953, using X-ray crystallography data from Rosalind Franklin. Two antiparallel polynucleotide strands wind around a common axis in a right-handed helix. The helix makes one complete turn every 10 base pairs (~3.4 nm), with a diameter of ~2 nm. The major groove (wider) and minor groove (narrower) are critical sites for protein binding.',
  },
  {
    id: 'nucleotides',
    title: 'Nucleotides',
    icon: '⚛️',
    color: '#10b981',
    summary: 'The building blocks of DNA',
    detail:
      'Each nucleotide consists of three components: a deoxyribose sugar (5-carbon), a phosphate group, and one of the four nitrogenous bases. Nucleotides link together via phosphodiester bonds between the 3′ carbon of one sugar and the 5′ carbon of the next, forming a strand with a 5′ phosphate end and a 3′ hydroxyl end. The sugar-phosphate backbone is hydrophilic; the bases stack hydrophobically inside, stabilising the helix.',
  },
  {
    id: 'replication',
    title: 'Replication',
    icon: '🔄',
    color: '#f59e0b',
    summary: 'Copying DNA with near-perfect fidelity',
    detail:
      'DNA replication is semi-conservative: each new double helix retains one parental strand. Helicase unwinds the helix at the replication fork. Primase lays down short RNA primers, and DNA Polymerase III synthesises new strands 5′→3′. The leading strand is synthesised continuously; the lagging strand is synthesised in Okazaki fragments. Proofreading and mismatch repair achieve error rates as low as 1 in 10⁹ base pairs.',
  },
];

const KEY_FACTS = [
  'If all the DNA in a single human cell were stretched out, it would be ~2 metres long.',
  'DNA replication in humans occurs at ~1,000 nucleotides per second per replication fork.',
  'The human genome shares ~98.7 % of its DNA sequence with chimpanzees.',
  'Mitochondria have their own circular DNA (~16,500 bp) inherited maternally.',
  'UV radiation can cause thymine dimers — adjacent thymines fuse, causing mutations if unrepaired.',
];

export default function DNAPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const angleRef = useRef<number>(0);
  const speedRef = useRef<number>(0.4);

  const [speed, setSpeed] = useState<number>(0.4);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Keep speedRef in sync with state
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : 600;
      canvas.height = 440;
    };
    resize();
    window.addEventListener('resize', resize);

    const BASE_COLORS: Record<string, [string, string]> = {
      AT: ['#06b6d4', '#0891b2'],
      GC: ['#a855f7', '#ec4899'],
    };

    const BASE_SEQUENCE = ['AT', 'GC', 'AT', 'GC', 'GC', 'AT', 'GC', 'AT', 'GC', 'AT'];

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#080b14');
      bg.addColorStop(1, '#0d1120');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      angleRef.current += speedRef.current * 0.02;
      const angle = angleRef.current;

      const cx = W / 2;
      const numTurns = 3;
      const totalPairs = numTurns * 10;
      const helixHeight = H - 60;
      const yStart = 30;
      const amplitude = Math.min(W * 0.18, 80);
      const pairSpacing = helixHeight / totalPairs;

      // Glow effect on strands
      for (let pass = 0; pass < 2; pass++) {
        const isGlow = pass === 0;
        ctx.save();
        if (isGlow) {
          ctx.filter = 'blur(4px)';
          ctx.globalAlpha = 0.35;
        }

        // Strand 1 (teal/blue)
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = isGlow ? 6 : 3;
        ctx.lineCap = 'round';
        for (let i = 0; i <= totalPairs * 4; i++) {
          const t = i / (totalPairs * 4);
          const y = yStart + t * helixHeight;
          const x = cx + amplitude * Math.sin(angle + t * Math.PI * 2 * numTurns);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Strand 2 (purple), offset by π
        ctx.beginPath();
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = isGlow ? 6 : 3;
        for (let i = 0; i <= totalPairs * 4; i++) {
          const t = i / (totalPairs * 4);
          const y = yStart + t * helixHeight;
          const x = cx + amplitude * Math.sin(angle + t * Math.PI * 2 * numTurns + Math.PI);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.restore();
      }

      // Draw base pair rungs
      for (let p = 0; p < totalPairs; p++) {
        const t = (p + 0.5) / totalPairs;
        const y = yStart + t * helixHeight;
        const x1 = cx + amplitude * Math.sin(angle + t * Math.PI * 2 * numTurns);
        const x2 = cx + amplitude * Math.sin(angle + t * Math.PI * 2 * numTurns + Math.PI);

        const depthFactor = Math.sin(angle + t * Math.PI * 2 * numTurns);
        const opacity = 0.45 + 0.55 * ((depthFactor + 1) / 2);

        const bpType = BASE_SEQUENCE[p % BASE_SEQUENCE.length];
        const [colorA, colorB] = BASE_COLORS[bpType];

        // Rung gradient
        const grad = ctx.createLinearGradient(x1, y, x2, y);
        grad.addColorStop(0, colorA + Math.round(opacity * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(0.5, '#ffffff' + Math.round(opacity * 60).toString(16).padStart(2, '0'));
        grad.addColorStop(1, colorB + Math.round(opacity * 255).toString(16).padStart(2, '0'));

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = opacity;
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Node dots
        const dotR = 4.5;
        [[x1, colorA], [x2, colorB]].forEach(([dx, dc]) => {
          ctx.beginPath();
          ctx.arc(dx as number, y, dotR, 0, Math.PI * 2);
          const dg = ctx.createRadialGradient(
            dx as number, y, 0,
            dx as number, y, dotR
          );
          dg.addColorStop(0, '#ffffff');
          dg.addColorStop(1, dc as string);
          ctx.fillStyle = dg;
          ctx.globalAlpha = opacity;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      // Legend
      const legendItems = [
        { label: 'A–T pair', color: '#06b6d4' },
        { label: 'G–C pair', color: '#a855f7' },
      ];
      legendItems.forEach((item, i) => {
        const lx = 16 + i * 110;
        const ly = H - 14;
        ctx.beginPath();
        ctx.arc(lx, ly, 6, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.font = '12px Outfit, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(item.label, lx + 10, ly + 4);
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const activeInfo = INFO_CARDS.find((c) => c.id === activeCard);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080b14',
        color: '#f0f4ff',
        fontFamily: "'Outfit', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          position: 'relative',
          padding: '28px 32px 0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 24,
        }}
      >
        {/* Back button */}
        <Link
          href="/subjects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 10,
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#a78bfa',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            transition: 'background 0.2s',
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          ← Back
        </Link>

        <div style={{ flex: 1 }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 14px',
              borderRadius: 999,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              fontSize: 12,
              fontWeight: 600,
              color: '#10b981',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            <span>🧬</span> Biology · Molecular
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 46px)',
              fontWeight: 800,
              margin: '0 0 8px',
              background: 'linear-gradient(135deg, #f0f4ff 0%, #a78bfa 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.15,
            }}
          >
            DNA Structure
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, maxWidth: 560 }}>
            Explore the double helix — the molecular blueprint of all known life.
          </p>
        </div>
      </div>

      {/* ── Canvas Section ── */}
      <div
        style={{
          margin: '32px auto',
          maxWidth: 900,
          padding: '0 20px',
        }}
      >
        <div
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(124,58,237,0.2)',
            background: 'linear-gradient(135deg, #111827 0%, #0d1120 100%)',
            boxShadow: '0 0 60px rgba(124,58,237,0.12), 0 0 120px rgba(6,182,212,0.06)',
            position: 'relative',
          }}
        >
          {/* Decorative corner glow */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: 440 }}
          />

          {/* Speed Control */}
          <div
            style={{
              padding: '16px 24px 20px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              ⚡ Rotation Speed
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#7c3aed',
                cursor: 'pointer',
                height: 4,
              }}
            />
            <span
              style={{
                color: '#a78bfa',
                fontSize: 13,
                fontWeight: 700,
                minWidth: 36,
                textAlign: 'right',
              }}
            >
              {speed.toFixed(1)}×
            </span>
          </div>
        </div>
      </div>

      {/* ── Info Cards ── */}
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 20px',
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
            color: '#f0f4ff',
          }}
        >
          Explore Topics
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {INFO_CARDS.map((card) => {
            const isActive = activeCard === card.id;
            const isHovered = hoveredCard === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setActiveCard(isActive ? null : card.id)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${card.color}22, ${card.color}11)`
                    : isHovered
                    ? 'rgba(255,255,255,0.05)'
                    : '#111827',
                  border: isActive
                    ? `1.5px solid ${card.color}66`
                    : '1.5px solid rgba(255,255,255,0.06)',
                  borderRadius: 14,
                  padding: '18px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.22s ease',
                  transform: isHovered || isActive ? 'translateY(-2px)' : 'none',
                  boxShadow: isActive
                    ? `0 0 24px ${card.color}22`
                    : isHovered
                    ? '0 4px 20px rgba(0,0,0,0.4)'
                    : 'none',
                  outline: 'none',
                  color: '#f0f4ff',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isActive ? card.color : '#f0f4ff',
                    marginBottom: 4,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                  {card.summary}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div
          style={{
            maxHeight: activeInfo ? 300 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
            marginBottom: activeInfo ? 28 : 0,
          }}
        >
          {activeInfo && (
            <div
              style={{
                background: `linear-gradient(135deg, ${activeInfo.color}14, #111827)`,
                border: `1px solid ${activeInfo.color}33`,
                borderRadius: 16,
                padding: '22px 24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Accent line */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: activeInfo.color,
                  borderRadius: '16px 0 0 16px',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{activeInfo.icon}</span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: activeInfo.color,
                  }}
                >
                  {activeInfo.title}
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  color: '#cbd5e1',
                  fontSize: 14.5,
                  lineHeight: 1.75,
                }}
              >
                {activeInfo.detail}
              </p>
            </div>
          )}
        </div>

        {/* ── Key Facts ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #111827, #0d1120)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 18,
            padding: '24px 28px',
            marginBottom: 48,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 18,
              margin: '0 0 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#f0f4ff',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                fontSize: 16,
              }}
            >
              💡
            </span>
            Key Facts
          </h2>

          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {KEY_FACTS.map((fact, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#fff',
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.65 }}>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
