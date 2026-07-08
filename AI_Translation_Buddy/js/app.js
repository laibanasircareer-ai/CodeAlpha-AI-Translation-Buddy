
/* ================= Offline app-shell caching (best effort) ================= */
/* Only takes effect when this file is served over http/https (e.g. GitHub Pages,
   Netlify). Opening the file directly (file://) will simply skip this — the
   phrasebook above still works regardless. */
if('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')){
  navigator.serviceWorker.register('sw.js').catch(()=>{ /* no-op if unavailable */ });
}
