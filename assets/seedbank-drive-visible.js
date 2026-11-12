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
const folder=()=>selected;
function saveFolder(pick){
 const id=String(pick.id||"");
 if(!/^[a-zA-Z0-9_-]{8,150}$/.test(id))throw Error("Invalid Drive folder selection.");
 selected={id,name:String(pick.name||"DK Seed Bank").slice(0,160)};
 localStorage.setItem(PREFIX,JSON.stringify(selected));
 return selected;
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
 if(!apiKey||!appId)throw Error(lang("DK Softworks still needs to enable Google's folder picker for this website. Existing photo sync remains safe.","Для выбора папки разработчику нужно включить Google Picker. Существующая синхронизация сохранена."));
 if(!token)throw Error("Reconnect your Google Drive first.");
 await loadPicker();
 return new Promise((resolve,reject)=>{
  try{
   const view=new root.google.picker.DocsView(root.google.picker.ViewId.FOLDERS)
    .setIncludeFolders(true).setSelectFolderEnabled(true)
    .setMimeTypes("application/vnd.google-apps.folder")
    .setMode(root.google.picker.DocsViewMode.LIST);
   const picker=new root.google.picker.PickerBuilder()
    .addView(view).setOAuthToken(token).setDeveloperKey(apiKey).setAppId(appId)
    .setOrigin(window.location.origin)
    .setCallback(data=>{
     if(data.action===root.google.picker.Action.PICKED){
      const item=(data.docs||[])[0];
      try{resolve(saveFolder({id:item.id,name:item.name}));}catch(e){reject(e);}
     }else if(data.action===root.google.picker.Action.CANCEL)resolve(null);
    }).build();
   picker.setVisible(true);
  }catch(e){reject(e);}
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
async function createItem(token,name,mimeType,parent){
 const metadata={name,mimeType,parents:[parent]};
 return (await (await request(token,DRIVE+"?fields=id,name,mimeType","POST",
  JSON.stringify(metadata),"application/json")).json());
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
 const photoFolderName="DK Seed Bank Photographs";
 let photoFolder=existing.find(f=>f.name===photoFolderName&&f.mimeType==="application/vnd.google-apps.folder");
 if(!photoFolder)photoFolder=await createItem(token,photoFolderName,"application/vnd.google-apps.folder",target);
 const photoFiles=await list(token,photoFolder.id);
 const photoNames=new Map(photoFiles.map(f=>[f.name,f]));
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
  await write(token,prev,filename,mime,photoFolder.id,image,hash);
  saved++;
 }
 const data=new Blob([JSON.stringify(snapshot)],{type:"application/json"});
 await write(token,backup,name,"application/json",target,data,await digest(data));
 return {skipped:false,photos:saved,folder:target,name:selected.name};
}
root.DKSeedBankDriveVisible=Object.freeze({scope:SCOPE,choose,folder,mirror,pickerReady:()=>!!apiKey&&!!appId});
})(window);
