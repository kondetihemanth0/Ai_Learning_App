'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

type Algorithm = 'bubble' | 'selection' | 'insertion' | 'merge';

const ALGOS: { id: Algorithm; label: string; desc: string; complexity: string }[] = [
  { id: 'bubble', label: 'Bubble Sort', desc: 'Repeatedly swaps adjacent elements if in wrong order.', complexity: 'O(n²)' },
  { id: 'selection', label: 'Selection Sort', desc: 'Finds minimum element and places it at the beginning.', complexity: 'O(n²)' },
  { id: 'insertion', label: 'Insertion Sort', desc: 'Builds sorted array one item at a time.', complexity: 'O(n²)' },
  { id: 'merge', label: 'Merge Sort', desc: 'Divides array in halves, sorts, then merges.', complexity: 'O(n log n)' },
];

function randomArray(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function SortingPage() {
  const [algo, setAlgo] = useState<Algorithm>('bubble');
  const [size, setSize] = useState(40);
  const [speedMs, setSpeedMs] = useState(60);
  const [arr, setArr] = useState<number[]>(() => Array.from({ length: 40 }, (_, i) => ((i * 7) % 79) + 11));
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [pivot, setPivot] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const stopRef = useRef(false);

  const shuffle = useCallback(() => {
    stopRef.current = true;
    setRunning(false);
    setComparing([]); setSorted([]); setPivot(null);
    setComparisons(0); setSwaps(0);
    setTimeout(() => { setArr(randomArray(size)); stopRef.current = false; }, 50);
  }, [size]);

  useEffect(() => { shuffle(); }, [size]);

  const run = useCallback(async () => {
    if (running) return;
    stopRef.current = false;
    setRunning(true);
    setComparing([]); setSorted([]); setPivot(null);
    setComparisons(0); setSwaps(0);

    const a = [...arr];
    let cmp = 0, swp = 0;
    const delay = () => sleep(speedMs);

    if (algo === 'bubble') {
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a.length - i - 1; j++) {
          if (stopRef.current) { setRunning(false); return; }
          setComparing([j, j + 1]); cmp++;
          setComparisons(c => c + 1);
          await delay();
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            swp++; setSwaps(s => s + 1);
            setArr([...a]);
          }
        }
        setSorted(s => [...s, a.length - i - 1]);
      }
    } else if (algo === 'selection') {
      for (let i = 0; i < a.length; i++) {
        let minIdx = i;
        setPivot(i);
        for (let j = i + 1; j < a.length; j++) {
          if (stopRef.current) { setRunning(false); return; }
          setComparing([minIdx, j]); cmp++; setComparisons(c => c + 1);
          await delay();
          if (a[j] < a[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
          [a[i], a[minIdx]] = [a[minIdx], a[i]];
          swp++; setSwaps(s => s + 1); setArr([...a]);
        }
        setSorted(s => [...s, i]);
      }
    } else if (algo === 'insertion') {
      setSorted([0]);
      for (let i = 1; i < a.length; i++) {
        if (stopRef.current) { setRunning(false); return; }
        const key = a[i]; let j = i - 1;
        setPivot(i);
        while (j >= 0 && a[j] > key) {
          if (stopRef.current) { setRunning(false); return; }
          setComparing([j, j + 1]); cmp++; setComparisons(c => c + 1);
          a[j + 1] = a[j]; j--; swp++; setSwaps(s => s + 1);
          setArr([...a]); await delay();
        }
        a[j + 1] = key; setArr([...a]);
        setSorted(s => [...s, i]);
      }
    } else if (algo === 'merge') {
      const mergeSort = async (arr: number[], l: number, r: number) => {
        if (l >= r) return;
        const m = Math.floor((l + r) / 2);
        await mergeSort(arr, l, m);
        await mergeSort(arr, m + 1, r);
        const left = arr.slice(l, m + 1), right = arr.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < left.length && j < right.length) {
          if (stopRef.current) return;
          setComparing([k, m + 1 + j]); cmp++; setComparisons(c => c + 1);
          await delay();
          arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
          swp++; setSwaps(s => s + 1); setArr([...arr]);
        }
        while (i < left.length) { arr[k++] = left[i++]; setArr([...arr]); await sleep(speedMs / 3); }
        while (j < right.length) { arr[k++] = right[j++]; setArr([...arr]); await sleep(speedMs / 3); }
        for (let x = l; x <= r; x++) setSorted(s => [...s, x]);
      };
      await mergeSort(a, 0, a.length - 1);
    }

    setComparing([]); setPivot(null);
    setSorted(Array.from({ length: a.length }, (_, i) => i));
    setRunning(false);
  }, [algo, arr, running, speedMs]);

  const maxVal = Math.max(...arr, 1);
  const algoInfo = ALGOS.find(a => a.id === algo)!;

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <Link href="/subjects" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>← Back</Link>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', color: '#f0f4ff', margin: 0 }}>📊 Sorting Algorithms</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Watch algorithms sort data step by step in real-time</p>
          </div>
        </div>

        {/* Algorithm selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {ALGOS.map(a => (
            <button key={a.id} disabled={running} onClick={() => { setAlgo(a.id); shuffle(); }}
              style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${algo === a.id ? '#7c3aed60' : 'rgba(255,255,255,0.06)'}`, background: algo === a.id ? 'rgba(124,58,237,0.18)' : '#111827', color: algo === a.id ? '#f0f4ff' : '#94a3b8', cursor: running ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: running ? 0.6 : 1, transition: 'all 0.2s' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'Outfit,sans-serif' }}>{a.label}</div>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, marginTop: '2px' }}>{a.complexity}</div>
            </button>
          ))}
        </div>

        {/* Visualizer */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '280px' }}>
            {arr.map((val, i) => {
              const isComparing = comparing.includes(i);
              const isSorted = sorted.includes(i);
              const isPivot = pivot === i;
              const color = isPivot ? '#f59e0b' : isComparing ? '#f87171' : isSorted ? '#10b981' : '#7c3aed';
              return (
                <div key={i} style={{ flex: 1, maxWidth: `${100 / arr.length}%`, height: `${(val / maxVal) * 260}px`, background: color, borderRadius: '3px 3px 0 0', transition: 'height 0.05s', boxShadow: isComparing ? `0 0 8px ${color}` : 'none', minWidth: '2px' }} />
              );
            })}
          </div>
        </div>

        {/* Legend + stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[{ c: '#7c3aed', l: 'Unsorted' }, { c: '#f87171', l: 'Comparing' }, { c: '#10b981', l: 'Sorted' }, { c: '#f59e0b', l: 'Current' }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: x.c }} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{x.l}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed' }}>{comparisons}</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>Comparisons</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '22px', fontWeight: 800, color: '#10b981' }}>{swaps}</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>Swaps</div></div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff' }}>{algoInfo.label}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{algoInfo.desc}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          {[{ label: '📦 Array Size', value: size, set: (v: number) => setSize(v), min: 10, max: 80, disabled: running },
            { label: '⚡ Speed (ms)', value: speedMs, set: (v: number) => setSpeedMs(v), min: 5, max: 200, disabled: false }].map(c => (
            <div key={c.label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{c.label}</span>
                <span style={{ fontSize: '13px', color: '#7c3aed', fontWeight: 700 }}>{c.value}</span>
              </div>
              <input type="range" min={c.min} max={c.max} value={c.value} disabled={c.disabled} onChange={e => c.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed' }} />
            </div>
          ))}
          <button onClick={shuffle} disabled={running} style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: running ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: running ? 0.5 : 1 }}>🔀 Shuffle</button>
          <button onClick={run} disabled={running} style={{ padding: '16px', borderRadius: '14px', border: 'none', background: running ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', cursor: running ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '15px' }}>
            {running ? '⏳ Sorting...' : '▶ Sort Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
