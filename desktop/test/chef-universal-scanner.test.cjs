"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const universal=read("assets/dk-chef-universal-scanner.js");
function harness(product={found:true,name:"Green Giant Sweet Peas",brand:"Green Giant",size:"15 oz",category:"food",source:"Open Food Facts"}){
 const ids=["dkProductStation","dkLanguageSelect","chefScanStart","chefScanStop","chefScanMute","chefScanCamera",
  "chefScanCameraRow","chefScanPreview","chefScanStatus","chefScanResult","chefScanSaveArea",
  "chefScanBarcode","chefScanName","chefScanBrand","chefScanSize","chefScanDestination","chefScanIngredient",
  "chefScanCount","chefScanLookup","chefScanAdd","chefScanProductName","chefScanProductSource","chefScanProductDetails"];
 const more=["chefScanTitle","chefScanIntro","chefScanOne","chefScanMuteText","chefScanCameraLabel",
  "chefScanAutomatic","chefScanBarcodeLabel","chefScanNameLabel","chefScanBrandLabel",
  "chefScanSizeLabel","chefScanDestinationLabel","chefScanCountLabel","chefScanIngredientLabel","chefScanSaveHelp","chefScanSources"];
 const map=new Map();
 for(const id of ids.concat(more))map.set(id,{
  id,value:"",textContent:"",innerHTML:"",hidden:false,checked:false,listeners:{},
  addEventListener(type,fn){this.listeners[type]=fn;}
 });
 const destination=map.get("chefScanDestination");
 destination.options=[{value:"pantry",textContent:"Pantry"},{value:"cellar",textContent:"Root Cellar"},
  {value:"medicine",textContent:"Medicine Cabinet"},{value:"household",textContent:"Household Supplies"}];
 Object.defineProperty(destination,"selectedOptions",{get(){return destination.options.filter(x=>x.value===destination.value);}});
 map.get("chefScanCount").value="1";
 map.get("chefScanBarcode").value="";
 const events={beeps:0,saved:[],lookup:[],stop:0};
 const audioCtx=class{
  state="running";currentTime=0;destination={};
  createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},
   connect(){},start(){events.beeps++},stop(){}};}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
  resume(){return Promise.resolve();}
 };
 const camera={stop(){events.stop++;return Promise.resolve();},async start(args){events.camera=args;}};
 const products={async lookup(code){events.lookup.push(code);return product;}};
 const inventory={saveProvision(row){events.saved.push(row);return true;}};
 const window={DKChefBarcodeScanner:camera,DKChefProductLookup:products,
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
  assert.equal((html.match(/id="chefPantryApp"/g)||[]).length,1);
  assert.equal((html.match(/id="chefCellarApp"/g)||[]).length,1);
  assert.match(html,/dk-chef-universal-scanner\.js\?v=20261113-station1/);
  assert.match(html,/dk-chef-universal-scanner\.css\?v=20261113-station1/);
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
test("scanner audio and lookup remain independent of Quagga2's built-in live engine",()=>{
 assert.match(universal,/createOscillator/);
 assert.match(universal,/chefScanMute/);
 assert.match(universal,/camera\.start\(/);
 assert.match(universal,/products\.lookup\(/);
 assert.doesNotMatch(universal,/decodeSingle|toDataURL|drawImage|getUserMedia\(/);
 assert.match(read("sw.js"),/dk-seedbank-app-v57/);
 assert.match(read("sw.js"),/"assets\/dk-chef-universal-scanner.js"/);
 assert.doesNotThrow(()=>new Function(universal));
});
