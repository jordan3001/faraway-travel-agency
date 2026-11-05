import { useState } from 'react'
import {
  ArrowUpRight,
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories } from '../data/data'
import { useStore } from '../store/StoreContext'
import Logo from './Logo'

export default function Footer() {
  const [email, setEmail] = useState('')
  const { notify } = useStore()

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      notify('Saisissez une adresse e-mail valide.', 'error')
      return
    }
    notify('Bienvenue dans la lettre Faraway. Votre code FARAWAY10 arrive par e-mail.')
    setEmail('')
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__newsletter">
          <div className="site-footer__newsletter-copy">
            <span className="eyebrow">La lettre Faraway</span>
            <h2 className="h3">
              Des idées d’évasion, <span className="italic">sans le bruit.</span>
            </h2>
            <p>Une lettre par mois. Nos coups de cœur, des conseils utiles et rien de plus.</p>
          </div>
          <form className="newsletter-form" onSubmit={subscribe}>
            <div className="newsletter-form__field">
              <Mail />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Votre adresse e-mail"
                aria-label="Votre adresse e-mail"
              />
              <button type="submit" aria-label="S'abonner">
                <Send />
              </button>
            </div>
            <p>En vous inscrivant, vous acceptez de recevoir nos e-mails. Désinscription en un clic.</p>
          </form>
        </div>

        <div className="site-footer__main">
          <div className="site-footer__brand">
            <Logo light />
            <p>
              Agence de voyages indépendante à Bruxelles. Depuis 2009, nous dessinons des échappées qui ont du
              sens — et beaucoup d’émotion.
            </p>
            <div className="site-footer__socials">
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin />
              </a>
            </div>
          </div>

          <div className="site-footer__link-col">
            <span className="site-footer__label">Explorer</span>
            {categories.map((category) => (
              <Link key={category.name} to={`/experiences?category=${encodeURIComponent(category.name)}`}>
                {category.name}
              </Link>
            ))}
          </div>

          <div className="site-footer__link-col">
            <span className="site-footer__label">L’agence</span>
            <Link to="/agence">Notre histoire</Link>
            <Link to="/agence#engagements">Nos engagements</Link>
            <Link to="/journal">Le journal</Link>
            <Link to="/contact">Nous contacter</Link>
            <Link to="/espace-client">Espace client</Link>
            <Link to="/admin" className="site-footer__admin">
              Back-office <ArrowUpRight />
            </Link>
          </div>

          <div className="site-footer__contact">
            <span className="site-footer__label">Nous trouver</span>
            <p>
              <MapPin />
              <span>
                Rue de l’Horizon 24
                <br />
                1000 Bruxelles, Belgique
              </span>
            </p>
            <p>
              <Phone />
              <a href="tel:+3225550824">+32 2 555 08 24</a>
            </p>
            <p>
              <Mail />
              <a href="mailto:hello@faraway.be">hello@faraway.be</a>
            </p>
            <div className="site-footer__hours">
              <span>Lun — Ven</span>
              <strong>9h00 — 18h30</strong>
              <span>Sam</span>
              <strong>10h00 — 13h00</strong>
            </div>
          </div>
        </div>

        <div className="site-footer__giant" aria-hidden="true">
          faraway
        </div>

        <div className="site-footer__bottom">
          <p>
            © 2026 Faraway Travel Agency. Tous droits réservés.
            <span className="site-footer__credits">Photos : Unsplash, Pexels et Wikimedia Commons (Ank Kumar, CC BY-SA 4.0).</span>
          </p>
          <div>
            <Link to="/agence#mentions">Mentions légales</Link>
            <Link to="/agence#cgv">Conditions de vente</Link>
            <Link to="/agence#confidentialite">Confidentialité</Link>
          </div>
          <p>Bruxelles · Belgique · TVA BE 0648.712.394</p>
        </div>
      </div>
    </footer>
  )
}
