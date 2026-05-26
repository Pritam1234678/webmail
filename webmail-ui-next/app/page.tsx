'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  {
    headline: 'A new era of\ncommunication.',
    sub: 'Step into a sanctuary of focus. Precision engineering meets timeless editorial design, crafted for the elite.',
  },
  {
    headline: 'Your inbox,\nrefined.',
    sub: 'Every interaction deliberate. Every detail purposeful. This is communication elevated to an art form.',
  },
  {
    headline: 'Focus is\nthe luxury.',
    sub: 'Precision instruments deserve a precise workspace. Obsidian Cinema puts clarity at the center of everything.',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  const handleEnter = () => router.push('/login')

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(t)
  }, [current])

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Hanken Grotesk, sans-serif',
    }}>
      {/* ── Cinematic Background Image ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/homepagebackgroung.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        // Ken Burns slow zoom
        animation: 'kenburns 20s ease-in-out infinite alternate',
      }} />

      {/* Multi-layer dark overlay for legibility */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.25) 40%, rgba(10,10,10,0.7) 75%, rgba(10,10,10,0.95) 100%)' }} />

      {/* Subtle gold tint from top-left (matches sunlight in image) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '50%', background: 'radial-gradient(ellipse at 30% 20%, rgba(233,195,73,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 48px' }}>
          <div>
            <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <span style={{ color: '#e9c349', textDecoration: 'underline', textDecorationColor: '#e9c349' }}>MAIL</span>
              {' '}
              <span style={{ color: '#e5e2e1' }}>CODECC</span>
            </span>
          </div>
          <button
            onClick={handleEnter}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(233,195,73,0.75)',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e9c349'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(233,195,73,0.75)'}
          >
            Skip Intro
          </button>
        </div>

        {/* Center content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 40px', textAlign: 'center',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
            >
              <h1 style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 'clamp(52px, 6vw, 80px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#f4f4f1',
                whiteSpace: 'pre-line',
                marginBottom: 24,
                maxWidth: 640,
                textShadow: '0 2px 40px rgba(0,0,0,0.6)',
              }}>
                {slides[current].headline}
              </h1>
              <p style={{
                fontSize: 17, lineHeight: 1.75,
                color: 'rgba(196,199,199,0.85)',
                maxWidth: 480, margin: '0 auto',
                textShadow: '0 1px 12px rgba(0,0,0,0.5)',
              }}>
                {slides[current].sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.2, 0, 0, 1] }}
            style={{ marginTop: 56 }}
          >
            <button
              onClick={handleEnter}
              style={{
                padding: '15px 36px',
                background: 'rgba(14,14,14,0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(68,71,72,0.7)',
                borderRadius: 2,
                color: '#e5e2e1',
                fontFamily: 'Hanken Grotesk',
                fontSize: 12, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 0.4s cubic-bezier(0.2,0,0,1)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(233,195,73,0.6)'
                el.style.boxShadow = '0 0 32px rgba(233,195,73,0.12)'
                el.style.background = 'rgba(20,18,14,0.75)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(68,71,72,0.7)'
                el.style.boxShadow = 'none'
                el.style.background = 'rgba(14,14,14,0.6)'
              }}
            >
              Enter Studio
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#e9c349' }}>arrow_forward</span>
            </button>
          </motion.div>
        </div>

        {/* Bottom — dots + progress */}
        <div style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: 7, height: 7, borderRadius: '50%', border: 'none',
                  cursor: 'pointer', padding: 0,
                  background: i === current ? '#e9c349' : 'rgba(229,226,225,0.3)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ width: 100, height: 1, background: 'rgba(68,71,72,0.5)', position: 'relative', overflow: 'hidden' }}>
            <motion.div
              key={current}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: 'linear' }}
              style={{ position: 'absolute', inset: 0, background: '#e9c349', transformOrigin: 'left' }}
            />
          </div>
        </div>
      </div>

      {/* Ken Burns + spin keyframes */}
      <style>{`
        @keyframes kenburns {
          from { transform: scale(1.0) translate(0, 0); }
          to   { transform: scale(1.06) translate(-1%, 1%); }
        }
      `}</style>
    </div>
  )
}
