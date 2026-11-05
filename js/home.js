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
//   level()    = 0 when not earned, 1+ when earned. Upgradeable badges also set tiered:true (shows a level pill),
//                title(level) (name per level) and next(level) (hint at the next level, shown on hover)
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


// ---- Secret Keeper PRESTIGE ----
// Every page whose secrets are all found = one prestige. The medal itself changes (see css/secret_keeper.css, .skm-p1 ... .skm-p6).
// Past the last look it keeps its final form and the roman numeral keeps climbing.
// To change a look: edit its entry here + its .skm-pN rules in the css. A new look = add an entry here and a .skm-pN block.
const SK_TIERS = [
  { title:'Secret Keeper',        metal:'Bronze',    glyph:'★' },
  { title:'Secret Agent',         metal:'Silver',    glyph:'★' },
  { title:'Master of Mysteries',  metal:'Gold',      glyph:'★' },
  { title:'Keeper of Everything', metal:'Ruby',      glyph:'✦' },
  { title:'Living Legend',        metal:'Prismatic', glyph:'✧' },
  { title:'Celestial Keeper',     metal:'Celestial', glyph:'♛' },
];
function skRoman(n){
  const r = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let o = ''; r.forEach(([v, c]) => { while(n >= v){ o += c; n -= v; } }); return o;
}
const skTier  = p => SK_TIERS[Math.min(Math.max(p, 1), SK_TIERS.length) - 1];
const skTitle = p => p > SK_TIERS.length ? skTier(p).title + ' ' + skRoman(p) : skTier(p).title;

// builds the medal for a prestige. Layers are only added as the prestige grows, so it gets busier and fancier.
function skMedal(p, size){
  const t = Math.min(p, SK_TIERS.length);
  const m = bdgEl('div', 'skm skm-p' + t);
  m.style.setProperty('--sz', size + 'px');
  const add = (cls, txt) => m.appendChild(bdgEl('div', cls, txt));
  if(t >= 6) add('skm-halo');
  if(t >= 3) add('skm-rays');
  if(t >= 4) add('skm-orbit');
  add('skm-disc'); add('skm-inner');
  add('skm-g', skTier(p).glyph);
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
function skReveal(o, lv, done){
  const big = Math.round(Math.min(170, window.innerWidth * 0.42));
  const stage = bdgEl('div', 'skp-stage'), hold = bdgEl('div', 'skp-hold');
  const sub = bdgEl('div', 'skp-sub'), ttl = bdgEl('div', 'skp-title');
  stage.append(hold, sub, ttl); o.appendChild(stage);
  const put = (p, cls) => { hold.querySelectorAll('.skm').forEach(e => e.remove()); const m = skMedal(p, big); m.classList.add(cls); hold.appendChild(m); };
  const say = p => { sub.textContent = 'Prestige ' + skRoman(p); ttl.textContent = skTitle(p); sub.classList.add('show'); ttl.classList.add('show'); };
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
    anim(o, next){
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

const BADGES = [
  { id:'secrets', name:'Secret Keeper', glyph:'★', celebrateOnVisit:true, medal: lv => skMedal(lv, 58),
    hint:'find every secret hiding on a page',
    level: () => PageEggs.sync().length,
    title: lv => skTitle(lv),
    next: lv => lv < Object.keys(PageEggs.PAGES).length ? 'find every secret on another page to prestige' : null,
    info: lv => '<em>Prestige ' + skRoman(lv) + ' &middot; ' + skTier(lv).metal + '</em><br><br>' + (() => { const t = SECRET_TIERS[PageEggs.order()[lv - 1]]; return t ? t.info : 'Every secret on another page, found.'; })(),
    // every completed page's animation plays in turn (oldest first); the newest is last, then the medal
    play(done, lv){
      const o = dimOverlay();
      const pages = PageEggs.order().slice();
      const step = () => {
        const t = pages.length ? SECRET_TIERS[pages.shift()] : null;
        if(t) return t.anim(o, step);
        if(pages.length) return step();
        skReveal(o, lv, done);
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
  { id:'habit', name:'Creature of Habit', glyph:'📅', tiered:true, celebrateOnVisit:true,
    hint:'visit seven days in a row',
    level: () => bdgTier(bdgBestStreak(), BDG_STREAK_STEPS),
    title: lv => ['Creature of Habit', 'Devoted', 'Unshakeable'][lv - 1],
    next: lv => BDG_STREAK_STEPS[lv] ? BDG_STREAK_STEPS[lv] + ' days in a row' : null,
    info: lv => [
      'Seven days in a row. You kept coming back to this little corner of the internet, and I will never get over how nice that is.<br><br>Keep the streak warm.',
      'Thirty days running. A whole month of dropping by, no matter what else was going on.<br><br>That is devotion. I am calling it.',
      'One hundred days in a row. At this point I think you live here.<br><br>I am so, so glad you do.'
    ][lv - 1],
    // a habit tracker ticks off the days one by one
    play(done){
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
      bdgMedal(o, '📅', 3300, done);
    } },

  // ---- Pen Pal: months stamped in the ledger (6 / 12 / 24) ----
  { id:'penpal', name:'Pen Pal', glyph:'📮', tiered:true, celebrateOnVisit:true,
    hint:'keep coming back, month after month',
    level: () => bdgTier(bdgArr(BK.ledger).length, BDG_LEDGER_STEPS),
    title: lv => ['Pen Pal', 'Postmaster', 'Postmaster General'][lv - 1],
    next: lv => BDG_LEDGER_STEPS[lv] ? BDG_LEDGER_STEPS[lv] + ' months stamped' : null,
    info: lv => [
      'Three different months stamped in the ledger. Here`s to three more brilliant months of fun..',
      'Six different months stamped in the ledger. You keep turning up, month after month, like a proper pen pal.<br><br>Letters are better when they keep arriving.',
      'Twelve months. A whole year of postmarks, and every single one is you showing up.<br><br>I am officially promoting you to Postmaster.',
      'Twenty-four months of postmarks. Two whole years of you turning up.<br><br>Postmaster General, with all the honour and absolutely no extra pay.'
    ][lv - 1],
    // her real postmarks slam down across the screen
    play(done){
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
      bdgMedal(o, '📮', 2900, done);
    } },

  // ---- Sticker Collector: weekly corkboard stickers (10 / the full set / 52) ----
  { id:'stickers', name:'Sticker Collector', glyph:'📌', tiered:true, celebrateOnVisit:true,
    hint:'keep dropping by and the corkboard fills up',
    level: () => bdgTier(bdgArr(BK.cork).length, bdgCorkSteps()),
    title: lv => ['Sticker Collector', 'Sticker Hoarder', 'Corkboard Royalty'][lv - 1],
    next: lv => bdgCorkSteps()[lv] ? bdgCorkSteps()[lv] + ' weeks of stickers' : null,
    info: lv => [
      'Ten weeks, ten stickers on the corkboard. You keep dropping by, and the board keeps getting prettier because of it.',
      'The whole set. You have collected every single sticker there is, and the board has never looked better.',
      'Fifty-two weeks of stickers. A whole year of the corkboard filling up, one visit at a time.<br><br>Royalty. Obviously.'
    ][lv - 1],
    // her own stickers slap onto the screen at random angles
    play(done){
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
      bdgMedal(o, '📌', 2700, done);
    } },

  // ---- Cartographer: every page unlocked. Never retracts: each time pages are added, completing the new set levels it up ----
  { id:'cartographer', name:'Cartographer', glyph:'🧭', tiered:true, celebrateOnVisit:true,
    hint:'unlock every page on the site',
    level: () => bdgJSON(BK.carto, {}).level || 0,
    next: () => 'unlock whatever gets added next',
    info: lv => lv > 1
      ? 'Level ' + lv + '. I added more to explore and you went and found all of it anyway.<br><br>The map is bigger now, and you have covered every inch.'
      : 'Every door on this site is open to you. Every single stamp on the sheet is filled in.<br><br>You are officially the best-travelled person in this entire corner of the internet.',
    // her real page stamps fly in from all sides and fill the sheet
    play(done){
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
      bdgMedal(o, '🧭', 3200, done);
    } },

  // ---- Friendiversary: visiting on the day you met (one level per year) ----
  { id:'friendiversary', name:'Friendiversary', glyph:'🥂', tiered:true, celebrateOnVisit:true,
    hint:'there is one day a year worth turning up for',
    level: () => bdgSpecialYears('met').length,
    next: () => 'come by on the same day next year',
    info: lv => lv > 1
      ? 'That is ' + lv + ' anniversaries you have come by for. Every one of them makes me ridiculously happy.<br><br>Here is to the next one.'
      : 'You showed up on the anniversary of the day we met. I could not have planned a better way to mark it.<br><br>Cheers, bestie.',
    // a calendar leaf flips down on the day you met
    play(done){
      const o = dimOverlay();
      const [my, mm, md] = MET_DATE.split('-').map(Number);
      const yrs = new Date().getFullYear() - my;
      const leaf = bdgEl('div', 'an-leaf');
      leaf.append(bdgEl('div', 'an-top', MONTH_ABBR[mm - 1]), bdgEl('div', 'an-day', String(md)), bdgEl('div', 'an-year', yrs > 0 ? 'year ' + yrs : '♡'));
      o.appendChild(leaf);
      setTimeout(launchHeartBurst, 1000);
      setTimeout(launchHeartBurst, 1900);
      setTimeout(() => leaf.classList.add('out'), 3000);
      bdgMedal(o, '🥂', 3200, done);
    } },

  // ---- Two Candles: visiting on BOTH birthdays in the same year (one level per year) ----
  { id:'candles', name:'Two Candles', glyph:'🎂', tiered:true, celebrateOnVisit:true,
    hint:'some days are worth showing up for',
    level: () => bdgBothBirthdayYears().length,
    next: () => 'visit on both birthdays again next year',
    info: lv => lv > 1
      ? 'That is ' + lv + ' years you have turned up for both birthdays. I do not take a single one of them for granted.'
      : 'Your birthday and mine, both in the same year, and you came by for each one. Two candles, one very happy me.<br><br>Thank you for showing up for both.',
    // two candles get lit, one after the other
    play(done){
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
      bdgMedal(o, '🎂', 3200, done);
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

// Cartographer never goes down. Once every page is unlocked it levels up, and again each later time
// every page (including any added since) is unlocked.
function updateCartographer(){
  const c = bdgJSON(BK.carto, {});
  const covered = Array.isArray(c.covered) ? c.covered : [];
  const items = getNavCategories().flatMap(cat => cat.items);
  if(!items.length || !items.every(i => i.unlocked)) return;   // not everything open yet - keep what she has
  if(!items.some(i => !covered.includes(i.key))) return;       // nothing new since the last level
  const next = { level: (c.level || 0) + 1, covered: [...new Set([...covered, ...items.map(i => i.key)])] };
  try{ localStorage.setItem(BK.carto, JSON.stringify(next)); }catch(e){}
}

// ---- badge levels, titles, popups ----
const badgeLevel = bd => bd.level ? bd.level() : (bd.earned() ? 1 : 0);
const badgeTitle = (bd, lv) => (lv > 0 && bd.title) ? bd.title(lv) : bd.name;

// Plays the animation for any celebrateOnVisit badge that has reached a level she hasn't been shown yet.
// If several are waiting (e.g. the first visit after an update) they play one after another, each
// starting when she closes the previous popup. She can click any earned badge to replay it.
function celebrateNewBadges(delay){
  let seen = bdgJSON(BK.celebrated, {});
  if(Array.isArray(seen)) seen = Object.fromEntries(seen.map(id => [id, 1]));   // older format
  const queue = BADGES.filter(b => b.celebrateOnVisit && badgeLevel(b) > (seen[b.id] || 0));
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
  bd.play(() => showModal(badgeTitle(bd, lv), bd.info(lv), 'Bestie Tristan'), lv);
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
    if(bd.medal){ ro.classList.add('ro-medal'); ro.textContent = ''; ro.appendChild(bd.medal(lv)); }
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
