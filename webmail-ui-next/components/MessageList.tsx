'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { formatDate, getInitials, getAvatarColor } from '@/lib/utils'
import type { Message } from '@/lib/types'

const C = {
  bg: '#0c0c0e',
  surface: '#0f0f13',
  hover: '#161620',
  active: '#1a1a25',
  border: '#1e1e28',
  text: '#f0f0f5',
  textSub: '#8a8a9a',
  textMuted: '#4a4a5a',
  blue: '#4f8ef7',
  unreadDot: '#4f8ef7',
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
]

function getGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

function SkeletonItem() {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', gap: 12, borderBottom: `1px solid #1e1e28` }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1c1c25', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ height: 11, background: '#1c1c25', borderRadius: 6, width: 90 }} />
          <div style={{ height: 11, background: '#1c1c25', borderRadius: 6, width: 45 }} />
        </div>
        <div style={{ height: 11, background: '#1c1c25', borderRadius: 6, width: '80%', marginBottom: 6 }} />
        <div style={{ height: 10, background: '#1c1c25', borderRadius: 6, width: '55%' }} />
      </div>
    </div>
  )
}

function MessageItem({ message, isSelected }: { message: Message; isSelected: boolean }) {
  const { setSelectedMessage } = useMail()
  const senderName = message.senderName || message.senderEmail || 'Unknown'
  const initials = getInitials(senderName)
  const gradient = getGradient(senderName)

  return (
    <motion.button
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setSelectedMessage(message)}
      style={{
        width: '100%', textAlign: 'left', padding: '13px 16px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        background: isSelected ? C.active : 'transparent',
        border: 'none', borderBottom: `1px solid ${C.border}`,
        cursor: 'pointer', position: 'relative', fontFamily: 'inherit',
        transition: 'background 0.12s ease',
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = C.hover }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {/* Unread dot */}
      {message.unread && !isSelected && (
        <div style={{
          position: 'absolute', left: 5, top: '50%', transform: 'translateY(-50%)',
          width: 5, height: 5, borderRadius: '50%', background: C.blue,
        }} />
      )}

      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#fff',
        marginLeft: message.unread ? 4 : 0,
      }}>
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{
            fontSize: 13, fontWeight: message.unread ? 650 : 500,
            color: message.unread ? C.text : C.textSub,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140,
          }}>
            {senderName}
          </span>
          <span style={{ fontSize: 11, color: C.textMuted, fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 6 }}>
            {formatDate(message.timestamp)}
          </span>
        </div>

        {/* Row 2 - Subject */}
        <p style={{
          fontSize: 12.5, fontWeight: message.unread ? 600 : 400,
          color: message.unread ? '#d0d0e0' : C.textSub,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, marginBottom: 2,
        }}>
          {message.subject || '(No subject)'}
        </p>

        {/* Row 3 - Snippet */}
        <p style={{
          fontSize: 11.5, color: C.textMuted, margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {message.snippet || 'No preview available'}
        </p>
      </div>
    </motion.button>
  )
}

export default function MessageList() {
  const { messages, selectedMessage, loading, selectedFolder, searchQuery, setSearchQuery, refreshMessages } = useMail()

  const folderLabel: Record<string, string> = {
    inbox: 'Inbox', sent: 'Sent', drafts: 'Drafts', spam: 'Spam', trash: 'Trash',
  }

  return (
    <div style={{
      width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100%', background: C.surface, borderRight: `1px solid ${C.border}`,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>
            {folderLabel[selectedFolder] || selectedFolder}
          </h2>
          <span style={{ fontSize: 11, color: C.textMuted }}>
            {messages.length}
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#4a4a5a" strokeWidth={2.5}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && refreshMessages()}
            placeholder="Search..."
            style={{
              width: '100%', padding: '8px 12px 8px 30px',
              background: '#1a1a22', border: '1px solid #252530',
              borderRadius: 9, color: C.text, fontSize: 12.5, fontFamily: 'inherit',
              outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target as HTMLElement).style.borderColor = '#4f8ef7'}
            onBlur={e => (e.target as HTMLElement).style.borderColor = '#252530'}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => <SkeletonItem key={i} />)
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#1c1c25', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#4a4a5a" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: C.textSub, fontWeight: 500, margin: 0, marginBottom: 6 }}>No messages</p>
            <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>This folder is empty</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <MessageItem key={msg.id} message={msg} isSelected={selectedMessage?.id === msg.id} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
