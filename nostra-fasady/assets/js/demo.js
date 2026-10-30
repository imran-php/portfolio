/* Демо-версия NOSTRA на статическом хостинге: поиск в браузере, формы без отправки */
(function () {
  'use strict';
  // поиск по каталогу
  var search = document.querySelector('form[role=search]');
  var grid = document.querySelector('.catalog .grid-models');
  function filter(q) {
    if (!grid) return;
    q = (q || '').trim().toLowerCase();
    var cards = grid.querySelectorAll('.model'), shown = 0;
    cards.forEach(function (c) {
      var name = (c.querySelector('.model__name') || c).textContent.toLowerCase();
      var ok = !q || name.indexOf(q) !== -1;
      c.hidden = !ok; if (ok) shown++;
    });
    var bar = document.querySelector('.catalog__bar span');
    if (bar) bar.textContent = 'Показано ' + shown + ' из ' + cards.length;
    var empty = document.querySelector('[data-demo-empty]');
    if (!empty) {
      empty = document.createElement('div'); empty.className = 'empty'; empty.setAttribute('data-demo-empty', '');
      empty.innerHTML = '<p>По запросу ничего не нашлось.</p>';
      grid.parentNode.insertBefore(empty, grid.nextSibling);
    }
    empty.hidden = shown > 0;
  }
  if (search) {
    var input = search.querySelector('input[name=q]');
    search.addEventListener('submit', function (ev) { ev.preventDefault(); filter(input.value); });
    input.addEventListener('input', function () { filter(input.value); });
    var q0 = new URLSearchParams(location.search).get('q');
    if (q0) { input.value = q0; filter(q0); }
  }
  // формы: в демо ничего не отправляем
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var b = (window.NOSTRA && NOSTRA.base) || '';
      location.href = b + (f.matches('[data-order-form]') ? '/thanks/index.html' : '/thanks/type-partner/index.html');
    });
  });
})();
