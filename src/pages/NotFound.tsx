import { ArrowRight, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container not-found-page__inner">
        <span className="not-found-page__code">404</span>
        <span className="eyebrow">Hors de l’itinéraire</span>
        <h1 className="h1">Cette page a pris un autre chemin.</h1>
        <p>
          Le lien est peut-être ancien, ou l’endroit n’existe pas encore. Revenons ensemble sur la route des
          belles histoires.
        </p>
        <div className="not-found-page__actions">
          <Link to="/" className="btn btn--dark">
            Retour à l’accueil <ArrowRight />
          </Link>
          <Link to="/experiences" className="btn btn--outline">
            <Compass /> Explorer les expériences
          </Link>
        </div>
      </div>
    </div>
  )
}
