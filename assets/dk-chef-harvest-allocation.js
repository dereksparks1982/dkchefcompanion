/* DK Chef Companion: harvest allocation math; this module never changes inventory.
   Values are recorded in the original harvest unit. Food stock is posted
   separately, only after the user explicitly chooses the destination. */
(function(root){
"use strict";
const BUCKETS=Object.freeze(["fresh","preserved","pantry","cellar"]);
const COUNT_UNITS=new Set(["count","bunches"]);
function validAmount(value){
 return typeof value==="number"&&Number.isFinite(value)&&value>=0&&value<=1e9;
}
function inspect(harvest,allocation=harvest?.allocations||{}){
 if(!harvest||!validAmount(Number(harvest.amount))||Number(harvest.amount)<=0||
    (COUNT_UNITS.has(harvest.unit)&&!Number.isSafeInteger(Number(harvest.amount)))||
    !["lb","oz","kg","g","count","bunches"].includes(harvest.unit))
  return {ok:false,reason:"invalid-harvest"};
 if(!allocation||typeof allocation!=="object"||Array.isArray(allocation))
  return {ok:false,reason:"invalid-allocation"};
 const out={};
 for(const field of BUCKETS){
  const raw=allocation[field]??0;
  // Explicit blank is zero, but strings such as "3 kg" and "NaN" are invalid.
  if(raw===""||raw===null)out[field]=0;
  else if(typeof raw==="string"&&raw.trim()==="")out[field]=0;
  else{
   if(typeof raw!=="number"&&!(typeof raw==="string"&&/^(?:\d+\.?\d*|\.\d+)$/.test(raw.trim())))
    return {ok:false,reason:"invalid-amount",field};
   out[field]=Number(raw);
  }
  if(!validAmount(out[field])||(COUNT_UNITS.has(harvest.unit)&&!Number.isInteger(out[field])))
   return {ok:false,reason:"invalid-amount",field};
 }
 const total=Number(harvest.amount);
 const allocated=BUCKETS.reduce((sum,key)=>sum+out[key],0);
 const precision=Math.max(1e-9,total*1e-9);
 if(allocated>total+precision)return {ok:false,reason:"over-allocated",total,allocated};
 const remaining=Math.max(0,total-allocated);
 return {ok:true,allocations:out,allocated,remaining,total,unit:harvest.unit};
}
function stockId(harvestId,location){
 const id=String(harvestId||"");
 if(!/^[a-zA-Z0-9-]{1,100}$/.test(id)||!["pantry","cellar"].includes(location))return "";
 return "harvest-stock-"+id+"-"+location;
}
function amountText(amount,unit){
 if(!validAmount(amount)||!unit)return "";
 return String(Number(amount.toFixed(6)))+" "+unit;
}
root.DKChefHarvestAllocation=Object.freeze({BUCKETS,inspect,stockId,amountText});
})(window);
