/* Bilingual offline status, separate from the stored seed records. */
(function(){
"use strict";
const status=document.getElementById("dkOfflineStatus");
const script=document.currentScript;
if(!status||!script)return;
const selector=document.getElementById("dkLanguageSelect");
let ready=false,failed=false,unsupported=false;
const messages={
 en:{
  ready:"Available offline on this device · Export backups regularly",
  offline:"Offline · Catalog and saved records are available",
  preparing:"Preparing offline access…",
  connect:"Connect once to prepare offline access",
  failed:"Offline setup incomplete · Reconnect and reload",
  unsupported:"Offline caching unavailable in this browser"
 },
 ru:{
  ready:"Доступно без интернета на этом устройстве · Регулярно сохраняйте резервные копии",
  offline:"Нет интернета · Каталог и сохранённые записи доступны",
  preparing:"Подготовка работы без интернета…",
  connect:"Подключитесь к интернету один раз для подготовки",
  failed:"Офлайн-подготовка не завершена · Подключитесь и обновите страницу",
  unsupported:"В этом браузере недоступно офлайн-кеширование"
 }
};
function update(){
 const locale=selector&&selector.value==="ru"?"ru":"en";
 const key=unsupported?"unsupported":failed?"failed":!ready?(navigator.onLine?"preparing":"connect"):(navigator.onLine?"ready":"offline");
 status.textContent=messages[locale][key];
 status.dataset.offlineState=key;
}
window.addEventListener("online",update);
window.addEventListener("offline",update);
if(selector)selector.addEventListener("change",update);
if(!("serviceWorker" in navigator)||!window.isSecureContext){
 unsupported=true;update();return;
}
navigator.serviceWorker.addEventListener("controllerchange",()=>{
 if(navigator.serviceWorker.controller){ready=true;failed=false;update();}
});
update();
const scope=new URL("../",script.src);
const worker=new URL("../sw.js",script.src);
navigator.serviceWorker.register(worker.href,{scope:scope.href,updateViaCache:"none"})
 .then(registration=>{
   if(registration.installing){
     registration.installing.addEventListener("statechange",()=>{
       if(registration.installing&&registration.installing.state==="redundant"&&!registration.active){
         failed=true;update();
       }
     });
   }
   navigator.serviceWorker.ready.then(()=>{
     ready=true;failed=false;update();
     registration.update().catch(()=>{});
   });
 })
 .catch(()=>{failed=true;update();});
})();
