"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const universal=read("assets/dk-chef-universal-scanner.js");
function harness(product={found:true,name:"Green Giant Sweet Peas",brand:"Green Giant",size:"15 oz",category:"food",source:"Open Food Facts"},verification=null){
 const ids=["dkProductStation","dkLanguageSelect","chefScanStart","chefScanStop","chefScanMute","chefScanCamera",
  "chefScanCameraRow","chefScanNext","chefScanPreview","chefScanStatus","chefScanResult","chefScanSaveArea",
  "chefScanBarcode","chefScanName","chefScanBrand","chefScanSize","chefScanDestination","chefScanIngredient",
  "chefScanCount","chefScanLookup","chefScanAdd","chefScanProductName","chefScanProductSource","chefScanProductDetails"];
 const more=["chefScanTitle","chefScanIntro","chefScanOne","chefScanMuteText","chefScanCameraLabel",
  "chefScanAutomatic","chefScanBarcodeLabel","chefScanNameLabel","chefScanBrandLabel",
  "chefScanSizeLabel","chefScanDestinationLabel","chefScanCountLabel","chefScanIngredientLabel","chefScanSaveHelp","chefScanSources",
  "chefFDABox","chefFDATitle","chefFDAStatus","chefFDADetails","chefFDALabel","chefFDANotice"];
 const map=new Map();
 for(const id of ids.concat(more))map.set(id,{
  id,value:"",textContent:"",innerHTML:"",hidden:false,checked:false,listeners:{},
  addEventListener(type,fn){this.listeners[type]=fn;},
  removeAttribute(name){if(name==="href")this.href="";}
 });
 const destination=map.get("chefScanDestination");
 destination.options=[{value:"pantry",textContent:"Pantry"},{value:"cellar",textContent:"Root Cellar"},
  {value:"medicine",textContent:"Medicine Cabinet"},{value:"household",textContent:"Household Supplies"}];
 Object.defineProperty(destination,"selectedOptions",{get(){return destination.options.filter(x=>x.value===destination.value);}});
 map.get("chefScanCount").value="1";
 map.get("chefScanBarcode").value="";
 const events={beeps:0,saved:[],lookup:[],medLookup:[],stop:0,starts:0,resumes:0,pauses:0};
 const audioCtx=class{
  state="running";currentTime=0;destination={};
  createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},
   connect(){},start(){events.beeps++},stop(){}};}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
  resume(){return Promise.resolve();}
 };
 const camera={stop(){events.stop++;return Promise.resolve();},
  pause(){events.pauses++;return true;},resume(){events.resumes++;return true;},
  async devices(){return [{deviceId:"surface-front",label:"Surface Front Camera"}]},
  async start(args){events.camera=args;events.starts++;}};
 const products={async lookup(code){events.lookup.push(code);return product;}};
 const inventory={saveProvision(row){events.saved.push(row);return true;}};
 const window={DKChefBarcodeScanner:camera,DKChefProductLookup:products,
  DKChefMedicineLookup:{async verifyUPC(code){events.medLookup.push(code);return verification||{status:"not-found"};}},
  DKSeedBankRecipes:inventory,AudioContext:audioCtx,
  addEventListener(){}};
 const document={documentElement:{lang:"en"},getElementById:id=>map.get(id)||null};
 const localStorage={getItem:()=>null,setItem(){}};
 vm.runInNewContext(universal,{window,document,localStorage,queueMicrotask,console});
 const click=id=>map.get(id).listeners.click();
 return {events,map,window,click};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test("exactly one scanner lives before storage; old seed catalog starts closed and preserves all seeds",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=read(page);
  assert.equal((html.match(/id="dkProductStation"/g)||[]).length,1);
  assert.ok(html.indexOf('id="dkProductStation"')<html.indexOf('id="dkPantry"'));
  assert.ok(html.indexOf('id="dkPantry"')<html.indexOf('id="dkMedicine"'));
  assert.ok(html.indexOf('id="dkHousehold"')<html.indexOf('id="dkSeedCollection"'));
  assert.match(html,/<details id="dkSeedCollection" class="chef-seed-panel">/);
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
  assert.equal((html.match(/id="chefKitchenApp"/g)||[]).length,1);
  assert.equal((html.match(/id="dkPantry"/g)||[]).length,1);
  assert.equal((html.match(/id="dkRootCellar"/g)||[]).length,0);
  assert.match(html,/dk-chef-universal-scanner\.js\?v=20261113-medicine1/);
  assert.match(html,/dk-chef-universal-scanner\.css\?v=20261113-medicine1/);
 }
 const inventory=read("assets/dk-chef-provisions-ui.js");
 assert.doesNotMatch(inventory,/startScan|data-chef-scan|data-chef-camera|data-chef-photo/);
 assert.match(read("assets/seedbank-cards.js"),/dkSeedCollection"\)\.insertAdjacentElement\("beforebegin",planner\)/);
});
test("a recognized grocery UPC dings once, looks up product, and can add to Pantry",async()=>{
 const h=harness();
 h.click("chefScanStart");
 await flush();
 assert.equal(typeof h.events.camera.onCode,"function");
 h.events.camera.onCode("4006381333931");
 await flush();
 assert.equal(h.events.beeps,1,"The scan sound must occur only once per valid camera scan");
 assert.deepEqual(h.events.lookup,["4006381333931"]);
 assert.equal(h.map.get("chefScanBarcode").value,"4006381333931");
 assert.equal(h.map.get("chefScanName").value,"Green Giant Sweet Peas");
 assert.equal(h.map.get("chefScanBrand").value,"Green Giant");
 assert.equal(h.map.get("chefScanSize").value,"15 oz");
 assert.equal(h.map.get("chefScanDestination").value,"pantry");
 assert.equal(h.map.get("chefScanIngredient").value,"Peas");
 assert.equal(h.map.get("chefScanResult").hidden,false);
 h.click("chefScanAdd");
 assert.equal(h.events.saved.length,1);
 assert.equal(h.events.saved[0].location,"pantry");
 assert.equal(h.events.saved[0].ingredient,"Peas");
});
test("an OTC product is offered to Medicine Cabinet without being a recipe ingredient",async()=>{
 const h=harness({found:true,name:"Pepcid AC 20 mg Tablets",brand:"Pepcid",size:"50 tablets",
  category:"general",source:"UPCitemdb"});
 await h.window.DKChefUniversalScanner.find("036000291452");
 assert.equal(h.map.get("chefScanDestination").value,"medicine");
 assert.equal(h.map.get("chefScanIngredient").value,"");
 h.click("chefScanAdd");
 assert.equal(h.events.saved[0].location,"medicine");
 assert.equal(h.events.saved[0].ingredient,"");
});
test("unknown barcode remains visible with an editable name; manual lookup does not ding",async()=>{
 const h=harness({found:false,reason:"not-found"});
 await h.window.DKChefUniversalScanner.find("4006381333931");
 assert.match(h.map.get("chefScanStatus").textContent,/Barcode read/i);
 assert.equal(h.map.get("chefScanBarcode").value,"4006381333931");
 assert.equal(h.map.get("chefScanSaveArea").hidden,false);
 assert.equal(h.events.beeps,0);
 h.map.get("chefScanName").value="Unlisted canned peas";
 h.click("chefScanAdd");
 assert.equal(h.events.saved[0].name,"Unlisted canned peas");
});
test("iPhone camera stays open across multiple scans and only stops on user action",async()=>{
 const h=harness();
 h.click("chefScanStart");await flush();
 const before=h.events.stop;
 h.events.camera.onCode("4006381333931");await flush();
 assert.equal(h.events.stop,before,"Successful scan must not close camera or revoke its session");
 assert.equal(h.map.get("chefScanNext").hidden,false);
 h.click("chefScanNext");
 assert.equal(h.events.resumes,1);
 h.events.camera.onCode("4006381333931");await flush();
 assert.equal(h.events.starts,1,"No second getUserMedia/Quagga.init between items");
 assert.equal(h.events.beeps,2);
 h.click("chefScanStop");await flush();
 assert.equal(h.events.stop,before+1);
});
test("scanner audio and lookup remain independent of Quagga2's built-in live engine",()=>{
 assert.match(universal,/createOscillator/);
 assert.match(universal,/chefScanMute/);
 assert.match(universal,/chefScanNext/);
 assert.match(universal,/onAttempt:/);
 assert.match(universal,/NotReadableError/);
 assert.match(universal,/camera\.start\(/);
 assert.match(universal,/products\.lookup\(/);
 assert.doesNotMatch(universal,/decodeSingle|toDataURL|drawImage|getUserMedia\(/);
 assert.match(read("sw.js"),/dk-seedbank-app-v59/);
 assert.match(read("sw.js"),/"assets\/dk-chef-universal-scanner.js"/);
 assert.doesNotThrow(()=>new Function(universal));
});


test("medicine product gets an optional exact FDA UPC check and stores only verified details",async()=>{
 const LABEL="https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=01c77e6a-6381-4005-b647-481bbcd442aa";
 const verified={status:"verified",found:true,name:"Pepcid",brand:"Pepcid",generic:"famotidine",ingredient:"Famotidine 20 mg",
  dosageForm:"TABLET",ndc:"12345-678",source:"openFDA NDC Directory",labelUrl:LABEL};
 const h=harness({found:true,name:"Pepcid AC 20 mg Tablets",brand:"Pepcid",category:"medicine",source:"UPCitemdb"},verified);
 await h.window.DKChefUniversalScanner.find("036000291452");
 await flush();
 assert.equal(h.map.get("chefScanDestination").value,"medicine");
 assert.deepEqual(h.events.medLookup,["036000291452"]);
 assert.equal(h.map.get("chefFDABox").hidden,false);
 assert.equal(h.map.get("chefFDALabel").href,LABEL);
 h.click("chefScanAdd");
 assert.equal(h.events.saved.length,1);
 assert.equal(h.events.saved[0].medicineInfo.ndc,"12345-678");
 assert.equal(h.events.saved[0].medicineInfo.verifiedUPC,"036000291452");
 assert.equal(h.events.saved[0].ingredient,"");
});
test("medicine lookup miss never invents NDC or blocks saving a retail product",async()=>{
 const h=harness({found:true,name:"Pepcid AC",brand:"Pepcid",category:"medicine",source:"UPCitemdb"},
  {status:"not-found",found:false});
 await h.window.DKChefUniversalScanner.find("036000291452");
 await flush();
 assert.match(h.map.get("chefFDAStatus").textContent,/No exact UPC match/);
 h.click("chefScanAdd");
 assert.equal(h.events.saved[0].medicineInfo,undefined);
 assert.equal(h.events.saved[0].name,"Pepcid AC");
});
