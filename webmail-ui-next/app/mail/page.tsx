'use client'

import Sidebar from '@/components/Sidebar'
import MessageList from '@/components/MessageList'
import MessageView from '@/components/MessageView'
import ComposeModal from '@/components/ComposeModal'
import ToastSystem from '@/components/ToastSystem'
import CommandPalette from '@/components/CommandPalette'

export default function MailPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <MessageList />
      <MessageView />
      <ComposeModal />
      <ToastSystem />
      <CommandPalette />
    </div>
  )
}
