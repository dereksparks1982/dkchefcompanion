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
 assert.match(source,/dk-seedbank-app-v10/);
 for(const part of ["seedbank-backup-utils.js","seedbank-alerts.js","seedbank-resilience.js","seedbank-resilience.css"])
  assert.ok(source.includes(part),part+" not precached");
 assert.match(source,/new AbortController\(\)/);
 assert.match(source,/cache\.match\(request/);
});

test("README stays concise and points at the portable Linux folder",()=>{
 const text=read("README.md");
 assert.ok(text.includes("v0.9.9-linux-portable/DK-Seed-Bank-0.9.9-Linux-x86_64.tar.gz"));
 assert.ok(text.includes("https://dereksparks1982.github.io/seedrepo/"));
 assert.ok(!text.includes("inventory/"));
 assert.ok(!text.includes(".AppImage"));
});


test("English and Russian banners contain no collection eyebrow",()=>{
 const english=read("index.html");
 const russian=read("docs/index.html");
 assert.doesNotMatch(english,/<div class="eyebrow">/);
 assert.doesNotMatch(russian,/<div class="eyebrow">/);
 assert.doesNotMatch(english,/My seed collection<\/div>/);
 assert.doesNotMatch(russian,/My seed collection<\/div>/);
 assert.match(english,/<span class="dk-title-en"/);
 assert.match(english,/<span class="dk-title-ru"/);
 assert.match(read("assets/seedbank-i18n.css"),/html\[lang="ru"\] header\{background:#000\}/);
 assert.match(english,/header\{background:linear-gradient\(125deg,#163b2d,#286547\)/);
});

test("backups can be inspected without replacing stored records",()=>{
 const script=read("assets/seedbank-resilience.js");
 assert.match(script,/dkRecoveryVerifyInput/);
 assert.match(script,/helper\.validate\(data\)/);
 assert.match(script,/await helper\.verify\(data\)/);
 assert.match(script,/No records were changed/);
 assert.match(script,/Записи не изменены/);
 assert.match(script,/file\.size>100000000/);
});

test("offline photo saver advances through consecutive batches",()=>{
 const script=read("assets/seedbank-resilience.js");
 assert.match(script,/return Array\.from\(seen\);/);
 assert.doesNotMatch(script,/return Array\.from\(seen\)\.slice\(0,80\)/);
 assert.match(script,/const maxStored=180,batchLimit=80/);
 assert.match(script,/if\(stopped\|\|added>=limit\)break/);
 assert.match(script,/await cache\.match\(request\)/);
 assert.match(script,/Stop photo saving/);
});

test("export limits, normalized SHA-256 backup and user-controlled reminders",()=>{
 const cards=read("assets/seedbank-cards.js");
 assert.match(cards,/const serializedBackup=JSON\.stringify\(draft\)/);
 assert.match(cards,/const snapshot=JSON\.parse\(serializedBackup\)/);
 assert.match(cards,/new Blob\(\[serializedBackup\]\)\.size>95000000/);
 assert.match(cards,/await helper\.checksum\(snapshot\)/);
 const alerts=browserModule("seedbank-alerts.js").DKSeedBankAlerts;
 const p=[{key:"mint",name:"Mint",count:5,used:0,archived:false}];
 assert.equal(alerts.assess({today:"2026-11-12",plants:p,lowStock:0}).counts.low,0);
 assert.equal(alerts.assess({today:"2026-11-12",plants:p,lowStock:10}).counts.low,1);
});


test("all expandable headings use a right-hand chevron and have no left triangle",()=>{
 const css=read("assets/seedbank-chevrons.css");
 const html=read("index.html");
 const mirrored=read("docs/index.html");
 const worker=read("sw.js");
 assert.match(css,/details\s*>\s*summary::marker\{content:""\s*!important/);
 assert.match(css,/details\s*>\s*summary::-webkit-details-marker/);
 assert.match(css,/details:not\(\.category\)\s*>\s*summary::after/);
 assert.match(css,/details:not\(\.category\)\[open\]\s*>\s*summary::after/);
 assert.match(css,/rotate\(180deg\)/);
 assert.match(css,/\.seed-details\s*>\s*summary::before/);
 assert.match(css,/\.wb-journal-details\s*>\s*summary::before/);
 assert.match(html,/assets\/seedbank-chevrons\.css\?v=20261112-chevron2/);
 assert.match(mirrored,/\.\.\/assets\/seedbank-chevrons\.css\?v=20261112-chevron2/);
 assert.ok(html.lastIndexOf("seedbank-chevrons.css") > html.lastIndexOf("seedbank-i18n.css"));
 assert.ok(mirrored.lastIndexOf("seedbank-chevrons.css") > mirrored.lastIndexOf("seedbank-i18n.css"));
 assert.match(worker,/"assets\/seedbank-chevrons\.css"/);
 assert.equal((html.match(/class="category"/g)||[]).length,19);
 assert.equal((html.match(/class="chevron"/g)||[]).length,19);
 assert.doesNotMatch(read("assets/seedbank-recipes.js"),/<summary>＋ Add your own recipe<\/summary>/);
});


test("per-planting growth photos have direct camera and library controls in both web editions",()=>{
 const html=read("index.html"),mirror=read("docs/index.html");
 for(const source of [html,mirror]){
  assert.match(source,/seedbank-growth-photos\.css\?v=20261112-growth1/);
  assert.match(source,/seedbank-growth-photos\.js\?v=20261112-growth1/);
  assert.ok(source.indexOf("seedbank-growth-photos.js")>source.indexOf("seedbank-i18n.js"));
  assert.equal((source.match(/<article class="seed"/g)||[]).length,319);
 }
 const script=read("assets/seedbank-growth-photos.js");
 assert.match(script,/capture="environment"/);
 assert.match(script,/accept="image\/\*"/);
 assert.match(script,/data-growth-camera/);
 assert.match(script,/data-growth-upload/);
 assert.match(script,/data-growth-date/);
 assert.match(script,/data-growth-stage/);
 assert.match(script,/data-growth-note/);
 assert.match(script,/canvas\.toBlob\(resolve,"image\/jpeg",0\.82\)/);
 assert.match(script,/async function saveBlob/);
 assert.match(script,/dkseedbank:journal-rendered/);
 assert.match(script,/dkseedbank:journal-deleted/);
 assert.match(script,/Remove photo/);
 assert.match(script,/Сделать фото/);
 assert.match(script,/Изменения роста/);
 assert.match(read("assets/seedbank-growth-photos.css"),/@media\(max-width:510px\)/);
 assert.match(read("sw.js"),/"assets\/seedbank-growth-photos\.js"/);
 assert.match(read("sw.js"),/"assets\/seedbank-growth-photos\.css"/);
});

test("photo timeline stays with its planting through edits and full backup restore",()=>{
 const cards=read("assets/seedbank-cards.js");
 assert.match(cards,/item\.growthPhotos=previous\.growthPhotos/);
 assert.match(cards,/addJournalGrowthPhoto:/);
 assert.match(cards,/removeJournalGrowthPhoto:/);
 assert.match(cards,/dkseedbank:journal-deleted/);
 assert.match(cards,/helper\.isGrowthPhotoKey\(image\.key,data\.journal\)/);
 assert.match(cards,/if\(helper\.isGrowthPhotoKey\(key,data\.journal\)\)continue/);
 assert.match(cards,/const growthKeys=window\.DKSeedBankBackup\?\.growthPhotoKeys\(journal\)/);
 const photo=read("assets/seedbank-growth-photos.js");
 assert.match(photo,/indexedDB\.open\("dk-seedbank-media",1\)/);
 assert.match(photo,/backup\.growthPhotoKey\(entryId,meta\.id\)/);
 assert.match(photo,/core\.addJournalGrowthPhoto\(entryId,meta\)/);
 assert.match(photo,/core\.removeJournalGrowthPhoto\(entryId,meta\)/);
});

test("growth photo backups reject incomplete media, malformed stages, and duplicate IDs",()=>{
 const helper=browserModule("seedbank-backup-utils.js").DKSeedBankBackup;
 const metadata={id:"photo-20261112",date:"2026-11-12",stage:"seedling",note:"First leaves"};
 const entry={id:"log-20261111-mint",plant:"Mint",date:"2026-11-11",growthPhotos:[metadata]};
 const key=helper.growthPhotoKey(entry.id,metadata.id);
 const backup={format:"dk-seedbank-v1",journal:[entry],photos:[{key,data:"data:image/jpeg;base64,AA=="}]};
 assert.equal(helper.validate(backup).growthPhotos,1);
 assert.equal(helper.isGrowthPhotoKey(key,[entry]),true);
 assert.throws(()=>helper.validate({...backup,photos:[]}),/missing from backup/);
 assert.throws(()=>helper.validate({...backup,journal:[{...entry,growthPhotos:[{...metadata,stage:"invalid"}]}]}),/photo details/);
 assert.throws(()=>helper.validate({...backup,journal:[{...entry,growthPhotos:[metadata,metadata]}]}),/Duplicate planting photo/);
 assert.equal(helper.validate({format:"dk-seedbank-v1",journal:[{plant:"Mint",date:"2026-11-11"}]}).growthPhotos,0);
});

test("desktop bundle includes photo module, styles and iPhone capture fallback",()=>{
 const html=fs.readFileSync(path.join(bundle,"index.html"),"utf8");
 for(const file of ["seedbank-growth-photos.js","seedbank-growth-photos.css"]){
  assert.ok(fs.existsSync(path.join(bundle,"assets",file)),file+" missing");
 }
 assert.ok(html.includes('capture="environment"')===false,"Camera control belongs in the runtime UI, not static HTML");
 assert.match(html,/seedbank-growth-photos\.js/);
});


test("growth measurement module is loaded and precached on both language versions",()=>{
 const html=read("index.html"),mirror=read("docs/index.html"),worker=read("sw.js");
 for(const source of [html,mirror]){
  assert.match(source,/seedbank-growth-measurements\.css\?v=20261112-height1/);
  assert.match(source,/seedbank-growth-measurements\.js\?v=20261112-height1/);
  assert.ok(source.indexOf("seedbank-growth-measurements.js")>source.indexOf("seedbank-growth-photos.js"));
  assert.equal((source.match(/<article class="seed"/g)||[]).length,319);
 }
 for(const file of ["seedbank-growth-measurements.js","seedbank-growth-measurements.css"]){
  assert.match(worker,new RegExp("assets/"+file.replaceAll(".","\\.")));
  assert.ok(fs.existsSync(path.join(bundle,"assets",file)),file+" missing from desktop");
 }
 assert.match(read("assets/seedbank-growth-measurements.css"),/@media\(max-width:620px\)/);
});
test("growth chart math uses actual dates and converts units accurately",()=>{
 const mathWindow={};
 const ctx={window:mathWindow,document:{getElementById:()=>null},Date,Math,Number,String,Array,Map,Set,RegExp};
 vm.runInNewContext(read("assets/seedbank-growth-measurements.js"),ctx);
 const math=mathWindow.DKSeedBankGrowthMath;
 assert.equal(math.toCm(5,"in"),12.7);
 assert.equal(math.toCm("11.4","cm"),11.4);
 assert.equal(math.fromCm(12.7,"in"),5);
 assert.equal(math.validDate("2026-02-30"),false);
 assert.equal(math.validDate("2026-11-12"),true);
 for(const height of [-1,Infinity,"",null,"xyz"])assert.throws(()=>math.toCm(height,"cm"));
 const records=[
  {id:"z",date:"2026-11-20",heightCm:20,unit:"cm",note:""},
  {id:"a",date:"2026-11-12",heightCm:8,unit:"cm",note:""},
  {id:"y",date:"2026-11-16",heightCm:15,unit:"cm",note:""}
 ];
 const values=math.sorted(records);
 assert.equal(values[0].date,"2026-11-12");
 assert.equal(values[2].date,"2026-11-20");
 const report=math.summarize(records);
 assert.equal(report.count,3);
 assert.equal(report.changeCm,5);
 assert.equal(report.totalCm,12);
 assert.equal(report.days,4);
 assert.equal(math.summarize([]).count,0);
});
test("measurement history is optional, preserved on edit, and validates backup integrity",()=>{
 const cards=read("assets/seedbank-cards.js");
 assert.match(cards,/item\.growthMeasurements=previous\.growthMeasurements/);
 assert.match(cards,/saveJournalMeasurement:/);
 assert.match(cards,/deleteJournalMeasurement:/);
 assert.match(cards,/if\(!save\(storageKey,updated\)\)return false/);
 const backup=browserModule("seedbank-backup-utils.js").DKSeedBankBackup;
 const sample={id:"measure-20261112",date:"2026-11-12",heightCm:12.7,unit:"in",note:"Seedling"};
 const old={format:"dk-seedbank-v1",journal:[{plant:"Basil",date:"2026-11-12"}]};
 assert.equal(backup.validate(old).growthMeasurements,0);
 const valid={format:"dk-seedbank-v1",journal:[{plant:"Basil",date:"2026-11-12",growthMeasurements:[sample]}]};
 assert.equal(backup.validate(valid).growthMeasurements,1);
 assert.throws(()=>backup.validate({...valid,journal:[{...valid.journal[0],growthMeasurements:[sample,sample]}]}),/Invalid growth measurement/);
 assert.throws(()=>backup.validate({...valid,journal:[{...valid.journal[0],growthMeasurements:[{...sample,date:"2026-02-30"}]}]}),/Invalid growth measurement date/);
 assert.throws(()=>backup.validate({...valid,journal:[{...valid.journal[0],growthMeasurements:[{...sample,heightCm:-2}]}]}),/Invalid growth measurement/);
});
test("growth measurement UI remains user-controlled with no forced care reminders",()=>{
 const js=read("assets/seedbank-growth-measurements.js");
 for(const term of ["data-measure-form","data-measure-unit","data-measure-edit","data-measure-delete","dk-measure-chart",
  "dkseedbank:journal-rendered","Growth measurements","Измерения роста","no schedule or reminders","без расписания и напоминаний",
  "preserveAspectRatio","polyline","aria-label","inputmode=\"decimal\""]){
  assert.ok(js.includes(term),term+" missing");
 }
 assert.match(read("assets/seedbank-resilience.js"),/growthMeasurements/);
 assert.match(read("assets/seedbank-cards.js"),/Измерения высоты/);
});


test("Drive sync is included in both web editions, desktop and offline app cache",()=>{
 const html=read("index.html"),docs=read("docs/index.html"),sw=read("sw.js");
 for(const content of [html,docs]){
  assert.match(content,/seedbank-drive-merge\.js\?v=20261112-[a-z0-9-]+/);
  assert.match(content,/seedbank-drive-sync\.js\?v=20261112-[a-z0-9-]+/);
  assert.match(content,/seedbank-drive-sync\.css\?v=20261112-[a-z0-9-]+/);
  assert.ok(content.indexOf("seedbank-drive-sync.js")>content.indexOf("seedbank-resilience.js"));
  assert.equal((content.match(/<article class="seed"/g)||[]).length,319);
 }
 for(const asset of ["seedbank-drive-merge.js","seedbank-drive-sync.js","seedbank-drive-sync.css"]){
  assert.match(sw,new RegExp('assets/'+asset.replaceAll(".","\\.")));
  assert.ok(fs.existsSync(path.join(bundle,"assets",asset)),asset+" not in offline desktop app");
 }
});
test("Google Drive sync integrates full photo backup and journal without losing existing records",()=>{
 const cards=read("assets/seedbank-cards.js");
 for(const snippet of ["exportForSync:createFullBackup","applySyncedBackup",
  "journalDeletesKey","journalDeletes:()=>journalDeletes.slice()",
  "growthPhotosRemoved","growthMeasurementsRemoved",
  "dkseedbank:backup-restored", "noReload:true"]){
  assert.ok(cards.includes(snippet),snippet+" missing");
 }
 assert.match(read("assets/seedbank-workbench.js"),/if\(!options\.noReload\)/);
 const main=read("desktop/main.cjs"),preload=read("desktop/preload.cjs");
 for(const item of ["google-status","google-connect","google-disconnect","google-request"])
  assert.ok(main.includes('dkseed:'+item),item+" bridge missing");
 assert.match(preload,/googleDrive:Object\.freeze/);
 assert.match(main,/driveSyncAPI:/);
});


test("planting journal rows align their tags, growing-guide headers and action areas",()=>{
 const source=read("assets/seedbank-workbench.js");
 assert.match(source,/function alignJournalRows\(\)/);
 assert.match(source,/Array\.from\(document\.querySelectorAll\("#journalEntries \.journal-entry"\)\)/);
 assert.ok(source.indexOf("function alignJournalRows(")<source.indexOf("function journalRoles("),
  "Row alignment helper must not be included in the isolated journal-role test");
 assert.match(source,/journalAlignScheduled/);
 assert.match(source,/tags\.style\.minHeight=/);
 assert.match(source,/overview\.style\.minHeight=/);
 assert.match(source,/requestAnimationFrame\(alignJournalRows\)/);
 assert.match(source,/window\.addEventListener\("resize",scheduleJournalAlignment\)/);
 assert.match(read("desktop/main.cjs"),/journalGuideAlignment/);
});

test("Garden Planner stays on top; Medieval Monastery Garden follows Recipe Guide independently",()=>{
 const monastery=read("assets/seedbank-monastery.js");
 const cards=read("assets/seedbank-cards.js");
 assert.match(monastery,/document\.getElementById\("recipeGuide"\)\.insertAdjacentElement\("afterend",guide\)/);
 assert.match(cards,/document\.querySelector\("\.controls"\)\.insertAdjacentElement\("afterend",planner\)/);
 assert.doesNotMatch(monastery,/\(watering\|\|workbench/);
 for(const source of [read("index.html"),read("docs/index.html")]){
  assert.match(source,/<details id="recipeGuide" class="recipe-guide">/);
  assert.match(source,/seedbank-monastery\.js\?v=20261112-standalone1/);
  assert.match(source,/seedbank-cards\.js\?v=20261112-planner-top2/);
 }
 const worker=read("sw.js");
 assert.match(worker,/dk-seedbank-app-v27/);
});

test("Monastery Garden displays title only with historical details inside",()=>{
 const monastery=read("assets/seedbank-monastery.js");
 assert.match(monastery,/<summary>🏛️ Medieval Monastery Garden<\/summary>/);
 assert.doesNotMatch(monastery,/<summary>🏛️ Medieval Monastery Garden <small>/);
 assert.match(monastery,/Historical reference, not an endorsement/);
 for(const source of [read("index.html"),read("docs/index.html")])
  assert.match(source,/seedbank-monastery\.js\?v=20261112-titleonly2/);
});

test("Drive reuse and timestamped private/photo backups remain independent",()=>{
 const picker=read("assets/seedbank-drive-visible.js");
 const sync=read("assets/seedbank-drive-sync.js");
 assert.match(picker,/async function discover\(token\)/);
 assert.match(picker,/const checked=await discover\(token\)/);
 assert.match(sync,/dkDriveFindFolder/);
 assert.match(sync,/dkDriveCreateFolder"\)\.hidden=lookup!=="missing"/);
 assert.match(sync,/dkDriveLastPrivate/);
 assert.match(sync,/dkDriveLastVisible/);
 assert.match(sync,/saved\.lastVisibleSync=new Date\(\)\.toISOString\(\)/);
 for(const html of [read("index.html"),read("docs/index.html")]){
  assert.match(html,/seedbank-drive-sync\.js\?v=20261112-history6/);
  assert.match(html,/seedbank-drive-visible\.js\?v=20261112-reusefolder4/);
 }
});

test("Visible backup timestamp is tied to the selected folder rather than another folder",()=>{
 const sync=read("assets/seedbank-drive-sync.js");
 assert.match(sync,/lastVisibleFolderId:saved\.lastVisibleFolderId\|\|""/);
 assert.match(sync,/root\.DKSeedBankDriveVisible\?\.folder\(\)\?\.id===saved\.lastVisibleFolderId/);
 assert.match(sync,/saved\.lastVisibleFolderId=published\.folder/);
});

test("Garden Planner quick-access actions use a collection selector and initialize fully",()=>{
 const workbench=read("assets/seedbank-workbench.js");
 assert.match(workbench,/\$\$\("\[data-wb-open\]",host\)\.forEach\(/);
 assert.doesNotMatch(workbench,/(?<!\$)\$\("\[data-wb-open\]",host\)\.forEach\(/);
 assert.match(workbench,/applyRecords\(\);refreshSelects\(\);renderAll\(\);/);
});
