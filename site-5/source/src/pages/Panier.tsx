import { useCart } from '../cart';
import { euros } from '../data';
import { lien } from '../router';
import Art from '../ui/Art';
import Mascotte from '../ui/Mascotte';
import { IconPlus, IconMoins, IconFleche } from '../ui/Icons';

export default function PagePanier() {
  const { lignes, total, setQty } = useCart();
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-8 md:pt-32">
      <h1 className="text-[clamp(2.6rem,7vw,4.6rem)] text-foret">Ton panier</h1>
      {lignes.length === 0 ? (
        <div className="mt-8 grid items-center gap-6 rounded-[2.5rem] bg-white p-8 ring-1 ring-encre/5 md:grid-cols-2">
          <div>
            <p className="text-2xl font-bold">Il est encore vide.</p>
            <p className="mt-2 text-doux">Biscuit te conseille de commencer par le panier Nuage.</p>
            <a href={lien.boutique()} className="mt-6 inline-flex min-h-13 items-center gap-2 rounded-full bg-abricot px-6 font-bold text-sur-abricot">Voir la boutique <IconFleche /></a>
          </div>
          <Mascotte className="mx-auto w-full max-w-xs" />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[1.5fr_1fr]">
          <ul className="divide-y divide-encre/10 rounded-[2rem] bg-white px-5 ring-1 ring-encre/5">
            {lignes.map((l) => (
              <li key={l.key} className="flex items-center gap-4 py-5">
                <a href={lien.produit(l.produit.id)} className="grid size-20 shrink-0 place-items-center rounded-2xl" style={{ background: l.produit.fond }}><Art art={l.produit.art} a={l.coloris.a} b={l.coloris.b} className="w-16" /></a>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{l.produit.nom}</p>
                  <p className="text-sm text-doux">{l.variante.label} · {l.coloris.label} · {euros(l.variante.price)}</p>
                  <div className="mt-2 flex items-center gap-1" role="group" aria-label={`Quantité de ${l.produit.nom}`}>
                    <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Retirer un" className="grid size-10 cursor-pointer place-items-center rounded-full ring-1 ring-encre/15"><IconMoins /></button>
                    <span className="chiffres w-8 text-center font-bold">{l.qty}</span>
                    <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Ajouter un" className="grid size-10 cursor-pointer place-items-center rounded-full ring-1 ring-encre/15"><IconPlus /></button>
                  </div>
                </div>
                <p className="chiffres text-lg font-extrabold">{euros(l.qty * l.variante.price)}</p>
              </li>
            ))}
          </ul>
          <aside className="h-fit space-y-4 rounded-[2rem] bg-foret p-6 text-creme">
            <div className="flex items-baseline justify-between"><span>Sous-total</span><span className="chiffres text-3xl font-extrabold">{euros(total)}</span></div>
            <p className="text-sm text-creme/75">Les frais et le délai de livraison s’afficheront ici avant le paiement.</p>
            <button type="button" disabled className="min-h-14 w-full cursor-not-allowed rounded-full bg-creme/20 font-bold text-creme/80">Paiement bientôt disponible</button>
            <p className="text-sm text-creme/75">La boutique ouvre bientôt : ton panier reste gardé sur cet appareil.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
