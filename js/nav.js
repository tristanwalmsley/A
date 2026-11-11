/* ==========================================================================
   Besties site nav
   --------------------------------------------------------------------------
   To add a page:      add one line to an `items` array in NAV below.
   To add a category:  add one { id, label, items: [...] } object to NAV.
   To change unlocks:  edit PAGE_UNLOCKS (stop number that unlocks the page).
   Nothing else in this file needs touching.
   ========================================================================== */

const NAV_KEYS = {
  gifts: 'ann_bday_2025_v6',
  shared: 'besties_shared_v1',   // contract + membership record, filled in by bestie_storage.js
};

const TOTAL_GIFTS = 41;

// Which gift-stop IDs unlock which pages (matches STOPS in gifts_ann_2026_birthday.html)
const PAGE_UNLOCKS = {
  'birthday_2026_gifts.html':     0,
  'our_journey.html':             2,
  'tier_list.html':               6,
  'us.html':                      13,
  'reasons.html':                 21,
  'passport.html':                29,
  'postcard_gallery.html':        37,
  'letters_archive.html':         40,
  'birthday_2026_quiz.html':      41,
  'birthday_2026_thank_you.html': 41,
};

// ORDER OF THINGS: membership page (always open) -> contract (once a membership is chosen)
// -> everything below (once YOUR half of the contract is signed).
const CONTRACT_GATED = ['countdown.html', 'birthday_2026.html', 'birthday_2026_gifts.html'];

/* --------------------------------------------------------------------------
   THE NAV. Order here = order on screen.
   category: { id, label, glyph?, blurb?, soloLabel?, items }  (glyph/blurb feed the home page doors)
   item: { href, label, matchHref? }
     matchHref = the bare page name used for unlock checks / "current" state
                 (needed when href has a query string)
   -------------------------------------------------------------------------- */
const NAV = [
  {
    id: 'story',
    label: 'Our Story',
    glyph: '♡',
    blurb: 'our journey of how we got here',
    items: [
      { href: 'our_journey.html', label: 'Our Journey' },
      { href: 'us.html',          label: 'Us' },
      { href: 'reasons.html',     label: 'Reasons ♡' },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    glyph: '✉',
    blurb: 'our creative outlets',
    items: [
      { href: 'passport.html',         label: 'Passport' },
      { href: 'postcard_gallery.html', label: 'Postcard Gallery' },
      { href: 'letters_archive.html',  label: 'Letters Archive' },
      { href: 'videos.html',           label: 'Videos' },
    ],
  },
  {
    id: 'fun',
    label: 'Fun',
    glyph: '★',
    blurb: 'lots of silliness',
    items: [
      { href: 'tier_list.html', label: 'Tier Lists' },
      { href: 'bestle.html', label: 'Bestle' },
    ],
  },
  {
    id: 'contract',
    label: 'Contracts',
    glyph: '✎',
    blurb: 'the yearly agreements',
    items: [
      { href: 'membership.html', label: '2026-27 Membership' },
      { href: 'contract.html',   label: '2026-27 Contract' },
    ],
  },
  {
    id: 'xmas26',
    label: 'Christmas 2026',
    glyph: ':christmas_tree:',
    blurb: 'the winter drop',
    items: [
      { href: 'christmas_2026.html', label: 'Christmas 2026' },
      { href: 'christmas_2026_gifts.html', label: 'Gifts' },
    ],
  },
  {
    id: 'bday26',
    label: 'Birthday 2026',
    soloLabel: 'Birthday 2026',   // label used when only "Start here" is unlocked
    glyph: '✦',
    blurb: 'the whole birthday experience',
    items: [
      { href: 'birthday_2026_showcase.html',  label: 'The Showcase' },
      { href: 'birthday_2026.html',           label: 'Birthday 2026' },
      { href: 'birthday_2026_gifts.html',     label: 'Gifts' },
      { href: 'birthday_2026_quiz.html',      label: 'Quiz' },
      { href: 'birthday_2026_thank_you.html', label: 'Thank You' },
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

function getShared() {
  try { return JSON.parse(localStorage.getItem(NAV_KEYS.shared)) || {}; } catch (e) { return {}; }
}
function currentUser() {
  try { return localStorage.getItem('bestie_current_user'); } catch (e) { return null; }
}
function hasMembership() {
  const s = getShared(), u = currentUser();
  return !!(u && s.membership && s.membership[u]);
}
function isContractSigned() {   // YOUR half of the contract
  const s = getShared(), u = currentUser();
  return !!(u && s.contract && s.contract[u]);
}

function isPageUnlocked(page) {
  if (page === 'index.html' || page === 'membership.html') return true;
  if (page === 'contract.html') return hasMembership();
  // contract-gated pages also open if she has already reached the final gift
  // (anyone who got to Thank You must have done the contract + gifts)
  if (CONTRACT_GATED.includes(page)) return isContractSigned() || getOpenedGifts().has(PAGE_UNLOCKS['the_end.html']);
  const threshold = PAGE_UNLOCKS[page];
  if (!threshold) return true; // unknown pages default open
  return getOpenedGifts().has(threshold);
}

/* ------------------------- helpers used by the home page ------------------------- */

const NAV_SEEN_KEY = 'besties_nav_seen_v1';   // pages she has seen (so we can flag new ones)
const NAV_LAST_KEY = 'besties_last_page_v1';  // last nav page visited ("pick up where you left off")

// every category with each item flagged unlocked/locked (locked items are only
// ever shown as "sealed" on the home page - their names are never exposed)
function getNavCategories() {
  return NAV.map(cat => ({
    id: cat.id,
    label: cat.label,
    glyph: cat.glyph || '♡',
    blurb: cat.blurb || '',
    items: cat.items.map(i => {
      const key = i.matchHref || i.href;
      return { href: i.href, label: i.label, key, unlocked: isPageUnlocked(key) };
    }),
  }));
}

function getSeenPages() {
  try {
    const p = JSON.parse(localStorage.getItem(NAV_SEEN_KEY));
    return Array.isArray(p) ? new Set(p) : null;   // null = never recorded
  } catch (e) { return null; }
}
function saveSeenPages(set) {
  try { localStorage.setItem(NAV_SEEN_KEY, JSON.stringify([...set])); } catch (e) {}
}
// call from the home page AFTER it has rendered its "new" flags
function markAllUnlockedPagesSeen() {
  const keys = getNavCategories().flatMap(c => c.items).filter(i => i.unlocked).map(i => i.key);
  saveSeenPages(new Set(keys));
}
function getLastPage() {
  try { return JSON.parse(localStorage.getItem(NAV_LAST_KEY)); } catch (e) { return null; }
}

/* ---------------------------------- styles ---------------------------------- */
/* Injected once so you don't have to edit your CSS files. The nav now reads the shared
   tokens in css/tokens.css, so themes restyle it automatically. Existing .nav-a /
   .nav-links / .current rules still apply to the links. */

function injectNavStyles() {
  if (document.getElementById('nav-styles')) return;
  if (!document.getElementById('nav-font')) {   // the nav font, in case a page doesn't load it
    const l = document.createElement('link');
    l.id = 'nav-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap';
    document.head.appendChild(l);
  }
  /* Every rule starts with #site-nav, so leftover nav CSS inside a page can't change the look.
     To retune a theme, edit the --nv-* values in the first two rules. */
  const css = `
    #site-nav{--nv-bg:var(--paper);--nv-line:var(--tan);--nv-brand:var(--rose);--nv-link:var(--brown);--nv-link-hover:var(--deep);--nv-hover-bg:var(--warm);--nv-current:var(--deep);--nv-accent:var(--gold);--nv-menu-bg:var(--paper);--nv-menu-fg:var(--brown);--nv-menu-line:var(--tan);--nv-menu-hover:var(--warm)}
    #site-nav[data-nav-theme="dark"]{--nv-bg:var(--nav-dark-bg);--nv-line:rgba(255,255,255,.08);--nv-brand:var(--rose);--nv-link:color-mix(in srgb,var(--cream) 82%,transparent);--nv-link-hover:var(--cream);--nv-hover-bg:rgba(255,255,255,.07);--nv-current:var(--gold);--nv-accent:var(--gold);--nv-menu-bg:var(--nav-dark-menu-bg);--nv-menu-fg:var(--warm);--nv-menu-line:rgba(255,255,255,.18);--nv-menu-hover:rgba(255,255,255,.09)}

    #site-nav{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding:.8rem 2rem;position:sticky;top:0;z-index:600;background:var(--nv-bg);border-bottom:1px solid var(--nv-line);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
    #site-nav .nav-brand{font-family:'Caveat',cursive;font-size:1.3rem;font-weight:700;color:var(--nv-brand);text-decoration:none}
    #site-nav .nav-links{display:flex;flex-wrap:wrap;align-items:center;gap:.25rem .5rem}
    #site-nav .nav-a{display:inline-flex;align-items:center;gap:.35em;font-family:'Caveat',cursive;font-size:.9rem;line-height:1.4;letter-spacing:.5px;white-space:nowrap;color:var(--nv-link);text-decoration:none;padding:.25rem .6rem;border-radius:2px;background:none;border:0;border-bottom:2px solid transparent;cursor:pointer;transition:color .2s,background .2s}
    #site-nav .nav-a:hover{color:var(--nv-link-hover);background:var(--nv-hover-bg)}
    #site-nav .nav-a.current{color:var(--nv-current);font-weight:700;border-bottom-color:var(--nv-accent)}
    #site-nav .nav-a:focus-visible{outline:2px solid currentColor;outline-offset:2px}

    #site-nav .nav-group{position:relative}
    #site-nav .nav-group-btn::after{content:'';width:.4em;height:.4em;margin-top:-.2em;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);transition:transform .15s ease}
    #site-nav .nav-group.open .nav-group-btn::after{transform:rotate(225deg);margin-top:.15em}
    #site-nav .nav-menu{display:none;position:absolute;top:calc(100% + .35rem);left:0;z-index:50;min-width:12rem;padding:.35rem;flex-direction:column;gap:.1rem;background:var(--nv-menu-bg);color:var(--nv-menu-fg);border:1px solid var(--nv-menu-line);border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.25)}
    #site-nav .nav-menu.align-right{left:auto;right:0}
    #site-nav .nav-group.open .nav-menu{display:flex}
    #site-nav .nav-menu .nav-a{display:block;padding:.5rem .75rem;color:var(--nv-menu-fg);border-bottom:0}
    #site-nav .nav-menu .nav-a:hover,#site-nav .nav-menu .nav-a:focus-visible{background:var(--nv-menu-hover);color:var(--nv-menu-fg)}
    #site-nav .nav-menu .nav-a.current{box-shadow:inset 3px 0 0 var(--nv-accent);color:var(--nv-menu-fg)}

    @media (max-width:700px){
      #site-nav .nav-links{flex-direction:column;align-items:stretch;width:100%}
      #site-nav .nav-group-btn{width:100%;justify-content:space-between}
      #site-nav .nav-menu,#site-nav .nav-menu.align-right{position:static;box-shadow:none;border:0;background:transparent;padding:0 0 0 1rem;min-width:0}
    }
    @media (prefers-reduced-motion:reduce){#site-nav .nav-group-btn::after{transition:none}}`;
  const style = document.createElement('style');
  style.id = 'nav-styles';
  style.textContent = css;
  document.head.appendChild(style);
}

/* Which theme? Set data-theme="dark" or "light" on <nav id="site-nav"> (recommended).
   If it's missing, guess from the page's background colour; gradient backgrounds count as light. */
function detectNavTheme() {
  const rgb = el => {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    return m && (m.length < 4 || +m[3] > 0.5) ? m.slice(0, 3).map(Number) : null;
  };
  const c = rgb(document.body) || rgb(document.documentElement);
  return c && (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) < 110 ? 'dark' : 'light';
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

/* remember the last nav page visited, and mark it as seen */
function recordVisit(currentPage) {
  const hit = NAV.flatMap(c => c.items.map(i => ({ cat: c, item: i })))
    .find(x => currentPage === (x.item.matchHref || x.item.href) || currentPage === x.item.href);
  if (!hit) return;
  try {
    localStorage.setItem(NAV_LAST_KEY, JSON.stringify({
      href: hit.item.href, label: hit.item.label, cat: hit.cat.label,
    }));
    const seen = getSeenPages();
    if (seen) { seen.add(hit.item.matchHref || hit.item.href); saveSeenPages(seen); }
  } catch (e) {}
}

function buildNav(currentPage) {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const linksDiv = nav.querySelector('.nav-links');
  if (!linksDiv) return;

  injectNavStyles();
  nav.setAttribute('data-nav-theme', nav.dataset.theme === 'dark' || nav.dataset.theme === 'light' ? nav.dataset.theme : detectNavTheme());
  linksDiv.innerHTML = '';
  recordVisit(currentPage);

  NAV.forEach(cat => {
    // Locked pages are never rendered; empty categories disappear entirely.
    const items = cat.items.filter(i => isPageUnlocked(i.matchHref || i.href));
    if (!items.length) return;

    // One unlocked page -> plain link, no dropdown
    if (items.length === 1 && COLLAPSE_SINGLE_ITEM_CATEGORIES) {
      linksDiv.appendChild(makeNavLink(
        { ...items[0], label: cat.soloLabel || items[0].label }, currentPage));
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
      if (open) {   // keep the menu on-screen near the right edge
        menu.classList.remove('align-right');
        if (menu.getBoundingClientRect().right > window.innerWidth - 8) menu.classList.add('align-right');
      }
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
