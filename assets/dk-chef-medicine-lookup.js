/* DK Chef Companion: optional, exact-UPC drug directory verification.
 * FDA NDC listings are labeler-submitted, not FDA approval or medical advice.
 * A retail UPC is NEVER converted, guessed or assumed to be an NDC.
 * OpenFDA dataset: https://open.fda.gov/apis/drug/ndc/
 * DailyMed official label links: https://dailymed.nlm.nih.gov/
 */
(function(root){
"use strict";
const cache=new Map(),inflight=new Map();
const clean=(v,n=140)=>String(v??"").trim().slice(0,n);
const UPC=code=>/^\d{12}$/.test(code)?code:
 /^\d{13}$/.test(code)&&code[0]==="0"?code.slice(1):"";
const aliases=code=>{
 const number=UPC(code);
 return number?[number,"0"+number]:[];
};
const isValidSetId=x=>/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(String(x||""));
function directMatch(record,code){
 const codes=record?.openfda?.upc;
 const values=Array.isArray(codes)?codes:[codes];
 const allowed=new Set(aliases(code));
 return values.some(value=>allowed.has(clean(value,18).replace(/[\s-]/g,"")));
}
function recordInfo(record){
 const open=record.openfda||{};
 const ingredients=Array.isArray(record.active_ingredients)?record.active_ingredients:[];
 const ingredient=ingredients.map(x=>[clean(x?.name,100),clean(x?.strength,70)].filter(Boolean).join(" ")).filter(Boolean).slice(0,4).join("; ");
 const ndc=clean(record.product_ndc,35);
 const setId=Array.isArray(open.spl_set_id)?open.spl_set_id[0]:open.spl_set_id;
 const labelUrl=isValidSetId(setId)?"https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid="+setId:"";
 const brand=clean(record.brand_name||open.brand_name?.[0]||"",100);
 const name=brand||clean(record.generic_name,140);
 if(!name)return null;
 return {status:"verified",found:true,name,brand,generic:clean(record.generic_name,140),
  ingredient:clean(ingredient,280),dosageForm:clean(record.dosage_form,70),
  ndc,source:"openFDA NDC Directory",labelUrl,
  category:"medicine",strength:clean(ingredient,180),
  // Explicit wording prevents confusion with FDA approval.
  notice:"Exact UPC annotation in a labeler-submitted FDA NDC listing. Not an approval or clinical verification."};
}
function interpret(data,code){
 const results=Array.isArray(data?.results)?data.results:[];
 const exact=results.filter(row=>directMatch(row,code)).map(recordInfo).filter(Boolean);
 if(!exact.length)return {status:"not-found",found:false};
 const identities=new Set(exact.map(row=>[row.ndc,row.name.toLowerCase()].join("|")));
 if(identities.size>1)return {status:"ambiguous",found:false,matchingRecords:exact.length};
 return exact[0];
}
async function request(code){
 const controller=typeof AbortController==="function"?new AbortController():null;
 const timer=controller?setTimeout(()=>controller.abort(),7000):null;
 const normalized=UPC(code);
 const url="https://api.fda.gov/drug/ndc.json?search="+
  encodeURIComponent('openfda.upc:"'+normalized+'"')+"&limit=10";
 try{
  const response=await fetch(url,{method:"GET",headers:{Accept:"application/json"},
   ...(controller?{signal:controller.signal}:{})});
  if(response.status===404)return {status:"not-found",found:false};
  if(response.status===429)return {status:"rate-limited",found:false};
  if(!response.ok)return {status:"unavailable",found:false};
  return interpret(await response.json(),code);
 }catch(error){return {status:"unavailable",found:false};}
 finally{if(timer!==null)clearTimeout(timer);}
}
async function verifyUPC(value){
 const code=clean(value,14);
 if(!UPC(code))return {status:"unsupported",found:false};
 const normalized=UPC(code);
 if(cache.has(normalized))return {...cache.get(normalized)};
 if(inflight.has(normalized))return inflight.get(normalized);
 const task=request(code).then(result=>{
  if(result.status==="verified")cache.set(normalized,result);
  return {...result};
 }).finally(()=>inflight.delete(normalized));
 inflight.set(normalized,task);
 return task;
}
root.DKChefMedicineLookup=Object.freeze({verifyUPC,directMatch,interpret,recordInfo});
})(window);
