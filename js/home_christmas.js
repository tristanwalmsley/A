/* home_christmas.js - Christmas 2026 home extras: countdown, 25-door advent strip, bauble tree, coming-soon stamps.
   Only runs while the christmas theme is on. Preview: ?theme=christmas&themedate=12-10
   EDIT HERE: ADVENT (door messages), TEASERS (pages in the drop), BAUBLE_NOTES. */
(function(){
  if(!window.SiteTheme || SiteTheme.active !== 'christmas') return;
  const $x = id => document.getElementById(id);
  const root = $x('xmas'); if(!root) return;

  // ---- today (honours ?themedate=MM-DD for previews) ----
  let now = new Date(), fd = null;
  try{ fd = sessionStorage.getItem('site_theme_date'); }catch(e){}
  const m = fd && fd.match(/(\d{1,2})-(\d{1,2})$/);
  if(m) now = new Date(now.getFullYear(), +m[1]-1, +m[2]);
  const Y = now.getFullYear(), day = now.getDate(), inDec = now.getMonth() === 11;
  const toXmas = Math.round((new Date(Y,11,25) - new Date(Y,now.getMonth(),day)) / 864e5);

  // ---- countdown ----
  const num = $x('xm-num'), sub = $x('xm-sub');
  if(toXmas > 1){ num.textContent = toXmas; sub.textContent = 'sleeps until Christmas'; }
  else if(toXmas === 1){ num.textContent = '1'; sub.textContent = 'sleep to go - it\'s Christmas Eve!'; }
  else if(toXmas === 0){ num.textContent = '🎄'; sub.textContent = 'Merry Christmas, Bestie Ann!'; }
  else { num.textContent = '✦'; sub.textContent = 'Christmas is over - Oud en Nieuw is coming'; }

  // ---- advent strip: door N is open once it is N December (placeholder text - replace with real memories/songs/phrases) ----
  const ADVENT = {};   // e.g. 1:{title:'Door 1', html:'A song, a memory, a Dutch phrase...'}
  let seen = [];
  try{ seen = JSON.parse(localStorage.getItem('xmas26_doors')) || []; }catch(e){}
  const adv = $x('xm-advent');
  for(let d = 1; d <= 25; d++){
    const open = inDec && d <= day, el = document.createElement('button');
    el.type = 'button'; el.className = 'xm-door ' + (open ? 'open' : 'shut') + (d === day && inDec ? ' today' : '') + (seen.includes(d) ? ' done' : '');
    el.textContent = d; el.setAttribute('aria-label', 'Advent door ' + d + (open ? '' : ' (not yet)'));
    if(open) el.onclick = () => {
      const c = ADVENT[d] || { title:'Door ' + d, html:'This door is still being wrapped. The full Advent calendar page is on its way - check back soon ♡' };
      if(typeof showModal === 'function') showModal(c.title, c.html, 'Bestie Tristan xo');
      if(!seen.includes(d)){ seen.push(d); el.classList.add('done'); try{ localStorage.setItem('xmas26_doors', JSON.stringify(seen)); }catch(e){} }
    };
    adv.appendChild(el);
  }

  // ---- bauble tree: one bauble lights for each different day you visit in December ----
  const KEY = 'xmas26_visits'; let visits = [];
  try{ visits = JSON.parse(localStorage.getItem(KEY)) || []; }catch(e){}
  if(inDec && !visits.includes(day)){ visits.push(day); try{ localStorage.setItem(KEY, JSON.stringify(visits)); }catch(e){} }
  const BAUBLE_NOTES = ['Thank you for being my bestie.','Hot chocolate energy: you.','Stroopwafels beat mince pies. Fight me.','Another day, another reason.','You make December warmer.','Sending a very long-distance hug.'];
  const spots = [[115,70],[92,105],[138,100],[70,140],[115,138],[160,142],[50,182],[88,176],[130,178],[172,180],[62,214],[160,214]];
  const cols = ['--rose','--gold','--sage','--paper'];
  let svg = '<svg class="xm-tree" viewBox="0 0 230 270" role="img" aria-label="Christmas tree: one bauble lights per day you visit">'
    + '<rect x="104" y="236" width="22" height="26" fill="var(--brown)"/>'
    + ['M115 20 L165 100 H65 Z','M115 60 L185 160 H45 Z','M115 110 L205 232 H25 Z'].map(p => '<path d="' + p + '" fill="var(--sage)" stroke="var(--sage-dark)" stroke-width="2"/>').join('')
    + '<path d="M115 8 l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="var(--gold-light)" stroke="var(--gold-dark)"/>';
  spots.forEach((p, i) => { svg += '<circle class="xm-bauble ' + (i < visits.length ? 'lit' : 'off') + '" cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="var(' + cols[i % 4] + ')" stroke="var(--gold-dark)" stroke-width="1.5" data-i="' + i + '"/>'; });
  $x('xm-tree').innerHTML = svg + '</svg>';
  $x('xm-tree-sub').textContent = Math.min(visits.length, 12) + ' of 12 baubles lit - visit on different days in December';
  $x('xm-tree').addEventListener('click', e => {
    const b = e.target.closest('.xm-bauble'); if(!b) return;
    $x('xm-note').textContent = b.classList.contains('lit') ? BAUBLE_NOTES[+b.dataset.i % BAUBLE_NOTES.length] : 'not lit yet - come back another day ♡';
  });

  // ---- coming-soon stamps (reuse the .pst look from the door sheet). Flip live:true + add href when a page ships ----
  const TEASERS = [
    { label:'Advent Calendar', glyph:'🗓', date:'opens 1 Dec', live:false, href:'advent.html' },
    { label:'Christmas Gifts', glyph:'🎁', date:'opens 24 Dec', live:false, href:'christmas_gifts.html' },
    { label:'Christmas Day',   glyph:'🎄', date:'25 Dec only', live:false, href:'christmas_day.html' },
    { label:'12 Days',         glyph:'🕯', date:'26 Dec - 6 Jan', live:false, href:'twelve_days.html' }
  ];
  const st = $x('xm-stamps');
  TEASERS.forEach((t, i) => {
    const el = document.createElement(t.live ? 'a' : 'div');
    el.className = 'pst' + (t.live ? '' : ' blank'); el.style.setProperty('--c', 'var(--rose)'); el.style.setProperty('--t', ((i % 3) - 1) * 1.4 + 'deg');
    if(t.live) el.href = t.href;
    el.innerHTML = '<div class="pst-in"><span class="pst-glyph"></span><span class="pst-label"></span></div>';
    el.querySelector('.pst-glyph').textContent = t.live ? t.glyph : '?';
    el.querySelector('.pst-label').textContent = t.live ? t.label : '';
    if(!t.live) el.insertAdjacentHTML('beforeend', '<span class="xm-date">' + t.date + '</span>');
    st.appendChild(el);
  });
})();
