"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const workbench=read("assets/seedbank-workbench.js");
test("card packet summary selects only the matching variety and keeps archived linked history",()=>{
 const start=workbench.indexOf("function cardPacketSummary(key){");
 const end=workbench.indexOf("function renderCardPacketHistory(",start);
 assert.ok(start>=0&&end>start,"card packet summary helper missing");
 const state={lots:[
  {id:"a",seedKey:"Basil",status:"active"},
  {id:"b",seedKey:"Basil",status:"empty"},
  {id:"c",seedKey:"Dill",status:"active"}]};
 const core={journal:()=>[
  {id:"log-1",seedLotId:"a"},
  {id:"log-2",seedLotId:"b"},
  {id:"log-3",seedLotId:"c"}]};
 const summary=new Function("state","core",workbench.slice(start,end)+"return cardPacketSummary;")(state,core);
 assert.deepEqual(summary("Basil").rows.map(row=>row.id),["a","b"]);
 assert.equal(summary("Basil").active,1);
 assert.equal(summary("Basil").archived,1);
 assert.equal(summary("Basil").linked,2);
 assert.equal(summary("Unknown").rows.length,0);
});
test("seed cards get one collapsed, lazy-loaded packet view plus a working management path",()=>{
 assert.match(workbench,/function syncCardPacketHistory\(\)/);
 assert.match(workbench,/detail=document\.createElement\("details"\)/);
 assert.match(workbench,/detail\.className="wb-card-packets"/);
 assert.match(workbench,/detail\.addEventListener\("toggle",\(\)=>\{if\(detail\.open\)renderCardPacketHistory/);
 assert.match(workbench,/if\(detail\.open\)renderCardPacketHistory\(detail,plant\.key\)/);
 assert.match(workbench,/function revealPacketManager\(key,scroll=true\)/);
 assert.match(workbench,/planner\.open=true;inventory\.open=true/);
 assert.match(workbench,/revealPacketManager\(row\.seedKey,false\)/);
 assert.match(workbench,/data-wb-manage-variety/);
 assert.match(workbench,/data-wb-lot-key/);
 assert.match(workbench,/data-wb-archive-key/);
 assert.match(workbench,/packetPlantingHistory\(row\)\+packetCountHistory\(row\)/);
 assert.match(workbench,/document\.addEventListener\("dkseedbank:journal-rendered"/);
 const css=read("assets/seedbank-workbench.css");
 assert.match(css,/\.seed > \.wb-card-packets/);
 assert.match(css,/@media\(max-width:580px\)/);
 for(const page of ["index.html","docs/index.html"]){
  const content=read(page);
  assert.match(content,/seedbank-workbench\.js\?v=20261112-[a-z0-9-]+/);
  assert.equal((content.match(/<article class="seed"/g)||[]).length,319);
 }
 assert.match(read("sw.js"),/dk-seedbank-app-v57/);
});
