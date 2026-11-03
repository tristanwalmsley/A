/* ==========================================================================
   ambient.js - the time-of-day background, shared by every page.
   Usage: include this file, then call initAmbientWash() once the DOM is ready.
   It injects its own CSS and its own #ambient-wash markup, so pages need
   nothing else. Preview from the console: previewScene(14), cycleScenes(3),
   unlockAmbient(); or add ?scene=14 to any page URL.
   ========================================================================== */

function injectAmbientStyles(){
  if(document.getElementById('ambient-styles')) return;
  const st = document.createElement('style');
  st.id = 'ambient-styles';
  st.textContent = `
#ambient-wash{position:fixed;inset:0;z-index:-1;pointer-events:none;transition:background 60s linear,opacity 60s linear;overflow:hidden}
.ambient-blob{position:absolute;border-radius:50%;filter:blur(65px);opacity:0.45;animation:ambientDrift ease-in-out infinite alternate;transition:background 30s linear}
@keyframes ambientDrift{from{transform:translate(0,0) scale(1)}to{transform:translate(var(--abx),var(--aby)) scale(1.15)}}
/* accent blobs - position, size AND colour are all set per-scene by JS, so
   each of the 12 scenes is a genuinely distinct composition rather than the
   same four circles being recoloured */
.accent-blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:0.55;top:10%;left:10%;width:400px;height:400px;transition:background 60s linear,top 60s linear,left 60s linear,width 60s linear,height 60s linear;animation:ambientDrift ease-in-out infinite alternate}
.accent-blob-1{--abx:70px;--aby:50px;animation-duration:34s}
.accent-blob-2{--abx:-90px;--aby:-40px;animation-duration:29s}
.accent-blob-3{--abx:60px;--aby:-70px;animation-duration:25s}
.accent-blob-4{--abx:-50px;--aby:65px;animation-duration:31s}
/* star field - built once, reused by every night-leaning scene; each
   scene just dials the container's opacity up or down (0 by day) */
#ambient-stars{position:absolute;inset:0;opacity:0;transition:opacity 60s linear}
.amb-star{position:absolute;border-radius:50%;background:#fff;animation:ambStarTwinkle ease-in-out infinite}
@keyframes ambStarTwinkle{0%,100%{opacity:var(--s-min,0.15)}50%{opacity:var(--s-max,0.85)}}
`;
  document.head.appendChild(st);
}
function ensureAmbientDOM(){
  if(document.getElementById('ambient-wash')) return;
  const wash = document.createElement('div');
  wash.id = 'ambient-wash';
  wash.innerHTML = '<div id="ambient-stars"></div>' +
    '<div class="accent-blob accent-blob-1"></div><div class="accent-blob accent-blob-2"></div>' +
    '<div class="accent-blob accent-blob-3"></div><div class="accent-blob accent-blob-4"></div>';
  document.body.prepend(wash);
}

// ---------- AMBIENT WASH: 12 hand-crafted scenes, one per 2-hour block ----------
// Each scene is a small composition, not a colour swatch: a multi-layer
// "wash" (several stacked gradients - a light source, a horizon/sky band,
// a base tone - the same technique the countdown page uses for its
// power-hour galaxy) plus four glow blobs that each scene places and sizes
// individually, plus (for the night-leaning scenes) a twinkling star field.
// Held for its full 2-hour window, then crossfades (60s, see CSS) into the
// next scene rather than interpolating through an undesigned midpoint.
function blobE(top,left,w,h,c1,c2){
  // c1 = bright core colour, c2 = outer colour it fades through before
  // transparency - a 3-stop radial reads as a glow, not a flat disc.
  // w/h independent lets a blob read as a stretched ribbon (aurora, a
  // horizon band) rather than always being a plain circle.
  return { top, left, width:w, height:h, fill: `radial-gradient(ellipse, ${c1} 0%, ${c2} 45%, rgba(0,0,0,0) 72%)` };
}
function blob(top,left,size,c1,c2){ return blobE(top,left,size,size,c1,c2); }
// Scenes are written as a loose night -> day -> night story so neighbouring
// scenes share a family of hues (no scene should feel like a hard left turn
// from the one before it) while still each having their own character -
// some quiet and pale, some punchier and more saturated, on purpose.
const SCENES = [
  { // 00:00-02:00 midnight - deep indigo sky, a low violet moonglow, quiet embers
    name: 'midnight',
    wash: `radial-gradient(ellipse 50% 35% at 50% 8%, rgba(190,170,255,0.22) 0%, rgba(190,170,255,0) 60%),
           radial-gradient(ellipse 90% 60% at 50% 100%, rgba(40,20,60,0.5) 0%, rgba(40,20,60,0) 70%),
           radial-gradient(ellipse 120% 90% at 50% 50%, hsl(238,48%,15%) 0%, hsl(242,58%,7%) 100%)`,
    opacity: 0.74, stars: 0.9,
    blobs: [
      blob('4%','20%',420,'rgba(170,150,255,0.5)','rgba(120,90,210,0.3)'),
      blob('58%','72%',520,'rgba(150,70,170,0.4)','rgba(90,50,130,0.22)'),
      blob('78%','10%',380,'rgba(90,110,220,0.34)','rgba(60,70,160,0.18)'),
      blob('18%','82%',300,'rgba(255,214,170,0.16)','rgba(200,148,58,0.08)')
    ]
  },
  { // 02:00-04:00 deep night - the witching hour. Same indigo-violet family
    // as midnight (so the handoff is gentle) but darker and quieter, with
    // one playful surprise: a faint ribbon of aurora-teal drifting through
    name: 'witching-hour',
    wash: `radial-gradient(ellipse 45% 30% at 50% 4%, rgba(170,150,255,0.14) 0%, rgba(170,150,255,0) 58%),
           radial-gradient(ellipse 90% 55% at 50% 100%, rgba(30,16,50,0.5) 0%, rgba(30,16,50,0) 68%),
           radial-gradient(ellipse 120% 90% at 50% 50%, hsl(240,46%,12%) 0%, hsl(244,56%,6%) 100%)`,
    opacity: 0.78, stars: 1,
    blobs: [
      blobE('14%','8%',640,220,'rgba(110,220,190,0.26)','rgba(70,160,180,0.14)'), // aurora ribbon
      blob('62%','70%',480,'rgba(130,90,200,0.4)','rgba(80,55,150,0.2)'),
      blob('80%','14%',360,'rgba(80,70,170,0.32)','rgba(50,45,120,0.16)'),
      blob('26%','86%',260,'rgba(200,180,255,0.14)','rgba(140,120,210,0.07)')
    ]
  },
  { // 04:00-06:00 pre-dawn - still in the same indigo family as the witching
    // hour (the jump out of deep night used to be jarring; this keeps the
    // base tone continuous) while a warm seam slowly grows along the horizon
    name: 'pre-dawn',
    wash: `radial-gradient(ellipse 75% 22% at 50% 96%, rgba(255,190,150,0.32) 0%, rgba(255,190,150,0) 65%),
           radial-gradient(ellipse 50% 32% at 50% 8%, rgba(190,170,245,0.16) 0%, rgba(190,170,245,0) 58%),
           radial-gradient(ellipse 120% 90% at 50% 48%, hsl(243,40%,20%) 0%, hsl(240,44%,10%) 100%)`,
    opacity: 0.68, stars: 0.3,
    blobs: [
      blob('6%','16%',380,'rgba(170,150,230,0.36)','rgba(110,95,180,0.18)'),
      blob('82%','58%',460,'rgba(255,180,150,0.42)','rgba(225,130,120,0.2)'),
      blobE('48%','78%',420,200,'rgba(255,205,180,0.24)','rgba(220,150,140,0.12)'), // horizon band
      blob('66%','4%',260,'rgba(130,110,200,0.26)','rgba(90,75,160,0.12)')
    ]
  },
  { // 06:00-08:00 dawn - full painterly sunrise, lavender easing into pink,
    // peach and gold - more banded and alive than a plain two-tone blend
    name: 'dawn',
    wash: `radial-gradient(ellipse 70% 30% at 50% 100%, rgba(255,214,150,0.6) 0%, rgba(255,214,150,0) 62%),
           radial-gradient(ellipse 60% 35% at 15% 15%, rgba(220,195,235,0.3) 0%, rgba(220,195,235,0) 58%),
           radial-gradient(ellipse 75% 50% at 50% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%),
           linear-gradient(185deg, #fdeef0 0%, #ffe1d6 40%, #ffd3b8 72%, #f9c9a0 100%)`,
    opacity: 0.6, stars: 0,
    blobs: [
      blob('68%','50%',500,'rgba(255,210,160,0.6)','rgba(255,170,110,0.3)'),
      blob('8%','12%',360,'rgba(230,205,245,0.44)','rgba(200,170,225,0.2)'),
      blob('30%','82%',320,'rgba(255,170,170,0.36)','rgba(220,130,140,0.18)'),
      blob('88%','86%',280,'rgba(200,148,58,0.26)','rgba(184,104,88,0.14)')
    ]
  },
  { // 08:00-10:00 morning - dewy, green-gold, fresh. a tiny pastel glint
    // (like dew catching light) gives it its own playful signature
    name: 'morning',
    wash: `radial-gradient(ellipse 60% 42% at 25% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 55%),
           radial-gradient(ellipse 45% 30% at 88% 78%, rgba(255,200,220,0.16) 0%, rgba(255,200,220,0) 55%),
           radial-gradient(ellipse 55% 38% at 82% 18%, rgba(200,148,58,0.16) 0%, rgba(200,148,58,0) 58%),
           linear-gradient(160deg, #fbfbe8 0%, #eef6de 45%, #dff0d2 100%)`,
    opacity: 0.56, stars: 0,
    blobs: [
      blob('-2%','14%',440,'rgba(255,255,255,0.56)','rgba(235,240,205,0.22)'),
      blob('64%','76%',520,'rgba(122,165,110,0.34)','rgba(85,125,80,0.16)'),
      blob('80%','10%',340,'rgba(200,148,58,0.26)','rgba(184,104,88,0.12)'),
      blob('22%','90%',240,'rgba(255,205,225,0.3)','rgba(220,170,195,0.14)') // dew glint
    ]
  },
  { // 10:00-12:00 late morning - brighter, livelier, a warm citrus lift that
    // distinguishes it from both morning's green and midday's blue
    name: 'late-morning',
    wash: `radial-gradient(ellipse 58% 40% at 50% 0%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 56%),
           radial-gradient(ellipse 50% 34% at 85% 75%, rgba(122,152,112,0.14) 0%, rgba(122,152,112,0) 58%),
           radial-gradient(ellipse 45% 30% at 10% 70%, rgba(255,200,90,0.16) 0%, rgba(255,200,90,0) 58%),
           linear-gradient(155deg, #fffbea 0%, #fdefc2 50%, #f8dd96 100%)`,
    opacity: 0.56, stars: 0,
    blobs: [
      blob('0%','55%',460,'rgba(255,255,255,0.52)','rgba(250,224,150,0.22)'),
      blob('58%','6%',440,'rgba(255,196,64,0.4)','rgba(220,150,40,0.2)'), // citrus
      blob('78%','74%',380,'rgba(122,152,112,0.26)','rgba(90,120,85,0.12)'),
      blob('26%','90%',260,'rgba(255,255,255,0.4)','rgba(246,222,160,0.16)')
    ]
  },
  { // 12:00-14:00 midday - proper cheerful blue sky, sun straight overhead,
    // the most saturated and airy scene of the set
    name: 'midday',
    wash: `radial-gradient(ellipse 65% 45% at 50% -8%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%),
           radial-gradient(ellipse 80% 55% at 50% 30%, rgba(120,180,225,0.3) 0%, rgba(120,180,225,0) 62%),
           radial-gradient(ellipse 120% 90% at 50% 70%, #fdfdfb 0%, #d9ecf4 100%)`,
    opacity: 0.56, stars: 0,
    blobs: [
      blob('-4%','32%',500,'rgba(255,255,255,0.65)','rgba(190,225,245,0.26)'),
      blob('52%','78%',460,'rgba(100,175,220,0.4)','rgba(70,140,190,0.18)'),
      blob('74%','6%',360,'rgba(122,152,112,0.24)','rgba(90,120,85,0.1)'),
      blob('14%','86%',260,'rgba(255,255,255,0.4)','rgba(210,235,245,0.18)')
    ]
  },
  { // 14:00-16:00 afternoon - the brand's resting warm gold, kept close to
    // home but with a honeyed sage accent so it reads distinct either side
    name: 'afternoon',
    wash: `radial-gradient(ellipse 55% 38% at 18% 0%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 55%),
           radial-gradient(ellipse 50% 34% at 85% 85%, rgba(122,152,112,0.16) 0%, rgba(122,152,112,0) 60%),
           radial-gradient(ellipse 45% 30% at 65% 20%, rgba(255,214,150,0.18) 0%, rgba(255,214,150,0) 58%),
           linear-gradient(160deg, #fdf7ea 0%, #faf4e8 45%, #f0ddb8 100%)`,
    opacity: 0.56, stars: 0,
    blobs: [
      blob('6%','8%',440,'rgba(200,148,58,0.34)','rgba(184,104,88,0.16)'),
      blob('58%','75%',480,'rgba(184,104,88,0.26)','rgba(150,80,70,0.12)'),
      blob('78%','14%',360,'rgba(255,255,255,0.3)','rgba(240,220,180,0.14)'),
      blob('22%','85%',280,'rgba(166,186,110,0.26)','rgba(122,152,112,0.12)') // honeyed sage
    ]
  },
  { // 16:00-18:00 late afternoon - golden hour proper: deep honeyed amber,
    // long dramatic light, a first blush of pink starting to creep in
    name: 'golden-hour',
    wash: `radial-gradient(ellipse 65% 32% at 50% 98%, rgba(255,190,140,0.4) 0%, rgba(255,190,140,0) 62%),
           radial-gradient(ellipse 50% 34% at 12% 8%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 55%),
           radial-gradient(ellipse 45% 28% at 85% 90%, rgba(230,120,130,0.2) 0%, rgba(230,120,130,0) 58%),
           linear-gradient(160deg, #fcefd6 0%, #f3d5a0 48%, #e0ab6c 100%)`,
    opacity: 0.62, stars: 0,
    blobs: [
      blob('66%','58%',560,'rgba(210,150,58,0.5)','rgba(184,104,88,0.24)'),
      blob('4%','14%',380,'rgba(255,255,255,0.3)','rgba(250,222,180,0.14)'),
      blob('44%','88%',340,'rgba(220,110,110,0.3)','rgba(170,70,75,0.14)'),
      blob('86%','8%',280,'rgba(122,152,112,0.18)','rgba(90,120,85,0.08)')
    ]
  },
  { // 18:00-20:00 sunset - the big, vivid, painterly one: gold low through
    // orange, rose and a hint of plum climbing into the upper sky
    name: 'sunset',
    wash: `radial-gradient(ellipse 60% 28% at 50% 102%, rgba(255,232,170,0.75) 0%, rgba(255,232,170,0) 55%),
           radial-gradient(ellipse 85% 48% at 50% 92%, rgba(244,150,90,0.55) 0%, rgba(244,150,90,0) 62%),
           radial-gradient(ellipse 60% 35% at 50% 8%, rgba(120,70,110,0.22) 0%, rgba(120,70,110,0) 60%),
           linear-gradient(180deg, #7a5a86 0%, #d97a7a 32%, #f2a878 62%, #fbd9a8 100%)`,
    opacity: 0.66, stars: 0.1,
    blobs: [
      blob('66%','50%',580,'rgba(255,214,150,0.56)','rgba(242,130,90,0.3)'),
      blob('10%','14%',340,'rgba(150,90,160,0.3)','rgba(100,55,110,0.16)'),
      blob('80%','78%',380,'rgba(210,80,100,0.4)','rgba(150,55,70,0.2)'),
      blob('36%','84%',300,'rgba(200,148,58,0.3)','rgba(184,104,88,0.16)')
    ]
  },
  { // 20:00-22:00 dusk - magical twilight: deep blue-purple with the last
    // warm seam of sunset still glowing low, plus a scatter of firefly-gold
    // glows for a touch of whimsy instead of a plain cool wash
    name: 'dusk',
    wash: `radial-gradient(ellipse 55% 24% at 50% 100%, rgba(240,140,110,0.28) 0%, rgba(240,140,110,0) 60%),
           radial-gradient(ellipse 50% 32% at 50% 6%, rgba(170,150,230,0.16) 0%, rgba(170,150,230,0) 58%),
           radial-gradient(ellipse 120% 90% at 50% 50%, hsl(248,38%,24%) 0%, hsl(244,46%,10%) 100%)`,
    opacity: 0.7, stars: 0.55,
    blobs: [
      blob('10%','68%',420,'rgba(140,110,210,0.34)','rgba(90,70,160,0.16)'),
      blob('56%','10%',400,'rgba(110,90,190,0.3)','rgba(70,60,150,0.14)'),
      blob('78%','56%',320,'rgba(230,140,110,0.3)','rgba(184,104,88,0.14)'),
      blobE('30%','86%',220,120,'rgba(255,210,120,0.3)','rgba(220,170,70,0.12)') // firefly cluster
    ]
  },
  { // 22:00-00:00 evening - settling back into the midnight family (same
    // indigo base as scene 0, for a smooth wrap-around) with a cosy
    // candlelit-window glow low in the frame as its own little signature
    name: 'evening',
    wash: `radial-gradient(ellipse 48% 30% at 50% 6%, rgba(190,170,255,0.2) 0%, rgba(190,170,255,0) 58%),
           radial-gradient(ellipse 85% 52% at 50% 100%, rgba(40,25,65,0.42) 0%, rgba(40,25,65,0) 66%),
           radial-gradient(ellipse 120% 90% at 50% 46%, hsl(240,44%,18%) 0%, hsl(242,54%,8%) 100%)`,
    opacity: 0.72, stars: 0.78,
    blobs: [
      blob('6%','65%',440,'rgba(150,120,230,0.4)','rgba(100,80,180,0.2)'),
      blob('58%','10%',480,'rgba(80,90,200,0.34)','rgba(45,50,140,0.18)'),
      blob('80%','72%',340,'rgba(150,60,140,0.26)','rgba(100,40,100,0.14)'),
      blob('72%','30%',240,'rgba(255,196,120,0.26)','rgba(220,150,70,0.12)') // candlelit window
    ]
  },
];
let currentSceneIdx = null;
let starsBuilt = false;
function buildAmbientStars(){
  if(starsBuilt) return;
  const field = document.getElementById('ambient-stars');
  if(!field) return;
  for(let i=0;i<46;i++){
    const s = document.createElement('div');
    s.className = 'amb-star';
    const sz = 1 + Math.random()*2.2;
    s.style.cssText = `top:${Math.random()*100}%;left:${Math.random()*100}%;width:${sz}px;height:${sz}px;animation-duration:${2+Math.random()*3.5}s;--s-min:${0.1+Math.random()*0.15};--s-max:${0.6+Math.random()*0.4}`;
    field.appendChild(s);
  }
  starsBuilt = true;
}
function applyScene(idx){
  const el = document.getElementById('ambient-wash');
  if(!el) return;
  const scene = SCENES[idx];
  el.style.background = scene.wash;
  el.style.opacity = String(scene.opacity);
  ['1','2','3','4'].forEach((n, i) => {
    const blobEl = el.querySelector('.accent-blob-' + n);
    const b = scene.blobs[i];
    if(!blobEl || !b) return;
    blobEl.style.top = b.top;
    blobEl.style.left = b.left;
    blobEl.style.width = b.width + 'px';
    blobEl.style.height = b.height + 'px';
    blobEl.style.background = b.fill;
  });
  const starField = document.getElementById('ambient-stars');
  if(starField) starField.style.opacity = String(scene.stars);
  currentSceneIdx = idx;
}
function updateAmbientWash(){
  if(window.__ambientLocked) return; // a manual preview is active - leave it alone
  const hour = new Date().getHours();
  const idx = Math.floor(hour / 2) % SCENES.length;
  if(idx !== currentSceneIdx) applyScene(idx); // background/blob/star changes crossfade via the 60s CSS transition
}
function initAmbientWash(){
  injectAmbientStyles();
  ensureAmbientDOM();
  buildAmbientStars();
  // ?scene=14 (or any hour 0-23) in the URL jumps straight to that scene on
  // load, for testing - e.g. index.html?scene=14 for the midday one
  const urlHour = new URLSearchParams(location.search).get('scene');
  if(urlHour !== null && !isNaN(urlHour)){
    applyScene(Math.floor(Number(urlHour) / 2) % SCENES.length);
    window.__ambientLocked = true;
  } else {
    updateAmbientWash();
  }
  setInterval(updateAmbientWash, 60000); // check every minute for the 2-hourly scene change
}
// ---------- console helpers for previewing scenes without waiting ----------
// open devtools console and run e.g. previewScene(6) for the dawn scene, or
// cycleScenes() to step through all 12 one at a time (press again to advance,
// or pass a number of seconds to auto-advance). unlockAmbient() hands control
// back to the real clock.
window.previewScene = function(hour){
  window.__ambientLocked = true;
  applyScene(Math.floor(hour / 2) % SCENES.length);
  console.log(`scene ${Math.floor(hour/2)%SCENES.length}: "${SCENES[Math.floor(hour/2)%SCENES.length].name}" (covers ${Math.floor(hour/2)*2}:00-${Math.floor(hour/2)*2+2}:00)`);
};
window.cycleScenes = function(seconds){
  window.__ambientLocked = true;
  let i = 0;
  applyScene(i);
  console.log(`scene ${i}: "${SCENES[i].name}"`);
  if(seconds){
    clearInterval(window.__cycleTimer);
    window.__cycleTimer = setInterval(() => {
      i = (i + 1) % SCENES.length;
      applyScene(i);
      console.log(`scene ${i}: "${SCENES[i].name}"`);
    }, seconds * 1000);
  } else {
    window.nextScene = function(){
      i = (i + 1) % SCENES.length;
      applyScene(i);
      console.log(`scene ${i}: "${SCENES[i].name}"`);
    };
    console.log('call nextScene() to step forward');
  }
};
window.unlockAmbient = function(){
  clearInterval(window.__cycleTimer);
  window.__ambientLocked = false;
  updateAmbientWash();
  console.log('back to the real clock');
};
