import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  CreditCard,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
  WalletCards,
} from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import {
  bookingTotals,
  formatDateLong,
  formatPrice,
  toDateInput,
} from '../lib/utils'
import Breadcrumbs from '../components/Breadcrumbs'
import type { Booking } from '../types'

type PaymentMethod = 'bancontact' | 'card' | 'transfer'

const steps = ['Vos coordonnées', 'Paiement', 'Confirmation']

export default function Checkout() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { experiences, createBooking, currentClient, validatePromo, notify, promoCodes } = useStore()
  const experience = experiences.find((exp) => exp.slug === slug)

  const date = params.get('date') ?? ''
  const adults = Math.max(1, Number(params.get('adults') ?? 2))
  const children = Math.max(0, Number(params.get('children') ?? 0))
  const optionIds = (params.get('options') ?? '').split(',').filter(Boolean)

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bancontact')
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; message: string } | null>(null)
  const [promoMessage, setPromoMessage] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    firstName: currentClient?.firstName ?? '',
    lastName: currentClient?.lastName ?? '',
    email: currentClient?.email ?? '',
    phone: currentClient?.phone ?? '',
    address: '',
    postalCode: '',
    city: currentClient?.city ?? '',
    country: currentClient?.country ?? 'Belgique',
    newsletter: true,
    terms: false,
  })
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [step])

  useEffect(() => {
    if (currentClient) {
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || currentClient.firstName,
        lastName: prev.lastName || currentClient.lastName,
        email: prev.email || currentClient.email,
        phone: prev.phone || currentClient.phone,
        city: prev.city || currentClient.city,
        country: prev.country || currentClient.country,
      }))
    }
  }, [currentClient])

  const totals = useMemo(
    () => (experience ? bookingTotals(experience, adults, children, optionIds, appliedPromo?.discount ?? 0) : null),
    [experience, adults, children, optionIds, appliedPromo],
  )

  const selectedOptions = experience?.options.filter((option) => optionIds.includes(option.id)) ?? []

  if (!experience || !totals) {
    return (
      <div className="not-found-page">
        <div className="container not-found-page__inner">
          <span className="eyebrow">Réservation</span>
          <h1 className="h1">Cette expérience n’est plus disponible.</h1>
          <p>Retournez au catalogue pour choisir une autre escapade.</p>
          <Link to="/experiences" className="btn btn--dark">
            Voir le catalogue <ArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const applyPromo = () => {
    if (!promoInput.trim()) return
    const result = validatePromo(promoInput, totals.subtotal)
    setPromoMessage(result.message)
    if (result.valid && result.promo) {
      setAppliedPromo({ code: result.promo.code, discount: result.discount, message: result.message })
      setPromoInput(result.promo.code)
    } else {
      setAppliedPromo(null)
    }
  }

  const validateStepOne = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.firstName.trim()) nextErrors.firstName = 'Indiquez votre prénom.'
    if (!form.lastName.trim()) nextErrors.lastName = 'Indiquez votre nom.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Saisissez une adresse e-mail valide.'
    if (form.phone.trim().length < 7) nextErrors.phone = 'Saisissez un numéro de téléphone valide.'
    if (!form.address.trim()) nextErrors.address = 'Indiquez votre adresse.'
    if (!form.postalCode.trim()) nextErrors.postalCode = 'Indiquez votre code postal.'
    if (!form.city.trim()) nextErrors.city = 'Indiquez votre ville.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const continueToPayment = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateStepOne()) {
      notify('Quelques informations sont manquantes.', 'error')
      return
    }
    setStep(2)
  }

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.terms) {
      notify('Veuillez accepter les conditions générales de vente.', 'error')
      setErrors({ terms: 'Veuillez accepter les conditions.' })
      return
    }
    if (paymentMethod === 'card') {
      const digits = card.number.replace(/\s/g, '')
      if (card.name.trim().length < 2 || digits.length < 16 || !card.expiry || card.cvc.length < 3) {
        notify('Vérifiez les informations de votre carte bancaire.', 'error')
        return
      }
    }
    setProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1100))
    try {
      const booking: Booking = createBooking({
        clientId: currentClient?.id,
        experienceId: experience.id,
        date: date || toDateInput(new Date()),
        adults,
        children,
        options: optionIds,
        total: totals.total,
        status: 'confirmed',
        paymentStatus: 'paid',
        channel: 'web',
        notes: '',
        promoCode: appliedPromo?.code,
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          country: form.country,
        },
      })
      if (form.newsletter) {
        notify('Vous recevrez aussi nos meilleures idées d’évasion.')
      }
      navigate(`/confirmation/${booking.reference}`, {
        state: {
          bookingId: booking.id,
          newAccount: !currentClient,
        },
      })
    } catch {
      notify('Une erreur est survenue. Veuillez réessayer.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    setCard((prev) => ({ ...prev, number: digits.replace(/(\d{4})(?=\d)/g, '$1 ') }))
  }

  const handleExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    setCard((prev) => ({ ...prev, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits }))
  }

  return (
    <div className="checkout-page">
      <section className="checkout-hero">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Expériences', to: '/experiences' },
              { label: experience.title, to: `/experiences/${experience.slug}` },
              { label: 'Réservation' },
            ]}
          />
          <div className="checkout-hero__row">
            <div>
              <span className="eyebrow">Réservation sécurisée</span>
              <h1 className="h1">Votre voyage commence ici.</h1>
            </div>
            <div className="checkout-steps">
              {steps.map((label, index) => (
                <div
                  key={label}
                  className={`checkout-step${step === index + 1 ? ' is-active' : ''}${step > index + 1 ? ' is-done' : ''}`}
                >
                  <span>{step > index + 1 ? <Check /> : `0${index + 1}`}</span>
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="checkout-layout container">
        <div className="checkout-main">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="details"
                className="checkout-form"
                onSubmit={continueToPayment}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="checkout-card">
                  <div className="checkout-card__head">
                    <span className="checkout-card__number">01</span>
                    <div>
                      <h2>Vos coordonnées</h2>
                      <p>Pour vous envoyer votre confirmation et préparer votre voyage.</p>
                    </div>
                  </div>
                  {currentClient && (
                    <div className="checkout-logged">
                      <span className="checkout-logged__avatar">
                        {currentClient.firstName[0]}
                        {currentClient.lastName[0]}
                      </span>
                      <p>
                        Vous êtes connecté·e en tant que <strong>{currentClient.firstName} {currentClient.lastName}</strong>.
                        Cette réservation sera ajoutée à votre espace.
                      </p>
                    </div>
                  )}
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="firstName">Prénom *</label>
                      <input
                        id="firstName"
                        className={`input${errors.firstName ? ' input--error' : ''}`}
                        value={form.firstName}
                        onChange={(event) => update('firstName', event.target.value)}
                        autoComplete="given-name"
                      />
                      {errors.firstName && <small className="field-error">{errors.firstName}</small>}
                    </div>
                    <div className="field">
                      <label htmlFor="lastName">Nom *</label>
                      <input
                        id="lastName"
                        className={`input${errors.lastName ? ' input--error' : ''}`}
                        value={form.lastName}
                        onChange={(event) => update('lastName', event.target.value)}
                        autoComplete="family-name"
                      />
                      {errors.lastName && <small className="field-error">{errors.lastName}</small>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="email">Adresse e-mail *</label>
                      <input
                        id="email"
                        type="email"
                        className={`input${errors.email ? ' input--error' : ''}`}
                        value={form.email}
                        onChange={(event) => update('email', event.target.value)}
                        autoComplete="email"
                      />
                      {errors.email && <small className="field-error">{errors.email}</small>}
                    </div>
                    <div className="field">
                      <label htmlFor="phone">Téléphone *</label>
                      <input
                        id="phone"
                        className={`input${errors.phone ? ' input--error' : ''}`}
                        value={form.phone}
                        onChange={(event) => update('phone', event.target.value)}
                        autoComplete="tel"
                        placeholder="+32 4XX XX XX XX"
                      />
                      {errors.phone && <small className="field-error">{errors.phone}</small>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field field--wide">
                      <label htmlFor="address">Adresse *</label>
                      <input
                        id="address"
                        className={`input${errors.address ? ' input--error' : ''}`}
                        value={form.address}
                        onChange={(event) => update('address', event.target.value)}
                        autoComplete="street-address"
                        placeholder="Rue, numéro"
                      />
                      {errors.address && <small className="field-error">{errors.address}</small>}
                    </div>
                  </div>
                  <div className="form-row form-row--3">
                    <div className="field">
                      <label htmlFor="postalCode">Code postal *</label>
                      <input
                        id="postalCode"
                        className={`input${errors.postalCode ? ' input--error' : ''}`}
                        value={form.postalCode}
                        onChange={(event) => update('postalCode', event.target.value)}
                        autoComplete="postal-code"
                      />
                      {errors.postalCode && <small className="field-error">{errors.postalCode}</small>}
                    </div>
                    <div className="field">
                      <label htmlFor="city">Ville *</label>
                      <input
                        id="city"
                        className={`input${errors.city ? ' input--error' : ''}`}
                        value={form.city}
                        onChange={(event) => update('city', event.target.value)}
                        autoComplete="address-level2"
                      />
                      {errors.city && <small className="field-error">{errors.city}</small>}
                    </div>
                    <div className="field">
                      <label htmlFor="country">Pays</label>
                      <select
                        id="country"
                        className="select"
                        value={form.country}
                        onChange={(event) => update('country', event.target.value)}
                      >
                        <option>Belgique</option>
                        <option>France</option>
                        <option>Luxembourg</option>
                        <option>Pays-Bas</option>
                        <option>Suisse</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                  <label className="checkbox checkout-newsletter">
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={(event) => update('newsletter', event.target.checked)}
                    />
                    Je souhaite recevoir la lettre Faraway et les offres de l’agence.
                  </label>
                </div>

                <div className="checkout-card">
                  <div className="checkout-card__head">
                    <span className="checkout-card__number">02</span>
                    <div>
                      <h2>Votre voyage</h2>
                      <p>Vérifiez les détails avant de passer au paiement.</p>
                    </div>
                    <Link to={`/experiences/${experience.slug}?date=${date}`} className="checkout-modify">
                      Modifier
                    </Link>
                  </div>
                  <div className="checkout-travel-details">
                    <div>
                      <CalendarDays />
                      <span>
                        <small>Date de départ</small>
                        <strong>{date ? formatDateLong(`${date}T12:00:00`) : 'À définir'}</strong>
                      </span>
                    </div>
                    <div>
                      <Users />
                      <span>
                        <small>Voyageurs</small>
                        <strong>
                          {adults} adulte{adults > 1 ? 's' : ''}
                          {children > 0 ? ` · ${children} enfant${children > 1 ? 's' : ''}` : ''}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <MapPin />
                      <span>
                        <small>Au départ de</small>
                        <strong>{experience.practical.departure}</strong>
                      </span>
                    </div>
                  </div>
                  {selectedOptions.length > 0 && (
                    <div className="checkout-options-summary">
                      <span className="small-label">Options choisies</span>
                      {selectedOptions.map((option) => (
                        <div key={option.id}>
                          <span>
                            <Check /> {option.name}
                          </span>
                          <span>
                            +{formatPrice(option.price, true)}
                            {option.unit === 'person' ? ' / pers.' : ' / résa.'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="checkout-actions">
                  <Link to={`/experiences/${experience.slug}`} className="btn btn--outline">
                    <ChevronLeft /> Retour à l’expérience
                  </Link>
                  <button type="submit" className="btn btn--accent">
                    Continuer vers le paiement <ArrowRight />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="payment"
                className="checkout-form"
                onSubmit={submitPayment}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="checkout-card">
                  <div className="checkout-card__head">
                    <span className="checkout-card__number">03</span>
                    <div>
                      <h2>Paiement</h2>
                      <p>Réglez en toute sécurité. Aucun paiement réel n’est effectué en démonstration.</p>
                    </div>
                    <span className="checkout-secure">
                      <LockKeyhole /> SSL
                    </span>
                  </div>
                  <div className="payment-methods">
                    <button
                      type="button"
                      className={`payment-method${paymentMethod === 'bancontact' ? ' is-active' : ''}`}
                      onClick={() => setPaymentMethod('bancontact')}
                    >
                      <WalletCards />
                      <span>
                        <strong>Bancontact</strong>
                        <small>Le plus utilisé en Belgique</small>
                      </span>
                      <span className="payment-radio" />
                    </button>
                    <button
                      type="button"
                      className={`payment-method${paymentMethod === 'card' ? ' is-active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard />
                      <span>
                        <strong>Carte bancaire</strong>
                        <small>Visa, Mastercard, Amex</small>
                      </span>
                      <span className="payment-radio" />
                    </button>
                    <button
                      type="button"
                      className={`payment-method${paymentMethod === 'transfer' ? ' is-active' : ''}`}
                      onClick={() => setPaymentMethod('transfer')}
                    >
                      <Landmark />
                      <span>
                        <strong>Virement bancaire</strong>
                        <small>Réservation sous 48 h</small>
                      </span>
                      <span className="payment-radio" />
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="card-form">
                      <div className="card-preview">
                        <span className="card-preview__brand">FARAWAY</span>
                        <span className="card-preview__number">
                          {card.number || '•••• •••• •••• ••••'}
                        </span>
                        <span className="card-preview__row">
                          <span>{card.name || 'TITULAIRE DE LA CARTE'}</span>
                          <span>{card.expiry || 'MM/AA'}</span>
                        </span>
                      </div>
                      <div className="card-form__fields">
                        <div className="field">
                          <label htmlFor="card-name">Nom sur la carte</label>
                          <input
                            id="card-name"
                            className="input"
                            placeholder="Claire Dubois"
                            value={card.name}
                            onChange={(event) => setCard((prev) => ({ ...prev, name: event.target.value }))}
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="card-number">Numéro de carte</label>
                          <input
                            id="card-number"
                            className="input"
                            placeholder="4242 4242 4242 4242"
                            value={card.number}
                            onChange={(event) => handleCardNumber(event.target.value)}
                            inputMode="numeric"
                          />
                        </div>
                        <div className="form-row">
                          <div className="field">
                            <label htmlFor="card-expiry">Date d’expiration</label>
                            <input
                              id="card-expiry"
                              className="input"
                              placeholder="MM/AA"
                              value={card.expiry}
                              onChange={(event) => handleExpiry(event.target.value)}
                              inputMode="numeric"
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="card-cvc">CVC</label>
                            <input
                              id="card-cvc"
                              className="input"
                              placeholder="123"
                              value={card.cvc}
                              onChange={(event) =>
                                setCard((prev) => ({
                                  ...prev,
                                  cvc: event.target.value.replace(/\D/g, '').slice(0, 4),
                                }))
                              }
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="card-demo-fill"
                          onClick={() =>
                            setCard({ name: 'Claire Dubois', number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123' })
                          }
                        >
                          <Sparkles /> Utiliser la carte de démonstration
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bancontact' && (
                    <div className="payment-info">
                      <WalletCards />
                      <p>
                        Vous serez redirigé·e vers Bancontact pour finaliser le paiement. En démonstration, le
                        paiement sera automatiquement validé.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'transfer' && (
                    <div className="payment-info">
                      <Landmark />
                      <p>
                        Nous vous enverrons les instructions par e-mail. Votre réservation restera confirmée pendant
                        48 h, le temps de recevoir le virement.
                      </p>
                    </div>
                  )}

                  <label className="checkbox checkout-terms">
                    <input
                      type="checkbox"
                      checked={form.terms}
                      onChange={(event) => update('terms', event.target.checked)}
                    />
                    <span>
                      J’accepte les <Link to="/agence#cgv">conditions générales de vente</Link> et la{' '}
                      <Link to="/agence#confidentialite">politique de confidentialité</Link>. Je confirme avoir vérifié
                      les détails de mon voyage.
                    </span>
                  </label>
                  {errors.terms && <small className="field-error">{errors.terms}</small>}
                </div>

                <div className="checkout-actions">
                  <button type="button" className="btn btn--outline" onClick={() => setStep(1)}>
                    <ChevronLeft /> Retour
                  </button>
                  <button type="submit" className="btn btn--accent" disabled={processing}>
                    {processing ? (
                      <>
                        <LoaderCircle className="spin" /> Traitement…
                      </>
                    ) : (
                      <>
                        <LockKeyhole /> Payer {formatPrice(totals.total, true)}
                      </>
                    )}
                  </button>
                </div>
                <p className="checkout-payment-note">
                  <ShieldCheck /> Transaction chiffrée. Données bancaires non conservées.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <aside className="checkout-summary">
          <div className="checkout-summary__card">
            <div className="checkout-summary__image">
              <img src={experience.image} alt={experience.title} />
              <span className="pill">{experience.category}</span>
            </div>
            <div className="checkout-summary__body">
              <span className="small-label">{experience.destination} · {experience.duration}</span>
              <h3>{experience.title}</h3>
              <div className="checkout-summary__meta">
                <span>
                  <CalendarDays /> {date ? formatDateLong(`${date}T12:00:00`) : 'Date à confirmer'}
                </span>
                <span>
                  <Users /> {adults + children} voyageur{adults + children > 1 ? 's' : ''}
                </span>
              </div>
              <div className="checkout-promo">
                <span className="field-label">
                  <Tag /> Code promo
                </span>
                <div className="checkout-promo__row">
                  <input
                    className="input"
                    placeholder="FARAWAY10"
                    value={promoInput}
                    onChange={(event) => {
                      setPromoInput(event.target.value.toUpperCase())
                      setPromoMessage('')
                    }}
                  />
                  <button type="button" onClick={applyPromo}>
                    Appliquer
                  </button>
                </div>
                {promoMessage && (
                  <small className={appliedPromo ? 'checkout-promo__ok' : 'checkout-promo__error'}>
                    {appliedPromo && <Check />} {promoMessage}
                  </small>
                )}
                {!appliedPromo && (
                  <span className="checkout-promo__hint">
                    {promoCodes.find((promo) => promo.code === 'FARAWAY10')?.description}
                  </span>
                )}
              </div>
              <div className="checkout-summary__lines">
                <div>
                  <span>Adultes × {adults}</span>
                  <span>{formatPrice(totals.adultTotal)}</span>
                </div>
                {children > 0 && (
                  <div>
                    <span>Enfants × {children}</span>
                    <span>{formatPrice(totals.childTotal)}</span>
                  </div>
                )}
                {totals.optionsTotal > 0 && (
                  <div>
                    <span>Options</span>
                    <span>{formatPrice(totals.optionsTotal)}</span>
                  </div>
                )}
                <div>
                  <span>Frais de service</span>
                  <span>{formatPrice(totals.serviceFee, true)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="checkout-summary__discount">
                    <span>Remise {appliedPromo?.code}</span>
                    <span>−{formatPrice(totals.discount, true)}</span>
                  </div>
                )}
              </div>
              <div className="checkout-summary__total">
                <span>Total à régler</span>
                <strong>{formatPrice(totals.total, true)}</strong>
              </div>
              <p className="checkout-summary__vat">Prix TTC · TVA belge 21 % incluse</p>
            </div>
          </div>
          <div className="checkout-assurance">
            <div>
              <ShieldCheck />
              <span>
                <strong>Annulation flexible</strong>
                <small>{experience.practical.cancellation}</small>
              </span>
            </div>
            <div>
              <LockKeyhole />
              <span>
                <strong>Paiement sécurisé</strong>
                <small>Vos données sont cryptées.</small>
              </span>
            </div>
          </div>
          <div className="checkout-help">
            <span>Besoin d’un coup de main ?</span>
            <a href="tel:+3225550824">+32 2 555 08 24</a>
            <span>ou</span>
            <Link to="/contact">écrivez-nous</Link>
          </div>
        </aside>
      </div>

      <section className="checkout-reassurance">
        <div className="container">
          <div>
            <span>01</span>
            <strong>Agence belge</strong>
            <p>Une équipe basée à Bruxelles, joignable avant et pendant votre voyage.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Voyage testé</strong>
            <p>Chaque expérience est sélectionnée et vérifiée par nos spécialistes.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Paiement protégé</strong>
            <p>Vos transactions sont sécurisées et vos données restent confidentielles.</p>
          </div>
          <div>
            <span>04</span>
            <strong>Sur mesure</strong>
            <p>Une envie particulière ? Nous adaptons l’itinéraire à votre rythme.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
