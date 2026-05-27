'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { useRouter, usePathname } from 'next/navigation'

/* ─── Design Tokens ─── */
const T = {
  bg:            '#0e0e0e',
  surface:       '#131313',
  surfaceLow:    '#1c1b1b',
  surfaceMid:    '#20201f',
  surfaceHigh:   '#2a2a2a',
  surfaceBright: '#393939',
  onSurface:     '#e5e2e1',
  onSurfaceVar:  '#c4c7c7',
  gold:          '#e9c349',
  outline:       'rgba(68,71,72,0.4)',
  outlineHover:  'rgba(68,71,72,0.8)',
}

const NAV_ITEMS = [
  { id: 'inbox',   icon: 'inbox',         label: 'Inbox' },
  { id: 'starred', icon: 'star',          label: 'Starred' },
  { id: 'sent',    icon: 'send',          label: 'Sent' },
  { id: 'drafts',  icon: 'draft',         label: 'Drafts' },
  { id: 'archive', icon: 'archive',       label: 'Archive' },
]

function Sidebar() {
  const { user, selectedFolder, setSelectedFolder, setComposeOpen, logout, mailbox } = useMail()
  const router = useRouter()
  const pathname = usePathname()
  const initials = user?.displayName?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'SU'
  
  return (
    <aside style={{
      width: 252, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100%', background: T.surface, borderRight: `1px solid ${T.outline}`,
    }}>
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.outline}` }}>
        <h1 onClick={() => router.push('/mail')} style={{ fontFamily: 'Hanken Grotesk', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1, cursor: 'pointer' }}>
          <span style={{ color: T.gold, textDecoration: 'underline', textDecorationColor: T.gold }}>MAIL</span>
          {' '}
          <span style={{ color: T.onSurface }}>CODECC</span>
        </h1>
        <div style={{ width: 32, height: 32, borderRadius: 2, background: T.surfaceHigh, border: `1px solid ${T.outline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk', fontSize: 11, fontWeight: 600, color: T.onSurface, letterSpacing: '0.05em' }}>{initials}</div>
      </div>

      <div style={{ padding: '16px 16px 8px' }}>
        <button onClick={() => setComposeOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: T.surfaceHigh, border: `1px solid ${T.outline}`, borderRadius: 2, color: T.onSurface, fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.2,0,0,1)' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(233,195,73,0.4)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.outline }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.onSurfaceVar }}>edit</span>
          Compose
        </button>
      </div>

      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = selectedFolder === item.id && pathname === '/mail'
          const folderData = mailbox?.folders?.find((f: any) => f.id === item.id)
          const count = (item.id === 'inbox' ? folderData?.unread : folderData?.count) || 0
          return (
            <button key={item.id} onClick={() => { setSelectedFolder(item.id); if (pathname !== '/mail') router.push('/mail') }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', background: isActive ? T.surfaceLow : 'none', border: 'none', borderLeft: isActive ? `2px solid ${T.gold}` : '2px solid transparent', color: isActive ? T.onSurface : T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 14, fontWeight: isActive ? 500 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s cubic-bezier(0.2,0,0,1)', marginBottom: 2 }} onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = T.onSurface }} onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = T.onSurfaceVar }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: isActive ? T.gold : 'inherit', fontVariationSettings: "'FILL' 0, 'wght' 200" }}>{item.icon}</span>
              {item.label}
              {count > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, fontFamily: 'Hanken Grotesk', color: (item.id === 'inbox') ? T.surfaceLow : T.onSurfaceVar, background: (item.id === 'inbox') ? T.gold : 'transparent', padding: (item.id === 'inbox') ? '2px 6px' : '0', borderRadius: 2 }}>{count}</span>}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '8px', borderTop: `1px solid ${T.outline}` }}>
        {[
          { icon: 'settings', label: 'Settings', action: () => router.push('/mail/settings'), active: pathname === '/mail/settings' },
          { icon: 'logout', label: 'Sign out', action: logout, active: false },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', background: item.active ? T.surfaceLow : 'none', border: 'none', borderLeft: item.active ? `2px solid ${T.gold}` : '2px solid transparent', color: item.active ? T.onSurface : T.onSurfaceVar, fontFamily: 'Hanken Grotesk', fontSize: 14, cursor: 'pointer', textAlign: 'left', marginBottom: 2, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = T.onSurface} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.onSurfaceVar}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 0, 'wght' 200" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

function MessageList() {
  const { messages, selectedMessage, setSelectedMessage, loading, selectedFolder, setSearchQuery, searchQuery, refreshMessages, hasMore, currentPage, nextPage, prevPage } = useMail()
  const [tab, setTab] = useState<'focused' | 'other'>('focused')

  const folderLabel: Record<string, string> = { inbox: 'Inbox', sent: 'Sent', drafts: 'Drafts', spam: 'Spam', trash: 'Trash', archive: 'Archive', starred: 'Starred' }
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const avatarColors: string[] = ['#2a2520', '#1a2a20', '#201a2a', '#2a1a1a', '#1a2025', '#252015']
  const getAvatarBg = (name: string) => { let h = 0; for (let c of name) h = c.charCodeAt(0) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length] }

  const formatTime = (ts: string) => {
    if (!ts) return ''
    const d = new Date(ts); const now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diff === 1) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ width: 440, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', background: T.surface, borderRight: `1px solid ${T.outline}` }}>
      <div style={{ padding: '24px 24px 0' }}>
        <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 40, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em', color: T.onSurface, marginBottom: 16 }}>
          {folderLabel[selectedFolder] || selectedFolder}
        </h2>
        {selectedFolder === 'inbox' && (
          <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${T.outline}`, marginBottom: 0 }}>
            {(['focused', 'other'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Hanken Grotesk', fontSize: 14, fontWeight: 500, color: tab === t ? T.onSurface : T.onSurfaceVar, paddingBottom: 12, borderBottom: tab === t ? `2px solid ${T.gold}` : '2px solid transparent', transition: 'all 0.2s', textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.outline}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: T.onSurfaceVar }}>search</span>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && refreshMessages()} placeholder="Search mail..." style={{ width: '100%', padding: '9px 12px 9px 36px', background: T.surfaceMid, border: `1px solid ${T.outline}`, borderRadius: 2, color: T.onSurface, fontFamily: 'Hanken Grotesk', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(233,195,73,0.4)'} onBlur={e => (e.target as HTMLElement).style.borderColor = T.outline} />
        </div>
        
        {/* Compact Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={prevPage} disabled={currentPage === 1 || loading} style={{ background: 'none', border: `1px solid ${T.outline}`, borderRadius: 2, color: T.onSurfaceVar, cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer', padding: '4px', opacity: (currentPage === 1 || loading) ? 0.3 : 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
          </button>
          <span style={{ fontSize: 11, fontFamily: 'Hanken Grotesk', color: T.onSurfaceVar, minWidth: 20, textAlign: 'center' }}>{currentPage}</span>
          <button onClick={nextPage} disabled={!hasMore || loading} style={{ background: 'none', border: `1px solid ${T.outline}`, borderRadius: 2, color: T.onSurfaceVar, cursor: (!hasMore || loading) ? 'not-allowed' : 'pointer', padding: '4px', opacity: (!hasMore || loading) ? 0.3 : 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: '20px 24px', borderBottom: `1px solid ${T.outline}`, display: 'flex', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 2, background: T.surfaceHigh, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: T.surfaceHigh, borderRadius: 2, width: '50%', marginBottom: 10 }} />
                <div style={{ height: 14, background: T.surfaceHigh, borderRadius: 2, width: '80%', marginBottom: 8 }} />
                <div style={{ height: 11, background: T.surfaceHigh, borderRadius: 2, width: '60%' }} />
              </div>
            </div>
          ))
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: T.onSurfaceVar }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>inbox</span>
            <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 14 }}>No messages</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isActive = selectedMessage?.id === msg.id
            const isSentFolder = selectedFolder === 'sent'
            const displayName = isSentFolder ? (msg.recipients[0] || 'Unknown Recipient') : (msg.senderName || msg.senderEmail || 'Unknown')
            return (
              <motion.button key={msg.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (i % 10) * 0.03, duration: 0.3, ease: [0.2, 0, 0, 1] }} onClick={() => setSelectedMessage(msg)} style={{ width: '100%', textAlign: 'left', padding: '20px 24px', background: isActive ? T.surfaceMid : 'transparent', border: 'none', borderBottom: `1px solid ${T.outline}`, borderLeft: isActive ? `3px solid ${T.gold}` : '3px solid transparent', cursor: 'pointer', display: 'flex', gap: 14, fontFamily: 'inherit', transition: 'all 0.2s cubic-bezier(0.2,0,0,1)' }} onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = T.surfaceLow }} onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div style={{ width: 40, height: 40, borderRadius: 2, flexShrink: 0, background: getAvatarBg(displayName), border: `1px solid ${T.outline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, color: msg.unread ? T.gold : T.onSurfaceVar, letterSpacing: '0.05em' }}>{getInitials(displayName)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 12, fontWeight: 600, color: msg.unread ? T.gold : T.onSurfaceVar, letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                      {isSentFolder && <span style={{ color: T.gold, fontSize: 9, marginRight: 4 }}>TO:</span>}
                      {displayName}
                    </span>
                    <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 11, color: T.onSurfaceVar, opacity: 0.6, flexShrink: 0 }}>{formatTime(msg.timestamp)}</span>
                  </div>
                  <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 14, fontWeight: msg.unread ? 500 : 400, color: T.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{msg.subject || '(No subject)'}</p>
                  <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 13, color: T.onSurfaceVar, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.snippet || ''}</p>
                </div>
              </motion.button>
            )
          })
        )}
      </div>
    </div>
  )
}

function MessageView() {
  const { selectedMessage, messageLoading, setSelectedMessage, archiveMessage, deleteMessage } = useMail()
  const [replyText, setReplyText] = useState(''); const [showReply, setShowReply] = useState(false)
  if (!selectedMessage) {
    return (
      <div style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', background: T.bg, position: 'relative', overflow: 'hidden' 
      }}>
        {/* Cinematic Background for empty state */}
        <div style={{ 
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'url(/homepagebackgroung.webp)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'grayscale(100%)'
        }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
          style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <img 
            src="/logo.png" 
            alt="CodeCoder Logo" 
            style={{ width: 300, height: 'auto', opacity: 0.6, marginBottom: 32, filter: 'drop-shadow(0 0 30px rgba(233,195,73,0.15))' }} 
          />
          <div style={{ height: 1, width: 60, background: T.gold, opacity: 0.4, marginBottom: 32 }} />
          <p style={{ 
            fontFamily: 'Hanken Grotesk', fontSize: 13, fontWeight: 600, 
            letterSpacing: '0.3em', textTransform: 'uppercase', color: T.onSurface, opacity: 0.4 
          }}>
            Select a message to read
          </p>
        </motion.div>
      </div>
    )
  }
  const senderName = selectedMessage.senderName || selectedMessage.senderEmail || 'Unknown'
  const isHtml = selectedMessage.body?.trim().startsWith('<') || (selectedMessage.body?.includes('<') && selectedMessage.body?.includes('</'))
  return (
    <AnimatePresence mode="wait">
      <motion.div key={selectedMessage.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 40px', borderBottom: `1px solid ${T.outline}` }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setSelectedMessage(null)} style={toolbarBtnStyle}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span></button>
            <button onClick={() => archiveMessage(selectedMessage)} style={toolbarBtnStyle} title="Archive"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>archive</span></button>
            <button onClick={() => deleteMessage(selectedMessage)} style={toolbarBtnStyle} title="Delete"><span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span></button>
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
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 40, fontWeight: 600, lineHeight: 1.25, color: T.onSurface }}>{selectedMessage.subject || '(No subject)'}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 40, paddingBottom: 40, borderBottom: `1px solid ${T.outline}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0, background: T.surfaceHigh, border: `1px solid ${T.outline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hanken Grotesk', fontSize: 13, fontWeight: 600, color: T.gold }}>{senderName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 14, fontWeight: 500, color: T.onSurface }}>{senderName}</span>
                  <span style={{ fontFamily: 'Hanken Grotesk', fontSize: 12, color: T.onSurfaceVar, opacity: 0.6 }}>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                </div>
                <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 13, color: T.onSurfaceVar, opacity: 0.6 }}>{selectedMessage.senderEmail}</p>
                <p style={{ fontFamily: 'Hanken Grotesk', fontSize: 12, color: T.onSurfaceVar, opacity: 0.5, marginTop: 4 }}>To: {selectedMessage.recipients?.join(', ')}</p>
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
export default function Sidebar_export() { return <Sidebar /> }
export { MessageList, MessageView, Sidebar }
