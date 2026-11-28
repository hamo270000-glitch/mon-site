// Génère le site statique de Nidou dans dist/ (pages HTML, plan du site, robots.txt).
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { MARQUE, PRODUITS, RACES, POIDS, euros, tailleDefaut, prixMin } from './src/donnees.mjs';

const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const SITE = (process.env.SITE_URL || (prodUrl ? `https://${prodUrl}` : 'https://nidou.vercel.app')).replace(/\/$/, '');
const DIST = 'dist';
const AUJ = new Date().toISOString().slice(0, 10);

rmSync(DIST, { recursive: true, force: true });
cpSync('static', DIST, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ICONE_PHOTO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
const LOGO = `<b>NIDOU</b><i></i><small>COUCHAGE POUR CHIENS</small>`;

const MENU = [['/', 'Accueil'], ['/paniers', 'Paniers'], ['/guide-des-tailles', 'Guide des tailles'], ['/faq', 'Questions'], ['/contact', 'Contact']];

function page({ chemin, titre, description, contenu, jsonld = [], image = '/img/og.jpg', noindex = false }) {
  const url = SITE + (chemin === '/' ? '/' : chemin);
  const titreComplet = chemin === '/' ? titre : `${titre} | Nidou`;
  const menu = MENU.map(([h, t]) => `<a href="${h}"${h === chemin ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="fr" class="sans-js">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(titreComplet)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
${noindex ? '<meta name="robots" content="noindex" />' : ''}
<meta name="theme-color" content="#2e2420" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/favicon.png" />
<link rel="preload" href="/fonts/instrument-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/style.css" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Nidou" />
<meta property="og:locale" content="fr_FR" />
<meta property="og:title" content="${esc(titreComplet)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}${image}" />
<meta name="twitter:card" content="summary_large_image" />
${ld}
</head>
<body>
<a class="saut" href="#contenu">Aller au contenu</a>
<div class="bandeau">En stock · livraison suivie · 14 jours pour changer d’avis</div>
<header class="entete">
  <div class="env">
    <button class="burger" id="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="tiroir"><svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg></button>
    <a class="logo" href="/" aria-label="NIDOU, couchage pour chiens, accueil">${LOGO}</a>
    <nav class="menu" aria-label="Menu principal">${menu}</nav>
    <a class="btn btn-caramel cta" href="/commande">Commander<span class="long">&nbsp;un panier</span></a>
  </div>
</header>
<div class="tiroir" id="tiroir"><div class="voile" data-ferme></div>
  <nav aria-label="Menu mobile"><button class="ferme" type="button" data-ferme aria-label="Fermer le menu">×</button>${menu}<a class="btn btn-caramel" href="/commande">Commander un panier</a></nav>
</div>
<main id="contenu">
${contenu}
</main>
<footer class="pied">
  <div class="env">
    <div class="pied-g">
      <div><a class="logo" href="/" aria-label="NIDOU, couchage pour chiens, accueil">${LOGO}</a><p>Des paniers orthopédiques pensés pour le sommeil de ton chien et beaux dans ton intérieur, du Chihuahua au Dogue allemand.</p></div>
      <div><h2>La boutique</h2><ul><li><a href="/paniers">Tous les paniers</a></li><li><a href="/guide-des-tailles">Guide des tailles</a></li><li><a href="/commande">Commander</a></li></ul></div>
      <div><h2>Aide</h2><ul><li><a href="/faq">Questions fréquentes</a></li><li><a href="/contact">Nous écrire</a></li></ul></div>
      <div><h2>Informations</h2><ul><li><a href="/mentions-legales">Mentions légales</a></li><li><a href="/confidentialite">Confidentialité</a></li></ul></div>
    </div>
    <div class="pied-bas"><span>© ${new Date().getFullYear()} Nidou</span><span>Paniers en stock, livraison suivie</span></div>
  </div>
</footer>
<script src="/app.js" defer></script>
</body>
</html>
`;
}

function ecrire(chemin, html) {
  const fichier = chemin === '/' ? join(DIST, 'index.html') : join(DIST, chemin.slice(1) + '.html');
  mkdirSync(dirname(fichier), { recursive: true });
  writeFileSync(fichier, html);
}

const visuel = (p, grand = false) => {
  if (p.photos) return `<img src="${p.photos[0]}" alt="${esc(p.nom)} ${esc(p.couleur.toLowerCase())}, vue en situation" ${grand ? 'id="grande" fetchpriority="high"' : 'loading="lazy"'} width="800" height="${grand ? 800 : 800}" />`;
  return `<div class="ph" role="img" aria-label="${esc(p.nom)}, photo à venir">${ICONE_PHOTO}<b>${esc(p.nom)}</b><span>${esc(p.couleur)} · photo à venir</span></div>`;
};
const carte = (p) => {
  const ts = Object.keys(p.t);
  return `<a class="carte" href="/paniers/${p.slug}" data-f="${p.f.join(' ')}"${p.f.includes('top') ? '' : ' hidden'}>
    <div class="visuel">${p.badge ? `<span class="badge">${p.badge}</span>` : ''}${visuel(p)}</div>
    <h3>${esc(p.nom)}</h3>
    <p class="meta">${esc(p.couleur)} · ${ts.length > 1 ? `${ts[0]} à ${ts[ts.length - 1]}` : p.t.Unique[0]}</p>
    <p class="prix">${ts.length > 1 ? 'Dès ' : ''}${euros(prixMin(p))}</p>
  </a>`;
};
const carteSimple = (p) => carte(p).replace(' hidden', '');

const organisation = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Nidou', url: SITE + '/', logo: SITE + '/favicon.png' };
const siteWeb = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Nidou', url: SITE + '/', inLanguage: 'fr-FR' };
const fil = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })) });

const FAQ = [
  ['Comment se passe la commande ?', 'Tu choisis ton panier et sa taille, puis tu remplis le formulaire de commande. Sous 24 h ouvrées, on t’envoie par e-mail la confirmation et un lien de paiement sécurisé. Ton panier est expédié dès le paiement reçu, en livraison suivie.'],
  ['Quelle taille choisir ?', 'Mesure ton chien allongé de tout son long, du bout du nez à la base de la queue, puis ajoute 15 à 20 cm. En cas de doute entre deux tailles, prends la plus grande : il pourra s’étirer.'],
  ['Mon chien va-t-il l’aimer tout de suite ?', 'La mousse est plus ferme qu’un coussin, c’est voulu : elle soutient au lieu de s’enfoncer. Pose dessus sa couverture habituelle et laisse-lui quelques jours pour l’adopter.'],
  ['Est-ce vraiment orthopédique ?', 'Le couchage est en mousse à mémoire de forme : elle épouse le corps et répartit le poids, ce qui soulage les points d’appui (hanches, épaules, coudes). Ce n’est pas un rembourrage en fibres qui s’aplatit.'],
  ['Peut-on laver la housse ?', 'Oui, elle s’enlève grâce à sa fermeture éclair et passe en machine. La mousse, elle, ne se lave pas : aère-la de temps en temps.'],
  ['Et si le panier ne lui convient pas ?', 'Après réception, tu as 14 jours pour changer d’avis et nous retourner le panier dans son état d’origine.'],
];
const faqHtml = FAQ.map(([q, r], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div><p>${esc(r)}</p></div></details>`).join('');
const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) };

const TRIO = `<div class="trio">
  <div data-ap><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15c3-3 6-3 9 0s6 3 9 0"/><path d="M3 11c3-3 6-3 9 0s6 3 9 0"/><path d="M3 19h18"/></svg><h3>Mousse à mémoire de forme</h3><p>Elle épouse le corps de ton chien et soulage les hanches, les épaules et les coudes.</p></div>
  <div data-ap><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v11H4z"/><path d="M9 8V5h6v3"/><path d="M8 13h8"/></svg><h3>Housse lavable</h3><p>Déhoussable avec une fermeture éclair et lavable en machine.</p></div>
  <div data-ap><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1014-5.3"/><path d="M18 3v4h-4"/></svg><h3>14 jours pour changer d’avis</h3><p>Après réception, tu as 14 jours pour nous retourner le panier.</p></div>
</div>`;

const TAILLES = [['S', '61 × 41 cm'], ['M', '76 × 51 cm'], ['L', '91 × 69 cm'], ['XL', '114 × 89 cm'], ['XXL', '135 × 107 cm']];
const railTailles = `<div class="rail">${TAILLES.map(([t, d]) => `<div class="taille"><b>${t}</b> <span class="dim">${d} · ${POIDS[t]}</span><p>${RACES[t]}</p></div>`).join('')}</div>`;

/* ---------- Accueil ---------- */
const fraich = PRODUITS.find((p) => p.slug === 'panier-rafraichissant');
ecrire('/', page({
  chemin: '/',
  titre: 'Nidou — Paniers orthopédiques pour chien, du S au XXL',
  description: MARQUE.description,
  jsonld: [organisation, siteWeb],
  contenu: `
<section class="heros" aria-labelledby="titre-heros">
  <picture>
    <source media="(max-width: 899px)" srcset="/img/heros-mobile-800.webp" type="image/webp" />
    <source media="(min-width: 900px)" srcset="/img/heros-800.webp 800w, /img/heros-1376.webp 1376w" sizes="100vw" type="image/webp" />
    <img src="/img/heros-1376.webp" alt="Samoyède endormi sur un panier orthopédique gris et bleu dans un salon lumineux" width="1376" height="768" fetchpriority="high" />
  </picture>
  <div class="env"><div class="heros-texte">
    <p class="sur">Panier orthopédique pour chien</p>
    <h1 id="titre-heros">Dors<br />mieux.</h1>
    <p>Mousse à mémoire de forme, du S au XXL. En stock, à partir de ${euros(109.9)}.</p>
    <div class="actions"><a class="btn btn-blanc" href="/paniers">Voir les paniers</a><a class="btn btn-caramel" href="/commande">Commander</a></div>
  </div></div>
</section>
<div class="atouts-bande"><div class="env"><ul>
  <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15c3-3 6-3 9 0s6 3 9 0"/><path d="M3 19h18"/></svg>Mousse à mémoire de forme</li>
  <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v11H4z"/><path d="M9 8V5h6v3"/></svg>Housse lavable en machine</li>
  <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/></svg>Livraison suivie</li>
  <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1014-5.3"/><path d="M18 3v4h-4"/></svg>14 jours pour changer d’avis</li>
</ul></div></div>
<section id="produits">
  <div class="env">
    <div class="titre" data-ap><h2>Nos préférés</h2><p>9 paniers, pour chaque chien et chaque façon de dormir.</p></div>
    <div class="onglets" role="tablist" id="onglets">
      <button type="button" role="tab" aria-selected="true" data-f="top">Meilleures ventes</button>
      <button type="button" role="tab" aria-selected="false" data-f="nouveau">Nouveautés</button>
      <button type="button" role="tab" aria-selected="false" data-f="grand">Grands chiens</button>
    </div>
    <div class="grille" id="grille">${PRODUITS.map(carte).join('')}</div>
    <div class="centre"><a class="btn btn-brun" href="/paniers">Voir tous les paniers</a></div>
  </div>
</section>
<section style="padding-top:0">
  <div class="env duo">
    <div class="plein" data-ap><p class="sur">Nouveau chez Nidou</p><h2>Le panier rafraîchissant</h2><p>${esc(fraich.long)}</p><a class="btn btn-blanc" href="/paniers/${fraich.slug}">Le découvrir · dès ${euros(prixMin(fraich))}</a></div>
    <div class="photo" data-ap><img src="/img/rafraichissant-2.webp" alt="Samoyède endormi sur le panier rafraîchissant gris et bleu" loading="lazy" width="1376" height="768" /></div>
  </div>
</section>
<section id="tailles" style="padding-top:0">
  <div class="env">
    <div class="titre" data-ap><h2>Quelle taille choisir ?</h2><p>Mesure ton chien allongé, du nez à la base de la queue, puis ajoute 15 à 20 cm.</p></div>
    ${railTailles}
    <div class="centre"><a class="btn btn-contour" href="/guide-des-tailles">Voir le guide complet</a></div>
  </div>
</section>
<section style="padding-top:0">
  <div class="env">
    <div class="banniere" data-ap><small>Une question ?</small><h2>On te répond<br />sous 24 h ouvrées.</h2><a class="btn btn-blanc" href="/contact">Nous écrire</a></div>
    ${TRIO}
  </div>
</section>`,
}));

/* ---------- Tous les paniers ---------- */
ecrire('/paniers', page({
  chemin: '/paniers',
  titre: 'Tous les paniers orthopédiques pour chien',
  description: 'Canapés à rebords, paniers ovales, rafraîchissants ou lit taille humaine : les 9 paniers orthopédiques Nidou, du S au XXL, dès 109,90 €.',
  jsonld: [fil([['Accueil', '/'], ['Paniers', '/paniers']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: PRODUITS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/paniers/${p.slug}`, name: p.nom })) }],
  contenu: `<div class="env"><div class="page-titre"><h1>Tous nos paniers</h1><p>Mousse à mémoire de forme, housse lavable, du S au XXL. Choisis un panier pour voir les tailles et le commander.</p></div>
  <section style="padding-top:24px"><div class="grille">${PRODUITS.map(carteSimple).join('')}</div></section></div>`,
}));

/* ---------- Fiches produits ---------- */
for (const p of PRODUITS) {
  const t0 = tailleDefaut(p); const ts = Object.keys(p.t);
  const photos = p.photos || [];
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.nom, description: p.long, brand: { '@type': 'Brand', name: 'Nidou' }, color: p.couleur, category: 'Panier pour chien',
    ...(photos.length ? { image: photos.map((x) => SITE + x) } : { image: [SITE + '/img/og.jpg'] }),
    offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: prixMin(p).toFixed(2), highPrice: Math.max(...Object.values(p.t).map((v) => v[1])).toFixed(2), offerCount: ts.length, availability: 'https://schema.org/InStock', url: `${SITE}/paniers/${p.slug}` },
  };
  ecrire(`/paniers/${p.slug}`, page({
    chemin: `/paniers/${p.slug}`,
    titre: `${p.nom} — panier orthopédique pour chien (${p.couleur})`,
    description: `${p.court} ${ts.length > 1 ? `Tailles ${ts[0]} à ${ts[ts.length - 1]}` : `Format ${p.t.Unique[0]}`}, dès ${euros(prixMin(p))}. En stock, livraison suivie.`,
    image: photos[0] ? photos[0].replace('.webp', '.webp') : '/img/og.jpg',
    jsonld: [ld, fil([['Accueil', '/'], ['Paniers', '/paniers'], [p.nom, `/paniers/${p.slug}`]])],
    contenu: `<div class="env">
  <nav class="ariane" aria-label="Fil d’Ariane"><a href="/">Accueil</a> › <a href="/paniers">Paniers</a> › <span>${esc(p.nom)}</span></nav>
  <div class="fiche" id="fiche-produit" data-slug="${p.slug}" data-tailles='${esc(JSON.stringify(p.t))}' data-races='${esc(JSON.stringify(RACES))}'>
    <div class="galerie">
      <div class="visuel">${p.badge ? `<span class="badge">${p.badge}</span>` : ''}${visuel(p, true)}</div>
      ${photos.length > 1 ? `<div class="vignettes">${photos.map((s, i) => `<button type="button" data-src="${s}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="${s}" alt="" loading="lazy" width="72" height="72" /></button>`).join('')}</div>` : ''}
    </div>
    <div class="infos">
      <p class="marque">Nidou · ${esc(p.cat)}</p>
      <h1>${esc(p.nom)}</h1>
      <p class="couleur">Couleur : <b>${esc(p.couleur)}</b></p>
      <p class="prix-f" id="f-prix">${euros(p.t[t0][1])}</p>
      <p class="pre">● En stock · livraison suivie</p>
      <p class="desc">${esc(p.long)}</p>
      <div class="choix">
        <p>Taille : <b id="f-taille">${t0}</b> · <span id="f-dim">${p.t[t0][0]}</span></p>
        ${ts.length > 1 ? `<div class="opts" role="group" aria-label="Choisir la taille">${ts.map((t) => `<button type="button" data-t="${t}" aria-pressed="${t === t0}">${t}</button>`).join('')}</div>` : ''}
        <p class="races" id="f-races">Idéal pour : ${RACES[t0]}</p>
      </div>
      <a class="btn btn-caramel" id="f-commande" href="/commande?produit=${p.slug}&amp;taille=${t0}">Commander ce panier</a>
      <div class="rassure"><div>Paiement <b>sécurisé</b><br />par lien e-mail</div><div>Retours : <b>14 jours</b><br />après réception</div></div>
      <ul class="points"><li>Mousse à mémoire de forme qui soulage les articulations</li><li>Housse déhoussable, lavable en machine</li><li>Dessous antidérapant</li></ul>
      <div style="margin-top:24px">
        <details><summary>Dimensions par taille</summary><div><ul>${ts.map((t) => `<li><b>${t === 'Unique' ? 'Taille unique' : t}</b> : ${p.t[t][0]} — ${euros(p.t[t][1])}</li>`).join('')}</ul></div></details>
        <details><summary>Entretien</summary><div><p>Enlève la housse grâce à sa fermeture éclair et lave-la en machine. La mousse ne se lave pas : aère-la de temps en temps.</p></div></details>
        <details><summary>Comment se passe la commande ?</summary><div><p>${esc(FAQ[0][1])}</p></div></details>
      </div>
    </div>
  </div>
</div>`,
  }));
}

/* ---------- Guide des tailles ---------- */
ecrire('/guide-des-tailles', page({
  chemin: '/guide-des-tailles',
  titre: 'Guide des tailles de panier pour chien',
  description: 'Quelle taille de panier pour ton chien ? Dimensions S à XXL, poids et races (Chihuahua, Labrador, Berger allemand…) et méthode de mesure.',
  jsonld: [fil([['Accueil', '/'], ['Guide des tailles', '/guide-des-tailles']])],
  contenu: `<div class="env"><div class="page-titre"><h1>Guide des tailles</h1><p>Mesure ton chien allongé de tout son long, du bout du nez à la base de la queue, puis ajoute 15 à 20 cm. En cas de doute, prends la taille au-dessus.</p></div>
  <section style="padding-top:24px"><div class="tableau-env"><table class="tableau"><caption class="saut">Tailles des paniers</caption><thead><tr><th scope="col">Taille</th><th scope="col">Dimensions</th><th scope="col">Poids du chien</th><th scope="col">Races, par exemple</th></tr></thead><tbody>
  ${TAILLES.map(([t, d]) => `<tr><th scope="row">${t}</th><td>${d}</td><td>${POIDS[t]}</td><td>${RACES[t]}</td></tr>`).join('')}
  <tr><th scope="row">Lit géant</th><td>183 × 122 cm</td><td>—</td><td>Toi et ton chien, côte à côte</td></tr>
  </tbody></table></div>
  <p class="mesure">Les dimensions exactes varient un peu selon le modèle : elles sont indiquées sur chaque fiche produit.</p>
  <div class="centre"><a class="btn btn-caramel" href="/paniers">Choisir mon panier</a></div></section></div>`,
}));

/* ---------- FAQ ---------- */
ecrire('/faq', page({
  chemin: '/faq',
  titre: 'Questions fréquentes',
  description: 'Commande, choix de la taille, entretien de la housse, retours : les réponses à tes questions sur les paniers orthopédiques Nidou.',
  jsonld: [faqLd, fil([['Accueil', '/'], ['Questions fréquentes', '/faq']])],
  contenu: `<div class="env"><div class="page-titre"><h1>Questions fréquentes</h1><p>Tu ne trouves pas ta réponse ? <a href="/contact" style="text-decoration:underline">Écris-nous</a>.</p></div><section style="padding-top:24px"><div class="faq">${faqHtml}</div></section></div>`,
}));

/* ---------- Formulaires ---------- */
const catalogue = Object.fromEntries(PRODUITS.map((p) => [p.slug, { nom: p.nom, t: p.t }]));
const champ = (id, lab, type = 'text', extra = '', aide = '', err = 'Ce champ est obligatoire.') =>
  `<div class="bloc"><label for="${id}">${lab}</label><input id="${id}" name="${id}" type="${type}" ${extra} aria-describedby="${id}-err" />${aide ? `<p class="aide">${aide}</p>` : ''}<p class="erreur-champ" id="${id}-err">${err}</p></div>`;

ecrire('/commande', page({
  chemin: '/commande',
  titre: 'Commander un panier',
  description: 'Commande ton panier orthopédique Nidou en stock : choisis le modèle et la taille, laisse ton adresse. Paiement sécurisé par lien e-mail, livraison suivie.',
  jsonld: [fil([['Accueil', '/'], ['Commande', '/commande']])],
  contenu: `<div class="env">
  <div class="page-titre"><h1>Commander</h1><p>Après ta commande, on t’envoie sous 24 h ouvrées un lien de paiement sécurisé par e-mail. Ton panier part dès le paiement reçu, en livraison suivie.</p></div>
  <form class="formulaire" action="/api/commande" method="post" data-envoi novalidate>
    <p class="message-form" role="alert" tabindex="-1"></p>
    <input type="hidden" name="type" value="commande" />
    <div class="pot" aria-hidden="true"><label for="site">Ne pas remplir</label><input id="site" name="site" type="text" tabindex="-1" autocomplete="off" /></div>
    <fieldset><legend>1. Ton panier</legend><div class="champs">
      <div class="bloc"><label for="produit">Modèle</label><select id="produit" name="produit" required aria-describedby="produit-err">${PRODUITS.map((p) => `<option value="${p.slug}">${esc(p.nom)} — ${esc(p.couleur)}</option>`).join('')}</select><p class="erreur-champ" id="produit-err">Choisis un modèle.</p></div>
      <div class="champs deux">
        <div class="bloc"><label for="taille">Taille</label><select id="taille" name="taille" required aria-describedby="taille-err">${Object.entries(PRODUITS[0].t).map(([t, [d, pr]]) => `<option value="${t}"${t === 'M' ? ' selected' : ''}>${t} — ${d} — ${euros(pr)}</option>`).join('')}</select><p class="erreur-champ" id="taille-err">Choisis une taille.</p></div>
        <div class="bloc"><label for="quantite">Quantité</label><select id="quantite" name="quantite" required>${[1, 2, 3, 4, 5].map((n) => `<option>${n}</option>`).join('')}</select></div>
      </div>
      <p class="recap" id="recap" aria-live="polite"></p>
    </div></fieldset>
    <fieldset><legend>2. Tes coordonnées</legend><div class="champs">
      <div class="champs deux">
        ${champ('nom', 'Nom et prénom', 'text', 'required autocomplete="name" maxlength="120"', '', 'Indique ton nom et prénom.')}
        ${champ('email', 'E-mail', 'email', 'required autocomplete="email" maxlength="160" inputmode="email"', 'Pour t’envoyer la confirmation et le lien de paiement.', 'Indique une adresse e-mail valide.')}
      </div>
      ${champ('telephone', 'Téléphone <span class="opt">(facultatif)</span>', 'tel', 'autocomplete="tel" maxlength="30" inputmode="tel"')}
    </div></fieldset>
    <fieldset><legend>3. Adresse de livraison</legend><div class="champs">
      ${champ('adresse', 'Adresse', 'text', 'required autocomplete="street-address" maxlength="200"', '', 'Indique ton adresse.')}
      <div class="champs trois">
        ${champ('code_postal', 'Code postal', 'text', 'required autocomplete="postal-code" maxlength="10" inputmode="numeric" pattern="[0-9A-Za-z \\-]{3,10}"', '', 'Code postal invalide.')}
        ${champ('ville', 'Ville', 'text', 'required autocomplete="address-level2" maxlength="80"', '', 'Indique ta ville.')}
        <div class="bloc"><label for="pays">Pays</label><select id="pays" name="pays" autocomplete="country-name"><option>France</option><option>Belgique</option><option>Suisse</option><option>Luxembourg</option><option>Autre</option></select></div>
      </div>
    </div></fieldset>
    <fieldset><legend>4. Un message ?</legend><div class="bloc"><label for="message">Message <span class="opt">(facultatif)</span></label><textarea id="message" name="message" maxlength="2000" placeholder="La race, le poids ou l’âge de ton chien, une question…"></textarea></div></fieldset>
    <div class="bloc case"><input id="accord" name="accord" type="checkbox" value="oui" required aria-describedby="accord-err" /><div><label for="accord">J’accepte que Nidou utilise ces informations pour traiter ma commande (voir la <a href="/confidentialite" style="text-decoration:underline">politique de confidentialité</a>).</label><p class="erreur-champ" id="accord-err">Merci de cocher cette case pour continuer.</p></div></div>
    <button class="btn btn-caramel" type="submit" style="margin-top:22px">Valider ma commande</button>
    <p class="note-paiement">Paiement sécurisé par lien envoyé par e-mail sous 24 h ouvrées.</p>
  </form>
  <script type="application/json" id="catalogue">${JSON.stringify(catalogue).replace(/</g, '\\u003c')}</script>
</div>`,
}));

ecrire('/contact', page({
  chemin: '/contact',
  titre: 'Nous écrire',
  description: 'Une question sur un panier, une taille ou une commande ? Écris à Nidou, on te répond sous 24 h ouvrées.',
  jsonld: [fil([['Accueil', '/'], ['Contact', '/contact']])],
  contenu: `<div class="env">
  <div class="page-titre"><h1>Nous écrire</h1><p>Une question sur un panier, une taille ou ta commande ? On te répond par e-mail sous 24 h ouvrées.</p></div>
  <form class="formulaire" action="/api/commande" method="post" data-envoi novalidate>
    <p class="message-form" role="alert" tabindex="-1"></p>
    <input type="hidden" name="type" value="contact" />
    <div class="pot" aria-hidden="true"><label for="site">Ne pas remplir</label><input id="site" name="site" type="text" tabindex="-1" autocomplete="off" /></div>
    <div class="champs">
      <div class="champs deux">
        ${champ('nom', 'Nom et prénom', 'text', 'required autocomplete="name" maxlength="120"', '', 'Indique ton nom.')}
        ${champ('email', 'E-mail', 'email', 'required autocomplete="email" maxlength="160" inputmode="email"', '', 'Indique une adresse e-mail valide.')}
      </div>
      <div class="bloc"><label for="message">Message</label><textarea id="message" name="message" required maxlength="2000" aria-describedby="message-err"></textarea><p class="erreur-champ" id="message-err">Écris ton message.</p></div>
      <div class="bloc case"><input id="accord" name="accord" type="checkbox" value="oui" required aria-describedby="accord-err" /><div><label for="accord">J’accepte que Nidou utilise ces informations pour me répondre (voir la <a href="/confidentialite" style="text-decoration:underline">politique de confidentialité</a>).</label><p class="erreur-champ" id="accord-err">Merci de cocher cette case pour continuer.</p></div></div>
    </div>
    <button class="btn btn-brun" type="submit" style="margin-top:22px">Envoyer</button>
  </form>
</div>`,
}));

/* ---------- Merci ---------- */
for (const [chemin, titre, texte] of [
  ['/merci', 'Merci, ta commande est bien reçue !', 'On t’envoie par e-mail sous 24 h ouvrées la confirmation et un lien de paiement sécurisé. Ton panier part dès le paiement reçu.'],
  ['/merci-message', 'Merci, ton message est bien envoyé !', 'On te répond par e-mail sous 24 h ouvrées.'],
]) {
  ecrire(chemin, page({ chemin, titre, description: texte, noindex: true,
    contenu: `<div class="env"><div class="merci"><div class="rond" aria-hidden="true">✓</div><h1>${titre}</h1><p>${texte}</p><a class="btn btn-brun" href="/paniers">Revenir aux paniers</a></div></div>` }));
}

/* ---------- Pages légales ---------- */
ecrire('/mentions-legales', page({
  chemin: '/mentions-legales', titre: 'Mentions légales', description: 'Mentions légales du site Nidou : éditeur, hébergeur et propriété intellectuelle.',
  contenu: `<div class="env"><div class="page-titre"><h1>Mentions légales</h1></div><div class="texte">
  <h2>Éditeur du site</h2><p>Nidou, boutique en cours de création. Pour toute demande, utilise le <a href="/contact" style="text-decoration:underline">formulaire de contact</a>.</p>
  <h2>Hébergeur</h2><p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com.</p>
  <h2>Commandes</h2><p>Les commandes passées sur le site sont confirmées par e-mail avec un lien de paiement sécurisé ; elles sont expédiées après réception du paiement. Après réception du colis, tu disposes d’un délai de 14 jours pour exercer ton droit de rétractation.</p>
  <h2>Propriété intellectuelle</h2><p>Les textes, le logo et la mise en page de ce site appartiennent à Nidou. Toute reproduction sans accord est interdite.</p>
  </div></div>`,
}));
ecrire('/confidentialite', page({
  chemin: '/confidentialite', titre: 'Politique de confidentialité', description: 'Comment Nidou utilise et protège les informations envoyées par les formulaires de commande et de contact.',
  contenu: `<div class="env"><div class="page-titre"><h1>Politique de confidentialité</h1></div><div class="texte">
  <h2>Quelles informations ?</h2><p>Quand tu commandes ou nous écris, nous recevons ton nom, ton e-mail, ton téléphone (si tu le donnes), ton adresse de livraison et ton message.</p>
  <h2>Pourquoi ?</h2><p>Uniquement pour traiter ta commande ou répondre à ta question. Nous ne vendons ni ne partageons tes informations, et nous ne t’envoyons pas de publicité sans ton accord.</p>
  <h2>Où sont-elles stockées ?</h2><p>Dans un espace de stockage privé chez notre hébergeur Vercel, accessible seulement par l’équipe Nidou.</p>
  <h2>Combien de temps ?</h2><p>3 ans maximum après notre dernier échange, puis elles sont supprimées.</p>
  <h2>Tes droits</h2><p>Tu peux demander à consulter, corriger ou supprimer tes informations à tout moment via le <a href="/contact" style="text-decoration:underline">formulaire de contact</a>. Tu peux aussi saisir la CNIL (cnil.fr).</p>
  <h2>Cookies</h2><p>Ce site n’utilise aucun cookie de suivi ni de publicité.</p>
  </div></div>`,
}));

/* ---------- 404 ---------- */
writeFileSync(join(DIST, '404.html'), page({ chemin: '/404', titre: 'Page introuvable', description: 'Cette page n’existe pas.', noindex: true,
  contenu: `<div class="env"><div class="merci"><div class="rond" aria-hidden="true">?</div><h1>Page introuvable</h1><p>Cette page n’existe pas ou a été déplacée.</p><a class="btn btn-brun" href="/">Revenir à l’accueil</a></div></div>` }));

/* ---------- Plan du site + robots ---------- */
const urls = ['/', '/paniers', ...PRODUITS.map((p) => `/paniers/${p.slug}`), '/guide-des-tailles', '/faq', '/commande', '/contact', '/mentions-legales', '/confidentialite'];
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u === '/' ? '/' : u}</loc><lastmod>${AUJ}</lastmod><changefreq>${u.startsWith('/paniers') || u === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${u === '/' ? '1.0' : u.startsWith('/paniers') ? '0.8' : '0.5'}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /merci\nDisallow: /merci-message\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Site généré dans ${DIST}/ pour ${SITE} (${urls.length} pages indexables).`);
