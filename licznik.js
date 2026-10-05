/* Licznik odwiedzin (bez ciasteczek, bez danych osobowych): liczniki w usłudze Abacus (abacus.jasoncameron.dev).
   Na stronie: <span data-licznik="razem"></span>, <span data-licznik="dzis"></span>.
   W grze: licznik zlicza wejścia do demo, rozpoczęte i ukończone zmiany. */
(function () {
  var NS = 'mrowkazq-dyzurny-ruchu', API = 'https://abacus.jasoncameron.dev';
  function dzien(d) { d = d || new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }
  function hit(k) { return fetch(API + '/hit/' + NS + '/' + k).then(function (r) { return r.json(); }).then(function (j) { return j.value || 0; }).catch(function () { return null; }); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function pokaz(nazwa, v) { document.querySelectorAll('[data-licznik="' + nazwa + '"]').forEach(function (e) { e.textContent = v == null ? '–' : v.toLocaleString('pl-PL'); }); }
  window.LICZNIK = { NS: NS, API: API, dzien: dzien, hit: hit };

  var strona = document.documentElement.getAttribute('data-strona') || 'start';
  if (/[?&]nieliczmnie\b/.test(location.search)) ls('dr_nie_licz', '1');   // autor może wyłączyć liczenie siebie
  if (ls('dr_nie_licz') === '1') return;
  var dzis = dzien();
  if (strona === 'start') {
    hit('wyswietlenia').then(function (v) { pokaz('razem', v); });
    hit('d-' + dzis).then(function (v) { pokaz('dzis', v); });
    if (!ls('dr_bylem')) { ls('dr_bylem', '1'); hit('unikalni'); hit(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'tel' : 'pc'); }
    if (ls('dr_dzien') !== dzis) { ls('dr_dzien', dzis); hit('u-' + dzis); }
  } else if (strona === 'gra') {
    hit('demo-wejscia');
    document.addEventListener('click', function (e) { if (e.target && e.target.id === 'bStart') hit('demo-start'); }, true);
    window.addEventListener('demo-koniec', function () { hit('demo-koniec'); });
  }
})();
