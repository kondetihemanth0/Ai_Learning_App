export const unstable_instant = {
  prefetch: 'runtime',
  samples: [
    {
      params: { subject: 'biology' }
    }
  ]
};

import { Suspense } from 'react';
import WorkspaceClient from './WorkspaceClient';

export default function WorkspacePage({ params }: { params: Promise<{ subject: string }> }) {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080b14', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🧠</div>
          <div>Loading workspace...</div>
        </div>
      </div>
    }>
      {params.then(({ subject }) => (
        <WorkspaceClient subjectId={subject} />
      ))}
    </Suspense>
  );
}
