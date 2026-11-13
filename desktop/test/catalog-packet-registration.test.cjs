"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const window={};vm.runInNewContext(read("assets/seedbank-packet-tracking.js"),{window});
const model=window.DKSeedBankPacketTracking;
test("existing packet registration respects original card stock",()=>{
 const rows=[{id:"p1",seedKey:"Basil",origin:"catalog",status:"active",kind:"packet"}];
 assert.equal(model.catalogSlots(3,rows,"Basil"),2);
 assert.equal(model.catalogSlots(1,rows,"Basil"),0);
 assert.equal(model.catalogSlots(0,rows,"Basil"),0);
 assert.equal(model.catalogSlots(-1,rows,"Basil"),0);
 assert.equal(model.catalogSlots(5,rows,"Mint"),5);
 assert.equal(model.catalogSlots(3,[...rows,{id:"p2",seedKey:"Basil",origin:"catalog",status:"empty",kind:"packet"}],"Basil"),2);
});
test("registered catalog packets keep actual seed quantities and source links",()=>{
 const journal=[{seedLotId:"p1",seedKey:"Basil",minSeeds:5,maxSeeds:5}];
 const row={id:"p1",origin:"catalog",seedKey:"Basil",count:35,status:"active"};
 assert.equal(model.balance(row,journal).lower,30);
 assert.equal(model.balance(row,journal).upper,30);
 assert.equal(model.catalogSlots(2,[row],"Basil"),1);
});
test("registering and removing packets stays safe and does not change original cards",()=>{
 const wb=read("assets/seedbank-workbench.js"),cards=read("assets/seedbank-cards.js");
 assert.match(wb,/name="alreadyCounted" value="yes"/);
 assert.match(wb,/alreadyCounted\?"catalog":"new"/);
 assert.match(wb,/catalogSlots\(/);
 assert.match(wb,/list==="lots"&&core\.journal\(\)\.some\(entry=>entry\.seedLotId===record\.id\)/);
 assert.match(wb,/function packetChoicesFor/);
 assert.match(cards,/dkseedbank:packet-inventory-changed/);
 for(const file of ["index.html","docs/index.html"]){
  const html=read(file);
  assert.match(html,/seedbank-workbench\.js\?v=20261112-registercards1/);
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
 }
 assert.match(read("sw.js"),/dk-seedbank-app-v44/);
});
