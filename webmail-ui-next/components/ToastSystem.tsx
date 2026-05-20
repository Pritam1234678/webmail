'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMail } from '@/contexts/MailContext'

export default function ToastSystem() {
  const { toasts } = useMail()
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 32, zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
              background: '#1c1b1b', border: `1px solid ${t.type === 'error' ? 'rgba(255,180,171,0.25)' : t.type === 'success' ? 'rgba(100,220,140,0.2)' : 'rgba(68,71,72,0.4)'}`,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              fontFamily: 'Hanken Grotesk, sans-serif',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: t.type === 'error' ? '#ffb4ab' : t.type === 'success' ? '#4fbe7e' : '#e9c349' }}>
              {t.type === 'error' ? 'error' : t.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e2e1' }}>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
