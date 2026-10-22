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

  // publiczne liczby gry w Roblox (wizyty, grajacy teraz, ulubione, polubienia) – przez roproxy (Roblox nie pozwala na zapytania ze stron)
  var RBX_UNI = 10771308325;
  function rbxPub() {
    var g = function (u) { return fetch(u).then(function (r) { return r.json(); }).catch(function () { return null; }); };
    return Promise.all([g('https://games.roproxy.com/v1/games?universeIds=' + RBX_UNI), g('https://games.roproxy.com/v1/games/' + RBX_UNI + '/votes'),
      g('https://games.roproxy.com/v1/games/' + RBX_UNI + '/favorites/count')]).then(function (w) {
      var d = w[0] && w[0].data && w[0].data[0], v = w[1] && (w[1].data ? w[1].data[0] : w[1]);
      if (!d) return null;
      return { visits: d.visits || 0, playing: d.playing || 0, favorites: (w[2] && w[2].favoritesCount) || 0, up: v ? v.upVotes : 0, down: v ? v.downVotes : 0 };
    });
  }
  window.LICZNIK_RBX = rbxPub;
  var strona = document.documentElement.getAttribute('data-strona') || 'start';
  // statystyki z gry w Roblox (serwer gry zlicza te same liczniki z kluczami rbx-*); linijka widoczna, gdy ktos juz zagral
  var rbx = document.getElementById('rbxLicznik');
  if (rbx) {
    var el = rbx.querySelectorAll('[data-rbx]');
    Promise.all(Array.prototype.map.call(el, function (e) { return get(e.getAttribute('data-rbx')); })).then(function (w) {
      w.forEach(function (v, i) { el[i].textContent = (v || 0).toLocaleString('pl-PL'); });
      if (w[0] > 0 || w[1] > 0) rbx.hidden = false;
    });
    rbxPub().then(function (p) {
      if (!p) return;
      rbx.querySelectorAll('[data-rbxpub]').forEach(function (e) { e.textContent = (p[e.getAttribute('data-rbxpub')] || 0).toLocaleString('pl-PL'); });
      if (p.visits > 0) rbx.hidden = false;
    });
  }
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
    if (nowy) { ls('dr_bylem', dzis); hit('unikalni'); hit('n-' + dzis); hit(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'tel' : 'komputer'); /* klucz min. 3 znaki (Abacus odrzucal 'pc') */ }
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
