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
// Registering a packet from the catalog consumes an existing packet slot.
function catalogSlots(cardPackets,lots,seedKey){
 const stock=Number(cardPackets);
 if(!Number.isSafeInteger(stock)||stock<0)return 0;
 const registered=(Array.isArray(lots)?lots:[]).filter(row=>
  row&&row.seedKey===seedKey&&row.origin==="catalog"&&
  row.kind!=="bulk"&&row.status!=="empty").length;
 return Math.max(0,stock-registered);
}
// Correct metadata on a stable packet ID. Blank counts mean unknown, never zero.
function editPacketFields(values){
 const data=values&&typeof values==="object"?values:{};
 const trim=(key,max)=>String(data[key]??"").trim().slice(0,max);
 const countText=trim("count",16),yearText=trim("year",10),obtained=trim("obtained",10);
 let count=null,year=null;
 if(countText){
  if(!/^[1-9][0-9]*$/.test(countText)||!Number.isSafeInteger(Number(countText))||Number(countText)>9999999)
   throw Error("Enter a positive seed count, or leave the field blank when unknown.");
  count=Number(countText);
 }
 if(yearText){
  if(!/^[0-9]{4}$/.test(yearText)||Number(yearText)<1900||Number(yearText)>2100)
   throw Error("Year packed must be between 1900 and 2100, or left blank.");
  year=Number(yearText);
 }
 if(obtained){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(obtained)||!Number.isFinite(Date.parse(obtained))||
     new Date(obtained).toISOString().slice(0,10)!==obtained)
   throw Error("Use a valid date obtained, or leave it blank.");
 }
 return {lot:trim("lot",90),year,count,place:trim("place",100),
  supplier:trim("supplier",100),obtained};
}
function unassigned(journal,seedKey){
 return (Array.isArray(journal)?journal:[]).filter(e=>e&&e.seedKey===seedKey&&!e.seedLotId);
}
root.DKSeedBankPacketTracking=Object.freeze({amountSown,lotUsage,balance,catalogSlots,editPacketFields,unassigned});
})(window);
