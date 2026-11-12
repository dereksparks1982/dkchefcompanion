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
 const local=snapshots[snapshots.length-1];
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
 for(const key of ["additions","lots","beds","harvests","savedSeeds","tests","succession"]){
  workbench[key]=mergeRows(workbenches.flatMap(w=>array(w[key])),row=>
   key==="additions"?String(row.category||"")+"|"+String(row.name||""):String(row.id||""));
  if(workbench[key].length>3000)throw Error("Cloud inventory section exceeds its safety limit: "+key);
 }
 workbench.overrides=Object.assign({},...workbenches.map(w=>object(w.overrides)));
 const waterings=snapshots.map(s=>object(s.watering));
 const watering={...object(local.watering)};
 watering.records=mergeRows(waterings.flatMap(w=>array(w.records)),row=>row.id);
 const photoMap=new Map();
 for(const snapshot of snapshots)for(const photo of array(snapshot.photos)){
  if(photo&&typeof photo.key==="string"&&!photoMap.has(photo.key))photoMap.set(photo.key,photo);
 }
 const growthKeys=new Set(journal.flatMap(entry=>array(entry.growthPhotos).map(photo=>
  "journal-photo|"+encodeURIComponent(entry.id)+"|"+photo.id)));
 const photos=[...photoMap.values()].filter(photo=>!photo.key.startsWith("journal-photo|")||growthKeys.has(photo.key));
 const output={
  format:"dk-seedbank-v1",backupSchema:3,exportedAt:new Date().toISOString(),
  journal,journalDeletes,settings:object(local.settings),
  workbench,watering,recipeGuide:object(local.recipeGuide),
  photoUrls:Object.assign({},...snapshots.map(s=>object(s.photoUrls))),
  photoPreferences:Object.assign({},...snapshots.map(s=>object(s.photoPreferences))),
  photos
 };
 return output;
}
root.DKSeedBankDriveMerge=Object.freeze({mergeSnapshots,mergeRows,mergeChild,unionTombstones});
})(window);
