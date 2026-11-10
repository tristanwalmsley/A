/* ==========================================================================
   fx_kit.js - the shared toolkit behind the big animations (home eggs, Prestige I reel, and anything after).
   Load it BEFORE home_eggs.js and home_secrets_reel.js.

   FxKit.createRun(stageElement) gives you a "run": a little set of helpers tied to one stage.
     r.wait(ms) / r.later(fn,ms) / r.every(fn,ms) / r.tween(ms,fn)   timing that all stop together when r.abort() is called
     r.el(cls,text,parent)    make a node in the stage (collected, so r.sweep() can fade the lot away at the end of a scene)
     r.raw(cls,text,parent)   same but NOT collected (for things that must outlive a scene)
     r.fx(node,ms)            drop a node in the stage and remove it after ms
     r.sparks / r.ringAt / r.flash / r.quake / r.glitch / r.hearts / r.word / r.big / r.sub / r.cap
     r.tone / r.bell / r.noise / r.chip   sound (silent once the run is aborted)
     r.orbOn / r.orbGo / r.orbOff / r.press / r.ripple   the firefly that stands in for her finger
   FxKit.music(name[, immediate]) / FxKit.stopMusic()   a little sequencer (music-box arpeggios + pad + melody) driven by FxKit.PIECES.
   To write a new piece: FxKit.PIECES.mything = { tempo, prog:[chords], mel:[[8 slots per bar]], arp, melVol, pad, bass, ... }
   ========================================================================== */
window.FxKit = (function(){
  'use strict';
  const DEAD = { dead:true };
  const reduced = () => { try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
  const mk = (cls, text, parent) => { const e = document.createElement('div'); if(cls) e.className = cls; if(text != null) e.textContent = text; if(parent) parent.appendChild(e); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]));

  const CSS = `
.fk-layer{position:fixed;inset:0;z-index:4800;background:radial-gradient(ellipse at 50% 40%,color-mix(in srgb,var(--brown,#7a5230) 50%,#0a0402),color-mix(in srgb,var(--deep,#3a2010) 72%,#050201) 85%);opacity:0;transition:opacity .5s;cursor:pointer}
.fk-layer.on{opacity:1}
.fk-live{position:absolute;inset:0}
.fk-stage *{box-sizing:border-box}
.fk-stage{position:absolute;inset:0;overflow:hidden;font-family:'EB Garamond',Georgia,serif;color:#fff3d6}
.fk-stage.fk-quake{animation:fkQuake .45s ease-in-out}
@keyframes fkQuake{0%,100%{transform:translate(0,0)}20%{transform:translate(-7px,4px)}40%{transform:translate(6px,-5px)}60%{transform:translate(-4px,3px)}80%{transform:translate(3px,-2px)}}
.fk-stage.fk-glitch{animation:fkGlitch .5s steps(2) 1}
@keyframes fkGlitch{0%{filter:none}25%{filter:hue-rotate(90deg) saturate(2);transform:translate(-5px,0)}50%{transform:translate(6px,0) skewX(4deg)}75%{filter:hue-rotate(-90deg)}100%{filter:none;transform:none}}
.fk-ring{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:3px solid var(--c,#ffd76a);box-shadow:0 0 22px var(--c,#ffd76a),inset 0 0 18px var(--c,#ffd76a);opacity:.95;pointer-events:none;z-index:55;animation:fkRing 1.5s cubic-bezier(.1,.7,.3,1) forwards}
@keyframes fkRing{to{transform:scale(var(--sc,30));opacity:0}}
.fk-flash{position:absolute;inset:0;z-index:58;pointer-events:none;background:radial-gradient(circle at 50% 46%,#fff 0%,rgba(255,226,140,.8) 30%,transparent 70%);opacity:0;animation:fkFlash 1.1s ease-out}
@keyframes fkFlash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}
.fk-spark{position:absolute;z-index:56;pointer-events:none;color:#ffe9a0;font-size:1.15rem;line-height:1;transform:translate(-50%,-50%);animation:fkSpark 1s ease-out forwards}
@keyframes fkSpark{to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(var(--fr,0deg)) scale(.4);opacity:0}}
.fk-word{position:absolute;z-index:57;pointer-events:none;font-family:'Caveat',cursive;font-weight:700;font-size:2.2rem;line-height:1;transform:translate(-50%,-50%);animation:fkWord 1.1s ease-out forwards;text-shadow:0 0 12px rgba(0,0,0,.5)}
@keyframes fkWord{0%{opacity:0;transform:translate(-50%,-30%) scale(.5)}20%{opacity:1;transform:translate(-50%,-70%) scale(1.2)}100%{opacity:0;transform:translate(-50%,-190%) scale(1)}}
.fk-big{position:absolute;left:0;right:0;z-index:60;text-align:center;font-family:'Caveat',cursive;font-weight:700;line-height:1.05;color:#fff3d6;opacity:0;transform:scale(.6);animation:fkPop 1s cubic-bezier(.2,1.5,.4,1) forwards;animation-delay:var(--d,0s);text-shadow:0 0 18px rgba(255,214,120,.8),0 0 40px rgba(255,180,80,.5)}
@keyframes fkPop{to{opacity:1;transform:scale(1)}}
.fk-sub{position:absolute;left:0;right:0;z-index:60;text-align:center;font-style:italic;font-size:clamp(.95rem,3.4vw,1.25rem);opacity:0;animation:fkRise 1s ease forwards;animation-delay:var(--d,0s);padding:0 8vw;color:#fff3d6}
@keyframes fkRise{from{opacity:0;transform:translateY(14px)}to{opacity:.92;transform:none}}
.fk-cap{position:absolute;left:0;right:0;bottom:7%;z-index:90;text-align:center;padding:0 1.5rem;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.05rem,3.6vw,1.5rem);color:#f3e6c8;text-shadow:0 2px 14px rgba(0,0,0,.75),0 0 18px rgba(232,185,90,.45);opacity:0;transition:opacity .45s;letter-spacing:.5px;pointer-events:none}
.fk-orb{position:absolute;z-index:80;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:radial-gradient(circle,#fff8d6 0,rgba(255,215,106,.55) 55%,rgba(255,215,106,0) 72%);box-shadow:0 0 22px 7px rgba(255,215,106,.45);pointer-events:none;transition:opacity .45s,transform .12s;animation:fkOrbIn .4s ease}
@keyframes fkOrbIn{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}
.fk-orb.down{transform:scale(.7)}
.fk-ripple{position:absolute;z-index:80;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid rgba(255,243,196,.9);box-shadow:0 0 14px rgba(255,215,106,.6);pointer-events:none;animation:fkRip .85s ease-out forwards}
.fk-ripple.big{border-width:3px;animation-name:fkRipBig;animation-duration:1.1s}
@keyframes fkRip{from{transform:scale(.3);opacity:1}to{transform:scale(4.5);opacity:0}}
@keyframes fkRipBig{from{transform:scale(.3);opacity:1}to{transform:scale(9);opacity:0}}
`;
  let cssDone = false;
  function injectCSS(){ if(cssDone) return; cssDone = true; const st = document.createElement('style'); st.id = 'fk-css'; st.textContent = CSS; document.head.appendChild(st); }

  /* ------------------------------------------------------------------ sound */
  let actx = null, master = null;
  function ac(){
    try{
      if(!actx){
        actx = new (window.AudioContext || window.webkitAudioContext)();
        master = actx.createGain(); master.gain.value = 1;
        const comp = actx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
        master.connect(comp); comp.connect(actx.destination);
      }
      if(actx.state === 'suspended') actx.resume();
      return actx;
    }catch(e){ return null; }
  }
  const audioReady = () => !!actx && actx.state === 'running';
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function toneAt(freq, t, dur, type, vol, glideTo){
    const c = actx; if(!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if(glideTo) o.frequency.linearRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function bellAt(m, t, vol, len){
    const f = mtof(m); len = len || 1.8;
    toneAt(f, t, len, 'sine', vol); toneAt(f * 2.756, t, len * 0.4, 'sine', vol * 0.22); toneAt(f * 5.4, t, len * 0.15, 'sine', vol * 0.08);
  }
  function noiseAt(dur, vol, f0, f1, t){
    const c = actx; if(!c) return;
    const n = Math.max(1, Math.floor(c.sampleRate * dur)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(f0, t); if(f1) f.frequency.linearRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(0.05, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  function padAt(freq, t, dur, vol){
    const c = actx; if(!c) return;
    const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = freq; o.detune.value = (Math.random() - 0.5) * 10;
    fl.type = 'lowpass'; fl.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.8); g.gain.setValueAtTime(vol, t + dur - 0.9); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
    o.connect(fl); fl.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.7);
  }
  const unmute = () => { if(master && actx){ try{ master.gain.cancelScheduledValues(actx.currentTime); master.gain.setValueAtTime(1, actx.currentTime); }catch(e){} } };

  /* ------------------------------------------------------------------ the sequencer + pieces */
  const CH = {   // chords as midi notes, low to high
    C:[48,52,55,60], Cmaj7:[48,52,55,59], Am7:[45,48,52,55], Am:[45,48,52,57], Fmaj7:[41,45,48,52], F:[41,45,48,53], G:[43,47,50,55], Em:[40,43,47,52], Dm:[50,53,57,62],
    Dmaj7:[50,54,57,61], D:[50,54,57,62], Bm7:[47,50,54,57], Bm:[47,50,54,59], Gmaj7:[43,47,50,54], A:[45,49,52,57]
  };
  const ARP = [0, 1, 2, 3, 2, 1, 3, 2];
  const PIECES = {};   // each home file adds its own pieces here
  const M = { on:false, step:0, next:0, bar0:0, timer:null, pending:null, tempo:66, prog:[CH.C], mel:null, arp:0, melVol:0, pad:0, bass:0, bass2:false, tick:0, chip:false };
  function playStep(step, t){
    const bar = Math.floor(step / 8), s = step % 8;
    if(s === 0 && M.pending){ Object.assign(M, M.pending); M.pending = null; M.bar0 = bar; }
    const b = bar - M.bar0, len = M.prog.length, ch = M.prog[((b % len) + len) % len], e = 30 / M.tempo;
    if(s === 0){
      if(M.pad) ch.forEach(m => padAt(mtof(m), t, e * 8, M.pad));
      if(M.bass) toneAt(mtof(ch[0] - 12), t, e * 7, M.chip ? 'triangle' : 'sine', M.bass);
    }
    if(s === 4 && M.bass2 && M.bass) toneAt(mtof(ch[0] - 12), t, e * 3, M.chip ? 'triangle' : 'sine', M.bass * 0.8);
    if(M.arp){
      const f = mtof(ch[ARP[s]] + 12);
      if(M.chip) toneAt(f, t, e * 0.9, 'square', M.arp);
      else { toneAt(f, t, 0.9, 'triangle', M.arp); toneAt(f * 2, t, 0.35, 'sine', M.arp * 0.4); }
    }
    if(M.mel && M.melVol){
      const row = M.mel[((b % M.mel.length) + M.mel.length) % M.mel.length];
      if(row && row[s] != null){ if(M.chip) toneAt(mtof(row[s]), t, e * 1.6, 'square', M.melVol); else bellAt(row[s], t, M.melVol, 1.7); }
    }
    if(M.tick && s % 2 === 0) toneAt(s % 4 === 0 ? 1800 : 1300, t, 0.04, 'square', M.tick);
  }
  function seqTick(){
    const c = actx; if(!c || !M.on) return;
    while(M.next < c.currentTime + 0.35){ playStep(M.step, M.next); M.next += 30 / M.tempo; M.step++; }
  }
  function music(name, immediate){
    const c = ac(); if(!c) return;
    const P = typeof name === 'string' ? PIECES[name] : name; if(!P) return;
    const cfg = { tempo:P.tempo, prog:P.prog, mel:P.mel, arp:P.arp || 0, melVol:P.melVol || 0, pad:P.pad || 0, bass:P.bass || 0, bass2:!!P.bass2, tick:P.tick || 0, chip:!!P.chip };
    if(!M.on){ Object.assign(M, cfg); M.on = true; M.step = 0; M.bar0 = 0; M.pending = null; M.next = c.currentTime + 0.15; M.timer = setInterval(seqTick, 80); }
    else if(immediate){ Object.assign(M, cfg); M.bar0 = Math.floor(M.step / 8); M.pending = null; }
    else M.pending = cfg;
  }
  function stopMusic(fadeSec){
    clearInterval(M.timer); M.timer = null; M.on = false; M.pending = null;
    if(actx && master){ try{ const t = actx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + (fadeSec || 1.2)); }catch(e){} }
  }

  /* ------------------------------------------------------------------ a run: helpers tied to one stage */
  function createRun(stage){
    injectCSS();
    stage.classList.add('fk-stage');
    const r = { stage, dead:false, pending:new Set(), timers:new Set(), collect:[], capT:null, capEl:null };
    r.W = () => stage.clientWidth; r.H = () => stage.clientHeight;
    r.wait = ms => new Promise((res, rej) => {
      if(r.dead) return rej(DEAD);
      const p = { rej }; p.t = setTimeout(() => { r.pending.delete(p); res(); }, ms); r.pending.add(p);
    });
    r.later = (fn, ms) => { const t = setTimeout(() => { if(r.dead) return; try{ fn(); }catch(e){ console.warn('[fx]', e); } }, ms); r.timers.add(t); return t; };
    r.every = (fn, ms) => { const t = setInterval(() => { if(!r.dead) fn(); }, ms); r.timers.add(t); return t; };
    r.stopEvery = t => { clearInterval(t); r.timers.delete(t); };
    r.tween = (ms, f) => new Promise((res, rej) => {
      if(r.dead) return rej(DEAD);
      const t0 = performance.now();
      const step = now => { if(r.dead) return rej(DEAD); const p = Math.min(1, (now - t0) / ms); f(p); if(p < 1) requestAnimationFrame(step); else res(); };
      requestAnimationFrame(step);
    });
    r.nextFrame = () => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
    r.abort = () => {
      if(r.dead) return; r.dead = true;
      r.pending.forEach(p => { clearTimeout(p.t); p.rej(DEAD); }); r.pending.clear();
      r.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); r.timers.clear();
    };
    // nodes
    r.raw = (cls, text, parent) => { const e = mk(cls, text); (parent || stage).appendChild(e); return e; };
    r.el = (cls, text, parent) => { const e = r.raw(cls, text, parent); r.collect.push(e); return e; };
    r.fx = (node, ms) => { stage.appendChild(node); setTimeout(() => node.remove(), ms || 2000); return node; };
    // fade nodes away. Elements held by an animation (fill-mode forwards) ignore inline opacity, so freeze their look first.
    r.fade = (nodes, ms) => {
      const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
      list.forEach(n => { try{ const cs = getComputedStyle(n); n.style.transition = 'none'; n.style.opacity = cs.opacity; if(cs.transform && cs.transform !== 'none') n.style.transform = cs.transform; n.style.animation = 'none'; }catch(e){} });
      if(list[0]) void list[0].offsetWidth;
      list.forEach(n => { n.style.transition = 'opacity ' + (ms || 800) + 'ms'; n.style.opacity = '0'; setTimeout(() => n.remove(), (ms || 800) + 80); });
    };
    r.sweep = async ms => { const list = r.collect.splice(0).filter(n => n.isConnected); r.fade(list, ms || 800); await r.wait((ms || 800) + 100); };
    // captions
    r.cap = text => {
      if(!r.capEl){ r.capEl = mk('fk-cap'); stage.appendChild(r.capEl); }
      const e = r.capEl; clearTimeout(r.capT); e.style.opacity = '0';
      if(!text) return;
      r.capT = setTimeout(() => { if(r.dead) return; e.textContent = text; e.style.opacity = '1'; }, 400);
    };
    // sound (silent when the run is over)
    r.tone = (freq, at, dur, type, vol, glide) => { const c = ac(); if(!c || r.dead) return; toneAt(freq, c.currentTime + (at || 0), dur, type, vol, glide); };
    r.chip = (freq, at, dur, vol) => r.tone(freq, at, dur || 0.1, 'square', vol || 0.06);
    r.bell = (m, at, vol, len) => { const c = ac(); if(!c || r.dead) return; bellAt(m, c.currentTime + (at || 0), vol == null ? 0.12 : vol, len); };
    r.noise = (dur, vol, f0, f1, at) => { const c = ac(); if(!c || r.dead) return; noiseAt(dur, vol, f0, f1 || 0, c.currentTime + (at || 0)); };
    r.thud = (vol, pitch) => { r.tone(pitch || 110, 0, 0.3, 'sine', vol || 0.4, 42); r.noise(0.18, (vol || 0.4) * 0.5, 400, 120); };
    // effects
    r.sparks = (x, y, n, glyphs) => {
      for(let i = 0; i < n; i++){
        const s = mk('fk-spark', glyphs[i % glyphs.length]), a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 100;
        s.style.left = x + 'px'; s.style.top = y + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px'); s.style.setProperty('--fr', (Math.random() * 540 - 270) + 'deg');
        r.fx(s, 1100);
      }
    };
    r.hearts = (x, y, n) => r.sparks(x, y, n || 10, ['♡', '💗', '♡', '✨']);
    r.ringAt = (x, y, color, sc) => { const g = mk('fk-ring'); g.style.left = x + 'px'; g.style.top = y + 'px'; if(color) g.style.setProperty('--c', color); if(sc) g.style.setProperty('--sc', sc); r.fx(g, 1600); };
    r.flash = () => r.fx(mk('fk-flash'), 1200);
    const pulse = (cls, ms) => { stage.classList.remove(cls); void stage.offsetWidth; stage.classList.add(cls); r.later(() => stage.classList.remove(cls), ms); };
    r.quake = () => pulse('fk-quake', 480);
    r.glitch = () => pulse('fk-glitch', 520);
    r.word = (txt, x, y, color) => { const w = mk('fk-word', txt); w.style.left = x + 'px'; w.style.top = y + 'px'; if(color) w.style.color = color; r.fx(w, 1200); };
    r.big = (txt, top, size, delay) => { const t = r.el('fk-big', txt); t.style.top = top; t.style.fontSize = size; t.style.setProperty('--d', (delay || 0) + 's'); return t; };
    r.sub = (txt, top, delay) => { const t = r.el('fk-sub', txt); t.style.top = top; t.style.setProperty('--d', (delay || 0) + 's'); return t; };
    r.confetti = () => { try{ if(typeof window.launchConfetti === 'function') window.launchConfetti(); }catch(e){} };
    r.heartBurst = () => { try{ if(typeof window.launchHeartBurst === 'function') window.launchHeartBurst(); }catch(e){} };
    // typed text: call tick(i) for every character
    r.type = async (node, str, ms, tick) => { for(let i = 0; i < str.length; i++){ node.textContent += str[i]; if(tick) tick(i, str[i]); await r.wait(ms); } };
    // the firefly
    r.orbOn = (x, y) => { const o = r.el('fk-orb'); o.style.left = x + 'px'; o.style.top = y + 'px'; return o; };
    r.orbGo = (o, x, y, ms) => { o.style.transition = 'opacity .45s,transform .12s,left ' + ms + 'ms ease-in-out,top ' + ms + 'ms ease-in-out'; o.style.left = x + 'px'; o.style.top = y + 'px'; return r.wait(ms); };
    r.orbOff = o => { o.style.opacity = '0'; setTimeout(() => o.remove(), 520); };
    r.ripple = (x, y, bigOne) => { const g = mk('fk-ripple' + (bigOne ? ' big' : '')); g.style.left = x + 'px'; g.style.top = y + 'px'; r.fx(g, 1200); };
    r.press = (o, x, y, pitch, bigOne) => { if(o){ o.classList.add('down'); r.later(() => o.classList.remove('down'), 140); } r.ripple(x, y, bigOne); r.tone(pitch || 660, 0, 0.1, 'triangle', 0.1); };
    return r;
  }

  // a colour from the active site theme (css/theme.js), with a fallback. Use it for anything drawn from JS so seasons restyle it too.
  const FALLBACK = { '--gold':'#c8943a', '--gold-light':'#e8b95a', '--rose':'#b86858', '--sage':'#7a9870', '--brown':'#7a5230', '--deep':'#3a2010', '--paper':'#fffdf5', '--cream':'#faf4e8', '--tan':'#d4b483' };
  const col = name => { try{ const v = window.SiteTheme && window.SiteTheme.color(name); if(v) return v; }catch(e){} return FALLBACK[name] || '#ffd76a'; };

  // plays ONE moment (an async function(run, anchor)) on a full-screen themed layer over the page, then calls done().
  // Click (after a moment) or Escape skips it. Returns { finish } so callers can end it early.
  function playLive(moment, anchor, done){
    const fin = typeof done === 'function' ? done : () => {};
    if(reduced()){ fin(); return { finish(){} }; }
    injectCSS();
    const layer = mk('fk-layer'); document.body.appendChild(layer);
    const stage = mk('fk-live', null, layer);
    const r = createRun(stage);
    ac(); unmute();
    requestAnimationFrame(() => layer.classList.add('on'));
    const t0 = performance.now(); let over = false;
    const onKey = e => { if(e.key === 'Escape') finish(); };
    const finish = () => {
      if(over) return; over = true;
      r.abort(); window.removeEventListener('keydown', onKey); stopMusic(0.5);
      layer.classList.remove('on'); setTimeout(() => { layer.remove(); fin(); }, 480);
    };
    layer.addEventListener('click', () => { if(performance.now() - t0 > 1800) finish(); });
    window.addEventListener('keydown', onKey);
    moment(r, anchor).then(() => finish(), e => { if(e !== DEAD) console.warn('[fx] moment failed', e); finish(); });
    return { finish };
  }

  return { DEAD, reduced, mk, rnd, esc, col, createRun, playLive, injectCSS, ac, audioReady, unmute, mtof, music, stopMusic, PIECES, CH, toneAt, bellAt };
})();
