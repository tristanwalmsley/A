const NAV_KEYS = {
  contract: 'ann_contract_signed_2025',
  gifts: 'ann_bday_2025_v6',
};

// Which stop IDs unlock which pages, matching the STOPS array in gifts.html
// (stops are opened sequentially; id = stop number, including the "page unlock" stops themselves)
const PAGE_UNLOCKS = {
  'our_journey.html':      2,   // Our Journey
  'tier_list.html':        6,   // Tier List
  'us.html':               13,  // Us
  'reasons.html':          21,  // Reasons
  'passport.html':         29,  // Passport
  'postcard_gallery.html': 37,  // Postcards
  'letters_archive.html':  40,  // Letters
  'quiz.html':             41,  // Quiz
  'the_end.html':          41,  // all done
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
  if (page === 'index.html') return true;
  if (page === 'contract.html') return isContractSigned();
  if (page === 'gifts.html') return isContractSigned();
  const threshold = PAGE_UNLOCKS[page];
  if (!threshold) return true; // unknown pages default open
  const opened = getOpenedGifts();
  return opened.has(threshold);
}

// All pages in the nav, in the order they unlock
const ALL_PAGES = [
  { href: 'index.html',           label: 'Home' },
  { href: 'gifts_ann_2026_birthday.html', label: 'Gifts' },
  { href: 'our_journey.html',     label: 'Our Journey' },
  { href: 'us.html',              label: 'Us' },
  { href: 'reasons.html',         label: 'Reasons ♡' },
  { href: 'passport.html',        label: 'Passport' },
  { href: 'postcard_gallery.html',label: 'Postcard Gallery' },
  { href: 'letters_archive.html', label: 'Letters Archive' },
  { href: 'tier_list.html',       label: 'Tier List' },
  { href: 'quiz.html',            label: 'Quiz' },
  { href: 'the_end.html',         label: 'The End' },
  { href: 'contract.html?view=1', label: 'Contract', matchHref: 'contract.html' },
];

function buildNav(currentPage) {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const linksDiv = nav.querySelector('.nav-links');
  if (!linksDiv) return;
  linksDiv.innerHTML = '';

  // Only unlocked pages get a slot in the nav at all - nothing locked is
  // rendered, so the bar simply grows (and re-flows) as more unlocks.
  ALL_PAGES.filter(page => isPageUnlocked(page.matchHref || page.href))
    .forEach(page => {
      const matchHref = page.matchHref || page.href;
      const isCurrent = currentPage === matchHref || currentPage === page.href;

      const el = document.createElement('a');
      el.className = 'nav-a' + (isCurrent ? ' current' : '');
      el.textContent = page.label;
      el.href = page.href;

      linksDiv.appendChild(el);
    });
}