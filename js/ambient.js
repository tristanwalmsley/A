// Full-page background that changes with the real time of day.
// Twelve scenes, one per two-hour block. Each is a layered gradient "wash"
// plus four glow blobs and a star-field opacity. CSS crossfades between them.

function blob(top, left, size, core, edge) {
  // three-stop radial so it reads as a glow rather than a flat disc
  return { top, left, size, fill: `radial-gradient(circle, ${core} 0%, ${edge} 45%, rgba(0,0,0,0) 72%)` };
}

const SCENES = [
  { name: 'midnight',
    wash: `radial-gradient(ellipse 50% 35% at 50% 8%, rgba(190,170,255,0.22) 0%, rgba(190,170,255,0) 60%),
           radial-gradient(ellipse 90% 60% at 50% 100%, rgba(40,20,60,0.5) 0%, rgba(40,20,60,0) 70%),
           radial-gradient(ellipse 120% 90% at 50% 50%, hsl(238,48%,15%) 0%, hsl(242,58%,7%) 100%)`,
    opacity: 0.74, stars: 0.9,
    blobs: [
      blob('4%', '20%', 420, 'rgba(170,150,255,0.5)', 'rgba(120,90,210,0.3)'),
      blob('58%', '72%', 520, 'rgba(150,70,170,0.4)', 'rgba(90,50,130,0.22)'),
      blob('78%', '10%', 380, 'rgba(90,110,220,0.34)', 'rgba(60,70,160,0.18)'),
      blob('18%', '82%', 300, 'rgba(255,214,170,0.16)', 'rgba(200,148,58,0.08)')] },
  { name: 'deep-night',
    wash: `radial-gradient(ellipse 45% 30% at 50% 5%, rgba(150,220,230,0.14) 0%, rgba(150,220,230,0) 60%),
           radial-gradient(ellipse 100% 70% at 50% 100%, rgba(10,30,45,0.55) 0%, rgba(10,30,45,0) 70%),
           radial-gradient(ellipse 120% 90% at 50% 50%, hsl(206,42%,13%) 0%, hsl(226,52%,6%) 100%)`,
    opacity: 0.76, stars: 1,
    blobs: [
      blob('8%', '65%', 460, 'rgba(110,190,210,0.36)', 'rgba(50,120,140,0.2)'),
      blob('62%', '12%', 500, 'rgba(80,90,200,0.34)', 'rgba(40,50,130,0.18)'),
      blob('82%', '68%', 340, 'rgba(30,70,100,0.36)', 'rgba(15,40,60,0.2)'),
      blob('30%', '90%', 260, 'rgba(200,210,255,0.12)', 'rgba(140,150,220,0.06)')] },
  { name: 'pre-dawn',
    wash: `radial-gradient(ellipse 70% 25% at 50% 92%, rgba(255,180,140,0.3) 0%, rgba(255,180,140,0) 65%),
           radial-gradient(ellipse 55% 35% at 50% 10%, rgba(200,170,255,0.18) 0%, rgba(200,170,255,0) 60%),
           radial-gradient(ellipse 120% 90% at 50% 45%, hsl(252,38%,22%) 0%, hsl(224,42%,11%) 100%)`,
    opacity: 0.72, stars: 0.38,
    blobs: [
      blob('6%', '18%', 400, 'rgba(180,140,220,0.4)', 'rgba(120,90,180,0.22)'),
      blob('80%', '60%', 460, 'rgba(255,170,150,0.4)', 'rgba(220,120,120,0.2)'),
      blob('50%', '82%', 340, 'rgba(90,100,190,0.3)', 'rgba(60,70,150,0.16)'),
      blob('68%', '5%', 280, 'rgba(255,210,190,0.26)', 'rgba(230,160,150,0.14)')] },
  { name: 'dawn',
    wash: `radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,225,160,0.55) 0%, rgba(255,225,160,0) 65%),
           radial-gradient(ellipse 75% 50% at 50% 0%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 55%),
           linear-gradient(185deg, #fff3e2 0%, #ffe1d6 48%, #f9c9c9 100%)`,
    opacity: 0.6, stars: 0,
    blobs: [
      blob('70%', '50%', 480, 'rgba(255,214,170,0.6)', 'rgba(255,180,120,0.3)'),
      blob('10%', '14%', 360, 'rgba(255,255,255,0.5)', 'rgba(255,214,190,0.22)'),
      blob('30%', '80%', 340, 'rgba(200,148,58,0.3)', 'rgba(184,104,88,0.16)'),
      blob('85%', '85%', 300, 'rgba(249,201,201,0.4)', 'rgba(220,150,150,0.2)')] },
  { name: 'morning',
    wash: `radial-gradient(ellipse 65% 45% at 30% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 55%),
           radial-gradient(ellipse 50% 35% at 85% 20%, rgba(200,148,58,0.14) 0%, rgba(200,148,58,0) 60%),
           linear-gradient(160deg, #fdfaf0 0%, #f5f7e6 45%, #eef2da 100%)`,
    opacity: 0.55, stars: 0,
    blobs: [
      blob('0%', '10%', 440, 'rgba(255,255,255,0.55)', 'rgba(240,235,210,0.22)'),
      blob('65%', '78%', 500, 'rgba(122,152,112,0.3)', 'rgba(90,120,85,0.14)'),
      blob('80%', '14%', 340, 'rgba(200,148,58,0.26)', 'rgba(184,104,88,0.12)'),
      blob('20%', '85%', 280, 'rgba(255,255,255,0.4)', 'rgba(220,230,200,0.18)')] },
  { name: 'late-morning',
    wash: `radial-gradient(ellipse 60% 42% at 50% 0%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 58%),
           radial-gradient(ellipse 55% 40% at 80% 70%, rgba(122,152,112,0.1) 0%, rgba(122,152,112,0) 60%),
           linear-gradient(155deg, #fffaf0 0%, #fdf2da 50%, #f6e6c0 100%)`,
    opacity: 0.54, stars: 0,
    blobs: [
      blob('2%', '55%', 460, 'rgba(255,255,255,0.5)', 'rgba(246,230,180,0.22)'),
      blob('60%', '8%', 420, 'rgba(200,148,58,0.32)', 'rgba(184,104,88,0.16)'),
      blob('78%', '75%', 380, 'rgba(122,152,112,0.26)', 'rgba(90,120,85,0.12)'),
      blob('25%', '90%', 260, 'rgba(255,255,255,0.4)', 'rgba(240,220,170,0.16)')] },
  { name: 'midday',
    wash: `radial-gradient(ellipse 70% 50% at 50% -5%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 55%),
           radial-gradient(ellipse 60% 40% at 50% 15%, rgba(150,190,210,0.18) 0%, rgba(150,190,210,0) 60%),
           radial-gradient(ellipse 120% 90% at 50% 60%, #fdfdfb 0%, #e8f0e6 100%)`,
    opacity: 0.52, stars: 0,
    blobs: [
      blob('-2%', '35%', 480, 'rgba(255,255,255,0.6)', 'rgba(200,225,235,0.22)'),
      blob('55%', '75%', 420, 'rgba(150,190,210,0.3)', 'rgba(110,150,170,0.14)'),
      blob('70%', '8%', 360, 'rgba(122,152,112,0.26)', 'rgba(90,120,85,0.12)'),
      blob('10%', '88%', 260, 'rgba(200,148,58,0.2)', 'rgba(184,104,88,0.1)')] },
  { name: 'afternoon',
    wash: `radial-gradient(ellipse 55% 40% at 20% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 55%),
           radial-gradient(ellipse 60% 45% at 85% 85%, rgba(122,152,112,0.14) 0%, rgba(122,152,112,0) 62%),
           linear-gradient(160deg, #fdf7ea 0%, #faf4e8 45%, #f0ddb8 100%)`,
    opacity: 0.56, stars: 0,
    blobs: [
      blob('6%', '8%', 440, 'rgba(200,148,58,0.32)', 'rgba(184,104,88,0.16)'),
      blob('58%', '75%', 480, 'rgba(184,104,88,0.26)', 'rgba(150,80,70,0.12)'),
      blob('78%', '12%', 360, 'rgba(255,255,255,0.32)', 'rgba(240,220,180,0.14)'),
      blob('22%', '85%', 280, 'rgba(122,152,112,0.22)', 'rgba(90,120,85,0.1)')] },
  { name: 'late-afternoon',
    wash: `radial-gradient(ellipse 65% 35% at 50% 95%, rgba(255,214,170,0.35) 0%, rgba(255,214,170,0) 60%),
           radial-gradient(ellipse 50% 35% at 15% 10%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 55%),
           linear-gradient(160deg, #fbeed4 0%, #f3dcae 50%, #e8c48a 100%)`,
    opacity: 0.6, stars: 0,
    blobs: [
      blob('70%', '60%', 520, 'rgba(200,148,58,0.44)', 'rgba(184,104,88,0.22)'),
      blob('5%', '15%', 380, 'rgba(255,255,255,0.34)', 'rgba(250,230,190,0.16)'),
      blob('45%', '88%', 340, 'rgba(184,104,88,0.3)', 'rgba(150,70,70,0.14)'),
      blob('85%', '10%', 300, 'rgba(122,152,112,0.2)', 'rgba(90,120,85,0.1)')] },
  { name: 'sunset',
    wash: `radial-gradient(ellipse 65% 45% at 50% 105%, rgba(255,235,190,0.7) 0%, rgba(255,235,190,0) 55%),
           radial-gradient(ellipse 85% 55% at 50% 100%, rgba(242,168,120,0.55) 0%, rgba(242,168,120,0) 65%),
           linear-gradient(180deg, #fbd9b0 0%, #f2a878 45%, #c9636a 100%)`,
    opacity: 0.62, stars: 0.12,
    blobs: [
      blob('65%', '50%', 560, 'rgba(255,214,170,0.55)', 'rgba(242,140,100,0.3)'),
      blob('15%', '10%', 360, 'rgba(255,255,255,0.3)', 'rgba(255,214,190,0.14)'),
      blob('80%', '78%', 380, 'rgba(200,90,90,0.4)', 'rgba(150,55,60,0.2)'),
      blob('40%', '85%', 300, 'rgba(200,148,58,0.3)', 'rgba(184,104,88,0.16)')] },
  { name: 'dusk',
    wash: `radial-gradient(ellipse 60% 30% at 50% 100%, rgba(255,180,140,0.22) 0%, rgba(255,180,140,0) 60%),
           radial-gradient(ellipse 55% 35% at 50% 8%, rgba(150,210,220,0.14) 0%, rgba(150,210,220,0) 58%),
           radial-gradient(ellipse 120% 90% at 50% 55%, hsl(210,36%,26%) 0%, hsl(226,44%,11%) 100%)`,
    opacity: 0.68, stars: 0.5,
    blobs: [
      blob('10%', '70%', 460, 'rgba(110,190,200,0.34)', 'rgba(60,130,140,0.16)'),
      blob('55%', '10%', 420, 'rgba(120,100,190,0.3)', 'rgba(70,60,140,0.16)'),
      blob('80%', '55%', 340, 'rgba(220,140,120,0.26)', 'rgba(184,104,88,0.14)'),
      blob('25%', '90%', 260, 'rgba(150,190,200,0.2)', 'rgba(100,140,150,0.1)')] },
  { name: 'evening',
    wash: `radial-gradient(ellipse 50% 32% at 50% 6%, rgba(190,170,255,0.18) 0%, rgba(190,170,255,0) 58%),
           radial-gradient(ellipse 85% 55% at 50% 100%, rgba(40,25,65,0.45) 0%, rgba(40,25,65,0) 68%),
           radial-gradient(ellipse 120% 90% at 50% 45%, hsl(240,42%,19%) 0%, hsl(242,52%,8%) 100%)`,
    opacity: 0.72, stars: 0.78,
    blobs: [
      blob('6%', '65%', 440, 'rgba(150,120,230,0.4)', 'rgba(100,80,180,0.2)'),
      blob('60%', '10%', 480, 'rgba(80,90,200,0.34)', 'rgba(45,50,140,0.18)'),
      blob('80%', '72%', 340, 'rgba(150,60,140,0.26)', 'rgba(100,40,100,0.14)'),
      blob('28%', '88%', 260, 'rgba(255,214,170,0.14)', 'rgba(200,148,58,0.08)')] },
];

let currentSceneIndex = null;

function buildAmbientStars() {
  const field = document.getElementById('ambient-stars');
  for (let i = 0; i < 46; i++) {
    const size = 1 + Math.random() * 2.2;
    const star = document.createElement('div');
    star.className = 'amb-star';
    star.style.cssText = `
      top:${Math.random() * 100}%; left:${Math.random() * 100}%; width:${size}px; height:${size}px;
      animation-duration:${2 + Math.random() * 3.5}s;
      --s-min:${0.1 + Math.random() * 0.15}; --s-max:${0.6 + Math.random() * 0.4}`;
    field.appendChild(star);
  }
}

function applyScene(index) {
  const wash = document.getElementById('ambient-wash');
  const scene = SCENES[index];
  wash.style.background = scene.wash;
  wash.style.opacity = scene.opacity;
  scene.blobs.forEach((b, i) => {
    const el = wash.querySelector(`.accent-blob-${i + 1}`);
    Object.assign(el.style, { top: b.top, left: b.left, width: b.size + 'px', height: b.size + 'px', background: b.fill });
  });
  document.getElementById('ambient-stars').style.opacity = scene.stars;
  currentSceneIndex = index;
}

function updateAmbientWash() {
  const index = Math.floor(new Date().getHours() / 2);
  if (index !== currentSceneIndex) applyScene(index);
}

function initAmbientWash() {
  buildAmbientStars();
  updateAmbientWash();
  setInterval(updateAmbientWash, 60000);
}
