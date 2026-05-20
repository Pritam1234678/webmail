'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { X, Minimize2, Maximize2, Send, Paperclip, Bold, Italic, Link, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ComposeModal() {
  const { composeOpen, setComposeOpen, sendEmail, addToast } = useMail()
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [sending, setSending] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const toRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (composeOpen) {
      setTo(''); setCc(''); setSubject(''); setBody(''); setShowCc(false)
      setTimeout(() => toRef.current?.focus(), 300)
    }
  }, [composeOpen])

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) {
      addToast('error', 'To and Subject are required')
      return
    }
    setSending(true)
    try {
      await sendEmail(to.trim(), subject.trim(), body, cc.trim() || undefined)
      setComposeOpen(false)
    } catch (err: any) {
      addToast('error', err.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {composeOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setComposeOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed z-50 bg-bg-elevated border border-border-default rounded-2xl flex flex-col overflow-hidden",
              "shadow-xl-dark",
              expanded
                ? "inset-4 lg:inset-12"
                : "bottom-6 right-6 w-[560px] h-[460px]"
            )}
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.7)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle bg-bg-tertiary flex-shrink-0">
              <span className="text-[13px] font-semibold text-text-primary">New Message</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors text-text-muted hover:text-text-secondary"
                >
                  {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setComposeOpen(false)}
                  className="p-1.5 hover:bg-bg-hover rounded-lg transition-colors text-text-muted hover:text-text-secondary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-shrink-0">
              {/* To */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle">
                <span className="text-[12px] text-text-muted w-12 flex-shrink-0">To</span>
                <input
                  ref={toRef}
                  type="email"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 text-[13px] text-text-primary placeholder:text-text-muted bg-transparent outline-none"
                />
                <button
                  onClick={() => setShowCc(!showCc)}
                  className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
                >
                  CC
                </button>
              </div>

              {/* CC */}
              <AnimatePresence>
                {showCc && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle overflow-hidden"
                  >
                    <span className="text-[12px] text-text-muted w-12 flex-shrink-0">CC</span>
                    <input
                      type="email"
                      value={cc}
                      onChange={e => setCc(e.target.value)}
                      placeholder="cc@example.com"
                      className="flex-1 text-[13px] text-text-primary placeholder:text-text-muted bg-transparent outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle">
                <span className="text-[12px] text-text-muted w-12 flex-shrink-0">Subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="flex-1 text-[13px] text-text-primary placeholder:text-text-muted bg-transparent outline-none font-medium"
                />
              </div>
            </div>

            {/* Body */}
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message..."
              className="flex-1 px-5 py-4 text-[13.5px] text-text-primary placeholder:text-text-muted bg-transparent outline-none resize-none leading-relaxed"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle flex-shrink-0">
              <div className="flex items-center gap-0.5">
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-muted hover:text-text-secondary">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-muted hover:text-text-secondary">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-muted hover:text-text-secondary">
                  <Link className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-border-subtle mx-1" />
                <button className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-muted hover:text-text-secondary">
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSend}
                disabled={sending || !to || !subject}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-xl transition-colors duration-150"
              >
                {sending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {sending ? 'Sending...' : 'Send'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
