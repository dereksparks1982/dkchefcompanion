/* DK Seed Bank Google Drive sync: deterministic additive merge and deletion markers.
   No credentials, Google calls, or user data are embedded in this file. */
(function(root){
"use strict";
const array=value=>Array.isArray(value)?value:[];
const object=value=>value&&typeof value==="object"&&!Array.isArray(value)?value:{};
const timestamp=value=>{
 const parsed=Date.parse(value||"");return Number.isFinite(parsed)?parsed:0;
};
const sortByTime=records=>records.slice().sort((a,b)=>timestamp(a.exportedAt)-timestamp(b.exportedAt));
function mergeRows(rows,keyFn){
 const result=new Map();
 for(const row of rows){
  if(!row||typeof row!=="object")continue;
  const key=keyFn(row);
  if(!key)continue;
  const previous=result.get(key);
  if(!previous||timestamp(row.updatedAt)>=timestamp(previous.updatedAt))result.set(key,row);
 }
 return [...result.values()];
}
function unionTombstones(rows,timeKey){
 const map=new Map();
 for(const marker of rows){
  if(!marker||typeof marker.id!=="string")continue;
  const current=map.get(marker.id);
  if(!current||timestamp(marker[timeKey])>timestamp(current[timeKey]))map.set(marker.id,marker);
 }
 return [...map.values()];
}
function mergeChild(list,field,removedField){
 const deletes=unionTombstones(list.flatMap(row=>array(row[removedField])),"at");
 const removed=new Map(deletes.map(row=>[row.id,timestamp(row.at)]));
 const items=mergeRows(list.flatMap(row=>array(row[field])),row=>row.id);
 return {items:items.filter(item=>!removed.has(item.id)||timestamp(item.updatedAt)>removed.get(item.id)),deletes};
}
function mergeSnapshots(inputs){
 if(!Array.isArray(inputs)||!inputs.length)throw Error("No snapshots available to merge.");
 const snapshots=sortByTime(inputs.map(input=>input.backup||input));
 const local=inputs[inputs.length-1].backup||inputs[inputs.length-1];
 const journals=new Map();
 for(const snapshot of snapshots){
  for(const entry of array(snapshot.journal)){
   if(!entry||typeof entry.id!=="string")continue;
   const found=journals.get(entry.id)||[];
   found.push(entry);journals.set(entry.id,found);
  }
 }
 const journalDeletes=unionTombstones(snapshots.flatMap(s=>array(s.journalDeletes)),"deletedAt");
 const deletedIds=new Map(journalDeletes.map(row=>[row.id,timestamp(row.deletedAt)]));
 const journal=[];
 for(const [id,history] of journals){
  const base=history.reduce((winner,entry)=>!winner||
   timestamp(entry.syncUpdatedAt)>timestamp(winner.syncUpdatedAt)?entry:winner,null);
  if(deletedIds.has(id)&&deletedIds.get(id)>=timestamp(base.syncUpdatedAt))continue;
  const photos=mergeChild(history,"growthPhotos","growthPhotosRemoved");
  const measurements=mergeChild(history,"growthMeasurements","growthMeasurementsRemoved");
  journal.push({...base,growthPhotos:photos.items,growthMeasurements:measurements.items,
   growthPhotosRemoved:photos.deletes,growthMeasurementsRemoved:measurements.deletes});
 }
 journal.sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.id).localeCompare(String(b.id)));
 const workbenches=snapshots.map(s=>object(s.workbench));
 const workbench={...object(local.workbench)};
 const sections=["additions","lots","beds","harvests","savedSeeds","tests","succession"];
 const byDeletion=new Map();
 for(const item of workbenches.flatMap(w=>array(w.deletedRecords))){
  if(!item||!sections.includes(item.section)||typeof item.id!=="string"||
     typeof item.deletedAt!=="string")continue;
  const key=item.section+"|"+item.id;
  if(!byDeletion.has(key)||timestamp(item.deletedAt)>timestamp(byDeletion.get(key).deletedAt))
   byDeletion.set(key,item);
 }
 workbench.deletedRecords=[...byDeletion.values()].slice(-3000);
 for(const section of sections){
  const rowId=row=>section==="additions"?String(row.category||"")+"|"+String(row.name||""):String(row.id||"");
  const rows=mergeRows(workbenches.flatMap(w=>array(w[section])),rowId);
  workbench[section]=rows.filter(row=>{
   const removed=byDeletion.get(section+"|"+rowId(row));
   return !removed||timestamp(row.updatedAt)>timestamp(removed.deletedAt);
  });
  if(workbench[section].length>3000)throw Error("Cloud inventory section exceeds its safety limit: "+section);
 }
 // Use per-record edit times rather than assuming the most recently exported
 // snapshot always contains the newest inventory override.
 workbench.overrides={};
 for(const w of workbenches)for(const [key,value] of Object.entries(object(w.overrides))){
  if(!value||typeof value!=="object")continue;
  const previous=workbench.overrides[key];
  if(!previous||timestamp(value.updatedAt)>=timestamp(previous.updatedAt))
   workbench.overrides[key]=value;
 }
 for(const removed of workbench.deletedRecords)if(removed.section==="additions"){
  const patch=workbench.overrides[removed.id];
  if(patch&&timestamp(patch.updatedAt)<=timestamp(removed.deletedAt))
   delete workbench.overrides[removed.id];
 }
 const waterings=snapshots.map(s=>object(s.watering));
 const watering={...object(local.watering)};
 const wateringDeletes=unionTombstones(waterings.flatMap(w=>array(w.deletedRecords)),"deletedAt");
 const waterDeletedIds=new Map(wateringDeletes.map(row=>[row.id,timestamp(row.deletedAt)]));
 watering.deletedRecords=wateringDeletes;
 watering.records=mergeRows(waterings.flatMap(w=>array(w.records)),row=>row.id).filter(row=>
  !waterDeletedIds.has(row.id)||timestamp(row.updatedAt)>waterDeletedIds.get(row.id));
 watering.preferences=Object.assign({},...waterings.map(w=>object(w.preferences)));
 // Prefer actual upload revisions to backup export times so an older
 // photograph saved on another device cannot overwrite a recent replacement.
 const photoChanges={};
 for(const snapshot of snapshots)for(const [key,record] of Object.entries(object(snapshot.photoChanges))){
  if(!record||typeof record.at!=="string")continue;
  if(!photoChanges[key]||timestamp(record.at)>timestamp(photoChanges[key].at))photoChanges[key]=record;
 }
 const photoMap=new Map();
 for(const snapshot of snapshots)for(const photo of array(snapshot.photos)){
  if(!photo||typeof photo.key!=="string")continue;
  const previous=photoMap.get(photo.key);
  if(!previous||timestamp(photo.updatedAt)>=timestamp(previous.updatedAt))
   photoMap.set(photo.key,photo);
 }
 const growthKeys=new Set(journal.flatMap(entry=>array(entry.growthPhotos).map(photo=>
  "journal-photo|"+encodeURIComponent(entry.id)+"|"+photo.id)));
 const photos=[...photoMap.values()].filter(photo=>{
  if(photo.key.startsWith("journal-photo|"))return growthKeys.has(photo.key);
  const marker=photoChanges[photo.key];
  return !marker||!marker.deleted||timestamp(photo.updatedAt)>timestamp(marker.at);
 });
 // Collect favorites from the user's own snapshots. No supplier data is publicized.
 const supplierMap=new Map();
 for(const snapshot of snapshots)for(const item of array(snapshot.suppliers)){
  if(item&&typeof item.name==="string"&&typeof item.url==="string")
   supplierMap.set(item.url.toLowerCase(),{name:item.name,url:item.url});
 }
 const suppliers=[...supplierMap.values()].slice(0,40);
 const output={
  format:"dk-seedbank-v1",backupSchema:3,exportedAt:new Date().toISOString(),
  journal,journalDeletes,settings:object(local.settings),
  workbench,watering,recipeGuide:object(local.recipeGuide),suppliers,
  photoChanges,
  photoUrls:Object.assign({},...snapshots.map(s=>object(s.photoUrls))),
  photoPreferences:Object.assign({},...snapshots.map(s=>object(s.photoPreferences))),
  photos
 };
 return output;
}
root.DKSeedBankDriveMerge=Object.freeze({mergeSnapshots,mergeRows,mergeChild,unionTombstones});
})(window);
