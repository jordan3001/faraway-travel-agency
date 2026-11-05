export type Category =
  | 'Parcs & attractions'
  | 'Culture & patrimoine'
  | 'Nature & aventure'
  | 'City breaks'
  | 'Séjours thématiques'

export type ExperienceStatus = 'active' | 'draft'

export interface TicketOption {
  id: string
  name: string
  description: string
  price: number
  unit: 'person' | 'booking'
}

export interface ItineraryStep {
  day: number
  title: string
  description: string
}

export interface Experience {
  id: string
  slug: string
  title: string
  eyebrow: string
  destination: string
  country: string
  category: Category
  duration: string
  price: number
  childPrice: number
  cost: number
  oldPrice?: number
  rating: number
  reviewCount: number
  image: string
  gallery: string[]
  shortDescription: string
  description: string[]
  highlights: string[]
  included: string[]
  excluded: string[]
  itinerary: ItineraryStep[]
  practical: {
    departure: string
    languages: string
    groupSize: string
    cancellation: string
    accessibility: string
  }
  options: TicketOption[]
  supplierId: string
  status: ExperienceStatus
  featured: boolean
  badge?: string
  stock: number
  cutoffDays: number
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  type: string
  contactName: string
  email: string
  phone: string
  city: string
  country: string
  rating: number
  since: string
  status: 'active' | 'pending' | 'inactive'
  notes: string
}

export type ClientTier = 'Membre' | 'Privilège' | 'Signature'

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  country: string
  memberSince: string
  loyaltyPoints: number
  tier: ClientTier
  preferences: string[]
  notes: string
  password?: string
  status: 'active' | 'vip' | 'inactive'
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type PaymentStatus = 'paid' | 'deposit' | 'pending' | 'refunded'

export interface Booking {
  id: string
  reference: string
  clientId: string
  experienceId: string
  date: string
  adults: number
  children: number
  options: string[]
  total: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  createdAt: string
  channel: 'web' | 'agence' | 'téléphone'
  notes: string
  internalNotes: string
  promoCode?: string
  supplierId: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  category: string
  excerpt: string
  image: string
  readTime: number
  date: string
  author: string
  authorRole: string
  status: 'published' | 'draft'
  content: string[]
  pullQuote: string
}

export interface PromoCode {
  id: string
  code: string
  type: 'percent' | 'amount'
  value: number
  minSpend: number
  active: boolean
  uses: number
  maxUses: number
  description: string
}

export interface Review {
  id: string
  experienceId: string
  name: string
  initials: string
  color: string
  date: string
  rating: number
  title: string
  text: string
  verified: boolean
}

export interface Destination {
  name: string
  country: string
  image: string
  blurb: string
  count: number
}

export interface EditableExperience extends Omit<Experience, 'id' | 'slug'> {
  id: string
  slug: string
}
