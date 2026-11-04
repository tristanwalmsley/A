// Besties Worker: serves the static site (ASSETS) and a tiny /api for per-person data in KV.
// Identity comes ONLY from Cloudflare Access's signed token, never from the request body.

const b64uToBytes = (s) => {
  s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
};
const b64uToJson = (s) => JSON.parse(new TextDecoder().decode(b64uToBytes(s)));

// returns the verified email, or null
async function verifyAccess(request, env) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const header = b64uToJson(parts[0]), payload = b64uToJson(parts[1]);
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.POLICY_AUD)) return null;
    if (payload.iss !== `https://${env.TEAM_DOMAIN}`) return null;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    const certs = await (await fetch(`https://${env.TEAM_DOMAIN}/cdn-cgi/access/certs`,
      { cf: { cacheTtl: 3600, cacheEverything: true } })).json();
    const jwk = certs.keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64uToBytes(parts[2]),
      new TextEncoder().encode(parts[0] + '.' + parts[1]));
    return ok && payload.email ? String(payload.email).toLowerCase() : null;
  } catch (e) { return null; }
}

const json = (obj, status = 200) => new Response(JSON.stringify(obj),
  { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });


// ---- shared contract + membership (one record per person per year; each person only ever writes their own) ----
const YEAR = '2026', PEOPLE = ['tristan', 'ann'], PLANS_ALLOWED = ['annual'];
const kvKey = (kind, who) => `${kind}:${YEAR}:${who}`;
const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' });
const getJson = async (env, key) => { const r = await env.BESTIES_KV.get(key); return r ? JSON.parse(r) : null; };
async function readBody(req) { try { const t = await req.text(); return t.length > 10000 ? null : JSON.parse(t); } catch (e) { return null; } }

// Ann already signed the 2026 contract on the old system: carry her signature (and the only accepted membership) across once.
async function migrateAnn(env) {
  if (await env.BESTIES_KV.get(kvKey('contract', 'ann'))) return;
  const raw = await env.BESTIES_KV.get('user:ann'); if (!raw) return;
  let d; try { d = JSON.parse(raw); } catch (e) { return; }
  if (!d.ann_contract_signed_2026) return;
  await env.BESTIES_KV.put(kvKey('contract', 'ann'), JSON.stringify({ name: d.ann_contract_name_2026 || 'Ann', date: d.ann_contract_date_2026 || 'Signed with love', at: null }));
  if (!(await env.BESTIES_KV.get(kvKey('membership', 'ann'))))
    await env.BESTIES_KV.put(kvKey('membership', 'ann'), JSON.stringify({ plan: 'annual', at: null, migrated: true }));
}
async function loadShared(env) {
  await migrateAnn(env);
  const out = { membership: {}, contract: {} };
  await Promise.all(PEOPLE.flatMap((who) => ['membership', 'contract'].map(async (kind) => { out[kind][who] = await getJson(env, kvKey(kind, who)); })));
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    const email = await verifyAccess(request, env);
    const users = { [env.TRISTAN_EMAIL.toLowerCase()]: 'tristan', [env.ANN_EMAIL.toLowerCase()]: 'ann' };
    const user = email && users[email];
    if (!user) return json({ error: 'unauthorized' }, 401);


    if (url.pathname === '/api/shared' && request.method === 'GET') return json({ user, shared: await loadShared(env) });
    if (url.pathname === '/api/membership' && request.method === 'POST') {
      const body = await readBody(request);
      if (!body || !PLANS_ALLOWED.includes(body.plan)) return json({ error: 'plan not accepted' }, 400);
      if (!(await getJson(env, kvKey('membership', user))))   // locked once chosen
        await env.BESTIES_KV.put(kvKey('membership', user), JSON.stringify({ plan: body.plan, at: new Date().toISOString() }));
      return json({ ok: true, shared: await loadShared(env) });
    }
    if (url.pathname === '/api/contract' && request.method === 'POST') {
      await migrateAnn(env);
      if (!(await getJson(env, kvKey('membership', user)))) return json({ error: 'choose a membership first' }, 403);
      const body = await readBody(request);
      const name = String((body && body.name) || '').trim().slice(0, 60);
      if (!name) return json({ error: 'name required' }, 400);
      if (!(await getJson(env, kvKey('contract', user))))     // you can only ever sign your own half, once; the date is stamped here
        await env.BESTIES_KV.put(kvKey('contract', user), JSON.stringify({ name, date: today(), at: new Date().toISOString() }));
      return json({ ok: true, shared: await loadShared(env) });
    }
    if (url.pathname === '/api/data' && request.method === 'GET') {
      const raw = await env.BESTIES_KV.get('user:' + user);
      return json({ user, data: raw ? JSON.parse(raw) : null, shared: await loadShared(env) });
    }
    if (url.pathname === '/api/data' && request.method === 'PUT') {
      const text = await request.text();
      if (text.length > 1_000_000) return json({ error: 'too large' }, 413);
      let body; try { body = JSON.parse(text); } catch (e) { return json({ error: 'bad json' }, 400); }
      if (!body || typeof body.data !== 'object' || Array.isArray(body.data)) return json({ error: 'bad body' }, 400);
      await env.BESTIES_KV.put('user:' + user, JSON.stringify(body.data));
      return json({ ok: true });
    }
    return json({ error: 'not found' }, 404);
  },
};
