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
// ---- shared predictions (us.html): ONE record per year, { [predictionId]: { by, at } }. Either of you can tick or untick any of them. ----
// Ann's old ticks were saved by list position, so this is the ORIGINAL order of the 15 predictions, used once to carry them across.
const LEGACY_PRED_IDS = ['plushie_return','ten_long_calls','ann_masters_something','dutch_progress','more_insync','new_bits','biscuit_tier_list',
  'weekly_schedule','wren_married','phas_monday','games_list','mandalorian','tristan_graduates','better_friendship','meet_irl'];
const predKey = () => `predictions:${YEAR}`;
async function loadPredictions(env) {
  const rec = await getJson(env, predKey());
  if (rec) return rec;
  const out = {};   // first ever load: migrate Ann's old position-based ticks (once), then store the record so this never repeats
  try {
    const raw = await env.BESTIES_KV.get('user:ann');
    const d = raw && JSON.parse(raw), old = d && d.ann_predictions_2025 && JSON.parse(d.ann_predictions_2025);
    if (Array.isArray(old)) old.forEach((i) => { const id = LEGACY_PRED_IDS[i]; if (id) out[id] = { by: 'ann', at: null, migrated: true }; });
  } catch (e) {}
  await env.BESTIES_KV.put(predKey(), JSON.stringify(out));
  return out;
}

// ---- University of Besties admissions: stages, helpers, and what an applicant is allowed to see ----
// received -> under-review -> interview (optional) -> conditional-offer | unconditional-offer | unsuccessful
//   -> accepted (conditional offer accepted, conditions pending) | declined | enrolled
const APP_STAGES = ['received', 'under-review', 'interview', 'conditional-offer', 'unconditional-offer', 'unsuccessful', 'accepted', 'declined', 'enrolled'];
const OFFER_STAGES = ['conditional-offer', 'unconditional-offer'];
const OPEN_STAGES = ['received', 'under-review', 'interview'];
const normStage = (s) => (s === 'offer-issued' ? 'unconditional-offer' : (APP_STAGES.includes(s) ? s : 'received'));
const stamp = () => new Date().toISOString();
const clean = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/, DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
function logAdd(rec, by, text, pub) {
  (rec.log = rec.log || []).push({ at: stamp(), by, text, pub: !!pub });
  if (rec.log.length > 200) rec.log.splice(0, rec.log.length - 200);
}
function setStage(rec, stage) { rec.status = stage; rec.statusAt = stamp(); }
const ukDate = (d) => new Date(d.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const newStudentId = () => '27' + String(Math.floor(100000 + Math.random() * 900000));
const unreadFor = (rec, from, seenAt) => (rec.messages || []).filter((m) => m.from === from && (!seenAt || m.at > seenAt)).length;
function pushMessage(rec, from, text) {
  const msgs = (rec.messages = rec.messages || []);
  if (msgs.filter((m) => m.from === from).length >= 60) return false;
  msgs.push({ id: Math.random().toString(36).slice(2, 10), from, text, at: stamp() });
  return true;
}
// What the APPLICANT may see. Never includes scores, private notes or private log lines.
function publicApp(rec, owner) {
  if (!rec) return rec;
  const status = normStage(rec.status);
  const base = { ref: rec.ref, course: rec.course, name: rec.name, preferred: rec.preferred, at: rec.at, status };
  if (!owner) return base;   // the other person only ever gets the basics
  const o = rec.offer;
  return { ...base, where: rec.where, why: rec.why, knows: rec.knows, tea: rec.tea, biscuit: rec.biscuit, dialect: rec.dialect, side: rec.side, pay: rec.pay,
    statusAt: rec.statusAt || null, interview: rec.interview || null,
    offer: o ? { type: o.type, conditions: o.conditions || [], issuedAt: o.issuedAt, respondBy: o.respondBy, response: o.response || null, respondedAt: o.respondedAt || null } : null,
    feedback: rec.feedback || '', studentId: rec.studentId || '',
    messages: rec.messages || [], unread: unreadFor(rec, 'admissions', rec.applicantSeenAt),
    timeline: (rec.log || []).filter((e) => e.pub).map((e) => ({ at: e.at, text: e.text })) };
}
const adminApp = (who, rec) => ({ who, ...rec, status: normStage(rec.status), unread: unreadFor(rec, 'applicant', rec.adminSeenAt) });

async function loadShared(env, user) {   // user = who is asking: applications are sanitised, and only the owner sees their own details
  await migrateAnn(env);
  const out = { membership: {}, contract: {}, application: {}, predictions: await loadPredictions(env) };
  await Promise.all(PEOPLE.flatMap((who) => ['membership', 'contract', 'application'].map(async (kind) => { const v = await getJson(env, kvKey(kind, who)); out[kind][who] = kind === 'application' ? publicApp(v, who === user) : v; })));
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

    // ---- Admissions admin: ONLY Tristan. The check is on the server, so hiding a link or editing the page in a browser changes nothing. ----
    if (url.pathname.startsWith('/api/admin/')) {
      if (user !== 'tristan') return json({ error: 'forbidden' }, 403);
      if (url.pathname === '/api/admin/applications' && request.method === 'GET') {
        const applications = (await Promise.all(PEOPLE.map(async (who) => { const rec = await getJson(env, kvKey('application', who)); return rec ? adminApp(who, rec) : null; })))
          .filter(Boolean).sort((a, b) => String(b.at).localeCompare(String(a.at)));
        return json({ applications });
      }
      if (url.pathname === '/api/admin/application' && request.method === 'POST') {
        const body = await readBody(request);
        if (!body || !PEOPLE.includes(body.who)) return json({ error: 'unknown applicant' }, 400);
        const rec = await getJson(env, kvKey('application', body.who));
        if (!rec) return json({ error: 'no application' }, 404);
        const st = normStage(rec.status), bad = (m, c = 400) => json({ error: m }, c);
        switch (body.action) {
          case 'stage': {   // move between received and under review
            if (!OPEN_STAGES.includes(st) || !['received', 'under-review'].includes(body.stage)) return bad('not allowed now', 409);
            if (st !== body.stage) { setStage(rec, body.stage); logAdd(rec, 'admissions', body.stage === 'under-review' ? 'Application under review' : 'Returned to received', body.stage === 'under-review'); }
            break;
          }
          case 'assess': {
            const keys = ['motivation', 'tea', 'biscuit', 'dialect'], scores = {};
            for (const k of keys) { const n = Number(body.scores && body.scores[k]); scores[k] = Number.isInteger(n) && n >= 0 && n <= 5 ? n : null; }
            rec.assessment = { scores, comment: clean(body.comment, 1000), at: stamp() };
            logAdd(rec, 'admissions', 'Assessment saved (' + keys.reduce((t, k) => t + (scores[k] || 0), 0) + '/20)', false);
            break;
          }
          case 'interview': {
            if (!OPEN_STAGES.includes(st)) return bad('not allowed now', 409);
            const at = clean(body.at, 16); if (!DATETIME_RE.test(at)) return bad('date and time required');
            rec.interview = { at, format: clean(body.format, 40) || 'Video call', details: clean(body.details, 400) };
            setStage(rec, 'interview'); logAdd(rec, 'admissions', 'Interview scheduled for ' + ukDate(at) + ' at ' + at.slice(11), true);
            break;
          }
          case 'decide': {
            if (!OPEN_STAGES.includes(st)) return bad('not allowed now', 409);
            const d = body.decision; if (![...OFFER_STAGES, 'unsuccessful'].includes(d)) return bad('bad decision');
            rec.feedback = clean(body.feedback, 600);
            if (d === 'unsuccessful') { rec.offer = null; setStage(rec, d); logAdd(rec, 'admissions', 'Decision: unsuccessful', true); break; }
            const respondBy = clean(body.respondBy, 10); if (!DATE_RE.test(respondBy)) return bad('respond-by date required');
            const conditions = d === 'conditional-offer' ? (Array.isArray(body.conditions) ? body.conditions : []).map((c) => clean(c, 140)).filter(Boolean).slice(0, 10) : [];
            if (d === 'conditional-offer' && !conditions.length) return bad('at least one condition');
            rec.offer = { type: d === 'conditional-offer' ? 'conditional' : 'unconditional', conditions, issuedAt: stamp(), respondBy };
            setStage(rec, d); logAdd(rec, 'admissions', 'Offer issued (' + rec.offer.type + '). Please reply by ' + ukDate(respondBy), true);
            break;
          }
          case 'reopen': {   // withdraw an unanswered offer or a refusal, back to review
            if (!(OFFER_STAGES.includes(st) && !(rec.offer && rec.offer.response)) && st !== 'unsuccessful') return bad('not allowed now', 409);
            rec.offer = null; rec.feedback = ''; setStage(rec, 'under-review'); logAdd(rec, 'admissions', 'Decision withdrawn. Application back under review', true);
            break;
          }
          case 'conditions-met': {
            if (st !== 'accepted') return bad('not allowed now', 409);
            setStage(rec, 'enrolled'); rec.studentId = rec.studentId || newStudentId();
            logAdd(rec, 'admissions', 'Conditions confirmed. Enrolled. Student number ' + rec.studentId + ' issued', true);
            break;
          }
          case 'note': rec.note = clean(body.note, 1000); logAdd(rec, 'admissions', 'Private note updated', false); break;
          case 'message': {
            const text = clean(body.text, 1000); if (!text) return bad('message required');
            if (!pushMessage(rec, 'admissions', text)) return bad('too many messages', 429);
            rec.adminSeenAt = stamp(); logAdd(rec, 'admissions', 'Message sent to applicant', false);
            break;
          }
          case 'seen': rec.adminSeenAt = stamp(); break;
          default: return bad('unknown action');
        }
        await env.BESTIES_KV.put(kvKey('application', body.who), JSON.stringify(rec));
        return json({ ok: true, application: adminApp(body.who, rec) });
      }
      return json({ error: 'not found' }, 404);
    }

    if (url.pathname === '/api/shared' && request.method === 'GET') return json({ user, shared: await loadShared(env, user) });
    if (url.pathname === '/api/membership' && request.method === 'POST') {
      const body = await readBody(request);
      if (!body || !PLANS_ALLOWED.includes(body.plan)) return json({ error: 'plan not accepted' }, 400);
      if (!(await getJson(env, kvKey('membership', user))))   // locked once chosen
        await env.BESTIES_KV.put(kvKey('membership', user), JSON.stringify({ plan: body.plan, at: new Date().toISOString() }));
      return json({ ok: true, shared: await loadShared(env, user) });
    }
    if (url.pathname === '/api/contract' && request.method === 'POST') {
      await migrateAnn(env);
      if (!(await getJson(env, kvKey('membership', user)))) return json({ error: 'choose a membership first' }, 403);
      const body = await readBody(request);
      const name = String((body && body.name) || '').trim().slice(0, 60);
      if (!name) return json({ error: 'name required' }, 400);
      if (!(await getJson(env, kvKey('contract', user))))     // you can only ever sign your own half, once; the date is stamped here
        await env.BESTIES_KV.put(kvKey('contract', user), JSON.stringify({ name, date: today(), at: new Date().toISOString() }));
      return json({ ok: true, shared: await loadShared(env, user) });
    }
    if (url.pathname === '/api/application' && request.method === 'POST') {   // University of Besties: one application per person, locked once sent
      if (Date.now() >= Date.parse('2026-12-28T00:00:00Z')) return json({ error: 'closed' }, 403);   // closes end of 27 Dec 2026
      const body = await readBody(request);
      const t = (v, n) => String((body && v) || '').trim().slice(0, n);
      const name = t(body && body.name, 80), why = t(body && body.why, 800), course = t(body && body.course, 40);
      if (!name || !why || !/^[a-z0-9-]{1,40}$/.test(course)) return json({ error: 'name and reason required' }, 400);
      let rec = await getJson(env, kvKey('application', user));
      if (!rec) {
        const ref = 'UOB-27-' + user.slice(0, 1).toUpperCase() + String(Math.floor(1000 + Math.random() * 9000));
        rec = { ref, course, name, preferred: t(body.preferred, 40), where: t(body.where, 80), why, knows: t(body.knows, 80), tea: t(body.tea, 60),
          biscuit: t(body.biscuit, 60), dialect: t(body.dialect, 200), side: t(body.side, 40), pay: t(body.pay, 60), status: 'received', at: new Date().toISOString() };
        logAdd(rec, 'applicant', 'Application submitted', true);
        await env.BESTIES_KV.put(kvKey('application', user), JSON.stringify(rec));
      }
      return json({ ok: true, application: publicApp(rec, true), shared: await loadShared(env, user) });
    }
    if (url.pathname === '/api/application/respond' && request.method === 'POST') {   // accept or decline an offer, once
      const body = await readBody(request);
      const rec = await getJson(env, kvKey('application', user));
      if (!rec) return json({ error: 'no application' }, 404);
      const st = normStage(rec.status);
      if (!OFFER_STAGES.includes(st) || !rec.offer || rec.offer.response) return json({ error: 'nothing to respond to' }, 409);
      if (rec.offer.respondBy && Date.now() >= Date.parse(rec.offer.respondBy + 'T00:00:00Z') + 86400000) return json({ error: 'expired' }, 403);
      const accept = body && body.response === 'accept', decline = body && body.response === 'decline';
      if (!accept && !decline) return json({ error: 'bad response' }, 400);
      rec.offer.response = accept ? 'accepted' : 'declined'; rec.offer.respondedAt = stamp();
      if (decline) {
        setStage(rec, 'declined'); rec.declineReason = clean(body.reason, 300);
        logAdd(rec, 'applicant', 'Offer declined', true);
      } else if (st === 'unconditional-offer') {
        setStage(rec, 'enrolled'); rec.studentId = newStudentId();
        logAdd(rec, 'applicant', 'Offer accepted', true); logAdd(rec, 'system', 'Enrolled. Student number ' + rec.studentId + ' issued', true);
      } else {
        setStage(rec, 'accepted'); logAdd(rec, 'applicant', 'Conditional offer accepted. Conditions to be confirmed', true);
      }
      await env.BESTIES_KV.put(kvKey('application', user), JSON.stringify(rec));
      return json({ ok: true, application: publicApp(rec, true) });
    }
    if (url.pathname === '/api/application/message' && request.method === 'POST') {
      const body = await readBody(request); const text = clean(body && body.text, 1000);
      const rec = await getJson(env, kvKey('application', user));
      if (!rec) return json({ error: 'no application' }, 404);
      if (!text) return json({ error: 'message required' }, 400);
      if (!pushMessage(rec, 'applicant', text)) return json({ error: 'too many messages' }, 429);
      rec.applicantSeenAt = stamp(); logAdd(rec, 'applicant', 'Message from applicant', false);
      await env.BESTIES_KV.put(kvKey('application', user), JSON.stringify(rec));
      return json({ ok: true, application: publicApp(rec, true) });
    }
    if (url.pathname === '/api/application/seen' && request.method === 'POST') {
      const rec = await getJson(env, kvKey('application', user));
      if (rec) { rec.applicantSeenAt = stamp(); await env.BESTIES_KV.put(kvKey('application', user), JSON.stringify(rec)); }
      return json({ ok: true });
    }
    if (url.pathname === '/api/prediction' && request.method === 'POST') {
      const body = await readBody(request);
      const id = body && String(body.id || '');
      if (!/^[a-z0-9_-]{1,40}$/.test(id) || typeof body.checked !== 'boolean') return json({ error: 'bad prediction' }, 400);
      const rec = await loadPredictions(env);
      if (body.checked) { if (Object.keys(rec).length >= 200 && !rec[id]) return json({ error: 'too many' }, 400); rec[id] = { by: user, at: new Date().toISOString() }; }
      else delete rec[id];
      await env.BESTIES_KV.put(predKey(), JSON.stringify(rec));
      return json({ ok: true, shared: await loadShared(env, user) });
    }
    if (url.pathname === '/api/data' && request.method === 'GET') {
      const raw = await env.BESTIES_KV.get('user:' + user);
      return json({ user, data: raw ? JSON.parse(raw) : null, shared: await loadShared(env, user) });
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
