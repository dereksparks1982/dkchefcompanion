"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../.."),read=file=>fs.readFileSync(path.join(root,file),"utf8");
const source=read("assets/seedbank-watering.js");
test("Watering Manager is attached inside Planting Journal, before planting cards",()=>{
 assert.match(source,/const journalSection=document\.getElementById\("seedJournal"\)/);
 assert.match(source,/const journalEntries=document\.getElementById\("journalEntries"\)/);
 assert.match(source,/journalEntries\.insertAdjacentElement\("beforebegin",panel\)/);
 assert.doesNotMatch(source,/workbench\.insertAdjacentElement\("afterend",panel\)/);
 assert.doesNotMatch(source,/workbench\.querySelector\("\.wb-quick"\)/);
 assert.doesNotMatch(source,/document\.getElementById\("collection"\)\.insertAdjacentElement\("beforebegin",panel\)/);
 assert.match(read("assets/seedbank-cards.js"),/planner\.insertAdjacentElement\("afterend",section\)/);
 assert.match(read("assets/seedbank-watering.css"),/#seedJournal \.water-manager/);
});
test("watering shortcut expands the journal, not Garden Planner",()=>{
 const start=source.indexOf("function revealWateringPanel(){"),end=source.indexOf("function openFor(id){",start);
 assert.ok(start>=0&&end>start);
 const planner={tagName:"DETAILS",open:false,parentElement:null,id:"growPlanner"};
 const journal={tagName:"DETAILS",open:false,parentElement:null,id:"seedJournal"};
 const wrap={tagName:"DIV",parentElement:journal};
 const manager={tagName:"DETAILS",open:false,parentElement:wrap,id:"waterManager"};
 const reveal=new Function("panel",source.slice(start,end)+"return revealWateringPanel;")(manager);
 reveal();
 assert.equal(manager.open,true);assert.equal(journal.open,true);assert.equal(planner.open,false);
});
test("each planting and seed card links to the single manager",()=>{
 assert.match(source,/if\(btn\.dataset\.wmJournal\)\{openFor\(btn\.dataset\.wmJournal\);return;\}/);
 assert.match(source,/const available=journal\(\)\.filter\(e=>e\.seedKey===btn\.dataset\.wmSeed\)/);
 assert.match(source,/if\(available\.length\)\{openFor\(available\[0\]\.id\)/);
 assert.match(source,/btn\.dataset\.wmJournal=entry\.id/);
 assert.match(source,/refreshOptions\(String\(id\|\|""\)\)/);
 assert.match(source,/requestAnimationFrame\(\(\)=>\{/);
});
test("saved watering data, bilingual pages and offline shell are preserved",()=>{
 assert.match(source,/const key="dk-seedbank-watering-v1"/);
 assert.match(source,/window\.DKSeedBankWatering=Object\.freeze\(\{exportData:/);
 for(const file of ["index.html","docs/index.html"]){
  const page=read(file);
  assert.match(page,/seedbank-watering\.js\?v=20261112-journalwater1/);
  assert.match(page,/seedbank-watering\.css\?v=20261112-journalwater1/);
  assert.equal((page.match(/<article class="seed"/g)||[]).length,319);
 }
 assert.match(read("assets/seedbank-i18n.js"),/Учёт полива сада/);
 assert.match(read("sw.js"),/dk-seedbank-app-v59/);
 assert.match(read("README.md"),/Garden Watering Manager lives inside the Planting Journal/);
});
