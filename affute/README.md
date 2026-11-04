# Affûté – Sèche et prise de masse

Application web installable (PWA) pour réussir une **sèche** (perdre du gras en gardant le muscle) ou une **prise de masse** (prendre du muscle), en mangeant bien et sans se ruiner.

En ligne (après fusion sur `main`) : https://hamo270000-glitch.github.io/mon-site/affute/

## Ce que fait l'appli
- **Questionnaire facultatif** : l'appli s'ouvre directement sur les recettes. Sur chaque plat, on choisit la taille de la portion : 🔥 Sèche, 💪 Prise de masse ou Standard. Le plan, la semaine et le suivi proposent de répondre aux questions (1 minute) pour un calcul sur mesure.
0. **Deux objectifs** au choix dès la première question : sèche ou prise de masse. Tout s'adapte : calories (déficit ou surplus), corps visé, rythme, portions, recettes, avatar, scanner et conseils.
1. **Plan personnalisé** : âge, sexe, taille, poids, activité, corps visé et rythme → calories par jour, protéines, glucides, lipides, date d'arrivée et courbe prévue.
2. **Aperçu de ton futur corps** : avatar « hologramme » 3D qui s'affine semaine après semaine (taux de masse grasse calculé).
3. **Simulation sur ta photo** : tu te prends en photo, tu touches ton nombril, et l'appli affine ta silhouette selon le poids prévu, avec une comparaison avant/après à faire glisser. Les photos restent sur le téléphone.
4. **31 recettes de sèche**, avec des portions adaptées à ton objectif et le **prix réel dans 7 enseignes** : E.Leclerc, Lidl, Super U, Carrefour, Intermarché, Auchan et Aldi.
5. **Ma semaine** : 7 jours de repas générés automatiquement (changeables d'un geste), **liste de courses** et **le même panier comparé dans chaque magasin**.
6. **Tous les aliments** : la table officielle Ciqual 2025 de l'ANSES (3 341 aliments : calories, protéines, glucides, sucres, lipides, fibres, sel), plus des millions de produits de marque via Open Food Facts.
7. **Suivi** du poids avec la courbe réelle comparée à la courbe prévue.
8. **Scanner de produits (Clair intégré)** : onglet Scan au centre. Tu scannes un code-barres et tu obtiens la note Clair sur 100 adaptée à ton profil (allergies, halal, végétarien, sans lactose), un **indice sèche** (part des calories venant des protéines), la part de ta journée que représente une portion, le prix et des alternatives mieux notées. Le scanner réutilise directement le code de Clair (`../js/api.js`, `../js/score.js`). Si tu utilises aussi Clair, tes allergies et ta santé y sont reprises.
9. **Régimes** : halal (pas de porc, rappel de choisir une viande certifiée), végétarien, sans lactose.
10. **Sécurité** : pas de plan de sèche pour les moins de 18 ans, pendant la grossesse ni avec un IMC bas. L'objectif ne descend jamais sous un IMC de 19 et les calories restent au-dessus d'un minimum.

## Entraînement (onglet Sport)
Inspiré des meilleures applis : programme automatique (Fitbod), suivi des séries et records (Hevy, Strong), fiches d'exercices (Jefit).
- **Programme de la semaine** selon le lieu (salle, maison avec haltères, sans matériel, barre de traction), le nombre de séances (3 à 6) et le niveau : corps complet ×3, haut/bas ×2, un groupe par jour (pecs-triceps, dos-biceps, jambes, épaules-abdos, bras) ou push/pull/legs ×2. Chaque jour est modifiable.
- **Séries, répétitions et repos** adaptés à l'objectif (prise de masse : 6 à 10 répétitions et 2 min de repos sur les gros exercices ; sèche : 8 à 15 répétitions, repos plus courts).
- **Séance guidée** : poids et répétitions par série, dernière performance affichée, conseil de progression (« passe à 42,5 kg »), chrono de repos avec vibration et son, résumé et records 🏆.
- **58 exercices** expliqués : étapes, conseil, erreur fréquente, variante, carte des muscles (face et dos), courbe de progression.
- **Carte de récupération** : les muscles travaillés ces 3 derniers jours.

## Objectif du jour et recettes détaillées
- **Jauge du jour** : calories, protéines, glucides et lipides se remplissent à chaque repas noté : ✓ dans « Semaine », « J'ai mangé ce repas » sur une recette, « Je l'ai mangé » sur un produit scanné, ou ajout libre. Un compteur reste visible en haut de toutes les pages, avec une série de jours réussis (🔥).
- **Recettes détaillées** (50 recettes) : nombre de personnes réglable, quantités, coût de la recette, **liste « À acheter »** avec le format le plus vendu en magasin (ex. « 1 paquet de 500 g », « 1 boîte de 6 œufs », « 3 tomates ≈ 360 g ») et le **total à payer en caisse**, étapes et astuces.
- Les formats de paquets sont calculés à partir des relevés Open Prices (taille la plus fréquente).

## Pourquoi c'est mieux que les concurrents
Ce que les applis connues (MyFitnessPal, Yazio, Foodvisor, Cal AI, Lifesum…) ne font pas, ou seulement en version payante :
- **les prix** : à notre connaissance, aucune ne donne le prix d'un menu dans chaque enseigne française. Affûté calcule le coût de ta semaine et te dit où faire tes courses ;
- **des données fiables** : la base officielle de l'ANSES, au lieu de fiches saisies par les utilisateurs, souvent fausses ;
- **gratuit et sans compte**, sans publicité, et les données restent sur ton téléphone ;
- **une vraie visualisation** : l'avatar et la simulation sur ta propre photo ;
- **halal**, ce que les applis grand public gèrent rarement ;
- **des garde-fous santé**, au lieu de régimes trop agressifs.

## D'où viennent les données
- **Nutrition** : Anses. 2025. Table de composition nutritionnelle des aliments Ciqual ([DOI 10.5281/zenodo.17550132](https://doi.org/10.5281/zenodo.17550132)), licence CC-BY 4.0.
- **Prix** : [Open Prices](https://prices.openfoodfacts.org) (Open Food Facts), licence ODbL. C'est la médiane des relevés faits en France sur les 18 derniers mois. Un prix de magasin n'est retenu qu'avec au moins 2 relevés ; sinon, l'appli affiche le prix moyen en France, marqué d'un `*`.
- **Produits de marque** : [Open Food Facts](https://world.openfoodfacts.org).
- **Photos des plats** : 49 vraies photos libres de droits (Wikimedia Commons, Openverse), détourées et posées sur fond blanc avec une ombre douce, pour un style « studio » identique. Auteur et licence affichés sous chaque photo (`data/photos.json`). S'il manque une photo, l'appli affiche un dessin SVG (`tools/plats.mjs`).

## Calculs
- **Calories réglables** : sur l'écran Plan, on peut augmenter ou baisser ses calories. Affûté recalcule tout de suite la date d'arrivée, le poids par semaine et (en prise de masse) la part de muscle dans le poids pris.
- Métabolisme de base : formule de Mifflin-St Jeor.
- Masse grasse : formule de la Marine américaine (avec les mensurations), sinon estimation de Deurenberg à partir de l'IMC.
- 1 kg de graisse ≈ 7 700 kcal. Rythme de 0,5 %, 0,75 % ou 1 % du poids par semaine.
- Protéines : 2 g/kg (hommes) ou 1,8 g/kg (femmes). Lipides : au moins 0,8 g/kg. Le reste en glucides.
- Prise de masse : surplus calculé pour prendre 0,25 %, 0,4 % ou 0,6 % du poids par semaine (1 kg pris ≈ 7 000 kcal), avec une part de muscle estimée à 60 %, 50 % ou 38 % selon le rythme. Lipides : au moins 0,9 g/kg. Objectif plafonné à un IMC de 30. Pas de plan avant 16 ans, pendant la grossesse ni avec un IMC de 30 ou plus (une sèche est conseillée d'abord).

## Mettre à jour les données
Depuis le dossier `affute` :
```bash
python3 tools/build_prix.py      # met à jour les prix (≈ 5 minutes)
python3 tools/build_ciqual.py <dossier Ciqual> data/aliments.json   # nouvelle version de la table Ciqual
```

## Logo
Un « A » géométrique taillé comme une lame (facette ombrée), dont le creux a la forme d'une pousse, sur un dégradé vert émeraude (`icons/logo.svg`, icônes PNG 180, 192 et 512 px).

## Organisation
- `index.html`, `css/app.css` : page et design.
- `js/app.js` : écrans (profil, plan, semaine, repas, aliments, corps).
- `js/calc.js` : calculs de la sèche.
- `js/data.js` : nutrition et prix des repas.
- `js/body.js` : avatar 3D.
- `js/photo.js` : photos (IndexedDB) et simulation.
- `js/scan.js` : scanner (réutilise Clair).
- `js/sport.js`, `js/sport-data.js`, `js/muscles.js` : entraînement, exercices et carte des muscles.
- `js/journal.js` : journal du jour.
- `data/` : aliments (Ciqual), ingrédients avec prix, recettes.
- `tools/` : scripts de mise à jour des données.

Affûté donne des informations générales et ne remplace pas l'avis d'un médecin ou d'un diététicien.
