import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { formatPrice } from '../lib/utils'
import type { Category } from '../types'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

const quickSearches: { label: string; query: string; category?: Category }[] = [
  { label: 'Parcs & attractions', query: '', category: 'Parcs & attractions' },
  { label: 'Disneyland Paris', query: 'Disneyland' },
  { label: 'Culture', query: '', category: 'Culture & patrimoine' },
  { label: 'Safari', query: 'Tanzanie' },
]

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { experiences } = useStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    document.body.classList.add('modal-open')
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return experiences.filter((exp) => exp.status === 'active').slice(0, 4)
    return experiences
      .filter(
        (exp) =>
          exp.status === 'active' &&
          `${exp.title} ${exp.destination} ${exp.country} ${exp.category}`
            .toLowerCase()
            .includes(normalized),
      )
      .slice(0, 5)
  }, [experiences, query])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    onClose()
    navigate(`/experiences${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button className="search-overlay__backdrop" aria-label="Fermer la recherche" onClick={onClose} />
          <motion.div
            className="search-overlay__panel"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container">
              <div className="search-overlay__top">
                <span className="eyebrow">Que cherchez-vous ?</span>
                <button className="icon-btn" onClick={onClose} aria-label="Fermer">
                  <X />
                </button>
              </div>
              <form className="search-overlay__form" onSubmit={submit}>
                <Search />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Un parc, une ville, une envie…"
                  aria-label="Rechercher une expérience"
                />
                <button type="submit" className="search-overlay__submit" aria-label="Lancer la recherche">
                  <ArrowUpRight />
                </button>
              </form>
              <div className="search-overlay__quick">
                <span className="small-label">Envies du moment</span>
                <div className="chip-row">
                  {quickSearches.map((item) => (
                    <button
                      key={item.label}
                      className="chip"
                      onClick={() => {
                        onClose()
                        const params = new URLSearchParams()
                        if (item.query) params.set('q', item.query)
                        if (item.category) params.set('category', item.category)
                        navigate(`/experiences?${params.toString()}`)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="search-overlay__results">
                <div className="search-overlay__results-head">
                  <span className="small-label">{query ? 'Résultats' : 'Nos escapades à la une'}</span>
                  <Link to="/experiences" onClick={onClose} className="text-link">
                    Tout voir <ArrowUpRight />
                  </Link>
                </div>
                <div className="search-results">
                  {results.map((experience) => (
                    <Link
                      key={experience.id}
                      to={`/experiences/${experience.slug}`}
                      className="search-result"
                      onClick={onClose}
                    >
                      <img src={experience.image} alt="" />
                      <span className="search-result__copy">
                        <span className="small-label">{experience.category}</span>
                        <strong>{experience.title}</strong>
                        <span>
                          {experience.destination} · {experience.duration}
                        </span>
                      </span>
                      <span className="search-result__price">dès {formatPrice(experience.price)}</span>
                      <ArrowUpRight className="search-result__arrow" />
                    </Link>
                  ))}
                  {results.length === 0 && (
                    <p className="search-overlay__empty">
                      Aucune expérience ne correspond à « {query} ». Essayez un autre mot ou parcourez tout le
                      catalogue.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
