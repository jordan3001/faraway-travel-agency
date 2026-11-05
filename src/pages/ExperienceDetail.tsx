import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Heart,
  Languages,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { reviews as allReviews } from '../data/data'
import {
  bookingTotals,
  defaultTravelDate,
  formatDateLong,
  formatPrice,
  maxTravelDate,
  toDateInput,
} from '../lib/utils'
import Breadcrumbs from '../components/Breadcrumbs'
import ExperienceCard from '../components/ExperienceCard'
import QuantityStepper from '../components/QuantityStepper'
import Reveal from '../components/Reveal'
import Stars from '../components/Stars'

function GalleryLightbox({
  images,
  index,
  onClose,
  onIndex,
  title,
}: {
  images: string[]
  index: number
  onClose: () => void
  onIndex: (index: number) => void
  title: string
}) {
  useEffect(() => {
    document.body.classList.add('modal-open')
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onIndex((index + 1) % images.length)
      if (event.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [images.length, index, onClose, onIndex])

  return createPortal(
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Galerie ${title}`}>
      <div className="gallery-lightbox__top">
        <span>
          {title} · {index + 1} / {images.length}
        </span>
        <button className="icon-btn" onClick={onClose} aria-label="Fermer la galerie">
          <X />
        </button>
      </div>
      <button
        className="gallery-lightbox__nav gallery-lightbox__nav--prev"
        onClick={() => onIndex((index - 1 + images.length) % images.length)}
        aria-label="Image précédente"
      >
        <ArrowLeft />
      </button>
      <motion.img
        key={images[index]}
        src={images[index]}
        alt={`${title}, photo ${index + 1}`}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      />
      <button
        className="gallery-lightbox__nav gallery-lightbox__nav--next"
        onClick={() => onIndex((index + 1) % images.length)}
        aria-label="Image suivante"
      >
        <ArrowRight />
      </button>
      <div className="gallery-lightbox__dots">
        {images.map((image, i) => (
          <button key={image} className={i === index ? 'is-active' : ''} onClick={() => onIndex(i)} aria-label={`Photo ${i + 1}`} />
        ))}
      </div>
    </div>,
    document.body,
  )
}

export default function ExperienceDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { experiences, suppliers, favorites, toggleFavorite, notify } = useStore()
  const experience = experiences.find((exp) => exp.slug === slug)
  const [selectedDate, setSelectedDate] = useState(() => defaultTravelDate(experience?.cutoffDays ?? 7))
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [optionIds, setOptionIds] = useState<string[]>([])
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [itineraryOpen, setItineraryOpen] = useState<number | null>(0)

  useEffect(() => {
    if (!experience) return
    setSelectedDate(defaultTravelDate(experience.cutoffDays))
    setAdults(2)
    setChildren(0)
    setOptionIds([])
    window.scrollTo(0, 0)
  }, [experience])

  const totals = experience ? bookingTotals(experience, adults, children, optionIds) : null
  const supplier = experience ? suppliers.find((item) => item.id === experience.supplierId) : undefined
  const isFavorite = experience ? favorites.includes(experience.id) : false
  const related = useMemo(() => {
    if (!experience) return []
    return experiences
      .filter((exp) => exp.status === 'active' && exp.id !== experience.id && exp.category === experience.category)
      .slice(0, 3)
  }, [experience, experiences])

  const experienceReviews = useMemo(() => {
    if (!experience) return []
    const direct = allReviews.filter((review) => review.experienceId === experience.id)
    if (direct.length >= 2) return direct
    return [
      ...direct,
      {
        id: `fallback-${experience.id}-1`,
        experienceId: experience.id,
        name: 'Claire D.',
        initials: 'CD',
        color: '#c8694e',
        date: 'Octobre 2026',
        rating: 5,
        title: 'Une organisation aux petits soins',
        text: 'Faraway a pensé à tout, y compris aux détails que nous n’aurions pas anticipés. Une expérience fluide et profondément agréable.',
        verified: true,
      },
      {
        id: `fallback-${experience.id}-2`,
        experienceId: experience.id,
        name: 'Thomas & Élodie',
        initials: 'TE',
        color: '#a98045',
        date: 'Août 2026',
        rating: 5,
        title: 'Exactement ce que nous cherchions',
        text: 'Les conseils étaient justes, le rythme parfait et l’équipe disponible. Nous repartirons avec Faraway sans hésiter.',
        verified: true,
      },
    ].slice(0, 2)
  }, [experience])

  if (!experience) {
    return (
      <div className="not-found-page">
        <div className="container not-found-page__inner">
          <span className="eyebrow">Expérience introuvable</span>
          <h1 className="h1">Cette histoire n’existe pas encore.</h1>
          <p>Elle a peut-être changé d’adresse, ou nous sommes en train de l’inventer.</p>
          <Link to="/experiences" className="btn btn--dark">
            Retour au catalogue <ArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  const minDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + experience.cutoffDays)
    return toDateInput(d)
  })()

  const toggleOption = (id: string) => {
    setOptionIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const share = async () => {
    const value = `${experience.title} — Faraway Travel Agency`
    try {
      if (navigator.share) {
        await navigator.share({ title: value, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        notify('Lien de l’expérience copié dans votre presse-papiers.')
      }
    } catch {
      // Native share can be dismissed by the user.
    }
  }

  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const book = () => {
    const params = new URLSearchParams({
      date: selectedDate,
      adults: String(adults),
      children: String(children),
    })
    if (optionIds.length) params.set('options', optionIds.join(','))
    navigate(`/reservation/${experience.slug}?${params.toString()}`)
  }

  const scrollToBooking = () => {
    document.querySelector('.booking-widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="detail-page">
      <section className="detail-hero">
        <img className="detail-hero__image" src={experience.image} alt={experience.title} />
        <div className="detail-hero__overlay" />
        <div className="container detail-hero__inner">
          <Breadcrumbs
            items={[
              { label: 'Expériences', to: '/experiences' },
              { label: experience.category, to: `/experiences?category=${encodeURIComponent(experience.category)}` },
              { label: experience.title },
            ]}
            light
          />
          <div className="detail-hero__badges">
            {experience.badge && <span className="pill">{experience.badge}</span>}
            <span className="pill pill--ink">{experience.category}</span>
          </div>
          <h1 className="detail-hero__title">{experience.title}</h1>
          <div className="detail-hero__meta">
            <span>
              <MapPin /> {experience.destination}, {experience.country}
            </span>
            <span>
              <Clock /> {experience.duration}
            </span>
            <span>
              <Star /> {experience.rating.toFixed(1)}
              <small>({experience.reviewCount} avis)</small>
            </span>
          </div>
        </div>
        <div className="detail-hero__gallery-actions container">
          <div className="detail-hero__thumbs">
            {experience.gallery.slice(0, 3).map((image, index) => (
              <button key={image} onClick={() => openGallery(index)} aria-label={`Voir la photo ${index + 1}`}>
                <img src={image} alt="" />
              </button>
            ))}
            <button className="detail-hero__all-photos" onClick={() => openGallery(0)}>
              <Sparkles /> Toutes les photos <span>{experience.gallery.length}</span>
            </button>
          </div>
          <div className="detail-hero__actions">
            <button className={`detail-round-btn${isFavorite ? ' is-active' : ''}`} onClick={() => toggleFavorite(experience.id)}>
              <Heart fill={isFavorite ? 'currentColor' : 'none'} />
              <span>{isFavorite ? 'Enregistré' : 'Enregistrer'}</span>
            </button>
            <button className="detail-round-btn" onClick={share}>
              <Share2 />
              <span>Partager</span>
            </button>
          </div>
        </div>
      </section>

      <div className="detail-layout container">
        <main className="detail-main">
          <div className="detail-quickfacts">
            {[
              { icon: Clock, label: 'Durée', value: experience.duration },
              { icon: MapPin, label: 'Départ', value: experience.practical.departure },
              { icon: Users, label: 'Groupe', value: experience.practical.groupSize },
              { icon: Languages, label: 'Langues', value: experience.practical.languages },
            ].map((fact) => (
              <div key={fact.label}>
                <fact.icon />
                <span>
                  <small>{fact.label}</small>
                  <strong>{fact.value}</strong>
                </span>
              </div>
            ))}
          </div>

          <Reveal className="detail-section">
            <span className="eyebrow">L’esprit du voyage</span>
            <h2 className="detail-heading">
              Une échappée pensée <span className="italic">dans les moindres détails.</span>
            </h2>
            <div className="detail-prose">
              {experience.description.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <div className="detail-highlights">
              {experience.highlights.map((highlight) => (
                <div key={highlight}>
                  <span>
                    <Check />
                  </span>
                  {highlight}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="detail-section">
            <span className="eyebrow">Votre itinéraire</span>
            <div className="detail-inline-head">
              <h2 className="detail-heading">Le fil des jours</h2>
              <span>{experience.itinerary.length} étapes</span>
            </div>
            <div className="itinerary">
              {experience.itinerary.map((step, index) => (
                <div key={`${step.day}-${step.title}`} className={`itinerary__step${itineraryOpen === index ? ' is-open' : ''}`}>
                  <button onClick={() => setItineraryOpen(itineraryOpen === index ? null : index)}>
                    <span className="itinerary__day">Jour {step.day}</span>
                    <span className="itinerary__title">{step.title}</span>
                    <ChevronDown />
                  </button>
                  <AnimatePresence initial={false}>
                    {itineraryOpen === index && (
                      <motion.div
                        className="itinerary__body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>{step.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="detail-section">
            <span className="eyebrow">Ce qui est compris</span>
            <div className="detail-included">
              <div>
                <h3 className="detail-subheading">
                  <span className="detail-rounded-icon">
                    <Check />
                  </span>
                  Inclus dans votre voyage
                </h3>
                <ul>
                  {experience.included.map((item) => (
                    <li key={item}>
                      <Check /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="detail-subheading">
                  <span className="detail-rounded-icon detail-rounded-icon--muted">
                    <XCircle />
                  </span>
                  À prévoir
                </h3>
                <ul className="detail-excluded">
                  {experience.excluded.map((item) => (
                    <li key={item}>
                      <Minus /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal className="detail-section">
            <span className="eyebrow">Informations pratiques</span>
            <div className="practical-grid">
              <div>
                <CalendarDays />
                <strong>Dates</strong>
                <p>Départ possible toute l’année, sous réserve de disponibilité. Réservez au moins {experience.cutoffDays} jours avant.</p>
              </div>
              <div>
                <ShieldCheck />
                <strong>Annulation</strong>
                <p>{experience.practical.cancellation}.</p>
              </div>
              <div>
                <Accessibility />
                <strong>Accessibilité</strong>
                <p>{experience.practical.accessibility}.</p>
              </div>
              <div>
                <Users />
                <strong>Taille du groupe</strong>
                <p>{experience.practical.groupSize}. {experience.practical.languages}.</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="detail-section">
            <div className="detail-inline-head">
              <div>
                <span className="eyebrow">Galerie</span>
                <h2 className="detail-heading">Quelques images, en attendant.</h2>
              </div>
              <button className="text-link" onClick={() => openGallery(0)}>
                Voir les {experience.gallery.length} photos <ArrowUpRight />
              </button>
            </div>
            <div className="detail-gallery">
              {experience.gallery.slice(0, 4).map((image, index) => (
                <button key={image} onClick={() => openGallery(index)}>
                  <img src={image} alt={`${experience.title}, photo ${index + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal className="detail-section detail-reviews">
            <div className="detail-inline-head">
              <div>
                <span className="eyebrow">Ils l’ont vécu</span>
                <h2 className="detail-heading">Vos impressions, nos étoiles.</h2>
              </div>
              <div className="detail-review-score">
                <strong>{experience.rating.toFixed(1)}</strong>
                <span>
                  <Stars rating={experience.rating} />
                  <small>{experience.reviewCount} avis vérifiés</small>
                </span>
              </div>
            </div>
            <div className="review-layout">
              <div className="review-bars">
                {[
                  { star: 5, value: 78 },
                  { star: 4, value: 16 },
                  { star: 3, value: 4 },
                  { star: 2, value: 1 },
                  { star: 1, value: 1 },
                ].map((bar) => (
                  <div key={bar.star}>
                    <span>{bar.star} étoiles</span>
                    <span className="review-bar">
                      <span style={{ width: `${bar.value}%` }} />
                    </span>
                    <small>{bar.value}%</small>
                  </div>
                ))}
              </div>
              <div className="review-list">
                {experienceReviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <div className="review-card__head">
                      <span className="review-card__avatar" style={{ background: review.color }}>
                        {review.initials}
                      </span>
                      <span>
                        <strong>{review.name}</strong>
                        <small>
                          {review.verified ? 'Voyage vérifié' : 'Voyageur'} · {review.date}
                        </small>
                      </span>
                      <Stars rating={review.rating} className="review-card__stars" />
                    </div>
                    <h4>{review.title}</h4>
                    <p>{review.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          {supplier && (
            <div className="supplier-note">
              <span className="supplier-note__icon">
                <Sparkles />
              </span>
              <div>
                <span className="small-label">Partenaire local</span>
                <strong>{supplier.name}</strong>
                <p>
                  Sélectionné et audité par Faraway. Agence locale basée à {supplier.city}, {supplier.country} — en
                  partenariat avec nous depuis {supplier.since}.
                </p>
              </div>
              <span className="supplier-note__rating">
                <Star /> {supplier.rating.toFixed(1)}
              </span>
            </div>
          )}
        </main>

        <aside className="booking-widget-wrap">
          <div className="booking-widget">
            <div className="booking-widget__head">
              <div>
                <span className="small-label">À partir de</span>
                <div className="booking-widget__price">
                  <strong>{formatPrice(experience.price)}</strong>
                  <span>/ personne</span>
                </div>
              </div>
              <div className="booking-widget__rating">
                <Star />
                <strong>{experience.rating.toFixed(1)}</strong>
                <span>{experience.reviewCount} avis</span>
              </div>
            </div>

            <div className="booking-widget__body">
              <div className="booking-calendar">
                <label htmlFor="booking-date">
                  <CalendarDays /> Date de départ
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  min={minDate}
                  max={maxTravelDate()}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
                <small>{selectedDate ? formatDateLong(`${selectedDate}T12:00:00`) : 'Choisissez une date'}</small>
              </div>

              <div className="booking-travellers">
                <div>
                  <span>
                    <strong>Adultes</strong>
                    <small>12 ans et plus</small>
                  </span>
                  <QuantityStepper value={adults} onChange={setAdults} min={1} max={8} label="Nombre d’adultes" />
                </div>
                <div>
                  <span>
                    <strong>Enfants</strong>
                    <small>2 à 11 ans · {formatPrice(experience.childPrice)}</small>
                  </span>
                  <QuantityStepper value={children} onChange={setChildren} min={0} max={6} label="Nombre d’enfants" />
                </div>
              </div>

              {experience.options.length > 0 && (
                <div className="booking-options">
                  <span className="field-label">
                    Ajoutez une attention <small>facultatif</small>
                  </span>
                  {experience.options.map((option) => {
                    const selected = optionIds.includes(option.id)
                    return (
                      <label key={option.id} className={`booking-option${selected ? ' is-selected' : ''}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleOption(option.id)} />
                        <span className="booking-option__check">{selected && <Check />}</span>
                        <span className="booking-option__copy">
                          <strong>{option.name}</strong>
                          <small>{option.description}</small>
                        </span>
                        <span className="booking-option__price">
                          +{formatPrice(option.price)}
                          <small>{option.unit === 'person' ? '/ pers.' : '/ résa.'}</small>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              {totals && (
                <div className="booking-total">
                  <div>
                    <span>{adults} adulte{adults > 1 ? 's' : ''}</span>
                    <span>{formatPrice(totals.adultTotal)}</span>
                  </div>
                  {children > 0 && (
                    <div>
                      <span>{children} enfant{children > 1 ? 's' : ''}</span>
                      <span>{formatPrice(totals.childTotal)}</span>
                    </div>
                  )}
                  {totals.optionsTotal > 0 && (
                    <div>
                      <span>Options</span>
                      <span>{formatPrice(totals.optionsTotal)}</span>
                    </div>
                  )}
                  <div>
                    <span>Frais de service</span>
                    <span>{formatPrice(totals.serviceFee, true)}</span>
                  </div>
                  <div className="booking-total__final">
                    <span>Total</span>
                    <strong>{formatPrice(totals.total, true)}</strong>
                  </div>
                </div>
              )}

              <button className="btn btn--accent btn--block booking-widget__cta" onClick={book} disabled={experience.stock <= 0}>
                {experience.stock > 0 ? 'Réserver cette expérience' : 'Complet pour le moment'}
                <ArrowUpRight />
              </button>
              <div className="booking-widget__trust">
                <span>
                  <ShieldCheck /> Paiement sécurisé
                </span>
                <span>
                  <MessageCircle /> Conseiller dédié
                </span>
              </div>
              <p className="booking-widget__note">
                <Sparkles /> Aucun montant ne sera débité maintenant.
              </p>
            </div>
          </div>

          <div className="booking-help">
            <span>Une question sur ce voyage ?</span>
            <Link to="/contact">
              Parler à un conseiller <ArrowUpRight />
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section section--cream related-section">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <div>
                  <span className="eyebrow">Dans le même esprit</span>
                  <h2 className="h2">
                    Vous aimerez <span className="italic">aussi.</span>
                  </h2>
                </div>
                <Link
                  to={`/experiences?category=${encodeURIComponent(experience.category)}`}
                  className="text-link section-head__aside"
                >
                  Voir cet univers <ArrowUpRight />
                </Link>
              </div>
            </Reveal>
            <div className="experience-grid">
              {related.map((exp, index) => (
                <Reveal key={exp.id} delay={index * 0.07}>
                  <ExperienceCard experience={exp} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mobile-booking-bar">
        <div>
          <span>À partir de</span>
          <strong>{formatPrice(experience.price)} <small>/ pers.</small></strong>
        </div>
        <button className="btn btn--accent" onClick={scrollToBooking} disabled={experience.stock <= 0}>
          Réserver <Plus />
        </button>
      </div>

      {galleryOpen && (
        <GalleryLightbox
          images={experience.gallery}
          index={galleryIndex}
          onClose={() => setGalleryOpen(false)}
          onIndex={setGalleryIndex}
          title={experience.title}
        />
      )}
    </div>
  )
}
