"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
test("seed saving and preservation guides load without browser dependencies",()=>{
 const window={};
 vm.runInNewContext(read("assets/seedbank-field-guides.js"),{window});
 assert.equal(window.DKSeedBankFieldGuides.saving.length,7);
 assert.equal(window.DKSeedBankFieldGuides.preservation.length,6);
 for(const guide of [...window.DKSeedBankFieldGuides.saving,...window.DKSeedBankFieldGuides.preservation]){
  assert.ok(guide.id&&guide.en&&guide.ru);
  assert.ok(guide.stepsEn.length>=3&&guide.stepsRu.length>=3);
 }
});
test("harvest and saved seed records can link to the planting journal without new storage keys",()=>{
 const code=read("assets/seedbank-workbench.js");
 assert.match(code,/name="plantingId"/);
 assert.match(code,/plantingId:linkedPlantingId/);
 assert.match(code,/name="parentType"/);
 assert.match(code,/name="isolation"/);
 assert.match(code,/name="method"/);
 assert.match(code,/function refreshPlantingLinks/);
 assert.match(code,/dk-seedbank-workbench-v2/);
});
test("guides are included on both web entry points and cached offline",()=>{
 const js="seedbank-field-guides.js",css="seedbank-field-guides.css";
 for(const file of ["index.html","docs/index.html"]){
  assert.ok(read(file).includes(js),file+" missing guides module");
  assert.ok(read(file).includes(css),file+" missing guides CSS");
 }
 assert.ok(read("sw.js").includes(js));
 assert.ok(read("sw.js").includes(css));
});
