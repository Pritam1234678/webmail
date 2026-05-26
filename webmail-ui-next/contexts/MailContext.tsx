'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User, Mailbox, Message } from '@/lib/types'

interface Toast { id: string; type: 'success' | 'error' | 'info'; message: string }

interface MailContextType {
  user: User | null; mailbox: Mailbox | null; messages: Message[];
  selectedMessage: Message | null; selectedFolder: string;
  loading: boolean; messageLoading: boolean; composeOpen: boolean;
  searchQuery: string; toasts: Toast[];
  hasMore: boolean;
  setSelectedFolder: (folder: string) => void;
  setSelectedMessage: (msg: Message | null) => void;
  setComposeOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  refreshMessages: () => void;
  loadMore: () => Promise<void>;
  logout: () => void;
  addToast: (type: Toast['type'], message: string) => void;
  sendEmail: (to: string, subject: string, body: string, cc?: string, bcc?: string, attachments?: File[]) => Promise<void>;
  archiveMessage: (msg: Message) => Promise<void>;
  deleteMessage: (msg: Message) => Promise<void>;
}

const MailContext = createContext<MailContextType | null>(null)
const SESSION_KEY = 'mc_session_user'; const MAILBOX_KEY = 'mc_session_mailbox'
const PAGE_SIZE = 50

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
  const [hasMore, setHasMore] = useState(false)

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const loadMessages = useCallback(async (mailboxId: string, folder: string, q: string, offset = 0) => {
    if (offset === 0) setLoading(true)
    try {
      const data: any = await api.mailboxes.get(mailboxId, folder, q, PAGE_SIZE, offset)
      setMailbox(data.mailbox)
      const newMessages = data.messages || []
      if (offset === 0) {
        setMessages(newMessages)
      } else {
        setMessages(prev => [...prev, ...newMessages])
      }
      setHasMore(newMessages.length === PAGE_SIZE)
    } catch (err: any) { 
      if (offset === 0) setMessages([]) 
    } finally { 
      setLoading(false) 
    }
  }, [])

  useEffect(() => {
    const u = localStorage.getItem(SESSION_KEY); const m = localStorage.getItem(MAILBOX_KEY)
    if (u) { setUser(JSON.parse(u)); if (m) setMailbox(JSON.parse(m)) }

    api.auth.session().then(async (data: any) => {
      const uObj = data?.session || data?.user || data
      if (!uObj?.email) { if (!u) router.replace('/login'); return }
      setUser(uObj); localStorage.setItem(SESSION_KEY, JSON.stringify(uObj))
      try {
        const mbData: any = await api.mailboxes.list(); const mb = mbData?.mailboxes?.[0] || mbData?.[0]
        if (mb) { setMailbox(mb); localStorage.setItem(MAILBOX_KEY, JSON.stringify(mb)); await loadMessages(mb.id, 'inbox', '') }
      } catch (err) {}
    }).catch(() => { if (!u) router.replace('/login'); else setLoading(false) })
  }, [router, loadMessages])

  const setSelectedFolder = useCallback((folder: string) => {
    setSelectedFolderState(folder); setSelectedMessageState(null)
    if (mailbox) loadMessages(mailbox.id, folder, searchQuery)
  }, [mailbox, searchQuery, loadMessages])

  const setSelectedMessage = useCallback(async (msg: Message | null) => {
    if (!msg) { setSelectedMessageState(null); return }
    setMessageLoading(true); setSelectedMessageState(msg)
    try {
      const data: any = await api.messages.get(msg.id)
      setSelectedMessageState(data?.message || msg)
      if (msg.unread) {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, unread: false } : m))
      }
    } catch {} finally { setMessageLoading(false) }
  }, [])

  const loadMore = useCallback(async () => {
    if (mailbox && !loading && hasMore) {
      await loadMessages(mailbox.id, selectedFolder, searchQuery, messages.length)
    }
  }, [mailbox, loading, hasMore, selectedFolder, searchQuery, messages.length, loadMessages])

  const archiveMessage = useCallback(async (msg: Message) => {
    try {
      await api.messages.update(msg.id, { folder: 'archive' })
      addToast('success', 'Message archived')
      setMessages(prev => prev.filter(m => m.id !== msg.id))
      setSelectedMessageState(null)
    } catch (err: any) { addToast('error', 'Failed to archive') }
  }, [addToast])

  const deleteMessage = useCallback(async (msg: Message) => {
    try {
      await api.messages.delete(msg.id)
      addToast('success', 'Message deleted')
      setMessages(prev => prev.filter(m => m.id !== msg.id))
      setSelectedMessageState(null)
    } catch (err: any) { addToast('error', 'Failed to delete') }
  }, [addToast])

  const refreshMessages = useCallback(() => {
    if (mailbox) loadMessages(mailbox.id, selectedFolder, searchQuery)
  }, [mailbox, selectedFolder, searchQuery, loadMessages])

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => {}); localStorage.clear(); router.replace('/login')
  }, [router])

  const [lastSendTime, setLastSendTime] = useState(0)
  const RATE_LIMIT_MS = 15000 // 15 seconds

  const sendEmail = useCallback(async (to: string, subject: string, body: string, cc?: string, bcc?: string, attachments?: File[]) => {
    const now = Date.now()
    if (now - lastSendTime < RATE_LIMIT_MS) {
      const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastSendTime)) / 1000)
      addToast('error', `Rate limit active. Please wait ${waitSec} seconds.`)
      throw new Error('Rate limit exceeded')
    }

    let p: any = (attachments && attachments.length > 0) ? new FormData() : { to, subject, body, cc, bcc }
    if (p instanceof FormData) {
      p.append('to', to); p.append('subject', subject); p.append('body', body)
      if (cc) p.append('cc', cc); if (bcc) p.append('bcc', bcc)
      attachments?.forEach(f => p.append('attachments[]', f))
    }
    await api.messages.send(p); 
    setLastSendTime(Date.now())
    addToast('success', 'Email sent')
    if (selectedFolder === 'sent') refreshMessages()
  }, [addToast, selectedFolder, refreshMessages, lastSendTime])

  return (
    <MailContext.Provider value={{
      user, mailbox, messages, selectedMessage, selectedFolder, loading, messageLoading, composeOpen, searchQuery, toasts, hasMore,
      setSelectedFolder, setSelectedMessage, setComposeOpen, setSearchQuery, refreshMessages, loadMore, logout, addToast, sendEmail, archiveMessage, deleteMessage
    }}>
      {children}
    </MailContext.Provider>
  )
}

export function useMail() { return useContext(MailContext)! }
