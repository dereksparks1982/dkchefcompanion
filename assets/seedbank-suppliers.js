/* DK Seed Bank: optional seed supplier directory, separate from seed inventory. */
(function(root){"use strict";
const KEY="dk-seedbank-suppliers-v1";
const known=[
 {name:"Burpee",url:"https://www.burpee.com/"},
 {name:"Baker Creek Heirloom Seeds",url:"https://www.rareseeds.com/"},
 {name:"Johnny's Selected Seeds",url:"https://www.johnnyseeds.com/"},
 {name:"Seed Savers Exchange",url:"https://seedsavers.org/"},
 {name:"Territorial Seed Company",url:"https://territorialseed.com/"}];
const main=document.querySelector("main");if(!main)return;
const panel=document.createElement("details");panel.id="dkSeedSuppliers";panel.className="dk-seed-suppliers";
panel.setAttribute("data-dk-no-translate","");
panel.innerHTML='<summary>🌱 <span id="dkSupplierTitle"></span></summary><div class="dk-suppliers-content">'+
 '<p id="dkSupplierIntro"></p><ul class="dk-supplier-list" id="dkSupplierKnown"></ul>'+
 '<h3 id="dkSupplierFavoritesTitle"></h3><ul class="dk-supplier-list" id="dkSupplierFavorites"></ul>'+
 '<form id="dkSupplierForm" class="dk-supplier-form">'+
 '<label><span id="dkSupplierNameLabel"></span><input name="name" required maxlength="100"></label>'+
 '<label><span id="dkSupplierUrlLabel"></span><input name="url" type="url" required maxlength="500" placeholder="https://"></label>'+
 '<button type="submit" id="dkSupplierAdd"></button></form><p id="dkSupplierMessage" role="status"></p></div>';
main.appendChild(panel);
const $=id=>document.getElementById(id),l=(en,ru)=>document.documentElement.lang==="ru"?ru:en;
function safeUrl(value){try{const url=new URL(value);return url.protocol==="https:"&&!url.username&&!url.password?url.href:"";}catch(e){return "";}}
function clean(items){
 const list=[],seen=new Set();
 for(const item of (Array.isArray(items)?items:[]).slice(0,100)){
  const name=String(item?.name||"").trim().slice(0,100),url=safeUrl(item?.url||"");
  if(!name||!url||seen.has(url.toLowerCase()))continue;
  seen.add(url.toLowerCase());list.push({name,url});if(list.length===40)break;
 }return list;
}
let favorites=[];try{favorites=clean(JSON.parse(localStorage.getItem(KEY)||"[]"));}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(favorites));return true;}catch(e){return false;}}
function showList(id,items,editable){
 const ul=$(id);ul.replaceChildren();
 for(const item of items){
  const li=document.createElement("li"),a=document.createElement("a");
  a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=item.name;li.appendChild(a);
  if(editable){
   const b=document.createElement("button");b.type="button";b.textContent=l("Remove","Удалить");
   b.setAttribute("aria-label",l("Remove supplier ","Удалить поставщика ")+item.name);
   b.addEventListener("click",()=>{const original=favorites;favorites=favorites.filter(x=>x.url!==item.url);
    if(!save()){favorites=original;$("dkSupplierMessage").textContent=l("Could not save supplier changes.","Не удалось сохранить изменения.");}
    render();});li.appendChild(b);
  }ul.appendChild(li);
 }
 if(editable&&!items.length){const li=document.createElement("li");
  li.textContent=l("No favorites added yet.","Любимых поставщиков пока нет.");ul.appendChild(li);}
}
function render(){
 $("dkSupplierTitle").textContent=l("Seed Suppliers","Поставщики семян");
 $("dkSupplierIntro").textContent=l("Browse established seed suppliers. Links open their websites; nothing is ordered through this app.","Просматривайте сайты известных поставщиков семян. Покупки совершаются на их сайтах.");
 $("dkSupplierFavoritesTitle").textContent=l("My favorite suppliers","Мои любимые поставщики");
 $("dkSupplierNameLabel").textContent=l("Supplier name","Название поставщика");
 $("dkSupplierUrlLabel").textContent=l("Website address","Адрес сайта");
 $("dkSupplierAdd").textContent=l("Add supplier","Добавить поставщика");
 showList("dkSupplierKnown",known,false);showList("dkSupplierFavorites",favorites,true);
}
$("dkSupplierForm").addEventListener("submit",event=>{
 event.preventDefault();const form=event.currentTarget,name=String(form.elements.name.value||"").trim().slice(0,100);
 const url=safeUrl(form.elements.url.value);
 if(!name||!url){$("dkSupplierMessage").textContent=l("Enter a name and a secure HTTPS address.","Введите название и адрес HTTPS.");return;}
 if([...known,...favorites].some(x=>x.url.toLowerCase()===url.toLowerCase())){$("dkSupplierMessage").textContent=l("Already listed.","Уже есть в списке.");return;}
 if(favorites.length>=40){$("dkSupplierMessage").textContent=l("Limit of 40 favorites reached.","Достигнут предел в 40 поставщиков.");return;}
 favorites.push({name,url});if(!save()){favorites.pop();$("dkSupplierMessage").textContent=l("Browser storage unavailable; nothing saved.","Хранилище браузера недоступно.");return;}
 form.reset();$("dkSupplierMessage").textContent=l("Supplier saved on this device.","Поставщик сохранён на устройстве.");render();
});
$("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(render));
render();
root.DKSeedBankSuppliers=Object.freeze({exportData:()=>favorites.map(x=>({...x})),importData:items=>{favorites=clean(items);const ok=save();render();return ok;}});
})(window);
