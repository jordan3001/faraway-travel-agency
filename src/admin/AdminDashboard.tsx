import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  Euro,
  Plus,
  ShoppingBag,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import {
  formatCompactEuro,
  formatDateShort,
  formatPrice,
  paymentStatusLabel,
  bookingStatusMeta,
} from '../lib/utils'
import { adminCategoryColors, downloadCsv, getLastMonths, monthKey, monthLabel } from './adminUtils'
import { AdminPageHeader } from './components'

const SERIES_HEIGHT = 220
const SERIES_WIDTH = 760
const PAD_X = 24
const PAD_Y = 18

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function Sparkline({ values, color = '#c4664b' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const points = values.map((value, index) => ({
    x: (index / Math.max(values.length - 1, 1)) * 92 + 4,
    y: 32 - ((value - min) / Math.max(max - min, 1)) * 27,
  }))
  return (
    <svg className="admin-sparkline" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${smoothPath(points)} L 96 36 L 4 36 Z`} fill={color} opacity="0.08" />
      <path d={smoothPath(points)} fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

export default function AdminDashboard() {
  const { bookings, experiences, clients, promoCodes, notify } = useStore()
  const [period, setPeriod] = useState(6)

  const validBookings = bookings.filter((booking) => booking.status !== 'cancelled')
  const now = new Date()
  const thisMonthKey = monthKey(now)
  const lastMonth = new Date(now)
  lastMonth.setMonth(now.getMonth() - 1)
  const lastMonthKey = monthKey(lastMonth)
  const thisMonthBookings = validBookings.filter((booking) => monthKey(booking.createdAt) === thisMonthKey)
  const previousMonthBookings = validBookings.filter((booking) => monthKey(booking.createdAt) === lastMonthKey)
  const revenueThisMonth = thisMonthBookings.reduce((sum, booking) => sum + booking.total, 0)
  const revenuePreviousMonth = previousMonthBookings.reduce((sum, booking) => sum + booking.total, 0)
  const totalRevenue = validBookings.reduce((sum, booking) => sum + booking.total, 0)
  const averageBasket = validBookings.length > 0 ? totalRevenue / validBookings.length : 0
  const activeClientIds = new Set(validBookings.map((booking) => booking.clientId))
  const revenueDelta =
    revenuePreviousMonth > 0 ? Math.round(((revenueThisMonth - revenuePreviousMonth) / revenuePreviousMonth) * 100) : 100
  const bookingDelta =
    previousMonthBookings.length > 0
      ? Math.round(((thisMonthBookings.length - previousMonthBookings.length) / previousMonthBookings.length) * 100)
      : 100

  const months = useMemo(() => getLastMonths(period), [period])
  const monthlyData = months.map((month) => {
    const key = monthKey(month)
    const monthBookings = validBookings.filter((booking) => monthKey(booking.createdAt) === key)
    return {
      label: monthLabel(month),
      date: month,
      revenue: monthBookings.reduce((sum, booking) => sum + booking.total, 0),
      count: monthBookings.length,
    }
  })
  const maxRevenue = Math.max(...monthlyData.map((item) => item.revenue), 1200)
  const chartPoints = monthlyData.map((item, index) => ({
    x: PAD_X + (index / Math.max(monthlyData.length - 1, 1)) * (SERIES_WIDTH - PAD_X * 2),
    y: PAD_Y + (1 - item.revenue / maxRevenue) * (SERIES_HEIGHT - PAD_Y * 2),
  }))
  const path = smoothPath(chartPoints)
  const areaPath =
    chartPoints.length > 0
      ? `${path} L ${chartPoints[chartPoints.length - 1].x} ${SERIES_HEIGHT} L ${chartPoints[0].x} ${SERIES_HEIGHT} Z`
      : ''

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const topExperiences = experiences
    .map((experience) => {
      const bookingList = validBookings.filter((booking) => booking.experienceId === experience.id)
      return {
        experience,
        count: bookingList.length,
        revenue: bookingList.reduce((sum, booking) => sum + booking.total, 0),
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)
  const maxTopRevenue = Math.max(...topExperiences.map((item) => item.revenue), 1)

  const categoryRevenue = useMemo(() => {
    return Object.entries(
      validBookings.reduce<Record<string, number>>((acc, booking) => {
        const experience = experiences.find((item) => item.id === booking.experienceId)
        if (!experience) return acc
        acc[experience.category] = (acc[experience.category] ?? 0) + booking.total
        return acc
      }, {}),
    ).sort((a, b) => b[1] - a[1])
  }, [validBookings, experiences])
  const totalCategoryRevenue = categoryRevenue.reduce((sum, [, value]) => sum + value, 0)
  let current = 0
  const donutStops = categoryRevenue
    .map(([category, value]) => {
      const start = current
      const end = current + (value / Math.max(totalCategoryRevenue, 1)) * 100
      current = end
      return `${adminCategoryColors[category] ?? '#879c90'} ${start}% ${end}%`
    })
    .join(', ')

  const upcoming = validBookings
    .filter((booking) => booking.status === 'confirmed' && new Date(booking.date).getTime() >= Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)

  const exportReport = () => {
    downloadCsv(
      `faraway-reservations-${new Date().toISOString().slice(0, 10)}.csv`,
      bookings.map((booking) => {
        const experience = experiences.find((item) => item.id === booking.experienceId)
        const client = clients.find((item) => item.id === booking.clientId)
        return {
          Reference: booking.reference,
          Client: client ? `${client.firstName} ${client.lastName}` : '',
          Experience: experience?.title ?? '',
          Date: formatDateShort(booking.date),
          Voyageurs: booking.adults + booking.children,
          Montant: booking.total,
          Statut: bookingStatusMeta[booking.status].label,
          Paiement: paymentStatusLabel[booking.paymentStatus],
          Canal: booking.channel,
        }
      }),
    )
    notify('Rapport des réservations exporté.')
  }

  const periodRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <div className="admin-dashboard">
      <AdminPageHeader
        eyebrow="Vue d’ensemble"
        title="Bonjour Camille."
        description="Voici ce qui se passe chez Faraway cette semaine."
        actions={
          <>
            <button className="admin-btn admin-btn--ghost" onClick={exportReport}>
              <Download /> Exporter
            </button>
            <Link to="/admin/reservations?new=1" className="admin-btn admin-btn--primary">
              <Plus /> Nouvelle réservation
            </Link>
          </>
        }
      />

      <div className="admin-dashboard__meta">
        <span>
          <CalendarDays /> {new Intl.DateTimeFormat('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)}
        </span>
        <span className="admin-live"><span /> Données à jour</span>
        <Link to="/">
          Voir le site <ArrowUpRight />
        </Link>
      </div>

      <div className="admin-kpis">
        <article className="admin-kpi">
          <div className="admin-kpi__head">
            <span className="admin-kpi__icon admin-kpi__icon--rust">
              <Euro />
            </span>
            <span className="admin-kpi__label">Revenus ce mois</span>
            <span className={`admin-trend${revenueDelta >= 0 ? ' is-up' : ' is-down'}`}>
              {revenueDelta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />} {Math.abs(revenueDelta)}%
            </span>
          </div>
          <strong>{formatPrice(revenueThisMonth)}</strong>
          <div className="admin-kpi__foot">
            <span>{thisMonthBookings.length} réservation{thisMonthBookings.length > 1 ? 's' : ''}</span>
            <Sparkline values={monthlyData.map((item) => item.revenue)} />
          </div>
        </article>
        <article className="admin-kpi">
          <div className="admin-kpi__head">
            <span className="admin-kpi__icon admin-kpi__icon--green">
              <Ticket />
            </span>
            <span className="admin-kpi__label">Réservations</span>
            <span className={`admin-trend${bookingDelta >= 0 ? ' is-up' : ' is-down'}`}>
              {bookingDelta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />} {Math.abs(bookingDelta)}%
            </span>
          </div>
          <strong>{bookings.length}</strong>
          <div className="admin-kpi__foot">
            <span>{bookings.filter((booking) => booking.status === 'pending').length} en attente</span>
            <Sparkline values={monthlyData.map((item) => item.count)} color="#547d65" />
          </div>
        </article>
        <article className="admin-kpi">
          <div className="admin-kpi__head">
            <span className="admin-kpi__icon admin-kpi__icon--gold">
              <ShoppingBag />
            </span>
            <span className="admin-kpi__label">Panier moyen</span>
            <span className="admin-trend is-up">
              <TrendingUp /> +4,2%
            </span>
          </div>
          <strong>{formatPrice(averageBasket)}</strong>
          <div className="admin-kpi__foot">
            <span>{formatCompactEuro(totalRevenue)} de CA total</span>
            <Sparkline values={[620, 680, 650, 720, 760, averageBasket]} color="#b08d52" />
          </div>
        </article>
        <article className="admin-kpi">
          <div className="admin-kpi__head">
            <span className="admin-kpi__icon admin-kpi__icon--blue">
              <Users />
            </span>
            <span className="admin-kpi__label">Clients actifs</span>
            <span className="admin-trend is-up">
              <ArrowUpRight /> +{clients.filter((client) => client.status === 'vip').length}
            </span>
          </div>
          <strong>{activeClientIds.size}</strong>
          <div className="admin-kpi__foot">
            <span>{clients.length} clients au total</span>
            <Sparkline values={[10, 14, 18, 21, 25, activeClientIds.size]} color="#5c7687" />
          </div>
        </article>
      </div>

      <div className="admin-dashboard__grid">
        <section className="admin-card admin-revenue">
          <div className="admin-card__head">
            <div>
              <span className="admin-eyebrow">Performance</span>
              <h2>Évolution des revenus</h2>
            </div>
            <div className="admin-chart-legend">
              <span><i /> Revenus</span>
              <div className="admin-period-switch">
                <button className={period === 6 ? 'is-active' : ''} onClick={() => setPeriod(6)}>
                  6 mois
                </button>
                <button className={period === 12 ? 'is-active' : ''} onClick={() => setPeriod(12)}>
                  12 mois
                </button>
              </div>
            </div>
          </div>
          <div className="admin-revenue__summary">
            <strong>{formatPrice(periodRevenue)}</strong>
            <span>
              sur {period} mois <i className="is-up"><ArrowUpRight /> {revenueDelta}%</i> vs période précédente
            </span>
          </div>
          <div className="admin-chart">
            <div className="admin-chart__y">
              {[4, 3, 2, 1, 0].map((step) => (
                <span key={step}>{formatCompactEuro((maxRevenue / 4) * step)}</span>
              ))}
            </div>
            <svg viewBox={`0 0 ${SERIES_WIDTH} ${SERIES_HEIGHT}`} preserveAspectRatio="none" aria-label="Graphique des revenus mensuels">
              <defs>
                <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4664b" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#c4664b" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4].map((line) => (
                <line
                  key={line}
                  x1={PAD_X}
                  x2={SERIES_WIDTH - PAD_X}
                  y1={PAD_Y + (line / 4) * (SERIES_HEIGHT - PAD_Y * 2)}
                  y2={PAD_Y + (line / 4) * (SERIES_HEIGHT - PAD_Y * 2)}
                  stroke="rgba(16,42,36,.075)"
                  strokeDasharray="3 5"
                />
              ))}
              {areaPath && <path d={areaPath} fill="url(#adminRevenueFill)" />}
              <path d={path} fill="none" stroke="#c4664b" strokeWidth="2" strokeLinecap="round" />
              {chartPoints.map((point, index) => (
                <g key={monthlyData[index].label}>
                  <circle cx={point.x} cy={point.y} r="8" fill="transparent" />
                  <circle cx={point.x} cy={point.y} r="3" fill="#fbf8f1" stroke="#c4664b" strokeWidth="1.6" />
                  <title>
                    {monthlyData[index].label} : {formatPrice(monthlyData[index].revenue)}
                  </title>
                </g>
              ))}
            </svg>
            <div className="admin-chart__x">
              {monthlyData.map((item) => (
                <span key={`${item.label}-${item.date.getFullYear()}`}>{item.label}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-card admin-category-card">
          <div className="admin-card__head">
            <div>
              <span className="admin-eyebrow">Mix produit</span>
              <h2>Revenus par univers</h2>
            </div>
            <button className="admin-icon-btn" onClick={() => notify('Le détail complet arrive bientôt.', 'info')}>
              <ArrowUpRight />
            </button>
          </div>
          <div className="admin-category-donut">
            <div className="admin-donut" style={{ background: `conic-gradient(${donutStops})` }}>
              <div>
                <strong>{formatCompactEuro(totalCategoryRevenue)}</strong>
                <span>CA total</span>
              </div>
            </div>
          </div>
          <div className="admin-category-legend">
            {categoryRevenue.map(([category, value]) => (
              <div key={category}>
                <span>
                  <i style={{ background: adminCategoryColors[category] ?? '#879c90' }} />
                  {category}
                </span>
                <strong>{Math.round((value / Math.max(totalCategoryRevenue, 1)) * 100)}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="admin-dashboard__grid admin-dashboard__grid--lower">
        <section className="admin-card admin-top-products">
          <div className="admin-card__head">
            <div>
              <span className="admin-eyebrow">Catalogue</span>
              <h2>Top expériences</h2>
            </div>
            <Link to="/admin/experiences" className="admin-text-link">
              Tout voir <ArrowUpRight />
            </Link>
          </div>
          <div className="admin-top-list">
            {topExperiences.map((item, index) => (
              <Link key={item.experience.id} to={`/admin/experiences?edit=${item.experience.id}`} className="admin-top-row">
                <span className="admin-top-row__rank">0{index + 1}</span>
                <img src={item.experience.image} alt="" />
                <span className="admin-top-row__copy">
                  <strong>{item.experience.title}</strong>
                  <small>{item.count} réservation{item.count > 1 ? 's' : ''} · {item.experience.destination}</small>
                  <span className="admin-progress">
                    <span style={{ width: `${(item.revenue / maxTopRevenue) * 100}%` }} />
                  </span>
                </span>
                <span className="admin-top-row__value">{formatPrice(item.revenue)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="admin-card admin-upcoming">
          <div className="admin-card__head">
            <div>
              <span className="admin-eyebrow">Prochains jours</span>
              <h2>Départs à venir</h2>
            </div>
            <Link to="/admin/reservations" className="admin-text-link">
              Planning <ArrowUpRight />
            </Link>
          </div>
          <div className="admin-upcoming__list">
            {upcoming.map((booking) => {
              const experience = experiences.find((item) => item.id === booking.experienceId)
              const client = clients.find((item) => item.id === booking.clientId)
              const date = new Date(booking.date)
              return (
                <Link key={booking.id} to={`/admin/reservations?booking=${booking.id}`} className="admin-upcoming__row">
                  <span className="admin-upcoming__date">
                    <strong>{String(date.getDate()).padStart(2, '0')}</strong>
                    <small>{new Intl.DateTimeFormat('fr-BE', { month: 'short' }).format(date).replace('.', '')}</small>
                  </span>
                  <span className="admin-upcoming__copy">
                    <strong>{experience?.title.split(',')[0]}</strong>
                    <small>{client?.firstName} {client?.lastName} · {booking.adults + booking.children} pers.</small>
                  </span>
                  <ArrowUpRight />
                </Link>
              )
            })}
            {upcoming.length === 0 && <p className="admin-muted">Aucun départ confirmé dans les prochains jours.</p>}
          </div>
          <div className="admin-upcoming__foot">
            <span><span className="admin-live"><span /> En direct</span> Mis à jour à l’instant</span>
            <Link to="/admin/reservations">Ouvrir le planning</Link>
          </div>
        </section>
      </div>

      <section className="admin-card admin-recent">
        <div className="admin-card__head">
          <div>
            <span className="admin-eyebrow">Dernières transactions</span>
            <h2>Réservations récentes</h2>
          </div>
          <Link to="/admin/reservations" className="admin-btn admin-btn--ghost admin-btn--sm">
            Voir tout <ArrowRight />
          </Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Expérience</th>
                <th>Date de départ</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => {
                const client = clients.find((item) => item.id === booking.clientId)
                const experience = experiences.find((item) => item.id === booking.experienceId)
                return (
                  <tr key={booking.id}>
                    <td><span className="admin-ref">{booking.reference}</span></td>
                    <td>
                      <div className="admin-client-cell">
                        <span className="admin-mini-avatar">{client?.firstName[0]}{client?.lastName[0]}</span>
                        <span>
                          <strong>{client?.firstName} {client?.lastName}</strong>
                          <small>{client?.email}</small>
                        </span>
                      </div>
                    </td>
                    <td className="admin-table__truncate">{experience?.title}</td>
                    <td>{formatDateShort(booking.date)}</td>
                    <td><strong>{formatPrice(booking.total)}</strong></td>
                    <td><span className={`status ${bookingStatusMeta[booking.status].className}`}>{bookingStatusMeta[booking.status].label}</span></td>
                    <td><span className={`admin-pay ${booking.paymentStatus}`}>{paymentStatusLabel[booking.paymentStatus]}</span></td>
                    <td>
                      <Link to={`/admin/reservations?booking=${booking.id}`} className="admin-row-arrow" aria-label="Voir la réservation">
                        <ArrowUpRight />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-dashboard__banner">
        <div>
          <span className="admin-eyebrow">L’info du jour</span>
          <h2>La Saint-Nicolas approche.</h2>
          <p>Pensez à pousser les escapades en famille dans la newsletter de cette semaine. Les réservations Pairi Daiza sont en hausse de 18 %.</p>
        </div>
        <div className="admin-dashboard__banner-stats">
          <div>
            <strong>{promoCodes.filter((promo) => promo.active).length}</strong>
            <span>offres actives</span>
          </div>
          <div>
            <strong>18%</strong>
            <span>hausse familles</span>
          </div>
        </div>
        <Link to="/admin/journal" className="admin-btn admin-btn--light">
          Préparer la newsletter <ArrowRight />
        </Link>
      </section>
    </div>
  )
}
