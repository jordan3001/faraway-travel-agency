import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  blogPosts as seedPosts,
  bookings as seedBookings,
  clients as seedClients,
  experiences as seedExperiences,
  promoCodes as seedPromos,
  suppliers as seedSuppliers,
} from '../data/data'
import type {
  BlogPost,
  Booking,
  BookingStatus,
  Client,
  Experience,
  PromoCode,
  Supplier,
} from '../types'

type ToastType = 'success' | 'error' | 'info'
interface Toast {
  id: string
  message: string
  type: ToastType
}

interface BookingInput {
  clientId?: string
  experienceId: string
  date: string
  adults: number
  children: number
  options: string[]
  total: number
  status?: BookingStatus
  paymentStatus?: Booking['paymentStatus']
  channel?: Booking['channel']
  notes?: string
  promoCode?: string
  customer?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    city: string
    country: string
  }
}

interface StoreContextValue {
  experiences: Experience[]
  suppliers: Supplier[]
  clients: Client[]
  bookings: Booking[]
  blogPosts: BlogPost[]
  promoCodes: PromoCode[]
  favorites: string[]
  currentClient: Client | null
  currentClientId: string | null
  toasts: Toast[]
  login: (email: string, password: string) => boolean
  logout: () => void
  signup: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    city?: string
  }) => boolean
  notify: (message: string, type?: ToastType) => void
  dismissToast: (id: string) => void
  toggleFavorite: (experienceId: string) => void
  createBooking: (input: BookingInput) => Booking
  updateBooking: (id: string, patch: Partial<Booking>) => void
  setBookingStatus: (id: string, status: BookingStatus) => void
  addExperience: (exp: Omit<Experience, 'id' | 'createdAt' | 'slug'> & { id?: string; slug?: string }) => Experience
  updateExperience: (id: string, patch: Partial<Experience>) => void
  deleteExperience: (id: string) => void
  duplicateExperience: (id: string) => void
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier
  updateSupplier: (id: string, patch: Partial<Supplier>) => void
  deleteSupplier: (id: string) => boolean
  addClient: (client: Omit<Client, 'id'>) => Client
  updateClient: (id: string, patch: Partial<Client>) => void
  deleteClient: (id: string) => boolean
  addPromo: (promo: Omit<PromoCode, 'id' | 'uses'>) => PromoCode
  updatePromo: (id: string, patch: Partial<PromoCode>) => void
  deletePromo: (id: string) => void
  validatePromo: (
    code: string,
    subtotal: number,
  ) => { valid: boolean; discount: number; message: string; promo?: PromoCode }
  usePromo: (code: string) => void
  addPost: (post: Omit<BlogPost, 'id'>) => BlogPost
  updatePost: (id: string, patch: Partial<BlogPost>) => void
  deletePost: (id: string) => void
  resetDemo: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

const KEYS = {
  experiences: 'faraway.experiences.v1',
  suppliers: 'faraway.suppliers.v1',
  clients: 'faraway.clients.v1',
  bookings: 'faraway.bookings.v1',
  posts: 'faraway.posts.v1',
  promos: 'faraway.promos.v1',
  favorites: 'faraway.favorites.v1',
  session: 'faraway.session.v1',
}

const read = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Local persistence is best-effort in this demo environment.
  }
}

const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function StoreProvider({ children }: { children: ReactNode }) {
  const [experiences, setExperiences] = useState<Experience[]>(() => read(KEYS.experiences, seedExperiences))
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => read(KEYS.suppliers, seedSuppliers))
  const [clients, setClients] = useState<Client[]>(() => read(KEYS.clients, seedClients))
  const [bookings, setBookings] = useState<Booking[]>(() => read(KEYS.bookings, seedBookings))
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => read(KEYS.posts, seedPosts))
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => read(KEYS.promos, seedPromos))
  const [favorites, setFavorites] = useState<string[]>(() => read(KEYS.favorites, ['exp-kyoto', 'exp-islande']))
  const [currentClientId, setCurrentClientId] = useState<string | null>(() => read(KEYS.session, null))
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, number>>({})

  useEffect(() => write(KEYS.experiences, experiences), [experiences])
  useEffect(() => write(KEYS.suppliers, suppliers), [suppliers])
  useEffect(() => write(KEYS.clients, clients), [clients])
  useEffect(() => write(KEYS.bookings, bookings), [bookings])
  useEffect(() => write(KEYS.posts, blogPosts), [blogPosts])
  useEffect(() => write(KEYS.promos, promoCodes), [promoCodes])
  useEffect(() => write(KEYS.favorites, favorites), [favorites])
  useEffect(() => write(KEYS.session, currentClientId), [currentClientId])

  const currentClient = useMemo(
    () => clients.find((client) => client.id === currentClientId) ?? null,
    [clients, currentClientId],
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const notify = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = makeId('toast')
      setToasts((prev) => [...prev, { id, message, type }])
      timers.current[id] = window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
        delete timers.current[id]
      }, 4000)
    },
    [],
  )

  const login = useCallback(
    (email: string, password: string) => {
      const client = clients.find((c) => c.email.toLowerCase() === email.trim().toLowerCase())
      if (!client) {
        notify('Aucun compte ne correspond à cette adresse e-mail.', 'error')
        return false
      }
      const expectedPassword = client.password ?? 'faraway'
      if (expectedPassword !== password) {
        notify('Mot de passe incorrect. Compte démo : claire.dubois@example.be · faraway.', 'error')
        return false
      }
      setCurrentClientId(client.id)
      notify(`Ravis de vous revoir, ${client.firstName}.`)
      return true
    },
    [clients, notify],
  )

  const logout = useCallback(() => {
    setCurrentClientId(null)
    notify('Vous êtes déconnecté de votre espace.', 'info')
  }, [notify])

  const signup = useCallback(
    (data: {
      firstName: string
      lastName: string
      email: string
      password: string
      phone?: string
      city?: string
    }) => {
      const email = data.email.trim().toLowerCase()
      if (clients.some((client) => client.email.toLowerCase() === email)) {
        notify('Un compte existe déjà avec cette adresse e-mail.', 'error')
        return false
      }
      const newClient: Client = {
        id: makeId('cli'),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email,
        phone: data.phone?.trim() || '',
        city: data.city?.trim() || '',
        country: 'Belgique',
        memberSince: new Intl.DateTimeFormat('fr-BE', { month: 'long', year: 'numeric' }).format(new Date()),
        loyaltyPoints: 100,
        tier: 'Membre',
        preferences: [],
        notes: 'Compte créé depuis le site.',
        password: data.password,
        status: 'active',
      }
      setClients((prev) => [newClient, ...prev])
      setCurrentClientId(newClient.id)
      notify(`Bienvenue chez Faraway, ${newClient.firstName} ! Vos 100 premiers points sont offerts.`)
      return true
    },
    [clients, notify],
  )

  const toggleFavorite = useCallback(
    (experienceId: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(experienceId)
        notify(exists ? 'Retiré de vos favoris.' : 'Ajouté à vos favoris.', 'info')
        return exists ? prev.filter((id) => id !== experienceId) : [...prev, experienceId]
      })
    },
    [notify],
  )

  const createBooking = useCallback(
    (input: BookingInput) => {
      let clientId = input.clientId ?? currentClientId ?? undefined
      let createdClient: Client | null = null

      if (!clientId && input.customer) {
        const email = input.customer.email.trim().toLowerCase()
        const existing = clients.find((client) => client.email.toLowerCase() === email)
        if (existing) {
          clientId = existing.id
        } else {
          createdClient = {
            id: makeId('cli'),
            firstName: input.customer.firstName.trim(),
            lastName: input.customer.lastName.trim(),
            email,
            phone: input.customer.phone.trim(),
            city: input.customer.city.trim(),
            country: input.customer.country.trim() || 'Belgique',
            memberSince: new Intl.DateTimeFormat('fr-BE', { month: 'long', year: 'numeric' }).format(new Date()),
            loyaltyPoints: 0,
            tier: 'Membre',
            preferences: [],
            notes: 'Compte créé automatiquement lors d’une réservation en ligne.',
            status: 'active',
          }
          clientId = createdClient.id
          setClients((prev) => [createdClient as Client, ...prev])
        }
      }

      if (!clientId) {
        throw new Error('Un client est requis pour créer une réservation.')
      }

      const experience = experiences.find((item) => item.id === input.experienceId)
      if (!experience) throw new Error('Expérience introuvable.')

      const reference = `FW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      const booking: Booking = {
        id: makeId('bk'),
        reference,
        clientId,
        experienceId: input.experienceId,
        date: input.date,
        adults: input.adults,
        children: input.children,
        options: input.options,
        total: Math.round(input.total * 100) / 100,
        status: input.status ?? 'confirmed',
        paymentStatus: input.paymentStatus ?? 'paid',
        createdAt: new Date().toISOString(),
        channel: input.channel ?? 'web',
        notes: input.notes ?? '',
        internalNotes: '',
        promoCode: input.promoCode,
        supplierId: experience.supplierId,
      }

      setBookings((prev) => [booking, ...prev])
      setExperiences((prev) =>
        prev.map((item) =>
          item.id === experience.id
            ? { ...item, stock: Math.max(0, item.stock - (input.adults + input.children)) }
            : item,
        ),
      )
      setClients((prev) =>
        prev.map((client) => {
          if (client.id !== clientId) return client
          const points = createdClient ? 100 : Math.round(booking.total / 2)
          const newPoints = client.loyaltyPoints + points
          return {
            ...client,
            loyaltyPoints: newPoints,
            tier: newPoints >= 2500 ? 'Signature' : newPoints >= 1000 ? 'Privilège' : 'Membre',
            status: newPoints >= 2500 ? 'vip' : client.status,
          }
        }),
      )
      if ((createdClient || currentClientId === clientId) && !createdClient) {
        setCurrentClientId(clientId)
      }
      if (createdClient) {
        setCurrentClientId(createdClient.id)
      }
      if (input.promoCode) {
        setPromoCodes((prev) =>
          prev.map((promo) => (promo.code === input.promoCode ? { ...promo, uses: promo.uses + 1 } : promo)),
        )
      }
      return booking
    },
    [clients, currentClientId, experiences],
  )

  const updateBooking = useCallback(
    (id: string, patch: Partial<Booking>) => {
      setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, ...patch } : booking)))
    },
    [],
  )

  const setBookingStatus = useCallback(
    (id: string, status: BookingStatus) => {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? {
                ...booking,
                status,
                paymentStatus:
                  status === 'cancelled'
                    ? 'refunded'
                    : status === 'confirmed' || status === 'completed'
                      ? 'paid'
                      : booking.paymentStatus,
              }
            : booking,
        ),
      )
      notify('Le statut de la réservation a été mis à jour.')
    },
    [notify],
  )

  const addExperience = useCallback<StoreContextValue['addExperience']>(
    (data) => {
      const experience: Experience = {
        ...(data as Omit<Experience, 'id' | 'createdAt' | 'slug'>),
        id: `exp-${Date.now().toString(36)}`,
        slug: slugify(data.title),
        createdAt: new Date().toISOString(),
      }
      setExperiences((prev) => [experience, ...prev])
      notify('Nouvelle expérience créée et ajoutée au catalogue.')
      return experience
    },
    [notify],
  )

  const updateExperience = useCallback(
    (id: string, patch: Partial<Experience>) => {
      setExperiences((prev) =>
        prev.map((experience) =>
          experience.id === id
            ? { ...experience, ...patch, slug: patch.title ? slugify(patch.title) : experience.slug }
            : experience,
        ),
      )
      notify('Expérience mise à jour.')
    },
    [notify],
  )

  const deleteExperience = useCallback(
    (id: string) => {
      setExperiences((prev) => prev.filter((experience) => experience.id !== id))
      notify('Expérience supprimée du catalogue.', 'info')
    },
    [notify],
  )

  const duplicateExperience = useCallback(
    (id: string) => {
      const original = experiences.find((experience) => experience.id === id)
      if (!original) return
      const copy: Experience = {
        ...original,
        id: `exp-${Date.now().toString(36)}`,
        title: `${original.title} — copie`,
        slug: `${original.slug}-copie`,
        status: 'draft',
        createdAt: new Date().toISOString(),
      }
      setExperiences((prev) => [copy, ...prev])
      notify('Expérience dupliquée en brouillon.')
    },
    [experiences, notify],
  )

  const addSupplier = useCallback<StoreContextValue['addSupplier']>(
    (supplier) => {
      const created: Supplier = { ...supplier, id: makeId('sup') }
      setSuppliers((prev) => [created, ...prev])
      notify('Fournisseur ajouté au répertoire.')
      return created
    },
    [notify],
  )

  const updateSupplier = useCallback(
    (id: string, patch: Partial<Supplier>) => {
      setSuppliers((prev) => prev.map((supplier) => (supplier.id === id ? { ...supplier, ...patch } : supplier)))
      notify('Fiche fournisseur mise à jour.')
    },
    [notify],
  )

  const deleteSupplier = useCallback(
    (id: string) => {
      const linked = experiences.filter((experience) => experience.supplierId === id)
      if (linked.length > 0) {
        notify(`Ce fournisseur est lié à ${linked.length} expérience(s). Modifiez-les avant de le supprimer.`, 'error')
        return false
      }
      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id))
      notify('Fournisseur supprimé.', 'info')
      return true
    },
    [experiences, notify],
  )

  const addClient = useCallback<StoreContextValue['addClient']>(
    (client) => {
      const created: Client = { ...client, id: makeId('cli') }
      setClients((prev) => [created, ...prev])
      notify('Nouveau client créé.')
      return created
    },
    [notify],
  )

  const updateClient = useCallback(
    (id: string, patch: Partial<Client>) => {
      setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...patch } : client)))
      notify('Fiche client mise à jour.')
    },
    [notify],
  )

  const deleteClient = useCallback(
    (id: string) => {
      if (bookings.some((booking) => booking.clientId === id)) {
        notify('Impossible de supprimer un client ayant des réservations. Archivez-le à la place.', 'error')
        return false
      }
      setClients((prev) => prev.filter((client) => client.id !== id))
      if (currentClientId === id) setCurrentClientId(null)
      notify('Client supprimé.', 'info')
      return true
    },
    [bookings, currentClientId, notify],
  )

  const validatePromo = useCallback(
    (rawCode: string, subtotal: number) => {
      const code = rawCode.trim().toUpperCase()
      if (!code) return { valid: false, discount: 0, message: 'Saisissez un code.' }
      const promo = promoCodes.find((item) => item.code === code)
      if (!promo) return { valid: false, discount: 0, message: 'Ce code n’existe pas.' }
      if (!promo.active) return { valid: false, discount: 0, message: 'Ce code n’est plus actif.' }
      if (promo.uses >= promo.maxUses) return { valid: false, discount: 0, message: 'Ce code a atteint sa limite.' }
      if (subtotal < promo.minSpend)
        return {
          valid: false,
          discount: 0,
          message: `Ce code est valable dès ${promo.minSpend} € d’achat.`,
        }
      const discount =
        promo.type === 'percent' ? Math.round(subtotal * (promo.value / 100) * 100) / 100 : promo.value
      return { valid: true, discount, message: `Code appliqué : −${promo.value}${promo.type === 'percent' ? ' %' : ' €'}`, promo }
    },
    [promoCodes],
  )

  const usePromo = useCallback((code: string) => {
    setPromoCodes((prev) => prev.map((promo) => (promo.code === code ? { ...promo, uses: promo.uses + 1 } : promo)))
  }, [])

  const addPromo = useCallback<StoreContextValue['addPromo']>(
    (promo) => {
      const created: PromoCode = { ...promo, id: makeId('promo'), uses: 0 }
      setPromoCodes((prev) => [created, ...prev])
      notify('Nouveau code promo créé.')
      return created
    },
    [notify],
  )

  const updatePromo = useCallback(
    (id: string, patch: Partial<PromoCode>) => {
      setPromoCodes((prev) => prev.map((promo) => (promo.id === id ? { ...promo, ...patch } : promo)))
      notify('Code promo mis à jour.')
    },
    [notify],
  )

  const deletePromo = useCallback(
    (id: string) => {
      setPromoCodes((prev) => prev.filter((promo) => promo.id !== id))
      notify('Code promo supprimé.', 'info')
    },
    [notify],
  )

  const addPost = useCallback<StoreContextValue['addPost']>(
    (post) => {
      const created: BlogPost = { ...post, id: makeId('post') }
      setBlogPosts((prev) => [created, ...prev])
      notify('Article créé.')
      return created
    },
    [notify],
  )

  const updatePost = useCallback(
    (id: string, patch: Partial<BlogPost>) => {
      setBlogPosts((prev) => prev.map((post) => (post.id === id ? { ...post, ...patch } : post)))
      notify('Article mis à jour.')
    },
    [notify],
  )

  const deletePost = useCallback(
    (id: string) => {
      setBlogPosts((prev) => prev.filter((post) => post.id !== id))
      notify('Article supprimé.', 'info')
    },
    [notify],
  )

  const resetDemo = useCallback(() => {
    Object.values(KEYS).forEach((key) => window.localStorage.removeItem(key))
    setExperiences(seedExperiences)
    setSuppliers(seedSuppliers)
    setClients(seedClients)
    setBookings(seedBookings)
    setBlogPosts(seedPosts)
    setPromoCodes(seedPromos)
    setFavorites(['exp-kyoto', 'exp-islande'])
    setCurrentClientId(null)
    notify('Données de démonstration réinitialisées.', 'info')
  }, [notify])

  const value: StoreContextValue = {
    experiences,
    suppliers,
    clients,
    bookings,
    blogPosts,
    promoCodes,
    favorites,
    currentClient,
    currentClientId,
    toasts,
    login,
    logout,
    signup,
    notify,
    dismissToast,
    toggleFavorite,
    createBooking,
    updateBooking,
    setBookingStatus,
    addExperience,
    updateExperience,
    deleteExperience,
    duplicateExperience,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addClient,
    updateClient,
    deleteClient,
    addPromo,
    updatePromo,
    deletePromo,
    validatePromo,
    usePromo,
    addPost,
    updatePost,
    deletePost,
    resetDemo,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
