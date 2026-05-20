'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import {
  Inbox, Send, FileText, AlertOctagon, Trash2, Star,
  ChevronDown, LogOut, RefreshCw, PenSquare, Archive, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

const folders = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'spam', label: 'Spam', icon: AlertOctagon },
  { id: 'trash', label: 'Trash', icon: Trash2 },
]

export default function Sidebar() {
  const { user, mailbox, selectedFolder, setSelectedFolder, setComposeOpen, refreshMessages, logout } = useMail()

  const getFolderCount = (folderId: string) => {
    const folder = mailbox?.folders?.find(f => f.id === folderId)
    return folder?.count || 0
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-[220px] flex-shrink-0 flex flex-col h-full bg-bg-secondary border-r border-border-subtle"
    >
      {/* Account area */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 bg-gradient-to-br",
            "from-blue-500 to-violet-600"
          )}>
            {user?.displayName?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-text-primary truncate">{user?.displayName || 'Support'}</p>
            <p className="text-[11px] text-text-tertiary truncate">{user?.email}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
        </div>
      </div>

      {/* Compose button */}
      <div className="p-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setComposeOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent-blue hover:bg-blue-500 text-white text-[13px] font-medium rounded-xl transition-colors duration-200"
          style={{ boxShadow: '0 1px 4px rgba(59,130,246,0.3)' }}
        >
          <PenSquare className="w-3.5 h-3.5" />
          New Message
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {folders.map((folder, i) => {
          const Icon = folder.icon
          const count = getFolderCount(folder.id)
          const isActive = selectedFolder === folder.id
          return (
            <motion.button
              key={folder.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => setSelectedFolder(folder.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-bg-active text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeFolder"
                  className="absolute inset-0 rounded-lg bg-bg-active"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0 relative z-10 transition-colors",
                isActive ? "text-accent-blue" : "text-text-tertiary group-hover:text-text-secondary"
              )} />
              <span className="flex-1 text-left relative z-10">{folder.label}</span>
              {count > 0 && folder.id === 'inbox' && (
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full relative z-10",
                  isActive ? "bg-accent-blue text-white" : "bg-bg-elevated text-text-tertiary"
                )}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </motion.button>
          )
        })}

        {/* Divider */}
        <div className="my-2 border-t border-border-subtle" />

        {/* Actions */}
        <button
          onClick={refreshMessages}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-text-tertiary hover:text-text-secondary hover:bg-bg-hover transition-all duration-150"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border-subtle">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-text-tertiary hover:text-accent-red hover:bg-accent-red/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </motion.aside>
  )
}
