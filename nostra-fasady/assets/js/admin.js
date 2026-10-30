(function () {
  'use strict';
  // подтверждение опасных действий
  document.querySelectorAll('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (ev) { if (!window.confirm(f.dataset.confirm)) ev.preventDefault(); });
  });
  document.querySelectorAll('[data-confirm-btn]').forEach(function (b) {
    b.addEventListener('click', function (ev) { if (!window.confirm(b.dataset.confirmBtn)) ev.preventDefault(); });
  });
  // автоприменение фильтра
  document.querySelectorAll('[data-autosubmit]').forEach(function (s) {
    s.addEventListener('change', function () { s.form.submit(); });
  });
  // подсказка вариантов исполнения по выбранному разделу
  var sel = document.querySelector('[data-cat-select]');
  var opts = document.querySelector('[data-options]');
  var data = document.querySelector('[data-cat-options]');
  if (sel && opts && data) {
    var map = JSON.parse(data.textContent || '{}');
    sel.addEventListener('change', function () { opts.placeholder = map[sel.value] || ''; });
  }
})();
