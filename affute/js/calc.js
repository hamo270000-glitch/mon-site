// Calculs de la sèche : besoins caloriques, macros, rythme et projection.
// Formules utilisées :
//  - métabolisme de base : Mifflin-St Jeor (1990) ;
//  - masse grasse : formule de la Marine américaine (tour de taille, de cou, de hanches) si mesurée,
//    sinon estimation de Deurenberg à partir de l'IMC (moins précise) ;
//  - 1 kg de graisse ≈ 7 700 kcal.

export const ACTIVITY = [
  { id: 'sedentaire', label: 'Peu actif', detail: 'Bureau, peu de marche', f: 1.2 },
  { id: 'leger', label: 'Un peu actif', detail: 'Sport 1 à 2 fois par semaine', f: 1.375 },
  { id: 'modere', label: 'Actif', detail: 'Sport 3 à 4 fois par semaine', f: 1.55 },
  { id: 'intense', label: 'Très actif', detail: 'Sport 5 fois ou plus, ou métier physique', f: 1.725 },
];

export const PACES = [
  { id: 'douce', label: 'Douce', detail: '0,5 % du poids par semaine · garde un max de muscle', pct: 0.005 },
  { id: 'normale', label: 'Normale', detail: '0,75 % par semaine · le meilleur équilibre', pct: 0.0075 },
  { id: 'rapide', label: 'Rapide', detail: '1 % par semaine · plus dur, plus de faim', pct: 0.01 },
];

// Corps visés : taux de masse grasse cible (hommes / femmes).
export const BODIES = [
  { id: 'mince', label: 'Mince et léger', h: 17, f: 25, detail: 'Silhouette affinée, ventre plat' },
  { id: 'athletique', label: 'Athlétique', h: 14, f: 22, detail: 'Musclé, abdos qui se devinent' },
  { id: 'sec', label: 'Sec et dessiné', h: 11, f: 19, detail: 'Abdos visibles, veines sur les bras' },
  { id: 'competition', label: 'Très sec', h: 9, f: 17, detail: 'Niveau shooting photo · difficile à tenir' },
];

const KCAL_PER_KG = 7700;

export const bmi = (p) => p.poids / ((p.taille / 100) ** 2);

export function bmr(p) {
  return 10 * p.poids + 6.25 * p.taille - 5 * p.age + (p.sexe === 'h' ? 5 : -161);
}

export function bodyFat(p) {
  const { taille, tourTaille, tourCou, tourHanches } = p;
  if (tourTaille && tourCou && taille) {
    if (p.sexe === 'h' && tourTaille > tourCou) {
      return { pct: 495 / (1.0324 - 0.19077 * Math.log10(tourTaille - tourCou) + 0.15456 * Math.log10(taille)) - 450, mesure: true };
    }
    if (p.sexe === 'f' && tourHanches && tourTaille + tourHanches > tourCou) {
      return { pct: 495 / (1.29579 - 0.35004 * Math.log10(tourTaille + tourHanches - tourCou) + 0.221 * Math.log10(taille)) - 450, mesure: true };
    }
  }
  return { pct: 1.2 * bmi(p) + 0.23 * p.age - 10.8 * (p.sexe === 'h' ? 1 : 0) - 5.4, mesure: false };
}

// Situations où une sèche n'est pas adaptée : on ne propose pas de déficit.
export function safetyCheck(p) {
  const stops = [];
  if (p.age < 18) stops.push('Tu as moins de 18 ans : ton corps grandit encore. Pas de régime restrictif sans l\'avis d\'un médecin. Mange équilibré et fais du sport, c\'est le meilleur plan.');
  if (p.enceinte) stops.push('Pendant la grossesse ou l\'allaitement, pas de sèche : parles-en à ta sage-femme ou à ton médecin.');
  if (bmi(p) < 18.5) stops.push('Ton poids est déjà bas pour ta taille (IMC sous 18,5). Une sèche serait dangereuse : vise plutôt la prise de muscle.');
  return stops;
}

// Calcule le plan complet.
export function computePlan(p) {
  const act = ACTIVITY.find((a) => a.id === p.activite) || ACTIVITY[1];
  const pace = PACES.find((x) => x.id === p.rythme) || PACES[1];
  const body = BODIES.find((b) => b.id === p.corps) || BODIES[1];
  const base = bmr(p);
  const tdee = base * act.f;
  const bf = bodyFat(p);
  const bfNow = Math.max(4, Math.min(60, bf.pct));
  const bfTarget = Math.min(bfNow, p.sexe === 'h' ? body.h : body.f);
  const lean = p.poids * (1 - bfNow / 100);

  // Poids cible : choisi par la personne, sinon calculé à partir du corps visé (en gardant le muscle).
  const minWeight = 19 * (p.taille / 100) ** 2; // jamais en dessous d'un IMC de 19 (marge de sécurité)
  let target = p.poidsCible || lean / (1 - bfTarget / 100);
  target = Math.max(minWeight, Math.min(p.poids, target));
  const toLose = Math.max(0, p.poids - target);

  // Calories : déficit selon le rythme choisi, avec un plancher de sécurité.
  const floor = Math.max(p.sexe === 'h' ? 1500 : 1200, Math.round(base * 0.85));
  const wantedDeficit = (p.poids * pace.pct * KCAL_PER_KG) / 7;
  let kcal = Math.round((tdee - wantedDeficit) / 10) * 10;
  let limited = false;
  if (kcal < floor) { kcal = Math.round(floor / 10) * 10; limited = true; }
  if (toLose === 0) kcal = Math.round(tdee / 10) * 10;
  const deficit = Math.max(0, tdee - kcal);

  // Macros : protéines élevées pour garder le muscle, lipides suffisants pour les hormones.
  const refWeight = bmi(p) > 30 ? target : p.poids;
  const prot = Math.round(refWeight * (p.sexe === 'h' ? 2.0 : 1.8));
  const lip = Math.round(Math.max(refWeight * 0.8, (kcal * 0.22) / 9));
  const gluc = Math.max(50, Math.round((kcal - prot * 4 - lip * 9) / 4));

  // Projection semaine par semaine (le corps perd un peu moins quand le poids baisse).
  const weeks = [];
  let w = p.poids;
  for (let i = 0; i <= 260; i++) {
    weeks.push(Math.round(w * 10) / 10);
    if (w <= target + 0.05) break;
    const tdeeW = (10 * w + 6.25 * p.taille - 5 * p.age + (p.sexe === 'h' ? 5 : -161)) * act.f;
    const loss = Math.max(0.05, ((tdeeW - kcal) * 7) / KCAL_PER_KG);
    w = Math.max(target, w - loss);
  }
  const nbWeeks = weeks.length - 1;
  const end = new Date(Date.now() + nbWeeks * 7 * 864e5);

  const bfAt = (weight) => {
    // On suppose qu'on garde la masse maigre (entraînement + protéines).
    const fat = Math.max(0, weight - lean);
    return Math.max(bfTarget * 0.9, (fat / weight) * 100);
  };

  return {
    bmr: Math.round(base), tdee: Math.round(tdee), kcal, deficit: Math.round(deficit), limited,
    prot, lip, gluc, eau: Math.round(p.poids * 35 / 100) / 10,
    bfNow: Math.round(bfNow * 10) / 10, bfMesure: bf.mesure, bfTarget, lean: Math.round(lean * 10) / 10,
    target: Math.round(target * 10) / 10, toLose: Math.round(toLose * 10) / 10,
    weeks, nbWeeks, end, pace, body, act, bfAt,
    perWeek: nbWeeks ? Math.round((toLose / nbWeeks) * 100) / 100 : 0,
  };
}

// Répartition des calories dans la journée.
export const SLOTS = [
  { id: 'matin', label: 'Petit-déjeuner', part: 0.25, emoji: '☀️' },
  { id: 'midi', label: 'Déjeuner', part: 0.35, emoji: '🍽️' },
  { id: 'collation', label: 'Collation', part: 0.1, emoji: '⚡' },
  { id: 'soir', label: 'Dîner', part: 0.3, emoji: '🌙' },
];
