"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("assets/dk-chef-barcode-scanner.js");
function harness(agent="Mozilla/5.0 (X11; Linux x86_64) Firefox/156"){
 const api={
  initialized:0,started:0,stopped:0,detected:null,processed:null,config:null,
  init(config,callback){this.initialized++;this.config=config;callback(null);},
  start(){this.started++;},
  stop(){this.stopped++;return Promise.resolve();},
  onDetected(fn){this.detected=fn;},
  offDetected(fn){if(this.detected===fn)this.detected=null;},
  onProcessed(fn){this.processed=fn;},
  offProcessed(fn){if(this.processed===fn)this.processed=null;},
  CameraAccess:{
   enumerateVideoDevices:async()=>[{kind:"videoinput",deviceId:"camera-1",label:"USB Webcam"}],
   getActiveTrack:()=>({addEventListener(){}})
  }
 };
 const navigator={userAgent:agent,mediaDevices:{getUserMedia(){},async enumerateDevices(){return[];}}};
 const window={Quagga:api,navigator,isSecureContext:true};
 vm.runInNewContext(source,{window,navigator,console});
 return {decoder:window.DKChefBarcodeScanner,quagga:api};
}
const target={querySelector(){return null;},appendChild(){}};
test("bundled Quagga2 provides an actual licensed browser library",()=>{
 const vendor=read("assets/vendor/quagga2.min.js");
 assert.ok(vendor.length>100000);
 assert.match(vendor,/Quagga/);
 assert.match(read("assets/vendor/quagga2-LICENSE.txt"),/The MIT License/);
});
test("integration uses upstream Quagga2 live API, never homemade frame conversion",()=>{
 assert.match(source,/quagga\.init\(config/);
 assert.match(source,/quagga\.start\(\)/);
 assert.match(source,/quagga\.onDetected\(session\.detected\)/);
 assert.match(source,/quagga\.onProcessed\?\.\(session\.processed\)/);
 assert.match(source,/quagga\?\.stop\(\)/);
 assert.match(source,/type:"LiveStream"/);
 assert.doesNotMatch(source,/decodeSingle|drawImage|toDataURL|requestAnimationFrame|createElement\("video"\)|getUserMedia\(/);
 assert.doesNotThrow(()=>new Function(source));
});
test("desktop webcam remains running through unsuccessful processing",async()=>{
 const {decoder,quagga}=harness();
 const statuses=[],detected=[],cameras=[];
 await decoder.start({target,onCode:value=>detected.push(value),
  onProgress:status=>statuses.push(status),onCameras:list=>cameras.push(...list)});
 assert.equal(quagga.initialized,1);
 assert.equal(quagga.started,1);
 assert.equal(quagga.stopped,0,"Quagga.stop must not be called while camera is active");
 assert.equal(quagga.config.inputStream.type,"LiveStream");
 assert.equal(quagga.config.inputStream.target,target);
 assert.equal(quagga.config.inputStream.constraints.facingMode,"user");
 assert.equal(quagga.config.numOfWorkers,0);
 for(let i=0;i<120;i++)quagga.processed({});
 quagga.detected({codeResult:{code:"036000291453",format:"upc_a"}});
 assert.equal(quagga.stopped,0);
 assert.deepEqual(detected,[]);
 assert.ok(statuses.includes("live"));
 assert.ok(statuses.includes("searching"));
 quagga.detected({codeResult:{code:"036000291452",format:"upc_a"}});
 assert.deepEqual(detected,["036000291452"]);
 assert.equal(quagga.stopped,0,"Application must decide when to end a completed scan");
 await decoder.stop();
 assert.equal(quagga.stopped,1);
 assert.equal(quagga.detected,null);
});
test("iPhone selects back camera and UPC-E expansion works",async()=>{
 const {decoder,quagga}=harness("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)");
 const received=[];
 await decoder.start({target,onCode:code=>received.push(code)});
 assert.equal(quagga.config.inputStream.constraints.facingMode,"environment");
 assert.equal(decoder.normalize("0036000291452","ean_13"),"036000291452");
 assert.equal(decoder.normalize("4006381333931","ean_13"),"4006381333931");
 assert.equal(decoder.normalize("4006381333932","ean_13"),"");
 quagga.detected({codeResult:{code:"4006381333931",format:"ean_13"}});
 quagga.detected({codeResult:{code:"036000291452",format:"upc_a"}});
 assert.deepEqual(received,["4006381333931"]);
 await decoder.stop();
});
test("explicit camera selection and second scan release first stream",async()=>{
 const {decoder,quagga}=harness();
 await decoder.start({target});
 await decoder.start({target,deviceId:"camera-1"});
 assert.equal(quagga.config.inputStream.constraints.deviceId.exact,"camera-1");
 assert.equal(quagga.stopped,1);
 assert.equal(quagga.started,2);
 await decoder.stop();
 assert.equal(quagga.stopped,2);
});
test("Surface Quagga2 retries lower resolution without a homemade camera pipeline",async()=>{
 const {decoder,quagga}=harness();
 let tries=0;
 const original=quagga.init.bind(quagga);
 quagga.init=(config,callback)=>{
  tries++;
  if(tries===1){
   quagga.initialized++;
   callback(Object.assign(new Error("Device could not start"),{name:"NotReadableError"}));
  }else original(config,callback);
 };
 const attempts=[];
 await decoder.start({target,onAttempt:(label)=>attempts.push(label)});
 assert.equal(tries,2);
 assert.equal(quagga.started,1);
 assert.equal(quagga.config.inputStream.type,"LiveStream");
 assert.equal(quagga.config.inputStream.constraints.width.ideal,640);
 assert.equal(attempts.length,2);
 await decoder.stop();
});
test("one live camera decodes one barcode per arming without reopening the stream",async()=>{
 const {decoder,quagga}=harness();
 const captured=[];
 await decoder.start({target,onCode:value=>captured.push(value)});
 quagga.detected({codeResult:{code:"036000291452",format:"upc_a"}});
 quagga.detected({codeResult:{code:"036000291452",format:"upc_a"}});
 assert.equal(captured.length,1);
 assert.equal(decoder.pause(),true);
 assert.equal(decoder.resume(),true);
 assert.equal(quagga.stopped,0);
 assert.equal(quagga.started,1);
 await decoder.stop();
});
test("Surface front-facing camera wins over rear camera",async()=>{
 const {decoder,quagga}=harness();
 quagga.CameraAccess.enumerateVideoDevices=async()=>[
  {kind:"videoinput",deviceId:"rear-cam",label:"Surface Rear Camera"},
  {kind:"videoinput",deviceId:"front-cam",label:"Surface Front Camera"}
 ];
 await decoder.start({target});
 assert.equal(quagga.config.inputStream.constraints.deviceId.exact,"front-cam");
 await decoder.stop();
});
test("no barcode photos; live UI guards against accidental rerender shutdown",()=>{
 const ui=read("assets/dk-chef-universal-scanner.js");
 assert.doesNotMatch(ui,/data-chef-photo|scanPhoto|Scan a barcode photo/);
 assert.match(ui,/one product scanner|one scanner/i);
 assert.match(ui,/Quagga2/);
 assert.match(ui,/chefScanCamera/);
 assert.match(ui,/products\.lookup/);
 assert.match(ui,/chefScanProductName/);
 assert.match(ui,/chefScanMute/);
 assert.doesNotThrow(()=>new Function(ui));
 assert.doesNotMatch(read("assets/dk-chef-provisions-ui.js"),/startScan|data-chef-scan/);
});
test("both deployed routes use the direct Quagga2 integration",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=read(page);
  const quagga=html.indexOf("assets/vendor/quagga2.min.js");
  const bridge=html.indexOf("assets/dk-chef-barcode-scanner.js?v=20261113-surface3");
  const app=html.indexOf("assets/dk-chef-provisions-ui.js?v=20261113-medicine1");
  const product=html.indexOf("assets/dk-chef-product-lookup.js?v=20261113-medicine1");
  const station=html.indexOf("assets/dk-chef-universal-scanner.js?v=20261113-surface3");
  const medicine=html.indexOf("assets/dk-chef-medicine-lookup.js?v=20261113-medicine1");
  assert.ok(quagga>0&&bridge>quagga&&medicine>bridge&&product>medicine&&app>product&&station>app,page);
 }
 assert.match(read("sw.js"),/dk-seedbank-app-v60/);
 assert.match(read("README.md"),/Quagga2 direct live-camera integration/);
 assert.match(read("sw.js"),/"assets\/dk-chef-product-lookup.js"/);
 assert.match(read("sw.js"),/"assets\/dk-chef-universal-scanner.js"/);
});

test("Surface driver failures during start() advance to a lower-resolution Quagga2 profile",async()=>{
 const {decoder,quagga}=harness();
 const configs=[];let starts=0;
 const initial=quagga.start.bind(quagga);
 quagga.init=(config,callback)=>{configs.push(config.inputStream.constraints);callback(null);};
 quagga.start=()=>{
  starts++;
  if(starts===1)throw Object.assign(new Error("Driver failed after init"),{name:"NotReadableError"});
  initial();
 };
 const seen=[];
 await decoder.start({target,onAttempt:(label,i)=>seen.push([label,i])});
 assert.equal(starts,2);
 assert.equal(configs[1].width.ideal,640);
 assert.equal(quagga.stopped,1,"Failed start must release its partial stream");
 assert.equal(seen[1][1],2);
 await decoder.stop();
});
test("Surface driver offers 320px and automatic browser defaults if init keeps failing",async()=>{
 const {decoder,quagga}=harness();
 const configs=[];
 quagga.init=(config,callback)=>{
  configs.push({...config.inputStream.constraints});
  if(configs.length<=3)return callback(Object.assign(new Error("Unavailable"),{name:"NotReadableError"}));
  callback(null);
 };
 await decoder.start({target});
 assert.equal(configs.length,4,"Automatic Surface capture should reach browser defaults");
 assert.equal(Object.keys(configs[3]).length,0);
 await decoder.stop();
});
test("startup with profileStartIndex skips previously disconnected camera profiles",async()=>{
 const {decoder,quagga}=harness();
 const seen=[];
 await decoder.start({target,profileStartIndex:1,onAttempt:(label,i)=>seen.push(i)});
 assert.deepEqual(seen,[2]);
 assert.equal(quagga.config.inputStream.constraints.width.ideal,640);
 await decoder.stop();
});
test("already ended Surface track retries instead of claiming a live camera",async()=>{
 const {decoder,quagga}=harness();
 let starts=0;
 quagga.start=()=>{starts++;};
 quagga.CameraAccess.getActiveTrack=()=>({
  readyState:starts===1?"ended":"live",addEventListener(){},getSettings:()=>({})
 });
 await decoder.start({target});
 assert.equal(starts,2);
 assert.equal(quagga.config.inputStream.constraints.width.ideal,640);
 await decoder.stop();
});
test("terminal failures include local per-profile diagnostic details",async()=>{
 const {decoder,quagga}=harness();
 quagga.init=(config,callback)=>callback(Object.assign(new Error("Busy video input"),{name:"NotReadableError"}));
 await assert.rejects(()=>decoder.start({target}),error=>{
  assert.equal(error.name,"NotReadableError");
  assert.ok(error.failures?.length>=4);
  assert.match(error.failures[0].profile,/camera/i);
  assert.equal(error.failures[0].name,"NotReadableError");
  return true;
 });
});
test("a single camera ended event cannot trigger duplicate reopen requests",async()=>{
 const {decoder,quagga}=harness();
 let listener=null,disconnections=0;
 quagga.CameraAccess.getActiveTrack=()=>({
  readyState:"live",addEventListener(type,fn){if(type==="ended")listener=fn;},getSettings:()=>({})
 });
 await decoder.start({target,onProgress:step=>{if(step==="disconnected")disconnections++;}});
 listener();listener();
 assert.equal(disconnections,1);
 await decoder.stop();
});
