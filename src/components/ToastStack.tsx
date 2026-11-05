import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/StoreContext'

export default function ToastStack() {
  const { toasts, dismissToast } = useStore()

  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="toast__icon">
              {toast.type === 'success' ? <CheckCircle2 /> : toast.type === 'error' ? <AlertCircle /> : <Info />}
            </span>
            <p>{toast.message}</p>
            <button onClick={() => dismissToast(toast.id)} aria-label="Fermer la notification">
              <X />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
