/* ==========================================================================
   remembrance.js - the two minutes' silence. Loaded by js/theme.js, only while the
   Remembrance theme is on (10-12 Nov), so it does nothing the rest of the year.

   WHAT IT DOES
     At the chosen time(s) on Remembrance Day, every page covers itself with a still, dark
     screen for two minutes, and all sound on the page is stopped (music, videos, the
     synth sounds in the secret reels). Afterwards the sound is allowed again and anything
     that was playing carries on. It runs off the visitor's own clock, so 11:00 means
     11:00 wherever they are, and it works on whichever page they happen to be on.
     A small countdown pill ("next silence in 23:41") sits at the bottom of every page all day.
     There is deliberately no way to skip a silence.

   CHANGE THE TIMES (the settings just below):
     only 11am:                         SILENCE_HOURS = [11]
     every hour of the day:             SILENCE_HOURS = [0,1,2,...,23]

   TRY IT WITHOUT WAITING:
     ?silence=now   a full 2 minute silence starting right now (follows you from page to page)
     ?silence=20    a 20 second one, for a quick look
     ?silence=off   cancels a preview
   ========================================================================== */
(function () {
  'use strict';

  var SILENCE_DAY   = '11-11';   // MM-DD
  var SILENCE_HOURS = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];      // 24h clock, local time of whoever is visiting
  var SILENCE_MINS  = 2;

    var TAIL_MS   = 8000;          // "We will remember them" stays up this long after the silence ends

  var root = document.documentElement;
  var DEMO_KEY = 'remembrance_demo';          // sessionStorage: "<start>|<end>" of a preview

  function store(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------------- preview via the address bar ---------------- */
  var q = new URLSearchParams(location.search);
  if (q.has('silence')) {
    var v = q.get('silence'), now0 = Date.now();
    if (v === 'off') store(DEMO_KEY, null);
    else {
      var secs = v === 'now' || v === '' ? SILENCE_MINS * 60 : Math.max(5, Math.min(600, parseInt(v, 10) || 0));
      if (secs) { store(DEMO_KEY, now0 + '|' + (now0 + secs * 1000)); }
    }
  }

  /* ---------------- which silence is it right now? ---------------- */
  function current(now) {
    var demo = (load(DEMO_KEY) || '').split('|');
    if (demo.length === 2) {
      var ds = +demo[0], de = +demo[1];
      if (now >= ds && now < de + TAIL_MS) return { key: 'demo' + ds, start: ds, end: de };
    }
    var d = new Date(now);
    if (pad(d.getMonth() + 1) + '-' + pad(d.getDate()) !== SILENCE_DAY) return null;
    for (var i = 0; i < SILENCE_HOURS.length; i++) {
      var s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), SILENCE_HOURS[i], 0, 0).getTime();
      var e = s + SILENCE_MINS * 60000;
      if (now >= s && now < e + TAIL_MS) return { key: 'h' + SILENCE_HOURS[i], start: s, end: e };
    }
    return null;
  }
  function nextStart(now) {          // the next real silence later today (for the heads-up)
    var d = new Date(now);
    if (pad(d.getMonth() + 1) + '-' + pad(d.getDate()) !== SILENCE_DAY) return null;
    for (var i = 0; i < SILENCE_HOURS.length; i++) {
      var s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), SILENCE_HOURS[i], 0, 0).getTime();
      if (s > now) return s;
    }
    return null;
  }

  var silent = false;                // true from the first moment of a silence until the screen goes away

  /* ---------------- sound: find it all, stop it, give it back ---------------- */
  var contexts = [], seenMedia = [], pausedByUs = [], suspendedByUs = [];

  ['AudioContext', 'webkitAudioContext'].forEach(function (name) {
    var Orig = window[name];
    if (!Orig || Orig.__remembrance) return;
    var Wrapped = class extends Orig {
      constructor(a) {
        super(a);
        contexts.push(this);
        if (silent) { try { super.suspend(); } catch (e) {} }
      }
      resume() { return silent ? Promise.resolve() : super.resume(); }   // a "tap for sound" can't switch it back on
    };
    Wrapped.__remembrance = true;
    try { window[name] = Wrapped; } catch (e) {}
  });

  var origPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (seenMedia.indexOf(this) < 0) seenMedia.push(this);
    if (silent) { try { this.pause(); } catch (e) {} return Promise.resolve(); }
    return origPlay.apply(this, arguments);
  };

  function hush() {
    var all = seenMedia.slice();
    document.querySelectorAll('audio,video').forEach(function (m) { if (all.indexOf(m) < 0) all.push(m); });
    all.forEach(function (m) {
      if (!m.paused) { pausedByUs.push(m); try { m.pause(); } catch (e) {} }
    });
    contexts.forEach(function (c) {
      if (c.state === 'running') { suspendedByUs.push(c); try { c.suspend(); } catch (e) {} }
    });
  }
  function unhush() {
    var m = pausedByUs, c = suspendedByUs;
    pausedByUs = []; suspendedByUs = [];
    c.forEach(function (x) { try { x.resume(); } catch (e) {} });
    m.forEach(function (x) { try { var p = origPlay.call(x); if (p && p.catch) p.catch(function () {}); } catch (e) {} });
  }
  var hushTimer = null;              // new sounds can start during the silence (timers, reels); keep catching them
  function startHushing() { hush(); hushTimer = setInterval(hush, 700); }
  function stopHushing() { clearInterval(hushTimer); hushTimer = null; }

  /* ---------------- look ---------------- */
  var POPPY = "<svg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>" +
    "<g fill='#c8102e' stroke='#8f0c20' stroke-width='.5'><circle cx='16' cy='9' r='8'/><circle cx='23' cy='16' r='8'/>" +
    "<circle cx='16' cy='23' r='8'/><circle cx='9' cy='16' r='8'/></g><circle cx='16' cy='16' r='4.2' fill='#161616'/>" +
    "<g fill='#161616'><circle cx='16' cy='9.6' r='.6'/><circle cx='22.4' cy='16' r='.6'/><circle cx='16' cy='22.4' r='.6'/><circle cx='9.6' cy='16' r='.6'/>" +
    "<circle cx='20.5' cy='11.5' r='.6'/><circle cx='20.5' cy='20.5' r='.6'/><circle cx='11.5' cy='20.5' r='.6'/><circle cx='11.5' cy='11.5' r='.6'/></g></svg>";

  var CSS =
    "#rem-silence{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "gap:1.1rem;padding:2rem;text-align:center;background:#111010;color:#e9e3d6;animation:remIn 2.2s ease both;" +
    "font-family:var(--font-body,Georgia,serif);cursor:default}" +
    "#rem-silence .rem-poppy{width:clamp(70px,16vw,104px);height:auto;filter:drop-shadow(0 0 22px rgba(200,16,46,.28))}" +
    "#rem-silence h2{font-family:var(--font-display,Georgia,serif);font-weight:400;font-style:italic;font-size:clamp(1.7rem,5vw,2.6rem);color:#f3eee4;letter-spacing:.3px}" +
    "#rem-silence .rem-sub{font-family:var(--font-hand,cursive);font-size:clamp(1.15rem,3vw,1.45rem);color:#b9b0a0;letter-spacing:.5px}" +
    "#rem-silence .rem-time{font-variant-numeric:tabular-nums;font-size:1.05rem;letter-spacing:3px;color:#8d8678;min-height:1.4em}" +
    "#rem-silence .rem-bar{width:min(240px,60vw);height:2px;background:#2a2727;border-radius:2px;overflow:hidden}" +
    "#rem-silence .rem-bar i{display:block;height:100%;width:0;background:#8f1a2b;transition:width .5s linear}" +
    "#rem-silence .rem-lest{font-family:var(--font-display,Georgia,serif);font-style:italic;color:#8d8678;font-size:1rem;margin-top:.4rem}" +
    "#rem-silence.rem-after .rem-time,#rem-silence.rem-after .rem-bar,#rem-silence.rem-after .rem-lest{display:none}" +
    "#rem-silence.rem-out{animation:remOut 1.6s ease both}" +
    "@keyframes remIn{from{opacity:0}to{opacity:1}}@keyframes remOut{from{opacity:1}to{opacity:0}}" +
    "html.rem-lock,html.rem-lock body{overflow:hidden}" +
    "#rem-heads-up{position:fixed;left:50%;bottom:.6rem;transform:translateX(-50%);z-index:9993;max-width:92vw;text-align:center;" +
    "background:#1c1a1a;color:#e9e3d6;border:1px solid #8f1a2b;border-radius:99px;padding:.25rem .75rem;" +
    "font:italic .8rem/1.3 var(--font-body,Georgia,serif);opacity:.9;font-variant-numeric:tabular-nums;box-shadow:0 2px 10px rgba(0,0,0,.3);pointer-events:none}" +
    "@media (prefers-reduced-motion:reduce){#rem-silence,#rem-silence.rem-out{animation:none}#rem-silence .rem-bar i{transition:none}}";

  var overlay = null, headsUp = null, inerted = [];

  function injectCSS() {
    if (document.getElementById('rem-css')) return;
    var st = document.createElement('style'); st.id = 'rem-css'; st.textContent = CSS;
    (document.head || root).appendChild(st);
  }

  function buildOverlay() {
    injectCSS();
    overlay = document.createElement('div');
    overlay.id = 'rem-silence';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Two minutes of silence for Remembrance Day');
    overlay.tabIndex = -1;
    overlay.innerHTML =
      '<div class="rem-poppy">' + POPPY + '</div>' +
      '<h2 id="rem-title">Two minutes’ silence</h2>' +
      '<p class="rem-sub" id="rem-sub">Remembrance Day · 11 November</p>' +
      '<div class="rem-time" id="rem-time" aria-hidden="true"></div>' +
      '<div class="rem-bar" aria-hidden="true"><i id="rem-bar"></i></div>' +
      '<p class="rem-lest">Lest we forget</p>';
    document.body.appendChild(overlay);
    root.classList.add('rem-lock');
    // nothing behind the screen can be reached with the keyboard or a screen reader meanwhile
    inerted = [];
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el !== overlay && el.tagName !== 'SCRIPT' && !el.inert) { el.inert = true; inerted.push(el); }
    });
    try { overlay.focus({ preventScroll: true }); } catch (e) {}
  }

  function removeOverlay(fade) {
    var o = overlay; overlay = null;
    inerted.forEach(function (el) { el.inert = false; }); inerted = [];
    root.classList.remove('rem-lock');
    if (!o) return;
    if (fade) { o.classList.add('rem-out'); setTimeout(function () { o.remove(); }, 1700); } else o.remove();
  }

  /* ---------------- the loop ---------------- */
  var cur = null, afterShown = false;

  function begin(w) {
    silent = true; cur = w; afterShown = false;
    startHushing();
  }
  function finish(fade) {
    silent = false; cur = null;
    stopHushing(); removeOverlay(fade); unhush();
  }

  function update(w, now) {
    if (!overlay && document.body) buildOverlay();
    if (!overlay) return;
    var total = w.end - w.start, left = Math.max(0, w.end - now);
    if (now < w.end) {
      var s = Math.ceil(left / 1000);
      document.getElementById('rem-time').textContent = Math.floor(s / 60) + ':' + pad(s % 60);
      document.getElementById('rem-bar').style.width = Math.min(100, ((now - w.start) / total) * 100).toFixed(1) + '%';
    } else if (!afterShown) {
      afterShown = true;
      overlay.classList.add('rem-after');
      document.getElementById('rem-title').textContent = 'We will remember them';
      document.getElementById('rem-sub').textContent = '🌺';
    }
  }

  function showHeadsUp(text) {
    if (!text) { if (headsUp) { headsUp.remove(); headsUp = null; } return; }
    if (!document.body) return;
    if (!headsUp) {
      injectCSS();
      headsUp = document.createElement('div'); headsUp.id = 'rem-heads-up'; headsUp.setAttribute('aria-hidden', 'true');
      document.body.appendChild(headsUp);
    }
    headsUp.textContent = text;
  }

  function tick() {
    var now = Date.now(), w = current(now);
    if (w) {
      if (!silent) begin(w);
      showHeadsUp(null);
      update(w, now);
      return;
    }
    if (silent) {                         // over
      finish(true);
    }
    var next = nextStart(now);
    if (next) {
      var secs = Math.ceil((next - now) / 1000), h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), sc = secs % 60;
      showHeadsUp('Two minutes’ silence in ' + (h ? h + ':' + pad(m) : m) + ':' + pad(sc));
    } else showHeadsUp(null);
  }

  tick();                                  // right now, so a page opened mid-silence is quiet from the very start
  setInterval(tick, 500);
  document.addEventListener('visibilitychange', tick);
  document.addEventListener('DOMContentLoaded', tick);
})();
