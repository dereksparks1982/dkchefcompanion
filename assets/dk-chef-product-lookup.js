/* DK Chef Companion: barcode-to-product identification.
   Quagga2 reads the number; these public databases identify the product.
   Open Facts datasets are ODbL; UPCitemdb free trial has rate limits. */
(function(root){
"use strict";
const cache=new Map();
const FACTS_FIELDS="code,product_name,product_name_en,generic_name,brands,quantity,categories_tags";
function clean(value,max=140){return String(value||"").trim().slice(0,max);}
async function requestJSON(url){
 const controller=typeof AbortController==="function"?new AbortController():null;
 const timeout=controller?setTimeout(()=>controller.abort(),8000):null;
 try{
  const response=await fetch(url,{method:"GET",headers:{Accept:"application/json"},
   ...(controller?{signal:controller.signal}:{})});
  if(response.status===404)return {notFound:true};
  if(response.status===429)return {limited:true};
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
  category:source==="Open Food Facts"?"food":"general",source,description:""};
}
function upcProduct(data){
 if(!data||!Array.isArray(data.items)||!data.items.length)return null;
 const p=data.items[0];
 const name=clean(p.title);
 if(!name)return null;
 return {found:true,name,brand:clean(p.brand,100),
  size:"",category:"general",source:"UPCitemdb",description:clean(p.description,220)};
}
async function lookup(value){
 const code=clean(value,14);
 if(!/^\d{8,14}$/.test(code))return {found:false,reason:"invalid"};
 if(cache.has(code))return {...cache.get(code)};
 const variants=[code];
 if(code.length===12)variants.push("0"+code);
 if(code.length===13&&code[0]==="0")variants.push(code.slice(1));
 let failures=0,limited=false;
 for(const [domain,source] of [
  ["world.openfoodfacts.org","Open Food Facts"],
  ["world.openproductsfacts.org","Open Products Facts"]
 ]){
  for(const barcode of variants){
   try{
    const url="https://"+domain+"/api/v2/product/"+encodeURIComponent(barcode)+
     ".json?fields="+encodeURIComponent(FACTS_FIELDS);
    const data=await requestJSON(url);
    if(data.limited){limited=true;continue;}
    const product=factsProduct(data,source);
    if(product){cache.set(code,product);return {...product};}
   }catch(error){failures++;}
  }
 }
 // General merchandise, including OTC products such as Pepcid, is often absent
 // from food-only databases. UPCitemdb's unauthenticated trial is rate limited.
 for(const barcode of variants){
  try{
   const data=await requestJSON("https://api.upcitemdb.com/prod/trial/lookup?upc="+encodeURIComponent(barcode));
   if(data.limited){limited=true;break;}
   const product=upcProduct(data);
   if(product){cache.set(code,product);return {...product};}
  }catch(error){failures++;}
 }
 return {found:false,reason:limited?"rate-limited":failures?"unavailable":"not-found"};
}
root.DKChefProductLookup=Object.freeze({lookup,factsProduct,upcProduct});
})(window);
