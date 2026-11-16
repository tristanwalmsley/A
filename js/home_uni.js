/* home_uni.js - "University of Besties" banner on the home page, placed just above "Everywhere to go".
   Open = applications open (until CLOSE); after that it becomes a "starts January 2027" notice.
   Test any day with ?date=YYYY-MM-DD on index.html. Self-contained: injects its own CSS. */
(function(){
  'use strict';
  const CLOSE = '2026-12-26', PAGE = 'university.html', APPLY = 'apply.html';   /* EDIT ME (CLOSE = day AFTER the last day) */
  const dm = (location.search.match(/[?&]date=(\d{4}-\d{2}-\d{2})/) || [])[1], t0 = Date.now();
  const now = () => dm ? new Date(new Date(dm + 'T12:00:00').getTime() + Date.now() - t0) : new Date();
  const anchor = document.querySelector('section.wrap[aria-labelledby="go-title"]'); if(!anchor) return;
  const css = document.createElement('style');
  css.textContent = `
  .uob{display:grid;grid-template-columns:auto 1fr auto;gap:1.6rem;align-items:center;margin:2.2rem 0;padding:1.5rem 1.8rem;background:#7a1a2e;color:#fff;border-radius:6px;box-shadow:5px 5px 0 var(--gold);position:relative;overflow:hidden;font-family:var(--font-body)}
  .uob::after{content:"";position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(90deg,#7a1a2e 0 60%,#c86428 60% 80%,#c9a22a 80%);filter:brightness(1.5)}
  .uob-logo{width:118px;background:#fff;border-radius:4px;padding:8px}
  .uob small{font:600 1.25rem var(--font-hand);color:#f1dc9a}
  .uob h2{font:700 clamp(1.4rem,3.4vw,2rem)/1.15 var(--font-display);color:#fff;margin:.1rem 0 .4rem}
  .uob p{max-width:34rem;color:#f1dfe0}
  .uob-side{text-align:center;display:grid;gap:.7rem;justify-items:center}
  .uob-cd{display:flex;gap:.4rem}.uob-cd div{background:rgba(255,255,255,.12);padding:.4rem .5rem;min-width:3.2rem}
  .uob-cd b{display:block;font:700 1.35rem/1 var(--font-display);font-variant-numeric:tabular-nums}.uob-cd span{font-size:.72rem;opacity:.8}
  .uob-btn{display:inline-block;background:#c86428;color:#fff;font-weight:700;text-decoration:none;padding:.65rem 1.3rem;border-radius:3px}
  .uob-btn:hover{background:#a94f1d}
  @media(max-width:820px){.uob{grid-template-columns:1fr;text-align:center;justify-items:center}.uob-logo{width:100px}}`;
  document.head.appendChild(css);
  const open = now() < new Date(CLOSE + 'T00:00:00');
  const sec = document.createElement('section'); sec.className = 'uob'; sec.setAttribute('aria-label', 'University of Besties');
  sec.innerHTML = '<img class="uob-logo" src="images/uob_logo.png" alt="University of Besties logo">'
    + '<div><small>' + (open ? 'now accepting applications' : 'classes begin soon') + '</small>'
    + '<h2>' + (open ? 'The University of Besties™ is open' : 'The University of Besties™ starts January 2027') + '</h2>'
    + '<p>' + (open ? 'British Studies, BA (Hons). No essays, no fees, and a strong tolerance for biscuits. Applications close 25 December 2026.' : 'Applications are closed. Your induction lecture is waiting on BestieBoard.') + '</p></div>'
    + '<div class="uob-side">' + (open ? '<div class="uob-cd" id="uob-cd" role="timer"></div>' : '')
    + '<a class="uob-btn" href="' + (open ? APPLY : PAGE) + '">' + (open ? 'Apply now' : 'Visit the University') + '</a>'
    + (open ? '<a href="' + PAGE + '" style="color:#f1dc9a">Explore the course</a>' : '') + '</div>';
  anchor.parentNode.insertBefore(sec, anchor);
  const cd = document.getElementById('uob-cd');
  if(cd){ const end = new Date(CLOSE + 'T00:00:00'), pad = n => String(n).padStart(2, '0');
    const tick = () => { const ms = Math.max(0, end - now());
      cd.innerHTML = [[Math.floor(ms/864e5),'days'],[Math.floor(ms%864e5/36e5),'hrs'],[Math.floor(ms%36e5/6e4),'min']].map(x => '<div><b>' + pad(x[0]) + '</b><span>' + x[1] + '</span></div>').join(''); };
    tick(); setInterval(tick, 20000); }
})();
