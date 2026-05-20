'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { formatDate, getInitials } from '@/lib/utils'

const C = {
  bg: '#0c0c0e',
  card: '#111115',
  hover: '#161620',
  border: '#1e1e28',
  text: '#f0f0f5',
  textSub: '#8a8a9a',
  textMuted: '#4a4a5a',
  blue: '#4f8ef7',
  blueHover: '#3a7be0',
  blueGlow: 'rgba(79, 142, 247, 0.12)',
  amber: '#f5a623',
  red: '#f04f4f',
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
]

function getGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: C.bg }}>
      <div style={{
        width: 60, height: 60, borderRadius: 18,
        background: '#141420', border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#4a4a5a" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: C.textSub, margin: 0, marginBottom: 6 }}>Select a message</p>
        <p style={{ fontSize: 12.5, color: C.textMuted, margin: 0 }}>Pick a message from the list to read it here</p>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', background: '#141420',
        border: `1px solid ${C.border}`, borderRadius: 8,
      }}>
        <kbd style={{ fontSize: 10, color: C.textMuted, fontFamily: 'monospace', background: '#1c1c28', padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>J</kbd>
        <span style={{ fontSize: 10, color: C.textMuted }}>/</span>
        <kbd style={{ fontSize: 10, color: C.textMuted, fontFamily: 'monospace', background: '#1c1c28', padding: '2px 6px', borderRadius: 4, border: `1px solid ${C.border}` }}>K</kbd>
        <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 4 }}>to navigate</span>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ flex: 1, padding: '32px 40px', background: C.bg }}>
      <div style={{ maxWidth: 700 }}>
        <div style={{ height: 28, background: '#161620', borderRadius: 8, width: '65%', marginBottom: 14 }} />
        <div style={{ height: 14, background: '#161620', borderRadius: 6, width: '35%', marginBottom: 28 }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#161620', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 13, background: '#161620', borderRadius: 6, width: 120, marginBottom: 8 }} />
            <div style={{ height: 12, background: '#161620', borderRadius: 6, width: 200 }} />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ height: 12, background: '#161620', borderRadius: 6, width: `${60 + Math.random() * 35}%`, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  )
}

export default function MessageView() {
  const { selectedMessage, messageLoading, setSelectedMessage } = useMail()
  const [replyText, setReplyText] = useState('')
  const [replyFocus, setReplyFocus] = useState(false)

  if (!selectedMessage) return <EmptyState />

  const senderName = selectedMessage.senderName || selectedMessage.senderEmail || 'Unknown Sender'
  const gradient = getGradient(senderName)
  const initials = getInitials(senderName)
  const isHtml = selectedMessage.body?.trim().startsWith('<') || (selectedMessage.body?.includes('<') && selectedMessage.body?.includes('</'))

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedMessage.id}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg, overflow: 'hidden' }}
      >
        {messageLoading ? <LoadingSkeleton /> : (
          <>
            {/* Top toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px', borderBottom: `1px solid ${C.border}`,
              background: C.card, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { title: 'Reply', path: 'M3 10a7 7 0 017-7h4l-3 3m0 0l3 3m-3-3v7a7 7 0 01-7 7H3' },
                  { title: 'Forward', path: 'M21 10a7 7 0 00-7-7H10l3 3m0 0L10 9m3-3v7a7 7 0 007 7h4' },
                ].map(btn => (
                  <button key={btn.title} title={btn.title} style={{ padding: '7px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 7, color: C.textMuted, display: 'flex', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.hover; (e.currentTarget as HTMLElement).style.color = C.textSub }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = C.textMuted }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={btn.path} /></svg>
                  </button>
                ))}
                <div style={{ width: 1, height: 20, background: C.border, margin: '0 4px', alignSelf: 'center' }} />
                <button title="Delete" style={{ padding: '7px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 7, color: C.textMuted, display: 'flex', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,79,79,0.08)'; (e.currentTarget as HTMLElement).style.color = C.red }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = C.textMuted }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button title="Star" style={{ padding: '7px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 7, color: selectedMessage.starred ? C.amber : C.textMuted, display: 'flex', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.hover }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <svg width="14" height="14" fill={selectedMessage.starred ? C.amber : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </button>
              </div>
              <button onClick={() => setSelectedMessage(null)}
                style={{ padding: '7px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 7, color: C.textMuted, display: 'flex', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.hover; (e.currentTarget as HTMLElement).style.color = C.textSub }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = C.textMuted }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 40px' }}>
                {/* Subject */}
                <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: '-0.4px', margin: 0, marginBottom: 20, lineHeight: 1.3 }}>
                  {selectedMessage.subject || '(No subject)'}
                </h1>

                {/* Sender row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, marginBottom: 28 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 650, color: C.text }}>{senderName}</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>&lt;{selectedMessage.senderEmail}&gt;</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>
                      To: {selectedMessage.recipients?.join(', ')} &nbsp;·&nbsp; {formatDate(selectedMessage.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Message body */}
                <div style={{ fontSize: 14.5, lineHeight: 1.75, color: '#c8c8d8' }}>
                  {isHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedMessage.body || '' }}
                      style={{ color: '#c8c8d8' }}
                    />
                  ) : (
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, color: '#c8c8d8' }}>
                      {selectedMessage.body || 'No content available'}
                    </pre>
                  )}
                </div>

                {/* Reply box */}
                <div style={{ marginTop: 36, border: `1px solid ${replyFocus ? '#4f8ef7' : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s', boxShadow: replyFocus ? '0 0 0 3px rgba(79,142,247,0.08)' : 'none' }}>
                  <div style={{ padding: '10px 16px', background: '#141420', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.textMuted }}>
                      Reply to <strong style={{ color: C.textSub }}>{senderName}</strong>
                    </span>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onFocus={() => setReplyFocus(true)}
                    onBlur={() => setReplyFocus(false)}
                    placeholder="Write your reply..."
                    style={{
                      width: '100%', padding: '14px 16px', background: '#0f0f15',
                      color: C.text, fontSize: 13.5, fontFamily: 'inherit',
                      outline: 'none', resize: 'none', minHeight: 100, border: 'none',
                    }}
                  />
                  <div style={{ padding: '10px 16px', background: '#141420', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      disabled={!replyText.trim()}
                      style={{
                        padding: '8px 18px',
                        background: replyText.trim() ? 'linear-gradient(135deg, #4f8ef7, #3a6fd8)' : '#1e1e2a',
                        border: 'none', borderRadius: 9,
                        color: replyText.trim() ? '#fff' : C.textMuted,
                        fontSize: 13, fontWeight: 600, cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: replyText.trim() ? '0 2px 8px rgba(79,142,247,0.25)' : 'none',
                      }}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
