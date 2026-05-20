'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { useRouter } from 'next/navigation'

const T = {
  bg: '#0e0e0e', surface: '#131313', surfaceMid: '#20201f', surfaceHigh: '#2a2a2a',
  onSurface: '#e5e2e1', onSurfaceVar: '#c4c7c7', gold: '#e9c349', outline: 'rgba(68,71,72,0.4)',
}

export default function ComposeStudio() {
  const { composeOpen, setComposeOpen, sendEmail, addToast } = useMail()
  const router = useRouter()
  const [to, setTo] = useState<string[]>([])
  const [toInput, setToInput] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [hoverBtn, setHoverBtn] = useState('')
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (composeOpen) { setTo([]); setToInput(''); setSubject(''); setBody('') } }, [composeOpen])

  const addRecipient = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && toInput.trim()) {
      e.preventDefault()
      setTo(prev => [...prev, toInput.trim()])
      setToInput('')
    }
  }

  const removeRecipient = (i: number) => setTo(prev => prev.filter((_, idx) => idx !== i))

  const handleSend = async () => {
    const allTo = [...to, toInput.trim()].filter(Boolean)
    if (!allTo.length || !subject.trim()) { addToast('error', 'To and Subject are required'); return }
    setSending(true)
    try {
      await sendEmail(allTo[0], subject.trim(), body, cc.trim() || undefined)
      setComposeOpen(false)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {composeOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 100, display: 'flex', flexDirection: 'column', fontFamily: 'Hanken Grotesk, sans-serif' }}
        >
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: `1px solid ${T.outline}` }}>
            <button
              onClick={() => setComposeOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = T.onSurface}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.onSurfaceVar}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Discard Draft
            </button>

            {/* Centered logo */}
            <h1 style={{ fontFamily: 'Hanken Grotesk', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <span style={{ color: T.gold }}>MAIL</span>
              {' '}
              <span style={{ color: T.onSurface }}>CODECODER</span>
            </h1>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: `1px solid ${T.outline}`, borderRadius: 2, padding: '8px 16px', cursor: 'pointer', color: T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(233,195,73,0.4)'; (e.currentTarget as HTMLElement).style.color = T.onSurface }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.outline; (e.currentTarget as HTMLElement).style.color = T.onSurfaceVar }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>save</span>
                Save
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSend}
                disabled={sending}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.gold, border: 'none', borderRadius: 2, padding: '9px 20px', cursor: 'pointer', color: '#1c1b1b', fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}
              >
                {sending ? <div style={{ width: 14, height: 14, border: '2px solid rgba(28,27,27,0.3)', borderTopColor: '#1c1b1b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <span className="material-symbols-outlined" style={{ fontSize: 15 }}>send</span>}
                Send
              </motion.button>
            </div>
          </div>

          {/* To field */}
          <div style={{ padding: '16px 32px', borderBottom: `1px solid ${T.outline}`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <label style={{ fontFamily: 'Hanken Grotesk', fontSize: 13, color: T.onSurfaceVar, paddingTop: 6, flexShrink: 0, letterSpacing: '0.06em' }}>TO</label>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {to.map((email, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: T.surfaceHigh, border: `1px solid ${T.outline}`, borderRadius: 2, fontFamily: 'Hanken Grotesk', fontSize: 13, color: T.onSurface }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: T.gold }}>person</span>
                  {email}
                  <button onClick={() => removeRecipient(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.onSurfaceVar, display: 'flex', padding: 0, lineHeight: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={toInput}
                onChange={e => setToInput(e.target.value)}
                onKeyDown={addRecipient}
                placeholder={to.length === 0 ? 'Add recipient...' : ''}
                autoFocus
                style={{ flex: 1, minWidth: 180, background: 'none', border: 'none', outline: 'none', fontFamily: 'Hanken Grotesk', fontSize: 14, color: T.onSurface }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowCc(!showCc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showCc ? T.gold : T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>Cc</button>
              <button onClick={() => setShowBcc(!showBcc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showBcc ? T.gold : T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>Bcc</button>
            </div>
          </div>

          {/* Subject */}
          <div style={{ padding: '24px 32px 0' }}>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject"
              style={{
                width: '100%', background: 'none', border: 'none', outline: 'none',
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: 40, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2,
                color: subject ? T.onSurface : T.onSurfaceVar,
              }}
            />
          </div>

          {/* Toolbar */}
          <div style={{ padding: '16px 32px', display: 'flex', gap: 4 }}>
            {[
              { icon: 'B', action: 'bold', isText: true, style: { fontWeight: 700 } },
              { icon: 'I', action: 'italic', isText: true, style: { fontStyle: 'italic' } },
              { icon: 'U', action: 'underline', isText: true, style: { textDecoration: 'underline' } },
            ].map(item => (
              <button key={item.action} style={{ width: 34, height: 34, background: T.surfaceHigh, border: `1px solid ${T.outline}`, borderRadius: 2, cursor: 'pointer', color: T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 13, ...item.style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </button>
            ))}
            <div style={{ width: 1, background: T.outline, margin: '0 4px' }} />
            {[
              { icon: 'format_align_left' }, { icon: 'format_align_center' },
              { icon: 'format_list_bulleted' }, { icon: 'link' }, { icon: 'attach_file' },
            ].map(item => (
              <button key={item.icon} style={{ width: 34, height: 34, background: T.surfaceHigh, border: `1px solid ${T.outline}`, borderRadius: 2, cursor: 'pointer', color: T.onSurfaceVar, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
              </button>
            ))}
          </div>

          {/* Body */}
          <textarea
            ref={bodyRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Begin drafting..."
            style={{
              flex: 1, padding: '0 32px 24px', background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontFamily: 'Hanken Grotesk', fontSize: 16, lineHeight: 1.85, color: T.onSurface,
              letterSpacing: '0.01em',
            }}
          />

          {/* Attachments */}
          <div style={{ padding: '16px 32px', borderTop: `1px solid ${T.outline}` }}>
            <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onSurfaceVar, marginBottom: 10 }}>Attachments</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ width: 160, height: 64, background: T.surfaceMid, border: `1px dashed ${T.outline}`, borderRadius: 2, cursor: 'pointer', color: T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Add File
              </button>
            </div>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
