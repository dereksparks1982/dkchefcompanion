/* DK Chef Companion: lookup by retail barcode.
   The scan is local; only the barcode goes to public product databases.
   Open Facts data uses ODbL. UPCitemdb trial is rate limited. */
(function(root){
"use strict";
const cache=new Map(),pending=new Map();
const FACTS_FIELDS="code,product_name,product_name_en,generic_name,brands,quantity,categories_tags";
const SOURCES=[
 {domain:"world.openfoodfacts.org",name:"Open Food Facts",category:"food"},
 {domain:"world.openproductsfacts.org",name:"Open Products Facts",category:"general"},
 {domain:"world.openbeautyfacts.org",name:"Open Beauty Facts",category:"beauty"},
 {domain:"world.openpetfoodfacts.org",name:"Open Pet Food Facts",category:"petfood"}
];
const clean=(value,max=140)=>String(value||"").trim().slice(0,max);
async function requestJSON(url){
 const controller=typeof AbortController==="function"?new AbortController():null;
 const timeout=controller?setTimeout(()=>controller.abort(),6500):null;
 try{
  const response=await fetch(url,{method:"GET",headers:{Accept:"application/json"},
   ...(controller?{signal:controller.signal}:{})});
  if(response.status===429)return {limited:true};
  if(response.status===404)return {notFound:true};
  if(!response.ok)throw Error("HTTP "+response.status);
  return await response.json();
 }finally{if(timeout!==null)clearTimeout(timeout);}
}
function factsProduct(data,source){
 if(!data||!data.product||data.status===0)return null;
 const p=data.product;
 const name=clean(p.product_name||p.product_name_en||p.generic_name);
 if(!name)return null;
 return {found:true,name,brand:clean(p.brands,100),size:clean(p.quantity,80),
  source:source.name||source,category:source.category||"general",description:""};
}
function upcProduct(data){
 if(!data||!Array.isArray(data.items)||!data.items.length)return null;
 const p=data.items[0];
 const name=clean(p.title);
 if(!name)return null;
 return {found:true,name,brand:clean(p.brand,100),size:clean(p.size,80),
  source:"UPCitemdb",category:"general",description:clean(p.description,220)};
}
async function batchFacts(code){
 let failures=0,limited=false,notFound=0;
 // A match resolves immediately. Slow or unavailable sources cannot delay
 // a found food item while other unrelated product types time out.
 const outcomes=await new Promise(resolve=>{
  let completed=0,settled=false;
  const data={product:null,failures:0,limited:false,notFound:0};
  for(const source of SOURCES){
   const url="https://"+source.domain+"/api/v2/product/"+encodeURIComponent(code)+
    ".json?fields="+encodeURIComponent(FACTS_FIELDS);
   requestJSON(url).then(body=>{
    if(settled)return;
    if(body?.limited)data.limited=true;
    else{
     const found=factsProduct(body,source);
     if(found){settled=true;resolve({...data,product:found});return;}
     data.notFound++;
    }
   }).catch(()=>{if(!settled)data.failures++;}).finally(()=>{
    if(++completed===SOURCES.length&&!settled){settled=true;resolve(data);}
   });
  }
 });
 return outcomes;
}
async function search(code){
 const variants=[code];
 if(code.length===12)variants.push("0"+code);
 else if(code.length===13&&code[0]==="0")variants.push(code.slice(1));
 let failures=0,limited=false,notFound=0;
 for(const variant of variants){
  const outcome=await batchFacts(variant);
  if(outcome.product)return outcome.product;
  failures+=outcome.failures;notFound+=outcome.notFound;
  limited||=outcome.limited;
 }
 // UPCitemdb is a general-merchandise fallback; the free no-key endpoint
 // has burst/daily limits, so do not call it for known Open Facts products.
 for(const variant of variants){
  try{
   const body=await requestJSON("https://api.upcitemdb.com/prod/trial/lookup?upc="+encodeURIComponent(variant));
   if(body?.limited){limited=true;break;}
   const found=upcProduct(body);
   if(found)return found;
   notFound++;
  }catch(error){failures++;}
 }
 return {found:false,reason:limited?"rate-limited":notFound?"not-found":"unavailable"};
}
async function lookup(value){
 const code=clean(value,14);
 if(!/^\d{8,14}$/.test(code))return {found:false,reason:"invalid"};
 if(cache.has(code))return {...cache.get(code)};
 if(pending.has(code))return pending.get(code);
 const task=search(code).then(result=>{
  // Never memoize errors or misses: a temporarily offline phone should retry.
  if(result.found)cache.set(code,result);
  return {...result};
 }).finally(()=>pending.delete(code));
 pending.set(code,task);
 return task;
}
root.DKChefProductLookup=Object.freeze({lookup,factsProduct,upcProduct});
})(window);
