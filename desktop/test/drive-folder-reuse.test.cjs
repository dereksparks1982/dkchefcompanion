"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.resolve(__dirname,"../../assets/seedbank-drive-visible.js"),"utf8");
const STORAGE_KEY="dk-seedbank-visible-folder-v1";
const FOLDER="DK Seed Bank";
const FOLDER_MIME="application/vnd.google-apps.folder";
const existing={id:"existing-folder-id-123456",name:FOLDER,mimeType:FOLDER_MIME,trashed:false};
function environment({storedId=null,files=[],oldStatus=200,listStatus=200,listSequence=null}={}){
 const entries=new Map();
 if(storedId)entries.set(STORAGE_KEY,JSON.stringify({id:storedId,name:FOLDER}));
 const requests=[];
 let listCalls=0;
 const fetch=async(raw,options={})=>{
  const url=String(raw),method=options.method||"GET";
  requests.push({url,method,options});
  if(method==="POST"){
   return {ok:true,status:200,json:async()=>({id:"new-created-folder-123456",name:FOLDER,mimeType:FOLDER_MIME})};
  }
  if(url.includes("?fields=id,name,mimeType,trashed")){
   return {
    ok:oldStatus===200,status:oldStatus,
    json:async()=>({id:storedId,name:FOLDER,mimeType:FOLDER_MIME,trashed:false})
   };
  }
  const found=listSequence?listSequence[Math.min(listCalls++,listSequence.length-1)]:files;
  return {
   ok:listStatus===200,status:listStatus,
   json:async()=>({files:found,nextPageToken:""}),
   text:async()=>"Drive permission was denied"
  };
 };
 const root={DKSeedBankPickerConfig:{}};
 const storage={
  getItem:key=>entries.get(key)||null,
  setItem:(key,value)=>entries.set(key,value),
  removeItem:key=>entries.delete(key)
 };
 vm.runInNewContext(source,{
  window:root,document:{documentElement:{lang:"en"}},
  localStorage:storage,fetch,URLSearchParams,encodeURIComponent
 },{filename:"seedbank-drive-visible.js"});
 return {drive:root.DKSeedBankDriveVisible,requests,entries};
}
test("reuses a remembered folder after verifying the current Google account",async()=>{
 const app=environment({storedId:existing.id});
 const found=await app.drive.discover("private-account-token");
 assert.equal(found.status,"found");
 assert.equal(found.folder.id,existing.id);
 assert.equal(app.drive.folder().id,existing.id);
 const retry=await app.drive.createFolder("private-account-token");
 assert.equal(retry.created,false);
 assert.equal(app.requests.filter(x=>x.method==="POST").length,0);
});
test("another web device finds and reuses the same app-created folder",async()=>{
 const app=environment({files:[existing]});
 const found=await app.drive.discover("same-google-account-token");
 assert.equal(found.status,"found");
 assert.equal(found.folder.id,existing.id);
 assert.equal(JSON.parse(app.entries.get(STORAGE_KEY)).id,existing.id);
 assert.equal(app.drive.discoveryStatus(),"found");
 assert.equal((await app.drive.createFolder("same-google-account-token")).created,false);
 assert.equal(app.requests.some(x=>x.method==="POST"),false);
});
test("an inaccessible folder from another account is not trusted",async()=>{
 const app=environment({storedId:"other-account-folder-12345",oldStatus:404,files:[existing]});
 const found=await app.drive.discover("different-account-token");
 assert.equal(found.folder.id,existing.id);
 assert.equal(app.drive.folder().id,existing.id);
 assert.equal(app.requests.filter(x=>x.method==="GET").length,2);
});
test("creates a folder only when Google search finds no app-accessible match",async()=>{
 const app=environment({files:[]});
 assert.equal((await app.drive.discover("fresh-account-token")).status,"missing");
 assert.equal(app.drive.folder(),null);
 const created=await app.drive.createFolder("fresh-account-token");
 assert.equal(created.created,true);
 assert.equal(app.requests.filter(x=>x.method==="POST").length,1);
 assert.equal(app.drive.discoveryStatus(),"found");
});
test("creation rechecks and does not duplicate a folder newly created elsewhere",async()=>{
 const app=environment({listSequence:[[],[existing]]});
 assert.equal((await app.drive.discover("token")).status,"missing");
 const found=await app.drive.createFolder("token");
 assert.equal(found.id,existing.id);
 assert.equal(found.created,false);
 assert.equal(app.requests.filter(x=>x.method==="POST").length,0);
});
test("multiple matching folders require an explicit choice, not creation",async()=>{
 const app=environment({files:[existing,{...existing,id:"second-folder-id-123456"}]});
 assert.equal((await app.drive.discover("token")).status,"multiple");
 assert.equal(app.drive.folder(),null);
 await assert.rejects(app.drive.createFolder("token"),/Multiple DK Seed Bank folders/);
 assert.equal(app.requests.filter(x=>x.method==="POST").length,0);
});
test("permission failures block new folder creation and preserve the original choice",async()=>{
 const app=environment({storedId:"old-folder-id-1234567",oldStatus:403,listStatus:403});
 await assert.rejects(app.drive.discover("token"),/403/);
 assert.equal(app.drive.discoveryStatus(),"error");
 assert.equal(app.drive.folder(),null);
 await assert.rejects(app.drive.createFolder("token"),/403/);
 assert.equal(app.requests.filter(x=>x.method==="POST").length,0);
});
