'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'

const T = {
  bg: '#0e0e0e', surface: '#131313', surfaceLow: '#1c1b1b', surfaceMid: '#20201f', surfaceHigh: '#2a2a2a',
  onSurface: '#e5e2e1', onSurfaceVar: '#c4c7c7', gold: '#e9c349', outline: 'rgba(68,71,72,0.4)',
}

export default function MessageView() {
  const { selectedMessage, messageLoading, setSelectedMessage, archiveMessage, deleteMessage } = useMail()
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)

  if (!selectedMessage) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: T.bg, color: T.onSurfaceVar }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>mail</span>
        <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 14, opacity: 0.5 }}>Select a message to read</p>
      </div>
    )
  }

  const senderName = selectedMessage.senderName || selectedMessage.senderEmail || 'Unknown'
  const isHtml = selectedMessage.body?.trim().startsWith('<') || (selectedMessage.body?.includes('<') && selectedMessage.body?.includes('</'))

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedMessage.id}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 40px', borderBottom: `1px solid ${T.outline}` }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setSelectedMessage(null)} style={toolbarBtnStyle}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            </button>
            <button onClick={() => archiveMessage(selectedMessage)} style={toolbarBtnStyle} title="Archive">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>archive</span>
            </button>
            <button onClick={() => deleteMessage(selectedMessage)} style={toolbarBtnStyle} title="Delete">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}>
            <span style={{ padding: '4px 10px', background: 'rgba(233,195,73,0.12)', border: '1px solid rgba(233,195,73,0.25)', color: T.gold, borderRadius: 2 }}>Client</span>
            <span style={{ padding: '4px 10px', background: 'rgba(233,195,73,0.2)', border: '1px solid rgba(233,195,73,0.4)', color: T.gold, borderRadius: 2 }}>Urgent</span>
          </div>
        </div>

        {messageLoading ? (
          <div style={{ flex: 1, padding: '48px 64px' }}>
            <div style={{ height: 48, background: T.surfaceLow, borderRadius: 2, width: '60%', marginBottom: 16 }} />
            <div style={{ height: 16, background: T.surfaceLow, borderRadius: 2, width: '40%' }} />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '48px 64px' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 40, fontWeight: 600, lineHeight: 1.25, color: T.onSurface }}>
                {selectedMessage.subject || '(No subject)'}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 40, paddingBottom: 40, borderBottom: `1px solid ${T.outline}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0, background: T.surfaceHigh, border: `1px solid ${T.outline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk', fontSize: 13, fontWeight: 600, color: T.gold }}>
                {senderName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 14, fontWeight: 500, color: T.onSurface }}>{senderName}</span>
                  <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 12, color: T.onSurfaceVar, opacity: 0.6 }}>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                </div>
                <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 13, color: T.onSurfaceVar, opacity: 0.6 }}>{selectedMessage.senderEmail}</p>
                <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 12, color: T.onSurfaceVar, opacity: 0.5, marginTop: 4 }}>
                  To: {selectedMessage.recipients?.join(', ')}
                </p>
              </div>
            </div>

            <div style={{ fontFamily: 'Hanken Grotesk', fontSize: 16, lineHeight: 1.85, color: '#c0bdb8', letterSpacing: '0.01em' }}>
              {isHtml ? <div dangerouslySetInnerHTML={{ __html: selectedMessage.body || '' }} /> : <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{selectedMessage.body}</pre>}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

const toolbarBtnStyle: React.CSSProperties = { padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 2, color: '#c4c7c7', display: 'flex' }
