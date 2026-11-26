import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUITS, RAYONS, prixMin, sansAccent } from '../data';
import { lien } from '../router';
import Carte from '../ui/Carte';
import { IconFiltre, IconFermer } from '../ui/Icons';

type Tri = 'pertinence' | 'prix-asc' | 'prix-desc' | 'nouveautes';
const PRIX = [
  { id: 'tous', label: 'Tous les prix', ok: () => true },
  { id: 'moins30', label: 'Moins de 30 €', ok: (n: number) => n < 30 },
  { id: '30-60', label: '30 à 60 €', ok: (n: number) => n >= 30 && n <= 60 },
  { id: 'plus60', label: 'Plus de 60 €', ok: (n: number) => n > 60 },
];

export default function Collection({ rayon, q }: { rayon?: string; q?: string }) {
  const actif = RAYONS.find((r) => r.id === rayon);
  const [tri, setTri] = useState<Tri>('pertinence');
  const [prix, setPrix] = useState('tous');
  const [filtres, setFiltres] = useState(false);

  const liste = useMemo(() => {
    let l = PRODUITS.slice();
    if (actif) l = l.filter((p) => p.rayon === actif.id);
    if (q) { const s = sansAccent(q); l = l.filter((p) => sansAccent(`${p.nom} ${p.accroche} ${p.rayon} ${p.description}`).includes(s)); }
    const f = PRIX.find((x) => x.id === prix)!;
    l = l.filter((p) => f.ok(prixMin(p)));
    if (tri === 'prix-asc') l.sort((a, b) => prixMin(a) - prixMin(b));
    if (tri === 'prix-desc') l.sort((a, b) => prixMin(b) - prixMin(a));
    if (tri === 'nouveautes') l.sort((a, b) => Number(b.badge === 'Nouveau') - Number(a.badge === 'Nouveau'));
    return l;
  }, [actif, q, prix, tri]);

  const titre = q ? `Résultats pour « ${q} »` : actif ? actif.label : 'Toute la boutique';

  const panneau = (
    <div className="space-y-7">
      <fieldset>
        <legend className="font-semibold">Rayon</legend>
        <ul className="mt-3 space-y-1">
          {[{ id: undefined as string | undefined, label: 'Tout' }, ...RAYONS.map((r) => ({ id: r.id as string | undefined, label: r.label }))].map((r) => (
            <li key={r.label}>
              <a href={lien.collection(r.id)} aria-current={r.id === actif?.id && !q ? 'page' : undefined}
                className={`flex min-h-10 items-center justify-between rounded-lg px-3 hover:bg-creme-2 ${r.id === actif?.id && !q ? 'bg-creme-2 font-bold text-foret' : ''}`}>
                {r.label}<span className="chiffres text-sm text-doux">{r.id ? PRODUITS.filter((p) => p.rayon === r.id).length : PRODUITS.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset>
        <legend className="font-semibold">Prix</legend>
        <div className="mt-3 space-y-1">
          {PRIX.map((p) => (
            <label key={p.id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 hover:bg-creme-2">
              <input type="radio" name="prix" checked={prix === p.id} onChange={() => setPrix(p.id)} className="size-4 accent-[#17453a]" />{p.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <nav aria-label="Fil d’Ariane" className="text-sm text-doux"><a href={lien.accueil} className="hover:underline">Accueil</a> / <span aria-current="page">{titre}</span></nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] text-foret">{titre}</h1>
          {actif && !q && <p className="mt-1 text-doux">{actif.phrase}</p>}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-y border-ligne py-3">
        <button type="button" onClick={() => setFiltres(true)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 font-semibold ring-1 ring-ligne lg:hidden"><IconFiltre /> Filtres</button>
        <p className="chiffres hidden text-sm text-doux lg:block" aria-live="polite">{liste.length} produit{liste.length > 1 ? 's' : ''}</p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-doux">Trier par</span>
          <select value={tri} onChange={(e) => setTri(e.target.value as Tri)} className="min-h-11 cursor-pointer rounded-full bg-white px-3 font-semibold ring-1 ring-ligne focus:outline-none focus:ring-2 focus:ring-foret">
            <option value="pertinence">Pertinence</option>
            <option value="nouveautes">Nouveautés</option>
            <option value="prix-asc">Prix croissant</option>
            <option value="prix-desc">Prix décroissant</option>
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filtres">{panneau}</aside>
        <div>
          {liste.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-ligne">
              <p className="text-lg font-semibold">Aucun produit ne correspond.</p>
              <a href={lien.collection()} className="mt-3 inline-block font-semibold text-foret underline underline-offset-4">Voir toute la boutique</a>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5">
              <AnimatePresence mode="popLayout">
                {liste.map((p, i) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, delay: i * 0.03 }}>
                    <Carte p={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {filtres && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <button type="button" aria-label="Fermer les filtres" className="absolute inset-0 bg-encre/40" onClick={() => setFiltres(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-3xl bg-creme p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]" data-lenis-prevent>
            <div className="mb-4 flex items-center justify-between"><p className="text-lg font-semibold">Filtres</p><button type="button" onClick={() => setFiltres(false)} aria-label="Fermer" className="grid size-11 cursor-pointer place-items-center rounded-full"><IconFermer /></button></div>
            {panneau}
            <button type="button" onClick={() => setFiltres(false)} className="mt-6 min-h-13 w-full cursor-pointer rounded-full bg-foret font-bold text-creme">Voir {liste.length} produit{liste.length > 1 ? 's' : ''}</button>
          </div>
        </div>
      )}
    </div>
  );
}
