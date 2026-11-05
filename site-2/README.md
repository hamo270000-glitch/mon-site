# Site 2 : Rosée

Boutique de soins de la peau (marque Rosée), animée, en ligne sur https://hamo270000-glitch.github.io/mon-site/site-2/

## Outils
- **React** + **Vite** + **Tailwind CSS**
- **React Bits** : composants animés copiés dans `source/src/components/reactbits/` (code de https://github.com/DavidHDev/react-bits)
- **GSAP** (+ `@gsap/react`, ScrollTrigger) : animations
- **Lenis** : défilement doux, relié à GSAP dans `source/src/SmoothScroll.tsx`

## Organisation
- `source/src/data/products.ts` : la liste des produits (nom, prix, couleur, description…). Pour ajouter un produit, copier un bloc.
- `source/src/shop/` : dessins des produits, panier, panneaux.
- `source/` : le code à modifier (page principale : `source/src/App.tsx`).
- `index.html` et `assets/` : le site construit, publié par GitHub Pages. **Ne pas modifier à la main.**

## Après chaque modification
```
cd site-2/source
npm install      # la première fois seulement
npm run build    # reconstruit site-2/index.html et site-2/assets/
```
Puis commit des deux : `source/` et le site construit.

## Ajouter un composant React Bits
Prendre la version « TS + Tailwind » du composant dans le dépôt react-bits
(`src/ts-tailwind/...`), la copier dans `source/src/components/reactbits/`,
installer ses dépendances avec npm si besoin, puis l'utiliser dans `App.tsx`.

## Commandes
Le panier fonctionne (enregistré sur l’appareil), mais aucun paiement n’est branché : le bouton « Commander » affiche que les commandes ne sont pas encore ouvertes.
