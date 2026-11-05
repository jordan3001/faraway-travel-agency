import { Star } from 'lucide-react'

interface StarsProps {
  rating: number
  size?: number
  showValue?: boolean
  className?: string
}

export default function Stars({ rating, size = 13, showValue = false, className = '' }: StarsProps) {
  return (
    <span className={`stars ${className}`} aria-label={`Note ${rating.toFixed(1)} sur 5`}>
      <span className="stars__icons">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: size, height: size }}
            fill={rating >= star - 0.25 ? 'currentColor' : 'none'}
          />
        ))}
      </span>
      {showValue && <span className="stars__value">{rating.toFixed(1)}</span>}
    </span>
  )
}
