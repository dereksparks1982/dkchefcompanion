"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,"../..");
const code=fs.readFileSync(path.join(base,"assets/dk-chef-medicine-lookup.js"),"utf8");
const UPC="036000291452";
const LABEL_ID="01c77e6a-6381-4005-b647-481bbcd442aa";
function record(upc=UPC){
 return {brand_name:"Pepcid AC",generic_name:"famotidine",product_ndc:"12345-678",
  dosage_form:"TABLET",active_ingredients:[{name:"Famotidine",strength:"20 mg"}],
  openfda:{upc:[upc],spl_set_id:[LABEL_ID]}};
}
function harness(body,{codeStatus=200,fail=false}={}){
 const urls=[];
 const fetch=async url=>{
  urls.push(url);
  if(fail)throw Error("Network/CORS error");
  return {status:codeStatus,ok:codeStatus===200,json:async()=>body};
 };
 const window={};
 vm.runInNewContext(code,{window,fetch,AbortController,setTimeout,clearTimeout});
 return {api:window.DKChefMedicineLookup,urls};
}
test("only the exact FDA UPC annotation may identify a drug",async()=>{
 const h=harness({results:[record()]});
 const result=await h.api.verifyUPC(UPC);
 assert.equal(result.status,"verified");
 assert.equal(result.category,"medicine");
 assert.equal(result.brand,"Pepcid AC");
 assert.equal(result.generic,"famotidine");
 assert.match(result.ingredient,/Famotidine 20 mg/);
 assert.equal(result.ndc,"12345-678");
 assert.equal(result.labelUrl,
  "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid="+LABEL_ID);
 assert.equal(h.urls.length,1);
 assert.match(decodeURIComponent(h.urls[0]),/openfda\.upc:"036000291452"/);
 assert.match(result.notice,/not an approval/i);
 assert.equal((await h.api.verifyUPC(UPC)).status,"verified");
 assert.equal(h.urls.length,1,"verified match is reused, no duplicate API call");
});
test("zero-prefixed EAN-13 uses the equivalent UPC-A; NDC is never derived from barcode",async()=>{
 const h=harness({results:[record()]});
 const result=await h.api.verifyUPC("0036000291452");
 assert.equal(result.status,"verified");
 assert.equal(h.urls.length,1);
 assert.equal(h.api.interpret({results:[{...record("999999999999"),product_ndc:UPC}]},UPC).status,"not-found");
 assert.equal((await h.api.verifyUPC("4006381333931")).status,"unsupported");
 assert.equal(h.urls.length,1,"foreign EAN is not submitted as a fabricated NDC");
});
test("a mismatched UPC record is rejected even when drug name and NDC look plausible",async()=>{
 const h=harness({results:[record("000000000001")]});
 const result=await h.api.verifyUPC(UPC);
 assert.equal(result.status,"not-found");
 assert.equal(result.found,false);
});
test("ambiguous FDA entries are never silently treated as one medicine",async()=>{
 const h=harness({results:[record(),{...record(),brand_name:"Another medication",product_ndc:"11111-222"}]});
 const result=await h.api.verifyUPC(UPC);
 assert.equal(result.status,"ambiguous");
 assert.equal(result.found,false);
});
test("untrusted set IDs are never turned into clickable drug label links",()=>{
 const h=harness({results:[]});
 const data=h.api.recordInfo({...record(),openfda:{upc:[UPC],spl_set_id:["javascript:alert(1)"]}});
 assert.equal(data.labelUrl,"");
});
test("404, rate limits and network failures produce distinct safe statuses",async()=>{
 assert.equal((await harness(null,{codeStatus:404}).api.verifyUPC(UPC)).status,"not-found");
 assert.equal((await harness(null,{codeStatus:429}).api.verifyUPC(UPC)).status,"rate-limited");
 assert.equal((await harness(null,{fail:true}).api.verifyUPC(UPC)).status,"unavailable");
 assert.equal((await harness(null).api.verifyUPC("abc")).status,"unsupported");
});
test("only one scanner, correct asset load order, offline module and updated README",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=fs.readFileSync(path.join(base,page),"utf8");
  const med=html.indexOf("dk-chef-medicine-lookup.js?v=20261113-medicine1");
  const prod=html.indexOf("dk-chef-product-lookup.js?v=20261113-medicine1");
  const station=html.indexOf("dk-chef-universal-scanner.js?v=20261113-medicine1");
  assert.ok(med>0&&prod>med&&station>prod,page);
  assert.equal((html.match(/id="dkProductStation"/g)||[]).length,1);
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
 }
 const sw=fs.readFileSync(path.join(base,"sw.js"),"utf8");
 assert.match(sw,/dk-seedbank-app-v60/);
 assert.match(sw,/"assets\/dk-chef-medicine-lookup.js"/);
 assert.match(fs.readFileSync(path.join(base,"README.md"),"utf8"),/Exact UPC/);
 assert.doesNotThrow(()=>new Function(code));
});
