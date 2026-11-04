// Accès aux bases ouvertes Open Food Facts et Open Prices.
const OFF = 'https://world.openfoodfacts.org';
const PRICES = 'https://prices.openfoodfacts.org/api/v1';

export const PRODUCT_FIELDS = [
  'code', 'product_name', 'product_name_fr', 'generic_name_fr', 'brands', 'quantity', 'product_quantity',
  'serving_size', 'serving_quantity', 'image_front_small_url', 'image_front_url', 'nutriscore_grade',
  'nova_group', 'nutriments', 'allergens_tags', 'traces_tags', 'ingredients_text', 'ingredients_text_fr',
  'ingredients_analysis_tags', 'additives_tags', 'labels_tags', 'categories_tags', 'stores_tags', 'stores', 'product_quantity_unit',
  'compared_to_category',
].join(',');

async function getJSONOnce(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Les serveurs d'Open Food Facts renvoient parfois une erreur 503 passagère
// (surtout la recherche) : on réessaie alors un peu plus tard.
async function getJSON(url, timeoutMs = 12000, retries = 2) {
  for (let i = 0; ; i++) {
    try {
      return await getJSONOnce(url, timeoutMs);
    } catch (e) {
      if (i >= retries || e.name === 'AbortError') throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

// Met un nom d'enseigne sous forme de « slug » : « E.Leclerc » → « e-leclerc ».
export const slug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Vrai si le produit est signalé dans ce magasin (« carrefour » couvre aussi « carrefour-market »…).
export function soldIn(product, store) {
  if (!store) return false;
  const tags = [...(product.stores_tags || []), ...String(product.stores || '').split(',')];
  return tags.some((t) => { const x = slug(t); return x === store || x.startsWith(`${store}-`); });
}

export async function fetchProduct(code) {
  const data = await getJSON(`${OFF}/api/v2/product/${encodeURIComponent(code)}?lc=fr&fields=${PRODUCT_FIELDS}`);
  if (!data || data.status !== 1 || !data.product) return null;
  return data.product;
}

export function productName(p) {
  return p.product_name_fr || p.product_name || p.generic_name_fr || 'Produit sans nom';
}

// Catégories utilisables, de la plus précise à la plus générale.
// Certaines fiches contiennent des catégories mal saisies (« fr:Nuttela », « en:Pâtes à tartiner ») : on les ignore.
const VALID_CAT = /^en:[a-z0-9-]+$/;
export function usableCategories(product) {
  const cats = (product.categories_tags || []).filter((c) => VALID_CAT.test(c)).reverse();
  // Catégorie de comparaison choisie par Open Food Facts : la plus fiable quand elle existe.
  const ref = product.compared_to_category;
  return VALID_CAT.test(ref || '') ? [ref, ...cats.filter((c) => c !== ref)] : cats;
}

// Assez de valeurs nutritionnelles pour calculer une note.
const hasNutrition = (x) => ['sugars_100g', 'salt_100g', 'saturated-fat_100g', 'energy-kcal_100g']
  .filter((k) => x.nutriments && x.nutriments[k] != null).length >= 3;

// Parents d'une catégorie dans la taxonomie d'Open Food Facts.
const parentCache = new Map();
async function parentsOf(cat) {
  if (!parentCache.has(cat)) {
    const p = getJSON(`${OFF}/api/v2/taxonomy?tagtype=categories&tags=${encodeURIComponent(cat)}&fields=parents`, 8000, 1)
      .then((d) => (d[cat] && d[cat].parents) || []);
    parentCache.set(cat, p);
    p.catch(() => parentCache.delete(cat));
  }
  return parentCache.get(cat);
}

// Suite de catégories à essayer : la plus précise, puis ses parents (4 au maximum).
// Si la taxonomie ne répond pas, on prend simplement les catégories du produit dans l'ordre.
async function categoryChain(cats, mine) {
  const chain = [cats[0]];
  try {
    while (chain.length < 4) {
      const parents = (await parentsOf(chain[chain.length - 1])).filter((c) => VALID_CAT.test(c) && !chain.includes(c));
      const next = parents.find((c) => mine.has(c)) || parents[0];
      if (!next) break;
      chain.push(next);
    }
  } catch (e) {
    return cats.slice(0, 4);
  }
  return chain.length > 1 ? chain : cats.slice(0, 4);
}

const searchCache = new Map();
async function search(params) {
  const url = `${OFF}/api/v2/search?${params}`;
  if (!searchCache.has(url)) {
    const p = getJSON(url, 15000).then((d) => d.products || []);
    searchCache.set(url, p);
    p.catch(() => searchCache.delete(url));
  }
  return searchCache.get(url);
}

// Produits de la même catégorie, mieux notés, vendus en France (et dans le magasin choisi si possible).
// Peu de requêtes : la recherche d'Open Food Facts est limitée (environ 10 par minute).
export async function searchAlternatives(product, store) {
  const cats = usableCategories(product);
  if (!cats.length) return [];
  // Un « vrai » équivalent partage plusieurs catégories avec le produit scanné
  // (évite par exemple de proposer des bonbons à la place d'une pâte à tartiner).
  const mine = new Set(cats);
  const minShared = Math.min(3, mine.size);
  const similar = (x) => (x.categories_tags || []).filter((c) => mine.has(c)).length >= minShared;
  const found = new Map();
  const add = (items, inStore) => {
    for (const x of items) {
      if (x.code && x.code !== product.code && hasNutrition(x) && similar(x) && !found.has(x.code)) {
        found.set(x.code, { ...x, _inStore: inStore || soldIn(x, store) });
      }
    }
  };
  const params = (cat, grades, s) => {
    const q = new URLSearchParams({
      categories_tags: cat,
      countries_tags: 'en:france',
      nutrition_grades_tags: grades,
      sort_by: 'popularity_key',
      page_size: s ? '24' : '40',
      fields: PRODUCT_FIELDS,
      lc: 'fr',
    });
    if (s) q.set('stores_tags', s);
    return q;
  };
  const tryAdd = async (q, inStore) => {
    try { add(await search(q), inStore); return true; } catch (e) { return false; }
  };
  // On part de la catégorie la plus précise, puis on remonte vers la catégorie « parente »
  // (ex. pâtes à tartiner chocolatées → pâtes à tartiner sucrées) jusqu'à trouver au moins 3 produits.
  for (const [i, cat] of (await categoryChain(cats, mine)).entries()) {
    if (!(await tryAdd(params(cat, 'a|b', ''), false))) continue;
    // Dans la catégorie la plus précise, on accepte aussi le Nutri-Score C.
    if (i === 0 && found.size < 3) await tryAdd(params(cat, 'a|b|c', ''), false);
    if (found.size >= 3) {
      if (store) await tryAdd(params(cat, 'a|b', store), true);
      break;
    }
  }
  return [...found.values()];
}

// Dernier prix connu d'un produit (contributions de la communauté Open Prices).
// Priorité aux prix relevés en France, puis à ceux du magasin habituel.
export async function fetchLatestPrice(code, store = '') {
  try {
    const data = await getJSON(`${PRICES}/prices?product_code=${encodeURIComponent(code)}&order_by=-date&size=30`, 8000, 1);
    const items = (data.items || []).filter((x) => x.price != null && (x.currency || 'EUR') === 'EUR');
    if (!items.length) return null;
    const country = (x) => slug((x.location || {}).osm_address_country);
    const inFrance = items.filter((x) => country(x) === 'france');
    const pool = inFrance.length ? inFrance : items;
    const brand = (x) => slug((x.location || {}).osm_brand || (x.location || {}).osm_name);
    const recent = pool.filter((x) => (Date.now() - new Date(x.date)) < 365 * 864e5);
    const it = (store && (recent.length ? recent : pool).find((x) => brand(x) === store || brand(x).startsWith(`${store}-`))) || pool[0];
    const loc = it.location || {};
    return {
      price: Number(it.price),
      date: it.date,
      store: loc.osm_name || loc.osm_brand || '',
      city: loc.osm_address_city || '',
      country: inFrance.length ? '' : loc.osm_address_country || '',
    };
  } catch (e) {
    return null;
  }
}

// Prix au kilo (ou au litre pour les boissons en ml/cl/l).
export function priceUnit(product) {
  return /^(ml|cl|l)$/i.test(product.product_quantity_unit || '') ? 'L' : 'kg';
}

export function pricePerKg(price, product) {
  const q = Number(product.product_quantity);
  if (!price || !q) return null;
  return (price.price / q) * 1000;
}
