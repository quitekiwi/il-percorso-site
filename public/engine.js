/*
  Il Percorso engine. Reads window.PACK (see packs/italy.js) and builds the page:
  questions → your steps, shown as a route → progress saved on this device only.
  Nothing in here is specific to Italy.
*/
(function(){
const PACK = window.PACK;
// answers: what the questions currently say. built: the answers the shown steps were made from.
const state = { answers: {}, built: null, done: new Set() };
const STORE_KEY = 'progress:' + PACK.id;
const $ = id => document.getElementById(id);

const ICON = {
  check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chevron: '<svg class="icon chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  info: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/></svg>',
  alert: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5h.01"/></svg>',
  confirmed: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8L16.2 9.5"/></svg>',
  unchecked: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><path d="M12 8v4.5M12 15.8h.01"/></svg>',
  external: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
};

/* ---------- Reading the content pack ---------- */

// Which answers count as "matching" a key like "work,family" or "default"
function pickCase(obj, value){
  if(value != null){
    for(const k of Object.keys(obj)){
      if(k === 'by' || k === 'default') continue;
      if(k.split(',').map(s=>s.trim()).includes(value)) return obj[k];
    }
  }
  return Object.prototype.hasOwnProperty.call(obj, 'default') ? obj.default : undefined;
}

// Turn a field (plain text, or { by: ..., ... }) into final text for a set of answers
function resolve(val, ans){
  if(val && typeof val === 'object' && val.by) val = pickCase(val, ans[val.by]);
  if(typeof val === 'string') return fill(val, ans);
  return val == null ? null : val;
}

function vars(ans){
  const v = { verified: PACK.verified };
  PACK.questions.forEach(q=>{
    const opt = q.options.find(o=>o.val === ans[q.id]);
    if(opt) v[q.id + 'Short'] = opt.short || opt.label;
  });
  Object.entries(PACK.vars || {}).forEach(([k, def])=>{
    const r = def && def.by ? pickCase(def, ans[def.by]) : def;
    if(r != null) v[k] = r;
  });
  return v;
}
function fill(text, ans){
  const v = vars(ans);
  return text.replace(/\{(\w+)\}/g, (m, k)=> v[k] != null ? v[k] : m);
}

function matches(when, ans){
  return Object.entries(when || {}).every(([k, want])=>{
    const wants = Array.isArray(want) ? want : [want];
    return wants.includes(ans[k]);
  });
}

function visibleQuestions(ans){
  return PACK.questions.filter(q=>matches(q.showIf, ans));
}

function pathFor(ans){
  const p = PACK.paths.find(p=>matches(p.when, ans));
  return p ? p.steps : [];
}

const TIER_ORDER = { official: 0, legal: 1, aggregator: 2 };

function buildStep(id, ans){
  const raw = PACK.steps[id];
  let merged = Object.assign({}, raw);
  delete merged.variants;
  // A variant's disagreement is shown alongside the step's own, not instead of it.
  // Either can itself vary by answer ({ by: ..., ... }).
  const discrepancies = [];
  const addDisc = d=>{ const r = d && d.by ? pickCase(d, ans[d.by]) : d; if(r) discrepancies.push(r); };
  addDisc(raw.discrepancy);
  if(raw.variants){
    const v = pickCase(raw.variants, ans[raw.variants.by]);
    if(v){
      merged = Object.assign(merged, v);
      addDisc(v.discrepancy);
    }
  }
  const out = { id, checked: merged.checked || PACK.verified };
  ['title','meta','what','where','docs','cost','time'].forEach(f=>{ out[f] = resolve(merged[f], ans); });
  // flag can be one note or a list of notes; `notes` adds more without replacing a variant's flag
  out.flags = [].concat(resolve(merged.flag, ans) || [], resolve(merged.notes, ans) || [])
    .filter(Boolean).map(f=>fill(f, ans));
  const srcKey = resolve(merged.source, ans);
  out.source = srcKey ? PACK.sources[srcKey] : null;
  const also = resolve(merged.also, ans) || [];
  out.also = also.map(k=>PACK.sources[k]).filter(x=>x && x !== out.source);
  out.discrepancies = discrepancies;
  return out;
}

function sameAnswers(a, b){
  if(!a || !b) return false;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every(k=>a[k] === b[k]);
}

/* ---------- Questions (built once; only visibility changes) ---------- */

const qBox = $('questions');

function renderQuestions(){
  qBox.innerHTML = '';
  PACK.questions.forEach(q=>{
    const fs = document.createElement('fieldset');
    fs.id = 'q-' + q.id;
    fs.innerHTML = `<legend>${q.label}</legend><div class="options"></div>`;
    const grid = fs.querySelector('.options');
    q.options.forEach(o=>{
      const id = `opt-${q.id}-${o.val}`;
      const label = document.createElement('label');
      label.className = 'option';
      label.innerHTML = `
        <input type="radio" name="${q.id}" value="${o.val}" id="${id}" aria-labelledby="${id}-name"${o.small ? ` aria-describedby="${id}-hint"` : ''}>
        <span class="opt-text"><span class="opt-name" id="${id}-name">${o.label}</span>${o.small ? `<span class="opt-hint" id="${id}-hint">${o.small}</span>` : ''}</span>`;
      label.querySelector('input').addEventListener('change', ()=>{
        state.answers[q.id] = o.val;
        syncQuestions();
        saveProgress(true);
      });
      grid.appendChild(label);
    });
    qBox.appendChild(fs);
  });
  syncQuestions();
}

// Reflect state.answers in the form without rebuilding it (keeps keyboard focus where it is)
function syncQuestions(){
  PACK.questions.forEach(q=>{
    const show = matches(q.showIf, state.answers);
    if(!show) delete state.answers[q.id];
    const fs = $('q-' + q.id);
    fs.hidden = !show;
    fs.querySelectorAll('input').forEach(inp=>{ inp.checked = state.answers[q.id] === inp.value; });
  });
  updateGo();
  updateStale();
}

function missingQuestions(){
  return visibleQuestions(state.answers).filter(q=>!state.answers[q.id]);
}

function updateGo(){
  const missing = missingQuestions();
  const btn = $('go-btn');
  btn.setAttribute('aria-disabled', missing.length ? 'true' : 'false');
  $('go-hint').textContent = missing.length
    ? 'Still to answer: ' + missing.map(q=>`“${q.label}”`).join(' and ') + '.'
    : '';
}

$('questions-panel').addEventListener('submit', (e)=>{
  e.preventDefault();
  const missing = missingQuestions();
  if(missing.length){
    const first = $('q-' + missing[0].id).querySelector('input');
    if(first) first.focus();
    return;
  }
  build();
  const d = $('dossier');
  d.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  $('dossier-title').focus({preventScroll:true});
});

/* ---------- Your steps ---------- */

function build(){
  state.built = Object.assign({}, state.answers);
  // Done marks are kept: a step that is still on the new route stays done.
  renderDossier();
  saveProgress();
  count('dossier:' + visibleQuestions(state.built).map(q=>state.built[q.id]).join('-'));
}

function updateStale(){
  const stale = !!state.built && !sameAnswers(state.answers, state.built) && missingQuestions().length === 0;
  $('stale-notice').hidden = !stale;
}
$('update-btn').addEventListener('click', ()=>{
  build();
  $('dossier-title').focus();
});

function tierLabel(t){
  if(t==='official') return 'Official source';
  if(t==='legal') return 'Immigration guide';
  return 'Aggregator / relocation blog';
}

function sourcesHtml(s){
  let h = `<div class="sources"><p class="sources-title">Sources</p>`;
  if(s.source){
    h += `<p class="source-row">${ICON.confirmed}<span>Confirmed against <a class="source-link" href="${s.source.url}" target="_blank" rel="noopener">${s.source.name}<span class="visually-hidden"> (official source, opens in a new tab)</span></a> <span class="checked-date">checked ${s.checked}</span></span></p>`;
  } else {
    h += `<p class="source-row unchecked">${ICON.unchecked}<span>Not yet checked against an official source <span class="checked-date">flagged ${s.checked}</span></span></p>`;
  }
  s.discrepancies.forEach(d=>{
    const claims = d.claims.slice().sort((a,b)=>(TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9));
    h += `<div class="disagree"><p class="disagree-title">${ICON.alert}<span>Sources disagree: ${d.label}</span></p><ul class="claims">`;
    claims.forEach(c=>{
      h += `<li class="claim"><span class="tier tier-${c.tier}">${tierLabel(c.tier)}</span><br>${c.text}</li>`;
    });
    h += `</ul></div>`;
  });
  if(s.also.length){
    h += `<div class="also"><p class="also-title">Also useful</p><ul>` + s.also.map(src=>
      `<li><a class="source-link" href="${src.url}" target="_blank" rel="noopener">${src.name}<span class="visually-hidden"> (opens in a new tab)</span></a></li>`).join('') + `</ul></div>`;
  }
  if(s.source){
    h += `<a class="checkself" href="${s.source.url}" target="_blank" rel="noopener">Check this yourself on the official site${ICON.external}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  }
  return h + `</div>`;
}

function renderDossier(){
  const ans = state.built;
  const ids = pathFor(ans);
  $('situation').textContent = resolve(PACK.dossierTitle, ans) || '';
  const list = $('steps');
  list.innerHTML = '';
  ids.forEach((id, i)=>{
    const s = buildStep(id, ans);
    const li = document.createElement('li');
    li.className = 'stop';
    li.dataset.id = id;
    li.innerHTML = `
      <span class="node" aria-hidden="true"></span>
      <div class="step" id="step-${id}">
        <h3 class="step-h">
          <button type="button" class="step-head" aria-expanded="false" aria-controls="body-${id}">
            <span class="step-heading">
              <span class="step-title"><span class="visually-hidden">Step ${i+1}: </span>${s.title}</span>
              <span class="step-meta">${s.meta}</span>
            </span>
            <span class="status"></span>
            ${ICON.chevron}
          </button>
        </h3>
        <div class="step-body" id="body-${id}" hidden>
          <p class="what">${s.what}</p>
          <dl class="facts">
            <dt>Where</dt><dd>${s.where}</dd>
            <dt>Bring</dt><dd>${s.docs}</dd>
            <dt>Cost</dt><dd>${s.cost}</dd>
            <dt>Timing</dt><dd>${s.time}</dd>
          </dl>
          ${s.flags.map(f=>`<div class="callout">${ICON.info}<span>${f}</span></div>`).join('')}
          <div class="step-actions">
            <button type="button" class="btn btn-secondary mark-done"></button>
          </div>
          ${sourcesHtml(s)}
        </div>
      </div>`;
    li.dataset.num = i + 1;
    li.dataset.title = s.title;
    const head = li.querySelector('.step-head');
    head.addEventListener('click', ()=> setOpen(li, head.getAttribute('aria-expanded') !== 'true'));
    li.querySelectorAll('.sources a').forEach(a=>a.addEventListener('click', ()=>countOnce('source:' + id)));
    li.querySelector('.mark-done').addEventListener('click', ()=>{
      const nowDone = !state.done.has(id);
      if(nowDone){ state.done.add(id); countOnce('done:' + id); }
      else state.done.delete(id);
      refreshProgress();
      if(nowDone){ li.classList.add('just-done'); setTimeout(()=>li.classList.remove('just-done'), 500); }
      saveProgress();
      const n = ids.filter(x=>state.done.has(x)).length;
      announce(`Step ${i+1} ${nowDone ? 'marked done' : 'marked not done'}. ${n} of ${ids.length} done.`);
    });
    list.appendChild(li);
  });
  $('dossier').hidden = false;
  updateStale();
  refreshProgress();
}

function setOpen(li, open){
  const head = li.querySelector('.step-head');
  head.setAttribute('aria-expanded', open ? 'true' : 'false');
  li.querySelector('.step-body').hidden = !open;
  li.querySelector('.step').classList.toggle('open', open);
  if(open) countOnce('open:' + li.dataset.id);
}

// Route nodes, done chips, buttons, progress and "your next step"
function refreshProgress(){
  const stops = [...document.querySelectorAll('#steps .stop')];
  const ids = stops.map(li=>li.dataset.id);
  const nextId = ids.find(id=>!state.done.has(id));
  stops.forEach(li=>{
    const done = state.done.has(li.dataset.id);
    li.classList.toggle('done', done);
    li.classList.toggle('next-stop', li.dataset.id === nextId);
    li.querySelector('.node').innerHTML = done ? ICON.check : li.dataset.num;
    li.querySelector('.status').innerHTML = done ? `<span class="chip chip-done">${ICON.check}<span class="chip-text">Done</span></span>` : '';
    const btn = li.querySelector('.mark-done');
    btn.innerHTML = done ? 'Mark as not done' : `${ICON.check}Mark as done`;
  });
  const n = ids.filter(id=>state.done.has(id)).length;
  $('progress-text').textContent = `${n} of ${ids.length} done`;

  const panel = $('next-panel');
  if(nextId){
    const li = stops.find(x=>x.dataset.id === nextId);
    panel.classList.remove('all-done');
    $('next-label').textContent = n === 0 ? 'Start here:' : 'Your next step:';
    $('next-title').textContent = `${li.dataset.num}. ${li.dataset.title}`;
    $('next-open').hidden = false;
  } else {
    panel.classList.add('all-done');
    $('next-label').textContent = 'All steps marked done.';
    $('next-title').textContent = 'Keep your receipts and documents together — you may need them for renewals.';
    $('next-open').hidden = true;
  }
}

$('next-open').addEventListener('click', ()=>{
  const li = document.querySelector('#steps .stop.next-stop');
  if(!li) return;
  setOpen(li, true);
  li.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  li.querySelector('.step-head').focus({preventScroll:true});
});

$('change-link').addEventListener('click', (e)=>{
  e.preventDefault();
  $('questions-panel').scrollIntoView({behavior:'smooth', block:'start'});
  const checked = $('questions-panel').querySelector('input:checked') || $('questions-panel').querySelector('input');
  if(checked) checked.focus({preventScroll:true});
});

// Print shows every step open (handled in the print stylesheet)
$('print-btn').addEventListener('click', ()=>{ count('print'); window.print(); });

/* ---------- Start over, with confirmation ---------- */

$('reset').addEventListener('click', ()=>{
  $('reset-confirm').hidden = false;
  $('reset').hidden = true;
  $('reset-no').focus();
});
$('reset-no').addEventListener('click', ()=>{
  $('reset-confirm').hidden = true;
  $('reset').hidden = false;
  $('reset').focus();
});
$('reset-yes').addEventListener('click', async ()=>{
  state.answers = {}; state.built = null; state.done = new Set();
  $('reset-confirm').hidden = true;
  $('reset').hidden = false;
  $('dossier').hidden = true;
  syncQuestions();
  await storeDelete(STORE_KEY);
  window.scrollTo({top:0, behavior:'smooth'});
  const first = $('questions-panel').querySelector('input');
  if(first) first.focus({preventScroll:true});
});

/* ---------- Saving progress on this device only ---------- */
// Uses Claude's artifact storage when previewed there, plain localStorage on the real site.

async function storeSet(key, value){
  try{ if(window.storage){ await window.storage.set(key, value, false); return true; } }catch(err){}
  try{ localStorage.setItem(key, value); return true; }catch(err){ return false; }
}
async function storeGet(key){
  try{ if(window.storage){ const r = await window.storage.get(key, false); return r ? r.value : null; } }catch(err){}
  try{ return localStorage.getItem(key); }catch(err){ return null; }
}
async function storeDelete(key){
  try{ if(window.storage){ await window.storage.delete(key, false); return; } }catch(err){}
  try{ localStorage.removeItem(key); }catch(err){}
}

let noteTimer;
function announce(text){
  const el = $('save-note');
  el.textContent = text;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(()=>{ el.textContent = ''; }, 6000);
}

async function saveProgress(quiet){
  const ok = await storeSet(STORE_KEY, JSON.stringify({ answers: state.answers, built: state.built, done: Array.from(state.done) }));
  if(!ok) announce("Couldn't save on this device — your browser may be blocking storage (for example in a private window). Everything still works, but your progress won't be remembered next time.");
  else if(!quiet) announce('Saved on this device.');
}

async function restoreProgress(){
  try{
    const raw = await storeGet(STORE_KEY);
    if(!raw) return;
    const saved = JSON.parse(raw);
    // Keep only answers that still exist in this pack (content can change between visits)
    const clean = a=>{
      if(!a || typeof a !== 'object') return null;
      const out = {};
      PACK.questions.forEach(q=>{ if(q.options.some(o=>o.val === a[q.id])) out[q.id] = a[q.id]; });
      return out;
    };
    state.answers = clean(saved.answers) || {};
    state.done = new Set((Array.isArray(saved.done) ? saved.done : []).filter(id=>typeof id === 'string' && PACK.steps[id]));
    // Older saves had no separate "built" answers: they were the same thing
    state.built = clean(saved.built !== undefined ? saved.built : saved.answers);
    syncQuestions();
    if(state.built && visibleQuestions(state.built).every(q=>state.built[q.id])) renderDossier();
    else state.built = null;
  }catch(err){
    // no saved progress, or corrupted — start fresh silently
  }
}

/* ---------- Anonymous counting ----------
   Sends only an event name such as "open:permesso" to our own server, which adds 1 to a
   monthly total. No cookies, no IDs, nothing stored on the device, no IP kept, no
   third-party scripts. Skipped entirely when the browser asks not to be tracked. */

// Where anonymous counts go. Empty = counting is off (nothing is ever sent).
const COUNTER_URL = '';
const counted = new Set();
const optedOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
function count(event){
  if(!COUNTER_URL || optedOut || !/^https?:$/.test(location.protocol) || /^(localhost|127\.)/.test(location.hostname)) return;
  const url = COUNTER_URL + '?p=' + encodeURIComponent(PACK.id) + '&e=' + encodeURIComponent(event);
  try{ navigator.sendBeacon ? navigator.sendBeacon(url) : fetch(url, {method:'POST', keepalive:true}); }catch(err){}
}
function countOnce(event){
  if(counted.has(event)) return;
  counted.add(event);
  count(event);
}

/* ---------- Start ---------- */

document.title = PACK.page.title;
$('heading').textContent = PACK.page.heading;
$('sub').textContent = PACK.page.sub;
$('meta-line').textContent = PACK.page.meta;
$('go-btn').textContent = PACK.page.button;
$('footer-text').textContent = fill(PACK.page.footer, {});
renderQuestions();
count('visit');
restoreProgress();
})();
