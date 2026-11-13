"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const window={};
vm.runInNewContext(read("assets/seedbank-packet-tracking.js"),{window});
const tracking=window.DKSeedBankPacketTracking;
test("unknown seed quantity never becomes a fabricated zero remaining count",()=>{
 const unknown=tracking.balance({id:"p1",count:0},[]);
 assert.equal(unknown.count,null);
 assert.equal(unknown.lower,null);
 assert.equal(unknown.upper,null);
 const exact=tracking.balance({id:"p1",count:25},[{seedLotId:"p1",minSeeds:5,maxSeeds:5}]);
 assert.equal(exact.lower,20);
 assert.equal(exact.upper,20);
 const unsure=tracking.balance({id:"p1",count:25},[{seedLotId:"p1",minSeeds:5,maxSeeds:9}]);
 assert.equal(unsure.lower,16);
 assert.equal(unsure.upper,20);
});
test("a planting affects only its selected packet and unknown sowing amounts stay uncertain",()=>{
 const journal=[{seedLotId:"A",minSeeds:3,maxSeeds:3},{seedLotId:"B",minSeeds:7,maxSeeds:7},
  {seedLotId:"A",minSeeds:0,maxSeeds:0},{seedKey:"Mint",minSeeds:4,maxSeeds:4}];
 const a=tracking.balance({id:"A",count:30},journal);
 const b=tracking.balance({id:"B",count:10},journal);
 assert.equal(a.lower,null);
 assert.equal(a.upper,27);
 assert.equal(b.lower,3);
 assert.equal(b.upper,3);
 assert.equal(tracking.unassigned(journal,"Mint").length,1);
});
test("packet form and histories belong to existing garden tools in both languages",()=>{
 const cards=read("assets/seedbank-cards.js"),workbench=read("assets/seedbank-workbench.js");
 assert.match(cards,/name="seedLotId"/);
 assert.match(cards,/updateJournalPacketOptions/);
 assert.match(cards,/seedKey:selectedKey,seedLotId/);
 assert.match(workbench,/function packetChoicesFor/);
 assert.match(workbench,/function packetPlantingHistory/);
 assert.match(workbench,/data-wb-journal/);
 assert.match(workbench,/harvests\.filter\(h=>h\.plantingId===entry\.id\)/);
 assert.match(read("assets/seedbank-i18n.js"),/Исходный пакет/);
 for(const file of ["index.html","docs/index.html"]){
  const html=read(file);
  assert.ok(html.indexOf("seedbank-packet-tracking.js")<html.indexOf("seedbank-cards.js"));
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
 }
 assert.match(read("sw.js"),/const APP_CACHE="dk-seedbank-app-v\d+"/);
 assert.match(read("sw.js"),/seedbank-packet-tracking\.js/);
});
