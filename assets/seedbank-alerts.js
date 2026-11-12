/* DK Seed Bank seed-care priorities. Pure, offline and based only on recorded data. */
(function(root){
"use strict";
const DAY=86400000;
const validDate=s=>typeof s==="string"&&/^\d{4}-\d\d-\d\d$/.test(s)&&
 !Number.isNaN(new Date(s+"T12:00:00").valueOf());
function assess(input){
 const today=validDate(input.today)?new Date(input.today+"T12:00:00"):new Date();
 const year=today.getFullYear(),lowStock=Math.max(0,Number(input.lowStock)||30);
 const ru=input.locale==="ru",l=(en,russian)=>ru?russian:en;
 const plants=Array.isArray(input.plants)?input.plants:[];
 const lots=Array.isArray(input.lots)?input.lots:[];
 const tests=Array.isArray(input.tests)?input.tests:[];
 const byKey=new Map();
 for(const t of tests){
  if(!t||!validDate(t.date)||!(Number(t.tested)>0))continue;
  if(!byKey.has(t.seedKey)||byKey.get(t.seedKey).date<t.date)byKey.set(t.seedKey,t);
 }
 const entries=[];
 const counts={low:0,aging:0,retest:0,weak:0,upcoming:0};
 const push=(type,p,detail)=>{counts[type]++;entries.push({type,name:p.name,key:p.key,detail});};
 for(const p of plants){
  if(!p||p.archived)continue;
  const count=Number(p.count),used=Number(p.used);
  if(Number.isFinite(count)&&count>0){
   const remaining=Math.max(0,count-(Number.isFinite(used)?used:0));
   if(remaining<=lowStock)push("low",p,l(remaining+" estimated seeds remaining (threshold "+lowStock+").",
    "Осталось примерно "+remaining+" семян (порог "+lowStock+")."));
  }
  const recent=byKey.get(p.key);
  if(recent){
   const rate=Math.round(100*Number(recent.sprouted)/Number(recent.tested));
   if(Number.isFinite(rate)&&rate>=0&&rate<60)push("weak",p,l(
    rate+"% germinated on "+recent.date+". Consider testing again before sowing.",
    "Всхожесть "+rate+"% ("+recent.date+"). Повторите проверку перед посевом."));
  }
  const oldLots=lots.filter(x=>x.seedKey===p.key&&Number.isInteger(Number(x.year))&&
   Number(x.year)>=1900&&year-Number(x.year)>=3);
  if(oldLots.length&&(!recent||(today-new Date(recent.date+"T12:00:00"))/DAY>=365))
   push("aging",p,l(oldLots.length+" lot(s) three or more years old. Check germination before relying on them.",
    "Партий старше трёх лет: "+oldLots.length+". Проверьте всхожесть перед посевом."));
  else if(recent&&(today-new Date(recent.date+"T12:00:00"))/DAY>=365)
   push("retest",p,l("Most recent test was "+recent.date+". Consider a new germination test.",
    "Последняя проверка: "+recent.date+". Рекомендуется повторно проверить всхожесть."));
 }
 const frost=input.lastFrost;
 if(validDate(frost)){
  const [,month,day]=frost.split("-").map(Number);
  const offsets={indoor:[-70,-35],"direct-cool":[-35,14],"direct-warm":[7,45]};
  for(const p of plants){
   if(!p||p.archived||!offsets[p.mode])continue;
   for(const y of [year,year+1]){
    const f=new Date(y,month-1,day,12),[early,late]=offsets[p.mode];
    const begin=new Date(f);begin.setDate(f.getDate()+early);
    const end=new Date(f);end.setDate(f.getDate()+late);
    const days=(begin-today)/DAY;
    if(end>=today&&days<=45&&days>=-14){
     const when=begin.toLocaleDateString(undefined,{month:"short",day:"numeric"});
     push("upcoming",p,l("Estimated sowing begins around "+when+". Check your seed packet and local conditions.",
      "Ориентировочное начало посева: "+when+". Сверьтесь с упаковкой и местными условиями."));
     break;
    }
   }
  }
 }
 const priorities={weak:0,low:1,aging:2,retest:3,upcoming:4};
 entries.sort((a,b)=>priorities[a.type]-priorities[b.type]||a.name.localeCompare(b.name));
 return {counts,entries};
}
root.DKSeedBankAlerts=Object.freeze({assess});
})(window);
