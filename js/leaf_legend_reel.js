/* ==========================================================================
   leaf_legend_reel.js - the Prestige III celebration for Leaf Catcher / Leaf Legend.
   The five easter eggs from the Birthday 2026 showcase, replayed as one continuous piece (not five clips):
   one night sky with leaves always drifting through it, a firefly that stands in for her finger and "finds" each egg
   the way she did, a tray of five empty egg-slots at the top that fill one by one, and a score written for it
   (a music-box theme over a soft pad that changes key-feel per scene). Then the five eggs rise out of the tray,
   circle, crack one by one into a golden core, and the core detonates into LEAF LEGEND, followed by a short note.

   Loaded on the home page after reasons_reel.js and before home.js. home.js calls:
       LeafLegendReel.play(overlay, next)
   - overlay = the celebration overlay
   - next()  = carries on to the prestige medal reveal
   No buttons (same as the reasons reel). Escape skips to the end on a keyboard.
   Reduced motion: falls back to the old short egg finale (lgxGrandFinale in home.js) if that exists.

   Scenes, in the order the eggs sit on the showcase page:
     1 the wishing star   - the firefly taps a star, it streaks to the middle: "make a wish", meteor shower
     2 the marquee        - the firefly taps the sign four times; the lights chase round the screen and the credits roll
     3 the clock          - the firefly pokes the clock until it loses it: spin, glitch, ding, "time flies"
     4 the constellation  - the word "bestie" is typed, and the heart draws itself across the sky, star by star
     5 the last minute    - impatient tapping on a countdown, then the Office of Bestie Affairs stamps it
     finale               - gather, orbit, crack x5, detonate, leaf storm, the note

   To change wording: captions are cap('...'), the note is NOTE_LINES below, the credits are CREDITS below.
   To change the music: PIECES (chord progressions + melodies) sit just under the sound engine.
   ========================================================================== */
(function(){
  'use strict';
  const DEAD = { dead:true };
  const reduced = () => { try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

  const HEART_POINTS = [
    [50.0,31.66],[53.53,22.56],[70.63,12.99],[90.0,23.51],[90.0,45.85],
    [70.63,66.44],[53.53,83.36],[50.0,91.01],[46.47,83.36],[29.37,66.44],
    [10.0,45.85],[10.0,23.51],[29.37,12.99],[46.47,22.56]
  ];
  const CREDITS = [
    ['', 'Bestie Pictures', 'ttl'], ['presents', ''], ['', 'A Film About Nothing In Particular', ''],
    ['Starring', 'Ann, as Ann'], ['Also starring', 'the beans (reluctantly)'], ['Directed by', 'Tristan (in a mild panic)'],
    ['Produced by', 'The Office of Bestie Affairs'], ['Catering', 'one (1) custard cream'],
    ['Stunt coordinator', 'a very brave leaf'], ['Leaf wrangler', 'Ann (obviously)'],
    ['Leaves caught', 'too many to count'],
    ['', 'No besties were harmed in the making of this film', '']
  ];
  const NOTE_LINES = [
    ['thirteen goals.', 2400],
    ['five secrets.', 2400],
    ['more leaves than either of us will ever count.', 3600],
    ['I tucked every one of them away hoping you would go looking.', 4200],
    ['of course you found them all.', 3600],
    ['thank you for playing with everything I make, Ann.', 4800]
  ];

  /* ------------------------------------------------------------------ styles */
  const CSS = `
.ll-root{position:absolute;inset:0;z-index:0;pointer-events:none;font-family:'EB Garamond',Georgia,serif;color:#fff3d6;transition:opacity .9s}
.ll-stage{position:absolute;inset:0;overflow:hidden}
.ll-stage.ll-quake{animation:llQuake .45s ease-in-out}
@keyframes llQuake{0%,100%{transform:translate(0,0)}20%{transform:translate(-7px,4px)}40%{transform:translate(6px,-5px)}60%{transform:translate(-4px,3px)}80%{transform:translate(3px,-2px)}}
.ll-stage.ll-shake{animation:llShakeBig .09s linear 14}
@keyframes llShakeBig{0%{transform:translate(0,0)}25%{transform:translate(-7px,4px)}50%{transform:translate(6px,-5px)}75%{transform:translate(-4px,-3px)}100%{transform:translate(0,0)}}
.ll-stage.ll-glitch{animation:llGlitch .5s steps(2) 1}
@keyframes llGlitch{0%{filter:none}25%{filter:hue-rotate(90deg) saturate(2);transform:translate(-5px,0)}50%{transform:translate(6px,0) skewX(4deg)}75%{filter:hue-rotate(-90deg)}100%{filter:none;transform:none}}

/* sky, tint, caption */
.ll-sky{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 36%,rgba(86,44,10,.62),rgba(12,6,26,.95) 78%);opacity:0;transition:opacity 2.6s}
.ll-sky.on{opacity:1}
.ll-star{position:absolute;border-radius:50%;background:#fff3cf;animation:llTw var(--tw) ease-in-out var(--td) infinite}
@keyframes llTw{0%,100%{opacity:.15;transform:scale(.8)}50%{opacity:.9;transform:scale(1.2)}}
.ll-tint{position:absolute;inset:0;background-color:rgba(0,0,0,0);transition:background-color 3s}
.ll-cap{position:absolute;left:0;right:0;bottom:7%;z-index:90;text-align:center;padding:0 1.5rem;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.05rem,3.6vw,1.5rem);color:#f3e6c8;text-shadow:0 2px 14px rgba(0,0,0,.75),0 0 18px rgba(232,185,90,.45);opacity:0;transition:opacity .45s;letter-spacing:.5px}
.ll-snd{position:absolute;right:1rem;top:1rem;z-index:95;font-family:'Caveat',cursive;font-size:1.15rem;color:rgba(250,244,232,.7);letter-spacing:1px;animation:llBob 1.6s ease-in-out infinite}
@keyframes llBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}

/* the drifting leaves that never stop */
.ll-leaf{position:absolute;top:-3rem;z-index:3;opacity:.92;filter:drop-shadow(0 0 6px rgba(255,190,80,.35));animation:llFall var(--fd) linear var(--fdl,0s) forwards}
@keyframes llFall{0%{transform:translate(0,0) rotate(0)}50%{transform:translate(calc(var(--sw) * -.5),56vh) rotate(calc(var(--fr) * .5))}100%{transform:translate(var(--sw),112vh) rotate(var(--fr))}}
.ll-fly{position:absolute;left:50%;top:50%;z-index:30;opacity:0;animation:llFly var(--bt) cubic-bezier(.1,.7,.3,1) var(--bd,0s) forwards}
@keyframes llFly{0%{opacity:1;transform:translate(-50%,-50%) scale(.3) rotate(0)}70%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1) rotate(var(--fr))}}

/* the tray of five eggs */
.ll-tray{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 2.4rem);display:flex;justify-content:center;gap:clamp(.5rem,3.4vw,1.2rem);z-index:60;opacity:0;transition:opacity 1.2s}
.ll-tray.on{opacity:1}
.ll-slot{position:relative;width:2.5rem;height:3rem;border:1.5px dashed rgba(255,226,160,.38);border-radius:50% 50% 50% 50% / 62% 62% 38% 38%;transition:border-color .6s,box-shadow .6s,background .6s}
.ll-slot.full{border-style:solid;border-color:#ffd76a;background:rgba(255,215,106,.14);box-shadow:0 0 16px rgba(255,215,106,.65)}
.ll-slot i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:1.5rem;opacity:0;transform:scale(.3);transition:opacity .4s,transform .5s cubic-bezier(.34,1.8,.5,1)}
.ll-slot.full i{opacity:1;transform:scale(1)}
.ll-egg{position:absolute;font-size:2.7rem;line-height:1;transform:translate(-50%,-50%);z-index:70;transition:left 1.3s cubic-bezier(.5,0,.2,1),top 1.3s cubic-bezier(.5,0,.2,1),font-size 1.3s ease,opacity .6s;filter:drop-shadow(0 0 14px rgba(255,215,106,.8))}
.ll-egg.pop{animation:llEggPop .7s cubic-bezier(.34,1.8,.5,1)}
@keyframes llEggPop{from{transform:translate(-50%,-50%) scale(0)}to{transform:translate(-50%,-50%) scale(1)}}
.ll-egg.crack{animation:llCrack .65s ease forwards}
@keyframes llCrack{0%{transform:translate(-50%,-50%) scale(1)}25%{transform:translate(-50%,-50%) scale(1.2) rotate(-16deg)}50%{transform:translate(-50%,-50%) scale(1.2) rotate(16deg)}100%{transform:translate(-50%,-50%) scale(2.6);opacity:0}}

/* the firefly that stands in for her finger */
.ll-orb{position:absolute;z-index:80;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:radial-gradient(circle,#fff8d6 0,rgba(255,215,106,.55) 55%,rgba(255,215,106,0) 72%);box-shadow:0 0 22px 7px rgba(255,215,106,.45);pointer-events:none;transition:opacity .45s,transform .12s;animation:llOrbIn .4s ease}
@keyframes llOrbIn{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}
.ll-orb.down{transform:scale(.7)}
.ll-ripple{position:absolute;z-index:80;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid rgba(255,243,196,.9);box-shadow:0 0 14px rgba(255,215,106,.6);pointer-events:none;animation:llRip .85s ease-out forwards}
.ll-ripple.big{border-width:3px;animation-name:llRipBig;animation-duration:1.1s}
@keyframes llRip{from{transform:scale(.3);opacity:1}to{transform:scale(4.5);opacity:0}}
@keyframes llRipBig{from{transform:scale(.3);opacity:1}to{transform:scale(9);opacity:0}}

/* shared fx */
.ll-ring{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:3px solid var(--c,#ffd76a);box-shadow:0 0 22px var(--c,#ffd76a),inset 0 0 18px var(--c,#ffd76a);opacity:.95;pointer-events:none;z-index:55;animation:llRingX 1.5s cubic-bezier(.1,.7,.3,1) forwards}
@keyframes llRingX{to{transform:scale(var(--sc,30));opacity:0}}
.ll-flash{position:absolute;inset:0;z-index:58;pointer-events:none;background:radial-gradient(circle at 50% 46%,#fff 0%,rgba(255,226,140,.8) 30%,transparent 70%);opacity:0;animation:llFlash 1.1s ease-out}
@keyframes llFlash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}
.ll-spark{position:absolute;z-index:56;pointer-events:none;color:#ffe9a0;font-size:1.15rem;line-height:1;transform:translate(-50%,-50%);animation:llSpark 1s ease-out forwards}
@keyframes llSpark{to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(var(--fr,0deg)) scale(.4);opacity:0}}
.ll-trail{position:absolute;z-index:56;pointer-events:none;font-size:1.1rem;transform:translate(-50%,-50%);transition:left .7s ease-in,top .7s ease-in,opacity .7s ease-in,font-size .7s ease-in}
.ll-note{position:absolute;z-index:56;pointer-events:none;color:#f3d27a;font-size:1.5rem;animation:llNote 1.6s ease-out forwards}
@keyframes llNote{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--nx),-120px) rotate(var(--nr))}}
.ll-big{position:absolute;left:0;right:0;z-index:60;text-align:center;font-family:'Caveat',cursive;font-weight:700;line-height:1.05;color:#fff3d6;opacity:0;transform:scale(.6);animation:llPop 1s cubic-bezier(.2,1.5,.4,1) forwards;animation-delay:var(--d,0s);text-shadow:0 0 18px rgba(255,214,120,.8),0 0 40px rgba(255,180,80,.5);transition:opacity .8s}
@keyframes llPop{to{opacity:1;transform:scale(1)}}
.ll-sub{position:absolute;left:0;right:0;z-index:60;text-align:center;font-style:italic;font-size:clamp(.95rem,3.4vw,1.25rem);opacity:0;animation:llRise 1s ease forwards;animation-delay:var(--d,0s);padding:0 8vw;color:#fff3d6;transition:opacity .8s}
@keyframes llRise{from{opacity:0;transform:translateY(14px)}to{opacity:.92;transform:none}}
.ll-fade{transition:opacity .8s;opacity:0!important}

/* 1 the wishing star */
.ll-wstar{position:absolute;z-index:40;font-size:1.7rem;line-height:1;color:#fff8dc;text-shadow:0 0 12px #ffd37a,0 0 30px #ffd37a;transform:translate(-50%,-50%) scale(1);animation:llWs 1.4s ease-in-out infinite alternate}
@keyframes llWs{from{opacity:.55}to{opacity:1}}
.ll-met{position:absolute;z-index:20;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,#ffe9a8 70%,#fff);box-shadow:0 0 10px #ffd98a;opacity:0;transform-origin:100% 50%;animation:llMet var(--t) ease-in forwards;animation-delay:var(--d)}
@keyframes llMet{0%{opacity:0;transform:translate(0,0) rotate(24deg)}12%{opacity:1}100%{opacity:0;transform:translate(70vw,32vw) rotate(24deg)}}

/* 2 the marquee */
.ll-sign{position:absolute;left:50%;top:44%;z-index:40;transform:translate(-50%,-50%) scale(0);padding:1.1rem 1.7rem;border:6px dotted #ffd76a;border-radius:.6rem;background:rgba(40,18,8,.78);font-family:'Playfair Display',serif;font-weight:700;letter-spacing:.28em;font-size:clamp(1.1rem,4.6vw,1.8rem);color:#ffe9a8;text-shadow:0 0 14px rgba(255,200,110,.8);box-shadow:0 0 24px rgba(255,200,80,.45),inset 0 0 18px rgba(255,200,80,.2);white-space:nowrap;transition:transform .55s cubic-bezier(.34,1.7,.5,1),opacity .8s}
.ll-sign.in{transform:translate(-50%,-50%) scale(1)}
.ll-sign.tap{animation:llSignTap .35s ease}
@keyframes llSignTap{0%{filter:brightness(1)}40%{filter:brightness(1.9) drop-shadow(0 0 20px #ffd76a);transform:translate(-50%,-50%) scale(1.07)}100%{filter:brightness(1)}}
.ll-sign.go{transform:translate(-50%,-50%) scale(3.4);opacity:0}
.ll-bulb{position:absolute;z-index:15;width:11px;height:11px;margin:-5px 0 0 -5px;border-radius:50%;background:#ffd76a;box-shadow:0 0 10px #ffb830,0 0 20px #ffb830;animation:llBulb .9s steps(1) infinite;animation-delay:var(--d)}
@keyframes llBulb{0%{opacity:1}50%{opacity:.18;box-shadow:none}}
.ll-beam{position:absolute;z-index:12;bottom:-4vh;left:50%;width:60vmax;height:105vh;margin-left:-30vmax;transform-origin:50% 100%;background:linear-gradient(to top,rgba(255,243,200,.5),rgba(255,243,200,0) 85%);clip-path:polygon(47% 100%,53% 100%,100% 0,0 0);animation:llBeam 3.6s ease-in-out infinite alternate;mix-blend-mode:screen}
@keyframes llBeam{from{transform:rotate(var(--a0))}to{transform:rotate(var(--a1))}}
.ll-roll{position:absolute;left:0;right:0;top:0;z-index:30;text-align:center;padding:0 6vw;animation:llRoll 9.6s linear forwards;transform:translateY(100vh)}
@keyframes llRoll{to{transform:translateY(-100%)}}
.ll-roll h5{font-weight:400;font-size:clamp(.7rem,2.4vw,.95rem);letter-spacing:.35em;text-transform:uppercase;color:#d9a44a;margin:2.2rem 0 .3rem}
.ll-roll p{font-size:clamp(1.3rem,5vw,2.1rem);font-style:italic;margin:0;text-shadow:0 0 14px rgba(255,200,110,.55)}
.ll-roll .ttl{font-family:'Caveat',cursive;font-size:clamp(2.4rem,9vw,4.6rem);font-weight:700;font-style:normal;color:#ffd76a;margin-bottom:.2rem}

/* 3 the clock */
.ll-clk{position:absolute;left:50%;top:46%;z-index:40;width:var(--cs);height:var(--cs);transform:translate(-50%,-50%) scale(0);filter:drop-shadow(0 0 26px rgba(255,200,100,.55));transition:width 1s cubic-bezier(.3,1.5,.5,1),height 1s cubic-bezier(.3,1.5,.5,1),transform .6s cubic-bezier(.34,1.7,.5,1),opacity .8s}
.ll-clk.in{transform:translate(-50%,-50%) scale(1)}
.ll-clk.poke{animation:llPoke .4s ease}
@keyframes llPoke{0%,100%{transform:translate(-50%,-50%) rotate(0)}20%{transform:translate(-50%,-50%) rotate(-9deg) scale(.96)}50%{transform:translate(-50%,-50%) rotate(8deg)}80%{transform:translate(-50%,-50%) rotate(-4deg)}}
.ll-clk.gone{transform:translate(-50%,-50%) scale(0) rotate(180deg);opacity:0}
.ll-clk g{transform-box:view-box;transform-origin:50% 50%}
.ll-clk.spin .ll-hm{animation:llSpin 2.6s cubic-bezier(.65,0,.3,1) both;--turn:3600deg}
.ll-clk.spin .ll-hh{animation:llSpin 2.6s cubic-bezier(.65,0,.3,1) both;--turn:360deg}
@keyframes llSpin{to{transform:rotate(var(--turn))}}
.ll-orbit{position:absolute;left:50%;top:46%;z-index:35;font-size:2rem;line-height:1;opacity:0;animation:llOrbit 2.9s cubic-bezier(.5,0,.8,.6) forwards;animation-delay:var(--d)}
@keyframes llOrbit{0%{opacity:0;transform:rotate(var(--a)) translateX(52vmin) scale(.7)}12%{opacity:1}100%{opacity:0;transform:rotate(calc(var(--a) + 900deg)) translateX(0) scale(.15)}}

/* 4 the constellation */
.ll-typed{position:absolute;left:0;right:0;z-index:60;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(2.4rem,10vw,4.4rem);letter-spacing:.18em;color:#fff3d6;text-shadow:0 0 18px rgba(255,214,120,.8);transition:opacity .8s}
.ll-typed b{display:inline-block;font-weight:700;animation:llKey .3s cubic-bezier(.2,1.6,.4,1)}
@keyframes llKey{from{opacity:0;transform:translateY(10px) scale(.4)}to{opacity:1;transform:none}}
.ll-typed u{display:inline-block;width:.08em;height:.85em;margin-left:.1em;background:#ffd76a;vertical-align:-.05em;text-decoration:none;animation:llCur .8s steps(1) infinite}
@keyframes llCur{50%{opacity:0}}
.ll-hsvg{position:absolute;left:50%;top:46%;z-index:40;width:min(74vmin,540px);height:min(74vmin,540px);transform:translate(-50%,-50%);overflow:visible;filter:drop-shadow(0 0 12px rgba(255,200,120,.6));transition:opacity .8s}
.ll-hsvg.beat{animation:llBeat 1.2s ease-in-out 2}
@keyframes llBeat{0%,100%{transform:translate(-50%,-50%) scale(1)}30%{transform:translate(-50%,-50%) scale(1.07)}55%{transform:translate(-50%,-50%) scale(1)}}
.ll-hline{fill:rgba(255,140,170,0);stroke:#ffd98a;stroke-width:.8;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:llDraw 3.4s ease-in-out .3s forwards,llFill 1.6s ease 3.5s forwards}
@keyframes llDraw{to{stroke-dashoffset:0}}
@keyframes llFill{to{fill:rgba(255,140,170,.3)}}
.ll-hs{fill:#fff;opacity:0;transform-box:fill-box;transform-origin:center;animation:llStarPop .6s cubic-bezier(.2,1.6,.4,1) forwards;animation-delay:var(--d)}
@keyframes llStarPop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
.ll-hr{fill:none;stroke:#fff3b0;stroke-width:.5;opacity:0;transform-box:fill-box;transform-origin:center;animation:llHr 1.1s ease-out forwards;animation-delay:var(--d)}
@keyframes llHr{from{opacity:.9;transform:scale(.3)}to{opacity:0;transform:scale(5)}}

/* 5 the last minute */
.ll-timer{position:absolute;left:0;right:0;z-index:45;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(3rem,13vw,6rem);color:#ffe9a8;text-shadow:0 0 20px rgba(255,200,110,.7);transition:opacity .8s,transform .3s}
.ll-timer.jit{animation:llJit .16s linear infinite}
@keyframes llJit{0%{transform:translate(0,0)}33%{transform:translate(-2px,1px)}66%{transform:translate(2px,-1px)}100%{transform:translate(0,0)}}
.ll-timer small{display:block;font-family:'Playfair Display',serif;font-style:italic;font-weight:400;font-size:clamp(.8rem,2.8vw,1.05rem);letter-spacing:.25em;text-transform:uppercase;color:#d9a44a;text-shadow:none}
.ll-stamp{position:absolute;left:50%;top:var(--y);z-index:50;padding:.35em .9em;border:.28em double var(--c);border-radius:.4em;color:var(--c);font-family:'Playfair Display',serif;font-weight:700;font-size:var(--fs);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;text-align:center;line-height:1.15;background:rgba(255,253,245,.08);opacity:0;transform:translate(-50%,-50%) rotate(var(--r)) scale(2.6);animation:llSlam .32s cubic-bezier(.2,1.6,.4,1) forwards;animation-delay:var(--d);transition:opacity .8s}
@keyframes llSlam{to{opacity:.96;transform:translate(-50%,-50%) rotate(var(--r)) scale(1)}}
.ll-ink{position:absolute;z-index:49;border-radius:50%;background:var(--c);opacity:0;pointer-events:none;animation:llInk .5s ease-out forwards}
@keyframes llInk{0%{opacity:.8;transform:translate(0,0) scale(.3)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1)}}

/* finale */
.ll-core{position:absolute;z-index:65;width:5.4rem;height:5.4rem;margin:-2.7rem 0 0 -2.7rem;border-radius:50%;background:radial-gradient(circle,#fffbe0 0,#ffe08a 32%,rgba(255,176,48,.55) 60%,rgba(255,150,30,0) 72%);transform:scale(var(--s,0));transition:transform .5s cubic-bezier(.34,1.56,.64,1),opacity .5s ease-in;animation:llCore .55s ease-in-out infinite alternate}
@keyframes llCore{from{filter:brightness(1)}to{filter:brightness(1.35) drop-shadow(0 0 30px #fff2b0)}}
.ll-ray{position:absolute;left:50%;top:46%;z-index:50;width:3px;height:60vmax;margin-left:-1.5px;transform-origin:50% 0;background:linear-gradient(#ffe9a0,transparent);opacity:0;pointer-events:none;animation:llRay 2.4s ease-out forwards;animation-delay:var(--d);transform:rotate(var(--a))}
@keyframes llRay{0%{opacity:0}20%{opacity:.8}100%{opacity:0}}
.ll-banner{position:absolute;left:0;right:0;top:var(--bt,calc(46% + 120px));z-index:62;text-align:center;font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:clamp(1.8rem,8vw,3.4rem);letter-spacing:.18em;white-space:nowrap;transition:top 1.4s cubic-bezier(.6,0,.3,1)}
.ll-banner span{display:inline-block;opacity:0;transform:translateY(-40px) scale(1.8);background:linear-gradient(180deg,#fff6c8,#e8a92c 60%,#b97a10);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 12px rgba(255,200,80,.8));animation:llLetter .6s cubic-bezier(.2,1.4,.4,1) forwards;animation-delay:var(--d)}
@keyframes llLetter{to{opacity:1;transform:none}}
.ll-line{position:absolute;left:0;right:0;top:56%;z-index:62;text-align:center;padding:0 9vw;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.35rem,5.4vw,2.3rem);line-height:1.5;color:#fff3d6;text-shadow:0 2px 16px rgba(0,0,0,.7),0 0 22px rgba(232,185,90,.5);opacity:0;transition:opacity 1s}
.ll-line.in{opacity:1}
.ll-sig{position:absolute;left:0;right:0;top:76%;z-index:62;text-align:center;font-family:'Caveat',cursive;font-weight:700;font-size:clamp(1.8rem,7vw,2.8rem);color:#ffd76a;text-shadow:0 0 16px rgba(255,200,110,.7);opacity:0;transition:opacity 1.6s}
.ll-sig.in{opacity:1}
@media (prefers-reduced-motion:reduce){.ll-root *{animation-duration:.01s!important}}
`;
  let cssDone = false;
  function injectCSS(){
    if(cssDone) return; cssDone = true;
    const st = document.createElement('style'); st.id = 'll-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  const mk = (cls, text, parent) => { const e = document.createElement('div'); e.className = cls; if(text != null) e.textContent = text; if(parent) parent.appendChild(e); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const easeIn = p => p * p;

  /* ------------------------------------------------------------------ sound: a small synth, and a score that changes with each scene */
  let actx = null, master = null;
  function ac(){
    try{
      if(!actx){
        actx = new (window.AudioContext || window.webkitAudioContext)();
        master = actx.createGain(); master.gain.value = 1;
        const comp = actx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
        master.connect(comp); comp.connect(actx.destination);
      }
      if(actx.state === 'suspended') actx.resume();
      return actx;
    }catch(e){ return null; }
  }
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function toneAt(freq, t, dur, type, vol, glideTo){
    const c = actx; if(!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if(glideTo) o.frequency.linearRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function tone(freq, at, dur, type, vol, glideTo){
    const c = ac(); if(!c || (R && R.dead)) return;
    toneAt(freq, c.currentTime + (at || 0), dur, type, vol, glideTo);
  }
  function bellAt(m, t, vol, len){
    const f = mtof(m); len = len || 1.8;
    toneAt(f, t, len, 'sine', vol); toneAt(f * 2.756, t, len * 0.4, 'sine', vol * 0.22); toneAt(f * 5.4, t, len * 0.15, 'sine', vol * 0.08);
  }
  function bell(m, at, vol, len){
    const c = ac(); if(!c || (R && R.dead)) return;
    bellAt(m, c.currentTime + (at || 0), vol == null ? 0.12 : vol, len);
  }
  function noise(dur, vol, f0, f1, at){
    const c = ac(); if(!c || (R && R.dead)) return;
    const t = c.currentTime + (at || 0);
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(f0, t); if(f1) f.frequency.linearRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(0.05, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  function padAt(freq, t, dur, vol){
    const c = actx; if(!c) return;
    const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = freq; o.detune.value = (Math.random() - 0.5) * 10;
    fl.type = 'lowpass'; fl.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.8); g.gain.setValueAtTime(vol, t + dur - 0.9); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
    o.connect(fl); fl.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.7);
  }

  // chords (midi, low to high)
  const CH = {
    Dmaj7:[50,54,57,61], D:[50,54,57,62], Bm7:[47,50,54,57], Bm:[47,50,54,59],
    Gmaj7:[43,47,50,54], G:[43,47,50,55], A:[45,49,52,57], Em7:[52,55,59,62]
  };
  const ARP = [0, 1, 2, 3, 2, 1, 3, 2];
  // each piece: a chord per bar (8 eighth-notes a bar), a melody (null = rest), and how loud each layer is
  const PIECES = {
    // the quiet one: music-box arpeggios and a hanging little theme
    quiet:  { tempo:66,  prog:[CH.Dmaj7, CH.Bm7, CH.Gmaj7, CH.A], arp:0.045, melVol:0.10, pad:0.020, bass:0.10, tick:0,
      mel:[[78,null,81,null,null,79,78,null],[74,null,78,null,81,null,78,76],[79,null,78,null,76,null,74,null],[73,null,76,null,81,null,null,null]] },
    // the show: brighter, quicker, fanfare-ish
    show:   { tempo:108, prog:[CH.D, CH.G, CH.A, CH.D], arp:0.05, melVol:0.13, pad:0.022, bass:0.13, bass2:true, tick:0,
      mel:[[74,null,78,81,null,86,null,null],[79,null,83,null,86,null,83,null],[81,null,85,null,88,null,85,null],[86,null,81,null,78,null,74,null]] },
    // the clock: a pulse, minor-ish, sparse melody
    clock:  { tempo:92,  prog:[CH.Bm, CH.G, CH.D, CH.A], arp:0.03, melVol:0.10, pad:0.022, bass:0.11, tick:0.035,
      mel:[[71,null,null,74,null,null,78,null],[79,null,null,78,null,null,74,null],[74,null,null,78,null,null,81,null],[73,null,null,76,null,null,81,null]] },
    // the tender one: slow, the melody out front
    tender: { tempo:58,  prog:[CH.Gmaj7, CH.D, CH.Bm7, CH.A], arp:0.035, melVol:0.13, pad:0.026, bass:0.10, tick:0,
      mel:[[79,null,83,null,86,null,83,null],[81,null,78,null,74,null,78,null],[78,null,81,null,83,null,81,78],[76,null,73,null,76,null,null,null]] },
    // the playful one for the stamps
    play:   { tempo:98,  prog:[CH.D, CH.A, CH.G, CH.A], arp:0.04, melVol:0.12, pad:0.018, bass:0.12, bass2:true, tick:0,
      mel:[[74,78,null,81,null,78,74,null],[73,76,null,81,null,76,73,null],[71,74,null,79,null,74,71,null],[73,76,81,null,76,null,73,null]] },
    // the gathering: pulse + rising theme
    gather: { tempo:84,  prog:[CH.Bm, CH.G, CH.D, CH.A], arp:0.06, melVol:0.12, pad:0.026, bass:0.14, bass2:true, tick:0.025,
      mel:[[71,null,74,null,78,null,81,null],[74,null,79,null,83,null,86,null],[78,null,81,null,86,null,90,null],[85,null,88,null,85,null,81,null]] },
    // the detonation and after: big and warm
    blast:  { tempo:84,  prog:[CH.D, CH.A, CH.Bm, CH.G], arp:0.08, melVol:0.17, pad:0.034, bass:0.17, bass2:true, tick:0,
      mel:[[86,null,81,null,78,null,81,null],[85,null,88,null,85,null,81,null],[86,null,83,null,78,null,83,null],[86,null,83,null,79,null,83,86]] }
  };
  const M = { on:false, step:0, next:0, bar0:0, timer:null, pending:null, tempo:66, prog:PIECES.quiet.prog, mel:null, arp:0, melVol:0, pad:0, bass:0, bass2:false, tick:0 };
  function playStep(step, t){
    const bar = Math.floor(step / 8), s = step % 8;
    if(s === 0 && M.pending){ Object.assign(M, M.pending); M.pending = null; M.bar0 = bar; }
    const b = bar - M.bar0, len = M.prog.length, ch = M.prog[((b % len) + len) % len], e = 30 / M.tempo;
    if(s === 0){
      ch.forEach(m => padAt(mtof(m), t, e * 8, M.pad));
      if(M.bass) toneAt(mtof(ch[0] - 12), t, e * 7, 'sine', M.bass);
    }
    if(s === 4 && M.bass2 && M.bass) toneAt(mtof(ch[0] - 12), t, e * 3, 'sine', M.bass * 0.8);
    if(M.arp){ const f = mtof(ch[ARP[s]] + 12); toneAt(f, t, 0.9, 'triangle', M.arp); toneAt(f * 2, t, 0.35, 'sine', M.arp * 0.4); }
    if(M.mel && M.melVol){ const row = M.mel[((b % M.mel.length) + M.mel.length) % M.mel.length]; if(row && row[s] != null) bellAt(row[s], t, M.melVol, 1.7); }
    if(M.tick && s % 2 === 0) toneAt(s % 4 === 0 ? 1800 : 1300, t, 0.04, 'square', M.tick);
  }
  function seqTick(){
    const c = actx; if(!c || !M.on) return;
    while(M.next < c.currentTime + 0.35){ playStep(M.step, M.next); M.next += 30 / M.tempo; M.step++; }
  }
  function music(name, immediate){
    const c = ac(); if(!c) return;
    const P = PIECES[name]; if(!P) return;
    const cfg = { tempo:P.tempo, prog:P.prog, mel:P.mel, arp:P.arp, melVol:P.melVol, pad:P.pad, bass:P.bass, bass2:!!P.bass2, tick:P.tick || 0 };
    if(!M.on){
      Object.assign(M, cfg); M.on = true; M.step = 0; M.bar0 = 0; M.pending = null; M.next = c.currentTime + 0.15;
      M.timer = setInterval(seqTick, 80);
    } else if(immediate){ Object.assign(M, cfg); M.bar0 = Math.floor(M.step / 8); M.pending = null; }
    else M.pending = cfg;      // takes over at the next bar line (or straight away if immediate)
  }
  function stopMusic(fadeSec){
    clearInterval(M.timer); M.timer = null; M.on = false; M.pending = null;
    if(actx && master){ try{ const t = actx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + (fadeSec || 1.2)); }catch(e){} }
  }
  const unmute = () => { if(master && actx){ try{ master.gain.cancelScheduledValues(actx.currentTime); master.gain.setValueAtTime(1, actx.currentTime); }catch(e){} } };

  /* ------------------------------------------------------------------ the show: helpers (one show runs at a time) */
  let R = null;
  const W = () => R.stage.clientWidth, H = () => R.stage.clientHeight;
  const wait = ms => new Promise((res, rej) => {
    if(R.dead) return rej(DEAD);
    const p = { rej }; p.t = setTimeout(() => { R.pending.delete(p); res(); }, ms); R.pending.add(p);
  });
  const later = (fn, ms) => { const t = setTimeout(() => { if(!R || R.dead) return; try{ fn(); }catch(e){ console.warn('[leaf-legend-reel]', e); } }, ms); R.timers.add(t); return t; };
  const every = (fn, ms) => { const t = setInterval(() => { if(!R || R.dead) return; fn(); }, ms); R.timers.add(t); return t; };
  const stopEvery = t => { clearInterval(t); if(R) R.timers.delete(t); };
  const tween = (ms, f) => new Promise((res, rej) => {
    if(R.dead) return rej(DEAD);
    const t0 = performance.now();
    const step = now => { if(R.dead) return rej(DEAD); const p = Math.min(1, (now - t0) / ms); f(p); if(p < 1) requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step);
  });
  const el = (cls, text, parent) => { const e = mk(cls, text); (parent || R.stage).appendChild(e); return e; };
  const fx = (node, ms) => { R.stage.appendChild(node); setTimeout(() => node.remove(), ms || 2000); return node; };
  // elements held by an animation (fill-mode forwards) ignore inline opacity, so freeze their current look first, then fade
  const fade = (nodes, ms) => {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    list.forEach(n => { try{ const cs = getComputedStyle(n); n.style.transition = 'none'; n.style.opacity = cs.opacity; if(cs.transform && cs.transform !== 'none') n.style.transform = cs.transform; n.style.animation = 'none'; }catch(e){} });
    if(list[0]) void list[0].offsetWidth;
    list.forEach(n => { n.style.transition = 'opacity ' + (ms || 800) + 'ms'; n.style.opacity = '0'; setTimeout(() => n.remove(), (ms || 800) + 80); });
  };
  const nextFrame = () => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));

  function cap(text){
    const e = R.capEl; clearTimeout(R.capT);
    e.style.opacity = '0';
    if(!text) return;
    R.capT = setTimeout(() => { if(R.dead) return; e.textContent = text; e.style.opacity = '1'; }, 400);
  }
  function tint(c){ R.tint.style.backgroundColor = c; }

  // the firefly
  const orbOn = (x, y) => { const o = el('ll-orb'); o.style.left = x + 'px'; o.style.top = y + 'px'; return o; };
  const orbGo = (o, x, y, ms) => { o.style.transition = 'opacity .45s,transform .12s,left ' + ms + 'ms ease-in-out,top ' + ms + 'ms ease-in-out'; o.style.left = x + 'px'; o.style.top = y + 'px'; return wait(ms); };
  const orbOff = o => { o.style.opacity = '0'; setTimeout(() => o.remove(), 520); };
  function ripple(x, y, bigOne){ const r = mk('ll-ripple' + (bigOne ? ' big' : '')); r.style.left = x + 'px'; r.style.top = y + 'px'; fx(r, 1200); }
  function press(o, x, y, pitch, bigOne){
    o.classList.add('down'); later(() => o.classList.remove('down'), 140);
    ripple(x, y, bigOne); tone(pitch || 660, 0, 0.1, 'triangle', 0.1);
  }

  // little effects
  function sparks(x, y, n, glyphs){
    for(let i = 0; i < n; i++){
      const s = mk('ll-spark', glyphs[i % glyphs.length]), a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 100;
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px'); s.style.setProperty('--fr', (Math.random() * 540 - 270) + 'deg');
      fx(s, 1100);
    }
  }
  function ringAt(x, y, color, sc){ const r = mk('ll-ring'); r.style.left = x + 'px'; r.style.top = y + 'px'; if(color) r.style.setProperty('--c', color); if(sc) r.style.setProperty('--sc', sc); fx(r, 1600); }
  function flash(){ fx(mk('ll-flash'), 1200); }
  function quake(){ const st = R.stage; st.classList.remove('ll-quake'); void st.offsetWidth; st.classList.add('ll-quake'); later(() => st.classList.remove('ll-quake'), 480); }
  function glitch(){ const st = R.stage; st.classList.remove('ll-glitch'); void st.offsetWidth; st.classList.add('ll-glitch'); later(() => st.classList.remove('ll-glitch'), 520); }
  function notesAt(x, w, y, n){
    for(let i = 0; i < n; i++) later(() => { const e = mk('ll-note', ['♪', '♫', '♡'][i % 3]); e.style.left = (x + Math.random() * w) + 'px'; e.style.top = y + 'px'; e.style.setProperty('--nx', ((Math.random() - 0.5) * 80) + 'px'); e.style.setProperty('--nr', ((Math.random() - 0.5) * 60) + 'deg'); fx(e, 1700); }, i * 140);
  }
  function bigText(txt, top, size, delay){ const t = el('ll-big', txt); t.style.top = top; t.style.fontSize = size; t.style.setProperty('--d', (delay || 0) + 's'); return t; }
  function subText(txt, top, delay){ const t = el('ll-sub', txt); t.style.top = top; t.style.setProperty('--d', (delay || 0) + 's'); return t; }
  function meteors(n, spanSec){
    for(let i = 0; i < n; i++){
      const m = mk('ll-met'); m.style.width = rnd(110, 260) + 'px'; m.style.left = rnd(-8, 62) + 'vw'; m.style.top = rnd(-12, 34) + 'vh';
      m.style.setProperty('--t', rnd(0.9, 1.7) + 's'); m.style.setProperty('--d', rnd(0, spanSec) + 's'); fx(m, (spanSec + 2) * 1000);
    }
  }

  // leaves that never stop drifting through the sky
  const LEAVES = ['🍃', '🍂', '🍃', '🌿', '🍁'];
  function leaf(i){
    const d = mk('ll-leaf', LEAVES[(i == null ? Math.floor(Math.random() * LEAVES.length) : i) % LEAVES.length]), fd = rnd(6, 10);
    d.style.left = rnd(0, 96) + '%'; d.style.fontSize = rnd(1.1, 2.3) + 'rem';
    d.style.setProperty('--sw', rnd(-160, 160) + 'px'); d.style.setProperty('--fr', rnd(-540, 540) + 'deg'); d.style.setProperty('--fd', fd + 's');
    fx(d, fd * 1000 + 300);
  }
  function drift(ms){ if(R.leafT) stopEvery(R.leafT); R.leafT = ms ? every(() => leaf(), ms) : null; }
  function leafStorm(n){
    for(let i = 0; i < n; i++){
      const b = mk('ll-fly', LEAVES[i % LEAVES.length]), a = Math.random() * Math.PI * 2, d = 120 + Math.random() * Math.max(W(), H()) * 0.7;
      b.style.fontSize = rnd(1.3, 2.8) + 'rem'; b.style.setProperty('--dx', Math.cos(a) * d + 'px'); b.style.setProperty('--dy', Math.sin(a) * d + 'px');
      b.style.setProperty('--fr', rnd(-720, 720) + 'deg'); b.style.setProperty('--bt', rnd(1.4, 2.6) + 's'); b.style.setProperty('--bd', rnd(0, 0.5) + 's');
      fx(b, 3400);
    }
  }

  // the tray of five eggs
  const slotXY = i => { const s = R.slots[i].getBoundingClientRect(), b = R.stage.getBoundingClientRect(); return [s.left - b.left + s.width / 2, s.top - b.top + s.height / 2]; };
  const CHIME = [74, 78, 81, 83, 86];
  async function hatch(i, x, y){
    const e = el('ll-egg pop', '🥚'); e.style.left = x + 'px'; e.style.top = y + 'px';
    sparks(x, y, 10, ['✨', '🍃', '✦']); flash(); bell(CHIME[i] - 12, 0, 0.14, 2.4); bell(CHIME[i], 0.12, 0.12, 2);
    await wait(1000);
    const p = slotXY(i); e.style.left = p[0] + 'px'; e.style.top = p[1] + 'px'; e.style.fontSize = '1.5rem';
    tone(500, 0, 0.5, 'sine', 0.06, 1200);
    await wait(1350);
    R.slots[i].classList.add('full'); e.remove();
    bell(CHIME[i] + 12, 0, 0.1, 1.8); sparks(p[0], p[1], 6, ['✦', '✨']);
    cap(['one of five', 'two of five', 'three of five', 'four of five', 'five of five'][i]);
    await wait(1400);
  }

  /* ------------------------------------------------------------------ scenes */
  // 1 - the wishing star
  async function sWish(){
    cap('the first one was a star');
    const w = W(), h = H(), sx = w * 0.8, sy = h * 0.24;
    const st = el('ll-wstar', '✦'); st.style.left = sx + 'px'; st.style.top = sy + 'px';
    await wait(2400);
    const o = orbOn(w * 0.18, h * 0.72);
    await orbGo(o, sx - 4, sy + 4, 1700);
    await wait(250); press(o, sx, sy, 880, true); await wait(350); orbOff(o);
    cap('');
    // it streaks to the middle and grows
    st.style.transition = 'left 1.2s ease-in-out,top 1.2s cubic-bezier(.2,1.1,.4,1),transform 1.2s ease-in';
    await nextFrame();
    st.style.left = (w / 2) + 'px'; st.style.top = (h * 0.4) + 'px'; st.style.transform = 'translate(-50%,-50%) scale(7)';
    tone(300, 0, 1.2, 'sine', 0.1, 1500);
    await wait(1250);
    st.remove(); flash(); ringAt(w / 2, h * 0.4); later(() => ringAt(w / 2, h * 0.4), 250);
    [86, 90, 93, 98].forEach((m, i) => bell(m, i * 0.09, 0.1, 2.2)); bell(62, 0, 0.16, 3);
    launchHeartBurst();
    meteors(44, 3.4);
    bigText('make a wish', '33%', 'clamp(3rem,12vw,6.5rem)', 0.2);
    subText('it is already on its way ♡', 'calc(33% + clamp(3.4rem,13vw,7rem))', 1.3);
    await wait(5200);
    fade([...R.stage.querySelectorAll('.ll-big,.ll-sub')], 800);
    await wait(900);
    await hatch(0, w / 2, h * 0.4);
  }

  // 2 - the marquee
  async function sMarquee(){
    cap('the second one likes attention');
    const w = W(), h = H();
    const sign = el('ll-sign'); sign.textContent = 'THE FINAL SHOW';
    await wait(300); sign.classList.add('in'); tone(300, 0, 0.5, 'sine', 0.1, 700);
    await wait(1300);
    const o = orbOn(w * 0.85, h * 0.78);
    await orbGo(o, w / 2 + 40, h * 0.44, 1500);
    for(let k = 0; k < 4; k++){
      press(o, w / 2 + 40, h * 0.44, 520 + k * 110, k === 3);
      sign.classList.remove('tap'); void sign.offsetWidth; sign.classList.add('tap');
      if(k === 1) music('show');
      await wait(k === 3 ? 400 : 560);
    }
    orbOff(o); cap('');
    // the sign blows up and the lights come on round the whole screen
    sign.classList.add('go'); flash();
    [74, 81, 86, 90, 93].forEach((m, i) => { tone(mtof(m), i * 0.11, 0.9, 'triangle', 0.13); tone(mtof(m), i * 0.11, 0.9, 'sawtooth', 0.025); });
    noise(2, 0.12, 1800, 2800); noise(1.6, 0.1, 2400, 3200, 0.8);
    const grp = [], step = 34, pad = 16; let bi = 0;
    const bulb = (x, y) => { const b = el('ll-bulb'); b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.setProperty('--d', ((bi++ % 6) * 0.15) + 's'); grp.push(b); };
    for(let x = pad; x <= w - pad; x += step){ bulb(x, pad); bulb(x, h - pad); }
    for(let y = pad + step; y < h - pad; y += step){ bulb(pad, y); bulb(w - pad, y); }
    [['-38deg', '6deg'], ['38deg', '-6deg']].forEach(a => { const bm = el('ll-beam'); bm.style.setProperty('--a0', a[0]); bm.style.setProperty('--a1', a[1]); grp.push(bm); });
    tint('rgba(30,10,0,.5)');
    const roll = el('ll-roll');
    CREDITS.forEach(([hd, p, c]) => { if(hd){ const h5 = document.createElement('h5'); h5.textContent = hd; roll.appendChild(h5); } if(p){ const pp = document.createElement('p'); if(c) pp.className = c; pp.textContent = p; roll.appendChild(pp); } });
    grp.push(roll);
    launchConfetti(); later(launchHeartBurst, 1200); later(launchConfetti, 5600); later(launchHeartBurst, 3600);
    later(() => { sign.remove(); }, 900);
    await wait(10000);
    // the lights go out as the credits finish; a round of applause
    noise(2.2, 0.12, 2000, 3000); noise(1.8, 0.1, 2600, 3400, 0.6);
    fade(grp, 900); tint('rgba(0,0,0,0)');
    await wait(1500);
    await hatch(1, w / 2, h * 0.46);
  }

  // 3 - the clock
  async function sClock(){
    music('clock'); cap('the third one does not like being poked');
    const w = W(), h = H();
    let ticks = ''; for(let k = 0; k < 12; k++) ticks += '<line x1="0" y1="-84" x2="0" y2="' + (k % 3 === 0 ? -70 : -77) + '" stroke="#ffd76a" stroke-width="' + (k % 3 === 0 ? 4 : 2) + '" transform="rotate(' + (k * 30) + ')"/>';
    const small = Math.min(Math.min(w, h) * 0.34, 190), big = Math.min(Math.min(w, h) * 0.66, 400);
    const clk = el('ll-clk'); clk.style.setProperty('--cs', small + 'px');
    clk.innerHTML = '<svg viewBox="-100 -100 200 200" width="100%" height="100%"><circle r="94" fill="rgba(28,14,6,.92)" stroke="#ffd76a" stroke-width="3"/><circle r="88" fill="none" stroke="rgba(255,215,106,.35)" stroke-width="1"/>' + ticks +
      '<g class="ll-hh"><line x1="0" y1="8" x2="0" y2="-42" stroke="#fff3d6" stroke-width="5" stroke-linecap="round"/></g><g class="ll-hm"><line x1="0" y1="10" x2="0" y2="-64" stroke="#ffd76a" stroke-width="3.5" stroke-linecap="round"/></g><circle r="5" fill="#ffd76a"/></svg>';
    await nextFrame(); clk.classList.add('in');
    await wait(1800);
    const cx = w / 2, cy = h * 0.46, o = orbOn(w * 0.1, h * 0.8);
    await orbGo(o, cx + small * 0.2, cy + small * 0.1, 1500);
    for(let k = 0; k < 4; k++){
      press(o, cx + small * 0.2, cy + small * 0.1, 300 + k * 40);
      clk.classList.remove('poke'); void clk.offsetWidth; clk.classList.add('poke');
      tone(240, 0.05, 0.14, 'square', 0.05, 170);
      await wait(k < 3 ? 720 : 520);
    }
    cap('');
    press(o, cx + small * 0.2, cy + small * 0.1, 200, true); orbOff(o);
    // it loses it: grows, spins, time spirals in
    clk.style.setProperty('--cs', big + 'px'); clk.classList.add('spin');
    const orbs = ['⏰', '🕰️', '⌛', '⏳', '🕐', '⏱️'];
    for(let k = 0; k < 18; k++){ const n = el('ll-orbit', orbs[k % orbs.length]); n.style.setProperty('--a', (k * 20) + 'deg'); n.style.setProperty('--d', (k * 0.09) + 's'); setTimeout(() => n.remove(), 5000); }
    glitch();
    // ticks speed up under the spin
    let at = 0, gap = 0.34; for(let k = 0; k < 26; k++){ tone(k % 2 ? 1300 : 1800, at, 0.04, 'square', 0.05); at += gap; gap = Math.max(0.045, gap * 0.86); }
    tone(120, 0, 2.8, 'sine', 0.08, 360);
    await wait(3300);
    flash(); ringAt(cx, cy); later(() => ringAt(cx, cy), 220); quake(); glitch();
    bell(62, 0, 0.22, 4); bell(74, 0, 0.12, 3.4); bell(86, 0.02, 0.07, 2.8);
    bigText('time flies', '70%', 'clamp(2.6rem,10vw,5rem)', 0.1);
    subText('when you are being a bestie ♡', 'calc(70% + clamp(3rem,11vw,5.4rem))', 0.9);
    launchHeartBurst(); later(launchHeartBurst, 600);
    await wait(4200);
    fade([...R.stage.querySelectorAll('.ll-big,.ll-sub')], 800);
    clk.classList.add('gone');
    await wait(900);
    await hatch(2, cx, cy);
  }

  // 4 - the constellation
  async function sHeart(){
    music('tender'); cap('the fourth only needed a word');
    const w = W(), h = H();
    tint('rgba(30,18,80,.28)');
    const typed = el('ll-typed'); typed.style.top = '40%';
    const cur = document.createElement('u'); typed.appendChild(cur);
    await wait(1800);
    const word = 'bestie';
    for(let k = 0; k < word.length; k++){
      const b = document.createElement('b'); b.textContent = word[k]; typed.insertBefore(b, cur);
      bell(CHIME[k % 5] + 12, 0, 0.07, 1.4); tone(900, 0, 0.03, 'square', 0.03);
      await wait(420);
    }
    await wait(700);
    cap('');
    tone(300, 0, 0.5, 'sine', 0.08, 900);
    fade(typed, 700);
    await wait(500);
    // the heart draws itself, star by star
    const d = 'M ' + HEART_POINTS.map(p => p.join(',')).join(' L ') + ' Z';
    let stars = ''; HEART_POINTS.forEach((p, i) => { const dl = (0.3 + (i / HEART_POINTS.length) * 3.2).toFixed(2) + 's'; stars += '<circle class="ll-hr" cx="' + p[0] + '" cy="' + p[1] + '" r="2.2" style="--d:' + dl + '"/><circle class="ll-hs" cx="' + p[0] + '" cy="' + p[1] + '" r="1.5" style="--d:' + dl + '"/>'; });
    const svg = el('ll-hsvg');
    svg.innerHTML = '<svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow:visible"><path class="ll-hline" pathLength="1" d="' + d + '"/>' + stars + '</svg>';
    HEART_POINTS.forEach((p, i) => later(() => { bell(CHIME[i % 5] + (i > 6 ? 12 : 0), 0, 0.08, 1.6); }, 300 + (i / HEART_POINTS.length) * 3200));
    meteors(4, 4);
    await wait(3900);
    svg.classList.add('beat');
    tone(80, 0, 0.3, 'sine', 0.3, 50); tone(80, 0.5, 0.3, 'sine', 0.25, 50); later(() => { tone(80, 0, 0.3, 'sine', 0.3, 50); tone(80, 0.5, 0.3, 'sine', 0.25, 50); }, 1200);
    bigText('14 stars', '82%', 'clamp(2.4rem,9vw,4.4rem)', 0.1);
    subText('one for every day of the real countdown ♡', 'calc(82% + clamp(2.8rem,10vw,5rem))', 0.9);
    launchHeartBurst(); later(launchHeartBurst, 1200);
    await wait(4200);
    fade([...R.stage.querySelectorAll('.ll-big,.ll-sub')], 800);
    fade(svg, 900); tint('rgba(0,0,0,0)');
    await wait(1000);
    await hatch(3, w / 2, h * 0.46);
  }

  // 5 - the last minute
  async function sStamps(){
    music('play'); cap('and the fifth noticed your impatience');
    const w = W(), h = H(), top = h * 0.26;
    const tm = el('ll-timer'); tm.style.top = (top - 40) + 'px'; tm.innerHTML = '0:58<small>the final minute</small>';
    const label = tm.firstChild;
    await wait(1600);
    const o = orbOn(w * 0.9, h * 0.62);
    await orbGo(o, w / 2, top + 30, 1300);
    tm.classList.add('jit');
    // faster and faster
    let secs = 58, gap = 360;
    for(let k = 0; k < 11; k++){
      press(o, w / 2 + rnd(-30, 30), top + 30 + rnd(-10, 14), 560 + (k % 4) * 70);
      secs -= 3 + k; label.textContent = '0:' + String(Math.max(secs, 3)).padStart(2, '0');
      await wait(gap); gap = Math.max(130, gap - 28);
    }
    label.textContent = '0:01'; tm.classList.remove('jit'); orbOff(o); cap('');
    await wait(500);
    fade(tm, 700);
    // the Office of Bestie Affairs responds
    const stamps = [
      { txt:'Patience, bestie', c:'#d8584a', r:'-9deg', y:'36%', fs:'clamp(1.6rem,7.5vw,3.4rem)', d:0.3 },
      { txt:'Nearly there',     c:'#e0a53a', r:'6deg',  y:'54%', fs:'clamp(1.4rem,6.5vw,3rem)',   d:1.6 },
      { txt:'♡ Approved ♡',     c:'#7fc47a', r:'-3deg', y:'72%', fs:'clamp(1.7rem,8vw,3.6rem)',   d:2.9 }
    ];
    const grp = [];
    stamps.forEach((s, i) => {
      const e = el('ll-stamp', s.txt); e.style.setProperty('--c', s.c); e.style.setProperty('--r', s.r); e.style.setProperty('--y', s.y); e.style.setProperty('--fs', s.fs); e.style.setProperty('--d', s.d + 's'); grp.push(e);
      later(() => {
        quake(); tone(110, 0, 0.3, 'sine', 0.4, 42); noise(0.18, 0.2, 400, 120); bell(CHIME[i] + 12, 0.05, 0.08, 1.4);
        const cy = parseFloat(s.y) / 100 * H();
        for(let k = 0; k < 16; k++){
          const ink = el('ll-ink'), sz = rnd(4, 13), a = rnd(0, 6.28), dist = rnd(80, Math.min(W() * 0.45, 260));
          ink.style.width = ink.style.height = sz + 'px'; ink.style.left = (W() / 2) + 'px'; ink.style.top = cy + 'px'; ink.style.setProperty('--c', s.c);
          ink.style.setProperty('--dx', Math.cos(a) * dist + 'px'); ink.style.setProperty('--dy', Math.sin(a) * dist * 0.6 + 'px'); setTimeout(() => ink.remove(), 700);
        }
        if(i === 2){ launchConfetti(); launchHeartBurst(); later(launchHeartBurst, 500); }
      }, s.d * 1000 + 200);
    });
    const sub = subText('The Office of Bestie Affairs thanks you for your patience.', '86%', 3.6); grp.push(sub);
    await wait(7000);
    fade(grp, 900);
    await wait(1000);
    await hatch(4, w / 2, h * 0.5);
  }

  /* ------------------------------------------------------------------ the finale */
  async function sFinale(){
    const w = W(), h = H(), cx = w / 2, cy = h * 0.47, Rr = Math.min(150, w * 0.34);
    music('gather'); cap('five secrets, side by side');
    const eggs = [];
    for(let i = 0; i < 5; i++){
      const p = slotXY(i), e = el('ll-egg', '🥚'); e.style.left = p[0] + 'px'; e.style.top = p[1] + 'px'; e.style.fontSize = '1.5rem'; eggs.push(e);
    }
    R.slots.forEach(s => s.classList.remove('full'));
    R.tray.classList.remove('on');
    await nextFrame();
    const ang = (i, off) => (i / 5) * Math.PI * 2 - Math.PI / 2 + off;
    eggs.forEach((e, i) => { e.style.fontSize = '2.7rem'; e.style.left = (cx + Math.cos(ang(i, 0)) * Rr) + 'px'; e.style.top = (cy + Math.sin(ang(i, 0)) * Rr) + 'px'; });
    tone(200, 0, 1.4, 'sine', 0.08, 700);
    await wait(1700);
    eggs.forEach(e => { e.style.transition = 'none'; });
    const core = el('ll-core'); await nextFrame(); core.style.setProperty('--s', '.5');
    cap('');
    // they circle faster and faster; the core swells
    noise(4, 0.07, 300, 3000);
    tone(110, 0, 4.2, 'sawtooth', 0.025, 330);
    const OFF = Math.PI * 4;
    await tween(4200, p => {
      const off = easeIn(p) * OFF, rr = Rr * (1 - 0.08 * p);
      eggs.forEach((e, i) => { e.style.left = (cx + Math.cos(ang(i, off)) * rr) + 'px'; e.style.top = (cy + Math.sin(ang(i, off)) * rr) + 'px'; });
      core.style.setProperty('--s', (0.5 + p * 0.5).toFixed(3));
    });
    // one by one, they crack and feed the core
    const rr = Rr * 0.92;
    const GL = [['🌠', '✦', '✨'], ['💡', '🎬', '✨'], ['⏰', '⌛', '✨'], ['💖', '♡', '✨'], ['🔖', '💌', '✨']];
    const COL = ['#ffd76a', '#ffb830', '#7fb8ff', '#ff8fb0', '#8fe08a'];
    for(let i = 0; i < 5; i++){
      const x = cx + Math.cos(ang(i, OFF)) * rr, y = cy + Math.sin(ang(i, OFF)) * rr;
      eggs[i].classList.add('crack');
      sparks(x, y, 12, GL[i]);
      const tr = mk('ll-trail', '✨'); tr.style.left = x + 'px'; tr.style.top = y + 'px'; R.stage.appendChild(tr);
      requestAnimationFrame(() => requestAnimationFrame(() => { tr.style.left = cx + 'px'; tr.style.top = cy + 'px'; tr.style.opacity = '0'; tr.style.fontSize = '.4rem'; })); setTimeout(() => tr.remove(), 900);
      core.style.setProperty('--s', (1 + (i + 1) * 0.42).toFixed(2));
      ringAt(x, y, COL[i], 22);
      // each egg gives the core its own little sound
      if(i === 0){ [88, 93, 98].forEach((m, k) => bell(m, k * 0.08, 0.09, 1.8)); }
      if(i === 1){ [74, 78, 81].forEach(m => { tone(mtof(m), 0, 0.8, 'triangle', 0.11); tone(mtof(m), 0, 0.8, 'sawtooth', 0.02); }); }
      if(i === 2){ for(let k = 0; k < 4; k++) tone(k % 2 ? 1300 : 1800, k * 0.1, 0.04, 'square', 0.06); bell(74, 0.45, 0.14, 2); }
      if(i === 3){ tone(80, 0, 0.3, 'sine', 0.3, 50); tone(80, 0.28, 0.3, 'sine', 0.25, 50); }
      if(i === 4){ tone(110, 0, 0.3, 'sine', 0.4, 42); noise(0.18, 0.2, 400, 120); }
      bell(CHIME[i] + 12, 0.05, 0.13, 2);
      if(i % 2 === 0) launchHeartBurst();
      await wait(620);
    }
    await wait(450);
    // the core detonates
    music('blast', true);
    flash(); R.stage.classList.add('ll-shake'); later(() => R.stage.classList.remove('ll-shake'), 1300);
    core.style.transition = 'transform .5s ease-in,opacity .5s ease-in'; core.style.setProperty('--s', '12'); core.style.opacity = '0';
    [0, 250, 500, 800].forEach(d => later(() => ringAt(cx, cy, '#ffd76a', 34), d));
    for(let k = 0; k < 16; k++){ const r = el('ll-ray'); r.style.setProperty('--a', (k * 22.5) + 'deg'); r.style.setProperty('--d', ((k % 4) * 0.06) + 's'); setTimeout(() => r.remove(), 3000); }
    noise(2.6, 0.2, 800, 6000); tone(55, 0, 2.2, 'sine', 0.4, 38);
    [62, 66, 69, 74, 78, 81, 86, 90].forEach((m, k) => bell(m, k * 0.06, 0.12, 3.2));
    tint('rgba(120,70,0,.25)');
    [0, 350, 700, 1100].forEach(d => later(() => { launchConfetti(); launchHeartBurst(); }, d));
    leafStorm(80); drift(140);
    const ban = el('ll-banner');
    (OPTS.banner || 'LEAF LEGEND').split('').forEach((ch, i) => { const sp = document.createElement('span'); sp.textContent = ch === ' ' ? '\u00a0' : ch; sp.style.setProperty('--d', (0.3 + i * 0.07) + 's'); ban.appendChild(sp); });
    eggs.forEach(e => e.remove());
    await wait(4200);
    // it settles; the title lifts away and a short note takes its place
    ban.style.setProperty('--bt', '16%'); drift(420); tint('rgba(0,0,0,0)'); music('tender');
    await wait(1700);
    const line = el('ll-line');
    for(const [txt, ms] of NOTE_LINES){
      line.classList.remove('in'); await wait(900);
      line.textContent = txt; line.classList.add('in');
      await wait(ms);
    }
    line.classList.remove('in');
    await wait(800);
    const sig = el('ll-sig', 'Bestie Tristan ♡'); await nextFrame(); sig.classList.add('in');
    launchHeartBurst();
    await wait(3600);
    fade([sig, ban], 1200);
    await wait(1400);
  }

  async function show(){
    // prologue: the sky comes out, the leaves start to drift, five empty slots appear
    R.sky.classList.add('on');
    music('quiet');
    drift(900);
    await wait(1200);
    R.tray.classList.add('on');
    cap('five little secrets');
    await wait(3000);
    cap('');
    await wait(500);
    await sWish();
    await sMarquee();
    await sClock();
    await sHeart();
    await sStamps();
    await sFinale();
  }

  /* ------------------------------------------------------------------ entry point */
  function build(o){
    const root = mk('ll-root'); o.appendChild(root);
    const stage = mk('ll-stage', null, root);
    const sky = mk('ll-sky', null, stage);
    for(let i = 0; i < 70; i++){
      const s = mk('ll-star', null, sky), z = 1 + Math.random() * 2.2;
      s.style.left = (Math.random() * 100) + '%'; s.style.top = (Math.random() * 100) + '%'; s.style.width = s.style.height = z + 'px';
      s.style.setProperty('--tw', (2 + Math.random() * 3) + 's'); s.style.setProperty('--td', (-Math.random() * 4) + 's');
    }
    const tintEl = mk('ll-tint', null, stage), capEl = mk('ll-cap', null, root);
    const tray = mk('ll-tray', null, stage), slots = [];
    for(let i = 0; i < 5; i++){ const s = mk('ll-slot', null, tray); s.appendChild(document.createElement('i')).textContent = '🥚'; slots.push(s); }
    R = { root, stage, sky, tint:tintEl, capEl, tray, slots, dead:false, pending:new Set(), timers:new Set(), capT:null, leafT:null };
    return R;
  }
  function abort(){
    if(!R || R.dead) return;
    R.dead = true;
    R.pending.forEach(p => { clearTimeout(p.t); p.rej(DEAD); }); R.pending.clear();
    R.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); R.timers.clear();
  }

  let OPTS = {};
  function play(o, next, opts){
    OPTS = opts || {};
    injectCSS();
    if(reduced()){
      if(typeof window.lgxGrandFinale === 'function'){ window.lgxGrandFinale(o); setTimeout(next, 6800); } else next();
      return;
    }
    return run(o, next);
  }
  async function run(o, next){
    build(o);
    const myR = R;
    ac(); unmute();
    // Browsers keep audio off until someone has tapped the page. If so, a small hint appears and any tap switches the sound on.
    let hint = null, skipped = false;
    const unlock = () => { ac(); if(hint){ hint.remove(); hint = null; } };
    const onKey = e => { if(e.key === 'Escape'){ skipped = true; abort(); } else unlock(); };
    document.addEventListener('pointerdown', unlock); document.addEventListener('keydown', onKey);
    setTimeout(() => { if(actx && actx.state === 'suspended' && !myR.dead){ hint = mk('ll-snd', 'tap for sound ♪', myR.root); } }, 700);

    try{ await show(); }catch(e){ if(e !== DEAD) console.warn('[leaf-legend-reel]', e); }
    document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', onKey);
    if(hint){ hint.remove(); hint = null; }
    abort();
    stopEvery(myR.leafT);
    // skipped: clear the stage and give it a quick little celebration so it doesn't just stop
    if(skipped){
      [...myR.stage.children].forEach(n => { if(!n.classList.contains('ll-sky')) n.remove(); });
      myR.capEl.remove();
      try{ launchConfetti(); launchHeartBurst(); }catch(e){}
      await new Promise(res => setTimeout(res, 900));
    }
    stopMusic(1.4);
    myR.root.style.opacity = '0';
    setTimeout(() => { myR.root.remove(); if(R === myR) R = null; next(); }, 950);
  }

  window.LeafLegendReel = { play };
})();
