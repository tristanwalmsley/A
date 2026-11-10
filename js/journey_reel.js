/* ==========================================================================
   journey_reel.js - the secrets celebration for the Our Journey page (all 16 eggs), played from the Secret Keeper badge.
   Needs fx_kit.js and journey_eggs.js. Loaded on the home page before home.js, which calls:
       JourneyReel.play(overlay, next)

   Each egg is replayed with the SAME moment the page plays live (journey_eggs.js). For every egg a miniature of the real timeline card is
   built, the firefly performs the real gesture on it (taps, a long press, a double-tap, the dot beside the card...), the moment plays, and
   an egg hatches into the tray of sixteen at the top. Finale: the sixteen eggs become the dots of one long timeline, a spark runs down it,
   and the "3+ Years of Besties" stamp slams down with the real number of days counting up, then a short note.

   No buttons. Escape skips to the end. Reduced motion: home.js falls back to a quick ring.
   Edit SCENES to reorder or drop scenes (each one is a full egg, so it is long: roughly 5 minutes). Edit NOTE_LINES for the closing note.
   Colours come from the active theme, so Winter/Christmas restyle the whole reel.
   ========================================================================== */
(function(){
  'use strict';
  const K = window.FxKit, JE = window.JourneyEggs, DEAD = K.DEAD, mk = K.mk, rnd = K.rnd, col = K.col, CH = K.CH, PENTA = JE.util.PENTA;

  // order follows the timeline: what the card says, how she found it
  const SCENES = [
    { key:'nest',      cap:'it started in a nest',                       tag:'milestone', date:'Nov 2022',      title:'You started chatting in the Nest',      g:'taps', n:3, music:'je_quiet' },
    { key:'hello',     cap:'then a very first hello',                    tag:'special',   date:'15 Jan 2023',   title:'First hello and the date of our first DMing', g:'hold', music:'je_tender' },
    { key:'call',      cap:'then a very first call',                     tag:'special',   date:'28 Jan 2023',   title:'Our very first of many calls',           g:'dbl', music:'je_quiet' },
    { key:'bus',       cap:'then a very slow bus',                       tag:'game',      date:'3 Jul 2023',    title:'Bus Sim 18',                             g:'dot', music:'je_play' },
    { key:'glasses',   cap:'then Tristan got glasses',                   tag:'milestone', date:'9 Aug 2023',    title:'Tristan got glasses',                    g:'taps', n:4, music:'je_quiet' },
    { key:'christmas', cap:'then three Christmases',                     tag:'christmas', date:'2023 · 2024 · 2025', title:'The Christmas exchanges',          g:'distinct', n:3, glyph:'🎁', music:'je_tender' },
    { key:'phasmo',    cap:'then the lights went off',                   tag:'game',      date:'Mar 2024',      title:'Ann first played Phasmo',                g:'hold', music:'je_quiet' },
    { key:'face',      cap:'then a face reveal',                         tag:'milestone', date:'Oct 2024',      title:'The “official” face reveal',             g:'taps', n:5, music:'je_play' },
    { key:'birthday',  cap:'and every birthday along the way',           tag:'birthday',  date:'27 Jun · 5 Aug', title:'Eight birthdays',                       g:'distinct', n:5, glyph:'🎂', music:'je_play' },
    { key:'stardew',   cap:'then a concert on a farm',                   tag:'game',      date:'Feb–Mar 2026',  title:'Stardew Concerts',                       g:'dbl', music:'je_play' },
    { key:'insync',    cap:'then we started thinking in unison',         tag:'era',       date:'2026',          title:'The INSYNC Era',                         g:'taps', n:3, music:'je_quiet' },
    { key:'protein',   cap:'then a business was born',                   tag:'milestone', date:'19 Aug 2026',   title:'The Protein Business',                   g:'taps', n:2, music:'je_play' },
    { key:'spine',     cap:'and the line that holds it all together',    g:'spine', music:'je_tender' },
    { key:'capsule',   cap:'then a long wait at the bottom of the page', g:'wait', music:'je_tender' },
    { key:'days',      cap:'and one very big number',                    g:'stamp', music:'je_quiet' },
    { key:'tbc',       cap:'and the last one, which was never really last', tag:'future', date:'✨ 2026 and beyond ✨', title:'The rest of it', g:'taps', n:1, music:'je_tender' }
  ];
  const NOTE_LINES = [
    ['sixteen secrets.', 2400],
    ['hidden in a timeline that started in a nest in 2022.', 3800],
    ['every card on it is something we actually did.', 3600],
    ['and you went through every single one of them like it mattered.', 4200],
    ['it did. it does.', 3000],
    ['here is to the rest of it, Ann.', 4600]
  ];

  /* ------------------------------------------------------------------ the score (G major) */
  const P = K.PIECES;
  P.je_quiet  = { tempo:64,  prog:[CH.Gmaj7, CH.Em, CH.Cmaj7, CH.D], arp:0.045, melVol:0.10, pad:0.020, bass:0.10,
    mel:[[79,null,83,null,86,null,83,null],[88,null,86,null,83,null,79,null],[84,null,83,null,79,null,76,null],[78,null,81,null,86,null,null,null]] };
  P.je_play   = { tempo:100, prog:[CH.G, CH.D, CH.Em, CH.C], arp:0.045, melVol:0.12, pad:0.018, bass:0.12, bass2:true,
    mel:[[79,83,null,86,null,83,79,null],[78,81,null,86,null,81,78,null],[76,79,null,83,null,79,76,null],[79,84,null,88,null,84,79,81]] };
  P.je_tender = { tempo:58,  prog:[CH.Cmaj7, CH.G, CH.Em, CH.D], arp:0.035, melVol:0.13, pad:0.026, bass:0.10,
    mel:[[84,null,88,null,91,null,88,null],[86,null,83,null,79,null,83,null],[83,null,79,null,76,null,79,83],[81,null,78,null,81,null,null,null]] };
  P.je_gather = { tempo:84,  prog:[CH.Em, CH.C, CH.G, CH.D], arp:0.06, melVol:0.12, pad:0.026, bass:0.14, bass2:true, tick:0.025,
    mel:[[76,null,79,null,83,null,88,null],[79,null,84,null,88,null,91,null],[83,null,86,null,91,null,95,null],[90,null,93,null,90,null,86,null]] };
  P.je_blast  = { tempo:84,  prog:[CH.G, CH.D, CH.Em, CH.C], arp:0.08, melVol:0.17, pad:0.034, bass:0.17, bass2:true,
    mel:[[91,null,86,null,83,null,86,null],[90,null,93,null,90,null,86,null],[91,null,88,null,83,null,88,null],[91,null,88,null,84,null,88,91]] };

  /* ------------------------------------------------------------------ styles */
  const CSS = `
.jr-root{position:absolute;inset:0;z-index:0;pointer-events:none;transition:opacity .9s}
.jr-sky{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,color-mix(in srgb,var(--brown,#7a5230) 55%,#08040a),color-mix(in srgb,var(--deep,#3a2010) 80%,#030105) 80%);opacity:0;transition:opacity 2.6s}
.jr-sky.on{opacity:1}
.jr-snd{position:absolute;right:1rem;top:1rem;z-index:95;font-family:'Caveat',cursive;font-size:1.15rem;color:rgba(250,244,232,.7);letter-spacing:1px;animation:jrBob 1.6s ease-in-out infinite}
@keyframes jrBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.jr-tray{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 1.8rem);transform:translateX(-50%);display:grid;grid-template-columns:repeat(8,auto);gap:.32rem;z-index:60;opacity:0;transition:opacity 1.2s}
.jr-tray.on{opacity:1}
.jr-slot{position:relative;width:1.25rem;height:1.55rem;border:1.5px dashed rgba(255,226,160,.38);border-radius:50% 50% 50% 50% / 62% 62% 38% 38%;transition:border-color .6s,box-shadow .6s,background .6s}
.jr-slot.full{border-style:solid;border-color:var(--gold-light,#e8b95a);background:color-mix(in srgb,var(--gold-light,#e8b95a) 22%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--gold-light,#e8b95a) 70%,transparent)}
.jr-slot i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:.78rem;opacity:0;transform:scale(.3);transition:opacity .4s,transform .5s cubic-bezier(.34,1.8,.5,1)}
.jr-slot.full i{opacity:1;transform:scale(1)}
.jr-egg{position:absolute;font-size:2.4rem;line-height:1;transform:translate(-50%,-50%);z-index:70;transition:left 1.1s cubic-bezier(.5,0,.2,1),top 1.1s cubic-bezier(.5,0,.2,1),font-size 1.1s ease,opacity .6s;filter:drop-shadow(0 0 14px rgba(255,215,106,.8))}
.jr-egg.pop{animation:jrPop .6s cubic-bezier(.34,1.8,.5,1)}
@keyframes jrPop{from{transform:translate(-50%,-50%) scale(0)}to{transform:translate(-50%,-50%) scale(1)}}
/* replica timeline card (a miniature of the real .tl-card) */
.jr-card{position:absolute;left:50%;top:46%;z-index:40;width:min(78vw,300px);padding:.9rem 1.1rem 1rem;background:var(--paper,#fffdf5);color:var(--deep,#3a2010);border:1px solid var(--tan,#d4b483);border-left:4px solid var(--gold,#c8943a);box-shadow:5px 5px 0 var(--brown,#7a5230),0 10px 30px rgba(0,0,0,.4);transform:translate(-50%,-50%) scale(0);transition:transform .55s cubic-bezier(.34,1.7,.5,1),opacity .6s}
.jr-card.in{transform:translate(-50%,-50%) scale(1)}
.jr-card.tap{animation:jrTap .28s ease}
@keyframes jrTap{0%{filter:brightness(1)}40%{filter:brightness(1.12) drop-shadow(0 0 14px var(--gold-light,#e8b95a));transform:translate(-50%,-50%) scale(1.045)}100%{filter:brightness(1)}}
.jr-tag{display:inline-block;font-family:'Playfair Display',serif;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;padding:.12rem .5rem;border:1px solid var(--gold,#c8943a);color:var(--gold-dark,#a8741f)}
.jr-date{margin-top:.45rem;font-family:'Caveat',cursive;font-size:1.15rem;color:var(--rose,#b86858)}
.jr-title{font-family:'Playfair Display',serif;font-weight:700;font-size:1.12rem;line-height:1.25}
.jr-dot{position:absolute;left:-1.9rem;top:50%;width:1.05rem;height:1.05rem;margin-top:-.52rem;border-radius:50%;border:2.5px solid var(--gold,#c8943a);background:#160d08;transition:background .3s,transform .3s}
.jr-dot.lit{background:var(--gold-light,#e8b95a);transform:scale(1.5)}
.jr-mini{position:absolute;z-index:42;width:3.1rem;height:3.9rem;transform:translate(-50%,-50%) scale(0);background:var(--paper,#fffdf5);border:1px solid var(--tan,#d4b483);border-left:3px solid var(--gold,#c8943a);box-shadow:3px 3px 0 var(--brown,#7a5230);display:flex;align-items:center;justify-content:center;font-size:1.5rem;transition:transform .45s cubic-bezier(.34,1.8,.5,1),filter .3s}
.jr-mini.in{transform:translate(-50%,-50%) scale(1)}
.jr-mini.hit{filter:drop-shadow(0 0 10px var(--gold-light,#e8b95a)) brightness(1.1);transform:translate(-50%,-50%) scale(1.18)}
.jr-line{position:absolute;z-index:40;width:2px;background:var(--tan,#d4b483);opacity:.6;transform-origin:50% 0}
.jr-stampbig{position:absolute;left:50%;z-index:60;width:min(54vw,210px);aspect-ratio:1;border-radius:50%;border:4px double var(--gold-light,#e8b95a);color:#fff3d6;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:color-mix(in srgb,var(--deep,#3a2010) 60%,transparent);box-shadow:0 0 40px color-mix(in srgb,var(--gold,#c8943a) 45%,transparent);transform:translate(-50%,-50%) scale(var(--s,1))}
.jr-stampbig b{font-family:'Playfair Display',serif;font-size:clamp(3rem,14vw,4.6rem);line-height:1;color:var(--gold-light,#e8b95a)}
.jr-stampbig span{font-family:'Playfair Display',serif;font-style:italic;font-size:1rem;letter-spacing:.06em}
.jr-stampbig.slam{animation:jrSlam .42s cubic-bezier(.2,1.5,.4,1) both}
@keyframes jrSlam{from{opacity:0;transform:translate(-50%,-50%) scale(2.6) rotate(-16deg)}to{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-6deg)}}
.jr-fdot{position:absolute;z-index:56;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;border:2px solid var(--gold,#c8943a);background:#160d08;transition:background .3s,transform .4s cubic-bezier(.3,2,.5,1),box-shadow .3s}
.jr-fdot.lit{background:var(--gold-light,#e8b95a);transform:scale(1.5);box-shadow:0 0 14px var(--gold-light,#e8b95a)}
.jr-era{position:absolute;z-index:56;transform:translate(0,-50%);font-family:'Playfair Display',serif;font-size:.75rem;letter-spacing:.2em;color:#fff3d6;padding:.1rem .5rem;background:color-mix(in srgb,var(--deep,#3a2010) 85%,#000);border:1px solid var(--tan,#d4b483);opacity:0;transition:opacity .6s}
.jr-banner{position:absolute;left:0;right:0;top:var(--bt,70%);z-index:62;text-align:center;font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:clamp(1.6rem,7vw,3rem);letter-spacing:.12em;white-space:nowrap;transition:top 1.4s cubic-bezier(.6,0,.3,1)}
.jr-banner span{display:inline-block;opacity:0;transform:translateY(-40px) scale(1.8);background:linear-gradient(180deg,#fff6c8,var(--gold-light,#e8b95a) 60%,var(--gold-dark,#a8741f));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 12px rgba(255,200,80,.8));animation:jrLetter .6s cubic-bezier(.2,1.4,.4,1) forwards;animation-delay:var(--d)}
@keyframes jrLetter{to{opacity:1;transform:none}}
.jr-line2{position:absolute;left:0;right:0;top:54%;z-index:62;text-align:center;padding:0 9vw;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.3rem,5.2vw,2.2rem);line-height:1.5;color:#fff3d6;text-shadow:0 2px 16px rgba(0,0,0,.7),0 0 22px rgba(232,185,90,.5);opacity:0;transition:opacity 1s}
.jr-line2.in{opacity:1}
.jr-sig{position:absolute;left:0;right:0;top:76%;z-index:62;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(1.8rem,7vw,2.8rem);color:var(--gold-light,#e8b95a);text-shadow:0 0 16px rgba(255,200,110,.7);opacity:0;transition:opacity 1.6s}
.jr-sig.in{opacity:1}
.jr-fall{position:absolute;top:-2rem;z-index:3;color:#fff;opacity:.7;pointer-events:none;animation:jrFall var(--fd) linear forwards}
@keyframes jrFall{to{transform:translate(var(--sw),112vh) rotate(var(--fr))}}
`;
  let cssDone = false;
  function injectCSS(){ if(cssDone) return; cssDone = true; const st = document.createElement('style'); st.id = 'jr-css'; st.textContent = CSS; document.head.appendChild(st); }

  /* ------------------------------------------------------------------ helpers */
  let R = null, slots = [], tray = null;
  const slotXY = i => { const s = slots[i].getBoundingClientRect(), b = R.stage.getBoundingClientRect(); return [s.left - b.left + s.width / 2, s.top - b.top + s.height / 2]; };
  async function hatch(i, x, y, key){
    const r = R, e = r.raw('jr-egg pop', '🥚'); e.style.left = x + 'px'; e.style.top = y + 'px';
    r.sparks(x, y, 8, ['✨', '✦', JE.GLYPHS[key]]); r.flash(); r.bell(PENTA[i % 7] - 12, 0, 0.13, 2.2);
    await r.wait(800);
    const p = slotXY(i); e.style.left = p[0] + 'px'; e.style.top = p[1] + 'px'; e.style.fontSize = '.95rem';
    r.tone(500, 0, 0.45, 'sine', 0.06, 1200);
    await r.wait(1200);
    slots[i].classList.add('full'); slots[i].querySelector('i').textContent = JE.GLYPHS[key]; e.remove();
    r.bell(PENTA[i % 7] + 12, 0, 0.09, 1.6); r.sparks(p[0], p[1], 5, ['✦', '✨']);
    r.cap((i + 1) + ' of 16'); await r.wait(900);
  }
  const tap = e => { e.classList.remove('tap'); void e.offsetWidth; e.classList.add('tap'); };
  const centre = r => ({ x:r.W() / 2, y:r.H() * 0.46 });

  // builds the miniature card for a scene
  function card(r, sc){
    const c = r.el('jr-card'); c.innerHTML = '<span class="jr-tag">' + sc.tag + '</span><div class="jr-date">' + sc.date + '</div><div class="jr-title">' + sc.title + '</div>' + (sc.g === 'dot' ? '<i class="jr-dot"></i>' : '');
    return c;
  }

  // the firefly performs the gesture; returns where the moment should start from
  async function perform(r, sc){
    const W = r.W(), H = r.H(), c = centre(r);
    const o = r.orbOn(W * 0.12, H * 0.8);
    if(sc.g === 'distinct'){
      const k = sc.n, minis = [];
      for(let i = 0; i < k; i++){ const m = r.el('jr-mini', sc.glyph); m.style.left = (W * (0.5 + (i - (k - 1) / 2) * (k > 3 ? 0.16 : 0.22))) + 'px'; m.style.top = (c.y + (i % 2) * 18) + 'px'; minis.push(m); }
      await r.nextFrame(); minis.forEach((m, i) => r.later(() => m.classList.add('in'), i * 120)); await r.wait(1600);
      for(let i = 0; i < k; i++){ const mx = parseFloat(minis[i].style.left), my = parseFloat(minis[i].style.top); await r.orbGo(o, mx + 6, my + 8, 650); r.press(o, mx, my, 520 + i * 70, i === k - 1); minis[i].classList.add('hit'); r.bell(PENTA[i % 7] + 12, 0, 0.07, 1.2); await r.wait(260); }
      r.orbOff(o); await r.wait(300); return c;
    }
    if(sc.g === 'spine'){
      const ln = r.el('jr-line'); ln.style.left = (W / 2 - 1) + 'px'; ln.style.top = (H * 0.2) + 'px'; ln.style.height = (H * 0.56) + 'px';
      for(let i = 0; i < 6; i++){ const d = r.el('jr-fdot'); d.style.left = (W / 2) + 'px'; d.style.top = (H * 0.2 + (H * 0.56) * (i / 5)) + 'px'; }
      await r.wait(1500); const ty = H * 0.2 + H * 0.56 * 0.3;
      await r.orbGo(o, W / 2 + 14, ty, 1300);
      for(let k = 0; k < 3; k++){ r.press(o, W / 2, ty, 500 + k * 90, k === 2); await r.wait(420); }
      r.orbOff(o);
      r.fade(r.collect.filter(e => e.classList && (e.classList.contains('jr-line') || e.classList.contains('jr-fdot'))), 450);   // clear the preview line so the moment draws its own
      await r.wait(550); return { x:W / 2, y:ty };
    }
    if(sc.g === 'stamp'){
      const s = r.el('jr-stampbig'); s.style.top = (H * 0.46) + 'px'; s.style.setProperty('--s', '0'); s.innerHTML = '<b>3+</b><span>Years of Besties</span>'; s.style.transition = 'transform .6s cubic-bezier(.34,1.7,.5,1)';
      await r.nextFrame(); s.style.setProperty('--s', '1'); await r.wait(1700);
      await r.orbGo(o, c.x + 40, c.y + 26, 1300);
      for(let k = 0; k < 3; k++){ r.press(o, c.x + 40, c.y + 26, 520 + k * 90, k === 2); s.style.setProperty('--s', '1.08'); r.later(() => s.style.setProperty('--s', '1'), 160); await r.wait(420); }
      r.orbOff(o); r.fade(s, 500); await r.wait(500); return c;
    }
    if(sc.g === 'wait'){
      const ln = r.el('jr-card'); ln.innerHTML = '<div class="jr-title" style="text-align:center;font-size:1.3rem;color:var(--rose,#b86858)">3+</div><div class="jr-date" style="text-align:center">Years of Besties</div>'; ln.style.top = (H * 0.5) + 'px';
      await r.nextFrame(); ln.classList.add('in'); await r.wait(1000);
      await r.orbGo(o, c.x, c.y + 120, 1200);
      for(let k = 0; k < 4; k++){ r.ringAt(c.x, c.y + 120, col('--gold-light'), 6); r.tone(300, 0, 0.12, 'sine', 0.04); await r.wait(850); }
      r.orbOff(o); r.fade(ln, 500); await r.wait(500); return c;
    }
    // everything else happens on a single card
    const cd = card(r, sc); await r.nextFrame(); cd.classList.add('in'); r.bell(PENTA[0], 0, 0.07, 1.4);
    await r.wait(1400);
    const w = cd.offsetWidth, px = c.x + w * 0.1, py = c.y + 6;
    const tgt = sc.g === 'dot' ? [c.x - w / 2 - 22, c.y] : [px, py];
    await r.orbGo(o, tgt[0] + 10, tgt[1] + 8, 1250);
    if(sc.g === 'taps'){ for(let k = 0; k < sc.n; k++){ r.press(o, tgt[0], tgt[1], 520 + k * 50, k === sc.n - 1); tap(cd); await r.wait(k < sc.n - 1 ? 340 : 380); } }
    else if(sc.g === 'dbl'){ r.press(o, tgt[0], tgt[1], 700); tap(cd); await r.wait(170); r.press(o, tgt[0], tgt[1], 840, true); tap(cd); await r.wait(420); }
    else if(sc.g === 'dot'){ const d = cd.querySelector('.jr-dot'); r.press(o, tgt[0], tgt[1], 760, true); if(d) d.classList.add('lit'); await r.wait(450); }
    else if(sc.g === 'hold'){
      o.classList.add('down'); r.tone(200, 0, 1.3, 'sine', 0.06, 520);
      for(let k = 0; k < 3; k++){ r.ringAt(tgt[0], tgt[1], col('--gold-light'), 6 + k * 3); await r.wait(430); }
      o.classList.remove('down'); r.press(o, tgt[0], tgt[1], 880, true); await r.wait(300);
    }
    r.orbOff(o); r.fade(cd, 500); await r.wait(500);
    return { x:tgt[0], y:tgt[1] };
  }

  async function scene(i){
    const r = R, sc = SCENES[i], key = sc.key, c = centre(r);
    K.music(sc.music || 'je_quiet'); r.cap(sc.cap);
    await r.wait(700);
    const anchor = await perform(r, sc);
    r.cap('');
    await JE.moments[key](r, anchor);
    await r.sweep(900);
    await hatch(i, c.x, c.y, key);
  }

  /* ------------------------------------------------------------------ finale: the sixteen become the line, the stamp comes down */
  async function finale(){
    const r = R, W = r.W(), H = r.H(), cx = W / 2, y0 = H * 0.17, y1 = H * 0.79, n = SCENES.length;
    K.music('je_gather'); r.cap('sixteen secrets, one timeline');
    const ln = r.raw('jr-line'); ln.style.left = (cx - 1) + 'px'; ln.style.top = y0 + 'px'; ln.style.height = (y1 - y0) + 'px'; ln.style.opacity = '0'; ln.style.transition = 'opacity 1s';
    const fill = r.raw('jr-line'); fill.style.cssText += ';left:' + (cx - 1) + 'px;top:' + y0 + 'px;height:0;background:' + col('--gold-light') + ';box-shadow:0 0 12px ' + col('--gold-light') + ';opacity:1;z-index:57';
    const dots = [], eggs = [];
    slots.forEach(s => s.classList.remove('full')); tray.classList.remove('on');
    for(let i = 0; i < n; i++){
      const p = slotXY(i), y = y0 + (y1 - y0) * (i / (n - 1));
      const e = r.raw('jr-egg', '🥚'); e.style.left = p[0] + 'px'; e.style.top = p[1] + 'px'; e.style.fontSize = '.95rem'; eggs.push(e);
      const d = r.raw('jr-fdot'); d.style.left = cx + 'px'; d.style.top = y + 'px'; d.style.opacity = '0'; dots.push(d);
    }
    ln.style.opacity = '.55';
    for(let i = 0; i < n; i++){
      const y = y0 + (y1 - y0) * (i / (n - 1));
      await r.nextFrame(); eggs[i].style.fontSize = '1.5rem'; eggs[i].style.left = cx + 'px'; eggs[i].style.top = y + 'px';
      r.later(() => { eggs[i].remove(); dots[i].style.opacity = '1'; r.bell(PENTA[i % 7], 0, 0.07, 1.4); r.sparks(cx, y, 3, ['✦']); }, 1150);
      await r.wait(260);
    }
    await r.wait(1500);
    // eras down the side
    [['2022', 0], ['2023', 1], ['2024', 6], ['2025', 9], ['2026', 11]].forEach(([t, i], k) => { const e = r.raw('jr-era', t); e.style.left = (cx + 16) + 'px'; e.style.top = (y0 + (y1 - y0) * (i / (n - 1))) + 'px'; r.later(() => { e.style.opacity = '1'; }, k * 250); });
    r.cap('');
    // the spark runs down the whole line
    r.tone(200, 0, 3.6, 'sine', 0.06, 1100);
    await r.tween(3600, p => { fill.style.height = ((y1 - y0) * p) + 'px'; const idx = Math.floor(p * (n - 1) + 0.001); dots.forEach((d, i) => { if(i <= idx && !d.classList.contains('lit')){ d.classList.add('lit'); r.bell(PENTA[i % 7] + 12, 0, 0.06, 1.2); } }); });
    r.flash(); r.ringAt(cx, y1, col('--gold-light'), 24); [PENTA[0], PENTA[2], PENTA[4], PENTA[6]].forEach((m, i) => r.bell(m, i * 0.07, 0.12, 3));
    await r.wait(1400);
    r.fade([ln, fill, ...dots, ...[...r.stage.querySelectorAll('.jr-era')]], 1000);
    await r.wait(1200);
    // the stamp comes down
    const st = r.raw('jr-stampbig slam'); st.style.top = (H * 0.38) + 'px'; st.innerHTML = '<b>3+</b><span>Years of Besties</span>';
    r.tone(150, 0, 0.6, 'sine', 0.08, 800); await r.wait(420);
    r.flash(); r.quake(); r.thud(0.6, 90); r.noise(1.2, 0.14, 700, 4500); K.music('je_blast', true);
    [62, 67, 71, 74, 79, 83].forEach((m, k) => r.bell(m, k * 0.06, 0.12, 3));
    r.sparks(cx, H * 0.38, 20, ['✦', '♡', '✨']); r.heartBurst(); r.confetti(); r.later(() => { r.confetti(); r.heartBurst(); }, 800);
    [0, 400, 900].forEach(d => r.later(() => r.ringAt(cx, H * 0.38, col('--gold-light'), 28), d));
    await r.wait(900);
    const odo = r.raw('', ''); odo.style.cssText = 'position:absolute;left:0;right:0;top:' + (H * 0.38 + Math.min(W * 0.27, 105) + 30) + 'px;z-index:60;text-align:center;font-family:Playfair Display,serif;font-weight:700;font-size:clamp(2.6rem,12vw,4.4rem);color:#fff3d6;text-shadow:0 0 20px ' + col('--gold') + ';font-variant-numeric:tabular-nums';
    const days = JE.util.daysSince(JE.util.FIRST_DM), small = r.raw('', 'days since our first hello'); small.style.cssText = 'position:absolute;left:0;right:0;top:' + (H * 0.38 + Math.min(W * 0.27, 105) + 30 + Math.min(W * 0.14, 60) + 14) + 'px;z-index:60;text-align:center;font-style:italic;font-size:1.05rem;color:#f3e6c8;opacity:0;transition:opacity 1s';
    await r.tween(3200, p => { odo.textContent = Math.round(days * (1 - Math.pow(1 - p, 4))).toLocaleString(); });
    small.style.opacity = '1'; r.bell(PENTA[4], 0, 0.1, 2.4);
    const ban = r.raw('jr-banner'); ban.style.setProperty('--bt', (H * 0.38 + Math.min(W * 0.27, 105) + 30 + Math.min(W * 0.14, 60) + 52) + 'px');
    'FOUND EVERY ONE'.split('').forEach((ch, i) => { const sp = document.createElement('span'); sp.textContent = ch === ' ' ? '\u00a0' : ch; sp.style.setProperty('--d', (0.1 + i * 0.06) + 's'); ban.appendChild(sp); });
    await r.wait(4200);
    // the note
    r.fade([st, odo, small, ban], 1300); K.music('je_tender');
    await r.wait(1700);
    const line = r.raw('jr-line2');
    for(const [txt, ms] of NOTE_LINES){ line.classList.remove('in'); await r.wait(900); line.textContent = txt; line.classList.add('in'); await r.wait(ms); }
    line.classList.remove('in'); await r.wait(800);
    const sig = r.raw('jr-sig', 'Bestie Tristan ♡'); await r.nextFrame(); sig.classList.add('in'); r.heartBurst();
    await r.wait(3600); r.fade(sig, 1200); await r.wait(1400);
  }

  async function show(){
    const r = R;
    r.sky.classList.add('on'); K.music('je_quiet');
    r.every(() => { const f = mk('jr-fall', ['❄', '❅', '•', '✦'][Math.floor(Math.random() * 4)]), fd = rnd(8, 14); f.style.left = rnd(0, 98) + '%'; f.style.fontSize = rnd(.7, 1.6) + 'rem'; f.style.setProperty('--sw', rnd(-70, 70) + 'px'); f.style.setProperty('--fr', rnd(-200, 200) + 'deg'); f.style.setProperty('--fd', fd + 's'); r.fx(f, fd * 1000 + 200); }, 1200);
    await r.wait(1200);
    tray.classList.add('on'); r.cap('sixteen little secrets, scattered along one very long timeline');
    await r.wait(3600); r.cap(''); await r.wait(500);
    for(let i = 0; i < SCENES.length; i++) await scene(i);
    await finale();
  }

  /* ------------------------------------------------------------------ entry point */
  function play(o, next){
    injectCSS(); JE.injectCSS();
    const root = mk('jr-root'); o.appendChild(root);
    const stage = mk('', null, root); stage.style.cssText = 'position:absolute;inset:0';
    const sky = mk('jr-sky', null, stage);
    for(let i = 0; i < 60; i++){ const s = mk('', null, sky), z = 1 + Math.random() * 2; s.style.cssText = 'position:absolute;border-radius:50%;background:#e8f0ff;opacity:.35;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;width:' + z + 'px;height:' + z + 'px'; }
    const r = K.createRun(stage); r.sky = sky; R = r;
    tray = mk('jr-tray', null, stage); slots = [];
    for(let i = 0; i < SCENES.length; i++){ const s = mk('jr-slot', null, tray); s.appendChild(document.createElement('i')).textContent = '🥚'; slots.push(s); }
    K.ac(); K.unmute();
    let hint = null, skipped = false;
    const unlock = () => { K.ac(); if(hint){ hint.remove(); hint = null; } };
    const onKey = e => { if(e.key === 'Escape'){ skipped = true; r.abort(); } else unlock(); };
    document.addEventListener('pointerdown', unlock); document.addEventListener('keydown', onKey);
    setTimeout(() => { if(!K.audioReady() && !r.dead){ hint = mk('jr-snd', 'tap for sound ♪', root); } }, 700);
    (async () => {
      try{ await show(); }catch(e){ if(e !== DEAD) console.warn('[journey-reel]', e); }
      document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', onKey);
      if(hint){ hint.remove(); hint = null; }
      r.abort();
      if(skipped){
        [...stage.children].forEach(n => { if(n !== sky) n.remove(); });
        try{ window.launchConfetti(); window.launchHeartBurst(); }catch(e){}
        await new Promise(res => setTimeout(res, 900));
      }
      K.stopMusic(1.4); root.style.opacity = '0';
      setTimeout(() => { root.remove(); if(R === r) R = null; next(); }, 950);
    })();
  }

  window.JourneyReel = { play, SCENES };
})();
