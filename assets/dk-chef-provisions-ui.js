/* DK Chef Companion local-first inventory. One Pantry & Root Cellar section.
   No barcode scanner or manual barcode controls in any storage section.
   Saved UPCs remain attached to records for repeat scans and Google Drive sync. */
(function(){
"use strict";
const api=window.DKSeedBankRecipes;if(!api)return;
const stores=[
 {id:"kitchen",host:"chefKitchenApp",title:"Pantry & Root Cellar"},
 {id:"medicine",host:"chefMedicineApp",title:"Medicine Cabinet"},
 {id:"household",host:"chefHouseholdApp",title:"Household Supplies"}
];
const editing={kitchen:"",medicine:"",household:""};
const messages={kitchen:"",medicine:"",household:""};
const searches={kitchen:"",medicine:"",household:""};
const storageFilter={kitchen:"all"};
const $=(s,root=document)=>root.querySelector(s);
const ru=()=>document.documentElement.lang==="ru";
const t=(en,rus)=>ru()?rus:en;
const esc=value=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const group=loc=>loc==="medicine"||loc==="household"?loc:"kitchen";
const items=id=>api.provisions().items.filter(row=>group(row.location)===id)
 .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
function harvestChoices(){
 const workbench=window.DKSeedBankWorkbench?.exportData?.()||{};
 const plants=window.DKSeedBankCore?.plants?.();
 return (workbench.harvests||[]).filter(h=>h?.id&&h.seedKey&&!h.allocations).slice(-100).reverse().map(h=>({
  id:h.id,name:plants?.get(h.seedKey)?.name||String(h.seedKey).split("|").pop(),
  date:h.date||"",amount:h.amount||"",unit:h.unit||""
 }));
}
function storageName(loc){
 return loc==="cellar"?t("Root Cellar","Погреб"):
 loc==="pantry"?t("Pantry","Кладовая"):
 loc==="medicine"?t("Medicine Cabinet","Аптечка"):t("Household Supplies","Бытовые запасы");
}
function expiryNotice(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||"")))return "";
 const [y,m,d]=value.split("-").map(Number);
 const date=new Date(y,m-1,d,12);
 if(date.getFullYear()!==y||date.getMonth()+1!==m||date.getDate()!==d)return "";
 const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
 const days=Math.round((date-today)/86400000);
 if(days<0)return t("Past best-by/expiry","Срок годности истёк");
 if(days===0)return t("Expires today","Срок истекает сегодня");
 return days<=30?t("Expires in ","Срок истекает через ")+days+t(" days"," дн."):"";
}
function isLow(row){return Number(row.lowStockAt)>0&&Number(row.packages)<=Number(row.lowStockAt);}
function labeledInput(label,key,val,attrs=""){
 return '<label>'+label+'<input name="'+key+'" value="'+esc(val??"")+'" '+attrs+'></label>';
}

function statusFor(row){
 return window.DKChefStorageChecks?.summary(row)||{due:false,soon:false,review:false};
}
function storageFields(row){
 const value=field=>String(row[field]??"");
 const chosen=(field,option)=>(value(field)||"unrecorded")===option?" selected":"";
 return '<fieldset class="chef-storage-fields"><legend>'+
  t("Storage conditions & checks (optional)","Условия хранения и осмотр (необязательно)")+'</legend>'+
  '<div class="chef-store-grid">'+
  labeledInput(t("Shelf, bin or container","Полка, ящик или ёмкость"),"storageSpot",value("storageSpot"),'maxlength="100"')+
  '<label>'+t("Observed condition","Состояние при осмотре")+'<select name="storageCondition">'+
   '<option value="unrecorded"'+chosen("storageCondition","unrecorded")+'>'+t("Not checked","Не проверено")+'</option>'+
   '<option value="looks-okay"'+chosen("storageCondition","looks-okay")+'>'+t("Appears okay (not safety proof)","На вид в порядке (не доказательство безопасности)")+'</option>'+
   '<option value="needs-review"'+chosen("storageCondition","needs-review")+'>'+t("Needs review (exclude from recipes)","Требует проверки (не учитывать в рецептах)")+'</option>'+
  '</select></label>'+
  labeledInput(t("Recorded temperature","Измеренная температура"),"storageTemp",value("storageTemp"),'inputmode="decimal" maxlength="12" placeholder="40"')+
  '<label>'+t("Temperature unit","Единица температуры")+'<select name="storageTempUnit">'+
   '<option value="F"'+(value("storageTempUnit")==="C"?"":" selected")+'>°F</option>'+
   '<option value="C"'+(value("storageTempUnit")==="C"?" selected":"")+'>°C</option></select></label>'+
  labeledInput(t("Relative humidity (%)","Относительная влажность (%)"),"storageHumidity",value("storageHumidity"),'type="number" min="0" max="100" step="0.1"')+
  labeledInput(t("Last inspected","Последний осмотр"),"storageChecked",value("storageChecked"),'type="date"')+
  labeledInput(t("Next inspection date","Дата следующего осмотра"),"storageCheckBy",value("storageCheckBy"),'type="date"')+
  '</div><p class="chef-source-note">'+t(
   "Enter observations yourself; nothing is measured automatically. Dates produce on-screen reminders only. Appearance, temperature and humidity do not guarantee food safety.",
   "Записи вводятся вручную; измерения не выполняются автоматически. Даты дают напоминания только на экране. Внешний вид, температура и влажность не гарантируют безопасность еды.")+'</p></fieldset>';
}
function storageFlags(row){
 const state=statusFor(row);
 return (state.review?'<span class="chef-condition-warning">'+t("Needs review · excluded from recipes","Требует проверки · не учитывается в рецептах")+'</span>':"")+
  (state.due?'<span class="chef-check-due">'+t("Inspection due","Пора проверить")+'</span>':
   state.soon?'<span class="chef-check-soon">'+t("Check within 7 days","Проверить в течение 7 дней")+'</span>':"");
}
function storageOverview(all){
 const onHand=all.filter(row=>row.available!==false&&Number(row.packages??1)>0);
 const due=onHand.filter(row=>statusFor(row).due).length;
 const review=onHand.filter(row=>statusFor(row).review).length;
 const soon=onHand.filter(row=>statusFor(row).soon).length;
 const options=[["all",t("All food","Все продукты")],["due",t("Inspections due","Пора проверить")],
  ["review",t("Needs review","Требует проверки")]];
 return '<section class="chef-storage-overview" aria-label="'+t("Storage inspection reminders","Напоминания об осмотре хранения")+'">'+
  '<p><strong>'+t("Storage checks","Проверка хранения")+'</strong> · '+
   t("Due: ","Пора проверить: ")+due+' · '+
   t("Needs review: ","Требует проверки: ")+review+' · '+
   t("Next 7 days: ","В следующие 7 дней: ")+soon+'</p>'+
  '<div class="chef-storage-filters" role="group" aria-label="'+t("Storage filters","Фильтры хранения")+'">'+
   options.map(([key,label])=>'<button type="button" data-chef-storage-filter="'+key+'" aria-pressed="'+
    (storageFilter.kitchen===key)+'"'+(storageFilter.kitchen===key?' class="is-active"':'')+'>'+label+'</button>').join("")+'</div>'+
  '<p class="chef-source-note">'+t(
   "Reminder dates are optional and checked when the app opens; no push notifications are sent. An inspection is not proof that food is safe to eat.",
   "Даты напоминаний необязательны и проверяются при открытии приложения; уведомления не отправляются. Осмотр не доказывает, что пища безопасна.")+'</p></section>';
}

function formHtml(section,row){
 const kitchen=section==="kitchen",record=row||{},value=k=>record[k]??"";
 const header='<form class="chef-store-form" data-chef-form="'+section+'"><input type="hidden" name="id" value="'+esc(value("id"))+'">'+
 '<div class="chef-store-grid">'+
 labeledInput(t("Product name","Название товара"),"name",value("name"),'required maxlength="140"')+
 (kitchen?'<label>'+t("Storage area","Место хранения")+'<select name="location">'+
 '<option value="pantry"'+(record.location==="cellar"?"":" selected")+">"+t("Pantry","Кладовая")+'</option>'+
 '<option value="cellar"'+(record.location==="cellar"?" selected":"")+">"+t("Root Cellar","Погреб")+'</option></select></label>':"")+
 labeledInput(t("Brand","Марка"),"brand",value("brand"),'maxlength="100"')+
 labeledInput(t("Package size (each)","Размер одной упаковки"),"size",value("size"),'maxlength="80"')+
 labeledInput(t("Packages","Упаковки"),"packages",record.packages??1,'type="number" min="0" max="999999" step="1" required')+
 labeledInput(t("Low-stock alert (0 = off)","Порог малого запаса (0 = выкл.)"),"lowStockAt",record.lowStockAt??0,'type="number" min="0" max="999999" step="1"')+
 labeledInput(t("Total amount on hand (optional)","Всего в наличии (необязательно)"),"amount",value("amount"),'maxlength="80"')+
 labeledInput(t("Date obtained","Дата покупки"),"obtained",value("obtained"),'type="date"')+
 labeledInput(t("Best by / expiry","Срок годности"),"expiry",value("expiry"),'type="date"')+'</div>';
 return header+
 (kitchen?storageFields(record):"")+
 (kitchen?'<p class="chef-source-note">'+t("For recipe quantity checks, enter 500 g total or 250 g per package, for example. A package count alone does not prove a usable amount.",
 "Для проверки количества в рецептах укажите, например, всего 500 г или 250 г на упаковку. Число упаковок само по себе не подтверждает количество продукта.")+"</p>":"")+
 (kitchen?labeledInput(t("Recipe ingredient (optional)","Ингредиент для рецептов (необязательно)"),"ingredient",value("ingredient"),'maxlength="140" class="chef-full"'):"")+
 (kitchen&&harvestChoices().length?'<label>'+t("Copy a recorded garden harvest (optional)","Перенести собранный урожай (необязательно)")+
  '<select name="harvestChoice"><option value="">'+t("Choose a harvest…","Выберите урожай…")+'</option>'+
  harvestChoices().map(h=>'<option value="'+esc(h.id)+'"'+(record.sourceHarvestId===h.id?" selected":"")+'>'+
  esc(h.name+" · "+h.date+" · "+h.amount+" "+h.unit)+'</option>').join("")+'</select></label>':"")+
 labeledInput(t("Storage notes","Примечания к хранению"),"notes",value("notes"),'maxlength="300" class="chef-full"')+
 '<label class="chef-check"><input type="checkbox" name="available"'+(record.available===false?"":" checked")+'>'+t("Available / on hand","В наличии")+'</label>'+
 '<div class="chef-store-buttons"><button class="chef-primary" type="submit">'+t(row?"Save changes":"Add item",row?"Сохранить":"Добавить товар")+'</button>'+
 (row?'<button type="button" data-chef-cancel>'+t("Cancel","Отмена")+'</button>':"")+'</div>'+
 '<p class="chef-form-status" role="status" data-chef-status="'+section+'"></p></form>';
}
function rowHtml(row,id){
 const flags=(id==="kitchen"?storageFlags(row):"")+(isLow(row)?'<span class="chef-stock-warning">'+t("Low stock","Мало запасов")+'</span>':"")+
  (expiryNotice(row.expiry)?'<span class="chef-expiry-warning">'+esc(expiryNotice(row.expiry))+'</span>':"");
 const description=[row.brand,row.size,row.amount,row.expiry?t("Best by","Срок")+": "+row.expiry:"",row.notes].filter(Boolean).map(esc).join(" · ");
 const storageDetails=id==="kitchen"?[
  row.storageSpot?t("Spot: ","Место: ")+row.storageSpot:"",
  row.storageTemp?t("Recorded: ","Измерено: ")+row.storageTemp+" °"+(row.storageTempUnit||"F"):"",
  row.storageHumidity!==""&&row.storageHumidity!=null?t("Humidity: ","Влажность: ")+row.storageHumidity+"%":"",
  row.storageChecked?t("Last checked: ","Последний осмотр: ")+row.storageChecked:"",
  row.storageCheckBy?t("Next check: ","Следующая проверка: ")+row.storageCheckBy:""
 ].filter(Boolean).map(esc).join(" · "):"";
 const allocatedNote=row.sourceHarvestAllocation===true?
  '<p class="chef-source-note">'+t("Linked garden harvest allocation. Edit the allocation in Garden Planner; manually changing quantities here prevents automatic reposting.", 
  "Связанное распределение урожая. Измените распределение в планировщике; ручная правка количества здесь блокирует повторный перенос.")+'</p>':"";
 const medicineInfo=id==="medicine"&&row.medicineInfo?.source==="openFDA NDC Directory"?row.medicineInfo:null;
 const officialUrl=String(medicineInfo?.labelUrl||"");
 const safeLink=/^https:\/\/dailymed\.nlm\.nih\.gov\/dailymed\/drugInfo\.cfm\?setid=[a-f0-9-]{36}$/i.test(officialUrl);
 const drugNote=medicineInfo?
  '<p class="chef-regulatory-note">'+t("FDA directory listing (not FDA approval)","Запись FDA (не означает одобрения FDA)")+
  (medicineInfo.ndc?" · NDC "+esc(medicineInfo.ndc):"")+
  (medicineInfo.ingredient?" · "+esc(medicineInfo.ingredient):"")+
  (safeLink?' · <a href="'+esc(officialUrl)+'" target="_blank" rel="noopener noreferrer">'+
   t("DailyMed label","Инструкция DailyMed")+'</a>':"")+'</p>':"";
 return '<article class="chef-store-item'+(row.available===false?" chef-unavailable":"")+'" data-chef-stock-item data-search="'+esc([row.name,row.brand,row.notes].join(" ").toLowerCase())+'">'+
 '<div><strong>'+esc(row.name)+'</strong><small>'+(id==="kitchen"?storageName(row.location)+" · ":"")+
 t("Packages","Упаковки")+': '+esc(row.packages??1)+' · '+(row.available!==false?t("On hand","В наличии"):t("Unavailable","Нет в наличии"))+'</small>'+
 (description?'<p>'+description+'</p>':"")+(storageDetails?'<p class="chef-storage-detail">'+storageDetails+'</p>':"")+allocatedNote+drugNote+flags+'</div>'+
 '<div class="chef-item-buttons"><button type="button" data-chef-qty="add" data-chef-id="'+esc(row.id)+'" aria-label="'+t("Add one package","Добавить одну упаковку")+'">+1</button>'+
 '<button type="button" data-chef-qty="use" data-chef-id="'+esc(row.id)+'"'+(Number(row.packages)<=0?' disabled':'')+' aria-label="'+t("Use one package","Израсходовать одну упаковку")+'">−1</button>'+
 (id==="kitchen"?'<button type="button" data-chef-inspect="'+esc(row.id)+'">'+t("Record check","Записать осмотр")+'</button>':"")+
 '<button type="button" data-chef-edit="'+esc(row.id)+'">'+t("Edit","Изменить")+'</button>'+
 '<button type="button" data-chef-remove="'+esc(row.id)+'">'+t("Remove","Удалить")+'</button></div></article>';
}
function applySearch(host,id){
 const query=searches[id].trim().toLowerCase();
 for(const item of host.querySelectorAll("[data-chef-stock-item]"))
  item.hidden=!item.dataset.search.includes(query);
}
function render(id){
 const store=stores.find(x=>x.id===id);if(!store)return;
 const host=$("#"+store.host);if(!host)return;
 const all=items(id),edit=all.find(row=>row.id===editing[id]);
 const shown=id==="kitchen"&&storageFilter.kitchen!=="all"?
  all.filter(row=>{
   const check=statusFor(row);
   return row.available!==false&&Number(row.packages??1)>0&&
    (storageFilter.kitchen==="due"?check.due:check.review);
  }):all;
 const desc=id==="kitchen"?
  t("One shared food inventory. Pantry and Root Cellar are storage locations, not separate tabs. Your existing records remain in their original locations.",
    "Единый учёт продуктов. Кладовая и погреб — места хранения, а не разные вкладки. Записи остаются на своих местах."):
  id==="medicine"?t("Medicine inventory only. Follow the package label; this is not medical advice.","Учёт лекарств. Следуйте указаниям на упаковке."):
  t("Household and personal-care supplies. These do not count as recipe ingredients.","Бытовые средства и товары для ухода. Они не учитываются в рецептах.");
 host.innerHTML='<p class="chef-store-intro">'+desc+'</p>'+
 '<div class="chef-store-count">'+t("Entries","Записи")+': <strong>'+all.length+'</strong> · '+
 t("On hand","В наличии")+': <strong>'+all.filter(x=>x.available!==false).length+'</strong> · '+
 t("Low stock","Мало запасов")+': <strong>'+all.filter(isLow).length+'</strong> · '+
 t("Expiry warnings","Сроки годности")+': <strong>'+all.filter(x=>expiryNotice(x.expiry)).length+'</strong></div>'+
 (id==="kitchen"?storageOverview(all):"")+
 '<label class="chef-inventory-search">'+t("Search inventory","Поиск в запасах")+
 '<input type="search" data-chef-search value="'+esc(searches[id])+'" placeholder="'+t("Find product or brand…","Найти товар или марку…")+'"></label>'+
 '<div class="chef-store-list">'+(shown.length?shown.map(row=>rowHtml(row,id)).join(""):
 '<p class="chef-empty">'+(all.length?
 t("No food matches the selected filter.","Нет продуктов по выбранному фильтру."):
 t("No items recorded. Use the scanner above or add items manually.","Нет записей. Используйте сканер вверху или добавьте товар вручную."))+'</p>')+'</div>'+
 '<h3 class="chef-store-heading">'+t(edit?"Edit inventory item":"Add inventory item",edit?"Изменить товар":"Добавить товар")+'</h3>'+
 formHtml(id,edit)+
 '<p class="chef-source-note">'+t("Barcodes are read only by the single Product Scanner above; there is no camera or barcode form here.","Штрихкоды считываются только одним сканером вверху. В этой форме нет камеры или поля штрихкода.")+'</p>';
 if(messages[id])host.querySelector("[data-chef-status]").textContent=messages[id];
 applySearch(host,id);
}
function renderAll(){for(const store of stores)render(store.id);}
function status(id,message){
 messages[id]=message;
 const node=$('[data-chef-status="'+id+'"]');if(node)node.textContent=message;
}
for(const store of stores){
 const host=$("#"+store.host);if(!host)continue;
 const id=store.id;
 host.addEventListener("input",event=>{
  if(!event.target.matches?.("[data-chef-search]"))return;
  searches[id]=event.target.value;applySearch(host,id);
 });
 host.addEventListener("click",event=>{
  const filter=event.target.closest?.("[data-chef-storage-filter]");
  if(filter&&id==="kitchen"){
   const name=filter.dataset.chefStorageFilter;
   if(["all","due","review"].includes(name))storageFilter.kitchen=name;
   render(id);return;
  }
  const inspect=event.target.closest?.("[data-chef-inspect]");
  if(inspect&&id==="kitchen"){
   storageFilter.kitchen="all";editing[id]=inspect.dataset.chefInspect;render(id);
   const form=host.querySelector("[data-chef-form]");
   if(form?.elements?.storageChecked)
    form.elements.storageChecked.value=window.DKChefStorageChecks?.today()||new Date().toISOString().slice(0,10);
   form?.scrollIntoView?.({block:"nearest",behavior:"smooth"});
   return;
  }
  const step=event.target.closest?.("[data-chef-qty]");
  if(step){
   const row=items(id).find(item=>item.id===step.dataset.chefId);
   if(!row)return;
   const delta=step.dataset.chefQty==="add"?1:-1;
   const packages=Math.max(0,Math.min(999999,Number(row.packages??0)+delta));
   if(!api.saveProvision({...row,packages,available:packages>0}))status(id,t("Could not update stock.","Не удалось изменить запас."));
   return;
  }
  const edit=event.target.closest?.("[data-chef-edit]");
  if(edit){editing[id]=edit.dataset.chefEdit;render(id);return;}
  const remove=event.target.closest?.("[data-chef-remove]");
  if(remove){
   if(!confirm(t("Remove this item?","Удалить товар?")))return;
   if(!api.removeProvision(remove.dataset.chefRemove))status(id,t("Could not remove item.","Не удалось удалить товар."));
   else {editing[id]="";messages[id]="";renderAll();}
   return;
  }
  if(event.target.closest?.("[data-chef-cancel]")){editing[id]="";render(id);}
 });
 host.addEventListener("change",event=>{
  if(event.target.name!=="harvestChoice")return;
  const h=harvestChoices().find(x=>x.id===event.target.value),form=event.target.form;
  if(!h||!form)return;
  form.elements.name.value=h.name;
  form.elements.obtained.value=h.date;
  form.elements.amount.value=String(h.amount)+" "+String(h.unit);
  form.elements.ingredient.value=h.name;
  form.elements.location.value="cellar";
  status(id,t("Harvest details copied. Save to add to Root Cellar; the harvest record is not deducted.",
    "Данные урожая перенесены. Сохраните в погреб; количество урожая не изменится."));
 });
 host.addEventListener("submit",event=>{
  if(!event.target.matches?.("[data-chef-form]"))return;
  event.preventDefault();
  const form=event.target,value=Object.fromEntries(new FormData(form).entries());
  value.location=id==="kitchen"?(value.location==="cellar"?"cellar":"pantry"):id;
  value.available=form.elements.available.checked;
  const original=api.provisions().items.find(row=>row.id===value.id);
  // No barcode field here: preserve scanned identity through the stored row.
  if(original)value.barcode=original.barcode||"";
  value.sourceHarvestId=value.harvestChoice||original?.sourceHarvestId||"";
  if(!api.saveProvision(value)){status(id,t("Check name, quantity and dates. Nothing was saved.","Проверьте название, количество и даты. Ничего не сохранено."));return;}
  editing[id]="";messages[id]=t("Inventory saved.","Запасы сохранены.");renderAll();
 });
}
document.addEventListener("dkchef:provisions-changed",renderAll);
document.getElementById("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(renderAll));
renderAll();
})();
