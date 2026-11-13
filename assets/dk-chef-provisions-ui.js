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
 return (workbench.harvests||[]).filter(h=>h?.id&&h.seedKey).slice(-100).reverse().map(h=>({
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
 const flags=(isLow(row)?'<span class="chef-stock-warning">'+t("Low stock","Мало запасов")+'</span>':"")+
  (expiryNotice(row.expiry)?'<span class="chef-expiry-warning">'+esc(expiryNotice(row.expiry))+'</span>':"");
 const description=[row.brand,row.size,row.amount,row.expiry?t("Best by","Срок")+": "+row.expiry:"",row.notes].filter(Boolean).map(esc).join(" · ");
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
 (description?'<p>'+description+'</p>':"")+drugNote+flags+'</div>'+
 '<div class="chef-item-buttons"><button type="button" data-chef-qty="add" data-chef-id="'+esc(row.id)+'" aria-label="'+t("Add one package","Добавить одну упаковку")+'">+1</button>'+
 '<button type="button" data-chef-qty="use" data-chef-id="'+esc(row.id)+'"'+(Number(row.packages)<=0?' disabled':'')+' aria-label="'+t("Use one package","Израсходовать одну упаковку")+'">−1</button>'+
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
 '<label class="chef-inventory-search">'+t("Search inventory","Поиск в запасах")+
 '<input type="search" data-chef-search value="'+esc(searches[id])+'" placeholder="'+t("Find product or brand…","Найти товар или марку…")+'"></label>'+
 '<div class="chef-store-list">'+(all.length?all.map(row=>rowHtml(row,id)).join(""):
 '<p class="chef-empty">'+t("No items recorded. Use the scanner above or add items manually.","Нет записей. Используйте сканер вверху или добавьте товар вручную.")+'</p>')+'</div>'+
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
