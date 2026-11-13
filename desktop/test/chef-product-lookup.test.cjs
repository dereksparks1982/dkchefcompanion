"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const source=fs.readFileSync(path.join(root,"assets/dk-chef-product-lookup.js"),"utf8");
function harness(responses){
 const urls=[];
 const fetch=async url=>{
  urls.push(url);
  const data=typeof responses==="function"?responses(url):responses.find(r=>url.includes(r.match))?.data;
  if(data instanceof Error)throw data;
  if(!data)return {status:404,ok:false};
  if(data.limited)return {status:429,ok:false};
  return {status:200,ok:true,json:async()=>data};
 };
 const window={};
 vm.runInNewContext(source,{window,fetch,AbortController,setTimeout,clearTimeout});
 return {api:window.DKChefProductLookup,urls};
}
test("Pepcid-like UPC is found in general product database even when absent from food databases",async()=>{
 const {api,urls}=harness([{match:"api.upcitemdb.com",data:{code:"OK",items:[{
  title:"Pepcid AC Maximum Strength Famotidine 20 mg 50 Tablets",brand:"Pepcid",description:"OTC acid reducer"
 }]}}]);
 const result=await api.lookup("716837855507");
 assert.equal(result.found,true);
 assert.equal(result.brand,"Pepcid");
 assert.match(result.name,/Pepcid AC/);
 assert.equal(result.source,"UPCitemdb");
 assert.equal(urls[0].includes("world.openfoodfacts.org/api/v2/product/"),true);
 assert.equal(urls.some(url=>url.includes("world.openproductsfacts.org")),true);
 assert.equal(urls.some(url=>url.includes("world.openbeautyfacts.org")),true);
 assert.equal(urls.some(url=>url.includes("world.openpetfoodfacts.org")),true);
 assert.equal(urls.at(-1).includes("api.upcitemdb.com/prod/trial/lookup"),true);
 assert.equal((await api.lookup("716837855507")).found,true);
 assert.equal(urls.filter(url=>url.includes("upcitemdb.com")).length,1,"Successful lookups are cached in memory");
});
test("food facts lookup populates food without accessing fallback",async()=>{
 const {api,urls}=harness([{match:"world.openfoodfacts.org",data:{status:1,product:{
  product_name:"Extra Virgin Olive Oil",brands:"Olive Growers",quantity:"500 ml"
 }}}]);
 const result=await api.lookup("4006381333931");
 assert.equal(result.name,"Extra Virgin Olive Oil");
 assert.equal(result.size,"500 ml");
 assert.equal(result.category,"food");
 assert.ok(urls.some(url=>url.includes("world.openfoodfacts.org")));
 assert.ok(urls.every(url=>!url.includes("upcitemdb")),"No general UPC lookup needed for food");
});
test("404 and other provider errors are distinguished",async()=>{
 const missing=harness(()=>null);
 assert.equal((await missing.api.lookup("4006381333931")).reason,"not-found");
 const blocked=harness(()=>new Error("CORS blocked"));
 assert.equal((await blocked.api.lookup("4006381333931")).reason,"unavailable");
 const limited=harness(()=>({limited:true}));
 assert.equal((await limited.api.lookup("4006381333931")).reason,"rate-limited");
});
test("output contains no private tokens and accepts only numeric barcodes",async()=>{
 const {api,urls}=harness(()=>null);
 assert.equal((await api.lookup("not a barcode")).reason,"invalid");
 assert.equal(urls.length,0);
 assert.doesNotMatch(source,/user_key|api_key|secret/i);
 assert.doesNotThrow(()=>new Function(source));
});
