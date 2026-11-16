/* apply.js - application form. Saves to /api/application (one per person per year, locked once sent). */
(function(){
  var $=function(i){return document.getElementById(i);},form=$('app'),done=$('done');
  function show(a){form.hidden=true;done.hidden=false;$('d-name').textContent=a.preferred||a.name;$('d-ref').textContent=a.ref;$('d-date').textContent=new Date(a.at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});window.scrollTo(0,0);}
  fetch('/api/shared',{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
    if(j&&j.shared&&j.shared.application&&j.user&&j.shared.application[j.user])show(j.shared.application[j.user]);
  }).catch(function(){});
  $('why').addEventListener('input',function(){$('whyn').textContent=this.value.length;});
  function bad(el,on){var f=el.closest('.fld');if(f)f.classList.toggle('bad',on);return on;}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var tea=form.querySelector('input[name=tea]:checked'),errs=0;
    ['full','where','why','biscuit'].forEach(function(i){if(bad($(i),!$(i).value.trim()))errs++;});
    if(bad(form.querySelector('input[name=tea]'),!tea))errs++;
    if(bad($('decl'),!$('decl').checked))errs++;
    if(errs){$('msg').textContent='Please check the highlighted answers.';var f=form.querySelector('.fld.bad');if(f)f.scrollIntoView({block:'center'});return;}
    var body={name:$('full').value.trim(),preferred:$('pref').value.trim(),where:$('where').value.trim(),why:$('why').value.trim(),knows:$('knows').value,
      tea:tea.value,biscuit:$('biscuit').value.trim(),dialect:$('dialect').value.trim(),side:$('side').value,pay:$('pay').value};
    $('submit').disabled=true;$('msg').textContent='Sending…';
    fetch('/api/application',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
     .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});})
     .then(function(x){if(!x.ok)throw new Error(x.j.error||'failed');show(x.j.application);})
     .catch(function(err){$('submit').disabled=false;$('msg').textContent=err.message==='closed'?'Sorry, applications have closed.':'Something went wrong. Please try again.';});
  });
})();
