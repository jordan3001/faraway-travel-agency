import type { Booking, Experience, ExperienceStatus } from '../types'

export const formatPrice = (value: number, withCents = false) =>
  new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: withCents || value % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: withCents || value % 1 !== 0 ? 2 : 0,
  }).format(value)

export const formatDateLong = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const formatDateShort = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('fr-BE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const formatMonthShort = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('fr-BE', { month: 'short' }).format(date)
}

export const toDateInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export const defaultTravelDate = (cutoffDays = 7) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + Math.max(cutoffDays, 7))
  return toDateInput(date)
}

export const maxTravelDate = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return toDateInput(date)
}

export const isWeekend = (dateString: string) => {
  const date = new Date(`${dateString}T12:00:00`)
  const day = date.getDay()
  return day === 0 || day === 6
}

export const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const bookingTotals = (
  experience: Experience,
  adults: number,
  children: number,
  optionIds: string[],
  promoDiscount = 0,
) => {
  const adultTotal = experience.price * adults
  const childTotal = experience.childPrice * children
  const optionsTotal = optionIds.reduce((sum, id) => {
    const option = experience.options.find((item) => item.id === id)
    if (!option) return sum
    return sum + (option.unit === 'person' ? option.price * (adults + children) : option.price)
  }, 0)
  const subtotal = adultTotal + childTotal + optionsTotal
  const serviceFee = 9.5
  const total = Math.max(0, subtotal + serviceFee - promoDiscount)
  return {
    adultTotal,
    childTotal,
    optionsTotal,
    subtotal,
    serviceFee,
    discount: promoDiscount,
    total: Math.round(total * 100) / 100,
  }
}

export const bookingStatusMeta: Record<
  Booking['status'],
  { label: string; className: string; dot: string }
> = {
  confirmed: { label: 'Confirmée', className: 'status--confirmed', dot: '#2f7a5e' },
  pending: { label: 'En attente', className: 'status--pending', dot: '#b07c2f' },
  completed: { label: 'Terminée', className: 'status--completed', dot: '#6e7d77' },
  cancelled: { label: 'Annulée', className: 'status--cancelled', dot: '#a84c3e' },
}

export const paymentStatusLabel: Record<Booking['paymentStatus'], string> = {
  paid: 'Payé',
  deposit: 'Acompte',
  pending: 'En attente',
  refunded: 'Remboursé',
}

export const experienceStatusMeta: Record<ExperienceStatus, { label: string; className: string }> = {
  active: { label: 'En ligne', className: 'status--confirmed' },
  draft: { label: 'Brouillon', className: 'status--draft' },
}

export const clientStatusMeta: Record<string, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'status--confirmed' },
  vip: { label: 'VIP', className: 'status--vip' },
  inactive: { label: 'Inactif', className: 'status--completed' },
}

export const supplierStatusMeta: Record<string, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'status--confirmed' },
  pending: { label: 'À renouveler', className: 'status--pending' },
  inactive: { label: 'Inactif', className: 'status--completed' },
}

export const getClientName = (
  clients: { id: string; firstName: string; lastName: string }[],
  id: string,
) => {
  const client = clients.find((item) => item.id === id)
  return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu'
}

export const getExperience = (experiences: Experience[], id: string) =>
  experiences.find((experience) => experience.id === id)

export const formatCompactEuro = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1).replace('.', ',')} k€`
  }
  return `${Math.round(value)} €`
}

export const addDays = (date: string | Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const durationInDays = (experience: Experience) => {
  const match = experience.duration.match(/(\d+)/)
  return match ? Number(match[1]) : 1
}

export const getNextDeparture = (experience: Experience) => {
  const date = new Date()
  date.setDate(date.getDate() + Math.max(7, experience.cutoffDays))
  return date
}
