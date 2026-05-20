'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'

const T = {
  bg: '#0e0e0e', onSurface: '#e5e2e1', onSurfaceVar: '#c4c7c7',
  gold: '#e9c349', outline: 'rgba(68,71,72,0.5)', surfaceHigh: '#2a2a2a',
  surfaceMid: '#20201f', surfaceLow: '#1c1b1b',
}

const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

export default function CommandPalette() {
  const { messages, setSelectedMessage, setSelectedFolder, composeOpen, setComposeOpen } = useMail()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'contacts' | 'attachments'>('all')

  if (typeof window !== 'undefined') {
    document.onkeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
  }

  const filtered = query.trim()
    ? messages.filter(m =>
      m.subject?.toLowerCase().includes(query.toLowerCase()) ||
      m.senderName?.toLowerCase().includes(query.toLowerCase()) ||
      m.senderEmail?.toLowerCase().includes(query.toLowerCase()) ||
      m.snippet?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6)
    : messages.slice(0, 4)

  const suggested = ['"Contract"', '"Drafts"', '"Studio"']
  const filters = [
    { id: 'all', label: 'All Mailboxes', count: 1 },
    { id: 'contacts', label: 'Contacts', count: 2 },
    { id: 'attachments', label: 'Attachments', count: 3 },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 201,
              display: 'flex', flexDirection: 'column',
              background: T.bg,
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}
          >
            {/* Search header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 32px', borderBottom: `1px solid ${T.outline}` }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: T.onSurfaceVar }}>search</span>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search emails, contacts, or commands..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontSize: 32, fontWeight: 600, color: query ? T.onSurface : T.onSurfaceVar,
                  letterSpacing: '-0.01em',
                }}
              />
              <button
                onClick={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${T.outline}`, borderRadius: 2, padding: '6px 12px', cursor: 'pointer', color: T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 10, background: T.surfaceHigh, padding: '2px 4px', borderRadius: 2 }}>ESC</span>
                Close
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left panel — Filters */}
              <div style={{ width: 260, borderRight: `1px solid ${T.outline}`, padding: '28px 20px', flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onSurfaceVar, marginBottom: 12 }}>Search In</p>
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', borderRadius: 2, marginBottom: 4,
                      background: filter === f.id ? T.surfaceMid : 'none',
                      border: filter === f.id ? `1px solid rgba(233,195,73,0.25)` : `1px solid transparent`,
                      cursor: 'pointer', color: filter === f.id ? T.onSurface : T.onSurfaceVar,
                      fontFamily: 'Hanken Grotesk', fontSize: 13, transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: filter === f.id ? T.gold : 'inherit' }}>
                        {f.id === 'all' ? 'inbox' : f.id === 'contacts' ? 'person' : 'attach_file'}
                      </span>
                      {f.label}
                    </div>
                    <span style={{ fontSize: 11, color: T.onSurfaceVar, border: `1px solid ${T.outline}`, borderRadius: 2, padding: '1px 6px' }}>{f.count}</span>
                  </button>
                ))}

                <div style={{ height: 1, background: T.outline, margin: '20px 0' }} />

                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onSurfaceVar, marginBottom: 12 }}>Filters</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Has Attachment', 'Unread', 'From VIPs', 'Last 7 Days'].map(tag => (
                    <button key={tag} style={{
                      padding: '5px 10px', borderRadius: 2, fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600,
                      border: tag === 'Unread' ? `1px solid ${T.gold}` : `1px solid ${T.outline}`,
                      background: tag === 'Unread' ? 'rgba(233,195,73,0.12)' : 'none',
                      color: tag === 'Unread' ? T.gold : T.onSurfaceVar, cursor: 'pointer',
                    }}>{tag}</button>
                  ))}
                </div>
              </div>

              {/* Right panel — Results */}
              <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
                {!query && (
                  <div style={{ marginBottom: 28 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onSurfaceVar, marginBottom: 14 }}>Suggested Queries</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {suggested.map(s => (
                        <button key={s} onClick={() => setQuery(s.replace(/"/g, ''))}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 13 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.onSurfaceVar }}>
                      {query ? 'Results' : 'Recent Results'}
                    </p>
                    <p style={{ fontSize: 11, color: T.onSurfaceVar, opacity: 0.6 }}>
                      Use ↑↓ to navigate, ↵ to select
                    </p>
                  </div>

                  {filtered.map((msg, i) => {
                    const senderName = msg.senderName || msg.senderEmail || 'Unknown'
                    const highlighted = (text: string) => {
                      if (!query) return <>{text}</>
                      const idx = text.toLowerCase().indexOf(query.toLowerCase())
                      if (idx === -1) return <>{text}</>
                      return <>{text.slice(0, idx)}<span style={{ color: T.gold }}>{text.slice(idx, idx + query.length)}</span>{text.slice(idx + query.length)}</>
                    }
                    return (
                      <motion.button
                        key={msg.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { setSelectedMessage(msg); setOpen(false); setQuery('') }}
                        style={{
                          width: '100%', textAlign: 'left', padding: '20px 20px',
                          background: i === 0 ? T.surfaceMid : 'none',
                          border: 'none', borderBottom: `1px solid rgba(68,71,72,0.2)`,
                          borderLeft: i === 0 ? `3px solid ${T.gold}` : '3px solid transparent',
                          cursor: 'pointer', display: 'flex', gap: 16, fontFamily: 'inherit',
                          marginBottom: 4, borderRadius: 2,
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 2, background: T.surfaceHigh, border: `1px solid ${T.outline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.onSurfaceVar }}>description</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 15, fontWeight: 500, color: T.onSurface }}>
                              {highlighted(msg.subject || '(No subject)')}
                            </span>
                            <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 11, color: T.onSurfaceVar, opacity: 0.6, flexShrink: 0 }}>
                              {i === 0 ? '2 hrs ago' : i === 1 ? 'Yesterday' : ''}
                            </span>
                          </div>
                          <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 12, color: T.onSurfaceVar, margin: '0 0 6px' }}>
                            From: {highlighted(senderName)} &lt;{highlighted(msg.senderEmail || '')}&gt;
                          </p>
                          <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 13, color: T.onSurfaceVar, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {msg.snippet || ''}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer shortcuts */}
            <div style={{ padding: '14px 32px', borderTop: `1px solid ${T.outline}`, display: 'flex', gap: 24, justifyContent: 'center' }}>
              {[
                { keys: ['↑', '↓'], label: 'Navigate' },
                { keys: ['↵'], label: 'Select' },
                { keys: ['⌘', 'K'], label: 'Commands' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {item.keys.map(k => (
                      <kbd key={k} style={{ fontFamily: 'monospace', fontSize: 11, background: T.surfaceHigh, border: `1px solid ${T.outline}`, borderRadius: 2, padding: '2px 6px', color: T.onSurfaceVar }}>{k}</kbd>
                    ))}
                  </div>
                  <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.onSurfaceVar, opacity: 0.6 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
