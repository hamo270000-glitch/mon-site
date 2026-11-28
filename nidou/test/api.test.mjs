// Tests de la fonction de commande (sans réseau).
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dossier = mkdtempSync(join(tmpdir(), 'nidou-'));
process.env.NIDOU_STOCKAGE_LOCAL = dossier;
const { default: handler, valider } = await import('../api/commande.js');

function appel(body, headers = { 'content-type': 'application/json', accept: 'application/json' }, method = 'POST') {
  return new Promise((ok) => {
    const res = { statusCode: 200, h: {}, setHeader(k, v) { this.h[k.toLowerCase()] = v; }, end(b) { ok({ code: this.statusCode, h: this.h, corps: b ? JSON.parse(b) : null }); } };
    handler({ method, headers, body }, res);
  });
}
const bon = { type: 'commande', produit: 'canape-a-rebords', taille: 'L', quantite: '2', nom: 'Marie Dupont', email: 'marie@example.com', adresse: '12 rue des Lilas', code_postal: '75011', ville: 'Paris', pays: 'France', accord: 'oui', message: 'Pour mon labrador' };

let r = await appel(bon);
assert.equal(r.code, 200); assert.equal(r.corps.ok, true); assert.equal(r.corps.redirection, '/merci');
const f = readdirSync(join(dossier, 'commandes'));
assert.equal(f.length, 1);
const e = JSON.parse(readFileSync(join(dossier, 'commandes', f[0]), 'utf8'));
assert.equal(e.total_estime, 339.8); assert.equal(e.dimensions, '91 × 69 cm'); assert.equal(e.produit_nom, 'Canapé orthopédique à rebords');

r = await appel({ ...bon, email: 'pas-un-email', taille: 'XS' });
assert.equal(r.code, 422); assert.deepEqual(r.corps.champs.sort(), ['email', 'taille']);

r = await appel({ ...bon, accord: undefined });
assert.equal(r.code, 422); assert.ok(r.corps.champs.includes('accord'));

r = await appel({ ...bon, produit: 'lit-taille-humaine', taille: 'Unique', quantite: '9' });
assert.equal(r.code, 422); assert.deepEqual(r.corps.champs, ['quantite']);

r = await appel({ ...bon, site: 'http://spam' });
assert.equal(r.code, 200); assert.equal(readdirSync(join(dossier, 'commandes')).length, 1, 'le robot ne doit rien enregistrer');

r = await appel({ type: 'contact', nom: 'Léo', email: 'leo@example.com', message: 'Quelle taille pour un beagle ?', accord: 'oui' });
assert.equal(r.code, 200); assert.equal(r.corps.redirection, '/merci-message');
assert.equal(readdirSync(join(dossier, 'messages')).length, 1);

// Formulaire envoyé sans JavaScript : redirection 303
r = await new Promise((ok) => { const res = { statusCode: 200, h: {}, setHeader(k, v) { this.h[k.toLowerCase()] = v; }, end() { ok({ code: this.statusCode, h: this.h }); } };
  handler({ method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(bon).toString() }, res); });
assert.equal(r.code, 303); assert.equal(r.h.location, '/merci');

r = await appel(undefined, {}, 'GET');
assert.equal(r.code, 405);

// Sans stockage configuré : message clair, pas de plantage
delete process.env.NIDOU_STOCKAGE_LOCAL; delete process.env.BLOB_READ_WRITE_TOKEN;
r = await appel(bon);
assert.equal(r.code, 503); assert.match(r.corps.erreur, /pas encore activées/);

assert.equal(valider({ ...bon, nom: '<b>X</b>' }).d.nom, '<b>X</b>'); // stocké tel quel en JSON, jamais affiché en HTML
console.log('✓ Tous les tests de la commande passent');
