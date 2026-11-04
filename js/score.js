// Analyse d'un produit Open Food Facts selon le profil de l'utilisateur.
// Fonctions pures : aucune dépendance au DOM, faciles à tester.
import {
  ALLERGENS, CONTROVERSIAL_ADDITIVES, ANIMAL_ADDITIVES, PORK_WORDS, ALCOHOL_WORDS,
  PREGNANCY_WORDS, MICRONUTRIENTS, INTERACTIONS, MEDS, SUGAR_CUBE_G, CHILD_SUGAR_MAX_G,
} from './data.js';

export const normalize = (s) => (s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[-_]/g, ' ');

const has = (arr, tag) => Array.isArray(arr) && arr.includes(tag);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : (v != null && v !== '' && !Number.isNaN(+v) ? +v : null));
const fmt = (v, d = 1) => (v == null ? '?' : (Math.round(v * 10 ** d) / 10 ** d).toLocaleString('fr-FR'));

export function ingredientsText(p) {
  return normalize(p.ingredients_text_fr || p.ingredients_text || '');
}

export function isBeverage(p) {
  return has(p.categories_tags, 'en:beverages') && !has(p.categories_tags, 'en:plant-based-foods');
}

export function isSupplement(p) {
  return has(p.categories_tags, 'en:dietary-supplements') || has(p.categories_tags, 'en:food-supplements');
}

// ---------- Allergènes ----------
export function checkAllergens(p, profile) {
  const out = { contains: [], traces: [] };
  for (const a of ALLERGENS) {
    if (!profile.allergens.includes(a.tag)) continue;
    if (has(p.allergens_tags, a.tag)) out.contains.push(a.label);
    else if (has(p.traces_tags, a.tag)) out.traces.push(a.label);
  }
  return out;
}

// ---------- Halal / végétarien / végan / lactose ----------
// status : 'ok' | 'warn' | 'no' | 'unknown'
export function checkDiets(p) {
  const text = ingredientsText(p);
  const additives = p.additives_tags || [];
  const analysis = p.ingredients_analysis_tags || [];
  const labels = p.labels_tags || [];
  const animalSure = [];
  const animalMaybe = [];
  const halalRisk = [];
  for (const tag of additives) {
    const a = ANIMAL_ADDITIVES[tag];
    if (!a) continue;
    const item = `${tag.replace('en:', '').toUpperCase()} ${a.name} (${a.origin})`;
    (a.sure ? animalSure : animalMaybe).push(item);
    if (a.halalRisk && tag !== 'en:e441') halalRisk.push(item);
  }
  const pork = PORK_WORDS.filter((w) => text.includes(w));
  const alcohol = ALCOHOL_WORDS.filter((w) => text.includes(w)).map((w) => w.replace(/[ ,]+$/, ''));
  const hasGelatin = text.includes('gelatine') || has(additives, 'en:e441');
  const noText = !text;
  // Les allergènes déclarés sont souvent plus fiables que l'analyse automatique des ingrédients.
  const allergens = p.allergens_tags || [];
  const animalAllergens = ['en:milk', 'en:eggs', 'en:fish', 'en:crustaceans', 'en:molluscs'].filter((t) => has(allergens, t));
  const meatFishAllergens = animalAllergens.filter((t) => ['en:fish', 'en:crustaceans', 'en:molluscs'].includes(t));
  const ALLERGEN_FR = { 'en:milk': 'lait', 'en:eggs': 'œufs', 'en:fish': 'poisson', 'en:crustaceans': 'crustacés', 'en:molluscs': 'mollusques' };

  const res = {};

  // Halal
  if (has(labels, 'en:halal')) {
    res.halal = { status: 'ok', reasons: ['Certifié halal (label sur l\'emballage).'] };
  } else if (pork.length || alcohol.length || has(p.categories_tags, 'en:alcoholic-beverages')) {
    const r = [];
    if (pork.length) r.push(`Contient : ${pork.join(', ')}.`);
    if (alcohol.length || has(p.categories_tags, 'en:alcoholic-beverages')) r.push(`Contient de l'alcool${alcohol.length ? ` : ${alcohol.join(', ')}` : ''}.`);
    res.halal = { status: 'no', reasons: r };
  } else if (noText) {
    res.halal = { status: 'unknown', reasons: ['Liste d\'ingrédients non disponible.'] };
  } else {
    const r = [];
    if (hasGelatin) r.push('Contient de la gélatine : origine (porc, bœuf, poisson) non précisée.');
    if (has(analysis, 'en:non-vegetarian')) r.push('Contient des ingrédients d\'origine animale : vérifier l\'abattage.');
    halalRisk.forEach((a) => r.push(`Additif pouvant être d'origine animale : ${a}.`));
    res.halal = r.length
      ? { status: 'warn', reasons: [...r, 'Pas de certification halal.'] }
      : { status: 'ok', reasons: ['Aucun ingrédient interdit détecté (produit non certifié).'] };
  }

  // Végétarien
  if (has(analysis, 'en:non-vegetarian') || pork.length || hasGelatin || meatFishAllergens.length) {
    res.vegetarian = { status: 'no', reasons: ['Contient des ingrédients d\'origine animale (viande, poisson, gélatine…).'] };
  } else if (has(analysis, 'en:vegetarian')) {
    res.vegetarian = { status: 'ok', reasons: ['Végétarien.'] };
  } else if (has(analysis, 'en:maybe-vegetarian')) {
    res.vegetarian = { status: 'warn', reasons: ['Peut contenir des ingrédients d\'origine animale.'] };
  } else {
    res.vegetarian = { status: 'unknown', reasons: ['Statut inconnu.'] };
  }

  // Végan
  if (has(analysis, 'en:non-vegan') || animalSure.length || animalAllergens.length || res.vegetarian.status === 'no') {
    const r = [animalAllergens.length
      ? `Contient des ingrédients d'origine animale : ${animalAllergens.map((t) => ALLERGEN_FR[t]).join(', ')}.`
      : 'Contient des ingrédients d\'origine animale.'];
    animalSure.forEach((a) => r.push(`Additif : ${a}.`));
    res.vegan = { status: 'no', reasons: r };
  } else if (has(analysis, 'en:vegan') && !animalMaybe.length) {
    res.vegan = { status: 'ok', reasons: ['Végan.'] };
  } else if (has(analysis, 'en:maybe-vegan') || animalMaybe.length) {
    const r = ['Peut contenir des ingrédients d\'origine animale.'];
    animalMaybe.forEach((a) => r.push(`Additif : ${a}.`));
    res.vegan = { status: 'warn', reasons: r };
  } else {
    res.vegan = { status: 'unknown', reasons: ['Statut inconnu.'] };
  }

  // Sans lactose
  if (has(labels, 'en:no-lactose') || has(labels, 'en:lactose-free')) {
    res.nolactose = { status: 'ok', reasons: ['Sans lactose (label).'] };
  } else if (has(p.allergens_tags, 'en:milk')) {
    res.nolactose = { status: 'no', reasons: ['Contient du lait.'] };
  } else if (has(p.traces_tags, 'en:milk')) {
    res.nolactose = { status: 'warn', reasons: ['Peut contenir des traces de lait.'] };
  } else {
    res.nolactose = { status: noText ? 'unknown' : 'ok', reasons: [noText ? 'Ingrédients non disponibles.' : 'Pas de lait détecté.'] };
  }
  return res;
}

// ---------- Mode parents : sucre en morceaux ----------
export function childSugar(p) {
  const n = p.nutriments || {};
  const per100 = num(n.sugars_100g);
  if (per100 == null) return null;
  const servingG = num(p.serving_quantity);
  const perServing = servingG ? (per100 * servingG) / 100 : null;
  const ref = perServing ?? per100;
  return {
    per100,
    perServing,
    servingG,
    cubes100: per100 / SUGAR_CUBE_G,
    cubesServing: perServing != null ? perServing / SUGAR_CUBE_G : null,
    pctDailyChild: Math.round((ref / CHILD_SUGAR_MAX_G) * 100),
    basis: perServing != null ? `par portion (${fmt(servingG, 0)} ${isBeverage(p) ? 'ml' : 'g'})` : `pour 100 ${isBeverage(p) ? 'ml' : 'g'}`,
  };
}

// ---------- Compléments alimentaires ----------
export function checkSupplement(p, profile) {
  const n = p.nutriments || {};
  const text = ingredientsText(p);
  const nutrients = [];
  for (const m of MICRONUTRIENTS) {
    const g = num(n[`${m.key}_serving`]) ?? num(n[`${m.key}_100g`]);
    if (g == null || g <= 0) continue;
    const perServing = num(n[`${m.key}_serving`]) != null;
    const mg = g * 1000;
    const shown = g * m.factor;
    const pct = Math.round((mg / m.nrv) * 100);
    let level = 'ok';
    let note = '';
    if (m.ul != null && mg > m.ul) { level = 'no'; note = `Dépasse la limite de sécurité (${fmt(m.ul * (m.factor / 1e3), 0)} ${m.unit}/jour${m.ulNote ? `, ${m.ulNote}` : ''}).`; } else if (pct > 300) { level = 'warn'; note = 'Dose élevée.'; }
    if (m.key === 'vitamin-a' && profile.conditions.includes('pregnant') && mg > 0.8) {
      level = 'no'; note = 'Vitamine A à forte dose : déconseillée pendant la grossesse.';
    }
    nutrients.push({ label: m.label, amount: `${fmt(shown, shown < 10 ? 1 : 0)} ${m.unit}`, pct, level, note, basis: perServing ? 'par prise' : 'pour 100 g' });
  }
  const interactions = [];
  for (const it of INTERACTIONS) {
    if (!text.includes(it.word)) continue;
    const concerned = it.meds.filter((m) => profile.meds.includes(m));
    interactions.push({
      msg: it.msg,
      forYou: concerned.length > 0,
      meds: concerned.map((id) => MEDS.find((m) => m.id === id)?.label).filter(Boolean),
    });
  }
  return { nutrients, interactions };
}

// ---------- Score personnalisé ----------
const THRESHOLDS = {
  solid: { sugar: [5, 22.5], salt: [0.3, 1.5], satfat: [1.5, 5], kcal: 400 },
  // Boissons : plus sévère sur le sucre (comme le Nutri-Score 2023). Au-delà de 5 g/100 ml, une canette dépasse 4 morceaux.
  drink: { sugar: [1, 5], salt: [0.3, 0.75], satfat: [0.75, 2.5], kcal: 80 },
};

export function analyze(p, profile) {
  const n = p.nutriments || {};
  const drink = isBeverage(p);
  const t = drink ? THRESHOLDS.drink : THRESHOLDS.solid;
  const c = profile.conditions;
  const child = profile.children;
  const m = {
    sugar: (c.includes('diabetes') ? 2 : 1) * (child ? 1.5 : 1),
    salt: c.includes('hypertension') ? 2 : 1,
    satfat: c.includes('cholesterol') ? 2 : 1,
    kcal: profile.goal === 'weight' ? 2 : 1,
    protein: profile.goal === 'sport' ? 2 : 1,
  };

  const sugar = num(n.sugars_100g);
  const salt = num(n.salt_100g);
  const satfat = num(n['saturated-fat_100g']);
  const kcal = num(n['energy-kcal_100g']);
  const fiber = num(n.fiber_100g);
  const protein = num(n.proteins_100g);
  const known = [sugar, salt, satfat, kcal].filter((v) => v != null).length;

  const positives = [];
  const negatives = [];
  let score = 100;

  const level = (v, [mid, high], wHigh, wMid) => (v > high ? wHigh : v > mid ? wMid : 0);
  const unit = drink ? 'ml' : 'g';

  if (sugar != null) {
    const pen = level(sugar, t.sugar, 25, 10) * m.sugar;
    score -= pen;
    if (pen) negatives.push({ text: `${sugar > t.sugar[1] ? 'Très sucré' : 'Sucré'} : ${fmt(sugar)} g pour 100 ${unit}${m.sugar > 1 ? ' (important pour ton profil)' : ''}`, weight: pen });
    else positives.push({ text: `Peu sucré : ${fmt(sugar)} g pour 100 ${unit}` });
  }
  if (salt != null) {
    const pen = level(salt, t.salt, 20, 7) * m.salt;
    score -= pen;
    if (pen) negatives.push({ text: `${salt > t.salt[1] ? 'Très salé' : 'Salé'} : ${fmt(salt, 2)} g pour 100 ${unit}${m.salt > 1 ? ' (important pour ton profil)' : ''}`, weight: pen });
    else positives.push({ text: `Peu salé : ${fmt(salt, 2)} g pour 100 ${unit}` });
  }
  if (satfat != null) {
    const pen = level(satfat, t.satfat, 15, 5) * m.satfat;
    score -= pen;
    if (pen) negatives.push({ text: `Graisses saturées : ${fmt(satfat)} g pour 100 ${unit}${m.satfat > 1 ? ' (important pour ton profil)' : ''}`, weight: pen });
    else positives.push({ text: `Peu de graisses saturées : ${fmt(satfat)} g` });
  }
  // Pénalité supplémentaire quand une valeur dépasse largement le seuil « élevé ».
  for (const [v, high, pen, label] of [[sugar, t.sugar[1] * 2, 10 * m.sugar, 'sucre'], [salt, t.salt[1] * 2, 10 * m.salt, 'sel'], [satfat, t.satfat[1] * 2, 5 * m.satfat, 'graisses saturées']]) {
    if (v != null && v > high) {
      score -= pen;
      const neg = negatives.find((x) => x.text.toLowerCase().includes(label === 'sel' ? 'salé' : label === 'sucre' ? 'sucré' : label));
      if (neg) { neg.weight += pen; neg.text = neg.text.replace(/^(Très sucré|Très salé|Graisses saturées)/, (w) => `${w} (excès)`); }
    }
  }
  if (kcal != null && kcal > t.kcal) {
    const pen = 10 * m.kcal;
    score -= pen;
    negatives.push({ text: `Calorique : ${fmt(kcal, 0)} kcal pour 100 ${unit}${m.kcal > 1 ? ' (important pour ton objectif)' : ''}`, weight: pen });
  }
  if (fiber != null && fiber >= 3) {
    score += fiber >= 6 ? 8 : 4;
    positives.push({ text: `${fiber >= 6 ? 'Riche en fibres' : 'Source de fibres'} : ${fmt(fiber)} g` });
  }
  if (protein != null && protein >= 10) {
    score += 5 * m.protein;
    positives.push({ text: `Riche en protéines : ${fmt(protein)} g${m.protein > 1 ? ' (bon pour ton objectif sport)' : ''}` });
  }
  if (p.nova_group === 4) {
    score -= 15;
    negatives.push({ text: 'Ultra-transformé (NOVA 4)', weight: 15 });
  } else if (p.nova_group === 3) {
    score -= 5;
    negatives.push({ text: 'Transformé (NOVA 3)', weight: 5 });
  } else if (p.nova_group === 1) {
    positives.push({ text: 'Produit brut ou peu transformé (NOVA 1)' });
  }
  const controversial = (p.additives_tags || []).filter((a) => CONTROVERSIAL_ADDITIVES[a]);
  if (controversial.length) {
    const pen = Math.min(15, controversial.length * 5);
    score -= pen;
    negatives.push({
      text: `Additif${controversial.length > 1 ? 's' : ''} controversé${controversial.length > 1 ? 's' : ''} : ${controversial.map((a) => `${a.replace('en:', '').toUpperCase()} (${CONTROVERSIAL_ADDITIVES[a]})`).join(', ')}`,
      weight: pen,
    });
  } else if ((p.additives_tags || []).length === 0 && p.ingredients_text) {
    positives.push({ text: 'Sans additifs' });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Bloquants et alertes personnelles
  const blockers = [];
  const warnings = [];
  const allergens = checkAllergens(p, profile);
  if (allergens.contains.length) blockers.push(`Contient : ${allergens.contains.join(', ')} (tu y es allergique).`);
  if (allergens.traces.length) warnings.push(`Peut contenir des traces de : ${allergens.traces.join(', ')}.`);

  const diets = checkDiets(p);
  for (const d of profile.diets) {
    const r = diets[d];
    if (!r) continue;
    const label = { halal: 'halal', vegetarian: 'végétarien', vegan: 'végan', nolactose: 'sans lactose' }[d];
    if (r.status === 'no') blockers.push(`Pas ${label} : ${r.reasons[0]}`);
    else if (r.status === 'warn') warnings.push(`${label[0].toUpperCase()}${label.slice(1)} à vérifier : ${r.reasons[0]}`);
    else if (r.status === 'unknown') warnings.push(`Impossible de vérifier si c'est ${label} : ${r.reasons[0]}`);
  }

  if (c.includes('pregnant')) {
    const text = ingredientsText(p);
    if (has(p.categories_tags, 'en:alcoholic-beverages') || ALCOHOL_WORDS.some((w) => text.includes(w))) blockers.push('Contient de l\'alcool : à éviter pendant la grossesse.');
    PREGNANCY_WORDS.filter((w) => text.includes(w.word)).forEach((w) => warnings.push(w.msg));
  }
  if (child && ingredientsText(p).includes('cafeine')) warnings.push('Contient de la caféine : déconseillé aux enfants.');

  const supplement = isSupplement(p) ? checkSupplement(p, profile) : null;
  if (supplement) {
    supplement.interactions.filter((i) => i.forYou).forEach((i) => blockers.push(`Interaction possible avec ton traitement : ${i.msg}`));
    supplement.nutrients.filter((x) => x.level === 'no').forEach((x) => warnings.push(`${x.label} : ${x.note}`));
  }

  const enoughData = known >= 3;
  let verdict;
  if (blockers.length) verdict = { key: 'blocked', label: 'Déconseillé pour toi' };
  else if (supplement && !enoughData) verdict = { key: 'info', label: 'Complément alimentaire' };
  else if (!enoughData) verdict = { key: 'unknown', label: 'Données insuffisantes' };
  else if (score >= 75) verdict = { key: 'excellent', label: 'Excellent' };
  else if (score >= 50) verdict = { key: 'good', label: 'Bon' };
  else if (score >= 25) verdict = { key: 'poor', label: 'Médiocre' };
  else verdict = { key: 'bad', label: 'Mauvais' };

  negatives.sort((a, b) => b.weight - a.weight);

  return {
    score: enoughData ? score : null,
    verdict,
    blockers,
    warnings,
    positives,
    negatives,
    diets,
    child: childSugar(p),
    supplement,
    drink,
  };
}

// Compatible avec le profil (aucun bloquant) : sert à filtrer les alternatives.
export function isCompatible(p, profile) {
  return analyze(p, profile).blockers.length === 0;
}
