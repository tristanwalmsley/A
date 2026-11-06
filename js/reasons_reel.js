/* ==========================================================================
   reasons_reel.js - the long Prestige II celebration: every one of the 21 secrets on the reasons page, replayed.
   Loaded on the home page (after eggs.js, before home.js). home.js calls:
       ReasonsReel.play(overlay, finale, next)
   - overlay = the celebration overlay, finale(cb) = the old wall-of-cards -> heart -> burst animation (kept as the grand finale),
     next() = carries on to the badge medal.
   Each secret is one scene in SCENES below: its real gesture is acted out by an on-screen finger, with the same sounds
   (the page's own synth tones + media/reasons/yeah.mp3, bing_chilling.mp3, thank-you-song.*, sqaishey.png) and the same visuals.
   Controls while it plays: next secret, skip to the finale, mute. A start screen lets a repeat viewing skip straight to the finale.
   To change a scene: edit its entry in SCENES. To reorder: reorder SCENES.
   ========================================================================== */
(function(){
  'use strict';
  const NS = 'http://www.w3.org/2000/svg', CANCEL = { cancelled:true };
  const reduced = () => { try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

  /* ------------------------------------------------------------------ styles */
  const CSS = `
.rr-root{position:absolute;inset:0;z-index:5;pointer-events:none;font-family:'EB Garamond',Georgia,serif;color:#3a2010}
.rr-stage{position:absolute;inset:0;overflow:hidden}
.rr-stage.rr-quake{animation:rrQuake .4s ease-in-out}
@keyframes rrQuake{0%,100%{transform:translate(0,0)}20%{transform:translate(-6px,4px)}40%{transform:translate(6px,-4px)}60%{transform:translate(-4px,3px)}80%{transform:translate(3px,-2px)}}
.rr-slot{position:absolute;left:50%;top:46%;width:min(86vw,440px);transform:translate(-50%,-50%);z-index:2;transition:top .4s}
.rr-card{position:relative;background:#fffdf5;border:1px solid #d4b483;padding:.9rem 1.1rem;font-size:1.05rem;line-height:1.7;color:#3a2010;box-shadow:0 12px 44px rgba(0,0,0,.5);transform-origin:50% 50%}
.rr-card.hid{background:rgba(255,253,245,.1);border-color:rgba(255,255,255,.22);color:rgba(255,255,255,.4);font-family:'Caveat',cursive;font-size:1.15rem;letter-spacing:2px;text-align:center;box-shadow:none}
.rr-card.pop{animation:rrPop .45s ease}
@keyframes rrPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
.rr-card.press{transform:scale(.96) translateY(2px);box-shadow:inset 0 3px 10px rgba(58,32,16,.25)}
.rr-card.ring{animation:rrRing .9s ease-out}
@keyframes rrRing{0%{box-shadow:0 0 0 0 rgba(200,148,58,.8)}100%{box-shadow:0 0 0 30px rgba(200,148,58,0)}}
.rr-card.shake{animation:rrShake .5s ease-in-out}
@keyframes rrShake{0%,100%{transform:rotate(0)}15%{transform:rotate(-4deg) scale(1.03)}30%{transform:rotate(4deg) scale(1.03)}45%{transform:rotate(-3deg)}60%{transform:rotate(3deg)}75%{transform:rotate(-1.5deg)}}
.rr-card.peeking{animation:rrPeek 2.2s linear forwards}
@keyframes rrPeek{0%{transform:translate(0,0)}20%{transform:translate(1px,1px) rotate(.4deg)}40%{transform:translate(2px,-1px) rotate(.8deg)}60%{transform:translate(3px,0) rotate(1.2deg);box-shadow:0 0 14px 2px rgba(200,148,58,.3)}80%{transform:translate(-4px,-1px) rotate(-1.6deg);box-shadow:0 0 24px 4px rgba(200,148,58,.5)}100%{transform:translate(5px,0) rotate(1.8deg);box-shadow:0 0 38px 8px rgba(200,148,58,.75)}}
.rr-card.doobe{animation:rrDoobe 1.8s ease-in-out}
@keyframes rrDoobe{0%{transform:scale(1,1)}12%{transform:scale(1.08,.86)}25%{transform:scale(.92,1.18) rotate(-2deg)}38%{transform:scale(1.1,.88) rotate(2deg)}52%{transform:scale(.94,1.14) rotate(-2deg)}66%{transform:scale(1.06,.92)}80%{transform:scale(1.02,1.2)}100%{transform:scale(1,1)}}
.rr-col .rr-card{margin-bottom:.55rem;font-size:.95rem;padding:.6rem .9rem;line-height:1.5}
.rr-count{margin-top:.6rem;text-align:center;font-family:'Caveat',cursive;font-size:1.3rem;color:#d4b483;letter-spacing:1px}
.rr-end{position:absolute;left:0;right:0;bottom:16%;text-align:center;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.6rem,6vw,2.6rem);color:#faf4e8;text-shadow:0 0 22px rgba(232,185,90,.8);animation:rrPop .6s ease both}

/* the on-screen finger that acts out each gesture */
.rr-touch{position:absolute;z-index:40;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;background:rgba(255,243,196,.35);border:2px solid rgba(255,243,196,.9);box-shadow:0 0 16px rgba(255,215,106,.55);pointer-events:none;transition:transform .12s,background .12s}
.rr-touch.down{transform:scale(.72);background:rgba(255,215,106,.65)}

/* HUD */
.rr-chip{position:absolute;left:50%;top:1rem;z-index:90;transform:translate(-50%,-24px);max-width:94vw;padding:.45rem 1.2rem;border-radius:999px;background:#c8943a;color:#3a2010;font-family:'Caveat',cursive;font-size:1.25rem;text-align:center;box-shadow:4px 4px 0 #7a5230;opacity:0;transition:opacity .45s,transform .55s cubic-bezier(.34,1.56,.64,1);pointer-events:none}
.rr-chip.show{opacity:1;transform:translate(-50%,0)}
.rr-chip.found{background:#fff3c4}
.rr-ctl{position:absolute;left:0;right:0;bottom:.9rem;z-index:95;display:flex;gap:.55rem;justify-content:center;flex-wrap:wrap;pointer-events:auto;padding:0 .6rem}
.rr-btn{font-family:'Caveat',cursive;font-size:1.1rem;color:#faf4e8;background:rgba(40,22,10,.75);border:1px dashed rgba(212,180,131,.75);border-radius:999px;padding:.28rem 1rem;cursor:pointer;transition:background .2s,color .2s}
.rr-btn:hover{background:#f0ddb8;color:#3a2010}
.rr-prog{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.08);z-index:96}
.rr-prog i{display:block;height:100%;width:0;background:#c8943a;transition:width .7s ease}
.rr-gate{position:absolute;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;text-align:center;padding:1.5rem;pointer-events:auto;animation:rrPop .6s ease both}
.rr-gate h2{font-family:'Playfair Display',serif;font-style:italic;font-weight:400;font-size:clamp(1.7rem,6vw,2.6rem);color:#faf4e8;text-shadow:0 0 24px rgba(232,185,90,.7)}
.rr-gate p{font-family:'Caveat',cursive;font-size:1.35rem;color:#d4b483;letter-spacing:1px;max-width:26rem;line-height:1.35}
.rr-gate .rr-go{font-family:'Caveat',cursive;font-size:1.5rem;color:#3a2010;background:#c8943a;border:none;padding:.7rem 1.8rem;cursor:pointer;box-shadow:4px 4px 0 #7a5230}
.rr-gate .rr-go:hover{background:#e0a840}
.rr-gate .rr-no{font-family:'Caveat',cursive;font-size:1.15rem;color:#faf4e8;background:none;border:1px dashed rgba(212,180,131,.7);border-radius:999px;padding:.3rem 1.1rem;cursor:pointer}
.rr-gate .rr-no:hover{background:#f0ddb8;color:#3a2010}

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
.rr-big{position:absolute;left:50%;top:42%;z-index:59;transform:translate(-50%,-50%);font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(2.2rem,10vw,5.5rem);color:#fff;text-shadow:0 0 24px rgba(160,220,255,.9);pointer-events:none;white-space:nowrap;text-align:center;animation:rrBig 3.2s ease forwards}
@keyframes rrBig{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}22%{transform:translate(-50%,-50%) scale(1)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.1)}}

/* star */
.rr-shoot{position:absolute;width:46px;height:46px;z-index:20;animation:rrShoot 3.8s cubic-bezier(.3,.1,.6,1) forwards}
.rr-shoot::before{content:'\\2726';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:22px;color:#fff3c4;text-shadow:0 0 12px #ffd76a,0 0 26px rgba(255,215,106,.8)}
.rr-shoot::after{content:'';position:absolute;left:50%;top:50%;width:200px;height:2px;transform-origin:left center;transform:rotate(var(--ang));background:linear-gradient(90deg,rgba(255,243,196,.95),rgba(255,243,196,0))}
@keyframes rrShoot{0%{opacity:0;transform:translate(0,0)}8%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy))}}
.rr-wish{position:absolute;left:0;right:0;top:46%;text-align:center;font-family:'Caveat',cursive;font-size:2.4rem;color:#fff3c4;text-shadow:0 0 18px rgba(255,215,106,.9);opacity:0;transition:opacity 1s;letter-spacing:2px}
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
.rr-road{position:absolute;left:0;right:0;height:64px;z-index:18;background:#2b2b2e;border-top:3px solid #555;border-bottom:3px solid #555;pointer-events:none;animation:rrPop .4s ease both}
.rr-road::after{content:'';position:absolute;left:0;right:0;top:50%;border-top:3px dashed rgba(255,230,160,.7)}
.rr-zone{position:absolute;height:64px;width:110px;z-index:19;pointer-events:none;border:3px dashed rgba(255,120,110,.9);border-radius:4px;transition:background .15s,border-color .15s}
.rr-zone.in{background:rgba(120,220,120,.35);border-color:#7ae07a}
.rr-stop{position:absolute;z-index:20;pointer-events:none;font-size:2.4rem;line-height:1;transform:translateX(-50%)}
.rr-bus{position:absolute;left:0;z-index:21;pointer-events:none;font-size:3rem;line-height:1;will-change:transform}
.rr-hint{position:absolute;left:0;right:0;z-index:20;text-align:center;font-family:'Caveat',cursive;font-size:1.3rem;letter-spacing:1px;color:#faf4e8;text-shadow:0 2px 8px rgba(0,0,0,.7);pointer-events:none;transition:opacity .6s}

/* muscle */
.rr-muscle{position:absolute;inset:0;z-index:62;pointer-events:none;overflow:hidden;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#f6d27a,#c8943a 60%,#7a5230);animation:rrMusBg 3.3s ease forwards}
@keyframes rrMusBg{0%{opacity:0}6%{opacity:1}88%{opacity:1}100%{opacity:0}}
.rr-muscle .arm{line-height:1;animation:rrMusArm 3.3s ease forwards}
@keyframes rrMusArm{0%{transform:scale(.05) rotate(-35deg)}20%{transform:scale(1) rotate(0)}30%{transform:scale(1.13)}40%{transform:scale(1)}50%{transform:scale(1.13)}60%{transform:scale(1)}70%{transform:scale(1.13)}85%{transform:scale(1.02)}100%{transform:scale(1.25)}}
.rr-muscle .mus-txt{position:absolute;left:0;right:0;bottom:7%;text-align:center;font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.8rem,8vw,4.5rem);letter-spacing:4px;color:#fff;-webkit-text-stroke:2px #3a2010;text-shadow:5px 5px 0 #3a2010}

/* heart */
.rr-heartcv{position:absolute;inset:0;z-index:21;pointer-events:none}
.rr-heartpop{position:absolute;z-index:59;pointer-events:none;line-height:1;transform:translate(-50%,-50%);filter:drop-shadow(0 0 24px rgba(232,120,110,.9));animation:rrHeartBeat 3s ease forwards}
@keyframes rrHeartBeat{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}12%{opacity:1;transform:translate(-50%,-50%) scale(1)}25%{transform:translate(-50%,-50%) scale(1.25)}38%{transform:translate(-50%,-50%) scale(1)}51%{transform:translate(-50%,-50%) scale(1.25)}64%{transform:translate(-50%,-50%) scale(1)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}

/* phas monday */
.rr-dark{--x:50%;--y:50%;position:absolute;inset:0;z-index:60;pointer-events:none;background:radial-gradient(circle 120px at var(--x) var(--y),rgba(0,0,0,0) 0,rgba(0,0,0,.35) 60%,rgba(0,0,0,.97) 100%);animation:rrFlick .9s steps(1) forwards}
@keyframes rrFlick{0%{opacity:0}10%{opacity:1}20%{opacity:.1}30%{opacity:1}40%{opacity:0}55%{opacity:1}65%{opacity:.3}100%{opacity:1}}
.rr-dark .msg{position:absolute;left:0;right:0;top:14%;text-align:center;font-family:'Caveat',cursive;font-size:1.6rem;color:rgba(250,244,232,.6);letter-spacing:2px;animation:rrMsg 2.4s ease-in-out infinite}
@keyframes rrMsg{0%,100%{opacity:.2}50%{opacity:.9}}
.rr-ghost{position:absolute;left:0;top:0;z-index:59;pointer-events:none;font-size:2.6rem;opacity:.75;filter:grayscale(.3) drop-shadow(0 0 14px rgba(180,230,255,.8))}
.rr-scare{position:absolute;inset:0;z-index:80;background:#000;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden}
.rr-scare svg{width:min(90vw,90vh);height:auto;filter:drop-shadow(0 0 40px rgba(180,230,255,.8));animation:rrScareZoom .9s cubic-bezier(.1,.9,.2,1) forwards,rrScareShake .07s linear infinite}
@keyframes rrScareZoom{0%{transform:scale(.15)}12%{transform:scale(1.35)}100%{transform:scale(1.8)}}
@keyframes rrScareShake{0%,100%{margin:0}25%{margin:-12px 10px}50%{margin:10px -12px}75%{margin:-8px -8px}}

/* squaishey */
.rr-sq{position:absolute;margin-left:-90px;width:180px;z-index:30;pointer-events:none;transform-origin:50% 100%;animation:rrSqPop 4.4s ease forwards}
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
.rr-dlg{position:absolute;z-index:62;width:min(78vw,300px);background:#ece9d8;border:2px solid #fff;border-right-color:#5a5a5a;border-bottom-color:#5a5a5a;box-shadow:3px 3px 0 rgba(0,0,0,.4);font-family:Tahoma,Verdana,sans-serif;font-size:.85rem;color:#000;pointer-events:none}
.rr-dlg-t{background:linear-gradient(90deg,#0a246a,#a6caf0);color:#fff;padding:.2rem .4rem;font-weight:700;display:flex;justify-content:space-between}
.rr-dlg-b{padding:.8rem;display:flex;gap:.6rem;align-items:flex-start}
.rr-dlg-i{font-size:1.6rem;line-height:1}
.rr-dlg-btn{display:block;margin:0 auto .7rem;padding:.15rem 1.4rem;border:2px solid #fff;border-right-color:#555;border-bottom-color:#555;background:#ece9d8;width:max-content}

/* foam finger */
.rr-hand{position:absolute;left:0;top:0;z-index:30;pointer-events:none;font-size:3.4rem;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5))}
.rr-fan{position:absolute;inset:0;z-index:59;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 30%,rgba(255,240,170,.55),rgba(0,0,0,.78) 70%);animation:rrFanOv 3.4s ease forwards}
@keyframes rrFanOv{0%{opacity:0}12%{opacity:1}85%{opacity:1}100%{opacity:0}}
.rr-fan .f{font-size:clamp(6rem,30vw,13rem);line-height:1;animation:rrFanBob .45s ease-in-out infinite alternate}
@keyframes rrFanBob{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(-22px) rotate(6deg)}}
.rr-fan .t{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.6rem,7vw,3.2rem);color:#c8943a;letter-spacing:3px;text-shadow:3px 3px 0 #3a2010;text-align:center}

/* plane + sea */
.rr-sea{position:absolute;left:0;right:0;bottom:0;height:13%;min-height:70px;z-index:18;overflow:hidden;white-space:nowrap;font-size:3rem;line-height:1;pointer-events:none;background:linear-gradient(0deg,rgba(60,130,190,.65),rgba(60,130,190,0));animation:rrPop .5s ease both}
.rr-plane{position:absolute;left:0;top:0;z-index:30;pointer-events:none;font-size:2.4rem}
.rr-lab{position:absolute;z-index:19;transform:translateX(-50%);pointer-events:none;font-family:'Caveat',cursive;font-size:1.5rem;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.7);white-space:nowrap}
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

/* constellation */
.rr-const{position:absolute;inset:0;width:100%;height:100%;z-index:22;pointer-events:none;transition:opacity 1s}
.rr-const.out{opacity:0}
.rr-const-line{fill:none;stroke:rgba(255,230,160,.8);stroke-width:1.5;transition:stroke-dashoffset 5s linear;filter:drop-shadow(0 0 6px rgba(255,215,106,.8))}
.rr-const-dot{fill:#fff3c4;opacity:0;transform-box:fill-box;transform-origin:center;animation:rrDotIn .5s ease forwards;filter:drop-shadow(0 0 6px #ffd76a)}
@keyframes rrDotIn{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
.rr-const-label{position:absolute;left:50%;top:50%;z-index:23;transform:translate(-50%,-50%);font-family:'Caveat',cursive;font-size:2rem;color:#faf4e8;text-shadow:0 0 18px rgba(255,215,106,.9);opacity:0;transition:opacity 1.2s;pointer-events:none;text-align:center;white-space:nowrap}
.rr-const-label.in{opacity:1}

/* the song */
.rr-pill{position:absolute;left:50%;bottom:3.6rem;z-index:96;display:flex;align-items:center;gap:.6rem;padding:.55rem 1rem;border-radius:999px;background:rgba(58,32,16,.82);backdrop-filter:blur(6px);box-shadow:0 3px 16px rgba(0,0,0,.35);border:1px solid rgba(200,148,58,.4);color:#faf4e8;font-family:'Caveat',cursive;font-size:1.05rem;opacity:0;transform:translate(-50%,140%);transition:opacity .7s,transform .7s cubic-bezier(.34,1.56,.64,1);pointer-events:none}
.rr-pill.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.rr-pill .n{display:inline-block;animation:rrBob 1.2s ease-in-out infinite}
.rr-pill.paused .n{animation:none;opacity:.5}
@keyframes rrBob{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-3px) rotate(6deg)}}
.rr-pill button{background:none;border:none;color:#c8943a;font-size:1.1rem;cursor:pointer;line-height:1;padding:0 .1rem}
.rr-pill input[type=range]{-webkit-appearance:none;appearance:none;width:90px;height:4px;border-radius:999px;background:rgba(255,255,255,.35);outline:none;cursor:pointer}
.rr-pill input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:#c8943a;box-shadow:0 0 0 2px rgba(255,255,255,.7)}
.rr-pill input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;border:none;background:#c8943a}
.rr-lyric{position:absolute;left:0;right:0;top:44%;z-index:24;text-align:center;padding:0 1.5rem;font-family:'Playfair Display',serif;font-style:italic;font-size:clamp(1.4rem,5vw,2.4rem);color:#faf4e8;text-shadow:0 0 22px rgba(232,185,90,.85);opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s}
.rr-lyric.in{opacity:1;transform:none}
`;
  let cssDone = false;
  function injectCSS(){
    if(cssDone) return; cssDone = true;
    const st = document.createElement('style'); st.id = 'rr-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  const mk = (cls, text, parent) => { const e = document.createElement('div'); e.className = cls; if(text != null) e.textContent = text; if(parent) parent.appendChild(e); return e; };

  /* ------------------------------------------------------------------ sound (the reasons page's own synth, plus its audio files) */
  let actx = null, master = null, muted = false;
  const files = new Set();
  function ac(){
    try{
      if(!actx){ actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(actx.destination); }
      if(actx.state === 'suspended') actx.resume();
      return actx;
    }catch(e){ return null; }
  }
  function tone(freq, at, dur, type, vol, glideTo){
    const c = ac(); if(!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if(glideTo) o.frequency.linearRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, f0, f1){
    const c = ac(); if(!c) return;
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(f0, c.currentTime); if(f1) f.frequency.linearRampToValueAtTime(f1, c.currentTime + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  function playFile(src, vol){
    try{
      const a = new Audio(src); a.volume = vol == null ? 1 : vol; a.muted = muted; files.add(a);
      a.addEventListener('ended', () => files.delete(a));
      const p = a.play(); if(p && p.catch) p.catch(() => {});
      return a;
    }catch(e){ return null; }
  }
  const stopFile = a => { try{ a.pause(); }catch(e){} files.delete(a); };
  function setMuted(m){
    muted = m; if(master) master.gain.value = m ? 0 : 1;
    files.forEach(a => { a.muted = m; });
    if(R && R.song) R.song.muted = m;
  }

  /* ------------------------------------------------------------------ the show runner */
  let R = null;   // the running show

  function cancelScene(sc){
    if(!sc || sc.cancelled) return;
    sc.cancelled = true;
    sc.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    sc.pending.forEach(p => { clearTimeout(p.t); p.rej(CANCEL); });
    sc.pending.clear();
  }

  function makeCtx(sc){
    const st = R.stage;
    const c = {
      sc, stage: st,
      get W(){ return st.clientWidth; },
      get H(){ return st.clientHeight; },
      // timing: everything the scene waits on is cancellable, so "next" / "skip" can cut a scene off cleanly
      wait(ms){ return new Promise((res, rej) => { if(sc.cancelled) return rej(CANCEL); const p = {}; p.rej = rej; p.t = setTimeout(() => { sc.pending.delete(p); res(); }, ms); sc.pending.add(p); }); },
      later(fn, ms){ const t = setTimeout(() => { if(!sc.cancelled) fn(); }, ms); sc.timers.add(t); return t; },
      every(fn, ms){ const t = setInterval(() => { if(!sc.cancelled) fn(); }, ms); sc.timers.add(t); return t; },
      stopEvery(t){ clearInterval(t); sc.timers.delete(t); },
      tween(ms, f){ return new Promise((res, rej) => { const t0 = performance.now(); const step = now => { if(sc.cancelled) return rej(CANCEL); const p = Math.min(1, (now - t0) / ms); f(p); if(p < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); }); },
      bg(fn){ Promise.resolve().then(fn).catch(e => { if(e !== CANCEL) console.warn('[reasons-reel]', e); }); },
      // elements
      el(cls, text, parent){ const e = mk(cls, text); (parent || st).appendChild(e); if(!parent) sc.nodes.push(e); return e; },
      add(node){ st.appendChild(node); sc.nodes.push(node); return node; },
      rel(e){ const a = st.getBoundingClientRect(), r = e.getBoundingClientRect(); return { l:r.left - a.left, t:r.top - a.top, w:r.width, h:r.height, r:r.right - a.left, b:r.bottom - a.top, cx:r.left - a.left + r.width / 2, cy:r.top - a.top + r.height / 2 }; },
      card(text, o){
        o = o || {}; const slot = c.el('rr-slot'); if(o.top) slot.style.top = o.top;
        const card = mk('rr-card' + (o.hid ? ' hid' : ''), text, slot);
        return { slot, card };
      },
      // sound (silent once a scene has been cut off)
      tone(...a){ if(!sc.cancelled) tone(...a); },
      noise(...a){ if(!sc.cancelled) noise(...a); },
      file(src, vol){ const a = playFile(src, vol); if(a) sc.audios.push(a); return a; },
      // the finger
      touch(x, y){ const t = c.el('rr-touch'); t.style.left = x + 'px'; t.style.top = y + 'px'; return t; },
      press(t, on){ t.classList.toggle('down', !!on); },
      moveTouch(t, x, y){ t.style.left = x + 'px'; t.style.top = y + 'px'; },
      // shared effects (these outlive the scene on purpose, so a rain of noodles can drift into the next scene)
      fx(node, ms){ st.appendChild(node); setTimeout(() => node.remove(), ms || 2000); return node; },
      rain(glyphs, n){
        const layer = mk('rr-fx');
        for(let i = 0; i < n; i++){
          const d = mk('rr-drop', glyphs[i % glyphs.length]);
          d.style.left = (Math.random() * 98) + '%'; d.style.fontSize = (1.4 + Math.random() * 1.6) + 'rem';
          d.style.setProperty('--fd', (2.2 + Math.random() * 1.6) + 's'); d.style.setProperty('--fdl', (Math.random() * 1.4) + 's');
          d.style.setProperty('--fr', ((Math.random() - 0.5) * 720) + 'deg');
          layer.appendChild(d);
        }
        c.fx(layer, 5400);
      },
      noteAt(x, y, glyph){
        const e = mk('rr-note', glyph); e.style.left = x + 'px'; e.style.top = y + 'px';
        e.style.setProperty('--nx', ((Math.random() - 0.5) * 140) + 'px'); e.style.setProperty('--nr', ((Math.random() - 0.5) * 60) + 'deg');
        c.fx(e, 1700);
      },
      notes(card, n){
        const r = c.rel(card);
        for(let i = 0; i < n; i++) c.later(() => c.noteAt(r.l + Math.random() * r.w, r.cy, ['♪', '♫', '♡'][i % 3]), i * 140);
      },
      sparks(x, y, n){
        for(let i = 0; i < n; i++){
          const sp = mk('rr-spark', '✦'), a = (i / n) * Math.PI * 2, d = 50 + Math.random() * 70;
          sp.style.left = x + 'px'; sp.style.top = y + 'px';
          sp.style.setProperty('--sx', Math.cos(a) * d + 'px'); sp.style.setProperty('--sy', Math.sin(a) * d + 'px');
          c.fx(sp, 1000);
        }
      },
      word(txt, x, y){ const w = mk('rr-word', txt); w.style.left = x + 'px'; w.style.top = y + 'px'; c.fx(w, 1400); },
      quake(){ st.classList.remove('rr-quake'); void st.offsetWidth; st.classList.add('rr-quake'); setTimeout(() => st.classList.remove('rr-quake'), 450); },
      bump(el, cls, ms){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); c.later(() => el.classList.remove(cls), ms || 800); },
      spring(card, ms){ card.style.transition = 'transform ' + (ms || 600) + 'ms cubic-bezier(.34,1.8,.5,1)'; card.style.transform = ''; c.later(() => { card.style.transition = ''; card.style.transformOrigin = ''; }, (ms || 600) + 60); },
      big(txt, color, glow, top){ const t = c.el('rr-big', txt); if(color) t.style.color = color; if(glow) t.style.textShadow = glow; if(top) t.style.top = top; return t; },
      say(txt, ms){ R.say(txt, ms); }
    };
    return c;
  }

  async function runScene(def, idx){
    const sc = { nodes:[], timers:new Set(), pending:new Set(), audios:[], cancelled:false, skipped:false };
    R.cur = sc;
    const c = makeCtx(sc);
    R.chip((idx + 1) + ' / ' + SCENES.length + '  ·  ' + def.hint);
    R.prog((idx) / SCENES.length);
    try{ await def.run(c); }catch(e){ if(e !== CANCEL) console.warn('[reasons-reel] scene "' + def.id + '" failed:', e); }
    const wasSkipped = sc.skipped;
    cancelScene(sc);
    sc.nodes.forEach(n => n.remove());
    if(wasSkipped) sc.audios.forEach(stopFile);
    R.cur = null;
    if(!R.stopAll && !wasSkipped){
      const names = (window.PageEggs && PageEggs.names && PageEggs.names.reasons) || {};
      R.chip('secret found ♡  ' + (idx + 1) + ' / ' + SCENES.length + '  ·  ' + (names[def.id] || def.id), 1500, true);
      R.prog((idx + 1) / SCENES.length);
      await sleep(1500);
    }
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ------------------------------------------------------------------ the 21 scenes */
  const easeIO = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  const SCENES = [
    // 1. hold a hidden reason
    { id:'peek', hint:'press and hold a hidden reason', async run(c){
      const { card } = c.card('✦ tap to reveal ✦', { hid:true });
      await c.wait(600);
      const r = c.rel(card), t = c.touch(r.cx, r.cy); c.press(t, true);
      card.classList.add('peeking');
      await c.wait(2200);
      c.tone(392, 0, 0.5, 'triangle', 0.16, 600);
      card.classList.remove('peeking', 'hid'); card.textContent = "You're proud of me out loud."; card.classList.add('pop');
      c.press(t, false); t.remove();
      await c.wait(1700);
    } },

    // 2. catch the shooting star
    { id:'star', hint:'catch the shooting star', async run(c){
      const W = c.W, H = c.H, s = c.el('rr-shoot'), dx = -(W * 0.5 + 240), dy = -dx * 0.62;
      s.style.left = (W * 0.8) + 'px'; s.style.top = (H * 0.12) + 'px';
      s.style.setProperty('--dx', dx + 'px'); s.style.setProperty('--dy', dy + 'px'); s.style.setProperty('--ang', Math.atan2(-dy, -dx) + 'rad');
      const wish = c.el('rr-wish', '✦ make a wish ✦');
      await c.wait(1500);
      const r = c.rel(s), t = c.touch(r.cx, r.cy); c.press(t, true);
      await c.wait(160);
      c.sparks(r.cx, r.cy, 16); s.remove(); t.remove();
      c.tone(1318, 0, 0.5, 'sine', 0.1); c.tone(1760, 0.12, 0.6, 'sine', 0.06);
      await c.wait(500); wish.classList.add('in');
      await c.wait(2200);
    } },

    // 3. read every reason, one at a time
    { id:'readall', hint:'open every reason, one at a time', async run(c){
      const slot = c.el('rr-slot'), col = mk('rr-col', null, slot);
      const T = ["You take care of the people you love.", "You're honest with me even when it'd be easier not to be.", "You make hard things feel survivable.", "Your messages can fix a rubbish day in about four seconds.", "You let me be weird. Fully, completely, unapologetically weird."];
      const cards = T.map(() => mk('rr-card hid', '✦ tap to reveal ✦', col));
      const cnt = mk('rr-count', 'reasons read: 0', col);
      await c.wait(600);
      for(let i = 0; i < cards.length; i++){
        const r = c.rel(cards[i]), t = c.touch(r.cx, r.cy); c.press(t, true);
        await c.wait(160);
        cards[i].classList.remove('hid'); cards[i].textContent = T[i]; cards[i].classList.add('pop');
        c.tone(480 + i * 70, 0, 0.14, 'triangle', 0.09); cnt.textContent = 'reasons read: ' + (i + 1);
        t.remove(); await c.wait(750);
      }
      c.el('rr-end', 'every. single. one.');
      c.tone(523, 0, .5, 'triangle', .1); c.tone(659, .12, .5, 'triangle', .1); c.tone(784, .24, .8, 'triangle', .1);
      await c.wait(2100);
    } },

    // 4. tip the tin over
    { id:'beans', hint:'tip the tin over and let it pour', async run(c){
      const { card } = c.card('Beans Means Heinz.'); card.style.transformOrigin = '100% 100%';
      await c.wait(600);
      await c.tween(900, p => { card.style.transform = 'rotate(' + (easeIO(p) * 100) + 'deg)'; });
      const spawn = () => {
        const r = c.rel(card), b = mk('rr-bean', Math.random() < 0.75 ? '🫘' : '🥫');
        const top = r.t + r.h * 0.45;
        b.style.left = (r.r - 12 - Math.random() * 30) + 'px'; b.style.top = top + 'px';
        b.style.setProperty('--bx', ((Math.random() - 0.5) * 120) + 'px'); b.style.setProperty('--br', ((Math.random() - 0.5) * 540) + 'deg'); b.style.setProperty('--by', Math.max(120, c.H - top - 40) + 'px');
        c.fx(b, 1400); if(Math.random() < .35) c.noise(.08, .05, 3000, 1500);
      };
      const iv = c.every(spawn, 70);
      await c.wait(1700); c.stopEvery(iv);
      await c.wait(200); c.rain(['🫘', '🥫'], 24);
      c.spring(card, 650);
      await c.wait(2600);
    } },

    // 5. pull the noodle taut
    { id:'noodles', hint:'pull the noodle until it twangs', async run(c){
      const { card } = c.card('Noodles Unites Us.');
      await c.wait(600);
      const r = c.rel(card), sx = r.cx > c.W / 2 ? -1 : 1, ax = sx > 0 ? r.r : r.l, ay = r.cy, ca = Math.cos(.45), sa = Math.sin(.45);
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'rr-noodle');
      const path = document.createElementNS(NS, 'path'); svg.appendChild(path); c.add(svg);
      const t = c.touch(ax, ay); c.press(t, true);
      let cx = ax, cy = ay, creaked = false;
      const draw = () => {
        const d = Math.hypot(cx - ax, cy - ay), sag = Math.max(0, 140 - d * 0.45);
        path.setAttribute('d', 'M' + ax + ' ' + ay + ' Q' + ((ax + cx) / 2) + ' ' + ((ay + cy) / 2 + sag) + ' ' + cx + ' ' + cy);
        path.style.stroke = d > 300 ? '#fff0b0' : '#f3d27a';
      };
      draw();
      await c.tween(1500, p => {
        const d = 340 * easeIO(p); cx = ax + sx * d * ca; cy = ay + d * sa; draw(); c.moveTouch(t, cx, cy);
        if(!creaked && d > 300){ creaked = true; c.tone(300, 0, 0.25, 'triangle', 0.12, 420); }
      });
      const fx = cx, fy = cy;
      c.press(t, false);
      await c.tween(160, p => { cx = fx + (ax - fx) * p; cy = fy + (ay - fy) * p; draw(); c.moveTouch(t, cx, cy); });
      c.tone(180, 0, 0.4, 'sawtooth', 0.12, 55); svg.remove(); t.remove(); c.bump(card, 'shake', 500);
      c.rain(['🍜', '🥢', '🍥'], 40);
      await c.wait(2600);
    } },

    // 6. doorbell: press = bing, let go = bong. twice
    { id:'bingbong', hint:'press... and let go. twice', async run(c){
      const { card } = c.card('bing bong, bing bong');
      await c.wait(600);
      const r = c.rel(card), t = c.touch(r.cx, r.cy);
      for(let k = 0; k < 2; k++){
        c.press(t, true); card.classList.add('press');
        c.tone(659, 0, 0.9, 'sine', 0.25); c.tone(1318, 0, 0.5, 'triangle', 0.07); c.word('bing', r.cx - 80, r.t - 10);
        await c.wait(700);
        c.press(t, false); card.classList.remove('press');
        c.tone(523, 0, 1.0, 'sine', 0.25); c.tone(1046, 0, 0.5, 'triangle', 0.06); c.word('bong', r.cx + 40, r.t - 10);
        c.bump(card, 'ring', 1000); c.notes(card, 3);
        await c.wait(1300);
      }
      t.remove(); await c.wait(300);
    } },

    // 7. the 2am text
    { id:'twoam', hint:'double-tap the 2am reason', async run(c){
      const ph = c.el('rr-sms'), mins = String(2 + Math.floor(Math.random() * 7)).padStart(2, '0');
      ph.appendChild(mk('rr-sms-time', '2:' + mins + ' am'));
      const a = mk('rr-sms-b rr-sms-me', 'random thought: penguins have knees'), dots = mk('rr-sms-dots'), b = mk('rr-sms-b rr-sms-her', 'WAIT WHAT 😭 tell me EVERYTHING');
      dots.innerHTML = '<i></i><i></i><i></i>';
      const wrap = mk(''); wrap.style.minHeight = '3rem'; wrap.style.position = 'relative'; dots.style.position = 'absolute'; wrap.append(dots, b);
      ph.append(a, wrap);
      await c.wait(60); ph.classList.add('in');
      await c.wait(500); a.classList.add('show'); c.tone(880, 0, .1, 'sine', .06);
      await c.wait(1000); dots.classList.add('show');
      await c.wait(1200); dots.classList.remove('show'); b.classList.add('show'); c.tone(660, 0, .12, 'sine', .07); c.tone(990, .1, .14, 'sine', .06);
      await c.wait(1900); ph.classList.remove('in');
      await c.wait(500);
    } },

    // 8. scrub the song like a record
    { id:'doobe', hint:'scrub it side to side like a record', async run(c){
      const { card } = c.card('DOOBEBOOBEDOOOOOOOO');
      await c.wait(600);
      const r = c.rel(card), SCALE = [262, 294, 330, 392, 440, 523], t = c.touch(r.cx, r.cy); c.press(t, true);
      let last = -1, prevX = 0;
      await c.tween(3400, p => {
        const x = Math.sin(p * Math.PI * 2 * 4.5) * r.w * 0.42, dx = x - prevX; prevX = x;
        card.style.transform = 'translateX(' + (x * 0.35) + 'px) skewX(' + Math.max(-18, Math.min(18, -dx * 1.2)) + 'deg)';
        c.moveTouch(t, r.cx + x, r.cy);
        const ni = Math.max(0, Math.min(5, Math.floor((x + r.w / 2) / r.w * 6)));
        if(ni !== last){ last = ni; c.tone(SCALE[ni], 0, 0.3, 'triangle', 0.16); if(Math.random() < 0.5) c.notes(card, 1); }
      });
      card.style.transform = ''; c.press(t, false); t.remove();
      [[262, 0, .2], [330, .22, .2], [392, .44, .2], [330, .66, .2], [523, .88, 1.1]].forEach(([f, a, du], i) => c.tone(f, a, du, 'triangle', 0.2, i === 4 ? 560 : null));
      c.notes(card, 9); card.classList.add('doobe');
      await c.wait(2400);
    } },

    // 9. scribble out the name
    { id:'adam', hint:'scribble out the name', async run(c){
      const { slot, card } = c.card('');
      card.innerHTML = 'We hate on <span class="rr-adam">Adam</span>, and that brings us closer every day';
      const word = card.querySelector('.rr-adam');
      await c.wait(700);
      const cr = card.getBoundingClientRect(), cv = document.createElement('canvas'); cv.className = 'rr-scribble'; cv.width = cr.width; cv.height = cr.height; card.appendChild(cv);
      const g = cv.getContext('2d'); g.strokeStyle = 'rgba(214,58,58,.9)'; g.lineWidth = 3.5; g.lineCap = 'round';
      const wr = word.getBoundingClientRect(), wx = wr.left - cr.left, wy = wr.top - cr.top, base = c.rel(card);
      const t = c.touch(base.l + wx, base.t + wy); c.press(t, true);
      let px = wx - 8, py = wy + wr.height * 0.3;
      await c.tween(1700, p => {
        const k = p * 7, seg = Math.floor(Math.min(k, 6.999)), f = k - seg, fw = seg % 2 ? 1 - f : f;
        const x = wx - 8 + fw * (wr.width + 16), y = wy + wr.height * 0.25 + (k / 7) * wr.height * 0.55;
        g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke(); px = x; py = y; c.moveTouch(t, base.l + x, base.t + y);
      });
      c.press(t, false); t.remove();
      word.classList.add('dead'); mk('rr-stamp', 'REJECTED', card);
      c.later(() => { c.tone(140, 0, 0.5, 'sine', 0.4, 40); c.quake(); }, 120);
      await c.wait(2000);
    } },

    // 10. nod along
    { id:'yeah', hint:'nod along with it', async run(c){
      const { card } = c.card('Yeah.');
      await c.wait(600);
      let rev = 0, lastDir = 0;
      await c.tween(2400, p => {
        const y = Math.sin(p * Math.PI * 8) * 22, dir = Math.sign(Math.cos(p * Math.PI * 8));
        if(lastDir && dir !== lastDir && p > 0.05){ rev++; c.tone(200 + rev * 40, 0, 0.14, 'sine', 0.2, 150); }
        lastDir = dir; card.style.transform = 'translateY(' + y + 'px)';
      });
      card.style.transform = '';
      c.file('media/reasons/yeah.mp3', 1);
      c.el('rr-yeah', 'YEAH.'); c.el('rr-shades', '😎');
      c.later(() => c.quake(), 150);
      await c.wait(2200);
    } },

    // 11. drive the bus
    { id:'bingchill', hint:'drive the bus up to the stop', async run(c){
      const W = c.W, H = c.H, stopX = W * 0.72, rb = H * 0.16;
      const { card } = c.card("ayup, we be bing chillin' innit, ta-ra", { top:'24%' });
      const road = c.el('rr-road'), zone = c.el('rr-zone'), stop = c.el('rr-stop', '🚏'), bus = c.el('rr-bus', '🚌'), hint = c.el('rr-hint', 'hold to drive · let go to brake · stop at the 🚏');
      road.style.bottom = rb + 'px'; zone.style.bottom = rb + 'px'; zone.style.left = (stopX - 55) + 'px';
      stop.style.left = stopX + 'px'; stop.style.bottom = (rb + 62) + 'px'; bus.style.bottom = (rb + 10) + 'px'; hint.style.bottom = (H * 0.06) + 'px';
      const r = c.rel(card), t = c.touch(r.cx, r.b - 14); c.press(t, true);
      bus.style.transform = 'translateX(-54px) scaleX(-1)';
      await c.wait(900); hint.style.opacity = 0;
      const dist = stopX + 30; let lastTick = 0, braked = false;
      await c.tween(3600, p => {
        const e = easeIO(p), x = -30 + dist * e, v = dist * (p < 0.5 ? 4 * p : 4 * (1 - p)) / 3.6;
        bus.style.transform = 'translateX(' + (x - 24) + 'px) scaleX(-1)';
        zone.classList.toggle('in', Math.abs(x - stopX) <= 55);
        const now = performance.now(); if(v > 5 && now - lastTick > 110){ lastTick = now; c.tone(55 + v * 0.12, 0, 0.1, 'sawtooth', 0.04); }
        if(p > 0.6 && !braked){ braked = true; c.press(t, false); }
      });
      t.remove();
      c.file('media/reasons/bing_chilling.mp3', 1);
      c.noise(0.7, 0.2, 5000, 1800); c.tone(660, 0.1, 0.4, 'sine', 0.12);
      c.big('ayup, ta-ra 🚌', '#fff3c4', '0 0 24px rgba(200,148,58,.9)');
      c.rain(['🚌', '🚏', '☕', '🇬🇧'], 30);
      await c.wait(3800);
    } },

    // 12. click it up to full strength
    { id:'muscle', hint:'click it up to full strength', async run(c){
      const { card } = c.card('You are a BIG MUSCLE BADDIE!');
      await c.wait(600);
      const M = 32, r0 = c.rel(card), maxS = Math.min(1.75, (c.W * 0.94) / r0.w), t = c.touch(r0.cx, r0.cy);
      card.style.position = 'relative'; card.style.zIndex = 5;
      let prev = 0;
      await c.tween(3300, p => {
        const n = Math.floor(p * M), q = Math.min(1, n / M);
        card.style.transform = 'scale(' + (1 + q * (maxS - 1)) + ') rotate(' + ((Math.random() - 0.5) * q * 3) + 'deg)';
        card.style.boxShadow = '0 0 ' + (q * 50) + 'px ' + (q * 12) + 'px rgba(214,58,58,' + (q * 0.7) + ')';
        card.style.borderColor = q > 0.25 ? 'rgb(214,58,58)' : '';
        if(n !== prev){
          prev = n; c.tone(150 + q * 500, 0, 0.15, 'square', 0.08);
          t.classList.add('down'); c.later(() => t.classList.remove('down'), 70);
          if(n % 3 === 0){ const r = c.rel(card); c.noteAt(r.l + Math.random() * r.w, r.cy, '💪'); }
        }
      });
      t.remove();
      const ov = c.el('rr-muscle'), arm = mk('arm', '💪', ov); arm.style.fontSize = (Math.max(c.W, c.H) * 1.25) + 'px'; mk('mus-txt', 'BIG MUSCLE BADDIE', ov);
      c.tone(70, 0, 1.2, 'sawtooth', 0.22, 40);
      [392, 523, 659, 784].forEach((f, i) => c.tone(f, 0.5 + i * 0.18, 0.5, 'triangle', 0.16));
      [700, 1300, 1900].forEach(a => c.later(() => { c.quake(); c.tone(90, 0, 0.3, 'sine', 0.35, 40); }, a));
      await c.wait(3300);
      ov.remove(); card.style.cssText = ''; 
      await c.wait(200);
    } },

    // 13. draw it a heart
    { id:'loveyou', hint:'draw it a heart', async run(c){
      const W = c.W, H = c.H, { card } = c.card('Love you Bestie', { top:'17%' });
      card.style.textAlign = 'center';
      await c.wait(600);
      const cv = document.createElement('canvas'); cv.className = 'rr-heartcv'; cv.width = W; cv.height = H; c.add(cv);
      const g = cv.getContext('2d'); g.strokeStyle = 'rgba(232,120,110,.95)'; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = 'rgba(232,120,110,.9)'; g.shadowBlur = 14;
      const hcx = W / 2, hcy = H * 0.56, S = Math.min(W * 0.8, H * 0.46) / 32;
      const pt = tt => [hcx + 16 * Math.pow(Math.sin(tt), 3) * S, hcy - (13 * Math.cos(tt) - 5 * Math.cos(2 * tt) - 2 * Math.cos(3 * tt) - Math.cos(4 * tt)) * S];
      let prev = pt(Math.PI); const t = c.touch(prev[0], prev[1]); c.press(t, true);
      await c.tween(2400, p => { const q = pt(Math.PI + p * Math.PI * 2); g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(q[0], q[1]); g.stroke(); prev = q; c.moveTouch(t, q[0], q[1]); });
      c.press(t, false); t.remove(); cv.remove();
      const hp = c.el('rr-heartpop', '❤️'); hp.style.left = hcx + 'px'; hp.style.top = hcy + 'px'; hp.style.fontSize = Math.max(70, Math.min(W * 0.8, H * 0.46) * 1.05) + 'px';
      const tx = c.big('love you too, bestie ♡', '#ffd9d0', '0 0 20px rgba(232,120,110,.9)', '78%'); tx.style.fontSize = 'clamp(1.6rem,7vw,3rem)';
      c.rain(['❤️', '🩷', '♡', '💕'], 30);
      [523, 659, 784].forEach((f, i) => c.tone(f, i * 0.1, 1.2, 'sine', 0.14));
      await c.wait(3200);
    } },

    // 14. knock three times, then hunt the thing that answers
    { id:'phas', hint:'knock three times... and see what answers', async run(c){
      const W = c.W, H = c.H, { card } = c.card('You make phas Monday evenings feel like something to look forward to.');
      await c.wait(600);
      const r = c.rel(card), t = c.touch(r.cx, r.cy);
      for(let k = 0; k < 3; k++){
        c.press(t, true); c.tone(130, 0, 0.14, 'sine', 0.5, 60); c.noise(0.09, 0.35, 500, 200); c.bump(card, 'shake', 500);
        await c.wait(140); c.press(t, false); await c.wait(380);
      }
      t.remove(); await c.wait(800);
      const dark = c.el('rr-dark'); mk('msg', 'something answered... find it', dark);
      const ghost = c.el('rr-ghost', '👻'), gx = W * (r.cx > W / 2 ? 0.2 : 0.78), gy = H * 0.62;
      ghost.style.transform = 'translate(' + (gx - 20) + 'px,' + (gy - 20) + 'px)';
      let px = r.cx, py = r.cy, over = false;
      const setLight = () => { dark.style.setProperty('--x', px + 'px'); dark.style.setProperty('--y', py + 'px'); }; setLight();
      const dist = () => Math.hypot(px - gx, py - gy);
      c.bg(async () => { await c.wait(1000); while(!over){ const d = dist(); c.tone(500 + Math.max(0, 500 - d) * 1.4, 0, 0.07, 'square', 0.05); await c.wait(Math.max(100, Math.min(1300, 110 + d * 1.6))); } });
      const way = [[r.cx, r.cy], [W * 0.5, H * 0.25], [W * (gx < W / 2 ? 0.85 : 0.15), H * 0.5], [W * 0.5, H * 0.8], [gx, gy]];
      for(let i = 1; i < way.length; i++){
        const a = way[i - 1], b = way[i];
        await c.tween(i === way.length - 1 ? 1500 : 1100, p => { const e = easeIO(p); px = a[0] + (b[0] - a[0]) * e; py = a[1] + (b[1] - a[1]) * e; setLight(); });
      }
      await c.wait(700); over = true;
      dark.remove(); ghost.remove();
      const ov = c.el('rr-scare');
      ov.innerHTML = '<svg viewBox="0 0 200 240"><defs><radialGradient id="rrgh" cx="50%" cy="35%"><stop offset="0" stop-color="#f4fbff"/><stop offset="1" stop-color="#9fb4c2"/></radialGradient></defs><path d="M18 232 V92 C18 38 58 8 100 8 C142 8 182 38 182 92 V232 L156 206 L128 232 L100 206 L72 232 L44 206 Z" fill="url(#rrgh)"/><ellipse cx="68" cy="92" rx="17" ry="30" fill="#000"/><ellipse cx="132" cy="92" rx="17" ry="30" fill="#000"/><ellipse cx="100" cy="164" rx="24" ry="44" fill="#000"/></svg>';
      c.noise(1.1, 0.5, 1800, 3200); c.tone(1200, 0, 0.9, 'sawtooth', 0.22, 2800); c.tone(95, 0, 1, 'sawtooth', 0.3, 60);
      try{ if(navigator.vibrate) navigator.vibrate([180, 60, 180]); }catch(_){}
      await c.wait(1250); ov.remove();
      c.say('sorry ♡ see you on Monday', 2600);
      await c.wait(2200);
    } },

    // 15. squish it flat, Squaishey delivers
    { id:'thanks', hint:'squish it flat and let go', async run(c){
      const { card } = c.card('I want to say, Thank You', { top:'58%' });
      await c.wait(600);
      const r = c.rel(card), t = c.touch(r.cx, r.cy); c.press(t, true);
      let lastSq = 0;
      await c.tween(1000, p => {
        card.style.transition = 'none'; card.style.transform = 'scale(' + (1 + p * 0.1) + ',' + (1 - p * 0.45) + ')';
        const now = performance.now(); if(now - lastSq > 160){ lastSq = now; c.tone(300 + p * 500, 0, 0.1, 'sine', 0.07); }
      });
      c.press(t, false); t.remove(); c.spring(card, 700); c.tone(200, 0, 0.3, 'sine', 0.2, 900);
      await c.wait(120);
      const wrap = c.el('rr-sq'), sign = mk('rr-sq-sign'); sign.innerHTML = 'Thank you!<small>- delivered by Squaishey</small>';
      wrap.style.left = r.cx + 'px'; wrap.style.top = Math.max(8, r.t - 190) + 'px';
      wrap.append(sign, squaishey());
      c.later(() => c.tone(500, 0, 0.12, 'triangle', 0.12, 900), 80);
      c.later(() => { c.tone(784, 0, 0.3, 'triangle', 0.14); c.tone(988, 0.12, 0.5, 'triangle', 0.14); c.rain(['♡', '💌', '✨'], 18); }, 900);
      await c.wait(4600);
    } },

    // 16. swipe left
    { id:'wellmen', hint:'swipe left', async run(c){
      const { card } = c.card('You have good taste in everything! Well, men exist...');
      await c.wait(600);
      const r = c.rel(card), st = mk('rr-swipe nope', 'NOPE', card), t = c.touch(r.cx, r.cy); c.press(t, true);
      await c.tween(900, p => { const dx = -150 * easeIO(p); card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx * 0.04) + 'deg)'; st.style.opacity = Math.min(1, Math.max(0, (-dx - 30) / 80)); c.moveTouch(t, r.cx + dx, r.cy); });
      c.press(t, false); t.remove();
      card.style.transition = 'transform .45s ease-in, opacity .45s'; card.style.transform = 'translateX(-120vw) rotate(-30deg)'; card.style.opacity = 0;
      // the cascade of error boxes
      const mkDlg = (title, icon, msg, btn, x, y) => {
        const d = mk('rr-dlg'); d.style.left = x + 'px'; d.style.top = y + 'px';
        d.innerHTML = '<div class="rr-dlg-t"><span>' + title + '</span><span>✕</span></div><div class="rr-dlg-b"><span class="rr-dlg-i">' + icon + '</span><span>' + msg + '</span></div><div class="rr-dlg-btn">' + btn + '</div>';
        return c.add(d);
      };
      const w = c.W, h = c.H, bw = Math.min(w * 0.78, 300), x0 = Math.max(8, w / 2 - bw / 2 - 50), y0 = Math.max(60, h * 0.2);
      c.noise(0.35, 0.3, 4000, 300); c.tone(900, 0, 0.35, 'sawtooth', 0.14, 110);
      c.later(() => { mkDlg('taste.exe', 'ℹ️', 'Good taste detected in: food, music, shows, friends, everything.', 'OK', x0, y0); c.tone(880, 0, 0.2, 'sine', 0.12); }, 500);
      c.later(() => { mkDlg('men_exist.dll', '⚠️', 'Warning: men exist. This cannot be undone.', 'Ignore', x0 + 24, y0 + 40); c.tone(660, 0, 0.2, 'sine', 0.12); }, 1500);
      c.later(() => { c.tone(200, 0, 0.6, 'square', 0.12, 120); for(let i = 0; i < 14; i++) c.later(() => mkDlg('Fatal Error', '❌', 'taste_in_men not found. Please contact Bestie Tristan.', 'Retry', x0 + 48 + i * 14, y0 + 80 + i * 18), i * 70); }, 2600);
      await c.wait(5600);
      card.style.transition = 'transform .7s cubic-bezier(.34,1.5,.5,1), opacity .5s'; card.style.transform = ''; card.style.opacity = '';
      await c.wait(900);
    } },

    // 17. wave the foam finger
    { id:'fan', hint:'wave the foam finger in circles', async run(c){
      const { card } = c.card('I am your number one biggest Ann Fan...');
      await c.wait(600);
      const r = c.rel(card), hand = c.el('rr-hand', '☝️'), rad = Math.min(r.w * 0.4, 120);
      let rots = 0;
      await c.tween(3800, p => {
        const a = p * Math.PI * 6, x = r.cx + Math.cos(a) * rad, y = r.cy + Math.sin(a) * rad * 0.7;
        hand.style.transform = 'translate(' + (x - 24) + 'px,' + (y - 30) + 'px) rotate(' + Math.max(-40, Math.min(40, (x - r.cx) * 0.2)) + 'deg)';
        const k = Math.floor(a / (2 * Math.PI)); if(k > rots){ rots = k; c.noise(0.7, 0.1 + 0.07 * k, 1200, 2200); c.tone(440 + k * 110, 0, 0.25, 'triangle', 0.12); }
      });
      hand.remove();
      const ov = c.el('rr-fan'); mk('f', '☝️', ov); mk('t', '#1 ANN FAN', ov);
      c.noise(1.8, 0.28, 1400, 2400); c.later(() => c.noise(1.6, 0.22, 1000, 2000), 500);
      [523, 659, 784, 1046].forEach((f, i) => c.tone(f, i * 0.12, 0.35, 'triangle', 0.14));
      c.rain(['🎉', '📣', '✨', '🎊'], 32);
      await c.wait(3600);
    } },

    // 18. fly across the sea
    { id:'sea', hint:'fly the plane across the sea', async run(c){
      const W = c.W, H = c.H, { card } = c.card("You've crossed the sea with me in spirit more times than I can count.", { top:'22%' });
      await c.wait(600);
      const band = c.el('rr-sea'); band.textContent = '🌊'.repeat(14);
      const sx = 46, dx = W - 46, ly = H * 0.86;
      const lab = (x, txt) => { const l = c.el('rr-lab', txt); l.style.left = x + 'px'; l.style.bottom = (H * 0.14) + 'px'; return l; };
      lab(sx, '🇬🇧 UK'); lab(dx, '♡ you');
      const hint = c.el('rr-hint', 'drag the plane across the sea to the other side ♡'); hint.style.bottom = (H * 0.04) + 'px';
      const pl = c.el('rr-plane', '✈️'), t = c.touch(sx, H * 0.6); c.press(t, true);
      const put = (x, y) => { pl.style.transform = 'translate(' + (x - 20) + 'px,' + (y - 20) + 'px)'; c.moveTouch(t, x, y); };
      put(sx, H * 0.6);
      let lastH = 0;
      await c.tween(3200, p => {
        const x = sx + (dx - sx - 40) * p, y = H * 0.6 + Math.sin(p * Math.PI * 3) * 24 - p * 30; put(x, y);
        const now = performance.now(); if(now - lastH > 70){ lastH = now; const h = mk('rr-trail', '♡'); h.style.left = x + 'px'; h.style.top = (y + 10) + 'px'; c.fx(h, 1700); }
      });
      c.press(t, false); t.remove(); hint.style.opacity = 0;
      pl.style.transition = 'transform 1.2s ease-in'; pl.style.transform = 'translate(' + (W + 60) + 'px,' + (H * 0.6 - 150) + 'px)';
      const big = c.big('UK ✈ you ♡', '#fff3c4');
      [523, 659, 784, 1046].forEach((f, i) => c.tone(f, i * 0.1, 0.4, 'triangle', 0.13));
      await c.wait(4000);
    } },

    // 19. copy the gbing gbong rhythm
    { id:'energy', hint:'copy the gbing gbong rhythm', async run(c){
      const { card } = c.card('gbing gbong. this is your energy');
      const l = mk('rr-half l', null, card), rr = mk('rr-half r', null, card); l.dataset.w = 'gbing'; rr.dataset.w = 'gbong';
      const note = s => { const h = s ? rr : l; h.classList.add('on'); if(s) c.tone(196, 0, 0.45, 'sine', 0.3, 150); else { c.tone(880, 0, 0.35, 'triangle', 0.2); c.tone(1760, 0, 0.2, 'sine', 0.05); } c.later(() => h.classList.remove('on'), 280); };
      const seq = [0, 1, 1, 0, 1];
      await c.wait(700);
      const r = c.rel(card), hint = c.el('rr-hint', 'listen...'); hint.style.bottom = (c.H * 0.14) + 'px';
      for(const s of seq){ note(s); await c.wait(650); }
      hint.textContent = 'now you!'; await c.wait(500);
      const t = c.touch(r.cx, r.cy);
      for(const s of seq){ c.moveTouch(t, s ? r.l + r.w * 0.75 : r.l + r.w * 0.25, r.cy); await c.wait(200); c.press(t, true); note(s); await c.wait(120); c.press(t, false); await c.wait(380); }
      t.remove(); hint.remove(); await c.wait(500);
      const wrap = c.el('rr-en'), lb = mk('', 'ENERGY: 0%', wrap), bar = mk('bar', null, wrap), fill = mk('fill', null, bar);
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = '100%'; }));
      let pc = 0; const iv = c.every(() => { pc = Math.min(100, pc + 5); lb.textContent = 'ENERGY: ' + pc + '%'; c.tone(300 + pc * 6, 0, 0.06, 'square', 0.05); if(pc >= 100) c.stopEvery(iv); }, 80);
      await c.wait(1800); lb.textContent = 'ENERGY: 9001%'; wrap.classList.add('shake'); c.tone(110, 0, 0.9, 'sawtooth', 0.25, 40); c.rain(['⚡', '✨', '💥'], 30);
      await c.wait(1500); lb.textContent = 'meter broke ⚡'; wrap.classList.add('boom');
      await c.wait(900);
    } },

    // 20. do nothing for a while and the stars join up
    { id:'stay', hint:'do nothing for a while', async run(c){
      const w = c.W, h = c.H, cx = w / 2, cy = h / 2 - 10, sc = Math.min(w, h) / 38, N = 16, pts = [];
      for(let i = 0; i <= N; i++){ const t = (i / N) * Math.PI * 2; pts.push([cx + 16 * Math.pow(Math.sin(t), 3) * sc, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * sc]); }
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'rr-const'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      const line = document.createElementNS(NS, 'polyline'); line.setAttribute('class', 'rr-const-line'); line.setAttribute('points', pts.map(p => p.join(',')).join(' ')); svg.appendChild(line);
      pts.forEach((p, i) => { const k = document.createElementNS(NS, 'circle'); k.setAttribute('cx', p[0]); k.setAttribute('cy', p[1]); k.setAttribute('r', 3.4); k.setAttribute('class', 'rr-const-dot'); k.style.animationDelay = (i * 0.28) + 's'; svg.appendChild(k); });
      c.add(svg);
      const len = line.getTotalLength(); line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
      requestAnimationFrame(() => requestAnimationFrame(() => { line.style.strokeDashoffset = 0; }));
      const lab = c.el('rr-const-label', 'you stayed a while ♡');
      await c.wait(5200); lab.classList.add('in');
      await c.wait(2600); svg.classList.add('out'); lab.classList.remove('in');
      await c.wait(1200);
    } },

    // 21. the hidden song: five taps on the title, and the thank-you song starts (it keeps playing under the finale)
    { id:'song', hint:'tap the page title five times', async run(c){
      const W = c.W, H = c.H, title = c.el('rr-lyric', 'For when you\'re feeling down'); title.style.top = '30%';
      await c.wait(500); title.classList.add('in');
      const t = c.touch(W / 2, H * 0.3);
      for(let k = 0; k < 5; k++){ c.press(t, true); c.tone(660 + k * 60, 0, 0.12, 'triangle', 0.1); await c.wait(110); c.press(t, false); await c.wait(300); }
      t.remove(); title.classList.remove('in');
      startSong();
      c.notes({ getBoundingClientRect: () => ({ left:W / 2 - 80, top:H * 0.5, width:160, height:10, right:W / 2 + 80, bottom:H * 0.5 + 10 }) }, 6);
      const LY = ['These adventures have been so much fun', 'Keep moving forward, I feel so proud today', 'I want to say, Thank You', 'Together we will stand'];
      for(let i = 0; i < LY.length; i++){
        const ly = c.el('rr-lyric', LY[i]); await c.wait(60); ly.classList.add('in');
        c.notes({ getBoundingClientRect: () => ({ left:W * 0.3, top:H * 0.5, width:W * 0.4, height:10 }) }, 3);
        await c.wait(3000); ly.classList.remove('in'); await c.wait(800);
      }
    } },
  ];

  /* ------------------------------------------------------------------ the song + player pill (lives on past the scenes) */
  function startSong(){
    if(R.song) return;
    const a = document.createElement('audio'); a.preload = 'auto';
    [['thank-you-song.mp3', 'audio/mpeg'], ['thank-you-song.m4a', 'audio/mp4'], ['thank-you-song.ogg', 'audio/ogg'], ['thank-you-song.wav', 'audio/wav']].forEach(([s, ty]) => { const so = document.createElement('source'); so.src = s; so.type = ty; a.appendChild(so); });
    a.volume = 0.7; a.muted = muted; R.song = a;
    const pill = mk('rr-pill'); pill.innerHTML = '<span class="n">♪</span><button aria-label="Pause or play">❚❚</button><input type="range" min="0" max="1" step="0.01" value="0.7" aria-label="Volume">';
    R.root.appendChild(pill); R.pill = pill;
    const btn = pill.querySelector('button'), vol = pill.querySelector('input');
    vol.addEventListener('input', () => { a.volume = parseFloat(vol.value); });
    btn.addEventListener('click', () => { if(a.paused) a.play().catch(() => {}); else a.pause(); });
    a.addEventListener('play', () => { pill.classList.remove('paused'); btn.textContent = '❚❚'; });
    a.addEventListener('pause', () => { pill.classList.add('paused'); btn.textContent = '▶'; });
    a.play().then(() => pill.classList.add('show')).catch(() => {});   // file missing or blocked: the show just carries on without it
  }
  function fadeSong(){
    const a = R && R.song; if(!a) return;
    if(R.pill) R.pill.classList.remove('show');
    const v0 = a.volume; let k = 0;
    const iv = setInterval(() => { k++; try{ a.volume = Math.max(0, v0 * (1 - k / 20)); }catch(e){} if(k >= 20){ clearInterval(iv); try{ a.pause(); }catch(e){} } }, 100);
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

  /* ------------------------------------------------------------------ entry point */
  function buildRoot(o){
    const root = mk('rr-root'); o.appendChild(root);
    const stage = mk('rr-stage', null, root), chip = mk('rr-chip', null, root);
    const ctl = mk('rr-ctl', null, root), progEl = mk('rr-prog', null, root), pbar = document.createElement('i'); progEl.appendChild(pbar);
    let chipT = null;
    R = {
      root, stage, ctl, progEl, cur:null, stopAll:false, jump:false, song:null, pill:null,
      chip(text, ms, found){
        clearTimeout(chipT); chip.textContent = text; chip.classList.toggle('found', !!found); chip.classList.add('show');
        if(ms) chipT = setTimeout(() => chip.classList.remove('show'), ms);
      },
      say(text, ms){ R.chip(text, ms || 2400); },
      prog(f){ pbar.style.width = Math.round(f * 100) + '%'; }
    };
    const btn = (label, fn) => { const b = mk('rr-btn', label, ctl); b.addEventListener('click', fn); return b; };
    btn('next secret ▸', () => { if(R.cur){ R.cur.skipped = true; cancelScene(R.cur); } });
    btn('skip to the finale ⏭', () => { R.jump = true; R.stopAll = true; if(R.cur){ R.cur.skipped = true; cancelScene(R.cur); } });
    const mute = btn('sound on 🔊', () => { setMuted(!muted); mute.textContent = muted ? 'sound off 🔇' : 'sound on 🔊'; });
    return R;
  }

  function gate(){
    return new Promise(res => {
      const g = mk('rr-gate', null, R.stage);
      mk('', null, g);
      const h = document.createElement('h2'); h.textContent = 'All 21 secrets on the reasons page'; g.appendChild(h);
      const p = document.createElement('p'); p.textContent = 'every one you found, one more time, with sound. It is a few minutes long ♡'; g.appendChild(p);
      const go = document.createElement('button'); go.className = 'rr-go'; go.textContent = '▶ play the full reel'; g.appendChild(go);
      const no = document.createElement('button'); no.className = 'rr-no'; no.textContent = 'skip to the finale'; g.appendChild(no);
      R.ctl.style.display = 'none';
      go.onclick = () => { ac(); g.remove(); R.ctl.style.display = ''; res('full'); };
      no.onclick = () => { g.remove(); res('quick'); };
    });
  }

  async function play(o, finale, next, opts){
    opts = opts || {};
    injectCSS();
    if(reduced() && !opts.force){ finale(next); return; }
    buildRoot(o);
    const choice = opts.skipGate ? 'full' : await gate();
    if(opts.skipGate) ac();
    if(choice === 'full'){
      const list = opts.only ? SCENES.filter(s => opts.only.includes(s.id)) : SCENES;
      for(let i = 0; i < list.length && !R.stopAll; i++){
        await runScene(list[i], SCENES.indexOf(list[i]));
      }
      if(!R.jump && !opts.only){
        R.chip('every secret found ♡  21 / 21', 2400, true); R.prog(1); await sleep(1800);
      }
    }
    // the finale: the old wall of cards -> heart -> burst, with the song (if it started) still playing underneath
    R.stage.remove(); R.ctl.remove(); R.progEl.remove();
    const root = R.root;
    finale(() => { fadeSong(); setTimeout(() => { root.remove(); R = null; next(); }, 600); });
  }

  window.ReasonsReel = { play, SCENES, _tone: tone };
})();
