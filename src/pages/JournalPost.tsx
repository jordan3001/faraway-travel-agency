import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, Copy, Facebook, Linkedin, MessageCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'

export default function JournalPost() {
  const { slug } = useParams()
  const { blogPosts, notify } = useStore()
  const [progress, setProgress] = useState(0)
  const post = blogPosts.find((item) => item.slug === slug && item.status === 'published')
  const related = blogPosts.filter((item) => item.status === 'published' && item.id !== post?.id).slice(0, 2)

  useEffect(() => {
    const onScroll = () => {
      const article = document.querySelector('.article-body')
      if (!article) return
      const start = article.getBoundingClientRect().top + window.scrollY - 200
      const height = article.clientHeight
      const value = Math.min(100, Math.max(0, ((window.scrollY - start) / height) * 100))
      setProgress(value)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [slug])

  if (!post) {
    return (
      <div className="not-found-page">
        <div className="container not-found-page__inner">
          <span className="eyebrow">Journal</span>
          <h1 className="h1">Cet article n’a pas encore été écrit.</h1>
          <p>Peut-être une histoire à venir. En attendant, découvrez les autres récits Faraway.</p>
          <Link to="/journal" className="btn btn--dark">
            Retour au journal <ArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  const share = async (network?: 'facebook' | 'linkedin') => {
    const url = encodeURIComponent(window.location.href)
    if (network === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=500')
      return
    }
    if (network === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=500')
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('Lien de l’article copié.')
    } catch {
      notify('Impossible de copier le lien.', 'error')
    }
  }

  const midpoint = Math.floor(post.content.length / 2)

  return (
    <article className="article-page">
      <div className="article-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <section className="article-hero">
        <img src={post.image} alt={post.title} />
        <div className="article-hero__overlay" />
        <div className="container article-hero__inner">
          <Breadcrumbs
            items={[
              { label: 'Journal', to: '/journal' },
              { label: post.category, to: `/journal?category=${encodeURIComponent(post.category)}` },
              { label: post.title },
            ]}
            light
          />
          <div className="article-hero__content">
            <span className="article-hero__category">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="article-hero__meta">
              <div className="article-author">
                <span className="article-author__avatar">
                  {post.author.split(' ').map((part) => part[0]).join('')}
                </span>
                <span>
                  <strong>{post.author}</strong>
                  <small>{post.authorRole}</small>
                </span>
              </div>
              <span className="article-hero__dot" />
              <span>{post.date}</span>
              <span className="article-hero__dot" />
              <span>
                <Clock /> {post.readTime} min de lecture
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="article-layout container">
        <aside className="article-share">
          <span>Partager</span>
          <button onClick={() => share('facebook')} aria-label="Partager sur Facebook">
            <Facebook />
          </button>
          <button onClick={() => share('linkedin')} aria-label="Partager sur LinkedIn">
            <Linkedin />
          </button>
          <button onClick={() => share()} aria-label="Copier le lien">
            <Copy />
          </button>
          <span className="article-share__line" />
          <a href="mailto:hello@faraway.be?subject=Un article du journal Faraway" aria-label="Partager par e-mail">
            <MessageCircle />
          </a>
        </aside>

        <div className="article-content">
          <p className="article-lead">{post.excerpt}</p>
          <div className="article-body">
            {post.content.map((paragraph, index) => (
              <div key={paragraph.slice(0, 32)}>
                <p className={index === 0 ? 'article-dropcap' : ''}>{paragraph}</p>
                {index === midpoint - 1 && (
                  <blockquote className="article-pullquote">
                    <span>“</span>
                    {post.pullQuote}
                  </blockquote>
                )}
              </div>
            ))}
          </div>

          <div className="article-author-card">
            <span className="article-author-card__avatar">
              {post.author.split(' ').map((part) => part[0]).join('')}
            </span>
            <div>
              <span className="small-label">L’auteur·e</span>
              <strong>{post.author}</strong>
              <p>{post.authorRole} chez Faraway. Amoureux·se des voyages qui prennent leur temps.</p>
            </div>
            <Link to="/contact" className="text-link">
              Écrire à l’équipe <ArrowUpRight />
            </Link>
          </div>

          <div className="article-tags">
            <span className="small-label">À explorer</span>
            <Link to={`/journal?category=${encodeURIComponent(post.category)}`} className="chip">
              {post.category}
            </Link>
            <Link to="/experiences" className="chip">
              Toutes les expériences
            </Link>
          </div>
        </div>
      </div>

      <section className="section article-related">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Continuer la lecture</span>
              <h2 className="h2">
                D’autres histoires <span className="italic">à emporter.</span>
              </h2>
            </div>
            <Link to="/journal" className="text-link section-head__aside">
              Tout le journal <ArrowUpRight />
            </Link>
          </div>
          <div className="journal-list journal-list--related">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.06}>
                <Link to={`/journal/${item.slug}`} className="journal-list__card">
                  <div className="journal-list__media">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>
                  <div className="journal-list__body">
                    <div className="journal-list__meta">
                      <span>{item.category}</span>
                      <span>{item.readTime} min</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                    <span className="journal-list__link">
                      Lire <ArrowUpRight />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="article-back">
            <Link to="/journal" className="btn btn--outline">
              <ArrowLeft /> Retour au journal
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}
