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
let eggsFound = [];
try{ eggsFound = JSON.parse(localStorage.getItem('ann_eggs_found')) || []; }catch(e){ eggsFound = []; }

function unlockEgg(key){
  const wasComplete = eggsFound.length >= EGG_KEYS.length;
  if(!eggsFound.includes(key)){
    eggsFound.push(key);
    try{ localStorage.setItem('ann_eggs_found', JSON.stringify(eggsFound)); }catch(e){}
  }
  const justCompleted = !wasComplete && eggsFound.length >= EGG_KEYS.length;
  // finishing the set: once she closes this last secret, the badge plays
  if(justCompleted) afterClose = () => openBadge('secrets');
  playEggHatch(() => {
    showModal(EGGS[key].title, EGGS[key].text, EGGS[key].sig);
    launchHeartBurst();
  });
  renderBadges();
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

// ---------- BADGES ----------
// each badge: { id, name, glyph, hint, earned(), info, play(done) }
//   play(done) = that badge's own animation; call done() when it has finished
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
const BADGES = [
  { id:'secrets', name:'Secret Keeper', glyph:'★',
    hint:'find all the secrets hiding on this page',
    earned: () => eggsFound.length >= EGG_KEYS.length,
    info: () => 'This one is for finding every single secret hidden around this page - all ' + EGG_KEYS.length + ' of them. Poking, typing, chasing, dragging... you did it all.<br><br>Not many people would have the patience. You did.',
    // nine eggs spin in a ring, collapse into the middle, and the badge pops out
    play(done){
      const o = dimOverlay();
      const ring = document.createElement('div'); ring.className = 'sk-ring';
      for(let i=0;i<EGG_KEYS.length;i++){
        const s = document.createElement('span');
        s.textContent = '🥚';
        s.style.setProperty('--a', (i*360/EGG_KEYS.length) + 'deg');
        ring.appendChild(s);
      }
      const core = document.createElement('div'); core.className = 'sk-core'; core.textContent = '★';
      o.append(ring, core);
      setTimeout(() => ring.classList.add('collapse'), 1900);
      setTimeout(() => { core.classList.add('in'); launchConfetti(); launchHeartBurst(); }, 2300);
      setTimeout(launchHeartBurst, 3000);
      setTimeout(() => endOverlay(o, done), 4200);
    } }
];
function openBadge(id){
  const bd = BADGES.find(b => b.id === id);
  if(!bd) return;
  bd.play(() => showModal(bd.name, bd.info(), 'Bestie Tristan'));
}
function renderBadges(){
  const row = $('badge-row');
  if(!row) return;
  $('secrets-count').textContent = eggsFound.length + ' / ' + EGG_KEYS.length;
  row.innerHTML = '';
  BADGES.forEach(bd => {
    const got = bd.earned();
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'bdg' + (got ? ' earned' : '');
    el.title = got ? bd.name : bd.hint;
    el.innerHTML = '<span class="ro"></span><span class="bdg-name"></span>';
    el.querySelector('.ro').textContent = got ? bd.glyph : '?';
    el.querySelector('.bdg-name').textContent = bd.name;
    if(got) el.onclick = () => openBadge(bd.id);
    row.appendChild(el);
  });
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
  const today = new Date().toISOString().slice(0,10);
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
  'tier_list.html':'🏆', 'birthday_2026.html':'🎈', 'gifts_ann_2026_birthday.html':'🎁',
  'quiz.html':'❓', 'the_end.html':'💛', 'contract.html':'✎'
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
  { label:'Reset secrets', run(){ if(confirm('Reset just the hidden secrets progress? Your gifts/letters stay untouched.')){ localStorage.removeItem('ann_eggs_found'); location.reload(); } } },
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
  recordVisitStreak();
  initMonthlyLedger(); initWeeklyCorkboard(); renderBadges(); initSettings();
});
