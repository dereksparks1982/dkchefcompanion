"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const source=fs.readFileSync(path.join(root,"assets/seedbank-watering.js"),"utf8");
test("watering navigation opens the manager and every collapsed parent accordion",()=>{
 const start=source.indexOf("function revealWateringPanel(){");
 const end=source.indexOf("function openFor(id){",start);
 assert.ok(start>0&&end>start,"revealWateringPanel helper missing");
 const outer={tagName:"DETAILS",open:false,parentElement:null};
 const container={tagName:"DIV",parentElement:outer};
 const inner={tagName:"DETAILS",open:false,parentElement:container};
 const reveal=new Function("panel",source.slice(start,end)+"return revealWateringPanel;")(inner);
 reveal();
 assert.equal(inner.open,true);
 assert.equal(outer.open,true);
});
test("journal watering, seed-card shortcut, and planner shortcut open a visible manager",()=>{
 assert.match(source,/if\(btn\.dataset\.wmJournal\)\{openFor\(btn\.dataset\.wmJournal\);return;\}/);
 assert.ok(source.includes('else{openFor("");feed.textContent'));
 assert.ok(source.includes('button.addEventListener("click",()=>openFor(""));'));
 assert.match(source,/requestAnimationFrame\(\(\)=>\{/);
 for(const file of ["index.html","docs/index.html"])
  assert.match(fs.readFileSync(path.join(root,file),"utf8"),/seedbank-watering\.js\?v=20261112-wateringnav1/);
 assert.match(fs.readFileSync(path.join(root,"sw.js"),"utf8"),/const APP_CACHE="dk-seedbank-app-v\d+"/);
});
