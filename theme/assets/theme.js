/* Biovela Paris — scripts du thème */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const T = window.theme || { routes: {}, strings: {}, freeShipping: 0 };

  const money = (cents) => {
    const fmt = T.moneyFormat || '{{amount_with_comma_separator}} €';
    const v = (cents / 100).toFixed(2);
    const comma = v.replace('.', ',');
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (m, k) => (k.indexOf('comma') > -1 ? comma : v));
  };

  /* Apparition au scroll */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));

  /* Menu mobile */
  const nav = $('#MobileNav');
  $$('[data-menu-open]').forEach((b) => b.addEventListener('click', () => { nav && nav.classList.add('is-open'); document.body.style.overflow = 'hidden'; }));
  $$('[data-menu-close]').forEach((b) => b.addEventListener('click', () => { nav && nav.classList.remove('is-open'); document.body.style.overflow = ''; }));

  /* Toast */
  const toast = (msg) => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-visible');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-visible'), 2600);
  };

  /* ---------- Panier (tiroir) ---------- */
  const drawer = $('#CartDrawer');
  const openDrawer = () => { if (!drawer) return; drawer.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
  const closeDrawer = () => { if (!drawer) return; drawer.classList.remove('is-open'); document.body.style.overflow = ''; };
  $$('[data-cart-open]').forEach((b) => b.addEventListener('click', (e) => { if (drawer) { e.preventDefault(); refreshCart().then(openDrawer); } }));
  $$('[data-cart-close]').forEach((b) => b.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); nav && nav.classList.remove('is-open'); } });

  const renderShipping = (total) => {
    $$('[data-ship-progress]').forEach((el) => {
      if (!T.freeShipping) { el.hidden = true; return; }
      const remain = Math.max(T.freeShipping - total, 0);
      const pct = Math.min(100, (total / T.freeShipping) * 100);
      $('[data-ship-text]', el).innerHTML = remain > 0
        ? (T.strings.freeShippingRemaining || 'Plus que [amount] pour la livraison offerte').replace('[amount]', '<strong>' + money(remain) + '</strong>')
        : (T.strings.freeShippingReached || 'Livraison offerte !');
      $('[data-ship-bar]', el).style.width = pct + '%';
    });
  };

  const refreshCart = () => fetch((T.routes.root || '/') + '?section_id=cart-drawer-content')
    .then((r) => r.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = doc.querySelector('[data-cart-content]');
      const cur = $('[data-cart-content]');
      if (fresh && cur) cur.innerHTML = fresh.innerHTML;
      return fetch((T.routes.cart_url || '/cart') + '.js').then((r) => r.json());
    })
    .then((cart) => {
      $$('[data-cart-count]').forEach((c) => { c.textContent = cart.item_count; c.dataset.count = cart.item_count; });
      renderShipping(cart.total_price);
      bindLineItems();
      return cart;
    })
    .catch(() => {});

  const changeLine = (key, quantity) => fetch((T.routes.cart_change_url || '/cart/change') + '.js', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ id: key, quantity })
  }).then(refreshCart).then(() => { if (document.body.classList.contains('template-cart')) location.reload(); });

  function bindLineItems() {
    $$('[data-line-key]').forEach((row) => {
      if (row._bound) return; row._bound = true;
      const key = row.dataset.lineKey;
      const q = +row.dataset.qty;
      $$('[data-line-minus]', row).forEach((b) => b.addEventListener('click', () => changeLine(key, q - 1)));
      $$('[data-line-plus]', row).forEach((b) => b.addEventListener('click', () => changeLine(key, q + 1)));
      $$('[data-line-remove]', row).forEach((b) => b.addEventListener('click', () => changeLine(key, 0)));
    });
  }
  bindLineItems();
  if (window.theme && $('[data-ship-progress]')) {
    const init = $('[data-cart-total]');
    if (init) renderShipping(+init.dataset.cartTotal);
  }

  const addToCart = (items, btn) => {
    if (btn) { btn.disabled = true; btn.dataset.label = btn.dataset.label || btn.innerHTML; btn.innerHTML = '…'; }
    return fetch((T.routes.cart_add_url || '/cart/add') + '.js', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items })
    }).then((r) => r.json().then((d) => { if (!r.ok) throw d; return d; }))
      .then(() => refreshCart())
      .then(() => { drawer ? openDrawer() : toast(T.strings.added || 'Ajouté au panier'); })
      .catch((err) => toast((err && (err.description || err.message)) || 'Erreur'))
      .finally(() => { if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.label; } });
  };

  /* Ajout rapide depuis les cartes produit */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-quick-add]');
    if (!b) return;
    e.preventDefault();
    addToCart([{ id: +b.dataset.quickAdd, quantity: 1 }], b);
  });

  /* Formulaire produit */
  $$('form[data-product-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      addToCart([{ id: +fd.get('id'), quantity: +(fd.get('quantity') || 1) }], $('[type="submit"]', form));
    });
  });

  /* Quantité +/- */
  $$('[data-qty]').forEach((wrap) => {
    const input = $('input', wrap);
    $('[data-qty-minus]', wrap).addEventListener('click', () => { input.value = Math.max(1, +input.value - 1); });
    $('[data-qty-plus]', wrap).addEventListener('click', () => { input.value = +input.value + 1; });
  });

  /* Variantes */
  $$('[data-variant-picker]').forEach((picker) => {
    const json = $('script[type="application/json"]', picker);
    if (!json) return;
    const variants = JSON.parse(json.textContent);
    const section = picker.closest('[data-product-section]');
    picker.addEventListener('change', () => {
      const opts = $$('fieldset', picker).map((fs) => ($('input:checked', fs) || {}).value);
      const v = variants.find((x) => x.options.every((o, i) => o === opts[i]));
      if (!v) return;
      $$('input[name="id"]', section).forEach((i) => (i.value = v.id));
      $$('[data-price]', section).forEach((p) => (p.textContent = money(v.price)));
      $$('[data-compare]', section).forEach((p) => { p.textContent = v.compare_at_price > v.price ? money(v.compare_at_price) : ''; });
      $$('[data-atc]', section).forEach((b) => { b.disabled = !v.available; b.querySelector('span').textContent = v.available ? T.strings.addToCart : T.strings.soldOut; });
      if (v.featured_media) { const s = $('[data-media-id="' + v.featured_media.id + '"]', section); s && s.click(); }
      const url = new URL(location.href); url.searchParams.set('variant', v.id); history.replaceState({}, '', url);
    });
  });

  /* Galerie */
  $$('[data-gallery]').forEach((g) => {
    const slides = $$('.gallery__slide', g);
    const thumbs = $$('.gallery__thumb', g);
    thumbs.forEach((t, i) => t.addEventListener('click', () => {
      slides.forEach((s, j) => { s.classList.toggle('is-active', i === j); const v = $('video', s); if (v) { i === j ? v.play().catch(() => {}) : v.pause(); } });
      thumbs.forEach((x, j) => x.classList.toggle('is-active', i === j));
    }));
    slides.forEach((s) => { const img = $('img', s); img && img.addEventListener('click', (e) => {
      const r = img.getBoundingClientRect();
      img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
      s.classList.toggle('is-zoomed');
    }); });
    let x0 = null; const main = $('.gallery__main', g);
    main && main.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    main && main.addEventListener('touchend', (e) => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) < 40) return;
      const cur = thumbs.findIndex((t) => t.classList.contains('is-active'));
      const next = (cur + (dx < 0 ? 1 : -1) + thumbs.length) % thumbs.length;
      thumbs[next] && thumbs[next].click();
    });
  });

  /* Barre d'achat collante */
  const sticky = $('[data-sticky-atc]');
  const mainAtc = $('[data-main-atc]');
  if (sticky && mainAtc && io) {
    new IntersectionObserver(([e]) => sticky.classList.toggle('is-visible', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(mainAtc);
    $('button', sticky).addEventListener('click', () => { const f = $('form[data-product-form]'); f && f.requestSubmit(); });
  }

  /* Vidéos : play/pause */
  $$('[data-video-toggle]').forEach((b) => b.addEventListener('click', () => {
    const v = b.parentElement.querySelector('video'); if (!v) return;
    v.paused ? v.play() : v.pause(); b.setAttribute('aria-pressed', v.paused);
  }));

  /* Quiz de peau */
  $$('[data-quiz]').forEach((quiz) => {
    const steps = $$('.quiz__step', quiz);
    const bar = $('.quiz__progress span', quiz);
    const answers = [];
    let i = 0;
    const show = () => { steps.forEach((s, j) => s.classList.toggle('is-active', j === i)); if (bar) bar.style.width = ((i) / (steps.length - 1)) * 100 + '%'; };
    $$('.quiz__opt', quiz).forEach((o) => o.addEventListener('click', () => {
      answers.push(o.dataset.value); i++;
      if (i === steps.length - 1) {
        const map = JSON.parse(quiz.dataset.results || '{}');
        const key = answers[answers.length - 1];
        const res = map[key] || map.default || {};
        const out = $('[data-quiz-result]', quiz);
        if (out) { $('h3', out).textContent = res.title || ''; $('p', out).textContent = res.text || ''; $('a', out).href = res.url || '/collections/all'; }
      }
      show();
    }));
    $$('[data-quiz-restart]', quiz).forEach((b) => b.addEventListener('click', () => { i = 0; answers.length = 0; show(); }));
    show();
  });

  /* Filtres collection */
  $$('[data-filters-toggle]').forEach((b) => b.addEventListener('click', () => $('.filters') && $('.filters').classList.toggle('is-open')));
  $$('[data-filter-form]').forEach((f) => f.addEventListener('change', () => f.submit()));
  $$('[data-sort]').forEach((s) => s.addEventListener('change', () => { const u = new URL(location.href); u.searchParams.set('sort_by', s.value); location.href = u; }));
})();

/* Effets 3D — apparitions en cascade, inclinaison des cartes, parallaxe douce */
(function () {
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(hover: hover) and (pointer: fine)');

  /* Apparitions en cascade : léger décalage entre éléments frères */
  if (!reduce) {
    var parents = [];
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
      var p = el.parentElement;
      if (p && parents.indexOf(p) === -1) parents.push(p);
    });
    parents.forEach(function (p) {
      var kids = Array.prototype.filter.call(p.children, function (c) { return c.classList.contains('reveal'); });
      if (kids.length < 2) return;
      kids.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i, 5) * 90 + 'ms';
        el.addEventListener('transitionend', function clear() { el.style.transitionDelay = ''; el.removeEventListener('transitionend', clear); });
      });
    });
  }

  if (reduce || !finePointer) return;

  /* Inclinaison 3D au survol (souris uniquement) + reflet qui suit le curseur */
  var current = null, rect = null, px = 0.5, py = 0.5, frame = 0;
  var render = function () {
    frame = 0;
    if (!current) return;
    var max = parseFloat(current.getAttribute('data-tilt')) || 6;
    current.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - py) * max).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * max).toFixed(2) + 'deg) translate3d(0,-4px,0)';
    current.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
    current.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
  };
  var release = function () {
    if (!current) return;
    current.classList.remove('is-tilting');
    current.style.transform = '';
    current = null; rect = null;
  };
  document.addEventListener('mousemove', function (e) {
    var el = e.target.closest ? e.target.closest('[data-tilt]') : null;
    if (el !== current) { release(); if (!el) return; current = el; rect = el.getBoundingClientRect(); el.classList.add('is-tilting'); }
    if (!rect) return;
    px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    if (!frame) frame = requestAnimationFrame(render);
  }, { passive: true });
  document.addEventListener('mouseleave', release);
  window.addEventListener('scroll', function () { if (current) rect = current.getBoundingClientRect(); }, { passive: true });

  /* Parallaxe douce des visuels marqués [data-parallax] (scroll + souris) */
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!layers.length) return;
  var mx = 0, my = 0, pframe = 0;
  var visible = layers.map(function () { return !('IntersectionObserver' in window); });
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[layers.indexOf(en.target)] = en.isIntersecting; });
      queue();
    });
    layers.forEach(function (l) { pio.observe(l); });
  }
  var paint = function () {
    pframe = 0;
    var vh = window.innerHeight;
    layers.forEach(function (l, i) {
      if (!visible[i]) return;
      var depth = parseFloat(l.getAttribute('data-parallax')) || 0.08;
      var r = l.getBoundingClientRect();
      var offset = Math.max(-48, Math.min(48, (r.top + r.height / 2 - vh / 2) * -depth));
      l.style.transform = 'translate3d(' + (mx * 14).toFixed(1) + 'px,' + (offset + my * 10).toFixed(1) + 'px,0) rotateY(' + (mx * 4).toFixed(2) + 'deg) rotateX(' + (-my * 3).toFixed(2) + 'deg)';
    });
  };
  var queue = function () { if (!pframe) pframe = requestAnimationFrame(paint); };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('mousemove', function (e) { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; queue(); }, { passive: true });
  queue();
})();
