'use client'

import { Sidebar, MessageList, MessageView } from '@/components/MailLayout'
import ComposeModal from '@/components/ComposeModal'
import ToastSystem from '@/components/ToastSystem'
import CommandPalette from '@/components/CommandPalette'

export default function MailPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0e0e0e' }}>
      <Sidebar />
      <MessageList />
      <MessageView />
      <ComposeModal />
      <ToastSystem />
      <CommandPalette />
    </div>
  )
}
