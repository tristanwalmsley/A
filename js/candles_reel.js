/* ==========================================================================
   candles_reel.js - the celebration for the Two Candles badge (she turned up for BOTH birthdays in the same year).
   Needs fx_kit.js loaded first. Loaded before home.js, which calls:
       CandlesReel.play(overlay, next, { lv, years, tristan:'06-27', ann:'08-05' })
   - overlay = the celebration overlay      - next() = carries on (the medal)
   - years = every year she has made both days (from the site's own record). One pair of candles is lit per year.

   The story, in three acts:
     1. THE YEAR   - 365 dots, one per day. Two of them are the ones that matter. His candle, hers, and one dot lit per day of
                     waiting between them, so it is plain how rare "both" is.
     2. THE YEARS  - a table. For every year she made both days, his candle then hers are lit and stay lit.
     3. THE NOTE   - the table glows, a few lines, every candle flares, TWO CANDLES.
   Escape or the skip button jumps to the end. Reduced motion never gets here (home.js plays the short version instead).
   Music: its own pieces (PIECES just below, D major). To change wording: captions are r.cap('...'), the note is the block
   marked "THE NOTE". It lasts about 90 seconds for one year, plus about 8 seconds for every extra year.
   ========================================================================== */
(function(){
  'use strict';
  const K = window.FxKit, DEAD = K.DEAD, mk = K.mk, CH = K.CH;

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MLEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];   // a year with no leap day: the 365 dots
  const ONES = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  const words = n => n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '') : String(n);
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const ordinal = n => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const parseMd = md => [parseInt(md.slice(0, 2), 10), parseInt(md.slice(3), 10)];
  const HIS = '#c97a68', HERS = '#e8b95a';            // candle colours (same as the short version)
  const HIS_DOT = '#f0907a', HERS_DOT = '#ffd06a';    // their dots on the year grid

  /* ------------------------------------------------------------------ the score (D major, music-box) */
  K.PIECES.cr_hush = { tempo:54, prog:[CH.Dmaj7, CH.Bm7, CH.Gmaj7, CH.A], arp:0.03, melVol:0.09, pad:0.022, bass:0.09,
    mel:[[74,null,null,78,null,null,81,null],[79,null,78,null,74,null,null,null],[76,null,79,null,83,null,81,null],[78,null,76,null,73,null,null,null]] };
  K.PIECES.cr_wait = { tempo:72, prog:[CH.Bm, CH.Gmaj7, CH.D, CH.A], arp:0.04, melVol:0.10, pad:0.022, bass:0.10,
    mel:[[71,null,74,78,null,74,null,71],[79,null,78,null,74,null,71,null],[74,null,78,81,null,78,null,74],[73,null,76,null,81,null,76,73]] };
  K.PIECES.cr_year = { tempo:80, prog:[CH.D, CH.A, CH.Bm, CH.Gmaj7], arp:0.045, melVol:0.12, pad:0.022, bass:0.11, bass2:true,
    mel:[[74,78,81,null,78,null,74,null],[73,76,81,null,76,null,73,null],[71,74,78,null,83,null,78,null],[79,null,76,74,null,71,null,null]] };
  K.PIECES.cr_glow = { tempo:58, prog:[CH.Gmaj7, CH.Dmaj7, CH.Bm7, CH.A], arp:0.04, melVol:0.14, pad:0.030, bass:0.12,
    mel:[[79,null,83,null,86,null,83,null],[78,null,81,null,85,null,81,null],[83,null,78,null,74,null,78,null],[81,null,85,null,88,null,85,81]] };

  /* ------------------------------------------------------------------ styles */
  function injectCSS(){
    if(document.getElementById('cr-css')) return;
    const st = document.createElement('style'); st.id = 'cr-css';
    st.textContent = `
.cr-root{position:absolute;inset:0;z-index:2;background:radial-gradient(ellipse at 50% 75%,#2b1608 0%,#0e0603 62%,#070302 100%);transition:opacity .95s}
.cr-dust{position:absolute;border-radius:50%;background:#ffe2b0;opacity:.25;animation:crDrift linear infinite}
@keyframes crDrift{from{transform:translateY(0)}to{transform:translateY(-60px)}}
.cr-warm{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 82%,rgba(255,170,70,.34),transparent 66%);opacity:0;transition:opacity 6s ease}
.cr-warm.in{opacity:1}
.cr-table{position:absolute;height:3px;background:linear-gradient(90deg,transparent,#8a5a2b 14%,#c08a44 50%,#8a5a2b 86%,transparent);box-shadow:0 10px 26px rgba(255,170,60,.14);opacity:0;transition:opacity 1.4s}
.cr-table.in{opacity:1}
.cr-grid{position:absolute;left:50%;transform:translateX(-50%);opacity:0;transition:opacity 1.8s}
.cr-grid.in{opacity:1}
.cr-row{display:flex;align-items:center}
.cr-lab{width:calc(var(--cell)*1.5);font-family:'Caveat',cursive;font-size:calc(var(--cell)*1.15);line-height:1;color:#c9a46a;opacity:.7;text-align:center}
.cr-cell{width:var(--cell);height:var(--cell);display:grid;place-items:center}
.cr-dot{width:var(--dot);height:var(--dot);border-radius:50%;background:#e8d2a4;opacity:.2;transition:all .5s}
.cr-dot.soft{background:#ffd27a;opacity:.85;box-shadow:0 0 8px 1px rgba(255,190,80,.7)}
.cr-dot.on{background:var(--glow,#ffd06a);opacity:1;transform:scale(2.3);box-shadow:0 0 14px 4px var(--glow,#ffd06a)}
.cr-c{position:absolute;width:calc(24px*var(--s));height:calc(96px*var(--s));opacity:0;transition:opacity .9s}
.cr-c.in{opacity:1}
.cr-body{position:absolute;inset:0;border-radius:3px 3px 0 0;background:repeating-linear-gradient(-45deg,rgba(255,255,255,.5) 0 calc(5px*var(--s)),transparent calc(5px*var(--s)) calc(10px*var(--s))),var(--cc);box-shadow:2px 2px 0 rgba(0,0,0,.45)}
.cr-wick{position:absolute;left:50%;bottom:100%;width:2px;height:calc(9px*var(--s));margin-left:-1px;background:#1e1208}
.cr-flame{position:absolute;left:50%;bottom:calc(100% + 7px*var(--s));width:calc(15px*var(--s));height:calc(27px*var(--s));margin-left:calc(-7.5px*var(--s));border-radius:50% 50% 50% 50%/62% 62% 38% 38%;background:radial-gradient(ellipse at 50% 72%,#fff3b0 0 22%,#ffb23e 55%,#e8641e);box-shadow:0 0 16px 5px rgba(255,170,60,.6);transform:scale(0);transform-origin:50% 100%}
.cr-halo{position:absolute;left:50%;top:calc(-20px*var(--s));width:calc(280px*var(--s));height:calc(280px*var(--s));transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,200,90,.42),transparent 65%);opacity:0;transition:opacity 1.2s;pointer-events:none}
.cr-c.lit .cr-flame{animation:crLight .5s ease forwards,crFlick .24s ease-in-out .5s infinite alternate}
.cr-c.lit .cr-halo{opacity:1}
.cr-c.flare .cr-flame{animation:crFlare 1.1s ease forwards,crFlick .24s ease-in-out 1.1s infinite alternate}
@keyframes crLight{to{transform:scale(1)}}
@keyframes crFlick{from{transform:scale(1) rotate(-3deg)}to{transform:scale(.93,1.08) rotate(3deg)}}
@keyframes crFlare{0%{transform:scale(1)}35%{transform:scale(2.2,2.7)}100%{transform:scale(1.35,1.5)}}
.cr-clab{position:absolute;transform:translateX(-50%);font-family:'Caveat',cursive;font-weight:700;color:#f3dfb4;text-align:center;line-height:1.1;white-space:pre-line;opacity:0;transition:opacity 1s}
.cr-clab.in{opacity:1}
.cr-ylab{position:absolute;transform:translateX(-50%);font-family:'Playfair Display',serif;color:#e9cf9b;opacity:0;transition:opacity 1s}
.cr-ylab.in{opacity:.9}
.cr-skip{position:absolute;right:1rem;bottom:1rem;z-index:95;background:rgba(255,243,214,.1);border:1px solid rgba(255,243,214,.35);color:#f3e6c8;font-family:'Caveat',cursive;font-size:1.3rem;padding:.2rem 1rem;border-radius:999px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .6s}
.cr-skip.on{opacity:.8;pointer-events:auto}
.cr-skip:hover{opacity:1;background:rgba(255,243,214,.2)}
.cr-skip:focus-visible{outline:3px solid #ffd06a;outline-offset:2px}
.cr-snd{position:absolute;left:50%;top:1.2rem;transform:translateX(-50%);z-index:95;font-family:'Caveat',cursive;font-size:1.3rem;color:#f3e6c8;opacity:.8}`;
    document.head.appendChild(st);
  }

  /* ------------------------------------------------------------------ pieces of scenery */
  // a candle: appears (show), is lit (light), and can flare. hero candles are collected so a sweep removes them; table ones are not.
  function candle(r, color, s, cx, bottom, hero){
    const box = (hero ? r.el : r.raw)('cr-c');
    box.style.setProperty('--s', s); box.style.setProperty('--cc', color);
    box.style.left = (cx - 12 * s) + 'px'; box.style.top = (bottom - 96 * s) + 'px';
    mk('cr-halo', null, box); mk('cr-body', null, box); mk('cr-wick', null, box);
    const flame = mk('cr-flame', null, box); box.appendChild(flame);
    return { box, flame,
      show(){ box.classList.add('in'); },
      light(){ box.classList.add('lit'); },
      flare(){ box.classList.add('flare'); },
      at(){ const a = flame.getBoundingClientRect(), b = r.stage.getBoundingClientRect(); return [a.left - b.left + a.width / 2, a.top - b.top + a.height / 2]; } };
  }

  // 12 rows (months) x 31 columns (days): 365 dots
  function buildGrid(r){
    const W = r.W(), H = r.H();
    const cell = Math.max(7, Math.min(16, Math.floor(Math.min(W * 0.88 / 34.5, H * 0.34 / 12))));
    const g = r.el('cr-grid'); g.style.top = (H < 560 ? '8%' : '12%');
    g.style.setProperty('--cell', cell + 'px'); g.style.setProperty('--dot', Math.max(3, Math.round(cell * 0.5)) + 'px');
    const cells = [];
    for(let m = 0; m < 12; m++){
      const row = mk('cr-row', null, g); mk('cr-lab', MONTHS[m][0], row);
      const arr = [];
      for(let d = 1; d <= 31; d++){
        const c = mk('cr-cell', null, row), dot = mk('cr-dot', null, c);
        if(d > MLEN[m]) c.style.visibility = 'hidden';
        arr.push(dot);
      }
      cells.push(arr);
    }
    return { el:g, dot:(m, d) => cells[m - 1][d - 1] };
  }

  /* ------------------------------------------------------------------ the show */
  async function show(r, c){
    const W = r.W(), H = r.H(), Y = c.years.length;
    const [tm, td] = c.tristan, [am, ad] = c.ann;
    const pos = el => { const a = el.getBoundingClientRect(), b = r.stage.getBoundingClientRect(); return [a.left - b.left + a.width / 2, a.top - b.top + a.height / 2]; };
    const lightDot = (grid, m, d, color) => {
      const dot = grid.dot(m, d); dot.style.setProperty('--glow', color); dot.classList.add('on');
      const [x, y] = pos(dot); r.ringAt(x, y, color, 14); r.sparks(x, y, 8, ['\u2726', '\u00b7', '\u2727']);
    };

    /* ---- opening: dark, quiet ---- */
    K.music('cr_hush');
    await r.wait(1500);
    r.cap('Some days are worth showing up for.'); await r.wait(4200);
    r.cap(''); await r.wait(800);

    /* ---- ACT 1: the year ---- */
    const grid = buildGrid(r); await r.nextFrame(); grid.el.classList.add('in');
    await r.wait(2200);
    r.cap('Three hundred and sixty-five days in a year.'); await r.wait(3600);
    r.cap('You needed two of them.'); await r.wait(3400);

    const hs = Math.min(1.5, Math.max(0.9, H / 520)), base = H * 0.72;   // high enough that the captions never touch the labels
    const his = candle(r, HIS, hs, W * 0.30, base, true), hers = candle(r, HERS, hs, W * 0.70, base, true);
    const lab = (txt, x) => { const l = r.el('cr-clab', txt); l.style.left = x + 'px'; l.style.top = (base + 10) + 'px'; l.style.fontSize = 'clamp(1.1rem,4vw,1.5rem)'; return l; };
    const hisLab = lab('mine\n' + ordinal(td) + ' ' + MONTHS[tm - 1], W * 0.30), hersLab = lab('yours\n' + ordinal(ad) + ' ' + MONTHS[am - 1], W * 0.70);

    K.music('cr_wait');
    r.cap('The ' + ordinal(td) + ' of ' + MONTHS[tm - 1] + '. Mine.');
    lightDot(grid, tm, td, HIS_DOT); r.bell(74, 0, 0.14, 2.4); await r.wait(1500);
    his.show(); hisLab.classList.add('in'); await r.wait(1000);
    his.light(); r.bell(78, 0, 0.13, 2.2); { const [x, y] = his.at(); r.sparks(x, y, 10, ['\u2726', '\u2727', '\u00b7']); }
    await r.wait(2600);

    r.cap('The ' + ordinal(ad) + ' of ' + MONTHS[am - 1] + '. Yours.');
    lightDot(grid, am, ad, HERS_DOT); r.bell(81, 0, 0.14, 2.4); await r.wait(1500);
    hers.show(); hersLab.classList.add('in'); await r.wait(1000);
    hers.light(); r.bell(85, 0, 0.13, 2.2); { const [x, y] = hers.at(); r.sparks(x, y, 10, ['\u2726', '\u2727', '\u00b7']); }
    await r.wait(2600);

    // one dot lit for every day of waiting in between
    const t0 = Date.UTC(2001, tm - 1, td), gap = Math.max(2, Math.round(Math.abs(Date.UTC(2001, am - 1, ad) - t0) / 864e5));
    r.cap(cap1(words(gap)) + ' days apart.');
    for(let i = 1; i < gap; i++){
      const dt = new Date(t0 + i * 864e5);
      grid.dot(dt.getUTCMonth() + 1, dt.getUTCDate()).classList.add('soft');
      r.tone(520 + i * 14, 0, 0.09, 'triangle', 0.045);
      await r.wait(95);
    }
    await r.wait(2600);
    r.cap('And you had to be here for both.'); await r.wait(4000);
    r.cap('Same year. No second chances.'); await r.wait(3800);
    r.cap('This is one of the hardest badges to earn.'); await r.wait(4400);
    r.cap(''); await r.wait(600);
    await r.sweep(1400);
    await r.wait(500);

    /* ---- ACT 2: the years ---- */
    K.music('cr_year');
    const Wt = Math.min(W * 0.9, 820), tx = (W - Wt) / 2, ty = H * 0.70, slot = Wt / Y;
    const table = r.raw('cr-table'); table.style.left = tx + 'px'; table.style.top = ty + 'px'; table.style.width = Wt + 'px';
    await r.nextFrame(); table.classList.add('in'); await r.wait(1500);
    const s = Math.min(1.1, Math.max(0.55, slot / 60)), pairGap = Math.min(slot * 0.55, 76);
    const AGAIN = ['And then you did it again.', 'And again.', 'And again.'];
    const placed = [];
    for(let i = 0; i < Y; i++){
      const yr = c.years[i], cx = tx + slot * (i + 0.5);
      const big = r.big(String(yr), '8%', 'clamp(3rem,11vw,5.5rem)');
      r.cap(i === 0 ? 'The first year you made both.' : AGAIN[Math.min(i - 1, AGAIN.length - 1)]);
      const a = candle(r, HIS, s, cx - pairGap / 2, ty, false), b = candle(r, HERS, s, cx + pairGap / 2, ty, false);
      placed.push(a, b);
      const yl = r.raw('cr-ylab', String(yr)); yl.style.left = cx + 'px'; yl.style.top = (ty + 14) + 'px'; yl.style.fontSize = 'clamp(.9rem,3vw,1.25rem)';
      await r.wait(1500);
      a.show(); yl.classList.add('in'); await r.wait(700);
      a.light(); r.bell(74 + (i % 3) * 2, 0, 0.13, 2.2); { const [x, y] = a.at(); r.sparks(x, y, 8, ['\u2726', '\u00b7']); }
      await r.wait(1500);
      b.show(); await r.wait(700);
      b.light(); r.bell(78 + (i % 3) * 2, 0, 0.13, 2.2); { const [x, y] = b.at(); r.sparks(x, y, 8, ['\u2726', '\u00b7']); }
      await r.wait(1700);
      r.fade(big, 900); r.cap(''); await r.wait(1000);
    }

    /* ---- ACT 3: the note ---- */
    K.music('cr_glow');
    const warm = r.raw('cr-warm'); r.stage.insertBefore(warm, r.stage.firstChild); await r.nextFrame(); warm.classList.add('in');
    await r.wait(1600);
    r.cap('Two days out of three hundred and sixty-five.'); await r.wait(4600);
    r.cap('The ' + ordinal(td) + ' of ' + MONTHS[tm - 1] + ', and the ' + ordinal(ad) + ' of ' + MONTHS[am - 1] + '.'); await r.wait(4800);
    r.cap(Y > 1 ? 'And you made both of them, in ' + words(Y) + ' different years.' : 'And you made both of them.'); await r.wait(5000);
    r.cap('I do not take a single one of them for granted.'); await r.wait(5000);
    r.cap('Two candles. One very happy me.'); await r.wait(4800);
    r.cap('');
    placed.forEach(p => p.flare());                      // every candle flares at once
    r.flash(); r.quake();
    [74, 78, 81, 86].forEach((m, i) => r.bell(m, i * 0.14, 0.16, 3.2));
    r.confetti(); r.heartBurst();
    const title = r.big('Two Candles', '16%', 'clamp(2.6rem,10vw,5rem)');
    title.style.color = '#ffd98a'; title.style.letterSpacing = '.04em'; title.style.textShadow = '0 0 28px rgba(255,170,70,.7)';
    await r.wait(6500);
  }

  /* ------------------------------------------------------------------ entry point */
  function play(o, next, opts){
    opts = opts || {};
    injectCSS();
    const years = (opts.years && opts.years.length ? opts.years.slice().sort((a, b) => a - b) : [new Date().getFullYear()]);
    const c = { years, tristan:parseMd(opts.tristan || '06-27'), ann:parseMd(opts.ann || '08-05') };
    const root = mk('cr-root'); o.appendChild(root);
    const stage = mk('', null, root); stage.style.cssText = 'position:absolute;inset:0';
    const dust = mk('', null, stage);
    for(let i = 0; i < 45; i++){
      const d = mk('cr-dust', null, dust), z = 1 + Math.random() * 2;
      d.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;width:' + z + 'px;height:' + z + 'px;animation-duration:' + (14 + Math.random() * 18) + 's;animation-delay:-' + (Math.random() * 20) + 's';
    }
    const r = K.createRun(stage);
    K.ac(); K.unmute();
    let hint = null, skipped = false;
    const unlock = () => { K.ac(); if(hint){ hint.remove(); hint = null; } };
    const stop = () => { skipped = true; r.abort(); };
    const onKey = e => { if(e.key === 'Escape') stop(); else unlock(); };
    document.addEventListener('pointerdown', unlock); document.addEventListener('keydown', onKey);
    const skip = mk('cr-skip', 'skip \u203a', root); skip.setAttribute('role', 'button'); skip.tabIndex = 0;
    skip.onclick = e => { e.stopPropagation(); stop(); };
    skip.onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); stop(); } };
    const tSkip = setTimeout(() => skip.classList.add('on'), 3500);
    const tHint = setTimeout(() => { if(!K.audioReady() && !r.dead){ hint = mk('cr-snd', 'tap for sound \u266a', root); } }, 700);
    (async () => {
      try{ await show(r, c); }catch(e){ if(e !== DEAD) console.warn('[candles-reel]', e); }
      clearTimeout(tSkip); clearTimeout(tHint);
      document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', onKey);
      if(hint){ hint.remove(); hint = null; }
      skip.remove();
      r.abort();
      if(skipped){
        [...stage.children].forEach(n => { if(n !== dust) n.remove(); });
        try{ window.launchConfetti(); window.launchHeartBurst(); }catch(e){}
        await new Promise(res => setTimeout(res, 900));
      }
      K.stopMusic(1.4);
      root.style.opacity = '0';
      setTimeout(() => { root.remove(); next(); }, 950);
    })();
  }

  window.CandlesReel = { play };
})();
