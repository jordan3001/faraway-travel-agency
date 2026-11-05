import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BreadcrumbsProps {
  items: { label: string; to?: string }[]
  light?: boolean
}

export default function Breadcrumbs({ items, light = false }: BreadcrumbsProps) {
  return (
    <nav className={`breadcrumbs${light ? ' breadcrumbs--light' : ''}`} aria-label="Fil d’Ariane">
      <Link to="/">Accueil</Link>
      {items.map((item) => (
        <span key={item.label} className="breadcrumbs__item">
          <ChevronRight />
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}
