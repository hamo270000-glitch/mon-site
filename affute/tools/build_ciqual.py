# Construit affute/data/aliments.json à partir de la table Ciqual 2025 (ANSES, licence CC-BY 4.0).
# Fichiers sources (https://doi.org/10.5281/zenodo.17550132) :
#   - Table Ciqual 2025_ENG_2025_11_03.xlsx  (valeurs nutritionnelles)
#   - alim_2025_11_03.xml                    (noms en français)
#   - alim_grp_2025_11_03.xml                (groupes en français)
# Utilisation : python3 build_ciqual.py <dossier des sources> <fichier de sortie>
import json
import re
import sys
import xml.etree.ElementTree as ET

import openpyxl

src, out = sys.argv[1], sys.argv[2]


def text(el, tag):
    x = el.find(tag)
    return (x.text or '').strip() if x is not None and x.text else ''


names = {}
for a in ET.parse(f'{src}/alim_2025_11_03.xml').getroot():
    names[text(a, 'alim_code')] = text(a, 'alim_nom_fr')

groups = {}
for g in ET.parse(f'{src}/alim_grp_2025_11_03.xml').getroot():
    groups[text(g, 'alim_ssgrp_code')] = text(g, 'alim_ssgrp_nom_fr')
    groups[text(g, 'alim_grp_code')] = text(g, 'alim_grp_nom_fr')


def num(v):
    """Ciqual écrit « traces », « < 0,5 » ou « - » : on garde un nombre ou None."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return round(float(v), 2)
    s = str(v).strip().replace(',', '.')
    if s in ('', '-'):
        return None
    if s.lower() == 'traces':
        return 0.0
    if s.startswith('<'):
        return 0.0  # en dessous du seuil de mesure : quasi nul
    m = re.match(r'^[0-9.]+$', s)
    return round(float(s), 2) if m else None


# Colonnes de la feuille « food composition »
COL = {'kcal': 10, 'prot': 14, 'gluc': 16, 'lip': 17, 'suc': 18, 'fib': 26, 'ags': 31, 'sel': 49}

ws = openpyxl.load_workbook(f'{src}/Table Ciqual 2025_ENG_2025_11_03.xlsx', read_only=True)['food composition']
rows = ws.iter_rows(values_only=True)
next(rows)
foods = []
for r in rows:
    code = str(r[6]).strip()
    if not code or code == 'None':
        continue
    item = {'c': int(code), 'n': names.get(code) or r[7], 'g': groups.get(str(r[1]).strip()) or groups.get(str(r[0]).strip(), '')}
    for k, i in COL.items():
        item[k] = num(r[i])
    if item['kcal'] is None:
        continue
    foods.append(item)

foods.sort(key=lambda x: x['n'].lower())
with open(out, 'w', encoding='utf-8') as f:
    json.dump({'source': 'Anses. 2025. Table de composition nutritionnelle des aliments Ciqual (CC-BY 4.0)', 'aliments': foods},
              f, ensure_ascii=False, separators=(',', ':'))
print(len(foods), 'aliments')
