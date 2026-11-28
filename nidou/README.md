# Nidou — vrai site de commande (Vercel)

Boutique Nidou (paniers orthopédiques pour chien), tirée de la maquette du Site 10, transformée en vrai site déployé sur **Vercel**.

## Ce qu'il fait
- 17 pages indexables : accueil, tous les paniers, 9 fiches produits (`/paniers/<nom>`), guide des tailles, questions fréquentes, commande, contact, mentions légales, confidentialité ; plus `/merci`, `/merci-message` et une page 404.
- **Commande directe (produits en stock)** : formulaire (modèle, taille, quantité, nom, e-mail, téléphone facultatif, adresse, message, accord RGPD). Vérification dans le navigateur **et** sur le serveur, piège à robots. Marche aussi sans JavaScript.
- **Contact** : même fonction, rangée à part.
- Référencement : titre + description par page, adresse canonique, Open Graph, données structurées (Organization, WebSite, Product avec offre « InStock », FAQPage, fil d'Ariane), `sitemap.xml`, `robots.txt`. Pas de faux avis ni de faux prix barrés.
- Lighthouse (28/11/2026) : performance 98-100, accessibilité 100, bonnes pratiques 100, SEO 100.

## Comment c'est fait
- `src/donnees.mjs` : catalogue (noms, couleurs, tailles, prix).
- `build.mjs` : génère toutes les pages dans `dist/` (`npm run build`). L'adresse du site vient de `VERCEL_PROJECT_PRODUCTION_URL` (ou `SITE_URL`).
- `static/` : CSS, JS, polices, photos, icône.
- `api/commande.js` : fonction Vercel qui reçoit les formulaires et les range dans **Vercel Blob** (privé) : dossiers `commandes/` et `messages/`, un fichier JSON par demande.
- Tests : `npm test` (fonction de commande) ; `node test/serveur.mjs` lance le site en local (avec `NIDOU_STOCKAGE_LOCAL=/un/dossier` pour enregistrer les demandes sur le disque).

## Mise en ligne (une seule fois, par l'utilisateur)
1. vercel.com → **Add New… → Project** → importer le dépôt GitHub `mon-site`.
2. **Root Directory** : `nidou` → **Deploy**.
3. Onglet **Storage** → **Create** → **Blob** (accès privé) → le relier au projet `nidou`.
4. Onglet **Deployments** → menu « ⋯ » du dernier déploiement → **Redeploy** (pour que le stockage soit pris en compte).
Ensuite, chaque fusion sur `main` redéploie le site tout seul.

## Voir les commandes
Vercel → projet `nidou` → **Storage** → le magasin Blob → dossier `commandes/` (un fichier par client, avec produit, taille, quantité, total estimé, coordonnées).

## Paiement
Le site ne prend pas encore de paiement en ligne. Après chaque commande reçue, envoyer au client sous 24 h ouvrées un **lien de paiement sécurisé** (par ex. lien Stripe, PayPal ou Shopify), puis expédier dès réception du paiement. (28/11/2026 : l'utilisateur a remplacé la pré-commande par la commande directe car les produits sont disponibles.)
