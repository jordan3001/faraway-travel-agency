import { Link } from 'react-router-dom'

type LogoProps = {
  light?: boolean
  compact?: boolean
}

export default function Logo({ light = false, compact = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={`brand${light ? ' brand--light' : ''}${compact ? ' brand--compact' : ''}`}
      aria-label="Faraway Travel Agency, accueil"
    >
      <img
        className="brand__logo"
        src={light ? '/images/brand/faraway-logo-light.png' : '/images/brand/faraway-logo-dark.png'}
        alt="Faraway Travel Agency"
        draggable={false}
      />
    </Link>
  )
}
