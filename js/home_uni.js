/* home_uni.js - full-width "University of Besties" hero on the home page, just above "Everywhere to go".
   Applications open: invitation. After CLOSE: "classes begin January 2027". One big button to the university.
   Test any day with ?date=YYYY-MM-DD on index.html. Self-contained: injects its own CSS and canvas. */
(function(){
  'use strict';
  const CLOSE = '2026-12-28', PAGE = 'university.html';   /* EDIT ME (CLOSE = day AFTER the last day to apply, 27 Dec) */
  const dm = (location.search.match(/[?&]date=(\d{4}-\d{2}-\d{2})/) || [])[1], t0 = Date.now();
  const now = () => dm ? new Date(new Date(dm + 'T12:00:00').getTime() + Date.now() - t0) : new Date();
  const anchor = document.querySelector('section.wrap[aria-labelledby="go-title"]'); if(!anchor) return;
  const open = now() < new Date(CLOSE + 'T00:00:00'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const css = document.createElement('style');
  css.textContent = `
  html{overflow-x:clip}
  .uob-full{position:relative;overflow:hidden;isolation:isolate;width:100vw;margin:2.4rem 0 2.8rem calc(50% - 50vw);background:#2a0810;color:#fff8ea;--px:0;--py:0}
  .uob-bg{position:absolute;inset:0;z-index:-2}
  .uob-au{position:absolute;width:60vmax;height:60vmax;border-radius:50%;filter:blur(90px);opacity:.55;animation:uobDr 18s ease-in-out infinite alternate}
  .uob-au:nth-child(1){left:-18vmax;top:-24vmax;background:#9b2a42}.uob-au:nth-child(2){right:-24vmax;top:2vmax;background:#c86428;opacity:.4;animation-delay:-6s}.uob-au:nth-child(3){left:26vw;bottom:-40vmax;background:#c9a22a;opacity:.3;animation-delay:-12s}
  @keyframes uobDr{to{transform:translate(8vmax,6vmax) scale(1.18)}}
  .uob-cv{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
  .uob-gr{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.15;mix-blend-mode:overlay;background:${GR}}
  .uob-edge{position:relative;z-index:3;height:6px;background:linear-gradient(90deg,#9b2a42 0 60%,#c86428 60% 80%,#c9a22a 80%)}
  .uob-in{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:3.6rem 1.2rem 4rem;display:grid;grid-template-columns:1fr 1.1fr;gap:2.4rem;align-items:center}
  .uob-art{position:relative;display:grid;place-items:center;transform:translate(calc(var(--px)*-14px),calc(var(--py)*-10px));transition:transform .2s ease-out}
  .uob-art img{width:min(100%,430px);filter:drop-shadow(0 0 60px rgba(201,162,42,.45))}
  .uob-art::before{content:"";position:absolute;width:80%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(241,220,154,.35),transparent 68%);z-index:-1;animation:uobPulse 5s ease-in-out infinite}
  @keyframes uobPulse{50%{transform:scale(1.12);opacity:.7}}
  .uob-kick{font:600 clamp(1.5rem,4vw,2.1rem) 'Caveat',cursive;color:#f1dc9a}
  .uob-h{font:700 clamp(2.6rem,7.4vw,5rem)/.95 'Playfair Display',serif;letter-spacing:-.03em;margin:.3rem 0 1rem;color:#fff8ea}
  .uob-h span{display:block;font-style:italic;font-weight:400;color:#f1dc9a}
  .uob-p{font-size:1.2rem;max-width:30rem;color:#f1dfe0;margin-bottom:1.7rem;line-height:1.55}
  .uob-btn{display:inline-block;background:linear-gradient(180deg,#e98a46,#c86428);color:#fff;font:700 1.35rem 'Playfair Display',serif;text-decoration:none;padding:1.05rem 2.6rem;border-radius:99px;box-shadow:0 8px 0 #8c3f12,0 18px 40px rgba(0,0,0,.45);transition:transform .15s,box-shadow .15s}
  .uob-btn:hover{transform:translateY(3px);box-shadow:0 5px 0 #8c3f12,0 12px 30px rgba(0,0,0,.45)}
  .uob-btn:focus-visible{outline:3px solid #f1dc9a;outline-offset:4px}
  @media(max-width:820px){.uob-in{grid-template-columns:1fr;text-align:center;padding:2.6rem 1.2rem 3rem}.uob-art{order:-1}.uob-art img{width:210px}.uob-p{margin-inline:auto}}`;
  document.head.appendChild(css);
  const sec = document.createElement('section'); sec.className = 'uob-full'; sec.setAttribute('aria-label', 'University of Besties');
  sec.innerHTML = '<div class="uob-bg"><i class="uob-au"></i><i class="uob-au"></i><i class="uob-au"></i></div><canvas class="uob-cv" aria-hidden="true"></canvas><div class="uob-gr"></div><div class="uob-edge"></div>'
    + '<div class="uob-in"><div class="uob-art"><img src="images/uob_mark_light.png" alt="University of Besties open book and stars"></div><div>'
    + '<div class="uob-kick">' + (open ? 'now accepting applications' : 'classes begin January 2027') + '</div>'
    + '<h2 class="uob-h">University of Besties™<span>' + (open ? 'is open.' : 'is in session soon.') + '</span></h2>'
    + '<p class="uob-p">' + (open ? 'British Studies, BA (Hons) starts in January. No essays, no fees, and a strong tolerance for biscuits.' : 'Applications have closed. Your lectures are waiting on BestieBoard.') + '</p>'
    + '<a class="uob-btn" href="' + PAGE + '">' + (open ? 'Step inside' : 'Visit the University') + '</a></div></div><div class="uob-edge"></div>';
  anchor.parentNode.insertBefore(sec, anchor);

  /* canvas: drifting gold stars + bokeh */
  const cv = sec.querySelector('canvas'), cx = cv.getContext('2d'); let W = 0, H = 0, P = [], vis = true, tgX = 0, tgY = 0;
  const R = (a, b) => a + Math.random() * (b - a);
  function size(){ const r = sec.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
    P = []; const n = Math.round(W / 26);
    for(let i = 0; i < n; i++) P.push({ k:'b', x:R(0,W), y:R(0,H), r:R(8,36), vy:R(-12,-4), z:R(.3,1) });
    for(let i = 0; i < n; i++) P.push({ k:'s', x:R(0,W), y:R(0,H), r:R(3,8), vy:R(-10,-3), z:R(.3,1), ph:R(0,6), rot:R(0,6) }); }
  function star(x, y, r, rot){ cx.beginPath(); for(let i = 0; i < 10; i++){ const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r; cx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } cx.closePath(); cx.fill(); }
  let last = performance.now();
  function frame(t){ const dt = Math.min(80, t - last) / 1000; last = t;
    if(vis){ cx.clearRect(0, 0, W, H);
      for(const p of P){ if(!reduce){ p.y += p.vy * dt * p.z; if(p.rot !== undefined) p.rot += dt * .4; } if(p.y < -40) p.y = H + 30;
        const x = p.x - tgX * 24 * p.z;
        if(p.k === 'b'){ cx.globalCompositeOperation = 'lighter'; const g = cx.createRadialGradient(x, p.y, 0, x, p.y, p.r); g.addColorStop(0, 'rgba(241,220,154,.26)'); g.addColorStop(1, 'rgba(241,220,154,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(x, p.y, p.r, 0, 7); cx.fill(); }
        else { cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .25 + .6 * Math.abs(Math.sin(t / 900 * p.z + p.ph)); cx.fillStyle = '#f1dc9a'; star(x, p.y, p.r, p.rot); cx.globalAlpha = 1; } } }
    if(!reduce) requestAnimationFrame(frame); }
  size(); requestAnimationFrame(frame); if(reduce) frame(performance.now());
  if('IntersectionObserver' in window) new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: 0 }).observe(sec);
  addEventListener('resize', size);
  addEventListener('pointermove', e => { if(reduce || e.pointerType === 'touch') return; const r = sec.getBoundingClientRect();
    if(e.clientY < r.top || e.clientY > r.bottom){ tgX = tgY = 0; } else { tgX = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2)); tgY = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2)); }
    sec.style.setProperty('--px', tgX.toFixed(2)); sec.style.setProperty('--py', tgY.toFixed(2)); });
})();
