import StrataStory from './StrataStory';
import SizeFinder from './SizeFinder';
import { LAYERS, SIZES, euros } from '../data/catalog';
import { useCart } from '../shop/cart';
import { href } from '../router';
import { IconArrow, IconMinus, IconPlus } from '../ui/Icons';

function PageHead({ id, title, text, word }: { id: string; title: string; text: string; word: string }) {
  return (
    <section aria-labelledby={id} className="relative isolate overflow-hidden pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div aria-hidden="true" className="halo absolute -right-[10%] top-0 h-full w-[90vw] md:w-[55vw]" />
      <p aria-hidden="true" className="mot-contour pointer-events-none absolute -right-[2vw] top-16 font-[family-name:var(--font-display)] text-[26vw] font-extrabold leading-none tracking-[-0.06em] md:top-10">{word}</p>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <h1 id={id} className="max-w-[16ch] text-[clamp(2.6rem,7vw,5.4rem)]">{title}</h1>
        <p className="mt-5 max-w-xl text-lg text-texte/80">{text}</p>
      </div>
    </section>
  );
}

// Coupe comparée : coussin classique contre panier Lové, vue de profil.
function PressureCompare() {
  const floor = 150;
  return (
    <section aria-labelledby="titre-compare" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <h2 id="titre-compare" className="max-w-[18ch] text-[clamp(2.1rem,4.6vw,3.6rem)]">Un coussin s’écrase. La mousse à mémoire répartit.</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-2" data-rows>
          {[
            { t: 'Coussin rembourré', d: 'Sous la hanche, la fibre se tasse : l’os finit presque au contact du sol froid.', lovee: false },
            { t: 'Panier Lové', d: 'La mousse se creuse juste ce qu’il faut et la couche de soutien garde l’épaisseur sous les points d’appui.', lovee: true },
          ].map((c) => (
            <figure key={c.t} className="m-0">
              <svg viewBox="0 0 400 180" className="h-auto w-full" role="img" aria-label={`${c.t} vu en coupe. ${c.d}`}>
                <line x1="0" x2="400" y1={floor} y2={floor} stroke="var(--t-muted)" strokeDasharray="4 6" />
                <text x="6" y={floor + 20} fontSize="12" fill="var(--t-muted)">sol</text>
                {c.lovee ? (
                  <>
                    <path d={`M30 ${floor} V112 H370 V${floor} Z`} fill="#8d8f98" />
                    <path d="M30 112 V84 C120 84 150 84 165 96 C185 112 235 112 255 96 C270 84 300 84 370 84 V112 Z" fill="#ece6d6" />
                    <path d="M30 84 C120 84 150 84 165 96 C185 112 235 112 255 96 C270 84 300 84 370 84" fill="none" stroke="#d9532a" strokeWidth="5" />
                  </>
                ) : (
                  <path d="M30 150 V92 C110 92 150 96 170 120 C190 146 230 146 250 120 C270 96 310 92 370 92 V150 Z" fill="#c9c4b8" opacity=".85" />
                )}
                <ellipse cx="210" cy={c.lovee ? 86 : 118} rx="58" ry="22" fill="none" stroke="var(--t-accent)" strokeWidth="2" strokeDasharray="5 5" />
                <text x="210" y={c.lovee ? 58 : 88} textAnchor="middle" fontSize="13" fill="var(--t-accent)">hanche</text>
              </svg>
              <figcaption className="mt-4"><strong className="block text-xl font-semibold">{c.t}</strong><span className="text-doux">{c.d}</span></figcaption>
            </figure>
          ))}
        </div>
        <p className="legende mt-8">Schéma explicatif, pas une mesure. Un panier ne soigne pas l’arthrose : il rend le repos plus confortable. Pour la douleur, parle à ton vétérinaire.</p>
      </div>
    </section>
  );
}

export function LayersPage() {
  return (
    <>
      <PageHead id="titre-couches" title="Ce qu’il y a sous lui." text="Un bon panier orthopédique se juge à ce qu’on ne voit pas. Fais défiler : le panier s’ouvre couche par couche." word="4" />
      <StrataStory id="vue-eclatee" title="Fais défiler pour ouvrir le panier." />
      <PressureCompare />
      <section aria-labelledby="titre-faq" className="calcaire py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <h2 id="titre-faq" className="text-[clamp(2rem,4vw,3rem)]">Questions fréquentes</h2>
          <div className="mt-8 divide-y divide-texte/10 border-y border-texte/10">
            {[
              ['Pourquoi la mousse remonte-t-elle lentement ?', 'C’est le principe de la mémoire de forme : elle réagit à la chaleur et au poids, se moule autour du corps, puis reprend sa forme en quelques secondes une fois le chien levé.'],
              ['Mon chien a chaud la nuit, est-ce un problème ?', 'La housse est respirante. Si ton chien a très chaud, choisis un coloris clair et place le panier loin du radiateur.'],
              ['Combien de temps dure la mousse ?', 'Cela dépend du poids du chien et de la densité de la mousse. Nous l’indiquerons précisément après les tests de l’échantillon.'],
              ['Peut-on laver le panier ?', 'La housse, oui, en machine. Les mousses, non : on les aère et on les tamponne avec un linge humide si besoin.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">{q}<span className="shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span></summary>
                <p className="mt-2 text-doux">{a}</p>
              </details>
            ))}
          </div>
          <a href={href.produit} className="mt-10 inline-flex min-h-13 items-center gap-2 rounded-full bg-lichen px-7 font-semibold text-sur-lichen">Choisir ma taille <IconArrow /></a>
        </div>
      </section>
    </>
  );
}

export function SizesPage() {
  return (
    <>
      <PageHead id="titre-guide" title="La bonne taille, sans hésiter." text="La taille est la première cause de retour. Deux mesures suffisent : la longueur de ton chien couché et son poids." word="XL" />
      <SizeFinder />
      <section aria-labelledby="titre-tableau" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <h2 id="titre-tableau" className="text-[clamp(2rem,4vw,3rem)]">Les quatre tailles</h2>
          <div className="mt-8 overflow-x-auto" data-lenis-prevent>
            <table className="chiffres w-full min-w-[640px] border-collapse text-left">
              <caption className="legende pb-3 text-left">Mesures en centimètres, provisoires jusqu’à la validation de l’échantillon.</caption>
              <thead>
                <tr className="border-b border-texte/20 text-doux">
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
                  <tr key={s.id} className="border-b border-texte/10">
                    <th scope="row" className="py-4 pr-4 font-[family-name:var(--font-display)] text-2xl font-bold">{s.id}</th>
                    <td className="py-4 pr-4">{s.outer[0]} × {s.outer[1]}</td>
                    <td className="py-4 pr-4">{s.sleep[0]} × {s.sleep[1]}</td>
                    <td className="py-4 pr-4">{s.maxLength} cm · {s.maxWeight} kg</td>
                    <td className="py-4 pr-4 text-doux">{s.example}</td>
                    <td className="py-4"><a href={`${href.produit}?taille=${s.id}`} className="font-semibold text-lichen underline">{euros(s.price)}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol className="mt-14 grid gap-8 md:grid-cols-3" data-rows>
            {[
              ['Attends qu’il dorme', 'Mesure-le dans sa position préférée, couché sur le côté ou en boule.'],
              ['De la truffe à la queue', 'Prends la longueur de la truffe à la base de la queue, sans la queue.'],
              ['Ajoute de la marge', 'Entre deux tailles, prends la plus grande, surtout s’il aime s’étirer.'],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-texte/15 pt-5">
                <p className="legende chiffres">Étape {i + 1} sur 3</p>
                <p className="mt-1 text-xl font-semibold">{t}</p>
                <p className="mt-1 text-doux">{d}</p>
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
      <div aria-hidden="true" className="halo absolute -left-[20%] -top-[20%] h-[70%] w-[90vw] md:w-[50vw]" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        <h1 id="titre-mon-panier" className="text-[clamp(2.4rem,6vw,4.4rem)]">Ton panier</h1>
        {lines.length === 0 ? (
          <div className="mt-8 space-y-5">
            <p className="text-xl text-texte/85">Il est vide pour l’instant.</p>
            <a href={href.tailles} className="inline-flex min-h-13 items-center gap-2 rounded-full bg-lichen px-7 font-semibold text-sur-lichen">Trouver la taille de mon chien <IconArrow /></a>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <ul className="divide-y divide-texte/10 border-y border-texte/10">
              {lines.map((l) => (
                <li key={l.key} className="flex flex-wrap items-center gap-4 py-6">
                  <span className="h-16 w-16 rounded-2xl border border-texte/10" style={{ background: `linear-gradient(160deg, ${l.color.cover}, ${l.color.bolster})` }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold">Le panier Lové · {l.size.id}</p>
                    <p className="legende chiffres">{l.size.outer[0]} × {l.size.outer[1]} cm · {l.color.label} · {euros(l.size.price)} l’unité</p>
                  </div>
                  <div className="flex items-center gap-1" role="group" aria-label={`Quantité, taille ${l.size.id} ${l.color.label}`}>
                    <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Retirer un" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-texte/15 hover:border-lichen/60"><IconMinus /></button>
                    <span className="chiffres w-8 text-center" aria-live="polite">{l.qty}</span>
                    <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Ajouter un" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-texte/15 hover:border-lichen/60"><IconPlus /></button>
                  </div>
                  <p className="chiffres w-24 text-right text-lg font-semibold">{euros(l.qty * l.size.price)}</p>
                </li>
              ))}
            </ul>
            <aside aria-label="Récapitulatif" className="h-fit rounded-[1.75rem] border border-texte/10 bg-basalte-2 p-6">
              <dl className="chiffres space-y-3">
                <div className="flex justify-between"><dt className="text-doux">Sous-total</dt><dd>{euros(total)}</dd></div>
                <div className="flex justify-between"><dt className="text-doux">Livraison</dt><dd className="text-doux">calculée à la commande</dd></div>
                <div className="flex justify-between border-t border-texte/10 pt-3 text-xl font-semibold"><dt>Total</dt><dd>{euros(total)}</dd></div>
              </dl>
              <button type="button" disabled className="mt-6 flex min-h-14 w-full cursor-not-allowed items-center justify-center rounded-full bg-lichen/40 px-6 text-lg font-semibold text-sur-lichen">Paiement bientôt disponible</button>
              <p className="legende mt-3">La boutique ouvre bientôt. Ton panier reste enregistré sur cet appareil.</p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
