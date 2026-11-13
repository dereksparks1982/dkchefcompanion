/* DK Chef Companion: one product scanner shared by every inventory location.
   Quagga2 does camera recognition. Product lookup is independent and visible.
   No barcode-photo capture or second scanner inside storage sections. */
(function(){
"use strict";
const host=document.getElementById("dkProductStation");
const camera=window.DKChefBarcodeScanner,products=window.DKChefProductLookup,inventory=window.DKSeedBankRecipes;
if(!host||!camera||!products||!inventory)return;
const ru=()=>document.documentElement.lang==="ru";
const t=(en,russian)=>ru()?russian:en;
const esc=value=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const STORAGE="dk-chef-scanner-muted-v1";
host.innerHTML='<div class="chef-station-header"><div><h2 id="chefScanTitle"></h2><p id="chefScanIntro"></p></div>'+
 '<span class="chef-station-label" id="chefScanOne"></span></div>'+
 '<div class="chef-station-actions"><button class="chef-station-primary" type="button" id="chefScanStart"></button>'+
 '<button type="button" id="chefScanStop" hidden></button>'+
 '<button type="button" id="chefScanNext" hidden></button>'+
 '<label class="chef-station-mute"><input type="checkbox" id="chefScanMute"><span id="chefScanMuteText"></span></label></div>'+
 '<div class="chef-station-camera-row" id="chefScanCameraRow" hidden><label for="chefScanCamera" id="chefScanCameraLabel"></label>'+
 '<select id="chefScanCamera"><option value="" id="chefScanAutomatic"></option></select></div>'+
 '<div class="chef-station-preview" id="chefScanPreview" hidden></div>'+
 '<div class="chef-station-manual"><label for="chefScanBarcode" id="chefScanBarcodeLabel"></label>'+
 '<div class="chef-station-inputs"><input id="chefScanBarcode" inputmode="numeric" autocomplete="off" maxlength="14" pattern="[0-9]{8,14}" placeholder="UPC / EAN">'+
 '<button type="button" id="chefScanLookup"></button></div></div>'+
 '<p id="chefScanStatus" class="chef-station-status" role="status" aria-live="polite"></p>'+
 '<div id="chefScanResult" class="chef-station-result" hidden><div class="chef-station-result-head"><strong id="chefScanProductName"></strong>'+
 '<small id="chefScanProductSource"></small></div><p id="chefScanProductDetails"></p></div>'+
 '<div class="chef-station-save" id="chefScanSaveArea" hidden>'+
 '<div class="chef-station-fields"><label><span id="chefScanNameLabel"></span><input id="chefScanName" maxlength="140"></label>'+
 '<label><span id="chefScanBrandLabel"></span><input id="chefScanBrand" maxlength="100"></label>'+
 '<label><span id="chefScanSizeLabel"></span><input id="chefScanSize" maxlength="80"></label>'+
 '<label><span id="chefScanDestinationLabel"></span><select id="chefScanDestination">'+
 '<option value="pantry"></option><option value="cellar"></option><option value="medicine"></option><option value="household"></option></select></label>'+
 '<label><span id="chefScanCountLabel"></span><input id="chefScanCount" type="number" min="1" max="999999" step="1" value="1"></label>'+
 '<label><span id="chefScanIngredientLabel"></span><input id="chefScanIngredient" maxlength="140"></label></div>'+
 '<button type="button" class="chef-station-primary" id="chefScanAdd"></button>'+
 '<p class="chef-station-help" id="chefScanSaveHelp"></p></div>'+
 '<p class="chef-station-help" id="chefScanSources"></p>';
const $=id=>document.getElementById(id);
const start=$("chefScanStart"),stopBtn=$("chefScanStop"),nextBtn=$("chefScanNext"),preview=$("chefScanPreview");
const statusNode=$("chefScanStatus"),result=$("chefScanResult"),saveArea=$("chefScanSaveArea");
const barcode=$("chefScanBarcode"),name=$("chefScanName"),brand=$("chefScanBrand"),size=$("chefScanSize");
const destination=$("chefScanDestination"),ingredient=$("chefScanIngredient"),count=$("chefScanCount");
const cameraSelect=$("chefScanCamera"),cameraRow=$("chefScanCameraRow");
let muted=false;
try{muted=localStorage.getItem(STORAGE)==="1";}catch(error){}
$("chefScanMute").checked=muted;
let audio=null,active=false,sessionNumber=0,lookupNumber=0,lastCode="",lastProduct=null,deviceId="",retries=0;
function feedback(message){statusNode.textContent=message;}
function localized(){
 const labels={
  chefScanTitle:t("🔎 Product Scanner","🔎 Сканер товаров"),
  chefScanIntro:t("Scan a grocery, medicine, pet or household barcode. Identification appears here.","Сканируйте штрихкоды продуктов, лекарств, товаров для животных и дома. Результат появится здесь."),
  chefScanOne:t("One scanner · All inventory","Один сканер · Все запасы"),
  chefScanStart:t("Scan barcode","Сканировать штрихкод"),
  chefScanStop:t("Stop camera","Остановить камеру"),
  chefScanNext:t("Scan next item","Следующий товар"),
  chefScanMuteText:t("Mute ding","Без звука"),
  chefScanCameraLabel:t("Camera","Камера"),
  chefScanAutomatic:t("Automatic camera","Автоматический выбор"),
  chefScanBarcodeLabel:t("Barcode number","Номер штрихкода"),
  chefScanLookup:t("Look up barcode","Найти по штрихкоду"),
  chefScanNameLabel:t("Product name","Название товара"),
  chefScanBrandLabel:t("Brand","Марка"),
  chefScanSizeLabel:t("Package size","Размер упаковки"),
  chefScanDestinationLabel:t("Store in","Место хранения"),
  chefScanCountLabel:t("Packages","Упаковки"),
  chefScanIngredientLabel:t("Recipe ingredient (food only, optional)","Ингредиент для рецептов (только еда, необязательно)"),
  chefScanAdd:t("Add to inventory","Добавить в запасы"),
  chefScanSaveHelp:t("Review the product details before saving. Medicines and household supplies never count as recipe ingredients.","Проверьте данные перед сохранением. Лекарства и бытовые товары не считаются ингредиентами рецептов.")
 };
 for(const [id,value]of Object.entries(labels))$(id).textContent=value;
 $("chefScanSources").innerHTML=t("Product data from publicly available databases. Only the barcode is sent for lookup.","Данные товаров из открытых баз. Для поиска отправляется только штрихкод.")+
  ' · <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">Open Food Facts</a> (<a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">ODbL</a>)'+
  ' · <a href="https://world.openproductsfacts.org/" target="_blank" rel="noopener noreferrer">Open Products Facts</a>'+
  ' · <a href="https://www.upcitemdb.com/" target="_blank" rel="noopener noreferrer">UPCitemdb</a>';
 for(const option of destination.options){
  const names={
   pantry:t("Pantry","Кладовая"),cellar:t("Root Cellar","Погреб"),
   medicine:t("Medicine Cabinet","Аптечка"),household:t("Household Supplies","Бытовые запасы")
  };
  option.textContent=names[option.value];
 }
}
function armAudio(){
 if(muted)return;
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio)return;
 try{
  audio=audio||new Audio();
  if(audio.state==="suspended")void audio.resume().catch(()=>{});
 }catch(error){}
}
function ding(){
 if(muted)return;
 if(!audio)armAudio();
 if(!audio)return;
 try{
  const now=audio.currentTime;
  const tone=audio.createOscillator(),gain=audio.createGain();
  tone.type="sine";
  tone.frequency.setValueAtTime(920,now);
  tone.frequency.exponentialRampToValueAtTime(1350,now+0.10);
  gain.gain.setValueAtTime(0.0001,now);
  gain.gain.exponentialRampToValueAtTime(0.14,now+0.017);
  gain.gain.exponentialRampToValueAtTime(0.0001,now+0.17);
  tone.connect(gain);gain.connect(audio.destination);
  tone.start(now);tone.stop(now+0.18);
 }catch(error){}
}
function resetResult(){
 result.hidden=true;saveArea.hidden=true;lastProduct=null;
}
function guessIngredient(product){
 if(product?.category!=="food")return "";
 const label=String(product.name||"").toLowerCase();
 for(const [rule,word] of [
  [/\bpeas?\b/,"Peas"],[/\bpotatoes?\b/,"Potatoes"],[/\bgreen beans?\b/,"Green beans"],
  [/\bolive oil\b/,"Olive oil"],[/\bflour\b/,"All-purpose flour"],
  [/\b(tomato|tomatoes)\b/,"Tomatoes"],[/\brice\b/,"Rice"],
  [/\bsalt\b/,"Salt"],[/\bcorn\b/,"Corn"],[/\bcarrots?\b/,"Carrots"]]){
  if(rule.test(label))return word;
 }
 return "";
}
function locationFor(product){
 if(product.category==="food"||product.category==="petfood")return product.category==="food"?"pantry":"household";
 const title=(String(product.name||"")+" "+String(product.brand||"")).toLowerCase();
 if(/\b(pepcid|famotidine|ibuprofen|acetaminophen|tablet|capsule|medicine|antacid|pain relief|allergy relief)\b/.test(title))
  return "medicine";
 return "household";
}
function showProduct(product){
 lastProduct=product;
 $("chefScanProductName").textContent=product.name;
 $("chefScanProductSource").textContent=t("Source: ","Источник: ")+product.source;
 $("chefScanProductDetails").textContent=[product.brand,product.size,product.description].filter(Boolean).join(" · ");
 result.hidden=false;saveArea.hidden=false;
 name.value=product.name;
 brand.value=product.brand||"";
 size.value=product.size||"";
 destination.value=locationFor(product);
 ingredient.value=guessIngredient(product);
 count.value="1";
}
async function find(code){
 const token=++lookupNumber;
 lastCode=code;
 resetResult();
 barcode.value=code;
 saveArea.hidden=false;
 name.value="";brand.value="";size.value="";ingredient.value="";count.value="1";
 destination.value="pantry";
 feedback(t("Barcode ","Штрихкод ")+code+t(" read. Searching product databases…"," считан. Поиск по базам товаров…"));
 if(!/^\d{8,14}$/.test(code)){feedback(t("Enter an 8–14 digit barcode.","Введите штрихкод из 8–14 цифр."));return;}
 try{
  const product=await products.lookup(code);
  if(token!==lookupNumber)return;
  if(product?.found){
   showProduct(product);
   feedback(t("Product identified. Confirm details and choose where to store it.","Товар найден. Проверьте сведения и выберите место хранения."));
  }else{
   const why=product?.reason;
   feedback(why==="rate-limited"?t("Databases are rate-limited. Barcode retained. Enter a product name to save.","Превышен лимит запросов. Штрихкод сохранён. Введите название товара."):
    why==="unavailable"?t("Databases could not be reached. Check internet access. Barcode retained; you can enter a name.","Базы товаров недоступны. Проверьте интернет. Штрихкод сохранён; введите название."):
    t("Barcode read, but no database has a confirmed product match. Enter a name to save.","Штрихкод считан, но товар не найден в базах. Введите название для сохранения."));
  }
 }catch(error){
  if(token===lookupNumber)feedback(t("Product lookup failed. Barcode retained; enter the product name manually.","Ошибка поиска. Штрихкод сохранён; введите название вручную."));
 }
}
function cameraError(error){
 const kind=String(error?.name||"");
 if(/NotAllowed|PermissionDenied|Security/.test(kind))return t("Camera permission blocked. Check browser site permissions.","Доступ к камере заблокирован. Проверьте разрешения браузера.");
 if(/NotFound/.test(kind))return t("No camera detected. Select or connect a webcam.","Камера не найдена. Выберите или подключите веб-камеру.");
 if(/NotReadable|AbortError/.test(kind))return t(
  "Firefox camera permission is already granted. The video device refused to start (NotReadableError). Tried Quagga2 fallback settings. Pick another listed camera below; if every option fails, check the Surface camera driver or another app using it.",
  "Разрешение Firefox уже получено, но видеоустройство не запускается (NotReadableError). Настройки Quagga2 проверены. Выберите другую камеру ниже; если все варианты не работают, проверьте драйвер камеры Surface и другие приложения.");
 return t("Camera could not start: ","Не удалось включить камеру: ")+String(error?.message||error||"unknown").slice(0,140);
}
function closeCamera(){
 active=false;sessionNumber++;lookupNumber++;
 stopBtn.hidden=true;nextBtn.hidden=true;start.hidden=false;preview.hidden=true;
 return camera.stop();
}
function scanNext(){
 if(!active)return;
 lookupNumber++; // An earlier lookup cannot overwrite the next product.
 resetResult();
 barcode.value="";
 nextBtn.hidden=true;
 if(camera.resume?.()){
  feedback(t("Camera stays open. Point at the next barcode.","Камера остаётся включённой. Наведите на следующий штрихкод."));
 }else{
  feedback(t("Camera disconnected. Reconnecting…","Камера отключилась. Повторное подключение…"));
  void openCamera(deviceId);
 }
}
function updateCameras(items,selected=""){
 if(!Array.isArray(items))return;
 cameraSelect.innerHTML='<option value="">'+t("Automatic camera","Автоматический выбор")+'</option>'+
  items.map(item=>'<option value="'+esc(item.deviceId)+'">'+esc(item.label)+'</option>').join("");
 cameraRow.hidden=items.length===0;
 cameraSelect.value=items.some(item=>item.deviceId===(deviceId||selected))?(deviceId||selected):"";
}
async function openCamera(chosen="",recovery=0){
 const token=++sessionNumber;
 active=false;retries=recovery;deviceId=chosen;
 await camera.stop();
 if(token!==sessionNumber)return;
 preview.hidden=false;stopBtn.hidden=false;nextBtn.hidden=true;start.hidden=true;active=true;
 feedback(t("Opening camera…","Открытие камеры…"));
 // List cameras even when Quagga2 cannot open the video stream. Do not ask for
 // another getUserMedia permission just to enumerate already-authorized cameras.
 Promise.resolve(camera.devices?.()).then(items=>{
  if(token===sessionNumber)updateCameras(items,chosen);
 }).catch(()=>{});
 try{
  await camera.start({target:preview,deviceId:chosen,
   onAttempt:(label,number,total)=>{
    if(token===sessionNumber)feedback(t("Opening camera: ","Открытие камеры: ")+label+
     " ("+number+"/"+total+")");
   },
   onActiveCamera:(label,settings)=>{
    if(token===sessionNumber&&label)feedback(t("Camera ready: ","Камера готова: ")+label+
      (settings?.width?" · "+settings.width+"×"+settings.height:""));
   },
   onCode:code=>{
    if(token!==sessionNumber||!active)return;
    // Keep Quagga2 LiveStream alive: iOS need not ask for camera access between items.
    // Quagga2 pauses further detection until Scan next is selected.
    nextBtn.hidden=false;
    ding();
    void find(code);
   },
   onProgress:event=>{
    if(token!==sessionNumber||!active)return;
    const progress={
     live:t("Camera ready. Hold the barcode steady.","Камера готова. Держите штрихкод ровно."),
     searching:t("Scanning… Move the barcode into focus.","Сканирование… Наведите камеру на чёткий штрихкод."),
     hint:t("Still scanning. Try brighter light and a steady barcode.","Сканирование продолжается. Улучшите освещение и держите ровно."),
     disconnected:t("Camera connection dropped.","Камера отключилась.")
    };
    feedback(progress[event]||progress.searching);
    if(event==="disconnected"){
     if(recovery===0){void openCamera(chosen,1);}
     else{void closeCamera();feedback(t("Camera disconnected again. Try selecting a different camera.","Камера снова отключилась. Выберите другую камеру."));}
    }
   },
   onCameras:(items,selected)=>{
    if(token===sessionNumber)updateCameras(items,selected);
   }
  });
 }catch(error){
  if(token!==sessionNumber)return;
  await closeCamera();
  // The camera picker must still work after Firefox reports NotReadableError.
  // Enumeration needs no new capture request; permission was already granted.
  try{
   const list=await camera.devices?.();
   if(sessionNumber===token+1&&Array.isArray(list))updateCameras(list,chosen);
  }catch(ignored){}
  if(sessionNumber===token+1)feedback(cameraError(error));
 }
}
start.addEventListener("click",()=>{armAudio();void openCamera();});
stopBtn.addEventListener("click",()=>{void closeCamera();feedback(t("Camera stopped.","Камера остановлена."));});
nextBtn.addEventListener("click",scanNext);
$("chefScanLookup").addEventListener("click",()=>{
 if(active){camera.pause?.();nextBtn.hidden=false;}
 void find(barcode.value.trim());
});
barcode.addEventListener("keydown",event=>{if(event.key==="Enter"){
 event.preventDefault();if(active){camera.pause?.();nextBtn.hidden=false;}
 void find(barcode.value.trim());
}});
cameraSelect.addEventListener("change",()=>{armAudio();void openCamera(cameraSelect.value);});
$("chefScanMute").addEventListener("change",event=>{
 muted=!!event.target.checked;
 try{localStorage.setItem(STORAGE,muted?"1":"0");}catch(error){}
 if(!muted)armAudio();
});
destination.addEventListener("change",()=>{
 if(destination.value==="medicine"||destination.value==="household")ingredient.value="";
});
$("chefScanAdd").addEventListener("click",()=>{
 const productName=name.value.trim(),code=barcode.value.trim(),packages=Number(count.value);
 if(!productName||!Number.isSafeInteger(packages)||packages<1||packages>999999){
  feedback(t("Enter the product name and a valid package count.","Введите название товара и правильное количество упаковок."));return;
 }
 if(code&&!/^\d{8,14}$/.test(code)){
  feedback(t("Barcode must contain 8–14 digits.","Штрихкод должен содержать от 8 до 14 цифр."));return;
 }
 const location=destination.value;
 const record={name:productName,brand:brand.value.trim(),size:size.value.trim(),
  barcode:code,packages,location,ingredient:(location==="pantry"||location==="cellar")?ingredient.value.trim():"",available:true};
 if(!inventory.saveProvision(record)){
  feedback(t("Could not save. Check the fields and try again.","Не удалось сохранить. Проверьте поля и повторите попытку."));return;
 }
 feedback(t("Saved ","Сохранено: ")+productName+" · "+destination.selectedOptions[0].textContent+
  t(". Tap Scan next item to keep using the same camera.",". Нажмите «Следующий товар», чтобы продолжить с той же камерой."));
});
window.addEventListener("pagehide",()=>{void closeCamera();});
document.getElementById("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(localized));
localized();
feedback(t("Ready. Scan a barcode or enter its number.","Готово. Сканируйте штрихкод или введите его номер."));
window.DKChefUniversalScanner=Object.freeze({find,openCamera,closeCamera,scanNext,guessIngredient,locationFor});
})();
