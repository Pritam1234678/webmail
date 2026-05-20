export interface User {
  userId: string
  mailboxId: string
  email: string
  displayName: string
}

export interface Session {
  ok: boolean
  session?: User
  user?: User
}

export interface Folder {
  id: string
  label: string
  hint: string
  count: number
  icon: string
}

export interface Mailbox {
  id: string
  email: string
  name: string
  initials: string
  status: string
  folders: Folder[]
}

export interface Message {
  id: string
  mailboxId: string
  folder: string
  senderName: string
  senderEmail: string
  recipients: string[]
  subject: string
  snippet: string
  timestamp: string
  unread: boolean
  starred: boolean
  tags: string[]
  attachments: string[]
  body?: string
  thread?: Message[]
}

export type FolderKey = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash'
