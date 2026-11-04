/* bestie_storage.js - saves everything pages put in localStorage to Cloudflare (per person).
   Include as the FIRST <script> on every page. The login is Cloudflare Access, so there is
   no password or token in here. Pages keep using localStorage exactly as before.
   - Page load: fetches your saved data (blocking, so it's ready before other scripts run).
   - Any setItem/removeItem/clear is saved to the server ~2s later, and on leaving the page. */
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
  const LOCAL_ONLY = new Set(['bestie_current_user', 'besties_shared_v1']);
  let user = null, timer = null, dirty = false, loaded = false;

  const snapshot = () => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!LOCAL_ONLY.has(k)) out[k] = localStorage.getItem(k);
    }
    return out;
  };

  function push(keepalive) {
    if (!loaded || !user || !dirty) return;
    dirty = false; clearTimeout(timer);
    fetch(API, { method: 'PUT', keepalive: !!keepalive, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: snapshot() }) })
      .then((r) => { if (!r.ok) dirty = true; })
      .catch(() => { dirty = true; });
  }
  const schedule = () => { dirty = true; clearTimeout(timer); timer = setTimeout(() => push(false), 2000); };


  // shared contract/membership record (server is the truth). Pages + nav.js read it from localStorage.
  function useShared(S) {
    try {
      if (!S || !user) return;
      localStorage.setItem('bestie_current_user', user);
      localStorage.setItem('besties_shared_v1', JSON.stringify(S));
      const c = S.contract && S.contract[user];
      if (c) {   // keep the old keys alive so older pages (e.g. the gifts page) still see "signed"
        localStorage.setItem('ann_contract_signed_2026', '1');
        localStorage.setItem('ann_contract_name_2026', c.name);
        localStorage.setItem('ann_contract_date_2026', c.date || '');
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
      if (r.data) Object.keys(r.data).forEach((k) => { if (!LOCAL_ONLY.has(k)) localStorage.setItem(k, r.data[k]); });
      else if (localStorage.length) dirty = true;   // first ever sync: upload what's here
      useShared(r.shared);
    } else if (x.status === 401 || x.status === 403) {
      // never reload here: a persistent refusal would loop forever
      console.error('[bestie-storage] /api/data refused (' + x.status + '). Check the values in wrangler.jsonc.');
    }
  } catch (e) { console.warn('[bestie-storage] offline, running on local data only', e); }

  // 2. mirror writes
  const set = localStorage.setItem.bind(localStorage), rem = localStorage.removeItem.bind(localStorage), clr = localStorage.clear.bind(localStorage);
  localStorage.setItem = (k, v) => { set(k, v); if (!LOCAL_ONLY.has(k)) schedule(); };
  localStorage.removeItem = (k) => { rem(k); if (!LOCAL_ONLY.has(k)) schedule(); };
  localStorage.clear = () => { clr(); dirty = true; push(true); };   // resets save immediately
  addEventListener('pagehide', () => push(true));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') push(true); });
  if (dirty) schedule();

  window.BestieSync = { get user() { return user; }, refreshShared, post, isSyncing: () => dirty,
    logout() { location.href = '/cdn-cgi/access/logout'; }, switchUser() { this.logout(); } };
  setTimeout(() => document.dispatchEvent(new CustomEvent('bestie-sync-ready', { detail: { user } })), 0);
})();
