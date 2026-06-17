'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
type CircuitType = 'led' | 'series' | 'parallel' | 'rc';

interface CircuitDemo {
  id: CircuitType;
  name: string;
  description: string;
  icon: string;
  defaultVoltage: number;
  defaultResistance: number;
  hasCapacitor: boolean;
  capacitance?: number; // µF
}

interface Dot {
  t: number;   // 0–1 along path
  speed: number;
}

// ─────────────────────────────────────────────
//  Circuit definitions
// ─────────────────────────────────────────────
const CIRCUITS: CircuitDemo[] = [
  {
    id: 'led',
    name: 'LED Circuit',
    description: 'Battery → Resistor → LED',
    icon: '💡',
    defaultVoltage: 5,
    defaultResistance: 220,
    hasCapacitor: false,
  },
  {
    id: 'series',
    name: 'Series Circuit',
    description: 'Battery → R₁ → R₂ → R₃',
    icon: '🔗',
    defaultVoltage: 9,
    defaultResistance: 300,
    hasCapacitor: false,
  },
  {
    id: 'parallel',
    name: 'Parallel Circuit',
    description: 'Battery → R₁ ‖ R₂',
    icon: '⚡',
    defaultVoltage: 6,
    defaultResistance: 100,
    hasCapacitor: false,
  },
  {
    id: 'rc',
    name: 'RC Circuit',
    description: 'Battery → Resistor → Capacitor',
    icon: '🔋',
    defaultVoltage: 12,
    defaultResistance: 1000,
    hasCapacitor: true,
    capacitance: 100,
  },
];

// ─────────────────────────────────────────────
//  Canvas drawing helpers
// ─────────────────────────────────────────────

const W = 700;
const H = 440;

function drawWire(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawBattery(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = '#f0f4ff';
  ctx.lineWidth = 2;
  // Long line (positive)
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy - 18);
  ctx.lineTo(cx - 2, cy + 18);
  ctx.stroke();
  // Short line (negative)
  ctx.beginPath();
  ctx.moveTo(cx + 6, cy - 10);
  ctx.lineTo(cx + 6, cy + 10);
  ctx.stroke();
  // More plates for bigger battery look
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 18);
  ctx.lineTo(cx - 10, cy + 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy - 10);
  ctx.lineTo(cx - 18, cy + 10);
  ctx.stroke();
  // Plus/minus labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Outfit, sans-serif';
  ctx.fillText('+', cx - 22, cy - 22);
  ctx.fillText('−', cx + 8, cy - 12);
}

function drawResistor(ctx: CanvasRenderingContext2D, cx: number, cy: number, label?: string) {
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  const w = 40;
  const h = 16;
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  if (label) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + h / 2 + 14);
  }
  ctx.textAlign = 'left';
}

function drawZigzagResistor(ctx: CanvasRenderingContext2D, cx: number, cy: number, label?: string) {
  const halfW = 30;
  const steps = 6;
  const amplitude = 10;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, cy);
  for (let i = 0; i <= steps; i++) {
    const x = cx - halfW + (i * (halfW * 2)) / steps;
    const y = i % 2 === 0 ? cy - amplitude : cy + amplitude;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(cx + halfW, cy);
  ctx.stroke();
  if (label) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + amplitude + 14);
    ctx.textAlign = 'left';
  }
}

function drawLED(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = '#10b981';
  ctx.fillStyle = 'rgba(16,185,129,0.15)';
  ctx.lineWidth = 2;
  // Triangle body
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 14);
  ctx.lineTo(cx + 14, cy);
  ctx.lineTo(cx - 14, cy + 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Vertical bar
  ctx.beginPath();
  ctx.moveTo(cx + 14, cy - 14);
  ctx.lineTo(cx + 14, cy + 14);
  ctx.stroke();
  // Arrows (light rays)
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 2; i++) {
    const ox = cx + 20 + i * 8;
    const oy = cy - 16 - i * 4;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + 8, oy - 8);
    ctx.stroke();
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(ox + 8, oy - 8);
    ctx.lineTo(ox + 4, oy - 8);
    ctx.lineTo(ox + 8, oy - 4);
    ctx.closePath();
    ctx.fillStyle = '#34d399';
    ctx.fill();
  }
  ctx.fillStyle = '#10b981';
  ctx.font = '11px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LED', cx, cy + 28);
  ctx.textAlign = 'left';
}

function drawCapacitor(ctx: CanvasRenderingContext2D, cx: number, cy: number, label?: string) {
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2.5;
  const plateH = 28;
  const gap = 8;
  // Left plate
  ctx.beginPath();
  ctx.moveTo(cx - gap / 2, cy - plateH / 2);
  ctx.lineTo(cx - gap / 2, cy + plateH / 2);
  ctx.stroke();
  // Right plate
  ctx.beginPath();
  ctx.moveTo(cx + gap / 2, cy - plateH / 2);
  ctx.lineTo(cx + gap / 2, cy + plateH / 2);
  ctx.stroke();
  if (label) {
    ctx.fillStyle = '#3b82f6';
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + plateH / 2 + 14);
    ctx.textAlign = 'left';
  }
}

// ─────────────────────────────────────────────
//  Path interpolation helper
// ─────────────────────────────────────────────
type Segment = { x1: number; y1: number; x2: number; y2: number };

function getTotalLength(segs: Segment[]) {
  return segs.reduce((acc, s) => {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);
}

function getPosAtT(segs: Segment[], t: number): { x: number; y: number } {
  const total = getTotalLength(segs);
  let target = t * total;
  for (const s of segs) {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (target <= len) {
      return { x: s.x1 + (dx * target) / len, y: s.y1 + (dy * target) / len };
    }
    target -= len;
  }
  return { x: segs[segs.length - 1].x2, y: segs[segs.length - 1].y2 };
}

// ─────────────────────────────────────────────
//  Circuit drawing functions
// ─────────────────────────────────────────────

interface DrawResult {
  segments: Segment[];
  extraPaths?: Segment[][];
}

function drawLEDCircuit(ctx: CanvasRenderingContext2D): DrawResult {
  // Layout: left battery, top wire, right resistor, bottom wire, LED on right side
  const bx = 130, by = 220;
  const topY = 100, botY = 340;
  const leftX = 100, rightX = 570;
  const resX = 360, resY = topY;
  const ledX = 510, ledY = 220;

  // Wires
  drawWire(ctx, leftX, topY, rightX, topY);
  drawWire(ctx, leftX, botY, rightX, botY);
  drawWire(ctx, leftX, topY, leftX, by - 28);
  drawWire(ctx, leftX, by + 28, leftX, botY);
  drawWire(ctx, rightX, topY, rightX, ledY - 22);
  drawWire(ctx, rightX, ledY + 22, rightX, botY);
  // wire from resistor to right side (top)
  drawWire(ctx, resX + 30, topY, rightX, topY);
  drawWire(ctx, leftX, topY, resX - 30, topY);

  // Components
  drawBattery(ctx, bx, by);
  drawZigzagResistor(ctx, resX, resY, 'R');
  drawLED(ctx, ledX, ledY);

  // Labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Outfit, sans-serif';
  ctx.fillText('Battery', leftX - 18, by - 38);

  const segments: Segment[] = [
    { x1: leftX, y1: by - 28, x2: leftX, y2: topY },
    { x1: leftX, y1: topY, x2: resX - 30, y2: topY },
    { x1: resX + 30, y1: topY, x2: rightX, y2: topY },
    { x1: rightX, y1: topY, x2: rightX, y2: ledY - 22 },
    { x1: rightX, y1: ledY + 22, x2: rightX, y2: botY },
    { x1: rightX, y1: botY, x2: leftX, y2: botY },
    { x1: leftX, y1: botY, x2: leftX, y2: by + 28 },
  ];
  return { segments };
}

function drawSeriesCircuit(ctx: CanvasRenderingContext2D): DrawResult {
  const leftX = 80, rightX = 600;
  const topY = 100, botY = 340;
  const by = 220;
  const bx = leftX;

  const r1x = 240, r2x = 360, r3x = 480;
  const ry = topY;

  drawWire(ctx, leftX, topY, rightX, topY);
  drawWire(ctx, leftX, botY, rightX, botY);
  drawWire(ctx, leftX, topY, leftX, by - 28);
  drawWire(ctx, leftX, by + 28, leftX, botY);
  drawWire(ctx, rightX, topY, rightX, botY);

  drawBattery(ctx, bx, by);
  drawZigzagResistor(ctx, r1x, ry, 'R₁');
  drawZigzagResistor(ctx, r2x, ry, 'R₂');
  drawZigzagResistor(ctx, r3x, ry, 'R₃');

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Outfit, sans-serif';
  ctx.fillText('Battery', leftX - 18, by - 38);

  const segments: Segment[] = [
    { x1: leftX, y1: by - 28, x2: leftX, y2: topY },
    { x1: leftX, y1: topY, x2: r1x - 30, y2: topY },
    { x1: r1x + 30, y1: topY, x2: r2x - 30, y2: topY },
    { x1: r2x + 30, y1: topY, x2: r3x - 30, y2: topY },
    { x1: r3x + 30, y1: topY, x2: rightX, y2: topY },
    { x1: rightX, y1: topY, x2: rightX, y2: botY },
    { x1: rightX, y1: botY, x2: leftX, y2: botY },
    { x1: leftX, y1: botY, x2: leftX, y2: by + 28 },
  ];
  return { segments };
}

function drawParallelCircuit(ctx: CanvasRenderingContext2D): DrawResult {
  const leftX = 80, rightX = 580;
  const topY = 80, botY = 360;
  const by = 220;
  const bx = leftX;

  const juncL = 200;
  const juncR = 480;
  const r1y = 170, r2y = 270;

  // Outer frame
  drawWire(ctx, leftX, topY, rightX, topY);
  drawWire(ctx, leftX, botY, rightX, botY);
  drawWire(ctx, leftX, topY, leftX, by - 28);
  drawWire(ctx, leftX, by + 28, leftX, botY);
  drawWire(ctx, rightX, topY, rightX, botY);

  // Left junction verticals
  drawWire(ctx, juncL, topY, juncL, r1y);
  drawWire(ctx, juncL, r2y, juncL, botY);
  // Right junction verticals
  drawWire(ctx, juncR, topY, juncR, r1y);
  drawWire(ctx, juncR, r2y, juncR, botY);

  // Resistor horizontal wires
  drawWire(ctx, juncL, r1y, juncL + 30 + 10, r1y);
  drawWire(ctx, juncR - 30 - 10, r1y, juncR, r1y);
  drawWire(ctx, juncL, r2y, juncL + 30 + 10, r2y);
  drawWire(ctx, juncR - 30 - 10, r2y, juncR, r2y);

  drawBattery(ctx, bx, by);
  const r1cx = (juncL + juncR) / 2;
  drawZigzagResistor(ctx, r1cx, r1y, 'R₁');
  drawZigzagResistor(ctx, r1cx, r2y, 'R₂');

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Outfit, sans-serif';
  ctx.fillText('Battery', leftX - 18, by - 38);

  // Main path
  const mainSegments: Segment[] = [
    { x1: leftX, y1: by - 28, x2: leftX, y2: topY },
    { x1: leftX, y1: topY, x2: juncL, y2: topY },
    { x1: juncL, y1: topY, x2: juncL, y2: r1y },
    { x1: juncL, y1: r1y, x2: r1cx - 30, y2: r1y },
    { x1: r1cx + 30, y1: r1y, x2: juncR, y2: r1y },
    { x1: juncR, y1: r1y, x2: juncR, y2: topY },
    { x1: juncR, y1: topY, x2: rightX, y2: topY },
    { x1: rightX, y1: topY, x2: rightX, y2: botY },
    { x1: rightX, y1: botY, x2: juncR, y2: botY },
    { x1: juncR, y1: botY, x2: juncR, y2: r2y },
    { x1: juncR, y1: r2y, x2: r1cx + 30, y2: r2y },
    { x1: r1cx - 30, y1: r2y, x2: juncL, y2: r2y },
    { x1: juncL, y1: r2y, x2: juncL, y2: botY },
    { x1: juncL, y1: botY, x2: leftX, y2: botY },
    { x1: leftX, y1: botY, x2: leftX, y2: by + 28 },
  ];

  const path2: Segment[] = [
    { x1: juncL, y1: r2y, x2: juncL, y2: r1y },
  ];

  return { segments: mainSegments, extraPaths: [path2] };
}

function drawRCCircuit(ctx: CanvasRenderingContext2D): DrawResult {
  const leftX = 100, rightX = 580;
  const topY = 100, botY = 340;
  const by = 220;
  const bx = leftX;
  const resX = 300, capX = 480;
  const compY = topY;

  drawWire(ctx, leftX, topY, rightX, topY);
  drawWire(ctx, leftX, botY, rightX, botY);
  drawWire(ctx, leftX, topY, leftX, by - 28);
  drawWire(ctx, leftX, by + 28, leftX, botY);
  drawWire(ctx, rightX, topY, rightX, botY);

  drawBattery(ctx, bx, by);
  drawZigzagResistor(ctx, resX, compY, 'R');
  drawCapacitor(ctx, capX, compY, 'C');

  // Wire between R and C on top
  drawWire(ctx, resX + 30, topY, capX - 10, topY);
  drawWire(ctx, capX + 10, topY, rightX, topY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Outfit, sans-serif';
  ctx.fillText('Battery', leftX - 18, by - 38);

  const segments: Segment[] = [
    { x1: leftX, y1: by - 28, x2: leftX, y2: topY },
    { x1: leftX, y1: topY, x2: resX - 30, y2: topY },
    { x1: resX + 30, y1: topY, x2: capX - 10, y2: topY },
    { x1: capX + 10, y1: topY, x2: rightX, y2: topY },
    { x1: rightX, y1: topY, x2: rightX, y2: botY },
    { x1: rightX, y1: botY, x2: leftX, y2: botY },
    { x1: leftX, y1: botY, x2: leftX, y2: by + 28 },
  ];
  return { segments };
}

// ─────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────

export default function CircuitsPage() {
  const [activeCircuit, setActiveCircuit] = useState<CircuitType>('led');
  const [voltage, setVoltage] = useState(5);
  const [resistance, setResistance] = useState(220);
  const [isAnimating, setIsAnimating] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dotsRef = useRef<Dot[]>([]);
  const segmentsRef = useRef<Segment[]>([]);
  const extraPathsRef = useRef<Segment[][]>([]);
  const extraDotsRef = useRef<Dot[][]>([]);

  const current = voltage / resistance;
  const circuitDef = CIRCUITS.find(c => c.id === activeCircuit)!;

  // When circuit changes, reset voltage/resistance
  useEffect(() => {
    setVoltage(circuitDef.defaultVoltage);
    setResistance(circuitDef.defaultResistance);
  }, [activeCircuit, circuitDef.defaultVoltage, circuitDef.defaultResistance]);

  // Draw the static circuit and start animation
  const drawCircuit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    let result: DrawResult;
    if (activeCircuit === 'led') result = drawLEDCircuit(ctx);
    else if (activeCircuit === 'series') result = drawSeriesCircuit(ctx);
    else if (activeCircuit === 'parallel') result = drawParallelCircuit(ctx);
    else result = drawRCCircuit(ctx);

    segmentsRef.current = result.segments;
    extraPathsRef.current = result.extraPaths ?? [];

    // Initialize dots
    const dotCount = Math.max(4, Math.min(12, Math.round(current * 1000)));
    dotsRef.current = Array.from({ length: dotCount }, (_, i) => ({
      t: i / dotCount,
      speed: 0.0015 + current * 0.002,
    }));

    extraPathsRef.current.forEach((_, idx) => {
      const ec = Math.max(2, Math.round(dotCount / 2));
      extraDotsRef.current[idx] = Array.from({ length: ec }, (_, i) => ({
        t: i / ec,
        speed: 0.002,
      }));
    });
  }, [activeCircuit, current]);

  useEffect(() => {
    drawCircuit();
  }, [drawCircuit]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) { cancelAnimationFrame(animRef.current); return; }

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw static circuit
      drawCircuit();

      // Draw main dots
      dotsRef.current.forEach(dot => {
        dot.t = (dot.t + dot.speed) % 1;
        const pos = getPosAtT(segmentsRef.current, dot.t);
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 6);
        grad.addColorStop(0, 'rgba(124,58,237,1)');
        grad.addColorStop(1, 'rgba(124,58,237,0)');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#c4b5fd';
        ctx.fill();
      });

      // Draw extra path dots (parallel branch)
      extraPathsRef.current.forEach((path, idx) => {
        const eDots = extraDotsRef.current[idx] ?? [];
        eDots.forEach(dot => {
          dot.t = (dot.t + dot.speed) % 1;
          const pos = getPosAtT(path, dot.t);
          const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 5);
          grad.addColorStop(0, 'rgba(59,130,246,1)');
          grad.addColorStop(1, 'rgba(59,130,246,0)');
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#93c5fd';
          ctx.fill();
        });
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isAnimating, drawCircuit]);

  const formatCurrent = (i: number) => {
    if (i >= 1) return `${i.toFixed(2)} A`;
    if (i >= 0.001) return `${(i * 1000).toFixed(2)} mA`;
    return `${(i * 1_000_000).toFixed(2)} µA`;
  };

  const formatResistance = (r: number) => {
    if (r >= 1000) return `${(r / 1000).toFixed(1)} kΩ`;
    return `${r} Ω`;
  };

  // ── Styles ──────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#080b14',
    color: '#f0f4ff',
    fontFamily: 'Outfit, sans-serif',
    paddingBottom: '60px',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0a0f1e 100%)',
    borderBottom: '1px solid rgba(124,58,237,0.2)',
    padding: '24px 40px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  };

  const backBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#a78bfa',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(124,58,237,0.3)',
    background: 'rgba(124,58,237,0.08)',
    transition: 'all 0.2s',
  };

  const cardStyle: React.CSSProperties = {
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    overflow: 'hidden',
  };

  const selectorBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: '140px',
    padding: '14px 10px',
    borderRadius: '12px',
    border: `1px solid ${active ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
    background: active
      ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.15))'
      : 'rgba(255,255,255,0.03)',
    color: active ? '#f0f4ff' : '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.25s',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    textAlign: 'center',
    boxShadow: active ? '0 0 20px rgba(124,58,237,0.25)' : 'none',
  });

  const statBoxStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '120px',
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    appearance: 'none' as const,
    height: '6px',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
    outline: 'none',
    cursor: 'pointer',
  };

  const infoCardStyle = (key: string): React.CSSProperties => ({
    background: hoveredCard === key
      ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.08))'
      : '#0f172a',
    border: `1px solid ${hoveredCard === key ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
    borderRadius: '14px',
    padding: '20px',
    transition: 'all 0.3s',
    cursor: 'default',
  });

  return (
    <div style={pageStyle}>
      {/* ── Header ── */}
      <header style={headerStyle}>
        <Link href="/subjects" style={backBtnStyle}>← Back</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(22px, 4vw, 32px)',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ⚡ Interactive Circuit Builder
          </h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Explore circuits with live animations and Ohm's Law calculations
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ── Circuit Selector ── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {CIRCUITS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCircuit(c.id)}
              style={selectorBtnStyle(activeCircuit === c.id)}
            >
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{c.icon}</div>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.75 }}>{c.description}</div>
            </button>
          ))}
        </div>

        {/* ── Canvas + Controls Row ── */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

          {/* Canvas */}
          <div style={{ ...cardStyle, flex: '1 1 500px', position: 'relative' }}>
            <div style={{
              padding: '12px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 600, color: '#a78bfa' }}>
                {circuitDef.icon} {circuitDef.name}
              </span>
              <button
                onClick={() => setIsAnimating(a => !a)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(124,58,237,0.4)',
                  background: isAnimating ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                  color: '#f0f4ff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {isAnimating ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
            <div style={{ padding: '12px', overflowX: 'auto' }}>
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                style={{
                  display: 'block',
                  borderRadius: '8px',
                  background: '#080b14',
                  maxWidth: '100%',
                }}
              />
            </div>
            {/* Legend */}
            <div style={{
              display: 'flex', gap: '16px', flexWrap: 'wrap',
              padding: '10px 18px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '12px', color: '#94a3b8',
            }}>
              <span><span style={{ color: '#7c3aed' }}>●</span> Current flow</span>
              <span><span style={{ color: '#f59e0b' }}>▬▬</span> Resistor</span>
              <span><span style={{ color: '#10b981' }}>▶|</span> LED</span>
              <span><span style={{ color: '#3b82f6' }}>‖</span> Capacitor</span>
              <span><span style={{ color: '#f0f4ff' }}>|</span> Battery</span>
            </div>
          </div>

          {/* Controls Panel */}
          <div style={{ ...cardStyle, flex: '0 0 280px', minWidth: '260px', padding: '0' }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontWeight: 600, color: '#60a5fa', fontSize: '14px',
            }}>
              🎛 Circuit Controls
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Voltage Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Voltage (V)</label>
                  <span style={{
                    fontWeight: 700, color: '#f59e0b',
                    fontSize: '16px',
                    background: 'rgba(245,158,11,0.1)',
                    padding: '2px 8px', borderRadius: '6px',
                  }}>{voltage} V</span>
                </div>
                <input
                  type="range" min={1} max={24} step={0.5} value={voltage}
                  onChange={e => setVoltage(Number(e.target.value))}
                  style={sliderStyle}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#475569' }}>
                  <span>1V</span><span>24V</span>
                </div>
              </div>

              {/* Resistance Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Resistance (Ω)</label>
                  <span style={{
                    fontWeight: 700, color: '#a78bfa',
                    fontSize: '16px',
                    background: 'rgba(124,58,237,0.1)',
                    padding: '2px 8px', borderRadius: '6px',
                  }}>{formatResistance(resistance)}</span>
                </div>
                <input
                  type="range" min={10} max={10000} step={10} value={resistance}
                  onChange={e => setResistance(Number(e.target.value))}
                  style={sliderStyle}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#475569' }}>
                  <span>10Ω</span><span>10kΩ</span>
                </div>
              </div>

              {/* Capacitance (RC only) */}
              {circuitDef.hasCapacitor && (
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  fontSize: '13px',
                }}>
                  <span style={{ color: '#60a5fa', fontWeight: 600 }}>Capacitance: </span>
                  <span style={{ color: '#f0f4ff' }}>{circuitDef.capacitance} µF</span>
                  <div style={{ color: '#94a3b8', marginTop: '6px', fontSize: '12px' }}>
                    τ = RC = {((resistance * (circuitDef.capacitance ?? 0)) / 1_000_000).toFixed(4)} s
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

              {/* Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Voltage', value: `${voltage} V`, color: '#f59e0b' },
                  { label: 'Resistance', value: formatResistance(resistance), color: '#a78bfa' },
                  { label: 'Current (V÷R)', value: formatCurrent(current), color: '#10b981' },
                  { label: 'Power (V×I)', value: `${(voltage * current).toFixed(3)} W`, color: '#f43f5e' },
                ].map(s => (
                  <div key={s.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                  }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{s.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Boxes ── */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Voltage', val: `${voltage} V`, sub: 'EMF Source', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Resistance', val: formatResistance(resistance), sub: 'Opposition to flow', color: '#a78bfa', bg: 'rgba(124,58,237,0.08)' },
            { label: 'Current', val: formatCurrent(current), sub: 'V ÷ R (Ohm\'s Law)', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Power', val: `${(voltage * current).toFixed(3)} W`, sub: 'P = V × I', color: '#f43f5e', bg: 'rgba(244,63,94,0.08)' },
          ].map(s => (
            <div key={s.label} style={{ ...statBoxStyle, background: s.bg, border: `1px solid ${s.color}30` }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Info Cards ── */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px', color: '#f0f4ff' }}>
            📚 Physics Concepts
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '16px' }}>

            {[
              {
                key: 'ohm',
                title: "Ohm's Law",
                icon: '⚡',
                color: '#f59e0b',
                formula: 'V = I × R',
                desc: 'The voltage across a conductor is directly proportional to the current through it, with resistance as the constant of proportionality.',
                bullets: ['V = Voltage (Volts)', 'I = Current (Amperes)', 'R = Resistance (Ohms)'],
              },
              {
                key: 'kirchhoff1',
                title: "Kirchhoff's Current Law",
                icon: '🔀',
                color: '#3b82f6',
                formula: 'ΣI_in = ΣI_out',
                desc: 'The total current entering a node equals the total current leaving it. Charge is conserved — it cannot accumulate at a junction.',
                bullets: ['Current is conserved', 'Applies to every node', 'Foundation of circuit analysis'],
              },
              {
                key: 'kirchhoff2',
                title: "Kirchhoff's Voltage Law",
                icon: '🔁',
                color: '#a78bfa',
                formula: 'ΣV = 0 (closed loop)',
                desc: 'The sum of all voltages around any closed loop in a circuit is zero. Energy gained from sources equals energy lost in resistors.',
                bullets: ['Voltage is conserved in loops', 'Used for mesh analysis', 'Derived from energy conservation'],
              },
              {
                key: 'power',
                title: 'Electrical Power',
                icon: '💥',
                color: '#f43f5e',
                formula: 'P = V × I = I²R = V²/R',
                desc: 'Power is the rate at which electrical energy is converted to other forms (heat, light). It equals voltage times current.',
                bullets: ['Unit: Watts (W)', 'P = V × I (basic)', 'P = I²R (resistive)'],
              },
              {
                key: 'series',
                title: 'Series Circuits',
                icon: '🔗',
                color: '#10b981',
                formula: 'R_total = R₁ + R₂ + R₃',
                desc: 'In a series circuit, all components share the same current. Total resistance is the sum of individual resistances.',
                bullets: ['Same current everywhere', 'Voltages add up', 'If one fails, all fail'],
              },
              {
                key: 'parallel',
                title: 'Parallel Circuits',
                icon: '⚡',
                color: '#ec4899',
                formula: '1/R_total = 1/R₁ + 1/R₂',
                desc: 'In a parallel circuit, all components share the same voltage. Total resistance is less than any individual resistance.',
                bullets: ['Same voltage across each branch', 'Currents add up', 'One fails, others work'],
              },
            ].map(card => (
              <div
                key={card.key}
                style={infoCardStyle(card.key)}
                onMouseEnter={() => setHoveredCard(card.key)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{card.icon}</span>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f0f4ff' }}>{card.title}</h3>
                </div>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: `${card.color}18`,
                  border: `1px solid ${card.color}40`,
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: card.color,
                  fontWeight: 700,
                  marginBottom: '10px',
                  textAlign: 'center',
                }}>
                  {card.formula}
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{card.desc}</p>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {card.bullets.map(b => (
                    <li key={b} style={{ fontSize: '12px', color: '#64748b' }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Circuit Summary Bar ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08))',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '14px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Active Circuit</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff' }}>
              {circuitDef.icon} {circuitDef.name}
            </div>
            <div style={{ fontSize: '13px', color: '#7c3aed', marginTop: '4px' }}>{circuitDef.description}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', background: '#0f172a', padding: '8px 14px', borderRadius: '8px' }}>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>{voltage}V</span> source
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', background: '#0f172a', padding: '8px 14px', borderRadius: '8px' }}>
              <span style={{ color: '#a78bfa', fontWeight: 700 }}>{formatResistance(resistance)}</span> load
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', background: '#0f172a', padding: '8px 14px', borderRadius: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{formatCurrent(current)}</span> flowing
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
