import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="admin-page-head">
      <div>
        {eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-page-head__actions">{actions}</div>}
    </div>
  )
}

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  useEffect(() => {
    if (!open) return
    document.body.classList.add('modal-open')
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="admin-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="admin-modal-backdrop__close" onClick={onClose} aria-label="Fermer" />
          <motion.div
            className={`admin-modal admin-modal--${size}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="admin-modal__head">
              <div>
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
              </div>
              <button className="admin-icon-btn" onClick={onClose} aria-label="Fermer">
                <X />
              </button>
            </div>
            <div className="admin-modal__body">{children}</div>
            {footer && <div className="admin-modal__foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function AdminDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    document.body.classList.add('modal-open')
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="admin-drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="admin-drawer-backdrop__close" onClick={onClose} aria-label="Fermer" />
          <motion.aside
            className="admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="admin-drawer__head">
              <div>
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
              </div>
              <button className="admin-icon-btn" onClick={onClose} aria-label="Fermer">
                <X />
              </button>
            </div>
            <div className="admin-drawer__body">{children}</div>
            {footer && <div className="admin-drawer__foot">{footer}</div>}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function AdminConfirm({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  danger = false,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <AdminModal
      open={open}
      onClose={onCancel}
      title={title}
      subtitle="Cette action ne peut pas être annulée."
      size="sm"
      footer={
        <>
          <button className="admin-btn admin-btn--ghost" onClick={onCancel}>
            Annuler
          </button>
          <button className={`admin-btn ${danger ? 'admin-btn--danger' : 'admin-btn--primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="admin-confirm-message">{message}</p>
    </AdminModal>
  )
}

export function AdminSearch({
  value,
  onChange,
  placeholder = 'Rechercher…',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="admin-search">
      <Search />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Effacer">
          <X />
        </button>
      )}
    </label>
  )
}

export function AdminEmpty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="admin-empty">
      <span>—</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function AdminPagination({
  page,
  pageCount,
  total,
  onChange,
}: {
  page: number
  pageCount: number
  total: number
  onChange: (page: number) => void
}) {
  if (pageCount <= 1) {
    return (
      <div className="admin-pagination">
        <span>{total} résultat{total > 1 ? 's' : ''}</span>
        <div>
          <button disabled aria-label="Page précédente">
            <ChevronLeft />
          </button>
          <span className="admin-pagination__current">1 / 1</span>
          <button disabled aria-label="Page suivante">
            <ChevronRight />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-pagination">
      <span>{total} résultats</span>
      <div>
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Page précédente">
          <ChevronLeft />
        </button>
        <span className="admin-pagination__current">
          {page} / {pageCount}
        </span>
        <button onClick={() => onChange(Math.min(pageCount, page + 1))} disabled={page >= pageCount} aria-label="Page suivante">
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}

export function AdminBackLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button className="admin-back-link" onClick={onClick}>
      <ArrowLeft /> {children}
    </button>
  )
}

export function AdminNext({ to, label }: { to: string; label: string }) {
  return (
    <a className="admin-next-link" href={to}>
      {label} <ArrowRight />
    </a>
  )
}
