'use client';
import { useState, useRef, useEffect } from 'react';

type DSType = 'array' | 'stack' | 'queue' | 'linkedlist' | 'tree' | 'sorting';
type SortAlgo = 'bubble' | 'selection' | 'insertion' | 'merge';

interface TreeNode { value: number; left?: TreeNode; right?: TreeNode; x?: number; y?: number; }

export default function DataStructuresVisualizer() {
  const [dsType, setDsType] = useState<DSType>('array');
  const [elements, setElements] = useState<number[]>([5, 3, 8, 1, 9, 2, 7, 4, 6]);
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [sortAlgo, setSortAlgo] = useState<SortAlgo>('bubble');
  const [stackItems, setStackItems] = useState<number[]>([10, 20, 30]);
  const [queueItems, setQueueItems] = useState<number[]>([1, 2, 3, 4]);
  const [linkedList, setLinkedList] = useState<number[]>([5, 10, 15, 20, 25]);
  const runRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const addLog = (msg: string) => setLog(prev => [`⟹ ${msg}`, ...prev.slice(0, 9)]);

  // Array operations
  const pushElement = () => {
    const v = parseInt(inputVal);
    if (isNaN(v)) return;
    setElements(prev => [...prev, v]);
    setHighlighted([elements.length]);
    addLog(`Pushed ${v} at index ${elements.length}`);
    setInputVal('');
    setTimeout(() => setHighlighted([]), 1000);
  };

  const popElement = () => {
    if (elements.length === 0) return;
    const v = elements[elements.length - 1];
    setHighlighted([elements.length - 1]);
    setTimeout(() => { setElements(prev => prev.slice(0, -1)); setHighlighted([]); }, 600);
    addLog(`Popped ${v} from index ${elements.length - 1}`);
  };

  // Stack operations
  const stackPush = () => {
    const v = parseInt(inputVal) || Math.floor(Math.random() * 100);
    setStackItems(prev => [v, ...prev]);
    addLog(`Pushed ${v} onto stack`);
    setInputVal('');
  };

  const stackPop = () => {
    if (stackItems.length === 0) return;
    addLog(`Popped ${stackItems[0]} from stack (LIFO)`);
    setStackItems(prev => prev.slice(1));
  };

  // Queue operations
  const enqueue = () => {
    const v = parseInt(inputVal) || Math.floor(Math.random() * 100);
    setQueueItems(prev => [...prev, v]);
    addLog(`Enqueued ${v} at rear`);
    setInputVal('');
  };

  const dequeue = () => {
    if (queueItems.length === 0) return;
    addLog(`Dequeued ${queueItems[0]} from front (FIFO)`);
    setQueueItems(prev => prev.slice(1));
  };

  // Linked List operations
  const llInsert = () => {
    const v = parseInt(inputVal) || Math.floor(Math.random() * 100);
    setLinkedList(prev => [v, ...prev]);
    addLog(`Inserted ${v} at head`);
    setInputVal('');
  };

  const llDelete = () => {
    if (linkedList.length === 0) return;
    addLog(`Deleted head node ${linkedList[0]}`);
    setLinkedList(prev => prev.slice(1));
  };

  // Sorting algorithms
  const runSort = async () => {
    if (running) return;
    setRunning(true);
    runRef.current = true;
    setSorted([]);
    setHighlighted([]);
    setComparing([]);
    const arr = [...elements];
    addLog(`Starting ${sortAlgo} sort on ${arr.length} elements`);

    if (sortAlgo === 'bubble') {
      for (let i = 0; i < arr.length && runRef.current; i++) {
        for (let j = 0; j < arr.length - i - 1 && runRef.current; j++) {
          setComparing([j, j + 1]);
          await sleep(speed);
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            setElements([...arr]);
            addLog(`Swapped ${arr[j + 1]} ↔ ${arr[j]}`);
          }
        }
        setSorted(prev => [...prev, arr.length - 1 - i]);
      }
    } else if (sortAlgo === 'selection') {
      for (let i = 0; i < arr.length && runRef.current; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length && runRef.current; j++) {
          setComparing([minIdx, j]);
          await sleep(speed);
          if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
          [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
          setElements([...arr]);
          addLog(`Selected ${arr[i]}, moved to position ${i}`);
        }
        setSorted(prev => [...prev, i]);
      }
    } else if (sortAlgo === 'insertion') {
      setSorted([0]);
      for (let i = 1; i < arr.length && runRef.current; i++) {
        const key = arr[i];
        let j = i - 1;
        setHighlighted([i]);
        while (j >= 0 && arr[j] > key && runRef.current) {
          setComparing([j, j + 1]);
          arr[j + 1] = arr[j];
          setElements([...arr]);
          await sleep(speed);
          j--;
        }
        arr[j + 1] = key;
        setElements([...arr]);
        setSorted(prev => [...prev, i]);
        addLog(`Inserted ${key} at position ${j + 1}`);
      }
    }

    if (runRef.current) {
      setSorted(arr.map((_, i) => i));
      setComparing([]);
      setHighlighted([]);
      addLog(`✅ Sort complete!`);
    }
    setRunning(false);
    runRef.current = false;
  };

  const stopSort = () => { runRef.current = false; setRunning(false); setComparing([]); };
  const resetSort = () => { stopSort(); setElements([5, 3, 8, 1, 9, 2, 7, 4, 6]); setSorted([]); setHighlighted([]); setComparing([]); };
  const randomize = () => { stopSort(); const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10); setElements(arr); setSorted([]); setComparing([]); };

  const DS_TYPES: { id: DSType; label: string; icon: string }[] = [
    { id: 'array', label: 'Array', icon: '📦' },
    { id: 'stack', label: 'Stack', icon: '🥞' },
    { id: 'queue', label: 'Queue', icon: '🚶' },
    { id: 'linkedlist', label: 'Linked List', icon: '🔗' },
    { id: 'tree', label: 'BST', icon: '🌳' },
    { id: 'sorting', label: 'Sorting', icon: '📊' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            💻 <span className="gradient-text">Data Structures Visualizer</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Visualize arrays, stacks, queues, linked lists, trees, and sorting algorithms in real time.</p>
        </div>

        {/* DS Type Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {DS_TYPES.map(dt => (
            <button key={dt.id} onClick={() => { setDsType(dt.id); stopSort(); setSorted([]); setComparing([]); }}
              style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${dsType === dt.id ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.06)'}`, background: dsType === dt.id ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)', color: dsType === dt.id ? '#06b6d4' : '#94a3b8', cursor: 'pointer', fontWeight: dsType === dt.id ? 700 : 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              {dt.icon} {dt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
          {/* Visualization Area */}
          <div style={{ background: '#0d1117', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', minHeight: '480px' }}>

            {/* Array */}
            {dsType === 'array' && (
              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-end' }}>
                  {elements.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: 800, transition: 'all 0.3s',
                        background: highlighted.includes(idx) ? 'rgba(16,185,129,0.2)' : comparing.includes(idx) ? 'rgba(245,158,11,0.2)' : 'rgba(6,182,212,0.1)',
                        border: `2px solid ${highlighted.includes(idx) ? '#10b981' : comparing.includes(idx) ? '#f59e0b' : '#06b6d4'}`,
                        color: '#f0f4ff',
                        boxShadow: highlighted.includes(idx) ? '0 0 16px rgba(16,185,129,0.4)' : comparing.includes(idx) ? '0 0 16px rgba(245,158,11,0.4)' : 'none',
                        transform: highlighted.includes(idx) ? 'scale(1.1)' : 'scale(1)',
                      }}>{val}</div>
                      <span style={{ fontSize: '10px', color: '#4b5563', fontFamily: 'monospace' }}>[{idx}]</span>
                    </div>
                  ))}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                  Length: <span style={{ color: '#06b6d4', fontWeight: 700 }}>{elements.length}</span> &nbsp;|&nbsp;
                  O(1) access &nbsp;|&nbsp; O(n) search
                </div>
              </div>
            )}

            {/* Stack */}
            {dsType === 'stack' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', maxHeight: '420px' }}>
                <div style={{ padding: '6px 16px', borderRadius: '6px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>← TOP (LIFO)</div>
                {stackItems.map((val, idx) => (
                  <div key={idx} style={{
                    width: '200px', padding: '14px', textAlign: 'center', fontSize: '18px', fontWeight: 800,
                    background: idx === 0 ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${idx === 0 ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: idx === 0 ? '#a78bfa' : '#94a3b8',
                    borderBottom: 'none', marginTop: '0',
                    borderRadius: idx === 0 ? '10px 10px 0 0' : '0',
                    transition: 'all 0.3s',
                  }}>{val}</div>
                ))}
                {stackItems.length === 0 && <div style={{ padding: '20px', color: '#4b5563', fontSize: '13px' }}>Stack is empty</div>}
                <div style={{ width: '200px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '0 0 4px 4px' }} />
                <div style={{ color: '#4b5563', fontSize: '11px', marginTop: '8px' }}>BOTTOM</div>
              </div>
            )}

            {/* Queue */}
            {dsType === 'queue' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '20px' }}>
                  <div style={{ padding: '6px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px 0 0 8px', color: '#10b981', fontSize: '11px', fontWeight: 600 }}>FRONT</div>
                  {queueItems.map((val, idx) => (
                    <div key={idx} style={{
                      width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800,
                      background: idx === 0 ? 'rgba(16,185,129,0.15)' : idx === queueItems.length - 1 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)', borderLeft: idx === 0 ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                      color: idx === 0 ? '#10b981' : idx === queueItems.length - 1 ? '#3b82f6' : '#94a3b8',
                    }}>{val}</div>
                  ))}
                  {queueItems.length === 0 && <div style={{ padding: '20px 30px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#4b5563', fontSize: '13px' }}>Empty</div>}
                  <div style={{ padding: '6px 10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '0 8px 8px 0', color: '#3b82f6', fontSize: '11px', fontWeight: 600 }}>REAR</div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>FIFO — First In, First Out. Size: <span style={{ color: '#3b82f6', fontWeight: 700 }}>{queueItems.length}</span></div>
              </div>
            )}

            {/* Linked List */}
            {dsType === 'linkedlist' && (
              <div style={{ overflowX: 'auto', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0', minWidth: 'max-content' }}>
                  {linkedList.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ background: '#111827', border: `1px solid ${idx === 0 ? '#10b981' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ padding: '10px 16px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '10px', color: '#4b5563' }}>data</div>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: idx === 0 ? '#10b981' : '#f0f4ff' }}>{val}</div>
                        </div>
                        <div style={{ padding: '10px 8px', display: 'inline-flex', alignItems: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#4b5563' }}>next →</div>
                        </div>
                      </div>
                      {idx < linkedList.length - 1 && (
                        <div style={{ width: '30px', height: '2px', background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
                          <div style={{ position: 'absolute', right: '-4px', top: '-4px', color: '#94a3b8', fontSize: '10px' }}>▶</div>
                        </div>
                      )}
                      {idx === linkedList.length - 1 && (
                        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', marginLeft: '0', fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>NULL</div>
                      )}
                    </div>
                  ))}
                  {linkedList.length === 0 && <div style={{ color: '#94a3b8', fontSize: '13px' }}>HEAD → NULL</div>}
                </div>
                <div style={{ marginTop: '16px', color: '#94a3b8', fontSize: '13px' }}>Head: <span style={{ color: '#10b981', fontWeight: 700 }}>{linkedList[0] ?? 'NULL'}</span> &nbsp;|&nbsp; O(1) insert at head &nbsp;|&nbsp; O(n) search</div>
              </div>
            )}

            {/* BST Tree */}
            {dsType === 'tree' && (
              <div>
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌳</div>
                  <p>Binary Search Tree: Insert values using the input below.</p>
                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[15, 10, 20, 8, 12, 17, 25].map(v => (
                      <div key={v} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', fontSize: '14px', fontWeight: 700 }}>{v}</div>
                    ))}
                  </div>
                  <p style={{ marginTop: '16px', fontSize: '12px', color: '#4b5563' }}>BST property: Left subtree ≤ root ≤ Right subtree</p>
                  <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' }}>
                    <pre style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace', lineHeight: 1.8 }}>
{`         15
       /    \\
     10      20
    /  \\    /  \\
   8   12  17  25`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Sorting */}
            {dsType === 'sorting' && (
              <div>
                {/* Bar chart visualization */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '220px', marginBottom: '16px' }}>
                  {elements.map((val, idx) => {
                    const h = (val / Math.max(...elements)) * 200;
                    const isSorted = sorted.includes(idx);
                    const isComparing = comparing.includes(idx);
                    const isHighlighted = highlighted.includes(idx);
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
                        <span style={{ fontSize: '10px', color: isComparing ? '#f59e0b' : isSorted ? '#10b981' : '#4b5563' }}>{val}</span>
                        <div style={{
                          width: '100%', height: `${h}px`, borderRadius: '4px 4px 0 0',
                          background: isSorted ? 'linear-gradient(180deg,#10b981,#059669)' : isComparing ? 'linear-gradient(180deg,#f59e0b,#d97706)' : isHighlighted ? 'linear-gradient(180deg,#7c3aed,#4f46e5)' : 'linear-gradient(180deg,#3b82f6,#2563eb)',
                          transition: 'height 0.2s ease, background 0.2s',
                          boxShadow: isComparing ? '0 0 12px rgba(245,158,11,0.4)' : isSorted ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
                        }} />
                      </div>
                    );
                  })}
                </div>

                {/* Sort controls */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {(['bubble', 'selection', 'insertion'] as SortAlgo[]).map(algo => (
                    <button key={algo} onClick={() => setSortAlgo(algo)} style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${sortAlgo === algo ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.06)'}`, background: sortAlgo === algo ? 'rgba(59,130,246,0.15)' : 'transparent', color: sortAlgo === algo ? '#3b82f6' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {algo}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={runSort} disabled={running} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px', opacity: running ? 0.5 : 1 }}>
                    ▶ Run Sort
                  </button>
                  {running && <button onClick={stopSort} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>⏸ Stop</button>}
                  <button onClick={randomize} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>🔀 Random</button>
                  <button onClick={resetSort} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>↺ Reset</button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Speed</span>
                    <input type="range" min="50" max="800" value={800 - speed} onChange={e => setSpeed(800 - Number(e.target.value))} className="slider-custom" style={{ width: '80px' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls & Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Operations */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Operations</h3>
              <input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (dsType === 'array' ? pushElement() : dsType === 'stack' ? stackPush() : dsType === 'queue' ? enqueue() : llInsert())} placeholder="Value..." className="input-field" style={{ marginBottom: '10px' }} />

              {dsType === 'array' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={pushElement} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10b981', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>+ Push</button>
                  <button onClick={popElement} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>− Pop</button>
                </div>
              )}
              {dsType === 'stack' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={stackPush} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>⬆ Push</button>
                  <button onClick={stackPop} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>⬇ Pop</button>
                </div>
              )}
              {dsType === 'queue' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={enqueue} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>+ Enqueue</button>
                  <button onClick={dequeue} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>− Dequeue</button>
                </div>
              )}
              {dsType === 'linkedlist' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={llInsert} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10b981', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>+ Insert Head</button>
                  <button onClick={llDelete} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>− Delete</button>
                </div>
              )}
            </div>

            {/* Complexity Info */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>⏱ Complexity</h3>
              {dsType === 'sorting' ? (
                <div>
                  {[
                    { op: 'Best', val: sortAlgo === 'insertion' ? 'O(n)' : 'O(n²)' },
                    { op: 'Average', val: 'O(n²)' },
                    { op: 'Worst', val: 'O(n²)' },
                    { op: 'Space', val: 'O(1)' },
                  ].map(c => (
                    <div key={c.op} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                      <span style={{ color: '#94a3b8' }}>{c.op}</span>
                      <span style={{ fontFamily: 'monospace', color: '#06b6d4', fontWeight: 700 }}>{c.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {[
                    { op: 'Access', val: dsType === 'array' ? 'O(1)' : 'O(n)' },
                    { op: 'Search', val: 'O(n)' },
                    { op: 'Insert', val: dsType === 'array' ? 'O(n)' : dsType === 'stack' || dsType === 'queue' || dsType === 'linkedlist' ? 'O(1)' : 'O(log n)' },
                    { op: 'Delete', val: dsType === 'array' ? 'O(n)' : 'O(1)' },
                  ].map(c => (
                    <div key={c.op} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                      <span style={{ color: '#94a3b8' }}>{c.op}</span>
                      <span style={{ fontFamily: 'monospace', color: '#06b6d4', fontWeight: 700 }}>{c.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operation Log */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', flex: 1 }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>📋 Operation Log</h3>
              {log.length === 0 ? <p style={{ color: '#4b5563', fontSize: '12px' }}>Perform operations to see log</p> : log.map((l, i) => (
                <div key={i} style={{ fontSize: '11px', color: i === 0 ? '#f0f4ff' : '#4b5563', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'color 0.3s' }}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
