import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

export default function RouteMeta() {
  const { pathname } = useLocation()
  const { experiences, blogPosts } = useStore()

  useEffect(() => {
    let title = "L'extraordinaire, à portée de voyage"
    const experienceMatch = pathname.match(/^\/experiences\/([^/]+)$/)
    const articleMatch = pathname.match(/^\/journal\/([^/]+)$/)

    if (pathname === '/') title = "L'extraordinaire, à portée de voyage"
    else if (experienceMatch) {
      const experience = experiences.find((item) => item.slug === experienceMatch[1])
      title = experience ? `${experience.title} — ${experience.destination}` : 'Expérience introuvable'
    } else if (articleMatch) {
      const post = blogPosts.find((item) => item.slug === articleMatch[1])
      title = post ? `${post.title} — Le journal` : 'Journal'
    } else if (pathname.startsWith('/experiences')) title = 'Toutes nos expériences'
    else if (pathname.startsWith('/journal')) title = 'Le journal Faraway'
    else if (pathname === '/agence') title = "L'agence — Notre histoire"
    else if (pathname === '/contact') title = 'Contact & conseils'
    else if (pathname === '/connexion') title = 'Votre espace voyage'
    else if (pathname.startsWith('/espace-client')) title = 'Votre espace voyage'
    else if (pathname.startsWith('/reservation')) title = 'Réservation sécurisée'
    else if (pathname.startsWith('/confirmation')) title = 'Réservation confirmée'
    else if (pathname.startsWith('/admin'))
      title = `Administration — ${
        pathname === '/admin'
          ? 'Tableau de bord'
          : pathname.includes('reservations')
            ? 'Réservations'
            : pathname.includes('experiences')
              ? 'Expériences'
              : pathname.includes('clients')
                ? 'Clients'
                : pathname.includes('tarifs')
                  ? 'Tarifs & offres'
                  : pathname.includes('fournisseurs')
                    ? 'Fournisseurs'
                    : pathname.includes('journal')
                      ? 'Journal'
                      : 'Pilotage'
      }`

    document.title = `${title} — Faraway Travel Agency`
  }, [pathname, experiences, blogPosts])

  return null
}
