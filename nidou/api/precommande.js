// Reçoit les pré-commandes et les messages de contact, les vérifie et les range
// dans le stockage Vercel Blob (dossier precommandes/ ou messages/).
import { randomUUID } from 'node:crypto';
import { PRODUITS } from '../src/donnees.mjs';

const CATALOGUE = Object.fromEntries(PRODUITS.map((p) => [p.slug, p]));
const PAYS = ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Autre'];
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

const texte = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '');

function lireCorps(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return Object.fromEntries(new URLSearchParams(req.body)); }
  }
  return {};
}

export function valider(c) {
  const type = c.type === 'contact' ? 'contact' : 'precommande';
  const d = {
    type,
    nom: texte(c.nom, 120),
    email: texte(c.email, 160).toLowerCase(),
    telephone: texte(c.telephone, 30),
    message: texte(c.message, 2000),
  };
  const erreurs = [];
  if (d.nom.length < 2) erreurs.push('nom');
  if (!EMAIL.test(d.email)) erreurs.push('email');
  if (c.accord !== 'oui' && c.accord !== true && c.accord !== 'on') erreurs.push('accord');
  if (type === 'contact') {
    if (d.message.length < 2) erreurs.push('message');
    return { d, erreurs };
  }
  const p = CATALOGUE[c.produit];
  const taille = texte(c.taille, 10);
  const quantite = Math.trunc(Number(c.quantite || 1));
  if (!p) erreurs.push('produit');
  else if (!p.t[taille]) erreurs.push('taille');
  if (!(quantite >= 1 && quantite <= 5)) erreurs.push('quantite');
  Object.assign(d, {
    adresse: texte(c.adresse, 200),
    code_postal: texte(c.code_postal, 10),
    ville: texte(c.ville, 80),
    pays: PAYS.includes(c.pays) ? c.pays : 'France',
  });
  if (d.adresse.length < 4) erreurs.push('adresse');
  if (!/^[0-9A-Za-z \-]{3,10}$/.test(d.code_postal)) erreurs.push('code_postal');
  if (d.ville.length < 2) erreurs.push('ville');
  if (p && p.t[taille]) {
    const prix = p.t[taille][1];
    Object.assign(d, { produit: p.slug, produit_nom: p.nom, couleur: p.couleur, taille, dimensions: p.t[taille][0], quantite, prix_unitaire: prix, total_estime: Math.round(prix * quantite * 100) / 100 });
  }
  return { d, erreurs };
}

async function enregistrer(chemin, contenu) {
  if (process.env.NIDOU_STOCKAGE_LOCAL) { // tests sur l'ordinateur
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const { join, dirname } = await import('node:path');
    const f = join(process.env.NIDOU_STOCKAGE_LOCAL, chemin); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, contenu);
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw Object.assign(new Error('stockage non configuré'), { code: 'NO_STORE' });
  const { put } = await import('@vercel/blob');
  const opts = { contentType: 'application/json; charset=utf-8', addRandomSuffix: true };
  try {
    await put(chemin, contenu, { ...opts, access: 'private' });
  } catch (e) {
    // Magasin créé en mode « public » : on range quand même la demande, sous un nom impossible à deviner.
    if (/private|access/i.test(String(e && e.message))) await put(chemin, contenu, { ...opts, access: 'public' });
    else throw e;
  }
}

export default async function handler(req, res) {
  const json = /json/.test(req.headers['accept'] || '') || /json/.test(req.headers['content-type'] || '');
  const repondre = (code, corps, redirection) => {
    if (!json && redirection && code < 400) { res.statusCode = 303; res.setHeader('Location', redirection); return res.end(); }
    res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify(corps));
  };
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return repondre(405, { ok: false, erreur: 'Méthode non autorisée.' }); }

  const corps = lireCorps(req);
  // Piège à robots : ce champ est invisible pour les humains.
  if (corps.site) return repondre(200, { ok: true, redirection: '/merci' }, '/merci');

  const { d, erreurs } = valider(corps);
  if (erreurs.length) return repondre(422, { ok: false, erreur: 'Certaines informations sont manquantes ou incorrectes.', champs: erreurs });

  const id = randomUUID().slice(0, 8);
  const quand = new Date().toISOString();
  const enreg = { id, recu_le: quand, ...d, page: req.headers['referer'] || '', navigateur: String(req.headers['user-agent'] || '').slice(0, 200) };
  const dossier = d.type === 'contact' ? 'messages' : 'precommandes';
  const nom = `${dossier}/${quand.slice(0, 10)}_${quand.slice(11, 19).replace(':', 'h').replace(':', 'm')}_${id}.json`;
  try {
    await enregistrer(nom, JSON.stringify(enreg, null, 2));
  } catch (e) {
    console.error('Enregistrement impossible', e);
    return repondre(503, { ok: false, erreur: e.code === 'NO_STORE' ? 'Les pré-commandes ne sont pas encore activées sur ce site.' : 'Le service est momentanément indisponible.' });
  }
  const redirection = d.type === 'contact' ? '/merci-message' : '/merci';
  return repondre(200, { ok: true, id, redirection }, redirection);
}
