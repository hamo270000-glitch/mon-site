# Site 6 · Museau Gris

Boutique de paniers orthopédiques pour **chiens âgés et arthrosiques**, en France.
En ligne sur https://hamo270000-glitch.github.io/mon-site/site-6/

- Marque : **Museau Gris** · produit : **Le Doyen** (4 tailles, de 95 € à 159 €, 3 coloris).
- Style « Veillée du soir » : bleu nuit, une seule couleur vive (l'ambre de la lampe), titres Fraunces, texte Instrument Sans.
  Le ciel passe du crépuscule à la nuit pendant qu'on fait défiler la page, et les étoiles s'allument.
- 3D : le panier sous la lampe (appuie sur la mousse : elle s'enfonce puis remonte lentement) et une scène
  « radiographie » : un chien couché sur le carrelage, ses points d'appui en rouge, puis la mousse pousse sous lui
  et les points passent au bleu.
- Lien direct vers la fiche produit avec le chien affiché : `#/le-panier?chien=1`.

Même base technique que le Site 4 : **React**, **Vite**, **Tailwind CSS**, **GSAP**, **Lenis**, **Three.js** (React Three Fiber).

## Organisation
- `source/` : le code à modifier.
  - `src/data/catalog.ts` : tailles, prix, coloris, couches.
  - `src/index.css` : couleurs et polices.
  - `src/pages/` : les pages (accueil, produit, points d'appui, tailles, panier).
  - `src/three/` : la 3D (`Bed.tsx` le panier, `Dog.tsx` le chien en radiographie, `BedCanvas.tsx` la scène et les lumières).
- `index.html` et `assets/` : le site construit, publié par GitHub Pages. **Ne pas modifier à la main.**

## Après chaque modification
```
cd site-6/source
npm install      # la première fois seulement
npm run build    # reconstruit site-6/index.html et site-6/assets/
```

## À compléter avant d'ouvrir
- Fournisseur, épaisseurs et densités réelles (les mesures affichées sont provisoires et indiquées comme telles).
- Délais de livraison et conditions de retour.
- Paiement (le panier fonctionne sur le téléphone, le bouton de paiement est désactivé).
