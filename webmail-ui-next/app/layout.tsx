import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Codecoder Mail',
  description: 'Premium mail client for Codecoder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
