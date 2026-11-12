"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {webcrypto}=require("node:crypto");

const root=path.resolve(__dirname,"..","..");
const bundle=path.join(root,"desktop","runtime");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
function browserModule(name){
 const window={crypto:webcrypto};
 const source=fs.readFileSync(path.join(bundle,"assets",name),"utf8");
 vm.runInNewContext(source,{window,TextEncoder,Date,Math,Number,String,Array,Map,Set,RegExp});
 return window;
}

test("recovery validates old and new backup formats without changing data",()=>{
 const backup=browserModule("seedbank-backup-utils.js").DKSeedBankBackup;
 const old={format:"dk-seedbank-v1",journal:[{plant:"Mint",date:"2026-11-11"}],photos:[]};
 assert.equal(backup.validate(old).plantings,1);
 assert.equal(backup.validate(old).uploadedPhotos,0);
 assert.equal(backup.validate({...old,workbench:{additions:[{name:"New variety",category:"Herbs and medicinal plants"}]}}).addedVarieties,1);
 assert.throws(()=>backup.validate({format:"wrong",journal:[]}));
 assert.throws(()=>backup.validate({...old,journal:[{plant:123,date:"2026-11-11"}]}));
 assert.throws(()=>backup.validate({...old,photos:[{key:"bad",data:"data:image/svg+xml;base64,AA=="}]}));
 assert.throws(()=>backup.validate({...old,photos:[{key:"x",data:"data:image/png;base64,AA=="},{key:"x",data:"data:image/png;base64,AA=="}]}));
});

test("export checksum catches damaged backups and recognizes legacy exports",async()=>{
 const backup=browserModule("seedbank-backup-utils.js").DKSeedBankBackup;
 const snapshot={format:"dk-seedbank-v1",backupSchema:2,exportedAt:"2026-11-12T15:00:00Z",
  journal:[{plant:"Mint",date:"2026-11-11"}],workbench:{lots:[]},photos:[]};
 const digest=await backup.checksum(snapshot);
 assert.match(digest,/^[a-f0-9]{64}$/);
 assert.equal((await backup.verify({...snapshot,integrity:{algorithm:"SHA-256",digest}})).verified,true);
 await assert.rejects(()=>backup.verify({...snapshot,journal:[{plant:"Oregano",date:"2026-11-11"}],integrity:{algorithm:"SHA-256",digest}}),/integrity check failed/);
 assert.equal((await backup.verify({format:"dk-seedbank-v1",journal:[]})).verified,false);
});

test("care reminders use only known quantities and observed tests",()=>{
 const alerts=browserModule("seedbank-alerts.js").DKSeedBankAlerts;
 const plants=[{key:"mint",name:"Mint",mode:"indoor",count:20,used:5,archived:false},
  {key:"dill",name:"Dill",mode:"direct-cool",count:0,used:0,archived:false}];
 const result=alerts.assess({plants,today:"2026-11-12",lowStock:30,
  lots:[{seedKey:"mint",year:2020}],tests:[{seedKey:"mint",date:"2025-01-01",tested:10,sprouted:4}]});
 assert.equal(result.counts.low,1);
 assert.equal(result.counts.aging,1);
 assert.equal(result.counts.weak,1);
 assert.equal(result.counts.upcoming,0);
 assert.equal(result.entries.some(x=>x.key==="dill"&&x.type==="low"),false);
 const ru=alerts.assess({plants,today:"2026-11-12",locale:"ru",lowStock:30});
 assert.match(ru.entries[0].detail,/Осталось/);
});

test("estimated sowing windows require a user-supplied frost date",()=>{
 const alerts=browserModule("seedbank-alerts.js").DKSeedBankAlerts;
 const plants=[{key:"x",name:"Basil",mode:"indoor",count:0,used:0,archived:false}];
 assert.equal(alerts.assess({plants,today:"2027-01-20"}).counts.upcoming,0);
 assert.equal(alerts.assess({plants,today:"2027-01-20",lastFrost:"2027-04-01"}).counts.upcoming,1);
});

test("desktop update check accepts only real portable GitHub release paths",()=>{
 const {selectLatest}=require("../update-check.cjs");
 const release=(version)=>({
  tag_name:"v"+version+"-linux-portable",draft:false,
  html_url:"https://github.com/dereksparks1982/seedrepo/releases/tag/v"+version+"-linux-portable",
  assets:[{name:"DK-Seed-Bank-"+version+"-Linux-x86_64.tar.gz",state:"uploaded",
   browser_download_url:"https://github.com/dereksparks1982/seedrepo/releases/download/v"+version+"-linux-portable/DK-Seed-Bank-"+version+"-Linux-x86_64.tar.gz"}]
 });
 assert.equal(selectLatest([release("0.9.3"),release("0.9.9"),release("0.10.0")],"0.9.4").version,"0.10.0");
 assert.equal(selectLatest([release("0.9.3")],"0.9.4"),null);
 assert.equal(selectLatest([{...release("9.9.9"),html_url:"https://example.org"}],"0.9.4"),null);
 assert.equal(selectLatest([{...release("9.9.9"),assets:[{name:"fake"}]}],"0.9.4"),null);
});

test("mobile and desktop bundles contain the new resilient interface",()=>{
 const html=fs.readFileSync(path.join(bundle,"index.html"),"utf8");
 const files=["seedbank-backup-utils.js","seedbank-alerts.js","seedbank-resilience.js",
  "seedbank-resilience.css","desktop-offline.js","desktop-update.css"];
 for(const f of files)assert.ok(fs.existsSync(path.join(bundle,"assets",f)),f+" not bundled");
 assert.match(html,/<meta name="viewport" content="width=device-width,initial-scale=1">/);
 assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
 assert.ok(html.indexOf("seedbank-backup-utils.js")<html.indexOf("seedbank-cards.js"));
 assert.ok(html.indexOf("seedbank-alerts.js")<html.indexOf("seedbank-workbench.js"));
 assert.ok(html.indexOf("seedbank-resilience.js")>html.indexOf("seedbank-i18n.js"));
 assert.match(html,/assets\/desktop-update\.css/);
 assert.match(read("index.html"),/@media\(max-width:430px\)/);
 assert.match(read("assets/seedbank-resilience.css"),/@media\(max-width:430px\)/);
});

test("service worker precaches the entire offline shell and uses a network timeout",()=>{
 const source=read("sw.js");
 assert.match(source,/dk-seedbank-app-v3/);
 for(const part of ["seedbank-backup-utils.js","seedbank-alerts.js","seedbank-resilience.js","seedbank-resilience.css"])
  assert.ok(source.includes(part),part+" not precached");
 assert.match(source,/new AbortController\(\)/);
 assert.match(source,/cache\.match\(request/);
});

test("README stays concise and points at the portable Linux folder",()=>{
 const text=read("README.md");
 assert.ok(text.includes("v0.9.4-linux-portable/DK-Seed-Bank-0.9.4-Linux-x86_64.tar.gz"));
 assert.ok(text.includes("https://dereksparks1982.github.io/seedrepo/"));
 assert.ok(!text.includes("inventory/"));
 assert.ok(!text.includes(".AppImage"));
});
