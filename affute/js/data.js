// Chargement des données et calculs sur les repas (nutrition, prix par magasin, régimes).
let cache = null;

export async function loadData() {
  if (cache) return cache;
  const [ing, rep] = await Promise.all([
    fetch('data/ingredients.json').then((r) => r.json()),
    fetch('data/repas.json').then((r) => r.json()),
  ]);
  const byId = Object.fromEntries(ing.ingredients.map((x) => [x.id, x]));
  cache = { ...ing, byId, repas: rep.repas };
  return cache;
}

let foodsPromise = null;
// La table Ciqual complète (≈ 3 300 aliments) n'est chargée que si on ouvre la recherche.
export function loadFoods() {
  if (!foodsPromise) foodsPromise = fetch('data/aliments.json').then((r) => r.json()).then((d) => d.aliments);
  return foodsPromise;
}

export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe');

// Nutrition d'un repas, avec un facteur de portion.
export function mealNutrition(meal, data, factor = 1) {
  const t = { kcal: 0, prot: 0, gluc: 0, lip: 0, suc: 0, fib: 0, sel: 0 };
  for (const [id, g] of meal.ing) {
    const x = data.byId[id];
    if (!x) continue;
    for (const k of Object.keys(t)) t[k] += ((x[k] || 0) * g * factor) / 100;
  }
  return t;
}

// Prix au kilo d'un ingrédient dans un magasin : relevé réel si on en a, sinon médiane France.
export function ingredientPrice(x, store) {
  // Un seul relevé peut être une exception (promo, produit bio…) : on en veut au moins 2.
  const s = store && x.prix.magasins[store];
  if (s && s.n >= 2) return { kg: s.kg, reel: true, n: s.n };
  if (x.prix.kg) return { kg: x.prix.kg, reel: false, n: x.prix.n };
  return null;
}

export function mealPrice(meal, data, store, factor = 1) {
  let total = 0;
  let reels = 0;
  let connus = 0;
  for (const [id, g] of meal.ing) {
    const x = data.byId[id];
    const p = x && ingredientPrice(x, store);
    if (!p) continue;
    connus++;
    if (p.reel) reels++;
    total += (p.kg * g * factor) / 1000;
  }
  return { total, reels, connus, nb: meal.ing.length };
}

// Prix du repas dans chaque enseigne, du moins cher au plus cher.
export function mealPricesByStore(meal, data, factor = 1) {
  return data.magasins
    .map((m) => ({ ...m, ...mealPrice(meal, data, m.id, factor) }))
    .sort((a, b) => (b.reels / b.nb >= 0.5) - (a.reels / a.nb >= 0.5) || a.total - b.total);
}

// Compatibilité avec les régimes choisis.
export function dietCheck(meal, data, diets = []) {
  const notes = [];
  let ok = true;
  for (const [id] of meal.ing) {
    const x = data.byId[id];
    if (!x) continue;
    if (diets.includes('halal') && x.halal === 'non') ok = false;
    if (diets.includes('vegetarien') && x.veg === false) ok = false;
    if (diets.includes('sanslactose') && x.lait) notes.push(`${x.nom} : prends la version sans lactose.`);
    if (diets.includes('halal') && x.halal === 'certif') notes.push(`${x.nom} : choisis une viande certifiée halal.`);
  }
  return { ok, notes: [...new Set(notes)] };
}

// Facteur de portion pour atteindre un objectif de calories (limité pour rester réaliste).
export function portionFactor(meal, data, kcal, max = 1.8) {
  const base = mealNutrition(meal, data).kcal;
  if (!base) return 1;
  return Math.max(0.6, Math.min(max, kcal / base));
}

// Arrondi des quantités pour la cuisine : œufs entiers, multiples de 5 g.
export function displayQty(x, g) {
  if (x.unit_g) {
    const n = Math.max(1, Math.round(g / x.unit_g));
    return `${n} ${x.unit}${n > 1 ? 's' : ''}`;
  }
  if (x.id === 'huile') return `${Math.max(1, Math.round(g / 5))} c. à café`;
  return `${Math.max(5, Math.round(g / 5) * 5)} g`;
}
