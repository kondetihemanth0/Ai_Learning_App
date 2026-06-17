'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

interface GateInfo {
  type: GateType;
  color: string;
  description: string;
  unary: boolean;
}

// ─── Gate Logic ──────────────────────────────────────────────────────────────

function computeGate(gate: GateType, a: boolean, b: boolean): boolean {
  switch (gate) {
    case 'AND':  return a && b;
    case 'OR':   return a || b;
    case 'NOT':  return !a;
    case 'NAND': return !(a && b);
    case 'NOR':  return !(a || b);
    case 'XOR':  return a !== b;
    case 'XNOR': return a === b;
  }
}

// ─── SVG Gate Symbols ────────────────────────────────────────────────────────

function AndGateSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 70" width="100" height="70">
      <line x1="10" y1="20" x2="40" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="10" y1="50" x2="40" y2="50" stroke={color} strokeWidth="2.5" />
      <line x1="40" y1="15" x2="40" y2="55" stroke={color} strokeWidth="2.5" />
      <path d="M40 15 Q75 15 75 35 Q75 55 40 55" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="75" y1="35" x2="92" y2="35" stroke={color} strokeWidth="2.5" />
      <circle cx="10" cy="20" r="3" fill={color} />
      <circle cx="10" cy="50" r="3" fill={color} />
      <circle cx="92" cy="35" r="3" fill={color} />
    </svg>
  );
}

function OrGateSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 70" width="100" height="70">
      <line x1="10" y1="20" x2="35" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="10" y1="50" x2="35" y2="50" stroke={color} strokeWidth="2.5" />
      <path d="M25 15 Q50 15 75 35 Q50 55 25 55 Q40 35 25 15Z" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="75" y1="35" x2="92" y2="35" stroke={color} strokeWidth="2.5" />
      <circle cx="10" cy="20" r="3" fill={color} />
      <circle cx="10" cy="50" r="3" fill={color} />
      <circle cx="92" cy="35" r="3" fill={color} />
    </svg>
  );
}

function NotGateSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 70" width="100" height="70">
      <line x1="10" y1="35" x2="30" y2="35" stroke={color} strokeWidth="2.5" />
      <polygon points="30,15 70,35 30,55" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="74" cy="35" r="5" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="79" y1="35" x2="92" y2="35" stroke={color} strokeWidth="2.5" />
      <circle cx="10" cy="35" r="3" fill={color} />
      <circle cx="92" cy="35" r="3" fill={color} />
    </svg>
  );
}

function NandGateSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 70" width="100" height="70">
      <line x1="10" y1="20" x2="38" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="10" y1="50" x2="38" y2="50" stroke={color} strokeWidth="2.5" />
      <line x1="38" y1="15" x2="38" y2="55" stroke={color} strokeWidth="2.5" />
      <path d="M38 15 Q70 15 70 35 Q70 55 38 55" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="75" cy="35" r="5" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="80" y1="35" x2="92" y2="35" stroke={color} strokeWidth="2.5" />
      <circle cx="10" cy="20" r="3" fill={color} />
      <circle cx="10" cy="50" r="3" fill={color} />
      <circle cx="92" cy="35" r="3" fill={color} />
    </svg>
  );
}

function NorGateSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 70" width="100" height="70">
      <line x1="10" y1="20" x2="33" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="10" y1="50" x2="33" y2="50" stroke={color} strokeWidth="2.5" />
      <path d="M23 15 Q46 15 68 35 Q46 55 23 55 Q38 35 23 15Z" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="73" cy="35" r="5" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="78" y1="35" x2="92" y2="35" stroke={color} strokeWidth="2.5" />
      <circle cx="10" cy="20" r="3" fill={color} />
      <circle cx="10" cy="50" r="3" fill={color} />
      <circle cx="92" cy="35" r="3" fill={color} />
    </svg>
  );
}

function XorGateSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 70" width="100" height="70">
      <line x1="10" y1="20" x2="35" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="10" y1="50" x2="35" y2="50" stroke={color} strokeWidth="2.5" />
      <path d="M28 15 Q52 15 76 35 Q52 55 28 55 Q43 35 28 15Z" fill="none" stroke={color} strokeWidth="2.5" />
      <path d="M22 15 Q37 35 22 55" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="76" y1="35" x2="92" y2="35" stroke={color} strokeWidth="2.5" />
      <circle cx="10" cy="20" r="3" fill={color} />
      <circle cx="10" cy="50" r="3" fill={color} />
      <circle cx="92" cy="35" r="3" fill={color} />
    </svg>
  );
}

function XnorGateSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 70" width="100" height="70">
      <line x1="10" y1="20" x2="33" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="10" y1="50" x2="33" y2="50" stroke={color} strokeWidth="2.5" />
      <path d="M26 15 Q49 15 71 35 Q49 55 26 55 Q41 35 26 15Z" fill="none" stroke={color} strokeWidth="2.5" />
      <path d="M20 15 Q35 35 20 55" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="76" cy="35" r="5" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="81" y1="35" x2="92" y2="35" stroke={color} strokeWidth="2.5" />
      <circle cx="10" cy="20" r="3" fill={color} />
      <circle cx="10" cy="50" r="3" fill={color} />
      <circle cx="92" cy="35" r="3" fill={color} />
    </svg>
  );
}

function GateSVG({ type, color }: { type: GateType; color: string }) {
  switch (type) {
    case 'AND':  return <AndGateSVG color={color} />;
    case 'OR':   return <OrGateSVG color={color} />;
    case 'NOT':  return <NotGateSVG color={color} />;
    case 'NAND': return <NandGateSVG color={color} />;
    case 'NOR':  return <NorGateSVG color={color} />;
    case 'XOR':  return <XorGateSVG color={color} />;
    case 'XNOR': return <XnorGateSVG color={color} />;
  }
}

// ─── Truth Table ─────────────────────────────────────────────────────────────

function TruthTable({ gate, unary }: { gate: GateType; unary: boolean }) {
  const rows = unary
    ? [[false], [true]]
    : [[false, false], [false, true], [true, false], [true, true]];

  return (
    <div style={{ overflowX: 'auto', marginTop: 8 }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: 13,
        fontFamily: 'monospace',
      }}>
        <thead>
          <tr>
            <th style={thStyle}>A</th>
            {!unary && <th style={thStyle}>B</th>}
            <th style={{ ...thStyle, color: '#a78bfa' }}>OUT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const a = row[0];
            const b = unary ? false : row[1];
            const out = computeGate(gate, a, b);
            return (
              <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <td style={tdStyle}>{a ? '1' : '0'}</td>
                {!unary && <td style={tdStyle}>{b ? '1' : '0'}</td>}
                <td style={{ ...tdStyle, color: out ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                  {out ? '1' : '0'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '5px 10px', textAlign: 'center', color: '#94a3b8',
  borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600,
};
const tdStyle: React.CSSProperties = {
  padding: '4px 10px', textAlign: 'center', color: '#f0f4ff',
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: '#94a3b8', minWidth: 14, fontFamily: 'monospace' }}>{label}</span>
      <button
        onClick={onChange}
        aria-label={`Toggle ${label}`}
        style={{
          position: 'relative', width: 44, height: 24,
          borderRadius: 12, border: 'none', cursor: 'pointer',
          background: value ? '#3b82f6' : 'rgba(255,255,255,0.1)',
          transition: 'background 0.25s',
          outline: 'none',
          boxShadow: value ? '0 0 10px rgba(59,130,246,0.5)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: value ? 22 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: '#fff', transition: 'left 0.25s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }} />
      </button>
      <span style={{
        fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
        color: value ? '#60a5fa' : '#475569',
        minWidth: 14,
      }}>{value ? '1' : '0'}</span>
    </div>
  );
}

// ─── LED Indicator ────────────────────────────────────────────────────────────

function LED({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: on
        ? 'radial-gradient(circle at 40% 35%, #86efac, #22c55e)'
        : 'radial-gradient(circle at 40% 35%, #4b5563, #1f2937)',
      boxShadow: on ? '0 0 14px 4px rgba(34,197,94,0.6)' : 'none',
      border: on ? '1.5px solid #16a34a' : '1.5px solid #374151',
      transition: 'all 0.3s ease',
      flexShrink: 0,
    }} />
  );
}

// ─── Gate Card ────────────────────────────────────────────────────────────────

const gateList: GateInfo[] = [
  { type: 'AND',  color: '#818cf8', description: 'Output is HIGH only when ALL inputs are HIGH.',              unary: false },
  { type: 'OR',   color: '#38bdf8', description: 'Output is HIGH when ANY input is HIGH.',                      unary: false },
  { type: 'NOT',  color: '#fb923c', description: 'Inverts the input. HIGH → LOW, LOW → HIGH.',                  unary: true  },
  { type: 'NAND', color: '#f472b6', description: 'Opposite of AND. Output is LOW only when all inputs are HIGH.', unary: false },
  { type: 'NOR',  color: '#a78bfa', description: 'Opposite of OR. Output is HIGH only when all inputs are LOW.',  unary: false },
  { type: 'XOR',  color: '#34d399', description: 'Output is HIGH when inputs DIFFER (exclusive or).',             unary: false },
  { type: 'XNOR', color: '#fbbf24', description: 'Output is HIGH when inputs are the SAME.',                      unary: false },
];

function GateCard({ info }: { info: GateInfo }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [hovered, setHovered] = useState(false);
  const output = computeGate(info.type, a, b);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#111827',
        border: `1.5px solid ${hovered ? info.color + '55' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 20,
        padding: '22px 20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'all 0.3s ease',
        boxShadow: hovered ? `0 8px 32px ${info.color}22` : '0 2px 8px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: info.color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${info.color}44`,
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: info.color, fontFamily: 'monospace' }}>
            {info.type.length <= 3 ? info.type : info.type.slice(0, 2)}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#f0f4ff', fontFamily: 'Outfit, sans-serif' }}>
            {info.type} Gate
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Logic gate</div>
        </div>
      </div>

      {/* SVG Symbol */}
      <div style={{
        background: 'rgba(0,0,0,0.3)', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 0', border: '1px solid rgba(255,255,255,0.04)',
      }}>
        <GateSVG type={info.type} color={info.color} />
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
        {info.description}
      </p>

      {/* Inputs & Output */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.25)', borderRadius: 12,
        padding: '12px 14px',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ToggleSwitch label="A" value={a} onChange={() => setA(v => !v)} />
          {!info.unary && <ToggleSwitch label="B" value={b} onChange={() => setB(v => !v)} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <LED on={output} />
          <span style={{
            fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
            color: output ? '#22c55e' : '#ef4444',
          }}>{output ? 'HIGH' : 'LOW'}</span>
        </div>
      </div>

      {/* Truth Table */}
      <details style={{ cursor: 'pointer' }}>
        <summary style={{
          fontSize: 12, color: info.color, fontWeight: 600,
          listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6,
          userSelect: 'none',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 4 L6 8 L10 4" stroke={info.color} strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          Truth Table
        </summary>
        <TruthTable gate={info.type} unary={info.unary} />
      </details>
    </div>
  );
}

// ─── Circuit Builder ──────────────────────────────────────────────────────────

const ALL_GATES: GateType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];

function CircuitBuilder() {
  const [gate1, setGate1] = useState<GateType>('AND');
  const [gate2, setGate2] = useState<GateType>('NOT');
  const [inA, setInA] = useState(false);
  const [inB, setInB] = useState(false);
  const [inC, setInC] = useState(false);

  const g1Info = gateList.find(g => g.type === gate1)!;
  const g2Info = gateList.find(g => g.type === gate2)!;

  const mid = computeGate(gate1, inA, inB);
  const finalOut = computeGate(gate2, mid, inC);

  const selectStyle: React.CSSProperties = {
    background: '#1e293b', color: '#f0f4ff', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8, padding: '6px 12px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{
      background: '#111827', border: '1.5px solid rgba(124,58,237,0.3)',
      borderRadius: 24, padding: '32px 28px',
      boxShadow: '0 0 40px rgba(124,58,237,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(124,58,237,0.4)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f0f4ff', fontFamily: 'Outfit, sans-serif' }}>
            Build Your Own Circuit
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
            Combine two gates in series and observe the cascaded output
          </p>
        </div>
      </div>

      {/* Gate selectors */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>GATE 1</label>
          <select value={gate1} onChange={e => setGate1(e.target.value as GateType)} style={selectStyle}>
            {ALL_GATES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>GATE 2</label>
          <select value={gate2} onChange={e => setGate2(e.target.value as GateType)} style={selectStyle}>
            {ALL_GATES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Circuit Diagram */}
      <div style={{
        background: 'rgba(0,0,0,0.35)', borderRadius: 16,
        padding: '24px 16px', border: '1px solid rgba(255,255,255,0.05)',
        overflowX: 'auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          minWidth: 560, justifyContent: 'center',
        }}>

          {/* Inputs column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginRight: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ToggleSwitch label="A" value={inA} onChange={() => setInA(v => !v)} />
            </div>
            {!g1Info.unary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ToggleSwitch label="B" value={inB} onChange={() => setInB(v => !v)} />
              </div>
            )}
          </div>

          {/* Gate 1 */}
          <div style={{
            background: g1Info.color + '18',
            borderRadius: 12, padding: '8px 12px',
            border: `1.5px solid ${g1Info.color}55`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 10, color: g1Info.color, fontWeight: 700 }}>GATE 1</span>
            <GateSVG type={gate1} color={g1Info.color} />
            <span style={{ fontSize: 11, color: g1Info.color, fontWeight: 600 }}>{gate1}</span>
          </div>

          {/* Mid signal wire */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, margin: '0 10px' }}>
            <div style={{
              width: 48, height: 3, borderRadius: 2,
              background: mid ? 'linear-gradient(90deg, #3b82f6, #22c55e)' : '#374151',
              boxShadow: mid ? '0 0 8px rgba(59,130,246,0.5)' : 'none',
              transition: 'all 0.3s',
            }} />
            <span style={{
              fontSize: 10, color: mid ? '#22c55e' : '#6b7280',
              fontFamily: 'monospace', fontWeight: 700,
              transition: 'color 0.3s',
            }}>{mid ? '1' : '0'}</span>
          </div>

          {/* Gate 2 inputs: mid + optionally C */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginRight: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>MID</span>
              <div style={{
                padding: '3px 8px', borderRadius: 6,
                background: mid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
                border: mid ? '1px solid #22c55e55' : '1px solid #ef444455',
                fontSize: 11, fontWeight: 700, color: mid ? '#22c55e' : '#ef4444', fontFamily: 'monospace',
              }}>{mid ? '1' : '0'}</div>
            </div>
            {!g2Info.unary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ToggleSwitch label="C" value={inC} onChange={() => setInC(v => !v)} />
              </div>
            )}
          </div>

          {/* Gate 2 */}
          <div style={{
            background: g2Info.color + '18',
            borderRadius: 12, padding: '8px 12px',
            border: `1.5px solid ${g2Info.color}55`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 10, color: g2Info.color, fontWeight: 700 }}>GATE 2</span>
            <GateSVG type={gate2} color={g2Info.color} />
            <span style={{ fontSize: 11, color: g2Info.color, fontWeight: 600 }}>{gate2}</span>
          </div>

          {/* Output wire */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, margin: '0 10px' }}>
            <div style={{
              width: 48, height: 3, borderRadius: 2,
              background: finalOut ? 'linear-gradient(90deg, #22c55e, #86efac)' : '#374151',
              boxShadow: finalOut ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
              transition: 'all 0.3s',
            }} />
          </div>

          {/* Final output LED */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <LED on={finalOut} />
            <span style={{
              fontSize: 12, fontFamily: 'monospace', fontWeight: 800,
              color: finalOut ? '#22c55e' : '#ef4444',
              padding: '3px 8px', borderRadius: 6,
              background: finalOut ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: finalOut ? '1px solid #22c55e44' : '1px solid #ef444444',
              transition: 'all 0.3s',
            }}>{finalOut ? 'HIGH' : 'LOW'}</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>OUTPUT</span>
          </div>
        </div>
      </div>

      {/* Expression display */}
      <div style={{
        marginTop: 20, padding: '14px 18px', borderRadius: 12,
        background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
        fontFamily: 'monospace', fontSize: 13,
      }}>
        <span style={{ color: '#94a3b8' }}>Boolean Expression: </span>
        <span style={{ color: '#c4b5fd', fontWeight: 700 }}>
          {gate2}({gate1}(A{!g1Info.unary ? ', B' : ''}){!g2Info.unary ? ', C' : ''})
        </span>
        <span style={{ color: '#64748b', marginLeft: 16 }}>
          = {gate2}({mid ? '1' : '0'}{!g2Info.unary ? `, ${inC ? '1' : '0'}` : ''})
        </span>
        <span style={{ color: finalOut ? '#22c55e' : '#ef4444', marginLeft: 8, fontWeight: 800 }}>
          = {finalOut ? '1' : '0'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LogicGatesPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b14',
      fontFamily: 'Outfit, sans-serif',
      color: '#f0f4ff',
      paddingBottom: 80,
    }}>
      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
        {/* Glows */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: -80, width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        {/* Back button */}
        <div style={{ paddingTop: 28 }}>
          <Link href="/subjects" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500,
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.2s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Subjects
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '52px 20px 48px', maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 100, padding: '6px 18px', fontSize: 13, color: '#a78bfa',
            fontWeight: 600, marginBottom: 24, letterSpacing: '0.04em',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Digital Electronics
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #a78bfa 50%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            Logic Gates
          </h1>
          <p style={{
            fontSize: 17, color: '#94a3b8', lineHeight: 1.7, margin: 0,
          }}>
            The fundamental building blocks of digital circuits. Toggle inputs,
            observe outputs in real-time, and build your own cascaded circuit.
          </p>

          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap',
          }}>
            {[
              { label: 'Gate Types', value: '7' },
              { label: 'Interactive', value: '✓' },
              { label: 'Circuit Builder', value: '✓' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                padding: '10px 20px', border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gates grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: 20,
          marginBottom: 48,
        }}>
          {gateList.map(info => (
            <GateCard key={info.type} info={info} />
          ))}
        </div>

        {/* Section divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32,
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: 12, color: '#64748b', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>
            Interactive Circuit Simulator
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Circuit builder */}
        <CircuitBuilder />

        {/* Footer info */}
        <div style={{
          marginTop: 56, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {[
            {
              icon: '🔵',
              title: 'High Signal (1)',
              desc: 'Represents a logical TRUE or binary 1. Typically 5V or 3.3V in real circuits.',
            },
            {
              icon: '⚫',
              title: 'Low Signal (0)',
              desc: 'Represents a logical FALSE or binary 0. Typically 0V (ground) in real circuits.',
            },
            {
              icon: '🔗',
              title: 'Series Connection',
              desc: 'Chaining gates in series allows complex boolean expressions from simple primitives.',
            },
          ].map(item => (
            <div key={item.title} style={{
              background: 'rgba(255,255,255,0.02)', borderRadius: 14,
              padding: '18px 20px', border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f0f4ff', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
