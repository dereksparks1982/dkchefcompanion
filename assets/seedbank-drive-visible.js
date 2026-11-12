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
const appId=String(config.appId||"").trim();
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
   fields:"nextPageToken,files(id,name,mimeType,size)",pageSize:"100"});
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
async function createResumable(token,name,mimeType,parent){
 const response=await request(token,UPLOAD+"?uploadType=resumable&fields=id,name","POST",
  JSON.stringify({name,mimeType,parents:[parent]}),"application/json; charset=UTF-8");
 const location=response.headers.get("Location");
 if(!location)throw Error("Google did not return an upload location.");
 return location;
}
async function write(token,existing,name,mimeType,parent,blob){
 // The upload session keeps binary photo data intact.
 const url=existing?UPLOAD+"/"+encodeURIComponent(existing.id)+"?uploadType=resumable&fields=id,name":
  UPLOAD+"?uploadType=resumable&fields=id,name";
 const headers={Authorization:"Bearer "+token,"Content-Type":"application/json; charset=UTF-8",
   "X-Upload-Content-Type":mimeType,"X-Upload-Content-Length":String(blob.size)};
 const metadata=existing?{}:{name,mimeType,parents:[parent]};
 const start=await fetch(url,{method:existing?"PATCH":"POST",headers,body:JSON.stringify(metadata)});
 if(!start.ok)throw Error("Could not begin visible Drive photo upload ("+start.status+").");
 const location=start.headers.get("Location");
 if(!location)throw Error("Google did not return a photo upload location.");
 const upload=await fetch(location,{method:"PUT",headers:{"Content-Type":mimeType},body:blob});
 if(!upload.ok)throw Error("Could not finish visible Drive photo upload ("+upload.status+").");
 return upload.json();
}
function safeName(key){
 // UTF-8 filenames with stable percent-encoding avoid collisions.
 return "photo-"+Array.from(new TextEncoder().encode(key)).map(b=>b.toString(16).padStart(2,"0")).join("")+".jpg";
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
  const filename=safeName(photo.key).replace(/\.jpg$/,"."+mime.split("/")[1]);
  const image=await (await fetch(photo.data)).blob();
  const prev=photoNames.get(filename);
  // Update existing files so that new images are actually reflected.
  await write(token,prev,filename,mime,photoFolder.id,image);
  saved++;
 }
 const data=new Blob([JSON.stringify(snapshot)],{type:"application/json"});
 await write(token,backup,name,"application/json",target,data);
 return {skipped:false,photos:saved,folder:target,name:selected.name};
}
root.DKSeedBankDriveVisible=Object.freeze({scope:SCOPE,choose,folder,mirror,pickerReady:()=>!!apiKey&&!!appId});
})(window);
