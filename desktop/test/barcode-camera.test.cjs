"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("assets/dk-chef-barcode-scanner.js");
function harness(userAgent="Mozilla/5.0 (X11; Linux x86_64) Firefox/156"){
 const camera={
  config:null,detected:null,processed:null,stopCount:0,
  init(config,callback){this.config=config;callback(null);},
  onDetected(callback){this.detected=callback;},
  onProcessed(callback){this.processed=callback;},
  offDetected(callback){if(this.detected===callback)this.detected=null;},
  offProcessed(callback){if(this.processed===callback)this.processed=null;},
  start(){},
  stop(){this.stopCount++;},
  decodeSingle(options,callback){callback({codeResult:{code:"4006381333931",format:"ean_13"}});}
 };
 const navigator={userAgent,mediaDevices:{
  getUserMedia(){},
  async enumerateDevices(){return [{kind:"videoinput",deviceId:"camera-1",label:"USB Camera"}];}
 }};
 const URL={createObjectURL:()=>"blob:test-photo",revokeObjectURL(){}};
 const window={Quagga:camera,navigator,isSecureContext:true,URL};
 vm.runInNewContext(source,{window,navigator,setTimeout,clearTimeout,console});
 return {api:window.DKChefBarcodeScanner,camera,window};
}
test("Quagga2 is bundled locally with MIT license",()=>{
 assert.ok(read("assets/vendor/quagga2.min.js").length>100000);
 assert.match(read("assets/vendor/quagga2.min.js"),/Quagga/);
 assert.match(read("assets/vendor/quagga2-LICENSE.txt"),/The MIT License/);
 assert.doesNotThrow(()=>new Function(source));
});
test("UPC and EAN barcode normalization checks the actual check digit",()=>{
 const {api}=harness();
 assert.equal(api.normalize("036000291452","upc_a"),"036000291452");
 assert.equal(api.normalize("4006381333931","ean_13"),"4006381333931");
 assert.equal(api.normalize("04006381333931","ean_13"),""); // incorrect GTIN-14
 assert.equal(api.normalize("4006381333932","ean_13"),"");
 assert.equal(api.normalize("0036000291452","ean_13"),"036000291452");
 assert.equal(api.normalize("stuff","code_128"),"");
 assert.equal(api.validGTIN("123456789012"),false);
});
test("desktop uses default webcam, enumerates cameras, recognizes valid UPC/EAN and releases stream",async()=>{
 const {api,camera}=harness();
 const found=[],cameras=[];
 const preview={querySelectorAll:()=>[]};
 await api.start({target:preview,onCode:code=>found.push(code),onCameras:rows=>cameras.push(...rows)});
 assert.equal(camera.config.inputStream.type,"LiveStream");
 assert.equal(camera.config.numOfWorkers,0);
 assert.equal(camera.config.locator.halfSample,false);
 assert.equal(camera.config.inputStream.constraints.facingMode,undefined);
 assert.equal(camera.config.inputStream.constraints.deviceId,undefined);
 camera.detected({codeResult:{code:"4006381333932",format:"ean_13"}});
 camera.detected({codeResult:{code:"4006381333931",format:"ean_13"}});
 assert.deepEqual(found,["4006381333931"]);
 await api.stop();
 assert.ok(camera.stopCount>=1);
 await api.start({target:preview,deviceId:"camera-1"});
 assert.equal(camera.config.inputStream.constraints.deviceId.exact,"camera-1");
 await api.stop();
});
test("mobile prefers back-facing camera and image scans work without camera permission",async()=>{
 const {api,camera}=harness("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)");
 const preview={querySelectorAll:()=>[]};
 await api.start({target:preview});
 assert.equal(camera.config.inputStream.constraints.facingMode.ideal,"environment");
 await api.stop();
 const value=await api.scanFile({type:"image/jpeg"});
 assert.equal(value,"4006381333931");
});
test("the UI includes camera chooser, feedback and photo fallback",()=>{
 const ui=read("assets/dk-chef-provisions-ui.js");
 assert.match(ui,/data-chef-cameras/);
 assert.match(ui,/showCameraChoices/);
 assert.match(ui,/describeCameraError/);
 assert.match(ui,/onProgress/);
 assert.match(ui,/scanPhoto/);
 assert.match(ui,/data-chef-photo/);
 assert.doesNotMatch(ui,/new window\.Html5Qrcode/);
 assert.doesNotThrow(()=>new Function(ui));
});
test("web, docs and offline worker load only the active local scanner",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=read(page);
  const bundle=html.indexOf("assets/vendor/quagga2.min.js?v=20261113");
  const bridge=html.indexOf("assets/dk-chef-barcode-scanner.js?v=20261113-quagga1");
  const ui=html.indexOf("assets/dk-chef-provisions-ui.js?v=20261113-quagga1");
  assert.ok(bundle>0&&bridge>bundle&&ui>bridge,page);
  assert.doesNotMatch(html,/src="[^"]*html5-qrcode.min.js/);
  assert.match(html,/dk-chef-provisions\.css\?v=20261113-quagga1/);
 }
 const sw=read("sw.js");
 assert.match(sw,/dk-seedbank-app-v52/);
 assert.match(sw,/"assets\/vendor\/quagga2.min.js"/);
 assert.match(sw,/"assets\/dk-chef-barcode-scanner.js"/);
 assert.doesNotMatch(sw,/"assets\/vendor\/html5-qrcode.min.js"/);
 assert.match(read("README.md"),/Retail barcode reader/);
});
