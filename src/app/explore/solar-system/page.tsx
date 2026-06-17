'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const SolarSystem = dynamic(() => import('@/components/3d/SolarSystem'), { ssr: false });

export default function SolarSystemPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#020408', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            🪐 <span className="gradient-text">Solar System Explorer</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Click on planets to learn. Use speed controls to adjust orbital velocity.</p>
        </div>
        <Suspense fallback={<div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading Solar System...</div>}>
          <SolarSystem />
        </Suspense>
      </div>
    </div>
  );
}
