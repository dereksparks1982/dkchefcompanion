"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assets=path.resolve(__dirname,"../../assets");
function moduleFrom(file){
 const window={};
 const code=fs.readFileSync(path.join(assets,file),"utf8");
 vm.runInNewContext(code,{window,URL,Date,Map,Set,Array,Number,String,JSON,encodeURIComponent,TextEncoder});
 return window;
}
const merge=moduleFrom("seedbank-drive-merge.js").DKSeedBankDriveMerge;
const validate=moduleFrom("seedbank-backup-utils.js").DKSeedBankBackup.validate;
const FIRST="2026-11-12T20:00:00Z";
const SECOND="2026-11-12T21:00:00Z";
const LATER="2026-11-12T22:00:00Z";
function snapshot(time,changes={}){
 return {format:"dk-seedbank-v1",backupSchema:3,exportedAt:time,
  journal:[],journalDeletes:[],
  workbench:{additions:[],lots:[],beds:[],harvests:[],savedSeeds:[],tests:[],succession:[],overrides:{},deletedRecords:[]},
  watering:{records:[],deletedRecords:[],preferences:{}},
  recipeGuide:{},photoChanges:{},photos:[],
  ...changes};
}
test("deleted seed lots never reappear from newer exports of stale data",()=>{
 const old=snapshot(FIRST,{workbench:{lots:[{id:"lot-a",count:15}]}});
 const edited=snapshot(SECOND,{workbench:{lots:[],deletedRecords:[{section:"lots",id:"lot-a",deletedAt:SECOND}]}});
 const stale=snapshot(LATER,{workbench:old.workbench});
 const result=merge.mergeSnapshots([old,edited,stale]);
 assert.equal(result.workbench.lots.length,0);
 assert.equal(result.workbench.deletedRecords.length,1);
 assert.doesNotThrow(()=>validate(result));
});
test("newer changes beat a later export of an outdated garden bed",()=>{
 const old=snapshot(FIRST,{workbench:{beds:[{id:"bed-a",name:"Old"}]}});
 const newer=snapshot(SECOND,{workbench:{beds:[{id:"bed-a",name:"New",updatedAt:SECOND}]}});
 const stale=snapshot(LATER,{workbench:old.workbench});
 const result=merge.mergeSnapshots([old,newer,stale]);
 assert.equal(result.workbench.beds[0].name,"New");
});
test("watering deletion history blocks stale watering checks",()=>{
 const old=snapshot(FIRST,{watering:{records:[{id:"water-a",date:"2026-11-12"}]}});
 const deleted=snapshot(SECOND,{watering:{records:[],deletedRecords:[{id:"water-a",deletedAt:SECOND}]}});
 const result=merge.mergeSnapshots([old,deleted,old]);
 assert.equal(result.watering.records.length,0);
 assert.equal(result.watering.deletedRecords.length,1);
 assert.doesNotThrow(()=>validate(result));
});
test("recent photo upload beats an outdated image in a later backup",()=>{
 const old=snapshot(FIRST,{photos:[{key:"Herbs|Basil",data:"data:image/png;base64,QUJD"}]});
 const newer=snapshot(SECOND,{photos:[{key:"Herbs|Basil",updatedAt:SECOND,data:"data:image/png;base64,Rk9P"}],
  photoChanges:{"Herbs|Basil":{at:SECOND,deleted:false}}});
 const stale=snapshot(LATER,{photos:old.photos});
 const result=merge.mergeSnapshots([old,newer,stale]);
 assert.equal(result.photos[0].data,"data:image/png;base64,Rk9P");
 assert.doesNotThrow(()=>validate(result));
});
test("photo deletions are not undone by stale device backups",()=>{
 const before=snapshot(FIRST,{photos:[{key:"Herbs|Basil",data:"data:image/png;base64,QUJD"}]});
 const removed=snapshot(SECOND,{photoChanges:{"Herbs|Basil":{at:SECOND,deleted:true}}});
 const result=merge.mergeSnapshots([before,removed,before]);
 assert.equal(result.photos.length,0);
 assert.equal(result.photoChanges["Herbs|Basil"].deleted,true);
});
test("legacy snapshots and local growing preferences remain supported",()=>{
 const old=snapshot(FIRST,{journal:[{id:"j",plant:"Mint",date:"2026-11-12"}]});
 const local=snapshot(SECOND,{settings:{region:"kansas"}});
 const result=merge.mergeSnapshots([old,local]);
 assert.equal(result.journal[0].plant,"Mint");
 assert.equal(result.settings.region,"kansas");
 assert.doesNotThrow(()=>validate(result));
});
test("backup validation rejects fake photo and deletion times",()=>{
 const good=snapshot(FIRST);
 assert.doesNotThrow(()=>validate(good));
 assert.throws(()=>validate({...good,photoChanges:{"Herbs|Basil":{at:"not a date",deleted:true}}}),/photo change marker/);
 assert.throws(()=>validate({...good,workbench:{deletedRecords:[{section:"lots",id:"x",deletedAt:"not a date"}]}}),/inventory deletion marker/);
 assert.throws(()=>validate({...good,watering:{deletedRecords:[{id:"x",deletedAt:"not a date"}]}}),/deleted watering record/);
});
