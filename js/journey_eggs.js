/* ==========================================================================
   journey_eggs.js - the 16 easter eggs on the Our Journey page (our_journey.html), each with its own full-screen moment.
   Needs fx_kit.js (and eggs.js on the page itself). The home page loads this file too, because the Prestige reel replays the moments.

   JourneyEggs.moments[key](run, anchor)   the payoff animation. anchor = {x,y} where on screen it was triggered.
   JourneyEggs.play(key, anchor, done)     plays a moment on the themed full-screen layer (Esc / click skips), then done().
   JourneyEggs.init()                      binds the triggers to the real timeline cards (only call on our_journey.html).
   JourneyEggs.MSG / NAMES / KEYS / GLYPHS / util   used by the page, by eggs.js's list, and by the reel.

   HOW EACH ONE IS FOUND (cards are matched by their text, so re-ordering the timeline is safe):
     nest       tap the "Nest" card 3 times            hello    press and hold the "15 Jan 2023" card
     call       double-tap the "very first call" card  birthday tap 5 different birthday cards
     bus        tap the dot beside "Bus Sim 18"        glasses  tap the glasses card 4 times
     face       tap the face-reveal card 5 times       phasmo   press and hold the Phasmo card
     christmas  tap all 3 Christmas cards              stardew  double-tap the Stardew Concerts card
     insync     tap the INSYNC card 3 times            protein  tap the Protein Business card twice
     spine      tap the line between cards 3 times     capsule  rest at the very bottom for 8 seconds
     days       tap the "3+" stamp 3 times             tbc      tap "The rest of it" (only works once the other 15 are found)
   Colours come from the active theme (K.col), so Winter/Christmas restyle them. Edit MSG below to change what each one says.
   ========================================================================== */
(function(){
  'use strict';
  const K = window.FxKit, DEAD = K.DEAD, mk = K.mk, rnd = K.rnd, col = K.col;
  const PENTA = [79, 81, 83, 86, 88, 91, 93];            // G major pentatonic, for little pops and bells
  const KEYS = ['nest', 'hello', 'call', 'birthday', 'bus', 'glasses', 'face', 'phasmo', 'christmas', 'stardew', 'insync', 'protein', 'spine', 'capsule', 'days', 'tbc'];
  const GLYPHS = { nest:'🪺', hello:'💬', call:'📞', birthday:'🎂', bus:'🚌', glasses:'👓', face:'📸', phasmo:'👻', christmas:'🎄', stardew:'🎸', insync:'〰️', protein:'💪', spine:'✨', capsule:'⏳', days:'🔢', tbc:'🚂' };
  const FIRST_DM = new Date(2023, 0, 15), FIRST_CALL = new Date(2023, 0, 28);
  const daysSince = d => Math.floor((Date.now() - d.getTime()) / 86400000);
  function nextAnnBirthday(){
    const n = new Date(), today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    let d = new Date(n.getFullYear(), 7, 5); if(d < today) d = new Date(n.getFullYear() + 1, 7, 5);
    return { date:d, days:Math.round((d - today) / 86400000), label:'5 Aug ' + d.getFullYear() };
  }
  const fmtClock = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60, p = n => String(n).padStart(2, '0'); return p(h) + ':' + p(m) + ':' + p(x); };

  /* what each egg says when its moment ends (Tristan's voice) */
  const MSG = {
    nest:      { title:'Where it all began', text:'Three taps on a nest. You turned up in the Nest in November 2022, we started chatting, and somehow that turned into this entire website.' },
    hello:     { title:'First hello', text:'15 January 2023. You said hello and I said hello back, and neither of us had any idea how much was about to get rearranged around that one message.' },
    call:      { title:'Call me maybe', text:'The very first call was 28 January 2023. I do not think either of us has properly hung up since.' },
    birthday:  { title:'Eight candles', text:'Four of yours, four of mine. Eight birthdays so far, and I have enjoyed every single one more than the cake.' },
    bus:       { title:'Next stop: bestie', text:'Bus Sim 18, 3 July 2023. Of all the people to ride a very slow virtual bus with, there was only ever one answer.' },
    glasses:   { title:'Sharper', text:'I got glasses on 9 August 2023 and the world got a lot clearer. The best thing in it was still you.' },
    face:      { title:'The official reveal', text:'October 2024. A very big moment for a fairly small amount of face. Thank you for being so nice about it.' },
    phasmo:    { title:'EMF level 5', text:'March 2024, your first ever Phasmo round. You were braver than you think. I was also scared. We will not be taking questions.' },
    christmas: { title:'Under the tree', text:'Three Christmases, three parcels, and a dishrack drainer I will never let anyone forget. A tradition was born and neither of us noticed.' },
    stardew:   { title:'Pixel concert', text:'February and March 2026: some of my favourite evenings on the entire internet were spent at a concert on a farm, with you.' },
    insync:    { title:'Insync', text:'Unhinged Era, INSYNC Era. Two completely different people keep arriving at the exact same thought at the exact same time. It is frankly a bit suspicious.' },
    protein:   { title:'A new business avenue', text:'19 August 2026. We have no idea what we are doing, and the numbers on that graph are completely made up, and I believe in us entirely.' },
    spine:     { title:'Every moment', text:'You tapped the line that holds every moment together, and it lit up all of them. Which is honestly how it feels.' },
    capsule:   { title: 'Time capsule', text:'You waited at the bottom of the page for something to happen, and it did: there is a lot of future still waiting, and I fully intend to spend it with you.' },
    days:      { title:'Counting', text:'That is how many days it has been since our first hello. I did the maths so you would not have to. It went up while you were reading this.' },
    tbc:       { title:'To be continued', text:'You found all of the rest, so here is the last one: there is no last one. More birthdays, more Christmases, more calls, more postcards. To be continued, for a very long time.' }
  };
  const NAMES = { nest:'Where it all began', hello:'First hello', call:'Call me maybe', birthday:'Eight candles', bus:'Next stop: bestie', glasses:'Sharper', face:'The official reveal', phasmo:'EMF level 5', christmas:'Under the tree', stardew:'Pixel concert', insync:'Insync', protein:'A new business avenue', spine:'Every moment', capsule:'Time capsule', days:'Counting', tbc:'To be continued' };

  /* ------------------------------------------------------------------ styles */
  const CSS = `
.je-nest{position:absolute;z-index:40;transform:translate(-50%,-50%) scale(0);transition:transform .7s cubic-bezier(.34,1.6,.5,1)}
.je-nest.in{transform:translate(-50%,-50%) scale(1)}
.je-nest.wob .je-e{animation:jeWob .5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
.je-nest .je-e:nth-child(2){animation-delay:.12s}.je-nest .je-e:nth-child(3){animation-delay:.24s}
@keyframes jeWob{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
.je-chat{position:absolute;left:50%;top:12%;z-index:45;width:min(88vw,340px);transform:translateX(-50%);display:flex;flex-direction:column;gap:.4rem}
.je-b{max-width:78%;padding:.4rem .8rem;border-radius:1.1rem;font-size:1.02rem;line-height:1.25;color:#2b1a0c;animation:jeBub .3s cubic-bezier(.3,1.8,.5,1)}
@keyframes jeBub{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
.je-b.l{align-self:flex-start;background:var(--paper,#fffdf5);border-bottom-left-radius:.3rem}
.je-b.r{align-self:flex-end;background:color-mix(in srgb,var(--gold-light,#e8b95a) 85%,#fff);border-bottom-right-radius:.3rem}
.je-b.d{align-self:center;background:none;color:#f3e6c8;font-style:italic;font-size:.9rem}
.je-b.out{opacity:0;transition:opacity .4s}
.je-notif{position:absolute;left:50%;z-index:45;width:min(88vw,360px);display:flex;align-items:center;gap:.7rem;padding:.65rem .8rem;border-radius:1.1rem;background:rgba(250,244,232,.94);color:#2b1a0c;box-shadow:0 8px 24px rgba(0,0,0,.4);transform:translateX(-50%) translateY(-30px) scale(.9) rotate(var(--rot,0deg));opacity:0;transition:transform .35s cubic-bezier(.3,1.5,.5,1),opacity .3s}
.je-notif.in{opacity:1;transform:translateX(-50%) translateY(0) scale(1) rotate(var(--rot,0deg))}
.je-notif i{font-style:normal;width:2.2rem;height:2.2rem;border-radius:.6rem;background:linear-gradient(135deg,var(--rose,#b86858),var(--gold,#c8943a));color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex:none}
.je-notif div{flex:1;min-width:0}.je-notif b{display:block;font-size:.95rem}.je-notif span{display:block;font-size:.88rem;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.je-notif em{font-size:.72rem;opacity:.55;font-style:normal;flex:none}
.je-notif.big{padding:.9rem 1rem}.je-notif.big span{font-size:1.15rem;opacity:1}
.je-badge{position:absolute;right:7vw;top:6%;z-index:50;min-width:3.2rem;height:3.2rem;padding:0 .7rem;border-radius:1.6rem;background:#e04848;color:#fff;font-weight:700;font-size:1.35rem;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.4);transform:scale(0);transition:transform .4s cubic-bezier(.3,1.8,.5,1)}
.je-badge.in{transform:scale(1)}
.je-phone{position:absolute;left:50%;top:48%;z-index:40;width:min(76vw,290px);aspect-ratio:9/16.5;border-radius:34px;background:linear-gradient(#241a14,#0d0806);border:1px solid color-mix(in srgb,var(--gold-light,#e8b95a) 40%,transparent);box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px color-mix(in srgb,var(--gold,#c8943a) 25%,transparent);transform:translate(-50%,-50%) scale(.6);opacity:0;transition:transform .6s cubic-bezier(.34,1.5,.5,1),opacity .4s;color:#f3e6c8;text-align:center}
.je-phone.in{transform:translate(-50%,-50%) scale(1);opacity:1}
.je-av{position:absolute;left:50%;top:15%;width:34%;aspect-ratio:1;border-radius:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--rose,#b86858),var(--gold,#c8943a));display:flex;align-items:center;justify-content:center;font-size:2.4rem;color:#fff}
.je-pn{position:absolute;left:0;right:0;top:46%;font-family:'Playfair Display',serif;font-size:1.35rem}
.je-ps{position:absolute;left:0;right:0;top:55%;font-size:.95rem;opacity:.75;letter-spacing:.05em}
.je-wv{position:absolute;left:0;right:0;top:64%;height:2.6rem;display:flex;align-items:center;justify-content:center;gap:5px}
.je-wv i{display:block;width:5px;height:6px;border-radius:3px;background:var(--gold-light,#e8b95a);opacity:.9}
.je-acc{position:absolute;left:50%;bottom:7%;width:3.6rem;height:3.6rem;margin-left:-1.8rem;border-radius:50%;background:#3fae5a;display:flex;align-items:center;justify-content:center;font-size:1.5rem;animation:jePulse .7s ease-in-out infinite alternate}
@keyframes jePulse{from{transform:scale(1);box-shadow:0 0 0 0 rgba(63,174,90,.6)}to{transform:scale(1.1);box-shadow:0 0 0 14px rgba(63,174,90,0)}}
.je-cake{position:absolute;z-index:40;width:min(40vw,165px);transform:translate(-50%,-50%) scale(0);transition:transform .6s cubic-bezier(.34,1.6,.5,1)}
.je-cake.in{transform:translate(-50%,-50%) scale(1)}
.je-candles{display:flex;justify-content:space-around;align-items:flex-end;height:4.2rem;padding:0 .35rem}
.je-candle{position:relative;width:.75rem;height:1.7rem;border-radius:2px;background:repeating-linear-gradient(135deg,#fff 0 4px,var(--rose,#b86858) 4px 8px)}
.je-candle u{position:absolute;left:50%;top:-1.05rem;width:.62rem;height:.95rem;margin-left:-.31rem;border-radius:50% 50% 50% 50%/65% 65% 35% 35%;background:radial-gradient(circle at 50% 70%,#fff6c8,#ffb830 60%,rgba(255,120,30,.2));box-shadow:0 0 14px 4px rgba(255,190,70,.55);opacity:0;transform:scale(.2);transition:opacity .2s,transform .3s}
.je-candle.lit u{opacity:1;transform:scale(1);animation:jeFlick .18s ease-in-out infinite alternate}
@keyframes jeFlick{from{transform:scale(1) skewX(-4deg)}to{transform:scale(.92,1.08) skewX(4deg)}}
.je-candle small{position:absolute;top:1.85rem;left:50%;transform:translateX(-50%);font-size:.6rem;color:#f3e6c8;white-space:nowrap}
.je-tier{height:3.4rem;margin-top:1.1rem;border-radius:.5rem .5rem .8rem .8rem;background:linear-gradient(var(--c2),var(--c2) .8rem,var(--c1) .8rem);box-shadow:0 8px 20px rgba(0,0,0,.4)}
.je-lbl{margin-top:.5rem;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:1.25rem;color:#fff3d6}
.je-smoke{position:absolute;z-index:46;font-size:1.3rem;opacity:0;animation:jeSmoke 1.4s ease-out forwards}
@keyframes jeSmoke{0%{opacity:.8;transform:translate(0,0) scale(.5)}100%{opacity:0;transform:translate(var(--dx),-70px) scale(1.5)}}
.je-bus{position:absolute;left:0;top:0;z-index:40;width:100%;height:100%;pointer-events:none}
.je-road{position:absolute;left:0;right:0;top:calc(var(--ry) + 3.2rem);height:5px;background:repeating-linear-gradient(90deg,#f3e6c8 0 28px,transparent 28px 56px);opacity:.55}
.je-vehicle{position:absolute;top:var(--ry);transform:translate(-50%,-50%);text-align:center}
.je-vehicle em{display:block;font-style:normal;font-size:5.4rem;line-height:1;filter:drop-shadow(0 8px 10px rgba(0,0,0,.5))}
.je-led{display:inline-block;margin-bottom:.4rem;padding:.25rem .8rem;border-radius:.4rem;background:#100a04;color:#ffb830;font-family:'Courier New',monospace;font-weight:700;font-size:.95rem;letter-spacing:.12em;text-shadow:0 0 8px #ff9a00;white-space:nowrap;border:1px solid #3a2a10}
.je-world{position:absolute;inset:0;z-index:30;filter:blur(11px);transition:filter 1s ease-out}
.je-world.sharp{filter:blur(0)}
.je-world b{position:absolute;border-radius:50%}
.je-gl{position:absolute;left:50%;z-index:60;width:min(62vw,230px);transform:translate(-50%,-50%);transition:top .9s cubic-bezier(.3,1.7,.5,1);filter:drop-shadow(0 8px 10px rgba(0,0,0,.4))}
.je-curt{position:absolute;top:0;bottom:0;width:51%;z-index:55;background:linear-gradient(90deg,color-mix(in srgb,var(--rose,#b86858) 70%,#2a0a0a),color-mix(in srgb,var(--rose,#b86858) 90%,#000));box-shadow:0 0 40px rgba(0,0,0,.6);transition:transform 1.4s cubic-bezier(.6,0,.3,1)}
.je-curt.l{left:0}.je-curt.r{right:0}
.je-curt.l.open{transform:translateX(-102%)}.je-curt.r.open{transform:translateX(102%)}
.je-spot{position:absolute;inset:0;z-index:35;background:radial-gradient(ellipse 38% 46% at 50% 46%,rgba(255,244,214,.5),transparent 70%);opacity:0;transition:opacity 1s}
.je-spot.on{opacity:1}
.je-pol{position:absolute;left:50%;top:46%;z-index:48;width:min(60vw,230px);padding:12px 12px 44px;background:var(--paper,#fffdf5);box-shadow:0 14px 40px rgba(0,0,0,.55);transform:translate(-50%,-50%) rotate(-3deg) scale(.6);opacity:0;transition:transform .7s cubic-bezier(.3,1.5,.5,1),opacity .5s}
.je-pol.in{transform:translate(-50%,-50%) rotate(-3deg) scale(1);opacity:1}
.je-pic{aspect-ratio:1;background:radial-gradient(circle at 50% 40%,var(--cream,#faf4e8),var(--warm,#f0ddb8));display:flex;align-items:center;justify-content:center;font-size:5.6rem;filter:brightness(0) blur(7px);transition:filter 2.6s ease-out}
.je-pic.dev{filter:none}
.je-cap2{position:absolute;left:0;right:0;bottom:8px;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:1.6rem;color:var(--brown,#7a5230)}
.je-dark{position:absolute;inset:0;z-index:50;background:#000;pointer-events:none;-webkit-mask-image:radial-gradient(circle 118px at var(--x) var(--y),transparent 0,transparent 55%,#000 100%);mask-image:radial-gradient(circle 118px at var(--x) var(--y),transparent 0,transparent 55%,#000 100%);transition:opacity .7s}
.je-ghost{position:absolute;z-index:42;font-size:3.6rem;line-height:1;transform:translate(-50%,-50%);opacity:0;filter:drop-shadow(0 0 16px rgba(200,230,255,.7))}
.je-emf{position:absolute;left:50%;bottom:11%;z-index:60;transform:translateX(-50%);display:flex;gap:.45rem;padding:.55rem .8rem;border-radius:.6rem;background:#0c0806;border:1px solid #3a2a1a}
.je-emf i{width:1.35rem;height:1.35rem;border-radius:50%;background:#2a2218;transition:background .1s,box-shadow .1s}
.je-emf i.on{box-shadow:0 0 14px currentColor}
.je-emf i:nth-child(1),.je-emf i:nth-child(2){color:#3fd26a}.je-emf i:nth-child(3){color:#f0d23a}.je-emf i:nth-child(4){color:#f09a2a}.je-emf i:nth-child(5){color:#ee3b3b}
.je-emf i.on{background:currentColor}
.je-tree{position:absolute;left:50%;z-index:40;transform:translate(-50%,-50%) scale(0);transition:transform .8s cubic-bezier(.34,1.5,.5,1)}
.je-tree.in{transform:translate(-50%,-50%) scale(1)}
.je-orn{animation:jeTw 1.2s ease-in-out infinite alternate}
@keyframes jeTw{from{opacity:.45}to{opacity:1}}
.je-gift{position:absolute;z-index:44;width:3.6rem;height:3.2rem;transform:translate(-50%,-50%);opacity:0;transition:top .7s cubic-bezier(.4,1.8,.6,1),opacity .2s;border-radius:.2rem;box-shadow:0 5px 12px rgba(0,0,0,.4)}
.je-gift::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:.55rem;margin-left:-.275rem;background:rgba(255,236,160,.92)}
.je-gift::after{content:'';position:absolute;left:0;right:0;top:50%;height:.55rem;margin-top:-.275rem;background:rgba(255,236,160,.92)}
.je-gift.dashed{background:none!important;border:2px dashed rgba(255,236,160,.8);box-shadow:none}
.je-gift.dashed::before,.je-gift.dashed::after{display:none}
.je-gt{position:absolute;z-index:46;transform:translate(-50%,0);font-family:'Caveat',cursive;font-weight:700;font-size:1.15rem;color:#fff3d6;text-align:center;line-height:1.05;opacity:0;transition:opacity .5s;text-shadow:0 2px 6px rgba(0,0,0,.6)}
.je-gt small{display:block;font-family:'EB Garamond',serif;font-weight:400;font-style:italic;font-size:.74rem;opacity:.85}
.je-flake{position:absolute;top:-2rem;z-index:41;color:#fff;pointer-events:none;animation:jeFlake var(--fd) linear forwards}
@keyframes jeFlake{to{transform:translate(var(--sw),112vh) rotate(var(--fr))}}
.je-stage{position:absolute;left:8%;right:8%;top:var(--sy);height:2.4rem;z-index:38;border-radius:.4rem .4rem 0 0;background:repeating-linear-gradient(90deg,#8a5a2e 0 22px,#7a4c24 22px 24px);border-top:5px solid #b8864a;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.je-act{position:absolute;z-index:42;transform:translate(-50%,-100%);font-size:3rem;line-height:1;animation:jeBounce .46s ease-in-out infinite alternate}
@keyframes jeBounce{from{transform:translate(-50%,-100%)}to{transform:translate(-50%,-112%)}}
.je-crowd{position:absolute;z-index:43;font-size:1.9rem;line-height:1;transform:translate(-50%,-100%);animation:jeBounce .55s ease-in-out infinite alternate}
.je-beam{position:absolute;top:0;z-index:36;width:44vw;height:var(--sy);margin-left:-22vw;transform-origin:50% 0;background:linear-gradient(rgba(255,244,200,.55),transparent);clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);animation:jeSw 1.6s ease-in-out infinite alternate;mix-blend-mode:screen}
@keyframes jeSw{from{transform:rotate(-24deg)}to{transform:rotate(24deg)}}
.je-svg{position:absolute;left:50%;top:44%;z-index:40;transform:translate(-50%,-50%);width:min(90vw,440px);overflow:visible}
.je-deck{position:absolute;left:50%;top:46%;z-index:40;width:min(90vw,400px);aspect-ratio:16/11;padding:1rem 1.1rem;background:var(--paper,#fffdf5);color:var(--deep,#3a2010);border:1px solid var(--tan,#d4b483);box-shadow:7px 7px 0 var(--brown,#7a5230);transform:translate(-50%,-50%) scale(.6) rotate(-3deg);opacity:0;transition:transform .6s cubic-bezier(.34,1.5,.5,1),opacity .4s}
.je-deck.in{transform:translate(-50%,-50%) scale(1) rotate(0);opacity:1}
.je-deck h4{font-family:'Playfair Display',serif;font-size:1.25rem;letter-spacing:.04em}
.je-deck h4 small{font-family:'Caveat',cursive;font-size:1rem;color:var(--rose,#b86858);margin-left:.4rem;font-weight:400}
.je-bars{position:absolute;left:1.2rem;right:1.2rem;bottom:2.6rem;top:3.4rem;display:flex;align-items:flex-end;gap:.55rem}
.je-bars i{flex:1;height:0;background:linear-gradient(var(--gold,#c8943a),var(--rose,#b86858));transition:height .9s cubic-bezier(.3,1.3,.5,1)}
.je-ticker{position:absolute;left:1.2rem;bottom:.6rem;font-family:'Courier New',monospace;font-weight:700;font-size:.95rem;color:#2f8a4a}
.je-pr{position:absolute;z-index:56;pointer-events:none;font-size:1.7rem;top:-2rem;animation:jeFlake var(--fd) linear forwards}
.je-cap-svg{position:absolute;left:50%;top:44%;z-index:40;transform:translate(-50%,-50%) scale(.5);opacity:0;width:min(46vw,190px);transition:transform .8s cubic-bezier(.34,1.5,.5,1),opacity .5s}
.je-cap-svg.in{transform:translate(-50%,-50%) scale(1);opacity:1}
.je-cap-svg.wob{animation:jeCapWob .5s ease-in-out 3}
@keyframes jeCapWob{0%,100%{transform:translate(-50%,-50%) rotate(0)}25%{transform:translate(-50%,-50%) rotate(-5deg)}75%{transform:translate(-50%,-50%) rotate(5deg)}}
.je-odo{position:absolute;left:0;right:0;z-index:60;text-align:center;font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(4rem,19vw,7.4rem);line-height:1;color:#fff3d6;text-shadow:0 0 24px color-mix(in srgb,var(--gold,#c8943a) 70%,transparent);font-variant-numeric:tabular-nums}
.je-train{position:absolute;z-index:44;font-size:2.4rem;line-height:1;transform:translate(-50%,-50%)}
.je-train.c{width:3.1rem;height:3.1rem;border-radius:.7rem;background:var(--paper,#fffdf5);border:2px solid var(--gold,#c8943a);display:flex;align-items:center;justify-content:center;font-size:1.6rem}
.je-end{position:absolute;left:0;right:0;z-index:60;text-align:center;font-family:'Courier New',monospace;font-weight:700;font-size:clamp(1.5rem,7vw,2.6rem);letter-spacing:.08em;color:#fff3d6;text-shadow:0 0 14px rgba(255,200,120,.6)}
.je-end u{display:inline-block;width:.5em;height:1em;margin-left:.1em;background:#ffb830;vertical-align:-.12em;text-decoration:none;animation:jeCur .8s steps(1) infinite}
@keyframes jeCur{50%{opacity:0}}
`;
  let cssDone = false;
  function injectCSS(){ if(cssDone) return; cssDone = true; const st = document.createElement('style'); st.id = 'je-css'; st.textContent = CSS; document.head.appendChild(st); }
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(k => n.setAttribute(k, attrs[k])); return n; };
  const center = r => ({ x:r.W() / 2, y:r.H() * 0.46 });
  const place = (e, x, y) => { e.style.left = x + 'px'; e.style.top = y + 'px'; return e; };
  const flakes = r => r.every(() => { const f = mk('je-flake', ['❄', '❅', '•'][Math.floor(Math.random() * 3)]), fd = rnd(5, 9); f.style.left = rnd(0, 98) + '%'; f.style.fontSize = rnd(.8, 1.7) + 'rem'; f.style.opacity = rnd(.5, .95); f.style.setProperty('--sw', rnd(-80, 80) + 'px'); f.style.setProperty('--fr', rnd(-200, 200) + 'deg'); f.style.setProperty('--fd', fd + 's'); r.fx(f, fd * 1000 + 200); }, 130);

  /* ------------------------------------------------------------------ the sixteen moments */
  const moments = {

    // 1 - the Nest: a chat that gets faster and faster, in a nest of eggs
    async nest(r){
      const W = r.W(), H = r.H(), cx = W / 2, sz = Math.min(W * 0.66, 250);
      const nest = r.el('je-nest'); nest.style.cssText += 'left:' + cx + 'px;top:' + H * 0.68 + 'px;width:' + sz + 'px;height:' + sz * 0.6 + 'px';
      const tw = (n, y0, y1) => { let s = ''; for(let i = 0; i < n; i++){ const t = rnd(0, 6.28), x = 100 + Math.cos(t) * rnd(30, 84), y = rnd(y0, y1); s += '<line x1="' + (x - 15).toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + (x + 15).toFixed(1) + '" y2="' + (y + rnd(-6, 6)).toFixed(1) + '" stroke="' + ['#8a6238', '#a47a48', '#6e4c2a', '#b8915c'][i % 4] + '" stroke-width="' + rnd(2, 3.6).toFixed(1) + '" stroke-linecap="round" transform="rotate(' + rnd(-35, 35).toFixed(0) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')"/>'; } return s; };
      nest.innerHTML = '<svg viewBox="0 0 200 120" width="100%" height="100%" style="overflow:visible"><ellipse cx="100" cy="84" rx="88" ry="30" fill="#4e3319"/>' + tw(30, 60, 90) +
        '<g><ellipse class="je-e" cx="78" cy="68" rx="17" ry="22" fill="#fff8e8" stroke="#d9c7a0"/><ellipse class="je-e" cx="104" cy="62" rx="17" ry="22" fill="#fff8e8" stroke="#d9c7a0"/><ellipse class="je-e" cx="128" cy="70" rx="17" ry="22" fill="#fff8e8" stroke="#d9c7a0"/></g>' + tw(34, 84, 104) + '</svg>';
      await r.nextFrame(); nest.classList.add('in'); r.bell(PENTA[0], 0, 0.1, 2);
      const chat = r.el('je-chat');
      const say = (side, txt) => { const b = mk('je-b ' + side, txt); chat.appendChild(b); while(chat.children.length > 6){ chat.firstChild.remove(); } r.bell(PENTA[Math.floor(rnd(0, 7))], 0, 0.05, 1); r.tone(side === 'l' ? 700 : 900, 0, 0.05, 'triangle', 0.04); };
      await r.wait(900);
      const slow = [['l', 'hi?'], ['r', 'hello!'], ['l', 'what are you up to'], ['r', 'not much, you?'], ['l', 'same'], ['r', 'want to keep chatting?'], ['l', 'yeah']];
      for(let i = 0; i < slow.length; i++){ say(slow[i][0], slow[i][1]); if(i === 4) nest.classList.add('wob'); await r.wait(Math.max(380, 1100 - i * 120)); }
      say('d', '(a few hundred messages later)'); await r.wait(900);
      const fast = ['lol', 'wait what', 'no way', 'send it', 'omg', 'one sec', 'hahaha', 'look!!', 'I cannot', 'anyway', 'so', 'and then'];
      for(let i = 0; i < fast.length; i++){ say(i % 2 ? 'r' : 'l', fast[i]); await r.wait(170); }
      r.cap('and eventually, we started having conversations in there');
      await r.wait(1600);
      r.flash(); r.heartBurst(); r.hearts(cx, H * 0.6, 16); [0, 0.1, 0.2, 0.3].forEach((d, i) => r.bell(PENTA[i + 2], d, 0.1, 2.4));
      await r.wait(3200); r.cap('');
    },

    // 2 - the first hello: one notification, then a lifetime of them
    async hello(r){
      const W = r.W(), H = r.H();
      const notif = (title, body, time, big, y) => { const n = r.el('je-notif' + (big ? ' big' : '')); n.innerHTML = '<i>♡</i><div><b>' + title + '</b><span>' + body + '</span></div><em>' + time + '</em>'; n.style.top = y + 'px'; return n; };
      await r.wait(500);
      const first = notif('Tristan', 'hello', '15 Jan 2023', true, H * 0.22);
      await r.nextFrame(); first.classList.add('in'); r.bell(PENTA[3], 0, 0.14, 2.5); r.bell(PENTA[3] + 12, 0.08, 0.08, 2);
      await r.wait(2400);
      const badge = r.el('je-badge', '1'); await r.nextFrame(); badge.classList.add('in');
      const texts = ['you there?', 'lol', 'look at this', 'one sec', 'did you see that', 'haha', 'guess what', 'hello again', 'wait', 'you will not believe this', 'ok but listen'];
      let count = 1;
      const flood = r.every(() => { count = Math.min(999, count + Math.floor(rnd(12, 40))); badge.textContent = count >= 999 ? '999+' : count; }, 90);
      for(let i = 0; i < 26; i++){
        const n = notif(i % 2 ? 'Ann' : 'Tristan', texts[i % texts.length], 'now', false, H * (0.2 + (i % 8) * 0.07) + rnd(-8, 8));
        n.style.setProperty('--rot', rnd(-3, 3) + 'deg'); await r.nextFrame(); n.classList.add('in');
        r.bell(PENTA[i % 7] + 12, 0, 0.045, 1); r.later(() => r.fade(n, 500), 1100);
        await r.wait(140);
      }
      r.stopEvery(flood); badge.textContent = '999+';
      r.fade(first, 500);
      await r.wait(900);
      r.big('15 Jan 2023', '38%', 'clamp(3rem,13vw,5.6rem)', 0.1); r.sub('the very first hello', 'calc(38% + clamp(3.8rem,15vw,6.8rem))', 1);
      r.heartBurst(); [0, 0.1, 0.2].forEach((d, i) => r.bell(PENTA[i + 3], d, 0.12, 2.6));
      await r.wait(3800);
    },

    // 3 - the first call: it rings, you pick up, and the timer never stops
    async call(r){
      const W = r.W(), H = r.H();
      const ph = r.el('je-phone');
      ph.innerHTML = '<div class="je-av">♡</div><div class="je-pn">Bestie ♡</div><div class="je-ps">incoming call…</div><div class="je-wv"></div><div class="je-acc">📞</div>';
      const bars = []; const wv = ph.querySelector('.je-wv'); for(let i = 0; i < 11; i++){ const b = document.createElement('i'); wv.appendChild(b); bars.push(b); }
      await r.nextFrame(); ph.classList.add('in'); await r.wait(900);
      const pr = ph.getBoundingClientRect(), sr = r.stage.getBoundingClientRect(), ax = pr.left - sr.left + pr.width / 2, ay = pr.top - sr.top + pr.height * 0.32;
      for(let k = 0; k < 3; k++){
        [880, 660, 880, 660].forEach((f, i) => r.tone(f, i * 0.16, 0.12, 'sine', 0.1));
        r.ringAt(ax, ay, col('--gold-light'), 8); r.later(() => r.ringAt(ax, ay, col('--gold-light'), 8), 300);
        await r.wait(1300);
      }
      r.flash(); ph.querySelector('.je-acc').remove(); r.bell(PENTA[2], 0, 0.14, 2.4);
      const st = ph.querySelector('.je-ps'); r.cap('28 January 2023');
      const maxS = daysSince(FIRST_CALL) * 86400;
      await r.tween(6200, p => {
        const v = Math.exp(p * Math.log(maxS)), days = v / 86400;
        st.textContent = days >= 2 ? Math.floor(days).toLocaleString() + ' days' : fmtClock(v);
        bars.forEach((b, i) => { b.style.height = (6 + Math.abs(Math.sin(p * 40 + i * 1.3)) * (10 + 22 * Math.abs(Math.sin(p * 9 + i)))) + 'px'; });
      });
      st.textContent = daysSince(FIRST_CALL).toLocaleString() + ' days';
      r.cap('');
      r.big('still on the call', '84%', 'clamp(2.2rem,9.4vw,4rem)', 0.1); r.sub('the very first of many', 'calc(84% + clamp(2.8rem,11vw,4.8rem))', 1);
      r.heartBurst(); r.hearts(W / 2, H * 0.46, 14);
      await r.wait(3800);
    },

    // 4 - birthdays: eight candles, four each, then one wish
    async birthday(r){
      const W = r.W(), H = r.H(), y = H * 0.56, lx = W * 0.27, rx = W * 0.73;
      const mkCake = (x, label, c1, c2) => {
        const k = r.el('je-cake'); k.style.setProperty('--c1', c1); k.style.setProperty('--c2', c2); place(k, x, y);
        k.innerHTML = '<div class="je-candles">' + [0, 1, 2, 3].map(i => '<div class="je-candle"><u></u><small>' + (2023 + i) + '</small></div>').join('') + '</div><div class="je-tier"></div><div class="je-lbl">' + label + '</div>';
        return k;
      };
      const A = mkCake(lx, 'Tristan · 27 Jun', col('--rose'), col('--paper')), B = mkCake(rx, 'Ann · 5 Aug', col('--gold'), col('--paper'));
      await r.nextFrame(); A.classList.add('in'); r.bell(PENTA[0], 0, 0.1, 2); await r.wait(300); B.classList.add('in'); r.bell(PENTA[1], 0, 0.1, 2);
      await r.wait(1400);
      const cs = [...A.querySelectorAll('.je-candle')], ds = [...B.querySelectorAll('.je-candle')];
      for(let i = 0; i < 4; i++){ cs[i].classList.add('lit'); r.bell(PENTA[i], 0, 0.1, 1.8); await r.wait(380); ds[i].classList.add('lit'); r.bell(PENTA[i] + 12, 0, 0.1, 1.8); await r.wait(380); }
      r.cap('eight birthdays, so far');
      await r.wait(1500);
      r.big('make a wish', '22%', 'clamp(2.8rem,12vw,5rem)', 0.1);
      await r.wait(2200);
      // together
      r.noise(0.9, 0.16, 900, 300);
      [...cs, ...ds].forEach((c, i) => r.later(() => { c.classList.remove('lit'); const rect = c.getBoundingClientRect(), sr = r.stage.getBoundingClientRect(); const s = mk('je-smoke', '💨'); s.style.left = (rect.left - sr.left) + 'px'; s.style.top = (rect.top - sr.top - 10) + 'px'; s.style.setProperty('--dx', rnd(-20, 20) + 'px'); r.fx(s, 1500); }, i * 60));
      await r.wait(600);
      r.flash(); r.confetti(); r.heartBurst(); [0, 0.08, 0.16, 0.24].forEach((d, i) => r.bell(PENTA[i + 3], d, 0.11, 2.4));
      await r.wait(3600); r.cap('');
    },

    // 5 - Bus Sim 18: a very slow bus makes a very important stop
    async bus(r){
      const W = r.W(), H = r.H(), ry = H * 0.5;
      const road = r.el('je-road'); road.style.setProperty('--ry', ry + 'px');
      const v = r.el('je-vehicle'); v.style.setProperty('--ry', ry + 'px'); v.innerHTML = '<span class="je-led">ROUTE 18</span><em>🚌</em>'; v.style.left = (W * 1.3) + 'px';
      const led = v.querySelector('.je-led');
      r.tone(120, 0, 3.2, 'sawtooth', 0.025, 80);
      const honk = () => { r.tone(320, 0, 0.28, 'square', 0.07); r.tone(400, 0, 0.28, 'square', 0.06); };
      await r.tween(3400, p => { const e = 1 - Math.pow(1 - p, 3); v.style.left = (W * 1.3 - (W * 0.8) * e) + 'px'; v.style.top = (ry + Math.sin(p * 40) * 2) + 'px'; road.style.backgroundPositionX = (p * 700) + 'px'; });
      r.noise(0.5, 0.1, 1200, 300); led.textContent = 'NEXT STOP: BESTIE'; honk();
      await r.wait(500); r.bell(PENTA[4], 0, 0.14, 1.2); await r.wait(260); r.bell(PENTA[4], 0, 0.14, 1.2);
      r.cap('3 July 2023 · Bus Sim 18');
      for(let i = 0; i < 6; i++){ r.later(() => r.sparks(W / 2 + rnd(-40, 40), ry - 30, 2, ['♡', '✦']), i * 300); }
      await r.wait(3000);
      led.textContent = 'THANKS FOR RIDING'; r.bell(PENTA[2], 0, 0.1, 2); await r.wait(1200);
      honk(); r.tone(110, 0, 2.6, 'sawtooth', 0.025, 160);
      await r.tween(2800, p => { const e = p * p; v.style.left = (W / 2 - (W * 0.8) * e) + 'px'; road.style.backgroundPositionX = (700 + p * 900) + 'px'; });
      r.heartBurst(); r.cap('');
      await r.wait(600);
    },

    // 6 - glasses: the world is a blur until they land
    async glasses(r){
      const W = r.W(), H = r.H();
      const world = r.el('je-world');
      for(let i = 0; i < 16; i++){ const b = document.createElement('b'), s = rnd(30, 110); b.style.cssText = 'left:' + rnd(-5, 95) + '%;top:' + rnd(5, 90) + '%;width:' + s + 'px;height:' + s + 'px;background:' + [col('--rose'), col('--gold'), col('--sage'), col('--gold-light')][i % 4] + ';opacity:' + rnd(0.35, 0.8); world.appendChild(b); }
      const t = document.createElement('div'); t.style.cssText = 'position:absolute;left:0;right:0;top:20%;text-align:center;font-family:Playfair Display,serif;font-size:clamp(2rem,9vw,3.6rem);font-style:italic;color:#fff3d6'; t.textContent = 'the whole world'; world.appendChild(t);
      r.cap('everything was a bit blurry');
      r.tone(300, 0, 2.2, 'sine', 0.04, 260);
      await r.wait(2800);
      const gl = r.el('je-gl'); gl.style.top = '-20%';
      gl.innerHTML = '<svg viewBox="0 0 200 80" width="100%"><g fill="rgba(200,230,255,.18)" stroke="#2a1a10" stroke-width="5"><circle cx="52" cy="42" r="32"/><circle cx="148" cy="42" r="32"/></g><path d="M84 38 Q100 28 116 38" fill="none" stroke="#2a1a10" stroke-width="5"/><path d="M20 36 L2 26 M180 36 L198 26" stroke="#2a1a10" stroke-width="5" stroke-linecap="round"/></svg>';
      await r.nextFrame(); gl.style.top = (H * 0.46) + 'px'; r.tone(900, 0.45, 0.4, 'sine', 0.08, 300);
      await r.wait(850);
      r.noise(0.12, 0.12, 2800, 1800); r.thud(0.2, 220);
      world.classList.add('sharp'); r.cap(''); r.flash();
      [PENTA[3], PENTA[4], PENTA[5], PENTA[6]].forEach((m, i) => r.bell(m, i * 0.09, 0.11, 2.2));
      r.big('+100 clarity', '66%', 'clamp(2.4rem,10vw,4.2rem)', 0.4); r.sub('9 August 2023 · the world got sharper', 'calc(66% + clamp(3rem,12vw,5.4rem))', 1.2);
      r.sparks(W / 2, H * 0.46, 18, ['✦', '✨']); r.heartBurst();
      await r.wait(4200);
    },

    // 7 - the official face reveal: curtains, drumroll, a polaroid that develops
    async face(r){
      const W = r.W(), H = r.H();
      const sp = r.el('je-spot'), pol = r.el('je-pol');
      pol.innerHTML = '<div class="je-pic">🙂</div><div class="je-cap2">official ✓</div>';
      const l = r.el('je-curt l'), rr = r.el('je-curt r');
      await r.nextFrame(); sp.classList.add('on');
      r.cap('October 2024');
      for(let i = 0; i < 16; i++) r.later(() => r.noise(0.09, 0.05 + i * 0.008, 200 + i * 60, 0), i * 120);   // drumroll
      await r.wait(2100); r.cap('');
      r.tone(120, 0, 0.5, 'sine', 0.3, 60); r.noise(0.3, 0.14, 900, 200);
      l.classList.add('open'); rr.classList.add('open'); r.tone(250, 0, 1.3, 'sawtooth', 0.025, 140);
      pol.classList.add('in');
      await r.wait(1500);
      r.flash(); r.noise(0.08, 0.2, 3000, 1500); r.tone(2000, 0, 0.05, 'square', 0.06);
      pol.querySelector('.je-pic').classList.add('dev');
      r.sparks(W / 2, H * 0.46, 14, ['✨', '✦']);
      await r.wait(2600);
      [PENTA[2], PENTA[4], PENTA[5]].forEach((m, i) => r.bell(m, i * 0.1, 0.1, 2.4)); r.heartBurst(); r.confetti();
      await r.wait(3200);
    },

    // 8 - Phasmo: darkness, a torch, an EMF reader that keeps climbing
    async phasmo(r){
      const W = r.W(), H = r.H();
      const gh = r.el('je-ghost', '👻'); place(gh, W * 0.7, H * 0.38);
      const dark = r.el('je-dark'); dark.style.setProperty('--x', W * 0.2 + 'px'); dark.style.setProperty('--y', H * 0.7 + 'px');
      const emf = r.el('je-emf'); emf.innerHTML = '<i></i><i></i><i></i><i></i><i></i>'; const led = [...emf.querySelectorAll('i')];
      r.cap('March 2024 · lights off'); r.tone(60, 0, 6, 'sawtooth', 0.02, 70);
      let lit = 0; const th = [0.18, 0.38, 0.58, 0.78, 0.92];
      await r.tween(6200, p => {
        const x = W * (0.5 + 0.38 * Math.sin(p * 5.1 + 0.6)), y = H * (0.46 + 0.26 * Math.sin(p * 7.3));
        dark.style.setProperty('--x', x + 'px'); dark.style.setProperty('--y', y + 'px');
        const d = Math.hypot(x - W * 0.7, y - H * 0.38); gh.style.opacity = d < 150 ? String(0.3 + 0.7 * Math.abs(Math.sin(p * 90))) : '0';
        while(lit < 5 && p > th[lit]){ led[lit].classList.add('on'); r.tone(500 + lit * 160, 0, 0.14, 'square', 0.06); r.noise(0.2, 0.06 + lit * 0.02, 1500, 800); lit++; }
      });
      r.noise(0.5, 0.2, 2000, 400); r.tone(150, 0, 0.5, 'square', 0.1, 60); r.cap('');
      dark.style.opacity = '0'; gh.style.opacity = '1'; r.flash(); r.quake(); r.glitch();
      r.big('EMF 5', '24%', 'clamp(3rem,14vw,6rem)', 0.1); r.sub('the bravest first-timer in the building', 'calc(24% + clamp(3.8rem,15vw,7rem))', 1);
      await r.wait(1200); r.bell(PENTA[2], 0, 0.1, 2); r.heartBurst();
      await r.wait(3200);
    },

    // 9 - Christmas: a tree, three parcels, and a dishrack drainer
    async christmas(r){
      const W = r.W(), H = r.H(), cx = W / 2, ty = H * 0.4, tw = Math.min(W * 0.58, 230);
      const fl = flakes(r);
      const tree = r.el('je-tree'); place(tree, cx, ty); tree.style.width = tw + 'px';
      let orns = ''; for(let i = 0; i < 16; i++){ const y = rnd(40, 168), half = 18 + (y - 30) * 0.43, x = 100 + rnd(-half, half) * 0.82; orns += '<circle class="je-orn" cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="3.6" fill="' + ['#ff5a5a', '#ffd76a', '#6ad0ff', '#fff'][i % 4] + '" style="animation-delay:' + (-rnd(0, 1.2)).toFixed(2) + 's"/>'; }
      tree.innerHTML = '<svg viewBox="0 0 200 210" width="100%"><rect x="92" y="176" width="16" height="26" fill="#6e4c2a"/><polygon points="100,18 160,92 40,92" fill="#2f6b4a"/><polygon points="100,48 172,132 28,132" fill="#27593d"/><polygon points="100,82 186,176 14,176" fill="#1f4a33"/>' + orns + '<polygon points="100,2 105,15 119,15 108,23 112,37 100,29 88,37 92,23 81,15 95,15" fill="#ffd76a"/></svg>';
      await r.nextFrame(); tree.classList.add('in'); [0, 0.1, 0.2].forEach((d, i) => r.bell(PENTA[i], d, 0.09, 2));
      await r.wait(1400);
      const base = ty + tw * 0.5 + 6;
      const gifts = [['2023', 'first package', col('--rose')], ['2024', 'postcards… and a dishrack drainer', col('--gold')], ['2025', '♡', col('--sage')]];
      for(let i = 0; i < 3; i++){
        const gx = cx + (i - 1) * Math.min(W * 0.28, 112), g = r.el('je-gift'); g.style.background = gifts[i][2]; place(g, gx, -40);
        const t = r.el('je-gt'); t.innerHTML = gifts[i][0] + (gifts[i][1] ? '<small>' + gifts[i][1] + '</small>' : ''); t.style.left = gx + 'px'; t.style.top = (base + 28) + 'px'; t.style.width = Math.min(W * 0.3, 120) + 'px';
        g.style.opacity = '1'; await r.nextFrame(); g.style.top = base + 'px';
        await r.wait(650); r.thud(0.2, 200); r.bell(PENTA[i + 2], 0, 0.1, 1.6); t.style.opacity = '1'; r.sparks(gx, base, 6, ['✦', '❄']);
        await r.wait(i === 1 ? 2400 : 1300);
      }
      const gx = cx + Math.min(W * 0.28, 112) * 2, g4 = r.el('je-gift dashed'); place(g4, cx, base + 122); g4.style.width = '4rem'; g4.style.opacity = '1'; g4.textContent = '2026?'; g4.style.cssText += ';display:flex;align-items:center;justify-content:center;color:#fff3d6;font-family:Caveat,cursive;font-weight:700;font-size:1.3rem;transform:translate(-50%,-50%) scale(0)';
      await r.nextFrame(); g4.style.transition = 'transform .6s cubic-bezier(.34,1.8,.5,1)'; g4.style.transform = 'translate(-50%,-50%) scale(1)';
      r.cap('this year\u2019s isn\u2019t wrapped yet'); r.heartBurst(); r.bell(PENTA[5], 0, 0.1, 2.4);
      await r.wait(4200); r.stopEvery(fl); r.cap('');
    },

    // 10 - Stardew Concerts: a pixel stage, a very enthusiastic farm
    async stardew(r){
      const W = r.W(), H = r.H(), sy = H * 0.5;
      K.music({ tempo:132, prog:[K.CH.Gmaj7, K.CH.Em, K.CH.Cmaj7, K.CH.D], arp:0.03, melVol:0.05, bass:0.09, bass2:true, chip:true,
        mel:[[79,null,83,null,86,null,83,79],[76,null,79,null,83,null,79,76],[84,null,83,null,79,null,76,null],[78,null,81,null,86,81,78,null]] });
      const st = r.el('je-stage'); st.style.setProperty('--sy', sy + 'px');
      [W * 0.35, W * 0.65].forEach(x => { const b = r.el('je-beam'); b.style.left = x + 'px'; b.style.setProperty('--sy', sy + 'px'); });
      r.cap('Feb–Mar 2026');
      const act = r.el('je-act', '🧑‍🌾'); act.style.left = (W * 0.42) + 'px'; act.style.top = sy + 'px';
      const gtr = r.el('je-act', '🎸'); gtr.style.left = (W * 0.58) + 'px'; gtr.style.top = sy + 'px'; gtr.style.animationDelay = '.2s';
      const crowd = ['🐔', '🐄', '🐑', '🐖', '🐓', '🐐'];
      for(let i = 0; i < 12; i++){ const c = r.el('je-crowd', crowd[i % crowd.length]); c.style.left = (W * (0.08 + 0.84 * (i / 11))) + 'px'; c.style.top = (sy + 64 + (i % 2) * 34) + 'px'; c.style.animationDelay = (-rnd(0, 0.5)) + 's'; c.style.fontSize = (1.7 + (i % 2) * 0.3) + 'rem'; }
      const ev = r.every(() => { const x = W * rnd(0.3, 0.7); r.sparks(x, sy - 50, 2, ['♪', '♫', '★']); }, 280);
      await r.wait(1000);
      r.big('encore!', '16%', 'clamp(3rem,14vw,6rem)', 0.2); r.sub('a concert on a farm, with you', 'calc(16% + clamp(3.8rem,15vw,7rem))', 1.2);
      r.heartBurst(); await r.wait(1800); r.confetti();
      await r.wait(4400); r.stopEvery(ev); r.cap('');
    },

    // 11 - INSYNC: two waves out of step settle into one (and the sound does too)
    async insync(r){
      const W = r.W(), H = r.H();
      const svg = svgEl('svg', { viewBox:'0 0 400 200', class:'je-svg' }); r.stage.appendChild(svg); r.collect.push(svg);
      const mkPath = c => { const p = svgEl('path', { fill:'none', stroke:c, 'stroke-width':4, 'stroke-linecap':'round' }); p.style.filter = 'drop-shadow(0 0 6px ' + c + ')'; svg.appendChild(p); return p; };
      const a = mkPath(col('--rose')), b = mkPath(col('--gold-light'));
      const draw = (p, ph, fr) => { let d = ''; for(let x = 0; x <= 400; x += 4) d += (x ? 'L' : 'M') + x + ',' + (100 + Math.sin(x / 400 * Math.PI * 2 * fr + ph) * 62).toFixed(1); p.setAttribute('d', d); };
      r.cap('the Unhinged Era · the INSYNC Era');
      r.tone(220, 0, 7.4, 'sine', 0.07); r.tone(236, 0, 7.4, 'sine', 0.07, 220);
      await r.tween(7000, p => { const e = p * p * (3 - 2 * p); draw(a, p * 4, 3); draw(b, p * 4 + (1 - e) * 2.4, 3 + (1 - e) * 0.6); });
      draw(a, 0, 3); draw(b, 0, 3);
      r.flash(); r.cap(''); r.ringAt(W / 2, H * 0.44, col('--gold-light'), 22);
      [PENTA[0], PENTA[2], PENTA[4], PENTA[5]].forEach((m, i) => r.bell(m, i * 0.07, 0.12, 3));
      r.big('INSYNC', '64%', 'clamp(3.4rem,15vw,6.4rem)', 0.2); r.sub('two different people, one exact same thought', 'calc(64% + clamp(3.8rem,15vw,7rem))', 1.2);
      r.heartBurst(); await r.wait(4200);
    },

    // 12 - Protein Business: a Series A pitch with entirely made-up numbers
    async protein(r){
      const W = r.W(), H = r.H();
      const deck = r.el('je-deck');
      deck.innerHTML = '<h4>PROTEIN™<small>Series A</small></h4><div class="je-bars">' + [18, 30, 44, 66, 100].map(() => '<i></i>').join('') + '</div><div class="je-ticker">$PROT ▲ 0%</div>';
      await r.nextFrame(); deck.classList.add('in'); r.bell(PENTA[1], 0, 0.1, 1.6);
      r.cap('19 August 2026'); await r.wait(1400);
      const bars = [...deck.querySelectorAll('.je-bars i')], hs = [18, 30, 44, 66, 100], tk = deck.querySelector('.je-ticker');
      bars.forEach((b, i) => r.later(() => { b.style.height = hs[i] + '%'; r.chip(300 + i * 120, 0, 0.12, 0.06); }, i * 420));
      await r.tween(2400, p => { tk.textContent = '$PROT ▲ ' + Math.floor(p * 4000).toLocaleString() + '%'; });
      r.cap('');
      r.noise(1.6, 0.12, 2200, 3000); r.flash();
      for(let i = 0; i < 26; i++){ const e = mk('je-pr', ['💪', '💸', '💰', '🥤'][i % 4]), fd = rnd(2.4, 4.4); e.style.left = rnd(0, 94) + '%'; e.style.setProperty('--sw', rnd(-60, 60) + 'px'); e.style.setProperty('--fr', rnd(-300, 300) + 'deg'); e.style.setProperty('--fd', fd + 's'); e.style.animationDelay = rnd(0, 1.2) + 's'; r.fx(e, 6000); }
      [PENTA[2], PENTA[4], PENTA[6]].forEach((m, i) => r.bell(m, i * 0.08, 0.1, 2));
      await r.wait(2200);
      r.fade(deck, 600); await r.wait(700);
      r.big('a new business avenue was born…', '34%', 'clamp(2.2rem,9vw,3.8rem)', 0.1); r.sub('(the numbers are made up. I believe in us.)', 'calc(34% + clamp(5.6rem,22vw,9rem))', 1.4);
      r.confetti(); r.heartBurst();
      await r.wait(4200);
    },

    // 13 - the line itself: a spark runs the whole timeline and lights every moment
    async spine(r){
      const W = r.W(), H = r.H(), cx = W / 2, y0 = H * 0.13, y1 = H * 0.84;
      const evs = typeof EVENTS !== 'undefined' ? EVENTS : null, n = evs ? evs.length : 31;
      const line = r.el(''); line.style.cssText = 'position:absolute;left:' + (cx - 1) + 'px;top:' + y0 + 'px;width:2px;height:' + (y1 - y0) + 'px;background:' + col('--tan') + ';opacity:.5;z-index:40';
      const fill = r.el(''); fill.style.cssText = 'position:absolute;left:' + (cx - 1) + 'px;top:' + y0 + 'px;width:2px;height:0;background:' + col('--gold-light') + ';box-shadow:0 0 12px ' + col('--gold-light') + ';z-index:41';
      const dots = [];
      for(let i = 0; i < n; i++){
        const y = y0 + (y1 - y0) * (i / (n - 1)), side = evs ? (evs[i].side === 'left' ? -1 : 1) : (i % 2 ? 1 : -1);
        const d = r.el(''); d.style.cssText = 'position:absolute;left:' + (cx - 5) + 'px;top:' + (y - 5) + 'px;width:10px;height:10px;border-radius:50%;border:2px solid ' + col('--gold') + ';background:#1a0f08;z-index:42;transition:background .3s,transform .4s cubic-bezier(.3,2,.5,1),box-shadow .3s';
        const c = r.el(''); c.style.cssText = 'position:absolute;top:' + (y - 3) + 'px;' + (side < 0 ? 'right:' + (W / 2 + 14) + 'px' : 'left:' + (W / 2 + 14) + 'px') + ';width:' + rnd(W * 0.12, W * 0.28) + 'px;height:6px;border-radius:3px;background:' + col('--paper') + ';opacity:.16;z-index:41;transition:opacity .4s,background .4s';
        dots.push([d, c, y]);
      }
      r.cap('every moment, right from the very beginning');
      await r.wait(900);
      let lastLit = -1;
      await r.tween(6200, p => {
        const y = y0 + (y1 - y0) * p; fill.style.height = (y - y0) + 'px';
        const idx = Math.floor(p * (n - 1) + 0.0001);
        while(lastLit < idx){ lastLit++; const [d, c] = dots[lastLit]; d.style.background = col('--gold-light'); d.style.transform = 'scale(1.5)'; d.style.boxShadow = '0 0 14px ' + col('--gold-light'); c.style.opacity = '.8'; c.style.background = col('--gold-light'); if(lastLit % 2 === 0) r.bell(PENTA[lastLit % 7] + (lastLit > n / 2 ? 12 : 0), 0, 0.05, 1.2); }
      });
      dots.forEach(([d, c]) => { d.style.background = col('--gold-light'); c.style.opacity = '.8'; });
      r.flash(); r.cap(''); r.ringAt(cx, y1, col('--gold-light'), 22); [PENTA[0], PENTA[2], PENTA[4], PENTA[6]].forEach((m, i) => r.bell(m, i * 0.08, 0.12, 3));
      r.big(n + ' moments', '36%', 'clamp(3rem,13vw,5.6rem)', 0.2); r.sub('and counting', 'calc(36% + clamp(3.8rem,15vw,6.8rem))', 1.1);
      r.heartBurst(); await r.wait(4200);
    },

    // 14 - the time capsule: something is waiting at the bottom of the page
    async capsule(r){
      const W = r.W(), H = r.H(), nb = nextAnnBirthday();
      const cap = r.el('je-cap-svg');
      cap.innerHTML = '<svg viewBox="0 0 120 220" width="100%"><defs><linearGradient id="jecg" x1="0" x2="1"><stop offset="0" stop-color="#8d949c"/><stop offset=".45" stop-color="#e3e7ea"/><stop offset="1" stop-color="#6c737b"/></linearGradient></defs><rect x="22" y="20" width="76" height="180" rx="38" fill="url(#jecg)" stroke="#444a50" stroke-width="3"/><rect x="22" y="96" width="76" height="26" fill="#b8864a" stroke="#6e4c2a" stroke-width="2"/><circle cx="34" cy="109" r="3.2" fill="#6e4c2a"/><circle cx="60" cy="109" r="3.2" fill="#6e4c2a"/><circle cx="86" cy="109" r="3.2" fill="#6e4c2a"/><ellipse cx="46" cy="52" rx="8" ry="22" fill="rgba(255,255,255,.35)"/></svg>';
      await r.nextFrame(); cap.classList.add('in'); r.bell(PENTA[0] - 12, 0, 0.16, 3);
      r.cap('something is waiting in here'); await r.wait(2200);
      cap.classList.add('wob'); r.tone(90, 0, 1.5, 'sine', 0.12, 70); r.noise(0.8, 0.05, 300, 200);
      await r.wait(1700);
      for(let i = 0; i < 5; i++) r.later(() => r.ringAt(W / 2, H * 0.44, col('--gold-light'), 10), i * 300);
      const cnt = r.el('je-odo'); cnt.style.top = (H * 0.66) + 'px'; cnt.style.fontSize = 'clamp(3.2rem,15vw,5.6rem)'; cnt.textContent = '0';
      await r.tween(2600, p => { cnt.textContent = Math.round(nb.days * (1 - Math.pow(1 - p, 3))).toLocaleString(); r.chip(300 + p * 900, 0, 0.03, 0.02); });
      r.sub('days until it can be opened · ' + nb.label, 'calc(' + (H * 0.66) + 'px + clamp(4.4rem,18vw,7.4rem))', 0.2);
      r.cap('not yet. see you there.'); r.heartBurst(); [PENTA[2], PENTA[4]].forEach((m, i) => r.bell(m, i * 0.1, 0.1, 3));
      await r.wait(4800); r.cap('');
    },

    // 15 - the stamp: how many days it has actually been
    async days(r){
      const W = r.W(), H = r.H(), n = daysSince(FIRST_DM);
      const odo = r.el('je-odo'); odo.style.top = (H * 0.3) + 'px'; odo.textContent = '0';
      r.cap('since 15 January 2023'); r.tone(100, 0, 4.4, 'sawtooth', 0.02, 260);
      await r.wait(500);
      await r.tween(4200, p => { const e = 1 - Math.pow(1 - p, 4); odo.textContent = Math.round(n * e).toLocaleString(); if(Math.random() < 0.5) r.chip(500 + p * 700, 0, 0.02, 0.025); });
      r.flash(); r.cap(''); r.ringAt(W / 2, H * 0.36, col('--gold-light'), 24); [PENTA[0], PENTA[2], PENTA[4], PENTA[6]].forEach((m, i) => r.bell(m, i * 0.08, 0.12, 3));
      r.sub('days since our first hello', 'calc(' + (H * 0.3) + 'px + clamp(5rem,21vw,8.4rem))', 0.2);
      await r.wait(1400);
      const wk = Math.floor(n / 7), yr = Math.floor(n / 365.25), mo = Math.floor((n - yr * 365.25) / 30.4);
      r.sub(wk.toLocaleString() + ' weeks · ' + yr + ' years and ' + mo + ' months', 'calc(' + (H * 0.3) + 'px + clamp(7rem,28vw,11rem))', 0.2);
      await r.wait(1000);
      r.sub('and counting ♡', 'calc(' + (H * 0.3) + 'px + clamp(9.4rem,36vw,13.6rem))', 0.2);
      r.heartBurst(); r.confetti();
      await r.wait(4200);
    },

    // 16 - the rest of it: a train of every moment so far leaves for the future
    async tbc(r){
      const W = r.W(), H = r.H(), ty = H * 0.7, order = KEYS.filter(k => k !== 'tbc');
      r.cap('and the rest of it…');
      const eng = r.el('je-train', '🚂'); const cars = order.map(k => { const c = r.el('je-train c', GLYPHS[k]); return c; });
      const all = [eng, ...cars], gap = Math.min(W * 0.13, 52);
      all.forEach(e => place(e, -60, ty));
      r.tone(110, 0, 5.4, 'sawtooth', 0.02, 190);
      const pf = r.every(() => { const s = mk('fk-spark', '☁'); s.style.left = (parseFloat(eng.style.left)) + 'px'; s.style.top = (ty - 26) + 'px'; s.style.setProperty('--dx', '-30px'); s.style.setProperty('--dy', '-50px'); r.fx(s, 1100); r.tone(180, 0, 0.05, 'square', 0.02); }, 220);
      await r.tween(6000, p => { const head = -40 + (W + 80 + gap * all.length) * p; all.forEach((e, i) => place(e, head - i * gap, ty + Math.sin(p * 30 + i) * 1.5)); });
      r.stopEvery(pf); r.cap('');
      const t = r.el('je-end'); t.style.top = (H * 0.3) + 'px'; const sp = document.createElement('span'), u = document.createElement('u'); t.appendChild(sp); t.appendChild(u);
      await r.type(sp, 'TO BE CONTINUED', 90, () => r.chip(900, 0, 0.03, 0.03));
      await r.wait(600);
      const lines = ['more birthdays.', 'more Christmases.', 'more calls.', 'more postcards.', 'MORE BEING BESTIES FOR A VERY LONG TIME…'];
      for(let i = 0; i < lines.length; i++){ r.sub(lines[i], (H * 0.3 + 62 + i * 34) + 'px', 0); r.bell(PENTA[i], 0, 0.09, 2); await r.wait(i === 4 ? 600 : 750); }
      r.heartBurst(); r.confetti(); [PENTA[0], PENTA[2], PENTA[4], PENTA[6]].forEach((m, i) => r.bell(m, i * 0.1, 0.12, 3.4));
      await r.wait(4800);
    }
  };

  /* ------------------------------------------------------------------ playing + triggers */
  function play(key, anchor, done){
    injectCSS();
    const m = moments[key];
    if(!m){ if(done) done(); return; }
    K.playLive(m, anchor || { x:innerWidth / 2, y:innerHeight * 0.46 }, done);
  }

  function init(){
    injectCSS();
    if(!window.PageEggs){ console.warn('[journey-eggs] eggs.js is not loaded'); return; }
    const rows = [...document.querySelectorAll('.tl-event')];
    const T = row => (row.querySelector('.tl-title') || {}).textContent || '', D = row => (row.querySelector('.tl-date') || {}).textContent || '', G = row => (row.querySelector('.tl-tag') || {}).textContent || '';
    const by = f => rows.find(f);
    const centerOf = el => { const b = el.getBoundingClientRect(); return { x:b.left + b.width / 2, y:b.top + b.height / 2 }; };

    // one moment at a time; if a second egg is found while one plays, it waits its turn
    const queue = []; let busy = false;
    const next = () => { const j = queue.shift(); if(!j){ busy = false; return; } busy = true; play(j.key, j.anchor, () => { PageEggs.found('journey', j.key, MSG[j.key]); setTimeout(wait, 600); }); };
    const wait = () => { if(PageEggs.isOpen && PageEggs.isOpen()) return setTimeout(wait, 800); next(); };
    const fire = (key, el) => { if(queue.some(q => q.key === key) || (busy && queue.length > 2)) return; queue.push({ key, anchor:centerOf(el) }); if(!busy) next(); };

    // gestures
    const taps = (row, n, key, win) => { if(!row) return; let c = 0, t = 0; row.addEventListener('click', () => { const now = Date.now(); if(now - t > (win || 1800)) c = 0; t = now; if(++c >= n){ c = 0; fire(key, row); } }); };
    const dbl = (row, key) => taps(row, 2, key, 520);
    const hold = (row, ms, key) => {
      if(!row) return; let tm = null, sx = 0, sy = 0;
      row.style.webkitTouchCallout = 'none'; row.style.userSelect = 'none'; row.style.webkitUserSelect = 'none';
      const stop = () => { clearTimeout(tm); tm = null; };
      row.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; stop(); tm = setTimeout(() => { tm = null; fire(key, row); }, ms); });
      row.addEventListener('pointermove', e => { if(tm && Math.hypot(e.clientX - sx, e.clientY - sy) > 12) stop(); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => row.addEventListener(ev, stop));
    };
    const distinct = (list, need, key) => { const seen = new Set(); list.forEach(row => row.addEventListener('click', () => { seen.add(row); if(seen.size >= need){ seen.clear(); fire(key, row); } })); };

    taps(by(r => /Nest/.test(T(r))), 3, 'nest');
    hold(by(r => D(r) === '15 Jan 2023'), 800, 'hello');
    dbl(by(r => /very first of many calls/i.test(T(r))), 'call');
    distinct(rows.filter(r => T(r).includes('🎂')), 5, 'birthday');
    { const row = by(r => /Bus Sim 18/.test(T(r))); if(row){ const w = row.querySelector('.tl-dot-wrap'); if(w) w.addEventListener('click', () => fire('bus', row)); } }
    taps(by(r => /got glasses/i.test(T(r))), 4, 'glasses');
    taps(by(r => /face reveal/i.test(T(r))), 5, 'face');
    hold(by(r => /first played Phasmo/i.test(T(r))), 1200, 'phasmo');
    distinct(rows.filter(r => G(r).trim().toLowerCase() === 'christmas'), 3, 'christmas');
    dbl(by(r => /Stardew/i.test(T(r))), 'stardew');
    taps(by(r => /INSYNC/.test(T(r))), 3, 'insync');
    taps(by(r => /Protein Business/i.test(T(r))), 2, 'protein', 1500);
    taps(document.querySelector('.stamp-big'), 3, 'days');

    // the line between the cards
    const wrap = document.querySelector('.tl-wrap');
    if(wrap){
      let c = 0, t = 0;
      wrap.addEventListener('click', e => {
        if(e.target.closest('.tl-event, .era-divider, .tl-end-stamp')) return;
        const sp = wrap.querySelector('.tl-spine'); if(!sp) return; const b = sp.getBoundingClientRect();
        if(Math.abs(e.clientX - (b.left + b.width / 2)) > 26) return;
        const now = Date.now(); if(now - t > 1800) c = 0; t = now;
        if(++c >= 3){ c = 0; fire('spine', { getBoundingClientRect:() => ({ left:e.clientX, top:e.clientY, width:0, height:0 }) }); }
      });
    }

    // resting at the very bottom of the page
    const end = document.getElementById('end-stamp');
    if(end && 'IntersectionObserver' in window){
      let tm = null;
      new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting && en.intersectionRatio > 0.6){ clearTimeout(tm); tm = setTimeout(() => fire('capsule', end), 8000); } else { clearTimeout(tm); } }), { threshold:[0, 0.6, 1] }).observe(end);
    }

    // the last one only opens once the other fifteen are found
    const future = by(r => /The rest of it/i.test(T(r)));
    if(future) future.addEventListener('click', () => {
      const others = KEYS.filter(k => k !== 'tbc' && PageEggs.has('journey', k)).length;
      if(others >= KEYS.length - 1) fire('tbc', future);
      else if(!PageEggs.has('journey', 'tbc')) PageEggs.toast('the rest of it has not been written yet ♡', 2600);
    });
  }

  window.JourneyEggs = { moments, play, init, MSG, NAMES, KEYS, GLYPHS, injectCSS, util:{ daysSince, nextAnnBirthday, FIRST_DM, FIRST_CALL, PENTA, svgEl } };
})();
