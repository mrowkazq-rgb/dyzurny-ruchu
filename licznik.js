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

  function get(k) { return fetch(API + '/get/' + NS + '/' + k).then(function (r) { return r.json(); }).then(function (j) { return j.value || 0; }).catch(function () { return null; }); }
  var strona = document.documentElement.getAttribute('data-strona') || 'start';
  // autor: ?nieliczmnie – ta przeglądarka przestaje być liczona (zapamiętane), ?liczmnie – cofa
  if (/[?&]nieliczmnie\b/.test(location.search)) ls('dr_nie_licz', '1');
  if (/[?&]liczmnie\b/.test(location.search)) ls('dr_nie_licz', '0');
  var dzis = dzien();
  if (ls('dr_nie_licz') === '1') {          // tylko odczyt, bez zliczania
    if (strona === 'start') {
      get('wyswietlenia').then(function (v) { pokaz('razem', v); });
      get('d-' + dzis).then(function (v) { pokaz('dzis', v); });
      document.querySelectorAll('.licznik').forEach(function (e) { e.insertAdjacentHTML('beforeend', ' · <i>Twoje wejścia nie są liczone</i>'); });
    }
    return;
  }
  if (strona === 'start') {
    hit('wyswietlenia').then(function (v) { pokaz('razem', v); });
    hit('d-' + dzis).then(function (v) { pokaz('dzis', v); });
    var nowy = !ls('dr_bylem');
    if (nowy) { ls('dr_bylem', dzis); hit('unikalni'); hit('n-' + dzis); hit(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'tel' : 'pc'); }
    if (ls('dr_dzien') !== dzis) {        // pierwsze wejście tej przeglądarki dzisiaj
      ls('dr_dzien', dzis); hit('u-' + dzis);
      if (!nowy) { hit('powroty'); hit('p-' + dzis); }   // powracający: był już kiedyś wcześniej
    }
  } else if (strona === 'gra') {
    hit('demo-wejscia');
    document.addEventListener('click', function (e) { if (e.target && e.target.id === 'bStart') hit('demo-start'); }, true);
    window.addEventListener('demo-koniec', function () { hit('demo-koniec'); });
  }
})();
