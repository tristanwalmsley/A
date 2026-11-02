// Home page behaviour. Needs bestie_storage.js, nav.js, effects.js, ambient.js,
// keepsakes.js and secrets.js to be loaded first.

window.addEventListener('DOMContentLoaded', () => {
  buildNav('index.html');
  initLoadingScreen();
  buildFloatingStamps();
  initPostmark();
  initStampDrag();
  initNavLogoSecret();
  initResetButtons();
  initSecrets();
  initAmbientWash();
  initVisitStreak();
  initMonthlyLedger();
  initWeeklyCorkboard();
  initTourButton();

  document.querySelector('.letter-sig').addEventListener('dblclick', () => unlockEgg('signature'));

  // wandering secrets
  setTimeout(spawnDrifter, 10000);
  setInterval(spawnDrifter, 50000);
  setTimeout(spawnChaseHeart, 15000);

  console.log('%c✉ psst.', 'font-size:20px;color:#b86858;font-family:cursive;');
  console.log(`If you're reading this, you're exactly the kind of curious person this whole site was made for. There are ${EGG_KEYS.length} secrets hidden around this page - happy hunting.`);
});

function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  setTimeout(() => {
    screen.classList.add('hide');
    setTimeout(() => { screen.style.display = 'none'; launchConfetti(); }, 800);
  }, 2200);
}

function buildFloatingStamps() {
  const container = document.getElementById('stamps-bg');
  const symbols = ['♡', '✉', '★', '✦', '♡', '✉'];
  const labels = ['First Class', 'Air Mail', 'Friend', 'Special', 'Love', 'Bestie'];

  for (let i = 0; i < 16; i++) {
    const n = Math.floor(Math.random() * symbols.length);
    const startRot = (Math.random() - 0.5) * 30;
    const stamp = document.createElement('div');
    stamp.className = 'float-stamp';
    stamp.style.cssText = `
      left:${Math.random() * 100}%; --dur:${16 + Math.random() * 18}s; --delay:${Math.random() * 22}s;
      --drift:${(Math.random() - 0.5) * 100}px; --rot-start:${startRot}deg;
      --rot-end:${startRot + (Math.random() - 0.5) * 20}deg; --op:${0.07 + Math.random() * 0.12}`;
    stamp.innerHTML = `<div class="float-stamp-inner"><div class="float-stamp-symbol">${symbols[n]}</div><div class="float-stamp-label">${labels[n]}</div></div>`;
    container.appendChild(stamp);
  }
}

// ---------- Click-based secrets ----------
function initPostmark() {
  const postmark = document.getElementById('postmark');
  const counter = document.getElementById('postmark-count');
  let clicks = 0;

  postmark.addEventListener('click', () => {
    clicks++;
    counter.textContent = clicks;
    counter.classList.add('show');
    postmark.classList.add('clicked');
    setTimeout(() => postmark.classList.remove('clicked'), 500);

    if (clicks >= 5) {
      clicks = 0;
      counter.classList.remove('show');
      setTimeout(() => unlockEgg('postmark'), 200);
    }
  });
}

function initNavLogoSecret() {
  let clicks = 0;
  document.querySelector('.nav-brand').addEventListener('click', e => {
    e.preventDefault(); // the logo links to this same page anyway
    if (++clicks >= 7) { clicks = 0; unlockEgg('nav'); }
  });
}

// drag the stamp onto the postmark to "mail it"
function initStampDrag() {
  const stamp = document.querySelector('.stamp');
  const postmark = document.getElementById('postmark');
  let dragging = false, startX = 0, startY = 0;

  const centreDistance = () => {
    const a = postmark.getBoundingClientRect(), b = stamp.getBoundingClientRect();
    return Math.hypot((a.left + a.width / 2) - (b.left + b.width / 2), (a.top + a.height / 2) - (b.top + b.height / 2));
  };

  stamp.addEventListener('pointerdown', e => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    stamp.setPointerCapture(e.pointerId);
    stamp.classList.add('dragging');
  });

  stamp.addEventListener('pointermove', e => {
    if (!dragging) return;
    stamp.style.transform = `translate(${e.clientX - startX}px,${e.clientY - startY}px)`;
    postmark.classList.toggle('drag-hint', centreDistance() < 100);
  });

  stamp.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    stamp.classList.remove('dragging');
    postmark.classList.remove('drag-hint');

    const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
    const landed = centreDistance() < 100;

    stamp.style.transition = 'transform 0.5s cubic-bezier(0.34,1.6,0.64,1)';
    stamp.style.transform = 'translate(0,0)';
    setTimeout(() => { stamp.style.transition = ''; }, 520);

    if (moved > 20 && landed) unlockEgg('mail');
  });
}

// ---------- Wandering secrets ----------
function spawnDrifter() {
  const envelope = document.createElement('div');
  envelope.className = 'drifter';
  envelope.textContent = '✉';
  envelope.style.top = (10 + Math.random() * 65) + 'vh';
  envelope.addEventListener('click', () => { unlockEgg('idle'); envelope.remove(); });
  document.body.appendChild(envelope);
  setTimeout(() => envelope.remove(), 6000);
}

// a shy heart that runs from the cursor; herd it into the top-right corner to catch it
function spawnChaseHeart() {
  if (document.getElementById('chase-heart')) return;

  const heart = document.createElement('div');
  heart.id = 'chase-heart';
  heart.className = 'chase-heart';
  heart.textContent = '♡';
  document.body.appendChild(heart);

  let x = window.innerWidth * 0.5, y = window.innerHeight * 0.55;
  let vx = 0, vy = 0;
  const startedAt = Date.now();

  const flee = e => {
    const dx = x - e.clientX, dy = y - e.clientY;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < 150) {
      vx += (dx / dist) * 1.3;
      vy += (dy / dist) * 1.3;
    }
  };
  window.addEventListener('mousemove', flee);

  const stop = () => { window.removeEventListener('mousemove', flee); heart.remove(); };

  (function step() {
    if (Date.now() - startedAt > 90000) {   // give up after 90s, try again 45s later
      stop();
      setTimeout(spawnChaseHeart, 45000);
      return;
    }
    vx = Math.max(-3.5, Math.min(3.5, vx + (Math.random() - 0.5) * 0.5)) * 0.96;
    vy = Math.max(-3.5, Math.min(3.5, vy + (Math.random() - 0.5) * 0.5)) * 0.96;
    x = Math.max(24, Math.min(window.innerWidth - 24, x + vx));
    y = Math.max(24, Math.min(window.innerHeight - 24, y + vy));
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';

    if (x > window.innerWidth - 140 && y < 150) {
      stop();
      unlockEgg('chase');
      return;
    }
    requestAnimationFrame(step);
  })();
}

// ---------- Misc ----------
function initResetButtons() {
  document.getElementById('reset-all').addEventListener('click', () => {
    if (confirm('Reset ALL progress? This clears everything.')) { localStorage.clear(); location.reload(); }
  });
  document.getElementById('reset-secrets').addEventListener('click', () => {
    if (confirm('Reset just the hidden secrets progress? Your gifts/letters stay untouched.')) {
      localStorage.removeItem(EGGS_STORAGE_KEY);
      location.reload();
    }
  });
}

// the tour button only appears once every gift has been opened
function initTourButton() {
  const button = document.getElementById('btn-tour');
  try {
    if (getOpenedGifts().size >= TOTAL_GIFTS) button.classList.add('show');
  } catch (e) { /* bestie_storage.js not available */ }
  button.addEventListener('click', () => { location.href = 'gifts.html?autoplay=1'; });
}
