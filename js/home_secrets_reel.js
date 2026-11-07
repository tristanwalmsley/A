/* ==========================================================================
   home_secrets_reel.js - the Prestige I celebration for the Secret Keeper badge (the nine home-page eggs).
   Needs fx_kit.js and home_eggs.js loaded first. Loaded before home.js, which calls:
       HomeSecretsReel.play(overlay, next)
   - overlay = the celebration overlay      - next() = carries on (the next page's secrets animation, or the medal)

   The nine eggs are replayed as one piece, using the SAME moments the page plays live (home_eggs.js), so editing a moment there
   changes it in both places. For each egg a miniature prop is built, the firefly (standing in for her finger) triggers it the way she
   did, then the real moment plays and an egg hatches into the tray of nine slots at the top.
   Order: postmark, signature, logo, konami code, "ann", "tristan", the envelope, the stamp, the shy heart.
   Finale: the nine eggs become a perforated sheet of stamps, a giant postmark cancels the whole sheet, SECRET KEEPER is stamped across
   it, and a short note follows. No buttons; Escape skips to the end. Reduced motion falls back to a quick ring (home.js handles that).
   Music: its own score (PIECES at the top: music-box theme in C major, a chiptune section for the konami code).
   To change wording: captions are r.cap('...'), the note is NOTE_LINES, the stamp labels are STAMPS.
   ========================================================================== */
(function(){
  'use strict';
  const K = window.FxKit, HE = window.HomeEggs, DEAD = K.DEAD, mk = K.mk, rnd = K.rnd, CH = K.CH;
  const U = HE.util;

  const STAMPS = [['\ud83d\udcee', 'Postmark'], ['\u2712\ufe0f', 'Signature'], ['\ud83d\udd0d', 'Letterhead'], ['\ud83c\udfae', 'Secret code'], ['\ud83d\udcac', 'Your name'], ['\ud83d\udc4b', 'Hi, it\u2019s me'], ['\u2709\ufe0f', 'Special delivery'], ['\ud83d\udcec', 'Mailed it'], ['\ud83d\udc97', 'Shy heart']];
  const NOTE_LINES = [
    ['nine secrets.', 2400],
    ['a postmark, a password, one very shy little heart.', 3800],
    ['I tucked every one of them into a page that was only ever meant to say hello.', 4400],
    ['and you went through all of it. poking, typing, chasing.', 3800],
    ['you really are the keeper of everything I hide, Ann.', 4400],
    ['and I am nowhere near done hiding things.', 4200]
  ];

  /* ------------------------------------------------------------------ the score (C major, music-box) */
  K.PIECES.hs_quiet  = { tempo:64,  prog:[CH.Cmaj7, CH.Am7, CH.Fmaj7, CH.G], arp:0.045, melVol:0.10, pad:0.020, bass:0.10,
    mel:[[76,null,79,null,83,null,79,null],[81,null,79,null,76,null,72,null],[77,null,81,null,84,null,81,77],[79,null,74,null,79,null,null,null]] };
  K.PIECES.hs_play   = { tempo:100, prog:[CH.C, CH.G, CH.Am, CH.F], arp:0.045, melVol:0.12, pad:0.018, bass:0.12, bass2:true,
    mel:[[72,76,null,79,null,76,72,null],[74,79,null,83,null,79,74,null],[76,81,null,84,null,81,76,null],[77,81,null,84,null,81,77,79]] };
  K.PIECES.hs_chip   = { tempo:124, prog:[CH.Am, CH.F, CH.C, CH.G], arp:0.032, melVol:0.05, pad:0, bass:0.09, bass2:true, chip:true,
    mel:[[81,null,84,null,81,null,76,null],[77,null,81,null,84,null,81,null],[79,null,84,null,79,null,76,null],[83,null,79,null,74,null,79,null]] };
  K.PIECES.hs_tender = { tempo:58,  prog:[CH.Fmaj7, CH.C, CH.Am7, CH.G], arp:0.035, melVol:0.13, pad:0.026, bass:0.10,
    mel:[[77,null,81,null,84,null,81,null],[79,null,76,null,72,null,76,null],[76,null,79,null,81,null,79,76],[74,null,71,null,74,null,null,null]] };
  K.PIECES.hs_gather = { tempo:84,  prog:[CH.Am, CH.F, CH.C, CH.G], arp:0.06, melVol:0.12, pad:0.026, bass:0.14, bass2:true, tick:0.025,
    mel:[[69,null,72,null,76,null,81,null],[72,null,77,null,81,null,84,null],[76,null,79,null,84,null,88,null],[83,null,86,null,83,null,79,null]] };
  K.PIECES.hs_blast  = { tempo:84,  prog:[CH.C, CH.G, CH.Am, CH.F], arp:0.08, melVol:0.17, pad:0.034, bass:0.17, bass2:true,
    mel:[[84,null,79,null,76,null,79,null],[83,null,86,null,83,null,79,null],[84,null,81,null,76,null,81,null],[84,null,81,null,77,null,81,84]] };

  /* ------------------------------------------------------------------ styles */
  const CSS = `
.hs-root{position:absolute;inset:0;z-index:0;pointer-events:none;transition:opacity .9s}
.hs-sky{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,rgba(92,54,24,.62),rgba(18,9,4,.96) 78%);opacity:0;transition:opacity 2.6s}
.hs-sky.on{opacity:1}
.hs-drift{position:absolute;bottom:-3rem;z-index:3;color:#e8c4a0;animation:hsDrift var(--fd) linear forwards;filter:drop-shadow(0 0 6px rgba(232,170,110,.4))}
@keyframes hsDrift{0%{opacity:0;transform:translate(0,0) rotate(var(--r0))}12%{opacity:.5}85%{opacity:.4}100%{opacity:0;transform:translate(var(--sw),-112vh) rotate(var(--r1))}}
.hs-snd{position:absolute;right:1rem;top:1rem;z-index:95;font-family:'Caveat',cursive;font-size:1.15rem;color:rgba(250,244,232,.7);letter-spacing:1px;animation:hsBob 1.6s ease-in-out infinite}
@keyframes hsBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
/* tray of nine */
.hs-tray{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 2.2rem);display:flex;justify-content:center;gap:clamp(.25rem,1.6vw,.6rem);z-index:60;opacity:0;transition:opacity 1.2s}
.hs-tray.on{opacity:1}
.hs-slot{position:relative;width:1.7rem;height:2.05rem;border:1.5px dashed rgba(255,226,160,.38);border-radius:50% 50% 50% 50% / 62% 62% 38% 38%;transition:border-color .6s,box-shadow .6s,background .6s}
.hs-slot.full{border-style:solid;border-color:#ffd76a;background:rgba(255,215,106,.14);box-shadow:0 0 14px rgba(255,215,106,.65)}
.hs-slot i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:1.05rem;opacity:0;transform:scale(.3);transition:opacity .4s,transform .5s cubic-bezier(.34,1.8,.5,1)}
.hs-slot.full i{opacity:1;transform:scale(1)}
.hs-egg{position:absolute;font-size:2.6rem;line-height:1;transform:translate(-50%,-50%);z-index:70;transition:left 1.3s cubic-bezier(.5,0,.2,1),top 1.3s cubic-bezier(.5,0,.2,1),font-size 1.3s ease,opacity .6s;filter:drop-shadow(0 0 14px rgba(255,215,106,.8))}
.hs-egg.pop{animation:hsEggPop .7s cubic-bezier(.34,1.8,.5,1)}
@keyframes hsEggPop{from{transform:translate(-50%,-50%) scale(0)}to{transform:translate(-50%,-50%) scale(1)}}
/* props the firefly performs on */
.hs-prop{position:absolute;z-index:40;transform:translate(-50%,-50%) scale(0);transition:transform .55s cubic-bezier(.34,1.7,.5,1),opacity .6s}
.hs-prop.in{transform:translate(-50%,-50%) scale(1)}
.hs-prop.tap{animation:hsTap .28s ease}
@keyframes hsTap{0%{filter:brightness(1)}40%{filter:brightness(1.7) drop-shadow(0 0 16px #ffd76a);transform:translate(-50%,-50%) scale(1.07)}100%{filter:brightness(1)}}
.hs-pmprop{color:#e8c4a0;filter:drop-shadow(0 0 10px rgba(232,150,110,.4))}
.hs-count{position:absolute;right:-.4rem;top:-.4rem;width:1.8rem;height:1.8rem;border-radius:50%;background:#b86858;color:#fff;font-family:'Caveat',cursive;font-weight:700;font-size:1.3rem;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(0,0,0,.4);opacity:0;transform:scale(.4);transition:opacity .25s,transform .25s}
.hs-count.show{opacity:1;transform:scale(1)}
.hs-sigprop{font-family:'Caveat',cursive;font-weight:700;font-size:clamp(2.2rem,9vw,3.2rem);color:#e7a090;text-shadow:0 0 14px rgba(255,170,130,.4);white-space:nowrap}
.hs-logoprop{text-align:center;font-family:'Playfair Display',serif;font-style:italic;color:#f3e6c8;text-shadow:0 0 14px rgba(255,210,150,.5)}
.hs-logoprop b{display:block;font-size:clamp(1.9rem,8vw,2.8rem);font-weight:700;font-style:normal}
.hs-logoprop span{display:block;font-size:clamp(1.3rem,5.4vw,1.9rem);margin-top:.2rem}
.hs-typed{position:absolute;left:0;right:0;z-index:50;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(2.4rem,10vw,4.2rem);letter-spacing:.14em;color:#fff3d6;text-shadow:0 0 18px rgba(255,214,120,.8);transition:opacity .6s}
.hs-typed.mono{font-family:'Courier New',monospace;font-size:clamp(1.3rem,5.8vw,2rem);letter-spacing:.1em;color:#7dff9a;text-shadow:0 0 10px rgba(125,255,154,.8)}
.hs-typed u{display:inline-block;width:.07em;height:.8em;margin-left:.08em;background:#ffd76a;vertical-align:-.05em;text-decoration:none;animation:hsCur .8s steps(1) infinite}
@keyframes hsCur{50%{opacity:0}}
.hs-env{position:absolute;z-index:42;font-size:2.7rem;line-height:1;transform:translate(-50%,-50%);filter:drop-shadow(0 0 12px rgba(255,220,150,.5))}
.hs-stampprop{position:absolute;z-index:42;width:3rem;aspect-ratio:3/4;background:#fffdf5;border:2px dashed #d4b483;display:flex;align-items:center;justify-content:center;color:#b86858;font-size:1.4rem;transform:translate(-50%,-50%) rotate(-12deg);transition:left 1.1s cubic-bezier(.5,0,.3,1),top 1.1s cubic-bezier(.5,0,.3,1),opacity .5s;box-shadow:0 3px 10px rgba(0,0,0,.4)}
.hs-heartprop{position:absolute;z-index:42;font-size:2.4rem;line-height:1;color:#ff8fb0;text-shadow:0 0 14px #ff5f8f;transform:translate(-50%,-50%);transition:left .6s cubic-bezier(.4,1.5,.5,1),top .6s cubic-bezier(.4,1.5,.5,1),opacity .4s}
/* the stamp sheet */
.hs-stamp{position:absolute;z-index:44;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.25rem;background:#fffdf5;color:#7a5230;border:2.5px dashed #d4b483;box-shadow:0 5px 16px rgba(0,0,0,.45),inset 0 0 0 4px #fffdf5,inset 0 0 0 5px #ecd8b0;opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(var(--r))}
.hs-stamp.in{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(var(--r));transition:transform .45s cubic-bezier(.34,1.8,.5,1),opacity .2s}
.hs-stamp i{font-style:normal;font-size:var(--g);line-height:1}
.hs-stamp span{font-family:'Playfair Display',serif;font-style:italic;font-size:var(--l);text-align:center;line-height:1.1;padding:0 .2rem}
.hs-pmbig{position:absolute;z-index:56;color:#c8553f;mix-blend-mode:normal;filter:drop-shadow(0 0 10px rgba(200,85,63,.5));opacity:0;transform:translate(-50%,-50%) scale(2.4) rotate(-22deg)}
.hs-pmbig.on{animation:hsPmSlam .4s cubic-bezier(.2,1.5,.4,1) forwards}
@keyframes hsPmSlam{to{opacity:.88;transform:translate(-50%,-50%) scale(1) rotate(-12deg)}}
.hs-banner{position:absolute;left:0;right:0;top:var(--bt,calc(46% + 150px));z-index:62;text-align:center;font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:clamp(1.7rem,7.4vw,3.2rem);letter-spacing:.14em;white-space:nowrap;transition:top 1.4s cubic-bezier(.6,0,.3,1)}
.hs-banner span{display:inline-block;opacity:0;transform:translateY(-40px) scale(1.8);background:linear-gradient(180deg,#fff6c8,#e8a92c 60%,#b97a10);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 12px rgba(255,200,80,.8));animation:hsLetter .6s cubic-bezier(.2,1.4,.4,1) forwards;animation-delay:var(--d)}
@keyframes hsLetter{to{opacity:1;transform:none}}
.hs-line{position:absolute;left:0;right:0;top:54%;z-index:62;text-align:center;padding:0 9vw;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.3rem,5.2vw,2.2rem);line-height:1.5;color:#fff3d6;text-shadow:0 2px 16px rgba(0,0,0,.7),0 0 22px rgba(232,185,90,.5);opacity:0;transition:opacity 1s}
.hs-line.in{opacity:1}
.hs-sig{position:absolute;left:0;right:0;top:76%;z-index:62;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(1.8rem,7vw,2.8rem);color:#ffd76a;text-shadow:0 0 16px rgba(255,200,110,.7);opacity:0;transition:opacity 1.6s}
.hs-sig.in{opacity:1}
`;
  let cssDone = false;
  function injectCSS(){ if(cssDone) return; cssDone = true; const st = document.createElement('style'); st.id = 'hs-css'; st.textContent = CSS; document.head.appendChild(st); }

  /* ------------------------------------------------------------------ helpers */
  let R = null, slots = [], tray = null;
  const GLYPHS = ['\u2709', '\u2661', '\u2726', '\u2605', '\u2709', '\u2661'];
  function drift(r, on){
    if(r.driftT) r.stopEvery(r.driftT);
    r.driftT = on ? r.every(() => {
      const d = mk('hs-drift', GLYPHS[Math.floor(Math.random() * GLYPHS.length)]), fd = rnd(8, 14);
      d.style.left = rnd(0, 96) + '%'; d.style.fontSize = rnd(1, 2.2) + 'rem';
      d.style.setProperty('--sw', rnd(-120, 120) + 'px'); d.style.setProperty('--r0', rnd(-30, 30) + 'deg'); d.style.setProperty('--r1', rnd(-60, 60) + 'deg'); d.style.setProperty('--fd', fd + 's');
      r.fx(d, fd * 1000 + 300);
    }, on) : null;
  }
  const slotXY = i => { const s = slots[i].getBoundingClientRect(), b = R.stage.getBoundingClientRect(); return [s.left - b.left + s.width / 2, s.top - b.top + s.height / 2]; };
  const CHIME = [72, 74, 76, 79, 81, 84, 86, 88, 91];
  async function hatch(i, x, y){
    const r = R, e = r.raw('hs-egg pop', '\ud83e\udd5a'); e.style.left = x + 'px'; e.style.top = y + 'px';
    r.sparks(x, y, 10, ['\u2728', '\u2709', '\u2726']); r.flash(); r.bell(CHIME[i] - 12, 0, 0.14, 2.4); r.bell(CHIME[i], 0.12, 0.12, 2);
    await r.wait(1000);
    const p = slotXY(i); e.style.left = p[0] + 'px'; e.style.top = p[1] + 'px'; e.style.fontSize = '1.05rem';
    r.tone(500, 0, 0.5, 'sine', 0.06, 1200);
    await r.wait(1350);
    slots[i].classList.add('full'); e.remove();
    r.bell(CHIME[i] + 12, 0, 0.1, 1.8); r.sparks(p[0], p[1], 6, ['\u2726', '\u2728']);
    r.cap(['one of nine', 'two of nine', 'three of nine', 'four of nine', 'five of nine', 'six of nine', 'seven of nine', 'eight of nine', 'nine of nine'][i]);
    await r.wait(1200);
  }
  const prop = (r, cls, html) => { const e = r.el('hs-prop ' + cls); if(html != null) e.innerHTML = html; return e; };
  const placeAt = (e, x, y) => { e.style.left = x + 'px'; e.style.top = y + 'px'; };
  const tap = e => { e.classList.remove('tap'); void e.offsetWidth; e.classList.add('tap'); };

  /* ------------------------------------------------------------------ the nine scenes: prop + firefly + the real moment + hatch */
  async function s1_postmark(){
    const r = R, W = r.W(), H = r.H(), c = { x:W / 2, y:H * 0.46 };
    K.music('hs_quiet'); r.cap('the first one was a postmark');
    const size = Math.min(W * 0.4, 160), pm = prop(r, 'hs-pmprop'); pm.style.width = pm.style.height = size + 'px'; placeAt(pm, c.x, c.y);
    pm.innerHTML = U.postmarkSVG('FROM THE UK \u2726 WITH LOVE \u2726 ', '', '') + '<div class="hs-count"></div>';
    const cnt = pm.querySelector('.hs-count');
    await r.nextFrame(); pm.classList.add('in'); await r.wait(1800);
    const o = r.orbOn(W * 0.14, H * 0.74); await r.orbGo(o, c.x + 10, c.y + 10, 1500);
    for(let k = 1; k <= 5; k++){
      r.press(o, c.x + 10, c.y + 10, 520 + k * 60, k === 5); tap(pm); cnt.textContent = k; cnt.classList.add('show'); r.bell(72 + k, 0, 0.06, 1);
      await r.wait(k === 5 ? 350 : 520);
    }
    r.orbOff(o); r.cap('');
    r.fade(pm, 500); await r.wait(500);
    await HE.moments.postmark(r, c);
    await r.sweep(900);
    await hatch(0, c.x, c.y);
  }

  async function s2_signature(){
    const r = R, W = r.W(), H = r.H(), c = { x:W / 2, y:H * 0.5 };
    K.music('hs_play'); r.cap('then my signature, double-checked');
    const sg = prop(r, 'hs-sigprop', 'Bestie Tristan'); placeAt(sg, c.x, c.y);
    await r.nextFrame(); sg.classList.add('in'); await r.wait(1800);
    const o = r.orbOn(W * 0.86, H * 0.78); await r.orbGo(o, c.x + 40, c.y + 14, 1500);
    r.press(o, c.x + 40, c.y + 14, 700); tap(sg); await r.wait(170); r.press(o, c.x + 40, c.y + 14, 840, true); tap(sg);
    await r.wait(500); r.orbOff(o); r.cap('');
    r.fade(sg, 500); await r.wait(500);
    await HE.moments.signature(r);
    await r.sweep(900);
    await hatch(1, c.x, c.y);
  }

  async function s3_nav(){
    const r = R, W = r.W(), H = r.H(), c = { x:W / 2, y:H * 0.24 };
    K.music('hs_quiet'); r.cap('then a very suspicious logo');
    const lg = prop(r, 'hs-logoprop', '<b>Tristan &amp; Ann</b><span>besties \u2661</span>'); placeAt(lg, c.x, c.y);
    await r.nextFrame(); lg.classList.add('in'); await r.wait(1800);
    const bx = c.x, by = c.y + 22, o = r.orbOn(W * 0.9, H * 0.6); await r.orbGo(o, bx, by, 1400);
    for(let k = 0; k < 7; k++){ r.press(o, bx + rnd(-6, 6), by + rnd(-4, 4), 480 + k * 45); tap(lg); await r.wait(k < 6 ? 260 : 400); }
    r.orbOff(o); r.cap('');
    r.fade(lg, 500); await r.wait(500);
    await HE.moments.nav(r, { x:bx, y:by });
    await r.sweep(900);
    await hatch(2, W / 2, H * 0.46);
  }

  async function s4_konami(){
    const r = R, W = r.W(), H = r.H(), c = { x:W / 2, y:H * 0.46 };
    K.music('hs_chip'); r.cap('then a code, typed in the dark');
    const t = r.el('hs-typed mono'); t.style.top = (H * 0.42) + 'px';
    const hold = document.createElement('span'), cur = document.createElement('u'); t.appendChild(hold); t.appendChild(cur);
    await r.wait(1500);
    const seq = ['\u2191', '\u2191', '\u2193', '\u2193', '\u2190', '\u2192', '\u2190', '\u2192', 'B', 'A'];
    for(let i = 0; i < seq.length; i++){ hold.textContent += seq[i] + ' '; r.chip(330 + i * 42, 0, 0.09, 0.06); await r.wait(300); }
    await r.wait(700); r.cap('');
    r.fade(t, 500); await r.wait(500);
    await HE.moments.konami(r);
    await r.sweep(700);
    K.music('hs_quiet');
    await hatch(3, c.x, c.y);
  }

  async function typedScene(word, capText, momentKey, idx, piece){
    const r = R, W = r.W(), H = r.H(), c = { x:W / 2, y:H * 0.46 };
    K.music(piece); r.cap(capText);
    const t = r.el('hs-typed'); t.style.top = (H * 0.4) + 'px';
    const hold = document.createElement('span'), cur = document.createElement('u'); t.appendChild(hold); t.appendChild(cur);
    await r.wait(1700);
    for(let i = 0; i < word.length; i++){ hold.textContent += word[i]; r.bell(CHIME[i % 5] + 12, 0, 0.07, 1.4); r.tone(900, 0, 0.03, 'square', 0.03); await r.wait(440); }
    await r.wait(800); r.cap('');
    r.fade(t, 500); await r.wait(500);
    await HE.moments[momentKey](r);
    await r.sweep(900);
    await hatch(idx, c.x, c.y);
  }
  const s5_name = () => typedScene('ann', 'then your name, typed into a box', 'name', 4, 'hs_tender');
  const s6_tristan = () => typedScene('tristan', 'then mine', 'tristan', 5, 'hs_play');

  async function s7_idle(){
    const r = R, W = r.W(), H = r.H();
    K.music('hs_quiet'); r.cap('then an envelope that never quite landed');
    const e = r.el('hs-env', '\u2709'); e.style.left = '-12%'; e.style.top = (H * 0.46) + 'px';
    const o = r.orbOn(-W * 0.04, H * 0.7);
    await r.wait(1200);
    let ex = 0, ey = 0;
    await r.tween(4200, p => {
      ex = W * (-0.1 + 0.78 * p); ey = H * 0.44 + Math.sin(p * 7) * H * 0.05;
      e.style.left = ex + 'px'; e.style.top = ey + 'px'; e.style.transform = 'translate(-50%,-50%) rotate(' + Math.sin(p * 9) * 10 + 'deg)';
      const lag = 90 * (1 - p) + 10; o.style.transition = 'none'; o.style.left = (ex - lag) + 'px'; o.style.top = (ey + lag * 0.6) + 'px';
    });
    r.press(o, ex, ey, 760, true); await r.wait(300); r.orbOff(o); r.cap('');
    e.remove();
    await HE.moments.idle(r, { x:ex, y:ey });
    await r.sweep(900);
    await hatch(6, W / 2, H * 0.46);
  }

  async function s8_mail(){
    const r = R, W = r.W(), H = r.H(), pmx = W * 0.8, pmy = H * 0.24;
    K.music('hs_play'); r.cap('then a stamp with somewhere to be');
    const size = Math.min(W * 0.3, 120), pm = prop(r, 'hs-pmprop'); pm.style.width = pm.style.height = size + 'px'; placeAt(pm, pmx, pmy);
    pm.innerHTML = U.postmarkSVG('FROM THE UK \u2726 WITH LOVE \u2726 ', '', '');
    const st = r.el('hs-stampprop', '\u2661'); st.style.left = (W * 0.2) + 'px'; st.style.top = (H * 0.68) + 'px';
    await r.nextFrame(); pm.classList.add('in'); await r.wait(1800);
    const o = r.orbOn(W * 0.05, H * 0.86); await r.orbGo(o, W * 0.2, H * 0.68, 1300);
    o.classList.add('down'); r.ripple(W * 0.2, H * 0.68); r.tone(500, 0, 0.1, 'triangle', 0.1);
    await r.wait(300);
    // dragged across, together
    const tr = 'left 1.1s cubic-bezier(.5,0,.3,1),top 1.1s cubic-bezier(.5,0,.3,1),opacity .45s,transform .12s';
    o.style.transition = tr; st.style.left = pmx + 'px'; st.style.top = pmy + 'px'; o.style.left = pmx + 'px'; o.style.top = pmy + 'px';
    r.tone(300, 0, 1.1, 'sine', 0.05, 700);
    await r.wait(1250);
    o.classList.remove('down'); r.press(o, pmx, pmy, 900, true); await r.wait(300); r.orbOff(o); r.cap('');
    r.fade([st, pm], 500); await r.wait(500);
    await HE.moments.mail(r, { x:pmx, y:pmy });
    await r.sweep(900);
    await hatch(7, W / 2, H * 0.46);
  }

  async function s9_chase(){
    const r = R, W = r.W(), H = r.H(), c = { x:W / 2, y:H * 0.46 }, corner = { x:W - 50, y:50 };
    K.music('hs_tender'); r.cap('and last, something shy');
    const h = r.el('hs-heartprop', '\u2661'); placeAt(h, c.x, c.y); h.style.opacity = '0';
    await r.nextFrame(); h.style.opacity = '1';
    const o = r.orbOn(W * 0.1, H * 0.82);
    await r.wait(1500);
    const hops = [[W * 0.2, H * 0.3], [W * 0.78, H * 0.66], [W * 0.28, H * 0.6], [W * 0.62, H * 0.22], [corner.x, corner.y]];
    let hx = c.x, hy = c.y;
    for(let i = 0; i < hops.length; i++){
      await r.orbGo(o, hx + (hops[i][0] > hx ? -26 : 26), hy + 18, 900);       // the firefly closes in
      r.tone(700 + i * 30, 0, 0.12, 'triangle', 0.05);
      hx = hops[i][0]; hy = hops[i][1]; placeAt(h, hx, hy);                      // the heart darts away
      r.hearts(hx, hy, 3); r.tone(900 + i * 60, 0.05, 0.1, 'sine', 0.06);
      await r.wait(i === hops.length - 1 ? 500 : 350);
    }
    await r.orbGo(o, corner.x - 30, corner.y + 24, 800); r.press(o, corner.x, corner.y, 600); await r.wait(300);
    r.orbOff(o); r.cap('');
    h.remove();
    await HE.moments.chase(r, corner);
    await r.sweep(900);
    await hatch(8, W / 2, H * 0.46);
  }

  /* ------------------------------------------------------------------ the finale: the stamp sheet */
  async function sFinale(){
    const r = R, W = r.W(), H = r.H(), cx = W / 2, cy = H * 0.47;
    K.music('hs_gather'); r.cap('nine secrets, one sheet');
    const sw = Math.min(W * 0.84, 340), cw = sw / 3, ch = cw * 1.2, gap = 6;
    const cells = STAMPS.map((s, i) => ({ x:cx + ((i % 3) - 1) * (cw + gap), y:cy + (Math.floor(i / 3) - 1) * (ch + gap) }));
    const cards = [];
    for(let i = 0; i < 9; i++){
      const st = r.raw('hs-stamp'); st.style.width = cw + 'px'; st.style.height = ch + 'px';
      st.style.setProperty('--r', rnd(-1.6, 1.6) + 'deg'); st.style.setProperty('--g', (cw * 0.42) + 'px'); st.style.setProperty('--l', Math.max(.62, cw / 120) + 'rem');
      st.style.left = cells[i].x + 'px'; st.style.top = cells[i].y + 'px';
      st.innerHTML = '<i>' + STAMPS[i][0] + '</i><span>' + STAMPS[i][1] + '</span>';
      cards.push(st);
    }
    // each egg leaves the tray, flies to its place and turns into a stamp
    slots.forEach(s => s.classList.remove('full'));
    tray.classList.remove('on');
    for(let i = 0; i < 9; i++){
      const p = slotXY(i), e = r.raw('hs-egg', '\ud83e\udd5a'); e.style.left = p[0] + 'px'; e.style.top = p[1] + 'px'; e.style.fontSize = '1.05rem';
      await r.nextFrame();
      e.style.fontSize = '2rem'; e.style.left = cells[i].x + 'px'; e.style.top = cells[i].y + 'px';
      r.later(() => { e.remove(); cards[i].classList.add('in'); r.thud(0.28, 150 + i * 8); r.bell(CHIME[i], 0, 0.1, 1.6); r.sparks(cells[i].x, cells[i].y, 5, ['\u2726', '\u2709']); }, 1300);
      await r.wait(430);
    }
    await r.wait(1900);
    r.cap('');
    // the whole sheet gets cancelled
    const pmS = sw * 1.15, pm = r.raw('hs-pmbig'); pm.style.width = pm.style.height = pmS + 'px'; pm.style.left = cx + 'px'; pm.style.top = cy + 'px';
    pm.innerHTML = U.postmarkSVG('NINE SECRETS \u2726 ALL FOUND \u2726 ', 'Keeper', U.dateShort());
    r.tone(150, 0, 0.7, 'sine', 0.08, 800);
    await r.wait(500);
    pm.classList.add('on');
    await r.wait(380);
    r.flash(); r.quake(); r.thud(0.6, 90); r.noise(1.4, 0.14, 700, 4500);
    [60, 64, 67, 72, 76, 79].forEach((m, k) => r.bell(m, k * 0.06, 0.12, 3));
    K.music('hs_blast', true);
    r.sparks(cx, cy, 22, ['\u25cf', '\u2726', '\u2709', '\u2661']);
    r.heartBurst(); r.confetti(); r.later(() => { r.confetti(); r.heartBurst(); }, 700); r.later(r.heartBurst, 1300);
    const ban = r.raw('hs-banner'); ban.style.setProperty('--bt', 'calc(' + (cy + ch * 1.55 + 10) + 'px)');
    'SECRET KEEPER'.split('').forEach((chr, i) => { const sp = document.createElement('span'); sp.textContent = chr === ' ' ? '\u00a0' : chr; sp.style.setProperty('--d', (0.5 + i * 0.07) + 's'); ban.appendChild(sp); });
    [0, 400, 900].forEach(d => r.later(() => r.ringAt(cx, cy, '#ffd76a', 30), d));
    await r.wait(4600);
    // the sheet lifts away; the note takes its place
    r.fade([...cards, pm], 1400);
    ban.style.setProperty('--bt', '17%'); K.music('hs_tender');
    await r.wait(1900);
    const line = r.raw('hs-line');
    for(const [txt, ms] of NOTE_LINES){
      line.classList.remove('in'); await r.wait(900);
      line.textContent = txt; line.classList.add('in');
      await r.wait(ms);
    }
    line.classList.remove('in'); await r.wait(800);
    const sig = r.raw('hs-sig', 'Bestie Tristan \u2661'); await r.nextFrame(); sig.classList.add('in');
    r.heartBurst();
    await r.wait(3600);
    r.fade([sig, ban], 1200);
    await r.wait(1400);
  }

  async function show(){
    const r = R;
    r.sky.classList.add('on');
    K.music('hs_quiet'); drift(r, 1100);
    await r.wait(1200);
    tray.classList.add('on'); r.cap('nine little secrets');
    await r.wait(3000); r.cap(''); await r.wait(500);
    await s1_postmark(); await s2_signature(); await s3_nav();
    await s4_konami(); await s5_name(); await s6_tristan();
    await s7_idle(); await s8_mail(); await s9_chase();
    await sFinale();
  }

  /* ------------------------------------------------------------------ entry point */
  function play(o, next){
    injectCSS(); HE.injectCSS();
    const root = mk('hs-root'); o.appendChild(root);
    const stage = mk('', null, root); stage.style.cssText = 'position:absolute;inset:0';
    const sky = mk('hs-sky', null, stage);
    for(let i = 0; i < 60; i++){
      const s = mk('', null, sky), z = 1 + Math.random() * 2;
      s.style.cssText = 'position:absolute;border-radius:50%;background:#ffe9c8;opacity:.35;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;width:' + z + 'px;height:' + z + 'px';
    }
    const r = K.createRun(stage); r.sky = sky; R = r;
    tray = mk('hs-tray', null, stage); slots = [];
    for(let i = 0; i < 9; i++){ const s = mk('hs-slot', null, tray); s.appendChild(document.createElement('i')).textContent = '\ud83e\udd5a'; slots.push(s); }
    K.ac(); K.unmute();
    let hint = null, skipped = false;
    const unlock = () => { K.ac(); if(hint){ hint.remove(); hint = null; } };
    const onKey = e => { if(e.key === 'Escape'){ skipped = true; r.abort(); } else unlock(); };
    document.addEventListener('pointerdown', unlock); document.addEventListener('keydown', onKey);
    setTimeout(() => { if(!K.audioReady() && !r.dead){ hint = mk('hs-snd', 'tap for sound \u266a', root); } }, 700);
    (async () => {
      try{ await show(); }catch(e){ if(e !== DEAD) console.warn('[home-secrets-reel]', e); }
      document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', onKey);
      if(hint){ hint.remove(); hint = null; }
      r.abort();
      if(skipped){
        [...stage.children].forEach(n => { if(n !== sky) n.remove(); });
        try{ window.launchConfetti(); window.launchHeartBurst(); }catch(e){}
        await new Promise(res => setTimeout(res, 900));
      }
      K.stopMusic(1.4);
      root.style.opacity = '0';
      setTimeout(() => { root.remove(); if(R === r) R = null; next(); }, 950);
    })();
  }

  window.HomeSecretsReel = { play };
})();
