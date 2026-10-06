// Społeczność: polubienia, powiadomienia o nowej wersji, propozycje zmian (Supabase, tylko dopisywanie)
(function () {
  var S = window.DR_SB; if (!S) return;
  var H = { apikey: S.key, Authorization: 'Bearer ' + S.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  function $(id) { return document.getElementById(id); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function dodaj(tab, dane) {
    return fetch(S.url + '/rest/v1/' + tab, { method: 'POST', headers: H, body: JSON.stringify(dane) })
      .then(function (r) { if (r.ok) return 'ok'; return r.status === 409 ? 'jest' : 'blad'; })
      .catch(function () { return 'blad'; });
  }
  function info(el, txt, ok) { el.textContent = txt; el.className = 'spInfo ' + (ok ? 'ok' : 'zle'); }

  // 1. polubienia
  var bL = $('spLajk'), nL = $('spLajkN');
  function licz() {
    fetch(S.url + '/rest/v1/rpc/liczba_polubien', { method: 'POST', headers: H, body: '{}' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (n) { if (typeof n === 'number') nL.textContent = n.toLocaleString('pl-PL'); })
      .catch(function () {});
  }
  if (bL) {
    if (ls('dr_lajk')) bL.classList.add('on');
    licz();
    bL.onclick = function () {
      if (ls('dr_lajk')) { bL.classList.add('on'); return; }
      bL.disabled = true;
      dodaj('polubienia', {}).then(function (w) {
        bL.disabled = false;
        if (w === 'ok') { ls('dr_lajk', '1'); bL.classList.add('on'); licz(); }
        else info($('spLajkInfo'), 'Nie udało się – spróbuj za chwilę.', false);
      });
    };
  }

  // 2. powiadomienia o nowej wersji
  var fS = $('spSub');
  if (fS) fS.onsubmit = function (e) {
    e.preventDefault();
    var em = fS.email.value.trim(), inf = $('spSubInfo');
    if (!fS.zgoda.checked) { info(inf, 'Zaznacz zgodę na wysyłanie powiadomień.', false); return; }
    fS.querySelector('button').disabled = true;
    dodaj('subskrypcje', { email: em, zgoda: true }).then(function (w) {
      fS.querySelector('button').disabled = false;
      if (w === 'ok') { info(inf, 'Zapisano! Dam znać, gdy pojawi się nowa wersja.', true); fS.reset(); }
      else if (w === 'jest') info(inf, 'Ten adres jest już zapisany.', true);
      else info(inf, 'Nie udało się zapisać – sprawdź adres i spróbuj ponownie.', false);
    });
  };

  // 3. propozycje zmian
  var fP = $('spProp');
  if (fP) fP.onsubmit = function (e) {
    e.preventDefault();
    var t = fP.tresc.value.trim(), inf = $('spPropInfo');
    if (t.length < 5) { info(inf, 'Napisz trochę więcej (min. 5 znaków).', false); return; }
    var d = { rodzaj: fP.rodzaj.value, tresc: t.slice(0, 1500), strona: document.documentElement.getAttribute('data-strona') || 'start' };
    var n = fP.nick.value.trim().replace(/[<>]/g, ''); if (n) d.nick = n.slice(0, 40);
    var k = fP.kontakt.value.trim(); if (k) d.kontakt = k.slice(0, 120);
    fP.querySelector('button').disabled = true;
    dodaj('propozycje', d).then(function (w) {
      fP.querySelector('button').disabled = false;
      if (w === 'ok') { info(inf, 'Dziękuję! Propozycja trafiła do autora.', true); fP.reset(); }
      else info(inf, 'Nie udało się wysłać – spróbuj za chwilę.', false);
    });
  };
})();
