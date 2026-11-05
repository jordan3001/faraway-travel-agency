import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Compass,
  FerrisWheel,
  Landmark,
  MapPin,
  Mountain,
  Quote,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { categories, destinations, testimonials } from '../data/data'
import { useStore } from '../store/StoreContext'
import { formatPrice, toDateInput } from '../lib/utils'
import ExperienceCard from '../components/ExperienceCard'
import Reveal from '../components/Reveal'
import Stars from '../components/Stars'

const categoryIcons = {
  ferris: FerrisWheel,
  landmark: Landmark,
  mountain: Mountain,
  building: Building2,
  sparkles: Sparkles,
}

const heroSlides = [
  {
    image: '/images/disney-castle.jpg',
    alt: 'Le château de Disneyland Paris sous un ciel bleu',
    label: 'Coup de cœur',
    title: 'Disneyland Paris',
    detail: '2 jours · 1 nuit · dès 329 €',
    slug: 'disneyland-paris-la-magie-en-grand',
  },
  {
    image: '/images/santorini.jpg',
    alt: 'Maisons blanches et bougainvilliers à Santorin',
    label: 'Échappée ensoleillée',
    title: 'Santorin',
    detail: '5 jours · 4 nuits · dès 1 190 €',
    slug: 'santorin-echappee-egeenne',
  },
  {
    image: '/images/safari.jpg',
    alt: 'Éléphant dans la savane tanzanienne',
    label: 'Voyage signature',
    title: 'Tanzanie',
    detail: '9 jours · 8 nuits · dès 3 290 €',
    slug: 'tanzanie-sur-les-traces-de-la-grande-migration',
  },
]

export default function Home() {
  const { experiences, blogPosts } = useStore()
  const navigate = useNavigate()
  const [activeSlide, setActiveSlide] = useState(0)
  const [destination, setDestination] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('2')
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % heroSlides.length), 7000)
    return () => window.clearInterval(timer)
  }, [])

  const activeExperiences = useMemo(() => experiences.filter((exp) => exp.status === 'active'), [experiences])
  const featured = activeExperiences.filter((exp) => exp.featured).slice(0, 3)
  const selection = useMemo(() => {
    const picks = ['exp-disney', 'exp-europa', 'exp-bruges', 'exp-pairi', 'exp-kyoto', 'exp-islande']
    return picks
      .map((id) => activeExperiences.find((exp) => exp.id === id))
      .filter((exp): exp is NonNullable<typeof exp> => Boolean(exp))
  }, [activeExperiences])
  const [formDestinations] = useState(() =>
    Array.from(new Set(activeExperiences.map((exp) => exp.destination))).sort((a, b) => a.localeCompare(b)),
  )
  const journalPicks = useMemo(
    () => blogPosts.filter((post) => post.status === 'published').slice(0, 3),
    [blogPosts],
  )

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    if (category) params.set('category', category)
    if (date) params.set('date', date)
    if (guests) params.set('guests', guests)
    navigate(`/experiences${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const scrollRail = (direction: number) => {
    railRef.current?.scrollBy({ left: direction * 390, behavior: 'smooth' })
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__media">
          <AnimatePresence mode="sync">
            <motion.div
              key={heroSlides[activeSlide].image}
              className="hero__slide"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.2 }, scale: { duration: 7, ease: 'linear' } }}
            >
              <img src={heroSlides[activeSlide].image} alt={heroSlides[activeSlide].alt} />
            </motion.div>
          </AnimatePresence>
          <div className="hero__overlay" />
          <div className="hero__grain" />
        </div>

        <div className="container hero__content">
          <motion.div
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <span className="eyebrow">Agence de voyages · Bruxelles · depuis 2009</span>
          </motion.div>

          <h1 className="hero__title">
            <span className="hero__line">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                Le monde a des histoires.
              </motion.span>
            </span>
            <span className="hero__line hero__line--italic">
              <motion.em
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              >
                Écrivons la vôtre.
              </motion.em>
            </span>
          </h1>

          <motion.div
            className="hero__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            <p>
              Parcs mythiques, villes d’art et terres lointaines. Depuis Bruxelles, nous dessinons des
              échappées qui vous ressemblent — et nous nous occupons de tout le reste.
            </p>
            <div className="hero__actions">
              <Link to="/experiences" className="btn btn--accent">
                Explorer les expériences <ArrowUpRight />
              </Link>
              <Link to="/agence" className="hero__text-action">
                Découvrir Faraway <ArrowUpRight />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="hero__side">
          <div className="hero__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="stampCircle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
              </defs>
              <text>
                <textPath href="#stampCircle">VOYAGES SUR MESURE · DEPUIS 2009 · BRUXELLES ·</textPath>
              </text>
            </svg>
            <span>
              <Compass />
            </span>
          </div>
          <div className="hero__slide-count">
            <span>0{activeSlide + 1}</span>
            <span className="hero__slide-progress">
              <span style={{ width: `${((activeSlide + 1) / heroSlides.length) * 100}%` }} />
            </span>
            <span>0{heroSlides.length}</span>
          </div>
          <div className="hero__dots">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                className={activeSlide === index ? 'is-active' : ''}
                onClick={() => setActiveSlide(index)}
                aria-label={`Afficher ${slide.title}`}
              />
            ))}
          </div>
        </div>

        <div className="hero__feature">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroSlides[activeSlide].title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
            >
              <span className="hero__feature-label">{heroSlides[activeSlide].label}</span>
              <Link to={`/experiences/${heroSlides[activeSlide].slug}`}>
                <strong>{heroSlides[activeSlide].title}</strong>
                <span>{heroSlides[activeSlide].detail}</span>
                <ArrowUpRight />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <div className="hero-search-wrap">
        <div className="container">
          <motion.form
            className="hero-search"
            onSubmit={submitSearch}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-search__heading">
              <span className="hero-search__icon">
                <Search />
              </span>
              <div>
                <span className="small-label">Trouver mon échappée</span>
                <strong>Par où commence votre histoire ?</strong>
              </div>
            </div>
            <label className="hero-search__field">
              <span>Destination</span>
              <span className="hero-search__control">
                <MapPin />
                <select value={destination} onChange={(event) => setDestination(event.target.value)}>
                  <option value="">Toutes les villes</option>
                  {formDestinations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="hero-search__field">
              <span>Univers</span>
              <span className="hero-search__control">
                <Sparkles />
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="">Tous les univers</option>
                  {categories.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="hero-search__field">
              <span>Quand</span>
              <span className="hero-search__control">
                <CalendarDays />
                <input
                  type="date"
                  value={date}
                  min={toDateInput(new Date())}
                  onChange={(event) => setDate(event.target.value)}
                />
              </span>
            </label>
            <label className="hero-search__field">
              <span>Voyageurs</span>
              <span className="hero-search__control">
                <Users />
                <select value={guests} onChange={(event) => setGuests(event.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
                    <option key={number} value={number}>
                      {number} {number === 1 ? 'voyageur' : 'voyageurs'}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <button type="submit" className="hero-search__submit" aria-label="Rechercher">
              <Search />
              <span>Rechercher</span>
            </button>
          </motion.form>
        </div>
      </div>

      <section className="trust-strip">
        <div className="container trust-strip__inner">
          <div className="trust-strip__item">
            <strong>15<span>ans</span></strong>
            <p>d’expertise du voyage</p>
          </div>
          <div className="trust-strip__item">
            <strong>40k<span>+</span></strong>
            <p>voyageurs accompagnés</p>
          </div>
          <div className="trust-strip__item">
            <strong>4,9<span>/5</span></strong>
            <p>note moyenne de nos clients</p>
          </div>
          <div className="trust-strip__item trust-strip__item--text">
            <Sparkles />
            <p>
              <strong>Agence belge indépendante</strong>
              <span>Des voyages conçus à Bruxelles, avec soin.</span>
            </p>
          </div>
        </div>
      </section>

      <section className="section universes">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <span className="eyebrow">Nos univers</span>
                <h2 className="h2">
                  Cinq façons de partir, <span className="italic">une même envie d’ailleurs.</span>
                </h2>
              </div>
              <div className="section-head__aside">
                <p>
                  Du grand frisson au silence des grands espaces, chaque voyage est pensé comme une histoire
                  singulière.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="universe-grid">
            {categories.map((item, index) => {
              const Icon = categoryIcons[item.icon as keyof typeof categoryIcons]
              const count = activeExperiences.filter((exp) => exp.category === item.name).length
              return (
                <Reveal key={item.name} delay={index * 0.06}>
                  <Link
                    to={`/experiences?category=${encodeURIComponent(item.name)}`}
                    className="universe-card"
                  >
                    <span className="universe-card__index">0{index + 1}</span>
                    <span className="universe-card__icon">
                      <Icon />
                    </span>
                    <span className="universe-card__title">{item.name}</span>
                    <span className="universe-card__desc">{item.description}</span>
                    <span className="universe-card__foot">
                      <span>{count} expériences</span>
                      <ArrowUpRight />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section section--cream featured">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <span className="eyebrow">Les incontournables</span>
                <h2 className="h2">
                  Les escapades qui <span className="italic">font rêver.</span>
                </h2>
              </div>
              <Link to="/experiences" className="text-link section-head__aside">
                Tout le catalogue <ArrowUpRight />
              </Link>
            </div>
          </Reveal>
          <div className="feature-grid">
            {featured[0] && (
              <Reveal className="feature-story feature-story--large">
                <Link to={`/experiences/${featured[0].slug}`}>
                  <img src={featured[0].image} alt={featured[0].title} />
                  <span className="feature-story__shade" />
                  <span className="feature-story__top">
                    <span className="pill">{featured[0].badge ?? 'Coup de cœur'}</span>
                    <span className="feature-story__number">Nº 01</span>
                  </span>
                  <span className="feature-story__content">
                    <span className="feature-story__eyebrow">{featured[0].category}</span>
                    <strong className="feature-story__title">{featured[0].title}</strong>
                    <span className="feature-story__summary">{featured[0].shortDescription}</span>
                    <span className="feature-story__bottom">
                      <span>{featured[0].destination} · {featured[0].duration}</span>
                      <span className="feature-story__cta">
                        Dès {formatPrice(featured[0].price)} <ArrowUpRight />
                      </span>
                    </span>
                  </span>
                </Link>
              </Reveal>
            )}
            <div className="feature-stack">
              {featured.slice(1, 3).map((exp, index) => (
                <Reveal key={exp.id} className="feature-story feature-story--small" delay={0.1 + index * 0.08}>
                  <Link to={`/experiences/${exp.slug}`}>
                    <img src={exp.image} alt={exp.title} />
                    <span className="feature-story__shade" />
                    <span className="feature-story__top">
                      <span className="pill">{exp.badge ?? 'Sélection'}</span>
                      <span className="feature-story__number">Nº 0{index + 2}</span>
                    </span>
                    <span className="feature-story__content">
                      <span className="feature-story__eyebrow">{exp.category}</span>
                      <strong className="feature-story__title">{exp.title}</strong>
                      <span className="feature-story__bottom">
                        <span>{exp.duration}</span>
                        <span className="feature-story__cta">
                          Dès {formatPrice(exp.price)} <ArrowUpRight />
                        </span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section selection">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <span className="eyebrow">La sélection de la maison</span>
                <h2 className="h2">
                  Des voyages à vivre, <span className="italic">pas à cocher.</span>
                </h2>
              </div>
              <div className="section-head__aside">
                <p>
                  Nous avons visité, testé et parfois re-testé. Ces six expériences incarnent notre idée du
                  voyage juste.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="experience-grid">
            {selection.map((exp, index) => (
              <Reveal key={exp.id} delay={(index % 3) * 0.07}>
                <ExperienceCard experience={exp} priority={index < 3} />
              </Reveal>
            ))}
          </div>
          <div className="section-action">
            <Link to="/experiences" className="btn btn--outline">
              Voir les {activeExperiences.length} expériences <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="manifesto section--dark">
        <div className="container manifesto__inner">
          <Reveal className="manifesto__media">
            <div className="manifesto__image">
              <img src="/images/family-fun.jpg" alt="Famille complice en voyage" loading="lazy" />
            </div>
            <div className="manifesto__badge">
              <strong>97<span>%</span></strong>
              <p>de voyageurs<br />nous recommandent</p>
            </div>
            <span className="manifesto__caption">Quelque part entre deux fous rires.</span>
          </Reveal>
          <Reveal className="manifesto__content" delay={0.1}>
            <span className="eyebrow">L’art Faraway</span>
            <h2 className="h2">
              Nous ne vendons pas des billets. <span className="italic">Nous dessinons des souvenirs.</span>
            </h2>
            <p className="manifesto__lede">
              Une agence de voyages, c’est d’abord une oreille attentive. Nous écoutons vos envies, vos contraintes,
              votre tribu — puis nous construisons un voyage qui n’appartient qu’à vous.
            </p>
            <div className="manifesto__pillars">
              <div>
                <span>01</span>
                <strong>Des spécialistes, pas des vendeurs</strong>
                <p>Chaque univers a son expert, qui connaît les lieux et les partenaires sur le bout des doigts.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Le détail qui change tout</strong>
                <p>Un transfert bien pensé, une chambre au bon étage, un restaurant réservé. C’est là que la magie se joue.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Présents, avant et pendant</strong>
                <p>Une équipe joignable à Bruxelles et des correspondants locaux, pour voyager l’esprit vraiment léger.</p>
              </div>
            </div>
            <div className="manifesto__footer">
              <Link to="/agence" className="btn btn--light">
                Rencontrer l’équipe <ArrowUpRight />
              </Link>
              <div className="manifesto__signature">
                <span>Camille Laurent</span>
                <small>Fondatrice & directrice</small>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section destinations-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <span className="eyebrow">Envie d’ailleurs</span>
                <h2 className="h2">
                  Le monde, <span className="italic">en quelques détours.</span>
                </h2>
              </div>
              <div className="rail-actions">
                <button className="icon-btn" onClick={() => scrollRail(-1)} aria-label="Destinations précédentes">
                  <ArrowLeft />
                </button>
                <button className="icon-btn" onClick={() => scrollRail(1)} aria-label="Destinations suivantes">
                  <ArrowRight />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="destination-rail" ref={railRef}>
          {destinations.map((destination, index) => (
            <Link
              key={destination.name}
              to={`/experiences?destination=${encodeURIComponent(destination.name)}`}
              className={`destination-card${index % 2 === 1 ? ' destination-card--offset' : ''}`}
            >
              <span className="destination-card__media">
                <img src={destination.image} alt={destination.name} loading="lazy" />
                <span className="destination-card__arrow">
                  <ArrowUpRight />
                </span>
              </span>
              <span className="destination-card__text">
                <span className="small-label">{destination.country}</span>
                <strong>{destination.name}</strong>
                <span>{destination.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--dark testimonials-section">
        <div className="container">
          <Reveal>
            <div className="section-head section-head--dark">
              <div>
                <span className="eyebrow">Ils sont partis avec nous</span>
                <h2 className="h2">
                  Des voyages qui <span className="italic">laissent une trace.</span>
                </h2>
              </div>
              <div className="testimonials-score">
                <span className="testimonials-score__number">4,9</span>
                <span>
                  <Stars rating={5} />
                  <small>d’après 1 240 avis vérifiés</small>
                </span>
              </div>
            </div>
          </Reveal>
          <div className="testimonial-grid">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 0.08}>
                <article className="testimonial-card">
                  <Quote className="testimonial-card__quote" />
                  <Stars rating={testimonial.rating} />
                  <blockquote>{testimonial.text}</blockquote>
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__avatar" style={{ background: testimonial.color }}>
                      {testimonial.initials}
                    </span>
                    <span>
                      <strong>{testimonial.name}</strong>
                      <small>{testimonial.city} · {testimonial.trip}</small>
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section journal-home">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <span className="eyebrow">Le journal</span>
                <h2 className="h2">
                  Des histoires pour <span className="italic">préparer le départ.</span>
                </h2>
              </div>
              <Link to="/journal" className="text-link section-head__aside">
                Lire le journal <ArrowUpRight />
              </Link>
            </div>
          </Reveal>
          <div className="journal-grid journal-grid--home">
            {journalPicks.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.07}>
                <Link to={`/journal/${post.slug}`} className="journal-card">
                  <span className="journal-card__media">
                    <img src={post.image} alt={post.title} loading="lazy" />
                    <span className="pill">{post.category}</span>
                  </span>
                  <span className="journal-card__body">
                    <span className="journal-card__meta">
                      <span>Le journal Faraway</span>
                      <span>{post.readTime} min de lecture</span>
                    </span>
                    <strong>{post.title}</strong>
                    <span className="journal-card__link">
                      Lire l’article <ArrowUpRight />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-note">
        <div className="container closing-note__inner">
          <span className="eyebrow">Et si on partait ?</span>
          <h2>
            Votre prochaine grande histoire <span className="italic">commence par un échange.</span>
          </h2>
          <div className="closing-note__actions">
            <Link to="/experiences" className="btn btn--accent">
              Trouver mon voyage <ArrowUpRight />
            </Link>
            <Link to="/contact" className="btn btn--outline">
              Parler à un conseiller
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
