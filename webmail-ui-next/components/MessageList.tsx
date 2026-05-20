'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { formatDate, getInitials, getAvatarColor, cn } from '@/lib/utils'
import { Search, SlidersHorizontal, Star, Paperclip } from 'lucide-react'
import type { Message } from '@/lib/types'

function SkeletonItem() {
  return (
    <div className="px-4 py-3.5 flex gap-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-bg-elevated flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex justify-between">
          <div className="h-3 bg-bg-elevated rounded w-24" />
          <div className="h-3 bg-bg-elevated rounded w-12" />
        </div>
        <div className="h-3 bg-bg-elevated rounded w-4/5" />
        <div className="h-2.5 bg-bg-elevated rounded w-3/5" />
      </div>
    </div>
  )
}

function MessageItem({ message, isSelected }: { message: Message; isSelected: boolean }) {
  const { setSelectedMessage } = useMail()
  const initials = getInitials(message.senderName || message.senderEmail)
  const avatarColor = getAvatarColor(message.senderName || message.senderEmail)

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={() => setSelectedMessage(message)}
      className={cn(
        "w-full text-left px-4 py-3.5 flex gap-3 border-b border-border-subtle transition-all duration-150 group relative",
        isSelected ? "bg-bg-active" : "hover:bg-bg-hover"
      )}
    >
      {/* Unread indicator */}
      {message.unread && !isSelected && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent-blue" />
      )}

      {/* Avatar */}
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold text-white flex-shrink-0 bg-gradient-to-br",
        avatarColor
      )}>
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn(
            "text-[13px] truncate",
            message.unread ? "font-semibold text-text-primary" : "font-medium text-text-secondary"
          )}>
            {message.senderName || message.senderEmail}
          </span>
          <span className="text-[11px] text-text-muted flex-shrink-0 mono">
            {formatDate(message.timestamp)}
          </span>
        </div>
        <p className={cn(
          "text-[12px] truncate mb-0.5",
          message.unread ? "text-text-primary font-medium" : "text-text-secondary"
        )}>
          {message.subject || '(No subject)'}
        </p>
        <div className="flex items-center gap-1.5">
          <p className="text-[11.5px] text-text-muted truncate flex-1">
            {message.snippet || 'No preview available'}
          </p>
          {message.attachments?.length > 0 && (
            <Paperclip className="w-3 h-3 text-text-muted flex-shrink-0" />
          )}
          {message.starred && (
            <Star className="w-3 h-3 text-accent-amber fill-accent-amber flex-shrink-0" />
          )}
        </div>
      </div>
    </motion.button>
  )
}

export default function MessageList() {
  const { messages, selectedMessage, loading, selectedFolder, searchQuery, setSearchQuery, refreshMessages } = useMail()

  const folderLabel: Record<string, string> = {
    inbox: 'Inbox', sent: 'Sent', drafts: 'Drafts', spam: 'Spam', trash: 'Trash'
  }

  return (
    <div className="w-[320px] flex-shrink-0 flex flex-col h-full border-r border-border-subtle bg-bg-primary">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-semibold text-text-primary tracking-tight">
            {folderLabel[selectedFolder] || selectedFolder}
          </h2>
          <span className="text-[11px] text-text-muted mono">{messages.length} messages</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && refreshMessages()}
            placeholder="Search messages..."
            className="w-full pl-8 pr-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-[12.5px] text-text-primary placeholder:text-text-muted outline-none focus:border-border-default transition-colors duration-150"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonItem key={i} />)
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-bg-elevated flex items-center justify-center mb-1">
              <Search className="w-5 h-5 text-text-muted" />
            </div>
            <p className="text-[13px] text-text-secondary font-medium">No messages found</p>
            <p className="text-[12px] text-text-muted">This folder appears to be empty</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <MessageItem
                key={msg.id}
                message={msg}
                isSelected={selectedMessage?.id === msg.id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
