"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const library=read("assets/seedbank-recipe-library.js"),recipes=read("assets/seedbank-recipes.js");
function harness(saved){
 const win={DKSeedBankCore:{plants:()=>new Map()}};
 vm.runInNewContext(library,{window:win});
 const listeners={};
 const app={innerHTML:"",addEventListener:(name,fn)=>listeners[name]=fn};
 const select={addEventListener(){}};
 const doc={documentElement:{lang:"en"},getElementById:id=>id==="recipeApp"?app:id==="dkLanguageSelect"?select:null};
 const storage=new Map();
 if(saved)storage.set("dk-seedbank-recipes-v1",JSON.stringify(saved));
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 vm.runInNewContext(recipes,{window:win,document:doc,localStorage,queueMicrotask:fn=>fn(),confirm:()=>true,console});
 return {api:win.DKSeedBankRecipes,app,storage,recipes:win.DKSeedBankRecipeLibrary.recipes,listeners};
}
test("Pantry and Root Cellar exist as independent sections with one shared inventory",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=read(page);
  assert.match(html,/id="dkPantry"/);
  assert.match(html,/id="dkRootCellar"/);
  assert.ok(html.indexOf('id="dkPantry"')<html.indexOf('id="recipeGuide"'));
  assert.ok(html.indexOf('id="dkRootCellar"')<html.indexOf('id="recipeGuide"'));
  assert.match(html,/dk-chef-provisions-ui\.js\?v=20261113-lookup1/);
  assert.match(html,/dk-chef-provisions\.css\?v=20261113-live2/);
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
 }
 const script=read("assets/dk-chef-provisions-ui.js");
 assert.match(read("assets/dk-chef-barcode-scanner.js"),/getUserMedia/);
 assert.match(script,/window\.DKChefBarcodeScanner/);
 assert.match(script,/startScan/);
 assert.doesNotMatch(script,/scanPhoto|data-chef-photo/);
 assert.match(read("index.html"),/quagga2\.min\.js\?v=20261113/);
 assert.match(read("index.html"),/dk-chef-product-lookup\.js\?v=20261113-lookup1/);
 assert.match(read("assets/dk-chef-product-lookup.js"),/world\.openfoodfacts\.org/);
 assert.match(script,/Open Food Facts/);
 assert.match(script,/sourceHarvestId/);
 assert.match(script,/harvestChoices/);
 assert.match(read("sw.js"),/dk-seedbank-app-v55/);
 assert.match(read("sw.js"),/"assets\/dk-chef-provisions-ui\.js"/);
});
test("legacy recipe checks migrate once to shared stock without losing custom recipes",()=>{
 const previous={version:1,selected:"custom-family",ready:{"pesto/oil":true,"pesto/salt":true,
  "custom-family/ingredient-0":true},
  custom:[{id:"custom-family",name:"Family soup",ingredients:[{id:"ingredient-0",name:"Rice",type:"pantry",aliases:[]}]}]};
 const {api}=harness(previous),rows=api.provisions().items;
 assert.equal(api.exportData().custom.length,1);
 assert.ok(rows.some(x=>x.key==="olive oil"&&x.available));
 assert.ok(rows.some(x=>x.key==="salt"&&x.available));
 assert.ok(rows.some(x=>x.key==="rice"&&x.available));
 assert.equal(api.isIngredientReady({name:"Olive oil"}),true);
 assert.equal(api.isIngredientReady({name:"Fine salt"}),true);
 assert.equal(api.isIngredientReady({name:"Salt and black pepper"}),false);
 assert.equal(api.exportData().ready["pesto/oil"],true);
});
test("Olive oil marked once is available in all recipes and can be unchecked globally",()=>{
 const {api}=harness();
 assert.equal(api.isIngredientReady({name:"Olive oil"}),false);
 assert.equal(api.setIngredientReady({id:"pesto"},{name:"Olive oil"},true),true);
 assert.equal(api.isIngredientReady({name:"Olive oil"}),true);
 assert.equal(api.provisions().items.filter(x=>x.key==="olive oil").length,1);
 assert.equal(api.setIngredientReady({id:"other"},{name:"Olive oil"},false),true);
 assert.equal(api.isIngredientReady({name:"Olive oil"}),false);
});
test("branded barcode scans are linked to a generic ingredient and duplicate scans increment packages",()=>{
 const {api}=harness();
 const row={name:"Example Extra Virgin Olive Oil",ingredient:"Olive oil",brand:"Example",
  barcode:"012345678901",location:"pantry",packages:2};
 assert.equal(api.saveProvision(row),true);
 assert.equal(api.isIngredientReady({name:"Olive oil"}),true);
 assert.equal(api.saveProvision({...row,packages:1}),true);
 const items=api.provisions().items;
 assert.equal(items.length,1);
 assert.equal(items[0].packages,3);
 assert.equal(items[0].barcode,"012345678901");
 assert.equal(api.saveProvision({...items[0],packages:7}),true);
 assert.equal(api.provisions().items[0].packages,7);
 assert.equal(api.saveProvision({...row,barcode:"not-a-barcode"}),false);
});
test("Root Cellar records are available to recipes but never counted as seed packets",()=>{
 const {api}=harness();
 assert.equal(api.saveProvision({name:"Garlic",location:"cellar",packages:3,sourceHarvestId:"harvest-1"}),true);
 const row=api.provisions().items[0];
 assert.equal(row.location,"cellar");
 assert.equal(row.sourceHarvestId,"harvest-1");
 assert.equal(api.isIngredientReady({name:"Garlic"}),true);
 assert.equal(api.isIngredientReady({name:"Garlic seed"}),false);
 assert.equal(api.removeProvision(row.id),true);
 assert.equal(api.isIngredientReady({name:"Garlic"}),false);
 assert.ok(api.provisions().deleted.some(x=>x.id===row.id));
});
test("per-item cloud changes and deletion markers converge without changing Drive API configuration",()=>{
 const w={};vm.runInNewContext(read("assets/seedbank-drive-merge.js"),{window:w,Date,Map,Set});
 const a={format:"dk-seedbank-v1",journal:[],recipeGuide:{ready:{},custom:[],
  provisions:{version:1,migrated:true,items:[{id:"oil",name:"Olive oil",key:"olive oil",location:"pantry",
   updatedAt:"2026-11-12T01:00:00Z",packages:1}],deleted:[]}}};
 const b={format:"dk-seedbank-v1",journal:[],recipeGuide:{ready:{},custom:[],
  provisions:{version:1,migrated:true,items:[{id:"oil",name:"Olive oil",key:"olive oil",location:"pantry",
   updatedAt:"2026-11-12T02:00:00Z",packages:3}],deleted:[]}}};
 const merged=w.DKSeedBankDriveMerge.mergeSnapshots([a,b]);
 assert.equal(merged.recipeGuide.provisions.items.length,1);
 assert.equal(merged.recipeGuide.provisions.items[0].packages,3);
 const c={format:"dk-seedbank-v1",journal:[],recipeGuide:{ready:{},custom:[],
  provisions:{version:1,migrated:true,items:[],deleted:[{id:"oil",deletedAt:"2026-11-12T03:00:00Z"}]}}};
 assert.equal(w.DKSeedBankDriveMerge.mergeSnapshots([a,b,c]).recipeGuide.provisions.items.length,0);
 assert.match(read("assets/seedbank-drive-sync.js"),/dk-seedbank-sync-v1-/);
 assert.match(read("assets/seedbank-drive-visible.js"),/name = 'DK Seed Bank'/);
});
test("new food stock validates in original backup schema and rejects malformed barcodes",()=>{
 const w={};vm.runInNewContext(read("assets/seedbank-backup-utils.js"),{window:w,Date,Map,Set,URL});
 const {api}=harness();
 assert.equal(api.saveProvision({name:"Salt",location:"pantry",packages:1}),true);
 const backup={format:"dk-seedbank-v1",journal:[],recipeGuide:api.exportData()};
 assert.doesNotThrow(()=>w.DKSeedBankBackup.validate(backup));
 backup.recipeGuide.provisions.items[0].barcode="bad";
 assert.throws(()=>w.DKSeedBankBackup.validate(backup),/Invalid food inventory item/);
});
test("Bread & Baking adds ten bilingual recipes without modifying existing spice mixtures",()=>{
 const {recipes:b}=harness();
 const breads=b.filter(x=>x.family==="Bread & Baking"),blends=b.filter(x=>x.family==="Spice Blends");
 assert.equal(breads.length,10);
 assert.equal(blends.length,7);
 for(const r of breads){
  assert.equal(r.steps.length,r.stepsRu.length,r.id);
  assert.ok(r.ingredients.every(i=>i.nameRu&&i.amount&&i.amountRu),r.id);
 }
 assert.ok(breads.find(x=>x.id==="traditional-naan"));
 assert.ok(breads.find(x=>x.id==="garlic-naan"));
});
