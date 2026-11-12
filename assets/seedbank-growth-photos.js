/* DK Seed Bank: dated, per-planting photo history with mobile camera capture. */
(function(){
"use strict";
const core=window.DKSeedBankCore,backup=window.DKSeedBankBackup;
const list=document.getElementById("journalEntries");
if(!core||!backup||!list)return;
const tr=(en,ru)=>document.documentElement.lang==="ru"?ru:en;
const esc=value=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const stages={
 progress:["Growth update","Изменения роста"],
 sown:["Planting / pot","Посадка / горшок"],
 germinating:["Germination","Прорастание"],
 seedling:["Seedling","Росток"],
 vegetative:["Leaf growth","Рост листьев"],
 flowering:["Flowering","Цветение"],
 fruiting:["Fruit development","Развитие плодов"],
 harvest:["Harvest","Сбор урожая"],
 other:["Other stage","Другой этап"]
};
const urls=new Map(),visible=new Map();
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
let dbPromise=null;
function openMedia(){
 if(!("indexedDB" in window))return Promise.resolve(null);
 if(dbPromise)return dbPromise;
 dbPromise=new Promise(resolve=>{
  try{
   const request=indexedDB.open("dk-seedbank-media",1);
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("photos"))request.result.createObjectStore("photos");};
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>resolve(null);
   request.onblocked=()=>resolve(null);
  }catch(error){resolve(null);}
 });
 return dbPromise;
}
async function readBlob(key){
 const db=await openMedia();if(!db)return null;
 return new Promise(resolve=>{
  try{
   const request=db.transaction("photos","readonly").objectStore("photos").get(key);
   request.onsuccess=()=>resolve(request.result||null);
   request.onerror=()=>resolve(null);
  }catch(error){resolve(null);}
 });
}
async function saveBlob(key,blob){
 const db=await openMedia();if(!db)return false;
 return new Promise(resolve=>{
  try{
   const tx=db.transaction("photos","readwrite");
   tx.objectStore("photos").put(blob,key);
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>resolve(false);
   tx.onabort=()=>resolve(false);
  }catch(error){resolve(false);}
 });
}
async function removeBlob(key){
 const db=await openMedia();if(!db)return false;
 return new Promise(resolve=>{
  try{
   const tx=db.transaction("photos","readwrite");
   tx.objectStore("photos").delete(key);
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>resolve(false);
   tx.onabort=()=>resolve(false);
  }catch(error){resolve(false);}
 });
}
function forget(key){
 const url=urls.get(key);
 if(url){URL.revokeObjectURL(url);urls.delete(key);}
}
function sortedEntries(){
 return core.journal().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.plant).localeCompare(String(b.plant)));
}
function photoMeta(entry,photoId){
 return (entry.growthPhotos||[]).find(photo=>photo.id===photoId);
}
function fields(entry){
 return '<div class="dk-growth-fields">'+
  '<label>'+tr("Photo date","Дата фотографии")+'<input data-growth-date type="date" value="'+today()+'" required></label>'+
  '<label>'+tr("Growth stage","Этап роста")+'<select data-growth-stage>'+
  Object.entries(stages).map(([key,label])=>'<option value="'+key+'">'+esc(tr(...label))+'</option>').join("")+'</select></label>'+
  '<label class="dk-growth-note">'+tr("Notes (optional)","Примечания (необязательно)")+
  '<input data-growth-note type="text" maxlength="300" placeholder="'+esc(tr("e.g. first leaves, repotted, 15 cm tall","например, первые листья, пересадка, высота 15 см"))+'"></label></div>';
}
function renderEntry(card,entry){
 if(!card||typeof entry.id!=="string")return;
 let area=card.querySelector(".dk-growth");
 if(!area){
  area=document.createElement("section");
  area.className="dk-growth";
  area.setAttribute("data-dk-no-translate","");
  const buttons=card.querySelector(".journal-actions");
  if(buttons)card.insertBefore(area,buttons);else card.appendChild(area);
 }
 area.dataset.growthEntryId=entry.id;
 const photos=Array.isArray(entry.growthPhotos)?entry.growthPhotos.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)):[];
 const limit=visible.get(entry.id)||24;
 area.innerHTML='<h4>📷 '+tr("Plant growth photos","Фотографии роста")+
  ' <small>'+photos.length+' '+tr(photos.length===1?"photo":"photos",photos.length===1?"фото":"фото")+'</small></h4>'+
  fields(entry)+
  '<div class="dk-growth-actions">'+
  '<label class="dk-growth-button">📷 '+tr("Take photo","Сделать фото")+
  '<input data-growth-camera type="file" accept="image/*" capture="environment" aria-label="'+esc(tr("Take a photograph with your camera","Сделать фотографию камерой"))+'"></label>'+
  '<label class="dk-growth-button">🖼 '+tr("Choose photo","Выбрать фото")+
  '<input data-growth-upload type="file" accept="image/*" aria-label="'+esc(tr("Choose an existing photograph","Выбрать готовую фотографию"))+'"></label></div>'+
  '<p class="dk-growth-status" role="status" aria-live="polite">'+
  (photos.length?"":tr("Photograph the pot, seedling, or plant to start its growth history.","Сфотографируйте горшок, росток или растение, чтобы начать историю роста."))+'</p>'+
  '<div class="dk-growth-gallery"></div>';
 const gallery=area.querySelector(".dk-growth-gallery");
 for(const photo of photos.slice(0,limit)){
  const key=backup.growthPhotoKey(entry.id,photo.id);
  const figure=document.createElement("figure");figure.className="dk-growth-item";
  figure.innerHTML='<button type="button" class="dk-growth-image" data-growth-view="'+esc(photo.id)+'" aria-label="'+esc(tr("View photograph","Посмотреть фотографию"))+'">'+
   '<span class="dk-growth-loading">'+tr("Loading photo…","Загрузка фото…")+'</span></button>'+
   '<figcaption><strong>'+esc(photo.date)+'</strong> · '+esc(tr(...(stages[photo.stage]||stages.other)))+
   (photo.note?'<p>'+esc(photo.note)+'</p>':'')+
   '<button type="button" class="dk-growth-remove" data-growth-delete="'+esc(photo.id)+'">'+tr("Remove photo","Удалить фото")+'</button></figcaption>';
  gallery.appendChild(figure);
  const container=figure.querySelector(".dk-growth-image");
  const paint=url=>{
   if(!container.isConnected)return;
   container.textContent="";
   const image=document.createElement("img");
   image.src=url;image.loading="lazy";image.alt=entry.plant+" · "+photo.date;
   container.appendChild(image);
  };
  if(urls.has(key)){paint(urls.get(key));continue;}
  readBlob(key).then(blob=>{
   if(!blob||!container.isConnected)return;
   const objectURL=URL.createObjectURL(blob);
   urls.set(key,objectURL);paint(objectURL);
  });
 }
 if(photos.length>limit){
  const more=document.createElement("button");more.type="button";more.className="dk-growth-more";
  more.dataset.growthMore=entry.id;
  more.textContent=tr("Show more photographs","Показать больше фотографий")+
   " ("+(photos.length-limit)+")";
  gallery.after(more);
 }
}
function render(){
 const entries=sortedEntries(),cards=Array.from(list.querySelectorAll(".journal-entry"));
 cards.forEach((card,i)=>{if(entries[i])renderEntry(card,entries[i]);});
}
function status(area,text){
 const label=area?.querySelector(".dk-growth-status");if(label)label.textContent=text;
}
async function compress(file){
 if(!file.type.startsWith("image/"))throw Error(tr("Choose a photograph, not another file type.","Выберите изображение."));
 if(file.size>30000000)throw Error(tr("Photograph exceeds 30 MB.","Фотография превышает 30 МБ."));
 const source=URL.createObjectURL(file);
 let image;
 try{
  image=await new Promise((resolve,reject)=>{
   const img=new Image();
   img.onload=()=>resolve(img);
   img.onerror=()=>reject(Error(tr("This photo format could not be opened. Try JPEG or PNG.","Не удалось открыть этот формат. Выберите JPEG или PNG.")));
   img.src=source;
  });
  if(!image.naturalWidth||!image.naturalHeight)throw Error(tr("Could not read photograph dimensions.","Не удалось определить размер фотографии."));
  const canvas=document.createElement("canvas");
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
  canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const ctx=canvas.getContext("2d");
  if(!ctx)throw Error(tr("Photo conversion is unavailable.","Обработка фотографии недоступна."));
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",0.82));
  if(!blob||blob.size>6000000)throw Error(tr("Photo could not be resized for storage.","Не удалось уменьшить фотографию для сохранения."));
  return blob;
 }finally{URL.revokeObjectURL(source);}
}
function newPhotoID(){
 const random=window.crypto?.randomUUID?.().replace(/-/g,"").slice(0,20)||
  Math.random().toString(36).slice(2,18);
 return "photo-"+Date.now().toString(36)+"-"+random;
}
async function addPhoto(input){
 const area=input.closest(".dk-growth"),entryId=area?.dataset.growthEntryId;
 const entry=core.journal().find(p=>p.id===entryId);
 const file=input.files?.[0];
 if(!area||!entry||!file)return;
 if((entry.growthPhotos||[]).length>=200){status(area,tr("Limit of 200 photos per planting reached.","Для одной посадки доступно не более 200 фото."));return;}
 const date=area.querySelector("[data-growth-date]").value;
 const stage=area.querySelector("[data-growth-stage]").value;
 const note=area.querySelector("[data-growth-note]").value.trim().slice(0,300);
 if(!/^(19|20|21)\d\d-\d\d-\d\d$/.test(date)||!Object.hasOwn(stages,stage)){
  status(area,tr("Choose a valid date and growth stage.","Выберите правильную дату и этап роста."));return;
 }
 const files=area.querySelectorAll('input[type="file"]');
 files.forEach(el=>el.disabled=true);
 status(area,tr("Saving photo on this device…","Сохранение фотографии на устройстве…"));
 let key=null;
 try{
  const blob=await compress(file),meta={id:newPhotoID(),date,stage,note};
  key=backup.growthPhotoKey(entryId,meta.id);
  if(!await saveBlob(key,blob))throw Error(tr("Photo storage is full or unavailable. Export a backup and check device storage.","Хранилище фотографий недоступно или заполнено. Проверьте память устройства."));
  if(!core.addJournalGrowthPhoto(entryId,meta)){
   await removeBlob(key);throw Error(tr("Planting record could not be saved.","Не удалось сохранить запись посадки."));
  }
  // Core redraws the journal after saving the metadata.
 }catch(error){status(area,tr("Could not add photo: ","Не удалось добавить фото: ")+error.message);}
 finally{input.value="";files.forEach(el=>el.disabled=false);}
}
async function deletePhoto(button){
 const area=button.closest(".dk-growth"),entryId=area?.dataset.growthEntryId;
 const entry=core.journal().find(x=>x.id===entryId);
 const meta=entry&&photoMeta(entry,button.dataset.growthDelete);
 if(!meta)return;
 if(!window.confirm(tr("Remove this photograph from the planting history?","Удалить эту фотографию из истории посадки?")))return;
 const key=backup.growthPhotoKey(entryId,meta.id);
 if(!core.removeJournalGrowthPhoto(entryId,meta)){
  status(area,tr("Could not update the planting record.","Не удалось изменить запись посадки."));return;
 }
 forget(key);
 if(!await removeBlob(key))window.alert(tr(
  "Photo removed from timeline, but its stored file could not be deleted. Export a fresh backup.",
  "Фото удалено из истории, но файл не удалось удалить. Сохраните новую резервную копию."));
}
function preview(button){
 const area=button.closest(".dk-growth"),entryId=area?.dataset.growthEntryId;
 const entry=core.journal().find(x=>x.id===entryId);
 const meta=entry&&photoMeta(entry,button.dataset.growthView);
 if(!meta)return;
 const url=urls.get(backup.growthPhotoKey(entryId,meta.id));if(!url)return;
 let dialog=document.getElementById("dkGrowthPreview");
 if(!dialog){
  dialog=document.createElement("dialog");dialog.id="dkGrowthPreview";dialog.className="dk-growth-preview";
  dialog.innerHTML='<button type="button" class="dk-growth-preview-close" aria-label="Close">✕</button><img alt=""><p></p>';
  document.body.appendChild(dialog);
  dialog.querySelector("button").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
 }
 dialog.querySelector("img").src=url;
 dialog.querySelector("img").alt=entry.plant+" "+meta.date;
 dialog.querySelector("p").textContent=entry.plant+" · "+meta.date+" · "+tr(...(stages[meta.stage]||stages.other))+(meta.note?" · "+meta.note:"");
 if(!dialog.open)dialog.showModal();
}
list.addEventListener("change",event=>{
 const input=event.target.closest("[data-growth-camera],[data-growth-upload]");
 if(input)addPhoto(input);
});
list.addEventListener("click",event=>{
 const remove=event.target.closest("[data-growth-delete]");
 if(remove){deletePhoto(remove);return;}
 const view=event.target.closest("[data-growth-view]");
 if(view){preview(view);return;}
 const more=event.target.closest("[data-growth-more]");
 if(more){visible.set(more.dataset.growthMore,(visible.get(more.dataset.growthMore)||24)+24);render();}
});
document.addEventListener("dkseedbank:journal-rendered",render);
document.addEventListener("dkseedbank:journal-deleted",event=>{
 const entry=event.detail?.entry;if(!entry)return;
 for(const photo of entry.growthPhotos||[]){
  const key=backup.growthPhotoKey(entry.id,photo.id);
  forget(key);removeBlob(key);
 }
 visible.delete(entry.id);
});
document.addEventListener("dkseedbank:backup-restored",()=>{
 for(const key of urls.keys())forget(key);
 render();
});
document.getElementById("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(render));
window.addEventListener("beforeunload",()=>{for(const key of urls.keys())forget(key);});
render();
window.DKSeedBankGrowthPhotos=Object.freeze({render});
})();
