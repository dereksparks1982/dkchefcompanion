/* DK Chef Companion: local-first shared Pantry and Root Cellar UI.
   Stock records stay within the already backed-up recipeGuide section. */
(function(){
"use strict";
const api=window.DKSeedBankRecipes;
if(!api)return;
const stores=[
 {id:"pantry",host:"chefPantryApp",ru:"Кладовая",en:"Pantry"},
 {id:"cellar",host:"chefCellarApp",ru:"Погреб",en:"Root Cellar"},
 {id:"medicine",host:"chefMedicineApp",ru:"Аптечка",en:"Medicine Cabinet"},
 {id:"household",host:"chefHouseholdApp",ru:"Бытовые запасы",en:"Household Supplies"}
];
const edits={pantry:"",cellar:"",medicine:"",household:""},messages={pantry:"",cellar:"",medicine:"",household:""};
const $=(s,root=document)=>root.querySelector(s);
const ru=()=>document.documentElement.lang==="ru";
const t=(en,russian)=>ru()?russian:en;
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

function items(location){return api.provisions().items.filter(x=>x.location===location)
 .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));}
function harvestChoices(){
 const workbench=window.DKSeedBankWorkbench?.exportData?.()||{};
 const plants=window.DKSeedBankCore?.plants?.();
 return (workbench.harvests||[]).filter(h=>h&&h.id&&h.seedKey).slice(-100).reverse().map(h=>{
  const crop=plants?.get(h.seedKey)?.name||String(h.seedKey).split("|").pop();
  return {id:h.id,name:crop,date:h.date||"",amount:h.amount||"",unit:h.unit||""};
 });
}
function createForm(location,editing){
 const row=editing||{};
 const show=field=>esc(row[field]??"");
 const harvest=location==="cellar"?harvestChoices():[];
 return '<form class="chef-store-form" data-chef-form="'+location+'">'+
 '<input type="hidden" name="id" value="'+show("id")+'">'+
 '<div class="chef-store-grid">'+
 '<label>'+t("Food or ingredient","Продукт или ингредиент")+'<input name="name" maxlength="140" required value="'+show("name")+'" placeholder="'+t("Olive oil, flour, potatoes…","Оливковое масло, мука, картофель…")+'"></label>'+
 '<label>'+t("Barcode (optional)","Штрихкод (необязательно)")+'<input name="barcode" type="text" inputmode="numeric" maxlength="14" pattern="[0-9]{8,14}" value="'+show("barcode")+'" placeholder="UPC / EAN"></label>'+
 '</div>'+
 '<div class="chef-store-grid">'+
 '<label>'+t("Recognize as ingredient (optional)","Ингредиент для рецептов (необязательно)")+'<input name="ingredient" maxlength="140" value="'+show("ingredient")+'" placeholder="'+t("Olive oil, salt, flour…","Оливковое масло, соль, мука…")+'"></label>'+
 '<label>'+t("Brand (optional)","Марка (необязательно)")+'<input name="brand" maxlength="100" value="'+show("brand")+'"></label>'+
 '<label>'+t("Package size (optional)","Размер упаковки (необязательно)")+'<input name="size" maxlength="80" value="'+show("size")+'" placeholder="'+t("28 oz can, 2 lb bag…","Банка 800 г, мешок 1 кг…")+'"></label>'+
 '<label>'+t("Number of packages","Количество упаковок")+'<input name="packages" type="number" min="1" max="999999" step="1" value="'+esc(row.packages||1)+'" required></label>'+
 '<label>'+t("Amount (optional, free text)","Количество (необязательно)")+'<input name="amount" maxlength="80" value="'+show("amount")+'" placeholder="'+t("3 kg, half a jar…","3 кг, половина банки…")+'"></label>'+
 '<label>'+t("Added or harvested (optional)","Дата добавления или сбора (необязательно)")+'<input name="obtained" type="date" value="'+show("obtained")+'"></label>'+
 '<label>'+t("Best by (optional)","Срок годности (необязательно)")+'<input name="expiry" type="date" value="'+show("expiry")+'"></label>'+
 '</div>'+
 (location==="cellar"&&harvest.length?'<label class="chef-full">'+t("Copy details from a recorded harvest (optional)","Взять сведения из записи об урожае (необязательно)")+
 '<select name="harvestChoice"><option value="">'+t("Choose a harvest…","Выберите урожай…")+'</option>'+
 harvest.map(x=>'<option value="'+esc(x.id)+'"'+(row.sourceHarvestId===x.id?" selected":"")+'>'+esc(x.name+" · "+x.date+" · "+x.amount+" "+x.unit)+'</option>').join("")+'</select></label>':'')+
 '<label class="chef-full">'+t("Storage notes (optional)","Примечания к хранению (необязательно)")+'<input name="notes" maxlength="300" value="'+show("notes")+'" placeholder="'+t("Shelf, crate, cool dry room…","Полка, ящик, прохладное сухое помещение…")+'"></label>'+
 '<label class="chef-check"><input type="checkbox" name="available"'+(row.available===false?"":" checked")+'>'+t("I have this food available","Этот продукт есть в наличии")+'</label>'+
 '<div class="chef-store-buttons"><button class="chef-primary" type="submit">'+t(editing?"Save changes":"Add to inventory",editing?"Сохранить изменения":"Добавить в запасы")+'</button>'+
 (editing?'<button type="button" data-chef-cancel="'+location+'">'+t("Cancel edit","Отменить")+'</button>':"")+'</div>'+
 '<p class="chef-form-status" data-chef-status="'+location+'" role="status"></p></form>';
}
function render(location){
 const host=$("#"+stores.find(x=>x.id===location)?.host);if(!host)return;
 const rows=items(location),editing=rows.find(row=>row.id===edits[location]);
 host.innerHTML='<div class="chef-store-intro">'+
 (location==="pantry"?t("Store packaged foods, flour, spices, oils and kitchen staples. Available ingredients count for recipes.","Храните упакованные продукты, муку, специи и масло. Доступные ингредиенты учитываются в рецептах."):
 location==="cellar"?t("Track potatoes, onions, garlic, harvests and preserves stored in suitable conditions.","Учитывайте картофель, лук, чеснок, урожай и заготовки при подходящих условиях хранения."):
 location==="medicine"?t("Track medicines and first-aid supplies. Always follow the package label.","Учитывайте лекарства и аптечку. Следуйте указаниям на упаковке."):
 t("Track toiletries, cleaning products and household supplies. These are not recipe ingredients.","Учитывайте средства гигиены, уборки и хозяйственные товары. Это не ингредиенты для рецептов."))+
 '</div><p class="chef-store-note">'+t("Inventory is optional. Only Pantry and Root Cellar food can count toward recipes; stock is never automatically consumed.","Учёт запасов добровольный. Только продукты кладовой и погреба могут учитываться в рецептах; запасы не списываются автоматически.")+'</p>'+
 '<div class="chef-store-count">'+t("Entries","Записи")+': <strong>'+rows.length+'</strong> · '+t("Available","В наличии")+': <strong>'+rows.filter(x=>x.available!==false).length+'</strong></div>'+
 '<div class="chef-store-list">'+(rows.length?rows.map(row=>{
  const detail=[row.brand,row.size,row.amount,row.barcode?"#"+row.barcode:"",row.expiry?t("Best by","Срок")+": "+row.expiry:"",row.notes].filter(Boolean).map(esc).join(" · ");
  return '<article class="chef-store-item'+(row.available===false?" chef-unavailable":"")+'"><div><strong>'+esc(row.name)+'</strong>'+
   '<small>'+t("Packages","Упаковки")+': '+esc(row.packages||1)+' · '+(row.available===false?t("Not available","Нет в наличии"):t("On hand","В наличии"))+'</small>'+
   (detail?'<p>'+detail+'</p>':"")+'</div><div class="chef-item-buttons"><button type="button" data-chef-edit="'+esc(row.id)+'" data-location="'+location+'">'+t("Edit","Изменить")+'</button>'+
   '<button type="button" data-chef-remove="'+esc(row.id)+'" data-location="'+location+'">'+t("Remove","Удалить")+'</button></div></article>';
 }).join(""):'<p class="chef-empty">'+t("Nothing recorded yet. Add foods manually or scan a product barcode.","Пока нет записей. Добавьте продукты вручную или отсканируйте штрихкод.")+'</p>')+'</div>'+
 '<h3 class="chef-store-heading">'+t(editing?"Edit food":"Add food",editing?"Изменить продукт":"Добавить продукт")+'</h3>'+
 createForm(location,editing)+
 '<p class="chef-source-note">'+t("Use the Product Scanner near the top to identify barcodes and add items here, or enter your records manually.","Используйте сканер товаров вверху страницы для распознавания штрихкодов и добавления товаров сюда. Или вводите записи вручную.")+'</p>';
 if(messages[location])host.querySelector("[data-chef-status]").textContent=messages[location];
}
function renderAll(){for(const store of stores)render(store.id);}
function status(location,message){
 messages[location]=message;
 const node=$('[data-chef-status="'+location+'"]');if(node)node.textContent=message;
}
for(const store of stores){
 const host=$("#"+store.host);if(!host)continue;
 host.addEventListener("click",event=>{
  const edit=event.target.closest("[data-chef-edit]");
  if(edit){edits[store.id]=edit.dataset.chefEdit;render(store.id);return;}
  const remove=event.target.closest("[data-chef-remove]");
  if(remove){
   if(!confirm(t("Remove this food record?","Удалить эту запись о продукте?")))return;
   if(!api.removeProvision(remove.dataset.chefRemove))status(store.id,t("Unable to remove record.","Не удалось удалить запись."));
   else{edits[store.id]="";messages[store.id]="";renderAll();}return;
  }
  if(event.target.closest("[data-chef-cancel]")){edits[store.id]="";render(store.id);return;}

 });
 host.addEventListener("change",event=>{
  if(event.target.name!=="harvestChoice")return;
  const h=harvestChoices().find(x=>x.id===event.target.value);
  const form=event.target.form;if(!h||!form)return;
  form.elements.name.value=h.name;
  form.elements.obtained.value=h.date;
  form.elements.amount.value=String(h.amount)+" "+String(h.unit);
  form.elements.ingredient.value=h.name;
  status(store.id,t("Harvest details copied. Save to record storage; this will not subtract from the harvest.","Сведения об урожае скопированы. Сохраните запись; это не уменьшит урожай автоматически."));
 });
 host.addEventListener("submit",event=>{
  if(!event.target.matches("[data-chef-form]"))return;
  event.preventDefault();
  const form=event.target,d=new FormData(form),location=store.id;
  const value=Object.fromEntries(d.entries());
  value.location=location;value.available=form.elements.available.checked;
  const existing=api.provisions().items.find(x=>x.id===value.id);
  value.sourceHarvestId=value.harvestChoice||existing?.sourceHarvestId||"";
  if(!api.saveProvision(value)){status(location,t("Check the name, quantity and barcode; the record was not saved.","Проверьте название, количество и штрихкод; запись не сохранена."));return;}
  edits[location]="";messages[location]=t("Food inventory saved.","Запасы сохранены.");renderAll();
 });

}
document.addEventListener("dkchef:provisions-changed",renderAll);
document.getElementById("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(renderAll));
renderAll();
})();