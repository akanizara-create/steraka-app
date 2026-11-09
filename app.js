/* Steraka — keep yourself in check. Vanilla JS, hash-routed single page app. */
(() => {
'use strict';

/* ---------------- helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Number(n).toLocaleString('en-US');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD = ['M','T','W','T','F','S','S'];
const now = () => new Date();
const hhmm = d => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
const mdate = d => MONTHS[d.getMonth()] + ' ' + d.getDate();
const daysAgo = n => { const d = now(); d.setDate(d.getDate() - n); return d; };
// seeded random so the demo data is stable
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
  chev: '<svg class="chev icon" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
  cam: '<svg class="icon" viewBox="0 0 24 24" style="width:26px;height:26px"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.8"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.3 3.8 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.4 0 5.6 3.3 4.4 6.7C19.5 15.4 12 20 12 20z"/></svg>',
  lock: '<svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  share: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 4v11M7.5 8.5 12 4l4.5 4.5"/><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M19 8v6M16 11h6"/></svg>',
};
const ic = (name, extra = '') => ICON[name].replace('<svg', `<svg class="icon ${extra}"`);

/* Original flame illustration (gradient, used everywhere a 🔥 appeared in the design) */
const fire = (size = 24, cls = '') => `<span class="fire ${cls}" style="width:${size}px;height:${size}px" aria-hidden="true"><svg viewBox="0 0 64 64"><path fill="url(#fOuter)" d="M33 3c2.4 9.6 16.5 16.4 16.5 33.4A17.5 17.5 0 0 1 14.5 37c0-8.6 4.6-14.1 9-18 0 6.5 2.6 10 6 11.3C28.3 19.5 30 10.6 33 3z"/><path fill="url(#fInner)" d="M32.5 29c1.8 6.2 9.5 9.6 9.5 18a9.6 9.6 0 0 1-19.2.3c0-5 2.7-8.4 5.4-10.4.6 3.8 2 5.6 3.9 6.4-.8-5.4-.4-9.8.4-14.3z"/></svg></span>`;
const ember = `<svg viewBox="0 0 64 64" class="ember"><path fill="#6a6f99" d="M33 3c2.4 9.6 16.5 16.4 16.5 33.4A17.5 17.5 0 0 1 14.5 37c0-8.6 4.6-14.1 9-18 0 6.5 2.6 10 6 11.3C28.3 19.5 30 10.6 33 3z"/><path fill="#a3a8cf" d="M32.5 29c1.8 6.2 9.5 9.6 9.5 18a9.6 9.6 0 0 1-19.2.3c0-5 2.7-8.4 5.4-10.4.6 3.8 2 5.6 3.9 6.4-.8-5.4-.4-9.8.4-14.3z"/></svg>`;

/* Nethie — an original mascot drawn in SVG (stands in for the 3D avatar in the file) */
const nethie = (cls = 'nethie', hue = 0) => `<svg class="${cls}" viewBox="0 0 120 120" aria-label="Nethie avatar" style="filter:hue-rotate(${hue}deg)">
  <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(0,0,0,.35)"/>
  <path d="M60 14c3 7 9 9 9 16a9 9 0 0 1-18 0c0-4 2-6 4-8 0 3 1 5 3 5-1-5 0-9 2-13z" fill="url(#fOuter)"/>
  <rect x="20" y="34" width="80" height="74" rx="36" fill="url(#nBody)"/>
  <rect x="20" y="34" width="80" height="74" rx="36" fill="url(#nShine)"/>
  <rect x="32" y="52" width="56" height="32" rx="16" fill="#0a1036"/>
  <g class="eyes"><ellipse cx="48" cy="68" rx="5.5" ry="7" fill="#fff"><animate attributeName="ry" values="7;7;.8;7;7" keyTimes="0;.9;.94;.98;1" dur="4s" repeatCount="indefinite"/></ellipse><ellipse cx="72" cy="68" rx="5.5" ry="7" fill="#fff"><animate attributeName="ry" values="7;7;.8;7;7" keyTimes="0;.9;.94;.98;1" dur="4s" repeatCount="indefinite"/></ellipse></g>
  <ellipse cx="38" cy="90" rx="6" ry="3.5" fill="#ff8fb8" opacity=".7"/><ellipse cx="82" cy="90" rx="6" ry="3.5" fill="#ff8fb8" opacity=".7"/>
  <path d="M54 93q6 5 12 0" stroke="#0a1036" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

function injectDefs() {
  const d = document.createElement('div');
  d.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="fOuter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset=".55" stop-color="#ff6a2b"/><stop offset="1" stop-color="#e8336b"/></linearGradient>
    <linearGradient id="fInner" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#ffc24a"/></linearGradient>
    <linearGradient id="nBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9aa3f0"/><stop offset=".6" stop-color="#6a5fd6"/><stop offset="1" stop-color="#4a2f9e"/></linearGradient>
    <radialGradient id="nShine" cx=".3" cy=".2" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs></svg>`;
  document.body.prepend(d.firstChild);
}

/* ---------------- data ---------------- */
const PEOPLE = {
  daniel:{name:'Daniel',img:'img/a-1.jpg'}, amara:{name:'Amara',img:'img/a-2.jpg'}, zoe:{name:'Zoe',img:'img/a-3.jpg'},
  arjun:{name:'Arjun',img:'img/a-4.jpg'}, leo:{name:'Leo',img:'img/a-5.jpg'}, tunde:{name:'Tunde',img:'img/a-6.jpg'},
  ines:{name:'Ines',img:'img/a-7.jpg'}, max:{name:'Max',img:'img/a-8.jpg'},
};
const CAPS = Array.from({length:18},(_,i)=>`img/c-${i+1}.jpg`);

function makeHistory(days, extra = 120) {
  // index 0 = today, going back. values: 0 untracked, 1..3 done, -1 slip, -2 freeze
  const h = [];
  for (let i = 0; i < 365; i++) {
    if (i < days) h.push(rnd() < 0.04 ? -2 : 1 + Math.floor(rnd() * 3));
    else if (i === days) h.push(-1);
    else if (i < days + extra) h.push(rnd() < 0.18 ? -1 : 1 + Math.floor(rnd() * 3));
    else h.push(0);
  }
  return h;
}
function makeCapsule(days, n, notes) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = daysAgo(i + 1);
    d.setHours(6 + Math.floor(rnd() * 14), Math.floor(rnd() * 60));
    out.push({ img: CAPS[(i * 5 + days) % CAPS.length], t: hhmm(d), d: mdate(d), day: days - i, note: notes[i % notes.length] });
  }
  return out;
}

function seedState() {
  seed = 7;
  const s = {
    v: 1, onboarded: false, pattern: null, name: 'Nethie', since: 'Jul 2026',
    freezes: 2, nudged: {}, cheered: {},
    apps: { spotify:true, youtube:false, duolingo:true, health:true, strava:false, screentime:true, calendar:false, kindle:false },
    prefs: { reminders:true, nudges:true, widget:true, hideCounts:false },
    streaks: [
      { id:'smoke', cover:'img/c-12.jpg', name:'Quit Smoking', kind:'quit', emoji:'🚭', days:102, best:102, goal:365, joined:1212034, reminder:'21:00', week:[1,1,1,1,1,1,1], partners:['amara','daniel','tunde'], public:true, created:'Jul 30',
        why:"I want to run up the stairs without stopping, and stop smelling like an ashtray.", desc:'Not one cigarette. Cravings pass in about ten minutes — wait them out.' },
      { id:'run', cover:'img/c-11.jpg', name:'Morning Run', kind:'build', emoji:'🏃', days:22, best:31, goal:60, joined:84210, reminder:'06:30', week:[1,0,1,0,1,1,0], partners:['arjun'], public:true, created:'Oct 18',
        why:"Energy before email. A 5K before the world gets loud.", desc:'At least 20 minutes of running before 9am on run days.' },
      { id:'spanish', cover:'img/c-15.jpg', name:'Spanish on Duolingo', kind:'build', emoji:'🗣️', days:48, best:48, goal:100, joined:530112, reminder:'20:00', week:[1,1,1,1,1,1,1], partners:['ines'], public:true, created:'Sep 22', app:'duolingo',
        why:"So I can actually talk to my grandmother next summer.", desc:'One lesson a day, minimum. Synced from Duolingo.' },
      { id:'sugar', cover:'img/c-16.jpg', name:'No Sugar After 8pm', kind:'quit', emoji:'🍩', days:9, best:17, goal:30, joined:40211, reminder:'19:45', week:[1,1,1,1,1,1,1], partners:['zoe'], public:false, created:'Oct 31',
        why:"Better sleep. Fewer 11pm biscuits.", desc:'Nothing sweet after 8pm. Fruit counts as sweet.' },
      { id:'read', cover:'img/c-14.jpg', name:'Read 20 Pages', kind:'build', emoji:'📚', days:4, best:12, goal:30, joined:301877, reminder:'22:00', week:[1,1,1,1,1,1,1], partners:[], public:true, created:'Nov 5',
        why:"Swap the last scroll of the night for a book.", desc:'20 pages before bed. Audiobooks don’t count.' },
    ],
    inbox: [
      { id:'i1', from:'amara', type:'nudge', streak:'smoke', text:'nudged you — you haven’t checked in on <b>Quit Smoking</b> today.', time:'12m', unread:true },
      { id:'i2', from:'arjun', type:'milestone', text:'hit <b>30 days</b> of Couch to 5K. Send some fire?', time:'1h', unread:true },
      { id:'i3', from:'max', type:'invite', text:'wants you as an accountability partner on <b>No Phone in Bed</b>.', time:'3h', unread:true },
      { id:'i4', from:'daniel', type:'cheer', text:'sent you 🔥 for <b>100 days</b> smoke-free.', time:'2d', unread:false },
      { id:'i5', from:'tunde', type:'cheer', text:'checked in on <b>Quit Smoking</b> — you’re both on a roll.', time:'2d', unread:false },
    ],
    partnersList: [
      { id:'amara', streak:'Quit Smoking', days:64, checked:true },
      { id:'daniel', streak:'Quit Smoking', days:211, checked:true },
      { id:'tunde', streak:'Quit Smoking', days:12, checked:false },
      { id:'arjun', streak:'Couch to 5K', days:30, checked:true },
      { id:'ines', streak:'Spanish on Duolingo', days:75, checked:false },
      { id:'zoe', streak:'No Sugar After 8pm', days:5, checked:false },
    ],
  };
  const notes = {
    smoke:['Craving at lunch. Walked it off.','Coffee without a cigarette. Weird but fine.','Party tonight — stayed out of the smoking corner.','Stairs felt easier today.'],
    run:['5.2k, legs heavy','Sunrise loop','Hill repeats 😮‍💨','Easy 4k'],
    spanish:['Unit 12 done','Ordered coffee in Spanish (to myself)','Perfect lesson!'],
    sugar:['Tea instead of dessert','Close call at 9pm'],
    read:['Ch. 4','Couldn’t stop'],
  };
  s.streaks.forEach((st, i) => {
    st.history = makeHistory(st.days, 60 + i * 20);
    st.checked = st.id === 'run' || st.id === 'spanish';
    if (!st.checked) st.history[0] = 0;
    st.capsule = makeCapsule(st.days, Math.min(st.days, st.id === 'smoke' ? 12 : 6), notes[st.id]);
  });
  return s;
}

const KEY = 'steraka-v1';
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || S.v !== 1) S = seedState();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked: keep in memory */ } };
let unlocked = false;
try { unlocked = sessionStorage.getItem('steraka-unlocked') === '1'; } catch (e) {}
const setUnlocked = v => { unlocked = v; try { sessionStorage.setItem('steraka-unlocked', v ? '1' : '0'); } catch (e) {} };
const getS = id => S.streaks.find(s => s.id === id);
const unread = () => S.inbox.filter(i => i.unread).length;

const EXPLORE = [
  { type:'text', who:'zoe', name:'Cold Showers', days:45, pre:'Why go for', big:'EASY', src:'Day 1 note', lead:'That would probably be fun.', lead2:'When I can toughen it up a little and put up a challenge!', desc:'Two minutes cold, every morning. Day 45 and I still yell.' },
  { type:'video', who:'amara', name:'5am Strength Club', days:22, img:'img/f-1.jpg', desc:'Lifting before work, three days a week. Today: deadlifts and doubt. Did it anyway.' },
  { type:'avatar', who:'leo', name:'Daily Journaling', days:321, desc:'One page every night. Leo’s avatar levels up every 50 days.' },
  { type:'video', who:'arjun', name:'Couch to 5K', days:30, img:'img/f-2.jpg', desc:'Thirty days ago I couldn’t run for a minute straight. Today, 25 minutes.' },
  { type:'video', who:'ines', name:'10 Minutes of Stillness', days:140, img:'img/f-3.jpg', desc:'Ten minutes of breathing before my phone comes on.' },
  { type:'video', who:'max', name:'Write Before You Scroll', days:58, img:'img/f-4.jpg', desc:'Three lines in the notebook before I open any app.' },
];
const DISCOVER = [
  { id:'d1', name:'Quit Smoking', emoji:'🚭', kind:'quit', joined:1212034, img:'img/c-12.jpg', avg:38, blurb:'The big one. Partners check in nightly and cheer at 7, 30, 100 and 365 days.' },
  { id:'d2', name:'Couch to 5K', emoji:'🏃', kind:'build', joined:402110, img:'img/f-2.jpg', avg:27, blurb:'Three runs a week for nine weeks. Walk breaks allowed.' },
  { id:'d3', name:'10 Minutes of Stillness', emoji:'🧘', kind:'build', joined:288940, img:'img/f-3.jpg', avg:44, blurb:'Ten quiet minutes a day. Proof is a photo of where you sat.' },
  { id:'d4', name:'No Phone in Bed', emoji:'📵', kind:'quit', joined:651200, img:'img/c-14.jpg', avg:19, blurb:'The phone sleeps outside the bedroom. Read something instead.' },
  { id:'d5', name:'Strength x3', emoji:'🏋️', kind:'build', joined:190334, img:'img/c-7.jpg', avg:33, blurb:'Three strength sessions a week. Any gym, any weight.' },
  { id:'d6', name:'Real Breakfast', emoji:'🍳', kind:'build', joined:77021, img:'img/c-16.jpg', avg:21, blurb:'Something that isn’t coffee before 10am.' },
  { id:'d7', name:'Morning Pages', emoji:'✍️', kind:'build', joined:120554, img:'img/f-4.jpg', avg:52, blurb:'Three handwritten pages, first thing.' },
];
const TEMPLATES = [
  { name:'Duolingo Daily', emoji:'🦉', kind:'build', goal:100, desc:'One lesson a day. Checks in automatically when Duolingo is connected.', app:'duolingo', color:'#58cc02' },
  { name:'YouTube Under 1 Hour', emoji:'▶️', kind:'quit', goal:30, desc:'Keep YouTube under an hour a day. Uses Screen Time.', app:'youtube', color:'#ff3b3b' },
  { name:'Focus Playlist', emoji:'🎧', kind:'build', goal:30, desc:'Start a 25-minute focus session with your Spotify playlist.', app:'spotify', color:'#1db954' },
  { name:'Quit Smoking', emoji:'🚭', kind:'quit', goal:365, desc:'Not one cigarette. The most-joined streak on Steraka.', color:'#f7934c' },
  { name:'10k Steps', emoji:'👟', kind:'build', goal:30, desc:'10,000 steps a day, synced from Health.', app:'health', color:'#ff4f9a' },
  { name:'No Alcohol', emoji:'🧃', kind:'quit', goal:90, desc:'Alcohol-free days. Partners cheer every weekend survived.', color:'#7c86e0' },
];
const APPS = [
  { id:'spotify', name:'Spotify', c:'#1db954', l:'S' }, { id:'youtube', name:'YouTube', c:'#ff3b3b', l:'Y' },
  { id:'duolingo', name:'Duolingo', c:'#58cc02', l:'D' }, { id:'health', name:'Health', c:'#ff4f9a', l:'♥' },
  { id:'strava', name:'Strava', c:'#fc5200', l:'S' }, { id:'screentime', name:'Screen Time', c:'#7c86e0', l:'⏳' },
  { id:'calendar', name:'Calendar', c:'#3b82f6', l:'31' }, { id:'kindle', name:'Kindle', c:'#1a1a1a', l:'K' },
];
const MILESTONES = [3, 7, 14, 30, 50, 75, 100, 150, 200, 365, 500, 1000];
const COVER_RULES = [[/smok|cig|vape/,'img/c-12.jpg'],[/run|5k|jog|step/,'img/c-11.jpg'],[/read|book|page/,'img/c-14.jpg'],[/writ|journal|spanish|duolingo|language/,'img/c-15.jpg'],[/sugar|food|breakfast|eat|alcohol|water/,'img/c-16.jpg'],[/meditat|still|breath|calm/,'img/c-13.jpg'],[/phone|screen|youtube|scroll/,'img/f-4.jpg'],[/strength|gym|lift|push/,'img/c-7.jpg']];
const coverOf = s => s.cover || (COVER_RULES.find(([re]) => re.test(s.name.toLowerCase())) || [0, CAPS[[...s.name].reduce((a, c) => a + c.charCodeAt(0), 0) % CAPS.length]])[1];
const nextMilestone = d => MILESTONES.find(m => m > d) || d + 100;

/* ---------------- UI primitives ---------------- */
const view = $('#view');
const dock = $('#dock');
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}
function sheet(html, onMount) {
  const root = $('#sheetRoot');
  root.innerHTML = `<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  const close = () => {
    const sc = $('.scrim', root), sh = $('.sheet', root);
    if (!sh) return;
    sc.classList.add('closing'); sh.classList.add('closing');
    setTimeout(() => { root.innerHTML = ''; }, 280);
  };
  $('.scrim', root).onclick = close;
  root.querySelectorAll('[data-close]').forEach(b => b.onclick = close);
  onMount && onMount($('.sheet', root), close);
  return close;
}
const closeSheetNow = () => { $('#sheetRoot').innerHTML = ''; };
const topbar = (title, right = '<span class="spacer"></span>', backTo = '') =>
  `<div class="topbar"><button class="icon-btn" data-back="${backTo}" aria-label="Back">${ICON.back}</button><div class="title">${title}</div>${right}</div>`;
function wireBack(el) {
  $$('[data-back]', el).forEach(b => b.onclick = () => {
    const to = b.dataset.back;
    if (navCount > 0 && !to) history.back(); else go(to || '#/home');
  });
}
const go = h => { if (location.hash === h) route(); else location.hash = h; };

function openCreateSheet() {
  sheet(`<div class="h2" style="margin-bottom:4px">Start a streak</div><p class="p" style="margin-bottom:18px">Talk it through with Steraka AI, or set it up yourself.</p>
    <div class="pop2">
      <button data-go="#/magic"><span class="ico" style="background:linear-gradient(135deg,#f7934c,#ff4f9a)">${ICON.sparkle}</span><b>Steraka Magic</b><span>Describe the habit. AI drafts the streak.</span></button>
      <button data-go="#/new"><span class="ico" style="background:var(--peri)">${ICON.grid}</span><b>Custom Streak</b><span>Pick the goal, days, reminders and partners.</span></button>
    </div>
    <button class="btn ghost" style="margin-top:12px" data-go="#/home?tab=discover">Join a public streak</button>`, (el, close) => {
    $$('[data-go]', el).forEach(b => b.onclick = () => { S.draft = null; closeSheetNow(); go(b.dataset.go); });
  });
}
$('#dockAdd').onclick = openCreateSheet;

/* ---------------- router ---------------- */
let lastDepth = 0;
const DEPTH = { home:0, streaks:0, partners:0, profile:0, streak:1, discover:1, magic:1, new:1, edit:1, checkin:2, slip:2, capsule:2, analytics:2 };
function route() {
  const raw = location.hash.replace(/^#\/?/, '') || '';
  const [path, qs] = raw.split('?');
  const q = new URLSearchParams(qs || '');
  const parts = path.split('/').filter(Boolean);
  let name = parts[0] || '';
  if (!S.onboarded && name !== 'setup-pattern') name = 'welcome';
  else if (S.onboarded && !unlocked) name = 'lock';
  else if (!name || name === 'welcome' || (name === 'lock' && unlocked)) name = 'home';
  if (name === 'streak' && parts[2]) name = parts[2]; // capsule / analytics
  const R = ROUTES[name] || ROUTES.home;
  const depth = DEPTH[name] ?? 0;
  const dir = depth < lastDepth ? 'back' : 'enter';
  lastDepth = depth;
  closeSheetNow();
  $('.viewer')?.remove(); $('.celebrate')?.remove();
  const el = document.createElement('div');
  view.replaceChildren(el);
  R(el, parts, q);
  el.classList.add(...(el.className ? [] : ['screen']));
  el.classList.add(name === 'home' || name === 'lock' ? 'fade' : dir);
  const tabs = { home:'home', streaks:'streaks', partners:'partners', profile:'profile' };
  dock.hidden = !tabs[name];
  $$('#dock a').forEach(a => a.classList.toggle('on', a.dataset.tab === tabs[name]));
  $('#dockBadge').hidden = !unread();
  wireBack(el);
}
let navCount = 0;
window.addEventListener('hashchange', () => { navCount++; route(); });

/* ---------------- pattern pad ---------------- */
function patternPad(host, onDone) {
  host.innerHTML = `<svg class="lines" viewBox="0 0 264 264"><polyline fill="none" stroke="rgba(154,163,240,.9)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    Array.from({length:9}, (_, i) => `<div class="pd" data-i="${i}" style="left:${(i%3)*88}px;top:${Math.floor(i/3)*88}px"><i></i></div>`).join('');
  const line = $('polyline', host);
  const C = i => [(i % 3) * 88 + 44, Math.floor(i / 3) * 88 + 44];
  let seq = [], active = false, busy = false;
  const pos = e => { const r = host.getBoundingClientRect(); return [(e.clientX - r.left) * 264 / r.width, (e.clientY - r.top) * 264 / r.height]; };
  const add = i => {
    if (seq.includes(i)) return;
    if (seq.length) { // auto-include a skipped middle dot
      const a = seq[seq.length - 1], [ax, ay] = [a % 3, Math.floor(a / 3)], [bx, by] = [i % 3, Math.floor(i / 3)];
      if ((ax + bx) % 2 === 0 && (ay + by) % 2 === 0) { const m = ((ay + by) / 2) * 3 + (ax + bx) / 2; if (!seq.includes(m)) { seq.push(m); host.children[m + 1].classList.add('on'); } }
    }
    seq.push(i); host.children[i + 1].classList.add('on');
    navigator.vibrate?.(8);
  };
  const draw = p => { const pts = seq.map(C); if (p) pts.push(p); line.setAttribute('points', pts.map(x => x.join(',')).join(' ')); };
  const hit = ([x, y]) => { for (let i = 0; i < 9; i++) { const [cx, cy] = C(i); if ((x - cx) ** 2 + (y - cy) ** 2 < 32 ** 2) return i; } return -1; };
  host.onpointerdown = e => { if (busy) return; e.preventDefault(); host.setPointerCapture(e.pointerId); active = true; reset(); const h = hit(pos(e)); if (h >= 0) add(h); draw(pos(e)); };
  host.onpointermove = e => { if (!active) return; const p = pos(e); const h = hit(p); if (h >= 0) add(h); draw(p); };
  host.onpointerup = host.onpointercancel = () => { if (!active) return; active = false; draw(); if (seq.length) onDone(seq.slice(), result); };
  const reset = () => { seq = []; host.classList.remove('err', 'ok'); $$('.pd', host).forEach(d => d.classList.remove('on')); draw(); };
  const result = (state, keep = 700) => { busy = true; host.classList.add(state); setTimeout(() => { busy = false; reset(); }, keep); };
  return { reset };
}

/* ---------------- screens ---------------- */
const ROUTES = {};

ROUTES.welcome = el => {
  el.className = 'screen onb';
  el.innerHTML = `<div class="slides">
    <section class="slide s1"><div class="art"><div class="stackcards">
      <div class="sc"><b>Morning Run</b><small class="muted">22 days</small></div>
      <div class="sc"><b>Spanish</b><small class="muted">48 days</small></div>
      <div class="sc" style="align-items:center;justify-content:center;text-align:center">${fire(54,'flicker')}<div class="count" style="font-size:44px;margin-top:6px">102</div><b style="margin-top:auto">Quit Smoking</b></div>
    </div></div>
      <h2>Keep yourself<br><em>in check.</em></h2><p>Steraka turns the habits you’re quitting or building into streaks you can see, and that your people can see too.</p></section>
    <section class="slide s2"><div class="art"><div class="orbit"><div class="ring"></div><div class="center">${fire(44,'flicker')}</div>
      <img src="img/a-2.jpg" style="left:91px;top:-10px" alt=""><img src="img/a-1.jpg" style="right:-10px;top:91px" alt=""><img src="img/a-6.jpg" style="left:91px;bottom:-10px" alt=""><img src="img/a-3.jpg" style="left:-10px;top:91px" alt=""></div></div>
      <h2>Partners who<br><em>notice.</em></h2><p>Pick people to hold you to it. They get a nudge when you go quiet, and you get their fire when you don’t.</p></section>
    <section class="slide s3"><div class="art">${nethie('nethie" style="width:180px;height:180px;animation:bob 3.2s ease-in-out infinite')}</div>
      <h2>A private<br><em>space.</em></h2><p>Your Time Capsule, notes and slips stay behind a pattern only you know. Let’s set it up.</p></section>
  </div>
  <div class="ctrl"><div class="dots"><i class="on"></i><i></i><i></i></div><button class="btn white" id="onNext" style="width:auto;padding:0 26px;margin-left:auto">Next</button></div>`;
  const slides = $('.slides', el), dots = $$('.dots i', el), next = $('#onNext', el);
  const idx = () => Math.round(slides.scrollLeft / slides.clientWidth);
  slides.addEventListener('scroll', () => { const i = idx(); dots.forEach((d, k) => d.classList.toggle('on', k === i)); next.textContent = i === 2 ? 'Set my pattern' : 'Next'; }, { passive:true });
  next.onclick = () => { const i = idx(); if (i < 2) slides.scrollTo({ left: (i + 1) * slides.clientWidth, behavior:'smooth' }); else go('#/setup-pattern'); };
};

ROUTES['setup-pattern'] = (el, p, q) => {
  el.className = 'screen lock';
  const changing = S.onboarded;
  el.innerHTML = `<div style="position:absolute;top:calc(var(--safe-t) + 14px);left:20px">${changing ? `<button class="icon-btn" data-back="#/profile" aria-label="Back">${ICON.back}</button>` : ''}</div>
    ${nethie()}<h1>${changing ? 'New pattern' : 'Draw your pattern'}</h1><div class="sub" id="psub">Connect at least 4 dots.</div>
    <div class="pattern" id="pad"></div><div class="msg" id="pmsg"></div>
    <div class="foot"><div class="row">${ICON.lock}<span>Only stored on this device</span></div></div>`;
  let first = null;
  patternPad($('#pad', el), (seq, result) => {
    const msg = $('#pmsg', el), sub = $('#psub', el);
    if (!first) {
      if (seq.length < 4) { msg.textContent = 'Too short. Connect at least 4 dots.'; return result('err'); }
      first = seq.join(''); sub.textContent = 'Draw it again to confirm.'; msg.textContent = ''; result('ok', 450);
    } else if (seq.join('') === first) {
      S.pattern = first; S.onboarded = true; setUnlocked(true); save(); result('ok', 600);
      msg.textContent = 'Pattern saved.';
      setTimeout(() => { go(changing ? '#/profile' : '#/home'); toast(changing ? 'Pattern updated' : `Welcome in, ${S.name} 🔥`); }, 650);
    } else { first = null; sub.textContent = 'Connect at least 4 dots.'; msg.textContent = 'Didn’t match. Start again.'; result('err'); }
  });
};

ROUTES.lock = el => {
  el.className = 'screen lock';
  el.innerHTML = `${nethie()}<h1>${esc(S.name)}</h1><div class="sub">Is that you?</div>
    <div class="pattern" id="pad"></div><div class="msg" id="pmsg"></div>
    <div class="foot"><div class="row">${ICON.lock}<span>This is a private space</span></div><button id="forgot">Forgot pattern?</button></div>`;
  let tries = 0;
  patternPad($('#pad', el), (seq, result) => {
    if (seq.join('') === S.pattern) { result('ok', 500); setUnlocked(true); setTimeout(() => go('#/home'), 380); }
    else { tries++; $('#pmsg', el).textContent = tries >= 3 ? `Wrong pattern (${tries}). Take a breath and try again.` : 'Wrong pattern. Try again.'; result('err'); }
  });
  $('#forgot', el).onclick = () => sheet(`<div class="h2">Reset your pattern?</div><p class="p" style="margin:8px 0 18px">In the real app this verifies your email first. In this preview you can set a new pattern straight away. Your streaks stay put.</p>
    <button class="btn white" id="rp">Set a new pattern</button><button class="btn ghost" style="margin-top:10px" data-close>Cancel</button>`, (s, close) => {
      $('#rp', s).onclick = () => { closeSheetNow(); S.onboarded = false; save(); go('#/setup-pattern'); };
    });
};

/* ---- HOME: Mine / Explore / Discover ---- */
ROUTES.home = (el, p, q) => {
  el.className = 'screen home';
  const tab = q.get('tab') || 'mine';
  const totalToday = S.streaks.filter(s => s.checked).length;
  el.innerHTML = `<div class="homehead"><div class="between">
      <a class="pill" href="#/profile" aria-label="Profile">${nethie('av')}<span>${fire(14)} ${totalToday}/${S.streaks.length}</span></a>
      <a class="icon-btn" href="#/partners" aria-label="Accountability inbox">${ICON.bell}${unread() ? '<i class="dot"></i>' : ''}</a></div>
    <div class="tabs" role="tablist">${['mine','explore','discover'].map(t => `<button role="tab" data-t="${t}" class="${t === tab ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
    <div id="hbody"></div>`;
  $$('.tabs button', el).forEach(b => b.onclick = () => history.replaceState(null, '', '#/home?tab=' + b.dataset.t) || ROUTES.home(el, p, new URLSearchParams('tab=' + b.dataset.t)) || wireBack(el));
  const body = $('#hbody', el);
  if (tab === 'discover') return renderDiscover(body);
  const posts = tab === 'mine' ? S.streaks.map(s => ({ type:'mine', s })) : EXPLORE;
  body.innerHTML = `<div class="feed">${posts.map((x, i) => postHTML(x, i)).join('')}</div>`;
  const feed = $('.feed', body);
  $$('.post', feed).forEach(post => {
    const pb = $('.playbtn', post);
    if (pb) post.addEventListener('click', e => { if (e.target.closest('.actions,a')) return; post.classList.toggle('playing'); });
  });
  const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) en.target.classList.remove('playing'); }), { root: feed, threshold: .4 });
  $$('.post', feed).forEach(x => io.observe(x));
  $$('[data-cheer]', feed).forEach(b => b.onclick = e => {
    e.stopPropagation(); const k = b.dataset.cheer; S.cheered[k] = !S.cheered[k]; save();
    b.classList.toggle('on', !!S.cheered[k]); const sm = b.nextElementSibling; const base = +sm.dataset.base; sm.textContent = fmt(base + (S.cheered[k] ? 1 : 0));
    if (S.cheered[k]) { burst(b); toast(`Sent fire to ${PEOPLE[EXPLORE[+k].who].name}`); }
  });
};
function postHTML(x, i) {
  if (x.type === 'mine') {
    const s = x.s;
    return `<article class="post text">
      <div class="quote"><div class="q">${s.kind === 'quit' ? 'Why I’m quitting' : 'Why I’m doing this'}</div>
      <div class="lead">“${esc(s.why)}”</div>
      <div class="src"><em>${s.emoji} ${esc(s.name)}</em> – ${esc(S.name)} <span>|</span> since ${s.created}</div></div>
      <div class="meta"><div class="count num">${s.days}${fire(30)}</div><div class="name">${esc(s.name)}</div><div class="desc">${esc(s.desc)}</div>
      <div class="by">${s.checked ? `<span style="color:var(--green);font-weight:700">✓ Checked in today</span>` : `<span>Next milestone: ${nextMilestone(s.days)} days</span>`}</div></div>
      <div class="actions"><a class="roundfire ${s.checked ? 'on' : ''}" href="${s.checked ? '#/streak/' + s.id : '#/checkin/' + s.id}" aria-label="${s.checked ? 'View streak' : 'Check in'}">${fire(26)}</a><small>${s.checked ? 'Done' : 'Check in'}</small></div>
    </article>`;
  }
  const who = PEOPLE[x.who], cheered = !!S.cheered[i], base = Math.round(x.days * 37 + 120);
  const meta = `<div class="meta"><div class="count num">${x.days}${fire(30)}</div><div class="name">${esc(x.name)}</div><div class="desc">${esc(x.desc)}</div>
    <div class="by"><img class="av" src="${who.img}" alt="">${who.name}<span class="dim">· partner streak</span></div></div>
    <div class="actions"><button class="roundfire ${cheered ? 'on' : ''}" data-cheer="${i}" aria-label="Send fire">${fire(26)}</button><small data-base="${base}">${fmt(base + (cheered ? 1 : 0))}</small></div>`;
  if (x.type === 'text') return `<article class="post text"><div class="quote"><div class="q">${x.pre}</div><div class="big">${x.big}</div><div class="lead">${x.lead}</div><div class="lead2">${x.lead2}</div><div class="src"><em>${x.src}</em> – ${who.name} <span>|</span> ${esc(x.name)}</div></div>${meta}</article>`;
  if (x.type === 'avatar') return `<article class="post avatar" style="background:radial-gradient(360px 300px at 50% 35%,#2b2a8a,transparent 70%),var(--bg)"><div class="stage">${nethie('nethie', 300)}</div>${meta}</article>`;
  return `<article class="post video"><div class="bg"><img src="${x.img}" alt="" loading="lazy"></div><div class="prog"><i></i></div><div class="playbtn">${ICON.play}</div>${meta}</article>`;
}
function renderDiscover(body) {
  body.innerHTML = `<div class="discover"><label class="search" style="background:rgba(255,255,255,.08);margin:0 0 16px">${ICON.search}<input id="dq" placeholder="Search public streaks" autocomplete="off"></label><div class="dgrid" id="dg"></div></div>`;
  const draw = f => {
    const list = DISCOVER.filter(d => d.name.toLowerCase().includes(f));
    $('#dg', body).innerHTML = list.length ? list.map((d, i) => `<a class="dcard ${i === 0 && !f ? 'big' : ''} reveal" style="animation-delay:${i * 50}ms" href="#/discover/${d.id}"><img src="${d.img}" alt="" loading="lazy"><b>${d.emoji} ${esc(d.name)}</b><small>${fmt(d.joined)} partners · avg ${d.avg}${'🔥'}</small></a>`).join('') : `<div class="empty" style="grid-column:span 2">Nothing yet. <a href="#/magic" style="color:var(--peri2);font-weight:700">Ask Steraka AI</a> to make it.</div>`;
  };
  draw(''); $('#dq', body).oninput = e => draw(e.target.value.trim().toLowerCase());
}

/* ---- MY STREAKS carousel ---- */
ROUTES.streaks = el => {
  el.className = 'screen carousel-screen';
  const done = S.streaks.filter(s => s.checked).length;
  el.innerHTML = `<div class="head"><div class="between"><a class="icon-btn" href="#/profile" aria-label="Settings">${ICON.gear}</a><div class="h3">My Streaks</div><a class="icon-btn" href="#/partners" aria-label="Inbox">${ICON.bell}${unread() ? '<i class="dot"></i>' : ''}</a></div>
    <label class="search">${ICON.search}<input id="sq" placeholder="Search your streaks" autocomplete="off"></label></div>
    <div class="track" id="track"></div><div class="dots" id="cdots"></div>
    <div class="carousel-foot"><div class="today"><b>${done} of ${S.streaks.length}</b>checked in today</div><button class="icon-btn light" id="cadd" aria-label="New streak">${ICON.plus}</button></div>`;
  const track = $('#track', el), dots = $('#cdots', el);
  const draw = f => {
    const list = S.streaks.filter(s => s.name.toLowerCase().includes(f));
    track.innerHTML = list.map(s => `<a class="scard" href="#/streak/${s.id}"><span class="cover"><img src="${coverOf(s)}" alt="" loading="lazy"></span><span class="tag">${s.kind === 'quit' ? 'Quitting' : 'Building'}</span>${s.checked ? `<span class="done">${ICON.check}</span>` : ''}
      ${fire(44, 'flicker')}<div class="count">${s.days}</div><div class="nm">${esc(s.name)}</div><div class="ds">${esc(s.desc)}</div></a>`).join('') +
      `<button class="scard add" id="addCard">${fire(30)}<b>New streak</b><span class="sm muted">What are you holding yourself to next?</span></button>`;
    dots.innerHTML = list.concat([0]).map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
    $('#addCard', el).onclick = openCreateSheet;
    sync();
  };
  const sync = () => {
    const cards = $$('.scard', track), mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bd = 1e9;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
    cards.forEach((c, i) => c.classList.toggle('side', i !== best));
    $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === best));
  };
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive:true });
  $('#sq', el).oninput = e => draw(e.target.value.trim().toLowerCase());
  $('#cadd', el).onclick = openCreateSheet;
  draw('');
};

/* ---- STREAK STATS ---- */
function weekRow(s) {
  // rolling last 7 days, today on the right
  const days = Array.from({length:7}, (_, k) => 6 - k);
  return `<div class="weekgrid">${days.map(b => `<div class="wd">${'SMTWTFS'[daysAgo(b).getDay()]}</div>`).join('')}${days.map(b => {
    const v = s.history[b];
    const cls = (v > 0 ? 'y' : v === -2 ? 'f' : v === -1 ? 'n' : '') + (b === 0 ? ' t' : '');
    const lab = v > 0 ? '✓' : v === -2 ? '❄' : v === -1 ? '✕' : (b === 0 ? '·' : '');
    return `<div class="c ${cls}">${lab}</div>`;
  }).join('')}</div>`;
}
ROUTES.streak = (el, p) => {
  const s = getS(p[1]); if (!s) return ROUTES.streaks(el);
  el.className = 'screen stats';
  const ps = s.partners.map(id => PEOPLE[id]);
  el.innerHTML = `${topbar('', `<button class="icon-btn" id="smore" aria-label="More">${ICON.more}</button>`, '#/streaks')}
    <div class="hero">${fire(110, 'flicker')}</div>
    <div class="count bigcount reveal">${s.days}${fire(34)}</div>
    <div class="h2" style="margin-top:2px">${esc(s.name)}</div>
    <p class="p" style="margin-top:6px">${esc(s.desc)}</p>
    <div class="statrow"><div><b>${s.best}</b><span>Best</span></div><div><b>${fmt(s.joined)}</b><span>Partners on this streak</span></div><div><b>${s.goal}</b><span>Goal</span></div></div>
    ${s.checked
      ? `<div class="checkin-banner done">${fire(34)}<div style="flex:1"><b>Checked in today</b><span>Next milestone: ${nextMilestone(s.days)} days, ${nextMilestone(s.days) - s.days} to go.</span></div></div>`
      : `<a class="checkin-banner" href="#/checkin/${s.id}">${fire(34, 'flicker')}<div style="flex:1"><b>${s.kind === 'quit' ? 'Still clean today?' : 'Done it today?'}</b><span>Check in with a photo for your Time Capsule.</span></div>${ICON.chev}</a>`}
    ${s.capsule.length ? `<a class="capsule-strip" href="#/streak/${s.id}/capsule"><img src="${s.capsule[0].img}" alt=""><span class="lbl">Time Capsule · ${s.capsule.length}</span>
      <span class="thumbs">${s.capsule.slice(1, 3).map(c => `<img src="${c.img}" alt="">`).join('')}<span class="fb">${fire(18)}</span></span></a>`
      : `<div class="capsule-strip empty"><div style="text-align:center">${fire(26)}<div class="sm muted" style="margin-top:6px">Time Capsule: your first check-in photo lands here</div></div></div>`}
    <div class="section-h"><h3>Last 7 days</h3><span class="xs dim">${s.week.filter(Boolean).length === 7 ? 'Every day' : s.week.filter(Boolean).length + ' days a week'}</span></div>
    ${weekRow(s)}
    <div class="section-h"><h3>Your partners</h3><a href="#/partners?tab=partners">Manage</a></div>
    ${ps.length ? `<div class="card flat" style="padding:4px 14px">${s.partners.map(id => { const pl = S.partnersList.find(x => x.id === id); return `<div class="partner"><img class="av" src="${PEOPLE[id].img}" alt=""><div class="t"><b>${PEOPLE[id].name}</b><span><i class="status-dot" style="background:${pl?.checked ? 'var(--green)' : 'var(--dim)'}"></i>${pl?.checked ? 'Checked in today' : 'Not yet today'}</span></div></div>`; }).join('')}</div>`
      : `<div class="card flat between"><span class="sm muted">No partners yet. Streaks with partners last 2.4× longer.</span><a class="btn sm white" href="#/partners?tab=partners">Add</a></div>`}
    <div class="xs dim" style="margin-top:16px;display:flex;align-items:center;gap:6px">${nethie('av" style="width:20px;height:20px')}Created by ${esc(S.name)} · ${s.created}</div>
    <a class="btn primary" style="margin-top:20px" href="#/streak/${s.id}/analytics">Load Analytics</a>
    ${!s.checked ? `<a class="btn ghost" style="margin-top:10px;color:var(--muted)" href="#/slip/${s.id}">I slipped</a>` : ''}`;
  $('#smore', el).onclick = () => sheet(`<div class="list">
      <a class="li" href="#/edit/${s.id}"><span class="t"><b>Edit streak</b><span>Name, goal, days, reminders, partners</span></span>${ICON.chev}</a>
      <a class="li" href="#/streak/${s.id}/capsule"><span class="t"><b>Time Capsule</b><span>${s.capsule.length} moments</span></span>${ICON.chev}</a>
      <a class="li" href="#/slip/${s.id}"><span class="t"><b>Log a slip</b><span>Use a freeze or restart honestly</span></span>${ICON.chev}</a>
      <button class="li" id="shr"><span class="t"><b>Share progress</b><span>Send your count to partners</span></span>${ICON.chev}</button>
    </div><button class="btn danger" style="margin-top:14px" id="del">Delete streak</button>`, (sh, close) => {
      $$('a', sh).forEach(a => a.addEventListener('click', closeSheetNow));
      $('#shr', sh).onclick = () => { close(); toast(`Shared ${s.days} days with your partners`); };
      $('#del', sh).onclick = () => {
        $('#del', sh).outerHTML = `<p class="p" style="margin:14px 0 10px">Delete <b>${esc(s.name)}</b> and its ${s.capsule.length} Time Capsule photos? This can’t be undone.</p><button class="btn danger" id="del2">Yes, delete it</button>`;
        $('#del2', sh).onclick = () => { S.streaks = S.streaks.filter(x => x !== s); save(); closeSheetNow(); go('#/streaks'); toast('Streak deleted'); };
      };
    });
};

/* ---- TIME CAPSULE ---- */
ROUTES.capsule = (el, p) => {
  const s = getS(p[1]); if (!s) return ROUTES.streaks(el);
  el.innerHTML = `${topbar('Time Capsule', `<a class="icon-btn" href="#/checkin/${s.id}" aria-label="Add">${ICON.plus}</a>`)}
    <div class="between" style="margin-bottom:14px"><div><div class="h3">${esc(s.name)}</div><div class="xs dim">${s.capsule.length} moments · tap to open</div></div><div class="count" style="font-size:26px">${s.days}${fire(20)}</div></div>
    ${s.capsule.length ? `<div class="tcgrid">${s.capsule.map((c, i) => `<button class="tc reveal" style="animation-delay:${i * 40}ms" data-i="${i}">${c.note ? `<span class="note">${esc(c.note)}</span>` : ''}<img src="${c.img}" alt="" loading="lazy"><span class="ts">${c.t}<span>${c.d}</span></span><span class="day">Day ${c.day}</span></button>`).join('')}</div>`
      : `<div class="empty">${fire(40)}<p style="margin-top:10px">Nothing in the capsule yet. Your first check-in photo goes here.</p></div>`}`;
  $$('.tc', el).forEach(b => b.onclick = () => {
    const c = s.capsule[+b.dataset.i];
    const v = document.createElement('div'); v.className = 'viewer';
    v.innerHTML = `<div class="topbar" style="padding:calc(var(--safe-t) + 14px) 20px 0"><span class="spacer"></span><div class="title">Day ${c.day} · ${c.d}, ${c.t}</div><button class="icon-btn" aria-label="Close">${ICON.close}</button></div><img src="${c.img}" alt=""><div class="vfoot"><p class="p">${esc(c.note || 'No note.')}</p></div>`;
    $('button', v).onclick = () => v.remove();
    $('#app').appendChild(v);
  });
};

/* ---- ANALYTICS ---- */
ROUTES.analytics = (el, p, q) => {
  const s = getS(p[1]); if (!s) return ROUTES.streaks(el);
  const range = q.get('r') || '30';
  const n = +range;
  const win = s.history.slice(0, n);
  const tracked = win.filter(v => v !== 0);
  const done = win.filter(v => v > 0).length, slips = win.filter(v => v === -1).length, frz = win.filter(v => v === -2).length;
  const rate = tracked.length ? Math.round((done + frz) / tracked.length * 100) : 0;
  const prog = clamp(s.days / s.goal, 0, 1);
  const weeks = 12, cells = [];
  const dow = (now().getDay() + 6) % 7;
  for (let w = weeks - 1; w >= 0; w--) for (let d = 0; d < 7; d++) {
    const back = w * 7 + (dow - d);
    if (back < 0) { cells.push('<i style="opacity:0"></i>'); continue; }
    const v = s.history[back];
    cells.push(`<i class="${v === -1 ? 'miss' : v === -2 ? 'frz' : v > 0 ? 'l' + v : ''}" title="${mdate(daysAgo(back))}"></i>`);
  }
  const bars = Array.from({length:8}, (_, k) => { const w = 7 - k; const sl = s.history.slice(w * 7, w * 7 + 7); return sl.filter(v => v > 0).length; });
  const C = 2 * Math.PI * 45;
  el.innerHTML = `${topbar('Analytics')}
    <div class="between"><div><div class="h2">${esc(s.name)}</div><div class="sm muted" style="margin-top:2px">${fmt(s.joined)} partners · ${s.days} days</div></div>${fire(36,'flicker')}</div>
    <div class="chips" style="margin-top:16px">${[['7','1W'],['30','1M'],['90','3M'],['365','1Y']].map(([v, l]) => `<button class="chip ${v === range ? 'on' : ''}" data-r="${v}">${l}</button>`).join('')}</div>
    <div class="card flat" style="margin-top:16px;display:flex;align-items:center;gap:18px">
      <div class="ring"><svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="45" stroke="rgba(124,134,224,.18)"/><circle cx="55" cy="55" r="45" stroke="url(#fOuter)" stroke-dasharray="${C}" stroke-dashoffset="${C}" id="ringArc" style="transition:stroke-dashoffset 1.1s var(--ease)"/></svg><div class="v"><div><b>${Math.round(prog * 100)}%</b><span>of goal</span></div></div></div>
      <div><div class="h3">${s.goal - s.days > 0 ? `${s.goal - s.days} days to your goal` : 'Goal reached 🎉'}</div><p class="sm muted" style="margin-top:4px;line-height:1.45">${s.days} of ${s.goal} days. Next milestone at ${nextMilestone(s.days)}.</p></div></div>
    <div class="kpis" style="margin-top:10px">
      <div class="kpi"><b>${rate}%</b><span>Success rate</span></div><div class="kpi"><b>${done}</b><span>Check-ins</span></div>
      <div class="kpi"><b>${slips}</b><span>Slips</span></div><div class="kpi"><b>${frz}</b><span>Freezes used</span></div></div>
    <div class="section-h"><h3>Last 12 weeks</h3></div>
    <div class="heat">${cells.join('')}</div>
    <div class="legend" style="margin-top:10px"><span><i style="background:var(--orange)"></i>Checked in</span><span><i style="background:rgba(124,200,255,.4)"></i>Freeze</span><span><i style="background:rgba(255,107,107,.3)"></i>Slip</span><span><i style="background:rgba(124,134,224,.12)"></i>Not tracked</span></div>
    <div class="section-h"><h3>Check-ins per week</h3><span class="xs dim">last 8 weeks</span></div>
    <div class="bars">${bars.map((b, i) => `<div><div class="b ${i === 7 ? 'hi' : ''}" style="height:${Math.max(4, b / 7 * 100)}%;animation-delay:${i * 60}ms"></div><small>${i === 7 ? 'Now' : 'W' + (i + 1)}</small></div>`).join('')}</div>
    <div class="section-h"><h3>Insight</h3></div>
    <div class="card" style="display:flex;gap:12px">${nethie('av')}<p class="sm" style="line-height:1.5;color:#dfe3ff">${slips ? `Your slips cluster on <b>weekends</b>. Set a Friday-evening reminder and tell a partner your plan.` : `No slips in this window. Your steadiest check-in time is around <b>${s.reminder}</b>, so keep the reminder there.`}</p></div>`;
  $$('[data-r]', el).forEach(b => b.onclick = () => { history.replaceState(null, '', `#/streak/${s.id}/analytics?r=${b.dataset.r}`); ROUTES.analytics(el, p, new URLSearchParams('r=' + b.dataset.r)); wireBack(el); });
  requestAnimationFrame(() => requestAnimationFrame(() => { const a = $('#ringArc', el); if (a) a.style.strokeDashoffset = C * (1 - prog); }));
};

/* ---- CHECK-IN ---- */
ROUTES.checkin = (el, p) => {
  const s = getS(p[1]); if (!s) return ROUTES.streaks(el);
  if (s.checked) { setTimeout(() => go('#/streak/' + s.id)); return; }
  let photo = null, mood = null;
  const moods = [['😣','Rough'],['😕','Meh'],['🙂','Okay'],['😄','Good'],['🔥','On fire']];
  el.innerHTML = `${topbar('Check in')}
    <div class="between"><div><div class="h2">${s.kind === 'quit' ? 'Still clean today?' : 'Did it today?'}</div><div class="sm muted" style="margin-top:4px">${esc(s.name)} · day ${s.days + 1}</div></div>${fire(40,'flicker')}</div>
    <div class="stack" style="margin-top:18px">
      <label class="photo-drop" id="drop"><input type="file" accept="image/*" capture="environment" hidden id="file">
        <div class="ph"><span class="cam">${ICON.cam}</span><b style="color:#fff">Add today’s proof</b><span>A photo for your Time Capsule</span></div></label>
      <div class="label">Or pick a sample</div>
      <div class="samples">${CAPS.slice(0, 10).map(c => `<img src="${c}" alt="" data-src="${c}">`).join('')}</div>
      <div class="label" style="margin-top:20px">How did it feel?</div>
      <div class="moods">${moods.map(([e, l], i) => `<button data-m="${i}">${e}<small>${l}</small></button>`).join('')}</div>
      <div class="label" style="margin-top:20px">Note to future you</div>
      <textarea class="textarea" id="note" maxlength="140" placeholder="${s.kind === 'quit' ? 'Craving at lunch. Walked it off…' : 'What did you do?'}"></textarea>
    </div>
    <button class="btn hot" id="go" style="margin-top:22px">${fire(20)} Log day ${s.days + 1}</button>
    <a class="btn ghost" style="margin-top:10px;color:var(--muted)" href="#/slip/${s.id}">Actually, I slipped</a>`;
  const drop = $('#drop', el);
  const setPhoto = src => {
    photo = src;
    drop.querySelector('img')?.remove();
    const im = document.createElement('img'); im.src = src; im.alt = ''; drop.appendChild(im);
    $('.ph', drop).hidden = true;
    let st = $('.stamp', drop); if (!st) { st = document.createElement('span'); st.className = 'stamp'; drop.appendChild(st); }
    st.textContent = `${hhmm(now())} · ${mdate(now())}`;
  };
  $('#file', el).onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => {
      const k = Math.min(1, 720 / Math.max(im.width, im.height)); const c = document.createElement('canvas');
      c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      setPhoto(c.toDataURL('image/jpeg', .72)); $$('.samples img', el).forEach(x => x.classList.remove('on'));
    }; im.src = r.result; };
    r.readAsDataURL(f);
  };
  $$('.samples img', el).forEach(im => im.onclick = () => { $$('.samples img', el).forEach(x => x.classList.toggle('on', x === im)); setPhoto(im.dataset.src); });
  $$('.moods button', el).forEach(b => b.onclick = () => { mood = +b.dataset.m; $$('.moods button', el).forEach(x => x.classList.toggle('on', x === b)); });
  $('#go', el).onclick = () => {
    const before = s.days;
    s.days++; s.best = Math.max(s.best, s.days); s.checked = true; s.history[0] = mood === null ? 2 : clamp(Math.ceil((mood + 1) / 2), 1, 3);
    const d = now();
    s.capsule.unshift({ img: photo || CAPS[s.days % CAPS.length], t: hhmm(d), d: mdate(d), day: s.days, note: $('#note', el).value.trim() });
    S.inbox.forEach(i => { if (i.type === 'nudge' && i.streak === s.id) i.unread = false; });
    save();
    celebrate(s, before);
  };
};
function celebrate(s, before) {
  const m = MILESTONES.includes(s.days);
  const c = document.createElement('div'); c.className = 'celebrate';
  c.innerHTML = `${fire(150, 'flicker')}<div class="cn" id="cn">${before}</div><h2>${m ? `${s.days} days. Milestone!` : `Day ${s.days}. Locked in.`}</h2>
    <p>${m ? `Your partners will see this one. ${s.kind === 'quit' ? 'Look how far “never again” has come.' : 'This is becoming who you are.'}` : `${nextMilestone(s.days) - s.days} more to ${nextMilestone(s.days)}. Your photo went into the Time Capsule.`}</p>
    <span class="milestone">${fire(16)} Best: ${s.best} days</span>
    <div class="btns"><button class="btn white" id="cshare">${ICON.share} Share with partners</button><button class="btn ghost" id="cdone">Done</button></div>`;
  $('#app').appendChild(c);
  setTimeout(() => { const cn = $('#cn', c); cn.textContent = s.days; cn.classList.add('bump'); burst(cn, 34); navigator.vibrate?.([20, 40, 20]); }, 650);
  $('#cshare', c).onclick = () => { toast(`${s.partners.length || 'No'} partner${s.partners.length === 1 ? '' : 's'} notified`); };
  $('#cdone', c).onclick = () => { c.remove(); go('#/streak/' + s.id); };
}
function burst(anchor, n = 16) {
  const app = $('#app'), r = anchor.getBoundingClientRect(), a = app.getBoundingClientRect();
  const cols = ['#ffb347', '#ff6a2b', '#ff4f9a', '#fff3b0', '#9aa3f0'];
  for (let i = 0; i < n; i++) {
    const sp = document.createElement('i'); sp.className = 'spark';
    const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 110;
    sp.style.cssText = `left:${r.left - a.left + r.width / 2}px;top:${r.top - a.top + r.height / 2}px;background:${cols[i % cols.length]};--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 40}px;--r:${Math.random() * 540}deg;z-index:95`;
    app.appendChild(sp); setTimeout(() => sp.remove(), 1500);
  }
}

/* ---- SLIP / RELAPSE ---- */
ROUTES.slip = (el, p) => {
  const s = getS(p[1]); if (!s) return ROUTES.streaks(el);
  let choice = S.freezes > 0 ? 'freeze' : 'restart', trig = new Set(), notify = true;
  el.innerHTML = `${topbar('Log a slip')}
    <div class="slip-hero">${ember}<div class="h2" style="margin-top:10px">It happens. Be honest.</div>
    <p class="p" style="margin:8px auto 0;max-width:300px">That’s the whole point of Steraka. One slip doesn’t erase ${s.days} days, and your best of ${s.best} stays on the record.</p></div>
    <div class="stack" style="margin-top:22px">
      <button class="option ${choice === 'freeze' ? 'on' : ''}" data-c="freeze" ${S.freezes ? '' : 'disabled style="opacity:.45"'}><span class="ic" style="background:rgba(124,200,255,.18)">❄️</span><div><b>Use a streak freeze</b><span>Keep your ${s.days} days. ${S.freezes} of 2 left; you earn one back every 30 clean days.</span></div><i class="radio"></i></button>
      <button class="option ${choice === 'restart' ? 'on' : ''}" data-c="restart"><span class="ic" style="background:rgba(255,107,107,.15)">↺</span><div><b>Restart from day 0</b><span>A clean slate today. Your best streak is kept.</span></div><i class="radio"></i></button>
    </div>
    <div class="label" style="margin-top:24px">What set it off?</div>
    <div class="chips" style="margin-top:10px" id="trig">${['Stress','Social','Boredom','Tired','Celebration','Habit cue'].map(t => `<button class="chip" data-t="${t}">${t}</button>`).join('')}</div>
    <div class="label" style="margin-top:20px">What will you do differently?</div>
    <textarea class="textarea" style="margin-top:8px" placeholder="Leave the party before the smoking break…" id="plan"></textarea>
    <div class="card flat between" style="margin-top:14px"><div><b class="sm">Tell my partners</b><div class="xs dim" style="margin-top:2px">${s.partners.length ? s.partners.map(id => PEOPLE[id].name).join(', ') : 'No partners on this streak'}</div></div><button class="toggle on" id="ntf" aria-label="Notify partners"></button></div>
    <button class="btn white" style="margin-top:20px" id="conf">Confirm</button>`;
  $$('.option', el).forEach(o => o.onclick = () => { if (o.disabled) return; choice = o.dataset.c; $$('.option', el).forEach(x => x.classList.toggle('on', x === o)); });
  $$('#trig .chip', el).forEach(c => c.onclick = () => { c.classList.toggle('on'); trig.has(c.dataset.t) ? trig.delete(c.dataset.t) : trig.add(c.dataset.t); });
  $('#ntf', el).onclick = e => { notify = !notify; e.currentTarget.classList.toggle('on', notify); };
  $('#conf', el).onclick = () => {
    if (choice === 'freeze') { S.freezes--; s.history[0] = -2; s.checked = true; toast(`Freeze used. ${s.days} days kept ❄️`); }
    else { s.history[0] = -1; s.days = 0; s.checked = true; toast(`Day 0 is still a day. Best of ${s.best} kept.`); }
    save(); go('#/streak/' + s.id);
  };
};

/* ---- CREATE / EDIT ---- */
function streakForm(el, existing) {
  const d = existing ? { ...existing } : Object.assign({ name:'', kind:'build', emoji:'🔥', why:'', desc:'', goal:30, week:[1,1,1,1,1,1,1], reminder:'08:00', partners:[], public:true }, S.draft || {});
  const EM = ['🔥','🚭','🏃','📚','🧘','💧','🍩','📵','🗣️','🏋️','✍️','🧃','🎧','🌙'];
  const partnerIds = S.partnersList.map(x => x.id);
  el.innerHTML = `${topbar(existing ? 'Edit streak' : 'Custom Streak')}
    <div class="preview-card" id="prev"></div>
    <div class="gap16" style="margin-top:22px">
      <div class="seg" id="kind"><button data-k="quit">Quitting</button><button data-k="build">Building</button></div>
      <label class="field"><span class="label">Name</span><input class="input" id="fname" maxlength="28" placeholder="e.g. Quit Smoking" value="${esc(d.name)}"></label>
      <div class="field"><span class="label">Icon</span><div class="emojis">${EM.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div></div>
      <label class="field"><span class="label">Why does this matter?</span><textarea class="textarea" id="fwhy" maxlength="140" placeholder="This shows on your home feed when you need it.">${esc(d.why)}</textarea></label>
      <label class="field"><span class="label">The rule</span><input class="input" id="fdesc" maxlength="90" placeholder="What counts as a successful day?" value="${esc(d.desc)}"></label>
      <div class="field"><span class="label">Goal</span><div class="stepper"><button id="gm" aria-label="Fewer days">−</button><b id="gv"></b><button id="gp" aria-label="More days">+</button></div>
        <div class="chips" style="margin-top:10px">${[7,30,90,365].map(g => `<button class="chip" data-g="${g}">${g} days</button>`).join('')}</div></div>
      <div class="field"><span class="label">Check-in days</span><div class="days7" id="wk">${WD.map((w, i) => `<button data-i="${i}">${w}</button>`).join('')}</div></div>
      <label class="field"><span class="label">Reminder</span><input class="input" type="time" id="frem" value="${d.reminder}"></label>
      <div class="field"><span class="label">Accountability partners</span><div class="row" style="flex-wrap:wrap;gap:12px" id="pp">${partnerIds.map(id => `<button class="av-wrap" data-p="${id}" style="text-align:center;font-size:11.5px;color:var(--muted);transition:opacity .2s"><img class="av lg" src="${PEOPLE[id].img}" alt="" style="border:2px solid transparent;transition:border-color .2s"><div style="margin-top:4px">${PEOPLE[id].name}</div></button>`).join('')}</div></div>
      <div class="card flat between"><div><b class="sm">Public streak</b><div class="xs dim" style="margin-top:2px">Others can join and you’ll see the partner count</div></div><button class="toggle" id="fpub" aria-label="Public"></button></div>
    </div>
    <button class="btn hot" id="fsave" style="margin-top:22px">${existing ? 'Save changes' : 'Start streak'}</button>`;
  const prev = $('#prev', el);
  const paint = () => {
    $$('#kind button', el).forEach(b => b.classList.toggle('on', b.dataset.k === d.kind));
    $$('.emojis button', el).forEach(b => b.classList.toggle('on', b.dataset.e === d.emoji));
    $('#gv', el).innerHTML = `${d.goal}<small>days</small>`;
    $$('[data-g]', el).forEach(b => b.classList.toggle('on', +b.dataset.g === d.goal));
    $$('#wk button', el).forEach(b => b.classList.toggle('on', !!d.week[+b.dataset.i]));
    $$('#pp [data-p]', el).forEach(b => { const on = d.partners.includes(b.dataset.p); b.style.opacity = on ? 1 : .55; $('img', b).style.borderColor = on ? '#fff' : 'transparent'; });
    $('#fpub', el).classList.toggle('on', d.public);
    prev.innerHTML = `<div class="between"><div class="nm">${d.emoji} ${esc(d.name || 'Your streak')}</div><span class="heart" style="width:20px;height:20px">${ICON.heart}</span></div>
      <p class="sm muted" style="margin-top:6px;line-height:1.45;min-height:19px">${esc(d.desc || d.why || 'Describe the rule for a successful day.')}</p>
      <div class="xs dim" style="margin-top:12px">Goal</div><div class="h3">${d.goal} days</div>
      <div class="xs dim" style="margin-top:10px">Check-in days</div><div class="weekgrid" style="margin-top:6px">${WD.map((w, i) => `<div class="c ${d.week[i] ? 'y' : ''}">${w}</div>`).join('')}</div>
      <div class="between" style="margin-top:12px"><div class="avs">${d.partners.length ? d.partners.map(id => `<img class="av" src="${PEOPLE[id].img}" alt="">`).join('') : '<span class="xs dim">No partners yet</span>'}</div><span class="xs dim">⏰ ${d.reminder}</span></div>
      <div class="xs dim" style="margin-top:12px;display:flex;align-items:center;gap:6px">${nethie('av" style="width:18px;height:18px')}Created by ${esc(S.name)}</div>`;
  };
  $$('#kind button', el).forEach(b => b.onclick = () => { d.kind = b.dataset.k; paint(); });
  $$('.emojis button', el).forEach(b => b.onclick = () => { d.emoji = b.dataset.e; paint(); });
  $('#fname', el).oninput = e => { d.name = e.target.value; paint(); };
  $('#fwhy', el).oninput = e => { d.why = e.target.value; paint(); };
  $('#fdesc', el).oninput = e => { d.desc = e.target.value; paint(); };
  $('#gm', el).onclick = () => { d.goal = Math.max(3, d.goal - (d.goal > 30 ? 10 : 1)); paint(); };
  $('#gp', el).onclick = () => { d.goal = Math.min(1000, d.goal + (d.goal >= 30 ? 10 : 1)); paint(); };
  $$('[data-g]', el).forEach(b => b.onclick = () => { d.goal = +b.dataset.g; paint(); });
  $$('#wk button', el).forEach(b => b.onclick = () => { const i = +b.dataset.i; d.week = d.week.slice(); d.week[i] = d.week[i] ? 0 : 1; if (!d.week.some(Boolean)) d.week[i] = 1; paint(); });
  $('#frem', el).oninput = e => { d.reminder = e.target.value; paint(); };
  $$('#pp [data-p]', el).forEach(b => b.onclick = () => { const id = b.dataset.p; d.partners = d.partners.includes(id) ? d.partners.filter(x => x !== id) : [...d.partners, id]; paint(); });
  $('#fpub', el).onclick = () => { d.public = !d.public; paint(); };
  $('#fsave', el).onclick = () => {
    if (!d.name.trim()) { $('#fname', el).focus(); $('#fname', el).style.borderColor = 'var(--red)'; toast('Give your streak a name'); return; }
    if (!d.desc.trim()) d.desc = d.kind === 'quit' ? `Not once. ${d.goal} days to start.` : `Every check-in day, no excuses.`;
    if (!d.why.trim()) d.why = 'Because future me is watching.';
    if (existing) { Object.assign(existing, d); save(); toast('Saved'); go('#/streak/' + existing.id); return; }
    const id = 's' + Date.now().toString(36);
    const hist = new Array(365).fill(0);
    S.streaks.unshift({ ...d, id, name: d.name.trim(), days:0, best:0, joined: d.public ? (d.joined || 1) : 1, created: mdate(now()), history: hist, checked:false, capsule:[] });
    S.draft = null; save();
    go('#/streak/' + id); toast('Day 0 starts now. Check in tonight 🔥');
  };
  paint();
}
ROUTES.new = el => streakForm(el, null);
ROUTES.edit = (el, p) => { const s = getS(p[1]); s ? streakForm(el, s) : ROUTES.streaks(el); };

/* ---- DISCOVER detail ---- */
ROUTES.discover = (el, p) => {
  const d = DISCOVER.find(x => x.id === p[1]); if (!d) return ROUTES.home(el, [], new URLSearchParams('tab=discover'));
  const mine = S.streaks.find(s => s.name.toLowerCase() === d.name.toLowerCase());
  el.style.padding = '0';
  el.innerHTML = `<div style="position:relative;height:340px"><img src="${d.img}" alt="" style="width:100%;height:100%;object-fit:cover"><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,7,31,.5),transparent 30%,rgba(4,7,31,1))"></div>
      <div style="position:absolute;top:calc(var(--safe-t) + 14px);left:20px"><button class="icon-btn" data-back="#/home?tab=discover" aria-label="Back">${ICON.back}</button></div>
      <div style="position:absolute;left:20px;right:20px;bottom:6px"><span class="chip" style="background:rgba(255,255,255,.15);color:#fff">${d.kind === 'quit' ? 'Quitting' : 'Building'}</span><div class="h1" style="margin-top:10px">${d.emoji} ${esc(d.name)}</div></div></div>
    <div style="padding:16px 20px calc(var(--safe-b) + 40px)">
      <p class="p">${esc(d.blurb)}</p>
      <div class="statrow"><div><b>${fmt(d.joined)}</b><span>Partners</span></div><div><b>${d.avg}</b><span>Avg streak</span></div><div><b>${Math.round(d.avg * 3.4)}</b><span>Top 10% reach</span></div></div>
      <div class="section-h"><h3>Leaderboard among your partners</h3></div>
      <div class="card flat" style="padding:4px 14px">${['daniel','amara','tunde'].map((id, i) => `<div class="partner"><span class="dim" style="width:16px;font-weight:800">${i + 1}</span><img class="av" src="${PEOPLE[id].img}" alt=""><div class="t"><b>${PEOPLE[id].name}</b><span>${[211, 64, 12][i]} days</span></div>${fire(20)}</div>`).join('')}</div>
      ${mine ? `<a class="btn ghost" style="margin-top:22px" href="#/streak/${mine.id}">You’re on this one · ${mine.days} days</a>` : `<button class="btn hot" style="margin-top:22px" id="join">${fire(20)} Join ${fmt(d.joined)} partners</button>`}
    </div>`;
  $('#join', el)?.addEventListener('click', () => {
    const id = 's' + Date.now().toString(36);
    S.streaks.unshift({ id, cover:d.img, name:d.name, kind:d.kind, emoji:d.emoji, days:0, best:0, goal:30, joined:d.joined + 1, reminder:'20:00', week:[1,1,1,1,1,1,1], partners:[], public:true, created:mdate(now()), why:'Joining the crowd who’ve done it before me.', desc:d.blurb, history:new Array(365).fill(0), checked:false, capsule:[] });
    save(); go('#/streak/' + id); toast(`You joined ${d.name}`);
  });
};

/* ---- STERAKA AI ---- */
ROUTES.magic = (el, p, q) => {
  el.className = 'screen magic';
  const tab = q.get('tab') || 'chat';
  el.innerHTML = `<div class="head"><div class="topbar" style="margin-bottom:8px"><span class="spacer"></span><div class="title">Steraka Magic</div><button class="icon-btn" data-back="#/streaks" aria-label="Close">${ICON.close}</button></div>
    <div class="tabsm">${[['chat','Chat'],['templates','Templates']].map(([t, l]) => `<button class="chip ${t === tab ? 'on' : ''}" data-t="${t}" style="${t === tab ? '' : 'background:rgba(255,255,255,.35);color:#1b1440'}">${l}</button>`).join('')}</div></div>
    <div id="mbody" style="flex:1;display:flex;flex-direction:column;min-height:0"></div>`;
  $$('.tabsm .chip', el).forEach(b => b.onclick = () => { history.replaceState(null, '', '#/magic?tab=' + b.dataset.t); ROUTES.magic(el, p, new URLSearchParams('tab=' + b.dataset.t)); wireBack(el); });
  const body = $('#mbody', el);
  if (tab === 'templates') {
    body.innerHTML = `<div class="msgs"><div class="dgrid">${TEMPLATES.map((t, i) => `<button class="card reveal" style="text-align:left;animation-delay:${i * 50}ms;display:flex;flex-direction:column;gap:8px;min-height:150px" data-i="${i}"><span style="width:36px;height:36px;border-radius:10px;background:${t.color};display:grid;place-items:center;font-size:18px">${t.emoji}</span><b style="font-size:15px;line-height:1.15">${t.name}</b><span class="xs muted" style="line-height:1.4">${t.desc}</span></button>`).join('')}</div></div>`;
    $$('[data-i]', body).forEach(b => b.onclick = () => { const t = TEMPLATES[+b.dataset.i]; S.draft = { name:t.name, kind:t.kind, emoji:t.emoji, goal:t.goal, desc:t.desc, why:'' }; go('#/new'); });
    return;
  }
  body.innerHTML = `<div class="msgs" id="msgs"></div><div class="composer"><div class="chips" id="qc">${['Quit smoking','Run 3x a week','Read every night','Less screen time','Drink more water'].map(c => `<button class="chip">${c}</button>`).join('')}</div>
    <form id="cf"><input id="ci" placeholder="I want to create a streak that…" autocomplete="off"><button class="send" aria-label="Send">${ICON.send}</button></form></div>`;
  const msgs = $('#msgs', body);
  const add = (cls, html) => { const b = document.createElement('div'); b.className = 'bub ' + cls; b.innerHTML = html; msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight; return b; };
  add('ai', `Hi there, <span class="hi">${esc(S.name)}</span> 👋<br>What kind of streak are we building today? Tell me what you want to quit or start, and I’ll draft it.`);
  const plan = text => {
    const t = text.toLowerCase();
    const quit = /quit|stop|less|no |cut|avoid|reduce|without|never/.test(t);
    const P = [
      [/smok|cig|vape/, { name:'Quit Smoking', emoji:'🚭', goal:30, desc:'Not one cigarette or vape. Cravings pass in about ten minutes.', tip:'Most relapses happen in the first 3 days and around drinks. I’ve set a 9pm check-in, and I’d add a partner who knows your triggers.' }],
      [/run|jog|5k/, { name:'Run 3x a Week', emoji:'🏃', goal:60, desc:'20+ minutes of running on Mon, Wed and Sat.', week:[1,0,1,0,0,1,0], tip:'Three fixed days beats “whenever”. Missing a day you didn’t schedule won’t break the streak.' }],
      [/read|book/, { name:'Read Every Night', emoji:'📚', goal:30, desc:'At least 10 pages before bed. Audiobooks don’t count.', tip:'Pages beat minutes: they’re easier to prove. Snap the page you stopped on for your Time Capsule.' }],
      [/screen|phone|scroll|tiktok|instagram|youtube/, { name:'Less Screen Time', emoji:'📵', goal:30, desc:'Under 2 hours of social apps a day, checked against Screen Time.', tip:'I’ll pull the number from Screen Time so you don’t have to self-report. No phone in bed is a great add-on.' }],
      [/water|hydrat/, { name:'Drink 2L of Water', emoji:'💧', goal:30, desc:'Two litres before 8pm.', tip:'Tie it to meals: a glass with each one gets you halfway there.' }],
      [/sugar|sweet|snack/, { name:'No Sugar After 8pm', emoji:'🍩', goal:30, desc:'Nothing sweet after 8pm.', tip:'Late-night sugar is usually tiredness in disguise. Set the reminder for 7:45pm.' }],
      [/meditat|breath|calm|mindful/, { name:'10 Minutes of Stillness', emoji:'🧘', goal:30, desc:'Ten quiet minutes before checking your phone.', tip:'Mornings work best. Put the phone in another room the night before.' }],
    ];
    const hit = P.find(([re]) => re.test(t));
    if (hit) return { kind: quit || /smok|sugar|screen/.test(t) ? 'quit' : 'build', week:[1,1,1,1,1,1,1], ...hit[1] };
    let name = text.replace(/^(i want to|i wanna|help me|i'd like to|i need to|to)\s+/i, '').replace(/[.!?]+$/, '').trim();
    name = name.split(' ').slice(0, 5).map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ').slice(0, 28) || 'My Streak';
    return { name, kind: quit ? 'quit' : 'build', emoji: quit ? '🚫' : '🔥', goal:30, week:[1,1,1,1,1,1,1], desc: quit ? `Not once, for 30 days.` : `Once a day, every day, for 30 days.`, tip:'30 days is the sweet spot for a first goal: long enough to matter, short enough to see the finish.' };
  };
  const send = text => {
    if (!text.trim()) return;
    add('me', esc(text)); $('#ci', body).value = '';
    const ty = add('ai typing', '<i></i><i></i><i></i>');
    setTimeout(() => {
      ty.remove();
      const d = plan(text);
      add('ai', esc(d.tip));
      const c = add('card', `<div class="label" style="color:var(--peach)">Draft streak</div><div class="between" style="margin-top:6px"><div class="h3">${d.emoji} ${esc(d.name)}</div><span class="chip" style="height:26px">${d.kind === 'quit' ? 'Quitting' : 'Building'}</span></div>
        <p class="sm muted" style="margin-top:6px;line-height:1.45">${esc(d.desc)}</p>
        <div class="row" style="margin-top:12px;gap:22px"><div><div class="xs dim">Goal</div><b>${d.goal} days</b></div><div><div class="xs dim">Days</div><b>${d.week.filter(Boolean).length === 7 ? 'Every day' : d.week.map((v, i) => v ? WD[i] : '').join(' ').trim()}</b></div></div>
        <div class="row" style="margin-top:14px;gap:8px"><button class="btn sm white" data-a="create">Start it</button><button class="btn sm ghost" data-a="edit">Customize</button></div>`);
      $('[data-a=create]', c).onclick = () => {
        const id = 's' + Date.now().toString(36);
        S.streaks.unshift({ id, cover:d.img, name:d.name, kind:d.kind, emoji:d.emoji, days:0, best:0, goal:d.goal, joined:1, reminder:'21:00', week:d.week, partners:[], public:true, created:mdate(now()), why:text, desc:d.desc, history:new Array(365).fill(0), checked:false, capsule:[] });
        save(); go('#/streak/' + id); toast('Streak created by Steraka Magic ✨');
      };
      $('[data-a=edit]', c).onclick = () => { S.draft = { name:d.name, kind:d.kind, emoji:d.emoji, goal:d.goal, desc:d.desc, why:text, week:d.week }; go('#/new'); };
    }, 1000);
  };
  $('#cf', body).onsubmit = e => { e.preventDefault(); send($('#ci', body).value); };
  $$('#qc .chip', body).forEach(c => c.onclick = () => send(c.textContent));
};

/* ---- PARTNERS / ACCOUNTABILITY ---- */
ROUTES.partners = (el, p, q) => {
  const tab = q.get('tab') || 'inbox';
  const u = unread();
  el.innerHTML = `<div class="topbar"><div class="h2">Accountability</div><button class="icon-btn" id="inv" aria-label="Invite a partner">${ICON.user}</button></div>
    <div class="seg" style="margin-bottom:18px"><button data-t="inbox" class="${tab === 'inbox' ? 'on' : ''}">Inbox${u ? ` · ${u}` : ''}</button><button data-t="partners" class="${tab === 'partners' ? 'on' : ''}">Partners · ${S.partnersList.length}</button></div>
    <div id="pbody"></div>`;
  $$('.seg button', el).forEach(b => b.onclick = () => { history.replaceState(null, '', '#/partners?tab=' + b.dataset.t); ROUTES.partners(el, p, new URLSearchParams('tab=' + b.dataset.t)); });
  $('#inv', el).onclick = invite;
  const body = $('#pbody', el);
  const refresh = () => { ROUTES.partners(el, p, q); $('#dockBadge').hidden = !unread(); };
  if (tab === 'inbox') {
    body.innerHTML = (u ? `<div class="between" style="margin-bottom:12px"><span class="label">${u} unread</span><button class="xs" style="color:var(--peri2);font-weight:700" id="mar">Mark all read</button></div>` : '') +
      `<div class="stack">${S.inbox.map((m, i) => {
        const who = PEOPLE[m.from];
        const acts = m.type === 'nudge' ? (getS(m.streak)?.checked ? `<span class="xs" style="color:var(--green);font-weight:700">✓ You checked in</span>` : `<a class="btn sm white" href="#/checkin/${m.streak}">Check in now</a>`)
          : m.type === 'milestone' ? `<button class="btn sm white" data-cheer="${m.id}">${fire(16)} Send fire</button>`
          : m.type === 'invite' ? `<button class="btn sm white" data-acc="${m.id}">Accept</button><button class="btn sm ghost" data-dec="${m.id}">Decline</button>` : '';
        return `<div class="inbox-item reveal ${m.unread ? 'unread' : ''}" style="animation-delay:${i * 40}ms" data-id="${m.id}"><img class="av" src="${who.img}" alt=""><div class="t"><b>${who.name}</b> ${m.text}<small>${m.time} ago</small>${acts ? `<div class="acts">${acts}</div>` : ''}</div></div>`;
      }).join('')}</div>`;
    $('#mar', body)?.addEventListener('click', () => { S.inbox.forEach(m => m.unread = false); save(); refresh(); });
    $$('.inbox-item', body).forEach(it => it.addEventListener('click', e => { const m = S.inbox.find(x => x.id === it.dataset.id); if (m.unread && !e.target.closest('button,a')) { m.unread = false; save(); refresh(); } }));
    $$('[data-cheer]', body).forEach(b => b.onclick = () => { const m = S.inbox.find(x => x.id === b.dataset.cheer); burst(b); m.unread = false; m.type = 'done'; m.text = m.text.replace('Send some fire?', '— you sent fire 🔥'); save(); toast(`Fire sent to ${PEOPLE[m.from].name}`); setTimeout(refresh, 500); });
    $$('[data-acc]', body).forEach(b => b.onclick = () => { const m = S.inbox.find(x => x.id === b.dataset.acc); m.unread = false; m.type = 'done'; m.text = 'is now your partner on <b>No Phone in Bed</b>.'; if (!S.partnersList.find(x => x.id === 'max')) S.partnersList.push({ id:'max', streak:'No Phone in Bed', days:16, checked:true }); save(); toast('You’re Max’s partner now'); refresh(); });
    $$('[data-dec]', body).forEach(b => b.onclick = () => { S.inbox = S.inbox.filter(x => x.id !== b.dataset.dec); save(); toast('Invite declined'); refresh(); });
  } else {
    body.innerHTML = `<p class="p" style="margin-bottom:6px">Partners see your counts and get a nudge if you go quiet past your reminder. You can nudge them back.</p>
      <div class="card flat" style="padding:4px 14px">${S.partnersList.map(x => { const who = PEOPLE[x.id]; const nd = S.nudged[x.id];
        return `<div class="partner"><div class="av-wrap"><img class="av lg" src="${who.img}" alt=""><span class="badge">${x.days}🔥</span></div><div class="t"><b>${who.name}</b><span><i class="status-dot" style="background:${x.checked ? 'var(--green)' : 'var(--orange)'}"></i>${esc(x.streak)} · ${x.checked ? 'checked in' : 'not yet today'}</span></div>
          ${x.checked ? `<button class="btn sm ghost" data-fire="${x.id}">${fire(16)}</button>` : `<button class="btn sm ${nd ? 'ghost' : 'white'}" data-nudge="${x.id}" ${nd ? 'disabled' : ''}>${nd ? 'Nudged' : 'Nudge'}</button>`}</div>`; }).join('')}</div>
      <button class="btn ghost" style="margin-top:16px" id="inv2">${ICON.user.replace('<svg', '<svg class="icon" style="width:18px;height:18px"')} Invite a partner</button>`;
    $$('[data-nudge]', body).forEach(b => b.onclick = () => { S.nudged[b.dataset.nudge] = 1; save(); toast(`Nudge sent to ${PEOPLE[b.dataset.nudge].name}`); refresh(); });
    $$('[data-fire]', body).forEach(b => b.onclick = () => { burst(b); toast(`Fire sent to ${PEOPLE[b.dataset.fire].name}`); });
    $('#inv2', body).onclick = invite;
  }
};
function invite() {
  const link = location.href.split('#')[0] + '#/welcome';
  sheet(`<div class="h2">Invite a partner</div><p class="p" style="margin:8px 0 16px">Send this to someone who’ll call you out kindly. They’ll see the streaks you choose to share, nothing else.</p>
    <div class="input" style="font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(link)}</div>
    <button class="btn white" style="margin-top:12px" id="cp">Copy invite link</button><button class="btn ghost" style="margin-top:10px" data-close>Not now</button>`, (s, close) => {
    $('#cp', s).onclick = async () => {
      try { if (navigator.share) await navigator.share({ title:'Join me on Steraka', url:link }); else await navigator.clipboard.writeText(link); toast('Invite link ready'); }
      catch (e) { toast('Copy the link above'); }
      close();
    };
  });
}

/* ---- PROFILE & SETTINGS ---- */
ROUTES.profile = el => {
  const total = S.streaks.reduce((a, s) => a + s.days, 0);
  const top = [...S.streaks].sort((a, b) => b.days - a.days);
  el.innerHTML = `<div class="topbar"><div class="h2">Profile</div><a class="icon-btn" href="#/partners" aria-label="Inbox">${ICON.bell}${unread() ? '<i class="dot"></i>' : ''}</a></div>
    <div class="prof-head">${nethie()}<h2>${esc(S.name)}</h2><div class="sm muted">On Steraka since ${S.since}</div>
      <div class="statrow" style="justify-content:center"><div><b>${S.streaks.length}</b><span>Streaks</span></div><div><b>${fmt(total)}</b><span>Total days</span></div><div><b>${Math.max(...S.streaks.map(s => s.best), 0)}</b><span>Best</span></div><div><b>${S.freezes}</b><span>Freezes</span></div></div></div>
    <div class="section-h" style="margin-top:6px"><h3>Connected apps</h3><span class="xs dim">Auto check-ins</span></div>
    <div class="apps">${APPS.map(a => `<button class="app-tile ${S.apps[a.id] ? '' : 'off'}" data-app="${a.id}"><span class="sq" style="background:${a.c}">${a.l}</span><i class="ok">${ICON.check}</i>${a.name}</button>`).join('')}</div>
    <div class="section-h"><h3>Lock-screen widget</h3><button class="toggle ${S.prefs.widget ? 'on' : ''}" data-pref="widget" aria-label="Widget"></button></div>
    <div class="widget-prev" style="${S.prefs.widget ? '' : 'opacity:.35;filter:grayscale(.6)'}"><div class="date">${now().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</div><div class="clock">${hhmm(now())}</div>
      <div class="wrow">${top.slice(0, 2).map(s => `<div class="wgt"><b>${S.prefs.hideCounts ? '••' : s.days}${fire(18)}</b><span>${esc(s.name)}</span></div>`).join('')}</div></div>
    <div class="section-h"><h3>Settings</h3></div>
    <div class="list">
      ${[['reminders','Daily reminders','At each streak’s reminder time'],['nudges','Partner nudges','Let partners ping you when you go quiet'],['hideCounts','Hide counts on lock screen','Show •• instead of numbers']].map(([k, t, d]) => `<div class="li"><span class="t"><b>${t}</b><span>${d}</span></span><button class="toggle ${S.prefs[k] ? 'on' : ''}" data-pref="${k}" aria-label="${t}"></button></div>`).join('')}
      <a class="li" href="#/setup-pattern?reset=1"><span class="t"><b>Change unlock pattern</b><span>Your private space</span></span>${ICON.chev}</a>
      <a class="li" href="#/magic?tab=templates"><span class="t"><b>Streak templates</b><span>From Steraka Magic</span></span>${ICON.chev}</a>
    </div>
    <div class="list" style="margin-top:12px">
      <button class="li" id="lockNow"><span class="t"><b>Lock Steraka now</b></span>${ICON.lock}</button>
      <button class="li" id="resetDemo"><span class="t"><b style="color:#ff9c9c">Reset demo data</b><span>Restore the sample streaks</span></span></button>
    </div>
    <p class="xs dim" style="text-align:center;margin-top:20px">Steraka · design preview build</p>`;
  $$('[data-app]', el).forEach(b => b.onclick = () => { const k = b.dataset.app; S.apps[k] = !S.apps[k]; save(); b.classList.toggle('off', !S.apps[k]); toast(`${APPS.find(a => a.id === k).name} ${S.apps[k] ? 'connected' : 'disconnected'}`); });
  $$('[data-pref]', el).forEach(b => b.onclick = () => { const k = b.dataset.pref; S.prefs[k] = !S.prefs[k]; save(); ROUTES.profile(el); });
  $('#lockNow', el).onclick = () => { setUnlocked(false); go('#/lock'); };
  $('#resetDemo', el).onclick = () => sheet(`<div class="h2">Reset demo data?</div><p class="p" style="margin:8px 0 18px">Your streaks, check-ins and photos go back to the sample set. Your pattern stays.</p><button class="btn danger" id="rd">Reset</button><button class="btn ghost" style="margin-top:10px" data-close>Cancel</button>`, (s) => {
    $('#rd', s).onclick = () => { const pat = S.pattern; S = seedState(); S.pattern = pat; S.onboarded = true; save(); closeSheetNow(); route(); toast('Demo data restored'); };
  });
};

/* ---------------- boot ---------------- */
injectDefs();
route();
})();
