'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User, Mailbox, Message } from '@/lib/types'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface MailContextType {
  user: User | null
  mailbox: Mailbox | null
  messages: Message[]
  selectedMessage: Message | null
  selectedFolder: string
  loading: boolean
  messageLoading: boolean
  composeOpen: boolean
  searchQuery: string
  toasts: Toast[]
  setSelectedFolder: (folder: string) => void
  setSelectedMessage: (msg: Message | null) => void
  setComposeOpen: (open: boolean) => void
  setSearchQuery: (q: string) => void
  refreshMessages: () => void
  logout: () => void
  addToast: (type: Toast['type'], message: string) => void
  sendEmail: (to: string, subject: string, body: string, cc?: string) => Promise<void>
}

const MailContext = createContext<MailContextType | null>(null)

export function MailProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mailbox, setMailbox] = useState<Mailbox | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessageState] = useState<Message | null>(null)
  const [selectedFolder, setSelectedFolderState] = useState('inbox')
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const loadMessages = useCallback(async (mailboxId: string, folder: string, q: string) => {
    setLoading(true)
    try {
      const data: any = await api.mailboxes.get(mailboxId, folder, q)
      setMailbox(data.mailbox)
      setMessages(data.messages || [])
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    api.auth.session()
      .then(async (data: any) => {
        const u = data?.session || data?.user
        if (!u) { router.replace('/login'); return }
        setUser(u)
        // Load mailboxes to get mailbox ID
        const mbData: any = await api.mailboxes.list()
        const mb = mbData?.mailboxes?.[0] || mbData?.[0]
        if (mb) {
          setMailbox(mb)
          await loadMessages(mb.id, 'inbox', '')
        }
      })
      .catch(() => router.replace('/login'))
  }, [router, loadMessages])

  const setSelectedFolder = useCallback((folder: string) => {
    setSelectedFolderState(folder)
    setSelectedMessageState(null)
    if (mailbox) loadMessages(mailbox.id, folder, searchQuery)
  }, [mailbox, searchQuery, loadMessages])

  const setSelectedMessage = useCallback(async (msg: Message | null) => {
    if (!msg) { setSelectedMessageState(null); return }
    setMessageLoading(true)
    setSelectedMessageState(msg)
    try {
      const data: any = await api.messages.get(msg.id)
      setSelectedMessageState(data?.message || msg)
    } catch {
      // Keep original message
    } finally {
      setMessageLoading(false)
    }
  }, [])

  const refreshMessages = useCallback(() => {
    if (mailbox) loadMessages(mailbox.id, selectedFolder, searchQuery)
  }, [mailbox, selectedFolder, searchQuery, loadMessages])

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => {})
    router.replace('/login')
  }, [router])

  const sendEmail = useCallback(async (to: string, subject: string, body: string, cc?: string) => {
    await api.messages.send({ to, subject, body, cc })
    addToast('success', 'Email sent successfully')
    if (selectedFolder === 'sent') refreshMessages()
  }, [addToast, selectedFolder, refreshMessages])

  return (
    <MailContext.Provider value={{
      user, mailbox, messages, selectedMessage, selectedFolder,
      loading, messageLoading, composeOpen, searchQuery, toasts,
      setSelectedFolder, setSelectedMessage, setComposeOpen, setSearchQuery,
      refreshMessages, logout, addToast, sendEmail,
    }}>
      {children}
    </MailContext.Provider>
  )
}

export function useMail() {
  const ctx = useContext(MailContext)
  if (!ctx) throw new Error('useMail must be used within MailProvider')
  return ctx
}
