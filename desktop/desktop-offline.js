/* Offline desktop status and optional, non-installing update notice. */
(function(){
"use strict";
const status=document.getElementById("dkOfflineStatus");
const language=document.getElementById("dkLanguageSelect");
if(!status)return;
const l=(en,ru)=>language?.value==="ru"?ru:en;
function updateOffline(){
 status.textContent=l(
  "Desktop edition · Works offline · Records are saved on this computer",
  "Настольная версия · Работает без интернета · Данные сохраняются на этом компьютере"
 );
 status.dataset.offlineState="ready";
}
if(language)language.addEventListener("change",updateOffline);
updateOffline();
if(!window.DKSeedBankDesktop?.checkForUpdates)return;
const area=document.createElement("div");
area.className="dk-desktop-update";
const button=document.createElement("button");
button.type="button";button.className="journal-btn";
const notice=document.createElement("span");
notice.setAttribute("role","status");
notice.setAttribute("aria-live","polite");
area.append(button,notice);
status.insertAdjacentElement("afterend",area);
let result=null;
function show(){
 button.textContent=l("Check Linux updates","Проверить обновления Linux");
 if(!result){notice.textContent="";return;}
 if(result.status==="checking"){notice.textContent=l("Checking…","Проверка…");return;}
 if(result.status==="available"){
  notice.textContent=l("Version "+result.version+" is available. ","Доступна версия "+result.version+". ");
  const a=document.createElement("a");
  a.href=result.url;a.target="_blank";a.rel="noopener noreferrer";
  a.textContent=l("View download","Открыть загрузку");
  notice.appendChild(a);
 }else{
  notice.textContent=result.status==="current"?l("This portable version is up to date.","Версия актуальна."):
   l("Update check unavailable. Offline use is unaffected.","Не удалось проверить обновления. Офлайн-работа не затронута.");
 }
}
async function check(silent=false){
 if(result?.status==="checking")return;
 result={status:"checking"};show();
 try{
  const response=await window.DKSeedBankDesktop.checkForUpdates();
  result=response&&["available","current","unavailable"].includes(response.status)?response:{status:"unavailable"};
 }catch(error){result={status:"unavailable"};}
 if(silent&&result.status!=="available"){result=null;}
 show();
}
button.addEventListener("click",()=>check());
language?.addEventListener("change",()=>queueMicrotask(show));
show();
if(navigator.onLine)setTimeout(()=>check(true),12000);
})();
