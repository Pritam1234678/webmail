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
  const [exiting, setExiting] = useState(false)

  const goTo = (i: number) => { setCurrent(i) }

  const handleEnter = () => {
    router.push('/login')
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(t)
  }, [current])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0e0e0e, #131313)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'Hanken Grotesk, sans-serif',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px' }}>
        <div>
          <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span style={{ color: '#e9c349', textDecoration: 'underline' }}>MAIL</span>
            {' '}
            <span style={{ color: '#e5e2e1' }}>CODECC</span>
          </span>
        </div>
        <button
          onClick={handleEnter}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#e9c349', opacity: 0.8 }}
        >
          Skip Intro
        </button>
      </div>

      {/* Center content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
          >
            <h1 style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 72, fontWeight: 700,
              lineHeight: 1.1, letterSpacing: '-0.02em',
              color: '#e5e2e1', whiteSpace: 'pre-line',
              marginBottom: 28, maxWidth: 600,
            }}>
              {slides[current].headline}
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.7, color: '#c4c7c7', maxWidth: 520, margin: '0 auto' }}>
              {slides[current].sub}
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ marginTop: 52 }}
        >
          <button
            onClick={handleEnter}
            style={{
              padding: '14px 32px',
              background: 'transparent',
              border: '1px solid rgba(68,71,72,0.6)',
              borderRadius: 2,
              color: '#e5e2e1',
              fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'all 0.4s cubic-bezier(0.2,0,0,1)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(233,195,73,0.5)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(233,195,73,0.08)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(68,71,72,0.6)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
            }}
          >
            Enter Studio
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        </motion.div>
      </div>

      {/* Dots + progress line */}
      <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: i === current ? '#e9c349' : 'rgba(200,200,200,0.25)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
        <div style={{ width: 120, height: 1, background: 'rgba(68,71,72,0.4)', position: 'relative', overflow: 'hidden' }}>
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
  )
}
