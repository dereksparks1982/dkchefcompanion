"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.resolve(__dirname,"../../assets/seedbank-drive-visible.js"),"utf8");
const KEY="dk-seedbank-visible-folder-v1",NAME="DK Seed Bank",TYPE="application/vnd.google-apps.folder";
const existing={id:"existing-folder-id-123456",name:NAME,mimeType:TYPE,trashed:false};
function environment({storedId=null,files=[],oldStatus=200,listStatus=200,linkStatus=200,listSequence=null,
 shared={pointerId:null,folderId:null}}={}){
 const storage=new Map();
 if(storedId)storage.set(KEY,JSON.stringify({id:storedId,name:NAME}));
 const requests=[];
 let visibleLists=0;
 const fetch=async(raw,options={})=>{
  const url=String(raw),method=options.method||"GET";
  requests.push({url,method,options});
  const reply=(value,status=200)=>({ok:status===200,status,json:async()=>value,text:async()=>"Google Drive access denied"});
  if(method==="POST"&&url.includes("/upload/")){
   const text=String(options.body||"");
   const m=text.match(/"folderId":"([^"]+)"/);
   shared.folderId=m?.[1]||null;
   shared.pointerId="private-link-file-123456";
   return reply({id:shared.pointerId});
  }
  if(method==="PATCH"&&url.includes("/upload/")){
   shared.folderId=JSON.parse(options.body).folderId;
   return reply({id:shared.pointerId});
  }
  if(method==="POST"){
   return reply({id:"created-folder-id-1234567",name:NAME,mimeType:TYPE});
  }
  if(url.includes("spaces=appDataFolder"))
   return reply({files:shared.pointerId?[{id:shared.pointerId,name:"dk-seedbank-folder-link-v1.json"}]:[],nextPageToken:""},linkStatus);
  if(url.includes("?alt=media"))return reply({folderId:shared.folderId});
  if(url.includes("?fields=id,name,mimeType,trashed")){
   const id=(url.match(/files\/([a-zA-Z0-9_-]+)\?/)||[])[1];
   return reply({id,name:NAME,mimeType:TYPE,trashed:false},oldStatus);
  }
  if(url.includes("/drive/v3/files?")){
   const rows=listSequence?listSequence[Math.min(visibleLists++,listSequence.length-1)]:files;
   return reply({files:rows,nextPageToken:""},listStatus);
  }
  throw Error("Unexpected Google endpoint: "+url);
 };
 const window={DKSeedBankPickerConfig:{}};
 const localStorage={
  getItem:key=>storage.get(key)||null,
  setItem:(key,value)=>storage.set(key,value),
  removeItem:key=>storage.delete(key)
 };
 vm.runInNewContext(source,{window,localStorage,fetch,URLSearchParams,encodeURIComponent,
  document:{documentElement:{lang:"en"}}},{filename:"seedbank-drive-visible.js"});
 return {api:window.DKSeedBankDriveVisible,requests,storage,shared,
  created:()=>requests.filter(r=>r.method==="POST"&&!r.url.includes("/upload/")).length};
}
test("existing folder ID is verified, reused and privately linked",async()=>{
 const app=environment({storedId:existing.id});
 const found=await app.api.discover("account-token");
 assert.equal(found.folder.id,existing.id);
 assert.equal(app.api.folder().id,existing.id);
 assert.equal(app.shared.folderId,existing.id);
 assert.equal((await app.api.createFolder("account-token")).created,false);
 assert.equal(app.created(),0);
});
test("a second device finds the original folder from the account-wide private link",async()=>{
 const shared={pointerId:null,folderId:null};
 const first=environment({files:[existing],shared});
 assert.equal((await first.api.discover("token")).folder.id,existing.id);
 assert.equal(shared.folderId,existing.id);
 const phone=environment({files:[],shared});
 const found=await phone.api.discover("token");
 assert.equal(found.status,"found");
 assert.equal(found.folder.id,existing.id);
 assert.equal(phone.created(),0);
 assert.equal(JSON.parse(phone.storage.get(KEY)).id,existing.id);
});
test("an old local ID cannot override a different authorized account's linked folder",async()=>{
 const shared={pointerId:"private-link-file-123456",folderId:existing.id};
 const phone=environment({storedId:"previous-account-123456",files:[],shared});
 const selected=await phone.api.discover("current-account");
 assert.equal(selected.folder.id,existing.id);
 assert.equal(phone.created(),0);
});
test("new account without a folder creates exactly one visible folder and stores a link",async()=>{
 const app=environment({files:[]});
 assert.equal((await app.api.discover("new-account")).status,"missing");
 const created=await app.api.createFolder("new-account");
 assert.equal(created.created,true);
 assert.equal(app.created(),1);
 assert.equal(app.shared.folderId,created.id);
 assert.equal(app.api.discoveryStatus(),"found");
});
test("creation rechecks for a folder another device just created",async()=>{
 const app=environment({listSequence:[[],[existing]]});
 assert.equal((await app.api.discover("token")).status,"missing");
 const found=await app.api.createFolder("token");
 assert.equal(found.id,existing.id);
 assert.equal(found.created,false);
 assert.equal(app.created(),0);
});
test("multiple existing folders block creation instead of duplicating",async()=>{
 const app=environment({files:[existing,{...existing,id:"second-folder-id-123456"}]});
 assert.equal((await app.api.discover("token")).status,"multiple");
 await assert.rejects(app.api.createFolder("token"),/Multiple DK Seed Bank folders/);
 assert.equal(app.created(),0);
});
test("a saved private folder link without access blocks creating another folder",async()=>{
 const shared={pointerId:"private-link-file-123456",folderId:existing.id};
 const app=environment({shared,oldStatus:404,files:[]});
 assert.equal((await app.api.discover("token")).status,"unavailable");
 await assert.rejects(app.api.createFolder("token"),/Multiple DK Seed Bank folders/);
 assert.equal(app.created(),0);
});
test("Google app-data permission failures never authorize another folder",async()=>{
 const app=environment({linkStatus:403,files:[]});
 await assert.rejects(app.api.discover("token"),/403/);
 assert.equal(app.api.discoveryStatus(),"error");
 await assert.rejects(app.api.createFolder("token"),/403/);
 assert.equal(app.created(),0);
});
test("failed visible-folder search also blocks creation",async()=>{
 const app=environment({listStatus:403});
 await assert.rejects(app.api.discover("token"),/403/);
 assert.equal(app.api.discoveryStatus(),"error");
 assert.equal(app.created(),0);
});
