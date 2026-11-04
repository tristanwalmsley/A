/* bestie_storage.js - saves everything pages put in localStorage to Cloudflare (per person).
   Include as the FIRST <script> on every page. The login is Cloudflare Access, so there is
   no password or token in here. Pages keep using localStorage exactly as before.
   - Page load: fetches your saved data (blocking, so it's ready before other scripts run).
   - Any setItem/removeItem/clear is saved to the server ~2s later, and on leaving the page. */
(function () {
  'use strict';
  const API = '/api/data';
  const LOCAL_ONLY = new Set(['bestie_current_user']);
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

  // 1. load synchronously so the page's own scripts see the data
  try {
    const x = new XMLHttpRequest();
    x.open('GET', API, false); x.send();
    if (x.status === 200) {
      const r = JSON.parse(x.responseText);
      user = r.user; loaded = true;
      if (r.data) Object.keys(r.data).forEach((k) => { if (!LOCAL_ONLY.has(k)) localStorage.setItem(k, r.data[k]); });
      else if (localStorage.length) dirty = true;   // first ever sync: upload what's here
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

  window.BestieSync = { get user() { return user; }, isSyncing: () => dirty,
    logout() { location.href = '/cdn-cgi/access/logout'; }, switchUser() { this.logout(); } };
  setTimeout(() => document.dispatchEvent(new CustomEvent('bestie-sync-ready', { detail: { user } })), 0);
})();
