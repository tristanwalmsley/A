/* ==========================================================================
   eggs.js - shared easter-egg tracking for every page.
   - PAGES is the list of pages that have eggs, and how many each has.
     To give another page eggs: add it to PAGES (with its total), then call
     PageEggs.found('pageid', 'eggid', {title, text, sig}) when an egg is found.
   - A page counts as "done" once all its eggs are found. The home page's
     Secret Keeper badge gains one level for every page that is done.
   - 'home' keeps using its old storage key (ann_eggs_found), so nothing resets.
   ========================================================================== */
(function(){
  const KEY = 'ann_page_eggs_v1';   // { reasons:[eggIds], _order:[pageIds in the order they were completed] }
  const PAGES = {
    home:    { label:'Home',    total:9, legacyKey:'ann_eggs_found' },   // home.js sets the real total
    reasons: { label:'Reasons', total:21 },
  };


  // display names for the "secrets found" list. Add a line here whenever a page gets a new egg (unknown ids still show, using their id).
  const NAMES = {
    home: { postmark:'You found the secret!', nav:'Snooping at the letterhead?', konami:'The secret code', name:'Someone said your name', signature:'Double-checking my signature?', tristan:"Hi, it's me", idle:'Special delivery, mid-air', mail:'Special delivery', chase:'You caught it' },
    reasons: { peek:'Impatient?', star:'Make a wish', readall:'Every. Single. One.', beans:'Beans Means Heinz', noodles:'Noodles Unite Us', bingbong:'Bing bong', twoam:'2am thoughts', doobe:'DOOBEBOOBEDOOOOOO', adam:'Adam has been rejected', stay:'You stayed', song:'The hidden song',
      bingchill:'Bing chilling', yeah:'Yeah.', muscle:'BIG MUSCLE BADDIE', loveyou:'Love you too', phas:'Phas Monday', thanks:'A special delivery', wellmen:'Fatal error', fan:'Number one fan', sea:'Across the sea', energy:'That is your energy' }
  };

  // one cryptic nudge per egg for the "give me a clue" popup. Never the egg's name, never the exact steps.
  // Add a line here for every new egg; eggs without a clue are simply left out of that popup.
  const CLUES = {
    home: {
      postmark: "The postmark loves company. Keep pressing it.",
      nav: "The little word under our names has more patience than it looks. Keep at it.",
      konami: "Old-school gamers already know exactly what to press.",
      name: "Spell your own name when nobody's looking.",
      tristan: "...and now spell mine.",
      signature: "A signature deserves a second look. Quick, one after the other.",
      idle: "Linger a while. Post comes for the patient, and it doesn't hang around.",
      mail: "That little stamp wants to go somewhere. Show it where.",
      chase: "Something shy drifts about after a while. It runs from you, but corners don't give it a choice."
    },
    reasons: {
      peek: "Not every card wants a quick tap. Some want you to stop and wait with them.",
      star: "Keep an eye on the sky. When something crosses it, be quick.",
      readall: "Take the scenic route through every reason, one at a time, no shortcuts.",
      beans: "One card is a tin that wants tipping. Tilt it, and don't stop.",
      noodles: "One card is stretchy. Pull until it's taut.",
      bingbong: "A doorbell is happiest when you ring it twice.",
      twoam: "Late-night messages answer best when you send them twice, fast.",
      doobe: "One card has a song stuck inside it. Work it like a record.",
      adam: "Someone on this list isn't welcome. Make that very clear on the card.",
      stay: "Do nothing at all. The stars notice.",
      song: "The title at the top has a song in it. Be persistent, or be polite.",
      bingchill: "Take the wheel, and stop exactly where you're supposed to.",
      yeah: "Agree with it. Properly, with your whole head.",
      muscle: "Give one very flexed card a lot of attention, quickly, before it gives up.",
      loveyou: "Answer that card the way you'd answer a love note: draw something back.",
      phas: "Knock, and see who answers. Then take a torch.",
      thanks: "Squeeze a card until it can't take any more, then let go. Someone's waiting inside.",
      wellmen: "Be decisive about the men. Dating-app decisive.",
      fan: "Wave like you're right at the front of the crowd.",
      sea: "Cross the whole sea in one go. No landing early.",
      energy: "Listen carefully, then play it back."
    }
  };

  const load = () => { try{ const d = JSON.parse(localStorage.getItem(KEY)); return (d && typeof d === 'object' && !Array.isArray(d)) ? d : {}; }catch(e){ return {}; } };
  const save = d => { try{ localStorage.setItem(KEY, JSON.stringify(d)); }catch(e){} };

  function list(page){
    const p = PAGES[page]; if(!p) return [];
    if(p.legacyKey){ try{ const a = JSON.parse(localStorage.getItem(p.legacyKey)); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
    const a = load()[page]; return Array.isArray(a) ? a : [];
  }
  const count   = page => list(page).length;
  const total   = page => PAGES[page] ? PAGES[page].total : 0;
  const isDone  = page => !!PAGES[page] && count(page) >= PAGES[page].total;
  const has     = (page, id) => list(page).includes(id);

  // pages that are complete, in the order they were completed (this is the order the badge animations play in).
  // Sticky on purpose: once a page has been completed it stays counted, even if more eggs are added to it later.
  function sync(){
    const d = load();
    let o = Array.isArray(d._order) ? d._order.filter(p => PAGES[p]) : [];
    let changed = !Array.isArray(d._order) || o.length !== d._order.length;
    Object.keys(PAGES).forEach(p => { if(isDone(p) && !o.includes(p)){ o.push(p); changed = true; } });
    if(changed){ d._order = o; save(d); }
    return o;
  }
  const level = () => sync().length;

  function mark(page, id){          // returns true if this egg is new
    if(!PAGES[page] || PAGES[page].legacyKey) return false;
    const d = load(), a = Array.isArray(d[page]) ? d[page] : [];
    if(a.includes(id)) return false;
    a.push(id); d[page] = a; save(d); sync();
    return true;
  }
  const grandTotal = () => Object.keys(PAGES).reduce((s, p) => s + total(p), 0);
  const foundTotal = () => Object.keys(PAGES).reduce((s, p) => s + Math.min(count(p), total(p)), 0);

  /* ---------------- the little popup + toast (injected once) ---------------- */
  let ready = false, afterClose = null, toastTimer = null;
  function ui(){
    if(ready) return; ready = true;
    const st = document.createElement('style');
    st.textContent = `
#pe-modal{display:none;position:fixed;inset:0;z-index:5000;align-items:center;justify-content:center;padding:1.5rem}
#pe-modal.show{display:flex}
#pe-modal .pe-backdrop{position:absolute;inset:0;background:rgba(20,8,2,.8)}
#pe-modal .pe-card{position:relative;z-index:1;max-width:380px;width:100%;background:var(--paper,#fffdf5);border:1px solid var(--tan,#d4b483);padding:2.5rem 2.5rem 2rem;box-shadow:8px 8px 0 var(--brown,#7a5230),0 0 60px rgba(200,148,58,.3);animation:peIn .5s cubic-bezier(.34,1.6,.64,1)}
@keyframes peIn{from{opacity:0;transform:scale(.7) rotate(-5deg)}to{opacity:1;transform:scale(1) rotate(0)}}
#pe-modal .pe-card::before{content:'';position:absolute;inset:-6px;border:1px dashed var(--warm,#f0ddb8)}
#pe-modal .pe-title{font-family:'Playfair Display',serif;font-size:1.4rem;font-style:italic;color:var(--rose,#b86858);margin-bottom:.8rem}
#pe-modal .pe-text{font-family:'EB Garamond',Georgia,serif;font-size:1rem;line-height:1.8;color:var(--brown,#7a5230)}
#pe-modal .pe-sig{font-family:'Caveat',cursive;font-size:1.6rem;font-weight:700;color:var(--rose,#b86858);margin-top:1rem;display:block}
#pe-modal .pe-x{position:absolute;top:-1rem;right:-1rem;background:var(--deep,#3a2010);color:var(--cream,#faf4e8);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center}
#pe-modal .pe-x:hover{background:var(--brown,#7a5230)}
#pe-modal .pe-list{max-height:60vh;overflow-y:auto;margin:0 -.4rem;padding:0 .4rem;text-align:left}
#pe-modal .pe-lh{display:flex;justify-content:space-between;font-family:'Caveat',cursive;font-size:1.25rem;font-weight:700;color:var(--rose,#b86858);border-bottom:1px dashed var(--tan,#d4b483);margin:.9rem 0 .3rem}
#pe-modal .pe-lh:first-child{margin-top:0}
#pe-modal .pe-li{font-family:'EB Garamond',Georgia,serif;font-size:1rem;line-height:1.5;color:var(--brown,#7a5230);padding:.12rem 0}
#pe-modal .pe-li.clue{font-style:italic}
#pe-modal .pe-li.clue{padding:.25rem 0}
#pe-modal .pe-li.no{opacity:.45;letter-spacing:2px}
#pe-modal .pe-li::before{content:'\u2726 ';color:var(--gold,#c8943a)}
#pe-modal .pe-li.no::before{content:'\u00b7 ';color:var(--tan,#d4b483)}
#pe-toast{position:fixed;left:50%;top:1.2rem;transform:translate(-50%,-30px);z-index:5100;max-width:calc(100vw - 2rem);padding:.6rem 1.3rem;border-radius:999px;background:var(--gold,#c8943a);color:var(--deep,#3a2010);font-family:'Caveat',cursive;font-size:1.2rem;text-align:center;box-shadow:4px 4px 0 var(--brown,#7a5230);opacity:0;transition:opacity .5s ease,transform .6s cubic-bezier(.34,1.56,.64,1);pointer-events:none}
#pe-toast.show{opacity:1;transform:translate(-50%,0)}`;
    document.head.appendChild(st);
    const m = document.createElement('div'); m.id = 'pe-modal';
    m.innerHTML = '<div class="pe-backdrop"></div><div class="pe-card"><button class="pe-x" aria-label="Close">✕</button><div class="pe-title"></div><p class="pe-text"></p><span class="pe-sig"></span></div>';
    document.body.appendChild(m);
    m.querySelector('.pe-backdrop').onclick = close;
    m.querySelector('.pe-x').onclick = close;
    const t = document.createElement('div'); t.id = 'pe-toast'; document.body.appendChild(t);
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
  }
  function toast(text, ms){
    ui();
    const t = document.getElementById('pe-toast');
    t.textContent = text; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms || 3200);
  }
  function modal(title, html, sig, cb){
    ui();
    const m = document.getElementById('pe-modal');
    m.querySelector('.pe-title').textContent = title;
    m.querySelector('.pe-text').innerHTML = html;
    m.querySelector('.pe-sig').textContent = sig || 'Bestie Tristan';
    m.classList.add('show');
    afterClose = cb || null;
  }
  function close(){
    const m = document.getElementById('pe-modal');
    if(!m || !m.classList.contains('show')) return;
    m.classList.remove('show');
    if(afterClose){ const f = afterClose; afterClose = null; setTimeout(f, 300); }
  }
  const isOpen = () => { const m = document.getElementById('pe-modal'); return !!m && m.classList.contains('show'); };


  // popup listing every secret found so far (titles only; the ones not found yet stay hidden as ???)
  function showList(){
    const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    let html = '<div class="pe-list">';
    Object.keys(PAGES).forEach(p => {
      const got = list(p), names = NAMES[p] || {}, tot = total(p);
      html += '<div class="pe-lh"><span>' + esc(PAGES[p].label) + '</span><span>' + Math.min(got.length, tot) + ' / ' + tot + '</span></div>';
      got.forEach(id => { html += '<div class="pe-li">' + esc(names[id] || id) + '</div>'; });
      for(let i = got.length; i < tot; i++) html += '<div class="pe-li no">???</div>';
    });
    modal('Secrets found: ' + foundTotal() + ' / ' + grandTotal(), html + '</div>', '\u2661');
  }


  // popup with one cryptic clue for every secret not found yet (no names, no instructions)
  function showClues(){
    const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    let html = '<div class="pe-list">', left = 0;
    Object.keys(PAGES).forEach(p => {
      const have = list(p), cl = CLUES[p] || {};
      const todo = Object.keys(cl).filter(id => !have.includes(id));
      if(!todo.length) return;
      left += todo.length;
      html += '<div class="pe-lh"><span>' + esc(PAGES[p].label) + '</span><span>' + todo.length + ' to find</span></div>';
      todo.forEach(id => { html += '<div class="pe-li clue">' + esc(cl[id]) + '</div>'; });
    });
    if(!left) html += '<div class="pe-li">You\'ve found every secret I\'ve hidden so far. There will be more.</div>';
    modal(left ? 'A clue for each one left' : 'Nothing left to find', html + '</div>', '\u2661');
  }

  // call this when an egg is found. msg = { title, text, sig } shows the popup; leave it out for a toast only.
  function found(page, id, msg){
    ui();
    const wasDone = isDone(page);
    const isNew = mark(page, id);
    const n = count(page), tot = total(page);
    const justDone = isNew && !wasDone && n >= tot;
    const finale = () => { if(justDone) toast("that's every secret on this page ♡ go and peek at the home page", 5600); };
    if(msg){
      if(isNew) toast('secret found ♡  ' + n + ' / ' + tot, 2600);
      modal(msg.title, msg.text, msg.sig, finale);
    } else {
      if(isNew) toast('you found a secret ♡  ' + n + ' / ' + tot, 3200);
      if(justDone) setTimeout(finale, 3400);
    }
    return isNew;
  }

  window.PageEggs = { PAGES, list, count, total, isDone, has, sync, level, order: sync, grandTotal, foundTotal, found, toast, modal, close, isOpen, showList, showClues, names: NAMES, clues: CLUES };
})();
