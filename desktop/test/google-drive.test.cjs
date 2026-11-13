"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const vm=require("node:vm");
const {createAuth,safeDriveUrl,CLIENT,SCOPE}=require("../google-drive-auth.cjs");
const root=path.resolve(__dirname,"..","..");
const source=key=>fs.readFileSync(path.join(root,key),"utf8");
function merge(){
 const window={};
 vm.runInNewContext(source("assets/seedbank-drive-merge.js"),{window,Date,Map,Set,Array,Object,String,Number});
 return window.DKSeedBankDriveMerge;
}
const photo={id:"photo-abc12345",date:"2026-11-11",stage:"seedling",note:"green"};
const measure={id:"measure-abc12345",date:"2026-11-12",heightCm:9.5,unit:"cm",note:""};
const first={
 format:"dk-seedbank-v1",exportedAt:"2026-11-11T10:00:00Z",
 journal:[{id:"log-basil",plant:"Basil",date:"2026-11-11",growthPhotos:[photo]}],
 photos:[{key:"journal-photo|log-basil|photo-abc12345",data:"data:image/jpeg;base64,AA=="}],
 workbench:{additions:[],lots:[{id:"lot-basil",count:100}],beds:[]}
};
const second={
 format:"dk-seedbank-v1",exportedAt:"2026-11-12T14:00:00Z",
 journal:[{id:"log-basil",plant:"Basil",date:"2026-11-11",growthMeasurements:[measure]}],
 photos:[],workbench:{additions:[],lots:[],beds:[{id:"bed-1",name:"Raised bed"}]}
};
test("Drive sync combines independent changes to photo galleries, chart history, seed lots and beds",()=>{
 const merged=merge().mergeSnapshots([first,second]);
 assert.equal(merged.journal.length,1);
 assert.equal(merged.journal[0].growthPhotos.length,1);
 assert.equal(merged.journal[0].growthMeasurements.length,1);
 assert.equal(merged.photos.length,1);
 assert.equal(merged.workbench.lots.length,1);
 assert.equal(merged.workbench.beds.length,1);
 const reverse=merge().mergeSnapshots([second,first]);
 assert.equal(reverse.journal[0].growthPhotos.length,1);
});
test("Drive sync respects explicit deletions of plantings, photos and measurements",()=>{
 const deleted={
  ...second,exportedAt:"2026-11-13T10:00:00Z",
  journal:[{
   ...second.journal[0],growthPhotosRemoved:[{id:photo.id,at:"2026-11-13T09:00:00Z"}],
   growthMeasurementsRemoved:[{id:measure.id,at:"2026-11-13T09:00:00Z"}]
  }]
 };
 const merged=merge().mergeSnapshots([first,second,deleted]);
 assert.equal(merged.journal.length,1);
 assert.equal(merged.journal[0].growthPhotos.length,0);
 assert.equal(merged.journal[0].growthMeasurements.length,0);
 assert.equal(merged.photos.length,0);
 const removed={
  ...deleted,journal:[],journalDeletes:[{id:"log-basil",deletedAt:"2026-11-13T10:00:00Z"}]
 };
 assert.equal(merge().mergeSnapshots([first,second,removed]).journal.length,0);
});
test("Drive OAuth restricts endpoints and never includes a hardcoded user or folder",()=>{
 assert.match(SCOPE,/drive\.appdata$/);
 assert.match("12345-example.apps.googleusercontent.com",CLIENT);
 assert.equal(safeDriveUrl("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder"),
  "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder");
 assert.equal(safeDriveUrl("https://www.googleapis.com/upload/drive/v3/files/fake?uploadType=media"),
  "https://www.googleapis.com/upload/drive/v3/files/fake?uploadType=media");
 for(const bad of [
  "https://drive.google.com/drive/folders/private",
  "https://evil.invalid/drive/v3/files",
  "http://www.googleapis.com/drive/v3/files",
  "https://www.googleapis.com/drive/v3/files/../../secret",
  "https://www.googleapis.com/drive/v3/about",
  "https://www.googleapis.com/drive/v3/files/abc/permissions"
 ])assert.throws(()=>safeDriveUrl(bad));
 const script=source("assets/seedbank-drive-sync.js");
 assert.match(script,/drive\.appdata/);
 assert.match(script,/appDataFolder/);
 assert.match(script,/Google OAuth Client ID/);
 assert.doesNotMatch(script,/1m_CTPs1bfnN3fFaqXSkB-l0LVarKaWWu/);
 assert.doesNotMatch(source("desktop/google-drive-auth.cjs"),/client_secret|password=/i);
 const page=source("index.html"),mirror=source("docs/index.html");
 for(const html of [page,mirror]){
  assert.match(html,/seedbank-drive-sync\.js/);
  assert.match(html,/seedbank-drive-merge\.js/);
  assert.match(html,/seedbank-drive-sync\.css/);
  assert.ok(html.indexOf("seedbank-drive-sync.js")>html.indexOf("seedbank-resilience.js"));
 }
});
test("desktop client starts disconnected, authorizes via loopback PKCE, and stores tokens only in user profile",async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),"dkseed-oauth-"));
 const clientId="123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com";
 let requests=[];
 const fakeFetch=async(url,options={})=>{
  requests.push({url,method:options.method,body:options.body});
  if(url==="https://oauth2.googleapis.com/token")
   return {ok:true,json:async()=>({access_token:"EXAMPLE_ACCESS_TOKEN",refresh_token:"EXAMPLE_REFRESH_TOKEN",expires_in:3600})};
  return {ok:true,status:200,headers:{get:()=>null},text:async()=>JSON.stringify({files:[]})};
 };
 try{
  const oauth=createAuth({
   userData:folder,fetchImpl:fakeFetch,
   openExternal:async url=>{
    const authorize=new URL(url);
    assert.equal(authorize.hostname,"accounts.google.com");
    assert.equal(authorize.searchParams.get("scope"),SCOPE);
    assert.equal(authorize.searchParams.get("code_challenge_method"),"S256");
    assert.ok(authorize.searchParams.get("state"));
    const redirect=authorize.searchParams.get("redirect_uri");
    assert.match(redirect,/^http:\/\/127\.0\.0\.1:\d+\/oauth2callback$/);
    const callbackUrl=redirect+"?state="+encodeURIComponent(authorize.searchParams.get("state"))+"&code=test-authorization-code";
    const callback=await fetch(callbackUrl);
    assert.equal(callback.status,200);
   }
  });
  assert.equal(oauth.status().connected,false);
  await assert.rejects(()=>oauth.request({url:"https://www.googleapis.com/drive/v3/files"}));
  await oauth.connect(clientId);
  assert.equal(oauth.status().connected,true);
  const tokenFile=path.join(folder,"google-drive-auth.json");
  const token=fs.readFileSync(tokenFile,"utf8");
  assert.match(token,/EXAMPLE_REFRESH_TOKEN/);
  assert.equal(fs.statSync(tokenFile).mode & 0o777,0o600);
  const response=await oauth.request({url:"https://www.googleapis.com/drive/v3/files?spaces=appDataFolder"});
  assert.equal(response.status,200);
  assert.ok(requests.some(row=>row.url.includes("/drive/v3/files?spaces=appDataFolder")));
  await oauth.disconnect();
  assert.equal(oauth.status().connected,false);
  assert.equal(fs.existsSync(tokenFile),false);
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
test("Google Drive remains opt-in with no Google request on first app load",()=>{
 const code=source("assets/seedbank-drive-sync.js");
 assert.match(code,/Connect my Google Drive/);
 assert.match(code,/\$\("dkDriveConnect"\)\.addEventListener\("click",connect\)/);
 assert.match(code,/if\(busy\|\|ready\(\)\)return/);
 assert.match(code,/if\(saved\.auto&&connected&&ready\(\)/);
 assert.match(code,/navigator\.onLine/);
 assert.match(code,/document\.visibilityState==="visible"/);
 assert.match(code,/window\.DKSeedBankDriveSync|root\.DKSeedBankDriveSync/);
 assert.doesNotMatch(code,/localStorage\.setItem\([^)]*access_token/);
 assert.match(code,/if\(!desktop&&!root\.google\?\.accounts\?\.oauth2\)/);
});
