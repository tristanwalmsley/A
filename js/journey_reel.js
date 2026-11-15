/* ==========================================================================
   journey_reel.js - the secrets celebration for the Our Journey page (all 16 eggs), played from the Secret Keeper badge.
   Needs fx_kit.js and journey_eggs.js. Loaded on the home page before home.js, which calls:
       JourneyReel.play(overlay, next)

   Each egg is replayed with the SAME moment the page plays live (journey_eggs.js), and the firefly performs the SAME gesture that finds it
   on the page, on a miniature of the real card: keeping the nest warm until it glows, swiping the hello away, pulling the phone cord off its
   dot, scrolling the bus card in a three-point turn, pinching the glasses open, shaking the face-reveal like a polaroid, a torch in the dark
   for Phasmo, the three Christmases counted in order, five steady beats, two lights meeting in the middle, pumping up the protein business,
   lighting all eight candles one by one, strumming the spine, pushing at the end of the page, winding the stamp like a dial, and the last
   star. Each time the moment plays and an egg hatches into the tray of sixteen at the top. Finale: the sixteen eggs become the dots of one
   long timeline, a spark runs down it, and the "3+ Years of Besties" stamp slams down with the real number of days counting up, then a note.

   MUSIC: its own score, written for this reel (see "the score" below): a lo-fi groove (electric piano, soft bass, swung drums, vinyl crackle)
   that starts quiet, finds its beat, lifts, builds, and goes up a key for the stamp.

   No buttons. Escape skips to the end. Reduced motion: home.js falls back to a quick ring.
   Edit SCENES to reorder or drop scenes (each one is a full egg, so it is long: roughly 5 minutes). Edit NOTE_LINES for the closing note.
   Colours come from the active theme, so Winter/Christmas restyle the whole reel.
   ========================================================================== */
(function(){
  'use strict';
  const K = window.FxKit, JE = window.JourneyEggs, DEAD = K.DEAD, mk = K.mk, rnd = K.rnd, col = K.col, PENTA = JE.util.PENTA;

  // order follows the timeline: what the card says, how she found it
  const SCENES = [
    { key:'nest',      cap:'it started in a nest, and it had to be kept warm',   tag:'milestone', date:'Nov 2022',      title:'You started chatting in the Nest',      g:'warm',    music:'jm_intro' },
    { key:'hello',     cap:'then a very first hello, swiped away like a notification', tag:'special', date:'15 Jan 2023', title:'First hello and the date of our first DMing', g:'swipe', music:'jm_tender' },
    { key:'call',      cap:'then a very first call, and a cord that stretched',   tag:'special',   date:'28 Jan 2023',   title:'Our very first of many calls',           g:'cord',    music:'jm_groove' },
    { key:'bus',       cap:'then a very slow bus, and a three-point turn',        tag:'game',      date:'3 Jul 2023',    title:'Bus Sim 18',                             g:'turn',    music:'jm_lift' },
    { key:'glasses',   cap:'then Tristan got glasses, for a closer look',         tag:'milestone', date:'9 Aug 2023',    title:'Tristan got glasses',                    g:'pinch',   music:'jm_groove' },
    { key:'christmas', cap:'then three Christmases, counted in order',            tag:'christmas', date:'2023 · 2024 · 2025', title:'The Christmas exchanges',          g:'order',   music:'jm_tender' },
    { key:'phasmo',    cap:'then the lights went off',                            tag:'game',      date:'Mar 2024',      title:'Ann first played Phasmo',                g:'torch',   music:'jm_intro' },
    { key:'face',      cap:'then a face reveal, shaken like a polaroid',          tag:'milestone', date:'Oct 2024',      title:'The “official” face reveal',             g:'shake',   music:'jm_lift' },
    { key:'birthday',  cap:'and every birthday along the way, one candle at a time', tag:'birthday', date:'27 Jun · 5 Aug', title:'Eight birthdays',                      g:'candles', glyph:'🎂', music:'jm_lift' },
    { key:'stardew',   cap:'then a concert on a farm, keeping the beat',          tag:'game',      date:'Feb–Mar 2026',  title:'Stardew Concerts',                       g:'beat',    music:'jm_groove' },
    { key:'insync',    cap:'then we started thinking in unison',                  tag:'era',       date:'2026',          title:'The INSYNC Era',                         g:'meet',    music:'jm_groove' },
    { key:'protein',   cap:'then a business was born, and it had to be pumped',   tag:'milestone', date:'19 Aug 2026',   title:'The Protein Business',                   g:'pump',    music:'jm_lift' },
    { key:'spine',     cap:'and the line that holds it all together',             g:'strum', music:'jm_tender' },
    { key:'capsule',   cap:'then the very end of the page, which gave way',       g:'push',  music:'jm_tender' },
    { key:'days',      cap:'and one very big number, wound like a dial',          g:'dial',  music:'jm_groove' },
    { key:'tbc',       cap:'and the last one, which was never really last',       tag:'future',    date:'✨ 2026 and beyond ✨', title:'The rest of it',           g:'star',    music:'jm_tender' }
  ];
  const NOTE_LINES = [
    ['sixteen secrets.', 2400],
    ['hidden in a timeline that started in a nest in 2022.', 3800],
    ['every card on it is something we actually did.', 3600],
    ['and you went through every single one of them like it mattered.', 4200],
    ['it did. it does.', 3000],
    ['here is to the rest of it, Ann.', 4600]
  ];

  /* ------------------------------------------------------------------ the score
     A different sound from the other reels (those are music-box + pad): a lo-fi groove in F major. Jazzy 9th chords on an electric piano,
     a soft bass, swung drums, a little vinyl crackle, and a lead with a gentle vibrato. It starts quiet, finds its beat, lifts into a second
     section, builds, and goes up a key for the stamp. Pieces (all in K.PIECES):
       jm_intro   no drums, just the piano and the crackle         jm_groove  the main beat (verse)        jm_lift    the brighter second section
       jm_tender  slow and soft, pad underneath                    jm_gather  the build (four on the floor) jm_blast   up a key, big, with claps and a crash
       jm_note    barely there, for the closing note
     Chords are { r: bass note, v: the chord tones above it }. Patterns are 8 steps per bar (eighth notes; odd steps swing). Edit freely. */
  const P = K.PIECES;
  const A = [{ r:41, v:[57,60,64,67] }, { r:45, v:[60,64,67,71] }, { r:50, v:[60,64,65,69] }, { r:46, v:[62,65,69,72] }];   // Fmaj9  Am9  Dm9  Bbmaj9
  const B = [{ r:43, v:[58,62,65,69] }, { r:48, v:[64,67,70,74] }, { r:41, v:[57,60,64,67] }, { r:50, v:[60,64,65,69] }];   // Gm9    C9   Fmaj9 Dm9
  const G = [{ r:50, v:[60,64,65,69] }, { r:46, v:[62,65,69,72] }, { r:41, v:[57,60,64,67] }, { r:48, v:[64,67,70,74] }];   // Dm9    Bbmaj9 Fmaj9 C9   (the build)
  const up = (prog, n) => prog.map(c => ({ r:c.r + n, v:c.v.map(x => x + n) }));
  const MEL_A = [[84,null,81,null,null,79,81,null], [84,null,86,null,88,null,null,null], [86,null,84,null,81,null,77,null], [77,null,79,null,81,82,null,null]];
  const MEL_B = [[82,null,79,null,82,null,86,null], [84,null,82,null,79,null,76,null], [81,null,84,null,88,null,84,81], [86,null,84,null,81,null,null,null]];
  const MEL_T = [[81,null,null,null,84,null,null,null], [88,null,null,null,86,null,84,null], [81,null,null,null,77,null,null,null], [79,null,81,null,82,null,null,null]];
  const MEL_G = [[74,null,77,null,81,null,86,null], [77,null,82,null,86,null,89,null], [81,null,84,null,88,null,93,null], [88,null,86,null,82,null,79,null]];
  const MEL_X = [[86,null,83,null,86,88,91,null], [88,null,86,null,83,null,88,null], [91,null,88,null,86,null,83,null], [86,null,88,null,90,91,null,null]];
  P.jm_intro  = { v2:true, tempo:76, swing:0.14, prog:A, comp:[1,0,0,0,0,0,0,0], compVol:0.055, bassPat:[1,0,0,0,0,0,0,0], bass:0.12, mel:MEL_A, melVol:0.045, pad:0.014, crackle:0.02 };
  P.jm_groove = { v2:true, tempo:78, swing:0.17, prog:A, comp:[1,0,0,2,0,0,2,0], compVol:0.06, bassPat:[1,0,0,1,2,0,0,0], bass:0.16,
                  kick:[1,0,0,0.8,0.9,0,0,0], snare:[0,0,1,0,0,0,1,0], hat:[0.6,0.3,0.5,0.3,0.6,0.3,0.5,0.35], mel:MEL_A, melVol:0.065, pad:0.012, crackle:0.02 };
  P.jm_lift   = { v2:true, tempo:84, swing:0.15, prog:B, comp:[1,0,2,0,1,0,2,0], compVol:0.06, bassPat:[1,0,1,0,2,0,1,3], bass:0.17,
                  kick:[1,0,0,0.7,1,0,0,0.6], snare:[0,0,1,0,0,0,1,0], clap:[0,0,0.7,0,0,0,0.7,0], hat:[0.7,0.4,0.6,0.4,0.7,0.4,0.6,0.4], mel:MEL_B, melVol:0.07, pad:0.014, crackle:0.015 };
  P.jm_tender = { v2:true, tempo:64, swing:0.1, prog:A, comp:[1,0,0,0,2,0,0,0], compVol:0.06, bassPat:[1,0,0,0,0,0,0,0], bass:0.1, mel:MEL_T, melVol:0.075, pad:0.024, crackle:0.015 };
  P.jm_gather = { v2:true, tempo:92, swing:0, prog:G, comp:[2,0,2,0,2,0,2,0], compVol:0.055, bassPat:[1,0,1,0,1,0,1,0], bass:0.17,
                  kick:[1,0,0.7,0,1,0,0.7,0], snare:[0,0,0,0,0,0,0.8,0.5], hat:[0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5], mel:MEL_G, melVol:0.075, pad:0.022 };
  P.jm_blast  = { v2:true, tempo:96, swing:0.06, prog:up(A, 2), crash:true, comp:[1,0,2,0,1,0,2,0], compVol:0.068, bassPat:[1,0,0,1,2,0,1,3], bass:0.2,
                  kick:[1,0,0,0.8,1,0,0.7,0], snare:[0,0,1,0,0,0,1,0], clap:[0,0,0.8,0,0,0,0.8,0], hat:[0.7,0.4,0.6,0.4,0.7,0.4,0.6,0.5], mel:MEL_X, melVol:0.095, pad:0.03 };
  P.jm_note   = { v2:true, tempo:60, swing:0, prog:A, comp:[1,0,0,0,1,0,0,0], compVol:0.055, bassPat:[1,0,0,0,0,0,0,0], bass:0.09, mel:MEL_T, melVol:0.065, pad:0.03, crackle:0.01 };

  /* ------------------------------------------------------------------ styles */
  const CSS = `
.jr-root{position:absolute;inset:0;z-index:0;pointer-events:none;transition:opacity .9s}
.jr-sky{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,color-mix(in srgb,var(--brown,#7a5230) 55%,#08040a),color-mix(in srgb,var(--deep,#3a2010) 80%,#030105) 80%);opacity:0;transition:opacity 2.6s}
.jr-sky.on{opacity:1}
.jr-snd{position:absolute;right:1rem;top:1rem;z-index:95;font-family:'Caveat',cursive;font-size:1.15rem;color:rgba(250,244,232,.7);letter-spacing:1px;animation:jrBob 1.6s ease-in-out infinite}
@keyframes jrBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.jr-tray{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 1.8rem);transform:translateX(-50%);display:grid;grid-template-columns:repeat(8,auto);gap:.32rem;z-index:60;opacity:0;transition:opacity 1.2s}
.jr-tray.on{opacity:1}
.jr-slot{position:relative;width:1.25rem;height:1.55rem;border:1.5px dashed rgba(255,226,160,.38);border-radius:50% 50% 50% 50% / 62% 62% 38% 38%;transition:border-color .6s,box-shadow .6s,background .6s}
.jr-slot.full{border-style:solid;border-color:var(--gold-light,#e8b95a);background:color-mix(in srgb,var(--gold-light,#e8b95a) 22%,transparent);box-shadow:0 0 12px color-mix(in srgb,var(--gold-light,#e8b95a) 70%,transparent)}
.jr-slot i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:.78rem;opacity:0;transform:scale(.3);transition:opacity .4s,transform .5s cubic-bezier(.34,1.8,.5,1)}
.jr-slot.full i{opacity:1;transform:scale(1)}
.jr-egg{position:absolute;font-size:2.4rem;line-height:1;transform:translate(-50%,-50%);z-index:70;transition:left 1.1s cubic-bezier(.5,0,.2,1),top 1.1s cubic-bezier(.5,0,.2,1),font-size 1.1s ease,opacity .6s;filter:drop-shadow(0 0 14px rgba(255,215,106,.8))}
.jr-egg.pop{animation:jrPop .6s cubic-bezier(.34,1.8,.5,1)}
@keyframes jrPop{from{transform:translate(-50%,-50%) scale(0)}to{transform:translate(-50%,-50%) scale(1)}}
/* replica timeline card (a miniature of the real .tl-card) */
.jr-card{position:absolute;left:50%;top:46%;z-index:40;width:min(78vw,300px);padding:.9rem 1.1rem 1rem;background:var(--paper,#fffdf5);color:var(--deep,#3a2010);border:1px solid var(--tan,#d4b483);border-left:4px solid var(--gold,#c8943a);box-shadow:5px 5px 0 var(--brown,#7a5230),0 10px 30px rgba(0,0,0,.4);transform:translate(-50%,-50%) scale(0);transition:transform .55s cubic-bezier(.34,1.7,.5,1),opacity .6s}
.jr-card.in{transform:translate(-50%,-50%) scale(1)}
.jr-card.tap{animation:jrTap .28s ease}
@keyframes jrTap{0%{filter:brightness(1)}40%{filter:brightness(1.12) drop-shadow(0 0 14px var(--gold-light,#e8b95a));transform:translate(-50%,-50%) scale(1.045)}100%{filter:brightness(1)}}
.jr-tag{display:inline-block;font-family:'Playfair Display',serif;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;padding:.12rem .5rem;border:1px solid var(--gold,#c8943a);color:var(--gold-dark,#a8741f)}
.jr-date{margin-top:.45rem;font-family:'Caveat',cursive;font-size:1.15rem;color:var(--rose,#b86858)}
.jr-title{font-family:'Playfair Display',serif;font-weight:700;font-size:1.12rem;line-height:1.25}
.jr-dot{position:absolute;left:-1.9rem;top:50%;width:1.05rem;height:1.05rem;margin-top:-.52rem;border-radius:50%;border:2.5px solid var(--gold,#c8943a);background:#160d08;transition:background .3s,transform .3s}
.jr-dot.lit{background:var(--gold-light,#e8b95a);transform:scale(1.5)}
.jr-mini{position:absolute;z-index:42;width:3.1rem;height:3.9rem;transform:translate(-50%,-50%) scale(0);background:var(--paper,#fffdf5);border:1px solid var(--tan,#d4b483);border-left:3px solid var(--gold,#c8943a);box-shadow:3px 3px 0 var(--brown,#7a5230);display:flex;align-items:center;justify-content:center;font-size:1.5rem;transition:transform .45s cubic-bezier(.34,1.8,.5,1),filter .3s}
.jr-mini.in{transform:translate(-50%,-50%) scale(1)}
.jr-mini.hit{filter:drop-shadow(0 0 10px var(--gold-light,#e8b95a)) brightness(1.1);transform:translate(-50%,-50%) scale(1.18)}
.jr-line{position:absolute;z-index:40;width:2px;background:var(--tan,#d4b483);opacity:.6;transform-origin:50% 0}
.jr-stampbig{position:absolute;left:50%;z-index:60;width:min(54vw,210px);aspect-ratio:1;border-radius:50%;border:4px double var(--gold-light,#e8b95a);color:#fff3d6;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:color-mix(in srgb,var(--deep,#3a2010) 60%,transparent);box-shadow:0 0 40px color-mix(in srgb,var(--gold,#c8943a) 45%,transparent);transform:translate(-50%,-50%) scale(var(--s,1))}
.jr-stampbig b{font-family:'Playfair Display',serif;font-size:clamp(3rem,14vw,4.6rem);line-height:1;color:var(--gold-light,#e8b95a)}
.jr-stampbig span{font-family:'Playfair Display',serif;font-style:italic;font-size:1rem;letter-spacing:.06em}
.jr-stampbig.slam{animation:jrSlam .42s cubic-bezier(.2,1.5,.4,1) both}
@keyframes jrSlam{from{opacity:0;transform:translate(-50%,-50%) scale(2.6) rotate(-16deg)}to{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-6deg)}}
.jr-fdot{position:absolute;z-index:56;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;border:2px solid var(--gold,#c8943a);background:#160d08;transition:background .3s,transform .4s cubic-bezier(.3,2,.5,1),box-shadow .3s}
.jr-fdot.lit{background:var(--gold-light,#e8b95a);transform:scale(1.5);box-shadow:0 0 14px var(--gold-light,#e8b95a)}
.jr-era{position:absolute;z-index:56;transform:translate(0,-50%);font-family:'Playfair Display',serif;font-size:.75rem;letter-spacing:.2em;color:#fff3d6;padding:.1rem .5rem;background:color-mix(in srgb,var(--deep,#3a2010) 85%,#000);border:1px solid var(--tan,#d4b483);opacity:0;transition:opacity .6s}
.jr-banner{position:absolute;left:0;right:0;top:var(--bt,70%);z-index:62;text-align:center;font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:clamp(1.6rem,7vw,3rem);letter-spacing:.12em;white-space:nowrap;transition:top 1.4s cubic-bezier(.6,0,.3,1)}
.jr-banner span{display:inline-block;opacity:0;transform:translateY(-40px) scale(1.8);background:linear-gradient(180deg,#fff6c8,var(--gold-light,#e8b95a) 60%,var(--gold-dark,#a8741f));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 12px rgba(255,200,80,.8));animation:jrLetter .6s cubic-bezier(.2,1.4,.4,1) forwards;animation-delay:var(--d)}
@keyframes jrLetter{to{opacity:1;transform:none}}
.jr-line2{position:absolute;left:0;right:0;top:54%;z-index:62;text-align:center;padding:0 9vw;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.3rem,5.2vw,2.2rem);line-height:1.5;color:#fff3d6;text-shadow:0 2px 16px rgba(0,0,0,.7),0 0 22px rgba(232,185,90,.5);opacity:0;transition:opacity 1s}
.jr-line2.in{opacity:1}
.jr-sig{position:absolute;left:0;right:0;top:76%;z-index:62;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(1.8rem,7vw,2.8rem);color:var(--gold-light,#e8b95a);text-shadow:0 0 16px rgba(255,200,110,.7);opacity:0;transition:opacity 1.6s}
.jr-sig.in{opacity:1}
.jr-fall{position:absolute;top:-2rem;z-index:3;color:#fff;opacity:.7;pointer-events:none;animation:jrFall var(--fd) linear forwards}
@keyframes jrFall{to{transform:translate(var(--sw),112vh) rotate(var(--fr))}}
.jr-card.jr-warming{box-shadow:0 0 calc(var(--jew,0) * 34px) calc(var(--jew,0) * 10px) rgba(255,165,60,calc(.1 + var(--jew,0) * .55)),5px 5px 0 var(--brown,#7a5230)!important}
.jr-midline{position:absolute;left:12%;right:12%;height:0;border-top:2px dashed rgba(255,226,160,.45);z-index:38}
.jr-cord{position:absolute;inset:0;width:100%;height:100%;z-index:44;pointer-events:none}
.jr-cord path{fill:none;stroke:var(--rose,#b86858);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.jr-dark{position:absolute;inset:0;z-index:50;background:#000;opacity:0;transition:opacity .4s;pointer-events:none;-webkit-mask-image:radial-gradient(circle 88px at var(--x) var(--y),transparent 0,transparent 55%,#000 100%);mask-image:radial-gradient(circle 88px at var(--x) var(--y),transparent 0,transparent 55%,#000 100%)}
.jr-mir{position:absolute;z-index:80;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:radial-gradient(circle,#fff,var(--gold,#c8943a) 60%,transparent 72%);box-shadow:0 0 16px 5px color-mix(in srgb,var(--gold,#c8943a) 60%,transparent);pointer-events:none}
.jr-num{position:absolute;bottom:-1.25rem;left:50%;transform:translateX(-50%);font-family:'Caveat',cursive;font-weight:700;font-size:1rem;color:#fff3d6;font-style:normal;white-space:nowrap}
.jr-bauble{position:absolute;top:-7px;right:6px;width:13px;height:13px;border-radius:50%;box-shadow:0 0 8px rgba(255,255,255,.6),inset -2px -2px 3px rgba(0,0,0,.25);animation:jrPopB .4s cubic-bezier(.3,1.8,.5,1)}
@keyframes jrPopB{from{transform:scale(0)}to{transform:scale(1)}}
.jr-mini.jr-nope{animation:jrNope .4s ease}
@keyframes jrNope{0%,100%{transform:translate(-50%,-50%) scale(1)}25%{transform:translate(calc(-50% - 6px),-50%) scale(1)}75%{transform:translate(calc(-50% + 6px),-50%) scale(1)}}
.jr-endline{position:absolute;left:10%;right:10%;z-index:38;text-align:center;font-family:'Playfair Display',serif;font-style:italic;font-size:.8rem;color:rgba(255,243,214,.6);border-top:2px solid rgba(255,226,160,.5);padding-top:.3rem}

`;
  let cssDone = false;
  function injectCSS(){ if(cssDone) return; cssDone = true; const st = document.createElement('style'); st.id = 'jr-css'; st.textContent = CSS; document.head.appendChild(st); }

  /* ------------------------------------------------------------------ helpers */
  let R = null, slots = [], tray = null;
  const slotXY = i => { const s = slots[i].getBoundingClientRect(), b = R.stage.getBoundingClientRect(); return [s.left - b.left + s.width / 2, s.top - b.top + s.height / 2]; };
  async function hatch(i, x, y, key){
    const r = R, e = r.raw('jr-egg pop', '🥚'); e.style.left = x + 'px'; e.style.top = y + 'px';
    r.sparks(x, y, 8, ['✨', '✦', JE.GLYPHS[key]]); r.flash(); r.bell(PENTA[i % 7] - 12, 0, 0.13, 2.2);
    await r.wait(800);
    const p = slotXY(i); e.style.left = p[0] + 'px'; e.style.top = p[1] + 'px'; e.style.fontSize = '.95rem';
    r.tone(500, 0, 0.45, 'sine', 0.06, 1200);
    await r.wait(1200);
    slots[i].classList.add('full'); slots[i].querySelector('i').textContent = JE.GLYPHS[key]; e.remove();
    r.bell(PENTA[i % 7] + 12, 0, 0.09, 1.6); r.sparks(p[0], p[1], 5, ['✦', '✨']);
    r.cap((i + 1) + ' of 16'); await r.wait(900);
  }
  const tap = e => { e.classList.remove('tap'); void e.offsetWidth; e.classList.add('tap'); };
  const centre = r => ({ x:r.W() / 2, y:r.H() * 0.46 });

  // builds the miniature card for a scene
  function card(r, sc){
    const c = r.el('jr-card'); c.innerHTML = '<span class="jr-tag">' + sc.tag + '</span><div class="jr-date">' + sc.date + '</div><div class="jr-title">' + sc.title + '</div>' + (sc.g === 'cord' ? '<i class="jr-dot"></i>' : '');
    return c;
  }
  const NSV = 'http://www.w3.org/2000/svg';
  const coil = (x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, n = Math.max(2, Math.floor(L / 6)); let d = 'M' + x1.toFixed(1) + ',' + y1.toFixed(1);
    for(let i = 1; i <= n; i++){ const t = i / n, a = Math.sin(i * 1.25) * 9 * Math.min(1, L / 60); d += ' L' + (x1 + dx * t + nx * a).toFixed(1) + ',' + (y1 + dy * t + ny * a).toFixed(1); } return d; };
  const at = (e, x, y) => { e.style.transition = 'none'; e.style.left = x + 'px'; e.style.top = y + 'px'; };   // move something right now (used inside tweens)
  const stageXY = (r, el) => { const b = el.getBoundingClientRect(), s = r.stage.getBoundingClientRect(); return { x:b.left - s.left + b.width / 2, y:b.top - s.top + b.height / 2 }; };

  // the firefly performs the SAME gesture that finds the egg on the page; returns where the moment should start from
  async function perform(r, sc){
    const W = r.W(), H = r.H(), c = centre(r), g = sc.g;
    const o = r.orbOn(W * 0.12, H * 0.8);
    const done = async (...nodes) => { r.orbOff(o); r.fade(nodes.filter(Boolean), 500); await r.wait(550); };

    /* ---- gestures on a single card ---- */
    if(['warm', 'swipe', 'cord', 'turn', 'pinch', 'shake', 'beat', 'meet', 'pump', 'star', 'torch'].includes(g)){
      const cd = card(r, sc); await r.nextFrame(); cd.classList.add('in'); r.bell(PENTA[0], 0, 0.07, 1.4);
      await r.wait(1400);
      const w = cd.offsetWidth, px = c.x + w * 0.1, py = c.y + 6;

      if(g === 'warm'){                                   // keep the nest warm: hold still, it glows
        await r.orbGo(o, px, py, 1200); o.classList.add('down'); r.ripple(px, py);
        cd.classList.add('jr-warming'); r.tone(180, 0, 3.2, 'sine', 0.04, 360);
        await r.tween(3200, p => { cd.style.setProperty('--jew', p.toFixed(3)); if(Math.random() < 0.07) r.sparks(c.x + rnd(-w / 2, w / 2), c.y + rnd(-34, 34), 1, ['♡']); });
        o.classList.remove('down'); r.flash(); cd.classList.remove('jr-warming');
        await done(cd); return { x:px, y:py };
      }
      if(g === 'swipe'){                                  // swipe it away like a notification
        await r.orbGo(o, c.x - w * 0.2, py, 1200); o.classList.add('down'); cd.style.transition = 'none'; r.tone(300, 0, 0.8, 'sine', 0.04, 600);
        await r.tween(800, p => { const dx = 125 * p; cd.style.transform = 'translate(calc(-50% + ' + dx + 'px),-50%) rotate(' + (dx * 0.04) + 'deg)'; cd.style.opacity = String(1 - 0.4 * p); at(o, c.x - w * 0.2 + dx, py); });
        o.classList.remove('down'); r.ripple(c.x + 125 - w * 0.2, py, true); cd.style.transition = 'transform .45s cubic-bezier(.3,1.6,.5,1),opacity .3s'; cd.style.transform = 'translate(-50%,-50%) scale(1)'; cd.style.opacity = '1';
        await r.wait(550); await done(cd); return { x:px, y:py };
      }
      if(g === 'cord'){                                   // pull the phone cord off the dot
        const dx0 = c.x - w / 2 - 22, dy0 = c.y;
        const svg = document.createElementNS(NSV, 'svg'); svg.setAttribute('class', 'jr-cord'); const path = document.createElementNS(NSV, 'path'); svg.appendChild(path); r.stage.appendChild(svg); r.collect.push(svg);
        await r.orbGo(o, dx0, dy0, 1200); o.classList.add('down'); r.ripple(dx0, dy0); r.tone(200, 0, 1, 'sine', 0.05, 500);
        await r.tween(1000, p => { const x = dx0 + 8 * p, y = dy0 + 170 * p; at(o, x, y); path.setAttribute('d', coil(dx0, dy0, x, y)); });
        o.classList.remove('down'); await r.wait(250); await done(cd, svg); return { x:dx0, y:dy0 };
      }
      if(g === 'turn'){                                   // a three-point turn: past it, back, past it again
        const ln = r.el('jr-midline'); ln.style.top = c.y + 'px'; cd.style.transition = 'none';
        const ox = c.x + w / 2 + 34; let lastSide = 0;
        for(const [a0, b0] of [[-140, 140], [140, -140], [-140, 140], [140, -140]]){
          await r.tween(720, p => { const y = a0 + (b0 - a0) * p; cd.style.top = (c.y + y) + 'px'; at(o, ox, c.y + y); const side = y > 0 ? 1 : -1; if(lastSide && side !== lastSide){ r.ripple(c.x, c.y); r.tone(260 + Math.random() * 120, 0, 0.12, 'triangle', 0.07); } lastSide = side; });
        }
        cd.style.top = c.y + 'px'; await done(cd, ln); return c;
      }
      if(g === 'pinch'){                                  // two fingers, spread open
        const o2 = r.orbOn(c.x + 14, c.y); at(o, c.x - 14, c.y); at(o2, c.x + 14, c.y); await r.wait(500); r.tone(300, 0, 1, 'sine', 0.05, 900);
        await r.tween(1000, p => { const d = 14 + 66 * p; at(o, c.x - d, c.y); at(o2, c.x + d, c.y); cd.style.transform = 'translate(-50%,-50%) scale(' + (1 + 0.25 * p) + ')'; });
        r.ripple(c.x, c.y, true); r.orbOff(o2); await r.wait(300); await done(cd); return c;
      }
      if(g === 'shake'){                                  // shake it like a polaroid
        await r.orbGo(o, c.x, c.y + 6, 1200); o.classList.add('down'); cd.style.transition = 'none';
        await r.tween(1800, p => { const x = 62 * Math.sin(p * Math.PI * 9); cd.style.transform = 'translate(calc(-50% + ' + x + 'px),-50%) rotate(' + (x * 0.12) + 'deg)'; at(o, c.x + x, c.y + 6); if(Math.abs(Math.sin(p * Math.PI * 9)) > 0.97) r.tone(500 + Math.random() * 200, 0, 0.05, 'triangle', 0.05); });
        o.classList.remove('down'); cd.style.transition = 'transform .45s cubic-bezier(.3,1.6,.5,1)'; cd.style.transform = 'translate(-50%,-50%) scale(1)'; await r.wait(550); await done(cd); return c;
      }
      if(g === 'beat'){                                   // five taps, keeping time
        await r.orbGo(o, px, py, 1200);
        for(let k = 0; k < 5; k++){ r.press(o, px, py, 520 + k * 50, k === 4); tap(cd); r.sparks(px, py - 10, 2, ['♪', '♫']); r.chip(220, 0.0, 0.08, 0.04); await r.wait(470); }
        await done(cd); return { x:px, y:py };
      }
      if(g === 'meet'){                                   // meet in the middle
        const sx = c.x + 62, sy = c.y + 46, mir = r.el('jr-mir b'); const orb2 = mir;
        await r.orbGo(o, sx, sy, 1200); o.classList.add('down'); at(mir, c.x * 2 - sx, c.y * 2 - sy); r.ripple(sx, sy);
        await r.nextFrame(); r.tone(250, 0, 1.6, 'sine', 0.05, 520);
        await r.tween(1700, p => { const e = p * p * (3 - 2 * p), x = sx + (c.x - sx) * e, y = sy + (c.y - sy) * e; at(o, x, y); at(mir, 2 * c.x - x, 2 * c.y - y); });
        r.flash(); r.ringAt(c.x, c.y, col('--gold-light'), 12); o.classList.remove('down'); await r.wait(400); r.fade(mir, 300); await done(cd); return c;
      }
      if(g === 'pump'){                                   // pump it up
        await r.orbGo(o, px, py, 1200);
        for(let k = 1; k <= 10; k++){ r.press(o, px, py, 420 + k * 40, k === 10); cd.style.transition = 'transform .08s'; cd.style.transform = 'translate(-50%,-50%) scale(' + (1 + k * 0.03) + ')'; r.later(() => { cd.style.transform = 'translate(-50%,-50%) scale(1)'; }, 120); r.sparks(px, py, 1, ['💪']); await r.wait(150); }
        await done(cd); return { x:px, y:py };
      }
      if(g === 'torch'){                                  // lights off: a torch, and keep very still
        const dk = r.el('jr-dark'); dk.style.setProperty('--x', px + 'px'); dk.style.setProperty('--y', py + 'px');
        await r.orbGo(o, px, py, 1200); o.classList.add('down'); await r.wait(350); dk.style.opacity = '1'; r.tone(60, 0, 2.4, 'sawtooth', 0.02, 70);
        await r.tween(2300, p => { const x = px + Math.sin(p * 9) * 10, y = py + Math.cos(p * 7) * 6; dk.style.setProperty('--x', x + 'px'); dk.style.setProperty('--y', y + 'px'); at(o, x, y); });
        o.classList.remove('down'); dk.style.opacity = '0'; await r.wait(420); await done(cd, dk); return { x:px, y:py };
      }
      if(g === 'star'){                                   // the last star appears; tap it
        const star = mk('je-star', '✦'); cd.appendChild(star); cd.style.overflow = 'visible';
        r.cap('a star appears once all the others are found'); await r.wait(900); star.classList.add('on'); r.bell(PENTA[5], 0, 0.1, 2); r.bell(PENTA[6], 0.1, 0.08, 2);
        await r.wait(1000); const sp = stageXY(r, star);
        await r.orbGo(o, sp.x, sp.y, 1200); r.press(o, sp.x, sp.y, 900, true); await r.wait(400); await done(cd); return sp;
      }
    }

    /* ---- gestures on a group of small cards ---- */
    if(g === 'order'){                                    // count the Christmases in order
      const minis = [], colors = ['#e0343c', '#f2c14e', '#3fa66a'];
      for(let i = 0; i < 3; i++){ const m = r.el('jr-mini', '🎄'); m.style.left = (W * (0.5 + (i - 1) * 0.25)) + 'px'; m.style.top = c.y + 'px'; m.insertAdjacentHTML('beforeend', '<small class="jr-num">' + (2023 + i) + '</small>'); minis.push(m); }
      await r.nextFrame(); minis.forEach((m, i) => r.later(() => m.classList.add('in'), i * 120)); await r.wait(1600);
      const hit = async (i, bauble) => { const mx = parseFloat(minis[i].style.left), my = parseFloat(minis[i].style.top); await r.orbGo(o, mx + 6, my + 8, 650); r.press(o, mx, my, 520 + i * 90, false);
        if(bauble){ const b = mk('jr-bauble'); b.style.background = colors[i]; minis[i].appendChild(b); minis[i].classList.add('hit'); r.sparks(mx, my - 20, 4, ['❄']); r.bell(PENTA[i + 2], 0, 0.08, 1.4); }
        else { minis[i].classList.remove('jr-nope'); void minis[i].offsetWidth; minis[i].classList.add('jr-nope'); r.tone(160, 0, 0.2, 'square', 0.05); } await r.wait(300); };
      await hit(2, false); r.cap('wrong order: it starts over'); await r.wait(500); r.cap(sc.cap);
      for(let i = 0; i < 3; i++) await hit(i, true);
      await r.wait(300); await done(...minis); return c;
    }
    if(g === 'candles'){                                  // light all eight candles, one long press each
      const minis = [];
      for(let i = 0; i < 8; i++){ const m = r.el('jr-mini', sc.glyph); m.style.left = (W * (0.5 + ((i % 4) - 1.5) * 0.19)) + 'px'; m.style.top = (c.y + (i < 4 ? -48 : 52)) + 'px'; minis.push(m); }
      await r.nextFrame(); minis.forEach((m, i) => r.later(() => m.classList.add('in'), i * 90)); await r.wait(1500);
      for(let i = 0; i < 8; i++){ const mx = parseFloat(minis[i].style.left), my = parseFloat(minis[i].style.top); await r.orbGo(o, mx + 5, my + 10, 320); o.classList.add('down');
        const fl = mk('je-flame'); minis[i].appendChild(fl); await r.nextFrame(); fl.classList.add('grow'); await r.wait(380); fl.classList.add('lit'); o.classList.remove('down'); r.bell(PENTA[i % 7] + 12, 0, 0.07, 1.2); r.sparks(mx, my - 24, 2, ['✦']); await r.wait(80); }
      await r.wait(500); await done(...minis); return c;
    }

    /* ---- gestures on the page itself ---- */
    if(g === 'strum'){                                    // hold the line, then run down it
      const ln = r.el('jr-line'); ln.style.left = (W / 2 - 1) + 'px'; ln.style.top = (H * 0.2) + 'px'; ln.style.height = (H * 0.56) + 'px'; const dots = [];
      for(let i = 0; i < 9; i++){ const d = r.el('jr-fdot'); d.style.left = (W / 2) + 'px'; d.style.top = (H * 0.2 + H * 0.56 * (i / 8)) + 'px'; dots.push([d, H * 0.2 + H * 0.56 * (i / 8)]); }
      await r.wait(1400); await r.orbGo(o, W / 2, H * 0.2 - 4, 1200); o.classList.add('down'); r.ripple(W / 2, H * 0.2); await r.wait(450);
      let lit = 0; r.tone(250, 0, 2.6, 'sine', 0.05, 1000);
      await r.tween(2600, p => { const y = H * 0.2 + H * 0.56 * p; at(o, W / 2, y); dots.forEach(([d, dy], i) => { if(i >= lit && y >= dy - 4){ lit = i + 1; d.classList.add('lit'); r.bell(PENTA[i % 7] + 12, 0, 0.06, 1.2); } }); });
      o.classList.remove('down'); await r.wait(300); await done(ln, ...dots.map(d => d[0])); return { x:W / 2, y:H * 0.3 };
    }
    if(g === 'push'){                                     // keep pushing at the end of the page
      const st = r.el('jr-stampbig'); st.style.top = (H * 0.5) + 'px'; st.style.setProperty('--s', '0.7'); st.innerHTML = '<b>3+</b><span>Years of Besties</span>';
      const el = r.el('jr-endline'); el.style.top = (H * 0.8) + 'px'; el.textContent = 'the end of the page';
      await r.nextFrame(); await r.wait(1500); await r.orbGo(o, W / 2, H * 0.9, 1200);
      for(let k = 0; k < 5; k++){ await r.orbGo(o, W / 2, H * 0.83, 260); r.press(o, W / 2, H * 0.82, 320 + k * 40); st.style.transition = 'transform .15s'; st.style.setProperty('--s', '0.78'); r.later(() => st.style.setProperty('--s', '0.7'), 170); r.sparks(W / 2, H * 0.78, 2, ['✦']); await r.orbGo(o, W / 2, H * 0.9, 300); await r.wait(100); }
      await done(st, el); return { x:W / 2, y:H * 0.5 };
    }
    if(g === 'dial'){                                     // wind the years
      const st = r.el('jr-stampbig'); st.style.top = (H * 0.46) + 'px'; st.style.setProperty('--s', '1'); st.innerHTML = '<b>3+</b><span>Years of Besties</span>';
      await r.nextFrame(); await r.wait(1500); const R0 = 62, cx = W / 2, cy = H * 0.46; await r.orbGo(o, cx + R0, cy, 1200); o.classList.add('down'); await r.wait(250);
      let years = 0; r.tone(150, 0, 3.6, 'sawtooth', 0.02, 320); st.style.transition = 'none';
      await r.tween(3600, p => { const a = p * 3.3 * 2 * Math.PI; at(o, cx + R0 * Math.cos(a), cy + R0 * Math.sin(a)); st.style.transform = 'translate(-50%,-50%) rotate(' + (a * 57.2958) + 'deg)'; const y = Math.floor(a / (2 * Math.PI)); if(y > years){ years = y; r.word(years >= 3 ? '3+ years' : '+1 year', cx, cy - 120, col('--gold-light')); r.ringAt(cx, cy, col('--gold-light'), 8); r.bell(PENTA[years + 2], 0, 0.1, 1.6); } });
      o.classList.remove('down'); st.style.transition = 'transform .6s cubic-bezier(.3,1.5,.5,1)'; st.style.transform = 'translate(-50%,-50%) rotate(0deg)'; await r.wait(700); await done(st); return { x:cx, y:cy };
    }
    return c;
  }

  async function scene(i){
    const r = R, sc = SCENES[i], key = sc.key, c = centre(r);
    K.music(sc.music || 'jm_groove'); r.cap(sc.cap);
    await r.wait(700);
    const anchor = await perform(r, sc);
    r.cap('');
    await JE.moments[key](r, anchor);
    await r.sweep(900);
    await hatch(i, c.x, c.y, key);
  }

  /* ------------------------------------------------------------------ finale: the sixteen become the line, the stamp comes down */
  async function finale(){
    const r = R, W = r.W(), H = r.H(), cx = W / 2, y0 = H * 0.17, y1 = H * 0.79, n = SCENES.length;
    K.music('jm_gather'); r.cap('sixteen secrets, one timeline');
    const ln = r.raw('jr-line'); ln.style.left = (cx - 1) + 'px'; ln.style.top = y0 + 'px'; ln.style.height = (y1 - y0) + 'px'; ln.style.opacity = '0'; ln.style.transition = 'opacity 1s';
    const fill = r.raw('jr-line'); fill.style.cssText += ';left:' + (cx - 1) + 'px;top:' + y0 + 'px;height:0;background:' + col('--gold-light') + ';box-shadow:0 0 12px ' + col('--gold-light') + ';opacity:1;z-index:57';
    const dots = [], eggs = [];
    slots.forEach(s => s.classList.remove('full')); tray.classList.remove('on');
    for(let i = 0; i < n; i++){
      const p = slotXY(i), y = y0 + (y1 - y0) * (i / (n - 1));
      const e = r.raw('jr-egg', '🥚'); e.style.left = p[0] + 'px'; e.style.top = p[1] + 'px'; e.style.fontSize = '.95rem'; eggs.push(e);
      const d = r.raw('jr-fdot'); d.style.left = cx + 'px'; d.style.top = y + 'px'; d.style.opacity = '0'; dots.push(d);
    }
    ln.style.opacity = '.55';
    for(let i = 0; i < n; i++){
      const y = y0 + (y1 - y0) * (i / (n - 1));
      await r.nextFrame(); eggs[i].style.fontSize = '1.5rem'; eggs[i].style.left = cx + 'px'; eggs[i].style.top = y + 'px';
      r.later(() => { eggs[i].remove(); dots[i].style.opacity = '1'; r.bell(PENTA[i % 7], 0, 0.07, 1.4); r.sparks(cx, y, 3, ['✦']); }, 1150);
      await r.wait(260);
    }
    await r.wait(1500);
    // eras down the side
    [['2022', 0], ['2023', 1], ['2024', 6], ['2025', 9], ['2026', 11]].forEach(([t, i], k) => { const e = r.raw('jr-era', t); e.style.left = (cx + 16) + 'px'; e.style.top = (y0 + (y1 - y0) * (i / (n - 1))) + 'px'; r.later(() => { e.style.opacity = '1'; }, k * 250); });
    r.cap('');
    // the spark runs down the whole line
    r.tone(200, 0, 3.6, 'sine', 0.06, 1100);
    await r.tween(3600, p => { fill.style.height = ((y1 - y0) * p) + 'px'; const idx = Math.floor(p * (n - 1) + 0.001); dots.forEach((d, i) => { if(i <= idx && !d.classList.contains('lit')){ d.classList.add('lit'); r.bell(PENTA[i % 7] + 12, 0, 0.06, 1.2); } }); });
    r.flash(); r.ringAt(cx, y1, col('--gold-light'), 24); [PENTA[0], PENTA[2], PENTA[4], PENTA[6]].forEach((m, i) => r.bell(m, i * 0.07, 0.12, 3));
    await r.wait(1400);
    r.fade([ln, fill, ...dots, ...[...r.stage.querySelectorAll('.jr-era')]], 1000);
    await r.wait(1200);
    // the stamp comes down
    const st = r.raw('jr-stampbig slam'); st.style.top = (H * 0.38) + 'px'; st.innerHTML = '<b>3+</b><span>Years of Besties</span>';
    r.tone(150, 0, 0.6, 'sine', 0.08, 800); await r.wait(420);
    r.flash(); r.quake(); r.thud(0.6, 90); r.noise(1.2, 0.14, 700, 4500); K.music('jm_blast', true);
    [62, 67, 71, 74, 79, 83].forEach((m, k) => r.bell(m, k * 0.06, 0.12, 3));
    r.sparks(cx, H * 0.38, 20, ['✦', '♡', '✨']); r.heartBurst(); r.confetti(); r.later(() => { r.confetti(); r.heartBurst(); }, 800);
    [0, 400, 900].forEach(d => r.later(() => r.ringAt(cx, H * 0.38, col('--gold-light'), 28), d));
    await r.wait(900);
    const odo = r.raw('', ''); odo.style.cssText = 'position:absolute;left:0;right:0;top:' + (H * 0.38 + Math.min(W * 0.27, 105) + 30) + 'px;z-index:60;text-align:center;font-family:Playfair Display,serif;font-weight:700;font-size:clamp(2.6rem,12vw,4.4rem);color:#fff3d6;text-shadow:0 0 20px ' + col('--gold') + ';font-variant-numeric:tabular-nums';
    const days = JE.util.daysSince(JE.util.FIRST_DM), small = r.raw('', 'days since our first hello'); small.style.cssText = 'position:absolute;left:0;right:0;top:' + (H * 0.38 + Math.min(W * 0.27, 105) + 30 + Math.min(W * 0.14, 60) + 14) + 'px;z-index:60;text-align:center;font-style:italic;font-size:1.05rem;color:#f3e6c8;opacity:0;transition:opacity 1s';
    await r.tween(3200, p => { odo.textContent = Math.round(days * (1 - Math.pow(1 - p, 4))).toLocaleString(); });
    small.style.opacity = '1'; r.bell(PENTA[4], 0, 0.1, 2.4);
    const ban = r.raw('jr-banner'); ban.style.setProperty('--bt', (H * 0.38 + Math.min(W * 0.27, 105) + 30 + Math.min(W * 0.14, 60) + 52) + 'px');
    'FOUND EVERY ONE'.split('').forEach((ch, i) => { const sp = document.createElement('span'); sp.textContent = ch === ' ' ? '\u00a0' : ch; sp.style.setProperty('--d', (0.1 + i * 0.06) + 's'); ban.appendChild(sp); });
    await r.wait(4200);
    // the note
    r.fade([st, odo, small, ban], 1300); K.music('jm_note');
    await r.wait(1700);
    const line = r.raw('jr-line2');
    for(const [txt, ms] of NOTE_LINES){ line.classList.remove('in'); await r.wait(900); line.textContent = txt; line.classList.add('in'); await r.wait(ms); }
    line.classList.remove('in'); await r.wait(800);
    const sig = r.raw('jr-sig', 'Bestie Tristan ♡'); await r.nextFrame(); sig.classList.add('in'); r.heartBurst();
    await r.wait(3600); r.fade(sig, 1200); await r.wait(1400);
  }

  async function show(){
    const r = R;
    r.sky.classList.add('on'); K.music('jm_intro');
    r.every(() => { const f = mk('jr-fall', ['❄', '❅', '•', '✦'][Math.floor(Math.random() * 4)]), fd = rnd(8, 14); f.style.left = rnd(0, 98) + '%'; f.style.fontSize = rnd(.7, 1.6) + 'rem'; f.style.setProperty('--sw', rnd(-70, 70) + 'px'); f.style.setProperty('--fr', rnd(-200, 200) + 'deg'); f.style.setProperty('--fd', fd + 's'); r.fx(f, fd * 1000 + 200); }, 1200);
    await r.wait(1200);
    tray.classList.add('on'); r.cap('sixteen little secrets, scattered along one very long timeline');
    await r.wait(3600); r.cap(''); await r.wait(500);
    if(OPTS.finaleOnly){ slots.forEach((sl, i) => { sl.classList.add('full'); sl.querySelector('i').textContent = JE.GLYPHS[SCENES[i].key]; }); }   // (testing) jump straight to the finale
    else for(let i = 0; i < SCENES.length; i++) await scene(i);
    if(!OPTS.scenesOnly) await finale();
  }

  /* ------------------------------------------------------------------ entry point */
  let OPTS = {};
  function play(o, next, opts){
    OPTS = opts || {};
    injectCSS(); JE.injectCSS();
    const root = mk('jr-root'); o.appendChild(root);
    const stage = mk('', null, root); stage.style.cssText = 'position:absolute;inset:0';
    const sky = mk('jr-sky', null, stage);
    for(let i = 0; i < 60; i++){ const s = mk('', null, sky), z = 1 + Math.random() * 2; s.style.cssText = 'position:absolute;border-radius:50%;background:#e8f0ff;opacity:.35;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;width:' + z + 'px;height:' + z + 'px'; }
    const r = K.createRun(stage); r.sky = sky; R = r;
    tray = mk('jr-tray', null, stage); slots = [];
    for(let i = 0; i < SCENES.length; i++){ const s = mk('jr-slot', null, tray); s.appendChild(document.createElement('i')).textContent = '🥚'; slots.push(s); }
    K.ac(); K.unmute();
    let hint = null, skipped = false;
    const unlock = () => { K.ac(); if(hint){ hint.remove(); hint = null; } };
    const onKey = e => { if(e.key === 'Escape'){ skipped = true; r.abort(); } else unlock(); };
    document.addEventListener('pointerdown', unlock); document.addEventListener('keydown', onKey);
    setTimeout(() => { if(!K.audioReady() && !r.dead){ hint = mk('jr-snd', 'tap for sound ♪', root); } }, 700);
    (async () => {
      try{ await show(); }catch(e){ if(e !== DEAD) console.warn('[journey-reel]', e); }
      document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', onKey);
      if(hint){ hint.remove(); hint = null; }
      r.abort();
      if(skipped){
        [...stage.children].forEach(n => { if(n !== sky) n.remove(); });
        try{ window.launchConfetti(); window.launchHeartBurst(); }catch(e){}
        await new Promise(res => setTimeout(res, 900));
      }
      K.stopMusic(1.4); root.style.opacity = '0';
      setTimeout(() => { root.remove(); if(R === r) R = null; next(); }, 950);
    })();
  }

  window.JourneyReel = { play, SCENES };
})();
