/* DK Seed Bank: user-selected visible Drive folder photo mirror.
   A folder must be explicitly selected through Google Picker. The existing
   hidden app-data sync remains the authoritative recovery copy. */
(function(root){
"use strict";
const SCOPE="https://www.googleapis.com/auth/drive.file";
const PREFIX="dk-seedbank-visible-folder-v1";
const DRIVE="https://www.googleapis.com/drive/v3/files";
const UPLOAD="https://www.googleapis.com/upload/drive/v3/files";
const config=root.DKSeedBankPickerConfig||{};
const apiKey=String(config.apiKey||"").trim();
const appId=String(config.appId||"990130733984").trim();
const lang=(en,ru)=>document.documentElement.lang==="ru"?ru:en;
let selected=null;
try{selected=JSON.parse(localStorage.getItem(PREFIX)||"null");}catch(e){}
if(!selected||typeof selected.id!=="string"||!/^[a-zA-Z0-9_-]{8,150}$/.test(selected.id))selected=null;
let verification="unchecked",lookupPromise=null;
const folder=()=>verification==="found"?selected:null;
const discoveryStatus=()=>verification;
function saveFolder(pick){
 const id=String(pick.id||"");
 if(!/^[a-zA-Z0-9_-]{8,150}$/.test(id))throw Error("Invalid Drive folder selection.");
 selected={id,name:String(pick.name||"DK Seed Bank").slice(0,160)};
 verification="found";
 try{localStorage.setItem(PREFIX,JSON.stringify(selected));}catch(error){}
 return selected;
}
// A small per-account pointer is kept in the user's PRIVATE Drive appDataFolder.
// No credentials, photos, or collection details are stored in this pointer.
const LINK_NAME="dk-seedbank-folder-link-v1.json";
async function readLink(token){
 const query=new URLSearchParams({
  spaces:"appDataFolder",
  q:"name = '"+LINK_NAME+"' and trashed = false",
  fields:"nextPageToken,files(id,name)",pageSize:"100"
 });
 const result=await (await request(token,DRIVE+"?"+query)).json();
 if(result.nextPageToken)throw Error("Folder link lookup could not be completed.");
 const links=(result.files||[]).filter(item=>item?.id&&item.name===LINK_NAME);
 if(links.length>1)throw Error("Several saved Drive folder links exist. Select your folder manually.");
 if(!links.length)return null;
 const value=await (await request(token,DRIVE+"/"+encodeURIComponent(links[0].id)+"?alt=media")).json();
 if(typeof value?.folderId!=="string"||!/^[a-zA-Z0-9_-]{8,150}$/.test(value.folderId))
  throw Error("The saved Drive folder link is invalid.");
 return {id:links[0].id,folderId:value.folderId};
}
async function remember(token,folderId){
 assertToken(token);
 if(!/^[a-zA-Z0-9_-]{8,150}$/.test(folderId))throw Error("Invalid folder ID.");
 const previous=await readLink(token);
 const payload=JSON.stringify({folderId});
 if(previous?.folderId===folderId)return;
 if(previous){
  await request(token,UPLOAD+"/"+encodeURIComponent(previous.id)+"?uploadType=media","PATCH",
   payload,"application/json");
  return;
 }
 const boundary="seedbank-folder-"+Math.random().toString(36).slice(2);
 const metadata=JSON.stringify({name:LINK_NAME,mimeType:"application/json",parents:["appDataFolder"]});
 const body="--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+metadata+
  "\r\n--"+boundary+"\r\nContent-Type: application/json\r\n\r\n"+payload+
  "\r\n--"+boundary+"--";
 await request(token,UPLOAD+"?uploadType=multipart&fields=id","POST",body,
  "multipart/related; boundary="+boundary);
}
async function folderById(token,id){
 const response=await fetch(DRIVE+"/"+encodeURIComponent(id)+
  "?fields=id,name,mimeType,trashed",{headers:{Authorization:"Bearer "+token,Accept:"application/json"}});
 if(!response.ok){
  if(response.status===403||response.status===404)return null;
  throw Error("Google Drive folder verification failed ("+response.status+").");
 }
 const file=await response.json();
 return file.id===id&&!file.trashed&&file.mimeType==="application/vnd.google-apps.folder"?file:null;
}

function resetVerification(){verification="unchecked";}
async function discover(token){
 if(lookupPromise)return lookupPromise;
 lookupPromise=(async()=>{
  assertToken(token);
  verification="checking";
  try{
   // The private account-wide link takes precedence over an old device's
   // saved folder selection. An old device may otherwise overwrite the link.
   const linked=await readLink(token);
   if(linked){
    const linkedFolder=await folderById(token,linked.folderId);
    if(linkedFolder)return {status:"found",folder:saveFolder(linkedFolder)};
    verification="unavailable";
    selected=null;
    return {status:"unavailable",folder:null};
   }
   // No shared link exists yet: verify this device's previous folder and
   // register it so the next device can find the same ID.
   if(selected){
    const old=await folderById(token,selected.id);
    if(old){
     const result=saveFolder(old);
     try{await remember(token,result.id);}catch(error){/* Existing folder still usable. */}
     return {status:"found",folder:result};
    }
   }
   // drive.file reveals only folders created or explicitly opened with this app.
   // Use a unique Drive ID to identify a folder, not its display name alone.
   const found=[];let page="",pages=0;
   do{
    const query=new URLSearchParams({spaces:"drive",
     q:"name = 'DK Seed Bank' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
     fields:"nextPageToken,files(id,name,mimeType,trashed)",pageSize:"100"});
    if(page)query.set("pageToken",page);
    const json=await (await request(token,DRIVE+"?"+query)).json();
    for(const item of json.files||[]){
     if(item?.id&&item.name==="DK Seed Bank"&&item.mimeType==="application/vnd.google-apps.folder"&&
        !item.trashed&&!found.some(f=>f.id===item.id))found.push(item);
    }
    page=json.nextPageToken||"";
    if(++pages>10||found.length>100)throw Error("Too many matching folders to check safely.");
   }while(page);
   if(found.length===1){
    const result=saveFolder(found[0]);
    try{await remember(token,result.id);}catch(error){/* Do not fail an existing folder. */}
    return {status:"found",folder:result};
   }
   selected=null;
   try{localStorage.removeItem(PREFIX);}catch(error){}
   verification=found.length?"multiple":"missing";
   return {status:verification,folder:null};
  }catch(error){verification="error";throw error;}
 })();
 try{return await lookupPromise;}
 finally{lookupPromise=null;}
}
async function createFolder(token){
 // Recheck on every click: other devices may have created this folder already.
 const checked=await discover(token);
 if(checked.status==="found")return {...checked.folder,created:false};
 if(checked.status!=="missing")throw Error("Multiple DK Seed Bank folders found. Select the existing folder.");
 const response=await request(token,DRIVE+"?fields=id,name,mimeType","POST",
  JSON.stringify({name:"DK Seed Bank",mimeType:"application/vnd.google-apps.folder"}),"application/json");
 const item=await response.json();
 if(!item.id||item.mimeType!=="application/vnd.google-apps.folder")throw Error("Google did not return a new folder.");
 const created=saveFolder(item);
 try{await remember(token,created.id);}
 catch(error){/* The folder itself was created. A future scan can recover it. */}
 return {...created,created:true};
}
function clearFolder(){
 selected=null;verification="unchecked";
 try{localStorage.removeItem(PREFIX);}catch(e){}
}
function loadPicker(){
 return new Promise((resolve,reject)=>{
  if(root.google?.picker){resolve();return;}
  if(!root.gapi){
   const script=document.createElement("script");
   script.src="https://apis.google.com/js/api.js";
   script.async=true;
   script.onload=()=>root.gapi.load("picker",{callback:resolve,onerror:()=>reject(Error("Google folder picker failed to load."))});
   script.onerror=()=>reject(Error("Google folder picker could not be loaded."));
   document.head.appendChild(script);
  }else root.gapi.load("picker",{callback:resolve,onerror:()=>reject(Error("Google folder picker failed to load."))});
 });
}
async function choose(token){
 if(!apiKey||!appId)throw Error(lang("The Google folder picker is not configured.","Выбор папки Google Диска не настроен."));
 if(!token)throw Error(lang("Reconnect your Google Drive first.","Сначала подключите Google Диск."));
 // Render a fixed, closable in-app dialog immediately. Google's normal modal
 // has been positioning itself at the end of the seed catalog for some users.
 if(document.getElementById("dkDrivePickerOverlay"))return null;
 const overlay=document.createElement("div");
 overlay.id="dkDrivePickerOverlay";
 overlay.className="dk-drive-picker-overlay";
 overlay.setAttribute("role","presentation");
 const dialog=document.createElement("div");
 dialog.className="dk-drive-picker-dialog";
 dialog.setAttribute("role","dialog");
 dialog.setAttribute("aria-modal","true");
 dialog.setAttribute("aria-label",lang("Choose Google Drive folder","Выберите папку Google Диска"));
 const bar=document.createElement("div");bar.className="dk-drive-picker-bar";
 const heading=document.createElement("strong");
 heading.textContent=lang("Choose a Google Drive folder","Выберите папку Google Диска");
 const close=document.createElement("button");
 close.type="button";close.className="dk-drive-picker-close";
 close.textContent=lang("Close","Закрыть");
 const create=document.createElement("button");
 create.type="button";create.className="dk-drive-picker-close";
 create.textContent=lang("Create my DK Seed Bank folder instead","Создать свою папку DK Seed Bank");
 create.hidden=verification!=="missing";
 const retry=document.createElement("button");
 retry.type="button";retry.className="dk-drive-picker-close";
 retry.disabled=true;
 retry.textContent=lang("Retry folders","Повторить загрузку");
 const message=document.createElement("div");
 message.className="dk-drive-picker-message";
 message.setAttribute("role","status");
 message.textContent=lang("Loading Google Drive folders…","Загрузка папок Google Диска…");
 const frame=document.createElement("iframe");
 frame.className="dk-drive-picker-frame";
 frame.title=lang("Google Drive folder selection","Выбор папки Google Диска");
 frame.referrerPolicy="strict-origin-when-cross-origin";
 frame.setAttribute("allow","clipboard-read; clipboard-write");
 bar.append(heading,retry,create,close);
 dialog.append(bar,message,frame);
 overlay.appendChild(dialog);
 document.body.appendChild(overlay);
 const oldFocus=document.activeElement;
 const oldScroll=window.scrollY;
 close.focus({preventScroll:true});
 return new Promise((resolve,reject)=>{
  let done=false;
  const clean=()=>{
   if(done)return false;
   done=true;
   document.removeEventListener("keydown",onKey);
   overlay.remove();
   try{oldFocus?.focus({preventScroll:true});}catch(ignore){}
   if(Math.abs(window.scrollY-oldScroll)>5)window.scrollTo(0,oldScroll);
   return true;
  };
  const endPick=value=>{if(clean())resolve(value);};
  create.addEventListener("click",async()=>{
   create.disabled=true;
   message.textContent=lang("Creating a folder in your own Google Drive…","Создаём папку в вашем Google Диске…");
   try{endPick(await createFolder(token));}
   catch(error){fail(error);create.disabled=false;}
  });
  const fail=error=>{
   // Keep a clear failure message visible instead of an invisible picker.
   message.textContent=lang("Google folder picker could not open: ","Не удалось открыть выбор папки: ")+error.message;
   message.setAttribute("role","alert");
   frame.hidden=true;
  };
  function onKey(event){if(event.key==="Escape"){event.preventDefault();endPick(null);}}
  document.addEventListener("keydown",onKey);
  close.addEventListener("click",()=>endPick(null));
  let pickerUrl="";
  retry.addEventListener("click",()=>{
   if(!pickerUrl)return;
   frame.hidden=false;
   message.textContent=lang("Retrying Google Drive folders after permission changes…",
    "Повторная загрузка папок Google Диска после изменения разрешений…");
   // The embedded Google account iframe may need reloading after cookies are allowed.
   frame.src="about:blank";
   setTimeout(()=>{if(!done)frame.src=pickerUrl;},120);
  });
  // PickerBuilder.toUri() is Google's documented iframe embedding API.
  // The embedded dialog does not depend on Google positioning a modal.
  loadPicker().then(()=>{
   if(done)return;
   try{
    const gp=root.google?.picker;
    if(!gp?.PickerBuilder)throw Error("Google Picker library did not initialize.");
    const view=new gp.DocsView(gp.ViewId.FOLDERS)
     .setIncludeFolders(true).setSelectFolderEnabled(true)
     .setMimeTypes("application/vnd.google-apps.folder")
     .setMode(gp.DocsViewMode.LIST);
    const builder=new gp.PickerBuilder()
     .addView(view).setOAuthToken(token).setDeveloperKey(apiKey)
     .setAppId(appId).setOrigin(window.location.origin)
     .setCallback(data=>{
      if(done)return;
      if(data?.action===gp.Action.PICKED){
       const item=(data.docs||[])[0];
       try{
        if(!item?.id)throw Error("Google did not return a folder.");
        endPick(saveFolder({id:item.id,name:item.name}));
       }catch(error){fail(error);}
      }else if(data?.action===gp.Action.CANCEL)endPick(null);
      else if(data?.action===gp.Action.ERROR)fail(Error("Google Picker returned an error. Check third-party content blocking."));
     });
    if(typeof builder.toUri!=="function")throw Error("This Google Picker cannot be embedded.");
    pickerUrl=builder.toUri().toString();
    if(!/^https:\/\//.test(pickerUrl))throw Error("Google returned an invalid folder picker address.");
    frame.src=pickerUrl;
    retry.disabled=false;
    message.textContent=lang(
     "Select a folder or create a DK Seed Bank folder in your Drive if Google denies access.",
     "Выберите папку или создайте папку DK Seed Bank, если Google отказывает в доступе.");
   }catch(error){fail(error);}
  }).catch(error=>{if(!done)fail(error);});
 });
}
function assertToken(token){if(typeof token!=="string"||!token)throw Error("Google Drive must be connected first.");}
async function request(token,url,method="GET",body,contentType){
 assertToken(token);
 const headers={Authorization:"Bearer "+token,Accept:"application/json"};
 if(contentType)headers["Content-Type"]=contentType;
 const response=await fetch(url,{method,headers,body});
 if(!response.ok){
  const message=(await response.text()).slice(0,320);
  throw Error("Visible Google Drive folder error ("+response.status+"): "+message);
 }
 return response;
}
async function list(token,parent){
 const all=[];let page="";
 do{
  const p=new URLSearchParams({q:"'"+parent+"' in parents and trashed = false",
   fields:"nextPageToken,files(id,name,mimeType,size,description)",pageSize:"100"});
  if(page)p.set("pageToken",page);
  const json=await (await request(token,DRIVE+"?"+p)).json();
  all.push(...(json.files||[]));
  page=json.nextPageToken||"";
  if(all.length>1000)throw Error("Visible Drive folder has too many files to scan safely.");
 }while(page);
 return all;
}
async function write(token,existing,name,mimeType,parent,blob,digest){
 // The upload session keeps binary photo data intact.
 const url=existing?UPLOAD+"/"+encodeURIComponent(existing.id)+"?uploadType=resumable&fields=id,name":
  UPLOAD+"?uploadType=resumable&fields=id,name";
 const headers={Authorization:"Bearer "+token,"Content-Type":"application/json; charset=UTF-8",
   "X-Upload-Content-Type":mimeType,"X-Upload-Content-Length":String(blob.size)};
 const metadata=existing?{description:"dk-seedbank-sha256:"+digest}:{name,mimeType,parents:[parent],description:"dk-seedbank-sha256:"+digest};
 const start=await fetch(url,{method:existing?"PATCH":"POST",headers,body:JSON.stringify(metadata)});
 if(!start.ok)throw Error("Could not begin visible Drive photo upload ("+start.status+").");
 const location=start.headers.get("Location");
 if(!location)throw Error("Google did not return a photo upload location.");
 const upload=await fetch(location,{method:"PUT",headers:{"Content-Type":mimeType,Authorization:"Bearer "+token},body:blob});
 if(!upload.ok)throw Error("Could not finish visible Drive photo upload ("+upload.status+").");
 return upload.json();
}
async function digest(value){
 const bytes=typeof value==="string"?new TextEncoder().encode(value):await value.arrayBuffer();
 const result=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(result)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function friendlyName(snapshot,key){
 let label="Plant photograph";
 if(key.startsWith("journal-photo|")){
  const parts=key.split("|");
  let id="";
  try{id=decodeURIComponent(parts[1]||"");}catch(e){}
  const journal=(snapshot.journal||[]).find(entry=>entry.id===id);
  const meta=(journal?.growthPhotos||[]).find(p=>p.id===parts[2]);
  if(journal)label=[journal.plant||"Plant",meta?.date||journal.date||"",meta?.stage||"growth"].filter(Boolean).join(" - ");
 }else{
  const packet=key.endsWith("|packet");
  const clean=packet?key.slice(0,-7):key;
  const sep=clean.indexOf("|");
  label=(sep>=0?clean.slice(sep+1):clean)+" - "+(packet?"seed packet":"plant");
 }
 return label.replace(/[\/\\<>:"|?*\u0000-\u001f]/g," ").replace(/\s+/g," ").trim().slice(0,104)||"Plant photograph";
}
async function photoName(snapshot,key,mime){
 const ext=mime==="image/jpeg"?"jpg":mime==="image/png"?"png":"webp";
 return friendlyName(snapshot,key)+" - "+(await digest(key)).slice(0,12)+"."+ext;
}
async function mirror(token,snapshot){
 if(!selected)return {skipped:true};
 if(!snapshot||!Array.isArray(snapshot.photos))throw Error("Invalid collection snapshot.");
 const target=selected.id;
 const existing=await list(token,target); // verifies selected folder is accessible.
 const name="DK Seed Bank - full backup.json";
 const backup=existing.find(f=>f.name===name);
 // Place the actual image files directly in the user's selected folder.
 const photoNames=new Map(existing.filter(f=>f.mimeType?.startsWith("image/")).map(f=>[f.name,f]));
 let saved=0;
 for(const photo of snapshot.photos){
  if(!photo||typeof photo.data!=="string"||typeof photo.key!=="string")continue;
  const mime=(photo.data.match(/^data:(image\/(?:png|jpeg|webp));base64,/)||[])[1];
  if(!mime)throw Error("An uploaded photograph is not in a supported format.");
  const filename=await photoName(snapshot,photo.key,mime);
  const image=await (await fetch(photo.data)).blob();
  const hash=await digest(image);
  const prev=photoNames.get(filename);
  // Only skip a photo if the existing file was uploaded by us and matches.
  if(prev?.description==="dk-seedbank-sha256:"+hash){saved++;continue;}
  await write(token,prev,filename,mime,target,image,hash);
  saved++;
 }
 const data=new Blob([JSON.stringify(snapshot)],{type:"application/json"});
 await write(token,backup,name,"application/json",target,data,await digest(data));
 return {skipped:false,photos:saved,folder:target,name:selected.name};
}
root.DKSeedBankDriveVisible=Object.freeze({scope:SCOPE,choose,discover,remember,discoveryStatus,resetVerification,createFolder,clearFolder,folder,mirror,pickerReady:()=>!!apiKey&&!!appId});
})(window);
