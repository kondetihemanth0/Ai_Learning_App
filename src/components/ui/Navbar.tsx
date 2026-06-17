'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import APIKeyModal from './APIKeyModal';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/subjects', label: 'Subjects' },
  { href: '/explore/cell', label: '3D Explore' },
  { href: '/simulate/physics', label: 'Simulate' },
  { href: '/activities', label: 'Activities' },
  { href: '/quiz/biology', label: 'Quiz' },
  { href: '/upload', label: 'PDF' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { apiKey } = useStore();
  const hasKey = apiKey || process.env.NEXT_PUBLIC_DEFAULT_API_KEY || '';
  const displayKey = apiKey ? apiKey : (process.env.NEXT_PUBLIC_DEFAULT_API_KEY || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8, 11, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}>🧠</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '20px', color: '#f0f4ff' }}>
            Learn<span style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hide-mobile" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{
              padding: '6px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              color: pathname === link.href ? '#f0f4ff' : '#94a3b8',
              background: pathname === link.href ? 'rgba(124,58,237,0.15)' : 'transparent',
              border: pathname === link.href ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowAPIModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              background: hasKey ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)',
              color: hasKey ? '#10b981' : '#a78bfa',
              border: `1px solid ${hasKey ? 'rgba(16,185,129,0.3)' : 'rgba(124,58,237,0.3)'}`,
              transition: 'all 0.2s',
            }}
          >
            <span>
              {!hasKey ? '🔑' :
               (displayKey.trim().toLowerCase() === 'ollama' || displayKey.trim().startsWith('http://localhost')) ? '🦙' :
               displayKey.trim().startsWith('gsk_') ? '⚡' :
               displayKey.trim().startsWith('sk-or-') ? '🚀' : '✅'}
            </span>
            <span className="hide-mobile">
              {!hasKey ? 'Add API Key' :
               apiKey ? (
                 (apiKey.trim().toLowerCase() === 'ollama' || apiKey.trim().startsWith('http://localhost')) ? 'Llama (Local)' :
                 apiKey.trim().startsWith('gsk_') ? 'Groq · Llama 3' :
                 apiKey.trim().startsWith('sk-or-') ? 'OpenRouter · Llama' : 'API Connected'
               ) : (
                 displayKey.trim().startsWith('gsk_') ? 'Groq (Shared)' :
                 displayKey.trim().startsWith('sk-or-') ? 'OpenRouter (Shared)' : 'Shared API Connected'
               )}
            </span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: '#f0f4ff', cursor: 'pointer', fontSize: '16px' }}
            className="mobile-menu-btn"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99,
          background: 'rgba(8,11,20,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', color: pathname === link.href ? '#f0f4ff' : '#94a3b8', background: pathname === link.href ? 'rgba(124,58,237,0.15)' : 'transparent', fontWeight: 500 }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: '64px' }} />

      {showAPIModal && <APIKeyModal onClose={() => setShowAPIModal(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
