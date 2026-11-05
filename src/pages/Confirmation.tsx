import { useMemo } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  Check,
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  Printer,
  Sparkles,
  Ticket,
  UserRound,
} from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { formatDateLong, formatPrice } from '../lib/utils'
import Breadcrumbs from '../components/Breadcrumbs'

export default function Confirmation() {
  const { reference } = useParams()
  const location = useLocation()
  const { bookings, experiences, clients, currentClient, notify } = useStore()
  const booking = bookings.find((item) => item.reference === reference)
  const experience = useMemo(
    () => experiences.find((exp) => exp.id === booking?.experienceId),
    [bookings, experiences, booking],
  )
  const client = clients.find((item) => item.id === booking?.clientId)
  const state = location.state as { newAccount?: boolean } | null

  if (!booking || !experience) {
    return (
      <div className="not-found-page">
        <div className="container not-found-page__inner">
          <span className="eyebrow">Confirmation</span>
          <h1 className="h1">Cette réservation est introuvable.</h1>
          <p>Vérifiez votre référence ou contactez-nous, nous retrouverons votre voyage ensemble.</p>
          <Link to="/experiences" className="btn btn--dark">
            Retour au catalogue <ArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  const selectedOptions = experience.options.filter((option) => booking.options.includes(option.id))

  const downloadCalendar = () => {
    const date = booking.date.slice(0, 10).replace(/-/g, '')
    const end = new Date(booking.date)
    end.setDate(end.getDate() + 1)
    const endDate = end.toISOString().slice(0, 10).replace(/-/g, '')
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Faraway Travel Agency//Reservation//FR',
      'BEGIN:VEVENT',
      `UID:${booking.reference}@faraway.be`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${experience.title} — Faraway`,
      `DESCRIPTION:Réservation ${booking.reference} — ${experience.destination}. Détails sur faraway.be`,
      `LOCATION:${experience.destination}, ${experience.country}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `faraway-${booking.reference}.ics`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    notify('Votre voyage a été ajouté à votre calendrier.')
  }

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(booking.reference)
      notify('Référence copiée.')
    } catch {
      notify('Impossible de copier la référence.', 'error')
    }
  }

  return (
    <div className="confirmation-page">
      <section className="confirmation-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Confirmation' }]} />
          <div className="confirmation-hero__content">
            <div className="confirmation-check">
              <Check />
            </div>
            <span className="eyebrow">Réservation confirmée</span>
            <h1 className="h1">
              Merci {booking.clientId ? client?.firstName ?? '' : ''}, <br />
              <span className="italic">votre voyage commence ici.</span>
            </h1>
            <p>
              Votre demande est entre de bonnes mains. Un e-mail de confirmation vient de partir vers{' '}
              <strong>{client?.email}</strong>. Notre conseiller prépare déjà les détails de votre départ.
            </p>
          </div>
        </div>
        <div className="confirmation-orbit confirmation-orbit--1" />
        <div className="confirmation-orbit confirmation-orbit--2" />
      </section>

      <div className="confirmation-layout container">
        <div className="confirmation-main">
          <div className="confirmation-ticket">
            <div className="confirmation-ticket__stub">
              <span className="small-label">Votre référence</span>
              <div className="confirmation-reference">
                <strong>{booking.reference}</strong>
                <button onClick={copyReference} aria-label="Copier la référence">
                  <Copy />
                </button>
              </div>
              <div className="confirmation-ticket__status">
                <span className="status status--confirmed">Confirmée</span>
                <span className="status status--pending">{booking.paymentStatus === 'paid' ? 'Payé' : 'Paiement en attente'}</span>
              </div>
              <div className="confirmation-barcode" aria-hidden="true">
                {Array.from({ length: 32 }).map((_, index) => (
                  <span key={index} style={{ width: `${index % 5 === 0 ? 3 : index % 3 === 0 ? 2 : 1}px` }} />
                ))}
              </div>
              <small className="confirmation-ticket__stub-note">
                Présentez cette référence lors de votre arrivée.
              </small>
            </div>
            <div className="confirmation-ticket__main">
              <div className="confirmation-ticket__top">
                <img src={experience.image} alt={experience.title} />
                <div>
                  <span className="small-label">Votre expérience</span>
                  <h2>{experience.title}</h2>
                  <p>
                    <MapPin /> {experience.destination}, {experience.country}
                  </p>
                </div>
              </div>
              <div className="confirmation-ticket__grid">
                <div>
                  <span>Date de départ</span>
                  <strong>{formatDateLong(`${booking.date.slice(0, 10)}T12:00:00`)}</strong>
                </div>
                <div>
                  <span>Durée</span>
                  <strong>{experience.duration}</strong>
                </div>
                <div>
                  <span>Voyageurs</span>
                  <strong>
                    {booking.adults} adulte{booking.adults > 1 ? 's' : ''}
                    {booking.children > 0 ? ` · ${booking.children} enfant${booking.children > 1 ? 's' : ''}` : ''}
                  </strong>
                </div>
                <div>
                  <span>Départ</span>
                  <strong>{experience.practical.departure}</strong>
                </div>
              </div>
              {selectedOptions.length > 0 && (
                <div className="confirmation-options">
                  <span className="small-label">Vos options</span>
                  <div>
                    {selectedOptions.map((option) => (
                      <span key={option.id}>
                        <Check /> {option.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="confirmation-ticket__total">
                <span>Total réglé</span>
                <strong>{formatPrice(booking.total, true)}</strong>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <button className="btn btn--dark" onClick={downloadCalendar}>
              <CalendarPlus /> Ajouter à mon calendrier
            </button>
            <button className="btn btn--outline" onClick={() => window.print()}>
              <Printer /> Imprimer le récapitulatif
            </button>
          </div>

          <div className="confirmation-next">
            <span className="eyebrow">Et maintenant ?</span>
            <div className="confirmation-next__grid">
              <div>
                <span className="confirmation-next__icon">
                  <Mail />
                </span>
                <strong>L’e-mail de confirmation</strong>
                <p>Il contient votre récapitulatif et vos informations pratiques. Pensez à vérifier vos spams.</p>
              </div>
              <div>
                <span className="confirmation-next__icon">
                  <MessageCircle />
                </span>
                <strong>Votre conseiller dédié</strong>
                <p>Nous vous contactons sous 24 h ouvrées pour préparer les derniers détails de votre départ.</p>
              </div>
              <div>
                <span className="confirmation-next__icon">
                  <Ticket />
                </span>
                <strong>Vos documents de voyage</strong>
                <p>Vos billets et éventuels vouchers seront disponibles dans votre espace client.</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="confirmation-side">
          <div className="confirmation-account">
            <span className="confirmation-account__icon">
              <UserRound />
            </span>
            <span className="eyebrow">Votre espace</span>
            <h3>{currentClient ? `Bienvenue, ${currentClient.firstName}.` : 'Gardez le fil de votre voyage.'}</h3>
            <p>
              {state?.newAccount || currentClient
                ? 'Votre espace Faraway est prêt. Retrouvez-y votre réservation, vos documents et vos envies à venir.'
                : 'Connectez-vous avec votre adresse e-mail pour retrouver votre réservation et préparer votre prochaine escapade.'}
            </p>
            <Link to={currentClient ? '/espace-client' : '/connexion'} className="btn btn--dark btn--block">
              {currentClient ? 'Accéder à mon espace' : 'Me connecter'} <ArrowRight />
            </Link>
            <Link to="/experiences" className="text-link confirmation-account__link">
              Continuer à explorer <ArrowUpRight />
            </Link>
          </div>

          <div className="confirmation-contact">
            <Sparkles />
            <p>
              Une question ? Écrivez-nous à{' '}
              <a href="mailto:hello@faraway.be">hello@faraway.be</a> ou appelez le{' '}
              <a href="tel:+3225550824">+32 2 555 08 24</a>. Nous sommes là.
            </p>
          </div>

          <div className="confirmation-tip">
            <span className="small-label">Le conseil Faraway</span>
            <p>
              La veille du départ, préparez une petite veste et un peu d’eau. Les plus belles journées se
              prolongent souvent au-delà de l’itinéraire prévu.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
