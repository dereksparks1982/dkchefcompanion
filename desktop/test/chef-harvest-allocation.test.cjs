"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,"../.."),read=p=>fs.readFileSync(path.join(base,p),"utf8");
const ledgerCode=read("assets/dk-chef-harvest-allocation.js");
const recipeCode=read("assets/seedbank-recipes.js");
const backupCode=read("assets/seedbank-backup-utils.js");
const mergeCode=read("assets/seedbank-drive-merge.js");
function ledger(){const window={};vm.runInNewContext(ledgerCode,{window});return window.DKChefHarvestAllocation;}
function demo(){
 const harvest={id:"h-2026-a",seedKey:"garden|Purple Tomatoes",date:"2026-11-13",amount:12,unit:"lb",
  updatedAt:"2026-11-13T12:00:00Z",allocations:{fresh:3,preserved:2,pantry:4,cellar:1}};
 const window={DKSeedBankCore:{plants:()=>new Map([["garden|Purple Tomatoes",{name:"Purple Tomatoes"}]])}};
 vm.runInNewContext(ledgerCode,{window});
 window.DKSeedBankWorkbench={exportData:()=>({harvests:[JSON.parse(JSON.stringify(harvest))]})};
 const host={innerHTML:"",addEventListener(){}};
 const document={documentElement:{lang:"en"},getElementById:id=>id==="recipeApp"?host:null,dispatchEvent(){}};
 const memory=new Map(),localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
 vm.runInNewContext(recipeCode,{window,document,localStorage,queueMicrotask:fn=>fn(),confirm:()=>true,console});
 return {window,api:window.DKSeedBankRecipes,harvest,memory,ledger:window.DKChefHarvestAllocation};
}
test("allocate a harvest without claiming that the allocation is already food stock",()=>{
 const {api,harvest,ledger:L}=demo();
 const plan=L.inspect(harvest);
 assert.equal(plan.ok,true);assert.equal(plan.total,12);assert.equal(plan.allocated,10);
 assert.equal(plan.remaining,2);assert.equal(api.provisions().items.length,0);
 assert.equal(L.inspect({id:"legacy",amount:5,unit:"lb"}).remaining,5);
 assert.equal(L.stockId(harvest.id,"pantry"),"harvest-stock-h-2026-a-pantry");
 assert.equal(L.stockId("bad/unsafe-id","pantry"),"");
});
test("reject overallocated, negative, invalid and fractional counted amounts",()=>{
 const L=ledger(),harvest={id:"h",amount:10,unit:"kg"};
 assert.equal(L.inspect(harvest,{fresh:8,pantry:3}).reason,"over-allocated");
 assert.equal(L.inspect(harvest,{fresh:-1}).reason,"invalid-amount");
 assert.equal(L.inspect(harvest,{fresh:"NaN"}).reason,"invalid-amount");
 assert.equal(L.inspect(harvest,{fresh:"Infinity"}).reason,"invalid-amount");
 assert.equal(L.inspect({...harvest,unit:"count"},{fresh:1.5}).reason,"invalid-amount");
 assert.equal(L.inspect({...harvest,unit:"count",amount:1.5}).reason,"invalid-harvest");
 assert.equal(L.inspect(harvest,{fresh:10}).remaining,0);
});
test("one pantry stock item is posted idempotently; cellar is separate",()=>{
 const {api,harvest,ledger:L}=demo();
 const first=api.postHarvestAllocation(harvest.id,"pantry");
 assert.equal(first.action,"added");
 assert.equal(api.postHarvestAllocation(harvest.id,"pantry").action,"unchanged");
 assert.equal(api.provisions().items.length,1);
 const row=api.provisions().items[0];
 assert.equal(row.id,L.stockId(harvest.id,"pantry"));assert.equal(row.amount,"4 lb");
 assert.equal(row.sourceHarvestAllocation,true);
 assert.equal(row.sourceHarvestId,harvest.id);
 assert.equal(api.postHarvestAllocation(harvest.id,"cellar").action,"added");
 assert.equal(api.provisions().items.length,2);
 assert.equal(api.provisions().items.find(r=>r.location==="cellar").amount,"1 lb");
});
test("reallocation updates linked stock; zero removes only its own item with a tombstone",()=>{
 const {api,harvest,ledger:L}=demo();
 api.postHarvestAllocation(harvest.id,"pantry");api.postHarvestAllocation(harvest.id,"cellar");
 harvest.allocations.pantry=5;
 assert.equal(api.postHarvestAllocation(harvest.id,"pantry").action,"updated");
 assert.equal(api.provisions().items.length,2);
 assert.equal(api.provisions().items.find(x=>x.location==="pantry").amount,"5 lb");
 harvest.allocations.pantry=0;
 assert.equal(api.postHarvestAllocation(harvest.id,"pantry").action,"removed");
 assert.equal(api.provisions().items.length,1);
 assert.ok(api.provisions().deleted.some(row=>row.id===L.stockId(harvest.id,"pantry")));
 harvest.allocations.pantry=5;
 assert.equal(api.postHarvestAllocation(harvest.id,"pantry").action,"added");
 assert.equal(api.provisions().items.length,2);
 assert.ok(api.provisions().items.some(row=>row.id===L.stockId(harvest.id,"pantry")));
 assert.equal(api.provisions().deleted.filter(x=>x.id===L.stockId(harvest.id,"pantry")).length,0);
});
test("manual stock edits and old harvest copies prevent duplicate reposting",()=>{
 const {api,harvest}=demo();
 api.postHarvestAllocation(harvest.id,"pantry");
 const row=api.provisions().items[0];
 assert.equal(api.saveProvision({id:row.id,name:row.name,sourceHarvestId:harvest.id,location:"cellar",packages:1}),false,
  "A linked pantry item must not silently become cellar stock");
 assert.equal(api.saveProvision({id:row.id,name:row.name,sourceHarvestId:harvest.id,location:"pantry",packages:3,amount:"3 lb"}),true);
 assert.equal(api.postHarvestAllocation(harvest.id,"pantry").reason,"stock-edited");
 assert.equal(api.saveProvision({name:"Duplicate copied tomatoes",location:"pantry",sourceHarvestId:harvest.id,packages:1}),false);
 assert.equal(api.provisions().items.length,1);
});
test("legacy harvest copy requires reconciliation instead of double counting",()=>{
 const {api,harvest}=demo();
 assert.equal(api.saveProvision({name:"Garden tomatoes",location:"pantry",sourceHarvestId:harvest.id,packages:1}),true);
 assert.equal(api.postHarvestAllocation(harvest.id,"pantry").reason,"already-linked");
 assert.equal(api.provisions().items.length,1);
});
test("existing backup schema accepts allocations but rejects invalid amounts and forged links",()=>{
 const {api,harvest}=demo();api.postHarvestAllocation(harvest.id,"pantry");
 const window={};vm.runInNewContext(backupCode,{window});
 const backup={format:"dk-seedbank-v1",journal:[],workbench:{harvests:[harvest]},recipeGuide:api.exportData()};
 assert.doesNotThrow(()=>window.DKSeedBankBackup.validate(backup));
 const over=JSON.parse(JSON.stringify(backup));
 over.workbench.harvests[0].allocations={fresh:8,preserved:8,pantry:8,cellar:0};
 assert.throws(()=>window.DKSeedBankBackup.validate(over),/exceeds recorded yield/);
 const fake=JSON.parse(JSON.stringify(backup));
 fake.recipeGuide.provisions.items[0].id="wrong-linked-id";
 assert.throws(()=>window.DKSeedBankBackup.validate(fake),/Invalid posted harvest stock/);
 const old={format:"dk-seedbank-v1",journal:[],workbench:{harvests:[{id:"old",amount:2,unit:"lb"}]}};
 assert.doesNotThrow(()=>window.DKSeedBankBackup.validate(old));
});
test("Drive merger keeps the latest harvest allocation without a new sync schema",()=>{
 const window={};vm.runInNewContext(mergeCode,{window});
 const old={format:"dk-seedbank-v1",journal:[],workbench:{version:2,
  harvests:[{id:"h",amount:5,unit:"lb",updatedAt:"2026-11-12T00:00:00Z",
   allocations:{fresh:1,pantry:1}}]}};
 const now={format:"dk-seedbank-v1",journal:[],workbench:{version:2,
  harvests:[{id:"h",amount:5,unit:"lb",updatedAt:"2026-11-13T00:00:00Z",
   allocations:{fresh:2,pantry:2}}]}};
 const merged=window.DKSeedBankDriveMerge.mergeSnapshots([old,now]);
 assert.equal(merged.workbench.harvests.length,1);
 assert.equal(merged.workbench.harvests[0].allocations.pantry,2);
});
test("routes load allocation module before planner; exactly one product scanner",()=>{
 for(const route of ["index.html","docs/index.html"]){
  const html=read(route);
  assert.ok(html.indexOf("dk-chef-harvest-allocation.js")<html.indexOf("seedbank-workbench.js"));
  assert.equal((html.match(/id="dkProductStation"/g)||[]).length,1);
 }
 const sw=read("sw.js");
 assert.match(sw,/"assets\/dk-chef-harvest-allocation.js"/);
 const workbench=read("assets/seedbank-workbench.js");
 assert.match(workbench,/data-wb-allocation-form/);assert.match(workbench,/data-wb-post-harvest/);
 assert.match(workbench,/dkchef:provisions-changed/);
 assert.match(read("README.md"),/Harvest allocation and linked storage/);
 assert.doesNotThrow(()=>new Function(workbench));
 assert.doesNotThrow(()=>new Function(recipeCode));
});
