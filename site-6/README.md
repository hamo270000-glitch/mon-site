# Site 6 · Veilleuse

Boutique d'un panier orthopédique pour **chiens âgés** (France), construite autour d'une **vidéo 3D au défilement** :
quand on fait défiler, la caméra entre dans une chambre la nuit, s'approche du panier près de la lampe, puis le panier s'ouvre en couches.
En ligne sur https://hamo270000-glitch.github.io/mon-site/site-6/

## Comment ça marche
- La vidéo n'est **pas** de la 3D calculée sur le téléphone : ce sont **120 images** calculées à l'avance sur l'ordinateur
  (`film/large/` pour ordinateur 1280×720, `film/haut/` pour téléphone 720×1280). Le site choisit l'image selon le défilement. Fluide sur iPhone.
- La scène 3D qui produit ces images : `source/render/scene.js` (chambre, lampe, fenêtre, panier, trajet de la caméra).

## Organisation
- `source/src/` : le site (React + Vite + Tailwind + GSAP + Lenis). `Film.tsx` = la vidéo au défilement, `App.tsx` = le reste de la page, `data.ts` = tailles et prix.
- `source/render/` : la scène 3D et le script qui calcule les images.
- `film/`, `index.html`, `assets/` : le site publié. Ne pas modifier `index.html` ni `assets/` à la main.

## Refaire la vidéo (après avoir changé la scène 3D)
```
cd site-6/source
rm -rf ../film                      # efface les anciennes images
python3 -m http.server 8767 &       # petit serveur local pour la scène
python3 render/rendre.py            # calcule les 240 images avec Chrome (quelques minutes)
```

## Après chaque modification du site
```
cd site-6/source
npm install      # la première fois seulement
npm run build    # reconstruit site-6/index.html et site-6/assets/
```

## À compléter avant d'ouvrir
Fournisseur et mesures réelles (affichées comme provisoires), délais de livraison et retours, paiement (bouton désactivé).
