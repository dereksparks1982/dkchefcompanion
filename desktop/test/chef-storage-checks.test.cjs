"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../.."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const storageCode=read("assets/dk-chef-storage-checks.js");
const recipesCode=read("assets/seedbank-recipes.js");
const matcherCode=read("assets/dk-chef-recipe-match.js");
const uiCode=read("assets/dk-chef-provisions-ui.js");
const backupCode=read("assets/seedbank-backup-utils.js");
const mergeCode=read("assets/seedbank-drive-merge.js");
function data(){
 const window={DKSeedBankCore:{plants:()=>new Map()}},local=new Map();
 vm.runInNewContext(storageCode,{window});
 const recipeHost={innerHTML:"",addEventListener(){}};
 const doc={documentElement:{lang:"en"},getElementById:id=>id==="recipeApp"?recipeHost:null,
  dispatchEvent(){},querySelector:()=>null};
 const localStorage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)};
 vm.runInNewContext(recipesCode,{window,document:doc,localStorage,
  queueMicrotask:fn=>fn(),confirm:()=>true,console});
 vm.runInNewContext(matcherCode,{window});
 return {window,api:window.DKSeedBankRecipes,local,localStorage};
}
function addPotatoes(api){
 return api.saveProvision({name:"Potatoes",ingredient:"Potatoes",location:"cellar",barcode:"012345678905",
  packages:1,storageSpot:"Bin 2",storageCondition:"needs-review",storageTemp:"43.5",storageTempUnit:"F",
  storageHumidity:"82",storageChecked:"2026-11-12",storageCheckBy:"2026-11-13"});
}
test("optional fields are validated without guessing food-safety thresholds",()=>{
 const window={};vm.runInNewContext(storageCode,{window});
 const s=window.DKChefStorageChecks;
 assert.equal(s.normalize({storageCondition:"needs-review",storageTemp:"42.5",storageHumidity:"91.1"}).ok,true);
 assert.equal(s.normalize({storageHumidity:"101"}).ok,false);
 assert.equal(s.normalize({storageTemp:"too hot"}).ok,false);
 assert.equal(s.normalize({storageTemp:"42",storageTempUnit:"Kelvin"}).ok,false);
 assert.equal(s.normalize({storageCheckBy:"2026-02-29"}).ok,false);
 assert.equal(s.normalize({storageCheckBy:"2028-02-29"}).ok,true);
 assert.equal(s.normalize({storageSpot:"A".repeat(101)}).ok,false);
 assert.equal(s.dayDistance("2026-11-15","2026-11-13"),2);
 assert.equal(s.summary({storageCheckBy:"2026-11-13"},"2026-11-13").due,true);
 assert.equal(s.summary({storageCheckBy:"2026-11-18"},"2026-11-13").soon,true);
 assert.equal(s.summary({},"2026-11-13").due,false);
});
test("food records retain optional storage observations through ordinary editing",()=>{
 const {api}=data();assert.equal(addPotatoes(api),true);
 const item=api.provisions().items[0];assert.equal(item.storageSpot,"Bin 2");
 assert.equal(item.storageCondition,"needs-review");
 assert.equal(item.storageTemp,"43.5");assert.equal(item.storageHumidity,"82");
 assert.equal(api.saveProvision({...item,name:"Purple Potatoes",storageSpot:"Cellar shelf"}),true);
 const edited=api.provisions().items[0];
 assert.equal(edited.storageSpot,"Cellar shelf");
 assert.equal(edited.storageCheckBy,"2026-11-13");
 const prev=JSON.stringify(api.provisions().items);
 assert.equal(api.saveProvision({...edited,storageHumidity:"120"}),false);
 assert.equal(JSON.stringify(api.provisions().items),prev);
});
test("repeated barcode scans preserve previously recorded storage inspections",()=>{
 const {api}=data();assert.equal(addPotatoes(api),true);
 const original=api.provisions().items[0];
 assert.equal(api.saveProvision({name:"Potatoes",ingredient:"Potatoes",location:"cellar",
  barcode:"012345678905",packages:1}),true);
 const saved=api.provisions().items;
 assert.equal(saved.length,1);
 assert.equal(saved[0].id,original.id);
 assert.equal(saved[0].packages,2);
 assert.equal(saved[0].storageSpot,"Bin 2");
 assert.equal(saved[0].storageCondition,"needs-review");
 assert.equal(saved[0].storageHumidity,"82");
 assert.equal(saved[0].storageCheckBy,"2026-11-13");
});
test("food marked needs-review is excluded from ingredient and substitution matches",()=>{
 const {api,window}=data();addPotatoes(api);
 const matcher=window.DKChefRecipeMatch;
 let stock=api.provisions().items[0];
 assert.equal(matcher.isEdibleStock(stock),false);
 assert.equal(matcher.matches({name:"Potatoes"},[stock]).length,0);
 assert.equal(api.saveProvision({...stock,storageCondition:"looks-okay"}),true);
 stock=api.provisions().items[0];
 assert.equal(matcher.isEdibleStock(stock),true);
 assert.equal(matcher.matches({name:"Potatoes"},[stock]).length,1);
});
test("English and Russian in-app storage checks include due filters and review badges",()=>{
 const {window,api}=data();addPotatoes(api);
 const handlers={};const form={elements:{storageChecked:{value:""}},scrollIntoView(){}};
 const kitchen={innerHTML:"",addEventListener:(k,fn)=>handlers[k]=fn,
  querySelector:()=>form,querySelectorAll:()=>[]};
 const document={documentElement:{lang:"en"},
  querySelector:selector=>selector==="#chefKitchenApp"?kitchen:null,
  getElementById:()=>null,addEventListener(){}};
 vm.runInNewContext(uiCode,{window,document,queueMicrotask:fn=>fn(),confirm:()=>true});
 assert.match(kitchen.innerHTML,/Storage checks/);
 assert.match(kitchen.innerHTML,/Inspection due/);
 assert.match(kitchen.innerHTML,/Needs review/);
 assert.match(kitchen.innerHTML,/Record check/);
 assert.match(kitchen.innerHTML,/Bin 2/);
 const before=JSON.stringify(api.provisions().items);
 handlers.click({target:{closest:selector=>selector==="[data-chef-inspect]"?
  {dataset:{chefInspect:api.provisions().items[0].id}}:null}});
 assert.match(form.elements.storageChecked.value,/^\d{4}-\d{2}-\d{2}$/);
 assert.equal(JSON.stringify(api.provisions().items),before,"opening inspection does not save it");
 handlers.click({target:{closest:selector=>selector==="[data-chef-storage-filter]"?
  {dataset:{chefStorageFilter:"due"}}:null}});
 assert.match(kitchen.innerHTML,/aria-pressed="true"/);
 document.documentElement.lang="ru";
 vm.runInNewContext(uiCode,{window,document,queueMicrotask:fn=>fn(),confirm:()=>true});
 assert.match(kitchen.innerHTML,/Проверка хранения/);
 assert.match(kitchen.innerHTML,/Записать осмотр/);
});
test("backup validation protects observations while accepting pre-feature records",()=>{
 const {window,api}=data();addPotatoes(api);
 vm.runInNewContext(backupCode,{window});
 const backup={format:"dk-seedbank-v1",journal:[],workbench:{},recipeGuide:api.exportData()};
 assert.doesNotThrow(()=>window.DKSeedBankBackup.validate(backup));
 const bad=JSON.parse(JSON.stringify(backup));
 bad.recipeGuide.provisions.items[0].storageHumidity="102";
 assert.throws(()=>window.DKSeedBankBackup.validate(bad),/Invalid storage observation/);
 const legacy=JSON.parse(JSON.stringify(backup));
 for(const field of ["storageSpot","storageCondition","storageTemp","storageTempUnit",
  "storageHumidity","storageChecked","storageCheckBy"])
  delete legacy.recipeGuide.provisions.items[0][field];
 assert.doesNotThrow(()=>window.DKSeedBankBackup.validate(legacy));
});
test("Drive merge retains latest storage observations without schema migration",()=>{
 const {api}=data();addPotatoes(api);
 const old={format:"dk-seedbank-v1",journal:[],recipeGuide:api.exportData()};
 const recent=JSON.parse(JSON.stringify(old));
 recent.recipeGuide.provisions.items[0].storageSpot="Cooler shelf";
 recent.recipeGuide.provisions.items[0].updatedAt="2030-01-01T00:00:00.000Z";
 const window={};vm.runInNewContext(mergeCode,{window});
 const merged=window.DKSeedBankDriveMerge.mergeSnapshots([old,recent]);
 assert.equal(merged.recipeGuide.provisions.items.length,1);
 assert.equal(merged.recipeGuide.provisions.items[0].storageSpot,"Cooler shelf");
});
test("both app routes load optional module before inventory and keep one scanner",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=read(page);
  assert.ok(html.indexOf("dk-chef-storage-checks.js")<html.indexOf("seedbank-recipes.js"));
  assert.ok(html.indexOf("dk-chef-storage-checks.js")<html.indexOf("dk-chef-provisions-ui.js"));
  assert.equal((html.match(/id="dkProductStation"/g)||[]).length,1);
 }
 assert.match(read("sw.js"),/"assets\/dk-chef-storage-checks.js"/);
 assert.match(read("README.md"),/Storage inspections and optional check reminders/);
 assert.doesNotThrow(()=>new Function(uiCode));
 assert.doesNotThrow(()=>new Function(storageCode));
});
