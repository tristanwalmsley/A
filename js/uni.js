/* uni.js - shared shell (header/footer) and renderers for the University pages. Course content is in courses_data.js. */
(function(){
  const U = window.UOB, $ = id => document.getElementById(id), page = document.body.dataset.page || '';
  const closed = new Date() >= new Date(U.CLOSE + 'T00:00:00');
  const school = id => U.SCHOOLS.find(s => s.id === id) || {};
  const cur = p => page === p ? ' aria-current="page"' : '';

  $('uob-top').innerHTML = `<a class="skip" href="#main">Skip to content</a>
  <div class="util"><div class="wrap"><span>A member of the Besties™ Group</span><a href="index.html">&larr; Back to Besties</a></div></div>
  <header class="site"><div class="wrap">
    <a class="brand" href="university.html"><img src="images/uob_logo.png" alt=""><span>University of Besties™<small>Friendship District, Lord Nooks Republic</small></span></a>
    <button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="mainnav">Menu</button>
    <nav class="main" id="mainnav" aria-label="Main"><ul>
      <li><a href="courses.html"${page === 'courses' || page === 'course' ? ' aria-current="page"' : ''}>Courses</a></li>
      <li><a href="university.html#schools">Schools</a></li><li><a href="university.html#life">Student life</a></li><li><a href="university.html#about">About us</a></li>
      <li><a class="btn" href="apply.html"${cur('apply')}>${closed ? 'Applications closed' : 'Apply now'}</a></li>
    </ul></nav></div></header>`;
  $('uob-foot').innerHTML = `<footer class="site"><div class="wrap">
    <div><img src="images/uob_logo.png" alt="University of Besties™" style="height:84px;background:#fff;padding:6px;border-radius:3px;margin-bottom:.8rem"><p>Friendship District,<br>Lord Nooks Republic</p></div>
    <div><h4>Study</h4><ul><li><a href="courses.html">All courses</a></li>${U.COURSES.map(c => `<li><a href="course.html?c=${c.slug}">${c.title}, ${c.award}</a></li>`).join('')}<li><a href="apply.html">Apply</a></li></ul></div>
    <div><h4>Help</h4><ul><li>Admissions: universityofbesties@outlook.com</li><li>IT: bestiestechnologies@outlook.com</li><li>Dean&rsquo;s Office, for academic and personal support</li></ul></div>
    <p class="legal">The University of Besties™ is a subsidiary of Besties™ Group Holdings. &copy; 2026 University of Besties™. All rights reserved.</p></div></footer>`;
  const mb = $('menu-btn'), nv = $('mainnav');
  mb.addEventListener('click', () => { const o = nv.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); });

  const card = c => `<a class="ccard" href="course.html?c=${c.slug}"><div class="top"><span>${c.award}</span><span>${c.level}</span></div>
    <div class="bd"><h3>${c.title}</h3><p>${c.summary}</p></div>
    <div class="ft"><span><b>${c.mode}</b></span><span>Starts <b>${c.start}</b></span><span>${c.credits} credits</span><span class="go">View course</span></div></a>`;

  /* ---- home: featured courses, schools, support, staff, stats ---- */
  if ($('featured')) $('featured').innerHTML = U.COURSES.slice(0, 6).map(card).join('');
  if ($('schools-list')) $('schools-list').innerHTML = U.SCHOOLS.map(s => `<div class="school"><h3>${s.name}</h3><p>${s.blurb}</p><ul>${U.COURSES.filter(c => c.school === s.id).map(c => `<li><a href="course.html?c=${c.slug}">${c.title}, ${c.award}</a></li>`).join('')}</ul></div>`).join('');
  if ($('support')) $('support').innerHTML = U.SUPPORT.map(x => `<div><small>${x[1]}</small><h3>${x[0]}</h3><p>${x[2]}</p></div>`).join('');
  if ($('staff')) $('staff').innerHTML = U.STAFF.map(p => `<div class="person${p.vacant ? ' vac' : ''}"><div class="av">${p.ini}</div><small>${p.role}</small><h3>${p.name}</h3><p>${p.text}</p></div>`).join('');
  if ($('st-courses')) { $('st-courses').textContent = U.COURSES.length; $('st-modules').textContent = U.COURSES.reduce((n, c) => n + c.modules.length, 0); }
  if ($('hero-find')) $('hero-find').addEventListener('submit', e => { e.preventDefault(); location.href = 'courses.html?q=' + encodeURIComponent($('hero-q').value.trim()); });

  /* ---- course finder ---- */
  if ($('grid')) {
    const q = $('q'), sc = $('school');
    sc.innerHTML = '<option value="">All schools</option>' + U.SCHOOLS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    q.value = new URLSearchParams(location.search).get('q') || '';
    const run = () => { const t = q.value.toLowerCase();
      const list = U.COURSES.filter(c => (!sc.value || c.school === sc.value) && (!t || (c.title + ' ' + c.award + ' ' + c.summary + ' ' + c.modules.map(m => m.title + ' ' + m.summary).join(' ')).toLowerCase().includes(t)));
      $('count').textContent = list.length + (list.length === 1 ? ' course' : ' courses');
      $('grid').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">No courses match that yet. Try a different word, or clear the search.</p>'; };
    q.addEventListener('input', run); sc.addEventListener('change', run); run();
  }

  /* ---- course page ---- */
  if ($('course-root')) {
    const slug = new URLSearchParams(location.search).get('c'), c = U.COURSES.find(x => x.slug === slug) || (U.COURSES.length === 1 ? U.COURSES[0] : null);
    if (!c) { $('course-root').innerHTML = '<div class="wrap"><p class="empty">We couldn\u2019t find that course. <a href="courses.html">Browse all courses</a>.</p></div>'; }
    else {
      document.title = c.title + ', ' + c.award + ' | University of Besties™';
      const cols = ['var(--mar)', 'var(--ora)', '#a8861c', 'var(--mar-d)', 'var(--mar-l)'], parts = c.modules.map(m => ({ n: m.exam + '<br>' + m.weight + '%', w: m.weight })).concat([{ n: c.finalExam.title + '<br>' + c.finalExam.weight + '%', w: c.finalExam.weight }]);
      const apply = 'apply.html?c=' + c.slug, btn = closed ? '<p><b>Applications closed on ' + U.CLOSE_TEXT + '.</b></p>' : `<a class="btn" href="${apply}">Apply now</a>`;
      $('course-root').innerHTML = `
      <div class="pb"><div class="wrap"><p class="crumbs"><a href="university.html">Home</a> / <a href="courses.html">Courses</a> / ${c.title}</p>
        <span class="badge">${closed ? 'Applications closed' : 'Applications open until ' + U.CLOSE_TEXT}</span><h1>${c.title}, ${c.award}</h1><p>${c.tagline} ${c.summary}</p></div></div>
      <div class="facts"><div class="wrap"><div class="fact"><b>${c.award}</b><span>Award</span></div><div class="fact"><b>${c.level}</b><span>Level</span></div><div class="fact"><b>${c.credits} credits</b><span>Total</span></div><div class="fact"><b>${c.mode}</b><span>Study mode</span></div><div class="fact"><b>${c.start}</b><span>Start</span></div><div class="fact"><b>${c.fee}</b><span>Tuition fees</span></div></div></div>
      <div class="subnav"><div class="wrap"><a href="#overview">Overview</a><a href="#modules">Modules</a><a href="#assessment">Assessment</a><a href="#entry">Entry &amp; fees</a><a href="#staff">Teaching</a></div></div>
      <div class="wrap layout"><div>
        <section id="overview"><h2>Overview</h2>${c.overview.map(p => '<p>' + p + '</p>').join('')}<ul class="ticks">${c.highlights.map(h => '<li>' + h + '</li>').join('')}</ul></section>
        <section id="modules"><h2>What you&rsquo;ll study</h2><p>Modules are taken in order. Each module&rsquo;s exam must be passed before the next one opens.</p>
          ${c.modules.map((m, i) => `<details class="mod"${i === 0 ? ' open' : ''}><summary><div><h3>${m.code} ${m.title}</h3><small>${m.credits} credits &middot; ${m.exam} &middot; ${m.weight}%</small></div></summary><div class="mod-body">
            <div><p>${m.summary}</p><ol>${m.lectures.map((l, j) => `<li><b>L${j + 1} ${l[0]}</b><span>${l[1]}</span></li>`).join('')}</ol></div>
            <div><h4>By the end you can</h4><ul>${m.outcomes.map(o => '<li>' + o + '</li>').join('')}</ul><h4 style="margin-top:1rem">Assessed by</h4><ul>${m.assessed.map(o => '<li>' + o + '</li>').join('')}</ul></div></div></details>`).join('')}</section>
        <section id="assessment"><h2>How you&rsquo;re assessed</h2><p>${c.assessmentNote}</p>
          <div class="abar" role="img" aria-label="Assessment weightings">${parts.map((p, i) => `<div style="width:${p.w}%;background:${cols[i % cols.length]}">${p.n}</div>`).join('')}</div>
          <div class="alist">${c.modules.map(m => `<div><b>${m.exam} &middot; ${m.title}</b>${m.assessed.join('. ')}.</div>`).join('')}<div><b>${c.finalExam.title}</b>${c.finalExam.text}</div></div></section>
        <section id="entry"><h2>Entry requirements &amp; fees</h2><ul class="ticks">${c.entry.map(e => '<li>' + e + '</li>').join('')}</ul><p style="margin-top:.8rem">${c.entryNote}</p>
          <p style="margin-top:1.4rem"><span class="big">${c.fee}</span></p><p>${c.feeNote}</p></section>
        <section id="staff"><h2>Teaching</h2><p>This course sits in the <b>${school(c.school).name}</b>, led by ${school(c.school).head}.</p><ul class="ticks">${c.staff.map(s => '<li><b>' + s.name + '</b>, ' + s.role + '</li>').join('')}</ul></section>
      </div>
      <aside class="side"><div class="panel"><h3>${closed ? 'Applications closed' : 'Apply for ' + c.start}</h3><p>${closed ? 'Thank you to everyone who applied.' : 'Applications close on ' + U.CLOSE_TEXT + '. It takes about five minutes.'}</p>${btn}</div>
        <div class="panel o"><h3>Questions?</h3><p>Email the Admissions Office at universityofbesties@outlook.com.</p></div></aside></div>`;
    }
  }
})();
