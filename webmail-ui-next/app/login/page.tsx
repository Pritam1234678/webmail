'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'

function Particle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-accent-blue opacity-0 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{
        opacity: [0, 0.4, 0],
        y: [0, -60, -120],
        scale: [1, 1.2, 0.8],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 4,
    }))
  )

  useEffect(() => {
    setMounted(true)
    // Check if already logged in
    api.auth.session().then((data: any) => {
      if (data?.session || data?.user) router.replace('/mail')
    }).catch(() => {})
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setError('')
    setLoading(true)
    try {
      await api.auth.login(username.trim(), password)
      router.replace('/mail')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full opacity-3"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
      </div>

      {/* Particles */}
      {mounted && particles.current.map(p => (
        <Particle key={p.id} x={p.x} y={p.y} size={p.size} delay={p.delay} />
      ))}

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[400px] mx-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-bg-elevated border border-border-default shadow-md-dark mb-4"
            style={{ boxShadow: '0 0 0 1px rgba(59,130,246,0.1), 0 4px 12px rgba(0,0,0,0.5)' }}>
            <span className="text-xl font-bold text-text-primary tracking-tighter">C</span>
          </div>
          <h1 className="text-[22px] font-semibold text-text-primary tracking-tight">Codecoder Mail</h1>
          <p className="text-[13px] text-text-tertiary mt-1">Sign in to your account</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-bg-elevated border border-border-default rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.6)' }}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-tertiary uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="support"
                autoComplete="username"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-tertiary uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 bg-bg-tertiary border border-border-default rounded-xl text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3.5 py-2.5 bg-accent-red/10 border border-accent-red/20 rounded-xl"
                >
                  <p className="text-[13px] text-accent-red">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !username || !password}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-2.5 px-4 bg-accent-blue hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-[14px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="px-6 py-3 bg-bg-tertiary border-t border-border-subtle">
            <p className="text-[11px] text-text-muted text-center tracking-wide">SECURE TERMINAL ACCESS</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
