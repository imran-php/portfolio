/* NOSTRA — заявка, галерея, cookie */
(function () {
  'use strict';
  var KEY = 'nostra_cart_v1';

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    updateCount();
  }
  function updateCount() {
    var n = read().length;
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n; el.hidden = n === 0;
    });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function url(p) {
    var n = window.NOSTRA || {};
    var u = (n.base || '') + p;
    if (n.local && !/\.[a-z0-9]+$/i.test(p)) u = u.replace(/\/?$/, '/index.html');
    return u;
  }

  /* ----- галерея ----- */
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var main = g.querySelector('[data-gallery-main]');
    g.querySelectorAll('.gallery__thumb').forEach(function (b) {
      b.addEventListener('click', function () {
        if (main) main.src = b.dataset.src;
        g.querySelectorAll('.gallery__thumb').forEach(function (x) { x.classList.remove('is-active'); x.removeAttribute('aria-current'); });
        b.classList.add('is-active'); b.setAttribute('aria-current', 'true');
      });
    });
  });

  /* ----- карточка: добавить в заявку ----- */
  var cfg = document.querySelector('[data-config]');
  if (cfg) {
    var added = cfg.querySelector('[data-added]');
    var base = function () {
      return { id: +cfg.dataset.id, name: cfg.dataset.name, slug: cfg.dataset.slug, img: cfg.dataset.img, cat: cfg.dataset.cat };
    };
    cfg.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var it = base();
      it.options = {};
      cfg.querySelectorAll('[data-opt]:checked').forEach(function (r) { it.options[r.dataset.opt] = r.value; });
      var c = cfg.elements.color; it.color = c ? c.value.trim() : '';
      var mt = cfg.elements.match; it.match = mt ? mt.checked : false;
      it.h = parseInt(cfg.elements.h.value, 10) || 0;
      it.w = parseInt(cfg.elements.w.value, 10) || 0;
      it.qty = Math.max(1, parseInt(cfg.elements.qty.value, 10) || 1);
      var items = read(); items.push(it); write(items);
      if (added) { added.hidden = false; }
      cfg.elements.h.value = ''; cfg.elements.w.value = ''; cfg.elements.qty.value = 1;
      cfg.elements.h.focus();
    });
    var sampleBtn = cfg.querySelector('[data-sample]');
    if (sampleBtn) sampleBtn.addEventListener('click', function () {
      var it = base(); it.sample = true; it.qty = 1; it.options = {};
      cfg.querySelectorAll('[data-opt]:checked').forEach(function (r) { it.options[r.dataset.opt] = r.value; });
      var c = cfg.elements.color; it.color = c ? c.value.trim() : '';
      var items = read(); items.push(it); write(items);
      window.location.href = url('/order');
    });
  }

  /* ----- страница заявки ----- */
  var form = document.querySelector('[data-order-form]');
  if (form) {
    var body = form.querySelector('[data-cart-body]');
    var empty = form.querySelector('[data-cart-empty]');
    var total = form.querySelector('[data-cart-total]');
    var hidden = form.querySelector('[data-items]');
    var table = form.querySelector('.cart__scroll');

    var render = function () {
      var items = read();
      body.innerHTML = items.map(function (it, i) {
        var opts = Object.keys(it.options || {}).map(function (k) { return it.options[k]; });
        if (it.color) opts.push(it.color);
        if (it.match) opts.push('подбор по образцу');
        var size = it.sample ? 'образец' : ((it.h || '—') + ' × ' + (it.w || '—'));
        return '<tr>' +
          '<td><div class="cart__model">' + (it.img ? '<img src="' + esc(url(it.img)) + '" alt="">' : '') +
          '<div><a href="' + esc(url('/catalog/' + it.slug)) + '">' + esc(it.name) + '</a><small>' + esc(it.cat || '') + '</small></div></div></td>' +
          '<td>' + esc(opts.join(' · ') || '—') + '</td>' +
          '<td class="mono">' + esc(size) + '</td>' +
          '<td><label class="sr" for="q' + i + '">Количество</label><input id="q' + i + '" class="cart__qty" type="number" min="1" max="9999" value="' + (+it.qty || 1) + '" data-qty="' + i + '"></td>' +
          '<td><button type="button" class="cart__del" data-del="' + i + '" aria-label="Удалить ' + esc(it.name) + '">' +
          '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg></button></td>' +
          '</tr>';
      }).join('');
      empty.hidden = items.length > 0;
      table.hidden = items.length === 0;
      total.textContent = items.length;
      hidden.value = JSON.stringify(items);
    };
    body.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-del]'); if (!b) return;
      var items = read(); items.splice(+b.dataset.del, 1); write(items); render();
    });
    body.addEventListener('change', function (ev) {
      var q = ev.target.closest('[data-qty]'); if (!q) return;
      var items = read(); if (items[+q.dataset.qty]) items[+q.dataset.qty].qty = Math.max(1, parseInt(q.value, 10) || 1);
      write(items); render();
    });
    form.addEventListener('submit', function () { hidden.value = JSON.stringify(read()); });
    var file = form.querySelector('.drop__input');
    if (file) file.addEventListener('change', function () {
      var label = form.querySelector('[data-file-name]');
      var drop = file.closest('.drop');
      if (file.files && file.files[0]) { label.textContent = file.files[0].name; drop.classList.add('has-file'); }
    });
    render();
  }

  /* ----- после отправки заявки очищаем корзину ----- */
  var thanks = document.querySelector('[data-thanks="order"]');
  if (thanks) write([]);

  updateCount();

  /* ----- cookie и Яндекс Метрика (только после согласия) ----- */
  var banner = document.querySelector('[data-cookie]');
  if (banner) {
    var CK = 'nostra_cookie_choice';
    var choice = null;
    try { choice = localStorage.getItem(CK); } catch (e) {}
    var loadMetrika = function () {
      var id = banner.dataset.metrika; if (!id || window.ym) return;
      (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
        m[i].l = 1 * new Date();
        k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
      })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
      window.ym(+id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
    };
    var set = function (v) { try { localStorage.setItem(CK, v); } catch (e) {} banner.hidden = true; if (v === 'yes') loadMetrika(); };
    if (choice === 'yes') loadMetrika();
    else if (choice !== 'no') banner.hidden = false;
    banner.querySelector('[data-cookie-accept]').addEventListener('click', function () { set('yes'); });
    banner.querySelector('[data-cookie-decline]').addEventListener('click', function () { set('no'); });
    document.querySelectorAll('[data-cookie-open]').forEach(function (b) {
      b.addEventListener('click', function () { banner.hidden = false; });
    });
  }
})();
