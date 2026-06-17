'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const CellExplorer = dynamic(() => import('@/components/3d/CellExplorer'), { ssr: false });

export default function CellPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            🔬 <span className="gradient-text">3D Cell Explorer</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Click on organelles to learn about their functions. Drag to rotate, scroll to zoom.</p>
        </div>
        <Suspense fallback={<div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading 3D Model...</div>}>
          <CellExplorer />
        </Suspense>
      </div>
    </div>
  );
}
