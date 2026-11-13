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
 '<p class="chef-form-status" data-chef-status="'+location+'" role="status"></p></form>';
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
 '<p class="chef-source-note">'+t("Barcode lookup needs internet and uses Open Food Facts. Only the barcode is sent for identification; your inventory stays local and in your own backups. Results may be incomplete or wrong. Live camera scanning uses Quagga2 on this device. Point at a grocery barcode for automatic reading. Scanning works offline; product lookup needs internet. Camera permission and a connected webcam are required.","Поиск штрихкода требует интернета и использует Open Food Facts. Передаётся только штрихкод; ваши запасы остаются локальными и в ваших резервных копиях. Результаты могут быть неполными или ошибочными. Камера использует локальный сканер Quagga2. Просто наведите её на штрихкод продукта. Считывание работает без интернета; поиск товара требует интернет. Для камеры нужны разрешение и подключённая веб-камера.")+
 ' <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">Open Food Facts</a> (ODbL).</p>';
 if(messages[location])host.querySelector("[data-chef-status]").textContent=messages[location];
}
function renderAll(){render("pantry");render("cellar");}
function status(location,message){
 messages[location]=message;
 const node=$('[data-chef-status="'+location+'"]');if(node)node.textContent=message;
}
async function identify(location){
 const form=$('[data-chef-form="'+location+'"]');if(!form)return;
 const code=String(form.elements.barcode.value||"").trim();
 if(!/^\d{8,14}$/.test(code)){status(location,t("Enter an 8–14 digit product barcode.","Введите штрихкод из 8–14 цифр."));return;}
 const previous=api.provisions().items.find(row=>row.barcode===code);
 if(previous){
  for(const name of ["name","brand","size"])if(!form.elements[name].value)form.elements[name].value=previous[name]||"";
  if(!form.elements.ingredient.value)form.elements.ingredient.value=previous.ingredient||"";
  status(location,t("Previously scanned product found in your records. Confirm details and save.","Продукт найден в ваших записях. Проверьте данные и сохраните."));
  return;
 }
 status(location,t("Looking up the barcode…","Поиск по штрихкоду…"));
 try{
  const endpoint="https://world.openfoodfacts.org/api/v3/product/"+encodeURIComponent(code)+"?fields=code,product_name,brands,quantity,categories_tags";
  const response=await fetch(endpoint,{headers:{Accept:"application/json"}});
  if(!response.ok)throw Error("Lookup unavailable");
  const data=await response.json(),p=data?.product;
  if(!p||!(p.product_name||p.product_name_en||p.generic_name)){
   status(location,t("Not found. Enter the product manually and save it.","Не найдено. Введите сведения о продукте вручную и сохраните."));return;
  }
  form.elements.name.value=String(p.product_name||p.product_name_en||p.generic_name).slice(0,140);
  form.elements.brand.value=String(p.brands||"").slice(0,100);
  form.elements.size.value=String(p.quantity||"").slice(0,80);
  // A barcode identifies a branded product. Let users correct the generic ingredient
  // so recipe matching never guesses from brand names alone.
  const tags=Array.isArray(p.categories_tags)?p.categories_tags:[];
  const known=[["en:olive-oils","Olive oil"],["en:table-salts","Salt"],["en:salt","Salt"],
   ["en:flours","All-purpose flour"],["en:pastas","Pasta"],["en:rice","Rice"]];
  const guess=known.find(x=>tags.includes(x[0]));
  if(guess&&!form.elements.ingredient.value)form.elements.ingredient.value=guess[1];
  status(location,t("Product found. Verify the name and package size, then add it.","Продукт найден. Проверьте название и размер упаковки, затем добавьте."));
 }catch(error){status(location,t("Product lookup unavailable. You can still enter it manually.","Поиск недоступен. Продукт можно добавить вручную."));}
}
// One scanner at a time; the decoder and camera tracks are released on exit.
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
function showCameraChoices(location,cameras){
 const picker=$('[data-chef-cameras="'+location+'"]');
 if(!picker)return;
 const selected=picker.value;
 picker.innerHTML='<option value="">'+t("Automatic","Автоматически")+'</option>'+
  cameras.map(x=>'<option value="'+esc(x.deviceId)+'">'+esc(x.label)+'</option>').join("");
 picker.parentElement.hidden=cameras.length===0;
 if(cameras.some(x=>x.deviceId===selected))picker.value=selected;
}
async function startScan(location,deviceId=""){
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
     live:t("Camera is live. Point at a UPC or EAN barcode.","Камера работает. Наведите на штрихкод UPC или EAN."),
     waiting:t("Waiting for camera picture… Check camera permissions and device selection.","Ожидание видео с камеры… Проверьте разрешения и выбранную камеру."),
     searching:t("Reading barcode… Hold the lines steady in good light.","Считывание штрихкода… Держите его ровно при хорошем освещении."),
     hint:t("Still scanning. Move closer, improve the light, and keep the barcode steady.","Сканирование продолжается. Поднесите штрихкод ближе, улучшите освещение и держите ровно."),
     "decoder-error":t("Barcode decoding is having trouble. Hold it sharp and well lit.","Сканеру сложно распознать изображение. Проверьте чёткость и освещение."),
     "frame-error":t("Camera frames are unavailable. Try another camera.","Изображение с камеры недоступно. Выберите другую камеру."),
     "play-error":t("Camera video could not play. Check browser permissions.","Не удалось воспроизвести видео. Проверьте разрешение камеры."),
     disconnected:t("Camera disconnected. Choose another camera.","Камера отключена. Выберите другую камеру.")
    };
    status(location,messages[stage]||messages.searching);
   },
   onCameras:cameras=>{
    if(scanner?.token===token)showCameraChoices(location,cameras);
   }
  });
  // The live callback confirms that actual camera frames are arriving.
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
 document.getElementById(store.id==="pantry"?"dkPantry":"dkRootCellar")?.addEventListener("toggle",event=>{
  if(!event.target.open&&scanner?.location===store.id)stopScan();
 });
}
document.addEventListener("dkchef:provisions-changed",renderAll);
document.getElementById("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(renderAll));
window.addEventListener?.("pagehide",stopScan);
renderAll();
})();