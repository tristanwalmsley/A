/* home_wrapped.js - full-width "2026 Wrapped" hero on the home page, placed just above "Everywhere to go".
   Hidden before SHOW; sealed teaser + countdown from SHOW until OPEN; then an unsealed "open it" hero.
   Test any day with ?date=YYYY-MM-DD on index.html. Self-contained: injects its own CSS and canvas. */
(function(){
  'use strict';
  const SHOW = '2026-12-01', OPEN = '2026-12-27', PAGE = 'year_in_review.html', YEAR = 2026;   /* EDIT ME */
  const dm = (location.search.match(/[?&]date=(\d{4}-\d{2}-\d{2})/) || [])[1], t0 = Date.now();
  const now = () => dm ? new Date(new Date(dm + 'T12:00:00').getTime() + Date.now() - t0) : new Date();
  const at = s => new Date(s + 'T00:00:00');
  if(now() < at(SHOW)) return;
  const anchor = document.querySelector('section.wrap[aria-labelledby="go-title"]'); if(!anchor) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const css = document.createElement('style');
  css.textContent = `
  html{overflow-x:clip}
  .wr-full{position:relative;overflow:hidden;isolation:isolate;width:100vw;margin:2.4rem 0 2.8rem calc(50% - 50vw);background:#0d0703;color:#fff8ea;text-align:center;--px:0;--py:0}
  .wr-bg{position:absolute;inset:0;z-index:-2}
  .wr-au{position:absolute;width:60vmax;height:60vmax;border-radius:50%;filter:blur(80px);opacity:.5;animation:wrDr 18s ease-in-out infinite alternate}
  .wr-au:nth-child(1){left:-15vmax;top:-22vmax;background:#c06a1c}.wr-au:nth-child(2){right:-22vmax;top:4vmax;background:#a8325a;animation-delay:-6s}.wr-au:nth-child(3){left:22vw;bottom:-38vmax;background:#2e3590;animation-delay:-12s}
  @keyframes wrDr{to{transform:translate(8vmax,6vmax) scale(1.18)}}
  .wr-cv{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
  .wr-gr{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.17;mix-blend-mode:overlay;background:${GR}}
  .wr-edge{position:relative;z-index:3;height:3px;background:linear-gradient(90deg,transparent,#ffc95e 20%,#ffe9a8 50%,#ffc95e 80%,transparent);box-shadow:0 0 18px rgba(255,201,94,.5)}
  .wr-in{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:3.4rem 1.2rem 3.8rem}
  .wr-kick{font:600 clamp(1.5rem,4vw,2.1rem) 'Caveat',cursive;color:#ffc95e}
  .wr-year{font:700 clamp(6.2rem,30vw,18rem)/.88 'Playfair Display',serif;letter-spacing:-.05em;color:transparent;-webkit-text-stroke:2px #ffc95e;background:linear-gradient(100deg,transparent 30%,#ffe9a8 50%,transparent 70%) 150%/250% no-repeat;-webkit-background-clip:text;background-clip:text;animation:wrSh 3.6s ease-in-out infinite;filter:drop-shadow(0 0 30px rgba(255,201,94,.25))}
  .wr-open .wr-year{color:transparent;background:linear-gradient(180deg,#fff,#ffc95e);-webkit-background-clip:text;background-clip:text;-webkit-text-stroke:0;animation:none}
  @keyframes wrSh{to{background-position:-50%}}
  .wr-h{font:italic 400 clamp(1.8rem,7vw,3.2rem) 'Playfair Display',serif;letter-spacing:.32em;text-indent:.32em;text-transform:uppercase;margin:.2rem 0 .8rem}
  .wr-p{max-width:34rem;margin:0 auto;font-size:clamp(1.1rem,2.6vw,1.4rem);line-height:1.55;opacity:.92}
  .wr-fan{display:block;position:relative;height:clamp(230px,40vw,330px);max-width:820px;margin:2rem auto 0;color:inherit;text-decoration:none}
  .wr-fc{--w:clamp(104px,21vw,160px);position:absolute;left:50%;top:0;width:var(--w);margin-left:calc(var(--w)/-2);aspect-ratio:3/5;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.35);box-shadow:0 20px 44px rgba(0,0,0,.6);transform-origin:50% 130%;
    transform:translateX(calc(var(--i)*64% + var(--px)*var(--i)*-9px)) translateY(calc(var(--i)*var(--i)*12px + var(--py)*7px)) rotate(calc(var(--i)*9deg))}
  .wr-fi{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem;animation:wrFl 4.5s ease-in-out infinite alternate;animation-delay:calc(var(--i)*-.7s)}
  @keyframes wrFl{to{transform:translateY(-10px)}}
  .wr-fb{position:absolute;top:8px;left:8px;right:8px;display:flex;gap:3px}.wr-fb i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.4)}.wr-fb i:first-child{background:#fff}
  .wr-fg{font-size:clamp(2rem,6vw,3.2rem);filter:blur(6px);transition:filter .6s}.wr-open .wr-fg{filter:none}
  .wr-fl{font:600 1.1rem 'Caveat',cursive;opacity:.92}
  .wr-seal{position:relative;z-index:5;width:96px;height:96px;margin:-52px auto 0;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:#6e0b16;text-shadow:0 1px 0 rgba(255,255,255,.35);
    border-radius:48% 52% 55% 45%/52% 46% 54% 48%;background:radial-gradient(circle at 35% 28%,#f26470,#b3162a 55%,#5e0a12);box-shadow:inset 0 -7px 12px rgba(0,0,0,.4),inset 0 5px 8px rgba(255,255,255,.3),0 12px 34px rgba(0,0,0,.65);animation:wrSe 3s ease-in-out infinite}
  .wr-seal:before{content:'';position:absolute;inset:11px;border-radius:50%;border:2px dashed rgba(0,0,0,.28)}
  @keyframes wrSe{50%{transform:scale(1.07) rotate(-4deg)}}
  .wr-cd{display:flex;justify-content:center;gap:clamp(.4rem,2vw,.9rem);margin:1.6rem 0 .5rem}
  .wr-cd div{min-width:clamp(3.8rem,14vw,5.6rem);padding:.7rem .3rem;border-radius:14px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.25);backdrop-filter:blur(10px)}
  .wr-cd b{display:block;font:700 clamp(1.8rem,7vw,3rem)/1.05 'Playfair Display',serif;font-variant-numeric:tabular-nums}.wr-cd small{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;opacity:.75}
  .wr-note{font:600 1.4rem 'Caveat',cursive;opacity:.85}
  .wr-btn{position:relative;overflow:hidden;display:inline-block;margin-top:1.6rem;padding:1rem 2.6rem;border-radius:99px;background:#ffc95e;color:#2a1a08;font:700 1.25rem 'EB Garamond',serif;text-decoration:none;box-shadow:0 8px 30px rgba(0,0,0,.45);animation:wrPu 2.2s ease-in-out infinite}
  .wr-btn:after{content:'';position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.7),transparent);transform:skewX(-20deg);animation:wrSw 3s ease-in-out infinite}
  @keyframes wrSw{60%,100%{left:130%}}@keyframes wrPu{50%{box-shadow:0 8px 44px rgba(255,201,94,.7)}}
  .wr-new{display:inline-block;margin-bottom:.7rem;padding:.2rem .8rem;border-radius:99px;background:#c4172a;font:700 .8rem sans-serif;letter-spacing:.14em}
  @media(prefers-reduced-motion:reduce){.wr-au,.wr-year,.wr-fi,.wr-seal,.wr-btn,.wr-btn:after{animation:none}}`;
  document.head.appendChild(css);

  const sec = document.createElement('section'); sec.className = 'wr-full'; sec.setAttribute('aria-label', YEAR + ' Wrapped');
  sec.innerHTML = '<div class="wr-bg"><i class="wr-au"></i><i class="wr-au"></i><i class="wr-au"></i></div><canvas class="wr-cv"></canvas><div class="wr-gr"></div><div class="wr-edge"></div><div class="wr-in"></div><div class="wr-edge"></div>';
  anchor.insertAdjacentElement('beforebegin', sec);
  const $ = s => sec.querySelector(s), cv = $('.wr-cv'), cx = cv.getContext('2d'), inn = $('.wr-in');
  const FAN = [['#2e3590','⏳','the big one'], ['#a8325a','✦','the moments'], ['#1f6a50','☎','on call'], ['#b8601c','🎵','song of the year'], ['#5a3a9a','✉','by post']];
  const pad = n => String(n).padStart(2, '0');
  let open = null;

  function render(){
    const ms = at(OPEN) - now(), o = ms <= 0, seen = (() => { try{ return !!localStorage.getItem('wrapped26_seen'); }catch(e){ return false; } })();
    open = o; sec.classList.toggle('wr-open', o);
    const href = PAGE + (dm ? '?date=' + dm : '');
    const tag = o ? 'a' : 'div', fan = '<' + tag + (o ? ' href="' + href + '"' : '') + ' class="wr-fan" aria-hidden="' + !o + '">' + FAN.map((f, n) =>
      '<div class="wr-fc" style="--i:' + (n - 2) + ';z-index:' + (5 - Math.abs(n - 2)) + ';background:linear-gradient(165deg,' + f[0] + ',#120a03)"><div class="wr-fb"><i></i><i></i><i></i></div><div class="wr-fi"><div class="wr-fg">' + f[1] + '</div><div class="wr-fl">' + (o ? f[2] : '? ? ?') + '</div></div></div>').join('') + '</' + tag + '>';
    inn.innerHTML = (o && !seen ? '<div class="wr-new">NEW</div>' : '') + '<div class="wr-kick">' + (o ? 'it’s ready ✨' : 'coming soon · sealed until 27 December') + '</div><div class="wr-year">' + YEAR + '</div><div class="wr-h">Wrapped</div>' +
      '<p class="wr-p">' + (o ? 'A whole year of Tristan &amp; Ann, played back: the days, the moments, the numbers and a song. Find a quiet minute and tap through it.' : 'Something’s being wrapped… a whole year of us, played back. Numbers, moments, and a song or two. No peeking.') + '</p>' + fan +
      (o ? '<a class="wr-btn" href="' + href + '">' + (seen ? 'Watch it again ↺' : 'Open it ✨') + '</a>' : '<div class="wr-seal" aria-hidden="true">♡</div><div class="wr-cd" id="wr-cd"></div><div class="wr-note">opens 27 December ♡</div>');
    size(); seed(); if(!o) tick();
  }
  function tick(){
    const ms = at(OPEN) - now(); if(ms <= 0) return render();
    const el = document.getElementById('wr-cd'); if(!el) return;
    el.innerHTML = [[Math.floor(ms / 864e5), 'days'], [Math.floor(ms % 864e5 / 36e5), 'hours'], [Math.floor(ms % 36e5 / 6e4), 'mins'], [Math.floor(ms % 6e4 / 1e3), 'secs']].map(x => '<div><b>' + pad(x[0]) + '</b><small>' + x[1] + '</small></div>').join('');
  }

  /* ---- canvas: gold bokeh + sparkles (+ confetti once open) ---- */
  let W = 0, H = 0, P = [], vis = true; const R = (a, b) => a + Math.random() * (b - a), CC = ['#ffc95e', '#fff', '#ff8fb1', '#8fe3c0', '#a9c0ff'];
  function size(){ const r = sec.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function seed(){ P = []; const n = Math.round(W / 22);
    for(let i = 0; i < n; i++) P.push({ k:'b', x:R(0,W), y:R(0,H), r:R(8,38), vy:R(-14,-4), vx:R(-6,6), z:R(.3,1), ph:R(0,6) });
    for(let i = 0; i < n * 2; i++) P.push({ k:'s', x:R(0,W), y:R(0,H), r:R(.6,2.4), vy:R(-4,-1), vx:0, z:R(.3,1), ph:R(0,6) });
    if(open) for(let i = 0; i < n * 1.6; i++) P.push({ k:'c', x:R(0,W), y:R(-H,H), r:R(5,10), vy:R(40,110), vx:R(-14,14), z:R(.5,1), ph:R(0,6), rot:R(0,6), c:CC[Math.floor(R(0,5))] }); }
  let last = performance.now(), tgX = 0, tgY = 0, curX = 0, curY = 0;
  function frame(t){ const dt = Math.min(80, t - last) / 1000; last = t;
    if(vis){ const k = 1 - Math.exp(-dt * 4);   // ease toward the pointer, so entering/leaving never snaps
      curX += (tgX - curX) * k; curY += (tgY - curY) * k;
      sec.style.setProperty('--px', curX.toFixed(3)); sec.style.setProperty('--py', curY.toFixed(3));
      cx.clearRect(0, 0, W, H);
      for(const p of P){ if(!reduce){ p.y += p.vy * dt * p.z; p.x += p.vx * dt; if(p.k === 'c') p.rot += dt * 3; }
        if(p.y > H + 30) p.y = -20; if(p.y < -50) p.y = H + 30; if(p.x < -50) p.x = W + 40; if(p.x > W + 50) p.x = -40;
        const x = p.x - curX * 30 * p.z, y = p.y;
        if(p.k === 'b'){ cx.globalCompositeOperation = 'lighter'; const g = cx.createRadialGradient(x, y, 0, x, y, p.r); g.addColorStop(0, 'rgba(255,201,94,.3)'); g.addColorStop(1, 'rgba(255,201,94,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, p.r, 0, 7); cx.fill(); }
        else if(p.k === 's'){ cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .3 + .7 * Math.abs(Math.sin(t / 700 * p.z + p.ph)); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x, y, p.r, 0, 7); cx.fill(); cx.globalAlpha = 1; }
        else { cx.globalCompositeOperation = 'source-over'; cx.save(); cx.translate(x, y); cx.rotate(p.rot); cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * .6); cx.restore(); } } }
    if(!reduce) requestAnimationFrame(frame); }
  if('IntersectionObserver' in window) new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: 0 }).observe(sec);
  addEventListener('resize', () => { size(); seed(); });
  // the pointer is tracked on the whole window (clamped), so moving off the sides just eases the cards back to centre
  const clamp = v => Math.max(-1, Math.min(1, v));
  addEventListener('pointermove', e => { if(reduce || e.pointerType === 'touch') return; const r = sec.getBoundingClientRect();
    if(e.clientY < r.top || e.clientY > r.bottom){ tgX = tgY = 0; return; }
    tgX = clamp(((e.clientX - r.left) / r.width - .5) * 2); tgY = clamp(((e.clientY - r.top) / r.height - .5) * 2); });
  document.documentElement.addEventListener('pointerleave', () => { tgX = tgY = 0; });

  render(); requestAnimationFrame(frame); setInterval(() => { if(open === false) tick(); }, 1000);
})();
