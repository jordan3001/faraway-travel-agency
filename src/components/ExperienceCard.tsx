import { Heart, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Experience } from '../types'
import { formatPrice } from '../lib/utils'
import { useStore } from '../store/StoreContext'

interface ExperienceCardProps {
  experience: Experience
  priority?: boolean
  compact?: boolean
}

export default function ExperienceCard({ experience, priority = false, compact = false }: ExperienceCardProps) {
  const { favorites, toggleFavorite } = useStore()
  const isFavorite = favorites.includes(experience.id)

  return (
    <article className={`exp-card${compact ? ' exp-card--compact' : ''}`}>
      <div className="exp-card__media">
        <Link to={`/experiences/${experience.slug}`} aria-label={experience.title}>
          <img
            src={experience.image}
            alt={experience.title}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
          />
          <span className="exp-card__shade" />
        </Link>
        <div className="exp-card__badges">
          {experience.badge && <span className="pill">{experience.badge}</span>}
          <span className="pill pill--ink">{experience.duration}</span>
        </div>
        <button
          className={`favorite-btn${isFavorite ? ' is-active' : ''}`}
          onClick={(event) => {
            event.preventDefault()
            toggleFavorite(experience.id)
          }}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isFavorite}
        >
          <Heart fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="exp-card__body">
        <span className="eyebrow eyebrow--plain exp-card__category">{experience.category}</span>
        <h3 className="exp-card__title">
          <Link to={`/experiences/${experience.slug}`}>{experience.title}</Link>
        </h3>
        <p className="exp-card__location">
          <MapPin /> {experience.destination}, {experience.country}
        </p>
        <div className="exp-card__footer">
          <div className="exp-card__price">
            <span>dès</span>
            <strong>{formatPrice(experience.price)}</strong>
            <small>/ pers.</small>
          </div>
          <div className="exp-card__rating">
            <Star />
            <strong>{experience.rating.toFixed(1)}</strong>
            <span>({experience.reviewCount})</span>
          </div>
        </div>
      </div>
    </article>
  )
}
