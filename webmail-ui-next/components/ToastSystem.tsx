'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ToastSystem() {
  const { toasts } = useMail()

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border pointer-events-auto",
              "bg-bg-elevated shadow-lg-dark",
              toast.type === 'success' && "border-accent-green/30",
              toast.type === 'error' && "border-accent-red/30",
              toast.type === 'info' && "border-border-default",
            )}
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset' }}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-4 h-4 text-accent-red flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-accent-blue flex-shrink-0" />}
            <span className="text-[13px] text-text-primary font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
