'use client'

import { MailProvider } from '@/contexts/MailContext'

export default function MailLayout({ children }: { children: React.ReactNode }) {
  return <MailProvider>{children}</MailProvider>
}
