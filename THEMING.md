# Themes - how it works

**Files**
- `css/tokens.css` - every colour/font, defined once. Never type a raw palette colour elsewhere; use `var(--gold)` or `color-mix(in srgb,var(--gold) 30%,transparent)`.
- `css/base.css` - reset, page background, paper grain (+ opt-in `.page-header--std`).
- `css/themes.css` - one `html[data-theme="name"]{...}` block per theme; it only overrides tokens.
- `js/theme.js` - the date registry (`THEMES`), preview switches, snow/ribbon decorations.
- `css/components.css` - old unlinked experiment, kept for reference only. Do not link it (class clashes).

**Current schedule** (repeats every year, visitor's local date): Winter 6-30 Nov, Sinterklaas 1-5 Dec, Christmas 6-31 Dec, otherwise normal.

**Preview** (sticks for the browser tab; click the badge or use `?theme=auto` to clear)
- `?theme=winter`, `?theme=sinterklaas`, `?theme=christmas`, `?theme=off`
- `?themedate=12-03` pretends it is that date

**What a theme can switch on** (options in `THEMES` in `js/theme.js`; the look is in `css/themes.css`)
- `flakes` falling glyphs, `drift` snow along the bottom, `frost` icy corners, `caps` snow caps on cards, `burst` sparkles on click/tap
- `home` swaps the greeting line, postmark text and corner stamp on the home page
- The trim hanging under the nav (icicles / lights / bunting) is set per theme in `css/themes.css`
- Gold-family tokens (`--gold-light`, `--gold-dark`) and `--mat` (the door-sheet panel) exist so a theme can recolour things that used to be hardcoded

**Add a theme (e.g. Halloween)**
1. `css/themes.css`: copy a block, rename `data-theme`, change the colours, `--brand-glyph`, `--ribbon`.
2. `js/theme.js`: add `{ id:'halloween', label:'Halloween', start:'10-24', end:'10-31', flakes:{glyphs:['🦇','•'],count:14,size:[12,22]} }` to `THEMES`.
3. Every page that loads `theme.js` picks it up. New pages need these in `<head>`:
   `tokens.css`, `base.css`, `themes.css`, then `<script src="js/theme.js">`.

**Known limits**
- Colours written inside JS (confetti, canvas, some inline HTML strings) are not tokenised yet. Use `SiteTheme.color('--gold')` when touching those.
- `sync_check.html` is a standalone utility page and is not themed.
