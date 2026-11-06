/* ==========================================================================
   home.js - everything the home page (index.html) does.
   Sections: stamps/confetti -> secrets -> badges -> ledger/corkboard ->
   stamp sheet -> settings -> init.
   To add a badge:   add an entry to BADGES (with its own play() animation).
   To add a setting: add an entry to SETTINGS.
   ========================================================================== */

const MET_DATE = '2023-01-15';   // the day you two met (YYYY-MM-DD)
const $ = id => document.getElementById(id);

// ---------- FLOATING STAMPS (background) ----------
(function(){
  const bg = $('stamps-bg');
  const vals = ['♡','✉','★','✦','♡','✉'];
  const lbls = ['First Class','Air Mail','Friend','Special','Love','Bestie'];
  for(let i=0;i<10;i++){
    const sw = document.createElement('div'); sw.className = 'float-stamp';
    const ri = Math.floor(Math.random()*vals.length);
    const r1 = (Math.random()-0.5)*30, r2 = r1+(Math.random()-0.5)*20;
    sw.style.cssText = `left:${Math.random()*100}%;--dur:${16+Math.random()*18}s;--delay:${Math.random()*22}s;--drift:${(Math.random()-0.5)*100}px;--rot-start:${r1}deg;--rot-end:${r2}deg;--op:${0.06+Math.random()*0.1}`;
    sw.innerHTML = `<div class="float-stamp-inner"><div class="sv">${vals[ri]}</div><div class="sl">${lbls[ri]}</div></div>`;
    bg.appendChild(sw);
  }
})();

// ---------- CONFETTI / HEARTS ----------
function launchConfetti(){
  const m = new Date().getMonth();
  const cols = m===7  ? ['#c8943a','#b86858','#faf4e8','#d4b483','#e8c4a0']
             : m===11 ? ['#c8943a','#2d6e30','#b86858','#ffffff','#d4b483']
             :          ['#c8943a','#b86858','#d4b483','#7a9870','#f0ddb8'];
  const layer = $('confetti-layer');
  const shapes = ['50%','2px','4px','0'];
  for(let i=0;i<55;i++){
    const b = document.createElement('div'); b.className = 'confetti-bit';
    const sz = 5+Math.random()*9;
    b.style.cssText = `left:${5+Math.random()*90}%;top:-10px;width:${sz}px;height:${sz}px;background:${cols[Math.floor(Math.random()*cols.length)]};border-radius:${shapes[Math.floor(Math.random()*shapes.length)]};--cd:${1.5+Math.random()*2}s;--cdelay:${Math.random()*1.2}s;--cx:${(Math.random()-0.5)*280}px;--cr:${(Math.random()-0.5)*720}deg`;
    layer.appendChild(b);
    setTimeout(() => b.remove(), 4000);
  }
}
function launchHeartBurst(){
  const layer = $('confetti-layer');
  for(let i=0;i<16;i++){
    const h = document.createElement('div');
    h.className = 'heart-burst'; h.textContent = '♡';
    h.style.left = (38 + Math.random()*24) + '%';
    h.style.fontSize = (14 + Math.random()*16) + 'px';
    h.style.setProperty('--hd', (1.1 + Math.random()*0.8) + 's');
    h.style.setProperty('--hx', ((Math.random()-0.5)*200) + 'px');
    layer.appendChild(h);
    setTimeout(() => h.remove(), 2200);
  }
}

// ---------- POPUP (shared by secrets and badges) ----------
let afterClose = null;
function showModal(title, html, sig){
  $('egg-title').textContent = title;
  $('egg-text').innerHTML = html;
  $('egg-sig').textContent = sig || 'Bestie Tristan';
  $('egg-modal').classList.add('show');
}
function closeEgg(){
  $('egg-modal').classList.remove('show');
  if(afterClose){ const f = afterClose; afterClose = null; setTimeout(f, 350); }
}

// ---------- SECRETS ----------
const EGGS = {
  postmark: { title:"You found the secret!", sig:"Bestie Tristan xo",
    text:"You clicked the postmark five times because naturally you did. I made a whole website for you and you found the easter egg immediately - probs!<br><br>Here's the hidden message: I think you're super duper cool, and I'm so glad you're my bestie.<br><br>You're welcome :)" },
  nav: { title:"Snooping at the letterhead?", sig:"Bestie Tristan",
    text:"Seven clicks on my little logo. I see you testing everything for cracks in the wallpaper...<br><br>Since you're here: thank you for being exactly the kind of person who I need." },
  konami: { title:"The secret code", sig:"Bestie Tristan",
    text:"Up, up, down, down... you actually typed it, wowie. I didn't think anyone would try it, honestly.<br><br>Consider this your cheat: infinite virtual hugs, unlimited lives, and a permanent +10 to how loved you are." },
  name: { title:"Someone said your name", sig:"Bestie Tristan",
    text:"You typed your own name into a website I built for you. I love that for you.<br><br>Somewhere out there, the world is a slightly better place because you're in it." },
  signature: { title:"Double-checking my signature?", sig:"Bestie Tristan",
    text:"You double-clicked my name at the bottom of the letter... Making sure it's really me.<br><br>It's really me. It'll always be me you lovely, wonderful person." },
  tristan: { title:"Hi, it's me", sig:"Bestie Tristan",
    text:"You typed my name, Bold move. I respect it.<br><br>For the record: I built every last bit of this - the stamps, the postmark, all these silly hidden things - because you're worth the extra hours." },
  idle: { title:"Special delivery, mid-air", sig:"Bestie Tristan",
    text:"You caught the little envelope before it drifted off screen. I like to imagine it's been circling this page since I started working on this MONTHS ago, just waiting for someone quick enough to come by.<br><br>That's very on brand for you, by the way - quick, and a little bit magic." },
  mail: { title:"Special delivery", sig:"Bestie Tristan",
    text:"You peeled the stamp off and stuck it right onto the postmark, like you were sending this whole thing back to me.<br><br>Whatever you were trying to say - I already know, and I feel the same, probbers." },
  chase: { title:"You caught it", sig:"Bestie Tristan",
    text:"That little heart didn't want to be caught - it's shy, same as I can be sometimes. But you cornered it anyway, patiently, until it had nowhere left to go but toward you.<br><br>That's a pretty good description of our bestieship." }
};
const EGG_KEYS = Object.keys(EGGS);
PageEggs.PAGES.home.total = EGG_KEYS.length;   // keeps the shared tracker in step with this page's own eggs
let eggsFound = [];
try{ eggsFound = JSON.parse(localStorage.getItem('ann_eggs_found')) || []; }catch(e){ eggsFound = []; }

function unlockEgg(key){
  const before = PageEggs.sync().length;
  if(!eggsFound.includes(key)){
    eggsFound.push(key);
    try{ localStorage.setItem('ann_eggs_found', JSON.stringify(eggsFound)); }catch(e){}
  }
  // finishing a page's set levels up Secret Keeper: once she closes this secret, the badge plays
  if(PageEggs.sync().length > before) afterClose = () => { markSecretsCelebrated(); openBadge('secrets'); };
  playEggHatch(() => {
    showModal(EGGS[key].title, EGGS[key].text, EGGS[key].sig);
    launchHeartBurst();
  });
  renderBadges();
}
function markSecretsCelebrated(){
  const seen = bdgJSON(BK.celebrated, {});
  if(Array.isArray(seen)) return;
  seen.secrets = PageEggs.sync().length;
  try{ localStorage.setItem(BK.celebrated, JSON.stringify(seen)); }catch(e){}
}
// little egg-cracking flourish that plays BEFORE the message box appears
function playEggHatch(callback){
  const egg = document.createElement('div');
  egg.className = 'egg-hatch'; egg.textContent = '🥚';
  document.body.appendChild(egg);
  setTimeout(() => {
    egg.classList.add('crack');
    const sp = document.createElement('div');
    sp.className = 'egg-sparkle'; sp.textContent = '✨';
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), 500);
  }, 600);
  setTimeout(() => { egg.remove(); callback(); }, 950);
}


// ---------- BADGE CLUES ----------
// a nudge for every badge she hasn't earned yet (shown as "?", never the badge name), plus one for the next level of any she has.
// returns a clue string, or null when there is nothing more to chase. Add a line here whenever a badge is added.
const BADGE_CLUES = {
  secrets:       lv => lv < 1 ? 'Empty a page of every last hiding place.' : (lv < Object.keys(PageEggs.PAGES).length ? 'Another page has just as much tucked away.' : null),
  birthday26:    lv => lv < 1 ? 'Unwrap everything from one very special celebration.' : null,
  signed:        lv => lv < 1 ? 'Your word, put down properly, with ink.' : null,
  habit:         lv => lv < 1 ? 'Turn up so often it becomes a routine.' : (lv < BDG_STREAK_STEPS.length ? 'Make that routine last far longer.' : null),
  penpal:        lv => lv < 1 ? 'Come back whenever the calendar turns over, and keep doing it.' : (lv < BDG_LEDGER_STEPS.length ? 'Keep coming back as the months pile up.' : null),
  stickers:      lv => lv < 1 ? 'Drop by regularly and a certain board slowly fills.' : (lv < bdgCorkSteps().length ? 'There is still room on that board.' : null),
  cartographer:  lv => lv < 1 ? 'Find every corner of this place.' : 'When something new is built, go and find it.',
  friendiversary:lv => lv < 1 ? 'There is one date each year that is worth turning up for.' : 'Same date, next year.',
  candles:       lv => lv < 1 ? 'Two particular days, both worth showing up for.' : 'Both of those days again, next year.'
};
function showBadgeClues(){
  let html = '', n = 0;
  BADGES.forEach(bd => {
    const f = BADGE_CLUES[bd.id]; if(!f) return;
    const lv = badgeLevel(bd), clue = f(lv);
    if(!clue) return;
    n++;
    const mark = lv < 1 ? '?' : bd.glyph + ' <small>next level</small>';
    html += '<div style="text-align:left;margin:.6rem 0;line-height:1.5"><b style="color:var(--rose,#b86858);margin-right:.4rem">' + mark + '</b><i>' + clue + '</i></div>';
  });
  if(!n) html = '<p>Every badge, every level, for now. More will turn up as the site grows.</p>';
  showModal(n ? 'A clue for each badge' : 'Nothing left to chase', html, 'Bestie Tristan');
}

// ---------- BADGES ----------
// each badge: { id, name, glyph, hint, level() (or earned()), info(level), play(done) }
//   level()    = 0 when not earned, 1+ when earned. Upgradeable badges also set ladder:[title per prestige] (see PRESTIGE below)
//                and next(level) (hint at the next prestige, shown on hover), and finish play(done, lv) with bdgPrestige(...)
//   celebrateOnVisit:true = its animation plays on the home page the first time a new level is reached
//   play(done) = that badge's own animation; call done() when it has finished (bdgMedal() is a shared ending)
//   info       = what the popup says after the animation
function dimOverlay(){
  const o = document.createElement('div');
  o.className = 'celebration-overlay';
  document.body.appendChild(o);
  requestAnimationFrame(() => o.classList.add('dim'));
  return o;
}
function endOverlay(o, cb){
  o.classList.remove('dim');
  setTimeout(() => { o.remove(); if(cb) cb(); }, 700);
}
// ---- badge helpers (prefixed bdg* so they can't clash with other scripts) ----
// localStorage keys + the dates some badges care about. All of it syncs to Cloudflare like everything else.
const BK = {
  streak:      'ann_visit_streak_v1',      // { lastDate, streak, longest }
  ledger:      'ann_monthly_ledger_v1',    // ['YYYY-MM', ...]
  cork:        'ann_weekly_corkboard_v1',  // [{ week, glyph, ... }]
  special:     'ann_special_visits_v1',    // { met:[years], ann:[years], tristan:[years] } - years she visited on that day
  carto:       'ann_cartographer_v1',      // { level, covered:[page keys] }
  celebrated:  'ann_badges_celebrated_v1', // { badgeId: level that has already been celebrated }
  animVer:     'ann_badges_animver_v1',    // { badgeId: animVersion she has already been shown } (see animVersion on BADGES)
  annBday:     '08-05',                    // MM-DD  Ann's birthday
  tristanBday: '06-27',                    // MM-DD  Tristan's birthday
};
const BDG_STREAK_STEPS = [7, 30, 100];       // days in a row  -> levels 1, 2, 3
const BDG_LEDGER_STEPS = [6, 12, 24];        // months stamped -> levels 1, 2, 3
const bdgCorkSteps = () => [10, CORK_STICKERS.length, 52];   // weekly stickers (middle one = the full set)

const bdgEl = (tag, cls, text) => {
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(text != null) e.textContent = text;
  return e;
};
function bdgJSON(key, fallback){
  try{ const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
  catch(e){ return fallback; }
}
function bdgArr(key){ const v = bdgJSON(key, []); return Array.isArray(v) ? v : []; }
const bdgTier = (value, steps) => steps.filter(s => value >= s).length;
// today as YYYY-MM-DD in the visitor's OWN timezone (toISOString would use UTC and be off near midnight)
function bdgLocalDate(d){
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
const bdgDayLabel = md => parseInt(md.slice(3), 10) + ' ' + MONTH_ABBR[parseInt(md.slice(0, 2), 10) - 1];
function bdgBestStreak(){ const d = bdgJSON(BK.streak, {}); return Math.max(d.longest || 0, d.streak || 0); }
function bdgSpecialYears(k){ const d = bdgJSON(BK.special, {}); return Array.isArray(d[k]) ? d[k] : []; }
function bdgBothBirthdayYears(){ const t = bdgSpecialYears('tristan'); return bdgSpecialYears('ann').filter(y => t.includes(y)); }

// shared ending for the newer badge animations: the gold medal pops, then the overlay closes and the popup follows
function bdgMedal(o, glyph, at, done){
  const core = bdgEl('div', 'sk-core', glyph);
  o.appendChild(core);
  setTimeout(() => { core.classList.add('in'); launchConfetti(); launchHeartBurst(); }, at);
  setTimeout(launchHeartBurst, at + 800);
  setTimeout(() => endOverlay(o, done), at + 1900);
}


// ---- PRESTIGE: every badge that has levels ----
// A badge with levels gets  ladder: ['Title at prestige I', 'Title at prestige II', ...]  (and no other level code).
// Its medal then evolves automatically through the looks below (css/secret_keeper.css, .skm-p1 ... .skm-p6),
// the badge row shows it, and reaching a new prestige plays the "old medal charges up and transforms" finale.
// Past the last title it keeps the last name + a roman numeral; past the last look it keeps its final look.
// evolveGlyph:true = the symbol in the middle changes with each look too (only Secret Keeper does this).
const PRESTIGE_LOOKS = [
  { metal:'Bronze',    star:'★' },
  { metal:'Silver',    star:'★' },
  { metal:'Gold',      star:'★' },
  { metal:'Ruby',      star:'✦' },
  { metal:'Prismatic', star:'✧' },
  { metal:'Celestial', star:'♛' },
];
function skRoman(n){
  const r = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let o = ''; r.forEach(([v, c]) => { while(n >= v){ o += c; n -= v; } }); return o;
}
const skLook = p => PRESTIGE_LOOKS[Math.min(Math.max(p, 1), PRESTIGE_LOOKS.length) - 1];
const prBadge = id => BADGES.find(b => b.id === id);
function prTitle(bd, p){
  const L = bd.ladder || [bd.name];
  return p <= L.length ? L[p - 1] : L[L.length - 1] + ' ' + skRoman(p);
}
const prGlyph = (bd, p) => bd.evolveGlyph ? skLook(p).star : bd.glyph;
const prLine = (bd, lv) => '<em>Prestige ' + skRoman(lv) + ' &middot; ' + skLook(lv).metal + '</em><br><br>';

// builds a badge's medal for a prestige. Layers are only added as the prestige grows, so it gets busier and fancier.
function skMedal(bd, p, size){
  const t = Math.min(p, PRESTIGE_LOOKS.length);
  const m = bdgEl('div', 'skm skm-p' + t);
  m.style.setProperty('--sz', size + 'px');
  const add = (cls, txt) => m.appendChild(bdgEl('div', cls, txt));
  if(t >= 6) add('skm-halo');
  if(t >= 3) add('skm-rays');
  if(t >= 4) add('skm-orbit');
  add('skm-disc'); add('skm-inner');
  add('skm-g' + (bd.evolveGlyph ? '' : ' skm-emoji'), prGlyph(bd, p));
  if(t >= 3) add('skm-shine');
  if(t >= 5){
    const sp = bdgEl('div', 'skm-sparks'), n = t >= 6 ? 6 : 4;
    for(let i = 0; i < n; i++){ const s = bdgEl('span'); s.style.setProperty('--a', (i * 360 / n) + 'deg'); sp.appendChild(s); }
    m.appendChild(sp);
  }
  if(p > 1) add('skm-num', skRoman(p));
  return m;
}

// the prestige ending: the old medal charges up, flashes, and turns into the new one
function skReveal(o, id, lv, done){
  const bd = prBadge(id); lv = lv || 1;
  const big = Math.round(Math.min(170, window.innerWidth * 0.42));
  const stage = bdgEl('div', 'skp-stage'), hold = bdgEl('div', 'skp-hold');
  const sub = bdgEl('div', 'skp-sub'), ttl = bdgEl('div', 'skp-title');
  stage.append(hold, sub, ttl); o.appendChild(stage);
  const put = (p, cls) => { hold.querySelectorAll('.skm').forEach(e => e.remove()); const m = skMedal(bd, p, big); m.classList.add(cls); hold.appendChild(m); };
  const say = p => { sub.textContent = 'Prestige ' + skRoman(p); ttl.textContent = prTitle(bd, p); sub.classList.add('show'); ttl.classList.add('show'); };
  const reveal = () => {
    const f = bdgEl('div', 'skp-flash'); hold.appendChild(f); setTimeout(() => f.remove(), 900);
    put(lv, 'skp-pop'); say(lv);
    launchConfetti(); launchHeartBurst(); setTimeout(launchHeartBurst, 800);
  };
  let end;
  if(lv > 1){
    put(lv - 1, 'skp-in'); say(lv - 1);                          // the medal she had
    setTimeout(() => hold.classList.add('charge'), 1100);        // it trembles and glows
    setTimeout(() => { hold.classList.remove('charge'); reveal(); }, 2300);
    end = 2300 + 2300;
  } else { setTimeout(reveal, 200); end = 200 + 2300; }
  setTimeout(() => endOverlay(o, done), end);
}
// drop-in replacement for bdgMedal() in any badge with levels: waits `at` ms (for the badge's own animation), then does the prestige finale
function bdgPrestige(o, id, lv, at, done){ setTimeout(() => skReveal(o, id, lv, done), at); }

// ---- Secret Keeper: one tier per page whose secrets are all found ----
// Each page has its own animation. When the badge plays, EVERY completed page's animation plays in the order
// the pages were finished, one after the other, and the newest one comes last before the medal.
// To add a page: give it eggs (see js/eggs.js), then add an entry here with { info, anim(o, next) }.
const SECRET_TIERS = {
  // nine eggs spin in a ring and collapse into the middle
  home: {
    info: 'Every secret hiding on the home page, all ' + EGG_KEYS.length + ' of them. Poking, typing, chasing, dragging... you did it all.<br><br>Not many people would have the patience. You did.',
    anim(o, next){
      const ring = bdgEl('div', 'sk-ring');
      for(let i = 0; i < EGG_KEYS.length; i++){
        const sp = bdgEl('span', '', '🥚');
        sp.style.setProperty('--a', (i * 360 / EGG_KEYS.length) + 'deg');
        ring.appendChild(sp);
      }
      o.appendChild(ring);
      setTimeout(() => ring.classList.add('collapse'), 1900);
      setTimeout(() => { ring.remove(); launchHeartBurst(); next(); }, 2500);
    }
  },
  // a wall of reasons flips over, flies into a heart, beats three times, then bursts
  reasons: {
    info: 'Every secret on the reasons page: a song, a shooting star, a tin of beans, a doorbell, a 2am text and more. You read the small print of a list that was already meant to cheer you up.<br><br>There really are so many more reasons. I will keep adding them.',
    // the grand finale: the wall of cards flips, flies into a heart, beats and bursts (js/reasons_reel.js plays it last)
    anim(o, next){
      // the long version: all 21 reasons-page secrets replayed first, with a skip button and a start screen. If the file didn't load, it's just the finale.
      if(window.ReasonsReel) ReasonsReel.play(o, (cb) => SECRET_TIERS.reasons.finale(o, cb), next);
      else SECRET_TIERS.reasons.finale(o, next);
    },
    finale(o, next){
      const N = 48, cols = 8, rows = 6;
      const stage = bdgEl('div', 'rw-stage');
      const sc = Math.min(11, window.innerWidth / 38);
      const gw = Math.min(40, window.innerWidth / 11), gh = gw * 1.3;
      const cards = [];
      for(let i = 0; i < N; i++){
        const c = i % cols, r = Math.floor(i / cols);
        const gx = (c - (cols - 1) / 2) * gw, gy = (r - (rows - 1) / 2) * gh;
        const t = (i / N) * Math.PI * 2 + Math.PI;
        const hx = 16 * Math.pow(Math.sin(t), 3) * sc;
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * sc;
        const card = bdgEl('div', 'rw-card'), inn = bdgEl('div', 'rw-in');
        inn.append(bdgEl('i', 'rw-b', '✦'), bdgEl('i', 'rw-f', '♡'));
        card.appendChild(inn);
        card.style.transform = 'translate(' + gx + 'px,' + gy + 'px) scale(0)';
        stage.appendChild(card);
        cards.push({ card, inn, gx, gy, hx, hy });
      }
      o.appendChild(stage);
      // deal the cards in
      requestAnimationFrame(() => requestAnimationFrame(() => cards.forEach((k, i) => {
        k.card.style.transitionDelay = (i * 0.015) + 's';
        k.card.style.transform = 'translate(' + k.gx + 'px,' + k.gy + 'px) scale(1) rotate(' + ((Math.random() - 0.5) * 8) + 'deg)';
      })));
      // a wave of flips across the wall
      setTimeout(() => cards.forEach((k, i) => { k.inn.style.transitionDelay = ((i % cols) * 0.09 + Math.floor(i / cols) * 0.05) + 's'; k.inn.classList.add('flip'); }), 700);
      // everything flies into a heart
      setTimeout(() => cards.forEach((k, i) => {
        k.card.style.transitionDuration = '1.3s'; k.card.style.transitionDelay = (i * 0.02) + 's';
        k.card.style.transform = 'translate(' + k.hx + 'px,' + k.hy + 'px) scale(1) rotate(' + ((Math.random() - 0.5) * 30) + 'deg)';
      }), 2100);
      setTimeout(() => stage.classList.add('beat'), 3700);        // the heart beats
      setTimeout(() => {                                           // and bursts
        cards.forEach(k => {
          const a = Math.atan2(k.hy, k.hx), d = 520 + Math.random() * 420;
          k.card.style.transitionDuration = '.9s'; k.card.style.transitionDelay = '0s';
          k.card.style.transform = 'translate(' + (Math.cos(a) * d) + 'px,' + (Math.sin(a) * d) + 'px) scale(.4) rotate(' + ((Math.random() - 0.5) * 900) + 'deg)';
          k.card.style.opacity = '0';
        });
        launchConfetti(); launchHeartBurst();
      }, 5100);
      setTimeout(() => { stage.remove(); next(); }, 6000);
    }
  }
};

// ---- Leaf Legend (prestige III) finale: five easter eggs circle, crack one by one and feed a golden core that detonates ----
(function(){
  const st = document.createElement('style');
  st.textContent = `
  .lgx-stage{position:fixed;inset:0;z-index:9500;pointer-events:none;overflow:hidden;transition:opacity 1s ease}
  .lgx-stage.out{opacity:0}
  .lgx-stage.shake{animation:lgxShake .09s linear 14}
  @keyframes lgxShake{0%{transform:translate(0,0)}25%{transform:translate(-7px,4px)}50%{transform:translate(6px,-5px)}75%{transform:translate(-4px,-3px)}100%{transform:translate(0,0)}}
  .lgx-egg{position:absolute;font-size:2.7rem;line-height:1;transform:translate(-50%,-50%) scale(0);opacity:0;animation:lgxEggIn .7s cubic-bezier(.34,1.56,.64,1) forwards;animation-delay:var(--d)}
  @keyframes lgxEggIn{to{transform:translate(-50%,-50%) scale(1);opacity:1}}
  .lgx-egg.crack{animation:lgxCrack .65s ease forwards}
  @keyframes lgxCrack{0%{transform:translate(-50%,-50%) scale(1)}25%{transform:translate(-50%,-50%) scale(1.2) rotate(-16deg)}50%{transform:translate(-50%,-50%) scale(1.2) rotate(16deg)}100%{transform:translate(-50%,-50%) scale(2.6);opacity:0}}
  .lgx-core{position:absolute;left:50%;top:50%;font-size:3.4rem;line-height:1;transform:translate(-50%,-50%) scale(0);filter:drop-shadow(0 0 18px #ffcf5a) sepia(1) saturate(4) hue-rotate(-12deg);transition:transform .45s cubic-bezier(.34,1.56,.64,1)}
  .lgx-core.pulse{animation:lgxPulse .5s ease-in-out infinite alternate}
  @keyframes lgxPulse{to{filter:drop-shadow(0 0 34px #fff2b0) sepia(1) saturate(5) hue-rotate(-12deg) brightness(1.3)}}
  .lgx-spark{position:absolute;font-size:1.2rem;line-height:1;transform:translate(-50%,-50%);animation:lgxSpark 1s ease-out forwards}
  @keyframes lgxSpark{to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(var(--r)) scale(.5);opacity:0}}
  .lgx-trail{position:absolute;font-size:1rem;transform:translate(-50%,-50%);animation:lgxTrail .55s ease-in forwards}
  @keyframes lgxTrail{to{left:50%;top:50%;opacity:0;transform:translate(-50%,-50%) scale(.3)}}
  .lgx-ring{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:3px solid #ffd76a;box-shadow:0 0 22px #ffd76a,inset 0 0 18px #ffd76a;opacity:.95;animation:lgxRing 1.5s cubic-bezier(.1,.7,.3,1) forwards}
  @keyframes lgxRing{to{transform:scale(34);opacity:0}}
  .lgx-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#fff 0%,rgba(255,226,140,.8) 30%,transparent 70%);opacity:0;animation:lgxFlash 1.1s ease-out}
  @keyframes lgxFlash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}
  .lgx-banner{position:absolute;left:0;right:0;top:calc(50% + 120px);text-align:center;font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:clamp(1.6rem,7vw,3rem);letter-spacing:.18em;white-space:nowrap}
  .lgx-banner span{display:inline-block;opacity:0;transform:translateY(-40px) scale(1.8);background:linear-gradient(180deg,#fff6c8,#e8a92c 60%,#b97a10);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 12px rgba(255,200,80,.8));animation:lgxLetter .6s cubic-bezier(.2,1.4,.4,1) forwards;animation-delay:var(--d)}
  @keyframes lgxLetter{to{opacity:1;transform:none}}
  .lgx-ray{position:absolute;left:50%;top:50%;width:3px;height:60vmax;margin-left:-1.5px;transform-origin:50% 0;background:linear-gradient(#ffe9a0,transparent);opacity:0;animation:lgxRay 2.2s ease-out forwards;animation-delay:var(--d);transform:rotate(var(--a))}
  @keyframes lgxRay{0%{opacity:0}20%{opacity:.8}100%{opacity:0}}`;
  document.head.appendChild(st);
})();
function lgxGrandFinale(o){
  const stage = bdgEl('div', 'lgx-stage'); o.appendChild(stage);
  const R = Math.min(150, window.innerWidth * 0.34), N = 5, T = (ms, fn) => setTimeout(fn, ms);
  const pos = i => { const a = (i / N) * Math.PI * 2 - Math.PI / 2; return { x: Math.cos(a) * R, y: Math.sin(a) * R }; };
  const mid = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const eggs = [], loot = ['🍃', '🍀', '🌟', '💛', '✨'];
  for(let i = 0; i < N; i++){
    const e = bdgEl('div', 'lgx-egg', '🥚'), p = pos(i), c = mid();
    e.style.left = (c.x + p.x) + 'px'; e.style.top = (c.y + p.y) + 'px'; e.style.setProperty('--d', (i * 0.15) + 's');
    stage.appendChild(e); eggs.push(e);
  }
  const core = bdgEl('div', 'lgx-core', '🥚'); stage.appendChild(core);
  T(1500, () => { core.style.transform = 'translate(-50%,-50%) scale(.6)'; });
  const ring = () => stage.appendChild(bdgEl('div', 'lgx-ring'));
  eggs.forEach((e, i) => T(1900 + i * 480, () => {
    const c = mid(), p = pos(i), x = c.x + p.x, y = c.y + p.y;
    e.classList.add('crack');
    for(let k = 0; k < 10; k++){
      const s = bdgEl('div', 'lgx-spark', loot[(i + k) % loot.length]), a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px'); s.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
      stage.appendChild(s); T(1100, () => s.remove());
    }
    const tr = bdgEl('div', 'lgx-trail', '✨'); tr.style.left = x + 'px'; tr.style.top = y + 'px'; stage.appendChild(tr); T(650, () => tr.remove());
    core.style.transform = 'translate(-50%,-50%) scale(' + (0.9 + i * 0.4) + ')'; core.classList.add('pulse');
    ring(); if(i % 2 === 0) launchHeartBurst();
  }));
  const boom = 1900 + N * 480 + 300;                    // everything has cracked: the core detonates
  T(boom, () => {
    stage.appendChild(bdgEl('div', 'lgx-flash')); stage.classList.add('shake'); T(1300, () => stage.classList.remove('shake'));
    core.style.transition = 'transform .5s ease-in,opacity .5s ease-in'; core.style.transform = 'translate(-50%,-50%) scale(9)'; core.style.opacity = '0';
    [0, 250, 500, 800].forEach(d => T(d, ring));
    for(let k = 0; k < 16; k++){ const r = bdgEl('div', 'lgx-ray'); r.style.setProperty('--a', (k * 22.5) + 'deg'); r.style.setProperty('--d', (k % 4) * 0.06 + 's'); stage.appendChild(r); }
    [0, 350, 700, 1100].forEach(d => T(d, () => { launchConfetti(); launchHeartBurst(); }));
    const ban = bdgEl('div', 'lgx-banner'); 'LEAF LEGEND'.split('').forEach((ch, i) => { const sp = bdgEl('span', '', ch === ' ' ? '\u00a0' : ch); sp.style.setProperty('--d', (0.3 + i * 0.07) + 's'); ban.appendChild(sp); });
    stage.appendChild(ban);
  });
  T(boom + 3600, () => stage.classList.add('out'));
}

// ---- Birthday 2026 showcase (replay) badges: progress is written by birthday_2026_showcase.html ----
const SHOWCASE_KEY = 'ann_showcase_2026_v1';   // { goals:{id:{at}} = lifetime goals earned (what the badge reads), runGoals = this showcase run only, eggs:{id:{at}}, frontRow:{at} }
const SHOWCASE_STEPS = [3, 6, 13];             // goals completed -> levels 1, 2, 3 (13 = every goal)
const bdgShowcase = () => bdgJSON(SHOWCASE_KEY, {});
const bdgShowcaseGoals = () => Object.keys(bdgShowcase().goals || {}).length;

const BADGES = [
  { id:'secrets', name:'Secret Keeper', glyph:'★', animVersion:3, evolveGlyph:true, celebrateOnVisit:true,
    ladder:['Secret Keeper', 'Secret Agent', 'Master of Mysteries', 'Keeper of Everything', 'Living Legend', 'Celestial Keeper'],
    hint:'find every secret hiding on a page',
    level: () => PageEggs.sync().length,
    next: lv => lv < Object.keys(PageEggs.PAGES).length ? 'find every secret on another page to prestige' : null,
    info: lv => (() => { const t = SECRET_TIERS[PageEggs.order()[lv - 1]]; return t ? t.info : 'Every secret on another page, found.'; })(),
    // every completed page's animation plays in turn (oldest first); the newest is last, then the medal
    play(done, lv){
      const o = dimOverlay();
      const pages = PageEggs.order().slice();
      const step = () => {
        const t = pages.length ? SECRET_TIERS[pages.shift()] : null;
        if(t) return t.anim(o, step);
        if(pages.length) return step();
        skReveal(o, 'secrets', lv, done);
      };
      setTimeout(step, 500);
    } },

  // Earned on the gifts page, so it can't pop up in the moment like the secrets one.
  // celebrateOnVisit = play its animation the first time she lands on the home page after earning it.
  { id:'birthday26', name:'Birthday Bestie', glyph:'🎁', celebrateOnVisit:true,
    hint:'open every gift and every page of the Birthday 2026 adventure',
    earned: () => birthday2026Complete(),
    info: () => 'All ' + TOTAL_GIFTS + ' stops opened, every page of the birthday adventure unlocked, start to finish.<br><br>Thank you for letting me spoil you rotten, and for being the kind of person who is worth the extra hours. Happy 25th, Bestie Ann.',
    // a gift box drops in, shakes, pops its lid; the medal rises out and balloons float up
    play(done){
      const o = dimOverlay();
      const stage = document.createElement('div'); stage.className = 'gb-stage';
      const gift = document.createElement('div'); gift.className = 'gb-gift';
      const core = document.createElement('div'); core.className = 'gb-core'; core.textContent = '🎁';
      const box = document.createElement('div'); box.className = 'gb-box';
      const lid = document.createElement('div'); lid.className = 'gb-lid';
      gift.append(core, box, lid);
      stage.appendChild(gift);
      ['🎈','🎈','🎈','🎈','🎈','🎈'].forEach((b, i) => {
        const el = document.createElement('span'); el.className = 'gb-balloon'; el.textContent = b;
        el.style.setProperty('--bx', ((i - 2.5) * 70 + (Math.random() - 0.5) * 30) + 'px');
        el.style.setProperty('--bd', (2.2 + Math.random() * 0.8) + 's');
        el.style.setProperty('--bl', (i * 0.12) + 's');
        stage.appendChild(el);
      });
      o.appendChild(stage);
      setTimeout(() => gift.classList.add('shake'), 900);
      setTimeout(() => { lid.classList.add('pop'); stage.classList.add('pop'); launchConfetti(); }, 2100);
      setTimeout(() => { core.classList.add('in'); launchHeartBurst(); }, 2250);
      setTimeout(launchHeartBurst, 3200);
      setTimeout(() => endOverlay(o, done), 4900);
    } },

  // ---- Signed & Sealed: contract signed (earned on the contract page, celebrated when she's back here) ----
  { id:'signed', name:'Signed & Sealed', glyph:'🖋️', celebrateOnVisit:true,
    hint:'sign the contract',
    level: () => isContractSigned() ? 1 : 0,
    info: () => 'Signed, sealed, and (hopefully) delivered. The contract is officially binding: no take-backs, no refunds on bestie.<br><br>Welcome to another year of us.',
    // a quill signs the contract, then a wax seal stamps down
    play(done){
      const o = dimOverlay();
      const card = bdgEl('div', 'ss-card');
      card.append(bdgEl('div', 'ss-title', 'the yearly contract'), bdgEl('div', 'ss-line'));
      card.insertAdjacentHTML('beforeend', '<svg class="ss-sig" viewBox="0 0 220 80" aria-hidden="true"><path pathLength="1" d="M6 52 C14 10 30 8 32 34 C33 52 22 58 26 44 C32 24 52 20 56 40 C59 54 66 54 72 38 C78 22 88 22 90 40 C92 54 104 52 112 36 C118 24 128 26 128 40 C128 52 140 54 150 40 C160 26 172 40 170 52 C168 62 186 44 214 30"/></svg>');
      card.append(bdgEl('span', 'ss-quill', '✒️'), bdgEl('div', 'ss-seal', '♡'));
      o.appendChild(card);
      setTimeout(() => card.classList.add('out'), 3500);
      bdgMedal(o, '🖋️', 3700, done);
    } },

  // ---- Creature of Habit: visit streak (7 / 30 / 100 days in a row) ----
  { id:'habit', name:'Creature of Habit', glyph:'📅', animVersion:2, celebrateOnVisit:true,
    ladder:['Creature of Habit', 'Devoted', 'Unshakeable'],
    hint:'visit seven days in a row',
    level: () => bdgTier(bdgBestStreak(), BDG_STREAK_STEPS),
    next: lv => BDG_STREAK_STEPS[lv] ? BDG_STREAK_STEPS[lv] + ' days in a row' : null,
    info: lv => [
      'Seven days in a row. You kept coming back to this little corner of the internet, and I will never get over how nice that is.<br><br>Keep the streak warm.',
      'Thirty days running. A whole month of dropping by, no matter what else was going on.<br><br>That is devotion. I am calling it.',
      'One hundred days in a row. At this point I think you live here.<br><br>I am so, so glad you do.'
    ][lv - 1],
    // a habit tracker ticks off the days one by one
    play(done, lv){
      const o = dimOverlay();
      const card = bdgEl('div', 'hb-card');
      card.appendChild(bdgEl('div', 'hb-cap', bdgBestStreak() + ' days in a row'));
      const days = bdgEl('div', 'hb-days');
      'MTWTFSS'.split('').forEach((d, i) => {
        const t = bdgEl('span', 'hb-day', d);
        t.style.setProperty('--d', (0.8 + i * 0.3) + 's');
        days.appendChild(t);
      });
      card.appendChild(days);
      o.appendChild(card);
      setTimeout(() => card.classList.add('out'), 3100);
      bdgPrestige(o, 'habit', lv, 3300, done);
    } },

  // ---- Pen Pal: months stamped in the ledger (6 / 12 / 24) ----
  { id:'penpal', name:'Pen Pal', glyph:'📮', animVersion:2, celebrateOnVisit:true,
    ladder:['Pen Pal', 'Postmaster', 'Postmaster General'],
    hint:'keep coming back, month after month',
    level: () => bdgTier(bdgArr(BK.ledger).length, BDG_LEDGER_STEPS),
    next: lv => BDG_LEDGER_STEPS[lv] ? BDG_LEDGER_STEPS[lv] + ' months stamped' : null,
    info: lv => [
      'Three different months stamped in the ledger. Here`s to three more brilliant months of fun..',
      'Six different months stamped in the ledger. You keep turning up, month after month, like a proper pen pal.<br><br>Letters are better when they keep arriving.',
      'Twelve months. A whole year of postmarks, and every single one is you showing up.<br><br>I am officially promoting you to Postmaster.',
      'Twenty-four months of postmarks. Two whole years of you turning up.<br><br>Postmaster General, with all the honour and absolutely no extra pay.'
    ][lv - 1],
    // her real postmarks slam down across the screen
    play(done, lv){
      const o = dimOverlay();
      const stage = bdgEl('div', 'pm-stage');
      bdgArr(BK.ledger).slice(-9).forEach((key, i) => {
        const [y, m] = key.split('-');
        const st = bdgEl('div', 'pm-stamp');
        st.append(bdgEl('span', 'pm-m', MONTH_ABBR[parseInt(m, 10) - 1]), bdgEl('span', 'pm-y', "'" + y.slice(2)));
        st.style.left = (16 + (i % 3) * 34 + Math.random() * 6) + '%';
        st.style.top = (20 + Math.floor(i / 3) * 28 + Math.random() * 6) + '%';
        st.style.setProperty('--r', ((Math.random() - 0.5) * 40) + 'deg');
        st.style.setProperty('--d', (i * 0.2) + 's');
        stage.appendChild(st);
      });
      o.appendChild(stage);
      setTimeout(() => stage.classList.add('out'), 2700);
      bdgPrestige(o, 'penpal', lv, 2900, done);
    } },

  // ---- Sticker Collector: weekly corkboard stickers (10 / the full set / 52) ----
  { id:'stickers', name:'Sticker Collector', glyph:'📌', animVersion:2, celebrateOnVisit:true,
    ladder:['Sticker Collector', 'Sticker Hoarder', 'Corkboard Royalty'],
    hint:'keep dropping by and the corkboard fills up',
    level: () => bdgTier(bdgArr(BK.cork).length, bdgCorkSteps()),
    next: lv => bdgCorkSteps()[lv] ? bdgCorkSteps()[lv] + ' weeks of stickers' : null,
    info: lv => [
      'Ten weeks, ten stickers on the corkboard. You keep dropping by, and the board keeps getting prettier because of it.',
      'The whole set. You have collected every single sticker there is, and the board has never looked better.',
      'Fifty-two weeks of stickers. A whole year of the corkboard filling up, one visit at a time.<br><br>Royalty. Obviously.'
    ][lv - 1],
    // her own stickers slap onto the screen at random angles
    play(done, lv){
      const o = dimOverlay();
      const mine = bdgArr(BK.cork).map(s => s && s.glyph).filter(Boolean);
      const pool = (mine.length ? mine : CORK_STICKERS).slice();
      for(let i = pool.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const stage = bdgEl('div', 'sc-stage');
      pool.slice(0, 14).forEach((g, i) => {
        const s = bdgEl('span', 'sc-sticker', g);
        s.style.left = (8 + Math.random() * 84) + '%';
        s.style.top = (12 + Math.random() * 76) + '%';
        s.style.fontSize = (2.2 + Math.random() * 1.6) + 'rem';
        s.style.setProperty('--r', ((Math.random() - 0.5) * 70) + 'deg');
        s.style.setProperty('--d', (i * 0.13) + 's');
        stage.appendChild(s);
      });
      o.appendChild(stage);
      setTimeout(() => stage.classList.add('out'), 2500);
      bdgPrestige(o, 'stickers', lv, 2700, done);
    } },

  // ---- Cartographer: every page unlocked. Never retracts: each time pages are added, completing the new set levels it up ----
  { id:'cartographer', name:'Cartographer', glyph:'🧭', animVersion:2, celebrateOnVisit:true,
    ladder:['Cartographer', 'Trailblazer', 'Pathfinder', 'Mapmaker Supreme', 'Atlas', 'World Wanderer'],
    hint:'unlock 10 pages on the site',
    level: () => cartoLevel(),
    next: lv => CARTO_STEPS[lv] ? 'unlock ' + CARTO_STEPS[lv] + ' pages' : null,
    info: lv => lv > 1
      ? 'You have unlocked ' + (CARTO_STEPS[lv - 1] || cartoUnlocked()) + ' pages and counting. The map keeps growing and you keep finding your way across it.<br><br>Officially the best-travelled person in this entire corner of the internet.'
      : 'Ten doors on this site are open to you, ten stamps filled in on the sheet.<br><br>You are officially the best-travelled person in this entire corner of the internet.',
    // her real page stamps fly in from all sides and fill the sheet
    play(done, lv){
      const o = dimOverlay();
      const tiles = getNavCategories().flatMap(c => c.items).filter(i => i.unlocked).slice(0, 12);
      const sheet = bdgEl('div', 'cg-sheet'), grid = bdgEl('div', 'cg-grid');
      tiles.forEach((it, i) => {
        const t = bdgEl('div', 'cg-tile', GLYPH[it.key] || '✦');
        const ang = Math.random() * Math.PI * 2, dist = 500 + Math.random() * 300;
        t.style.setProperty('--fx', Math.round(Math.cos(ang) * dist) + 'px');
        t.style.setProperty('--fy', Math.round(Math.sin(ang) * dist) + 'px');
        t.style.setProperty('--fr', Math.round((Math.random() - 0.5) * 360) + 'deg');
        t.style.setProperty('--d', (0.5 + i * 0.14) + 's');
        grid.appendChild(t);
      });
      sheet.appendChild(grid);
      o.appendChild(sheet);
      setTimeout(() => sheet.classList.add('out'), 3000);
      bdgPrestige(o, 'cartographer', lv, 3200, done);
    } },

  // ---- Friendiversary: visiting on the day you met (one level per year) ----
  { id:'friendiversary', name:'Friendiversary', glyph:'🥂', animVersion:2, celebrateOnVisit:true,
    ladder:['Friendiversary', 'Another Year', 'Tradition', 'Forever Fixture', 'Ever After', 'Evergreen'],
    hint:'there is one day a year worth turning up for',
    level: () => bdgSpecialYears('met').length,
    next: () => 'come by on the same day next year',
    info: lv => lv > 1
      ? 'That is ' + lv + ' anniversaries you have come by for. Every one of them makes me ridiculously happy.<br><br>Here is to the next one.'
      : 'You showed up on the anniversary of the day we met. I could not have planned a better way to mark it.<br><br>Cheers, bestie.',
    // a calendar leaf flips down on the day you met
    play(done, lv){
      const o = dimOverlay();
      const [my, mm, md] = MET_DATE.split('-').map(Number);
      const yrs = new Date().getFullYear() - my;
      const leaf = bdgEl('div', 'an-leaf');
      leaf.append(bdgEl('div', 'an-top', MONTH_ABBR[mm - 1]), bdgEl('div', 'an-day', String(md)), bdgEl('div', 'an-year', yrs > 0 ? 'year ' + yrs : '♡'));
      o.appendChild(leaf);
      setTimeout(launchHeartBurst, 1000);
      setTimeout(launchHeartBurst, 1900);
      setTimeout(() => leaf.classList.add('out'), 3000);
      bdgPrestige(o, 'friendiversary', lv, 3200, done);
    } },

  // ---- Two Candles: visiting on BOTH birthdays in the same year (one level per year) ----
  { id:'candles', name:'Two Candles', glyph:'🎂', animVersion:2, celebrateOnVisit:true,
    ladder:['Two Candles', 'Double Wish', 'Birthday Tradition', 'Never Missed One', 'Every Candle', 'Lifelong Guest'],
    hint:'some days are worth showing up for',
    level: () => bdgBothBirthdayYears().length,
    next: () => 'visit on both birthdays again next year',
    info: lv => lv > 1
      ? 'That is ' + lv + ' years you have turned up for both birthdays. I do not take a single one of them for granted.'
      : 'Your birthday and mine, both in the same year, and you came by for each one. Two candles, one very happy me.<br><br>Thank you for showing up for both.',
    // two candles get lit, one after the other
    play(done, lv){
      const o = dimOverlay();
      const stage = bdgEl('div', 'tc-stage');
      stage.appendChild(bdgEl('div', 'tc-glow'));
      const ones = [[BK.tristanBday, '#c97a68'], [BK.annBday, '#e8b95a']].map(([md, color]) => {
        const one = bdgEl('div', 'tc-one');
        const c = bdgEl('div', 'tc-candle');
        c.style.setProperty('--cc', color);
        c.appendChild(bdgEl('div', 'tc-flame'));
        one.append(c, bdgEl('div', 'tc-date', bdgDayLabel(md)));
        stage.appendChild(one);
        return one;
      });
      o.appendChild(stage);
      setTimeout(() => ones[0].classList.add('lit'), 700);
      setTimeout(() => ones[1].classList.add('lit'), 1500);
      setTimeout(() => stage.classList.add('glow'), 1700);
      setTimeout(() => stage.classList.add('flare'), 2500);
      setTimeout(() => stage.classList.add('out'), 3000);
      bdgPrestige(o, 'candles', lv, 3200, done);
    } },
  // ---- Front Row: sat through the whole showcase replay, no skipping (earned on the showcase page) ----
  { id:'frontrow', name:'Front Row', glyph:'🎟️', animVersion:2, celebrateOnVisit:true,
    hint:'sit through the whole Birthday 2026 showcase - no skipping',
    earned: () => !!bdgShowcase().frontRow,
    info: () => 'The countdown, the music, the reveal and the whole premiere loop, start to finish, without skipping a single song.<br><br>That is a front row seat if I have ever seen one. Thank you for sitting through all of it.',
    // curtains part on a marquee, a ticket slides in and gets stamped, then the lights come up
    play(done){
      const o = dimOverlay();
      const stage = bdgEl('div', 'frw-stage');
      const L = bdgEl('div', 'frw-curtain frw-l'), R = bdgEl('div', 'frw-curtain frw-r');
      const marquee = bdgEl('div', 'frw-marquee');
      for(let i = 0; i < 14; i++){ const b = bdgEl('i', 'frw-bulb'); b.style.setProperty('--i', i); marquee.appendChild(b); }
      marquee.appendChild(bdgEl('div', 'frw-now', 'now showing'));
      const beam = bdgEl('div', 'frw-beam');
      const ticket = bdgEl('div', 'frw-ticket');
      ticket.append(bdgEl('div', 'frw-t-top', 'admit one'), bdgEl('div', 'frw-t-main', 'FRONT ROW'),
        bdgEl('div', 'frw-t-sub', 'Birthday 2026 \u00b7 the whole show'), bdgEl('div', 'frw-perf'), bdgEl('div', 'frw-stamp', 'NO SKIPS'));
      stage.append(beam, marquee, ticket, L, R);
      o.appendChild(stage);
      setTimeout(() => stage.classList.add('open'), 500);          // curtains part, bulbs chase
      setTimeout(() => ticket.classList.add('in'), 1500);          // ticket slides in
      setTimeout(() => ticket.classList.add('stamped'), 2700);     // stamp thumps down
      setTimeout(() => { stage.classList.add('flare'); launchConfetti(); }, 2750);
      setTimeout(() => stage.classList.add('out'), 4000);
      bdgMedal(o, '🎟️', 4200, done);
    } },

  // ---- Leaf Legend: showcase goals (3 / 6 / all 13). On the prestige system: Bronze / Silver / Gold ----
  { id:'showcase', name:'Leaf Catcher', glyph:'🍃', animVersion:3, celebrateOnVisit:true,
    ladder:['Leaf Catcher', 'Leaf Hoarder', 'Leaf Legend'],
    hint:'complete the goals on the Birthday 2026 showcase',
    level: () => bdgTier(bdgShowcaseGoals(), SHOWCASE_STEPS),
    next: lv => SHOWCASE_STEPS[lv] ? SHOWCASE_STEPS[lv] + ' showcase goals' : null,
    info: lv => [
      'Three showcase goals done. Those leaves did not stand a chance.',
      'Six goals. Your leaf-catching has become genuinely alarming.<br><br>Seven to go.',
      'Every single showcase goal, done: the big totals, the streaks, the flurries, the power hour haul, the easter eggs and the secret.<br><br>Leaf Legend. Officially. I am not worthy.'
    ][lv - 1],
    // leaves rain down, her real goals tick off on a scoreboard, then the medal charges up
    play(done, lv){
      const o = dimOverlay();
      const stage = bdgEl('div', 'lfc-stage');
      const total = Object.keys(bdgShowcase().goals || {}).length, all = 13;
      const glyphs = ['🍃', '🍂', '🍃', '🌿'];
      for(let i = 0; i < 26; i++){
        const l = bdgEl('span', 'lfc-leaf', glyphs[i % glyphs.length]);
        l.style.left = (Math.random() * 96) + '%';
        l.style.fontSize = (1.2 + Math.random() * 1.6) + 'rem';
        l.style.setProperty('--sw', ((Math.random() - 0.5) * 140) + 'px');
        l.style.setProperty('--r', ((Math.random() - 0.5) * 540) + 'deg');
        l.style.setProperty('--t', (2.6 + Math.random() * 1.4) + 's');
        l.style.setProperty('--d', (Math.random() * 1.8) + 's');
        stage.appendChild(l);
      }
      const card = bdgEl('div', 'lfc-card');
      const num = bdgEl('div', 'lfc-num', '0');
      const pips = bdgEl('div', 'lfc-pips');
      for(let i = 0; i < all; i++){ const p = bdgEl('i', 'lfc-pip'); p.style.setProperty('--d', (0.7 + i * 0.22) + 's'); if(i < total) p.classList.add('on'); pips.appendChild(p); }
      card.append(bdgEl('div', 'lfc-cap', 'showcase goals'), num, pips);
      stage.appendChild(card);
      o.appendChild(stage);
      // the scoreboard counts up in step with the pips lighting
      for(let i = 1; i <= total; i++) setTimeout(() => { num.textContent = i; num.classList.remove('tick'); void num.offsetWidth; num.classList.add('tick'); }, 700 + (i - 1) * 220 + 120);
      setTimeout(() => card.classList.add('flash'), 700 + total * 220 + 200);
      setTimeout(() => stage.classList.add('out'), 3300);
      if(lv >= 3){                                    // prestige III: the egg finale plays before the medal
        setTimeout(() => lgxGrandFinale(o), 3500);
        bdgPrestige(o, 'showcase', lv, 3500 + 6800, done);
      } else bdgPrestige(o, 'showcase', lv, 3500, done);
    } },

];

// true once every gift stop (1..TOTAL_GIFTS) is opened AND every Birthday 2026 page is unlocked.
// getOpenedGifts / isPageUnlocked / NAV / TOTAL_GIFTS all come from nav.js.
function birthday2026Complete(){
  const opened = getOpenedGifts();
  for(let id = 1; id <= TOTAL_GIFTS; id++) if(!opened.has(id)) return false;
  const cat = NAV.find(c => c.id === 'bday26');
  return !!cat && cat.items.every(i => isPageUnlocked(i.matchHref || i.href));
}

// ---- badge data: recorded once per home-page visit, before the badges render ----

// remembers the years she visited on the day you met / each birthday
function recordSpecialVisits(){
  const days = { met: MET_DATE.slice(5), ann: BK.annBday, tristan: BK.tristanBday };
  const now = new Date(), md = bdgLocalDate(now).slice(5), yr = now.getFullYear();
  const data = bdgJSON(BK.special, {});
  let changed = false;
  Object.keys(days).forEach(k => {
    if(!Array.isArray(data[k])) data[k] = [];
    if(md === days[k] && !data[k].includes(yr)){ data[k].push(yr); changed = true; }
  });
  if(changed){ try{ localStorage.setItem(BK.special, JSON.stringify(data)); }catch(e){} }
}

// Cartographer is based on HOW MANY pages are unlocked, not on "every page": prestige I at 10 pages, II at 15, and so on.
// Adding pages to the site never takes a level away or demands a re-collect. To add a prestige, append a number here
// (and make sure the badge's ladder has a title for it).
const CARTO_STEPS = [10, 15, 20, 25, 30, 35];
const cartoUnlocked = () => getNavCategories().flatMap(cat => cat.items).filter(i => i.unlocked).length;
const cartoCount = n => CARTO_STEPS.filter(step => n >= step).length;
// never goes down: the best of what she has saved and what is unlocked right now
function cartoLevel(){
  const saved = bdgJSON(BK.carto, {}).level || 0;
  return Math.min(Math.max(saved, cartoCount(cartoUnlocked())), CARTO_STEPS.length);
}
function updateCartographer(){
  const c = bdgJSON(BK.carto, {});
  const lv = cartoLevel();
  if(lv <= (c.level || 0)) return;
  try{ localStorage.setItem(BK.carto, JSON.stringify({ level: lv, pages: cartoUnlocked() })); }catch(e){}
}

// ---- badge levels, titles, popups ----
const badgeLevel = bd => bd.level ? bd.level() : (bd.earned() ? 1 : 0);
const badgeTitle = (bd, lv) => lv > 0 ? (bd.ladder ? prTitle(bd, lv) : (bd.title ? bd.title(lv) : bd.name)) : bd.name;

// Plays the animation for any celebrateOnVisit badge that has reached a level she hasn't been shown yet.
// If several are waiting (e.g. the first visit after an update) they play one after another, each
// starting when she closes the previous popup. She can click any earned badge to replay it.
function celebrateNewBadges(delay){
  let seen = bdgJSON(BK.celebrated, {});
  if(Array.isArray(seen)) seen = Object.fromEntries(seen.map(id => [id, 1]));   // older format
  // Badges also carry an animVersion (default 1). Bump it when a badge's animation is improved and everyone who already
  // has the badge sees the new one on their next visit. Someone with no record counts as having seen version 1.
  const ver = bdgJSON(BK.animVer, {}); const verOf = b => b.animVersion || 1;
  const queue = BADGES.filter(b => b.celebrateOnVisit && (badgeLevel(b) > (seen[b.id] || 0) || (badgeLevel(b) > 0 && (ver[b.id] || 1) < verOf(b))));
  // brand-new level for someone who has never been shown anything: nothing to record for the old ones
  BADGES.forEach(b => { if(badgeLevel(b) > 0 && b.celebrateOnVisit) ver[b.id] = verOf(b); });
  try{ localStorage.setItem(BK.animVer, JSON.stringify(ver)); }catch(e){}
  if(!queue.length) return;
  queue.forEach(b => { seen[b.id] = badgeLevel(b); });
  try{ localStorage.setItem(BK.celebrated, JSON.stringify(seen)); }catch(e){}
  const ids = queue.map(b => b.id);
  const run = () => {
    const id = ids.shift(); if(!id) return;
    if(ids.length) afterClose = run;
    openBadge(id);
  };
  setTimeout(run, delay);
}

function openBadge(id){
  const bd = BADGES.find(b => b.id === id);
  if(!bd) return;
  const lv = badgeLevel(bd);
  bd.play(() => showModal(badgeTitle(bd, lv), (bd.ladder ? prLine(bd, lv) : '') + bd.info(lv), 'Bestie Tristan'), lv);
}

function renderBadges(){
  const row = $('badge-row');
  if(!row) return;
  $('secrets-count').textContent = PageEggs.foundTotal() + ' / ' + PageEggs.grandTotal();
  row.innerHTML = '';
  // badges she hasn't earned yet are not shown at all
  BADGES.forEach(bd => {
    const lv = badgeLevel(bd);
    if(lv < 1) return;
    const title = badgeTitle(bd, lv);
    const nextHint = bd.next ? bd.next(lv) : null;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'bdg earned';
    el.title = title + (nextHint ? ' - next: ' + nextHint : '');
    el.innerHTML = '<span class="ro"></span><span class="bdg-name"></span>';
    const ro = el.querySelector('.ro');
    if(bd.ladder){ ro.classList.add('ro-medal'); ro.textContent = ''; ro.appendChild(skMedal(bd, lv, 58)); }   // badges with levels get the prestige medal
    else ro.textContent = bd.glyph;
    if(bd.tiered){
      const pill = document.createElement('span');
      pill.className = 'bdg-lv'; pill.textContent = lv;
      ro.appendChild(pill);
    }
    el.querySelector('.bdg-name').textContent = title;
    el.onclick = () => openBadge(bd.id);
    row.appendChild(el);
  });
  if(!row.children.length){
    const none = document.createElement('span');
    none.className = 'ledger-empty';
    none.textContent = 'none yet - they turn up on their own as you explore';
    row.appendChild(none);
  }
}

// ---------- THE EGGS THEMSELVES ----------
// postmark x5
let pmClicks = 0;
$('postmark').addEventListener('click', function(){
  pmClicks++;
  const c = $('pm-count');
  c.textContent = pmClicks; c.classList.add('show');
  this.classList.add('clicked');
  setTimeout(() => this.classList.remove('clicked'), 500);
  if(pmClicks >= 5){
    c.classList.remove('show'); pmClicks = 0;
    setTimeout(() => unlockEgg('postmark'), 200);
  }
});

// konami code
const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiPos = 0;
window.addEventListener('keydown', e => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konamiPos = (key === konamiSeq[konamiPos]) ? konamiPos + 1 : (key === konamiSeq[0] ? 1 : 0);
  if(konamiPos === konamiSeq.length){ konamiPos = 0; unlockEgg('konami'); }
});

// type "ann" or "tristan"
let typedBuffer = '';
window.addEventListener('keydown', e => {
  if(e.key.length === 1){
    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-10);
    if(typedBuffer.endsWith('tristan')){ typedBuffer = ''; unlockEgg('tristan'); }
    else if(typedBuffer.endsWith('ann')){ typedBuffer = ''; unlockEgg('name'); }
  }
});

// double-click the signature
document.querySelector('.letter-sig').addEventListener('dblclick', () => unlockEgg('signature'));

// click "besties" under the name 7x
let brandClicks = 0;
$('brand').addEventListener('click', () => {
  brandClicks++;
  if(brandClicks >= 7){ brandClicks = 0; unlockEgg('nav'); }
});

// drifting envelope
function spawnDrifter(){
  const d = document.createElement('div');
  d.className = 'drifter'; d.textContent = '✉';
  d.style.top = (10 + Math.random()*65) + 'vh';
  d.onclick = () => { unlockEgg('idle'); d.remove(); };
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 6000);
}
setTimeout(spawnDrifter, 10000);
setInterval(spawnDrifter, 50000);

// drag the stamp onto the postmark ("mail it")
(function(){
  const stamp = document.querySelector('.stamp');
  const postmark = $('postmark');
  if(!stamp || !postmark) return;
  let dragging = false, startX = 0, startY = 0;
  const dist = () => {
    const p = postmark.getBoundingClientRect(), s = stamp.getBoundingClientRect();
    return Math.hypot((p.left+p.width/2)-(s.left+s.width/2), (p.top+p.height/2)-(s.top+s.height/2));
  };
  stamp.addEventListener('pointerdown', e => {
    dragging = true; startX = e.clientX; startY = e.clientY;
    stamp.setPointerCapture(e.pointerId);
    stamp.classList.add('stamp-dragging');
  });
  stamp.addEventListener('pointermove', e => {
    if(!dragging) return;
    stamp.style.transform = `translate(${e.clientX-startX}px,${e.clientY-startY}px)`;
    postmark.classList.toggle('drag-hint', dist() < 100);
  });
  stamp.addEventListener('pointerup', e => {
    if(!dragging) return;
    dragging = false;
    stamp.classList.remove('stamp-dragging');
    postmark.classList.remove('drag-hint');
    const moved = Math.hypot(e.clientX-startX, e.clientY-startY);
    const d = dist();
    stamp.style.transition = 'transform 0.5s cubic-bezier(0.34,1.6,0.64,1)';
    stamp.style.transform = 'translate(0,0)';
    setTimeout(() => { stamp.style.transition = ''; }, 520);
    if(moved > 20 && d < 100) unlockEgg('mail');
  });
})();

// chase the shy heart into the top-right corner
function spawnChaseHeart(){
  if($('chase-heart')) return;
  const h = document.createElement('div');
  h.id = 'chase-heart'; h.className = 'chase-heart'; h.textContent = '♡';
  let x = window.innerWidth*0.5, y = window.innerHeight*0.55, vx = 0, vy = 0;
  h.style.left = x+'px'; h.style.top = y+'px';
  document.body.appendChild(h);
  const startTime = Date.now();
  function onMove(e){
    const dx = x - e.clientX, dy = y - e.clientY, d = Math.hypot(dx, dy);
    if(d < 150 && d > 0){ vx += (dx/d)*1.3; vy += (dy/d)*1.3; }
  }
  window.addEventListener('mousemove', onMove);
  function loop(){
    if(!document.body.contains(h)){ window.removeEventListener('mousemove', onMove); return; }
    if(Date.now() - startTime > 90000){
      window.removeEventListener('mousemove', onMove);
      h.remove();
      setTimeout(spawnChaseHeart, 45000);
      return;
    }
    vx += (Math.random()-0.5)*0.5; vy += (Math.random()-0.5)*0.5;
    vx = Math.max(-3.5, Math.min(3.5, vx))*0.96;
    vy = Math.max(-3.5, Math.min(3.5, vy))*0.96;
    x = Math.max(24, Math.min(window.innerWidth-24, x+vx));
    y = Math.max(24, Math.min(window.innerHeight-24, y+vy));
    h.style.left = x+'px'; h.style.top = y+'px';
    if(x > window.innerWidth - 90 && y < 90){
      window.removeEventListener('mousemove', onMove);
      unlockEgg('chase'); h.remove();
      return;
    }
    requestAnimationFrame(loop);
  }
  loop();
}
setTimeout(spawnChaseHeart, 15000);

console.log('%c✉ psst.', 'font-size:20px;color:#b86858;font-family:cursive;');
console.log("If you're reading this, you're exactly the kind of curious person this whole site was made for. There are 9 secrets hidden around this page - happy hunting.");

// ---------- QUIET VISIT STREAK (recorded only, so a streak badge can be added later) ----------
function recordVisitStreak(){
  const KEY = 'ann_visit_streak_v1';
  const today = bdgLocalDate();
  let data = null;
  try{ data = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
  if(!data){ data = { lastDate: today, streak: 1, longest: 1 }; }
  else if(data.lastDate !== today){
    const diff = Math.round((new Date(today+'T00:00:00') - new Date(data.lastDate+'T00:00:00')) / 86400000);
    data.streak = diff === 1 ? data.streak + 1 : 1;
    data.longest = Math.max(data.longest || 1, data.streak);
    data.lastDate = today;
  }
  try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){}
}

// ---------- MONTHLY LEDGER ----------
const MONTH_ABBR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function initMonthlyLedger(){
  const KEY = 'ann_monthly_ledger_v1';
  let months = null;
  try{ months = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
  if(!Array.isArray(months)) months = [];
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  let isNew = false;
  if(!months.includes(thisMonth)){ months.push(thisMonth); isNew = true; }
  try{ localStorage.setItem(KEY, JSON.stringify(months)); }catch(e){}
  const row = $('ledger-row'), empty = $('ledger-empty');
  if(empty) empty.remove();
  months.forEach(mk => {
    const [y, m] = mk.split('-');
    const el = document.createElement('div');
    el.className = 'ledger-stamp';
    el.style.setProperty('--lr', ((Math.random()-0.5)*22) + 'deg');
    el.innerHTML = `<span class="ledger-stamp-month">${MONTH_ABBR[parseInt(m,10)-1]}</span><span class="ledger-stamp-year">'${y.slice(2)}</span>`;
    row.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    if(isNew && mk === thisMonth){
      setTimeout(() => { el.classList.add('newest'); setTimeout(() => el.classList.remove('newest'), 900); }, 300);
    }
  });
}

// ---------- WEEKLY CORKBOARD ----------
const CORK_STICKERS = ['♡','✉','★','✦','🌿','🍯','🎀','🕊️','🧸','🍁','☕','🎈','🍪','🌙','🦋','✨','💅','🎃','🍂','🔥','🌹','💖','😀','🎉','🥭','🥚','💲','🎄'];
function isoWeekKey(d){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay()+6)%7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2,'0')}`;
}
function initWeeklyCorkboard(){
  const KEY = 'ann_weekly_corkboard_v1';
  let stickers = null;
  try{ stickers = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
  if(!Array.isArray(stickers)) stickers = [];
  const thisWeek = isoWeekKey(new Date());
  let newest = null;
  if(!stickers.some(s => s.week === thisWeek)){
    const used = new Set(stickers.map(s => s.glyph));
    const pool = CORK_STICKERS.filter(g => !used.has(g));
    const list = pool.length ? pool : CORK_STICKERS;
    newest = { week: thisWeek, glyph: list[Math.floor(Math.random()*list.length)], x: 12 + Math.random()*76, y: 18 + Math.random()*64, rot: (Math.random()-0.5)*50 };
    stickers.push(newest);
  }
  try{ localStorage.setItem(KEY, JSON.stringify(stickers)); }catch(e){}
  const board = $('corkboard'), empty = $('corkboard-empty');
  if(empty) empty.remove();
  stickers.forEach(s => {
    const el = document.createElement('div');
    el.className = 'cork-sticker'; el.textContent = s.glyph;
    el.style.left = s.x + '%'; el.style.top = s.y + '%';
    el.style.setProperty('--sr', s.rot + 'deg');
    board.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    if(newest && s.week === newest.week){
      setTimeout(() => { el.classList.add('newest'); setTimeout(() => el.classList.remove('newest'), 950); }, 300);
    }
  });
}

// ---------- EVERYWHERE TO GO: every page in NAV as a postage stamp ----------
const CAT_COLOR = { story:'#b86858', media:'#6f9466', fun:'#c8943a', bday26:'#8a6fa8', contract:'#7a5230' };
const GLYPH = {
  'our_journey.html':'🗺', 'us.html':'♡', 'reasons.html':'💌',
  'passport.html':'✈', 'postcard_gallery.html':'🏞', 'letters_archive.html':'✉',
  'tier_list.html':'🏆', 'birthday_2026_showcase.html':'🕰️', 'birthday_2026.html':'🎈', 'birthday_2026_gifts.html':'🎁',
  'birthday_2026_quiz.html':'❓', 'birthday_2026_thank_you.html':'💛', 'membership.html':'📜', 'contract.html':'✎'
};
function renderSheet(){
  const sheet = $('sheet'), seen = getSeenPages();
  let n = 0, total = 0, open = 0, hiddenCount = 0;
  sheet.innerHTML = '';

  const stamp = (item, color, fallback) => {
    const live = item && item.unlocked;
    const el = document.createElement(live ? 'a' : 'div');
    el.className = 'pst' + (live ? '' : ' blank');
    el.style.setProperty('--c', color);
    el.style.setProperty('--t', (((n++ * 37) % 7) - 3) * 0.6 + 'deg');
    el.innerHTML = '<div class="pst-in"><span class="pst-glyph"></span><span class="pst-label"></span></div>';
    el.querySelector('.pst-glyph').textContent = live ? (GLYPH[item.key] || fallback) : '?';
    if(live){
      el.querySelector('.pst-label').textContent = item.label;
      el.href = item.href;
      if(seen && !seen.has(item.key)){
        const t = document.createElement('span'); t.className = 'tag'; t.textContent = 'new'; el.appendChild(t);
      }
    } else {
      el.querySelector('.pst-label').remove();
      el.setAttribute('aria-hidden', 'true');
    }
    return el;
  };
  const row = (label, els) => {
    const s = document.createElement('section');
    s.innerHTML = '<div class="row-label"></div><div class="stamps"></div>';
    s.querySelector('.row-label').textContent = label;
    els.forEach(e => s.querySelector('.stamps').appendChild(e));
    sheet.appendChild(s);
  };

  getNavCategories().forEach(cat => {
    const o = cat.items.filter(i => i.unlocked).length;
    total += cat.items.length; open += o;
    if(!o){ hiddenCount += cat.items.length; return; }   // never reveal a fully locked category
    const color = CAT_COLOR[cat.id] || '#c8943a';
    row(cat.label, cat.items.map(i => stamp(i, color, cat.glyph)));
  });
  if(hiddenCount) row('More to find', Array.from({length: hiddenCount}, () => stamp(null, '#c8943a')));
  $('go-count').textContent = open + ' of ' + total + ' open';
}
function renderResume(){
  const el = $('resume'), last = getLastPage();
  if(!last || !getNavCategories().flatMap(c => c.items).some(i => i.href === last.href && i.unlocked)) return;
  el.href = last.href; el.innerHTML = '';
  const b = document.createElement('b'); b.textContent = last.label;
  el.append('pick up where you left off: ', b, ' →');
  el.hidden = false;
}

// ---------- SETTINGS (drop-up). Add an entry to SETTINGS to add a menu item ----------
const SETTINGS = [
  { label:'Reset data', danger:true, run(){ if(confirm('Reset ALL progress? This clears everything.')){ localStorage.clear(); location.reload(); } } },
  { label:'Reset secrets', run(){ if(confirm('Reset just the hidden secrets progress? Your gifts/letters stay untouched.')){ localStorage.removeItem('ann_eggs_found'); localStorage.removeItem('ann_page_eggs_v1'); try{ const c = bdgJSON(BK.celebrated, {}); if(!Array.isArray(c)){ delete c.secrets; localStorage.setItem(BK.celebrated, JSON.stringify(c)); } }catch(e){} location.reload(); } } },
  { label:'Migrate', run(){ location.href = '/migrate'; } },
  { label:'Log out', run(){ location.href = '/cdn-cgi/access/logout'; } },
];
function initSettings(){
  const wrap = $('settings'), btn = $('settings-btn'), menu = $('settings-menu');
  SETTINGS.forEach(s => {
    const b = document.createElement('button');
    b.textContent = s.label; if(s.danger) b.className = 'danger';
    b.onclick = () => { wrap.classList.remove('open'); s.run(); };
    menu.appendChild(b);
  });
  const set = o => { wrap.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); };
  btn.onclick = e => { e.stopPropagation(); set(!wrap.classList.contains('open')); };
  document.addEventListener('click', e => { if(!wrap.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') set(false); });
}

// ---------- INIT ----------
function daysSinceMet(){
  if(!MET_DATE) return null;
  const t = new Date(MET_DATE + 'T00:00:00'); if(isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t.getTime()) / 86400000));
}
window.addEventListener('DOMContentLoaded', () => {
  initAmbientWash();
  PageEggs.sync();
  (function(){   // anyone who already finished the home eggs has seen that animation: don't replay it as a 'new' level
    const seen = bdgJSON(BK.celebrated, {});
    if(!Array.isArray(seen) && seen.secrets === undefined && eggsFound.length >= EGG_KEYS.length){
      seen.secrets = 1; try{ localStorage.setItem(BK.celebrated, JSON.stringify(seen)); }catch(e){}
    }
  })();
  let introSeen = false; try{ introSeen = !!sessionStorage.getItem('besties_intro_seen'); }catch(e){}
  const ls = $('loading-screen');
  if(introSeen){ ls.style.display = 'none'; }
  else{
    setTimeout(() => { ls.classList.add('hide'); setTimeout(() => { ls.style.display = 'none'; launchConfetti(); }, 300); }, 900);
    try{ sessionStorage.setItem('besties_intro_seen', '1'); }catch(e){}
  }
  const d = daysSinceMet();
  if(d !== null) $('since-days').textContent = ' for ' + d.toLocaleString() + ' days';
  renderResume(); renderSheet(); markAllUnlockedPagesSeen();
  recordVisitStreak(); recordSpecialVisits();
  initMonthlyLedger(); initWeeklyCorkboard(); updateCartographer(); renderBadges(); initSettings();
  celebrateNewBadges(introSeen ? 900 : 2800);
});
