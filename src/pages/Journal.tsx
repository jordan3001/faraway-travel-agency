import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Clock, Mail } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'

export default function Journal() {
  const { blogPosts, notify } = useStore()
  const [params, setParams] = useSearchParams()
  const [category, setCategory] = useState(params.get('category') ?? 'Tous')
  const [email, setEmail] = useState('')
  const published = blogPosts.filter((post) => post.status === 'published')
  const feature = category === 'Tous' ? published[0] : null
  const categories = ['Tous', ...Array.from(new Set(published.map((post) => post.category)))]
  const filtered = useMemo(
    () =>
      published
        .filter((post) => category === 'Tous' || post.category === category)
        .filter((post) => post.id !== feature?.id)
        .slice(0, 9),
    [published, category, feature],
  )

  useEffect(() => {
    setCategory(params.get('category') ?? 'Tous')
  }, [params])

  const selectCategory = (next: string) => {
    setCategory(next)
    if (next === 'Tous') setParams({}, { replace: true })
    else setParams({ category: next }, { replace: true })
  }

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      notify('Saisissez une adresse e-mail valide.', 'error')
      return
    }
    notify('Merci ! Votre première lettre Faraway arrive bientôt.')
    setEmail('')
  }

  return (
    <div className="journal-page">
      <section className="journal-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Le journal' }]} />
          <div className="journal-hero__inner">
            <div>
              <span className="eyebrow">Le journal Faraway</span>
              <h1 className="h1">
                Des histoires pour <span className="italic">préparer le départ.</span>
              </h1>
            </div>
            <p>
              Coulisses, carnets de route et conseils de terrain : les mots de nos spécialistes pour voyager
              mieux, et un peu plus loin.
            </p>
          </div>
        </div>
      </section>

      {feature && (
        <section className="journal-feature container">
          <Reveal>
            <Link to={`/journal/${feature.slug}`} className="journal-feature__card">
              <div className="journal-feature__media">
                <img src={feature.image} alt={feature.title} />
                <span className="pill">À la une</span>
              </div>
              <div className="journal-feature__body">
                <div className="journal-feature__meta">
                  <span className="eyebrow eyebrow--plain">{feature.category}</span>
                  <span>
                    <Clock /> {feature.readTime} min
                  </span>
                </div>
                <h2>{feature.title}</h2>
                <p>{feature.excerpt}</p>
                <div className="journal-feature__footer">
                  <div className="journal-author">
                    <span className="journal-author__avatar">{feature.author.split(' ').map((part) => part[0]).join('')}</span>
                    <span>
                      <strong>{feature.author}</strong>
                      <small>{feature.authorRole}</small>
                    </span>
                  </div>
                  <span className="text-link">
                    Lire l’article <ArrowUpRight />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      <section className="section journal-index">
        <div className="container">
          <div className="journal-index__head">
            <div>
              <span className="eyebrow">Toutes les histoires</span>
              <h2 className="h2">Le carnet de route.</h2>
            </div>
            <div className="chip-row journal-categories">
              {categories.map((item) => (
                <button key={item} className={`chip${category === item ? ' is-active' : ''}`} onClick={() => selectCategory(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="journal-list">
            {filtered.map((post, index) => (
              <Reveal key={post.id} delay={(index % 3) * 0.06}>
                <Link to={`/journal/${post.slug}`} className="journal-list__card">
                  <div className="journal-list__media">
                    <img src={post.image} alt={post.title} loading="lazy" />
                  </div>
                  <div className="journal-list__body">
                    <div className="journal-list__meta">
                      <span>{post.category}</span>
                      <span>{post.date}</span>
                      <span>{post.readTime} min</span>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <span className="journal-list__link">
                      Lire <ArrowUpRight />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <h3>Aucun article dans cette rubrique pour le moment.</h3>
              <p>De nouvelles histoires arrivent bientôt.</p>
            </div>
          )}
        </div>
      </section>

      <section className="journal-newsletter">
        <div className="container journal-newsletter__inner">
          <div className="journal-newsletter__icon">
            <Mail />
          </div>
          <div>
            <span className="eyebrow">La lettre Faraway</span>
            <h2>Une dose d’ailleurs, une fois par mois.</h2>
            <p>Nos coups de cœur, des conseils utiles et des idées pour votre prochaine évasion.</p>
          </div>
          <form onSubmit={subscribe}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Votre adresse e-mail"
              aria-label="Votre adresse e-mail"
            />
            <button type="submit" className="btn btn--accent">
              S’abonner <ArrowUpRight />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
