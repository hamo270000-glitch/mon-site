# Affûté – Ta sèche sur mesure

Application web installable (PWA) pour réussir une sèche : perdre du gras en gardant le muscle, en mangeant bien et sans se ruiner.

En ligne (après fusion sur `main`) : https://hamo270000-glitch.github.io/mon-site/affute/

## Ce que fait l'appli
1. **Plan personnalisé** : âge, sexe, taille, poids, activité, corps visé et rythme → calories par jour, protéines, glucides, lipides, date d'arrivée et courbe prévue.
2. **Aperçu de ton futur corps** : avatar « hologramme » 3D qui s'affine semaine après semaine (taux de masse grasse calculé).
3. **Simulation sur ta photo** : tu te prends en photo, tu touches ton nombril, et l'appli affine ta silhouette selon le poids prévu, avec une comparaison avant/après à faire glisser. Les photos restent sur le téléphone.
4. **31 recettes de sèche**, avec des portions adaptées à ton objectif et le **prix réel dans 7 enseignes** : E.Leclerc, Lidl, Super U, Carrefour, Intermarché, Auchan et Aldi.
5. **Ma semaine** : 7 jours de repas générés automatiquement (changeables d'un geste), **liste de courses** et **le même panier comparé dans chaque magasin**.
6. **Tous les aliments** : la table officielle Ciqual 2025 de l'ANSES (3 341 aliments : calories, protéines, glucides, sucres, lipides, fibres, sel), plus des millions de produits de marque via Open Food Facts.
7. **Suivi** du poids avec la courbe réelle comparée à la courbe prévue.
8. **Régimes** : halal (pas de porc, rappel de choisir une viande certifiée), végétarien, sans lactose.
9. **Sécurité** : pas de plan de sèche pour les moins de 18 ans, pendant la grossesse ni avec un IMC bas. L'objectif ne descend jamais sous un IMC de 19 et les calories restent au-dessus d'un minimum.

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

## Calculs
- Métabolisme de base : formule de Mifflin-St Jeor.
- Masse grasse : formule de la Marine américaine (avec les mensurations), sinon estimation de Deurenberg à partir de l'IMC.
- 1 kg de graisse ≈ 7 700 kcal. Rythme de 0,5 %, 0,75 % ou 1 % du poids par semaine.
- Protéines : 2 g/kg (hommes) ou 1,8 g/kg (femmes). Lipides : au moins 0,8 g/kg. Le reste en glucides.

## Mettre à jour les données
Depuis le dossier `affute` :
```bash
python3 tools/build_prix.py      # met à jour les prix (≈ 5 minutes)
python3 tools/build_ciqual.py <dossier Ciqual> data/aliments.json   # nouvelle version de la table Ciqual
```

## Organisation
- `index.html`, `css/app.css` : page et design.
- `js/app.js` : écrans (profil, plan, semaine, repas, aliments, corps).
- `js/calc.js` : calculs de la sèche.
- `js/data.js` : nutrition et prix des repas.
- `js/body.js` : avatar 3D.
- `js/photo.js` : photos (IndexedDB) et simulation.
- `data/` : aliments (Ciqual), ingrédients avec prix, recettes.
- `tools/` : scripts de mise à jour des données.

Affûté donne des informations générales et ne remplace pas l'avis d'un médecin ou d'un diététicien.
