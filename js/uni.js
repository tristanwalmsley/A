/* uni.js - shared bits for the University pages: mobile menu + application countdown. */
(function(){
  var b=document.getElementById('menu-btn'),n=document.getElementById('mainnav');
  if(b&&n)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',String(o));});
  var cd=document.getElementById('cd');if(!cd)return;
  var CLOSE=new Date('2026-12-26T00:00:00'),pad=function(x){return String(x).padStart(2,'0');};   /* EDIT ME: closes end of 25 Dec */
  function tick(){var ms=CLOSE-new Date();
    if(ms<=0){cd.innerHTML='<div style="grid-column:1/-1"><b style="font-size:1.4rem">Closed</b></div>';document.getElementById('cd-note').textContent='Applications have closed. Thank you!';return false;}
    var v=[[Math.floor(ms/864e5),'days'],[Math.floor(ms%864e5/36e5),'hours'],[Math.floor(ms%36e5/6e4),'mins'],[Math.floor(ms%6e4/1e3),'secs']];
    cd.innerHTML=v.map(function(x){return '<div><b>'+pad(x[0])+'</b><small>'+x[1]+'</small></div>';}).join('');return true;}
  if(tick())setInterval(tick,1000);
})();
