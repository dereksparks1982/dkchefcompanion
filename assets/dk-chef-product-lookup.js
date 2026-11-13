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
function classifyUPCitem(item){
 const categories=(Array.isArray(item.category)?item.category.join(" "):String(item.category||"")).toLowerCase();
 const title=String(item.title||"").toLowerCase();
 // Explicit drug product names take priority over broad "Health & Beauty" categories.
 if(/\b(pepcid|famotidine|ibuprofen|acetaminophen|tylenol|advil|antacid|omeprazole)\b/.test(title))
  return "medicine";
 // Prefer provider-supplied categories, never claim all UPCitemdb items are food.
 if(/\b(medicines?|pharmacy|otc|over.the.counter|antacids?|pharmaceuticals?|drug products?)\b/.test(categories))
  return "medicine";
 if(/\b(pet food|dog food|cat food|pet treats)\b/.test(categories))return "petfood";
 if(/\b(cosmetics?|skin care|hair care|beauty|shampoo|personal care)\b/.test(categories))return "beauty";
 if(/\b(food|beverages?|grocery|groceries|snacks?|vegetables?|fruit|meat|canned goods|drinks?)\b/.test(categories))
  return "food";
 // Extremely clear product names can help when the provider omitted category.
 if(/\b(root beer|soda|cola|canned peas|sweet peas|green beans|potatoes|olive oil|tomato sauce)\b/.test(title))
  return "food";
 return "general";
}
function upcProduct(data){
 if(!data||!Array.isArray(data.items)||!data.items.length)return null;
 const p=data.items[0];
 const name=clean(p.title);
 if(!name)return null;
 return {found:true,name,brand:clean(p.brand,100),size:clean(p.size,80),
  source:"UPCitemdb",category:classifyUPCitem(p),description:clean(p.description,220)};
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
 // Only an *exact UPC annotation* in FDA's NDC directory can identify a drug.
 // A retail UPC is NOT an NDC; never infer/convert either identifier.
 try{
  const fda=await root.DKChefMedicineLookup?.verifyUPC(code);
  if(fda?.status==="verified"){
   return {found:true,name:fda.name,brand:fda.brand,size:"",
    category:"medicine",source:fda.source,description:fda.ingredient||fda.generic||"",
    verification:fda};
  }
  if(fda?.status==="rate-limited")limited=true;
 }catch(error){/* A medicine provider must not break food/general lookup. */}
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
root.DKChefProductLookup=Object.freeze({lookup,factsProduct,upcProduct,classifyUPCitem});
})(window);
