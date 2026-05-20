'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { formatDate, getInitials, getAvatarColor, cn } from '@/lib/utils'
import { Reply, Forward, Trash2, Star, MoreHorizontal, X, ExternalLink } from 'lucide-react'
import { useState } from 'react'

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-7 bg-bg-elevated rounded w-3/4" />
        <div className="h-4 bg-bg-elevated rounded w-1/3" />
      </div>
      <div className="flex items-center gap-4 py-4 border-y border-border-subtle">
        <div className="w-10 h-10 rounded-full bg-bg-elevated" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 bg-bg-elevated rounded w-32" />
          <div className="h-3 bg-bg-elevated rounded w-48" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 bg-bg-elevated rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    </div>
  )
}

export default function MessageView() {
  const { selectedMessage, messageLoading, setSelectedMessage, setComposeOpen } = useMail()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  if (!selectedMessage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center bg-bg-primary gap-4"
      >
        <div className="w-16 h-16 rounded-3xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
          <span className="text-2xl">✉️</span>
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-text-secondary">Select a message</p>
          <p className="text-[13px] text-text-muted mt-1">Choose a message from the list to read it</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated rounded-lg border border-border-subtle">
          <kbd className="text-[10px] text-text-muted font-mono">J</kbd>
          <span className="text-[10px] text-text-muted">/</span>
          <kbd className="text-[10px] text-text-muted font-mono">K</kbd>
          <span className="text-[11px] text-text-muted ml-1">to navigate</span>
        </div>
      </motion.div>
    )
  }

  const initials = getInitials(selectedMessage.senderName || selectedMessage.senderEmail)
  const avatarColor = getAvatarColor(selectedMessage.senderName || selectedMessage.senderEmail)
  const isHtml = selectedMessage.body?.includes('<') && selectedMessage.body?.includes('>')

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedMessage.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col bg-bg-primary overflow-hidden"
      >
        {messageLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle flex-shrink-0">
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-tertiary hover:text-text-secondary"
                  title="Reply">
                  <Reply className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-tertiary hover:text-text-secondary"
                  title="Forward">
                  <Forward className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-border-subtle mx-1" />
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-tertiary hover:text-accent-red"
                  title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-tertiary hover:text-accent-amber"
                  title="Star">
                  <Star className={cn("w-4 h-4", selectedMessage.starred && "fill-accent-amber text-accent-amber")} />
                </button>
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-tertiary hover:text-text-secondary">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-muted hover:text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-[720px] mx-auto px-8 py-7">
                {/* Subject */}
                <h1 className="text-[22px] font-semibold text-text-primary leading-snug tracking-tight mb-5">
                  {selectedMessage.subject || '(No subject)'}
                </h1>

                {/* Sender metadata */}
                <div className="flex items-start gap-3.5 py-4 border-y border-border-subtle mb-6">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0 bg-gradient-to-br",
                    avatarColor
                  )}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[14px] font-semibold text-text-primary">
                        {selectedMessage.senderName || 'Unknown Sender'}
                      </span>
                      <span className="text-[12px] text-text-muted">&lt;{selectedMessage.senderEmail}&gt;</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-text-muted">
                      <span>To: {selectedMessage.recipients?.join(', ')}</span>
                      <span>·</span>
                      <span className="mono">{formatDate(selectedMessage.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="text-[14px] leading-relaxed text-text-secondary">
                  {isHtml ? (
                    <div
                      className="prose-mail max-w-none"
                      style={{
                        '--tw-prose-body': '#a0a0ab',
                        '--tw-prose-headings': '#f2f2f7',
                        '--tw-prose-links': '#3b82f6',
                      } as React.CSSProperties}
                      dangerouslySetInnerHTML={{ __html: selectedMessage.body || '' }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-text-secondary">
                      {selectedMessage.body || 'No content available'}
                    </pre>
                  )}
                </div>

                {/* Reply box */}
                <div className="mt-8 border border-border-default rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-bg-elevated border-b border-border-subtle flex items-center justify-between">
                    <span className="text-[12px] text-text-tertiary">
                      Reply to {selectedMessage.senderName || selectedMessage.senderEmail}
                    </span>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-4 py-3 bg-bg-secondary text-[13.5px] text-text-primary placeholder:text-text-muted outline-none resize-none min-h-[100px]"
                  />
                  <div className="px-4 py-3 bg-bg-elevated border-t border-border-subtle flex items-center justify-end">
                    <button
                      disabled={!replyText.trim()}
                      className="px-4 py-1.5 bg-accent-blue disabled:opacity-40 text-white text-[13px] font-medium rounded-lg transition-opacity"
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
