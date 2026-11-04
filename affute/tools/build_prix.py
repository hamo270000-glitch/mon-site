# Construit affute/data/ingredients.json : les ingrédients des repas, avec
#  - leurs valeurs nutritionnelles (table Ciqual 2025 de l'ANSES, déjà convertie dans data/aliments.json) ;
#  - leur prix réel au kilo dans chaque enseigne (médiane des relevés Open Prices en France).
# Utilisation (depuis le dossier affute) : python3 tools/build_prix.py
# À relancer de temps en temps pour mettre les prix à jour.
import datetime
import json
import re
import statistics
import time
import urllib.parse
import urllib.request

API = 'https://prices.openfoodfacts.org/api/v1/prices'
SINCE = (datetime.date.today() - datetime.timedelta(days=540)).isoformat()  # 18 derniers mois

# id, nom affiché, code Ciqual, type de recherche Open Prices, étiquette, options
# 'cat'  = produit brut (fruits, légumes) vendu au kilo ; 'prod' = produit emballé (catégorie Open Food Facts).
# Options : unit_g = poids comestible d'une pièce (pour les œufs), density = pour les liquides (huile).
#           halal: 'non' (porc), 'certif' (viande : choisir halal certifié) ; veg: False si viande/poisson ;
#           lait: True si contient du lait.
INGREDIENTS = [
    # Protéines animales
    ('poulet', 'Blanc de poulet', 36017, 'prod', 'en:chicken-breasts', {'halal': 'certif', 'veg': False}),
    ('dinde', 'Escalope de dinde', 36304, 'prod', 'en:turkey-cutlets', {'halal': 'certif', 'veg': False}),
    ('steak5', 'Steak haché 5 % MG', 6250, 'prod', 'en:ground-beef-steaks', {'halal': 'certif', 'veg': False}),
    ('oeuf', 'Œuf', 22000, 'prod', 'en:chicken-eggs', {'unit_g': 50, 'unit': 'œuf'}),
    ('thon', 'Thon au naturel (boîte)', 26039, 'prod', 'en:canned-tunas', {'veg': False}),
    ('saumon', 'Pavé de saumon', 26036, 'prod', 'en:salmon-fillets', {'veg': False}),
    ('cabillaud', 'Filet de cabillaud', 26043, 'prod', 'en:cod-fillets', {'veg': False}),
    ('crevette', 'Crevettes cuites', 10061, 'prod', 'en:shrimps', {'veg': False}),
    ('jambon', 'Jambon blanc découenné', 28913, 'prod', 'en:white-hams', {'halal': 'non', 'veg': False}),
    # Produits laitiers
    ('skyr', 'Skyr nature', 19724, 'prod', 'en:skyrs', {'lait': True}),
    ('grec', 'Yaourt à la grecque', 19860, 'prod', 'en:greek-style-yogurts', {'lait': True}),
    ('lait', 'Lait demi-écrémé', 19041, 'prod', 'en:semi-skimmed-milks', {'lait': True, 'density': 1.03}),
    # Protéines végétales et féculents
    ('lentilles', 'Lentilles (sèches)', 20585, 'prod', 'en:dried-lentils', {}),
    ('poischiche', 'Pois chiches (boîte, égouttés)', 20532, 'prod', 'en:canned-chickpeas', {}),
    ('riz', 'Riz basmati (cru)', 9119, 'prod', 'en:basmati-rices', {}),
    ('pates', 'Pâtes (crues)', 9810, 'prod', 'en:durum-wheat-pasta', {}),
    ('quinoa', 'Quinoa (cru)', 9340, 'prod', 'en:quinoa', {}),
    ('avoine', "Flocons d'avoine", 32140, 'prod', 'en:rolled-oats', {}),
    ('paincomplet', 'Pain complet', 7110, 'prod', 'en:wholemeal-breads', {}),
    ('wrap', 'Wrap / tortilla de blé', 7815, 'prod', 'en:wraps', {}),
    ('galetteriz', 'Galettes de riz soufflé', 7352, 'prod', 'en:puffed-rice-cakes', {}),
    ('pdt', 'Pomme de terre', 4008, 'cat', 'en:potatoes', {'piece_g': 150, 'piece': 'pomme de terre'}),
    ('patatedouce', 'Patate douce', 4101, 'cat', 'en:sweet-potatoes', {'piece_g': 300, 'piece': 'patate douce'}),
    # Légumes
    ('brocoli', 'Brocoli', 20057, 'cat', 'en:broccoli', {'piece_g': 400, 'piece': 'brocoli'}),
    ('haricotvert', 'Haricots verts (surgelés)', 20070, 'prod', 'en:frozen-green-beans', {}),
    ('epinard', 'Épinards (surgelés)', 20083, 'prod', 'en:frozen-spinachs', {}),
    ('courgette', 'Courgette', 20020, 'cat', 'en:zucchini', {'piece_g': 250, 'piece': 'courgette'}),
    ('tomate', 'Tomate', 20276, 'cat', 'en:tomatoes', {'piece_g': 120, 'piece': 'tomate'}),
    ('concombre', 'Concombre', 20019, 'cat', 'en:cucumbers', {'piece_g': 400, 'piece': 'concombre'}),
    ('carotte', 'Carotte', 20009, 'cat', 'en:carrots', {'piece_g': 100, 'piece': 'carotte'}),
    ('poivron', 'Poivron rouge', 20087, 'cat', 'en:red-bell-peppers', {'piece_g': 180, 'piece': 'poivron'}),
    ('champignon', 'Champignons de Paris', 20056, 'cat', 'en:mushrooms', {'piece_g': 20, 'piece': 'champignon'}),
    ('oignon', 'Oignon', 20034, 'cat', 'en:yellow-onions', {'piece_g': 120, 'piece': 'oignon'}),
    ('salade', 'Salade verte', 20031, 'cat', 'en:lettuces', {'piece_g': 300, 'piece': 'salade'}),
    # Fruits
    ('banane', 'Banane', 13005, 'cat', 'en:bananas', {'piece_g': 120, 'piece': 'banane'}),
    ('pomme', 'Pomme', 13039, 'cat', 'en:apples', {'piece_g': 150, 'piece': 'pomme'}),
    ('kiwi', 'Kiwi', 13021, 'cat', 'en:kiwis', {'piece_g': 80, 'piece': 'kiwi'}),
    ('orange', 'Orange', 13034, 'cat', 'en:oranges', {'piece_g': 180, 'piece': 'orange'}),
    ('fruitsrouges', 'Fruits rouges (surgelés)', 13015, 'prod', 'en:frozen-berries', {}),
    ('citron', 'Citron', 13009, 'cat', 'en:lemons', {'piece_g': 100, 'piece': 'citron'}),
    # Bonnes graisses et extras
    ('avocat', 'Avocat', 13004, 'cat', 'en:avocados', {'piece_g': 140, 'piece': 'avocat'}),
    ('huile', "Huile d'olive vierge extra", 17270, 'prod', 'en:extra-virgin-olive-oils', {'density': 0.91}),
    ('amande', 'Amandes', 15000, 'prod', 'en:almonds', {}),
    ('cacahuete', 'Beurre de cacahuète', 15202, 'prod', 'en:peanut-butters', {}),
    ('chocolat', 'Chocolat noir 70 %', 31074, 'prod', 'en:dark-chocolates', {}),
    ('miel', 'Miel', 31008, 'prod', 'en:honeys', {}),
]

STORES = [
    ('leclerc', 'E.Leclerc', r'leclerc'),
    ('lidl', 'Lidl', r'\blidl\b'),
    ('superu', 'Super U', r'(^|\b)(super u|hyper u|u express|utile|marche u|systeme u)\b|^u$'),
    ('carrefour', 'Carrefour', r'carrefour'),
    ('intermarche', 'Intermarché', r'intermarch'),
    ('auchan', 'Auchan', r'auchan'),
    ('aldi', 'Aldi', r'\baldi\b'),
]


def strip_accents(s):
    import unicodedata
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def store_of(loc):
    for field in ('osm_brand', 'osm_name'):
        v = strip_accents((loc.get(field) or '').lower()).strip()
        if not v:
            continue
        for sid, _, rx in STORES:
            if re.search(rx, v):
                return sid
    return None


def get(params):
    url = API + '?' + urllib.parse.urlencode(params)
    for i in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Affute-build/1.0 (github.com/hamo270000-glitch/mon-site)'})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r)
        except Exception:
            time.sleep(2 * (i + 1))
    return {'items': [], 'pages': 0}


def fetch(kind, tag, pages=5):
    items = []
    for page in range(1, pages + 1):
        p = {'currency': 'EUR', 'size': 100, 'page': page, 'order_by': '-date', 'date__gte': SINCE}
        p['category_tag' if kind == 'cat' else 'product__categories_tags__contains'] = tag
        d = get(p)
        items += d.get('items', [])
        if page >= (d.get('pages') or 0):
            break
        time.sleep(0.4)
    return items


def per_kg(it, kind, opt):
    """Prix au kilo (ou None si impossible à calculer)."""
    price = it.get('price')
    if price is None or it.get('price_is_discounted'):
        return None
    if kind == 'cat':
        return (float(price), None) if it.get('price_per') == 'KILOGRAM' else None
    p = it.get('product') or {}
    if opt.get('unit_g'):  # œufs : prix par pièce
        txt = f"{p.get('quantity') or ''} {p.get('product_name') or ''}"
        m = re.search(r'(\d{1,2})\s*(x\s*)?(pcs|pi[eè]ces?|[œo]e?ufs|u\b|$)', txt, re.I) or re.match(r'\s*(\d{1,2})\b', txt)
        n = int(m.group(1)) if m else None
        if not n or not 2 <= n <= 30:
            return None
        return float(price) / n / opt['unit_g'] * 1000, n
    q = p.get('product_quantity')
    unit = (p.get('product_quantity_unit') or 'g').lower()
    try:
        q = float(q)
    except (TypeError, ValueError):
        return None
    if q <= 0:
        return None
    if unit in ('ml', 'cl', 'l'):
        q = q * opt.get('density', 1.0)  # ml → g
    elif unit not in ('g',):
        return None
    return float(price) / q * 1000, round(q)


def pack_mode(packs, eggs=False):
    """Taille de paquet la plus courante (arrondie), pour dire « 1 paquet de 500 g »."""
    if not packs:
        return None
    rounded = [p if eggs else (round(p / 10) * 10 if p < 1000 else round(p / 50) * 50) for p in packs]
    counts = {}
    for r in rounded:
        counts[r] = counts.get(r, 0) + 1
    best = max(counts.items(), key=lambda kv: (kv[1], -abs(kv[0] - statistics.median(rounded))))
    return {'taille': best[0], 'part': round(best[1] / len(rounded), 2)}


def summary(values):
    if not values:
        return None
    return round(statistics.median(values), 2)


def main():
    foods = {f['c']: f for f in json.load(open('data/aliments.json', encoding='utf-8'))['aliments']}
    out = []
    for iid, name, code, kind, tag, opt in INGREDIENTS:
        f = foods[code]
        rows = []
        for it in fetch(kind, tag):
            loc = it.get('location') or {}
            if loc.get('osm_address_country') != 'France':
                continue
            r = per_kg(it, kind, opt)
            if r:
                v, pack = r
                rows.append((store_of(loc), v, it.get('date'), pack))
        # Enlève les valeurs aberrantes (erreurs de saisie, produits de luxe…)
        med = summary([r[1] for r in rows])
        if med:
            rows = [r for r in rows if med / 4 <= r[1] <= med * 4]
        stores = {}
        for sid, _, _ in STORES:
            vals = [r[1] for r in rows if r[0] == sid]
            if vals:
                stores[sid] = {'kg': summary(vals), 'n': len(vals), 'date': max(r[2] for r in rows if r[0] == sid)}
        entry = {
            'id': iid, 'nom': name, 'ciqual': code, 'ciqualNom': f['n'],
            # Valeurs pour 100 g (Ciqual)
            'kcal': f['kcal'], 'prot': f['prot'], 'gluc': f['gluc'], 'lip': f['lip'],
            'suc': f['suc'], 'fib': f['fib'], 'sel': f['sel'],
            'prix': {'kg': summary([r[1] for r in rows]), 'n': len(rows), 'magasins': stores},
        }
        pack = pack_mode([r[3] for r in rows if r[3]], eggs=bool(opt.get('unit_g')))
        if pack:
            entry['paquet'] = pack  # grammes (ou nombre d'œufs) du format le plus vendu
        for k in ('unit_g', 'unit', 'halal', 'veg', 'lait', 'piece_g', 'piece'):
            if k in opt:
                entry[k] = opt[k]
        out.append(entry)
        print(f"{iid:13} {len(rows):4} relevés  paquet {entry.get('paquet')}  médiane {entry['prix']['kg']} €/kg  " +
              ' '.join(f"{s}={v['kg']}({v['n']})" for s, v in stores.items()))
    with open('data/ingredients.json', 'w', encoding='utf-8') as fh:
        json.dump({
            'maj': datetime.date.today().isoformat(),
            'sources': {
                'nutrition': 'Anses. 2025. Table de composition nutritionnelle des aliments Ciqual (CC-BY 4.0)',
                'prix': f'Open Prices (Open Food Facts), relevés en France depuis le {SINCE}, licence ODbL',
            },
            'magasins': [{'id': s, 'nom': n} for s, n, _ in STORES],
            'ingredients': out,
        }, fh, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
