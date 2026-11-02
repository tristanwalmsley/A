// The hidden-secrets system: the messages, progress tracking, badges and the
// keyboard-triggered secrets. Secrets triggered by clicking or dragging things
// on the page are wired up in home.js and just call unlockEgg().

const EGGS = {
  postmark: {
    title: 'You found the secret ♡',
    text: "You clicked the postmark five times. Of course you did. I made a whole website for you and you found the easter egg immediately. I'm proud and entirely unsurprised.<br><br>Here's the hidden message: I think you're really, really brilliant, and I'm so glad you're my best friend. That's it. It's just more feelings.<br><br>You're welcome.",
    sig: 'Bestie Tristan xo',
  },
  nav: {
    title: 'Snooping at the letterhead?',
    text: "Seven clicks on my little logo. I see you testing every corner of this thing for cracks in the wallpaper.<br><br>Since you're here: thank you for being exactly the kind of person who pokes at things until they reveal themselves. It's one of my favourite things about you.",
    sig: 'Bestie Tristan',
  },
  konami: {
    title: 'The secret code',
    text: "Up, up, down, down... you actually typed the code. I didn't think anyone would try it, honestly - I just couldn't resist hiding it in here.<br><br>Consider this your cheat: infinite hugs, unlimited lives, and a permanent +10 to how loved you are.",
    sig: 'Bestie Tristan',
  },
  name: {
    title: 'Someone said your name',
    text: 'You typed your own name into a birthday website. I love that for you.<br><br>Somewhere out there a tiny bell just rang because Bestie Ann exists, and the world is a slightly better place for it.',
    sig: 'Bestie Tristan',
  },
  signature: {
    title: 'Double-checking my signature?',
    text: "You double-clicked my name at the bottom of the letter. Making sure it's really me, I bet.<br><br>It's really me. It'll always be me. Happy birthday, you brilliant, nosy, wonderful person.",
    sig: 'Bestie Tristan',
  },
  tristan: {
    title: 'Oh - hi, it\'s me',
    text: "You typed my name into my own website about you. Bold move. I respect it.<br><br>For the record: I built every last bit of this - the stamps, the postmark, all these silly hidden things - because you're worth the extra hours. Happy birthday, Bestie Ann.",
    sig: 'Bestie Tristan',
  },
  idle: {
    title: 'Special delivery, mid-air',
    text: "You caught the little envelope before it drifted off screen. I like to imagine it's been circling this page since you opened it, just waiting for someone quick enough.<br><br>That's very on brand for you, by the way - quick, and a little bit magic.",
    sig: 'Bestie Tristan',
  },
  mail: {
    title: 'Special delivery',
    text: 'You peeled the stamp off and stuck it right onto the postmark, like you were sending this whole thing back to me. Message received, by the way.<br><br>Whatever you were trying to say - I already know, and I feel the same.',
    sig: 'Bestie Tristan',
  },
  chase: {
    title: 'You caught it',
    text: "That little heart didn't want to be caught - it's shy, same as I can be sometimes. But you cornered it anyway, patiently, until it had nowhere left to go but toward you.<br><br>That's a pretty good description of our friendship, honestly.",
    sig: 'Bestie Tristan',
  },
};

const EGGS_STORAGE_KEY = 'ann_eggs_found';
const EGG_KEYS = Object.keys(EGGS);
let eggsFound = [];
try { eggsFound = JSON.parse(localStorage.getItem(EGGS_STORAGE_KEY)) || []; } catch (e) { /* start fresh */ }

const allEggsFound = () => eggsFound.length >= EGG_KEYS.length;

function unlockEgg(key) {
  const wasComplete = allEggsFound();
  if (!eggsFound.includes(key)) {
    eggsFound.push(key);
    localStorage.setItem(EGGS_STORAGE_KEY, JSON.stringify(eggsFound));
  }
  playEggHatch(() => {
    document.getElementById('egg-title').textContent = EGGS[key].title;
    document.getElementById('egg-text').innerHTML = EGGS[key].text;
    document.getElementById('egg-sig').textContent = EGGS[key].sig;
    document.getElementById('egg-modal').classList.add('show');
    launchHeartBurst();
  });
  updateSecretsBadge(allEggsFound() && !wasComplete);
}

function closeEgg() {
  document.getElementById('egg-modal').classList.remove('show');
}

// short egg-cracking animation before the message appears
function playEggHatch(onDone) {
  const egg = document.createElement('div');
  egg.className = 'egg-hatch';
  egg.textContent = '🥚';
  document.body.appendChild(egg);

  setTimeout(() => {
    egg.classList.add('crack');
    const sparkle = document.createElement('div');
    sparkle.className = 'egg-sparkle';
    sparkle.textContent = '✨';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 500);
  }, 600);

  setTimeout(() => { egg.remove(); onDone(); }, 950);
}

// ---------- Badges ----------
// Keeps the badges just below the sticky nav, whatever height it wraps to.
function positionBadges() {
  const navBottom = document.getElementById('site-nav').getBoundingClientRect().bottom;
  const secrets = document.getElementById('secrets-badge');
  secrets.style.top = (navBottom + 10) + 'px';
  document.getElementById('wax-seal').style.top = (navBottom + 10) + 'px';
  document.getElementById('completion-badge').style.top = (secrets.getBoundingClientRect().bottom + 8) + 'px';
}

function updateSecretsBadge(justCompleted) {
  document.getElementById('secrets-badge').textContent = `✦ ${eggsFound.length}/${EGG_KEYS.length} secrets found`;
  const completion = document.getElementById('completion-badge');

  if (allEggsFound()) {
    completion.classList.add('show');
    if (justCompleted) {
      completion.classList.add('celebrate');
      launchAllFoundCelebration();
      setTimeout(() => completion.classList.remove('celebrate'), 1500);
    }
  }
  positionBadges();
}

function launchAllFoundCelebration() {
  launchConfetti();
  [200, 900, 1700, 2600].forEach(delay => setTimeout(launchHeartBurst, delay));

  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  const stamp = document.createElement('div');
  stamp.className = 'grand-stamp';
  stamp.innerHTML = 'All secrets found ♡<small>every corner of this, explored</small>';
  overlay.appendChild(stamp);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('dim');
    stamp.classList.add('in');
  });
  setTimeout(() => {
    overlay.classList.remove('dim');
    stamp.classList.remove('in');
    setTimeout(() => overlay.remove(), 700);
  }, 4200);
}

// ---------- Keyboard secrets ----------
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPos = 0;
let typedBuffer = '';

window.addEventListener('keydown', e => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : (key === KONAMI[0] ? 1 : 0);
  if (konamiPos === KONAMI.length) {
    konamiPos = 0;
    unlockEgg('konami');
  }

  if (e.key.length === 1) {
    typedBuffer = (typedBuffer + key).slice(-10);
    if (typedBuffer.endsWith('tristan')) { typedBuffer = ''; unlockEgg('tristan'); }
    else if (typedBuffer.endsWith('ann')) { typedBuffer = ''; unlockEgg('name'); }
  }
});

function initSecrets() {
  document.getElementById('completion-badge').addEventListener('click', () => {
    if (allEggsFound()) launchAllFoundCelebration();
  });
  document.querySelector('.egg-backdrop').addEventListener('click', closeEgg);
  document.querySelector('.egg-close').addEventListener('click', closeEgg);

  window.addEventListener('resize', positionBadges);
  if ('ResizeObserver' in window) new ResizeObserver(positionBadges).observe(document.getElementById('site-nav'));
  updateSecretsBadge(false);
}
