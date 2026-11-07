/* ==========================================================================
   home_eggs.js - the nine home-page easter eggs, each with its own full-screen moment.
   Needs fx_kit.js loaded first. Loaded before home.js.

   HomeEggs.moments[key](run, anchor)   the payoff animation for one egg. `run` comes from FxKit.createRun(stage); `anchor` is {x,y}
                                        in stage pixels (where the egg was triggered: the postmark, the logo, the caught envelope...).
   HomeEggs.play(key, anchor, done)     plays a moment on a full-screen layer over the page (this is what home.js calls when an egg is
                                        found), then calls done() so the message box can appear. Click (after a moment) or Escape skips it.
   HomeEggs.util                        small builders the Prestige I reel reuses (postmarkSVG, envelope).

   The keys are the same as EGGS in home.js: postmark nav konami name signature tristan idle mail chase.
   To change a moment: edit its function below. To add one: add it to `moments` and to EGGS/PageEggs.
   ========================================================================== */
(function(){
  'use strict';
  const K = window.FxKit, DEAD = K.DEAD, mk = K.mk, rnd = K.rnd, esc = K.esc;
  const NS = 'http://www.w3.org/2000/svg';
  const PENTA = [72, 74, 76, 79, 81, 84, 86];     // C major pentatonic-ish, for little pops and bells

  const CSS = `
.hx-layer{position:fixed;inset:0;z-index:4800;background:radial-gradient(ellipse at 50% 40%,rgba(64,36,18,.9),rgba(14,6,2,.97));opacity:0;transition:opacity .5s;cursor:pointer}
.hx-layer.on{opacity:1}
.hx-live{position:absolute;inset:0}
/* 1 postmark */
.hx-pm{position:absolute;z-index:40;color:#e8c4a0;filter:drop-shadow(0 0 14px rgba(232,150,110,.55));opacity:0;transform:translate(-50%,-50%) scale(.12) rotate(-30deg);transition:left .75s cubic-bezier(.2,1.2,.4,1),top .75s cubic-bezier(.2,1.2,.4,1),transform .75s cubic-bezier(.2,1.5,.4,1),opacity .4s}
.hx-pm.in{opacity:.96;transform:translate(-50%,-50%) scale(1) rotate(-10deg)}
.hx-wave{position:absolute;inset:0;z-index:38;pointer-events:none;overflow:visible}
.hx-wave path{fill:none;stroke:#e8c4a0;stroke-width:2.4;stroke-linecap:round;opacity:.75;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1s ease-out}
.hx-type{position:absolute;left:0;right:0;z-index:60;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(1.9rem,8vw,3.2rem);color:#fff3d6;text-shadow:0 0 18px rgba(255,200,140,.7);padding:0 6vw;min-height:1.2em}
.hx-type u{display:inline-block;width:.07em;height:.8em;margin-left:.08em;background:#ffd76a;vertical-align:-.05em;text-decoration:none;animation:hxCur .8s steps(1) infinite}
@keyframes hxCur{50%{opacity:0}}
.hx-flyenv{position:absolute;left:-3rem;z-index:30;opacity:0;animation:hxFlyAcross var(--t) ease-in-out var(--d) forwards}
@keyframes hxFlyAcross{0%{opacity:0;transform:translate(0,0) rotate(-8deg)}12%{opacity:1}100%{opacity:0;transform:translate(var(--w),var(--dy)) rotate(12deg)}}
/* 2 cracks */
.hx-cracks{position:absolute;inset:0;z-index:30;pointer-events:none;overflow:visible}
.hx-cracks path{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}
.hx-cracks .dk{stroke:#0c0502}
.hx-cracks .gd{stroke:#ffd76a;filter:drop-shadow(0 0 5px #ffb830) drop-shadow(0 0 12px rgba(255,184,48,.7))}
.hx-mag{position:absolute;z-index:70;font-size:3.4rem;line-height:1;pointer-events:none;transform:translate(-50%,-50%);filter:drop-shadow(0 4px 8px rgba(0,0,0,.5))}
/* 3 arcade */
.hx-crt{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.1rem;background:radial-gradient(ellipse at center,#06200f,#020a05 80%);font-family:'Courier New',monospace;color:#7dff9a;text-shadow:0 0 8px rgba(125,255,154,.8);opacity:0;transition:opacity .4s}
.hx-crt.on{opacity:1}
.hx-crt::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0,rgba(0,0,0,.28) 1px,transparent 1px,transparent 3px);pointer-events:none}
.hx-keys{display:flex;gap:.22rem;flex-wrap:nowrap;justify-content:center;max-width:96vw}
.hx-key{width:min(1.9rem,8.6vw);height:min(2.1rem,9.4vw);flex:none;display:flex;align-items:center;justify-content:center;border:2px solid #2f8a4a;border-radius:.3rem;font-weight:700;font-size:1.1rem;color:#2f8a4a;text-shadow:none;transition:background .1s,color .1s}
.hx-key.lit{background:#7dff9a;color:#03140a;border-color:#7dff9a;box-shadow:0 0 14px #7dff9a}
.hx-cheat{font-size:clamp(1.5rem,7vw,2.6rem);font-weight:700;letter-spacing:.15em;opacity:0}
.hx-cheat.on{animation:hxBlink .38s steps(1) 6 forwards}
@keyframes hxBlink{0%{opacity:1}50%{opacity:.15}100%{opacity:1}}
.hx-stat{font-size:clamp(.82rem,3.7vw,1.3rem);letter-spacing:.05em;white-space:pre;min-height:1.4em;max-width:98vw}
.hx-bar{display:inline-block;position:relative;width:min(7rem,26vw);height:1.05rem;border:2px solid #7dff9a;vertical-align:-.2rem;margin-left:.3rem}
.hx-bar i{position:absolute;left:0;top:0;bottom:0;width:0;background:#7dff9a;transition:width 1.1s steps(12)}
.hx-bar.over{border-color:#ffd76a;box-shadow:0 0 14px #ffd76a}
.hx-bar.over i{background:#ffd76a;box-shadow:0 0 12px #ffd76a}
.hx-oneup{position:absolute;z-index:40;font-size:2rem;font-weight:700;color:#ff8fb0;text-shadow:0 0 12px #ff5f8f;animation:hxOneUp 1.6s ease-out forwards}
@keyframes hxOneUp{0%{opacity:0;transform:translateY(20px) scale(.5)}20%{opacity:1;transform:translateY(-10px) scale(1.3)}100%{opacity:0;transform:translateY(-90px) scale(1)}}
.hx-pix{position:absolute;top:-2rem;z-index:35;color:#ff8fb0;text-shadow:0 0 8px #ff5f8f;animation:hxPix var(--t) linear forwards;font-family:'Courier New',monospace}
@keyframes hxPix{to{transform:translateY(112vh)}}
/* 4 name */
.hx-bub{position:absolute;z-index:40;padding:.25rem .75rem;border-radius:1.2rem;background:#fffdf5;color:#7a5230;font-family:'Caveat',cursive;font-weight:700;font-size:1.45rem;line-height:1.2;box-shadow:0 3px 14px rgba(0,0,0,.4);transform:translate(-50%,-50%) scale(0);white-space:nowrap}
.hx-bub.pop{transform:translate(-50%,-50%) scale(1);transition:transform .35s cubic-bezier(.3,1.9,.5,1)}
.hx-bub.go{transform:translate(-50%,-50%) scale(.15);opacity:.4;transition:left .9s cubic-bezier(.6,0,.9,.5),top .9s cubic-bezier(.6,0,.9,.5),transform .9s ease-in,opacity .9s}
.hx-name{position:absolute;left:0;right:0;z-index:62;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(6rem,30vw,12rem);line-height:1;color:#fff3d6;text-shadow:0 0 30px rgba(255,200,120,.9),0 0 70px rgba(255,160,80,.55);opacity:0;transform:scale(.3);animation:fkPop 1.2s cubic-bezier(.2,1.6,.4,1) forwards}
/* 5 signature */
.hx-cert{position:absolute;left:50%;top:44%;z-index:40;width:min(88vw,380px);padding:1.5rem 1.4rem 2.3rem;background:#fffdf5;color:#7a5230;border:1px solid #d4b483;box-shadow:7px 7px 0 #7a5230,0 0 50px rgba(200,148,58,.3);transform:translate(-50%,-50%) scale(.5) rotate(-5deg);opacity:0;transition:transform .6s cubic-bezier(.34,1.6,.64,1),opacity .4s}
.hx-cert.in{transform:translate(-50%,-50%) scale(1) rotate(0);opacity:1}
.hx-cert::before{content:'';position:absolute;inset:-6px;border:1px dashed #f0ddb8;pointer-events:none}
.hx-ct{font-family:'Playfair Display',serif;font-size:.78rem;letter-spacing:.3em;text-transform:uppercase;text-align:center;color:#b86858;margin-bottom:.6rem}
.hx-sigbox{position:relative;height:4.4rem;border-bottom:1.5px solid #7a5230;margin-bottom:1rem}
.hx-sigtxt{position:absolute;left:0;bottom:.15rem;font-family:'Caveat',cursive;font-weight:700;font-size:3.1rem;line-height:1;color:#26356b;clip-path:inset(0 100% 0 0);white-space:nowrap}
.hx-nib{position:absolute;bottom:.4rem;left:0;font-size:1.5rem;transform:translate(-10%,0) rotate(-20deg);opacity:0}
.hx-cr{display:flex;justify-content:space-between;align-items:baseline;font-size:1.05rem;line-height:1.9;border-bottom:1px dotted #e6d2aa}
.hx-cr b{font-weight:400;font-style:italic;color:#4f8a4a;opacity:0;transform:translateX(8px);transition:opacity .35s,transform .35s}
.hx-cr b.on{opacity:1;transform:none}
.hx-cstamp{position:absolute;right:4%;bottom:-.9rem;z-index:2;padding:.25em .7em;border:.22em double #b8473a;border-radius:.3em;color:#b8473a;font-family:'Playfair Display',serif;font-weight:700;font-size:1.25rem;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;opacity:0;transform:rotate(-9deg) scale(2.6);background:rgba(255,253,245,.7)}
.hx-cstamp.on{animation:hxSlam .32s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes hxSlam{to{opacity:.95;transform:rotate(-9deg) scale(1)}}
/* 6 terminal */
.hx-term{position:absolute;left:50%;top:46%;z-index:40;width:min(90vw,430px);background:#1d1008;border:1px solid #7a5230;border-radius:.6rem;box-shadow:0 12px 40px rgba(0,0,0,.6),0 0 30px rgba(200,148,58,.2);transform:translate(-50%,-50%) scale(.7);opacity:0;transition:transform .6s cubic-bezier(.34,1.5,.64,1),opacity .4s,top 1s ease-in-out}
.hx-term.in{transform:translate(-50%,-50%) scale(1);opacity:1}
.hx-term.up{top:30%;transform:translate(-50%,-50%) scale(.9)}
.hx-th{display:flex;align-items:center;gap:.35rem;padding:.55rem .8rem;border-bottom:1px solid #4a2c14;font-family:'Courier New',monospace;font-size:.75rem;color:#a88660}
.hx-th i{width:.65rem;height:.65rem;border-radius:50%;background:#b86858}.hx-th i:nth-child(2){background:#c8943a}.hx-th i:nth-child(3){background:#7a9870}
.hx-tb{padding:.9rem 1rem 1.1rem;font-family:'Courier New',monospace;font-size:clamp(.74rem,3.1vw,.92rem);line-height:1.85;color:#f0ddb8;min-height:11.5rem;white-space:pre}
.hx-tb .ok{color:#8fe08a}
.hx-hand{position:absolute;left:50%;z-index:60;font-size:4.4rem;line-height:1;transform:translate(-50%,-50%) scale(0);transition:transform .6s cubic-bezier(.3,1.9,.5,1)}
.hx-hand.in{transform:translate(-50%,-50%) scale(1);animation:hxWave 1s ease-in-out .6s 3}
@keyframes hxWave{0%,100%{transform:translate(-50%,-50%) rotate(0)}25%{transform:translate(-50%,-50%) rotate(18deg)}75%{transform:translate(-50%,-50%) rotate(-14deg)}}
/* 7 + 8 envelopes */
.hx-envb{position:absolute;width:var(--w);height:calc(var(--w) * .66);z-index:40;transform:translate(-50%,-50%) scale(var(--s,1))}
.hx-eback{position:absolute;inset:0;background:#e9d3a8;border-radius:5px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.hx-eletter{position:absolute;left:7%;right:7%;top:9%;bottom:6%;z-index:2;background:#fffdf5;border-radius:3px;box-shadow:inset 0 0 0 1px #e6d2aa;transition:transform .9s cubic-bezier(.3,1.25,.4,1);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#7a5230;text-align:center;overflow:hidden}
.hx-efront{position:absolute;inset:0;z-index:3;background:linear-gradient(135deg,#f1dfb8,#e4cb98);clip-path:polygon(0 0,50% 54%,100% 0,100% 100%,0 100%);border-radius:5px}
.hx-eflap{position:absolute;left:0;right:0;top:0;height:54%;z-index:4;background:linear-gradient(#e6cf9c,#d8ba80);clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:50% 0;transition:transform .55s ease-in-out}
.hx-envb.open .hx-eflap{transform:scaleY(-1);z-index:1}
.hx-envb.up .hx-eletter{transform:translateY(-84%)}
.hx-lt1{font-family:'Caveat',cursive;font-weight:700;font-size:calc(var(--w) * .17);line-height:1;color:#b86858}
.hx-lt2{font-family:'Playfair Display',serif;font-style:italic;font-size:calc(var(--w) * .062);margin-top:.3em}
.hx-circ{position:absolute;z-index:30;font-size:1.5rem;opacity:0;transform:translate(-50%,-50%)}
.hx-addr{position:absolute;left:50%;top:60%;z-index:6;transform:translate(-50%,-50%) rotate(-3deg);text-align:center;font-family:'Caveat',cursive;font-weight:700;color:#5a3a1c;line-height:1.1;white-space:nowrap;opacity:0;transition:opacity .5s}
.hx-addr.on{opacity:1}
.hx-estamp{position:absolute;right:5%;top:8%;z-index:6;width:16%;aspect-ratio:3/4;background:#fffdf5;border:2px dashed #d4b483;display:flex;align-items:center;justify-content:center;color:#b86858;font-size:calc(var(--w) * .09);opacity:0;transform:scale(2.4) rotate(12deg);box-shadow:0 2px 6px rgba(0,0,0,.25)}
.hx-estamp.on{animation:hxStampIn .3s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes hxStampIn{to{opacity:1;transform:scale(1) rotate(5deg)}}
.hx-epm{position:absolute;right:-1%;top:-3%;z-index:7;width:34%;color:#7a5230;opacity:0;transform:rotate(-14deg) scale(1.8)}
.hx-epm.on{animation:hxPm .3s ease-out forwards}
@keyframes hxPm{to{opacity:.6;transform:rotate(-14deg) scale(1)}}
.hx-stampfly{position:absolute;z-index:42;width:3rem;aspect-ratio:3/4;background:#fffdf5;border:2px dashed #d4b483;display:flex;align-items:center;justify-content:center;color:#b86858;font-size:1.4rem;transform:translate(-50%,-50%) rotate(-12deg);transition:left .7s cubic-bezier(.5,0,.3,1),top .7s cubic-bezier(.5,0,.3,1),transform .7s}
/* 9 shy heart */
.hx-sh{position:absolute;z-index:50;transform:translate(-50%,-50%);filter:drop-shadow(0 0 16px rgba(255,126,157,.65))}
.hx-sh.trem{animation:hxTrem .12s linear infinite}
@keyframes hxTrem{0%{margin:0 0 0 0}25%{margin:-2px 0 0 2px}50%{margin:2px 0 0 -1px}75%{margin:-1px 0 0 -2px}100%{margin:0}}
.hx-sh .hp{display:none}.hx-sh .hw{display:inline}
.hx-sh.happy .hw{display:none}.hx-sh.happy .hp{display:inline}
.hx-sh .blush{opacity:0;transition:opacity .8s}.hx-sh.happy .blush,.hx-sh.shy .blush{opacity:.6}
.hx-trail{position:absolute;z-index:45;color:#ff9fb8;pointer-events:none;transform:translate(-50%,-50%);animation:hxTrail 1.1s ease-out forwards}
@keyframes hxTrail{to{opacity:0;transform:translate(-50%,-90%) scale(.3)}}
`;
  let cssDone = false;
  function injectCSS(){ if(cssDone) return; cssDone = true; const st = document.createElement('style'); st.id = 'hx-css'; st.textContent = CSS; document.head.appendChild(st); }

  /* ------------------------------------------------------------------ small builders (the reel reuses these) */
  let uid = 0;
  function postmarkSVG(top, mid1, mid2){
    const id = 'hxpm' + (++uid);
    return '<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><path id="' + id + '" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"/></defs>' +
      '<circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<text font-family="Playfair Display,serif" font-weight="700" font-size="8.4" fill="currentColor"><textPath href="#' + id + '" textLength="226" lengthAdjust="spacing">' + esc(top) + '</textPath></text>' +
      '<text x="50" y="49" text-anchor="middle" font-family="Caveat,cursive" font-weight="700" font-size="15" fill="currentColor">' + esc(mid1) + '</text>' +
      '<text x="50" y="62" text-anchor="middle" font-family="Playfair Display,serif" font-size="6.5" letter-spacing="1" fill="currentColor">' + esc(mid2) + '</text></svg>';
  }
  const dateShort = () => { const d = new Date(); return d.getDate() + ' ' + ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]; };
  function envelope(r, w, lines){
    const e = r.el('hx-envb'); e.style.setProperty('--w', w + 'px');
    e.innerHTML = '<div class="hx-eback"></div><div class="hx-eletter">' + (lines || '') + '</div><div class="hx-efront"></div><div class="hx-eflap"></div>';
    return e;
  }
  const svgEl = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(k => n.setAttribute(k, attrs[k])); return n; };
  const center = r => ({ x:r.W() / 2, y:r.H() * 0.46 });

  /* ------------------------------------------------------------------ the nine moments */
  const moments = {

    // 1 - five clicks on the postmark: five rubber-stamp thumps, then a giant postmark slams down and a secret is typed beneath it
    async postmark(r, a){
      const W = r.W(), H = r.H(), c = center(r); a = a || c;
      for(let k = 0; k < 5; k++){
        r.ringAt(a.x, a.y, '#e8a98a', 3 + k * 0.7); r.thud(0.25 + k * 0.04, 150 + k * 30); r.bell(PENTA[k] , 0, 0.06, 1);
        r.word(String(k + 1), a.x, a.y - 26, '#ffe9c0'); r.quake();
        await r.wait(440);
      }
      const size = Math.min(W * 0.78, 340);
      const pm = r.el('hx-pm'); pm.style.width = pm.style.height = size + 'px'; pm.style.left = a.x + 'px'; pm.style.top = a.y + 'px';
      pm.innerHTML = postmarkSVG('FROM THE UK \u2726 WITH LOVE \u2726 ', 'Bestie', dateShort());
      await r.nextFrame();
      pm.style.left = c.x + 'px'; pm.style.top = c.y - H * 0.04 + 'px'; pm.classList.add('in');
      r.tone(180, 0, 0.7, 'sine', 0.08, 700);
      await r.wait(780);
      r.flash(); r.quake(); r.thud(0.6, 90); r.bell(60, 0, 0.18, 3); r.bell(72, 0.05, 0.12, 2.5); r.bell(79, 0.1, 0.1, 2.2);
      r.sparks(c.x, c.y - H * 0.04, 16, ['\u25cf', '\u2726', '\u2709']);
      // the cancellation waves roll across
      const sv = svgEl('svg', { width:W, height:H, viewBox:'0 0 ' + W + ' ' + H, class:'hx-wave' }); r.stage.appendChild(sv); r.collect.push(sv);
      for(let i = 0; i < 5; i++){
        const y = c.y - H * 0.04 - 38 + i * 19;
        const p = svgEl('path', { d:'M-20,' + y + ' Q' + W * 0.125 + ',' + (y - 15) + ' ' + W * 0.25 + ',' + y + ' T' + W * 0.5 + ',' + y + ' T' + W * 0.75 + ',' + y + ' T' + (W + 20) + ',' + y, pathLength:1 });
        sv.appendChild(p); r.later(() => { p.style.strokeDashoffset = '0'; }, 40 + i * 90);
      }
      // a flock of airmail
      for(let i = 0; i < 7; i++){
        const e = r.el('hx-flyenv', '\u2709'); e.style.top = rnd(8, 88) + '%'; e.style.fontSize = rnd(1.2, 2.3) + 'rem';
        e.style.setProperty('--w', (W + 120) + 'px'); e.style.setProperty('--dy', rnd(-60, 60) + 'px'); e.style.setProperty('--t', rnd(2.4, 3.6) + 's'); e.style.setProperty('--d', rnd(0.1, 1.6) + 's');
      }
      r.heartBurst();
      await r.wait(1000);
      const t = r.el('hx-type'); t.style.top = Math.min(H * 0.8, c.y + size * 0.62) + 'px';
      const cur = document.createElement('u'); t.appendChild(cur);
      const holder = document.createElement('span'); t.insertBefore(holder, cur);
      await r.type(holder, 'psst. you are super duper cool.', 70, (i, ch) => { if(ch !== ' ') r.tone(900 + (i % 5) * 60, 0, 0.03, 'square', 0.025); });
      r.bell(84, 0, 0.1, 2); r.hearts(c.x, t.offsetTop, 10); r.confetti();
      await r.wait(2400);
    },

    // 2 - seven clicks on the logo: it inspects the wallpaper for cracks, finds them, and they fill with gold
    async nav(r, a){
      const W = r.W(), H = r.H(), c = center(r); a = a || { x:W / 2, y:H * 0.2 };
      const sv = svgEl('svg', { width:W, height:H, viewBox:'0 0 ' + W + ' ' + H, class:'hx-cracks' }); r.stage.appendChild(sv); r.collect.push(sv);
      const cracks = [];
      const crack = (x, y, ang, len, w, depth) => {
        let d = 'M' + x.toFixed(1) + ',' + y.toFixed(1), px = x, py = y, tot = 0;
        while(tot < len){
          const seg = rnd(24, 54); ang += rnd(-0.55, 0.55); px += Math.cos(ang) * seg; py += Math.sin(ang) * seg; d += ' L' + px.toFixed(1) + ',' + py.toFixed(1); tot += seg;
          if(depth < 1 && Math.random() < 0.3) crack(px, py, ang + (Math.random() < 0.5 ? 1 : -1) * rnd(0.5, 1.0), len * rnd(0.25, 0.45), w * 0.6, depth + 1);
        }
        cracks.push({ d, w });
      };
      // fan the cracks out across the screen: mostly downward and sideways from wherever the logo is, with a couple going up
      const downwards = a.y < H * 0.5;
      for(let k = 0; k < 11; k++){
        const t = k / 10, ang = downwards ? (-0.12 + t * 1.24) * Math.PI + rnd(-0.1, 0.1) : (t * 2) * Math.PI + rnd(-0.15, 0.15);
        crack(a.x, a.y, ang, Math.max(W, H) * rnd(0.6, 1.0), 3.4, 0);
      }
      const dark = [], gold = [];
      cracks.forEach(cr => {
        const dk = svgEl('path', { class:'dk', d:cr.d, pathLength:1, 'stroke-width':cr.w + 1.6 }), gd = svgEl('path', { class:'gd', d:cr.d, pathLength:1, 'stroke-width':cr.w });
        sv.appendChild(dk); sv.appendChild(gd); dark.push(dk); gold.push(gd);
      });
      // the inspector sweeps in with a magnifying glass
      const mag = r.el('hx-mag', '\ud83d\udd0d');
      const sweep = r.tween(2600, p => { mag.style.left = (W * (0.08 + 0.84 * p)) + 'px'; mag.style.top = (H * 0.62 + Math.sin(p * 11) * H * 0.07) + 'px'; mag.style.transform = 'translate(-50%,-50%) rotate(' + Math.sin(p * 17) * 14 + 'deg) scale(' + (1 + 0.15 * Math.sin(p * 6)) + ')'; });
      r.tone(300, 0, 2.4, 'sine', 0.04, 360);
      await r.wait(1200);
      // snap: cracks appear one by one
      r.quake(); r.thud(0.45, 80);
      dark.forEach((p, i) => r.later(() => { p.style.transition = 'stroke-dashoffset .6s ease-out'; p.style.strokeDashoffset = '0'; r.noise(0.12, 0.1, 2400, 900); r.tone(120 + i * 12, 0, 0.12, 'square', 0.04); }, i * 110));
      await sweep; r.fade(mag, 500);
      await r.wait(900);
      // kintsugi: gold runs through every one of them
      r.cap('nothing broken. only golden.');
      gold.forEach((p, i) => r.later(() => { p.style.transition = 'stroke-dashoffset 1s ease-in-out'; p.style.strokeDashoffset = '0'; r.bell(PENTA[i % PENTA.length] - 12 + 12, 0, 0.08, 2); }, i * 130));
      await r.wait(1500);
      r.flash(); r.ringAt(a.x, a.y, '#ffd76a', 34);
      r.big('no cracks here', '40%', 'clamp(2.8rem,11vw,5.2rem)', 0.1); r.sub('just a thank you \u2661', 'calc(40% + clamp(3.9rem,13.5vw,6.6rem))', 1);
      r.heartBurst();
      await r.wait(3800); r.cap('');
    },

    // 3 - the konami code: an arcade cheat screen
    async konami(r){
      const W = r.W(), crt = r.el('hx-crt');
      const keys = ['\u2191', '\u2191', '\u2193', '\u2193', '\u2190', '\u2192', '\u2190', '\u2192', 'B', 'A'];
      const row = mk('hx-keys', null, crt), kEls = keys.map(k => { const e = mk('hx-key', k, row); return e; });
      const cheat = mk('hx-cheat', 'CHEAT ACTIVATED', crt);
      const s1 = mk('hx-stat', '', crt), s2 = mk('hx-stat', '', crt), s3 = mk('hx-stat', '', crt);
      await r.nextFrame(); crt.classList.add('on');
      await r.wait(700);
      for(let i = 0; i < keys.length; i++){ kEls[i].classList.add('lit'); r.chip(330 + i * 42, 0, 0.1, 0.06); await r.wait(250); }
      await r.wait(250);
      cheat.classList.add('on'); [262, 330, 392, 523, 392, 523, 659].forEach((f, i) => r.chip(f, i * 0.09, 0.12, 0.07));
      await r.wait(1500);
      await r.type(s1, 'HUGS ......... \u221e', 55, () => r.chip(1100, 0, 0.02, 0.03)); await r.wait(250);
      await r.type(s2, 'LIVES ........ \u2665\u2665\u2665\u2665 \u221e', 55, () => r.chip(1100, 0, 0.02, 0.03)); await r.wait(250);
      await r.type(s3, 'LOVED ........ ', 55, () => r.chip(1100, 0, 0.02, 0.03));
      const bar = mk('hx-bar', null, s3); const bi = document.createElement('i'); bar.appendChild(bi);
      await r.nextFrame(); bi.style.width = '100%';
      for(let i = 0; i < 12; i++) r.chip(400 + i * 55, i * 0.09, 0.07, 0.05);
      await r.wait(1300);
      // it overflows
      bar.classList.add('over'); s3.appendChild(document.createTextNode(' +10!'));
      [523, 659, 784, 1047, 1319].forEach((f, i) => r.chip(f, i * 0.07, 0.14, 0.08));
      r.flash(); r.quake();
      const up = r.el('hx-oneup', '1UP \u2665'); up.style.left = (W / 2 - 34) + 'px'; up.style.top = '30%';
      for(let i = 0; i < 26; i++){ const p = r.el('hx-pix', i % 3 ? '\u2665' : '\u2661'); p.style.left = rnd(2, 96) + '%'; p.style.fontSize = rnd(1, 2.1) + 'rem'; p.style.setProperty('--t', rnd(2.2, 4) + 's'); p.style.animationDelay = rnd(0, 1.4) + 's'; }
      r.heartBurst();
      await r.wait(3200);
    },

    // 4 - typing "ann": a crowd calls her name, then the voices rush together
    async name(r){
      const W = r.W(), H = r.H(), c = center(r);
      const words = ['Ann?', 'Ann!', 'Ann \u2661', 'ANN', 'hey Ann', 'Ann!!', 'oh, Ann', 'Ann :)', 'Annie?', 'Ann \u2661', 'Ann!', 'hi Ann', 'Ann?!', 'Ann \u2726'];
      const bubs = [];
      for(let i = 0; i < words.length; i++){
        const ang = (i / words.length) * Math.PI * 2 + rnd(-0.18, 0.18), rx = W * rnd(0.3, 0.44), ry = H * rnd(0.26, 0.4);
        const b = r.el('hx-bub', words[i]); b.style.left = (c.x + Math.cos(ang) * rx) + 'px'; b.style.top = (c.y + Math.sin(ang) * ry) + 'px'; b.style.fontSize = rnd(1.15, 1.9) + 'rem';
        bubs.push(b);
        r.later(() => { b.classList.add('pop'); r.bell(PENTA[i % PENTA.length], 0, 0.07, 1); }, 300 + i * 150);
      }
      await r.wait(300 + words.length * 150 + 900);
      r.tone(200, 0, 1.1, 'sine', 0.09, 900);
      bubs.forEach((b, i) => r.later(() => { b.classList.add('go'); b.style.left = c.x + 'px'; b.style.top = c.y + 'px'; }, i * 25));
      await r.wait(1250);
      r.flash(); r.bell(72, 0, 0.16, 3); r.bell(79, 0.08, 0.12, 3); r.bell(84, 0.16, 0.1, 3); r.bell(88, 0.24, 0.08, 3);
      const nm = r.el('hx-name', 'Ann'); nm.style.top = (c.y - Math.min(W * 0.17, 90)) + 'px';
      [0, 300, 600].forEach(d => r.later(() => r.ringAt(c.x, c.y, '#ffd76a', 30), d));
      for(let i = 0; i < 18; i++) r.later(() => r.sparks(rnd(W * 0.15, W * 0.85), c.y + rnd(0, H * 0.3), 1, ['\u2726']), i * 90);
      r.sub('somewhere, the world is a slightly better place', '66%', 1.2); r.sub('because you are in it \u2661', 'calc(66% + 2rem)', 2);
      r.heartBurst(); r.confetti();
      await r.wait(4600);
    },

    // 5 - double-click the signature: it gets verified
    async signature(r){
      const c = center(r);
      const card = r.el('hx-cert');
      card.innerHTML = '<div class="hx-ct">Signature check</div><div class="hx-sigbox"><div class="hx-sigtxt">Bestie Tristan</div><div class="hx-nib">\u2712\ufe0f</div></div>' +
        '<div class="hx-cr"><span>handwriting</span><b>match</b></div><div class="hx-cr"><span>ink</span><b>still wet</b></div><div class="hx-cr"><span>sincerity</span><b>100%</b></div><div class="hx-cr"><span>typos</span><b>charming</b></div><div class="hx-cstamp">It\u2019s really me</div>';
      await r.nextFrame(); card.classList.add('in'); r.bell(72, 0, 0.08, 1.5);
      await r.wait(900);
      const txt = card.querySelector('.hx-sigtxt'), nib = card.querySelector('.hx-nib'), full = txt.scrollWidth;
      nib.style.opacity = '1';
      r.tone(700, 0, 1.6, 'sawtooth', 0.012, 640);
      await r.tween(1700, p => { const x = full * p; txt.style.clipPath = 'inset(0 ' + (100 - p * 100) + '% 0 0)'; nib.style.left = x + 'px'; nib.style.bottom = (0.4 + Math.sin(p * 22) * 0.35) + 'rem'; });
      nib.style.opacity = '0';
      await r.wait(300);
      const bs = card.querySelectorAll('.hx-cr b');
      for(let i = 0; i < bs.length; i++){ bs[i].classList.add('on'); r.chip(660 + i * 110, 0, 0.1, 0.07); r.bell(PENTA[i + 2], 0, 0.06, 1); await r.wait(650); }
      await r.wait(500);
      card.querySelector('.hx-cstamp').classList.add('on');
      r.thud(0.55, 110); r.quake(); r.flash(); r.bell(60, 0, 0.16, 3); r.heartBurst();
      r.sparks(c.x + 60, c.y + 60, 12, ['\u25cf', '\u2726']);
      await r.wait(3200);
    },

    // 6 - typing "tristan": a build log, then a wave
    async tristan(r){
      const W = r.W(), H = r.H(), c = center(r);
      const term = r.el('hx-term');
      term.innerHTML = '<div class="hx-th"><i></i><i></i><i></i><span style="margin-left:.4rem">hours.log</span></div><div class="hx-tb"></div>';
      const body = term.querySelector('.hx-tb');
      await r.nextFrame(); term.classList.add('in'); r.bell(72, 0, 0.07, 1.4);
      await r.wait(800);
      const lines = [['> stamps ............. ', 'done \u2713'], ['> postmark ........... ', 'done \u2713'], ['> nine secrets ....... ', 'hidden \u2713'], ['> extra hours ........ ', 'lots \u2713'], ['> was it worth it? ... ', 'yes \u2713\u2713\u2713']];
      for(let i = 0; i < lines.length; i++){
        const ln = document.createElement('div'); body.appendChild(ln);
        const a1 = document.createElement('span'), a2 = document.createElement('span'); a2.className = 'ok'; ln.appendChild(a1); ln.appendChild(a2);
        await r.type(a1, lines[i][0], 26, (k, ch) => { if(k % 2 === 0) r.tone(1500 + rnd(-200, 200), 0, 0.02, 'square', 0.02); });
        await r.wait(220);
        a2.textContent = lines[i][1]; r.bell(PENTA[i + 1], 0, 0.08, 1.2); r.chip(880 + i * 110, 0, 0.08, 0.04);
        await r.wait(i === lines.length - 1 ? 900 : 420);
      }
      term.classList.add('up');
      await r.wait(900);
      const hand = r.el('hx-hand', '\ud83d\udc4b'); hand.style.top = (H * 0.58) + 'px'; await r.nextFrame(); hand.classList.add('in');
      r.bell(79, 0, 0.12, 2); r.bell(84, 0.1, 0.1, 2);
      r.big('hi, it\u2019s me', (H * 0.58 + 40) + 'px', 'clamp(2.8rem,12vw,5rem)', 0.4);
      r.sub('worth every one of the hours \u2661', (H * 0.58 + 40 + Math.min(W * 0.14, 70) + 24) + 'px', 1.2);
      r.hearts(c.x, H * 0.6, 12); r.heartBurst();
      await r.wait(4300);
    },

    // 7 - catching the drifting envelope: it opens in mid-air
    async idle(r, a){
      const W = r.W(), H = r.H(), c = center(r); a = a || { x:W * 0.5, y:H * 0.4 };
      const w = Math.min(W * 0.62, 280);
      const env = envelope(r, w, '<div class="hx-lt1">To: Ann</div><div class="hx-lt2">special delivery</div><div class="hx-lt2" style="opacity:.7">caught mid-air \u2661</div>');
      env.style.left = a.x + 'px'; env.style.top = a.y + 'px'; env.style.setProperty('--s', '.18');
      env.style.transition = 'left .9s cubic-bezier(.3,1.3,.5,1),top .9s cubic-bezier(.3,1.3,.5,1),transform .9s cubic-bezier(.3,1.5,.5,1)';
      await r.nextFrame();
      env.style.left = c.x + 'px'; env.style.top = (c.y + H * 0.06) + 'px'; env.style.setProperty('--s', '1');
      r.tone(300, 0, 0.8, 'sine', 0.08, 900); r.sparks(a.x, a.y, 8, ['\u2726', '\u2709']);
      await r.wait(1100);
      // the little ones that have been circling the page since forever
      const circ = [];
      for(let k = 0; k < 8; k++){ const e = r.el('hx-circ', '\u2709'); circ.push(e); }
      r.tween(3800, p => { circ.forEach((e, k) => { const th = p * Math.PI * 2 + k * Math.PI * 2 / 8; e.style.left = (c.x + Math.cos(th) * W * 0.44) + 'px'; e.style.top = (c.y + Math.sin(th) * H * 0.38) + 'px'; e.style.opacity = String(Math.sin(p * Math.PI) * 0.9); e.style.transform = 'translate(-50%,-50%) rotate(' + (th * 57 + 90) + 'deg)'; }); }).catch(() => {});
      r.cap('it has been circling since I started building this');
      await r.wait(700);
      env.classList.add('open'); r.noise(0.2, 0.06, 1800, 900); r.bell(76, 0, 0.1, 2);
      await r.wait(700);
      env.classList.add('up'); r.bell(81, 0, 0.1, 2); r.bell(84, 0.1, 0.08, 2); r.hearts(c.x, c.y, 12);
      r.heartBurst();
      await r.wait(3800); r.cap('');
    },

    // 8 - dragging the stamp onto the postmark: the whole page gets posted
    async mail(r, a){
      const W = r.W(), H = r.H(), c = center(r); a = a || { x:W * 0.8, y:H * 0.15 };
      // the stamp lands on the postmark
      const st = r.el('hx-stampfly', '\u2661'); st.style.left = (a.x - 80) + 'px'; st.style.top = (a.y + 40) + 'px';
      await r.nextFrame(); st.style.left = a.x + 'px'; st.style.top = a.y + 'px';
      await r.wait(750);
      r.thud(0.45, 130); r.quake(); r.ringAt(a.x, a.y, '#e8a98a', 8); r.sparks(a.x, a.y, 8, ['\u25cf', '\u2661']);
      r.fade(st, 500);
      await r.wait(600);
      r.cap('and the whole thing goes in the post');
      // a big envelope rises, holding the page
      const w = Math.min(W * 0.78, 330);
      const env = envelope(r, w, '<div class="hx-lt1" style="font-size:calc(var(--w)*.11)">Tristan &amp; Ann</div><div class="hx-lt2">besties \u2661</div>');
      env.classList.add('open', 'up'); env.style.left = c.x + 'px'; env.style.top = (H + w) + 'px';
      env.style.transition = 'top 1.1s cubic-bezier(.3,1.2,.5,1)';
      await r.nextFrame(); env.style.top = (c.y + H * 0.04) + 'px';
      r.tone(220, 0, 1, 'sine', 0.07, 600);
      await r.wait(1500);
      env.classList.remove('up'); await r.wait(650);
      env.classList.remove('open'); r.noise(0.15, 0.08, 1500, 600); r.bell(72, 0, 0.1, 1.5);
      await r.wait(800);
      const stp = mk('hx-estamp', '\u2661'); env.appendChild(stp);
      const pmk = mk('hx-epm'); pmk.innerHTML = postmarkSVG('POSTED WITH LOVE \u2726 ', 'sent', dateShort()); env.appendChild(pmk);
      const ad = mk('hx-addr'); ad.innerHTML = '<div style="font-size:calc(var(--w)*.12)">To: Tristan</div><div style="font-size:calc(var(--w)*.075);opacity:.8">from Ann, with love</div>'; env.appendChild(ad);
      await r.nextFrame(); stp.classList.add('on'); r.thud(0.4, 140); await r.wait(420); pmk.classList.add('on'); r.thud(0.5, 100); r.quake(); ad.classList.add('on');
      await r.wait(1500);
      // away it goes
      env.style.transition = 'top 1.5s cubic-bezier(.6,0,.9,.4),transform 1.5s ease-in,opacity 1.5s';
      env.style.top = (-w) + 'px'; env.style.setProperty('--s', '.4'); env.style.opacity = '0';
      r.tone(200, 0, 1.5, 'sine', 0.08, 1100);
      const trail = r.every(() => { const y = env.getBoundingClientRect().top - r.stage.getBoundingClientRect().top + w * 0.3; r.sparks(c.x + rnd(-40, 40), y, 1, ['\u2661', '\u2709']); }, 70);
      await r.wait(1500); r.stopEvery(trail);
      r.cap('');
      r.big('sent \u2661', '38%', 'clamp(3.4rem,15vw,6.4rem)', 0.1); r.sub('I already know. same, probbers.', 'calc(38% + clamp(4.2rem,17vw,7.6rem))', 1.1);
      r.heartBurst(); r.confetti(); [74, 79, 83, 86].forEach((m, i) => r.bell(m, i * 0.1, 0.1, 2.4));
      await r.wait(3800);
    },

    // 9 - cornering the shy heart: it finally comes toward you
    async chase(r, a){
      const W = r.W(), H = r.H(), c = center(r); a = a || { x:W - 50, y:50 };
      const size0 = 58, big = Math.min(W * 0.5, 250);
      const h = r.el('hx-sh trem');
      h.innerHTML = '<svg viewBox="0 0 100 90" width="100%" height="100%"><defs><linearGradient id="hxhg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9fb8"/><stop offset="1" stop-color="#e45f86"/></linearGradient></defs>' +
        '<path d="M50 84 C 8 54, 4 22, 26 12 C 40 6, 50 16, 50 24 C 50 16, 60 6, 74 12 C 96 22, 92 54, 50 84 Z" fill="url(#hxhg)"/>' +
        '<circle class="blush" cx="27" cy="52" r="6.5" fill="#ff3f73"/><circle class="blush" cx="73" cy="52" r="6.5" fill="#ff3f73"/>' +
        '<g class="hw"><ellipse cx="36" cy="40" rx="4.4" ry="6" fill="#3a2010"/><ellipse cx="64" cy="40" rx="4.4" ry="6" fill="#3a2010"/><circle cx="37.4" cy="37.6" r="1.5" fill="#fff"/><circle cx="65.4" cy="37.6" r="1.5" fill="#fff"/><path d="M43 60 q3.5 -3.5 7 0 t7 0" fill="none" stroke="#3a2010" stroke-width="2.2" stroke-linecap="round"/></g>' +
        '<g class="hp"><path d="M30 42 Q36 34 42 42" fill="none" stroke="#3a2010" stroke-width="2.6" stroke-linecap="round"/><path d="M58 42 Q64 34 70 42" fill="none" stroke="#3a2010" stroke-width="2.6" stroke-linecap="round"/><path d="M42 55 Q50 66 58 55" fill="none" stroke="#3a2010" stroke-width="2.6" stroke-linecap="round"/></g></svg>';
      const place = (x, y, s) => { h.style.left = x + 'px'; h.style.top = y + 'px'; h.style.width = s + 'px'; h.style.height = (s * 0.9) + 'px'; };
      place(a.x, a.y, size0);
      r.cap('it did not want to be caught');
      await r.wait(1500);
      r.cap('');
      // it floats toward you, trembling, trailing hearts
      const bx = (a.x + c.x) / 2 + W * 0.12, by = (a.y + c.y) / 2 - H * 0.12;
      let last = 0; r.tone(250, 0, 1.8, 'sine', 0.05, 520);
      await r.tween(1900, p => {
        const e = p * p * (3 - 2 * p), x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * bx + e * e * c.x, y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * by + e * e * c.y;
        place(x, y, size0 + (big - size0) * e);
        if(p - last > 0.04){ last = p; const t = mk('hx-trail', '\u2661'); t.style.left = x + 'px'; t.style.top = y + 'px'; t.style.fontSize = rnd(0.9, 1.7) + 'rem'; r.fx(t, 1200); }
      });
      h.classList.remove('trem'); h.classList.add('shy');
      await r.wait(500);
      // a heartbeat or three, and it relaxes
      for(let k = 0; k < 3; k++){
        r.thud(0.34, 80); r.later(() => r.thud(0.26, 80), 220);
        h.style.transition = 'transform .15s'; h.style.transform = 'translate(-50%,-50%) scale(1.12)'; r.later(() => { h.style.transform = 'translate(-50%,-50%) scale(1)'; }, 170);
        r.ringAt(c.x, c.y, '#ff8fb0', 14);
        await r.wait(780);
        if(k === 1) h.classList.add('happy');
      }
      r.flash(); [72, 76, 79, 84].forEach((m, i) => r.bell(m, i * 0.09, 0.11, 2.4));
      r.big('caught \u2661', (c.y + big * 0.55) + 'px', 'clamp(3rem,13vw,5.4rem)', 0.1);
      r.sub('nowhere left to go but toward you', (c.y + big * 0.55 + Math.min(W * 0.14, 70) + 26) + 'px', 1.1);
      r.hearts(c.x, c.y, 16); r.heartBurst(); r.confetti();
      await r.wait(4200);
    }
  };

  /* ------------------------------------------------------------------ the live player */
  function play(key, anchor, done){
    const fin = typeof done === 'function' ? done : () => {};
    const mom = moments[key];
    if(!mom || K.reduced()){ fin(); return; }
    injectCSS();
    const layer = mk('hx-layer'); document.body.appendChild(layer);
    const stage = mk('hx-live', null, layer);
    const r = K.createRun(stage);
    K.ac(); K.unmute();
    requestAnimationFrame(() => layer.classList.add('on'));
    const t0 = performance.now();
    let over = false;
    const onKey = e => { if(e.key === 'Escape') finish(); };
    const finish = () => {
      if(over) return; over = true;
      r.abort(); window.removeEventListener('keydown', onKey);
      layer.classList.remove('on'); setTimeout(() => { layer.remove(); fin(); }, 480);
    };
    layer.addEventListener('click', () => { if(performance.now() - t0 > 1800) finish(); });
    window.addEventListener('keydown', onKey);
    mom(r, anchor).then(() => finish(), e => { if(e !== DEAD) console.warn('[home-eggs]', key, e); finish(); });
  }

  window.HomeEggs = { moments, play, injectCSS, util:{ postmarkSVG, envelope, dateShort, svgEl, center, PENTA } };
})();
