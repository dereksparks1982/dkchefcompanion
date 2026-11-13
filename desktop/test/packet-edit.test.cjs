"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../.."),read=file=>fs.readFileSync(path.join(root,file),"utf8");
const sandbox={window:{}};vm.runInNewContext(read("assets/seedbank-packet-tracking.js"),sandbox);
const edit=sandbox.window.DKSeedBankPacketTracking.editPacketFields;
test("edit packet metadata without touching identity, origin or archive state",()=>{
 const next=edit({lot:"  Basil A  ",count:"65",year:"2025",supplier:"Co-op",place:"Tin",obtained:"2025-05-01",
  id:"must-not-overwrite",seedKey:"bad",status:"active"});
 assert.equal(next.lot,"Basil A");
 assert.equal(next.count,65);assert.equal(next.year,2025);
 assert.equal(next.obtained,"2025-05-01");
 assert.equal(Object.hasOwn(next,"id"),false);
 assert.equal(Object.hasOwn(next,"seedKey"),false);
 assert.equal(Object.hasOwn(next,"status"),false);
});
test("unknown counts are blank, and a literal zero is not silently reported as counted seeds",()=>{
 const result=edit({count:"",year:"",obtained:""});
 assert.equal(result.count,null);assert.equal(result.year,null);
 assert.throws(()=>edit({count:"0"}),/positive seed count/);
 assert.throws(()=>edit({count:"10000000"}),/positive seed count/);
 assert.throws(()=>edit({count:"-1"}),/positive seed count/);
 assert.throws(()=>edit({year:"1899"}),/Year packed/);
 assert.throws(()=>edit({year:"2101"}),/Year packed/);
 assert.throws(()=>edit({obtained:"2026-02-30"}),/valid date/);
});
test("packet edit preserves links and status history and appears on active and archived lists",()=>{
 const source=read("assets/seedbank-workbench.js");
 assert.match(source,/id="wbLotEditForm"/);
 assert.equal((source.match(/data-wb-edit-packet/g)||[]).length>=3,true);
 assert.match(source,/const next=\{\.\.\.row,\.\.\.fields,updatedAt:now\}/);
 assert.match(source,/countHistory=\[/);
 assert.match(source,/record\.origin==="catalog"/);
 assert.match(source,/dkseedbank:packet-inventory-changed/);
 for(const filename of ["index.html","docs/index.html"]){
  const page=read(filename);
  assert.match(page,/seedbank-workbench\.js\?v=20261112-packetedit1/);
  assert.equal((page.match(/<article class="seed"/g)||[]).length,319);
 }
 assert.match(read("sw.js"),/dk-seedbank-app-v45/);
});
