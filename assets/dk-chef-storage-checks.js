/* DK Chef Companion: optional food storage inspections. Local date reminders
   are informational and never substitute for food-safety procedures. */
(function(root){
"use strict";
const CONDITONS=Object.freeze(["unrecorded","looks-okay","needs-review"]);
const DATE=/^\d{4}-\d{2}-\d{2}$/;
function validDate(value){
 if(value==="")return true;
 if(typeof value!=="string"||!DATE.test(value))return false;
 const [y,m,d]=value.split("-").map(Number),dt=new Date(Date.UTC(y,m-1,d));
 return y>=1900&&y<=2100&&dt.getUTCFullYear()===y&&dt.getUTCMonth()+1===m&&dt.getUTCDate()===d;
}
function today(now=new Date()){
 const d=now instanceof Date?now:new Date(now);
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function dayDistance(first,second){
 if(!validDate(first)||!validDate(second)||!first||!second)return null;
 const utc=s=>Date.UTC(...s.split("-").map((n,i)=>i===1?Number(n)-1:Number(n)));
 return Math.round((utc(first)-utc(second))/86400000);
}
function normalize(values={},previous={}){
 if(!values||typeof values!=="object"||Array.isArray(values))return {ok:false,reason:"invalid"};
 const from=(name,fallback)=>values[name]===undefined?(previous[name]??fallback):values[name];
 const storageSpot=String(from("storageSpot","")).trim();
 const storageCondition=String(from("storageCondition","unrecorded"));
 const storageTemp=String(from("storageTemp","")).trim();
 const storageTempUnit=String(from("storageTempUnit","F"));
 const storageHumidity=String(from("storageHumidity","")).trim();
 const storageChecked=String(from("storageChecked","")).trim();
 const storageCheckBy=String(from("storageCheckBy","")).trim();
 if(storageSpot.length>100)return {ok:false,reason:"spot"};
 if(!CONDITONS.includes(storageCondition))return {ok:false,reason:"condition"};
 if(!["F","C"].includes(storageTempUnit))return {ok:false,reason:"unit"};
 if(storageTemp&&!/^-?\d+(?:\.\d{1,2})?$/.test(storageTemp))return {ok:false,reason:"temperature"};
 const temperature=Number(storageTemp),min=storageTempUnit==="F"?-148:-100,max=storageTempUnit==="F"?248:120;
 if(storageTemp&&(!Number.isFinite(temperature)||temperature<min||temperature>max))return {ok:false,reason:"temperature"};
 if(storageHumidity&&(!/^\d+(?:\.\d)?$/.test(storageHumidity)||
   Number(storageHumidity)<0||Number(storageHumidity)>100))return {ok:false,reason:"humidity"};
 if(!validDate(storageChecked)||!validDate(storageCheckBy))return {ok:false,reason:"date"};
 return {ok:true,fields:{storageSpot,storageCondition,storageTemp,storageTempUnit,
  storageHumidity,storageChecked,storageCheckBy}};
}
function summary(row,at=today()){
 const check=String(row?.storageCheckBy||"");
 const days=check?dayDistance(check,at):null;
 const due=days!==null&&days<=0,soon=days!==null&&days>0&&days<=7;
 return {due,soon,days,review:row?.storageCondition==="needs-review",
  checked:row?.storageChecked||"",condition:row?.storageCondition||"unrecorded"};
}
root.DKChefStorageChecks=Object.freeze({normalize,summary,validDate,dayDistance,today});
})(window);
