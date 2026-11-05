import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  ChevronDown,
  Clock,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { categories } from '../data/data'
import { useStore } from '../store/StoreContext'
import { durationInDays, formatPrice } from '../lib/utils'
import ExperienceCard from '../components/ExperienceCard'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'

const sortOptions = [
  { value: 'recommended', label: 'Nos recommandations' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Meilleures notes' },
  { value: 'duration', label: 'Durée croissante' },
]

const durationOptions = [
  { value: 'all', label: 'Toutes les durées' },
  { value: 'short', label: '1 jour' },
  { value: 'weekend', label: '2 à 3 jours' },
  { value: 'long', label: '4 jours et plus' },
]

export default function Experiences() {
  const { experiences } = useStore()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? 'Toutes'
  const destination = params.get('destination') ?? ''
  const q = params.get('q') ?? ''
  const [query, setQuery] = useState(q)
  const [sort, setSort] = useState('recommended')
  const [maxPrice, setMaxPrice] = useState(4000)
  const [duration, setDuration] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    setQuery(q)
  }, [q])

  const availableDestinations = useMemo(
    () => Array.from(new Set(experiences.filter((e) => e.status === 'active').map((e) => e.country))).sort(),
    [experiences],
  )

  const filtered = useMemo(() => {
    let list = experiences.filter((exp) => exp.status === 'active')
    if (category !== 'Toutes') list = list.filter((exp) => exp.category === category)
    if (destination)
      list = list.filter(
        (exp) =>
          exp.country.toLowerCase() === destination.toLowerCase() ||
          exp.destination.toLowerCase() === destination.toLowerCase(),
      )
    if (query.trim()) {
      const needle = query.trim().toLowerCase()
      list = list.filter((exp) =>
        `${exp.title} ${exp.destination} ${exp.country} ${exp.category} ${exp.shortDescription}`
          .toLowerCase()
          .includes(needle),
      )
    }
    if (maxPrice < 4000) list = list.filter((exp) => exp.price <= maxPrice)
    if (duration !== 'all') {
      list = list.filter((exp) => {
        const days = durationInDays(exp)
        if (duration === 'short') return days === 1
        if (duration === 'weekend') return days >= 2 && days <= 3
        return days >= 4
      })
    }
    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'duration') return durationInDays(a) - durationInDays(b)
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating
    })
  }, [experiences, category, destination, query, maxPrice, duration, sort])

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const updateQuery = (value: string) => {
    setQuery(value)
    const next = new URLSearchParams(params)
    if (value) next.set('q', value)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  const reset = () => {
    setQuery('')
    setMaxPrice(4000)
    setDuration('all')
    setSort('recommended')
    setParams(new URLSearchParams(), { replace: true })
  }

  const activeFilters: { key: string; label: string; remove: () => void }[] = []
  if (category !== 'Toutes') activeFilters.push({ key: 'cat', label: category, remove: () => setParam('category', '') })
  if (destination) activeFilters.push({ key: 'dest', label: destination, remove: () => setParam('destination', '') })
  if (query) activeFilters.push({ key: 'q', label: `« ${query} »`, remove: () => updateQuery('') })
  if (maxPrice < 4000)
    activeFilters.push({ key: 'price', label: `Jusqu’à ${formatPrice(maxPrice)}`, remove: () => setMaxPrice(4000) })
  if (duration !== 'all')
    activeFilters.push({
      key: 'dur',
      label: durationOptions.find((item) => item.value === duration)?.label ?? '',
      remove: () => setDuration('all'),
    })

  const featured = experiences.filter((exp) => exp.status === 'active' && exp.featured).slice(0, 3)

  return (
    <div className="catalogue-page">
      <section className="catalogue-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Expériences' }]} />
          <div className="catalogue-hero__inner">
            <div className="catalogue-hero__copy">
              <span className="eyebrow">Le catalogue Faraway</span>
              <h1 className="h1">
                Des expériences <span className="italic">qui se racontent.</span>
              </h1>
              <p>
                Parcs d’attractions, trésors culturels, grands espaces et city breaks. Chaque voyage est une
                invitation à vivre quelque chose que l’on n’oublie pas.
              </p>
              <div className="catalogue-hero__stats">
                <span>
                  <strong>{experiences.filter((exp) => exp.status === 'active').length}</strong>
                  expériences
                </span>
                <span>
                  <strong>{categories.length}</strong> univers
                </span>
                <span>
                  <strong>4,9</strong> note moyenne
                </span>
              </div>
            </div>
            <div className="catalogue-hero__collage">
              {featured.map((exp, index) => (
                <Link
                  key={exp.id}
                  to={`/experiences/${exp.slug}`}
                  className={`catalogue-mini catalogue-mini--${index + 1}`}
                >
                  <img src={exp.image} alt={exp.title} />
                  <span>
                    <small>{exp.category}</small>
                    <strong>{exp.title.split(',')[0]}</strong>
                  </span>
                </Link>
              ))}
              <div className="catalogue-hero__stamp">
                <Sparkles />
                <span>
                  Conçu avec
                  <br />
                  attention
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="catalogue-bar">
        <div className="container">
          <div className="catalogue-bar__tabs">
            <button
              className={`catalogue-tab${category === 'Toutes' ? ' is-active' : ''}`}
              onClick={() => setParam('category', '')}
            >
              Toutes <span>{experiences.filter((exp) => exp.status === 'active').length}</span>
            </button>
            {categories.map((item) => {
              const count = experiences.filter((exp) => exp.status === 'active' && exp.category === item.name).length
              return (
                <button
                  key={item.name}
                  className={`catalogue-tab${category === item.name ? ' is-active' : ''}`}
                  onClick={() => setParam('category', item.name)}
                >
                  {item.name} <span>{count}</span>
                </button>
              )
            })}
          </div>
          <div className="catalogue-bar__tools">
            <label className="catalogue-search">
              <Search />
              <input
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="Rechercher une expérience…"
                aria-label="Rechercher une expérience"
              />
              {query && (
                <button onClick={() => updateQuery('')} aria-label="Effacer la recherche">
                  <X />
                </button>
              )}
            </label>
            <button
              className={`catalogue-filter-toggle${filtersOpen ? ' is-active' : ''}`}
              onClick={() => setFiltersOpen((value) => !value)}
            >
              <SlidersHorizontal /> Filtres
              {activeFilters.length > 0 && <span className="catalogue-filter-count">{activeFilters.length}</span>}
            </button>
          </div>
          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                className="catalogue-filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="catalogue-filters__inner">
                  <div className="field">
                    <label htmlFor="filter-destination">Destination</label>
                    <div className="select-wrap">
                      <MapPin />
                      <select
                        id="filter-destination"
                        className="select"
                        value={destination}
                        onChange={(event) => setParam('destination', event.target.value)}
                      >
                        <option value="">Toutes les destinations</option>
                        {availableDestinations.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="filter-duration">Durée</label>
                    <div className="select-wrap">
                      <Clock />
                      <select
                        id="filter-duration"
                        className="select"
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                      >
                        {durationOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="field catalogue-price-field">
                    <label htmlFor="filter-price">
                      Budget par personne <strong>{formatPrice(maxPrice)}</strong>
                    </label>
                    <input
                      id="filter-price"
                      type="range"
                      min={50}
                      max={4000}
                      step={50}
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(Number(event.target.value))}
                      style={{ '--range-progress': `${((maxPrice - 50) / 3950) * 100}%` } as React.CSSProperties}
                    />
                    <div className="range-labels">
                      <span>50 €</span>
                      <span>4 000 €</span>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="filter-sort">Trier par</label>
                    <div className="select-wrap">
                      <ChevronDown />
                      <select
                        id="filter-sort"
                        className="select"
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                      >
                        {sortOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button className="catalogue-filters__reset" onClick={reset}>
                    <RotateCcw /> Réinitialiser
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="section catalogue-results">
        <div className="container">
          <div className="catalogue-results__head">
            <div>
              <span className="eyebrow eyebrow--plain">Explorer</span>
              <h2 className="catalogue-results__title">
                {category === 'Toutes' ? 'Toutes nos expériences' : category}
                <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
              </h2>
            </div>
            <div className="catalogue-results__sort">
              <span className="small-label">Trier</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Trier les résultats">
                {sortOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="catalogue-active-filters">
              <span className="small-label">Filtres actifs</span>
              {activeFilters.map((filter) => (
                <button key={filter.key} onClick={filter.remove}>
                  {filter.label} <X />
                </button>
              ))}
              <button className="catalogue-active-filters__reset" onClick={reset}>
                Tout effacer
              </button>
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="experience-grid experience-grid--catalogue">
              {filtered.map((exp, index) => (
                <Reveal key={exp.id} delay={(index % 3) * 0.05}>
                  <ExperienceCard experience={exp} priority={index < 3} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state__icon">
                <Search />
              </span>
              <h3>Aucune expérience ne correspond encore.</h3>
              <p>
                Essayez d’élargir vos critères ou dites-nous ce que vous cherchez : nous aimons inventer des
                voyages sur mesure.
              </p>
              <div className="catalogue-empty-actions">
                <button className="btn btn--dark" onClick={reset}>
                  Réinitialiser les filtres
                </button>
                <Link to="/contact" className="btn btn--outline">
                  Nous écrire <ArrowUpRight />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="catalogue-help">
        <div className="container catalogue-help__inner">
          <div>
            <span className="eyebrow">Vous ne trouvez pas ?</span>
            <h2 className="h3">Créons ensemble le voyage qui vous ressemble.</h2>
          </div>
          <p>
            Un anniversaire, une tribu de douze, une envie de silence ou de grands frissons : nos conseillers
            composent aussi des itinéraires entièrement sur mesure.
          </p>
          <Link to="/contact" className="btn btn--accent">
            Décrire mon voyage <ArrowUpRight />
          </Link>
        </div>
      </section>
    </div>
  )
}
