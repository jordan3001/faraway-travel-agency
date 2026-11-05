import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  RotateCcw,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Booking, BookingStatus } from '../types'
import {
  bookingStatusMeta,
  defaultTravelDate,
  formatDateLong,
  formatDateShort,
  formatPrice,
  paymentStatusLabel,
  toDateInput,
} from '../lib/utils'
import { downloadCsv } from './adminUtils'
import {
  AdminConfirm,
  AdminDrawer,
  AdminEmpty,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from './components'

const PAGE_SIZE = 9

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'completed', label: 'Terminées' },
  { value: 'cancelled', label: 'Annulées' },
]

export default function AdminBookings() {
  const {
    bookings,
    experiences,
    clients,
    createBooking,
    updateBooking,
    setBookingStatus,
    notify,
  } = useStore()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [internalNote, setInternalNote] = useState('')
  const [newBooking, setNewBooking] = useState({
    clientId: '',
    experienceId: '',
    date: defaultTravelDate(3),
    adults: 2,
    children: 0,
    status: 'confirmed' as BookingStatus,
    notes: '',
  })

  const selected = bookings.find((booking) => booking.id === selectedId) ?? null

  useEffect(() => {
    if (params.get('new') === '1') {
      setNewOpen(true)
      setParams({}, { replace: true })
    }
    const bookingId = params.get('booking')
    if (bookingId && bookings.some((booking) => booking.id === bookingId)) {
      setSelectedId(bookingId)
      setParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, bookings])

  useEffect(() => {
    if (selected) setInternalNote(selected.internalNotes)
  }, [selected])

  useEffect(() => {
    setPage(1)
  }, [search, status])

  const filtered = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((booking) => {
        if (status !== 'all' && booking.status !== status) return false
        if (!search.trim()) return true
        const client = clients.find((item) => item.id === booking.clientId)
        const experience = experiences.find((item) => item.id === booking.experienceId)
        const q = search.trim().toLowerCase()
        return `${booking.reference} ${client?.firstName} ${client?.lastName} ${client?.email} ${experience?.title}`
          .toLowerCase()
          .includes(q)
      })
  }, [bookings, clients, experiences, search, status])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const counts = {
    all: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
    completed: bookings.filter((booking) => booking.status === 'completed').length,
    cancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
  }

  const openBooking = (booking: Booking) => {
    setSelectedId(booking.id)
  }

  const saveNote = () => {
    if (!selected) return
    updateBooking(selected.id, { internalNotes: internalNote })
  }

  const exportBookings = () => {
    downloadCsv(
      `faraway-reservations-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((booking) => {
        const client = clients.find((item) => item.id === booking.clientId)
        const experience = experiences.find((item) => item.id === booking.experienceId)
        return {
          Reference: booking.reference,
          Client: client ? `${client.firstName} ${client.lastName}` : '',
          Email: client?.email ?? '',
          Experience: experience?.title ?? '',
          'Date de départ': formatDateShort(booking.date),
          Adultes: booking.adults,
          Enfants: booking.children,
          Montant: booking.total,
          Statut: bookingStatusMeta[booking.status].label,
          Paiement: paymentStatusLabel[booking.paymentStatus],
          Canal: booking.channel,
        }
      }),
    )
    notify('Réservations exportées.')
  }

  const submitNew = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newBooking.clientId || !newBooking.experienceId || !newBooking.date) {
      notify('Sélectionnez un client, une expérience et une date.', 'error')
      return
    }
    const experience = experiences.find((item) => item.id === newBooking.experienceId)
    if (!experience) return
    const total =
      experience.price * newBooking.adults +
      experience.childPrice * newBooking.children +
      9.5
    createBooking({
      clientId: newBooking.clientId,
      experienceId: newBooking.experienceId,
      date: newBooking.date,
      adults: newBooking.adults,
      children: newBooking.children,
      options: [],
      total,
      status: newBooking.status,
      paymentStatus: newBooking.status === 'pending' ? 'deposit' : 'paid',
      channel: 'agence',
      notes: newBooking.notes,
    })
    notify('Réservation créée.')
    setNewOpen(false)
    setNewBooking({
      clientId: '',
      experienceId: '',
      date: defaultTravelDate(3),
      adults: 2,
      children: 0,
      status: 'confirmed',
      notes: '',
    })
  }

  const updateStatus = (booking: Booking, next: BookingStatus) => {
    if (next === 'cancelled') {
      setCancelOpen(true)
      return
    }
    setBookingStatus(booking.id, next)
  }

  const client = selected ? clients.find((item) => item.id === selected.clientId) : undefined
  const experience = selected ? experiences.find((item) => item.id === selected.experienceId) : undefined
  const selectedOptions = selected && experience ? experience.options.filter((option) => selected.options.includes(option.id)) : []

  return (
    <div>
      <AdminPageHeader
        eyebrow="Pilotage"
        title="Réservations"
        description="Suivez chaque départ, de la demande à la confirmation."
        actions={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={exportBookings}>
              <Download /> Exporter
            </button>
            <button className="admin-btn admin-btn--primary" onClick={() => setNewOpen(true)}>
              <Plus /> Nouvelle réservation
            </button>
          </>
        }
      />

      <div className="admin-toolbar">
        <AdminSearch value={search} onChange={setSearch} placeholder="Référence, client, expérience…" />
        <div className="admin-toolbar__group">
          <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
          {(search || status !== 'all') && (
            <button
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => {
                setSearch('')
                setStatus('all')
              }}
            >
              <RotateCcw /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="admin-status-tabs">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            className={status === filter.value ? 'is-active' : ''}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
            <span>{counts[filter.value as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      <div className="admin-card admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--bookings">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Expérience</th>
                <th>Départ</th>
                <th>Voyageurs</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Canal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paginated.map((booking) => {
                const bookingClient = clients.find((item) => item.id === booking.clientId)
                const bookingExperience = experiences.find((item) => item.id === booking.experienceId)
                return (
                  <tr key={booking.id} onClick={() => openBooking(booking)} className="is-clickable">
                    <td>
                      <span className="admin-ref">{booking.reference}</span>
                      <small className="admin-cell-sub">{formatDateShort(booking.createdAt)}</small>
                    </td>
                    <td>
                      <div className="admin-client-cell">
                        <span className="admin-mini-avatar">
                          {bookingClient?.firstName[0]}
                          {bookingClient?.lastName[0]}
                        </span>
                        <span>
                          <strong>{bookingClient?.firstName} {bookingClient?.lastName}</strong>
                          <small>{bookingClient?.email}</small>
                        </span>
                      </div>
                    </td>
                    <td className="admin-table__truncate">{bookingExperience?.title}</td>
                    <td>{formatDateShort(booking.date)}</td>
                    <td>
                      <span className="admin-travellers">
                        <Users /> {booking.adults + booking.children}
                      </span>
                    </td>
                    <td><strong>{formatPrice(booking.total)}</strong></td>
                    <td><span className={`status ${bookingStatusMeta[booking.status].className}`}>{bookingStatusMeta[booking.status].label}</span></td>
                    <td><span className={`admin-pay ${booking.paymentStatus}`}>{paymentStatusLabel[booking.paymentStatus]}</span></td>
                    <td><span className="admin-channel">{booking.channel}</span></td>
                    <td>
                      <button className="admin-row-arrow" aria-label="Voir la réservation">
                        <ArrowUpRight />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <AdminEmpty
            title="Aucune réservation trouvée"
            description="Ajustez vos filtres ou créez une réservation manuellement pour un client."
          />
        )}
        {filtered.length > 0 && (
          <AdminPagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} />
        )}
      </div>

      <AdminDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.reference ?? 'Réservation'}
        subtitle={selected ? `Créée le ${formatDateLong(selected.createdAt)}` : undefined}
        footer={
          selected && (
            <>
              <button className="admin-btn admin-btn--ghost" onClick={() => setSelectedId(null)}>
                Fermer
              </button>
              {selected.status !== 'cancelled' && (
                <button className="admin-btn admin-btn--danger" onClick={() => setCancelOpen(true)}>
                  Annuler la réservation
                </button>
              )}
            </>
          )
        }
      >
        {selected && experience && client && (
          <div className="admin-booking-detail">
            <div className="admin-booking-detail__status">
              <span className={`status ${bookingStatusMeta[selected.status].className}`}>{bookingStatusMeta[selected.status].label}</span>
              <span className={`admin-pay ${selected.paymentStatus}`}>{paymentStatusLabel[selected.paymentStatus]}</span>
              {selected.promoCode && <span className="admin-promo-tag">{selected.promoCode}</span>}
            </div>

            <div className="admin-detail-experience">
              <img src={experience.image} alt="" />
              <div>
                <span className="admin-eyebrow">Expérience</span>
                <h3>{experience.title}</h3>
                <p><MapPin /> {experience.destination}, {experience.country} · {experience.duration}</p>
              </div>
            </div>

            <div className="admin-detail-grid">
              <div>
                <span>Date de départ</span>
                <strong>{formatDateLong(`${selected.date.slice(0, 10)}T12:00:00`)}</strong>
              </div>
              <div>
                <span>Voyageurs</span>
                <strong>
                  {selected.adults} adulte{selected.adults > 1 ? 's' : ''}
                  {selected.children > 0 ? ` · ${selected.children} enfant${selected.children > 1 ? 's' : ''}` : ''}
                </strong>
              </div>
              <div>
                <span>Montant total</span>
                <strong>{formatPrice(selected.total, true)}</strong>
              </div>
              <div>
                <span>Canal</span>
                <strong style={{ textTransform: 'capitalize' }}>{selected.channel}</strong>
              </div>
            </div>

            <div className="admin-detail-block">
              <div className="admin-detail-block__head">
                <span>Client</span>
                <button className="admin-text-link" onClick={() => notify('La fiche client s’ouvre depuis le menu Clients.', 'info')}>
                  Voir la fiche <ArrowUpRight />
                </button>
              </div>
              <div className="admin-detail-client">
                <span className="admin-mini-avatar admin-mini-avatar--lg">{client.firstName[0]}{client.lastName[0]}</span>
                <div>
                  <strong>{client.firstName} {client.lastName}</strong>
                  <small>{client.tier} · {client.loyaltyPoints.toLocaleString('fr-BE')} points</small>
                </div>
                <span className="admin-detail-client__contact">
                  <a href={`mailto:${client.email}`}><Mail /> {client.email}</a>
                  <a href={`tel:${client.phone.replace(/\s/g, '')}`}><Phone /> {client.phone}</a>
                </span>
              </div>
            </div>

            {selectedOptions.length > 0 && (
              <div className="admin-detail-block">
                <div className="admin-detail-block__head"><span>Options</span></div>
                {selectedOptions.map((option) => (
                  <div key={option.id} className="admin-detail-option">
                    <span><CheckCircle2 /> {option.name}</span>
                    <span>{formatPrice(option.price, true)}</span>
                  </div>
                ))}
              </div>
            )}

            {selected.notes && (
              <div className="admin-detail-block">
                <div className="admin-detail-block__head"><span>Demande du client</span></div>
                <p className="admin-detail-note">{selected.notes}</p>
              </div>
            )}

            <div className="admin-detail-block">
              <div className="admin-detail-block__head">
                <span>Note interne</span>
                <span className="admin-muted">Visible uniquement par l’équipe</span>
              </div>
              <textarea
                className="admin-textarea"
                rows={3}
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Ajouter une note de suivi…"
              />
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={saveNote}>
                <PencilLine /> Enregistrer la note
              </button>
            </div>

            <div className="admin-detail-block">
              <div className="admin-detail-block__head"><span>Changer le statut</span></div>
              <div className="admin-status-actions">
                <button
                  className={`admin-status-action${selected.status === 'pending' ? ' is-active' : ''}`}
                  onClick={() => updateStatus(selected, 'pending')}
                >
                  <CalendarDays /> En attente
                </button>
                <button
                  className={`admin-status-action${selected.status === 'confirmed' ? ' is-active' : ''}`}
                  onClick={() => updateStatus(selected, 'confirmed')}
                >
                  <Check /> Confirmer
                </button>
                <button
                  className={`admin-status-action${selected.status === 'completed' ? ' is-active' : ''}`}
                  onClick={() => updateStatus(selected, 'completed')}
                >
                  <CheckCircle2 /> Terminer
                </button>
                <button
                  className={`admin-status-action admin-status-action--danger${selected.status === 'cancelled' ? ' is-active' : ''}`}
                  onClick={() => updateStatus(selected, 'cancelled')}
                >
                  <XCircle /> Annuler
                </button>
              </div>
            </div>

            <div className="admin-detail-actions">
              <a href={`mailto:${client.email}`} className="admin-btn admin-btn--ghost">
                <Mail /> Envoyer un e-mail
              </a>
              <button className="admin-btn admin-btn--ghost" onClick={() => notify('Le récapitulatif PDF serait généré ici.', 'info')}>
                <ArrowDownToLine /> Télécharger le récapitulatif
              </button>
            </div>
          </div>
        )}
      </AdminDrawer>

      <AdminModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="Nouvelle réservation"
        subtitle="Créez une réservation pour un client existant."
        size="lg"
        footer={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={() => setNewOpen(false)}>Annuler</button>
            <button className="admin-btn admin-btn--primary" onClick={submitNew}>
              <Ticket /> Créer la réservation
            </button>
          </>
        }
      >
        <form className="admin-form" onSubmit={submitNew}>
          <div className="admin-form-grid">
            <div className="admin-field admin-field--full">
              <label>Client</label>
              <select value={newBooking.clientId} onChange={(event) => setNewBooking((prev) => ({ ...prev, clientId: event.target.value }))}>
                <option value="">Sélectionner un client</option>
                {clients.map((item) => (
                  <option key={item.id} value={item.id}>{item.firstName} {item.lastName} — {item.email}</option>
                ))}
              </select>
            </div>
            <div className="admin-field admin-field--full">
              <label>Expérience</label>
              <select value={newBooking.experienceId} onChange={(event) => setNewBooking((prev) => ({ ...prev, experienceId: event.target.value }))}>
                <option value="">Sélectionner une expérience</option>
                {experiences.filter((exp) => exp.status === 'active').map((exp) => (
                  <option key={exp.id} value={exp.id}>{exp.title}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Date de départ</label>
              <input type="date" min={toDateInput(new Date())} value={newBooking.date} onChange={(event) => setNewBooking((prev) => ({ ...prev, date: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Statut</label>
              <select value={newBooking.status} onChange={(event) => setNewBooking((prev) => ({ ...prev, status: event.target.value as BookingStatus }))}>
                <option value="confirmed">Confirmée</option>
                <option value="pending">En attente</option>
                <option value="completed">Terminée</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Adultes</label>
              <input type="number" min="1" max="10" value={newBooking.adults} onChange={(event) => setNewBooking((prev) => ({ ...prev, adults: Number(event.target.value) }))} />
            </div>
            <div className="admin-field">
              <label>Enfants</label>
              <input type="number" min="0" max="10" value={newBooking.children} onChange={(event) => setNewBooking((prev) => ({ ...prev, children: Number(event.target.value) }))} />
            </div>
            <div className="admin-field admin-field--full">
              <label>Note de la réservation</label>
              <textarea rows={2} value={newBooking.notes} onChange={(event) => setNewBooking((prev) => ({ ...prev, notes: event.target.value }))} />
            </div>
          </div>
          {newBooking.experienceId && (
            <div className="admin-booking-estimate">
              <span>Estimation</span>
              <strong>
                {formatPrice(
                  (experiences.find((exp) => exp.id === newBooking.experienceId)?.price ?? 0) * newBooking.adults +
                    (experiences.find((exp) => exp.id === newBooking.experienceId)?.childPrice ?? 0) * newBooking.children +
                    9.5,
                  true,
                )}
              </strong>
            </div>
          )}
        </form>
      </AdminModal>

      <AdminConfirm
        open={cancelOpen}
        title="Annuler cette réservation ?"
        message={`La réservation ${selected?.reference ?? ''} sera annulée et le client sera remboursé. Cette action est définitive.`}
        confirmLabel="Annuler la réservation"
        danger
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => {
          if (selected) {
            setBookingStatus(selected.id, 'cancelled')
            setCancelOpen(false)
          }
        }}
      />
    </div>
  )
}
