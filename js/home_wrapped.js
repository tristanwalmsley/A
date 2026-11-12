/* home_wrapped.js - the "2026 Wrapped" promo section on the home page.
   Hidden before SHOW; a sealed teaser with a countdown from SHOW until OPEN; then an "open it" card.
   Test any day with ?date=YYYY-MM-DD on index.html (e.g. index.html?date=2026-12-10). Self-contained: injects its own CSS. */
(function(){
  'use strict';
  const SHOW = '2026-12-01', OPEN = '2026-12-27', PAGE = 'year_in_review.html', YEAR = 2026;   /* EDIT ME */
  const dm = (location.search.match(/[?&]date=(\d{4}-\d{2}-\d{2})/) || [])[1], t0 = Date.now();
  const now = () => dm ? new Date(new Date(dm + 'T12:00:00').getTime() + Date.now() - t0) : new Date();
  const at = s => new Date(s + 'T00:00:00');
  if(now() < at(SHOW)) return;
  const anchor = document.querySelector('section.wrap[aria-labelledby="go-title"]'); if(!anchor) return;

  const css = document.createElement('style');
  css.textContent = `
  .wr-card{position:relative;overflow:hidden;border-radius:22px;padding:2.4rem 1.3rem 2rem;text-align:center;color:#fff8ea;box-shadow:0 14px 44px rgba(40,18,4,.35);
    background:radial-gradient(ellipse at 20% 0,#8a4a14,transparent 60%),radial-gradient(ellipse at 90% 100%,#9c335866,transparent 60%),#1c0f05}
  .wr-card:before{content:'';position:absolute;inset:0;opacity:.7;pointer-events:none;background:
    radial-gradient(circle,#fff 0 1px,transparent 1.6px) 0 0/70px 70px,radial-gradient(circle,#ffe08a 0 1.2px,transparent 2px) 30px 40px/110px 110px;animation:wrTw 5s ease-in-out infinite alternate}
  @keyframes wrTw{from{opacity:.25}to{opacity:.8}}
  .wr-card>*{position:relative}
  .wr-kick{font-family:'Caveat',cursive;font-size:1.5rem;color:#ffc95e}
  .wr-year{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(4.2rem,22vw,7.5rem);line-height:.95;letter-spacing:-.04em;color:transparent;-webkit-text-stroke:2px #ffc95e;
    background:linear-gradient(100deg,transparent 30%,#ffc95e 50%,transparent 70%) 150%/250% no-repeat;-webkit-background-clip:text;background-clip:text;animation:wrSh 3.4s ease-in-out infinite}
  @keyframes wrSh{to{background-position:-50%}}
  .wr-h{font-family:'Playfair Display',serif;font-style:italic;font-weight:400;font-size:clamp(1.7rem,6vw,2.4rem);margin:.1rem 0 .6rem}
  .wr-p{max-width:30rem;margin:0 auto;font-size:1.15rem;line-height:1.55;opacity:.92}
  .wr-cd{display:flex;justify-content:center;gap:.6rem;margin:1.4rem 0 .3rem}
  .wr-cd div{min-width:3.6rem;padding:.55rem .3rem;border-radius:12px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(8px)}
  .wr-cd b{display:block;font-family:'Playfair Display',serif;font-size:1.7rem;line-height:1.1}.wr-cd small{font-size:.75rem;opacity:.75;letter-spacing:.08em;text-transform:uppercase}
  .wr-fan{display:flex;justify-content:center;margin:1.4rem 0 .6rem;height:132px}
  .wr-fc{width:86px;height:122px;margin:0 -10px;border-radius:12px;border:1px solid rgba(255,255,255,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2rem;box-shadow:0 8px 24px rgba(0,0,0,.4);transform:rotate(var(--r)) translateY(var(--y,0));animation:wrFl 4s ease-in-out infinite alternate;animation-delay:var(--d)}
  @keyframes wrFl{to{transform:rotate(var(--r)) translateY(-8px)}}
  .wr-fc b{font-family:'Playfair Display',serif;font-size:2rem;filter:blur(3px)}.wr-fc small{font-family:'Caveat',cursive;font-size:1.05rem;opacity:.9}
  .wr-note{font-family:'Caveat',cursive;font-size:1.3rem;opacity:.8}
  .wr-btn{display:inline-block;margin-top:1.3rem;padding:.8rem 1.9rem;border-radius:99px;background:#ffc95e;color:#2a1a08;font-weight:700;text-decoration:none;font-size:1.1rem;box-shadow:0 6px 22px rgba(0,0,0,.4);animation:wrPu 2.2s ease-in-out infinite}
  @keyframes wrPu{50%{box-shadow:0 6px 34px rgba(255,201,94,.65)}}
  .wr-new{display:inline-block;margin-bottom:.6rem;padding:.15rem .7rem;border-radius:99px;background:#c4172a;font-size:.8rem;font-weight:700;letter-spacing:.1em}
  @media(prefers-reduced-motion:reduce){.wr-card:before,.wr-year,.wr-fc,.wr-btn{animation:none}}`;
  document.head.appendChild(css);

  const sec = document.createElement('section'); sec.className = 'wrap'; sec.setAttribute('aria-labelledby', 'wr-title');
  anchor.insertAdjacentElement('afterend', sec);
  const pad = n => String(n).padStart(2, '0'), FAN = [['#2e3590','⏳','the big one','-9deg','.4rem','0s'], ['#9c3358','🎵','song of the year','0deg','0rem','.6s'], ['#1f6a50','✉','by post','9deg','.4rem','1.2s']];
  let mode = '';

  function render(){
    const ms = at(OPEN) - now(), open = ms <= 0, seen = (() => { try{ return !!localStorage.getItem('wrapped26_seen'); }catch(e){ return false; } })();
    mode = open ? 'open' : 'teaser';
    const href = PAGE + (dm ? '?date=' + dm : '');
    sec.innerHTML = '<div class="sec-head"><h2 class="sec-title" id="wr-title">' + (open ? 'Your ' + YEAR + ' Wrapped' : 'Coming soon') + '</h2></div><div class="wr-card">' +
      (open
        ? (seen ? '' : '<div class="wr-new">NEW</div>') + '<div class="wr-kick">it’s ready ✨</div><div class="wr-year">' + YEAR + '</div><div class="wr-h">Wrapped</div><p class="wr-p">A whole year of Tristan &amp; Ann, played back: the days, the moments, the numbers and a song. Grab a drink, find a quiet minute, and tap through it.</p><a class="wr-btn" href="' + href + '">' + (seen ? 'Watch it again ↺' : 'Open it ✨') + '</a>'
        : '<div class="wr-kick">sealed until 27 December</div><div class="wr-year">' + YEAR + '</div><div class="wr-h">Wrapped</div><p class="wr-p">Something’s being wrapped… a whole year of us, played back. Numbers, moments, and a song or two. No peeking.</p>' +
          '<div class="wr-fan">' + FAN.map(f => '<div class="wr-fc" style="background:linear-gradient(160deg,' + f[0] + ',#120a03);--r:' + f[3] + ';--y:' + f[4] + ';--d:' + f[5] + '"><b>' + f[1] + '</b><small>' + f[2] + '</small></div>').join('') + '</div>' +
          '<div class="wr-cd" id="wr-cd"></div><div class="wr-note">opens 27 December ♡</div>') + '</div>';
    if(!open) tick();
  }
  function tick(){
    const ms = at(OPEN) - now(); if(ms <= 0) return render();
    const el = document.getElementById('wr-cd'); if(!el) return;
    el.innerHTML = [[Math.floor(ms / 864e5), 'days'], [Math.floor(ms % 864e5 / 36e5), 'hrs'], [Math.floor(ms % 36e5 / 6e4), 'min'], [Math.floor(ms % 6e4 / 1e3), 'sec']].map(x => '<div><b>' + pad(x[0]) + '</b><small>' + x[1] + '</small></div>').join('');
  }
  render(); setInterval(() => { if(mode === 'teaser') tick(); }, 1000);
})();
