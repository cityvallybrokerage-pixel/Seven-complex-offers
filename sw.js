/* KILL-SWITCH service worker — recovers any browser stuck on an old cached version.
   It takes over, deletes all caches, unregisters itself, then reloads open pages.
   After everyone has loaded once, this file can be deleted from the repo. */
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil((async function(){
    try{ const keys = await caches.keys(); await Promise.all(keys.map(function(k){ return caches.delete(k); })); }catch(_){}
    try{ await self.registration.unregister(); }catch(_){}
    try{ const cs = await self.clients.matchAll({type:'window'}); cs.forEach(function(c){ c.navigate(c.url); }); }catch(_){}
  })());
});
/* no fetch handler -> the browser serves everything normally (network) */
