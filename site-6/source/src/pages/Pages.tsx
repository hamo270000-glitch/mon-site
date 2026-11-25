import type { ReactNode } from 'react';
import XRayStory from './XRayStory';
import SizeFinder from './SizeFinder';
import { PRODUCT, SIZES, euros } from '../data/catalog';
import { useCart } from '../shop/cart';
import { href } from '../router';
import { IconArrow, IconMinus, IconPlus } from '../ui/Icons';

function PageHead({ id, kicker, title, text }: { id: string; kicker: string; title: ReactNode; text: string }) {
  return (
    <section aria-labelledby={id} className="relative isolate overflow-hidden pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div data-lampe aria-hidden="true" className="lampe absolute -left-[15%] -top-[10%] h-full w-[90vw] md:w-[55vw]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <p className="surtitre">{kicker}</p>
        <h1 id={id} className="mt-4 max-w-[18ch] text-[clamp(2.6rem,7vw,5.4rem)]">{title}</h1>
        <p className="mt-6 max-w-xl text-lg text-creme/80">{text}</p>
      </div>
    </section>
  );
}

// Coupe comparée : coussin rembourré contre Le Doyen, vue de profil.
function PressureCompare() {
  const floor = 150;
  return (
    <section aria-labelledby="titre-compare" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <h2 id="titre-compare" className="max-w-[20ch] text-[clamp(2.1rem,4.6vw,3.6rem)]">Un coussin s’écrase. <em>La mémoire de forme épouse.</em></h2>
        <div className="mt-12 grid gap-12 md:grid-cols-2" data-rows>
          {[
            { t: 'Coussin rembourré', d: 'Sous la hanche, la fibre se tasse : l’os finit presque au contact du sol froid. Le chien se retourne pour soulager.', doyen: false },
            { t: PRODUCT.name, d: 'La mousse se creuse juste ce qu’il faut et la couche de soutien garde l’épaisseur sous les points d’appui.', doyen: true },
          ].map((c) => (
            <figure key={c.t} className="m-0">
              <svg viewBox="0 0 400 180" className="h-auto w-full" role="img" aria-label={`${c.t} vu en coupe. ${c.d}`}>
                <line x1="0" x2="400" y1={floor} y2={floor} stroke="var(--color-brume)" strokeDasharray="4 6" />
                <text x="6" y={floor + 20} fontSize="12" fill="var(--color-brume)">sol</text>
                {c.doyen ? (
                  <>
                    <path d={`M30 ${floor} V108 H370 V${floor} Z`} fill="#6f8a7d" />
                    <path d="M30 108 V78 C120 78 150 78 165 90 C185 106 235 106 255 90 C270 78 300 78 370 78 V108 Z" fill="#efe7da" />
                  </>
                ) : (
                  <path d="M30 150 V92 C110 92 150 96 170 120 C190 146 230 146 250 120 C270 96 310 92 370 92 V150 Z" fill="#a9b8b3" opacity=".6" />
                )}
                <circle cx="210" cy={c.doyen ? 86 : 128} r={c.doyen ? 7 : 10} fill={c.doyen ? 'var(--color-repos)' : 'var(--color-douleur)'} />
                <circle cx="210" cy={c.doyen ? 86 : 128} r={c.doyen ? 16 : 24} fill="none" stroke={c.doyen ? 'var(--color-repos)' : 'var(--color-douleur)'} strokeOpacity=".5" />
                <text x="210" y={c.doyen ? 58 : 92} textAnchor="middle" fontSize="13" fill="var(--color-creme)">hanche</text>
              </svg>
              <figcaption className="mt-4"><strong className="serif block text-2xl font-normal">{c.t}</strong><span className="text-brume">{c.d}</span></figcaption>
            </figure>
          ))}
        </div>
        <p className="legende mt-8">Schéma explicatif, pas une mesure. Un panier ne soigne pas l’arthrose : il rend le repos plus confortable. Pour la douleur, parle à ton vétérinaire.</p>
      </div>
    </section>
  );
}

export function PressurePage() {
  return (
    <>
      <PageHead id="titre-appuis" kicker="Arthrose et repos" title={<>Là où <em>ça appuie.</em></>} text="Un chien couché sur le flanc pose tout son poids sur quelques os : épaule, coude, hanche, genou. Fais défiler pour voir ce que change une bonne mousse." />
      <XRayStory id="radio-appuis" title="Du carrelage <em>à la mousse.</em>" />
      <PressureCompare />
      <section aria-labelledby="titre-faq" className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <h2 id="titre-faq" className="text-[clamp(2rem,4vw,3rem)]">Questions <em>fréquentes</em></h2>
          <div className="mt-8 divide-y divide-creme/10 border-y border-creme/10">
            {[
              ['Un panier orthopédique soigne-t-il l’arthrose ?', 'Non. L’arthrose se suit avec un vétérinaire. Un bon panier évite seulement d’ajouter de l’inconfort la nuit : moins de pression sur les articulations, pas de contact avec le sol froid.'],
              ['Pourquoi une entrée basse ?', 'Un chien raide des hanches lève mal les pattes arrière. Sans rebord à l’avant, il entre et sort sans enjamber.'],
              ['Pourquoi la mousse remonte-t-elle lentement ?', 'C’est le principe de la mémoire de forme : elle réagit à la chaleur et au poids, se moule autour du corps, puis reprend sa forme en quelques secondes une fois le chien levé.'],
              ['Combien de temps dure la mousse ?', 'Cela dépend du poids du chien et de la densité. Nous l’indiquerons précisément après les tests de l’échantillon.'],
              ['Et si mon chien a parfois des fuites ?', 'C’est fréquent chez les chiens âgés. La housse se lave à 30 °C. Une doublure imperméable est à l’étude avec le fournisseur ; nous l’annoncerons seulement si elle est confirmée.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">{q}<span className="shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
                <p className="mt-2 text-brume">{a}</p>
              </details>
            ))}
          </div>
          <a href={href.produit} className="bouton mt-10">Découvrir {PRODUCT.name} <IconArrow /></a>
        </div>
      </section>
    </>
  );
}

export function SizesPage() {
  return (
    <>
      <PageHead id="titre-guide" kicker="Guide des tailles" title={<>La bonne taille, <em>sans hésiter.</em></>} text="La taille est la première cause de retour. Deux mesures suffisent : la longueur de ton chien couché et son poids." />
      <SizeFinder />
      <section aria-labelledby="titre-tableau" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <h2 id="titre-tableau" className="text-[clamp(2rem,4vw,3rem)]">Les quatre <em>tailles</em></h2>
          <div className="mt-8 overflow-x-auto" data-lenis-prevent>
            <table className="chiffres w-full min-w-[640px] border-collapse text-left">
              <caption className="legende pb-3 text-left">Mesures en centimètres, provisoires jusqu’à la validation de l’échantillon.</caption>
              <thead>
                <tr className="border-b border-creme/20 text-brume">
                  <th scope="col" className="py-3 pr-4 font-normal">Taille</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Extérieur</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Couchage</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Chien jusqu’à</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Exemples</th>
                  <th scope="col" className="py-3 font-normal">Prix</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((s) => (
                  <tr key={s.id} className="border-b border-creme/10">
                    <th scope="row" className="serif py-4 pr-4 text-3xl font-normal italic">{s.id}</th>
                    <td className="py-4 pr-4">{s.outer[0]} × {s.outer[1]}</td>
                    <td className="py-4 pr-4">{s.sleep[0]} × {s.sleep[1]}</td>
                    <td className="py-4 pr-4">{s.maxLength} cm · {s.maxWeight} kg</td>
                    <td className="py-4 pr-4 text-brume">{s.example}</td>
                    <td className="py-4"><a href={`${href.produit}?taille=${s.id}`} className="font-semibold text-ambre-clair underline">{euros(s.price)}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol className="mt-14 grid gap-8 md:grid-cols-3" data-rows>
            {[
              ['Attends qu’il dorme', 'Mesure-le dans sa position préférée, couché sur le flanc ou en boule.'],
              ['De la truffe à la queue', 'Prends la longueur de la truffe à la base de la queue, sans la queue.'],
              ['Ajoute de la marge', 'Entre deux tailles, prends la plus grande : un chien raide aime s’étirer.'],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-creme/15 pt-5">
                <p className="serif text-3xl italic text-ambre-clair">{['i', 'ii', 'iii'][i]}.</p>
                <p className="mt-2 text-xl font-semibold">{t}</p>
                <p className="mt-1 text-brume">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

export function CartPage() {
  const { lines, total, setQty } = useCart();
  return (
    <section aria-labelledby="titre-mon-panier" className="relative isolate min-h-[80svh] overflow-hidden pb-24 pt-32">
      <div data-lampe aria-hidden="true" className="lampe absolute -left-[20%] -top-[20%] h-[70%] w-[90vw] md:w-[50vw]" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        <h1 id="titre-mon-panier" className="text-[clamp(2.6rem,6vw,4.6rem)]">Ton <em>panier</em></h1>
        {lines.length === 0 ? (
          <div className="mt-8 space-y-5">
            <p className="text-xl text-creme/85">Il est vide pour l’instant.</p>
            <a href={href.tailles} className="bouton">Trouver la taille de mon chien <IconArrow /></a>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <ul className="divide-y divide-creme/10 border-y border-creme/10">
              {lines.map((l) => (
                <li key={l.key} className="flex flex-wrap items-center gap-4 py-6">
                  <span className="h-16 w-16 rounded-xl border border-creme/10" style={{ background: `linear-gradient(160deg, ${l.color.cover}, ${l.color.bolster})` }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold">{PRODUCT.name} · {l.size.id}</p>
                    <p className="legende chiffres">{l.size.outer[0]} × {l.size.outer[1]} cm · {l.color.label} · {euros(l.size.price)} l’unité</p>
                  </div>
                  <div className="flex items-center gap-1" role="group" aria-label={`Quantité, taille ${l.size.id} ${l.color.label}`}>
                    <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Retirer un" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-creme/15 hover:border-ambre/70"><IconMinus /></button>
                    <span className="chiffres w-8 text-center" aria-live="polite">{l.qty}</span>
                    <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Ajouter un" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-creme/15 hover:border-ambre/70"><IconPlus /></button>
                  </div>
                  <p className="chiffres w-24 text-right text-lg font-semibold">{euros(l.qty * l.size.price)}</p>
                </li>
              ))}
            </ul>
            <aside aria-label="Récapitulatif" className="voile h-fit rounded-2xl p-6">
              <dl className="chiffres space-y-3">
                <div className="flex justify-between"><dt className="text-brume">Sous-total</dt><dd>{euros(total)}</dd></div>
                <div className="flex justify-between"><dt className="text-brume">Livraison</dt><dd className="text-brume">calculée à la commande</dd></div>
                <div className="flex justify-between border-t border-creme/10 pt-3 text-xl font-semibold"><dt>Total</dt><dd>{euros(total)}</dd></div>
              </dl>
              <button type="button" disabled className="mt-6 flex min-h-14 w-full cursor-not-allowed items-center justify-center rounded-full bg-ambre/35 px-6 text-lg font-semibold text-creme/80">Paiement bientôt disponible</button>
              <p className="legende mt-3">La boutique ouvre bientôt. Ton panier reste enregistré sur cet appareil.</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
