import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  Download,
  Eye,
  Image as ImageIcon,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { categories, imageLibrary } from '../data/data'
import type { Category, Experience, ExperienceStatus } from '../types'
import { experienceStatusMeta, formatPrice } from '../lib/utils'
import { downloadCsv } from './adminUtils'
import {
  AdminConfirm,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
  AdminEmpty,
} from './components'

const PAGE_SIZE = 8

interface ProductForm {
  title: string
  category: Category
  destination: string
  country: string
  duration: string
  price: string
  childPrice: string
  cost: string
  stock: string
  cutoffDays: string
  supplierId: string
  status: ExperienceStatus
  badge: string
  featured: boolean
  image: string
  shortDescription: string
  description: string
  highlights: string
  included: string
  excluded: string
}

const defaultForm = (supplierId: string): ProductForm => ({
  title: '',
  category: 'Parcs & attractions',
  destination: '',
  country: 'Belgique',
  duration: '2 jours / 1 nuit',
  price: '199',
  childPrice: '149',
  cost: '140',
  stock: '20',
  cutoffDays: '5',
  supplierId,
  status: 'draft',
  badge: '',
  featured: false,
  image: '/images/disney-castle.jpg',
  shortDescription: '',
  description: '',
  highlights: '',
  included: '',
  excluded: '',
})

export default function AdminProducts() {
  const {
    experiences,
    suppliers,
    bookings,
    addExperience,
    updateExperience,
    deleteExperience,
    duplicateExperience,
    notify,
  } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Experience | null>(null)
  const [form, setForm] = useState<ProductForm>(defaultForm(''))
  const [confirmDelete, setConfirmDelete] = useState<Experience | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm(suppliers[0]?.id ?? ''))
    setModalOpen(true)
  }

  const openEdit = (experience: Experience) => {
    setEditing(experience)
    setForm({
      title: experience.title,
      category: experience.category,
      destination: experience.destination,
      country: experience.country,
      duration: experience.duration,
      price: String(experience.price),
      childPrice: String(experience.childPrice),
      cost: String(experience.cost),
      stock: String(experience.stock),
      cutoffDays: String(experience.cutoffDays),
      supplierId: experience.supplierId,
      status: experience.status,
      badge: experience.badge ?? '',
      featured: experience.featured,
      image: experience.image,
      shortDescription: experience.shortDescription,
      description: experience.description.join('\n\n'),
      highlights: experience.highlights.join('\n'),
      included: experience.included.join('\n'),
      excluded: experience.excluded.join('\n'),
    })
    setModalOpen(true)
  }

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openCreate()
      setSearchParams({}, { replace: true })
    }
    const editId = searchParams.get('edit')
    if (editId) {
      const experience = experiences.find((item) => item.id === editId)
      if (experience) openEdit(experience)
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, experiences])

  useEffect(() => {
    setPage(1)
  }, [search, category, status])

  const filtered = useMemo(() => {
    return experiences.filter((experience) => {
      if (category !== 'all' && experience.category !== category) return false
      if (status !== 'all' && experience.status !== status) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        return `${experience.title} ${experience.destination} ${experience.country} ${experience.category}`
          .toLowerCase()
          .includes(q)
      }
      return true
    })
  }, [experiences, search, category, status])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const update = (key: keyof ProductForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const supplierName = (supplierId: string) => suppliers.find((supplier) => supplier.id === supplierId)?.name ?? '—'

  const buildPayload = (): Omit<Experience, 'id' | 'createdAt' | 'slug'> => {
    const existing = editing
    const highlights = form.highlights
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const included = form.included
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const excluded = form.excluded
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const paragraphs = form.description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const gallery = existing?.gallery?.length
      ? [form.image, ...existing.gallery.filter((image) => image !== form.image)].slice(0, 4)
      : [form.image, '/images/family-travel.jpg', '/images/theater.jpg']

    return {
      title: form.title.trim(),
      eyebrow: `${form.duration} · ${form.country}`,
      destination: form.destination.trim(),
      country: form.country.trim(),
      category: form.category,
      duration: form.duration.trim(),
      price: Math.max(0, Number(form.price) || 0),
      childPrice: Math.max(0, Number(form.childPrice) || 0),
      cost: Math.max(0, Number(form.cost) || 0),
      rating: existing?.rating ?? 4.8,
      reviewCount: existing?.reviewCount ?? 0,
      image: form.image,
      gallery,
      shortDescription: form.shortDescription.trim() || 'Une nouvelle expérience Faraway à découvrir.',
      description: paragraphs.length
        ? paragraphs
        : [form.shortDescription.trim() || 'Une nouvelle expérience Faraway, pensée pour vous faire vivre un moment inoubliable.'],
      highlights: highlights.length ? highlights : ['Une expérience sélectionnée par Faraway', 'Accompagnement avant le départ'],
      included: included.length ? included : ['Accompagnement Faraway'],
      excluded: excluded.length ? excluded : ['Dépenses personnelles'],
      itinerary: existing?.itinerary ?? [
        {
          day: 1,
          title: 'Votre arrivée',
          description: 'Accueil et installation. Votre conseiller Faraway vous accompagne pour les premiers pas de cette expérience.',
        },
        {
          day: 2,
          title: 'Au rythme de votre voyage',
          description: 'Profitez de votre expérience à votre rythme, avec les recommandations de notre équipe.',
        },
      ],
      practical: existing?.practical ?? {
        departure: 'À confirmer avec votre conseiller',
        languages: 'Français, anglais',
        groupSize: '2 à 8 voyageurs',
        cancellation: 'Conditions d’annulation à confirmer',
        accessibility: 'Informations sur demande',
      },
      options: existing?.options ?? [],
      supplierId: form.supplierId,
      status: form.status,
      featured: form.featured,
      badge: form.badge.trim() || undefined,
      stock: Math.max(0, Number(form.stock) || 0),
      cutoffDays: Math.max(0, Number(form.cutoffDays) || 0),
    }
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.destination.trim() || Number(form.price) <= 0) {
      notify('Renseignez au minimum le titre, la destination et un tarif valide.', 'error')
      return
    }
    if (!form.supplierId) {
      notify('Sélectionnez un fournisseur.', 'error')
      return
    }
    if (editing) {
      updateExperience(editing.id, { ...buildPayload(), slug: editing.slug })
    } else {
      addExperience(buildPayload())
    }
    setModalOpen(false)
  }

  const confirmDeletion = () => {
    if (!confirmDelete) return
    const linked = bookings.filter((booking) => booking.experienceId === confirmDelete.id)
    if (linked.length > 0) {
      notify(`Cette expérience est liée à ${linked.length} réservation(s). Archivez-la en brouillon plutôt que de la supprimer.`, 'error')
      setConfirmDelete(null)
      return
    }
    deleteExperience(confirmDelete.id)
    setConfirmDelete(null)
  }

  const exportProducts = () => {
    downloadCsv(
      `faraway-experiences-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((exp) => ({
        Titre: exp.title,
        Catégorie: exp.category,
        Destination: `${exp.destination}, ${exp.country}`,
        Durée: exp.duration,
        Tarif: exp.price,
        Enfant: exp.childPrice,
        Coût: exp.cost,
        Stock: exp.stock,
        Statut: experienceStatusMeta[exp.status].label,
        Fournisseur: supplierName(exp.supplierId),
        Note: exp.rating,
      })),
    )
    notify('Catalogue exporté.')
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Expériences"
        description={`${experiences.length} expériences au catalogue · ${experiences.filter((exp) => exp.status === 'active').length} en ligne`}
        actions={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={exportProducts}>
              <Download /> Exporter
            </button>
            <button className="admin-btn admin-btn--primary" onClick={openCreate}>
              <Plus /> Ajouter une expérience
            </button>
          </>
        }
      />

      <div className="admin-toolbar">
        <AdminSearch value={search} onChange={setSearch} placeholder="Rechercher une expérience…" />
        <div className="admin-toolbar__group">
          <select className="admin-select" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Tous les univers</option>
            {categories.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">En ligne</option>
            <option value="draft">Brouillons</option>
          </select>
          {(search || category !== 'all' || status !== 'all') && (
            <button
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => {
                setSearch('')
                setCategory('all')
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
          <table className="admin-table admin-table--products">
            <thead>
              <tr>
                <th>Expérience</th>
                <th>Univers</th>
                <th>Fournisseur</th>
                <th>Tarif</th>
                <th>Stock</th>
                <th>Note</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((experience) => (
                <tr key={experience.id}>
                  <td>
                    <div className="admin-product-cell">
                      <img src={experience.image} alt="" />
                      <span>
                        <strong>{experience.title}</strong>
                        <small>{experience.destination}, {experience.country} · {experience.duration}</small>
                      </span>
                    </div>
                  </td>
                  <td><span className="admin-category-tag">{experience.category}</span></td>
                  <td className="admin-muted">{supplierName(experience.supplierId)}</td>
                  <td>
                    <strong>{formatPrice(experience.price)}</strong>
                    <small className="admin-cell-sub">enfant {formatPrice(experience.childPrice)}</small>
                  </td>
                  <td>
                    <span className={`admin-stock${experience.stock <= 5 ? ' is-low' : ''}`}>{experience.stock}</span>
                  </td>
                  <td>
                    <span className="admin-rating">
                      <Star /> {experience.rating.toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${experienceStatusMeta[experience.status].className}`}>
                      {experienceStatusMeta[experience.status].label}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button onClick={() => openEdit(experience)} title="Modifier" aria-label="Modifier">
                        <Pencil />
                      </button>
                      <button
                        onClick={() => {
                          duplicateExperience(experience.id)
                        }}
                        title="Dupliquer"
                        aria-label="Dupliquer"
                      >
                        <Copy />
                      </button>
                      <a href={`/experiences/${experience.slug}`} target="_blank" rel="noreferrer" title="Voir sur le site" aria-label="Voir sur le site">
                        <Eye />
                      </a>
                      <button
                        onClick={() =>
                          updateExperience(experience.id, {
                            status: experience.status === 'active' ? 'draft' : 'active',
                          })
                        }
                        title={experience.status === 'active' ? 'Mettre hors ligne' : 'Publier'}
                        aria-label={experience.status === 'active' ? 'Mettre hors ligne' : 'Publier'}
                      >
                        <Check />
                      </button>
                      <button className="is-danger" onClick={() => setConfirmDelete(experience)} title="Supprimer" aria-label="Supprimer">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <AdminEmpty
            title="Aucune expérience trouvée"
            description="Modifiez vos filtres ou créez une nouvelle expérience pour enrichir le catalogue."
            action={
              <button className="admin-btn admin-btn--primary" onClick={openCreate}>
                <Plus /> Ajouter une expérience
              </button>
            }
          />
        )}
        {filtered.length > 0 && (
          <AdminPagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} />
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier l’expérience' : 'Nouvelle expérience'}
        subtitle={editing ? editing.title : 'Ajoutez une nouvelle histoire au catalogue Faraway.'}
        size="xl"
        footer={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button className="admin-btn admin-btn--primary" onClick={submit}>
              {editing ? 'Enregistrer les modifications' : 'Créer l’expérience'} <Check />
            </button>
          </>
        }
      >
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <div className="admin-field admin-field--full">
              <label>Titre de l’expérience *</label>
              <input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Ex. Kyoto, au fil des cerisiers" />
            </div>
            <div className="admin-field">
              <label>Univers</label>
              <select value={form.category} onChange={(event) => update('category', event.target.value as Category)}>
                {categories.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Durée</label>
              <input value={form.duration} onChange={(event) => update('duration', event.target.value)} placeholder="2 jours / 1 nuit" />
            </div>
            <div className="admin-field">
              <label>Destination *</label>
              <input value={form.destination} onChange={(event) => update('destination', event.target.value)} placeholder="Kyoto" />
            </div>
            <div className="admin-field">
              <label>Pays</label>
              <input value={form.country} onChange={(event) => update('country', event.target.value)} placeholder="Japon" />
            </div>
            <div className="admin-field">
              <label>Fournisseur</label>
              <select value={form.supplierId} onChange={(event) => update('supplierId', event.target.value)}>
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Statut</label>
              <select value={form.status} onChange={(event) => update('status', event.target.value as ExperienceStatus)}>
                <option value="draft">Brouillon</option>
                <option value="active">En ligne</option>
              </select>
            </div>
          </div>

          <div className="admin-form-section">
            <span className="admin-form-section__title">Tarification & inventaire</span>
            <div className="admin-form-grid admin-form-grid--4">
              <div className="admin-field">
                <label>Prix adulte (€) *</label>
                <input type="number" min="0" value={form.price} onChange={(event) => update('price', event.target.value)} />
              </div>
              <div className="admin-field">
                <label>Prix enfant (€)</label>
                <input type="number" min="0" value={form.childPrice} onChange={(event) => update('childPrice', event.target.value)} />
              </div>
              <div className="admin-field">
                <label>Coût fournisseur (€)</label>
                <input type="number" min="0" value={form.cost} onChange={(event) => update('cost', event.target.value)} />
              </div>
              <div className="admin-field">
                <label>Stock disponible</label>
                <input type="number" min="0" value={form.stock} onChange={(event) => update('stock', event.target.value)} />
              </div>
              <div className="admin-field">
                <label>Délai de réservation (jours)</label>
                <input type="number" min="0" value={form.cutoffDays} onChange={(event) => update('cutoffDays', event.target.value)} />
              </div>
              <div className="admin-field">
                <label>Badge (optionnel)</label>
                <input value={form.badge} onChange={(event) => update('badge', event.target.value)} placeholder="Coup de cœur" />
              </div>
              <label className="admin-check">
                <input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} />
                Mettre en avant sur l’accueil
              </label>
            </div>
          </div>

          <div className="admin-form-section">
            <span className="admin-form-section__title">Visuel</span>
            <div className="admin-image-picker">
              <div className="admin-image-preview">
                <img src={form.image} alt="Aperçu" />
                <span><ImageIcon /> Aperçu de la couverture</span>
              </div>
              <div className="admin-field admin-image-select">
                <label>Image de couverture</label>
                <select value={form.image} onChange={(event) => update('image', event.target.value)}>
                  {imageLibrary.map((image) => (
                    <option key={image.path} value={image.path}>{image.label}</option>
                  ))}
                </select>
                <div className="admin-image-grid">
                  {imageLibrary.slice(0, 8).map((image) => (
                    <button
                      key={image.path}
                      type="button"
                      className={form.image === image.path ? 'is-active' : ''}
                      onClick={() => update('image', image.path)}
                      title={image.label}
                    >
                      <img src={image.path} alt={image.label} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <span className="admin-form-section__title">Contenu éditorial</span>
            <div className="admin-form-grid">
              <div className="admin-field admin-field--full">
                <label>Description courte</label>
                <textarea rows={2} value={form.shortDescription} onChange={(event) => update('shortDescription', event.target.value)} placeholder="Une phrase qui résume l’expérience." />
              </div>
              <div className="admin-field admin-field--full">
                <label>Description longue <small>un paragraphe par ligne</small></label>
                <textarea rows={5} value={form.description} onChange={(event) => update('description', event.target.value)} />
              </div>
              <div className="admin-field">
                <label>Points forts <small>une ligne par point</small></label>
                <textarea rows={4} value={form.highlights} onChange={(event) => update('highlights', event.target.value)} />
              </div>
              <div className="admin-field">
                <label>Inclus <small>une ligne par élément</small></label>
                <textarea rows={4} value={form.included} onChange={(event) => update('included', event.target.value)} />
              </div>
              <div className="admin-field admin-field--full">
                <label>Non inclus <small>une ligne par élément</small></label>
                <textarea rows={3} value={form.excluded} onChange={(event) => update('excluded', event.target.value)} />
              </div>
            </div>
          </div>
        </form>
      </AdminModal>

      <AdminConfirm
        open={Boolean(confirmDelete)}
        title="Supprimer cette expérience ?"
        message={`Vous êtes sur le point de supprimer « ${confirmDelete?.title} ». Les réservations existantes empêchent la suppression.`}
        confirmLabel="Supprimer définitivement"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeletion}
      />
    </div>
  )
}
