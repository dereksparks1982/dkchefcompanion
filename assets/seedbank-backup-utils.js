/* DK Seed Bank backup validation, summaries and optional SHA-256 integrity. */
(function(root){
"use strict";
const isObject=value=>value!==null&&typeof value==="object"&&!Array.isArray(value);
const array=value=>Array.isArray(value)?value:[];
const MAX_PHOTOS=3000;
// Base64 uses roughly 4/3 the uploaded binary size, plus a data URL header.
const MAX_PHOTO_BYTES=8300000;
const MAX_TOTAL_PHOTO_CHARS=130000000;
const GROWTH_PREFIX="journal-photo|";
const GROWTH_STAGES=["progress","sown","germinating","seedling","vegetative","flowering","fruiting","harvest","other"];
function growthPhotoKey(entryId,photoId){
 if(typeof entryId!=="string"||!entryId||entryId.length>150||
  typeof photoId!=="string"||!/^[a-z0-9-]{8,80}$/.test(photoId))
  throw Error("Invalid planting photo identifier.");
 return GROWTH_PREFIX+encodeURIComponent(entryId)+"|"+photoId;
}
function growthPhotoKeys(journal){
 const keys=new Set();
 for(const entry of array(journal)){
  for(const photo of array(entry.growthPhotos))keys.add(growthPhotoKey(entry.id,photo.id));
 }
 return keys;
}
function isGrowthPhotoKey(key,journal){
 return typeof key==="string"&&key.startsWith(GROWTH_PREFIX)&&growthPhotoKeys(journal).has(key);
}
function validate(data){
 if(!isObject(data)||data.format!=="dk-seedbank-v1")throw Error("Not a DK Seed Bank backup.");
 if(!Array.isArray(data.journal)||data.journal.length>3000)throw Error("Invalid or oversized planting journal.");
 if(data.journalDeletes!=null){
  if(!Array.isArray(data.journalDeletes)||data.journalDeletes.length>3000)throw Error("Invalid deleted plantings.");
  const ids=new Set();
  for(const item of data.journalDeletes){
   if(!isObject(item)||typeof item.id!=="string"||item.id.length>150||
    typeof item.deletedAt!=="string"||Number.isNaN(Date.parse(item.deletedAt))||ids.has(item.id))
    throw Error("Invalid deleted planting marker.");
   ids.add(item.id);
  }
 }
 for(const record of data.journal){
  if(!isObject(record)||typeof record.plant!=="string"||record.plant.length>300||
    typeof record.date!=="string"||record.date.length>32)throw Error("Invalid planting record in backup.");
  if(record.syncUpdatedAt!=null&&(typeof record.syncUpdatedAt!=="string"||
   Number.isNaN(Date.parse(record.syncUpdatedAt))))throw Error("Invalid planting change time.");
  for(const key of ["growthPhotosRemoved","growthMeasurementsRemoved"]){
   if(record[key]==null)continue;
   if(!Array.isArray(record[key])||record[key].length>500)throw Error("Invalid removed growth records.");
   for(const item of record[key]){
    if(!isObject(item)||typeof item.id!=="string"||item.id.length>100||
     typeof item.at!=="string"||Number.isNaN(Date.parse(item.at)))
     throw Error("Invalid removed growth record.");
   }
  }
  if(record.growthMeasurements!=null){
   const measurements=record.growthMeasurements;
   if(!Array.isArray(measurements)||measurements.length>500)throw Error("Invalid growth measurements.");
   const ids=new Set();
   for(const measure of measurements){
    if(!isObject(measure)||typeof measure.id!=="string"||
      !/^[a-z0-9-]{8,80}$/.test(measure.id)||ids.has(measure.id)||
      typeof measure.date!=="string"||!/^(19|20|21)\d\d-\d\d-\d\d$/.test(measure.date)||
      !Number.isFinite(measure.heightCm)||measure.heightCm<0||measure.heightCm>3000||
      !["cm","in"].includes(measure.unit)||
      typeof measure.note!=="string"||measure.note.length>300)
      throw Error("Invalid growth measurement in backup.");
    const date=new Date(measure.date+"T12:00:00Z");
    if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==measure.date)
      throw Error("Invalid growth measurement date.");
    ids.add(measure.id);
   }
  }
  if(record.growthPhotos!=null){
   if(typeof record.id!=="string"||record.id.length>150||
    !Array.isArray(record.growthPhotos)||record.growthPhotos.length>200)
     throw Error("Invalid planting photo timeline.");
   const ids=new Set();
   for(const photo of record.growthPhotos){
    if(!isObject(photo)||typeof photo.id!=="string"||
     typeof photo.date!=="string"||!/^(19|20|21)\d\d-\d\d-\d\d$/.test(photo.date)||
     !GROWTH_STAGES.includes(photo.stage)||
     typeof photo.note!=="string"||photo.note.length>300)
      throw Error("Invalid planting photo details.");
    const key=growthPhotoKey(record.id,photo.id);
    if(ids.has(key))throw Error("Duplicate planting photo.");
    ids.add(key);
   }
  }
 }
 if(data.suppliers!=null){
  if(!Array.isArray(data.suppliers)||data.suppliers.length>40)throw Error("Invalid favorite suppliers.");
  for(const item of data.suppliers){
   if(!isObject(item)||typeof item.name!=="string"||!item.name.trim()||item.name.length>100||
      typeof item.url!=="string"||item.url.length>500||!item.url.startsWith("https://"))
    throw Error("Invalid supplier link.");
   let url;try{url=new URL(item.url);}catch(e){throw Error("Invalid supplier website.");}
   if(url.protocol!=="https:"||url.username||url.password)throw Error("Unsafe supplier URL.");
  }
 }
 if(data.photoChanges!=null){
  if(!isObject(data.photoChanges)||Object.keys(data.photoChanges).length>5000)
   throw Error("Invalid photo change history.");
  for(const [key,value] of Object.entries(data.photoChanges)){
   if(key.length>320||!isObject(value)||typeof value.at!=="string"||
      Number.isNaN(Date.parse(value.at))||typeof value.deleted!=="boolean")
    throw Error("Invalid photo change marker.");
  }
 }
 if(data.recipeGuide?.provisions!=null){
  const provisions=data.recipeGuide.provisions;
  if(!isObject(provisions)||!Array.isArray(provisions.items)||provisions.items.length>3000||
   !Array.isArray(provisions.deleted)||provisions.deleted.length>3000)
   throw Error("Invalid kitchen provisions.");
  const ids=new Set();
  for(const row of provisions.items){
   if(!isObject(row)||typeof row.id!=="string"||!row.id||row.id.length>180||
    ids.has(row.id)||typeof row.key!=="string"||!row.key||row.key.length>140||
    typeof row.name!=="string"||!row.name||row.name.length>140||
    !["pantry","cellar"].includes(row.location)||
    row.available!=null&&typeof row.available!=="boolean"||
    row.packages!=null&&(!Number.isSafeInteger(row.packages)||row.packages<1||row.packages>999999)||
    row.barcode!=null&&row.barcode!==""&&!/^\d{8,14}$/.test(row.barcode)||
    typeof row.updatedAt!=="string"||Number.isNaN(Date.parse(row.updatedAt)))
    throw Error("Invalid food inventory item.");
   ids.add(row.id);
  }
  for(const row of provisions.deleted){
   if(!isObject(row)||typeof row.id!=="string"||row.id.length>180||
    typeof row.deletedAt!=="string"||Number.isNaN(Date.parse(row.deletedAt)))
    throw Error("Invalid deleted food item.");
  }
 }
 for(const key of ["settings","workbench","watering","recipeGuide","photoUrls","photoPreferences"]){
  if(data[key]!=null&&!isObject(data[key]))throw Error("Invalid "+key+" section.");
 }
 if(data.workbench?.deletedRecords!=null){
  const deleted=data.workbench.deletedRecords;
  const sections=new Set(["additions","lots","beds","harvests","savedSeeds","tests","succession"]);
  if(!Array.isArray(deleted)||deleted.length>3000)throw Error("Invalid inventory deletion history.");
  for(const record of deleted)if(!isObject(record)||!sections.has(record.section)||
    typeof record.id!=="string"||record.id.length>200||
    typeof record.deletedAt!=="string"||Number.isNaN(Date.parse(record.deletedAt)))
     throw Error("Invalid inventory deletion marker.");
 }
 for(const key of ["additions","lots","beds","harvests","savedSeeds","tests","succession"]){
  const section=data.workbench?.[key];
  if(section!=null&&(!Array.isArray(section)||section.length>3000||section.some(x=>!isObject(x))))
   throw Error("Invalid inventory section: "+key);
 }
 if(data.watering?.deletedRecords!=null){
  const deleted=data.watering.deletedRecords;
  if(!Array.isArray(deleted)||deleted.length>20000)throw Error("Invalid watering deletion history.");
  for(const row of deleted)if(!isObject(row)||typeof row.id!=="string"||row.id.length>180||
   typeof row.deletedAt!=="string"||Number.isNaN(Date.parse(row.deletedAt)))
   throw Error("Invalid deleted watering record.");
 }
 if(data.photos!=null&&!Array.isArray(data.photos))throw Error("Invalid photo section.");
 const photos=array(data.photos);
 if(photos.length>MAX_PHOTOS)throw Error("Too many photos in backup.");
 let chars=0;
 const keys=new Set();
 for(const record of photos){
  if(!isObject(record)||typeof record.key!=="string"||record.key.length>320||
    (record.updatedAt!=null&&(typeof record.updatedAt!=="string"||
     Number.isNaN(Date.parse(record.updatedAt))))||
    typeof record.data!=="string"||record.data.length>MAX_PHOTO_BYTES||
    !/^data:image\/(jpeg|png|webp);base64,/.test(record.data))
    throw Error("Invalid or oversized photo in backup.");
  if(keys.has(record.key))throw Error("Duplicate photo in backup.");
  keys.add(record.key);
  chars+=record.data.length;
  if(chars>MAX_TOTAL_PHOTO_CHARS)throw Error("Photos exceed the backup size limit.");
 }
 if(data.integrity!=null&&
   (!isObject(data.integrity)||data.integrity.algorithm!=="SHA-256"||
    !/^[a-f0-9]{64}$/.test(String(data.integrity.digest))))
  throw Error("Unsupported backup integrity information.");
 if(data.photoUrls&&Object.keys(data.photoUrls).length>6000)throw Error("Too many image links.");
 const growthKeys=growthPhotoKeys(data.journal),supplied=new Set(photos.map(x=>x.key));
 for(const key of growthKeys)if(!supplied.has(key))
  throw Error("Planting photo is missing from backup: "+key);
 return summarize(data);
}
function summarize(data){
 const workbench=isObject(data.workbench)?data.workbench:{};
 return {
  plantings:array(data.journal).length,
  addedVarieties:array(workbench.additions).length,
  seedLots:array(workbench.lots).length,
  germinationTests:array(workbench.tests).length,
  harvests:array(workbench.harvests).length,
  wateringChecks:array(data.watering?.records).length,
  uploadedPhotos:array(data.photos).length,
  growthPhotos:array(data.journal).reduce((count,entry)=>count+array(entry.growthPhotos).length,0),
  growthMeasurements:array(data.journal).reduce((count,entry)=>count+array(entry.growthMeasurements).length,0),
  photoLinks:isObject(data.photoUrls)?Object.keys(data.photoUrls).length:0,
  exportedAt:typeof data.exportedAt==="string"?data.exportedAt:"Unknown"
 };
}
async function checksum(data){
 if(!root.crypto?.subtle||typeof TextEncoder==="undefined")return null;
 const serialized=new TextEncoder().encode(JSON.stringify(data));
 const buffer=await root.crypto.subtle.digest("SHA-256",serialized);
 return Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,"0")).join("");
}
async function verify(data){
 validate(data);
 if(!data.integrity)return {verified:false,reason:"Legacy backup without checksum"};
 const {integrity,...payload}=data;
 const digest=await checksum(payload);
 if(!digest)throw Error("Cannot verify this backup on this device.");
 if(digest!==integrity.digest)throw Error("Backup integrity check failed. The file may be damaged.");
 return {verified:true,reason:"SHA-256 verified"};
}
root.DKSeedBankBackup=Object.freeze({validate,summarize,checksum,verify,
 growthPhotoKey,isGrowthPhotoKey,growthPhotoKeys,GROWTH_STAGES});
})(window);
