'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { Sidebar } from '@/components/MailLayout'

const T = {
  bg: '#0e0e0e', surface: '#131313', surfaceLow: '#1c1b1b', surfaceMid: '#20201f',
  surfaceHigh: '#2a2a2a', onSurface: '#e5e2e1', onSurfaceVar: '#c4c7c7',
  gold: '#e9c349', outline: 'rgba(68,71,72,0.4)',
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? T.gold : T.surfaceHigh,
        border: `1px solid ${on ? T.gold : T.outline}`,
        position: 'relative', cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.2,0,0,1)',
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: on ? 22 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: on ? '#1c1b1b' : T.onSurfaceVar,
        transition: 'all 0.25s cubic-bezier(0.2,0,0,1)',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useMail()
  const [quantumEncryption, setQuantumEncryption] = useState(true)
  const [zeroKnowledge, setZeroKnowledge] = useState(false)
  const [theme, setTheme] = useState<'obsidian' | 'matte'>('obsidian')
  const [signature, setSignature] = useState('Director of Operations\nMAIL CODECODER | The Art of Precision\nPGP: 0x8F92A1')

  const cardStyle: React.CSSProperties = {
    background: T.surfaceLow, border: `1px solid ${T.outline}`, borderRadius: 4, padding: 28,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.bg, fontFamily: 'Hanken Grotesk, sans-serif' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', padding: '48px 48px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em', color: T.onSurface, marginBottom: 12 }}>Control Center</h1>
        <p style={{ fontSize: 16, color: T.onSurfaceVar, marginBottom: 48, lineHeight: 1.6 }}>
          Configure your elite communication environment. Precision settings for<br />uncompromising focus and security.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
          {/* Profile card */}
          <div style={{ ...cardStyle, display: 'flex', gap: 24 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, background: T.surfaceHigh, border: `1px solid ${T.outline}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk', fontSize: 22, fontWeight: 700, color: T.gold }}>
                {user?.displayName?.split(' ').map((w: string) => w[0]).join('').slice(0, 2) || 'JD'}
              </div>
              <button style={{ position: 'absolute', bottom: -6, right: -6, width: 24, height: 24, background: T.surfaceHigh, border: `1px solid ${T.outline}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.onSurfaceVar }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>photo_camera</span>
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 600, color: T.onSurface, marginBottom: 4 }}>
                {user?.displayName || 'Director Protocol'}
              </h3>
              <p style={{ fontSize: 13, color: T.onSurfaceVar, marginBottom: 12 }}>{user?.email || 'director@mailcodecoder.com'}</p>
              <div style={{ border: `1px solid ${T.outline}`, borderRadius: 2, padding: '12px 14px', background: T.surfaceMid }}>
                <textarea
                  value={signature}
                  onChange={e => setSignature(e.target.value)}
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none', fontFamily: 'Hanken Grotesk', fontSize: 12, color: T.onSurfaceVar, lineHeight: 1.7 }}
                  rows={3}
                />
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onSurfaceVar, marginTop: 4 }}>Signature Designer</label>
              </div>
              <button style={{ marginTop: 12, width: '100%', padding: '10px 16px', background: T.surfaceHigh, border: `1px solid ${T.outline}`, borderRadius: 2, color: T.onSurface, fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(233,195,73,0.4)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = T.outline}>
                Update Profile
              </button>
            </div>
          </div>

          {/* Security */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.gold }}>lock</span>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 600, color: T.onSurface }}>Security</h3>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: T.onSurface, marginBottom: 2 }}>Quantum Encryption</p>
                  <p style={{ fontSize: 12, color: T.onSurfaceVar }}>Post-quantum key exchange</p>
                </div>
                <Toggle on={quantumEncryption} onChange={setQuantumEncryption} />
              </div>
            </div>
            <div style={{ height: 1, background: T.outline, margin: '16px 0' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: T.onSurface, marginBottom: 2 }}>Zero-Knowledge</p>
                  <p style={{ fontSize: 12, color: T.onSurfaceVar }}>Local key storage only</p>
                </div>
                <Toggle on={zeroKnowledge} onChange={setZeroKnowledge} />
              </div>
            </div>
            <div style={{ height: 1, background: T.outline, margin: '20px 0' }} />
            <button style={{ width: '100%', padding: '10px 16px', background: 'none', border: `1px solid rgba(233,195,73,0.3)`, borderRadius: 2, color: T.gold, fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(233,195,73,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
              Revoke All Sessions
            </button>
          </div>

          {/* Visual Atmosphere */}
          <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 600, color: T.onSurface, marginBottom: 6 }}>Visual Atmosphere</h3>
            <p style={{ fontSize: 14, color: T.onSurfaceVar, marginBottom: 24 }}>Select the ambient material for your workspace.</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {(['obsidian', 'matte'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{ padding: '8px 20px', background: theme === t ? T.surfaceHigh : 'none', border: `1px solid ${theme === t ? T.onSurfaceVar : T.outline}`, borderRadius: 2, color: theme === t ? T.onSurface : T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ height: 120, background: '#0e0e0e', border: `1px solid ${T.outline}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onSurfaceVar, opacity: 0.5 }}>Active Preview</span>
              </div>
              <div style={{ height: 120, background: T.surfaceMid, border: `1px solid ${T.outline}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onSurfaceVar, opacity: 0.5 }}>Inactive Preview</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${T.outline}`, paddingTop: 20 }}>
          <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.onSurfaceVar, opacity: 0.4 }}>
            © 2024 Mail Codecoder. The Art of Precision.
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Encryption'].map(l => (
              <a key={l} href="#" style={{ fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.onSurfaceVar, opacity: 0.5 }}>{l}</a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
