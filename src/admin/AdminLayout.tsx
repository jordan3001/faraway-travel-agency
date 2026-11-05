import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  ChevronDown,
  CircleHelp,
  Command,
  Compass,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Sparkles,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import Logo from '../components/Logo'
import { formatDateShort, formatPrice } from '../lib/utils'

const navGroups = [
  {
    label: 'Pilotage',
    items: [
      { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
      { to: '/admin/reservations', label: 'Réservations', icon: Ticket, countKey: 'pending-bookings' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { to: '/admin/experiences', label: 'Expériences', icon: Compass, countKey: 'active-experiences' },
      { to: '/admin/tarifs', label: 'Tarifs & offres', icon: CreditCard },
    ],
  },
  {
    label: 'Relation client',
    items: [
      { to: '/admin/clients', label: 'Clients', icon: Users, countKey: 'clients' },
      { to: '/admin/fournisseurs', label: 'Fournisseurs', icon: Building2 },
    ],
  },
  {
    label: 'Contenus',
    items: [{ to: '/admin/journal', label: 'Journal', icon: BookOpen }],
  },
]

export default function AdminLayout() {
  const { bookings, experiences, clients, blogPosts } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length
  const counts: Record<string, number> = {
    'pending-bookings': pendingBookings,
    'active-experiences': experiences.filter((exp) => exp.status === 'active').length,
    clients: clients.length,
  }

  const title = useMemo(() => {
    if (pathname === '/admin') return 'Tableau de bord'
    if (pathname.startsWith('/admin/reservations')) return 'Réservations'
    if (pathname.startsWith('/admin/experiences')) return 'Expériences'
    if (pathname.startsWith('/admin/clients')) return 'Clients'
    if (pathname.startsWith('/admin/tarifs')) return 'Tarifs & offres'
    if (pathname.startsWith('/admin/fournisseurs')) return 'Fournisseurs'
    if (pathname.startsWith('/admin/journal')) return 'Journal'
    return 'Administration'
  }, [pathname])

  useEffect(() => {
    setSidebarOpen(false)
    setNotifOpen(false)
    setUserOpen(false)
  }, [pathname])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add('menu-open')
    else document.body.classList.remove('menu-open')
    return () => document.body.classList.remove('menu-open')
  }, [sidebarOpen])

  const query = search.trim().toLowerCase()
  const searchExperiences = query
    ? experiences.filter((exp) => `${exp.title} ${exp.destination}`.toLowerCase().includes(query)).slice(0, 3)
    : []
  const searchBookings = query
    ? bookings.filter((booking) => booking.reference.toLowerCase().includes(query)).slice(0, 2)
    : []
  const searchClients = query
    ? clients
        .filter((client) => `${client.firstName} ${client.lastName} ${client.email}`.toLowerCase().includes(query))
        .slice(0, 3)
    : []

  const goFromSearch = (path: string) => {
    setSearchOpen(false)
    setSearch('')
    navigate(path)
  }

  const recentNotifs = [...bookings]
    .filter((booking) => booking.status === 'pending' || booking.status === 'confirmed')
    .slice(0, 4)

  return (
    <div className="admin-shell">
      {sidebarOpen && <button className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" />}
      <aside className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Logo light compact />
          <span>ADMIN</span>
          <button className="admin-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Fermer">
            <X />
          </button>
        </div>
        <div className="admin-sidebar__workspace">
          <span className="admin-workspace__mark">F</span>
          <div>
            <strong>Faraway Travel</strong>
            <small>Bruxelles · Agence</small>
          </div>
          <ChevronDown />
        </div>
        <nav className="admin-nav">
          {navGroups.map((group) => (
            <div key={group.label} className="admin-nav__group">
              <span className="admin-nav__label">{group.label}</span>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) => `admin-nav__link${isActive ? ' is-active' : ''}`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.countKey && counts[item.countKey] > 0 && <small>{counts[item.countKey]}</small>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar__help">
          <span className="admin-sidebar__help-icon">
            <CircleHelp />
          </span>
          <div>
            <strong>Besoin d’aide ?</strong>
            <p>Notre équipe support est disponible du lundi au vendredi.</p>
            <a href="mailto:support@faraway.be">Contacter le support</a>
          </div>
        </div>
        <div className="admin-sidebar__foot">
          <div className="admin-profile">
            <span className="admin-avatar">CL</span>
            <div>
              <strong>Camille Laurent</strong>
              <small>Administratrice</small>
            </div>
            <Settings />
          </div>
          <div className="admin-sidebar__links">
            <Link to="/">
              <ExternalLink /> Voir le site
            </Link>
            <span className="admin-demo-badge">
              <Sparkles /> Mode démo
            </span>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">
              <Menu />
            </button>
            <span className="admin-breadcrumb">Administration / <strong>{title}</strong></span>
          </div>
          <div className="admin-topbar__right">
            <button className="admin-topbar__search" onClick={() => setSearchOpen(true)}>
              <Search />
              <span>Rechercher…</span>
              <kbd>
                <Command /> K
              </kbd>
            </button>
            <div className="admin-popover-wrap">
              <button
                className={`admin-icon-btn${notifOpen ? ' is-active' : ''}`}
                onClick={() => {
                  setNotifOpen((value) => !value)
                  setUserOpen(false)
                }}
                aria-label="Notifications"
              >
                <Bell />
                <span className="admin-notif-dot" />
              </button>
              {notifOpen && (
                <div className="admin-popover admin-notifications">
                  <div className="admin-popover__head">
                    <strong>Notifications</strong>
                    <span>{recentNotifs.length} nouvelles</span>
                  </div>
                  {recentNotifs.map((booking) => {
                    const exp = experiences.find((item) => item.id === booking.experienceId)
                    const client = clients.find((item) => item.id === booking.clientId)
                    return (
                      <button
                        key={booking.id}
                        onClick={() => goFromSearch(`/admin/reservations?booking=${booking.id}`)}
                      >
                        <span className={`admin-notif-icon admin-notif-icon--${booking.status}`}>
                          <Ticket />
                        </span>
                        <span>
                          <strong>Réservation {booking.reference}</strong>
                          <small>
                            {client?.firstName} {client?.lastName} · {exp?.title.split(',')[0]}
                          </small>
                          <em>{formatDateShort(booking.createdAt)}</em>
                        </span>
                      </button>
                    )
                  })}
                  <Link to="/admin/reservations" className="admin-popover__foot">
                    Voir toutes les réservations <ArrowUpRight />
                  </Link>
                </div>
              )}
            </div>
            <div className="admin-popover-wrap">
              <button
                className={`admin-user-chip${userOpen ? ' is-active' : ''}`}
                onClick={() => {
                  setUserOpen((value) => !value)
                  setNotifOpen(false)
                }}
              >
                <span className="admin-avatar">CL</span>
                <span>
                  <strong>Camille Laurent</strong>
                  <small>Administratrice</small>
                </span>
                <ChevronDown />
              </button>
              {userOpen && (
                <div className="admin-popover admin-user-menu">
                  <button onClick={() => navigate('/admin')}>
                    <LayoutDashboard /> Tableau de bord
                  </button>
                  <button onClick={() => navigate('/admin/clients')}>
                    <Users /> Équipe & clients
                  </button>
                  <button onClick={() => navigate('/')}>
                    <ExternalLink /> Voir le site
                  </button>
                  <hr />
                  <button onClick={() => navigate('/')}>
                    <LogOut /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
        <footer className="admin-footer">
          <span>© 2026 Faraway Travel Agency · Back-office démo</span>
          <span>Dernière synchronisation : à l’instant</span>
        </footer>
      </div>

      {searchOpen && (
        <div className="admin-search-overlay">
          <button className="admin-search-overlay__backdrop" onClick={() => setSearchOpen(false)} aria-label="Fermer la recherche" />
          <div className="admin-search-panel">
            <div className="admin-search-panel__input">
              <Search />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une réservation, un client, une expérience…"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X />
              </button>
            </div>
            {!query ? (
              <div className="admin-search-panel__quick">
                <span className="admin-nav__label">Accès rapides</span>
                <div>
                  <button onClick={() => goFromSearch('/admin/reservations?new=1')}>
                    <CalendarCheck /> Nouvelle réservation
                  </button>
                  <button onClick={() => goFromSearch('/admin/experiences?new=1')}>
                    <Package /> Nouvelle expérience
                  </button>
                  <button onClick={() => goFromSearch('/admin/tarifs')}>
                    <CreditCard /> Gérer les tarifs
                  </button>
                  <button onClick={() => goFromSearch('/admin/journal')}>
                    <BookOpen /> Écrire un article
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-search-panel__results">
                {searchExperiences.length > 0 && (
                  <div>
                    <span className="admin-nav__label">Expériences</span>
                    {searchExperiences.map((exp) => (
                      <button key={exp.id} onClick={() => goFromSearch(`/admin/experiences?edit=${exp.id}`)}>
                        <img src={exp.image} alt="" />
                        <span>
                          <strong>{exp.title}</strong>
                          <small>{exp.category} · {formatPrice(exp.price)}</small>
                        </span>
                        <ArrowUpRight />
                      </button>
                    ))}
                  </div>
                )}
                {searchBookings.length > 0 && (
                  <div>
                    <span className="admin-nav__label">Réservations</span>
                    {searchBookings.map((booking) => (
                      <button key={booking.id} onClick={() => goFromSearch(`/admin/reservations?booking=${booking.id}`)}>
                        <span className="admin-search-panel__icon">
                          <Ticket />
                        </span>
                        <span>
                          <strong>{booking.reference}</strong>
                          <small>{formatDateShort(booking.date)} · {formatPrice(booking.total)}</small>
                        </span>
                        <ArrowUpRight />
                      </button>
                    ))}
                  </div>
                )}
                {searchClients.length > 0 && (
                  <div>
                    <span className="admin-nav__label">Clients</span>
                    {searchClients.map((client) => (
                      <button key={client.id} onClick={() => goFromSearch(`/admin/clients?client=${client.id}`)}>
                        <span className="admin-search-panel__icon">
                          <Users />
                        </span>
                        <span>
                          <strong>{client.firstName} {client.lastName}</strong>
                          <small>{client.email}</small>
                        </span>
                        <ArrowUpRight />
                      </button>
                    ))}
                  </div>
                )}
                {searchExperiences.length + searchBookings.length + searchClients.length === 0 && (
                  <p className="admin-search-panel__empty">Aucun résultat pour « {search} ».</p>
                )}
              </div>
            )}
            <div className="admin-search-panel__footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span>
              <span><kbd>Esc</kbd> fermer</span>
              <span className="admin-search-panel__footer-brand"><Sparkles /> {blogPosts.length} articles publiés</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

