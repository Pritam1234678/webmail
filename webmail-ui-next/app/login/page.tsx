'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userFocus, setUserFocus] = useState(false)
  const [passFocus, setPassFocus] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

  useEffect(() => {
    api.auth.session().then((d: any) => {
      if (d?.session || d?.user) router.replace('/mail')
    }).catch(() => {})
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    setError(''); setLoading(true)
    try {
      const email = username.includes('@') ? username : `${username}@codecoder.in`
      // Store token for Authorization header (bypasses cookie issues on Vercel)
      const token = btoa(`${email}:${password}`)
      try { localStorage.setItem('mc_auth_token', token) } catch {}

      const data: any = await api.auth.login({ username: username.trim(), password })
      
      const userObj = data?.session || data?.user || data || {
        email: email,
        displayName: username,
      }
      try { localStorage.setItem('mc_session_user', JSON.stringify(userObj)) } catch {}
      router.replace('/mail')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Check username/password.')
      try { localStorage.removeItem('mc_auth_token') } catch {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0e0e0e, #131313)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', flexDirection: 'column',
    }}>
      {/* Atmospheric glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '25%', left: '25%', width: 384, height: 384, background: 'rgba(233,195,73,0.05)', borderRadius: '50%', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: 500, height: 500, background: 'rgba(200,198,197,0.04)', borderRadius: '50%', filter: 'blur(150px)' }} />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 480, padding: '0 24px' }}
      >
        <div style={{
          background: 'rgba(28,27,27,0.8)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(68,71,72,0.2)',
          borderRadius: 8,
          padding: '48px',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{ marginBottom: 48 }}>
            <h1 style={{
              fontFamily: 'Hanken Grotesk, sans-serif',
              fontSize: 20, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', lineHeight: 1,
            }}>
              <span style={{ color: '#e9c349', textDecoration: 'underline', textDecorationColor: '#e9c349' }}>MAIL</span>
              {' '}
              <span style={{ color: '#e5e2e1' }}>CODECC</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: 32, position: 'relative' }}>
              <label style={{
                display: 'block', fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: userFocus ? '#e9c349' : '#c4c7c7',
                marginBottom: 8, transition: 'color 0.3s',
              }}>Executive ID</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  color: userFocus ? '#e9c349' : '#c4c7c7',
                  transition: 'color 0.3s', pointerEvents: 'none', fontSize: 20,
                }}>badge</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setUserFocus(true)}
                  onBlur={() => setUserFocus(false)}
                  placeholder=""
                  autoFocus
                  required
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${userFocus ? '#e9c349' : 'rgba(68,71,72,0.4)'}`,
                    color: '#e5e2e1', fontFamily: 'Hanken Grotesk', fontSize: 16,
                    padding: '12px 0 12px 36px', outline: 'none',
                    transition: 'border-color 0.3s cubic-bezier(0.2,0,0,1)',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 40, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{
                  fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: passFocus ? '#e9c349' : '#c4c7c7',
                  transition: 'color 0.3s',
                }}>Clearance Key</label>
                <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c4c7c7', opacity: 0.6, cursor: 'pointer' }}>Recover</span>
              </div>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  color: passFocus ? '#e9c349' : '#c4c7c7',
                  transition: 'color 0.3s', pointerEvents: 'none', fontSize: 20,
                }}>key</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  required
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${passFocus ? '#e9c349' : 'rgba(68,71,72,0.4)'}`,
                    color: '#e5e2e1', fontFamily: 'Hanken Grotesk', fontSize: 16,
                    padding: '12px 0 12px 36px', outline: 'none',
                    transition: 'border-color 0.3s cubic-bezier(0.2,0,0,1)',
                  }}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.2)', borderRadius: 4 }}>
                  <p style={{ fontSize: 13, color: '#ffb4ab' }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !username || !password}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width: '100%',
                background: btnHover ? '#2a2a2a' : '#353535',
                color: '#e5e2e1',
                fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '16px 24px',
                border: btnHover ? '1px solid rgba(233,195,73,0.5)' : '1px solid rgba(68,71,72,0.3)',
                borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                transition: 'all 0.5s cubic-bezier(0.2,0,0,1)',
                boxShadow: btnHover ? '0 0 20px rgba(233,195,73,0.1)' : 'none',
                opacity: (loading || !username || !password) ? 0.5 : 1,
              }}
            >
              {loading ? (
                <div style={{ width: 16, height: 16, border: '1.5px solid rgba(229,226,225,0.3)', borderTopColor: '#e5e2e1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>
                  Enter the Workspace
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: btnHover ? '#e9c349' : '#c4c7c7', transition: 'all 0.5s cubic-bezier(0.2,0,0,1)', transform: btnHover ? 'translateX(4px)' : 'none' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c4c7c7', opacity: 0.4 }}>
            Strictly Confidential • Authorized Personnel Only
          </p>
        </div>
      </motion.main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
