// ═══════════════════════════════════════════
// SHARED NAV STATE — ann_site
// ═══════════════════════════════════════════

const NAV_KEYS = {
  contract: 'ann_contract_signed_2025',
  gifts: 'ann_bday_2025_v3',
};

// Which gift IDs unlock which pages
// (gifts are opened sequentially; id = gift number)
const PAGE_UNLOCKS = {
  'letters.html':   2,   // letter gift
  'timeline.html':  6,   // mid-box
  'postcards.html': 10,  // after all postcards
  'passport.html':  17,  // plushie gift
  'final.html':     18,  // all done
  'quiz.html':      18,
  'tierlist.html':  16,  // after all biscuits
  'reasons.html':   18,
  'extras.html':    18,
};

const TOTAL_GIFTS = 18;

function getOpenedGifts() {
  try {
    const p = JSON.parse(localStorage.getItem(NAV_KEYS.gifts));
    return new Set(Array.isArray(p) ? p : []);
  } catch(e) { return new Set(); }
}

function isContractSigned() {
  return !!localStorage.getItem(NAV_KEYS.contract);
}

function isPageUnlocked(page) {
  if (page === 'index.html' || page === 'contract.html') return true;
  if (page === 'gifts.html') return isContractSigned();
  const threshold = PAGE_UNLOCKS[page];
  if (!threshold) return true; // unknown pages default open
  const opened = getOpenedGifts();
  return opened.has(threshold);
}

// All pages in the nav, in order
const ALL_PAGES = [
  { href: 'index.html',    label: 'Home' },
  { href: 'gifts.html',    label: 'Gifts' },
  { href: 'timeline.html', label: 'Our Story' },
  { href: 'letters.html',  label: 'Letters' },
  { href: 'postcards.html',label: 'Postcards' },
  { href: 'passport.html', label: 'Passport 🧸' },
  { href: 'tierlist.html', label: 'Tier List' },
  { href: 'extras.html',   label: 'Us ✦' },
  { href: 'quiz.html',     label: 'Quiz' },
  { href: 'reasons.html',  label: 'Reasons ♡' },
  { href: 'final.html',    label: 'The End' },
  { href: 'contract.html?view=1', label: 'Contract', matchHref: 'contract.html' },
];

function buildNav(currentPage) {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const linksDiv = nav.querySelector('.nav-links');
  if (!linksDiv) return;
  linksDiv.innerHTML = '';

  ALL_PAGES.forEach(page => {
    const matchHref = page.matchHref || page.href;
    const isCurrent = currentPage === matchHref || currentPage === page.href;
    const unlocked = isPageUnlocked(matchHref);

    const el = document.createElement(unlocked ? 'a' : 'span');
    el.className = 'nav-a' + (isCurrent ? ' current' : '') + (!unlocked ? ' locked' : '');
    el.textContent = page.label;

    if (unlocked) {
      el.href = page.href;
    } else {
      el.title = '✦ not yet unlocked';
    }

    linksDiv.appendChild(el);
  });
}
