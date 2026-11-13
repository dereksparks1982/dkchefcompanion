"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../.."),code=fs.readFileSync(path.join(root,"assets/seedbank-workbench.js"),"utf8");
function fn(name,next){
 const start=code.indexOf("function "+name+"("),end=code.indexOf("function "+next+"(",start);
 assert.ok(start>=0&&end>start,"Could not extract "+name);
 return new Function(code.slice(start,end)+"return "+name+";")();
}
test("legacy lots count as active, archived and catalog-source rows never double-count",()=>{
 const active=fn("activeRecordedSeeds","transitionPacket");
 const lots=[{seedKey:"Dill",count:20},{seedKey:"Dill",count:9,status:"empty"},
  {seedKey:"Dill",count:0,status:"active",origin:"catalog"},{seedKey:"Other",count:4}];
 assert.equal(active(lots,"Dill"),20);
 assert.equal(active(lots,"Other"),4);
});
test("marking one packet empty keeps its history, and restoring it is reversible",()=>{
 const transition=fn("transitionPacket","countSeeds");
 const row={seedKey:"Dill",count:20,lot:"Ducat",status:"active"};
 assert.equal(transition(row,"empty","2026-11-12T17:00:00Z"),true);
 assert.equal(row.count,20);
 assert.equal(row.archivedAt,"2026-11-12");
 assert.equal(transition(row,"empty","2026-11-12T17:01:00Z"),false);
 assert.equal(transition(row,"active","2026-11-13T09:00:00Z"),true);
 assert.equal(row.history.length,2);
 assert.equal(row.archivedAt,"");
});
test("archiving is integrated with existing inventory, both web copies and offline cache",()=>{
 assert.match(code,/id="wbArchiveCatalog"/);
 assert.match(code,/id="wbPacketArchive"/);
 assert.match(code,/function updatePacket\(row,status,archiveDate=""/);
 assert.match(code,/state\.overrides\[row\.seedKey\]/);
 for(const file of ["index.html","docs/index.html"]){
  const html=fs.readFileSync(path.join(root,file),"utf8");
  assert.match(html,/seedbank-workbench\.js\?v=20261112-[a-z0-9-]+/);
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
 }
 assert.match(fs.readFileSync(path.join(root,"sw.js"),"utf8"),/const APP_CACHE="dk-seedbank-app-v\d+"/);
});
