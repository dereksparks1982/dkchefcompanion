"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root={};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,"../../assets/seedbank-storage-transaction.js"),"utf8"),{window:root});
const apply=root.DKSeedBankStorageTransaction.apply;
function store(initial={},failure=null){
 const records=new Map(Object.entries(initial)),history=[];
 return {
  getItem:key=>records.has(key)?records.get(key):null,
  setItem:(key,value)=>{history.push(key);if(key===failure)throw Error("storage full");records.set(key,value);},
  removeItem:key=>{records.delete(key);},
  records,history
 };
}
test("new records and media commit together when both succeed",async()=>{
 const s=store({journal:'["old"]'});let media=0;
 assert.equal(await apply(s,[["journal",["new"]],["settings",{region:"x"}]],async()=>{media++;return true;}),true);
 assert.equal(s.getItem("journal"),'["new"]');
 assert.equal(s.getItem("settings"),'{"region":"x"}');
 assert.equal(media,1);
});
test("quota error rolls back records without ever touching photo store",async()=>{
 const s=store({journal:'["old"]',settings:'{"region":"old"}'},"settings");let media=0;
 await assert.rejects(apply(s,[["journal",["new"]],["settings",{region:"new"}]],async()=>{media++;return true;}),/storage full/);
 assert.equal(s.getItem("journal"),'["old"]');
 assert.equal(s.getItem("settings"),'{"region":"old"}');
 assert.equal(media,0);
});
test("failed atomic media transaction restores previous JSON values",async()=>{
 const s=store({journal:'["old"]'});
 await assert.rejects(apply(s,[["journal",["new"]],["newKey",1]],async()=>false),/Could not commit/);
 assert.equal(s.getItem("journal"),'["old"]');
 assert.equal(s.getItem("newKey"),null);
});
test("duplicate sync keys fail before modifying any records",async()=>{
 const s=store({journal:'["old"]'});let media=false;
 await assert.rejects(apply(s,[["journal",1],["journal",2]],async()=>{media=true;return true;}),/duplicate/);
 assert.equal(s.getItem("journal"),'["old"]');
 assert.equal(media,false);
});
