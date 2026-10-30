(() => {
'use strict';
const CATS = ['Programming', 'Design', 'Music', 'Languages', 'Academics', 'Sports', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let tt, editId = null, reqSkill = null, me = null;

function toast(m, bad) {
  const t = $('#toast');
  t.textContent = m;
  t.className = 'show' + (bad ? ' bad' : '');
  clearTimeout(tt);
  tt = setTimeout(() => { t.className = ''; }, 2600);
}
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('Could not save data in this browser.', true); } };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let users = load('ss_users', null), skills = load('ss_skills', []), reqs = load('ss_requests', []);
const persist = () => { save('ss_users', users); save('ss_skills', skills); save('ss_requests', reqs); };

if (!users) {
  const now = Date.now();
  users = [
    { email: 'aisha@campus.edu', name: 'Aisha Khan', pass: 'demo123', bio: 'Design student. Happy to teach Figma and UI basics.' },
    { email: 'ravi@campus.edu', name: 'Ravi Patel', pass: 'demo123', bio: 'Computer science student who loves Java.' }
  ];
  skills = [
    { id: uid(), owner: 'aisha@campus.edu', title: 'Web design with Figma', cat: 'Design', level: 'Advanced', desc: 'Layouts, colour and clickable prototypes.', created: now },
    { id: uid(), owner: 'ravi@campus.edu', title: 'Java programming', cat: 'Programming', level: 'Intermediate', desc: 'Loops, classes, collections and small projects.', created: now + 1 }
  ];
  reqs = [];
  persist();
}

const owner = (e) => (users.find((u) => u.email === e) || { name: 'Unknown student' }).name;
const badge = (s) => `<span class="badge ${s.toLowerCase()}">${s}</span>`;
const skillCard = (s, mine) => `<article class="card skill">
  <div class="chips"><span class="chip">${esc(s.cat)}</span><span class="chip alt">${esc(s.level)}</span></div>
  <h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p>
  <p class="muted small">Taught by ${esc(owner(s.owner))}</p>
  ${mine
    ? `<div class="actions"><button class="btn small" data-edit="${s.id}">Edit</button><button class="btn small danger" data-del="${s.id}">Delete</button></div>`
    : `<button class="btn small" data-req="${s.id}">Request exchange</button>`}
</article>`;

const render = {
  dashboard() {
    const mine = skills.filter((s) => s.owner === me.email);
    const inc = reqs.filter((r) => r.to === me.email), out = reqs.filter((r) => r.from === me.email);
    $('#welcome').textContent = `Welcome back, ${me.name.split(' ')[0]}! 👋`;
    const st = [['My skills', mine.length], ['Incoming requests', inc.length], ['Outgoing requests', out.length], ['Accepted exchanges', [...inc, ...out].filter((r) => r.status === 'Accepted').length]];
    $('#stats').innerHTML = st.map(([l, n]) => `<div class="card stat"><b>${n}</b><span>${l}</span></div>`).join('');
    const rec = [...skills].sort((a, b) => b.created - a.created).slice(0, 4);
    $('#recentSkills').innerHTML = rec.map((s) => `<p><b>${esc(s.title)}</b><br><span class="muted small">${esc(owner(s.owner))}, ${esc(s.cat)}</span></p>`).join('') || '<p class="muted">No skills yet.</p>';
    const act = [...inc, ...out].sort((a, b) => b.created - a.created).slice(0, 5);
    $('#activity').innerHTML = act.map((r) => `<p>${r.from === me.email ? 'You asked ' + esc(owner(r.to)) : esc(owner(r.from)) + ' asked you'} for <b>${esc(r.skillTitle)}</b> ${badge(r.status)}</p>`).join('') || '<p class="muted">No activity yet. Open Explore to send your first request.</p>';
  },
  explore() {
    const q = $('#q').value.trim().toLowerCase(), c = $('#cat').value;
    const list = skills.filter((s) => s.owner !== me.email && (!c || s.cat === c) && `${s.title} ${s.desc} ${s.cat} ${owner(s.owner)}`.toLowerCase().includes(q));
    $('#exploreList').innerHTML = list.map((s) => skillCard(s, false)).join('') || '<p class="muted">No matching skills. Try another search or category.</p>';
  },
  myskills() {
    $('#mySkillList').innerHTML = skills.filter((s) => s.owner === me.email).map((s) => skillCard(s, true)).join('') || '<p class="muted">You have not listed a skill yet. Tap “Add skill” to start.</p>';
  },
  requests() {
    const row = (r, inc) => `<article class="card">
      <div class="row"><b>${esc(r.skillTitle)}</b>${badge(r.status)}</div>
      <p>${inc ? esc(owner(r.from)) + ' wants to learn this from you.' : 'Requested from ' + esc(owner(r.to)) + '.'}</p>
      <p class="muted">In return: ${esc(r.offer)}</p>
      ${inc && r.status === 'Pending' ? `<div class="actions"><button class="btn small" data-acc="${r.id}">Accept</button><button class="btn small danger" data-dec="${r.id}">Decline</button></div>` : ''}
    </article>`;
    const i = reqs.filter((r) => r.to === me.email), o = reqs.filter((r) => r.from === me.email);
    $('#incoming').innerHTML = i.map((r) => row(r, true)).join('') || '<p class="muted">No incoming requests yet.</p>';
    $('#outgoing').innerHTML = o.map((r) => row(r, false)).join('') || '<p class="muted">No outgoing requests yet.</p>';
  },
  profile() {
    $('#pName').value = me.name; $('#pEmail').value = me.email; $('#pBio').value = me.bio || '';
    $('#profSkills').innerHTML = skills.filter((s) => s.owner === me.email).map((s) => `<p><b>${esc(s.title)}</b><br><span class="muted small">${esc(s.cat)}, ${esc(s.level)}</span></p>`).join('') || '<p class="muted">No skills listed yet.</p>';
    $('#peers').innerHTML = users.filter((u) => u.email !== me.email).map((u) => `<p><b>${esc(u.name)}</b><br><span class="muted small">${esc(skills.filter((s) => s.owner === u.email).map((s) => s.title).join(', ') || 'No skills yet')}</span></p>`).join('') || '<p class="muted">No other students yet.</p>';
  }
};

function go(v) {
  $$('.view').forEach((s) => { s.hidden = s.id !== 'v-' + v; });
  $$('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
  render[v]();
  window.scrollTo(0, 0);
}
function start(email) {
  localStorage.setItem('ss_session', email);
  me = users.find((u) => u.email === email);
  $('#auth').hidden = true; $('#app').hidden = false;
  go('dashboard');
}

/* Auth */
$$('[data-auth]').forEach((b) => b.onclick = () => {
  $$('[data-auth]').forEach((x) => x.classList.toggle('on', x === b));
  $('#loginForm').hidden = b.dataset.auth !== 'login';
  $('#regForm').hidden = b.dataset.auth !== 'register';
});
$('#regForm').onsubmit = (e) => {
  e.preventDefault();
  const name = $('#rName').value.trim(), email = $('#rEmail').value.trim().toLowerCase(), pass = $('#rPass').value;
  const msg = !name || !email || !pass ? 'Fill in your name, email and password.'
    : !EMAIL.test(email) ? 'Enter a valid email address.'
    : pass.length < 6 ? 'Use a password with at least 6 characters.'
    : users.some((u) => u.email === email) ? 'That email is already registered. Log in instead.' : '';
  $('#gErr').textContent = msg;
  if (msg) return;
  users.push({ email, name, pass, bio: '' });
  persist(); e.target.reset(); start(email); toast('Account created. Welcome!');
};
$('#loginForm').onsubmit = (e) => {
  e.preventDefault();
  const email = $('#lEmail').value.trim().toLowerCase(), pass = $('#lPass').value;
  const u = users.find((x) => x.email === email && x.pass === pass);
  $('#lErr').textContent = u ? '' : 'Incorrect email or password.';
  if (u) { e.target.reset(); start(email); }
};
$('#logout').onclick = () => {
  localStorage.removeItem('ss_session'); me = null;
  $('#app').hidden = true; $('#auth').hidden = false;
  toast('You have been logged out.');
};

/* Navigation and search */
$$('#nav button').forEach((b) => b.onclick = () => go(b.dataset.view));
$('#cat').innerHTML = '<option value="">All categories</option>' + CATS.map((c) => `<option>${c}</option>`).join('');
$('#sCat').innerHTML = CATS.map((c) => `<option>${c}</option>`).join('');
$('#sLevel').innerHTML = LEVELS.map((c) => `<option>${c}</option>`).join('');
$('#q').oninput = $('#cat').onchange = () => render.explore();
$$('[data-close]').forEach((b) => b.onclick = () => b.closest('dialog').close());

/* Skills */
function openSkill(id) {
  editId = id || null;
  const s = skills.find((x) => x.id === id) || {};
  $('#skillHead').textContent = id ? 'Edit skill' : 'Add skill';
  $('#sTitle').value = s.title || ''; $('#sCat').value = s.cat || CATS[0];
  $('#sLevel').value = s.level || LEVELS[0]; $('#sDesc').value = s.desc || '';
  $('#sErr').textContent = '';
  $('#skillDlg').showModal();
}
$('#addSkill').onclick = () => openSkill();
$('#skillForm').onsubmit = (e) => {
  e.preventDefault();
  const title = $('#sTitle').value.trim(), desc = $('#sDesc').value.trim();
  if (!title || !desc) { $('#sErr').textContent = 'Add a title and a short description.'; return; }
  const data = { title, cat: $('#sCat').value, level: $('#sLevel').value, desc };
  if (editId) Object.assign(skills.find((s) => s.id === editId), data);
  else skills.push({ id: uid(), owner: me.email, created: Date.now(), ...data });
  persist(); $('#skillDlg').close(); render.myskills(); toast(editId ? 'Skill updated.' : 'Skill added.');
};

/* Requests */
function openReq(id) {
  reqSkill = skills.find((s) => s.id === id);
  if (!reqSkill) return;
  $('#reqInfo').textContent = `You want to learn “${reqSkill.title}” from ${owner(reqSkill.owner)}.`;
  const mine = skills.find((s) => s.owner === me.email);
  $('#rOffer').value = mine ? mine.title : ''; $('#qErr').textContent = '';
  $('#reqDlg').showModal();
}
$('#reqForm').onsubmit = (e) => {
  e.preventDefault();
  const offer = $('#rOffer').value.trim();
  if (!offer) { $('#qErr').textContent = 'Say what you can teach in return.'; return; }
  if (reqs.some((r) => r.from === me.email && r.skillId === reqSkill.id && r.status === 'Pending')) { $('#qErr').textContent = 'You already have a pending request for this skill.'; return; }
  reqs.push({ id: uid(), from: me.email, to: reqSkill.owner, skillId: reqSkill.id, skillTitle: reqSkill.title, offer, status: 'Pending', created: Date.now() });
  persist(); $('#reqDlg').close(); toast('Request sent.');
};
function setStatus(id, st) {
  if (st === 'Declined' && !confirm('Decline this request?')) return;
  const r = reqs.find((x) => x.id === id);
  if (!r) return;
  r.status = st; persist(); render.requests(); toast('Request ' + st.toLowerCase() + '.');
}

/* Profile */
$('#profForm').onsubmit = (e) => {
  e.preventDefault();
  const n = $('#pName').value.trim();
  if (!n) { toast('Name cannot be empty.', true); return; }
  me.name = n; me.bio = $('#pBio').value.trim();
  persist(); toast('Profile saved.');
};

/* Buttons rendered inside lists */
document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || !me) return;
  const d = b.dataset;
  if (d.edit) openSkill(d.edit);
  else if (d.del) {
    if (confirm('Delete this skill listing?')) { skills = skills.filter((s) => s.id !== d.del); persist(); render.myskills(); toast('Skill deleted.'); }
  } else if (d.req) openReq(d.req);
  else if (d.acc) setStatus(d.acc, 'Accepted');
  else if (d.dec) setStatus(d.dec, 'Declined');
});

/* Restore session after refresh */
const saved = localStorage.getItem('ss_session');
if (saved && users.some((u) => u.email === saved)) start(saved);
})();
