// Accès aux bases ouvertes Open Food Facts et Open Prices.
const OFF = 'https://world.openfoodfacts.org';
const PRICES = 'https://prices.openfoodfacts.org/api/v1';

export const PRODUCT_FIELDS = [
  'code', 'product_name', 'product_name_fr', 'generic_name_fr', 'brands', 'quantity', 'product_quantity',
  'serving_size', 'serving_quantity', 'image_front_small_url', 'image_front_url', 'nutriscore_grade',
  'nova_group', 'nutriments', 'allergens_tags', 'traces_tags', 'ingredients_text', 'ingredients_text_fr',
  'ingredients_analysis_tags', 'additives_tags', 'labels_tags', 'categories_tags', 'stores_tags', 'stores',
].join(',');

async function getJSON(url, timeoutMs = 12000) {
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

export async function fetchProduct(code) {
  const data = await getJSON(`${OFF}/api/v2/product/${encodeURIComponent(code)}?lc=fr&fields=${PRODUCT_FIELDS}`);
  if (!data || data.status !== 1 || !data.product) return null;
  return data.product;
}

export function productName(p) {
  return p.product_name_fr || p.product_name || p.generic_name_fr || 'Produit sans nom';
}

// Produits de la même catégorie, mieux notés, vendus en France (et dans le magasin choisi si possible).
export async function searchAlternatives(product, store) {
  const cats = (product.categories_tags || []).slice().reverse();
  if (!cats.length) return [];
  const tried = new Set();
  // On essaie la catégorie la plus précise, puis on remonte d'un ou deux niveaux.
  for (const cat of cats.slice(0, 3)) {
    for (const s of store ? [store, ''] : ['']) {
      const key = `${cat}|${s}`;
      if (tried.has(key)) continue;
      tried.add(key);
      const params = new URLSearchParams({
        categories_tags: cat,
        countries_tags: 'en:france',
        nutrition_grades_tags: 'a|b',
        sort_by: 'popularity_key',
        page_size: '24',
        fields: PRODUCT_FIELDS,
        lc: 'fr',
      });
      if (s) params.set('stores_tags', s);
      try {
        const data = await getJSON(`${OFF}/api/v2/search?${params}`);
        const items = (data.products || []).filter((x) => x.code && x.code !== product.code);
        if (items.length >= 3) return items.map((x) => ({ ...x, _inStore: Boolean(s) }));
      } catch (e) {
        // On passe à la tentative suivante.
      }
    }
  }
  return [];
}

// Dernier prix connu d'un produit (contributions de la communauté Open Prices).
export async function fetchLatestPrice(code) {
  try {
    const data = await getJSON(`${PRICES}/prices?product_code=${encodeURIComponent(code)}&order_by=-date&size=5`, 8000);
    const items = (data.items || []).filter((x) => x.price != null && (x.currency || 'EUR') === 'EUR');
    if (!items.length) return null;
    const it = items[0];
    const loc = it.location || {};
    return {
      price: Number(it.price),
      date: it.date,
      store: loc.osm_name || loc.osm_brand || '',
      city: loc.osm_address_city || '',
    };
  } catch (e) {
    return null;
  }
}

export function pricePerKg(price, product) {
  const q = Number(product.product_quantity);
  if (!price || !q) return null;
  return (price.price / q) * 1000;
}
