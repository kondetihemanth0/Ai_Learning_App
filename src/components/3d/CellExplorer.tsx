'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { askGemini } from '@/lib/gemini';

interface Organelle {
  id: string;
  name: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
  size: number;
  description: string;
  function: string;
}

const ORGANELLES: Organelle[] = [
  { id: 'nucleus', name: 'Nucleus', emoji: '🔵', color: '#6366f1', x: 50, y: 50, size: 70, description: 'The control center of the cell', function: 'Contains DNA and controls cell activities' },
  { id: 'mitochondria', name: 'Mitochondria', emoji: '🟡', color: '#f59e0b', x: 72, y: 35, size: 40, description: 'The powerhouse of the cell', function: 'Produces ATP through cellular respiration' },
  { id: 'er', name: 'Endoplasmic Reticulum', emoji: '🟠', color: '#f97316', x: 30, y: 65, size: 50, description: 'A network of membranes', function: 'Synthesizes proteins and lipids, transports materials' },
  { id: 'golgi', name: 'Golgi Apparatus', emoji: '🟢', color: '#10b981', x: 70, y: 68, size: 45, description: 'The cell post office', function: 'Packages and ships proteins to their destinations' },
  { id: 'lysosome', name: 'Lysosome', emoji: '🔴', color: '#ef4444', x: 25, y: 35, size: 30, description: 'The cell recycler', function: 'Breaks down waste and worn-out cell parts' },
  { id: 'ribosome', name: 'Ribosome', emoji: '⚪', color: '#94a3b8', x: 42, y: 30, size: 22, description: 'Protein synthesis machine', function: 'Translates mRNA to build proteins' },
  { id: 'vacuole', name: 'Vacuole', emoji: '🔷', color: '#06b6d4', x: 55, y: 72, size: 35, description: 'Storage unit of the cell', function: 'Stores water, nutrients, and waste products' },
  { id: 'cytoplasm', name: 'Cytoplasm', emoji: '⬜', color: '#334155', x: 50, y: 50, size: 200, description: 'Jelly-like fluid inside the cell', function: 'Fills the cell and suspends organelles' },
];

export default function CellExplorer() {
  const [selected, setSelected] = useState<Organelle | null>(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const { apiKey } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      timeRef.current += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = Math.min(cx, cy) * 0.85 * zoom;

      // Cell membrane glow
      const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
      grad.addColorStop(0, 'rgba(16,185,129,0.04)');
      grad.addColorStop(1, 'rgba(16,185,129,0.12)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + Math.sin(timeRef.current * 0.3) * 3, r, r * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cell membrane
      ctx.strokeStyle = 'rgba(16,185,129,0.6)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(cx, cy + Math.sin(timeRef.current * 0.3) * 3, r, r * 0.92, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Cytoplasm texture
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2 + timeRef.current * 0.05;
        const dist = (0.3 + (i % 5) * 0.12) * r;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist * 0.9;
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.beginPath();
        ctx.arc(px, py, 3 + Math.sin(timeRef.current + i) * 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw organelles (except cytoplasm)
      const visibleOrganelles = ORGANELLES.filter(o => o.id !== 'cytoplasm');
      visibleOrganelles.forEach(org => {
        const ox = cx + (org.x / 100 - 0.5) * r * 1.6 * zoom;
        const oy = cy + (org.y / 100 - 0.5) * r * 1.4 * zoom;
        const size = (org.size / 100) * r * zoom;

        // Pulse animation for selected
        const pulse = org.id === selected?.id ? Math.sin(timeRef.current * 3) * 0.15 + 1 : 1;
        const s = size * pulse;

        // Glow
        if (org.id === selected?.id) {
          ctx.shadowColor = org.color;
          ctx.shadowBlur = 25;
        }

        // Organelle shape
        const orgGrad = ctx.createRadialGradient(ox - s * 0.3, oy - s * 0.3, 0, ox, oy, s);
        orgGrad.addColorStop(0, org.color + 'dd');
        orgGrad.addColorStop(1, org.color + '44');
        ctx.fillStyle = orgGrad;

        // Special shapes for different organelles
        if (org.id === 'nucleus') {
          ctx.beginPath();
          ctx.ellipse(ox, oy, s, s * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
          // Nuclear membrane
          ctx.strokeStyle = org.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ox, oy, s, s * 0.85, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Nucleolus
          ctx.fillStyle = org.color + 'cc';
          ctx.beginPath();
          ctx.arc(ox, oy, s * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else if (org.id === 'er') {
          // Wavy membrane
          for (let w = 0; w < 3; w++) {
            ctx.strokeStyle = org.color + (w === 0 ? 'cc' : '66');
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = -s; x <= s; x += 2) {
              const y = Math.sin((x / s) * Math.PI * 2 + timeRef.current + w * 0.8) * s * 0.3;
              if (x === -s) ctx.moveTo(ox + x, oy + y + w * 8);
              else ctx.lineTo(ox + x, oy + y + w * 8);
            }
            ctx.stroke();
          }
        } else if (org.id === 'golgi') {
          // Stacked discs
          for (let g = 0; g < 4; g++) {
            ctx.fillStyle = org.color + (g % 2 === 0 ? 'aa' : '66');
            ctx.beginPath();
            ctx.ellipse(ox + g * 3, oy - g * 6 + 10, s * 0.9, s * 0.25, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (org.id === 'mitochondria') {
          // Oval shape with inner folds
          ctx.beginPath();
          ctx.ellipse(ox, oy, s, s * 0.5, Math.PI * 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = org.color + 'aa';
          ctx.lineWidth = 1.5;
          for (let f = 1; f <= 3; f++) {
            ctx.beginPath();
            ctx.moveTo(ox - s * 0.3 + f * s * 0.18, oy - s * 0.35);
            ctx.quadraticCurveTo(ox - s * 0.2 + f * s * 0.18, oy, ox - s * 0.3 + f * s * 0.18, oy + s * 0.35);
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.arc(ox, oy, s, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#f0f4ff';
        ctx.font = `bold ${Math.max(10, s * 0.28)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(org.name, ox, oy + s + 4);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [selected, zoom]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) * 0.85 * zoom;

    const clicked = ORGANELLES.filter(o => o.id !== 'cytoplasm').find(org => {
      const ox = cx + (org.x / 100 - 0.5) * r * 1.6;
      const oy = cy + (org.y / 100 - 0.5) * r * 1.4;
      const s = (org.size / 100) * r;
      return Math.sqrt((mouseX - ox) ** 2 + (mouseY - oy) ** 2) < s;
    });

    if (clicked) {
      setSelected(clicked);
      setAiExplanation('');
      if (apiKey) {
        setLoadingAI(true);
        askGemini(apiKey, `Explain the ${clicked.name} organelle in a human cell. Include its structure, function, and why it's important. Keep it educational but engaging, about 3-4 sentences.`)
          .then(r => { setAiExplanation(r); setLoadingAI(false); })
          .catch(() => setLoadingAI(false));
      }
    }
  };

  useEffect(() => {
    if (guidedMode) {
      const org = ORGANELLES.filter(o => o.id !== 'cytoplasm')[guidedIndex];
      setSelected(org);
    }
  }, [guidedMode, guidedIndex]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', minHeight: '640px' }}>
      {/* 3D Canvas */}
      <div style={{ position: 'relative', background: '#050810', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.2)', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={700}
          height={580}
          onClick={handleCanvasClick}
          style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}
        />
        {/* Controls overlay */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '8px' }}>
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: '#f0f4ff', cursor: 'pointer', fontSize: '18px' }}>+</button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: '#f0f4ff', cursor: 'pointer', fontSize: '18px' }}>−</button>
          <button onClick={() => setZoom(1)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', color: '#f0f4ff', cursor: 'pointer', fontSize: '12px' }}>Reset</button>
        </div>
        <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '5px 12px', borderRadius: '100px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '12px', fontWeight: 600 }}>
          🔬 Human Cell — Click to Explore
        </div>
        <button
          onClick={() => setGuidedMode(!guidedMode)}
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: guidedMode ? 'rgba(124,58,237,0.3)' : 'rgba(0,0,0,0.6)', color: guidedMode ? '#a78bfa' : '#f0f4ff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          {guidedMode ? '🎯 Guided ON' : '🎯 Guided Tour'}
        </button>
      </div>

      {/* Info Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Selected Info */}
        {selected ? (
          <div style={{ background: '#111827', border: `1px solid ${selected.color}30`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${selected.color}20`, border: `1px solid ${selected.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{selected.emoji}</div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff' }}>{selected.name}</h3>
                <p style={{ fontSize: '12px', color: selected.color }}>{selected.description}</p>
              </div>
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>🔧 Primary Function</p>
              <p style={{ fontSize: '14px', color: '#f0f4ff', lineHeight: 1.5 }}>{selected.function}</p>
            </div>
            {loadingAI && <div style={{ color: '#94a3b8', fontSize: '13px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>🤖 AI generating explanation...</div>}
            {aiExplanation && (
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed', marginBottom: '6px' }}>🤖 AI Explanation</p>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>{aiExplanation}</p>
              </div>
            )}
            {!apiKey && <p style={{ fontSize: '11px', color: '#4b5563', marginTop: '8px' }}>Add API key for detailed AI explanations</p>}
          </div>
        ) : (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👆</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4ff', marginBottom: '8px' }}>Click an Organelle</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>Click any part of the cell to learn about its structure and function. AI explanations available with API key.</p>
          </div>
        )}

        {/* Organelle List */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff', marginBottom: '12px' }}>🧬 Cell Components</h3>
          {ORGANELLES.filter(o => o.id !== 'cytoplasm').map((org, i) => (
            <div key={org.id} onClick={() => setSelected(org)} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: selected?.id === org.id ? `${org.color}15` : 'transparent', border: selected?.id === org.id ? `1px solid ${org.color}30` : '1px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: org.color, flexShrink: 0, boxShadow: `0 0 6px ${org.color}` }} />
              <span style={{ fontSize: '13px', color: selected?.id === org.id ? '#f0f4ff' : '#94a3b8', fontWeight: selected?.id === org.id ? 600 : 400 }}>{org.name}</span>
            </div>
          ))}
        </div>

        {/* Guided Tour Controls */}
        {guidedMode && (
          <div style={{ background: '#111827', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setGuidedIndex(i => Math.max(0, i - 1))} disabled={guidedIndex === 0} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', opacity: guidedIndex === 0 ? 0.3 : 1 }}>← Prev</button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>{guidedIndex + 1} / {ORGANELLES.filter(o => o.id !== 'cytoplasm').length}</span>
            <button onClick={() => setGuidedIndex(i => Math.min(ORGANELLES.filter(o => o.id !== 'cytoplasm').length - 1, i + 1))} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
