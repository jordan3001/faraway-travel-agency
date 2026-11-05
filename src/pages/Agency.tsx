import { ArrowRight, ArrowUpRight, Compass, HeartHandshake, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'

const team = [
  { initials: 'CL', name: 'Camille Laurent', role: 'Fondatrice & directrice', focus: 'Parcs & voyages en famille' },
  { initials: 'EM', name: 'Élodie Mertens', role: 'Experte Belgique & culture', focus: 'Escapades européennes' },
  { initials: 'TL', name: 'Thomas Lejeune', role: 'Spécialiste grands espaces', focus: 'Safaris & nature' },
  { initials: 'NT', name: 'Naoko Tanaka', role: 'Conseillère Japon', focus: 'Voyages signature' },
]

const engagements = [
  {
    icon: HeartHandshake,
    title: 'Le voyage juste, pas le plus vendu',
    text: 'Nous prenons le temps de comprendre votre rythme, vos envies et vos contraintes. Parfois, la meilleure réponse est de partir moins loin ou moins longtemps.',
  },
  {
    icon: Leaf,
    title: 'Voyager sans épuiser',
    text: 'Nous privilégions les partenaires locaux, les séjours plus longs et les déplacements doux. Chaque année, nous reversons 1 % de nos ventes à des projets de conservation.',
  },
  {
    icon: ShieldCheck,
    title: 'Une promesse de transparence',
    text: 'Prix clairs, conditions lisibles, partenaires identifiés. Nous vous disons aussi ce qui n’est pas inclus, et pourquoi nous avons fait chaque choix.',
  },
]

export default function Agency() {
  return (
    <div className="agency-page">
      <section className="agency-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "L'agence" }]} />
          <div className="agency-hero__layout">
            <div className="agency-hero__copy">
              <span className="eyebrow">Depuis 2009 · Bruxelles</span>
              <h1 className="h1">
                L’agence des voyages <span className="italic">qui vous ressemblent.</span>
              </h1>
              <p>
                Nous ne sommes pas nés dans un aéroport. Nous sommes nés d’une conviction : un beau voyage se
                dessine, se discute, se peaufine. Et il commence toujours par une écoute.
              </p>
              <div className="agency-hero__actions">
                <Link to="/contact" className="btn btn--accent">
                  Rencontrer l’équipe <ArrowUpRight />
                </Link>
                <Link to="/experiences" className="btn btn--outline">
                  Voir nos voyages
                </Link>
              </div>
            </div>
            <div className="agency-hero__visual">
              <div className="agency-hero__image agency-hero__image--main">
                <img src="/images/family-fun.jpg" alt="Famille en voyage avec Faraway" />
              </div>
              <div className="agency-hero__image agency-hero__image--small">
                <img src="/images/theater.jpg" alt="Salle de spectacle" />
              </div>
              <div className="agency-hero__stamp">
                <Compass />
                <strong>Faraway</strong>
                <span>Depuis 2009</span>
              </div>
            </div>
          </div>
          <div className="agency-hero__stats">
            <div>
              <strong>2009</strong>
              <span>naissance de l’agence</span>
            </div>
            <div>
              <strong>40k</strong>
              <span>voyageurs accompagnés</span>
            </div>
            <div>
              <strong>21</strong>
              <span>expériences signature</span>
            </div>
            <div>
              <strong>97 %</strong>
              <span>nous recommandent</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section agency-story">
        <div className="container">
          <div className="agency-story__inner">
            <Reveal className="agency-story__media">
              <img src="/images/family-travel.jpg" alt="Voyageurs face au paysage" />
              <span className="agency-story__caption">Le monde, à hauteur de regard.</span>
            </Reveal>
            <Reveal className="agency-story__copy" delay={0.1}>
              <span className="eyebrow">Notre histoire</span>
              <h2 className="h2">
                Une petite agence devenue <span className="italic">grande par ses histoires.</span>
              </h2>
              <p>
                En 2009, Camille Laurent quitte une grande agence bruxelloise avec une idée simple : remettre le
                voyageur au centre. Pas de catalogue impersonnel, pas de forfaits empilés. Des rencontres, des
                carnets et des conseils de celles et ceux qui partent vraiment.
              </p>
              <p>
                Quinze ans plus tard, Faraway est une équipe de huit spécialistes et un réseau de partenaires
                locaux sur quatre continents. Nous avons accompagné plus de 40 000 voyageurs, organisé des
                premiers départs, des demandes en mariage et des vacances qui ont changé des vies.
              </p>
              <p>
                Notre position n’a pas bougé : nous préférons un voyage qui vous ressemble à dix voyages qui font
                envie aux autres.
              </p>
              <div className="agency-signature">
                <span>Camille Laurent</span>
                <small>Fondatrice & directrice</small>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--cream agency-values" id="engagements">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <span className="eyebrow">Nos engagements</span>
                <h2 className="h2">
                  Le luxe, c’est <span className="italic">l’attention.</span>
                </h2>
              </div>
              <div className="section-head__aside">
                <p>
                  Nous croyons aux voyages qui font du bien à celles et ceux qui partent, comme à celles et ceux
                  qui accueillent.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="agency-engagements">
            {engagements.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.07}>
                <article>
                  <span className="agency-engagements__number">0{index + 1}</span>
                  <span className="agency-engagements__icon">
                    <item.icon />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="agency-quote">
            <Sparkles />
            <blockquote>
              « Le plus beau compliment qu’on puisse nous faire n’est pas “c’était parfait”. C’est “on repart
              quand ?”. »
            </blockquote>
            <span className="small-label">Camille Laurent, fondatrice</span>
          </div>
        </div>
      </section>

      <section className="section agency-team">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <span className="eyebrow">L’équipe</span>
                <h2 className="h2">
                  Des spécialistes, <span className="italic">pas des vendeurs.</span>
                </h2>
              </div>
              <div className="section-head__aside">
                <p>Chaque univers a son expert. Tous ont en commun d’avoir foulé les lieux dont ils parlent.</p>
              </div>
            </div>
          </Reveal>
          <div className="team-grid">
            {team.map((member, index) => (
              <Reveal key={member.name} delay={index * 0.06}>
                <article className="team-card">
                  <span className="team-card__monogram">{member.initials}</span>
                  <div className="team-card__line" />
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                  <small>{member.focus}</small>
                  <span className="team-card__arrow">
                    <ArrowUpRight />
                  </span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="agency-cta">
        <div className="container agency-cta__inner">
          <div>
            <span className="eyebrow">On se rencontre ?</span>
            <h2 className="h2">
              Vos envies, notre métier. <span className="italic">Commençons par un café.</span>
            </h2>
          </div>
          <p>
            Passez à l’agence, appelez-nous ou écrivez-nous. Nous adorons les projets qui commencent par « et si
            on partait… ».
          </p>
          <Link to="/contact" className="btn btn--light">
            Prendre rendez-vous <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="section agency-legal">
        <div className="container">
          <div className="agency-legal__head">
            <span className="eyebrow">Informations légales</span>
            <h2 className="h2">En toute transparence.</h2>
          </div>
          <div className="agency-legal__grid">
            <div id="mentions">
              <h3>Mentions légales</h3>
              <p>Faraway Travel Agency SRL · Rue de l’Horizon 24, 1000 Bruxelles · TVA BE 0648.712.394.</p>
              <p>Agence de voyages agréée. Éditeur responsable : Camille Laurent. Hébergement : Faraway Cloud, Bruxelles.</p>
            </div>
            <div id="cgv">
              <h3>Conditions de vente</h3>
              <p>
                Les prix sont indiqués par personne, TVA belge incluse. Les réservations sont confirmées après
                paiement ou versement d’un acompte de 30 %. Les conditions d’annulation varient selon chaque
                expérience et sont précisées sur la fiche produit.
              </p>
            </div>
            <div id="confidentialite">
              <h3>Confidentialité</h3>
              <p>
                Vos données sont utilisées uniquement pour traiter vos demandes et personnaliser votre suivi.
                Aucune information n’est vendue à des tiers. Vous pouvez demander la suppression de votre compte à
                tout moment à privacy@faraway.be.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
