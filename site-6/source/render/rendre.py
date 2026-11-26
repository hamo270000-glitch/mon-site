"""Calcule la vidéo de Veilleuse avec Chrome sans fenêtre, par séries de 20 images.

Usage (depuis site-6/source, avec un serveur lancé : python3 -m http.server 8767) :
    python3 render/rendre.py              # les deux formats
Les images sortent dans site-6/film/large (ordinateur) et site-6/film/haut (téléphone), publiées telles quelles.
"""
import base64, concurrent.futures as cf, os, re, subprocess, sys

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
URL = 'http://localhost:8767/render/scene.html'
FORMATS = {'large': (1280, 720), 'haut': (720, 1280)}
N = int(os.environ.get('IMAGES', '120'))
SERIE = 20

def serie(fmt, de):
    w, h = FORMATS[fmt]
    a = min(N - 1, de + SERIE - 1)
    html = subprocess.run([CHROME, '--headless=new', '--virtual-time-budget=60000', '--window-size=800,600', '--dump-dom',
                           f'{URL}?de={de}&a={a}&n={N}&w={w}&h={h}'], capture_output=True, text=True, timeout=600).stdout
    found = re.findall(r'<pre data-i="(\d+)">data:image/jpeg;base64,([^<]+)</pre>', html)
    if len(found) != a - de + 1:
        raise RuntimeError(f'{fmt} {de}-{a} : {len(found)} images reçues')
    os.makedirs(f'../film/{fmt}', exist_ok=True)
    for i, data in found:
        with open(f'../film/{fmt}/{int(i):03d}.jpg', 'wb') as f:
            f.write(base64.b64decode(data))
    return f'{fmt} {de}-{a}'

if __name__ == '__main__':
    fmts = sys.argv[1:] or list(FORMATS)
    jobs = [(f, de) for f in fmts for de in range(0, N, SERIE)]
    with cf.ThreadPoolExecutor(3) as ex:
        for r in ex.map(lambda j: serie(*j), jobs):
            print(r, flush=True)
    print('fini')
