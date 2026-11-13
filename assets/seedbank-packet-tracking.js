/* Individual seed packet -> planting accounting. Never infer seeds from packet count.
   A missing seed quantity remains unknown; no other packet is silently debited. */
(function(root){
"use strict";
const positive=value=>Number.isSafeInteger(Number(value))&&Number(value)>0?Number(value):null;
function amountSown(entry){
 const min=positive(entry?.minSeeds),max=positive(entry?.maxSeeds);
 if(min===null&&max===null)return {min:0,max:null};
 if(min!==null&&max!==null&&max>=min)return {min,max};
 if(min!==null)return {min,max:null};
 return {min:0,max};
}
function lotUsage(journal,lotId){
 const linked=(Array.isArray(journal)?journal:[]).filter(entry=>entry&&entry.seedLotId===lotId);
 let minimum=0,maximum=0,unknown=false;
 for(const entry of linked){
  const quantity=amountSown(entry);
  minimum+=quantity.min;
  if(quantity.max===null)unknown=true;
  else maximum+=quantity.max;
 }
 return {linked,minimum,maximum:unknown?null:maximum,uncertain:unknown};
}
function balance(lot,journal){
 const count=positive(lot?.count),usage=lotUsage(journal,lot?.id);
 const lower=count===null||usage.maximum===null?null:Math.max(0,count-usage.maximum);
 const upper=count===null?null:Math.max(0,count-usage.minimum);
 return {...usage,count,lower,upper,
  possibleOverdraw:count!==null&&(usage.minimum>count||(usage.maximum!==null&&usage.maximum>count))};
}
function unassigned(journal,seedKey){
 return (Array.isArray(journal)?journal:[]).filter(e=>e&&e.seedKey===seedKey&&!e.seedLotId);
}
root.DKSeedBankPacketTracking=Object.freeze({amountSown,lotUsage,balance,unassigned});
})(window);
