/* DK Seed Bank offline app shell and previously viewed external photos.
   Personal records remain in their existing browser storage. */
"use strict";
const APP_CACHE="dk-seedbank-app-v48";
const IMAGE_CACHE="dk-seedbank-images-v1";
const CACHE_PREFIX="dk-seedbank-";
const IMAGE_LIMIT=180;
const SCOPE=new URL(self.registration.scope);
const APP_FILES=["index.html","docs/index.html","assets/seedbank-cards.css","assets/seedbank-packet-tracking.js","assets/seedbank-cards.js","assets/seedbank-i18n.css","assets/seedbank-i18n.js","assets/seedbank-monastery.js","assets/seedbank-recipes.css","assets/seedbank-recipe-library.js","assets/seedbank-recipes.js","assets/seedbank-variety-images.js","assets/seedbank-watering.css","assets/seedbank-watering.js","assets/seedbank-workbench.css","assets/seedbank-workbench.js","assets/seedbank-field-guides.js","assets/seedbank-field-guides.css","assets/seedbank-backup-utils.js","assets/seedbank-storage-transaction.js","assets/seedbank-alerts.js","assets/seedbank-resilience.css","assets/seedbank-resilience.js","assets/seedbank-chevrons.css","assets/seedbank-growth-photos.css","assets/seedbank-growth-photos.js","assets/seedbank-growth-measurements.css","assets/seedbank-growth-measurements.js","assets/seedbank-drive-sync.css","assets/seedbank-drive-merge.js","assets/seedbank-drive-visible.js","assets/seedbank-drive-sync.js","assets/seedbank-suppliers.css","assets/seedbank-suppliers.js","assets/dk-seedbank-green-96.webp","assets/dk-seedbank-red-96.webp","assets/seedbank-offline.js","manifest.webmanifest"];
const APP_URLS=APP_FILES.map(path=>new URL(path,SCOPE).href);
const APP_PATHS=new Set(APP_URLS.map(url=>new URL(url).pathname));
self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(APP_CACHE);
    // Install only if every file needed by the app is available offline.
    await cache.addAll(APP_URLS);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==APP_CACHE&&key!==IMAGE_CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
async function appResponse(request){
  const cache=await caches.open(APP_CACHE);
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(request,{signal:controller.signal});
    if(response.ok){
      try{await cache.put(request,response.clone());}catch(error){/* Cache quota may be exhausted. */}
    }
    return response;
  }catch(error){
    const cached=await cache.match(request)||await cache.match(request,{ignoreSearch:true});
    if(cached)return cached;
    if(request.mode==="navigate"){
      const inDocs=new URL(request.url).pathname.startsWith(new URL("docs/",SCOPE).pathname);
      const fallback=await cache.match(new URL(inDocs?"docs/index.html":"index.html",SCOPE).href);
      if(fallback)return fallback;
    }
    return Response.error();
  }finally{clearTimeout(timeout);}
}
async function photoResponse(request){
  const cache=await caches.open(IMAGE_CACHE);
  const saved=await cache.match(request);
  if(saved)return saved;
  try{
    const response=await fetch(request);
    if(response.ok||response.type==="opaque"){
      try{
        await cache.put(request,response.clone());
        const keys=await cache.keys();
        for(const key of keys.slice(0,Math.max(0,keys.length-IMAGE_LIMIT)))await cache.delete(key);
      }catch(error){/* Image caching is best-effort and never blocks recordkeeping. */}
    }
    return response;
  }catch(error){
    return Response.error();
  }
}
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(request.destination==="image"&&url.origin!==SCOPE.origin&&/^https?:$/.test(url.protocol)){
    event.respondWith(photoResponse(request));
    return;
  }
  if(url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
  if(request.mode==="navigate"||APP_PATHS.has(url.pathname))event.respondWith(appResponse(request));
});
