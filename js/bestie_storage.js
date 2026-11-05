/* bestie_storage.js - saves everything pages put in localStorage to Cloudflare (per person).
   Include as the FIRST <script> on every page. The login is Cloudflare Access, so there is
   no password or token in here. Pages keep using localStorage exactly as before.
   - Page load: fetches your saved data (blocking, so it's ready before other scripts run).
   - Any setItem/removeItem/clear is saved to the server ~2s later, and on leaving the page.
   - v2: hooks live on Storage.prototype (assigning localStorage.setItem = fn can store the function as a junk key
     in some browsers and silently break saving), a 2.5s change-watcher backs the hooks up, unsynced local
     changes are never overwritten by an older server copy, and found secrets are always merged, never lost. */
(function () {
  'use strict';
  // ---- OLD SITE GUARD ----
  // This repo also feeds the old github.io site. There, block every page except the migration page, so nobody
  // clicks "Reset data" (or anything else) before their progress has been exported. Nothing below runs on the old site.
  const OLD_HOST = /github\.io$/.test(location.hostname);
  if (OLD_HOST) {
    if (/\/migrate\.html$/.test(location.pathname)) return;
    const show = () => {
      document.body.inert = true;   // no clicks, no keyboard, nothing underneath
      const o = document.createElement('div');
      o.setAttribute('role', 'alertdialog'); o.setAttribute('aria-modal', 'true');
      o.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:rgba(30,10,4,.93);font-family:Georgia,serif';
      o.innerHTML = '<div style="max-width:460px;background:#fffdf5;border:1px solid #d4b483;box-shadow:6px 6px 0 #c8943a;padding:2rem 2rem 1.6rem;text-align:center;color:#3a2010;line-height:1.55">'
        + '<div style="font-size:2rem">⚠️</div>'
        + '<h1 style="font-size:1.6rem;font-style:italic;font-weight:400;margin:.4rem 0 .8rem">This is the old website</h1>'
        + '<p>The site has moved. Your progress is still saved in this browser, but only until you move it across.</p>'
        + '<p style="margin-top:.8rem"><b>Please don\'t click around here.</b> Go to the migration page and follow the steps that were emailed to you.</p>'
        + '<a href="migrate.html" style="display:inline-block;margin-top:1.3rem;padding:.8rem 1.6rem;background:#3a2010;color:#faf4e8;text-decoration:none;box-shadow:3px 3px 0 #c8943a">Go to the migration page →</a></div>';
      document.documentElement.appendChild(o);
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
    return;
  }

  const API = '/api/data';
  const LOCAL_ONLY = new Set(['bestie_current_user', 'besties_shared_v1', 'besties_pending_v1']);
  // names that are Storage methods; a stored item with one of these names can shadow the real method in some browsers
  const JUNK = new Set(['setItem', 'removeItem', 'clear', 'getItem', 'key', 'length']);
  const skip = (k) => LOCAL_ONLY.has(k) || JUNK.has(k);

  // capture the REAL storage methods once, and only ever use these inside this file
  const SP = Storage.prototype;
  const rawSet = SP.setItem, rawGet = SP.getItem, rawRem = SP.removeItem, rawClr = SP.clear, rawKey = SP.key;
  const lenGet = Object.getOwnPropertyDescriptor(SP, 'length').get;
  const L = localStorage;
  const lsSet = (k, v) => rawSet.call(L, k, v), lsGet = (k) => rawGet.call(L, k), lsRem = (k) => rawRem.call(L, k);
  const lsLen = () => lenGet.call(L), lsKey = (i) => rawKey.call(L, i);

  let user = null, timer = null, dirty = false, loaded = false, lastSig = '', lastStatus = 'not synced yet';

  // clear out junk keys left behind by the old version of this file
  try { JUNK.forEach((k) => lsRem(k)); } catch (e) {}

  const snapshot = () => {
    const keys = [];
    for (let i = 0; i < lsLen(); i++) { const k = lsKey(i); if (k !== null && !skip(k)) keys.push(k); }
    keys.sort();
    const out = {};
    keys.forEach((k) => { out[k] = lsGet(k); });
    return out;
  };

  // found secrets only ever grow, so when local and server disagree we keep both sets
  const asArr = (s) => { try { const a = JSON.parse(s); return Array.isArray(a) ? a : null; } catch (e) { return null; } };
  const asObj = (s) => { try { const o = JSON.parse(s); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : null; } catch (e) { return null; } };
  const union = (a, b) => Array.from(new Set([].concat(a || [], b || [])));
  const MERGE = {
    ann_eggs_found: (loc, srv) => { const a = asArr(loc), b = asArr(srv); return (a && b) ? JSON.stringify(union(b, a)) : (b ? srv : loc); },
    ann_page_eggs_v1: (loc, srv) => {
      const a = asObj(loc), b = asObj(srv); if (!a || !b) return b ? srv : loc;
      const out = Object.assign({}, b);
      Object.keys(a).forEach((p) => { if (Array.isArray(a[p])) out[p] = union(Array.isArray(b[p]) ? b[p] : [], a[p]); });
      return JSON.stringify(out);
    }
  };

  function push(keepalive) {
    if (!loaded || !user) return;
    const snap = snapshot(), sig = JSON.stringify(snap);
    if (!dirty && sig === lastSig) return;
    dirty = false; clearTimeout(timer);
    const body = JSON.stringify({ data: snap });
    fetch(API, { method: 'PUT', keepalive: !!keepalive && body.length < 60000, headers: { 'Content-Type': 'application/json' }, body })
      .then((r) => {
        if (r.ok) { lastSig = sig; lastStatus = 'saved ' + new Date().toISOString(); if (!dirty && JSON.stringify(snapshot()) === sig) { try { lsRem('besties_pending_v1'); } catch (e) {} } }
        else { dirty = true; lastStatus = 'save refused: HTTP ' + r.status; console.warn('[bestie-storage] save refused (' + r.status + ')'); }
      })
      .catch((e) => { dirty = true; lastStatus = 'save failed: ' + e; });
  }
  const schedule = () => {
    dirty = true; clearTimeout(timer); timer = setTimeout(() => push(false), 2000);
    try { lsSet('besties_pending_v1', '1'); } catch (e) {}   // "this device has changes the server hasn't seen"
  };

  // shared contract/membership record (server is the truth). Pages + nav.js read it from localStorage.
  function useShared(S) {
    try {
      if (!S || !user) return;
      lsSet('bestie_current_user', user);
      lsSet('besties_shared_v1', JSON.stringify(S));
      const c = S.contract && S.contract[user];
      if (c) {   // keep the old keys alive so older pages (e.g. the gifts page) still see "signed"
        lsSet('ann_contract_signed_2026', '1');
        lsSet('ann_contract_name_2026', c.name);
        lsSet('ann_contract_date_2026', c.date || '');
      }
    } catch (e) {}
  }
  async function refreshShared() {
    const r = await fetch('/api/shared'); if (!r.ok) throw new Error('shared ' + r.status);
    const j = await r.json(); user = user || j.user; useShared(j.shared); return j.shared;
  }
  async function post(path, body) {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || r.status), { status: r.status });
    if (j.shared) useShared(j.shared);
    return j;
  }

  // 1. load synchronously so the page's own scripts see the data
  try {
    const x = new XMLHttpRequest();
    x.open('GET', API, false); x.send();
    if (x.status === 200) {
      const r = JSON.parse(x.responseText);
      user = r.user; loaded = true;
      const pending = lsGet('besties_pending_v1') === '1';   // unsynced changes from last time: they win over the server copy
      let sd = r.data;
      if (typeof sd === 'string') { try { sd = JSON.parse(sd); } catch (e) { sd = null; } }
      const good = sd && typeof sd === 'object' && !Array.isArray(sd);
      if (good) {
        Object.keys(sd).forEach((k) => {
          if (skip(k)) return;
          const sv = typeof sd[k] === 'string' ? sd[k] : JSON.stringify(sd[k]);
          const lv = lsGet(k);
          if (lv === null) { lsSet(k, sv); }
          else if (MERGE[k]) { const m = MERGE[k](lv, sv); if (m !== lv) lsSet(k, m); if (m !== sv) dirty = true; }
          else if (!pending) { if (lv !== sv) lsSet(k, sv); }
          else if (lv !== sv) { dirty = true; }
        });
        // anything that exists here but not on the server also needs uploading
        const serverKeys = new Set(Object.keys(sd));
        Object.keys(snapshot()).forEach((k) => { if (!serverKeys.has(k)) dirty = true; });
      } else {
        if (r.data != null) console.warn('[bestie-storage] server data was not an object; ignoring it and keeping local data');
        if (lsLen()) dirty = true;   // first ever sync (or broken server copy): upload what's here
      }
      useShared(r.shared);
      lastSig = dirty ? '' : JSON.stringify(snapshot());
      lastStatus = 'loaded ' + new Date().toISOString();
    } else if (x.status === 401 || x.status === 403) {
      // never reload here: a persistent refusal would loop forever
      lastStatus = 'load refused: HTTP ' + x.status;
      console.error('[bestie-storage] /api/data refused (' + x.status + '). Check the values in wrangler.jsonc.');
    } else { lastStatus = 'load failed: HTTP ' + x.status; }
  } catch (e) { lastStatus = 'offline: ' + e; console.warn('[bestie-storage] offline, running on local data only', e); }

  // 2. mirror writes (on the prototype, never by assigning to localStorage itself)
  try {
    SP.setItem = function (k, v) { rawSet.apply(this, arguments); if (this === L && !skip(String(k))) schedule(); };
    SP.removeItem = function (k) { rawRem.apply(this, arguments); if (this === L && !skip(String(k))) schedule(); };
    SP.clear = function () { rawClr.apply(this, arguments); if (this === L) { dirty = true; push(true); } };   // resets save immediately
  } catch (e) { console.warn('[bestie-storage] could not hook storage; relying on the change watcher', e); }
  // backup: even if a hook is bypassed, any difference from what the server has gets uploaded within a few seconds
  setInterval(() => { if (loaded && user && !dirty && JSON.stringify(snapshot()) !== lastSig) schedule(); }, 2500);
  addEventListener('pagehide', () => push(true));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') push(true); });
  if (dirty) schedule();

  window.BestieSync = { get user() { return user; }, refreshShared, post, isSyncing: () => dirty,
    get status() { return lastStatus; },
    logout() { location.href = '/cdn-cgi/access/logout'; }, switchUser() { this.logout(); } };
  setTimeout(() => document.dispatchEvent(new CustomEvent('bestie-sync-ready', { detail: { user } })), 0);
})();
