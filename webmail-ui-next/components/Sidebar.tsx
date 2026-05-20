'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { cn } from '@/lib/utils'

const C = {
  bg: '#0c0c0e',
  surface: '#111115',
  card: '#16161b',
  elevated: '#1c1c23',
  hover: '#1f1f27',
  active: '#232330',
  border: '#252530',
  borderStrong: '#32323f',
  text: '#f0f0f5',
  textSub: '#8a8a9a',
  textMuted: '#4a4a5a',
  blue: '#4f8ef7',
  blueGlow: 'rgba(79, 142, 247, 0.12)',
  red: '#f04f4f',
  amber: '#f5a623',
  green: '#4fbe7e',
}

const ICONS = {
  inbox: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4m8-5v5" />
    </svg>
  ),
  sent: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  drafts: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  spam: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  trash: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  compose: (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  refresh: (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  logout: (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
}

const folders = [
  { id: 'inbox', label: 'Inbox', icon: ICONS.inbox },
  { id: 'sent', label: 'Sent', icon: ICONS.sent },
  { id: 'drafts', label: 'Drafts', icon: ICONS.drafts },
  { id: 'spam', label: 'Spam', icon: ICONS.spam },
  { id: 'trash', label: 'Trash', icon: ICONS.trash },
]

export default function Sidebar() {
  const { user, mailbox, selectedFolder, setSelectedFolder, setComposeOpen, refreshMessages, logout } = useMail()

  const getFolderCount = (folderId: string) => {
    const folder = mailbox?.folders?.find(f => f.id === folderId)
    return folder?.count || 0
  }

  const avatarLetter = user?.displayName?.[0]?.toUpperCase() || 'S'

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        fontFamily: 'inherit',
      }}
    >
      {/* Account */}
      <div style={{ padding: '18px 14px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f8ef7, #7c5ef0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {avatarLetter}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.displayName || 'Support'}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <div style={{ color: C.textMuted, flexShrink: 0 }}>{ICONS.chevron}</div>
        </div>
      </div>

      {/* Compose */}
      <div style={{ padding: '12px 12px 8px' }}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setComposeOpen(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 7, padding: '9px 14px',
            background: 'linear-gradient(135deg, #4f8ef7, #3a6fd8)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 10px rgba(79,142,247,0.25)',
          }}
        >
          {ICONS.compose}
          New Message
        </motion.button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
        {folders.map((folder, i) => {
          const count = getFolderCount(folder.id)
          const isActive = selectedFolder === folder.id
          return (
            <motion.button
              key={folder.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.28 }}
              onClick={() => setSelectedFolder(folder.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 9,
                background: isActive ? C.active : 'transparent',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                color: isActive ? C.text : C.textSub,
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                marginBottom: 1, transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = C.hover }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ color: isActive ? C.blue : C.textMuted, flexShrink: 0 }}>
                {folder.icon}
              </span>
              <span style={{ flex: 1 }}>{folder.label}</span>
              {count > 0 && folder.id === 'inbox' && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 99,
                  background: isActive ? C.blue : C.elevated,
                  color: isActive ? '#fff' : C.textMuted,
                }}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </motion.button>
          )
        })}

        <div style={{ height: 1, background: C.border, margin: '8px 4px' }} />

        <button
          onClick={refreshMessages}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 9,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: C.textMuted, fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            transition: 'all 0.15s ease', textAlign: 'left',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.hover}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          {ICONS.refresh}
          Refresh
        </button>
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px 8px 12px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={logout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 9,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: C.textMuted, fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            transition: 'all 0.15s ease', textAlign: 'left',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,79,79,0.08)'; (e.currentTarget as HTMLElement).style.color = C.red; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = C.textMuted; }}
        >
          {ICONS.logout}
          Sign out
        </button>
      </div>
    </motion.aside>
  )
}
