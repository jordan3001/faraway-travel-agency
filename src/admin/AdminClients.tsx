import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Download,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Client, ClientTier } from '../types'
import { bookingStatusMeta, clientStatusMeta, formatPrice } from '../lib/utils'
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

const PAGE_SIZE = 8

const tiers: ClientTier[] = ['Membre', 'Privilège', 'Signature']

const emptyForm = (): Omit<Client, 'id'> => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  country: 'Belgique',
  memberSince: new Intl.DateTimeFormat('fr-BE', { month: 'long', year: 'numeric' }).format(new Date()),
  loyaltyPoints: 100,
  tier: 'Membre',
  preferences: [],
  notes: 'Compte créé depuis le back-office.',
  status: 'active',
})

export default function AdminClients() {
  const { clients, bookings, experiences, addClient, updateClient, deleteClient, notify } = useStore()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<Omit<Client, 'id'>>(emptyForm())
  const [preferencesInput, setPreferencesInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null)
  const [note, setNote] = useState('')

  const selected = clients.find((client) => client.id === selectedId) ?? null

  useEffect(() => {
    const clientId = params.get('client')
    if (clientId && clients.some((client) => client.id === clientId)) {
      setSelectedId(clientId)
      setParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, clients])

  useEffect(() => {
    if (selected) setNote(selected.notes)
  }, [selected])

  useEffect(() => {
    setPage(1)
  }, [search, tier, status])

  const clientStats = useMemo(() => {
    const map = new Map<string, { count: number; spent: number; last?: string }>()
    bookings.forEach((booking) => {
      const current = map.get(booking.clientId) ?? { count: 0, spent: 0 }
      if (booking.status !== 'cancelled') {
        current.count += 1
        current.spent += booking.total
        if (!current.last || new Date(booking.date).getTime() > new Date(current.last).getTime()) {
          current.last = booking.date
        }
      }
      map.set(booking.clientId, current)
    })
    return map
  }, [bookings])

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      if (tier !== 'all' && client.tier !== tier) return false
      if (status !== 'all' && client.status !== status) return false
      if (!search.trim()) return true
      const q = search.trim().toLowerCase()
      return `${client.firstName} ${client.lastName} ${client.email} ${client.city}`.toLowerCase().includes(q)
    })
  }, [clients, search, tier, status])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setPreferencesInput('')
    setModalOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setForm({ ...client })
    setPreferencesInput(client.preferences.join(', '))
    setModalOpen(true)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      notify('Renseignez un prénom, un nom et un e-mail valides.', 'error')
      return
    }
    const payload = {
      ...form,
      preferences: preferencesInput.split(',').map((item) => item.trim()).filter(Boolean),
    }
    if (editing) {
      updateClient(editing.id, payload)
    } else {
      addClient(payload)
    }
    setModalOpen(false)
  }

  const saveNote = () => {
    if (!selected) return
    updateClient(selected.id, { notes: note })
  }

  const confirmRemove = () => {
    if (!confirmDelete) return
    const removed = deleteClient(confirmDelete.id)
    if (removed) setSelectedId(null)
    setConfirmDelete(null)
  }

  const exportClients = () => {
    downloadCsv(
      `faraway-clients-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((client) => {
        const stats = clientStats.get(client.id)
        return {
          Prénom: client.firstName,
          Nom: client.lastName,
          Email: client.email,
          Téléphone: client.phone,
          Ville: client.city,
          Cercle: client.tier,
          Points: client.loyaltyPoints,
          Réservations: stats?.count ?? 0,
          Dépenses: stats?.spent ?? 0,
          Membre: client.memberSince,
        }
      }),
    )
    notify('Base clients exportée.')
  }

  const selectedStats = selected ? clientStats.get(selected.id) : null
  const selectedBookings = selected
    ? bookings
        .filter((booking) => booking.clientId === selected.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []

  return (
    <div>
      <AdminPageHeader
        eyebrow="Relation client"
        title="Clients"
        description={`${clients.length} voyageurs dans votre base · ${clients.filter((client) => client.status === 'vip').length} membres VIP`}
        actions={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={exportClients}>
              <Download /> Exporter
            </button>
            <button className="admin-btn admin-btn--primary" onClick={openCreate}>
              <Plus /> Ajouter un client
            </button>
          </>
        }
      />

      <div className="admin-toolbar">
        <AdminSearch value={search} onChange={setSearch} placeholder="Nom, e-mail, ville…" />
        <div className="admin-toolbar__group">
          <select className="admin-select" value={tier} onChange={(event) => setTier(event.target.value)}>
            <option value="all">Tous les cercles</option>
            {tiers.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="vip">VIP</option>
            <option value="inactive">Inactifs</option>
          </select>
          {(search || tier !== 'all' || status !== 'all') && (
            <button
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => {
                setSearch('')
                setTier('all')
                setStatus('all')
              }}
            >
              <RotateCcw /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="admin-card admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--clients">
            <thead>
              <tr>
                <th>Client</th>
                <th>Coordonnées</th>
                <th>Ville</th>
                <th>Membre depuis</th>
                <th>Voyages</th>
                <th>Dépenses</th>
                <th>Cercle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((client) => {
                const stats = clientStats.get(client.id)
                return (
                  <tr key={client.id} onClick={() => setSelectedId(client.id)} className="is-clickable">
                    <td>
                      <div className="admin-client-cell">
                        <span className="admin-mini-avatar admin-mini-avatar--soft">
                          {client.firstName[0]}{client.lastName[0]}
                        </span>
                        <span>
                          <strong>{client.firstName} {client.lastName}</strong>
                          <small>{client.tier} · {client.loyaltyPoints.toLocaleString('fr-BE')} pts</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-cell-contact">{client.email}</span>
                      <small className="admin-cell-sub">{client.phone}</small>
                    </td>
                    <td>{client.city}</td>
                    <td>{client.memberSince}</td>
                    <td><strong>{stats?.count ?? 0}</strong></td>
                    <td><strong>{formatPrice(stats?.spent ?? 0)}</strong></td>
                    <td><span className={`admin-tier admin-tier--${client.tier.toLowerCase().replace('è', 'e')}`}>{client.tier}</span></td>
                    <td><span className={`status ${clientStatusMeta[client.status].className}`}>{clientStatusMeta[client.status].label}</span></td>
                    <td>
                      <div className="admin-row-actions" onClick={(event) => event.stopPropagation()}>
                        <button onClick={() => openEdit(client)} title="Modifier" aria-label="Modifier">
                          <Pencil />
                        </button>
                        <button className="is-danger" onClick={() => setConfirmDelete(client)} title="Supprimer" aria-label="Supprimer">
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <AdminEmpty title="Aucun client trouvé" description="Essayez un autre nom ou créez un nouveau client." />
        )}
        {filtered.length > 0 && (
          <AdminPagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} />
        )}
      </div>

      <AdminDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.firstName} ${selected.lastName}` : 'Client'}
        subtitle={selected ? `Membre depuis ${selected.memberSince}` : undefined}
        footer={
          selected && (
            <>
              <button className="admin-btn admin-btn--ghost" onClick={() => setSelectedId(null)}>Fermer</button>
              <button className="admin-btn admin-btn--primary" onClick={() => openEdit(selected)}>
                <Pencil /> Modifier la fiche
              </button>
            </>
          )
        }
      >
        {selected && (
          <div className="admin-client-detail">
            <div className="admin-client-hero">
              <span className="admin-client-hero__avatar">{selected.firstName[0]}{selected.lastName[0]}</span>
              <div>
                <span className={`admin-tier admin-tier--${selected.tier.toLowerCase().replace('è', 'e')}`}>{selected.tier}</span>
                <span className={`status ${clientStatusMeta[selected.status].className}`}>{clientStatusMeta[selected.status].label}</span>
              </div>
              <p><MapPin /> {selected.city}, {selected.country}</p>
              <div className="admin-client-hero__contact">
                <a href={`mailto:${selected.email}`}><Mail /> {selected.email}</a>
                <a href={`tel:${selected.phone.replace(/\s/g, '')}`}><Phone /> {selected.phone}</a>
              </div>
            </div>

            <div className="admin-client-metrics">
              <div><span>Voyages</span><strong>{selectedStats?.count ?? 0}</strong></div>
              <div><span>Dépenses</span><strong>{formatPrice(selectedStats?.spent ?? 0)}</strong></div>
              <div><span>Points</span><strong>{selected.loyaltyPoints.toLocaleString('fr-BE')}</strong></div>
            </div>

            <div className="admin-detail-block">
              <div className="admin-detail-block__head"><span>Préférences</span></div>
              <div className="admin-preference-tags">
                {selected.preferences.length > 0 ? (
                  selected.preferences.map((preference) => <span key={preference}>{preference}</span>)
                ) : (
                  <span className="admin-muted">Aucune préférence renseignée.</span>
                )}
              </div>
            </div>

            <div className="admin-detail-block">
              <div className="admin-detail-block__head">
                <span>Note interne</span>
                <button className="admin-text-link" onClick={saveNote}>
                  Enregistrer
                </button>
              </div>
              <textarea className="admin-textarea" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
            </div>

            <div className="admin-detail-block">
              <div className="admin-detail-block__head">
                <span>Historique des réservations</span>
                <span>{selectedBookings.length}</span>
              </div>
              <div className="admin-client-bookings">
                {selectedBookings.length === 0 && <p className="admin-muted">Aucune réservation pour ce client.</p>}
                {selectedBookings.slice(0, 5).map((booking) => {
                  const experience = experiences.find((item) => item.id === booking.experienceId)
                  return (
                    <button key={booking.id} onClick={() => navigate(`/admin/reservations?booking=${booking.id}`)}>
                      <span className="admin-client-booking__date">
                        <strong>{new Date(booking.date).getDate()}</strong>
                        <small>{new Intl.DateTimeFormat('fr-BE', { month: 'short' }).format(new Date(booking.date)).replace('.', '')}</small>
                      </span>
                      <span>
                        <strong>{experience?.title}</strong>
                        <small>{booking.reference} · {formatPrice(booking.total)}</small>
                      </span>
                      <span className={`status ${bookingStatusMeta[booking.status].className}`}>{bookingStatusMeta[booking.status].label}</span>
                    </button>
                  )
                })}
                {selectedBookings.length > 0 && (
                  <button className="admin-client-bookings__all" onClick={() => navigate('/admin/reservations')}>
                    Voir toutes les réservations <ArrowUpRight />
                  </button>
                )}
              </div>
            </div>

            <div className="admin-detail-actions">
              <a href={`mailto:${selected.email}`} className="admin-btn admin-btn--ghost">
                <Mail /> Envoyer un e-mail
              </a>
              <button className="admin-btn admin-btn--ghost" onClick={() => notify('La newsletter serait programmée pour ce client.', 'info')}>
                <Sparkles /> Inviter à la newsletter
              </button>
            </div>
          </div>
        )}
      </AdminDrawer>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier la fiche client' : 'Nouveau client'}
        subtitle={editing ? editing.email : 'Ajoutez un voyageur à votre base.'}
        size="lg"
        footer={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="admin-btn admin-btn--primary" onClick={submit}>
              {editing ? 'Enregistrer' : 'Créer le client'} <CheckIcon />
            </button>
          </>
        }
      >
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Prénom *</label>
              <input value={form.firstName} onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Nom *</label>
              <input value={form.lastName} onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>E-mail *</label>
              <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Téléphone</label>
              <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Ville</label>
              <input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Pays</label>
              <input value={form.country} onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Cercle</label>
              <select value={form.tier} onChange={(event) => setForm((prev) => ({ ...prev, tier: event.target.value as ClientTier }))}>
                {tiers.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Statut</label>
              <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as Client['status'] }))}>
                <option value="active">Actif</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Points fidélité</label>
              <input type="number" min="0" value={form.loyaltyPoints} onChange={(event) => setForm((prev) => ({ ...prev, loyaltyPoints: Number(event.target.value) }))} />
            </div>
            <div className="admin-field">
              <label>Membre depuis</label>
              <input value={form.memberSince} onChange={(event) => setForm((prev) => ({ ...prev, memberSince: event.target.value }))} />
            </div>
            <div className="admin-field admin-field--full">
              <label>Préférences <small>séparées par des virgules</small></label>
              <input value={preferencesInput} onChange={(event) => setPreferencesInput(event.target.value)} placeholder="Parcs, Culture, Famille" />
            </div>
            <div className="admin-field admin-field--full">
              <label>Note interne</label>
              <textarea rows={3} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </div>
          </div>
        </form>
      </AdminModal>

      <AdminConfirm
        open={Boolean(confirmDelete)}
        title="Supprimer ce client ?"
        message={`La fiche de ${confirmDelete?.firstName} ${confirmDelete?.lastName} sera définitivement supprimée. Les clients ayant des réservations ne peuvent pas être supprimés.`}
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmRemove}
      />
    </div>
  )
}

function CheckIcon() {
  return <span aria-hidden="true">✓</span>
}
