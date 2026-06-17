'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PhysicsSimulation = dynamic(() => import('@/components/simulations/PhysicsSimulation'), { ssr: false });

export default function PhysicsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Outfit,sans-serif', marginBottom: '8px' }}>
            ⚡ <span className="gradient-text">Physics Simulation Lab</span>
          </h1>
          <p style={{ color: '#94a3b8' }}>Adjust parameters and observe physics in real time. Gravity, projectile, pendulum, and waves.</p>
        </div>
        <Suspense fallback={<div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading Simulation...</div>}>
          <PhysicsSimulation />
        </Suspense>
      </div>
    </div>
  );
}
