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

interface SendPayload {
  to: string
  subject: string
  body: string
  cc?: string
  bcc?: string
  attachments?: File[]
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
  sendEmail: (to: string, subject: string, body: string, cc?: string, bcc?: string, attachments?: File[]) => Promise<void>
}

const MailContext = createContext<MailContextType | null>(null)

const SESSION_KEY = 'mc_session_user'
const MAILBOX_KEY = 'mc_session_mailbox'

function saveSession(user: User, mailbox?: Mailbox | null) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    if (mailbox) localStorage.setItem(MAILBOX_KEY, JSON.stringify(mailbox))
  } catch {}
}

function loadSession(): { user: User | null; mailbox: Mailbox | null } {
  try {
    const u = localStorage.getItem(SESSION_KEY)
    const m = localStorage.getItem(MAILBOX_KEY)
    return {
      user: u ? JSON.parse(u) : null,
      mailbox: m ? JSON.parse(m) : null,
    }
  } catch {
    return { user: null, mailbox: null }
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(MAILBOX_KEY)
  } catch {}
}

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
      console.warn('Failed to load messages:', err.message)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = loadSession()
    if (cached.user) {
      setUser(cached.user)
      if (cached.mailbox) {
        setMailbox(cached.mailbox)
      }
    }

    api.auth.session()
      .then(async (data: any) => {
        const u = data?.session || data?.user || data
        if (!u || typeof u !== 'object' || !u.email) {
          if (!cached.user) {
            clearSession()
            router.replace('/login')
          }
          return
        }

        setUser(u)
        saveSession(u)

        try {
          const mbData: any = await api.mailboxes.list()
          const mb = mbData?.mailboxes?.[0] || mbData?.[0]
          if (mb) {
            setMailbox(mb)
            saveSession(u, mb)
            await loadMessages(mb.id, 'inbox', '')
          } else if (cached.mailbox) {
            await loadMessages(cached.mailbox.id, 'inbox', '')
          }
        } catch (err) {
          console.warn('Mailbox load failed:', err)
          if (cached.mailbox) {
            await loadMessages(cached.mailbox.id, 'inbox', '').catch(() => {})
          }
        }
      })
      .catch((err) => {
        console.warn('Session check failed:', err.message)
        if (cached.user && cached.mailbox) {
          loadMessages(cached.mailbox.id, 'inbox', '').catch(() => {})
          setLoading(false)
        } else {
          clearSession()
          router.replace('/login')
        }
      })
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
    clearSession()
    router.replace('/login')
  }, [router])

  const sendEmail = useCallback(async (to: string, subject: string, body: string, cc?: string, bcc?: string, attachments?: File[]) => {
    let payload: any;
    
    if (attachments && attachments.length > 0) {
      payload = new FormData()
      payload.append('to', to)
      payload.append('subject', subject)
      payload.append('body', body)
      if (cc) payload.append('cc', cc)
      if (bcc) payload.append('bcc', bcc)
      attachments.forEach(file => payload.append('attachments[]', file))
    } else {
      payload = { to, subject, body, cc, bcc }
    }

    await api.messages.send(payload)
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
