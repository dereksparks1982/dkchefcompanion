/* DK Seed Bank: optional plant growth measurements and chronological line charts. */
(function(root){
"use strict";
const CM_PER_INCH=2.54;
const DATE=/^(19|20|21)\d\d-\d\d-\d\d$/;
const MAX_ENTRIES=500;
const validDate=value=>{
 if(typeof value!=="string"||!DATE.test(value))return false;
 const date=new Date(value+"T12:00:00Z");
 return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
};
const toCm=(height,unit)=>{
 const number=Number(height);
 if(height===""||height==null||!Number.isFinite(number)||number<0||!["cm","in"].includes(unit))
  throw Error("Invalid height or unit.");
 const value=unit==="in"?number*CM_PER_INCH:number;
 if(value>3000)throw Error("Height exceeds the 3000 cm limit.");
 return Math.round(value*1000)/1000;
};
const fromCm=(heightCm,unit)=>unit==="in"?heightCm/CM_PER_INCH:heightCm;
const fmt=height=>Number(height.toFixed(2)).toLocaleString(undefined,{maximumFractionDigits:2});
const sorted=measurements=>(Array.isArray(measurements)?measurements:[])
 .filter(m=>m&&validDate(m.date)&&Number.isFinite(m.heightCm)&&m.heightCm>=0&&m.heightCm<=3000)
 .slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
const summarize=measurements=>{
 const entries=sorted(measurements);
 if(!entries.length)return {count:0,first:null,latest:null,previous:null,changeCm:null,totalCm:null,days:null};
 const first=entries[0],latest=entries[entries.length-1],previous=entries.length>1?entries[entries.length-2]:null;
 const days=previous?(Date.parse(latest.date+"T12:00:00Z")-Date.parse(previous.date+"T12:00:00Z"))/86400000:null;
 return {count:entries.length,first,latest,previous,changeCm:previous?latest.heightCm-previous.heightCm:null,
  totalCm:entries.length>1?latest.heightCm-first.heightCm:null,days};
};
const api=Object.freeze({toCm,fromCm,fmt,validDate,sorted,summarize});
root.DKSeedBankGrowthMath=api;
const core=root.DKSeedBankCore,host=document.getElementById("journalEntries");
if(!core||!host)return;
const tr=(en,ru)=>document.documentElement.lang==="ru"?ru:en;
const esc=value=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const openIds=new Set(),unitById=new Map(),showById=new Map(),editById=new Map();
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
const entries=()=>core.journal().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.plant).localeCompare(String(b.plant)));
const recordId=()=> "measure-"+Date.now().toString(36)+"-"+(root.crypto?.randomUUID?.().slice(0,15)||Math.random().toString(36).slice(2,17));
const unitLabel=unit=>unit==="in"?tr("in","дюйм"):tr("cm","см");
const heightLabel=(cm,unit)=>fmt(fromCm(cm,unit))+" "+unitLabel(unit);
function graph(measurements,unit,plant){
 const list=sorted(measurements),w=680,h=230,l=58,r=20,t=18,b=48,plotW=w-l-r,plotH=h-t-b;
 if(!list.length)return '<p class="dk-measure-empty">'+tr("No height measurements yet. Record one whenever you like.",
  "Пока нет измерений высоты. Добавляйте их, когда захотите.")+'</p>';
 const values=list.map(item=>fromCm(item.heightCm,unit));
 const maximum=Math.max(1,...values)*1.15;
 const time=list.map(item=>Date.parse(item.date+"T12:00:00Z"));
 const minX=Math.min(...time),maxX=Math.max(...time),span=maxX-minX;
 const px=(stamp,index)=>span===0?l+plotW/2:l+((stamp-minX)/span)*plotW;
 const py=value=>t+plotH-(value/maximum)*plotH;
 const grid=Array.from({length:5},(_,i)=>{
  const fraction=i/4,y=t+plotH*(1-fraction);
  return '<line x1="'+l+'" y1="'+y.toFixed(2)+'" x2="'+(w-r)+'" y2="'+y.toFixed(2)+'" stroke="#d7e6d6" stroke-dasharray="3 4"/>'+
   '<text x="'+(l-8)+'" y="'+(y+4).toFixed(2)+'" text-anchor="end" font-size="12" fill="#496b51">'+esc(fmt(maximum*fraction))+'</text>';
 }).join("");
 const points=list.map((item,i)=>({x:px(time[i],i),y:py(values[i]),item,value:values[i]}));
 const polyline=points.map(p=>p.x.toFixed(2)+","+p.y.toFixed(2)).join(" ");
 const circles=points.map(p=>'<circle cx="'+p.x.toFixed(2)+'" cy="'+p.y.toFixed(2)+'" r="5" fill="#277147" stroke="white" stroke-width="2">'+
  '<title>'+esc(p.item.date+" · "+heightLabel(p.item.heightCm,unit)+(p.item.note?" · "+p.item.note:""))+'</title></circle>').join("");
 const positions=span===0?[0]:[0,0.25,0.5,0.75,1];
 const dateLabels=positions.map((fraction,i)=>{
  const stamp=minX+span*fraction,date=new Date(stamp).toISOString().slice(0,10);
  const x=span===0?l+plotW/2:l+plotW*fraction;
  return '<text x="'+x.toFixed(2)+'" y="'+(h-22)+'" text-anchor="'+(i===0&&span!==0?"start":i===positions.length-1?"end":"middle")+'" font-size="11" fill="#496b51">'+date.slice(5)+'</text>';
 }).join("");
 return '<div class="dk-measure-chart"><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(tr("Height over time for ","Высота по датам: ")+plant+' ('+unitLabel(unit)+')')+'" preserveAspectRatio="xMidYMid meet">'+
  '<title>'+esc(tr("Plant height growth chart","График роста растения"))+'</title>'+
  grid+'<line x1="'+l+'" y1="'+(t+plotH)+'" x2="'+(w-r)+'" y2="'+(t+plotH)+'" stroke="#789e81"/>'+
  (points.length>1?'<polyline points="'+polyline+'" fill="none" stroke="#277147" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>':'')+
  circles+dateLabels+'<text x="'+(l-48)+'" y="13" font-size="11" fill="#496b51">'+esc(unitLabel(unit))+'</text></svg></div>';
}
function renderCard(card,entry){
 if(!entry||typeof entry.id!=="string")return;
 let panel=card.querySelector(".dk-measure");
 if(!panel){
  panel=document.createElement("details");
  panel.className="dk-measure";
  panel.setAttribute("data-dk-no-translate","");
  const action=card.querySelector(".journal-actions");
  if(action)card.insertBefore(panel,action);else card.appendChild(panel);
 }
 const id=entry.id,measurements=sorted(entry.growthMeasurements),summary=summarize(measurements);
 const unit=unitById.get(id)||(summary.latest?.unit||"cm");
 unitById.set(id,unit);
 const currentlyEditing=editById.get(id),current=measurements.find(x=>x.id===currentlyEditing)||null;
 const editing=!!current;
 const formUnit=current?.unit||unit;
 const height=current?fmt(fromCm(current.heightCm,formUnit)):"";
 const shown=showById.get(id)||15;
 panel.dataset.measureEntryId=id;
 const wasOpen=openIds.has(id);
 panel.innerHTML='<summary>📈 '+tr("Growth measurements","Измерения роста")+
  ' <small>'+measurements.length+' '+tr("recorded","записей")+'</small></summary>'+
  '<div class="dk-measure-body">'+
  '<p class="dk-measure-guidance">'+tr("Optional. Measure whenever you wish; no schedule or reminders.",
    "Необязательно. Измеряйте когда захотите, без расписания и напоминаний.")+'</p>'+
  '<form class="dk-measure-form" data-measure-form>'+
  '<label>'+tr("Date","Дата")+'<input name="date" type="date" required value="'+esc(current?.date||today())+'"></label>'+
  '<label>'+tr("Height","Высота")+'<input name="height" type="number" min="0" max="3000" step="any" inputmode="decimal" required placeholder="0.0" value="'+esc(height)+'"></label>'+
  '<label>'+tr("Unit","Единица")+'<select name="unit"><option value="cm"'+(formUnit==="cm"?" selected":"")+'>'+tr("Centimeters","Сантиметры")+'</option><option value="in"'+(formUnit==="in"?" selected":"")+'>'+tr("Inches","Дюймы")+'</option></select></label>'+
  '<label class="dk-measure-note">'+tr("Notes (optional)","Примечание (необязательно)")+
  '<input name="note" type="text" maxlength="300" value="'+esc(current?.note||"")+'" placeholder="'+esc(tr("e.g. first true leaves","например, первые настоящие листья"))+'"></label>'+
  '<div class="dk-measure-form-actions"><button class="dk-measure-save" type="submit">'+(editing?tr("Save changes","Сохранить изменения"):tr("Record measurement","Записать измерение"))+'</button>'+
  (editing?'<button type="button" data-measure-cancel>'+tr("Cancel editing","Отменить изменение")+'</button>':'')+'</div></form>'+
  '<p class="dk-measure-status" role="status" aria-live="polite"></p>'+
  (summary.count?'<div class="dk-measure-stats">'+
   '<span>'+tr("Latest","Последняя")+': <strong>'+heightLabel(summary.latest.heightCm,unit)+'</strong></span>'+
   (summary.changeCm!==null?'<span>'+tr("Since last","С прошлого раза")+': <strong>'+((summary.changeCm>0)?"+":"")+heightLabel(summary.changeCm,unit)+'</strong></span>':"")+
   (summary.totalCm!==null?'<span>'+tr("Since first","С первого измерения")+': <strong>'+((summary.totalCm>0)?"+":"")+heightLabel(summary.totalCm,unit)+'</strong></span>':"")+
   '</div>':"")+
  '<label class="dk-measure-chart-unit">'+tr("Chart units","Единицы графика")+
  ' <select data-measure-unit><option value="cm"'+(unit==="cm"?" selected":"")+'>'+tr("cm","см")+'</option>'+
  '<option value="in"'+(unit==="in"?" selected":"")+'>'+tr("inches","дюймы")+'</option></select></label>'+
  graph(measurements,unit,entry.plant)+
  (measurements.length?'<div class="dk-measure-history"><h5>'+tr("Measurement history","История измерений")+'</h5><div class="dk-measure-rows">'+
   measurements.slice().reverse().slice(0,shown).map(item=>
    '<div class="dk-measure-row"><span><strong>'+esc(item.date)+'</strong> · '+esc(heightLabel(item.heightCm,unit))+
    (item.note?'<small>'+esc(item.note)+'</small>':"")+'</span>'+
    '<span class="dk-measure-row-actions"><button type="button" data-measure-edit="'+esc(item.id)+'">'+tr("Edit","Изменить")+'</button>'+
    '<button type="button" data-measure-delete="'+esc(item.id)+'">'+tr("Delete","Удалить")+'</button></span></div>'
   ).join("")+'</div>'+
   (measurements.length>shown?'<button type="button" data-measure-more>'+tr("Show more","Показать ещё")+'</button>':"")+
   '</div>':"")+
  '</div>';
 panel.dataset.measureInitialized="1";
 panel.open=wasOpen;
}
function render(){
 const all=entries(),cards=Array.from(host.querySelectorAll(".journal-entry"));
 cards.forEach((card,i)=>{if(all[i])renderCard(card,all[i]);});
}
function alertStatus(panel,message){const node=panel?.querySelector(".dk-measure-status");if(node)node.textContent=message;}
function findEntry(panel){
 return core.journal().find(entry=>entry.id===panel?.dataset.measureEntryId);
}
function submit(event){
 event.preventDefault();
 const panel=event.target.closest(".dk-measure"),entry=findEntry(panel);
 if(!entry)return;
 const form=event.target,values=new FormData(form);
 const date=String(values.get("date")||""),height=String(values.get("height")||"").trim();
 const unit=String(values.get("unit")||""),note=String(values.get("note")||"").trim().slice(0,300);
 if(!validDate(date)){alertStatus(panel,tr("Enter a valid date.","Введите правильную дату."));return;}
 let heightCm;
 try{heightCm=toCm(height,unit);}catch(error){alertStatus(panel,tr("Enter a valid nonnegative height (maximum 3000 cm).","Введите правильную высоту от 0 до 3000 см."));return;}
 const previous=editById.get(entry.id);
 const id=previous||(recordId());
 const record={id,date,heightCm,unit,note};
 if(!core.saveJournalMeasurement(entry.id,record)){
  alertStatus(panel,tr("Could not save. Check your device storage.","Не удалось сохранить. Проверьте память устройства."));return;
 }
 editById.delete(entry.id);openIds.add(entry.id);unitById.set(entry.id,unit);
 // A successful save redraws the journal immediately. Render again with persisted panel state.
 render();
}
function onClick(event){
 const button=event.target.closest("[data-measure-edit],[data-measure-delete],[data-measure-more],[data-measure-cancel]");
 if(!button)return;
 const panel=button.closest(".dk-measure"),entry=findEntry(panel);if(!entry)return;
 if(button.matches("[data-measure-edit]")){
  editById.set(entry.id,button.dataset.measureEdit);openIds.add(entry.id);render();
  const form=Array.from(host.querySelectorAll(".dk-measure")).find(p=>p.dataset.measureEntryId===entry.id)?.querySelector(".dk-measure-form");
  form?.querySelector('input[name="height"]')?.focus();
 }else if(button.matches("[data-measure-delete]")){
  const record=(entry.growthMeasurements||[]).find(x=>x.id===button.dataset.measureDelete);
  if(!record)return;
  if(!root.confirm(tr("Delete this height measurement?","Удалить это измерение высоты?")))return;
  if(!core.deleteJournalMeasurement(entry.id,record)){
   alertStatus(panel,tr("Could not delete the measurement.","Не удалось удалить измерение."));
  }else{editById.delete(entry.id);openIds.add(entry.id);render();}
 }else if(button.matches("[data-measure-cancel]")){
  editById.delete(entry.id);render();
 }else if(button.matches("[data-measure-more]")){
  showById.set(entry.id,(showById.get(entry.id)||15)+15);render();
 }
}
host.addEventListener("submit",event=>{
 if(event.target.matches("[data-measure-form]"))submit(event);
});
host.addEventListener("click",onClick);
host.addEventListener("change",event=>{
 const select=event.target.closest("[data-measure-unit]");
 if(!select)return;
 const panel=select.closest(".dk-measure"),entry=findEntry(panel);if(!entry)return;
 unitById.set(entry.id,select.value==="in"?"in":"cm");
 openIds.add(entry.id);render();
});
host.addEventListener("toggle",event=>{
 const panel=event.target;
 if(!panel.matches?.(".dk-measure"))return;
 const id=panel.dataset.measureEntryId;
 if(panel.open)openIds.add(id);
 else openIds.delete(id);
},true);
document.addEventListener("dkseedbank:journal-rendered",render);
document.addEventListener("dkseedbank:journal-deleted",event=>{
 const id=event.detail?.entry?.id;if(!id)return;
 openIds.delete(id);unitById.delete(id);showById.delete(id);editById.delete(id);
});
document.getElementById("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(render));
render();
})(window);
