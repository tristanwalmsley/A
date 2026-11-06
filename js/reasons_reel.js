/* ==========================================================================
   reasons_reel.js - the Prestige II celebration for Secret Keeper.
   One continuous piece built from all 21 secrets on the reasons page. Not 21 clips back to back: there is one night sky,
   one card that travels through the whole thing, overlapping hand-offs (the rain from one secret is still falling when the
   next starts), a soft music bed that changes chord per act, and a quiet caption line that tells the story.

   Loaded on the home page after eggs.js and before home.js. home.js calls:
       ReasonsReel.play(overlay, finale, next)
   - overlay = the celebration overlay
   - finale(cb) = the old wall-of-cards -> heart -> burst animation, which closes the piece (cb = "I'm done")
   - next() = carries on to the badge medal

   Four acts:   I  the quiet ones   (peek, star, read-all)            + the constellation starts to appear
                II play             (beans, noodles, doorbell, 2am, doobe, adam, yeah)
                III chaos           (bus, muscle, foam finger, error boxes, energy, the ghost)
                IV the tender part  (sea, heart, the constellation joins up, thank you, the song) -> finale
   There are no buttons. (Escape skips to the finale on a keyboard.)
   To change wording: the CAPTIONS live next to each scene (cap('...')). To reorder: edit show() at the bottom.
   ========================================================================== */
(function(){
  'use strict';
  const NS = 'http://www.w3.org/2000/svg', DEAD = { dead:true };
  const reduced = () => { try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

  /* ------------------------------------------------------------------ styles */
  const CSS = `
.rr-root{position:absolute;inset:0;z-index:0;pointer-events:none;font-family:'EB Garamond',Georgia,serif;color:#3a2010;transition:opacity .6s}
.rr-stage{position:absolute;inset:0;overflow:hidden}
.rr-stage.rr-quake{animation:rrQuake .4s ease-in-out}
@keyframes rrQuake{0%,100%{transform:translate(0,0)}20%{transform:translate(-6px,4px)}40%{transform:translate(6px,-4px)}60%{transform:translate(-4px,3px)}80%{transform:translate(3px,-2px)}}

/* sky, tint, caption */
.rr-sky{position:absolute;inset:0;z-index:0;opacity:0;transition:opacity 3s}
.rr-sky.on{opacity:1}
.rr-star{position:absolute;border-radius:50%;background:#fff6d8;animation:rrTwinkle var(--tw) ease-in-out var(--td) infinite}
@keyframes rrTwinkle{0%,100%{opacity:.15;transform:scale(.8)}50%{opacity:.9;transform:scale(1.2)}}
.rr-tint{position:absolute;inset:0;z-index:0;background-color:rgba(0,0,0,0);transition:background-color 4s}
.rr-cap{position:absolute;left:0;right:0;bottom:6%;z-index:90;text-align:center;padding:0 1.5rem;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.05rem,3.6vw,1.5rem);color:#f3e6c8;text-shadow:0 2px 14px rgba(0,0,0,.75),0 0 18px rgba(232,185,90,.45);opacity:0;transition:opacity .45s;letter-spacing:.5px}
.rr-snd{position:absolute;right:1rem;top:1rem;z-index:95;font-family:'Caveat',cursive;font-size:1.15rem;color:rgba(250,244,232,.7);letter-spacing:1px;animation:rrBob 1.6s ease-in-out infinite}
@keyframes rrBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}

/* the one card */
.rr-slot{position:absolute;left:50%;top:46%;width:min(86vw,440px);transform:translate(-50%,-50%);z-index:2;opacity:0}
.rr-card{position:relative;background:#fffdf5;border:1px solid #d4b483;padding:.9rem 1.1rem;font-size:1.05rem;line-height:1.7;color:#3a2010;box-shadow:0 12px 44px rgba(0,0,0,.5);transform-origin:50% 50%}
.rr-card.hid{background:rgba(255,253,245,.1);border-color:rgba(255,255,255,.22);color:rgba(255,255,255,.4);font-family:'Caveat',cursive;font-size:1.15rem;letter-spacing:2px;text-align:center;box-shadow:none}
.rr-card.pop{animation:rrPop .45s ease}
@keyframes rrPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
.rr-card.press{transform:scale(.96) translateY(2px);box-shadow:inset 0 3px 10px rgba(58,32,16,.25)}
.rr-card.ring{animation:rrRing .9s ease-out}
@keyframes rrRing{0%{box-shadow:0 0 0 0 rgba(200,148,58,.8)}100%{box-shadow:0 0 0 30px rgba(200,148,58,0)}}
.rr-card.shake{animation:rrShake .5s ease-in-out}
@keyframes rrShake{0%,100%{transform:rotate(0)}15%{transform:rotate(-4deg) scale(1.03)}30%{transform:rotate(4deg) scale(1.03)}45%{transform:rotate(-3deg)}60%{transform:rotate(3deg)}75%{transform:rotate(-1.5deg)}}
.rr-card.peeking{animation:rrPeek 2s linear forwards}
@keyframes rrPeek{0%{transform:translate(0,0)}20%{transform:translate(1px,1px) rotate(.4deg)}40%{transform:translate(2px,-1px) rotate(.8deg)}60%{transform:translate(3px,0) rotate(1.2deg);box-shadow:0 0 14px 2px rgba(200,148,58,.3)}80%{transform:translate(-4px,-1px) rotate(-1.6deg);box-shadow:0 0 24px 4px rgba(200,148,58,.5)}100%{transform:translate(5px,0) rotate(1.8deg);box-shadow:0 0 38px 8px rgba(200,148,58,.75)}}
.rr-card.doobe{animation:rrDoobe 1.8s ease-in-out}
@keyframes rrDoobe{0%{transform:scale(1,1)}12%{transform:scale(1.08,.86)}25%{transform:scale(.92,1.18) rotate(-2deg)}38%{transform:scale(1.1,.88) rotate(2deg)}52%{transform:scale(.94,1.14) rotate(-2deg)}66%{transform:scale(1.06,.92)}80%{transform:scale(1.02,1.2)}100%{transform:scale(1,1)}}
.rr-col .rr-card{margin-bottom:.55rem;font-size:.95rem;padding:.6rem .9rem;line-height:1.5}
.rr-count{margin-top:.6rem;text-align:center;font-family:'Caveat',cursive;font-size:1.3rem;color:#d4b483;letter-spacing:1px}
.rr-end{position:absolute;left:0;right:0;bottom:18%;z-index:30;text-align:center;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.6rem,6vw,2.6rem);color:#faf4e8;text-shadow:0 0 22px rgba(232,185,90,.8);animation:rrPop .6s ease both;transition:opacity .6s}

/* the firefly that stands in for a finger, and the ripple for a tap */
.rr-orb{position:absolute;z-index:40;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:radial-gradient(circle,#fff8d6 0,rgba(255,215,106,.55) 55%,rgba(255,215,106,0) 72%);box-shadow:0 0 22px 7px rgba(255,215,106,.45);pointer-events:none;transition:opacity .45s,transform .12s;animation:rrOrbIn .4s ease both}
@keyframes rrOrbIn{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}
.rr-orb.down{transform:scale(.7)}
.rr-ripple{position:absolute;z-index:40;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid rgba(255,243,196,.9);box-shadow:0 0 14px rgba(255,215,106,.6);pointer-events:none;animation:rrRip .85s ease-out forwards}
.rr-ripple.big{border-width:3px;animation-name:rrRipBig;animation-duration:1.1s}
@keyframes rrRip{from{transform:scale(.3);opacity:1}to{transform:scale(4.5);opacity:0}}
@keyframes rrRipBig{from{transform:scale(.3);opacity:1}to{transform:scale(9);opacity:0}}

/* shared fx */
.rr-fx{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:20}
.rr-drop{position:absolute;top:-4rem;animation:rrFall var(--fd) linear var(--fdl) forwards}
@keyframes rrFall{to{transform:translateY(112vh) rotate(var(--fr))}}
.rr-note{position:absolute;z-index:25;pointer-events:none;color:#c8943a;font-size:1.6rem;animation:rrNote 1.6s ease-out forwards}
@keyframes rrNote{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--nx),-130px) rotate(var(--nr))}}
.rr-spark{position:absolute;z-index:26;pointer-events:none;color:#ffe9a0;font-size:1.1rem;animation:rrSpark .9s ease-out forwards}
@keyframes rrSpark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(.3)}}
.rr-word{position:absolute;z-index:26;pointer-events:none;font-family:'Caveat',cursive;font-weight:700;font-size:2.2rem;color:#f3d27a;text-shadow:0 0 14px rgba(200,148,58,.8);animation:rrWord 1.3s ease-out forwards}
@keyframes rrWord{0%{opacity:0;transform:translateY(8px) scale(.7)}20%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-34px)}}
.rr-big{position:absolute;left:50%;top:42%;z-index:59;transform:translate(-50%,-50%);font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(2.2rem,10vw,5.5rem);color:#fff;text-shadow:0 0 24px rgba(160,220,255,.9);pointer-events:none;white-space:nowrap;text-align:center;animation:rrBig 2.8s ease forwards}
@keyframes rrBig{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}22%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1)}}

/* star */
.rr-shoot{position:absolute;width:46px;height:46px;z-index:20;animation:rrShoot 3.8s cubic-bezier(.3,.1,.6,1) forwards}
.rr-shoot::before{content:'\\2726';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:22px;color:#fff3c4;text-shadow:0 0 12px #ffd76a,0 0 26px rgba(255,215,106,.8)}
.rr-shoot::after{content:'';position:absolute;left:50%;top:50%;width:200px;height:2px;transform-origin:left center;transform:rotate(var(--ang));background:linear-gradient(90deg,rgba(255,243,196,.95),rgba(255,243,196,0))}
@keyframes rrShoot{0%{opacity:0;transform:translate(0,0)}8%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy))}}
.rr-wish{position:absolute;left:0;right:0;top:20%;z-index:30;text-align:center;font-family:'Caveat',cursive;font-size:2.4rem;color:#fff3c4;text-shadow:0 0 18px rgba(255,215,106,.9);opacity:0;transition:opacity 1s;letter-spacing:2px}
.rr-wish.in{opacity:1}

/* beans + noodles */
.rr-bean{position:absolute;z-index:22;pointer-events:none;font-size:1.5rem;animation:rrBean 1.3s ease-in forwards}
@keyframes rrBean{to{transform:translate(var(--bx),var(--by)) rotate(var(--br));opacity:.9}}
.rr-noodle{position:absolute;inset:0;width:100%;height:100%;z-index:22;pointer-events:none}
.rr-noodle path{fill:none;stroke:#f3d27a;stroke-width:5;stroke-linecap:round;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}

/* 2am */
.rr-sms{position:absolute;left:50%;top:50%;z-index:24;width:min(86vw,330px);transform:translate(-50%,-50%) scale(.85);opacity:0;transition:opacity .4s,transform .5s cubic-bezier(.34,1.56,.64,1);background:#14100c;border:1px solid rgba(255,255,255,.15);border-radius:26px;padding:1.1rem 1rem 1.3rem;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 0 6px rgba(255,255,255,.04)}
.rr-sms.in{opacity:1;transform:translate(-50%,-50%) scale(1)}
.rr-sms-time{font-family:'Caveat',cursive;text-align:center;color:rgba(250,244,232,.55);font-size:1rem;letter-spacing:1px;margin-bottom:.8rem}
.rr-sms-b{max-width:82%;padding:.55rem .85rem;border-radius:18px;font-size:1rem;line-height:1.35;margin-bottom:.5rem;opacity:0;transform:translateY(10px) scale(.9);transition:opacity .35s,transform .4s cubic-bezier(.34,1.56,.64,1);color:#faf4e8}
.rr-sms-b.show{opacity:1;transform:none}
.rr-sms-me{margin-left:auto;background:#b86858;border-bottom-right-radius:5px}
.rr-sms-her{background:#2b2620;border-bottom-left-radius:5px}
.rr-sms-dots{display:inline-flex;gap:4px;padding:.65rem .85rem;background:#2b2620;border-radius:18px;border-bottom-left-radius:5px;opacity:0;transition:opacity .2s}
.rr-sms-dots.show{opacity:1}
.rr-sms-dots i{width:7px;height:7px;border-radius:50%;background:rgba(250,244,232,.6);animation:rrDot 1s ease-in-out infinite}
.rr-sms-dots i:nth-child(2){animation-delay:.15s}.rr-sms-dots i:nth-child(3){animation-delay:.3s}
@keyframes rrDot{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}

/* adam */
.rr-scribble{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:3}
.rr-adam{transition:color .4s}
.rr-adam.dead{text-decoration:line-through;text-decoration-color:#d63a3a;text-decoration-thickness:3px;color:#b8a38a}
.rr-stamp{position:absolute;right:8%;top:50%;z-index:4;font-family:'Playfair Display',serif;font-weight:700;letter-spacing:3px;font-size:1.5rem;color:#d63a3a;border:4px solid #d63a3a;padding:.05rem .6rem;border-radius:4px;pointer-events:none;transform:translateY(-50%) rotate(-12deg) scale(2.6);opacity:0;animation:rrSlam .45s cubic-bezier(.2,1.6,.4,1) .05s forwards;mix-blend-mode:multiply}
@keyframes rrSlam{to{transform:translateY(-50%) rotate(-12deg) scale(1);opacity:.92}}

/* yeah */
.rr-yeah{position:absolute;left:50%;top:45%;z-index:59;transform:translate(-50%,-50%);font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(4rem,24vw,13rem);color:#c8943a;-webkit-text-stroke:3px #3a2010;text-shadow:8px 8px 0 #7a5230;pointer-events:none;animation:rrYeah 1.9s ease forwards}
@keyframes rrYeah{0%{opacity:0;transform:translate(-50%,-50%) scale(4) rotate(-8deg)}10%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-4deg)}80%{opacity:1;transform:translate(-50%,-50%) scale(1.04) rotate(-4deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1) rotate(-4deg)}}
.rr-shades{position:absolute;left:50%;top:14%;z-index:60;font-size:clamp(3rem,14vw,7rem);pointer-events:none;transform:translateX(-50%);animation:rrShades 1.9s ease forwards}
@keyframes rrShades{0%{opacity:0;transform:translate(-50%,-200px)}20%{opacity:1;transform:translate(-50%,0)}80%{opacity:1}100%{opacity:0}}

/* bus */
.rr-road{position:absolute;left:0;right:0;height:64px;z-index:18;background:#2b2b2e;border-top:3px solid #555;border-bottom:3px solid #555;pointer-events:none;animation:rrPop .5s ease both;transition:opacity .6s}
.rr-road::after{content:'';position:absolute;left:0;right:0;top:50%;border-top:3px dashed rgba(255,230,160,.7)}
.rr-zone{position:absolute;height:64px;width:110px;z-index:19;pointer-events:none;border:3px dashed rgba(255,120,110,.9);border-radius:4px;transition:background .15s,border-color .15s,opacity .6s}
.rr-zone.in{background:rgba(120,220,120,.35);border-color:#7ae07a}
.rr-stop{position:absolute;z-index:20;pointer-events:none;font-size:2.4rem;line-height:1;transform:translateX(-50%);transition:opacity .6s}
.rr-bus{position:absolute;left:0;z-index:21;pointer-events:none;font-size:3rem;line-height:1;will-change:transform;transition:opacity .6s}

/* muscle */
.rr-muscle{position:absolute;inset:0;z-index:62;pointer-events:none;overflow:hidden;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#f6d27a,#c8943a 60%,#7a5230);animation:rrMusBg 3s ease forwards}
@keyframes rrMusBg{0%{opacity:0}6%{opacity:1}88%{opacity:1}100%{opacity:0}}
.rr-muscle .arm{line-height:1;animation:rrMusArm 3s ease forwards}
@keyframes rrMusArm{0%{transform:scale(.05) rotate(-35deg)}20%{transform:scale(1) rotate(0)}30%{transform:scale(1.13)}40%{transform:scale(1)}50%{transform:scale(1.13)}60%{transform:scale(1)}70%{transform:scale(1.13)}85%{transform:scale(1.02)}100%{transform:scale(1.25)}}
.rr-muscle .mus-txt{position:absolute;left:0;right:0;bottom:7%;text-align:center;font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.8rem,8vw,4.5rem);letter-spacing:4px;color:#fff;-webkit-text-stroke:2px #3a2010;text-shadow:5px 5px 0 #3a2010}

/* heart */
.rr-heartcv{position:absolute;inset:0;z-index:21;pointer-events:none}
.rr-heartpop{position:absolute;z-index:59;pointer-events:none;line-height:1;transform:translate(-50%,-50%);filter:drop-shadow(0 0 24px rgba(232,120,110,.9));animation:rrHeartBeat 2.8s ease forwards}
@keyframes rrHeartBeat{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}12%{opacity:1;transform:translate(-50%,-50%) scale(1)}25%{transform:translate(-50%,-50%) scale(1.25)}38%{transform:translate(-50%,-50%) scale(1)}51%{transform:translate(-50%,-50%) scale(1.25)}64%{transform:translate(-50%,-50%) scale(1)}85%{opacity:.9}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}

/* phas monday */
.rr-dark{--x:50%;--y:50%;position:absolute;inset:0;z-index:60;pointer-events:none;background:radial-gradient(circle 120px at var(--x) var(--y),rgba(0,0,0,0) 0,rgba(0,0,0,.35) 60%,rgba(0,0,0,.97) 100%);animation:rrFlick .9s steps(1) forwards}
@keyframes rrFlick{0%{opacity:0}10%{opacity:1}20%{opacity:.1}30%{opacity:1}40%{opacity:0}55%{opacity:1}65%{opacity:.3}100%{opacity:1}}
.rr-dark .msg{position:absolute;left:0;right:0;top:14%;text-align:center;font-family:'Caveat',cursive;font-size:1.6rem;color:rgba(250,244,232,.6);letter-spacing:2px;animation:rrMsg 2.4s ease-in-out infinite}
@keyframes rrMsg{0%,100%{opacity:.2}50%{opacity:.9}}
.rr-ghost{position:absolute;left:0;top:0;z-index:59;pointer-events:none;font-size:2.6rem;opacity:.75;filter:grayscale(.3) drop-shadow(0 0 14px rgba(180,230,255,.8))}
.rr-scare{position:absolute;inset:0;z-index:80;background:#000;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;transition:opacity .5s}
.rr-scare svg{width:min(90vw,90vh);height:auto;filter:drop-shadow(0 0 40px rgba(180,230,255,.8));animation:rrScareZoom .9s cubic-bezier(.1,.9,.2,1) forwards,rrScareShake .07s linear infinite}
@keyframes rrScareZoom{0%{transform:scale(.15)}12%{transform:scale(1.35)}100%{transform:scale(1.8)}}
@keyframes rrScareShake{0%,100%{margin:0}25%{margin:-12px 10px}50%{margin:10px -12px}75%{margin:-8px -8px}}

/* squaishey */
.rr-sq{position:absolute;margin-left:-90px;width:180px;z-index:30;pointer-events:none;transform-origin:50% 100%;animation:rrSqPop 4s ease forwards}
@keyframes rrSqPop{0%{opacity:0;transform:translateY(70px) scale(.1)}10%{opacity:1;transform:translateY(-40px) scale(1.2)}18%{transform:translateY(0) scale(1)}85%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(70px) scale(.1)}}
.rr-sq-body{transform-origin:50% 100%;animation:rrSqHop .45s ease-in-out infinite alternate}
.rr-sq-body img,.rr-sq-body svg{display:block;width:180px;height:auto}
@keyframes rrSqHop{0%{transform:translateY(0) scale(1.08,.9)}100%{transform:translateY(-14px) scale(.94,1.08)}}
.rr-sq-sign{position:absolute;left:50%;bottom:calc(100% + 6px);width:230px;margin-left:-115px;padding:.7rem .5rem;background:#fffdf5;border:2px solid #d4b483;box-shadow:4px 4px 0 #7a5230;text-align:center;font-family:'Caveat',cursive;font-size:2.1rem;font-weight:700;color:#b86858;line-height:1.05;opacity:0;transform:rotate(-3deg) scale(.6);animation:rrSqSign .6s cubic-bezier(.34,1.6,.5,1) .9s forwards}
.rr-sq-sign small{display:block;font-size:1.1rem;font-weight:400;color:#7a5230;margin-top:.2rem}
@keyframes rrSqSign{to{opacity:1;transform:rotate(-3deg) scale(1)}}

/* swipe + windows dialogs */
.rr-swipe{position:absolute;top:.5rem;z-index:4;font-family:'Playfair Display',serif;font-weight:700;letter-spacing:3px;font-size:1.3rem;padding:0 .5rem;border:3px solid;border-radius:4px;pointer-events:none;opacity:0}
.rr-swipe.nope{right:.7rem;color:#d63a3a;transform:rotate(12deg)}
.rr-dlg{position:absolute;z-index:62;width:min(78vw,300px);background:#ece9d8;border:2px solid #fff;border-right-color:#5a5a5a;border-bottom-color:#5a5a5a;box-shadow:3px 3px 0 rgba(0,0,0,.4);font-family:Tahoma,Verdana,sans-serif;font-size:.85rem;color:#000;pointer-events:none;transition:opacity .5s}
.rr-dlg-t{background:linear-gradient(90deg,#0a246a,#a6caf0);color:#fff;padding:.2rem .4rem;font-weight:700;display:flex;justify-content:space-between}
.rr-dlg-b{padding:.8rem;display:flex;gap:.6rem;align-items:flex-start}
.rr-dlg-i{font-size:1.6rem;line-height:1}
.rr-dlg-btn{display:block;margin:0 auto .7rem;padding:.15rem 1.4rem;border:2px solid #fff;border-right-color:#555;border-bottom-color:#555;background:#ece9d8;width:max-content}

/* foam finger */
.rr-hand{position:absolute;left:0;top:0;z-index:30;pointer-events:none;font-size:3.4rem;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5))}
.rr-fan{position:absolute;inset:0;z-index:59;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 30%,rgba(255,240,170,.55),rgba(0,0,0,.78) 70%);animation:rrFanOv 3s ease forwards}
@keyframes rrFanOv{0%{opacity:0}12%{opacity:1}85%{opacity:1}100%{opacity:0}}
.rr-fan .f{font-size:clamp(6rem,30vw,13rem);line-height:1;animation:rrFanBob .45s ease-in-out infinite alternate}
@keyframes rrFanBob{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(-22px) rotate(6deg)}}
.rr-fan .t{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.6rem,7vw,3.2rem);color:#c8943a;letter-spacing:3px;text-shadow:3px 3px 0 #3a2010;text-align:center}

/* plane + sea */
.rr-sea{position:absolute;left:0;right:0;bottom:0;height:13%;min-height:70px;z-index:18;overflow:hidden;white-space:nowrap;font-size:3rem;line-height:1;pointer-events:none;background:linear-gradient(0deg,rgba(60,130,190,.65),rgba(60,130,190,0));animation:rrPop .8s ease both;transition:opacity .8s}
.rr-plane{position:absolute;left:0;top:0;z-index:30;pointer-events:none;font-size:2.4rem}
.rr-lab{position:absolute;z-index:19;transform:translateX(-50%);pointer-events:none;font-family:'Caveat',cursive;font-size:1.5rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.7);white-space:nowrap;transition:opacity .8s}
.rr-trail{position:absolute;z-index:29;pointer-events:none;color:#b86858;font-size:1.1rem;animation:rrTrail 1.6s ease-out forwards}
@keyframes rrTrail{to{opacity:0;transform:translateY(24px) scale(.4)}}

/* energy */
.rr-half{position:absolute;top:0;bottom:0;width:50%;z-index:4;pointer-events:none;transition:background .1s}
.rr-half.l{left:0}.rr-half.r{right:0}
.rr-half::after{content:attr(data-w);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Caveat',cursive;font-weight:700;font-size:1.7rem;color:#3a2010;opacity:0}
.rr-half.on{background:rgba(243,210,122,.7)}
.rr-half.on::after{opacity:1}
.rr-en{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:min(84vw,360px);z-index:59;text-align:center;font-family:'Caveat',cursive;color:#fff;font-size:1.7rem;pointer-events:none;text-shadow:0 2px 8px rgba(0,0,0,.6);transition:opacity .5s}
.rr-en .bar{height:26px;border:3px solid #fff;border-radius:999px;overflow:hidden;background:rgba(0,0,0,.45);margin-top:.3rem}
.rr-en .fill{height:100%;width:0;background:linear-gradient(90deg,#7ab870,#f3d27a,#e8786e);transition:width 1.6s cubic-bezier(.3,.8,.4,1)}
.rr-en.shake{animation:rrShake .5s ease-in-out 3}
.rr-en.boom{opacity:0}

/* constellation (starts as loose stars in act I, joins up in act IV) */
.rr-const{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:.5;transition:opacity 2.5s}
.rr-const.bright{opacity:1}
.rr-const-line{fill:none;stroke:rgba(255,230,160,.85);stroke-width:1.5;transition:stroke-dashoffset 4.5s ease-in-out;filter:drop-shadow(0 0 6px rgba(255,215,106,.8))}
.rr-const-dot{fill:#fff3c4;opacity:0;transform-box:fill-box;transform-origin:center;animation:rrDotIn .8s ease forwards;filter:drop-shadow(0 0 6px #ffd76a)}
@keyframes rrDotIn{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
.rr-const-label{position:absolute;left:0;right:0;top:83%;z-index:23;font-family:'Caveat',cursive;font-size:2rem;color:#faf4e8;text-shadow:0 0 18px rgba(255,215,106,.9);opacity:0;transition:opacity 1.5s;pointer-events:none;text-align:center}
.rr-const-label.in{opacity:1}

/* the song's words */
.rr-lyric{position:absolute;left:0;right:0;top:40%;z-index:24;text-align:center;padding:0 1.5rem;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.4rem,5vw,2.4rem);color:#faf4e8;text-shadow:0 0 22px rgba(232,185,90,.85),0 2px 10px rgba(0,0,0,.6);opacity:0;transform:translateY(12px);transition:opacity .9s,transform .9s}
.rr-lyric.in{opacity:1;transform:none}
`;
  let cssDone = false;
  function injectCSS(){
    if(cssDone) return; cssDone = true;
    const st = document.createElement('style'); st.id = 'rr-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  const mk = (cls, text, parent) => { const e = document.createElement('div'); e.className = cls; if(text != null) e.textContent = text; if(parent) parent.appendChild(e); return e; };
  const easeIO = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  /* ------------------------------------------------------------------ sound: the reasons page's own synth, its audio files, and a soft pad under everything */
  let actx = null, master = null, padNodes = [];
  const files = new Set();
  function ac(){
    try{
      if(!actx){ actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = 1; master.connect(actx.destination); }
      if(actx.state === 'suspended') actx.resume();
      return actx;
    }catch(e){ return null; }
  }
  function tone(freq, at, dur, type, vol, glideTo){
    const c = ac(); if(!c || (R && R.dead)) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if(glideTo) o.frequency.linearRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, f0, f1){
    const c = ac(); if(!c || (R && R.dead)) return;
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(f0, c.currentTime); if(f1) f.frequency.linearRampToValueAtTime(f1, c.currentTime + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  function playFile(src, vol){
    try{
      const a = new Audio(src); a.volume = vol == null ? 1 : vol; files.add(a);
      a.addEventListener('ended', () => files.delete(a));
      const p = a.play(); if(p && p.catch) p.catch(() => {});
      return a;
    }catch(e){ return null; }
  }
  // the pad: a few soft held notes that change chord with each act, so every little sound sits on the same bed
  function pad(freqs, vol){
    const c = ac(); if(!c) return;
    const t = c.currentTime;
    padOff(3.2);
    padNodes = freqs.map(f => {
      const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 12;
      fl.type = 'lowpass'; fl.frequency.value = 800;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.035, t + 3.2);
      o.connect(fl); fl.connect(g); g.connect(master); o.start(t);
      return { o, g };
    });
  }
  function padOff(sec){
    const c = actx; if(!c) return;
    const t = c.currentTime;
    padNodes.forEach(n => { try{ n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(Math.max(n.g.gain.value, 0.0001), t); n.g.gain.linearRampToValueAtTime(0.0001, t + sec); n.o.stop(t + sec + 0.1); }catch(e){} });
    padNodes = [];
  }
  const CHORDS = {
    am: [110, 164.8, 220, 261.6],
    f:  [87.3, 130.8, 174.6, 220],
    c:  [130.8, 196, 261.6, 329.6],
    g:  [98, 146.8, 196, 246.9],
  };

  /* ------------------------------------------------------------------ the show: helpers (one show runs at a time) */
  let R = null;
  const W = () => R.stage.clientWidth, H = () => R.stage.clientHeight;

  const wait = ms => new Promise((res, rej) => {
    if(R.dead) return rej(DEAD);
    const p = { rej }; p.t = setTimeout(() => { R.pending.delete(p); res(); }, ms); R.pending.add(p);
  });
  const later = (fn, ms) => { const t = setTimeout(() => { if(!R || R.dead) return; try{ fn(); }catch(e){ console.warn('[reasons-reel]', e); } }, ms); R.timers.add(t); return t; };
  const every = (fn, ms) => { const t = setInterval(() => { if(!R || R.dead) return; fn(); }, ms); R.timers.add(t); return t; };
  const stopEvery = t => { clearInterval(t); if(R) R.timers.delete(t); };
  const tween = (ms, f) => new Promise((res, rej) => {
    if(R.dead) return rej(DEAD);
    const t0 = performance.now();
    const step = now => { if(R.dead) return rej(DEAD); const p = Math.min(1, (now - t0) / ms); f(p); if(p < 1) requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step);
  });
  const bg = fn => { Promise.resolve().then(fn).catch(e => { if(e !== DEAD) console.warn('[reasons-reel]', e); }); };

  const el = (cls, text, parent) => { const e = mk(cls, text); (parent || R.stage).appendChild(e); return e; };
  const add = node => { R.stage.appendChild(node); return node; };
  const fx = (node, ms) => { R.stage.appendChild(node); setTimeout(() => node.remove(), ms || 2000); return node; };
  const fade = (nodes, ms) => { (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => { if(!n) return; n.style.transition = 'opacity ' + (ms || 600) + 'ms'; n.style.opacity = '0'; setTimeout(() => n.remove(), (ms || 600) + 60); }); };
  const rel = e => { const a = R.stage.getBoundingClientRect(), r = e.getBoundingClientRect(); return { l:r.left - a.left, t:r.top - a.top, w:r.width, h:r.height, r:r.right - a.left, b:r.bottom - a.top, cx:r.left - a.left + r.width / 2, cy:r.top - a.top + r.height / 2 }; };
  const file = (src, vol) => playFile(src, vol);

  // the firefly (a finger that doesn't look like a tutorial) and the tap ripple
  const orbOn = (x, y) => { const o = el('rr-orb'); o.style.left = x + 'px'; o.style.top = y + 'px'; return o; };
  const orbMove = (o, x, y) => { o.style.left = x + 'px'; o.style.top = y + 'px'; };
  const orbOff = o => { o.style.opacity = '0'; later(() => o.remove(), 500); };
  const ripple = (x, y, big) => { const r = mk('rr-ripple' + (big ? ' big' : '')); r.style.left = x + 'px'; r.style.top = y + 'px'; fx(r, 1200); };

  function rain(glyphs, n){
    const layer = mk('rr-fx');
    for(let i = 0; i < n; i++){
      const d = mk('rr-drop', glyphs[i % glyphs.length]);
      d.style.left = (Math.random() * 98) + '%'; d.style.fontSize = (1.4 + Math.random() * 1.6) + 'rem';
      d.style.setProperty('--fd', (2.2 + Math.random() * 1.6) + 's'); d.style.setProperty('--fdl', (Math.random() * 1.4) + 's');
      d.style.setProperty('--fr', ((Math.random() - 0.5) * 720) + 'deg');
      layer.appendChild(d);
    }
    fx(layer, 5400);   // these outlive the secret on purpose, so the next one starts while this is still falling
  }
  function noteAt(x, y, glyph){
    const e = mk('rr-note', glyph); e.style.left = x + 'px'; e.style.top = y + 'px';
    e.style.setProperty('--nx', ((Math.random() - 0.5) * 140) + 'px'); e.style.setProperty('--nr', ((Math.random() - 0.5) * 60) + 'deg');
    fx(e, 1700);
  }
  function notesAt(l, w, y, n){ for(let i = 0; i < n; i++) later(() => noteAt(l + Math.random() * w, y, ['♪', '♫', '♡'][i % 3]), i * 140); }
  function notes(card, n){ const r = rel(card); notesAt(r.l, r.w, r.cy, n); }
  function sparks(x, y, n){
    for(let i = 0; i < n; i++){
      const sp = mk('rr-spark', '✦'), a = (i / n) * Math.PI * 2, d = 50 + Math.random() * 70;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.style.setProperty('--sx', Math.cos(a) * d + 'px'); sp.style.setProperty('--sy', Math.sin(a) * d + 'px');
      fx(sp, 1000);
    }
  }
  function word(txt, x, y){ const w = mk('rr-word', txt); w.style.left = x + 'px'; w.style.top = y + 'px'; fx(w, 1400); }
  function quake(){ const st = R.stage; st.classList.remove('rr-quake'); void st.offsetWidth; st.classList.add('rr-quake'); setTimeout(() => st.classList.remove('rr-quake'), 450); }
  function bump(e, cls, ms){ e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); later(() => e.classList.remove(cls), ms || 800); }
  function spring(card, ms){ card.style.transition = 'transform ' + (ms || 600) + 'ms cubic-bezier(.34,1.8,.5,1)'; card.style.transform = ''; later(() => { card.style.transition = ''; card.style.transformOrigin = ''; }, (ms || 600) + 60); }
  function big(txt, color, glow, top){ const t = el('rr-big', txt); if(color) t.style.color = color; if(glow) t.style.textShadow = glow; if(top) t.style.top = top; later(() => t.remove(), 2900); return t; }

  // the caption line: one quiet sentence at a time, the thread that ties the secrets together
  function cap(text){
    const e = R.capEl; clearTimeout(R.capT);
    e.style.opacity = '0';
    if(!text) return;
    R.capT = setTimeout(() => { if(R.dead) return; e.textContent = text; e.style.opacity = '1'; }, 400);
  }
  // an act changes the colour of the sky and the chord underneath
  function act(tint, chord){
    R.tint.style.backgroundColor = tint;
    if(chord) pad(CHORDS[chord], 0.032);
  }

  /* ------------------------------------------------------------------ the one card that travels through everything */
  async function hero(text, o){
    o = o || {}; const slot = R.hero.slot, card = R.hero.card;
    if(R.heroVis){
      card.style.transition = 'opacity .25s,transform .25s'; card.style.opacity = '0'; card.style.transform = 'scale(.94)';
      await wait(270);
    }
    card.className = 'rr-card' + (o.hid ? ' hid' : '');
    card.removeAttribute('style');
    if(o.html) card.innerHTML = o.html; else card.textContent = text;
    if(R.heroVis){ card.classList.add('pop'); await wait(120); }
    else { slot.style.opacity = '1'; R.heroVis = true; await wait(700); }
    return card;
  }
  function heroOut(){ R.hero.slot.style.opacity = '0'; R.heroVis = false; }
  const heroTop = t => { R.hero.slot.style.top = t; };

  /* ------------------------------------------------------------------ the heart that the constellation, the drawn heart and the finale all share */
  function heartGeom(){ const w = W(), h = H(); return { cx:w / 2, cy:h * 0.56, S:Math.min(w * 0.8, h * 0.46) / 32 }; }
  const heartPt = (g, t) => [g.cx + 16 * Math.pow(Math.sin(t), 3) * g.S, g.cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * g.S];

  // "you stayed": in act I the stars just start to appear... in act IV they join up
  function constBegin(){
    const g = heartGeom(), N = 16, pts = [];
    for(let i = 0; i <= N; i++) pts.push(heartPt(g, Math.PI + (i / N) * Math.PI * 2));
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'rr-const'); svg.setAttribute('viewBox', '0 0 ' + W() + ' ' + H());
    const line = document.createElementNS(NS, 'polyline'); line.setAttribute('class', 'rr-const-line'); line.setAttribute('points', pts.map(p => p.join(',')).join(' ')); svg.appendChild(line);
    pts.forEach((p, i) => { if(i === N) return; const k = document.createElementNS(NS, 'circle'); k.setAttribute('cx', p[0]); k.setAttribute('cy', p[1]); k.setAttribute('r', 3.4); k.setAttribute('class', 'rr-const-dot'); k.style.animationDelay = (4 + i * 1.7) + 's'; svg.appendChild(k); });
    add(svg);
    let len = 1000; try{ len = line.getTotalLength(); }catch(e){}
    line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
    R.const = { svg, line };
  }
  function constFinish(){
    const k = R.const; if(!k) return;
    k.svg.classList.add('bright'); void k.svg.getBoundingClientRect();
    k.line.style.strokeDashoffset = 0;
    const lab = el('rr-const-label', 'you stayed a while ♡'); later(() => lab.classList.add('in'), 2500); R.constLab = lab;
  }

  /* =======================================================================
     ACT I - the quiet ones
     ======================================================================= */

  // hold a hidden reason
  async function sPeek(){
    cap('you held on to the quiet ones');
    const card = await hero('✦ tap to reveal ✦', { hid:true });
    await wait(500);
    const r = rel(card), o = orbOn(r.cx, r.cy); o.classList.add('down'); ripple(r.cx, r.cy);
    card.classList.add('peeking');
    await wait(2000);
    tone(392, 0, 0.5, 'triangle', 0.16, 600); tone(784, 0.1, 0.8, 'sine', 0.06);
    card.classList.remove('peeking', 'hid'); card.textContent = "You're proud of me out loud."; card.classList.add('pop');
    ripple(r.cx, r.cy, true); orbOff(o);
    await wait(1700);
  }

  // catch the shooting star
  async function sStar(){
    cap('and when one shot across the sky, you caught it');
    const w = W(), h = H(), s = el('rr-shoot'), dx = -(w * 0.5 + 240), dy = -dx * 0.62;
    s.style.left = (w * 0.8) + 'px'; s.style.top = (h * 0.1) + 'px';
    s.style.setProperty('--dx', dx + 'px'); s.style.setProperty('--dy', dy + 'px'); s.style.setProperty('--ang', Math.atan2(-dy, -dx) + 'rad');
    const wish = el('rr-wish', '✦ make a wish ✦');
    tone(1568, 0.2, 1.2, 'sine', 0.03, 784);
    await wait(1500);
    const r = rel(s), o = orbOn(r.cx, r.cy);
    await wait(160);
    ripple(r.cx, r.cy, true); sparks(r.cx, r.cy, 16); s.remove(); orbOff(o);
    tone(1318, 0, 0.5, 'sine', 0.1); tone(1760, 0.12, 0.6, 'sine', 0.06);
    await wait(400); wish.classList.add('in');
    await wait(1700); wish.classList.remove('in'); later(() => wish.remove(), 1200);
  }

  // open every reason, one at a time: the card splits into five, they flip in a cascade, then fold back into one
  async function sRead(){
    cap('you read them all');
    heroOut(); await wait(600);
    const slot = el('rr-slot'), col = mk('rr-col', null, slot);
    slot.style.transition = 'opacity .6s'; slot.style.zIndex = 3;
    const T = ["You take care of the people you love.", "You're honest with me even when it'd be easier not to be.", "You make hard things feel survivable.", "Your messages can fix a rubbish day in about four seconds.", "You let me be weird. Fully, completely, unapologetically weird."];
    const cards = T.map(() => mk('rr-card hid', '✦ tap to reveal ✦', col));
    const cnt = mk('rr-count', 'reasons read: 0', col);
    void slot.offsetWidth; slot.style.opacity = '1';
    await wait(600);
    for(let i = 0; i < cards.length; i++){
      const r = rel(cards[i]); ripple(r.cx, r.cy);
      await wait(130);
      cards[i].classList.remove('hid'); cards[i].textContent = T[i]; cards[i].classList.add('pop');
      tone(480 + i * 70, 0, 0.14, 'triangle', 0.09); cnt.textContent = 'reasons read: ' + (i + 1);
      await wait(520);
    }
    const end = el('rr-end', 'every. single. one.');
    tone(523, 0, .5, 'triangle', .1); tone(659, .12, .5, 'triangle', .1); tone(784, .24, .8, 'triangle', .1);
    await wait(1600);
    slot.style.opacity = '0'; end.style.opacity = '0'; later(() => { slot.remove(); end.remove(); }, 800);
    await wait(500);
  }

  /* =======================================================================
     ACT II - play
     ======================================================================= */

  // tip the tin over
  async function sBeans(){
    act('rgba(70,25,70,.28)', 'f');
    cap('then you tipped the tin over');
    const card = await hero('Beans Means Heinz.'); card.style.transformOrigin = '100% 100%';
    await wait(250);
    await tween(850, p => { card.style.transform = 'rotate(' + (easeIO(p) * 100) + 'deg)'; });
    const spawn = () => {
      const r = rel(card), b = mk('rr-bean', Math.random() < 0.75 ? '🫘' : '🥫'), top = r.t + r.h * 0.45;
      b.style.left = (r.r - 12 - Math.random() * 30) + 'px'; b.style.top = top + 'px';
      b.style.setProperty('--bx', ((Math.random() - 0.5) * 120) + 'px'); b.style.setProperty('--br', ((Math.random() - 0.5) * 540) + 'deg'); b.style.setProperty('--by', Math.max(120, H() - top - 40) + 'px');
      fx(b, 1400); if(Math.random() < .35) noise(.08, .05, 3000, 1500);
    };
    const iv = every(spawn, 70);
    await wait(1300); stopEvery(iv);
    rain(['🫘', '🥫'], 24);
    spring(card, 650);
    await wait(700);
  }

  // pull the noodle taut (the beans are still falling behind it)
  async function sNoodles(){
    cap('pulled the noodle until it sang');
    const card = await hero('Noodles Unites Us.');
    await wait(300);
    const r = rel(card), sx = r.cx > W() / 2 ? -1 : 1, ax = sx > 0 ? r.r : r.l, ay = r.cy, ca = Math.cos(.45), sa = Math.sin(.45);
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'rr-noodle');
    const path = document.createElementNS(NS, 'path'); svg.appendChild(path); add(svg);
    const o = orbOn(ax, ay); o.classList.add('down');
    let cx = ax, cy = ay, creaked = false;
    const draw = () => {
      const d = Math.hypot(cx - ax, cy - ay), sag = Math.max(0, 140 - d * 0.45);
      path.setAttribute('d', 'M' + ax + ' ' + ay + ' Q' + ((ax + cx) / 2) + ' ' + ((ay + cy) / 2 + sag) + ' ' + cx + ' ' + cy);
      path.style.stroke = d > 300 ? '#fff0b0' : '#f3d27a';
    };
    draw();
    await tween(1300, p => {
      const d = 340 * easeIO(p); cx = ax + sx * d * ca; cy = ay + d * sa; draw(); orbMove(o, cx, cy);
      if(!creaked && d > 300){ creaked = true; tone(300, 0, 0.25, 'triangle', 0.12, 420); }
    });
    const fx0 = cx, fy0 = cy;
    o.classList.remove('down');
    await tween(150, p => { cx = fx0 + (ax - fx0) * p; cy = fy0 + (ay - fy0) * p; draw(); orbMove(o, cx, cy); });
    tone(180, 0, 0.4, 'sawtooth', 0.12, 55); svg.remove(); orbOff(o); bump(card, 'shake', 500);
    rain(['🍜', '🥢', '🍥'], 40);
    await wait(800);
  }

  // doorbell: press = bing, let go = bong. twice
  async function sBingBong(){
    cap('pressed. let go. twice');
    const card = await hero('bing bong, bing bong');
    await wait(300);
    const r = rel(card);
    for(let k = 0; k < 2; k++){
      card.classList.add('press'); ripple(r.cx, r.cy);
      tone(659, 0, 0.9, 'sine', 0.25); tone(1318, 0, 0.5, 'triangle', 0.07); word('bing', r.cx - 80, r.t - 10);
      await wait(600);
      card.classList.remove('press');
      tone(523, 0, 1.0, 'sine', 0.25); tone(1046, 0, 0.5, 'triangle', 0.06); word('bong', r.cx + 40, r.t - 10);
      bump(card, 'ring', 1000); notes(card, 3);
      await wait(k ? 700 : 1000);
    }
  }

  // the 2am text: the card steps aside for a phone
  async function sTwoAm(){
    cap('and some thoughts only make sense at 2am');
    heroOut(); await wait(500);
    const ph = el('rr-sms'), mins = String(2 + Math.floor(Math.random() * 7)).padStart(2, '0');
    ph.appendChild(mk('rr-sms-time', '2:' + mins + ' am'));
    const a = mk('rr-sms-b rr-sms-me', 'random thought: penguins have knees'), dots = mk('rr-sms-dots'), b = mk('rr-sms-b rr-sms-her', 'WAIT WHAT 😭 tell me EVERYTHING');
    dots.innerHTML = '<i></i><i></i><i></i>';
    const wrap = mk(''); wrap.style.minHeight = '3rem'; wrap.style.position = 'relative'; dots.style.position = 'absolute'; wrap.append(dots, b);
    ph.append(a, wrap);
    await wait(60); ph.classList.add('in');
    await wait(450); a.classList.add('show'); tone(880, 0, .1, 'sine', .06);
    await wait(850); dots.classList.add('show');
    await wait(1000); dots.classList.remove('show'); b.classList.add('show'); tone(660, 0, .12, 'sine', .07); tone(990, .1, .14, 'sine', .06);
    await wait(1600); ph.classList.remove('in');
    await wait(450); ph.remove();
  }

  // scrub the song like a record
  async function sDoobe(){
    cap('turned a song into a record');
    const card = await hero('DOOBEBOOBEDOOOOOOOO');
    await wait(300);
    const r = rel(card), SCALE = [262, 294, 330, 392, 440, 523], o = orbOn(r.cx, r.cy); o.classList.add('down');
    let last = -1, prevX = 0;
    await tween(3000, p => {
      const x = Math.sin(p * Math.PI * 2 * 4.5) * r.w * 0.42, dx = x - prevX; prevX = x;
      card.style.transform = 'translateX(' + (x * 0.35) + 'px) skewX(' + Math.max(-18, Math.min(18, -dx * 1.2)) + 'deg)';
      orbMove(o, r.cx + x, r.cy);
      const ni = Math.max(0, Math.min(5, Math.floor((x + r.w / 2) / r.w * 6)));
      if(ni !== last){ last = ni; tone(SCALE[ni], 0, 0.3, 'triangle', 0.16); if(Math.random() < 0.5) notes(card, 1); }
    });
    card.style.transform = ''; orbOff(o);
    [[262, 0, .2], [330, .22, .2], [392, .44, .2], [330, .66, .2], [523, .88, 1.1]].forEach(([f, a, du], i) => tone(f, a, du, 'triangle', 0.2, i === 4 ? 560 : null));
    notes(card, 9); card.classList.add('doobe');
    await wait(1900);
  }

  // scribble out the name
  async function sAdam(){
    cap('and we do not speak of Adam');
    const card = await hero('', { html:'We hate on <span class="rr-adam">Adam</span>, and that brings us closer every day' });
    const word_ = card.querySelector('.rr-adam');
    await wait(500);
    const cr = card.getBoundingClientRect(), cv = document.createElement('canvas'); cv.className = 'rr-scribble'; cv.width = Math.max(1, cr.width); cv.height = Math.max(1, cr.height); card.appendChild(cv);
    const g = cv.getContext('2d'); g.strokeStyle = 'rgba(214,58,58,.9)'; g.lineWidth = 3.5; g.lineCap = 'round';
    const wr = word_.getBoundingClientRect(), wx = wr.left - cr.left, wy = wr.top - cr.top, base = rel(card);
    const o = orbOn(base.l + wx, base.t + wy); o.classList.add('down');
    let px = wx - 8, py = wy + wr.height * 0.3;
    await tween(1500, p => {
      const k = p * 7, seg = Math.floor(Math.min(k, 6.999)), f = k - seg, fw = seg % 2 ? 1 - f : f;
      const x = wx - 8 + fw * (wr.width + 16), y = wy + wr.height * 0.25 + (k / 7) * wr.height * 0.55;
      g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke(); px = x; py = y; orbMove(o, base.l + x, base.t + y);
    });
    orbOff(o);
    word_.classList.add('dead'); mk('rr-stamp', 'REJECTED', card);
    later(() => { tone(140, 0, 0.5, 'sine', 0.4, 40); quake(); }, 120);
    await wait(1700);
  }

  // nod along
  async function sYeah(){
    cap('yeah.');
    const card = await hero('Yeah.');
    await wait(300);
    let rev = 0, lastDir = 0;
    await tween(2100, p => {
      const y = Math.sin(p * Math.PI * 8) * 22, dir = Math.sign(Math.cos(p * Math.PI * 8));
      if(lastDir && dir !== lastDir && p > 0.05){ rev++; tone(200 + rev * 40, 0, 0.14, 'sine', 0.2, 150); }
      lastDir = dir; card.style.transform = 'translateY(' + y + 'px)';
    });
    card.style.transform = '';
    file('media/reasons/yeah.mp3', 1);
    el('rr-yeah', 'YEAH.'); el('rr-shades', '😎');
    later(quake, 150);
    await wait(1700);
  }

  /* =======================================================================
     ACT III - chaos
     ======================================================================= */

  // drive the bus
  async function sBus(){
    act('rgba(130,70,20,.28)', 'c');
    cap('then you caught the bus. ta-ra.');
    const w = W(), h = H(), stopX = w * 0.72, rb = h * 0.16;
    heroTop('24%');
    await hero("ayup, we be bing chillin' innit, ta-ra");
    const road = el('rr-road'), zone = el('rr-zone'), stop = el('rr-stop', '🚏'), bus = el('rr-bus', '🚌'), tmp = [road, zone, stop, bus];
    road.style.bottom = rb + 'px'; zone.style.bottom = rb + 'px'; zone.style.left = (stopX - 55) + 'px';
    stop.style.left = stopX + 'px'; stop.style.bottom = (rb + 62) + 'px'; bus.style.bottom = (rb + 10) + 'px';
    bus.style.transform = 'translateX(-54px) scaleX(-1)';
    await wait(700);
    const dist = stopX + 30; let lastTick = 0;
    await tween(3200, p => {
      const e = easeIO(p), x = -30 + dist * e, v = dist * (p < 0.5 ? 4 * p : 4 * (1 - p)) / 3.2;
      bus.style.transform = 'translateX(' + (x - 24) + 'px) scaleX(-1)';
      zone.classList.toggle('in', Math.abs(x - stopX) <= 55);
      const now = performance.now(); if(v > 5 && now - lastTick > 110){ lastTick = now; tone(55 + v * 0.12, 0, 0.1, 'sawtooth', 0.04); }
    });
    file('media/reasons/bing_chilling.mp3', 1);
    noise(0.7, 0.2, 5000, 1800); tone(660, 0.1, 0.4, 'sine', 0.12);
    big('ayup, ta-ra 🚌', '#fff3c4', '0 0 24px rgba(200,148,58,.9)');
    rain(['🚌', '🚏', '☕', '🇬🇧'], 30);
    await wait(1800);
    fade(tmp, 700); heroTop('46%');
    await wait(500);
  }

  // click it up to full strength
  async function sMuscle(){
    cap('flexed until it was official');
    const card = await hero('You are a BIG MUSCLE BADDIE!');
    await wait(400);
    const M = 32, r0 = rel(card), maxS = Math.min(1.75, (W() * 0.94) / Math.max(1, r0.w));
    card.style.position = 'relative'; card.style.zIndex = 5;
    let prev = 0;
    await tween(2800, p => {
      const n = Math.floor(p * M), q = Math.min(1, n / M);
      card.style.transform = 'scale(' + (1 + q * (maxS - 1)) + ') rotate(' + ((Math.random() - 0.5) * q * 3) + 'deg)';
      card.style.boxShadow = '0 0 ' + (q * 50) + 'px ' + (q * 12) + 'px rgba(214,58,58,' + (q * 0.7) + ')';
      card.style.borderColor = q > 0.25 ? 'rgb(214,58,58)' : '';
      if(n !== prev){
        prev = n; tone(150 + q * 500, 0, 0.15, 'square', 0.08);
        if(n % 3 === 0){ const r = rel(card); noteAt(r.l + Math.random() * r.w, r.cy, '💪'); ripple(r.cx, r.cy); }
      }
    });
    const ov = el('rr-muscle'), arm = mk('arm', '💪', ov); arm.style.fontSize = (Math.max(W(), H()) * 1.25) + 'px'; mk('mus-txt', 'BIG MUSCLE BADDIE', ov);
    tone(70, 0, 1.2, 'sawtooth', 0.22, 40);
    [392, 523, 659, 784].forEach((f, i) => tone(f, 0.5 + i * 0.18, 0.5, 'triangle', 0.16));
    [700, 1300, 1900].forEach(a => later(() => { quake(); tone(90, 0, 0.3, 'sine', 0.35, 40); }, a));
    later(() => ov.remove(), 3100);
    await wait(2900);
    card.removeAttribute('style');
  }

  // wave the foam finger
  async function sFan(){
    cap('number one fan, front row');
    const card = await hero('I am your number one biggest Ann Fan...');
    await wait(400);
    const r = rel(card), hand = el('rr-hand', '☝️'), rad = Math.min(r.w * 0.4, 120);
    let rots = 0;
    await tween(3200, p => {
      const a = p * Math.PI * 6, x = r.cx + Math.cos(a) * rad, y = r.cy + Math.sin(a) * rad * 0.7;
      hand.style.transform = 'translate(' + (x - 24) + 'px,' + (y - 30) + 'px) rotate(' + Math.max(-40, Math.min(40, (x - r.cx) * 0.2)) + 'deg)';
      const k = Math.floor(a / (2 * Math.PI)); if(k > rots){ rots = k; noise(0.7, 0.1 + 0.07 * k, 1200, 2200); tone(440 + k * 110, 0, 0.25, 'triangle', 0.12); }
    });
    hand.remove();
    const ov = el('rr-fan'); mk('f', '☝️', ov); mk('t', '#1 ANN FAN', ov); later(() => ov.remove(), 3100);
    noise(1.8, 0.28, 1400, 2400); later(() => noise(1.6, 0.22, 1000, 2000), 500);
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.35, 'triangle', 0.14));
    rain(['🎉', '📣', '✨', '🎊'], 32);
    await wait(2800);
  }

  // swipe left, and the error boxes pile up
  async function sWellMen(){
    cap('some errors cannot be undone');
    const card = await hero('You have good taste in everything! Well, men exist...');
    await wait(500);
    const r = rel(card), sw = mk('rr-swipe nope', 'NOPE', card), o = orbOn(r.cx, r.cy); o.classList.add('down');
    await tween(800, p => { const dx = -150 * easeIO(p); card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx * 0.04) + 'deg)'; sw.style.opacity = Math.min(1, Math.max(0, (-dx - 30) / 80)); orbMove(o, r.cx + dx, r.cy); });
    orbOff(o);
    card.style.transition = 'transform .45s ease-in, opacity .45s'; card.style.transform = 'translateX(-120vw) rotate(-30deg)'; card.style.opacity = 0;
    const dlgs = [];
    const mkDlg = (title, icon, msg, btn, x, y) => {
      const d = mk('rr-dlg'); d.style.left = x + 'px'; d.style.top = y + 'px';
      d.innerHTML = '<div class="rr-dlg-t"><span>' + title + '</span><span>✕</span></div><div class="rr-dlg-b"><span class="rr-dlg-i">' + icon + '</span><span>' + msg + '</span></div><div class="rr-dlg-btn">' + btn + '</div>';
      dlgs.push(d); return add(d);
    };
    const w = W(), h = H(), bw = Math.min(w * 0.78, 300), x0 = Math.max(8, w / 2 - bw / 2 - 50), y0 = Math.max(60, h * 0.2);
    noise(0.35, 0.3, 4000, 300); tone(900, 0, 0.35, 'sawtooth', 0.14, 110);
    later(() => { mkDlg('taste.exe', 'ℹ️', 'Good taste detected in: food, music, shows, friends, everything.', 'OK', x0, y0); tone(880, 0, 0.2, 'sine', 0.12); }, 400);
    later(() => { mkDlg('men_exist.dll', '⚠️', 'Warning: men exist. This cannot be undone.', 'Ignore', x0 + 24, y0 + 40); tone(660, 0, 0.2, 'sine', 0.12); }, 1300);
    later(() => { tone(200, 0, 0.6, 'square', 0.12, 120); for(let i = 0; i < 14; i++) later(() => mkDlg('Fatal Error', '❌', 'taste_in_men not found. Please contact Bestie Tristan.', 'Retry', x0 + 48 + i * 14, y0 + 80 + i * 18), i * 70); }, 2200);
    await wait(4000);
    fade(dlgs, 500);
    await wait(400);
    card.style.transition = 'transform .7s cubic-bezier(.34,1.5,.5,1), opacity .5s'; card.style.transform = ''; card.style.opacity = '';
    await wait(800);
  }

  // copy the gbing gbong rhythm, then the meter breaks
  async function sEnergy(){
    cap('gbing. gbong. listen...');
    const card = await hero('gbing gbong. this is your energy');
    const l = mk('rr-half l', null, card), rr = mk('rr-half r', null, card); l.dataset.w = 'gbing'; rr.dataset.w = 'gbong';
    const note = s => { const hf = s ? rr : l; hf.classList.add('on'); if(s) tone(196, 0, 0.45, 'sine', 0.3, 150); else { tone(880, 0, 0.35, 'triangle', 0.2); tone(1760, 0, 0.2, 'sine', 0.05); } later(() => hf.classList.remove('on'), 280); };
    const seq = [0, 1, 1, 0, 1];
    await wait(500);
    const r = rel(card);
    for(const s of seq){ note(s); await wait(600); }
    cap('and now you');
    await wait(400);
    const o = orbOn(r.cx, r.cy);
    for(const s of seq){ orbMove(o, s ? r.l + r.w * 0.75 : r.l + r.w * 0.25, r.cy); await wait(180); o.classList.add('down'); note(s); await wait(110); o.classList.remove('down'); await wait(340); }
    orbOff(o); await wait(300);
    cap('');
    const wrap = el('rr-en'), lb = mk('', 'ENERGY: 0%', wrap), bar = mk('bar', null, wrap), fill = mk('fill', null, bar);
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = '100%'; }));
    let pc = 0; const iv = every(() => { pc = Math.min(100, pc + 5); lb.textContent = 'ENERGY: ' + pc + '%'; tone(300 + pc * 6, 0, 0.06, 'square', 0.05); if(pc >= 100) stopEvery(iv); }, 80);
    await wait(1700); lb.textContent = 'ENERGY: 9001%'; wrap.classList.add('shake'); tone(110, 0, 0.9, 'sawtooth', 0.25, 40); rain(['⚡', '✨', '💥'], 30);
    await wait(1300); lb.textContent = 'meter broke ⚡'; wrap.classList.add('boom');
    later(() => wrap.remove(), 700);
    await wait(700);
  }

  // knock three times and see what answers (the loudest moment, so the act ends on it, and then goes quiet)
  async function sPhas(){
    cap('knocked three times');
    const w = W(), h = H(), card = await hero('You make phas Monday evenings feel like something to look forward to.');
    await wait(500);
    const r = rel(card);
    for(let k = 0; k < 3; k++){
      ripple(r.cx, r.cy); tone(130, 0, 0.14, 'sine', 0.5, 60); noise(0.09, 0.35, 500, 200); bump(card, 'shake', 500);
      await wait(520);
    }
    cap('and something knocked back');
    await wait(500);
    const dark = el('rr-dark'); mk('msg', 'something answered... find it', dark);
    const ghost = el('rr-ghost', '👻'), gx = w * (r.cx > w / 2 ? 0.2 : 0.78), gy = h * 0.62;
    ghost.style.transform = 'translate(' + (gx - 20) + 'px,' + (gy - 20) + 'px)';
    let px = r.cx, py = r.cy, over = false;
    const setLight = () => { dark.style.setProperty('--x', px + 'px'); dark.style.setProperty('--y', py + 'px'); }; setLight();
    const dist = () => Math.hypot(px - gx, py - gy);
    bg(async () => { await wait(900); while(!over){ const d = dist(); tone(500 + Math.max(0, 500 - d) * 1.4, 0, 0.07, 'square', 0.05); await wait(Math.max(100, Math.min(1300, 110 + d * 1.6))); } });
    const way = [[r.cx, r.cy], [w * 0.5, h * 0.25], [w * (gx < w / 2 ? 0.85 : 0.15), h * 0.5], [w * 0.5, h * 0.8], [gx, gy]];
    for(let i = 1; i < way.length; i++){
      const a = way[i - 1], b = way[i];
      await tween(i === way.length - 1 ? 1300 : 950, p => { const e = easeIO(p); px = a[0] + (b[0] - a[0]) * e; py = a[1] + (b[1] - a[1]) * e; setLight(); });
    }
    await wait(500); over = true;
    dark.remove(); ghost.remove();
    const ov = el('rr-scare');
    ov.innerHTML = '<svg viewBox="0 0 200 240"><defs><radialGradient id="rrgh" cx="50%" cy="35%"><stop offset="0" stop-color="#f4fbff"/><stop offset="1" stop-color="#9fb4c2"/></radialGradient></defs><path d="M18 232 V92 C18 38 58 8 100 8 C142 8 182 38 182 92 V232 L156 206 L128 232 L100 206 L72 232 L44 206 Z" fill="url(#rrgh)"/><ellipse cx="68" cy="92" rx="17" ry="30" fill="#000"/><ellipse cx="132" cy="92" rx="17" ry="30" fill="#000"/><ellipse cx="100" cy="164" rx="24" ry="44" fill="#000"/></svg>';
    noise(1.1, 0.5, 1800, 3200); tone(1200, 0, 0.9, 'sawtooth', 0.22, 2800); tone(95, 0, 1, 'sawtooth', 0.3, 60);
    try{ if(navigator.vibrate) navigator.vibrate([180, 60, 180]); }catch(_){}
    await wait(1100);
    fade(ov, 500);
    cap('sorry ♡ see you on Monday');
    await wait(2300);
  }

  /* =======================================================================
     ACT IV - the tender part
     ======================================================================= */

  // fly across the sea
  async function sSea(){
    act('rgba(30,50,110,.34)', 'g');
    cap('you crossed the sea with me, again');
    heroTop('22%');
    await hero("You've crossed the sea with me in spirit more times than I can count.");
    await wait(300);
    const w = W(), h = H(), band = el('rr-sea'); band.textContent = '🌊'.repeat(14);
    const sx = 46, dx = w - 46, tmp = [band];
    const lab = (x, txt) => { const l = el('rr-lab', txt); l.style.left = x + 'px'; l.style.bottom = (h * 0.14) + 'px'; tmp.push(l); return l; };
    lab(sx, '🇬🇧 UK'); lab(dx, '♡ you');
    const pl = el('rr-plane', '✈️'), o = orbOn(sx, h * 0.6); o.classList.add('down');
    const put = (x, y) => { pl.style.transform = 'translate(' + (x - 20) + 'px,' + (y - 20) + 'px)'; orbMove(o, x, y); };
    put(sx, h * 0.6);
    let lastH = 0;
    await tween(3000, p => {
      const x = sx + (dx - sx - 40) * p, y = h * 0.6 + Math.sin(p * Math.PI * 3) * 24 - p * 30; put(x, y);
      const now = performance.now(); if(now - lastH > 70){ lastH = now; const ht = mk('rr-trail', '♡'); ht.style.left = x + 'px'; ht.style.top = (y + 10) + 'px'; fx(ht, 1700); }
    });
    orbOff(o);
    pl.style.transition = 'transform 1.2s ease-in'; pl.style.transform = 'translate(' + (w + 60) + 'px,' + (h * 0.6 - 150) + 'px)';
    later(() => pl.remove(), 1400);
    big('UK ✈ you ♡', '#fff3c4');
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.4, 'triangle', 0.13));
    await wait(1900);
    fade(tmp, 800); heroTop('46%');
    await wait(600);
  }

  // draw it a heart, and the heart you drew turns into the constellation
  async function sLove(){
    cap('and you drew it a heart');
    const w = W(), h = H(), g = heartGeom();
    heroTop('17%');
    const card = await hero('Love you Bestie'); card.style.textAlign = 'center';
    await wait(500);
    const cv = document.createElement('canvas'); cv.className = 'rr-heartcv'; cv.width = Math.max(1, w); cv.height = Math.max(1, h); add(cv);
    const c2 = cv.getContext('2d'); c2.strokeStyle = 'rgba(232,120,110,.95)'; c2.lineWidth = 5; c2.lineCap = 'round'; c2.lineJoin = 'round'; c2.shadowColor = 'rgba(232,120,110,.9)'; c2.shadowBlur = 14;
    let prev = heartPt(g, Math.PI); const o = orbOn(prev[0], prev[1]); o.classList.add('down');
    await tween(2300, p => { const q = heartPt(g, Math.PI + p * Math.PI * 2); c2.beginPath(); c2.moveTo(prev[0], prev[1]); c2.lineTo(q[0], q[1]); c2.stroke(); prev = q; orbMove(o, q[0], q[1]); });
    orbOff(o); fade(cv, 700);
    const hp = el('rr-heartpop', '❤️'); hp.style.left = g.cx + 'px'; hp.style.top = g.cy + 'px'; hp.style.fontSize = Math.max(70, Math.min(w * 0.8, h * 0.46) * 1.05) + 'px'; later(() => hp.remove(), 3000);
    const tx = big('love you too, bestie ♡', '#ffd9d0', '0 0 20px rgba(232,120,110,.9)', '78%'); tx.style.fontSize = 'clamp(1.6rem,7vw,3rem)';
    rain(['❤️', '🩷', '♡', '💕'], 30);
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 1.2, 'sine', 0.14));
    await wait(1400);
    cap('and you stayed a while');
    constFinish();                    // the stars you had been collecting all night join up into the same heart
    tone(1046, 0, 2.2, 'sine', 0.04, 1318);
    await wait(2200);
  }

  // squish it flat and let go, Squaishey delivers
  async function sThanks(){
    cap('someone wanted to say thank you');
    heroTop('60%');
    const card = await hero('I want to say, Thank You');
    await wait(500);
    const r = rel(card), o = orbOn(r.cx, r.cy); o.classList.add('down'); ripple(r.cx, r.cy);
    let lastSq = 0;
    await tween(900, p => {
      card.style.transition = 'none'; card.style.transform = 'scale(' + (1 + p * 0.1) + ',' + (1 - p * 0.45) + ')';
      const now = performance.now(); if(now - lastSq > 160){ lastSq = now; tone(300 + p * 500, 0, 0.1, 'sine', 0.07); }
    });
    orbOff(o); spring(card, 700); tone(200, 0, 0.3, 'sine', 0.2, 900);
    await wait(120);
    const wrap = el('rr-sq'), sign = mk('rr-sq-sign'); sign.innerHTML = 'Thank you!<small>- delivered by Squaishey</small>';
    wrap.style.left = r.cx + 'px'; wrap.style.top = Math.max(8, r.t - 190) + 'px';
    wrap.append(sign, squaishey());
    later(() => wrap.remove(), 4200);
    later(() => tone(500, 0, 0.12, 'triangle', 0.12, 900), 80);
    later(() => { tone(784, 0, 0.3, 'triangle', 0.14); tone(988, 0.12, 0.5, 'triangle', 0.14); rain(['♡', '💌', '✨'], 18); }, 900);
    await wait(2800);
    heroOut();
    await wait(900);
    heroTop('46%');
  }

  // the hidden song: five taps on the title, and it starts (it keeps playing under the finale)
  async function sSong(){
    cap('');
    const w = W(), h = H(), title = el('rr-lyric', "For when you're feeling down"); title.style.top = '30%';
    await wait(300); title.classList.add('in');
    await wait(900);
    for(let k = 0; k < 5; k++){ ripple(w / 2, h * 0.3 + 14); tone(660 + k * 60, 0, 0.12, 'triangle', 0.1); await wait(330); }
    await wait(300);
    title.classList.remove('in'); later(() => title.remove(), 1000);
    startSong();
    notesAt(w / 2 - 80, 160, h * 0.5, 6);
    const LY = ['These adventures have been so much fun', 'Keep moving forward, I feel so proud today', 'I want to say, Thank You', 'Together we will stand'];
    for(let i = 0; i < LY.length; i++){
      const ly = el('rr-lyric', LY[i]); await wait(60); ly.classList.add('in');
      notesAt(w * 0.3, w * 0.4, h * 0.5, 3);
      await wait(i === LY.length - 1 ? 2600 : 3000);
      ly.classList.remove('in'); later(() => ly.remove(), 1000);
      if(i < LY.length - 1) await wait(700);
    }
    if(R.constLab) R.constLab.classList.remove('in');
  }

  /* ------------------------------------------------------------------ the song (lives on past the scenes, under the finale) */
  function startSong(){
    if(R.song) return;
    const a = document.createElement('audio'); a.preload = 'auto';
    [['thank-you-song.mp3', 'audio/mpeg'], ['thank-you-song.m4a', 'audio/mp4'], ['thank-you-song.ogg', 'audio/ogg'], ['thank-you-song.wav', 'audio/wav']].forEach(([s, ty]) => { const so = document.createElement('source'); so.src = s; so.type = ty; a.appendChild(so); });
    a.volume = 0; R.song = a;
    let p; try{ p = a.play(); }catch(e){}
    if(p && p.then) p.then(() => {
      padOff(3);                                     // the real song takes over from the pad
      let k = 0; const iv = setInterval(() => { k++; try{ a.volume = Math.min(0.7, 0.7 * k / 30); }catch(e){} if(k >= 30) clearInterval(iv); }, 100);
    }).catch(() => {});                              // file missing or blocked: the pad just carries on
  }
  function fadeSong(a, ms){
    if(!a) return;
    const v0 = a.volume, steps = Math.max(1, Math.round((ms || 2200) / 100)); let k = 0;
    const iv = setInterval(() => { k++; try{ a.volume = Math.max(0, v0 * (1 - k / steps)); }catch(e){} if(k >= steps){ clearInterval(iv); try{ a.pause(); }catch(e){} } }, 100);
  }

  // Squaishey: her real picture if it's there, a little drawn one if not (same as the reasons page)
  function squaishey(){
    const body = mk('rr-sq-body'), img = new Image(); img.alt = 'Squaishey';
    const names = ['sqaishey', 'Sqaishey', 'squaishey', 'Squaishey', 'squishey'].map(n => 'media/reasons/' + n + '.png'); let ni = 0; img.src = names[0];
    img.onerror = () => {
      if(++ni < names.length){ img.src = names[ni]; return; }
      const d = document.createElement('div');
      d.innerHTML = '<svg viewBox="0 0 200 180"><ellipse cx="100" cy="108" rx="78" ry="62" fill="#f6b8c8" stroke="#c97a92" stroke-width="4"/><ellipse cx="72" cy="96" rx="7" ry="10" fill="#3a2010"/><ellipse cx="128" cy="96" rx="7" ry="10" fill="#3a2010"/><ellipse cx="56" cy="118" rx="12" ry="7" fill="#ee8fa8" opacity=".7"/><ellipse cx="144" cy="118" rx="12" ry="7" fill="#ee8fa8" opacity=".7"/><path d="M88 118 Q100 132 112 118" stroke="#3a2010" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="28" cy="100" rx="12" ry="20" fill="#f6b8c8" stroke="#c97a92" stroke-width="4" transform="rotate(-20 28 100)"/><ellipse cx="172" cy="100" rx="12" ry="20" fill="#f6b8c8" stroke="#c97a92" stroke-width="4" transform="rotate(20 172 100)"/></svg>';
      img.replaceWith(d.firstChild);
    };
    body.append(img); return body;
  }

  /* ------------------------------------------------------------------ the whole thing, in order */
  async function show(){
    // prologue: the sky comes out, the pad starts, the first loose stars of the constellation begin to appear
    act('rgba(10,20,60,.34)', 'am');
    R.sky.classList.add('on');
    constBegin();
    cap('twenty-one little secrets');
    await wait(2600);

    // I - the quiet ones
    await sPeek(); await sStar(); await sRead();
    // II - play
    await sBeans(); await sNoodles(); await sBingBong(); await sTwoAm(); await sDoobe(); await sAdam(); await sYeah();
    // III - chaos
    await sBus(); await sMuscle(); await sFan(); await sWellMen(); await sEnergy(); await sPhas();
    // IV - the tender part
    await sSea(); await sLove(); await sThanks(); await sSong();
  }

  /* ------------------------------------------------------------------ entry point */
  function build(o){
    const root = mk('rr-root'); o.appendChild(root);
    const stage = mk('rr-stage', null, root);
    const sky = mk('rr-sky', null, stage);
    for(let i = 0; i < 70; i++){
      const s = mk('rr-star', null, sky), z = 1 + Math.random() * 2.2;
      s.style.left = (Math.random() * 100) + '%'; s.style.top = (Math.random() * 100) + '%'; s.style.width = s.style.height = z + 'px';
      s.style.setProperty('--tw', (2 + Math.random() * 3) + 's'); s.style.setProperty('--td', (-Math.random() * 4) + 's');
    }
    const tint = mk('rr-tint', null, stage), capEl = mk('rr-cap', null, root);
    const slot = mk('rr-slot', null, stage), card = mk('rr-card hid', '', slot);
    slot.style.transition = 'opacity .8s,top .5s';
    R = { root, stage, sky, tint, capEl, hero:{ slot, card }, heroVis:false, dead:false, pending:new Set(), timers:new Set(), song:null, const:null, constLab:null, capT:null };
    return R;
  }
  function abort(){
    if(!R || R.dead) return;
    R.dead = true;
    R.pending.forEach(p => { clearTimeout(p.t); p.rej(DEAD); }); R.pending.clear();
    R.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); R.timers.clear();
    files.forEach(a => { try{ a.pause(); }catch(e){} }); files.clear();
  }

  async function play(o, finale, next){
    injectCSS();
    if(reduced()){ finale(next); return; }
    build(o);
    const myR = R;
    ac();
    // Browsers keep audio switched off until someone has tapped the page. If that's the case, a small hint appears and any tap switches the sound on.
    let hint = null;
    const unlock = () => { ac(); if(hint){ hint.remove(); hint = null; } };
    const onKey = e => { if(e.key === 'Escape') abort(); else unlock(); };
    document.addEventListener('pointerdown', unlock); document.addEventListener('keydown', onKey);
    setTimeout(() => { if(actx && actx.state === 'suspended' && !myR.dead){ hint = mk('rr-snd', 'tap for sound ♪', myR.root); } }, 700);

    try{ await show(); }catch(e){ if(e !== DEAD) console.warn('[reasons-reel]', e); }
    document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', onKey);
    if(hint){ hint.remove(); hint = null; }
    abort();

    // everything in the foreground is cleared; the sky and the constellation stay behind the finale
    [...myR.stage.children].forEach(n => { if(!n.classList.contains('rr-sky') && !n.classList.contains('rr-tint') && !n.classList.contains('rr-const')) n.remove(); });
    myR.capEl.remove();
    const song = myR.song;
    // the old wall of cards -> heart -> burst, with the song (if it started) still playing underneath
    finale(() => {
      fadeSong(song, 2200); padOff(2);
      myR.root.style.opacity = '0';
      setTimeout(() => { myR.root.remove(); if(R === myR) R = null; next(); }, 700);
    });
  }

  window.ReasonsReel = { play, _tone: tone };
})();
