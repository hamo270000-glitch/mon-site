import { useCart } from '../cart';
import { euros, PRODUITS } from '../data';
import { lien } from '../router';
import Visuel from '../ui/Visuel';
import Carte from '../ui/Carte';
import { IconPlus, IconMoins, IconFleche, IconCadenas, IconRetour } from '../ui/Icons';

export default function PagePanier() {
  const { lignes, total, setQty } = useCart();
  const idees = PRODUITS.filter((p) => !lignes.some((l) => l.produit.id === p.id)).slice(0, 4);
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] text-foret">Ton panier</h1>
      {lignes.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 ring-1 ring-ligne">
          <p className="text-lg font-semibold">Ton panier est vide.</p>
          <a href={lien.collection()} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-foret px-6 font-bold text-creme">Voir la boutique <IconFleche /></a>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="hidden grid-cols-[1fr_8rem_6rem] border-b border-ligne pb-3 text-sm font-semibold text-doux md:grid"><span>Produit</span><span className="text-center">Quantité</span><span className="text-right">Total</span></div>
            <ul className="divide-y divide-ligne">
              {lignes.map((l) => (
                <li key={l.key} className="grid grid-cols-[5rem_1fr] gap-4 py-5 md:grid-cols-[5.5rem_1fr_8rem_6rem] md:items-center">
                  <a href={lien.produit(l.produit.id)} className="aspect-square overflow-hidden rounded-xl ring-1 ring-ligne"><Visuel teinte={l.produit.teinte} petit /></a>
                  <div>
                    <a href={lien.produit(l.produit.id)} className="font-semibold hover:underline">{l.produit.nom}</a>
                    <p className="text-sm text-doux">{l.variante.label} · {l.coloris.label}</p>
                    <p className="chiffres text-sm">{euros(l.variante.price)}</p>
                    <button type="button" onClick={() => setQty(l.key, 0)} className="mt-1 cursor-pointer text-sm text-doux underline underline-offset-4 hover:text-encre">Retirer</button>
                  </div>
                  <div className="col-start-2 flex items-center justify-between md:col-start-auto md:justify-center">
                    <div className="flex items-center rounded-full bg-white ring-1 ring-ligne" role="group" aria-label={`Quantité de ${l.produit.nom}`}>
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Retirer un" className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-creme-2"><IconMoins /></button>
                      <span className="chiffres w-7 text-center font-bold">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Ajouter un" className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-creme-2"><IconPlus /></button>
                    </div>
                    <p className="chiffres font-bold md:hidden">{euros(l.qty * l.variante.price)}</p>
                  </div>
                  <p className="chiffres hidden text-right font-bold md:block">{euros(l.qty * l.variante.price)}</p>
                </li>
              ))}
            </ul>
          </div>
          <aside className="h-fit space-y-4 rounded-2xl bg-white p-6 ring-1 ring-ligne lg:sticky lg:top-32">
            <p className="text-lg font-semibold">Récapitulatif</p>
            <div className="flex justify-between"><span className="text-doux">Sous-total</span><span className="chiffres font-semibold">{euros(total)}</span></div>
            <div className="flex justify-between"><span className="text-doux">Livraison</span><span className="text-doux">Calculée au paiement</span></div>
            <div className="flex justify-between border-t border-ligne pt-4 text-lg"><span className="font-semibold">Total</span><span className="chiffres font-bold">{euros(total)}</span></div>
            <button type="button" disabled className="min-h-14 w-full cursor-not-allowed rounded-full bg-encre/15 font-bold text-encre/60">Paiement bientôt disponible</button>
            <p className="text-sm text-doux">La boutique ouvre bientôt. Ton panier reste gardé sur cet appareil.</p>
            <ul className="space-y-2 border-t border-ligne pt-4 text-sm text-doux">
              <li className="flex gap-2"><IconCadenas /> Paiement sécurisé</li>
              <li className="flex gap-2"><IconRetour /> 14 jours pour changer d’avis</li>
            </ul>
          </aside>
        </div>
      )}
      {idees.length > 0 && (
        <section className="mt-20" aria-labelledby="titre-idees">
          <h2 id="titre-idees" className="text-[clamp(1.5rem,3vw,2rem)]">Ça pourrait lui plaire</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">{idees.map((p) => <Carte key={p.id} p={p} />)}</div>
        </section>
      )}
    </div>
  );
}
