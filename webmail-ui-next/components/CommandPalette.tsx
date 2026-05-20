'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { Search, X, Command } from 'lucide-react'
import { formatDate, getInitials, getAvatarColor, cn } from '@/lib/utils'

export default function CommandPalette() {
  const { messages, setSelectedMessage, setSelectedFolder } = useMail()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  // Listen for Cmd+K / Ctrl+K
  if (typeof window !== 'undefined') {
    document.onkeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
  }

  const filtered = query.trim()
    ? messages.filter(m =>
      m.subject?.toLowerCase().includes(query.toLowerCase()) ||
      m.senderName?.toLowerCase().includes(query.toLowerCase()) ||
      m.senderEmail?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6)
    : []

  const folderActions = [
    { label: 'Go to Inbox', folder: 'inbox' },
    { label: 'Go to Sent', folder: 'sent' },
    { label: 'Go to Drafts', folder: 'drafts' },
    { label: 'Go to Spam', folder: 'spam' },
    { label: 'Go to Trash', folder: 'trash' },
  ].filter(a => !query || a.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[580px] bg-bg-elevated border border-border-default rounded-2xl overflow-hidden pointer-events-auto"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 80px rgba(0,0,0,0.8)' }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle">
                <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search messages or type a command..."
                  className="flex-1 text-[14px] text-text-primary placeholder:text-text-muted bg-transparent outline-none"
                />
                <button onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 text-text-muted hover:text-text-secondary transition-colors" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[340px] overflow-y-auto py-2">
                {/* Folder actions */}
                {folderActions.length > 0 && (
                  <div>
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Navigation</span>
                    </div>
                    {folderActions.map(action => (
                      <button
                        key={action.folder}
                        onClick={() => { setSelectedFolder(action.folder); setOpen(false); setQuery('') }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-hover transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-bg-tertiary border border-border-subtle flex items-center justify-center flex-shrink-0">
                          <Command className="w-3.5 h-3.5 text-text-tertiary" />
                        </div>
                        <span className="text-[13px] text-text-primary">{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Message results */}
                {filtered.length > 0 && (
                  <div>
                    <div className="px-4 py-2 mt-1">
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Messages</span>
                    </div>
                    {filtered.map(msg => {
                      const initials = getInitials(msg.senderName || msg.senderEmail)
                      const color = getAvatarColor(msg.senderName || msg.senderEmail)
                      return (
                        <button
                          key={msg.id}
                          onClick={() => { setSelectedMessage(msg); setOpen(false); setQuery('') }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-hover transition-colors text-left"
                        >
                          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 bg-gradient-to-br", color)}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-text-primary truncate">{msg.subject || '(No subject)'}</p>
                            <p className="text-[11px] text-text-muted truncate">{msg.senderName || msg.senderEmail}</p>
                          </div>
                          <span className="text-[11px] text-text-muted mono flex-shrink-0">{formatDate(msg.timestamp)}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Empty state */}
                {query && filtered.length === 0 && folderActions.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[13px] text-text-muted">No results for &ldquo;{query}&rdquo;</p>
                  </div>
                )}

                {/* Empty query hint */}
                {!query && (
                  <div className="px-4 py-4 text-center">
                    <p className="text-[12px] text-text-muted">Start typing to search messages or navigate</p>
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="px-4 py-2.5 border-t border-border-subtle flex items-center gap-4">
                <span className="text-[11px] text-text-muted flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-bg-tertiary border border-border-subtle rounded text-[10px] mono">↑↓</kbd>
                  navigate
                </span>
                <span className="text-[11px] text-text-muted flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-bg-tertiary border border-border-subtle rounded text-[10px] mono">↵</kbd>
                  select
                </span>
                <span className="text-[11px] text-text-muted flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-bg-tertiary border border-border-subtle rounded text-[10px] mono">esc</kbd>
                  close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
