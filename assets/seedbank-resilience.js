/* DK Seed Bank: visible recovery readiness and opt-in offline photo cache. */
(function(){
"use strict";
const journal=document.getElementById("seedJournal");
if(!journal)return;
const l=(en,ru)=>document.documentElement.lang==="ru"?ru:en;
const panel=document.createElement("details");
panel.id="dkResilience";panel.className="dk-resilience";
panel.innerHTML=
 '<summary id="dkResilienceTitle" data-dk-no-translate>🛡 Backups and offline readiness</summary>'+
 '<div class="dk-resilience-body" data-dk-no-translate>'+
 '<p id="dkRecoveryExplanation"></p>'+
 '<p id="dkRecoveryLast" role="status" aria-live="polite"></p>'+
 '<div class="dk-resilience-actions">'+
 '<button type="button" id="dkRecoveryExport"></button>'+
 '<button type="button" id="dkRecoveryImport"></button>'+
 '<button type="button" id="dkRecoveryPersist"></button>'+
 '<button type="button" id="dkRecoveryPhotos"></button></div>'+
 '<p id="dkRecoveryProgress" role="status" aria-live="polite"></p>'+
 '<p id="dkRecoveryStorage"></p></div>';
journal.insertAdjacentElement("afterend",panel);
const $=id=>document.getElementById(id);
let saving=false,stopped=false,photoStatus="",storageStatus="";
function lastExport(){
 let saved;
 try{saved=localStorage.getItem("dk-seedbank-last-export-v1");}catch(error){}
 const date=saved?new Date(saved):null;
 if(!date||Number.isNaN(date.getTime()))return l(
  "No backup export recorded on this device. Download a copy before relying on browser storage.",
  "На этом устройстве ещё не выгружалась резервная копия. Сохраните копию вне браузера.");
 const days=Math.max(0,Math.floor((Date.now()-date.getTime())/86400000));
 return l("Last backup download requested: ","Последняя попытка выгрузки копии: ")+
  date.toLocaleDateString()+(days>=30?l(" · Over 30 days ago; export a fresh copy."," · Прошло более 30 дней. Сохраните новую копию."):"")+
  l(" · Confirm the file is in Downloads."," · Проверьте файл в «Загрузках».");
}
function render(){
 $("dkResilienceTitle").textContent=l("🛡 Backups and offline readiness","🛡 Резервные копии и офлайн-доступ");
 $("dkRecoveryExplanation").textContent=l(
  "To transfer your collection between iPhone, browser and Linux: export the full JSON backup on one device, then import it on the other. Data does not sync automatically.",
  "Чтобы перенести коллекцию между iPhone, браузером и Linux, выгрузите полную резервную копию JSON и загрузите её на другом устройстве. Автоматической синхронизации нет.");
 $("dkRecoveryLast").textContent=lastExport();
 $("dkRecoveryExport").textContent=l("↓ Export full backup","↓ Скачать полную резервную копию");
 $("dkRecoveryImport").textContent=l("↑ Restore backup","↑ Восстановить из копии");
 $("dkRecoveryPersist").textContent=l("Protect browser storage","Защитить хранилище браузера");
 $("dkRecoveryPhotos").textContent=saving?l("Stop photo saving","Остановить сохранение"):
  l("Save up to 80 photos offline","Сохранить до 80 фото для офлайна");
 $("dkRecoveryProgress").textContent=photoStatus;
 $("dkRecoveryStorage").textContent=storageStatus||l(
  "Offline photo saving is optional. Uploaded photographs are already stored locally and included in exports. Remote photographs may still need internet.",
  "Сохранение фотографий для офлайна необязательно. Загруженные вами фото хранятся локально и входят в резервную копию. Для внешних фотографий может потребоваться интернет.");
 if(window.location.protocol==="dkseed:"){
  $("dkRecoveryPhotos").disabled=true;
  $("dkRecoveryPhotos").title=l("Browser-only offline photo cache","Офлайн-кеш фото доступен в браузере");
 }
 if(!navigator.storage?.persist)$("dkRecoveryPersist").disabled=true;
}
$("dkRecoveryExport").addEventListener("click",()=>document.getElementById("exportJournal")?.click());
$("dkRecoveryImport").addEventListener("click",()=>document.getElementById("importJournal")?.click());
$("dkRecoveryPersist").addEventListener("click",async()=>{
 if(!navigator.storage?.persist)return;
 try{
  const result=await navigator.storage.persist();
  storageStatus=result?l("Browser granted persistent storage. Keep external backups anyway.",
   "Браузер разрешил постоянное хранение. Всё равно сохраняйте резервные копии.") :
   l("Persistent storage was not granted. Export backups regularly.",
   "Постоянное хранение не разрешено. Регулярно выгружайте резервные копии.");
 }catch(error){
  storageStatus=l("Persistent storage is not supported here. Keep your exported backup.",
   "Постоянное хранение здесь недоступно. Сохраните резервную копию.");
 }
 render();
});
function photoCandidates(){
 const seen=new Set();
 for(const img of document.querySelectorAll(".seed-thumb img")){
  const url=img.getAttribute("src");
  if(!url)continue;
  try{
   const parsed=new URL(url,document.baseURI);
   if(parsed.protocol!=="https:"||seen.has(parsed.href))continue;
   seen.add(parsed.href);
  }catch(error){/* Ignore invalid URLs. */}
 }
 return Array.from(seen).slice(0,80);
}
$("dkRecoveryPhotos").addEventListener("click",async()=>{
 if(saving){stopped=true;return;}
 if(!navigator.onLine){photoStatus=l("Connect to the internet to save photos.",
  "Для сохранения фотографий подключитесь к интернету.");render();return;}
 if(!("caches" in window)||window.location.protocol==="dkseed:"){
  photoStatus=l("Offline photo caching is not supported here.","Офлайн-кеширование фотографий здесь недоступно.");
  render();return;
 }
 const urls=photoCandidates();
 if(!urls.length){photoStatus=l("No externally hosted seed photographs are available to cache.",
   "Не найдено внешних фотографий семян для сохранения.");render();return;}
 saving=true;stopped=false;let added=0,already=0,failed=0;
 try{
  const cache=await caches.open("dk-seedbank-images-v1");
  for(const url of urls){
   if(stopped)break;
   try{
    const request=new Request(url,{mode:"no-cors",credentials:"omit"});
    if(await cache.match(request)){already++;continue;}
    const response=await fetch(request);
    if(response.ok||response.type==="opaque"){
     await cache.put(request,response);
     added++;
    }else failed++;
   }catch(error){failed++;}
   photoStatus=l("Saving photographs… ","Сохранение фотографий… ")+(added+already+failed)+"/"+urls.length;
   render();
  }
  photoStatus=l("Offline photos: ","Офлайн-фото: ")+(added+already)+"/"+urls.length+
    l(" saved or already cached. "," сохранено или уже в кеше. ")+
    (failed?l(failed+" unavailable. ",failed+" недоступно. "):"")+
    l("This is a best-effort cache; keep your JSON backups.","Кеш не гарантирует постоянное хранение. Сохраняйте копии JSON.");
 }catch(error){
  photoStatus=l("Offline photo storage is unavailable or full.",
   "Офлайн-хранилище фотографий недоступно или заполнено.");
 }finally{saving=false;render();}
});
document.addEventListener("dkseedbank:backup-exported",render);
document.addEventListener("dkseedbank:backup-restored",render);
$("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(render));
render();
window.DKSeedBankResilience=Object.freeze({photoCandidates});
})();
