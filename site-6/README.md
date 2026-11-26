# Site 6 · Veilleuse

Page de vente d'une boutique française : **Veilleuse**, un panier orthopédique (mousse à mémoire de forme) pour **chiens âgés**.
Un seul produit, quatre tailles (S, M, L, XL, de 95 € à 159 €). Style « luxe sombre et or » : polices Cormorant (titres) et Montserrat (texte).
En ligne sur https://hamo270000-glitch.github.io/mon-site/site-6/

La boutique est **en préparation** : on peut remplir son panier (gardé sur l'appareil), mais le paiement est désactivé (« bientôt disponible »).

## Ordre de la page
Accueil (photo + bouton) · bandeau de réassurance · les signes (section sombre) · le produit (galerie de 6 photos, choix de taille, ajout au panier)
· comment c'est fait (4 couches) · pourquoi orthopédique · guide des tailles avec calculateur · nos engagements · questions fréquentes
· dernier appel (section sombre) · pied de page. Sur téléphone, une barre d'achat apparaît en bas quand on est dans la zone produit.

## Organisation
- `brand/textes.md` : tous les textes de la page. `brand/logo.svg`, `logo-clair.svg`, `symbole.svg` : le logo (ne pas modifier ici).
- `photos/` : les 6 photos d'origine du fournisseur (non modifiées).
- `source/` : le code (React + Vite + Tailwind CSS 4 + GSAP + Lenis).
  - `src/App.tsx` : toutes les sections de la page. `src/data.ts` : tailles, prix, photos et leurs textes alternatifs.
  - `src/cart.tsx` : le panier. `src/index.css` : couleurs et polices (variables `@theme`). `src/ui/Icons.tsx` : les icônes.
  - `public/vues/` : recadrages des photos du fournisseur (sans leurs textes publicitaires ni l'étiquette « your logo » en grand).
  - `public/logo/` : copie des logos de `brand/`. Si le logo change, recopier les 3 fichiers ici puis reconstruire.
- `index.html`, `assets/`, `vues/`, `logo/` : le site publié, **produit par le build**. Ne pas les modifier à la main.

## Après chaque modification
```
cd site-6/source
npm install      # la première fois seulement
npm run build    # vérifie le code puis reconstruit site-6/index.html, assets/, vues/ et logo/
```
Pour voir le site : `cd site-6 && python3 -m http.server 8770`, puis ouvrir http://localhost:8770/

## À compléter avant d'ouvrir
Mesures réelles des tailles (affichées comme provisoires), consignes de lavage, délais de livraison et retours, paiement.
