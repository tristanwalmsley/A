// ═══════════════════════════════════════════
// SHARED NAV STATE — ann_site
// ═══════════════════════════════════════════

const NAV_KEYS = {
  contract: 'ann_contract_signed_2025',
  gifts: 'ann_bday_2025_v5',
};

// Which stop IDs unlock which pages, matching the STOPS array in gifts.html
// (stops are opened sequentially; id = stop number, including the "page unlock" stops themselves)
const PAGE_UNLOCKS = {
  'timeline.html':  2,   // Our Story
  'tierlist.html':  7,   // Tier List
  'extras.html':    13,  // Us
  'reasons.html':   24,  // Reasons
  'passport.html':  29,  // Passport
  'postcards.html': 37,  // Postcards
  'letters.html':   40,  // Letters
  'quiz.html':      41,  // Quiz
  'final.html':     41,  // all done
};

const TOTAL_GIFTS = 41;

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
