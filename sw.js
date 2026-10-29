// 앱 껍데기를 저장해 두고 오프라인에서도 열리게 한다. 대화방(/ws)은 항상 네트워크.
const CACHE='sq-v24';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const HOME=new URL('index.html',self.registration.scope).href;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.pathname.startsWith('/ws'))return;
  if(e.request.mode==='navigate'){ // 새 버전 우선, 안 되면 저장본
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(HOME,c));return r}).catch(()=>caches.match(HOME)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok&&(u.origin===location.origin||u.host.endsWith('gstatic.com')||u.host.endsWith('googleapis.com'))){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})));
});
