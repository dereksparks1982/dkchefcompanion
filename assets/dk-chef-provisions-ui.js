/* DK Chef Companion: local-first shared Pantry and Root Cellar UI.
   Stock records stay within the already backed-up recipeGuide section. */
(function(){
"use strict";
const api=window.DKSeedBankRecipes;
if(!api)return;
const stores=[
 {id:"pantry",host:"chefPantryApp",ru:"Кладовая",en:"Pantry"},
 {id:"cellar",host:"chefCellarApp",ru:"Погреб",en:"Root Cellar"}
];
const edits={pantry:"",cellar:""},messages={pantry:"",cellar:""};
const $=(s,root=document)=>root.querySelector(s);
const ru=()=>document.documentElement.lang==="ru";
const t=(en,russian)=>ru()?russian:en;
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
let scanner=null;
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
 '<div class="chef-barcode-actions"><button type="button" data-chef-lookup="'+location+'">'+t("Identify barcode","Найти по штрихкоду")+'</button> '+
 '<button type="button" data-chef-scan="'+location+'">'+t("Scan with camera","Сканировать камерой")+'</button></div>'+
 '<div class="chef-camera" data-chef-camera="'+location+'" hidden><div class="chef-scan-reader" id="chef-scan-reader-'+location+'"></div><label class="chef-camera-picker" hidden>'+t("Camera","Камера")+'<select data-chef-cameras="'+location+'"><option value="">'+t("Automatic","Автоматически")+'</option></select></label><p class="chef-camera-help">'+t("Keep the entire barcode in view, with bright light and sharp focus.","Держите весь штрихкод в кадре при хорошем освещении и чёткой фокусировке.")+'</p><button type="button" data-chef-stop="'+location+'">'+t("Stop camera","Остановить камеру")+'</button></div>'+
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
 '<p class="chef-form-status" data-chef-status="'+location+'" role="status"></p>'+
 '<div class="chef-product-result" data-chef-product="'+location+'" hidden role="status"></div></form>';
}
function render(location){
 const host=$("#"+stores.find(x=>x.id===location)?.host);if(!host)return;
 // A background stock update must not destroy the live video element.
 if(scanner?.location===location)return;
 const rows=items(location),editing=rows.find(row=>row.id===edits[location]);
 host.innerHTML='<div class="chef-store-intro">'+
 (location==="pantry"?t("Track flour, spices, oils, pasta, canned goods and other kitchen supplies. One available ingredient is recognized by every recipe.","Учитывайте муку, специи, масло, макароны, консервы и другие кухонные продукты. Доступный ингредиент распознаётся во всех рецептах."):
 t("Track potatoes, onions, garlic, winter squash, apples and appropriately stored preserves. Choose the actual storage conditions for each food.","Учитывайте картофель, лук, чеснок, зимние тыквы, яблоки и правильно хранящиеся заготовки. Для каждого продукта соблюдайте подходящие условия хранения."))+
 '</div><p class="chef-store-note">'+t("Stock is optional and shared across recipes. Having seeds does not mean you have edible produce. Quantities are not automatically deducted when you read a recipe.","Учёт запасов добровольный и общий для всех рецептов. Наличие семян не означает наличия готовых продуктов. Количество не списывается при просмотре рецепта.")+'</p>'+
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
 '<p class="chef-source-note">'+t("Barcode lookup needs internet and checks Open Food Facts, Open Products Facts and UPCitemdb (rate-limited). Only the barcode is sent for identification; your inventory stays local and in your own backups. Results may be incomplete or wrong. Live camera scanning uses Quagga2 on this device. Point at a grocery barcode for automatic reading. Scanning works offline; product lookup needs internet. Camera permission and a connected webcam are required.","Поиск штрихкода требует интернета и использует Open Food Facts, Open Products Facts и UPCitemdb (с ограничением запросов). Передаётся только штрихкод; ваши запасы остаются локальными и в ваших резервных копиях. Результаты могут быть неполными или ошибочными. Камера использует локальный сканер Quagga2. Просто наведите её на штрихкод продукта. Считывание работает без интернета; поиск товара требует интернет. Для камеры нужны разрешение и подключённая веб-камера.")+
 ' <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">Open Food Facts</a> (ODbL).</p>';
 if(messages[location])host.querySelector("[data-chef-status]").textContent=messages[location];
}
function renderAll(){render("pantry");render("cellar");}
function status(location,message){
 messages[location]=message;
 const node=$('[data-chef-status="'+location+'"]');if(node)node.textContent=message;
}
function productResult(location,product){
 const node=$('[data-chef-product="'+location+'"]');
 if(!node)return;
 if(!product){node.hidden=true;node.innerHTML="";return;}
 const kind=product.category==="food"?t("Food","Продукты"):t("General product","Другой товар");
 node.hidden=false;
 node.innerHTML='<strong>'+esc(product.name)+'</strong>'+
  '<div>'+[product.brand,product.size].filter(Boolean).map(esc).join(" · ")+'</div>'+
  '<small>'+esc(kind)+' · '+esc(t("Source: ","Источник: ")+product.source)+'</small>';
}
async function identify(location){
 const form=$('[data-chef-form="'+location+'"]');if(!form)return;
 const code=String(form.elements.barcode.value||"").trim();
 productResult(location,null);
 if(!/^\d{8,14}$/.test(code)){
  status(location,t("Enter an 8–14 digit product barcode.","Введите штрихкод из 8–14 цифр."));
  return;
 }
 const previous=api.provisions().items.find(row=>row.barcode===code);
 if(previous){
  for(const field of ["name","brand","size"])
   if(!form.elements[field].value)form.elements[field].value=previous[field]||"";
  if(!form.elements.ingredient.value)form.elements.ingredient.value=previous.ingredient||"";
  productResult(location,{name:previous.name,brand:previous.brand,size:previous.size,
   category:"general",source:t("Your inventory","Ваши запасы")});
  status(location,t("Product found in your inventory. Confirm and save.","Товар найден в ваших запасах. Проверьте и сохраните."));
  return;
 }
 if(!window.DKChefProductLookup){
  status(location,t("Product lookup module did not load. Reload the app.","Модуль поиска товаров не загрузился. Обновите приложение."));
  return;
 }
 status(location,t("Barcode scanned: ","Штрихкод считан: ")+code+" · "+
  t("Searching product databases…","Поиск по базам товаров…"));
 try{
  const found=await window.DKChefProductLookup.lookup(code);
  if(form.elements.barcode.value.trim()!==code)return;
  if(!found.found){
   const unavailable=found.reason==="unavailable";
   const limited=found.reason==="rate-limited";
   status(location,limited?
    t("Product database rate limit reached. Barcode was saved in the field; enter product details manually.","Превышен лимит запросов. Штрихкод сохранён; введите данные товара вручную."):
    unavailable?
    t("Product databases could not be reached. Check internet connection or enter product details manually.","Базы товаров недоступны. Проверьте интернет или введите сведения вручную."):
    t("Barcode read, but this item isn't listed in the available databases. Enter details manually.","Штрихкод считан, но товар не найден в доступных базах. Введите данные вручную."));
   return;
  }
  form.elements.name.value=found.name;
  form.elements.brand.value=found.brand||"";
  form.elements.size.value=found.size||"";
  // General products, including medicines, are not guessed to be recipe ingredients.
  productResult(location,found);
  status(location,t("Product identified. Check the details, then add it to your inventory.","Товар найден. Проверьте сведения и добавьте в запасы."));
 }catch(error){
  status(location,t("Product lookup failed. The scanned barcode remains available for manual entry.","Не удалось найти товар. Штрихкод сохранён для ручного ввода."));
 }
}
// Quagga2 owns the live camera. Stop only after a valid barcode or an explicit exit.
let scanGeneration=0;
function stopScan(){
 ++scanGeneration;
 const previous=scanner;scanner=null;
 if(previous){
  const area=$('[data-chef-camera="'+previous.location+'"]');
  if(area)area.hidden=true;
 }
 return window.DKChefBarcodeScanner?.stop()||Promise.resolve();
}
function describeCameraError(error){
 const name=String(error?.name||"");
 if(/NotAllowed|PermissionDenied|Security/.test(name))
  return t("Camera permission blocked. Allow access in your browser's site permissions.","Доступ к камере заблокирован. Разрешите его в настройках сайта.");
 if(/NotFound|DevicesNotFound/.test(name))
  return t("No webcam was found. Connect a camera or enter the barcode manually.","Камера не найдена. Подключите её или введите штрихкод вручную.");
 if(/NotReadable|TrackStart/.test(name))
  return t("Camera is unavailable or already used by another app. Close the other app and retry.","Камера недоступна или занята другим приложением. Закройте его и повторите попытку.");
 if(/Overconstrained/.test(name))
  return t("That camera cannot use the requested settings. Select Automatic or another camera.","Эта камера не поддерживает выбранные параметры. Выберите автоматический режим или другую камеру.");
 if(/NotSupported/.test(name))
  return t("This browser cannot access the camera. Enter the barcode manually.","Этот браузер не поддерживает доступ к камере. Введите штрихкод вручную.");
 return t("Could not start barcode camera: ","Не удалось включить сканер: ")+String(error?.message||error||"Unknown error").slice(0,160);
}
function showCameraChoices(location,cameras,defaultDeviceId=""){
 const picker=$('[data-chef-cameras="'+location+'"]');
 if(!picker)return;
 const selected=picker.value;
 picker.innerHTML='<option value="">'+t("Automatic","Автоматически")+'</option>'+
  cameras.map(x=>'<option value="'+esc(x.deviceId)+'">'+esc(x.label)+'</option>').join("");
 picker.parentElement.hidden=cameras.length===0;
 if(cameras.some(x=>x.deviceId===(selected||defaultDeviceId)))picker.value=selected||defaultDeviceId;
}
async function startScan(location,deviceId="",recovery=0){
 const decoder=window.DKChefBarcodeScanner;
 if(!decoder){
  status(location,t("Barcode decoder is not loaded. Reload this page or enter the number manually.","Сканер не загружен. Обновите страницу или введите номер вручную."));return;
 }
 const token=++scanGeneration;
 const prev=scanner;scanner=null;
 if(prev){
  const old=$('[data-chef-camera="'+prev.location+'"]');if(old)old.hidden=true;
 }
 await decoder.stop();
 if(token!==scanGeneration)return;
 const area=$('[data-chef-camera="'+location+'"]');
 const target=$('#chef-scan-reader-'+location);
 if(!area||!target)return;
 area.hidden=false;scanner={location,token};
 status(location,t("Opening camera… Check browser permissions if asked.","Открытие камеры… Разрешите доступ в браузере."));
 try{
  await decoder.start({
   target,deviceId,
   onCode:code=>{
    if(scanner?.token!==token)return;
    const form=$('[data-chef-form="'+location+'"]');
    if(!form)return;
    form.elements.barcode.value=code;
    status(location,t("Barcode recognized: ","Штрихкод распознан: ")+code);
    void stopScan().then(()=>identify(location));
   },
   onProgress:stage=>{
    if(scanner?.token!==token)return;
    const messages={
     live:t("Quagga2 is reading the camera. Point at a UPC/EAN barcode.","Quagga2 считывает изображение с камеры. Наведите на штрихкод UPC/EAN."),
     waiting:t("Waiting for camera picture… Check camera permissions and device selection.","Ожидание видео с камеры… Проверьте разрешения и выбранную камеру."),
     searching:t("Reading barcode… Hold the lines steady in good light.","Считывание штрихкода… Держите его ровно при хорошем освещении."),
     hint:t("Still scanning. Move closer, improve the light, and keep the barcode steady.","Сканирование продолжается. Поднесите штрихкод ближе, улучшите освещение и держите ровно."),
     disconnected:t("Camera disconnected. Choose another camera.","Камера отключена. Выберите другую камеру.")
    };
    status(location,messages[stage]||messages.searching);
    if(stage==="disconnected"&&recovery===0){
     // Recover once if Firefox or a Surface camera track ends unexpectedly.
     status(location,t("Camera connection dropped. Retrying the same camera once…","Камера отключилась. Повторное подключение…"));
     void startScan(location,deviceId,1);
    }
   },
   onCameras:(cameras,chosen)=>{
    if(scanner?.token===token)showCameraChoices(location,cameras,chosen);
   }
  });
  // The upstream Quagga2 onProcessed callback confirms live decoding.
 }catch(error){
  if(token!==scanGeneration)return;
  await stopScan();
  status(location,describeCameraError(error));
 }
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
  if(event.target.closest("[data-chef-lookup]")){identify(store.id);return;}
  if(event.target.closest("[data-chef-scan]")){void startScan(store.id);return;}
  if(event.target.closest("[data-chef-stop]")){void stopScan().then(()=>status(store.id,t("Camera stopped.","Камера остановлена.")));return;}
 });
 host.addEventListener("change",event=>{
  if(event.target.matches?.("[data-chef-cameras]")){
   void startScan(store.id,event.target.value);return;
  }
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
  event.preventDefault();stopScan();
  const form=event.target,d=new FormData(form),location=store.id;
  const value=Object.fromEntries(d.entries());
  value.location=location;value.available=form.elements.available.checked;
  const existing=api.provisions().items.find(x=>x.id===value.id);
  value.sourceHarvestId=value.harvestChoice||existing?.sourceHarvestId||"";
  if(!api.saveProvision(value)){status(location,t("Check the name, quantity and barcode; the record was not saved.","Проверьте название, количество и штрихкод; запись не сохранена."));return;}
  edits[location]="";messages[location]=t("Food inventory saved.","Запасы сохранены.");renderAll();
 });
 const section=document.getElementById(store.id==="pantry"?"dkPantry":"dkRootCellar");
 section?.addEventListener("toggle",event=>{
  // Ignore toggle events from any child disclosures.
  if(event.target!==section)return;
  if(!section.open&&scanner?.location===store.id)void stopScan();
 });
}
document.addEventListener("dkchef:provisions-changed",renderAll);
document.getElementById("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(renderAll));
window.addEventListener?.("pagehide",stopScan);
renderAll();
})();