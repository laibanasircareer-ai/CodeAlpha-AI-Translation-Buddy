/* ================= Theme ================= */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
const MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';

function applyTheme(theme){
  root.setAttribute('data-theme', theme);
  themeIcon.innerHTML = theme === 'dark' ? MOON : SUN;
  localStorage.setItem('tb-theme', theme);
}
const savedTheme = localStorage.getItem('tb-theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', ()=>{
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

/* ================= Elements ================= */
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const charCount = document.getElementById('charCount');
const translateBtn = document.getElementById('translateBtn');
const autoTranslate = document.getElementById('autoTranslate');
const statusLine = document.getElementById('statusLine');
const swapBtn = document.getElementById('swapBtn');
const copyBtn = document.getElementById('copyBtn');
const listenSourceBtn = document.getElementById('listenSourceBtn');
const listenTargetBtn = document.getElementById('listenTargetBtn');
const micBtn = document.getElementById('micBtn');
const stamp = document.getElementById('stamp');
const detectedPill = document.getElementById('detectedPill');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const phraseGrid = document.getElementById('phraseGrid');
const statusPill = document.getElementById('statusPill');
const statusPillText = document.getElementById('statusPillText');

let lastTranslatedText = "";
let debounceTimer = null;
let requestSeq = 0;
let history = [];
/* ================= Online/offline status ================= */
function updateStatusPill(){
  const online = navigator.onLine;
  statusPill.classList.toggle('offline', !online);
  statusPillText.textContent = online ? 'Online' : 'Offline mode';
}
window.addEventListener('online', ()=>{ updateStatusPill(); if(statusLine.classList.contains('offline-note')){ statusLine.textContent=''; statusLine.classList.remove('offline-note'); } });
window.addEventListener('offline', updateStatusPill);
updateStatusPill();

/* ================= Char counter ================= */
inputText.addEventListener('input', ()=>{
  const len = inputText.value.length;
  charCount.textContent = `${len} / 500`;
  charCount.classList.toggle('warn', len > 450);
  if(autoTranslate.checked){
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(()=> runTranslate(), 550);
  }
});