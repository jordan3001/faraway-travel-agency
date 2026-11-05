import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock,
  Compass,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Settings2,
  Sparkles,
  Ticket,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { formatDateLong, formatPrice } from '../lib/utils'
import ExperienceCard from '../components/ExperienceCard'
import type { Booking } from '../types'

const tabs = [
  { id: 'overview', label: 'Aperçu', icon: Compass },
  { id: 'bookings', label: 'Mes réservations', icon: Ticket },
  { id: 'favorites', label: 'Mes favoris', icon: Heart },
  { id: 'profile', label: 'Mon profil', icon: UserRound },
]

export default function ClientAccount() {
  const {
    currentClient,
    bookings,
    experiences,
    favorites,
    logout,
    updateClient,
    setBookingStatus,
    notify,
  } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'overview'
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    preferences: [] as string[],
  })
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    if (!currentClient) return
    setProfile({
      firstName: currentClient.firstName,
      lastName: currentClient.lastName,
      email: currentClient.email,
      phone: currentClient.phone,
      city: currentClient.city,
      country: currentClient.country,
      preferences: currentClient.preferences,
    })
  }, [currentClient])

  const clientBookings = useMemo(() => {
    if (!currentClient) return []
    return bookings
      .filter((booking) => booking.clientId === currentClient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [bookings, currentClient])

  const upcoming = clientBookings
    .filter((booking) => new Date(booking.date).getTime() >= Date.now() - 86400000 && booking.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const past = clientBookings.filter(
    (booking) => new Date(booking.date).getTime() < Date.now() - 86400000 || booking.status === 'completed',
  )
  const totalSpent = clientBookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + booking.total, 0)
  const favoriteExperiences = experiences.filter((experience) => favorites.includes(experience.id))
  const nextTrip = upcoming[0]
  const nextExperience = nextTrip ? experiences.find((exp) => exp.id === nextTrip.experienceId) : undefined
  const nextTripDays = nextTrip
    ? Math.max(0, Math.ceil((new Date(nextTrip.date).getTime() - Date.now()) / 86400000))
    : 0

  if (!currentClient) {
    return <Navigate to="/connexion" replace state={{ from: '/espace-client' }} />
  }

  const setTab = (id: string) => {
    setParams(id === 'overview' ? {} : { tab: id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelBooking = (booking: Booking) => {
    const days = Math.ceil((new Date(booking.date).getTime() - Date.now()) / 86400000)
    if (days < 7) {
      notify('Ce voyage ne peut plus être annulé en ligne. Contactez votre conseiller.', 'error')
      return
    }
    if (!window.confirm(`Souhaitez-vous vraiment annuler la réservation ${booking.reference} ?`)) return
    setBookingStatus(booking.id, 'cancelled')
  }

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault()
    if (!profile.firstName || !profile.lastName || !/^\S+@\S+\.\S+$/.test(profile.email)) {
      notify('Vérifiez vos informations personnelles.', 'error')
      return
    }
    updateClient(currentClient.id, profile)
  }

  const togglePreference = (preference: string) => {
    setProfile((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter((item) => item !== preference)
        : [...prev.preferences, preference],
    }))
  }

  const changePassword = (event: React.FormEvent) => {
    event.preventDefault()
    if (currentClient.password && passwordForm.current !== currentClient.password) {
      notify('Le mot de passe actuel est incorrect.', 'error')
      return
    }
    if (passwordForm.next.length < 6) {
      notify('Choisissez un mot de passe de 6 caractères minimum.', 'error')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      notify('Les deux mots de passe ne correspondent pas.', 'error')
      return
    }
    updateClient(currentClient.id, { password: passwordForm.next })
    setPasswordForm({ current: '', next: '', confirm: '' })
  }

  const tierProgress =
    currentClient.loyaltyPoints >= 5000
      ? 100
      : currentClient.loyaltyPoints >= 2500
        ? ((currentClient.loyaltyPoints - 2500) / 2500) * 100
        : (currentClient.loyaltyPoints / 2500) * 100

  const bookingCard = (booking: Booking, compact = false) => {
    const experience = experiences.find((exp) => exp.id === booking.experienceId)
    if (!experience) return null
    return (
      <div key={booking.id} className={`account-booking${compact ? ' account-booking--compact' : ''}`}>
        <div className="account-booking__image">
          <img src={experience.image} alt={experience.title} loading="lazy" />
          <span className="pill">{experience.category}</span>
        </div>
        <div className="account-booking__body">
          <div className="account-booking__top">
            <span className="small-label">{booking.reference}</span>
            <span className={`status ${booking.status === 'confirmed' ? 'status--confirmed' : booking.status === 'pending' ? 'status--pending' : booking.status === 'completed' ? 'status--completed' : 'status--cancelled'}`}>
              {booking.status === 'confirmed'
                ? 'Confirmée'
                : booking.status === 'pending'
                  ? 'En attente'
                  : booking.status === 'completed'
                    ? 'Terminée'
                    : 'Annulée'}
            </span>
          </div>
          <h3>{experience.title}</h3>
          <div className="account-booking__meta">
            <span>
              <CalendarDays /> {formatDateLong(`${booking.date.slice(0, 10)}T12:00:00`)}
            </span>
            <span>
              <MapPin /> {experience.destination}
            </span>
            <span>
              <UserRound /> {booking.adults + booking.children} voyageur{booking.adults + booking.children > 1 ? 's' : ''}
            </span>
          </div>
          <div className="account-booking__foot">
            <strong>{formatPrice(booking.total, true)}</strong>
            <div>
              <Link to={`/confirmation/${booking.reference}`} className="btn btn--xs btn--outline">
                Voir mon billet <ArrowUpRight />
              </Link>
              {(booking.status === 'confirmed' || booking.status === 'pending') && (
                <button className="account-booking__cancel" onClick={() => cancelBooking(booking)}>
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <section className="account-hero">
        <div className="container account-hero__inner">
          <div>
            <span className="eyebrow">Espace personnel</span>
            <h1 className="h1">
              Bonjour, <span className="italic">{currentClient.firstName}.</span>
            </h1>
            <p>Vos voyages, vos envies et vos petits privilèges, réunis au même endroit.</p>
          </div>
          <div className="account-hero__aside">
            <div className="account-tier">
              <span className="account-tier__icon">
                <Sparkles />
              </span>
              <div>
                <small>Cercle</small>
                <strong>{currentClient.tier}</strong>
              </div>
              <span className="account-tier__points">{currentClient.loyaltyPoints.toLocaleString('fr-BE')} pts</span>
            </div>
            <p className="account-hero__date">
              {new Intl.DateTimeFormat('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
            </p>
          </div>
        </div>
      </section>

      <div className="account-layout container">
        <aside className="account-sidebar">
          <div className="account-identity">
            <span className="account-identity__avatar">
              {currentClient.firstName[0]}
              {currentClient.lastName[0]}
            </span>
            <div>
              <strong>
                {currentClient.firstName} {currentClient.lastName}
              </strong>
              <small>{currentClient.email}</small>
            </div>
          </div>
          <nav className="account-nav" aria-label="Mon espace">
            {tabs.map((item) => (
              <button key={item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>
                <item.icon />
                {item.label}
                {item.id === 'bookings' && <span>{clientBookings.length}</span>}
                {item.id === 'favorites' && <span>{favorites.length}</span>}
              </button>
            ))}
          </nav>
          <div className="account-loyalty">
            <div className="account-loyalty__head">
              <span>Votre Cercle</span>
              <strong>{currentClient.tier}</strong>
            </div>
            <div className="account-loyalty__bar">
              <span style={{ width: `${Math.min(100, tierProgress)}%` }} />
            </div>
            <p>
              {currentClient.loyaltyPoints >= 5000
                ? 'Vous êtes au sommet du Cercle Signature. Merci pour votre fidélité.'
                : currentClient.loyaltyPoints >= 2500
                  ? 'Vous bénéficiez du Cercle Signature et de ses attentions dédiées. Chaque voyage vous rapproche du prochain palier.'
                  : `Encore ${(2500 - currentClient.loyaltyPoints).toLocaleString('fr-BE')} points pour le Cercle Signature.`}
            </p>
            <Link to="/contact">Découvrir les avantages <ArrowUpRight /></Link>
          </div>
          <div className="account-sidebar__foot">
            <Link to="/contact">
              <MessageCircle /> Aide & contact
            </Link>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              <LogOut /> Se déconnecter
            </button>
          </div>
        </aside>

        <main className="account-main">
          {tab === 'overview' && (
            <div className="account-tab">
              <div className="account-stats">
                <div>
                  <span className="account-stat__icon">
                    <Ticket />
                  </span>
                  <span>
                    <strong>{upcoming.length}</strong>
                    <small>voyage{upcoming.length > 1 ? 's' : ''} à venir</small>
                  </span>
                </div>
                <div>
                  <span className="account-stat__icon">
                    <Compass />
                  </span>
                  <span>
                    <strong>{clientBookings.length}</strong>
                    <small>expérience{clientBookings.length > 1 ? 's' : ''} vécue{clientBookings.length > 1 ? 's' : ''}</small>
                  </span>
                </div>
                <div>
                  <span className="account-stat__icon">
                    <Sparkles />
                  </span>
                  <span>
                    <strong>{currentClient.loyaltyPoints.toLocaleString('fr-BE')}</strong>
                    <small>points fidélité</small>
                  </span>
                </div>
                <div>
                  <span className="account-stat__icon">
                    <Wallet />
                  </span>
                  <span>
                    <strong>{formatPrice(totalSpent)}</strong>
                    <small>de souvenirs</small>
                  </span>
                </div>
              </div>

              {nextTrip && nextExperience ? (
                <section className="account-next">
                  <div className="account-section-head">
                    <div>
                      <span className="eyebrow">Votre prochain départ</span>
                      <h2>Le compte à rebours est lancé.</h2>
                    </div>
                    <Link to={`/confirmation/${nextTrip.reference}`} className="text-link">
                      Voir mon billet <ArrowUpRight />
                    </Link>
                  </div>
                  <div className="account-next__card">
                    <div className="account-next__media">
                      <img src={nextExperience.image} alt={nextExperience.title} />
                      <div className="account-next__countdown">
                        <strong>{nextTripDays}</strong>
                        <span>jour{nextTripDays > 1 ? 's' : ''}</span>
                      </div>
                      <span className="pill">{nextExperience.duration}</span>
                    </div>
                    <div className="account-next__body">
                      <span className="small-label">
                        {nextExperience.destination}, {nextExperience.country}
                      </span>
                      <h3>{nextExperience.title}</h3>
                      <div className="account-next__info">
                        <div>
                          <CalendarDays />
                          <span>
                            <small>Départ</small>
                            <strong>{formatDateLong(`${nextTrip.date.slice(0, 10)}T12:00:00`)}</strong>
                          </span>
                        </div>
                        <div>
                          <UserRound />
                          <span>
                            <small>Voyageurs</small>
                            <strong>
                              {nextTrip.adults + nextTrip.children} personne{nextTrip.adults + nextTrip.children > 1 ? 's' : ''}
                            </strong>
                          </span>
                        </div>
                        <div>
                          <Ticket />
                          <span>
                            <small>Référence</small>
                            <strong>{nextTrip.reference}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="account-next__actions">
                        <Link to={`/confirmation/${nextTrip.reference}`} className="btn btn--dark">
                          Préparer mon voyage <ArrowRight />
                        </Link>
                        <Link to="/contact" className="btn btn--outline">
                          Contacter mon conseiller
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="account-next account-next--empty">
                  <span className="empty-state__icon">
                    <Compass />
                  </span>
                  <h2>Votre prochaine histoire vous attend.</h2>
                  <p>Vous n’avez pas encore de voyage à venir. Laissez-vous inspirer par nos expériences.</p>
                  <Link to="/experiences" className="btn btn--dark">
                    Explorer les voyages <ArrowRight />
                  </Link>
                </section>
              )}

              <section className="account-quick">
                <div className="account-section-head">
                  <div>
                    <span className="eyebrow">Vos favoris</span>
                    <h2>Gardés pour plus tard.</h2>
                  </div>
                  <button className="text-link" onClick={() => setTab('favorites')}>
                    Tout voir <ArrowUpRight />
                  </button>
                </div>
                {favoriteExperiences.length > 0 ? (
                  <div className="account-favorites account-favorites--row">
                    {favoriteExperiences.slice(0, 3).map((experience) => (
                      <ExperienceCard key={experience.id} experience={experience} compact />
                    ))}
                  </div>
                ) : (
                  <div className="account-inline-empty">
                    <Heart />
                    <p>Vos coups de cœur apparaîtront ici. Cliquez sur le cœur d’une expérience pour la garder.</p>
                    <Link to="/experiences" className="text-link">
                      Trouver une escapade <ArrowUpRight />
                    </Link>
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === 'bookings' && (
            <div className="account-tab">
              <div className="account-tab__head">
                <div>
                  <span className="eyebrow">Mes réservations</span>
                  <h1>Vos voyages, au même endroit.</h1>
                  <p>Retrouvez vos billets, vos dates et les détails de chaque expérience.</p>
                </div>
                <Link to="/experiences" className="btn btn--dark btn--sm">
                  Nouvelle escapade <ArrowUpRight />
                </Link>
              </div>
              <div className="account-subhead">
                <h2>À venir</h2>
                <span>{upcoming.length} voyage{upcoming.length > 1 ? 's' : ''}</span>
              </div>
              {upcoming.length > 0 ? (
                <div className="account-bookings">{upcoming.map((booking) => bookingCard(booking))}</div>
              ) : (
                <div className="account-inline-empty">
                  <CalendarDays />
                  <p>Aucun voyage à venir pour l’instant. Le prochain pourrait commencer aujourd’hui.</p>
                  <Link to="/experiences" className="text-link">
                    Explorer le catalogue <ArrowUpRight />
                  </Link>
                </div>
              )}
              <div className="account-subhead account-subhead--past">
                <h2>Dans le rétroviseur</h2>
                <span>{past.length} souvenir{past.length > 1 ? 's' : ''}</span>
              </div>
              {past.length > 0 ? (
                <div className="account-bookings account-bookings--past">{past.map((booking) => bookingCard(booking, true))}</div>
              ) : (
                <div className="account-inline-empty">
                  <Clock />
                  <p>Vos voyages passés et leurs souvenirs s’afficheront ici.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'favorites' && (
            <div className="account-tab">
              <div className="account-tab__head">
                <div>
                  <span className="eyebrow">Mes favoris</span>
                  <h1>Vos envies, en attente de départ.</h1>
                  <p>Gardez les expériences qui vous font de l’œil et retrouvez-les facilement.</p>
                </div>
              </div>
              {favoriteExperiences.length > 0 ? (
                <>
                  <div className="account-subhead">
                    <h2>Votre liste</h2>
                    <span>{favoriteExperiences.length} expérience{favoriteExperiences.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="account-favorites">
                    {favoriteExperiences.map((experience) => (
                      <ExperienceCard key={experience.id} experience={experience} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="account-favorites-empty">
                  <span className="empty-state__icon">
                    <Heart />
                  </span>
                  <h2>Pas encore de coup de cœur.</h2>
                  <p>Parcourez le catalogue et cliquez sur le cœur d’une expérience pour la retrouver ici.</p>
                  <Link to="/experiences" className="btn btn--dark">
                    Trouver mon prochain voyage <ArrowRight />
                  </Link>
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="account-tab">
              <div className="account-tab__head">
                <div>
                  <span className="eyebrow">Mon profil</span>
                  <h1>Un voyage qui vous ressemble.</h1>
                  <p>Ces informations nous aident à personnaliser vos prochaines escapades.</p>
                </div>
              </div>
              <form className="account-profile" onSubmit={saveProfile}>
                <div className="account-card">
                  <div className="account-card__head">
                    <h2>Informations personnelles</h2>
                    <span>Membre depuis {currentClient.memberSince}</span>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="profile-first">Prénom</label>
                      <input
                        id="profile-first"
                        className="input"
                        value={profile.firstName}
                        onChange={(event) => setProfile((prev) => ({ ...prev, firstName: event.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="profile-last">Nom</label>
                      <input
                        id="profile-last"
                        className="input"
                        value={profile.lastName}
                        onChange={(event) => setProfile((prev) => ({ ...prev, lastName: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="profile-email">Adresse e-mail</label>
                      <input
                        id="profile-email"
                        type="email"
                        className="input"
                        value={profile.email}
                        onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="profile-phone">Téléphone</label>
                      <input
                        id="profile-phone"
                        className="input"
                        value={profile.phone}
                        onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="profile-city">Ville</label>
                      <input
                        id="profile-city"
                        className="input"
                        value={profile.city}
                        onChange={(event) => setProfile((prev) => ({ ...prev, city: event.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="profile-country">Pays</label>
                      <select
                        id="profile-country"
                        className="select"
                        value={profile.country}
                        onChange={(event) => setProfile((prev) => ({ ...prev, country: event.target.value }))}
                      >
                        <option>Belgique</option>
                        <option>France</option>
                        <option>Luxembourg</option>
                        <option>Pays-Bas</option>
                        <option>Suisse</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                  <div className="account-preferences">
                    <span className="field-label">Vos envies de voyage</span>
                    <div className="chip-row">
                      {['Parcs & attractions', 'Culture & patrimoine', 'Nature & aventure', 'City breaks', 'Séjours thématiques'].map(
                        (preference) => (
                          <button
                            key={preference}
                            type="button"
                            className={`chip${profile.preferences.includes(preference) ? ' is-active' : ''}`}
                            onClick={() => togglePreference(preference)}
                          >
                            {profile.preferences.includes(preference) && <Check />} {preference}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="account-card__actions">
                    <button type="submit" className="btn btn--dark">
                      Enregistrer mes informations <ArrowRight />
                    </button>
                  </div>
                </div>
              </form>

              <form className="account-card account-card--security" onSubmit={changePassword}>
                <div className="account-card__head">
                  <h2>Sécurité</h2>
                  <span>Dernière connexion récente</span>
                </div>
                <div className="form-row form-row--3">
                  <div className="field">
                    <label htmlFor="current-password">Mot de passe actuel</label>
                    <input
                      id="current-password"
                      type="password"
                      className="input"
                      value={passwordForm.current}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, current: event.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="new-password">Nouveau mot de passe</label>
                    <input
                      id="new-password"
                      type="password"
                      className="input"
                      value={passwordForm.next}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, next: event.target.value }))}
                      placeholder="6 caractères minimum"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="confirm-password">Confirmer</label>
                    <input
                      id="confirm-password"
                      type="password"
                      className="input"
                      value={passwordForm.confirm}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="account-card__actions">
                  <button type="submit" className="btn btn--outline">
                    <Settings2 /> Mettre à jour le mot de passe
                  </button>
                </div>
              </form>

              <div className="account-profile__note">
                <Sparkles />
                <p>
                  Vos préférences nous permettent de vous proposer les voyages qui vous ressemblent. Vous pouvez
                  aussi nous écrire directement à <a href="mailto:hello@faraway.be">hello@faraway.be</a>.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
