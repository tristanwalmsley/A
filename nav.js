/* ==========================================================================
   Besties site nav
   --------------------------------------------------------------------------
   To add a page:      add one line to an `items` array in NAV below.
   To add a category:  add one { id, label, items: [...] } object to NAV.
   To change unlocks:  edit PAGE_UNLOCKS (stop number that unlocks the page).
   Nothing else in this file needs touching.
   ========================================================================== */

const NAV_KEYS = {
  contract: 'ann_contract_signed_2025',
  gifts: 'ann_bday_2025_v6',
};

const TOTAL_GIFTS = 41;

// Which gift-stop IDs unlock which pages (matches STOPS in gifts.html)
const PAGE_UNLOCKS = {
  'our_journey.html':      2,
  'tier_list.html':        6,
  'us.html':               13,
  'reasons.html':          21,
  'passport.html':         29,
  'postcard_gallery.html': 37,
  'letters_archive.html':  40,
  'quiz.html':             41,
  'the_end.html':          41,
};

// Pages that unlock once the contract is signed (rather than via a gift stop)
const CONTRACT_GATED = ['contract.html', 'gifts.html', 'gifts_ann_2026_birthday.html'];

/* --------------------------------------------------------------------------
   THE NAV. Order here = order on screen.
   item: { href, label, matchHref? }
     matchHref = the bare page name used for unlock checks / "current" state
                 (needed when href has a query string)
   -------------------------------------------------------------------------- */
const NAV = [
  {
    id: 'story',
    label: 'Our Story',
    items: [
      { href: 'our_journey.html', label: 'Our Journey' },
      { href: 'us.html',          label: 'Us' },
      { href: 'reasons.html',     label: 'Reasons ♡' },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    items: [
      { href: 'passport.html',         label: 'Passport' },
      { href: 'postcard_gallery.html', label: 'Postcard Gallery' },
      { href: 'letters_archive.html',  label: 'Letters Archive' },
    ],
  },
  {
    id: 'fun',
    label: 'Fun',
    items: [
      { href: 'tier_list.html', label: 'Tier Lists' },
    ],
  },
  {
    id: 'bday26',
    label: 'Birthday 2026',
    items: [
      { href: 'gifts_ann_2026_birthday.html', label: 'Gifts' },
      { href: 'quiz.html',                    label: 'Quiz' },
      { href: 'the_end.html',                 label: 'Thank You' },
    ],
  },
  {
    id: 'contract',
    label: 'Contract',
    items: [
      { href: 'contract.html?view=1', label: '2026-27 Contract', matchHref: 'contract.html' },
    ],
  },
];

// If a category only has ONE unlocked page, show it as a plain link
// instead of a dropdown with a single entry. Set false to always show dropdowns.
const COLLAPSE_SINGLE_ITEM_CATEGORIES = true;

/* ------------------------------ state / unlocks ------------------------------ */

function getOpenedGifts() {
  try {
    const p = JSON.parse(localStorage.getItem(NAV_KEYS.gifts));
    return new Set(Array.isArray(p) ? p : []);
  } catch (e) { return new Set(); }
}

function isContractSigned() {
  try { return !!localStorage.getItem(NAV_KEYS.contract); }
  catch (e) { return false; }
}

function isPageUnlocked(page) {
  if (page === 'index.html') return true;
  if (CONTRACT_GATED.includes(page)) return isContractSigned();
  const threshold = PAGE_UNLOCKS[page];
  if (!threshold) return true; // unknown pages default open
  return getOpenedGifts().has(threshold);
}

/* ---------------------------------- styles ---------------------------------- */
/* Injected once so you don't have to edit your CSS files. Override any of the
   --nav-* variables in your site CSS to match your theme. Existing .nav-a /
   .nav-links / .current rules still apply to the links. */

function injectNavStyles() {
  if (document.getElementById('nav-styles')) return;
  const css = `
    #site-nav .nav-links { display:flex; flex-wrap:wrap; align-items:center; gap:.25rem .5rem; }
    #site-nav .nav-group { position:relative; }
    #site-nav .nav-group-btn {
      font:inherit; color:inherit; background:none; border:0; cursor:pointer;
      display:inline-flex; align-items:center; gap:.35em;
    }
    #site-nav .nav-group-btn::after {
      content:''; width:.4em; height:.4em; margin-top:-.2em;
      border-right:2px solid currentColor; border-bottom:2px solid currentColor;
      transform:rotate(45deg); transition:transform .15s ease;
    }
    #site-nav .nav-group.open .nav-group-btn::after { transform:rotate(225deg); margin-top:.15em; }
    #site-nav .nav-menu {
      display:none; position:absolute; top:calc(100% + .35rem); left:0; z-index:50;
      min-width:12rem; padding:.35rem; flex-direction:column; gap:.1rem;
      background:var(--nav-menu-bg, #fff); color:var(--nav-menu-fg, inherit);
      border:1px solid var(--nav-menu-border, rgba(0,0,0,.15)); border-radius:10px;
      box-shadow:0 8px 24px rgba(0,0,0,.15);
    }
    #site-nav .nav-group.open .nav-menu { display:flex; }
    #site-nav .nav-menu .nav-a { display:block; padding:.5rem .75rem; border-radius:6px; white-space:nowrap; }
    #site-nav .nav-menu .nav-a:hover,
    #site-nav .nav-menu .nav-a:focus-visible { background:var(--nav-menu-hover, rgba(0,0,0,.07)); }
    #site-nav .nav-group-btn:focus-visible,
    #site-nav .nav-a:focus-visible { outline:2px solid currentColor; outline-offset:2px; }

    @media (max-width:700px) {
      #site-nav .nav-links { flex-direction:column; align-items:stretch; }
      #site-nav .nav-group-btn { width:100%; justify-content:space-between; }
      #site-nav .nav-menu {
        position:static; box-shadow:none; border:0; background:transparent;
        padding:0 0 0 1rem; min-width:0;
      }
    }
    @media (prefers-reduced-motion:reduce) {
      #site-nav .nav-group-btn::after { transition:none; }
    }`;
  const style = document.createElement('style');
  style.id = 'nav-styles';
  style.textContent = css;
  document.head.appendChild(style);
}

/* ---------------------------------- build ---------------------------------- */

function closeAllNavGroups(except) {
  document.querySelectorAll('#site-nav .nav-group.open').forEach(g => {
    if (g === except) return;
    g.classList.remove('open');
    g.querySelector('.nav-group-btn').setAttribute('aria-expanded', 'false');
  });
}

function makeNavLink(item, currentPage) {
  const matchHref = item.matchHref || item.href;
  const el = document.createElement('a');
  const isCurrent = currentPage === matchHref || currentPage === item.href;
  el.className = 'nav-a' + (isCurrent ? ' current' : '');
  if (isCurrent) el.setAttribute('aria-current', 'page');
  el.textContent = item.label;
  el.href = item.href;
  return el;
}

function buildNav(currentPage) {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const linksDiv = nav.querySelector('.nav-links');
  if (!linksDiv) return;

  injectNavStyles();
  linksDiv.innerHTML = '';

  NAV.forEach(cat => {
    // Locked pages are never rendered; empty categories disappear entirely.
    const items = cat.items.filter(i => isPageUnlocked(i.matchHref || i.href));
    if (!items.length) return;

    // One unlocked page -> plain link, no dropdown
    if (items.length === 1 && COLLAPSE_SINGLE_ITEM_CATEGORIES) {
      linksDiv.appendChild(makeNavLink(items[0], currentPage));
      return;
    }

    const hasCurrent = items.some(i =>
      currentPage === (i.matchHref || i.href) || currentPage === i.href);

    const group = document.createElement('div');
    group.className = 'nav-group';
    group.dataset.cat = cat.id;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-a nav-group-btn' + (hasCurrent ? ' current' : '');
    btn.textContent = cat.label;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');

    const menu = document.createElement('div');
    menu.className = 'nav-menu';
    items.forEach(i => menu.appendChild(makeNavLink(i, currentPage)));

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = !group.classList.contains('open');
      closeAllNavGroups(group);
      group.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });

    group.append(btn, menu);
    linksDiv.appendChild(group);
  });

  // Global close handlers (bound once)
  if (!nav.dataset.bound) {
    nav.dataset.bound = '1';
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) closeAllNavGroups();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAllNavGroups();
    });
  }
}
