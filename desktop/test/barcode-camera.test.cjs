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
 const pending=new Map();
 let tick=0;
 const clock={
  setTimeout(fn){const id=++tick;pending.set(id,fn);return id;},
  clearTimeout(id){pending.delete(id);},
  flush(){const entry=pending.entries().next().value;if(!entry)return false;pending.delete(entry[0]);entry[1]();return true;}
 };
 const track={stopped:0,stop(){this.stopped++;},addEventListener(){}};
 const stream={getTracks:()=>[track],getVideoTracks:()=>[track]};
 const video={readyState:4,videoWidth:1280,videoHeight:720,
  srcObject:null,muted:false,autoplay:false,playsInline:false,
  play(){this.playCount=(this.playCount||0)+1;return Promise.resolve();},
  pause(){this.pauseCount=(this.pauseCount||0)+1;},
  setAttribute(){},remove(){this.removed=true;}};
 const context={drawImage(){}};
 const canvas={width:0,height:0,getContext:()=>context,toDataURL:()=>"data:image/jpeg;base64,test"};
 const document={createElement:tag=>tag==="video"?video:canvas};
 const navigator={userAgent:agent,mediaDevices:{
  async getUserMedia(constraints){this.constraints=constraints;return stream;},
  async enumerateDevices(){return[{kind:"videoinput",deviceId:"usb-camera",label:"USB Camera"}];}
 }};
 const scanner={calls:0,result:null,decodeSingle(config,callback){
  this.calls++;this.lastConfig=config;callback(this.result);
 }};
 const window={Quagga:scanner,navigator,isSecureContext:true};
 vm.runInNewContext(source,{window,document,navigator,
  setTimeout:clock.setTimeout.bind(clock),clearTimeout:clock.clearTimeout.bind(clock)});
 return {api:window.DKChefBarcodeScanner,clock,scanner,track,stream,video,canvas,navigator};
}
function preview(){return {children:[],replaceChildren(...nodes){this.children=nodes;}};}
test("retail barcode decoder and MIT license are stored locally",()=>{
 assert.ok(read("assets/vendor/quagga2.min.js").length>100000);
 assert.match(read("assets/vendor/quagga2-LICENSE.txt"),/The MIT License/);
 assert.doesNotThrow(()=>new Function(source));
});
test("GTIN check digits and UPC-E conversion reject invalid scans",()=>{
 const {api}=harness();
 assert.equal(api.normalize("036000291452","upc_a"),"036000291452");
 assert.equal(api.normalize("0036000291452","ean_13"),"036000291452");
 assert.equal(api.normalize("4006381333931","ean_13"),"4006381333931");
 assert.equal(api.normalize("4006381333932","ean_13"),"");
 assert.equal(api.normalize("not-a-barcode","upc_a"),"");
});
test("PC webcam stays open during repeated failed Quagga decodes, until explicit stop",async()=>{
 const {api,scanner,clock,track,video,navigator}=harness();
 const target=preview(),received=[],status=[];
 await api.start({target,onCode:code=>received.push(code),onProgress:key=>status.push(key)});
 assert.equal(target.children[0],video);
 assert.ok(video.srcObject);
 assert.equal(track.stopped,0);
 assert.equal(navigator.mediaDevices.constraints.video.facingMode,undefined);
 for(let i=0;i<4;i++)assert.equal(clock.flush(),true);
 assert.equal(scanner.calls,4);
 assert.equal(track.stopped,0,"Decoder failure must not close the webcam");
 assert.equal(video.pauseCount||0,0);
 assert.ok(status.includes("live"));
 await api.stop();
 assert.equal(track.stopped,1);
 assert.equal(video.srcObject,null);
 assert.equal(video.removed,true);
});
test("iPhone camera auto-detects a UPC without photo or manual action",async()=>{
 const {api,clock,scanner,track,navigator}=harness("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)");
 const target=preview(),received=[];
 scanner.result={codeResult:{code:"036000291452",format:"upc_a"}};
 await api.start({target,onCode:code=>received.push(code)});
 assert.equal(navigator.mediaDevices.constraints.video.facingMode.ideal,"environment");
 assert.equal(clock.flush(),true);
 assert.deepEqual(received,["036000291452"]);
 assert.equal(track.stopped,0,"Only the UI stops the camera after success");
 await api.stop();
 assert.equal(track.stopped,1);
});
test("explicit webcam selection works",async()=>{
 const {api,navigator}=harness();
 await api.start({target:preview(),deviceId:"usb-camera"});
 assert.equal(navigator.mediaDevices.constraints.video.deviceId.exact,"usb-camera");
 await api.stop();
});
test("photo selection is gone and inventory refresh cannot kill a running camera",()=>{
 const ui=read("assets/dk-chef-provisions-ui.js");
 assert.doesNotMatch(ui,/data-chef-photo|scanPhoto|Scan a barcode photo|Сканировать штрихкод с фото/);
 assert.match(ui,/if\(scanner\?\.location===location\)return/);
 assert.match(ui,/onProgress/);
 assert.match(ui,/showCameraChoices/);
 assert.match(ui,/data-chef-stop/);
 assert.doesNotMatch(read("assets/dk-chef-provisions.css"),/chef-photo-trigger/);
 assert.doesNotThrow(()=>new Function(ui));
});
test("both pages and offline cache include updated scanner",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=read(page);
  assert.match(html,/dk-chef-barcode-scanner\.js\?v=20261113-live2/);
  assert.match(html,/dk-chef-provisions-ui\.js\?v=20261113-live2/);
  assert.match(html,/dk-chef-provisions\.css\?v=20261113-live2/);
 }
 assert.match(read("sw.js"),/dk-seedbank-app-v53/);
 assert.match(read("sw.js"),/"assets\/dk-chef-barcode-scanner\.js"/);
 assert.match(read("README.md"),/Live scanner reliability/);
});
