import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'

const faqs = [
  {
    question: 'Combien de temps à l’avance faut-il réserver ?',
    answer:
      'Pour les parcs et city breaks, deux à six semaines suffisent souvent. Pour les voyages signature (Japon, safari, Islande), nous recommandons trois à six mois pour obtenir les meilleures disponibilités.',
  },
  {
    question: 'Puis-je personnaliser une expérience du catalogue ?',
    answer:
      'Bien sûr. Dates, durée, hôtel, rythme, activités : la plupart de nos voyages peuvent être adaptés. Écrivez-nous avec vos envies et nous vous proposerons une version sur mesure.',
  },
  {
    question: 'Comment se passent les paiements ?',
    answer:
      'Vous pouvez régler en ligne par carte ou Bancontact, ou choisir un virement. Un acompte de 30 % suffit pour confirmer la plupart des séjours, le solde étant dû 30 jours avant le départ.',
  },
  {
    question: 'Que se passe-t-il en cas d’imprévu ?',
    answer:
      'Chaque expérience dispose de ses propres conditions d’annulation, précisées sur la fiche. Notre équipe reste joignable pendant votre voyage et nos partenaires locaux peuvent intervenir rapidement.',
  },
]

export default function Contact() {
  const { currentClient, notify } = useStore()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    firstName: currentClient?.firstName ?? '',
    lastName: currentClient?.lastName ?? '',
    email: currentClient?.email ?? '',
    phone: currentClient?.phone ?? '',
    project: 'Une expérience du catalogue',
    destination: '',
    dates: '',
    travellers: '2',
    message: '',
    consent: false,
  })

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.firstName || !form.lastName || !/^\S+@\S+\.\S+$/.test(form.email) || !form.message) {
      notify('Merci de renseigner votre nom, votre e-mail et votre message.', 'error')
      return
    }
    if (!form.consent) {
      notify('Merci d’accepter que nous utilisions vos coordonnées pour vous répondre.', 'error')
      return
    }
    setSubmitted(true)
    notify('Votre message est bien arrivé. Nous vous répondons sous 24 h ouvrées.')
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Contact' }]} />
          <div className="contact-hero__layout">
            <div>
              <span className="eyebrow">Parlons de votre prochain voyage</span>
              <h1 className="h1">
                Et si on partait <span className="italic">ensemble ?</span>
              </h1>
            </div>
            <p>
              Une question, une envie floue, un projet précis ? Écrivez-nous. Un conseiller spécialisé vous répond
              sous 24 h ouvrées, avec des idées — pas un discours de vente.
            </p>
          </div>
        </div>
      </section>

      <div className="contact-layout container">
        <aside className="contact-aside">
          <Reveal>
            <div className="contact-advisor">
              <div className="contact-advisor__head">
                <span className="contact-advisor__avatar">
                  <Sparkles />
                </span>
                <div>
                  <span className="small-label">Votre premier contact</span>
                  <strong>Camille & l’équipe Faraway</strong>
                </div>
              </div>
              <p>
                Nous prenons le temps de lire chaque message. Décrivez-nous votre projet, même imparfaitement :
                c’est souvent là que commencent les plus beaux voyages.
              </p>
              <div className="contact-advisor__contact">
                <a href="tel:+3225550824">
                  <Phone />
                  <span>
                    <small>Téléphone</small>
                    +32 2 555 08 24
                  </span>
                </a>
                <a href="mailto:hello@faraway.be">
                  <Mail />
                  <span>
                    <small>E-mail</small>
                    hello@faraway.be
                  </span>
                </a>
                <div>
                  <MapPin />
                  <span>
                    <small>Agence</small>
                    Rue de l’Horizon 24, 1000 Bruxelles
                  </span>
                </div>
                <div>
                  <Clock />
                  <span>
                    <small>Horaires</small>
                    Lun — Ven : 9 h — 18 h 30 · Sam : 10 h — 13 h
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="contact-map">
              <div className="contact-map__art" aria-hidden="true">
                <span className="contact-map__road contact-map__road--1" />
                <span className="contact-map__road contact-map__road--2" />
                <span className="contact-map__road contact-map__road--3" />
                <span className="contact-map__ring" />
                <span className="contact-map__pin">
                  <MapPin />
                </span>
                <span className="contact-map__label">Faraway</span>
              </div>
              <div className="contact-map__footer">
                <span>
                  <MapPin /> Bruxelles, centre
                </span>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Bruxelles+Grand+Place"
                  target="_blank"
                  rel="noreferrer"
                >
                  Itinéraire <ArrowUpRight />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="contact-aside__note">
              <MessageCircle />
              <p>
                Vous préférez un rendez-vous ? Nous recevons à l’agence du mardi au samedi, sur rendez-vous.
                Demandez un créneau dans votre message.
              </p>
            </div>
          </Reveal>
        </aside>

        <main className="contact-main">
          <Reveal>
            {submitted ? (
              <div className="contact-success">
                <span className="contact-success__icon">
                  <Check />
                </span>
                <span className="eyebrow">Message envoyé</span>
                <h2 className="h2">Votre histoire est entre de bonnes mains.</h2>
                <p>
                  Merci {form.firstName}. Nous avons bien reçu votre message et vous répondrons à{' '}
                  <strong>{form.email}</strong> sous 24 h ouvrées. En attendant, laissez-vous inspirer par le
                  journal.
                </p>
                <div className="contact-success__actions">
                  <Link to="/experiences" className="btn btn--dark">
                    Explorer les voyages <ArrowRight />
                  </Link>
                  <button className="btn btn--outline" onClick={() => setSubmitted(false)}>
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit}>
                <div className="contact-form__head">
                  <span className="eyebrow">Écrivez-nous</span>
                  <h2 className="h2">Racontez-nous votre projet.</h2>
                  <p>Les champs marqués d’un astérisque sont obligatoires.</p>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="contact-first">Prénom *</label>
                    <input
                      id="contact-first"
                      className="input"
                      value={form.firstName}
                      onChange={(event) => update('firstName', event.target.value)}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-last">Nom *</label>
                    <input
                      id="contact-last"
                      className="input"
                      value={form.lastName}
                      onChange={(event) => update('lastName', event.target.value)}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="contact-email">E-mail *</label>
                    <input
                      id="contact-email"
                      type="email"
                      className="input"
                      value={form.email}
                      onChange={(event) => update('email', event.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-phone">Téléphone</label>
                    <input
                      id="contact-phone"
                      className="input"
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="contact-project">Votre projet</label>
                  <select
                    id="contact-project"
                    className="select"
                    value={form.project}
                    onChange={(event) => update('project', event.target.value)}
                  >
                    <option>Une expérience du catalogue</option>
                    <option>Un voyage entièrement sur mesure</option>
                    <option>Un week-end en famille ou entre amis</option>
                    <option>Un événement ou un anniversaire</option>
                    <option>Une question sur une réservation</option>
                    <option>Autre demande</option>
                  </select>
                </div>
                <div className="form-row form-row--3">
                  <div className="field">
                    <label htmlFor="contact-destination">Destination rêvée</label>
                    <input
                      id="contact-destination"
                      className="input"
                      value={form.destination}
                      onChange={(event) => update('destination', event.target.value)}
                      placeholder="Japon, Italie, ailleurs…"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-dates">Dates envisagées</label>
                    <input
                      id="contact-dates"
                      className="input"
                      value={form.dates}
                      onChange={(event) => update('dates', event.target.value)}
                      placeholder="Printemps 2027"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-travellers">Voyageurs</label>
                    <select
                      id="contact-travellers"
                      className="select"
                      value={form.travellers}
                      onChange={(event) => update('travellers', event.target.value)}
                    >
                      <option value="1">1 personne</option>
                      <option value="2">2 personnes</option>
                      <option value="3">3 personnes</option>
                      <option value="4">4 personnes</option>
                      <option value="5">5 personnes</option>
                      <option value="6+">6 personnes et plus</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="contact-message">Votre message *</label>
                  <textarea
                    id="contact-message"
                    className="textarea"
                    value={form.message}
                    onChange={(event) => update('message', event.target.value)}
                    placeholder="Ce que vous aimeriez vivre, ce qui vous ferait plaisir, ce que vous voulez éviter…"
                  />
                </div>
                <label className="checkbox contact-consent">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => update('consent', event.target.checked)}
                  />
                  J’accepte que Faraway utilise mes coordonnées pour répondre à ma demande, conformément à la{' '}
                  <Link to="/agence#confidentialite">politique de confidentialité</Link>.
                </label>
                <div className="contact-form__foot">
                  <button type="submit" className="btn btn--accent">
                    Envoyer mon message <Send />
                  </button>
                  <span>
                    <Sparkles /> Réponse sous 24 h ouvrées
                  </span>
                </div>
              </form>
            )}
          </Reveal>

          <section className="contact-faq">
            <div className="contact-faq__head">
              <span className="eyebrow">Questions fréquentes</span>
              <h2 className="h3">Vous vous demandez peut-être…</h2>
            </div>
            {faqs.map((faq, index) => (
              <div key={faq.question} className={`contact-faq__item${openFaq === index ? ' is-open' : ''}`}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <span>{faq.question}</span>
                  <ChevronDown />
                </button>
                {openFaq === index && <p>{faq.answer}</p>}
              </div>
            ))}
          </section>
        </main>
      </div>

      <section className="contact-bottom">
        <div className="container">
          <CalendarDays />
          <p>
            Vous préférez être rappelé·e ? Laissez-nous votre numéro dans le formulaire, nous vous appelons au
            moment qui vous convient.
          </p>
          <Link to="/journal" className="text-link">
            Lire le journal en attendant <ArrowUpRight />
          </Link>
        </div>
      </section>
    </div>
  )
}
