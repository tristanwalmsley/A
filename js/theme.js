/* ==========================================================================
   theme.js - turns seasonal themes on/off by date. Load in <head>, before the body paints.

   ADD A THEME:  add one object to THEMES (and a matching html[data-theme="id"] block in
                 css/themes.css). Dates are MM-DD, inclusive, repeat every year, and may wrap
                 over New Year (e.g. start '12-20', end '01-05').
   PREVIEW:      ?theme=christmas   force a theme (sticks for this browser tab)
                 ?theme=off         force the normal look
                 ?theme=auto        go back to dates
                 ?themedate=12-03   pretend it is that date (also 2026-12-03)
   JS COLOURS:   SiteTheme.color('--gold') gives the live colour, for canvas drawing etc.
   ========================================================================== */
(function () {
  'use strict';

  var THEMES = [
    { id: 'winter',      label: 'Winter',      start: '11-06', end: '11-30',
      flakes: { glyphs: ['❄', '❅', '❆', '•'], count: 24, size: [9, 20] } },
    { id: 'sinterklaas', label: 'Sinterklaas', start: '12-01', end: '12-05',
      flakes: { glyphs: ['✦', '✧', '•'], count: 20, size: [10, 20] } },
    { id: 'christmas',   label: 'Christmas',   start: '12-06', end: '12-31',
      flakes: { glyphs: ['❄', '❅', '•'],  count: 26, size: [9, 20] } }
  ];

  var KEY = 'site_theme_preview', KEY_DATE = 'site_theme_date';
  var root = document.documentElement;

  function store(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function mmdd(d) { return pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function inRange(t, s, e) { return s <= e ? (t >= s && t <= e) : (t >= s || t <= e); }
  function byId(id) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i]; return null; }

  var q = new URLSearchParams(location.search);
  if (q.has('theme')) { var v = q.get('theme'); store(KEY, v === 'auto' ? null : v); }
  if (q.has('themedate')) store(KEY_DATE, q.get('themedate') || null);

  var forced = load(KEY), fakeDate = load(KEY_DATE);

  function todayKey() {
    if (fakeDate) { var m = fakeDate.match(/(\d{1,2})-(\d{1,2})$/); if (m) return pad(+m[1]) + '-' + pad(+m[2]); }
    return mmdd(new Date());
  }
  function chooseByDate() {
    var t = todayKey();
    for (var i = 0; i < THEMES.length; i++) if (inRange(t, THEMES[i].start, THEMES[i].end)) return THEMES[i];
    return null;
  }

  var active = null;
  if (forced === 'off' || forced === 'none' || forced === 'default') active = null;
  else if (forced && byId(forced)) active = byId(forced);
  else active = chooseByDate();

  if (active) root.setAttribute('data-theme', active.id); else root.removeAttribute('data-theme');

  /* ---------------- decorations (ribbon + falling flakes) ---------------- */
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function clearDeco() {
    ['theme-ribbon', 'theme-deco', 'theme-preview-badge'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.remove();
    });
  }
  function buildDeco() {
    clearDeco();
    var forcedNow = load(KEY) || load(KEY_DATE);
    if (forcedNow) {
      var b = document.createElement('div');
      b.id = 'theme-preview-badge';
      b.textContent = 'Theme preview: ' + (active ? active.label : 'normal') + '  ✕';
      b.title = 'Click to go back to automatic dates';
      b.onclick = function () { store(KEY, null); store(KEY_DATE, null); location.href = location.pathname; };
      document.body.appendChild(b);
    }
    if (!active) return;
    var r = document.createElement('div'); r.id = 'theme-ribbon'; r.setAttribute('aria-hidden', 'true');
    document.body.appendChild(r);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !active.flakes) return;
    var f = active.flakes, small = window.innerWidth < 700;
    var n = Math.round(f.count * (small ? 0.55 : 1));
    var layer = document.createElement('div'); layer.id = 'theme-deco'; layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span'); s.className = 'td-flake';
      s.textContent = f.glyphs[i % f.glyphs.length];
      s.style.cssText = '--x:' + rnd(0, 100).toFixed(1) + '%;--s:' + rnd(f.size[0], f.size[1]).toFixed(0) + 'px;' +
        '--o:' + rnd(0.45, 0.95).toFixed(2) + ';--d:' + rnd(11, 22).toFixed(1) + 's;--dl:-' + rnd(0, 20).toFixed(1) + 's;' +
        '--dx:' + rnd(-40, 40).toFixed(0) + 'px;--r:' + rnd(-180, 180).toFixed(0) + 'deg';
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
  }
  if (document.body) buildDeco(); else document.addEventListener('DOMContentLoaded', buildDeco);

  /* ---------------- public API ---------------- */
  window.SiteTheme = {
    themes: THEMES,
    get active() { return active ? active.id : null; },
    set: function (id) {                       // SiteTheme.set('christmas') / set(null)
      active = id ? byId(id) : null;
      if (active) root.setAttribute('data-theme', active.id); else root.removeAttribute('data-theme');
      buildDeco();
    },
    color: function (name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  };
})();
