// Reusable celebration effects. Both draw into #confetti-layer.

function launchConfetti() {
  const month = new Date().getMonth();
  const palettes = {
    7:  ['#c8943a', '#b86858', '#faf4e8', '#d4b483', '#e8c4a0'],
    11: ['#c8943a', '#2d6e30', '#b86858', '#ffffff', '#d4b483'],
  };
  const colours = palettes[month] || ['#c8943a', '#b86858', '#d4b483', '#7a9870', '#f0ddb8'];
  const radii = ['50%', '2px', '4px', '0'];
  const layer = document.getElementById('confetti-layer');

  for (let i = 0; i < 55; i++) {
    const size = 5 + Math.random() * 9;
    const bit = document.createElement('div');
    bit.className = 'confetti-bit';
    bit.style.cssText = `
      left:${5 + Math.random() * 90}%; top:-10px; width:${size}px; height:${size}px;
      background:${colours[Math.floor(Math.random() * colours.length)]};
      border-radius:${radii[Math.floor(Math.random() * radii.length)]};
      --cd:${1.5 + Math.random() * 2}s; --cdelay:${Math.random() * 1.2}s;
      --cx:${(Math.random() - 0.5) * 280}px; --cr:${(Math.random() - 0.5) * 720}deg`;
    layer.appendChild(bit);
    setTimeout(() => bit.remove(), 4000);
  }
}

function launchHeartBurst() {
  const layer = document.getElementById('confetti-layer');
  for (let i = 0; i < 16; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart-burst';
    heart.textContent = '♡';
    heart.style.left = (38 + Math.random() * 24) + '%';
    heart.style.fontSize = (14 + Math.random() * 16) + 'px';
    heart.style.setProperty('--hd', (1.1 + Math.random() * 0.8) + 's');
    heart.style.setProperty('--hx', ((Math.random() - 0.5) * 200) + 'px');
    layer.appendChild(heart);
    setTimeout(() => heart.remove(), 2200);
  }
}
