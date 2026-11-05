import { useMemo, useState } from 'react'
import {
  Building2,
  Check,
  Download,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import type { Supplier } from '../types'
import { formatPrice, supplierStatusMeta } from '../lib/utils'
import { downloadCsv } from './adminUtils'
import {
  AdminConfirm,
  AdminEmpty,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from './components'

const PAGE_SIZE = 8

const emptySupplier = (): Omit<Supplier, 'id'> => ({
  name: '',
  type: 'Parc à thème',
  contactName: '',
  email: '',
  phone: '',
  city: '',
  country: 'Belgique',
  rating: 4.8,
  since: String(new Date().getFullYear()),
  status: 'active',
  notes: '',
})

export default function AdminSuppliers() {
  const {
    suppliers,
    experiences,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    notify,
  } = useStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState<Omit<Supplier, 'id'>>(emptySupplier())
  const [confirmDelete, setConfirmDelete] = useState<Supplier | null>(null)

  const filtered = useMemo(() => {
    return suppliers.filter((supplier) => {
      if (status !== 'all' && supplier.status !== status) return false
      if (!search.trim()) return true
      const q = search.trim().toLowerCase()
      return `${supplier.name} ${supplier.contactName} ${supplier.city} ${supplier.country} ${supplier.type}`
        .toLowerCase()
        .includes(q)
    })
  }, [suppliers, search, status])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const linkedProducts = (supplierId: string) => experiences.filter((experiment) => experiment.supplierId === supplierId)
  const averageRating = suppliers.length ? suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / suppliers.length : 0
  const totalVolume = experiences.reduce((sum, experience) => sum + experience.price * 20, 0)

  const openCreate = () => {
    setEditing(null)
    setForm(emptySupplier())
    setModalOpen(true)
  }

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier)
    setForm({ ...supplier })
    setModalOpen(true)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.city.trim()) {
      notify('Renseignez au minimum le nom, l’e-mail et la ville du fournisseur.', 'error')
      return
    }
    if (editing) {
      updateSupplier(editing.id, form)
    } else {
      addSupplier(form)
    }
    setModalOpen(false)
  }

  const remove = () => {
    if (!confirmDelete) return
    const success = deleteSupplier(confirmDelete.id)
    if (success) setConfirmDelete(null)
    else setConfirmDelete(null)
  }

  const exportSuppliers = () => {
    downloadCsv(
      `faraway-fournisseurs-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((supplier) => ({
        Nom: supplier.name,
        Type: supplier.type,
        Contact: supplier.contactName,
        Email: supplier.email,
        Téléphone: supplier.phone,
        Ville: supplier.city,
        Pays: supplier.country,
        Note: supplier.rating,
        Partenaire: supplier.since,
        Statut: supplierStatusMeta[supplier.status].label,
        Expériences: linkedProducts(supplier.id).length,
      })),
    )
    notify('Répertoire fournisseurs exporté.')
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Relation client"
        title="Fournisseurs"
        description="Gérez vos partenaires, leurs contrats et les expériences associées."
        actions={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={exportSuppliers}>
              <Download /> Exporter
            </button>
            <button className="admin-btn admin-btn--primary" onClick={openCreate}>
              <Plus /> Ajouter un fournisseur
            </button>
          </>
        }
      />

      <div className="admin-mini-stats">
        <div>
          <span className="admin-mini-stat__icon"><Building2 /></span>
          <span>
            <small>Partenaires actifs</small>
            <strong>{suppliers.filter((supplier) => supplier.status === 'active').length}</strong>
          </span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><Star /></span>
          <span>
            <small>Note moyenne</small>
            <strong>{averageRating.toFixed(1)} / 5</strong>
          </span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><RotateCcw /></span>
          <span>
            <small>À renouveler</small>
            <strong>{suppliers.filter((supplier) => supplier.status === 'pending').length}</strong>
          </span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><Check /></span>
          <span>
            <small>Volume catalogue</small>
            <strong>{formatPrice(totalVolume)}</strong>
          </span>
        </div>
      </div>

      <div className="admin-toolbar">
        <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Nom, contact, ville…" />
        <div className="admin-toolbar__group">
          <select className="admin-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="pending">À renouveler</option>
            <option value="inactive">Inactifs</option>
          </select>
          {(search || status !== 'all') && (
            <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setSearch(''); setStatus('all') }}>
              <RotateCcw /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="admin-card admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--suppliers">
            <thead>
              <tr>
                <th>Fournisseur</th>
                <th>Contact</th>
                <th>Localisation</th>
                <th>Expériences</th>
                <th>Partenaire</th>
                <th>Note</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((supplier) => {
                const products = linkedProducts(supplier.id)
                return (
                  <tr key={supplier.id}>
                    <td>
                      <div className="admin-supplier-name">
                        <span className="admin-supplier-logo">{supplier.name.slice(0, 1)}</span>
                        <span>
                          <strong>{supplier.name}</strong>
                          <small>{supplier.type}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span>{supplier.contactName}</span>
                      <a className="admin-cell-sub" href={`mailto:${supplier.email}`}>{supplier.email}</a>
                    </td>
                    <td>
                      <span className="admin-cell-contact"><MapPin /> {supplier.city}</span>
                      <small className="admin-cell-sub">{supplier.country}</small>
                    </td>
                    <td>
                      <span className="admin-count-pill">{products.length}</span>
                    </td>
                    <td>{supplier.since}</td>
                    <td>
                      <span className="admin-rating"><Star /> {supplier.rating.toFixed(1)}</span>
                    </td>
                    <td>
                      <span className={`status ${supplierStatusMeta[supplier.status].className}`}>{supplierStatusMeta[supplier.status].label}</span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button onClick={() => openEdit(supplier)} title="Modifier" aria-label="Modifier">
                          <Pencil />
                        </button>
                        <button className="is-danger" onClick={() => setConfirmDelete(supplier)} title="Supprimer" aria-label="Supprimer">
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
          <AdminEmpty title="Aucun fournisseur trouvé" description="Ajoutez un partenaire ou ajustez vos filtres." />
        )}
        {filtered.length > 0 && (
          <AdminPagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} />
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        subtitle={editing ? editing.name : 'Ajoutez un partenaire à votre réseau.'}
        size="lg"
        footer={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="admin-btn admin-btn--primary" onClick={submit}>
              {editing ? 'Enregistrer' : 'Créer le fournisseur'} <Check />
            </button>
          </>
        }
      >
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <div className="admin-field admin-field--full">
              <label>Nom du fournisseur *</label>
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Europa-Park" />
            </div>
            <div className="admin-field">
              <label>Type</label>
              <input value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} placeholder="Parc à thème" />
            </div>
            <div className="admin-field">
              <label>Partenaire depuis</label>
              <input value={form.since} onChange={(event) => setForm((prev) => ({ ...prev, since: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Contact</label>
              <input value={form.contactName} onChange={(event) => setForm((prev) => ({ ...prev, contactName: event.target.value }))} placeholder="Nom du contact" />
            </div>
            <div className="admin-field">
              <label>E-mail</label>
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
              <label>Note</label>
              <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => setForm((prev) => ({ ...prev, rating: Number(event.target.value) }))} />
            </div>
            <div className="admin-field">
              <label>Statut</label>
              <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as Supplier['status'] }))}>
                <option value="active">Actif</option>
                <option value="pending">À renouveler</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div className="admin-field admin-field--full">
              <label>Notes internes</label>
              <textarea rows={3} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Conditions, remarques, historique…" />
            </div>
          </div>
        </form>
      </AdminModal>

      <AdminConfirm
        open={Boolean(confirmDelete)}
        title="Supprimer ce fournisseur ?"
        message={`Le fournisseur ${confirmDelete?.name ?? ''} ne peut être supprimé que s’il n’est lié à aucune expérience.`}
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={remove}
      />
    </div>
  )
}
