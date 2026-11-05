import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgePercent,
  Check,
  Download,
  Euro,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import type { PromoCode } from '../types'
import { categories } from '../data/data'
import { formatPrice } from '../lib/utils'
import { downloadCsv } from './adminUtils'
import {
  AdminConfirm,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from './components'

const PAGE_SIZE = 9

type PromoForm = {
  code: string
  type: PromoCode['type']
  value: string
  minSpend: string
  maxUses: string
  description: string
  active: boolean
}

const emptyPromo = (): PromoForm => ({
  code: '',
  type: 'percent',
  value: '10',
  minSpend: '200',
  maxUses: '250',
  description: '',
  active: true,
})

export default function AdminPricing() {
  const { experiences, promoCodes, updateExperience, addPromo, updatePromo, deletePromo, notify } = useStore()
  const [tab, setTab] = useState<'grid' | 'promos'>('grid')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [priceEditing, setPriceEditing] = useState<string | null>(null)
  const [promoModalOpen, setPromoModalOpen] = useState(false)
  const [promoEditing, setPromoEditing] = useState<PromoCode | null>(null)
  const [promoForm, setPromoForm] = useState<PromoForm>(emptyPromo())
  const [confirmPromo, setConfirmPromo] = useState<PromoCode | null>(null)
  const [priceForm, setPriceForm] = useState({ price: '', childPrice: '', cost: '' })

  const currentExperience = experiences.find((experience) => experience.id === priceEditing)

  const filtered = useMemo(() => {
    return experiences.filter((experience) => {
      if (category !== 'all' && experience.category !== category) return false
      if (!search.trim()) return true
      return `${experience.title} ${experience.destination}`.toLowerCase().includes(search.trim().toLowerCase())
    })
  }, [experiences, search, category])
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const averageMargin = experiences.length
    ? experiences.reduce((sum, exp) => sum + ((exp.price - exp.cost) / Math.max(exp.price, 1)) * 100, 0) / experiences.length
    : 0
  const averagePrice = experiences.length ? experiences.reduce((sum, exp) => sum + exp.price, 0) / experiences.length : 0
  const promoUses = promoCodes.reduce((sum, promo) => sum + promo.uses, 0)

  const openPriceEdit = (experienceId: string) => {
    const experience = experiences.find((item) => item.id === experienceId)
    if (!experience) return
    setPriceEditing(experienceId)
    setPriceForm({
      price: String(experience.price),
      childPrice: String(experience.childPrice),
      cost: String(experience.cost),
    })
  }

  const savePrices = () => {
    if (!currentExperience) return
    const price = Number(priceForm.price)
    const childPrice = Number(priceForm.childPrice)
    const cost = Number(priceForm.cost)
    if (price <= 0 || childPrice < 0 || cost < 0) {
      notify('Vérifiez les montants saisis.', 'error')
      return
    }
    if (cost >= price) {
      notify('Le coût fournisseur doit rester inférieur au prix de vente.', 'error')
      return
    }
    updateExperience(currentExperience.id, { price, childPrice, cost })
    setPriceEditing(null)
  }

  const openPromoCreate = () => {
    setPromoEditing(null)
    setPromoForm(emptyPromo())
    setPromoModalOpen(true)
  }

  const openPromoEdit = (promo: PromoCode) => {
    setPromoEditing(promo)
    setPromoForm({
      code: promo.code,
      type: promo.type,
      value: String(promo.value),
      minSpend: String(promo.minSpend),
      maxUses: String(promo.maxUses),
      description: promo.description,
      active: promo.active,
    })
    setPromoModalOpen(true)
  }

  const submitPromo = (event: React.FormEvent) => {
    event.preventDefault()
    const code = promoForm.code.trim().toUpperCase()
    if (!code || Number(promoForm.value) <= 0) {
      notify('Renseignez un code et une valeur valide.', 'error')
      return
    }
    if (promoCodes.some((promo) => promo.code === code && promo.id !== promoEditing?.id)) {
      notify('Ce code promo existe déjà.', 'error')
      return
    }
    const payload = {
      code,
      type: promoForm.type,
      value: Number(promoForm.value),
      minSpend: Number(promoForm.minSpend) || 0,
      maxUses: Number(promoForm.maxUses) || 1,
      description: promoForm.description,
      active: promoForm.active,
    }
    if (promoEditing) updatePromo(promoEditing.id, payload)
    else addPromo(payload)
    setPromoModalOpen(false)
  }

  const exportPrices = () => {
    downloadCsv(
      `faraway-tarifs-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((experience) => ({
        Expérience: experience.title,
        Catégorie: experience.category,
        'Prix adulte': experience.price,
        'Prix enfant': experience.childPrice,
        'Coût fournisseur': experience.cost,
        'Marge brute': experience.price - experience.cost,
        'Taux de marge': `${Math.round(((experience.price - experience.cost) / Math.max(experience.price, 1)) * 100)}%`,
      })),
    )
    notify('Grille tarifaire exportée.')
  }

  const exportPromos = () => {
    downloadCsv(
      `faraway-promotions-${new Date().toISOString().slice(0, 10)}.csv`,
      promoCodes.map((promo) => ({
        Code: promo.code,
        Type: promo.type === 'percent' ? 'Pourcentage' : 'Montant',
        Valeur: promo.value,
        'Achat minimum': promo.minSpend,
        Utilisations: promo.uses,
        'Limite': promo.maxUses,
        Actif: promo.active ? 'Oui' : 'Non',
      })),
    )
    notify('Codes promo exportés.')
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Tarifs & offres"
        description="Pilotez vos prix, vos marges et vos promotions en toute simplicité."
        actions={
          <button className="admin-btn admin-btn--primary" onClick={openPromoCreate}>
            <Plus /> Créer une offre
          </button>
        }
      />

      <div className="admin-mini-stats admin-pricing-stats">
        <div>
          <span className="admin-mini-stat__icon"><TrendingUp /></span>
          <span>
            <small>Marge brute moyenne</small>
            <strong>{averageMargin.toFixed(1)} %</strong>
          </span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><Euro /></span>
          <span>
            <small>Panier catalogue moyen</small>
            <strong>{formatPrice(averagePrice)}</strong>
          </span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><BadgePercent /></span>
          <span>
            <small>Offres actives</small>
            <strong>{promoCodes.filter((promo) => promo.active).length}</strong>
          </span>
        </div>
        <div>
          <span className="admin-mini-stat__icon"><Tag /></span>
          <span>
            <small>Utilisations cumulées</small>
            <strong>{promoUses}</strong>
          </span>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'grid' ? 'is-active' : ''} onClick={() => setTab('grid')}>
          Grille tarifaire <span>{experiences.length}</span>
        </button>
        <button className={tab === 'promos' ? 'is-active' : ''} onClick={() => setTab('promos')}>
          Codes & promotions <span>{promoCodes.length}</span>
        </button>
      </div>

      {tab === 'grid' && (
        <>
          <div className="admin-toolbar">
            <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Rechercher une expérience…" />
            <div className="admin-toolbar__group">
              <select className="admin-select" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}>
                <option value="all">Tous les univers</option>
                {categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
              <button className="admin-btn admin-btn--ghost" onClick={exportPrices}>
                <Download /> Exporter
              </button>
              {(search || category !== 'all') && (
                <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => { setSearch(''); setCategory('all') }}>
                  <RotateCcw /> Réinitialiser
                </button>
              )}
            </div>
          </div>
          <div className="admin-card admin-table-card">
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--pricing">
                <thead>
                  <tr>
                    <th>Expérience</th>
                    <th>Prix adulte</th>
                    <th>Prix enfant</th>
                    <th>Coût fournisseur</th>
                    <th>Marge brute</th>
                    <th>Marge nette</th>
                    <th>Dernière mise à jour</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((experience) => {
                    const margin = experience.price - experience.cost
                    const marginRate = (margin / Math.max(experience.price, 1)) * 100
                    return (
                      <tr key={experience.id}>
                        <td>
                          <div className="admin-product-cell admin-product-cell--compact">
                            <img src={experience.image} alt="" />
                            <span>
                              <strong>{experience.title}</strong>
                              <small>{experience.category}</small>
                            </span>
                          </div>
                        </td>
                        <td><strong>{formatPrice(experience.price)}</strong></td>
                        <td>{formatPrice(experience.childPrice)}</td>
                        <td className="admin-muted">{formatPrice(experience.cost)}</td>
                        <td><strong>{formatPrice(margin)}</strong></td>
                        <td>
                          <span className={`admin-margin${marginRate < 25 ? ' is-low' : marginRate > 35 ? ' is-high' : ''}`}>
                            {marginRate.toFixed(0)} %
                          </span>
                        </td>
                        <td className="admin-muted">récemment</td>
                        <td>
                          <button className="admin-row-edit" onClick={() => openPriceEdit(experience.id)}>
                            <Pencil /> Modifier
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <AdminPagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} />
          </div>
          <div className="admin-pricing-note">
            <Sparkles />
            <div>
              <strong>Notre recommandation</strong>
              <p>Une marge brute supérieure à 30 % vous permet d’absorber les imprévus et d’investir dans l’expérience client. Les parcs sont plus sensibles au volume que les voyages signature.</p>
            </div>
            <button className="admin-text-link" onClick={() => setTab('promos')}>
              Voir les promotions <ArrowUpRight />
            </button>
          </div>
        </>
      )}

      {tab === 'promos' && (
        <>
          <div className="admin-toolbar">
            <div>
              <p className="admin-toolbar__note">Les codes s’appliquent au sous-total hors frais de service.</p>
            </div>
            <div className="admin-toolbar__group">
              <button className="admin-btn admin-btn--ghost" onClick={exportPromos}>
                <Download /> Exporter
              </button>
              <button className="admin-btn admin-btn--primary" onClick={openPromoCreate}>
                <Plus /> Nouveau code
              </button>
            </div>
          </div>
          <div className="admin-card admin-table-card">
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--promos">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Réduction</th>
                    <th>Achat minimum</th>
                    <th>Utilisations</th>
                    <th>Description</th>
                    <th>Actif</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map((promo) => (
                    <tr key={promo.id}>
                      <td>
                        <span className="admin-promo-code">{promo.code}</span>
                      </td>
                      <td>
                        <strong>
                          {promo.type === 'percent' ? `−${promo.value} %` : `−${formatPrice(promo.value)}`}
                        </strong>
                      </td>
                      <td>{promo.minSpend ? formatPrice(promo.minSpend) : '—'}</td>
                      <td>
                        <div className="admin-promo-uses">
                          <span>{promo.uses} / {promo.maxUses}</span>
                          <span className="admin-progress">
                            <span style={{ width: `${Math.min(100, (promo.uses / Math.max(promo.maxUses, 1)) * 100)}%` }} />
                          </span>
                        </div>
                      </td>
                      <td className="admin-table__truncate">{promo.description}</td>
                      <td>
                        <button
                          className={`admin-switch${promo.active ? ' is-on' : ''}`}
                          onClick={() => updatePromo(promo.id, { active: !promo.active })}
                          aria-label={promo.active ? 'Désactiver' : 'Activer'}
                        >
                          <span />
                        </button>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button onClick={() => openPromoEdit(promo)} title="Modifier" aria-label="Modifier">
                            <Pencil />
                          </button>
                          <button className="is-danger" onClick={() => setConfirmPromo(promo)} title="Supprimer" aria-label="Supprimer">
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AdminModal
        open={Boolean(currentExperience)}
        onClose={() => setPriceEditing(null)}
        title="Ajuster les tarifs"
        subtitle={currentExperience?.title}
        size="md"
        footer={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={() => setPriceEditing(null)}>Annuler</button>
            <button className="admin-btn admin-btn--primary" onClick={savePrices}>
              Enregistrer les tarifs <Check />
            </button>
          </>
        }
      >
        <div className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Prix adulte (€)</label>
              <input type="number" min="0" value={priceForm.price} onChange={(event) => setPriceForm((prev) => ({ ...prev, price: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Prix enfant (€)</label>
              <input type="number" min="0" value={priceForm.childPrice} onChange={(event) => setPriceForm((prev) => ({ ...prev, childPrice: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Coût fournisseur (€)</label>
              <input type="number" min="0" value={priceForm.cost} onChange={(event) => setPriceForm((prev) => ({ ...prev, cost: event.target.value }))} />
            </div>
            <div className="admin-price-summary">
              <span>Marge brute estimée</span>
              <strong>{formatPrice(Math.max(0, Number(priceForm.price) - Number(priceForm.cost)))}</strong>
              <small>
                {Number(priceForm.price) > 0
                  ? `${Math.round(((Number(priceForm.price) - Number(priceForm.cost)) / Number(priceForm.price)) * 100)} % du prix de vente`
                  : '—'}
              </small>
            </div>
          </div>
          <p className="admin-form-help">Les modifications s’appliquent immédiatement au catalogue et aux nouvelles réservations.</p>
        </div>
      </AdminModal>

      <AdminModal
        open={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
        title={promoEditing ? 'Modifier l’offre' : 'Nouvelle offre'}
        subtitle="Créez un code promotionnel pour votre prochaine campagne."
        size="md"
        footer={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={() => setPromoModalOpen(false)}>Annuler</button>
            <button className="admin-btn admin-btn--primary" onClick={submitPromo}>
              {promoEditing ? 'Enregistrer' : 'Créer le code'} <Check />
            </button>
          </>
        }
      >
        <form className="admin-form" onSubmit={submitPromo}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Code promo</label>
              <input value={promoForm.code} onChange={(event) => setPromoForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} placeholder="FARAWAY10" />
            </div>
            <div className="admin-field">
              <label>Type de remise</label>
              <select value={promoForm.type} onChange={(event) => setPromoForm((prev) => ({ ...prev, type: event.target.value as PromoCode['type'] }))}>
                <option value="percent">Pourcentage</option>
                <option value="amount">Montant fixe</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Valeur ({promoForm.type === 'percent' ? '%' : '€'})</label>
              <input type="number" min="1" value={promoForm.value} onChange={(event) => setPromoForm((prev) => ({ ...prev, value: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Achat minimum (€)</label>
              <input type="number" min="0" value={promoForm.minSpend} onChange={(event) => setPromoForm((prev) => ({ ...prev, minSpend: event.target.value }))} />
            </div>
            <div className="admin-field">
              <label>Utilisations maximum</label>
              <input type="number" min="1" value={promoForm.maxUses} onChange={(event) => setPromoForm((prev) => ({ ...prev, maxUses: event.target.value }))} />
            </div>
            <label className="admin-check">
              <input type="checkbox" checked={promoForm.active} onChange={(event) => setPromoForm((prev) => ({ ...prev, active: event.target.checked }))} />
              Activer immédiatement
            </label>
            <div className="admin-field admin-field--full">
              <label>Description</label>
              <textarea rows={2} value={promoForm.description} onChange={(event) => setPromoForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="−10 % sur votre première escapade, dès 200 € d’achat." />
            </div>
          </div>
        </form>
      </AdminModal>

      <AdminConfirm
        open={Boolean(confirmPromo)}
        title="Supprimer ce code promo ?"
        message={`Le code ${confirmPromo?.code ?? ''} ne pourra plus être utilisé par vos clients.`}
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirmPromo(null)}
        onConfirm={() => {
          if (confirmPromo) deletePromo(confirmPromo.id)
          setConfirmPromo(null)
        }}
      />
    </div>
  )
}
