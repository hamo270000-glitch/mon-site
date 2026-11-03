// Données de référence utilisées par l'analyse.
// Sources : règlement UE 1169/2011 (14 allergènes, apports de référence),
// EFSA (limites supérieures de sécurité), Open Food Facts (tags).

export const ALLERGENS = [
  { tag: 'en:gluten', label: 'Gluten' },
  { tag: 'en:milk', label: 'Lait' },
  { tag: 'en:eggs', label: 'Œufs' },
  { tag: 'en:peanuts', label: 'Arachides' },
  { tag: 'en:nuts', label: 'Fruits à coque' },
  { tag: 'en:soybeans', label: 'Soja' },
  { tag: 'en:fish', label: 'Poisson' },
  { tag: 'en:crustaceans', label: 'Crustacés' },
  { tag: 'en:molluscs', label: 'Mollusques' },
  { tag: 'en:sesame-seeds', label: 'Sésame' },
  { tag: 'en:celery', label: 'Céleri' },
  { tag: 'en:mustard', label: 'Moutarde' },
  { tag: 'en:lupin', label: 'Lupin' },
  { tag: 'en:sulphur-dioxide-and-sulphites', label: 'Sulfites' },
];

export const DIETS = [
  { id: 'halal', label: 'Halal' },
  { id: 'vegetarian', label: 'Végétarien' },
  { id: 'vegan', label: 'Végan' },
  { id: 'nolactose', label: 'Sans lactose' },
];

export const CONDITIONS = [
  { id: 'diabetes', label: 'Diabète / surveiller le sucre' },
  { id: 'hypertension', label: 'Tension / surveiller le sel' },
  { id: 'cholesterol', label: 'Cholestérol / graisses saturées' },
  { id: 'pregnant', label: 'Enceinte' },
];

export const GOALS = [
  { id: 'none', label: 'Manger plus sain' },
  { id: 'weight', label: 'Perdre du poids' },
  { id: 'sport', label: 'Sport / prise de muscle' },
];

export const MEDS = [
  { id: 'anticoag', label: 'Anticoagulants (fluidifiants du sang)' },
  { id: 'pill', label: 'Pilule contraceptive' },
  { id: 'antidep', label: 'Antidépresseurs' },
  { id: 'statin', label: 'Statines (cholestérol)' },
  { id: 'bp', label: 'Médicaments contre la tension' },
];

// Slugs des enseignes dans Open Food Facts (stores_tags).
export const STORES = [
  { id: '', label: 'Peu importe' },
  { id: 'carrefour', label: 'Carrefour' },
  { id: 'e-leclerc', label: 'E.Leclerc' },
  { id: 'auchan', label: 'Auchan' },
  { id: 'lidl', label: 'Lidl' },
  { id: 'aldi', label: 'Aldi' },
  { id: 'intermarche', label: 'Intermarché' },
  { id: 'super-u', label: 'Super U' },
  { id: 'monoprix', label: 'Monoprix' },
  { id: 'casino', label: 'Casino' },
  { id: 'franprix', label: 'Franprix' },
];

// Additifs dont l'usage fait débat (avis EFSA, CIRC, ou étude de Southampton).
export const CONTROVERSIAL_ADDITIVES = {
  'en:e249': 'Nitrite de potassium',
  'en:e250': 'Nitrite de sodium',
  'en:e251': 'Nitrate de sodium',
  'en:e252': 'Nitrate de potassium',
  'en:e171': 'Dioxyde de titane',
  'en:e150c': 'Caramel ammoniacal',
  'en:e150d': 'Caramel au sulfite d\'ammonium',
  'en:e320': 'BHA',
  'en:e321': 'BHT',
  'en:e951': 'Aspartame',
  'en:e950': 'Acésulfame K',
  'en:e955': 'Sucralose',
  'en:e102': 'Tartrazine',
  'en:e104': 'Jaune de quinoléine',
  'en:e110': 'Jaune orangé S',
  'en:e122': 'Azorubine',
  'en:e124': 'Ponceau 4R',
  'en:e129': 'Rouge allura',
};

// Additifs d'origine animale (certaine ou possible) : importants pour halal / végan.
// halalRisk : peut provenir du porc ou d'un animal non abattu selon le rite.
export const ANIMAL_ADDITIVES = {
  'en:e120': { name: 'Carmin (cochenille)', origin: 'insecte', sure: true },
  'en:e441': { name: 'Gélatine', origin: 'animale (souvent porc)', sure: true, halalRisk: true },
  'en:e542': { name: 'Phosphate d\'os', origin: 'animale', sure: true, halalRisk: true },
  'en:e904': { name: 'Gomme-laque', origin: 'insecte', sure: true },
  'en:e901': { name: 'Cire d\'abeille', origin: 'abeille', sure: true },
  'en:e913': { name: 'Lanoline', origin: 'laine de mouton', sure: true },
  'en:e1105': { name: 'Lysozyme', origin: 'œuf', sure: true },
  'en:e966': { name: 'Lactitol', origin: 'lait', sure: true },
  'en:e920': { name: 'L-cystéine', origin: 'possiblement plumes ou poils', sure: false, halalRisk: true },
  'en:e322': { name: 'Lécithines', origin: 'souvent soja, parfois œuf', sure: false },
  'en:e470a': { name: 'Sels d\'acides gras', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e470b': { name: 'Sels d\'acides gras', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e471': { name: 'Mono- et diglycérides', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e472a': { name: 'Esters d\'acides gras', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e472b': { name: 'Esters d\'acides gras', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e472c': { name: 'Esters d\'acides gras', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e472e': { name: 'Esters d\'acides gras', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e473': { name: 'Sucroesters', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e475': { name: 'Esters polyglycériques', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e481': { name: 'Stéaroyl-lactylate', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e482': { name: 'Stéaroyl-lactylate', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e570': { name: 'Acide stéarique', origin: 'végétale ou animale', sure: false, halalRisk: true },
  'en:e631': { name: 'Inosinate disodique', origin: 'souvent viande ou poisson', sure: false, halalRisk: true },
  'en:e635': { name: 'Ribonucléotides', origin: 'souvent viande ou poisson', sure: false, halalRisk: true },
};

// Mots-clés dans la liste d'ingrédients (en minuscules, sans accents).
export const PORK_WORDS = ['porc', 'lard', 'saindoux', 'bacon', 'jambon', 'chorizo', 'pancetta', 'gelatine de porc', 'couenne'];
export const ALCOHOL_WORDS = ['alcool', 'vin ', 'vin,', 'rhum', 'biere', 'liqueur', 'whisky', 'vodka', 'cognac', 'calvados', 'kirsch', 'ethanol', 'marsala', 'porto'];
export const PREGNANCY_WORDS = [
  { word: 'lait cru', msg: 'Contient du lait cru : déconseillé pendant la grossesse (risque de listéria).' },
  { word: 'cafeine', msg: 'Contient de la caféine : à limiter pendant la grossesse.' },
  { word: 'guarana', msg: 'Contient du guarana (riche en caféine) : à limiter pendant la grossesse.' },
  { word: 'reglisse', msg: 'Contient de la réglisse : à limiter pendant la grossesse.' },
];

// Compléments alimentaires : apports de référence (VNR, UE 1169/2011)
// et limites supérieures de sécurité chez l'adulte (EFSA), en mg.
export const MICRONUTRIENTS = [
  { key: 'vitamin-a', label: 'Vitamine A', nrv: 0.8, ul: 3, unit: 'µg', factor: 1e6 },
  { key: 'vitamin-d', label: 'Vitamine D', nrv: 0.005, ul: 0.1, unit: 'µg', factor: 1e6 },
  { key: 'vitamin-e', label: 'Vitamine E', nrv: 12, ul: 300, unit: 'mg', factor: 1e3 },
  { key: 'vitamin-c', label: 'Vitamine C', nrv: 80, ul: null, unit: 'mg', factor: 1e3 },
  { key: 'vitamin-b6', label: 'Vitamine B6', nrv: 1.4, ul: 12, unit: 'mg', factor: 1e3 },
  { key: 'vitamin-b9', label: 'Vitamine B9 (folates)', nrv: 0.2, ul: 1, unit: 'µg', factor: 1e6 },
  { key: 'vitamin-b12', label: 'Vitamine B12', nrv: 0.0025, ul: null, unit: 'µg', factor: 1e6 },
  { key: 'magnesium', label: 'Magnésium', nrv: 375, ul: 250, unit: 'mg', factor: 1e3, ulNote: 'limite pour le magnésium ajouté' },
  { key: 'iron', label: 'Fer', nrv: 14, ul: null, unit: 'mg', factor: 1e3 },
  { key: 'zinc', label: 'Zinc', nrv: 10, ul: 25, unit: 'mg', factor: 1e3 },
  { key: 'calcium', label: 'Calcium', nrv: 800, ul: 2500, unit: 'mg', factor: 1e3 },
];

// Interactions connues entre plantes ou nutriments et médicaments.
// Message volontairement prudent : toujours renvoyer vers un professionnel.
export const INTERACTIONS = [
  { word: 'millepertuis', meds: ['pill', 'antidep', 'anticoag'], msg: 'Le millepertuis peut rendre la pilule moins efficace et interagir avec les antidépresseurs et les anticoagulants.' },
  { word: 'ginkgo', meds: ['anticoag'], msg: 'Le ginkgo peut augmenter le risque de saignement avec les anticoagulants.' },
  { word: 'vitamine k', meds: ['anticoag'], msg: 'La vitamine K peut modifier l\'effet de certains anticoagulants.' },
  { word: 'levure de riz rouge', meds: ['statin'], msg: 'La levure de riz rouge agit comme une statine : risque de surdosage avec ton traitement.' },
  { word: 'reglisse', meds: ['bp'], msg: 'La réglisse peut faire monter la tension.' },
  { word: 'pamplemousse', meds: ['statin'], msg: 'Le pamplemousse peut augmenter les effets de certaines statines.' },
  { word: 'curcuma', meds: ['anticoag'], msg: 'Le curcuma à forte dose peut augmenter le risque de saignement avec les anticoagulants.' },
  { word: 'omega 3', meds: ['anticoag'], msg: 'Les oméga-3 à forte dose peuvent augmenter le risque de saignement avec les anticoagulants.' },
  { word: 'melatonine', meds: ['antidep'], msg: 'La mélatonine peut interagir avec certains antidépresseurs.' },
];

export const SUGAR_CUBE_G = 4; // un morceau de sucre ≈ 4 g
export const CHILD_SUGAR_MAX_G = 25; // AHA : moins de 25 g de sucres ajoutés par jour pour un enfant
