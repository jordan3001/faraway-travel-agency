import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useStore } from '../store/StoreContext'

type Mode = 'login' | 'signup'

export default function Login() {
  const { login, signup, currentClient, notify } = useStore()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
  })
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/espace-client'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  if (currentClient) {
    return <Navigate to={from} replace />
  }

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      notify('Renseignez votre e-mail et votre mot de passe.', 'error')
      return
    }
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 420))
    const success = login(loginForm.email, loginForm.password)
    setLoading(false)
    if (success) navigate(from)
  }

  const submitSignup = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!signupForm.firstName || !signupForm.lastName) {
      notify('Indiquez votre prénom et votre nom.', 'error')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(signupForm.email)) {
      notify('Saisissez une adresse e-mail valide.', 'error')
      return
    }
    if (signupForm.password.length < 6) {
      notify('Choisissez un mot de passe de 6 caractères minimum.', 'error')
      return
    }
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 420))
    const success = signup(signupForm)
    setLoading(false)
    if (success) navigate('/espace-client')
  }

  const fillDemo = () => {
    setMode('login')
    setLoginForm({ email: 'claire.dubois@example.be', password: 'faraway' })
    notify('Identifiants de démonstration pré-remplis.', 'info')
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src="/images/santorini.jpg" alt="Maisons blanches de Santorin face à la mer Égée" />
        <div className="auth-visual__overlay" />
        <div className="auth-visual__top">
          <Logo light />
          <Link to="/" className="auth-visual__back">
            Retour au site <ArrowRight />
          </Link>
        </div>
        <div className="auth-visual__quote">
          <span className="eyebrow">L’espace des voyageurs</span>
          <blockquote>
            « Un voyage ne se termine jamais vraiment. <em>Il continue dans les souvenirs.</em> »
          </blockquote>
          <div className="auth-visual__author">
            <span>CD</span>
            <p>
              <strong>Claire Dubois</strong>
              <small>Voyageuse Faraway depuis 2021</small>
            </p>
          </div>
        </div>
        <div className="auth-visual__foot">
          <span>Bruxelles · Belgique</span>
          <span>Conçu pour vos histoires</span>
        </div>
      </div>

      <div className="auth-panel">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-card__brand">
            <Logo />
          </div>
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>
              Se connecter
            </button>
            <button className={mode === 'signup' ? 'is-active' : ''} onClick={() => setMode('signup')}>
              Créer un compte
            </button>
          </div>

          {mode === 'login' ? (
            <form className="auth-form" onSubmit={submitLogin}>
              <div className="auth-form__head">
                <span className="eyebrow">Heureux de vous revoir</span>
                <h1>Votre espace voyage.</h1>
                <p>Retrouvez vos réservations, vos billets et vos envies pour la suite.</p>
              </div>
              <div className="field">
                <label htmlFor="login-email">Adresse e-mail</label>
                <div className="auth-input">
                  <Mail />
                  <input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="vous@exemple.be"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="login-password">
                  Mot de passe{' '}
                  <button
                    type="button"
                    className="auth-forgot"
                    onClick={() => notify('Un lien de réinitialisation serait envoyé par e-mail.', 'info')}
                  >
                    Mot de passe oublié ?
                  </button>
                </label>
                <div className="auth-input">
                  <LockKeyhole />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Afficher le mot de passe">
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <label className="checkbox">
                <input type="checkbox" defaultChecked /> Se souvenir de moi
              </label>
              <button type="submit" className="btn btn--dark btn--block auth-submit" disabled={loading}>
                {loading ? 'Connexion…' : 'Se connecter'} <ArrowRight />
              </button>
              <div className="auth-demo">
                <div>
                  <Sparkles />
                  <p>
                    <strong>Envie de découvrir l’espace ?</strong>
                    <span>Compte démo : claire.dubois@example.be · mot de passe : faraway</span>
                  </p>
                </div>
                <button type="button" onClick={fillDemo}>
                  Utiliser le compte démo
                </button>
              </div>
              <p className="auth-switch">
                Pas encore de compte ?{' '}
                <button type="button" onClick={() => setMode('signup')}>
                  Créer mon espace
                </button>
              </p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={submitSignup}>
              <div className="auth-form__head">
                <span className="eyebrow">Bienvenue chez Faraway</span>
                <h1>Créons votre espace.</h1>
                <p>Vos voyages, vos envies et vos petits privilèges, au même endroit.</p>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="signup-firstname">Prénom</label>
                  <div className="auth-input">
                    <UserRound />
                    <input
                      id="signup-firstname"
                      value={signupForm.firstName}
                      onChange={(event) => setSignupForm((prev) => ({ ...prev, firstName: event.target.value }))}
                      placeholder="Claire"
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="signup-lastname">Nom</label>
                  <input
                    id="signup-lastname"
                    className="input"
                    value={signupForm.lastName}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    placeholder="Dubois"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="signup-email">Adresse e-mail</label>
                <div className="auth-input">
                  <Mail />
                  <input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="vous@exemple.be"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="signup-phone">Téléphone</label>
                  <input
                    id="signup-phone"
                    className="input"
                    value={signupForm.phone}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="+32 4XX XX XX XX"
                    autoComplete="tel"
                  />
                </div>
                <div className="field">
                  <label htmlFor="signup-city">Ville</label>
                  <input
                    id="signup-city"
                    className="input"
                    value={signupForm.city}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, city: event.target.value }))}
                    placeholder="Bruxelles"
                    autoComplete="address-level2"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="signup-password">Mot de passe</label>
                <div className="auth-input">
                  <LockKeyhole />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={signupForm.password}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="6 caractères minimum"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Afficher le mot de passe">
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <label className="checkbox">
                <input type="checkbox" defaultChecked /> Je souhaite recevoir les idées d’évasion Faraway.
              </label>
              <button type="submit" className="btn btn--dark btn--block auth-submit" disabled={loading}>
                {loading ? 'Création…' : 'Créer mon espace'} <ArrowRight />
              </button>
              <p className="auth-switch">
                Déjà client ?{' '}
                <button type="button" onClick={() => setMode('login')}>
                  Se connecter
                </button>
              </p>
            </form>
          )}
          <p className="auth-legal">
            En continuant, vous acceptez nos <Link to="/agence#cgv">conditions</Link> et notre{' '}
            <Link to="/agence#confidentialite">politique de confidentialité</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
