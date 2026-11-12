/* DK Seed Bank: optional Google Drive app-data sync for each user's own Google account.
   Access tokens never enter the repo or normal backups. A Drive connection is opt-in. */
(function(root){
"use strict";
const core=root.DKSeedBankCore,backup=root.DKSeedBankBackup,merge=root.DKSeedBankDriveMerge;
if(!core||!backup||!merge)return;
const appKey="dk-seedbank-google-sync-settings-v1";
const desktop=!!root.DKSeedBankDesktop?.googleDrive;
// Declare desktop before calculating the requested Google scopes.
const scope="https://www.googleapis.com/auth/drive.appdata"+
 (!desktop?" https://www.googleapis.com/auth/drive.file":"");
const clientRx=/^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/;
const filePrefix="dk-seedbank-sync-v1-";
// Public application identifier, not a Google account, password or access token.
const webClientId="990130733984-vc9lofrdpjc04flhkgc91buelgfo00ls.apps.googleusercontent.com";
const t=(en,ru)=>document.documentElement.lang==="ru"?ru:en;
let saved={};
try{saved=JSON.parse(localStorage.getItem(appKey)||"{}")||{};}catch(error){}
if(!saved.deviceId||!/^[a-z0-9-]{15,90}$/.test(saved.deviceId)){
 saved.deviceId="device-"+(root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+"-"+Date.now());
}
const persist=()=>{
 localStorage.setItem(appKey,JSON.stringify({
  deviceId:saved.deviceId,clientId:saved.clientId||"",auto:!!saved.auto,lastSync:saved.lastSync||""
 }));
};
try{persist();}catch(error){}
let token="",expires=0,tokenClient=null,busy=false,connected=false,lastStatus="",syncTimer=null;
const sessionKey="dk-seedbank-google-drive-web-session-v1";
// A short-lived, tab-scoped access token survives refreshes, but not a deliberate
// Google disconnect. Never place access tokens in permanent localStorage/backups.
function cacheSession(){
 if(desktop)return;
 try{
  if(token&&expires>Date.now()+60000)
   sessionStorage.setItem(sessionKey,JSON.stringify({token,expires,clientId:webClientId,scope}));
  else sessionStorage.removeItem(sessionKey);
 }catch(error){/* Restricted browser storage: continue with in-memory auth. */}
}
function restoreSession(){
 if(desktop)return;
 try{
  const item=JSON.parse(sessionStorage.getItem(sessionKey)||"null");
  if(item&&item.clientId===webClientId&&item.scope===scope&&
     typeof item.token==="string"&&item.token.length>16&&
     Number.isFinite(item.expires)&&item.expires>Date.now()+60000){
   token=item.token;expires=item.expires;connected=true;
  }else sessionStorage.removeItem(sessionKey);
 }catch(error){try{sessionStorage.removeItem(sessionKey);}catch(ignore){}}
}
restoreSession();
const requestPath="https://www.googleapis.com/drive/v3/files";
const uploadPath="https://www.googleapis.com/upload/drive/v3/files";
const filename=filePrefix+saved.deviceId+".json";
const journal=document.getElementById("seedJournal");
if(!journal)return;
const box=document.createElement("section");
box.id="dkDriveSync";box.className="dk-drive-sync";
box.setAttribute("data-dk-no-translate","");
box.setAttribute("role","region");
box.setAttribute("aria-labelledby","dkDriveTitle");
box.innerHTML='<h3 id="dkDriveTitle">Google Drive</h3>'+
'<div class="dk-drive-body">'+
'<p id="dkDriveExplain"></p>'+
(desktop?'<label class="dk-drive-client-label" for="dkDriveClient"></label>':'')+
(desktop?'<input id="dkDriveClient" type="text" maxlength="130" autocapitalize="none" autocomplete="off" spellcheck="false" placeholder="000000000000-example.apps.googleusercontent.com">':'')+
(desktop?'<p id="dkDriveClientHelp"></p>':'')+
'<div class="dk-drive-actions">'+
'<button type="button" id="dkDriveConnect"></button>'+
'<button type="button" id="dkDriveNow"></button>'+
'<button type="button" id="dkDriveDisconnect"></button></div>'+
(!desktop?'<div class="dk-visible-folder"><button type="button" id="dkDriveChooseFolder"></button> <button type="button" id="dkDriveCreateFolder"></button> <button type="button" id="dkDriveClearFolder"></button><p id="dkDriveFolderState" role="status" aria-live="polite"></p><a id="dkDriveOpenFolder" target="_blank" rel="noopener noreferrer" hidden></a></div>':'')+
'<label class="dk-drive-auto"><input type="checkbox" id="dkDriveAuto"><span id="dkDriveAutoLabel"></span></label>'+
'<p id="dkDriveState" role="status" aria-live="polite"></p>'+
'<p id="dkDriveScope"></p>'+
'</div>';
const position=document.getElementById("dkSyncBackupDriveSlot");
if(position)position.appendChild(box);
else journal.insertAdjacentElement("afterend",box);
const $=id=>document.getElementById(id);
if(desktop)$("dkDriveClient").value=saved.clientId||"";
$("dkDriveAuto").checked=!!saved.auto;
const ready=()=>connected&&(desktop||!!token&&Date.now()<expires-60000);
function render(){
 $("dkDriveTitle").textContent=t("Google Drive synchronization","Синхронизация с Google Диском");
 $("dkDriveExplain").textContent=t(
  "Optional. Connect YOUR OWN Google account to share plantings, growth charts, photos and collection records between devices. No one else's Google Drive is connected.",
  "Необязательно. Подключите СВОЙ аккаунт Google, чтобы синхронизировать посадки, графики роста, фотографии и коллекцию между устройствами.");
 if(desktop){
 $("dkDriveClient").disabled=busy||connected;
 $("dkDriveClient").setAttribute("aria-label",t("Google OAuth Client ID","Идентификатор клиента OAuth Google"));
 box.querySelector(".dk-drive-client-label").textContent=t(
  desktop?"Desktop OAuth Client ID":"Web OAuth Client ID",
  desktop?"Идентификатор OAuth для компьютера":"Идентификатор OAuth для веб-приложения");
 $("dkDriveClientHelp").textContent=t(
  "One-time Google Cloud setup is required. The Web and Desktop client IDs must belong to the same Google Cloud project. No passwords or Google account identifiers are stored in the app.",
  "Требуется однократная настройка Google Cloud. Веб- и настольный идентификаторы должны принадлежать одному проекту Google Cloud. Пароли не сохраняются.");
 }
 $("dkDriveConnect").textContent=t(ready()?"Connected":connected?"Reconnect Google Drive":"Connect my Google Drive",
  ready()?"Подключено":connected?"Переподключить Google Диск":"Подключить мой Google Диск");
 $("dkDriveConnect").disabled=busy||ready();
 $("dkDriveNow").textContent=t("Sync now","Синхронизировать сейчас");
 $("dkDriveNow").disabled=busy||!ready();
 $("dkDriveDisconnect").textContent=t("Disconnect Google","Отключить Google");
 $("dkDriveDisconnect").disabled=busy||!connected;
 $("dkDriveAutoLabel").textContent=t(
  "Automatically sync while this app is open (not while the iPhone web app is closed)",
  "Синхронизировать автоматически, пока приложение открыто (не в фоне на iPhone)");
 $("dkDriveAuto").disabled=busy;
 $("dkDriveScope").textContent=t(
  "Your private cloud sync stays in your own Google account. When folder export is enabled, you may additionally grant access to the Drive folder YOU choose; the app does not need access to all your files.",
  "Личные резервные копии хранятся в вашем аккаунте Google. При экспорте можно разрешить доступ к выбранной вами папке; доступ ко всем файлам не требуется.");
 if(!desktop){
  const visible=root.DKSeedBankDriveVisible;
  $("dkDriveChooseFolder").textContent=t("Choose my Google Drive folder","Выбрать папку Google Диска");
  $("dkDriveChooseFolder").disabled=busy||!ready()||!visible?.pickerReady();
  $("dkDriveCreateFolder").textContent=t("Create my DK Seed Bank folder","Создать свою папку DK Seed Bank");
  $("dkDriveCreateFolder").disabled=busy||!ready();
  $("dkDriveClearFolder").textContent=t("Forget selected folder","Забыть выбранную папку");
  $("dkDriveClearFolder").disabled=busy||!visible?.folder();
  const picked=visible?.folder();
  const open=$("dkDriveOpenFolder");
  open.hidden=!picked;
  if(picked){
   open.href="https://drive.google.com/drive/folders/"+encodeURIComponent(picked.id);
   open.textContent=t("Open this folder in Google Drive","Открыть эту папку в Google Диске");
  }
  $("dkDriveFolderState").textContent=picked?
   t("Visible photo folder: ","Папка с фотографиями: ")+picked.name:
   visible?.pickerReady()?
    t("Choose an existing folder or create a DK Seed Bank folder in your own Drive. Hidden sync remains active.","Выберите существующую папку или создайте папку DK Seed Bank в своём Диске. Скрытая синхронизация работает."):
    t("Visible folder connection is awaiting Google Picker setup by DK Softworks. Your existing photo sync still works.","Подключение видимой папки ожидает настройки Google Picker разработчиком. Текущая синхронизация фотографий работает.");
 }
 $("dkDriveState").textContent=lastStatus||(
  connected?(ready()?t("Connected. Ready to synchronize.","Подключено. Можно синхронизировать."):
   t("Google session expired. Reconnect to continue syncing.","Срок действия сеанса истёк. Подключитесь снова.")):
  t("Not connected. Nothing is uploaded until you authorize and start synchronization.",
    "Не подключено. Данные не загружаются без вашего разрешения."));
}
async function gis(){
 if(root.google?.accounts?.oauth2)return;
 if(!document.getElementById("dkDriveGIS")){
  const script=document.createElement("script");script.id="dkDriveGIS";
  script.src="https://accounts.google.com/gsi/client";script.async=true;
  document.head.appendChild(script);
 }
 for(let i=0;i<100;i++){
  if(root.google?.accounts?.oauth2)return;
  await new Promise(resolve=>setTimeout(resolve,120));
 }
 throw Error(t("Google Sign-In could not load. Check the internet connection.","Не удалось загрузить вход Google. Проверьте подключение."));
}
function connectWeb(clientId){
 return new Promise((resolve,reject)=>{
  try{
   if(!root.google?.accounts?.oauth2)throw Error("Google Sign-In has not loaded.");
   tokenClient=root.google.accounts.oauth2.initTokenClient({
    client_id:clientId,scope,prompt:"",
    callback:reply=>{
     if(!reply||reply.error||!reply.access_token){reject(Error("Google authorization was not granted."));return;}
     token=reply.access_token;
     expires=Date.now()+Math.max(0,Number(reply.expires_in)||3500)*1000;
     cacheSession();
     resolve();
    },
    error_callback:()=>reject(Error(t("Google sign-in was closed or blocked.","Вход Google отменён или заблокирован.")))
   });
   // Google shows consent when new access is genuinely required.
   tokenClient.requestAccessToken({prompt:""});
  }catch(error){reject(error);}
 });
}
async function driveRequest(url,method="GET",body,contentType="application/json"){
 if(desktop){
  const result=await root.DKSeedBankDesktop.googleDrive.request({url,method,body,contentType});
  if(!result.ok)throw Error("Google Drive API error ("+result.status+"): "+result.text.slice(0,300));
  return result.text;
 }
 if(!ready())throw Error(t("Google session expired. Reconnect first.","Сеанс Google истёк. Подключитесь снова."));
 const response=await fetch(url,{
  method,headers:{Authorization:"Bearer "+token,Accept:"application/json",
   ...(body!==undefined?{"Content-Type":contentType}:{})},body
 });
 if(response.status===401){token="";expires=0;connected=false;cacheSession();lastStatus=t("Google session expired. Reconnect Google Drive to continue.","Сеанс Google истёк. Переподключите Google Диск.");}
 if(!response.ok)throw Error("Google Drive API error ("+response.status+"): "+(await response.text()).slice(0,300));
 return response.text();
}
async function listFiles(){
 let pageToken="",found=[],page=0;
 do{
  const query=new URLSearchParams({spaces:"appDataFolder",
   q:"name contains '"+filePrefix+"' and trashed = false",
   pageSize:"100",fields:"nextPageToken,files(id,name,size,modifiedTime)"});
  if(pageToken)query.set("pageToken",pageToken);
  const result=JSON.parse(await driveRequest(requestPath+"?"+query.toString()));
  found.push(...(result.files||[]).filter(file=>file&&typeof file.id==="string"&&
   /^dk-seedbank-sync-v1-device-[a-z0-9-]+\.json$/.test(file.name)));
  pageToken=result.nextPageToken||"";
  if(++page>10||found.length>100)throw Error(t("Too many Drive sync files to merge safely.","Слишком много файлов синхронизации."));
 }while(pageToken);
 return found;
}
async function download(file){
 if(Number(file.size)>100000000)throw Error("Cloud snapshot exceeds the 100 MB limit.");
 const response=await driveRequest(requestPath+"/"+encodeURIComponent(file.id)+"?alt=media");
 if(response.length>130000000)throw Error("Cloud snapshot exceeds the size limit.");
 const parsed=JSON.parse(response);
 backup.validate(parsed);await backup.verify(parsed);
 return parsed;
}
async function upload(snapshot,id){
 const payload=JSON.stringify(snapshot);
 if(new Blob([payload]).size>95000000)throw Error(t(
  "This collection exceeds the 95 MB sync limit. Reduce large photos or export a backup.",
  "Коллекция превышает лимит синхронизации 95 МБ. Уменьшите фотографии."));
 if(id){
  await driveRequest(uploadPath+"/"+encodeURIComponent(id)+"?uploadType=media","PATCH",payload);
 }else{
  const boundary="dkseed-"+Math.random().toString(36).slice(2);
  const meta=JSON.stringify({name:filename,mimeType:"application/json",parents:["appDataFolder"]});
  const content="--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+meta+
   "\r\n--"+boundary+"\r\nContent-Type: application/json\r\n\r\n"+payload+
   "\r\n--"+boundary+"--\r\n";
  await driveRequest(uploadPath+"?uploadType=multipart&fields=id,name","POST",content,
   "multipart/related; boundary="+boundary);
 }
}
async function syncNow(){
 if(busy||!ready())return false;
 busy=true;lastStatus=t("Checking Drive snapshots and merging records…","Проверка файлов и объединение записей…");render();
 try{
  if(!navigator.onLine)throw Error(t("You are offline. Changes remain saved here.","Нет интернета. Изменения сохранены на устройстве."));
  const before=await core.exportForSync();
  backup.validate(before);
  const files=await listFiles();
  const cloud=await Promise.all(files.map(download));
  const result=merge.mergeSnapshots([...cloud,before]);
  backup.validate(result);
  const digest=await backup.checksum(result);
  if(digest)result.integrity={algorithm:"SHA-256",digest};
  // Never upload unless all remote data can be parsed and validated.
  // Keep a recoverable previous device snapshot in Google Drive until upload succeeds.
  let reloadNeeded=false;
  if(files.length&&cloud.length){
   const applied=await core.applySyncedBackup(result);
   reloadNeeded=!!applied?.reload;
  }
  const mine=files.find(file=>file.name===filename);
  await upload(result,mine?.id);
  let visibleMessage="";
  const visible=root.DKSeedBankDriveVisible;
  if(!desktop&&visible?.folder()){
   try{
    const published=await visible.mirror(token,result);
    visibleMessage=t(" · Visible photos: "," · Видимые фото: ")+published.photos;
   }catch(error){
    visibleMessage=t(" · Visible-folder copy FAILED: "," · Не удалось сохранить в папку: ")+error.message;
   }
  }
  saved.lastSync=new Date().toISOString();persist();
  lastStatus=t("✓ Synchronized with your Google Drive: ","✓ Синхронизировано с вашим Google Диском: ")+
   new Date(saved.lastSync).toLocaleString()+" · "+
   t("Plantings","Посадки")+": "+result.journal.length+" · "+
   t("Photos","Фото")+": "+result.photos.length+visibleMessage;
  render();
  if(reloadNeeded)setTimeout(()=>window.location.reload(),1200);
  return true;
 }catch(error){
  lastStatus=t("Sync failed; local records have not been intentionally deleted: ",
   "Ошибка синхронизации; локальные записи не удалялись намеренно: ")+error.message;
  render();return false;
 }finally{busy=false;render();}
}
async function connect(){
 if(busy||ready())return;
 const clientId=desktop?$("dkDriveClient").value.trim():webClientId;
 if(!clientRx.test(clientId)){
  lastStatus=t("Google Drive sign-in is not configured for this edition.",
   "Вход через Google Диск не настроен для этой версии.");render();return;
 }
 if(!desktop&&!root.google?.accounts?.oauth2){
  busy=true;lastStatus=t("Loading secure Google sign-in…","Загрузка входа Google…");render();
  try{await gis();}
  catch(error){lastStatus=error.message;busy=false;render();return;}
  busy=false;
 }
 busy=true;lastStatus=t("Opening Google sign-in…","Открытие входа Google…");render();
 try{
  if(desktop){
   await root.DKSeedBankDesktop.googleDrive.connect(clientId);
  }else await connectWeb(clientId);
  if(desktop)saved.clientId=clientId;
  persist();connected=true;cacheSession();
  lastStatus=t("Google connected. Use Sync now to transfer records.",
   "Google подключён. Нажмите «Синхронизировать сейчас» для передачи записей.");
 }catch(error){
  if(!desktop){token="";expires=0;connected=false;cacheSession();}
  lastStatus=t("Could not connect: ","Не удалось подключиться: ")+error.message;
 }
 finally{busy=false;render();}
}
async function disconnect(){
 if(busy)return;
 busy=true;render();
 try{
  if(desktop)await root.DKSeedBankDesktop.googleDrive.disconnect();
  else{
   if(token&&root.google?.accounts?.oauth2?.revoke)
    root.google.accounts.oauth2.revoke(token,()=>{});
   token="";expires=0;tokenClient=null;cacheSession();
  }
  connected=false;lastStatus=t("Disconnected. Local planting records remain on this device.",
   "Отключено. Локальные записи растений остаются на устройстве.");
 }catch(error){lastStatus=t("Could not disconnect: ","Не удалось отключить: ")+error.message;}
 finally{busy=false;render();}
}
if(!desktop)$("dkDriveCreateFolder").addEventListener("click",async event=>{
 event.preventDefault();event.stopPropagation();
 if(busy||!ready())return;
 busy=true;lastStatus=t("Creating a folder in your Google Drive…","Создаём папку в Google Диске…");render();
 try{
  const created=await root.DKSeedBankDriveVisible.createFolder(token);
  lastStatus=t("Folder created in your Drive: ","Папка создана в вашем Диске: ")+created.name+
   t(". Select Sync now to copy your photos and backup.",". Нажмите «Синхронизировать сейчас», чтобы сохранить фото и копию.");
 }catch(error){lastStatus=t("Could not create folder: ","Не удалось создать папку: ")+error.message;}
 finally{busy=false;render();}
});
if(!desktop)$("dkDriveClearFolder").addEventListener("click",event=>{
 event.preventDefault();event.stopPropagation();
 if(busy)return;
 root.DKSeedBankDriveVisible.clearFolder();
 lastStatus=t("Folder choice cleared. Drive files were not deleted.","Выбранная папка забыта. Файлы на Диске не удалены.");
 render();
});
if(!desktop)$("dkDriveChooseFolder").addEventListener("click",async event=>{
 event.preventDefault();
 event.stopPropagation();
 const pageY=window.scrollY;
 if(busy||!ready())return;
 const visible=root.DKSeedBankDriveVisible;
 if(!visible){lastStatus=t("Folder selection is unavailable in this version.","Выбор папки недоступен.");render();return;}
 try{
  const chosen=await visible.choose(token);
  if(!chosen&&Math.abs(window.scrollY-pageY)>20)window.scrollTo(0,pageY);
  if(chosen){lastStatus=t("Folder selected: ","Выбрана папка: ")+chosen.name+
   t(". Select Sync now to upload photos and the full backup.",". Нажмите «Синхронизировать сейчас», чтобы загрузить фотографии и копию.");
  }
 }catch(error){lastStatus=error.message;}
 render();
});
$("dkDriveConnect").addEventListener("click",connect);
$("dkDriveNow").addEventListener("click",syncNow);
$("dkDriveDisconnect").addEventListener("click",disconnect);
$("dkDriveAuto").addEventListener("change",event=>{
 saved.auto=event.target.checked;
 try{persist();}catch(error){}
 render();
});
$("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(render));
if(desktop){
 root.DKSeedBankDesktop.googleDrive.status().then(state=>{
  connected=!!state.connected;
  if(state.clientId&&!saved.clientId){saved.clientId=state.clientId;$("dkDriveClient").value=state.clientId;}
  render();
 }).catch(()=>render());
}
// Load Google's official sign-in library before the first user click.
if(!desktop&&navigator.onLine)gis().catch(()=>{});
syncTimer=setInterval(()=>{
 if(saved.auto&&connected&&ready()&&!busy&&document.visibilityState==="visible"&&navigator.onLine)
  syncNow();
},120000);
render();
root.DKSeedBankDriveSync=Object.freeze({syncNow,status:()=>({connected,ready:ready(),busy,auto:!!saved.auto})});
})(window);
