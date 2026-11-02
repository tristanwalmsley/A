// Things that grow the more often she visits: the visit streak (wax seal),
// the monthly postmark ledger and the weekly sticker corkboard.
// All state lives in localStorage, so it is per-browser.

const STREAK_KEY = 'ann_visit_streak_v1';   // { lastDate, streak, longest }
const LEDGER_KEY = 'ann_monthly_ledger_v1'; // ['YYYY-MM', ...]
const CORK_KEY = 'ann_weekly_corkboard_v1'; // [{ week, glyph, x, y, rot }, ...]

const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const CORK_STICKERS = ['♡', '✉', '★', '✦', '🌿', '🍯', '🎀', '🕊️', '🧸', '🍁', '☕', '🎈', '🍪', '🌙', '🦋', '✨'];

function readStored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (e) { return fallback; }
}

// ---------- Visit streak ----------
function dateString(d) { return d.toISOString().slice(0, 10); }

function initVisitStreak() {
  const today = dateString(new Date());
  let data = readStored(STREAK_KEY, null);
  let bumped = false;

  if (!data) {
    data = { lastDate: today, streak: 1, longest: 1 };
    bumped = true;
  } else if (data.lastDate !== today) {
    const daysApart = Math.round((new Date(today + 'T00:00:00') - new Date(data.lastDate + 'T00:00:00')) / 86400000);
    data.streak = daysApart === 1 ? data.streak + 1 : 1;
    data.longest = Math.max(data.longest || 1, data.streak);
    data.lastDate = today;
    bumped = true;
  }
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  renderVisitStreak(data, bumped);
}

function renderVisitStreak(data, bumped) {
  const icon = document.getElementById('wax-seal-icon');
  const text = document.getElementById('wax-seal-text');
  const seal = document.getElementById('wax-seal');

  icon.classList.toggle('milestone-30', data.streak >= 30);
  icon.classList.toggle('milestone-7', data.streak >= 7 && data.streak < 30);
  text.innerHTML = `<b>${data.streak}</b> day${data.streak === 1 ? '' : 's'} running`;

  if (bumped) {
    seal.classList.remove('bump');
    void seal.offsetWidth; // restart the animation
    seal.classList.add('bump');
  }
}

// ---------- Monthly ledger ----------
function initMonthlyLedger() {
  const months = readStored(LEDGER_KEY, []);
  const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const isNew = !months.includes(thisMonth);
  if (isNew) months.push(thisMonth);
  localStorage.setItem(LEDGER_KEY, JSON.stringify(months));
  renderLedger(months, isNew ? thisMonth : null);
}

function renderLedger(months, newest) {
  const row = document.getElementById('ledger-row');
  document.getElementById('ledger-empty')?.remove();

  months.forEach(key => {
    const [year, month] = key.split('-');
    const stamp = document.createElement('div');
    stamp.className = 'ledger-stamp';
    stamp.style.setProperty('--lr', ((Math.random() - 0.5) * 22) + 'deg');
    stamp.innerHTML = `<span class="ledger-month">${MONTH_ABBR[parseInt(month, 10) - 1]}</span><span class="ledger-year">'${year.slice(2)}</span>`;
    row.appendChild(stamp);
    requestAnimationFrame(() => stamp.classList.add('in'));
    if (key === newest) flashNewest(stamp, 900);
  });
}

// ---------- Weekly corkboard ----------
function isoWeekKey(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7) + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function initWeeklyCorkboard() {
  const stickers = readStored(CORK_KEY, []);
  const thisWeek = isoWeekKey(new Date());
  let newest = null;

  if (!stickers.some(s => s.week === thisWeek)) {
    const used = new Set(stickers.map(s => s.glyph));
    const unused = CORK_STICKERS.filter(g => !used.has(g));
    const pool = unused.length ? unused : CORK_STICKERS; // start repeating once all are used
    newest = {
      week: thisWeek,
      glyph: pool[Math.floor(Math.random() * pool.length)],
      x: 12 + Math.random() * 76,
      y: 18 + Math.random() * 64,
      rot: (Math.random() - 0.5) * 50,
    };
    stickers.push(newest);
  }
  localStorage.setItem(CORK_KEY, JSON.stringify(stickers));
  renderCorkboard(stickers, newest?.week);
}

function renderCorkboard(stickers, newestWeek) {
  const board = document.getElementById('corkboard');
  document.getElementById('corkboard-empty')?.remove();

  stickers.forEach(s => {
    const el = document.createElement('div');
    el.className = 'cork-sticker';
    el.textContent = s.glyph;
    el.style.left = s.x + '%';
    el.style.top = s.y + '%';
    el.style.setProperty('--sr', s.rot + 'deg');
    board.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    if (s.week === newestWeek) flashNewest(el, 950);
  });
}

// plays the "just added" pop shortly after the page settles
function flashNewest(el, duration) {
  setTimeout(() => {
    el.classList.add('newest');
    setTimeout(() => el.classList.remove('newest'), duration);
  }, 300);
}
