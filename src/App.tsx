import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ToastStack from './components/ToastStack'
import RouteMeta from './components/RouteMeta'
import Home from './pages/Home'

const Experiences = lazy(() => import('./pages/Experiences'))
const ExperienceDetail = lazy(() => import('./pages/ExperienceDetail'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Confirmation = lazy(() => import('./pages/Confirmation'))
const Journal = lazy(() => import('./pages/Journal'))
const JournalPost = lazy(() => import('./pages/JournalPost'))
const Agency = lazy(() => import('./pages/Agency'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const ClientAccount = lazy(() => import('./pages/ClientAccount'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const AdminBookings = lazy(() => import('./admin/AdminBookings'))
const AdminProducts = lazy(() => import('./admin/AdminProducts'))
const AdminClients = lazy(() => import('./admin/AdminClients'))
const AdminPricing = lazy(() => import('./admin/AdminPricing'))
const AdminSuppliers = lazy(() => import('./admin/AdminSuppliers'))
const AdminEditorial = lazy(() => import('./admin/AdminEditorial'))

function PublicLayout() {
  const { pathname } = useLocation()
  const immersive =
    pathname === '/' ||
    /^\/experiences\/[^/]+$/.test(pathname) ||
    /^\/journal\/[^/]+$/.test(pathname)
  const hideFooter = pathname.startsWith('/reservation/')

  return (
    <div className="site-shell">
      <Header />
      <main className={`site-main${immersive ? ' site-main--immersive' : ''}`}>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      <div className="grain-overlay" />
    </div>
  )
}

function RouteFallback() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) {
    return (
      <div className="admin-route-loader">
        <span className="admin-route-loader__mark">F</span>
        <span>Chargement du back-office…</span>
      </div>
    )
  }
  return (
    <div className="public-route-loader">
      <span>faraway</span>
      <i />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RouteMeta />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/experiences/:slug" element={<ExperienceDetail />} />
            <Route path="/reservation/:slug" element={<Checkout />} />
            <Route path="/confirmation/:reference" element={<Confirmation />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:slug" element={<JournalPost />} />
            <Route path="/agence" element={<Agency />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/espace-client" element={<ClientAccount />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/connexion" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<AdminBookings />} />
            <Route path="experiences" element={<AdminProducts />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="tarifs" element={<AdminPricing />} />
            <Route path="fournisseurs" element={<AdminSuppliers />} />
            <Route path="journal" element={<AdminEditorial />} />
            <Route path="*" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
      <ToastStack />
    </>
  )
}
