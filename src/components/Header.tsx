import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { categories } from '../data/data'
import Logo from './Logo'
import SearchOverlay from './SearchOverlay'

const navItems = [
  { label: 'Expériences', to: '/experiences' },
  { label: 'Journal', to: '/journal' },
  { label: "L'agence", to: '/agence' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { currentClient, favorites } = useStore()

  const isImmersive = pathname === '/' || /^\/experiences\/[^/]+$/.test(pathname) || /^\/journal\/[^/]+$/.test(pathname)
  const transparent = isImmersive && !scrolled && !mobileOpen

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMegaOpen(false)
    setMobileOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) document.body.classList.add('menu-open')
    else document.body.classList.remove('menu-open')
    return () => document.body.classList.remove('menu-open')
  }, [mobileOpen])

  const goToCategory = (category: string) => {
    setMegaOpen(false)
    navigate(`/experiences?category=${encodeURIComponent(category)}`)
  }

  return (
    <>
      <div className={`header-shell${scrolled ? ' header-shell--scrolled' : ''}`}>
        <div className="announcement">
          <div className="container announcement__inner">
            <p>
              <Sparkles />
              <span>Collection 2027 — </span>
              <strong>−10 % sur votre première escapade</strong>
              <span className="announcement__code">avec le code FARAWAY10</span>
            </p>
            <Link to="/experiences">
              En profiter <ArrowUpRight />
            </Link>
          </div>
        </div>
        <header
          className={[
            'site-header',
            transparent ? 'site-header--transparent' : 'site-header--solid',
            scrolled ? 'is-scrolled' : '',
          ].join(' ')}
        >
          <div className="container site-header__inner">
            <Logo light={transparent} />
            <nav className="site-nav" aria-label="Navigation principale">
              <div
                className={`site-nav__item site-nav__item--mega${megaOpen ? ' is-open' : ''}`}
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button
                  className="site-nav__link site-nav__link--button"
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                  onClick={() => setMegaOpen((value) => !value)}
                >
                  Destinations
                  <ChevronDown />
                </button>
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      className="mega-panel"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="container mega-panel__inner">
                        <div className="mega-panel__intro">
                          <span className="eyebrow">Explorer par univers</span>
                          <div className="mega-panel__categories">
                            {categories.map((category) => (
                              <button
                                key={category.name}
                                onClick={() => goToCategory(category.name)}
                                className="mega-category"
                              >
                                <span>
                                  <strong>{category.name}</strong>
                                  <small>{category.description}</small>
                                </span>
                                <ArrowUpRight />
                              </button>
                            ))}
                          </div>
                          <Link to="/experiences" className="text-link" onClick={() => setMegaOpen(false)}>
                            Voir tout le catalogue <ArrowUpRight />
                          </Link>
                        </div>
                        <div className="mega-panel__features">
                          <Link to="/experiences/disneyland-paris-la-magie-en-grand" className="mega-feature">
                            <img src="/images/disney-castle.jpg" alt="Château de Disneyland Paris" />
                            <span>
                              <small>Coup de cœur</small>
                              <strong>La magie en grand</strong>
                            </span>
                          </Link>
                          <Link to="/experiences/safari-tanzanie-sur-les-traces-de-la-grande-migration" className="mega-feature">
                            <img src="/images/safari.jpg" alt="Éléphant dans la savane" />
                            <span>
                              <small>Voyage signature</small>
                              <strong>La grande migration</strong>
                            </span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`site-nav__link${pathname === item.to ? ' is-active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="site-header__actions">
              <button className="icon-btn header-icon" onClick={() => setSearchOpen(true)} aria-label="Rechercher">
                <Search />
              </button>
              <Link to="/espace-client?tab=favoris" className="icon-btn header-icon header-favorite" aria-label="Mes favoris">
                <Heart />
                {favorites.length > 0 && <span className="icon-btn__badge">{favorites.length}</span>}
              </Link>
              <Link to={currentClient ? '/espace-client' : '/connexion'} className="account-link" aria-label="Mon espace">
                {currentClient ? (
                  <span className="account-link__avatar">
                    {currentClient.firstName[0]}
                    {currentClient.lastName[0]}
                  </span>
                ) : (
                  <span className="icon-btn header-icon">
                    <UserRound />
                  </span>
                )}
                <span className="account-link__label">
                  <small>{currentClient ? 'Bonjour' : 'Mon espace'}</small>
                  <strong>{currentClient ? currentClient.firstName : 'Se connecter'}</strong>
                </span>
              </Link>
              <Link to="/experiences" className="btn btn--accent btn--sm site-header__cta">
                Créer mon voyage <ArrowUpRight />
              </Link>
              <button className="mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
                <Menu />
              </button>
            </div>
          </div>
        </header>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-menu__head container">
              <Logo light />
              <button className="icon-btn mobile-menu__close" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu">
                <X />
              </button>
            </div>
            <div className="mobile-menu__body container">
              <div className="mobile-menu__main">
                <Link to="/" onClick={() => setMobileOpen(false)} className="mobile-menu__link">
                  Accueil <ArrowUpRight />
                </Link>
                <Link to="/experiences" onClick={() => setMobileOpen(false)} className="mobile-menu__link">
                  Toutes les expériences <ArrowUpRight />
                </Link>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setMobileOpen(false)
                      navigate(`/experiences?category=${encodeURIComponent(category.name)}`)
                    }}
                    className="mobile-menu__link mobile-menu__link--sm"
                  >
                    {category.name}
                  </button>
                ))}
                <hr />
                {navItems.slice(1).map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="mobile-menu__link">
                    {item.label} <ArrowUpRight />
                  </Link>
                ))}
                <Link to={currentClient ? '/espace-client' : '/connexion'} onClick={() => setMobileOpen(false)} className="mobile-menu__link">
                  {currentClient ? `Espace de ${currentClient.firstName}` : 'Mon espace'} <ArrowUpRight />
                </Link>
              </div>
              <div className="mobile-menu__aside">
                <Link to="/experiences/disneyland-paris-la-magie-en-grand" onClick={() => setMobileOpen(false)}>
                  <img src="/images/disney-castle.jpg" alt="Disneyland Paris" />
                  <span className="eyebrow">En ce moment</span>
                  <strong>La magie, à deux heures de Bruxelles.</strong>
                  <span className="text-link text-link--light">
                    Découvrir <ArrowUpRight />
                  </span>
                </Link>
              </div>
            </div>
            <div className="mobile-menu__foot container">
              <span>Bruxelles · Belgique</span>
              <span>hello@faraway.be</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
