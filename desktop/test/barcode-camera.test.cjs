"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("cross-browser camera and photo scanner use bundled decoder without native BarcodeDetector",()=>{
 const vendor=read("assets/vendor/html5-qrcode.min.js");
 const app=read("assets/dk-chef-provisions-ui.js");
 assert.ok(vendor.length>100000,"Scanner must be fully bundled");
 assert.match(vendor,/__Html5QrcodeLibrary__/);
 assert.match(vendor,/Html5QrcodeSupportedFormats/);
 assert.match(app,/new window\.Html5Qrcode/);
 assert.match(app,/useBarCodeDetectorIfSupported:false/);
 assert.match(app,/scanFile\(file,true\)/);
 assert.match(app,/data-chef-photo/);
 assert.match(app,/navigator\.mediaDevices\?\.getUserMedia/);
 assert.match(app,/await session\.reader\.stop\(\)/);
 assert.match(app,/session\.reader\.clear\(\)/);
 assert.doesNotMatch(app,/new window\.BarcodeDetector/);
 assert.doesNotThrow(()=>new Function(app));
});
test("web, docs, desktop and offline shell include local scanner",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=read(page);
  const vendor=html.indexOf("assets/vendor/html5-qrcode.min.js?v=2.3.8");
  const ui=html.indexOf("assets/dk-chef-provisions-ui.js?v=20261112-camera2");
  assert.ok(vendor>0&&ui>vendor,page);
  assert.match(html,/assets\/dk-chef-provisions\.css\?v=20261112-camera2/);
 }
 const sw=read("sw.js");
 assert.match(sw,/dk-seedbank-app-v51/);
 assert.match(sw,/"assets\/vendor\/html5-qrcode\.min\.js"/);
 assert.match(read("README.md"),/Cross-browser barcode reader/);
 assert.match(read("assets/vendor/html5-qrcode-LICENSE.txt"),/Apache License/);
});
