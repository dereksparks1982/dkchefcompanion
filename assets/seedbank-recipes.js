/* DK Chef Companion: shared kitchen provisions and recipe checklists. */
(function(){
"use strict";
const root=document.getElementById("recipeApp");
if(!root)return;
const key="dk-seedbank-recipes-v1";
const clean=x=>String(x||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const esc=x=>String(x===undefined||x===null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const item=(id,name,type,aliases,note)=>({id,name,type,aliases,note:note||""});
const templates=[
 {id:"absinthe",name:"Traditional absinthe · Pontarlier-style",family:"Historical botanical checklist",intro:"The classic distilled style uses grand wormwood, green anise and fennel for its principal character, with petite wormwood, hyssop and lemon balm often used for the green coloration. This is an ingredient inventory, not a distillation tutorial.",ingredients:[
  item("grand","Grand wormwood (Artemisia absinthium)","garden",["artemisia absinthium","grand wormwood"],"Your wormwood packet lists Artemisia absinthium; verify species and food-safe suitability."),
  item("anise","Green anise (Pimpinella anisum)","garden",["green anise","pimpinella anisum"],"True green anise, not star anise."),
  item("fennel","Fennel seed (Foeniculum vulgare)","garden",["fennel"],"Florence and Bronze fennel seeds are recorded; verify botanical identity and culinary seed quality."),
  item("petite","Petite/Roman wormwood (Artemisia pontica)","garden",["artemisia pontica","petite wormwood","roman wormwood"],"Different species from grand wormwood; not interchangeable."),
  item("hyssop","Hyssop (Hyssopus officinalis)","garden",["hyssop"],"Verify true hyssop; 'anise hyssop' is a different plant."),
  item("balm","Lemon balm (Melissa officinalis)","garden",["lemon balm","melissa officinalis"],"Traditional green coloring herb."),
  item("spirit","Suitable neutral spirit","pantry",[],"Not supplied by the seed bank. Traditional absinthe is a distilled spirit, not simply a wormwood soak."),
  item("water","Potable water","pantry",[],"For the finished beverage; record when available.")
 ],sources:[
  ["Historical absinthe botanical formulas","https://jib.cibd.org.uk/index.php/jib/article/download/80/147"],
  ["U.S. TTB thujone and spirits formula requirements","https://www.ttb.gov/formulation/do-i-need-a-formula-spirits"]
 ],caution:"Safety: do not consume packet seeds, unidentified plants or concentrated essential oils. Alcohol distillation can be dangerous and restricted. U.S. domestic spirits containing wormwood require regulatory compliance and thujone limits; check applicable laws. No home-distillation instructions are provided."},
 {id:"pesto",name:"Fresh basil pesto",family:"Kitchen",intro:"A classic basil-based sauce. Harvest mature edible leaves; seed packets are not cooking ingredients.",ingredients:[
  item("basil","Fresh basil","garden",["basil"]),
  item("garlic","Garlic","garden",["garlic"]),
  item("nuts","Pine nuts or walnuts","pantry",[]),
  item("oil","Olive oil","pantry",[]),
  item("cheese","Hard grating cheese","pantry",[]),
  item("salt","Salt","pantry",[])
 ],method:"Finely crush or blend basil, garlic and nuts, then combine with oil and cheese. Season to taste. Refrigerate promptly."},
 {id:"salsa",name:"Fresh garden tomato salsa",family:"Kitchen",intro:"A fresh chopped tomato salsa using garden vegetables and basic pantry staples.",ingredients:[
  item("tomatoes","Ripe tomatoes","garden",["tomato","tamarillo"],"Use ordinary culinary tomatoes rather than a tamarillo; check the matching variety."),
  item("peppers","Fresh peppers","garden",["pepper","jalapeno","serrano","habanero","poblano"]),
  item("cilantro","Cilantro leaves","garden",["cilantro","coriander"]),
  item("onions","Onion","garden",["onion"]),
  item("lime","Lime juice","pantry",[]),
  item("salt","Salt","pantry",[])
 ],method:"Chop tomatoes, peppers, cilantro and onion; mix with lime juice and salt. Keep refrigerated. This is not a shelf-stable canning recipe."},
 {id:"pickles",name:"Refrigerator dill pickles",family:"Kitchen",intro:"A refrigerator pickle checklist, not a shelf-stable canning or fermentation procedure.",ingredients:[
  item("cucumber","Pickling cucumbers","garden",["cucumber"],"Cucamelons are a different species; verify which type you intend."),
  item("dill","Fresh dill","garden",["dill"]),
  item("garlic","Garlic","garden",["garlic"]),
  item("vinegar","Food-grade vinegar","pantry",[]),
  item("salt","Salt","pantry",[]),
  item("water","Potable water","pantry",[])
 ],method:"Use a tested refrigerator-pickle recipe with food-safe vinegar strength, proper proportions and refrigeration. This guide tracks ingredients only."}
];
const initial=()=>({version:2,ready:{},custom:[],selected:"absinthe",provisions:{version:1,migrated:false,items:[],deleted:[]}});
let state=initial();
try{const v=JSON.parse(localStorage.getItem(key)||"null");if(v&&typeof v==="object"&&!Array.isArray(v))state={...initial(),...v};}catch(e){}
if(!state.ready||typeof state.ready!=="object")state.ready={};
if(!Array.isArray(state.custom))state.custom=[];
function persist(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch(e){return false;}}
const all=()=>templates.concat(window.DKSeedBankRecipeLibrary?.recipes||[],state.custom);
const category=recipe=>recipe.id.startsWith("custom-")?"personal":
 recipe.family==="Spice Blends"?"spices":
 recipe.family==="Bread & Baking"?"bread":
 recipe.family==="Historical botanical checklist"?"historical":"kitchen";
const tabs=[
 {id:"kitchen",en:"Meals & Kitchen",ru:"Блюда и кухня"},
 {id:"bread",en:"Bread & Baking",ru:"Хлеб и выпечка"},
 {id:"spices",en:"Spice Blends",ru:"Смеси специй"},
 {id:"historical",en:"Historical",ru:"Исторические"},
 {id:"personal",en:"My Recipes",ru:"Мои рецепты"}
];
let activeCategory=null,cookFilter="all";
// Ephemeral portion targets: never saved to shared inventory or cloud backups.
const portionTargets=Object.create(null);
const ru=()=>document.documentElement.lang==="ru";
const say=(en,rus)=>ru()?rus:en;
const localized=(entity,field)=>ru()&&entity[field+"Ru"]?entity[field+"Ru"]:entity[field];
function inventory(){
 const core=window.DKSeedBankCore;
 if(!core||typeof core.plants!=="function")return [];
 return [...core.plants().values()].filter(p=>p&&p.card&&p.card.dataset.archived!=="yes")
  .map(p=>({name:p.name,category:p.cat,key:p.key,normalized:clean(p.name)}));
}
function matched(ingredient,plants){
 if(ingredient.type!=="garden")return [];
 const aliases=(ingredient.aliases&&ingredient.aliases.length?ingredient.aliases:[ingredient.name]).map(clean).filter(Boolean);
 return plants.filter(p=>aliases.some(a=>(" "+p.normalized+" ").includes(" "+a+" "))).map(p=>p.name);
}

const ingredientAliases={
 "fine salt":"salt","table salt":"salt","sea salt":"salt",
 "extra virgin olive oil":"olive oil",
 "fresh garlic":"garlic","garlic cloves":"garlic",
 "yellow onion":"onion","onions":"onion","white onion":"onion",
 "ripe tomatoes":"fresh tomatoes","fresh tomatoes":"fresh tomatoes",
 "fresh basil":"fresh basil","basil leaves":"fresh basil",
 "potable water":"water","warm water":"water",
 "all purpose flour":"all purpose flour","plain flour":"all purpose flour",
 "ground white pepper":"white pepper","white pepper":"white pepper",
 "ground black pepper":"black pepper","black pepper":"black pepper",
 "fresh lemon juice":"lemon juice","lemon juice":"lemon juice",
 "egg":"eggs","eggs":"eggs","large eggs":"eggs",
 "dried oregano":"dried oregano","ground oregano":"ground oregano"
};
function provisionKey(name){
 const base=String(name||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replace(/\([^)]*\)/g," ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
 return ingredientAliases[base]||base;
}
function checkProvisions(){
 const prov=state.provisions&&typeof state.provisions==="object"&&!Array.isArray(state.provisions)?state.provisions:{};
 prov.items=Array.isArray(prov.items)?prov.items.filter(x=>x&&typeof x.id==="string"&&typeof x.key==="string").slice(0,3000):[];
 prov.deleted=Array.isArray(prov.deleted)?prov.deleted.filter(x=>x&&typeof x.id==="string"&&typeof x.deletedAt==="string").slice(-3000):[];
 if(!prov.migrated){
  const recipes=all(),seen=new Set(prov.items.map(x=>x.key));
  for(const recipe of recipes)for(const ing of recipe.ingredients||[]){
   if(!state.ready[recipe.id+"/"+ing.id]||prov.items.length>=3000)continue;
   const id=provisionKey(ing.name);if(!id||seen.has(id))continue;
   prov.items.push({id:"legacy-"+recipe.id+"-"+ing.id,key:id,name:ing.name,location:"pantry",packages:1,
    available:true,brand:"",barcode:"",size:"",amount:"",expiry:"",obtained:"",notes:"",
    updatedAt:new Date().toISOString()});
   seen.add(id);
  }
  prov.migrated=true;
 }
 state.provisions={version:1,...prov};
}
const provisions=()=>state.provisions.items;
function isReady(recipe,ingredient){
 const matcher=window.DKChefRecipeMatch;
 if(matcher)return matcher.matches(ingredient,provisions()).length>0;
 const id=provisionKey(ingredient.name);
 return !!id&&provisions().some(row=>(row.location==="pantry"||row.location==="cellar")&&
  row.key===id&&row.available!==false&&(row.packages==null||Number(row.packages)>0));
}
function provisionNotify(){
 if(typeof Event==="function")document.dispatchEvent?.(new Event("dkchef:provisions-changed"));
}
function persistKitchen(){if(!persist())return false;provisionNotify();render();return true;}
function setIngredientReady(recipe,ingredient,available){
 const key=provisionKey(ingredient.name);if(!key)return false;
 const matching=window.DKChefRecipeMatch?.matches(ingredient,provisions())||[];
 const existing=provisions().filter(row=>(row.location==="pantry"||row.location==="cellar")&&
  (row.key===key||matching.some(hit=>hit.id===row.id)));
 const prev=JSON.stringify(state.provisions),now=new Date().toISOString();
 if(existing.length)for(const row of existing){row.available=!!available;row.updatedAt=now;}
 else if(available&&provisions().length<3000)provisions().push({
  id:"ingredient-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9),
  key,name:ingredient.name,location:"pantry",packages:1,available:true,
  brand:"",barcode:"",size:"",amount:"",expiry:"",obtained:"",notes:"",updatedAt:now
 });
 else if(available)return false;
 else return true;
 if(!persistKitchen()){state.provisions=JSON.parse(prev);return false;}
 return true;
}
function saveProvision(value){
 if(!value||typeof value!=="object")return false;
 const name=String(value.name||"").trim().slice(0,140),ingredient=String(value.ingredient||"").trim().slice(0,140),key=provisionKey(ingredient||name);
 const location=["pantry","cellar","medicine","household"].includes(value.location)?value.location:"pantry";
 const packages=Number(value.packages??1);
 const threshold=Number(value.lowStockAt??0);
 if(!name||!key||key.length>140||
  !Number.isSafeInteger(packages)||packages<0||packages>999999||
  !Number.isSafeInteger(threshold)||threshold<0||threshold>999999)return false;
 const old=JSON.stringify(state.provisions),now=new Date().toISOString();
 const id=String(value.id||"");
 const linkedHarvest=String(value.sourceHarvestId||"");
 if(linkedHarvest&&provisions().some(x=>x.sourceHarvestAllocation===true&&
   x.sourceHarvestId===linkedHarvest&&x.location===location&&x.id!==id))return false;
 let row=id?provisions().find(x=>x.id===id):null;
 if(row?.sourceHarvestAllocation===true&&location!==row.location)return false;
 // Legacy inventory edits do not contain barcode fields. Preserve existing UPCs.
 const barcode=String(value.barcode??row?.barcode??"").replace(/\s+/g,"");
 if(barcode&&!/^\d{8,14}$/.test(barcode))return false;
 if(row)row.packages=packages;
 if(!row){
  // Repeat scans add packages to the same barcode+storage entry.
  row=provisions().find(x=>x.location===location&&
   (barcode?x.barcode===barcode:x.key===key&&String(x.brand||"")===String(value.brand||"").trim()&&String(x.size||"")===String(value.size||"").trim()));
  if(row)row.packages=Math.min(999999,Number(row.packages??0)+packages);
 }
 if(!row){
  if(provisions().length>=3000)return false;
  row={id:"provision-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9)};
  provisions().push(row);row.packages=packages;
 }
 // Preserve exact UPC-linked FDA directory details as optional inventory metadata.
 // A retail UPC is never converted into or assumed to be a National Drug Code.
 if(location==="medicine"&&value.medicineInfo&&typeof value.medicineInfo==="object"){
  const info=value.medicineInfo;
  if(String(info.verifiedUPC||"")===barcode&&/^\d{8,14}$/.test(barcode)){
   const clean=(v,n)=>String(v||"").trim().slice(0,n);
   const link=clean(info.labelUrl,180);
   row.medicineInfo={
    verifiedUPC:barcode,ndc:clean(info.ndc,40),generic:clean(info.generic,140),
    ingredient:clean(info.ingredient,280),dosageForm:clean(info.dosageForm,70),
    labelUrl:/^https:\/\/dailymed\.nlm\.nih\.gov\/dailymed\/drugInfo\.cfm\?setid=[a-f0-9-]{36}$/i.test(link)?link:"",
    source:"openFDA NDC Directory"
   };
  }
 }
 if(location!=="medicine"||row.medicineInfo?.verifiedUPC!==barcode)delete row.medicineInfo;
 Object.assign(row,{key,name,ingredient,location,barcode,lowStockAt:value.lowStockAt==null?Number(row.lowStockAt??0):threshold,brand:String(value.brand||"").trim().slice(0,100),
  size:String(value.size||"").trim().slice(0,80),amount:String(value.amount||"").trim().slice(0,80),
  expiry:String(value.expiry||"").slice(0,10),obtained:String(value.obtained||"").slice(0,10),
  notes:String(value.notes||"").trim().slice(0,300),sourceHarvestId:String(value.sourceHarvestId||"").slice(0,150),
  available:packages>0&&value.available!==false,updatedAt:now});
 if(!persistKitchen()){state.provisions=JSON.parse(old);return false;}return true;
}

// Explicit, idempotent harvest-to-storage posting. Each harvest/location owns
// one stable food inventory ID, so repeated clicks cannot add another package.
// Planner allocations alone are NOT stock until explicitly posted here.
function postHarvestAllocation(harvestId,location){
 const ledger=window.DKChefHarvestAllocation;
 const safeId=ledger?.stockId(harvestId,location);
 if(!safeId)return {ok:false,reason:"invalid-link"};
 const harvest=window.DKSeedBankWorkbench?.exportData?.()?.harvests?.find(h=>h.id===harvestId);
 if(!harvest)return {ok:false,reason:"missing-harvest"};
 const plan=ledger.inspect(harvest);
 if(!plan.ok)return {ok:false,reason:plan.reason};
 const raw=plan.allocations[location],amount=ledger.amountText(raw,harvest.unit);
 const rows=provisions(),existing=rows.find(row=>row.id===safeId);
 // An older, manually copied harvest entry may already represent this stock.
 // Require manual reconciliation rather than silently creating two food lots.
 if(rows.some(row=>row.id!==safeId&&row.location===location&&
   row.sourceHarvestId===harvestId))
  return {ok:false,reason:"already-linked"};
 if(existing){
  if(existing.sourceHarvestAllocation!==true||existing.sourceHarvestId!==harvestId||
    existing.location!==location||existing.packages!==1||
    existing.amount!==ledger.amountText(Number(existing.harvestAllocationPosted),existing.harvestAllocationUnit)||
    existing.available!==true)
   return {ok:false,reason:"stock-edited"};
 }
 if(raw===0){
  if(!existing)return {ok:true,action:"unchanged",amount:"0 "+harvest.unit};
  return removeProvision(safeId)?{ok:true,action:"removed",amount:"0 "+harvest.unit}:
    {ok:false,reason:"save-failed"};
 }
 if(existing&&existing.amount===amount)return {ok:true,action:"unchanged",amount};
 if(!existing&&rows.length>=3000)return {ok:false,reason:"inventory-full"};
 const p=window.DKSeedBankCore?.plants?.().get(harvest.seedKey);
 const name=String(p?.name||String(harvest.seedKey||"").split("|").pop()||"Garden harvest").trim().slice(0,140);
 const key=provisionKey(name);
 if(!key||key.length>140)return {ok:false,reason:"invalid-product"};
 const before=JSON.stringify(state.provisions),now=new Date().toISOString();
 const row=existing||{id:safeId,brand:"",barcode:"",size:"",expiry:"",lowStockAt:0,
  notes:"",sourceHarvestId:harvestId};
 if(!existing)rows.push(row);
 Object.assign(row,{
  key:existing?.key||key,name:existing?.name||name,ingredient:existing?.ingredient||name,
  location,packages:1,available:true,amount,
  sourceHarvestId:harvestId,sourceHarvestAllocation:true,
  harvestAllocationPosted:raw,harvestAllocationUnit:harvest.unit,
  obtained:String(harvest.date||"").slice(0,10),updatedAt:now
 });
 // Reposting a previously deleted deterministic record supersedes its tombstone.
 state.provisions.deleted=state.provisions.deleted.filter(x=>x.id!==safeId);
 if(!persistKitchen()){
  state.provisions=JSON.parse(before);
  return {ok:false,reason:"save-failed"};
 }
 return {ok:true,action:existing?"updated":"added",amount,id:safeId};
}

function removeProvision(id){
 const old=JSON.stringify(state.provisions);
 const row=provisions().find(x=>x.id===id);if(!row)return false;
 state.provisions.items=provisions().filter(x=>x.id!==id);
 state.provisions.deleted.push({id,deletedAt:new Date().toISOString()});
 state.provisions.deleted=state.provisions.deleted.slice(-3000);
 if(!persistKitchen()){state.provisions=JSON.parse(old);return false;}return true;
}

function recipeTabMarkup(){
 return '<div class="rg-section-tabs" role="group" aria-label="'+say("Recipe sections","Разделы рецептов")+'">'+
 '<button type="button" class="rg-section-button rg-cook-tab'+(activeCategory==="cook"?' is-selected':'')+
 '" data-rg-section="cook" aria-pressed="'+(activeCategory==="cook")+'">'+
 say("🍳 Cook from Pantry","🍳 Что приготовить из запасов")+'</button>'+
 tabs.filter(tab=>tab.id!=="personal"||state.custom.length).map(tab=>
 '<button type="button" class="rg-section-button'+(activeCategory===tab.id?' is-selected':'')+'" data-rg-section="'+tab.id+'" aria-pressed="'+(activeCategory===tab.id)+'">'+esc(ru()?tab.ru:tab.en)+'</button>').join("")+'</div>';
}


function portionInfo(recipe){return window.DKChefRecipeMatch?.yieldInfo(recipe)||null;}
function portionTarget(recipe){
 const info=portionInfo(recipe);
 return info?(Number.isSafeInteger(portionTargets[recipe.id])?portionTargets[recipe.id]:info.base):null;
}
function portionFactor(recipe){
 return portionInfo(recipe)?window.DKChefRecipeMatch.yieldFactor(recipe,portionTarget(recipe)):1;
}
function portionUnit(info,count=null){
 if(!ru())return info.unit;
 const names={
  servings:["порция","порции","порций"],naan:["лепёшка наан","лепёшки наан","лепёшек наан"],
  pita:["пита","питы","пит"],pitas:["пита","питы","пит"],
  chapati:["чапати","чапати","чапати"],
  rolls:["булочка","булочки","булочек"],roll:["булочка","булочки","булочек"],
  biscuits:["булочка","булочки","булочек"],biscuit:["булочка","булочки","булочек"],
  wedges:["кусочек","кусочка","кусочков"],wedge:["кусочек","кусочка","кусочков"],
  loaf:["буханка","буханки","буханок"],loaves:["буханка","буханки","буханок"]
 };
 const forms=names[info.unit];
 if(!forms)return "шт.";
 if(count===null)return forms[2];
 const n=Math.abs(Number(count)),last=n%10,teen=n%100;
 return forms[teen>=11&&teen<=14?2:last===1?0:last>=2&&last<=4?1:2];
}
function portionControl(recipe){
 const info=portionInfo(recipe);
 if(!info)return "";
 const target=portionTarget(recipe),changed=target!==info.base;
 return '<div class="rg-portion-panel" role="group" aria-label="'+say("Adjust recipe yield","Изменить выход рецепта")+'">'+
  '<div class="rg-portion-head"><label for="rgYieldTarget">'+say("Plan quantity","Планируемое количество")+
  ' ('+esc(portionUnit(info))+')</label><div class="rg-portion-actions">'+
  '<input id="rgYieldTarget" type="number" min="1" max="'+info.max+
  '" step="1" inputmode="numeric" value="'+target+'">'+
  '<button type="button" class="rg-button" data-rg-reset-yield'+(changed?"":" disabled")+'>'+
  say("Original amount","Исходное количество")+'</button></div></div>'+
  '<p class="rg-portion-note">'+say(
   "Ingredient amounts and stock checks follow this yield where measurements are clear. Cooking times, pan sizes and unclear amounts are not scaled. No stock is deducted.",
   "Количество ингредиентов и проверка запасов меняются только для понятных мер. Время приготовления, размеры форм и неясные количества не пересчитываются. Продукты не списываются.")+'</p></div>';
}
function ingredientAmount(ing,ratio){
 const original=String(localized(ing,"amount")||"");
 if(!original)return "";
 if(ratio===1)return '<small class="rg-amount">'+esc(original)+'</small>';
 const scaled=window.DKChefRecipeMatch?.scaledAmount(ing,ratio,ru()?"ru":"en");
 if(scaled?.status!=="scaled")return '<small class="rg-amount">'+esc(original)+'</small>'+
  '<small class="rg-portion-manual">'+say("Adjust manually for this yield.","Пересчитайте количество вручную.")+'</small>';
 return '<small class="rg-amount rg-amount-scaled"><strong>'+esc(scaled.label)+'</strong>'+
  '<span class="rg-original-amount">'+say("Original: ","Исходное: ")+esc(original)+'</span></small>';
}

function quantityText(q){
 if(!q||!["enough","short","unverified"].includes(q.status))return "";
 const units={g:say("g","г"),ml:say("mL","мл"),egg:say("eggs","яиц"),
  can:say("cans","банок"),clove:say("cloves","зубчиков"),
  leaf:say("leaves","листьев"),piece:say("pieces","шт.")};
 const unit=units[q.unit]||q.unit;
 const fmt=n=>Number(n.toFixed(1)).toLocaleString(ru()?"ru-RU":"en-US")+" "+unit;
 if(q.status==="enough")return say("Measured amount appears sufficient: ","По указанным количествам хватает: ")+fmt(q.measured)+" / "+fmt(q.required);
 if(q.status==="short")return say("Measured shortfall: ","По указанным количествам не хватает: ")+fmt(q.measured)+" / "+fmt(q.required);
 return say("Quantity unverified. Some matching stock has no comparable unit.",
  "Количество не проверено. У части запасов нет сопоставимых единиц измерения.");
}
function recipeQuantityNote(ingredient,multiplier=1){
 const matcher=window.DKChefRecipeMatch;
 if(!matcher||!ingredient?.amount)return "";
 const q=matcher.assessQuantity(ingredient,provisions(),multiplier);
 const message=q.status==="not-specified"&&matcher.matches(ingredient,provisions()).length?
  say("Quantity not verified. Add a total amount or package size in Pantry & Root Cellar.",
   "Количество не проверено. Укажите общий объём или размер упаковки в кладовой и погребе."):quantityText(q);
 return message?'<p class="rg-quantity-note'+(q.status==="short"?" rg-quantity-short":"")+
  '">'+esc(message)+'</p>':"";
}

function cookPlanner(recipes){
 const matcher=window.DKChefRecipeMatch;
 if(!matcher)return '<p class="rg-note">'+say("Recipe matching is unavailable. Reload the app.","Не удалось сопоставить рецепты. Обновите приложение.")+'</p>';
 const ranked=matcher.rank(recipes,provisions(),portionFactor);
 const ready=ranked.filter(x=>x.complete).length;
 const near=ranked.filter(x=>x.near).length;
 const stocked=provisions().filter(matcher.isEdibleStock).length;
 const selected=ranked.filter(x=>cookFilter==="ready"?x.complete:cookFilter==="near"?x.near:true);
 const labels={kitchen:say("Meals & Kitchen","Блюда и кухня"),bread:say("Bread & Baking","Хлеб и выпечка"),
  spices:say("Spice Blends","Смеси специй"),personal:say("My Recipes","Мои рецепты")};
 return '<section class="rg-cook-guide">'+
  '<h3>'+say("Cook from what you have","Что приготовить из ваших запасов")+'</h3>'+
  '<p class="rg-note">'+say(
   "Matches use your Pantry & Root Cellar only. Seeds, medicine and household goods are not cooking ingredients.",
   "Учитываются только продукты кладовой и погреба. Семена, лекарства и бытовые товары не считаются ингредиентами.")+'</p>'+
  '<div class="rg-cook-stats"><span><strong>'+ready+'</strong> '+
   say("fully matched recipes","рецептов со всеми ингредиентами")+'</span><span><strong>'+near+'</strong> '+
   say("nearly ready","почти готово")+'</span><span><strong>'+stocked+'</strong> '+
   say("available food records","доступных записей продуктов")+'</span></div>'+
  '<p class="rg-cook-caution">'+say(
   "Ingredient names alone do not prove enough stock; comparable measured amounts are checked conservatively. Opening a recipe never deducts stock. Optional substitutions are not automatically counted.",
   "Одного совпадения названий недостаточно: сравниваются только сопоставимые количества. Свежесть проверяйте отдельно. Просмотр рецептов не списывает запасы. Возможные замены не считаются имеющимися ингредиентами.")+'</p>'+
  '<div class="rg-cook-filters" role="group" aria-label="'+say("Recipe filter","Фильтр рецептов")+'">'+
  [["all",say("All recipes","Все рецепты")],["ready",say("All ingredients on hand","Все ингредиенты есть")],
   ["near",say("Missing 1–2","Не хватает 1–2")]].map(([id,label])=>
  '<button type="button" class="rg-button'+(cookFilter===id?" rg-selected":"")+
  '" data-rg-cook-filter="'+id+'" aria-pressed="'+(cookFilter===id)+'">'+esc(label)+'</button>').join("")+'</div>'+
  (selected.length?'<div class="rg-cook-results">'+selected.map(score=>{
   const recipe=score.recipe,missing=score.missing;
   const status=score.complete?
    (score.measuredShort?say("Ingredient names matched, but measured stock is short","Названия совпали, но измеренного запаса не хватает"):
     score.quantityUnverified?say("Names matched; check quantities","Названия совпали; проверьте количества"):
     say("Ingredients and measured amounts matched","Ингредиенты и измеренные количества совпадают")):
    score.near?say("Almost ready","Почти готово"):say("Missing ingredients","Не хватает ингредиентов");
   const swapIdeas=missing.filter(x=>x.suggestion).slice(0,2).map(x=>
    '<li>'+esc(localized(x.ingredient,"name"))+' → '+esc(x.suggestion.item)+'</li>');
   return '<article class="rg-cook-card'+(score.complete&&!score.measuredShort&&!score.quantityUnverified?" is-complete":"")+'">'+
    '<div class="rg-cook-card-top"><div><h4>'+esc(localized(recipe,"name"))+'</h4>'+
    '<small>'+esc(labels[category(recipe)]||labels.kitchen)+'</small></div>'+
    '<strong class="rg-cook-score">'+score.ready+' / '+score.total+'</strong></div>'+
    '<p class="rg-cook-state">'+status+'</p>'+
    (portionInfo(recipe)?'<p class="rg-cook-portion">'+say("Planned yield: ","Планируемый выход: ")+
      portionTarget(recipe)+' '+esc(portionUnit(portionInfo(recipe),portionTarget(recipe)))+'</p>':'')+
'<p class="rg-cook-quantity">'+say("Measured enough: ","По меркам хватает: ")+score.measuredEnough+
 ' · '+say("Measured short: ","По меркам мало: ")+score.measuredShort+
 ' · '+say("Check amount: ","Уточнить количество: ")+score.quantityUnverified+'</p>'+
 (score.measuredShort?'<p class="rg-cook-short">'+say("Need more: ","Нужно больше: ")+
 score.details.filter(x=>x.quantity.status==="short").map(x=>esc(localized(x.ingredient,"name"))).join(', ')+'</p>':'')+
    (missing.length?'<p class="rg-cook-missing"><strong>'+say("Missing: ","Не хватает: ")+'</strong>'+
     missing.map(x=>esc(localized(x.ingredient,"name"))).join(", ")+'</p>':
    '<p class="rg-cook-missing">'+say("No tracked ingredients missing.","По вашим записям все ингредиенты есть.")+'</p>')+
    (swapIdeas.length?'<div class="rg-cook-swaps"><strong>'+
     say("Optional swap ideas (check the recipe):","Возможные замены (проверьте рецепт):")+
     '</strong><ul>'+swapIdeas.join("")+'</ul></div>':"")+
    '<button type="button" class="rg-button rg-cook-open" data-rg-open-recipe="'+esc(recipe.id)+'">'+
     say("View recipe","Открыть рецепт")+'</button></article>';
  }).join("")+'</div>':
  '<p class="rg-note">'+say(
   "Nothing matches this filter yet. Add ingredients to Pantry & Root Cellar, or show all recipes.",
   "Пока нет подходящих рецептов. Добавьте продукты в кладовую и погреб или выберите все рецепты.")+'</p>')+
 '</section>';
}
function render(){
 const recipes=all();
 if(!recipes.some(r=>r.id===state.selected))state.selected="absinthe";
 const recipe=recipes.find(r=>r.id===state.selected);
 const selectedCategory=category(recipe);
 const multiplier=portionFactor(recipe);
 if(!activeCategory){
  root.innerHTML=recipeTabMarkup()+'<p class="rg-note">'+say("Select a category to view recipes. All categories start closed.","Выберите раздел для просмотра рецептов. Все разделы изначально закрыты.")+'</p>';
  return;
 }
 if(activeCategory==="cook"){
  root.innerHTML=recipeTabMarkup()+cookPlanner(recipes);
  return;
 }
 const categoryRecipes=recipes.filter(r=>category(r)===selectedCategory);
 const plants=inventory();
 const rows=recipe.ingredients.map(ing=>({ing,found:matched(ing,plants),ready:isReady(recipe,ing)}));
 const botanical=rows.filter(r=>r.ing.type==="garden");
 const available=botanical.filter(r=>r.found.length);
 const ready=rows.filter(r=>r.ready);
 const missing=rows.filter(r=>!r.ready);
 const newSeed=rows.filter(r=>r.ing.type==="garden"&&!r.found.length&&!r.ready);
 const extras=rows.filter(r=>r.ing.type==="pantry"&&!r.ready);
 const quantityScore=window.DKChefRecipeMatch?.evaluate(recipe,provisions(),multiplier);
 const readySummary=ready.length===rows.length?
  (quantityScore?.measuredShort?say("All ingredient names are present, but measured stock is insufficient for this quantity.",
     "Все ингредиенты есть, но измеренного запаса не хватает для выбранного количества."):
   say("All listed ingredients on hand. Confirm quantities, freshness and suitability before cooking.",
     "Все перечисленные ингредиенты есть. Перед приготовлением проверьте количество, свежесть и пригодность продуктов.")):
  say("Missing ingredients: ","Не хватает ингредиентов: ")+missing.length+".";
 root.innerHTML=recipeTabMarkup()+
  '<div class="rg-controls"><label for="rg-recipe">'+say("Choose a recipe","Выберите рецепт")+'<select id="rg-recipe">'+categoryRecipes.map(r=>'<option value="'+esc(r.id)+'"'+(r.id===recipe.id?" selected":"")+'>'+esc(localized(r,"name"))+'</option>').join("")+'</select></label>'+
  (recipe.id.startsWith("custom-")?'<button class="rg-button rg-danger" type="button" id="rg-remove">Delete this recipe</button>':"")+'</div>'+
  '<p class="rg-note">'+esc(recipe.family||"Personal recipe")+'</p>'+
  '<h3 class="rg-title">'+esc(localized(recipe,"name"))+'</h3><p class="rg-subtitle">'+esc(localized(recipe,"intro")||"Compare each ingredient with your seed inventory and pantry.")+'</p>'+
  (recipe.serves?'<p class="rg-yield"><strong>'+say("Yield: ","Выход: ")+'</strong>'+esc(localized(recipe,"serves"))+'</p>':"")+
  portionControl(recipe)+
  '<div class="rg-metrics"><div class="rg-metric"><strong>'+available.length+" / "+botanical.length+'</strong>'+say("Seed packets recorded (not food)","Есть семена (не пищевые продукты)")+'</div>'+
  '<div class="rg-metric"><strong>'+ready.length+" / "+rows.length+'</strong>'+say("Ingredients on hand","Ингредиенты в наличии")+'</div>'+
  '<div class="rg-metric"><strong>'+missing.length+'</strong>'+say("Still missing","Не хватает")+'</div></div>'+
  '<div class="rg-list">'+rows.map(({ing,found,ready})=>
   '<div class="rg-item'+(ready?" is-ready":"")+'"><div class="rg-topline"><span class="rg-ingredient">'+esc(localized(ing,"name"))+ingredientAmount(ing,multiplier)+'</span><label class="rg-check"><input type="checkbox" data-rg-ready="'+esc(ing.id)+'"'+(ready?" checked":"")+'> '+say("On hand","В наличии")+'</label></div>'+
   '<div class="rg-state '+(ready||found.length?"found":"missing")+'">'+(ready?say("✓ Ingredient on hand","✓ Ингредиент в наличии"):
  ing.type==="pantry"?say("Not marked on hand","Не отмечено в запасах"):
  found.length?say("Seeds recorded; edible ingredient not confirmed","Семена есть; пищевой ингредиент не подтверждён"):
  say("No matching seed recorded","Нет подходящих семян"))+'</div>'+
   recipeQuantityNote(ing,multiplier)+
   (found.length?'<p class="rg-matches">Your seed records: '+esc(found.join(", "))+'</p>':"")+
   (ing.note?'<p class="rg-detail">'+esc(ing.note)+'</p>':"")+'</div>'
  ).join("")+'</div>'+
  '<div class="rg-review"><h4>'+esc(readySummary)+'</h4>'+
  (newSeed.length?'<p class="rg-note">Not found in the seed bank: '+newSeed.map(r=>esc(r.ing.name)).join(", ")+'.</p>':"")+
  (extras.length?'<p class="rg-note">Other supplies not marked on hand: '+extras.map(r=>esc(r.ing.name)).join(", ")+'.</p>':"")+
  (missing.length?'<ul>'+missing.map(r=>'<li>'+esc(r.ing.name)+': '+(r.ing.type==="pantry"?"obtain/confirm supply":r.found.length?"grow, harvest or otherwise obtain usable ingredient":"obtain the seed or prepared ingredient")+'</li>').join("")+'</ul>':'<p class="rg-note">Every ingredient has been checked on hand.</p>')+'</div>'+
  (recipe.steps?.length?'<section class="rg-method"><h4>'+say("Preparation","Приготовление")+'</h4><ol>'+
     recipe.steps.map((step,index)=>'<li>'+esc(ru()&&recipe.stepsRu?.[index]?recipe.stepsRu[index]:step)+'</li>').join("")+
    '</ol></section>':recipe.method?'<p class="rg-note"><strong>Preparation:</strong> '+esc(recipe.method)+'</p>':"")+
  (recipe.caution?'<p class="rg-note"><strong>Important:</strong> '+esc(recipe.caution)+'</p>':"")+
  (recipe.sources&&recipe.sources.length?'<p class="rg-source">References: '+recipe.sources.map(s=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(s[1])+'">'+esc(s[0])+'</a>').join(" · ")+'</p>':"")+
  '<details class="rg-new" id="rg-new"><summary>Add your own recipe</summary><form class="rg-form" id="rg-form">'+
   '<label>Recipe name<input name="recipe" required maxlength="120" placeholder="My herb bread"></label>'+
   '<label>Ingredients, one per line<textarea name="ingredients" required maxlength="3000" placeholder="garden: rosemary&#10;garden: thyme&#10;pantry: flour&#10;pantry: water"></textarea></label>'+
   '<p class="rg-note">Start each line with <strong>garden:</strong> to match your seed collection, or <strong>pantry:</strong> for other supplies. Your recipes and on-hand marks stay in this browser and are included in full backups.</p>'+
   '<button class="rg-button" type="submit">Save recipe</button></form></details>'+
   '<p id="rg-feedback" class="rg-feedback" role="status"></p>';
}
root.addEventListener("change",event=>{
 const target=event.target;
 if(target.id==="rgYieldTarget"){
   const recipe=all().find(r=>r.id===state.selected),info=portionInfo(recipe);
   const targetPortions=Number(target.value);
   if(info&&target.value.trim()&&Number.isSafeInteger(targetPortions)&&targetPortions>=1&&targetPortions<=info.max)
    portionTargets[recipe.id]=targetPortions;
   else if(info)delete portionTargets[recipe.id];
   render();return;
  }
  if(target.id==="rg-recipe"){state.selected=target.value;persist();render();return;}
 if(target.hasAttribute("data-rg-ready")){
  const recipe=all().find(r=>r.id===state.selected);
  const ing=recipe?.ingredients?.find(i=>i.id===target.getAttribute("data-rg-ready"));
  if(ing&&!setIngredientReady(recipe,ing,target.checked))alert("Could not save your Pantry change.");
 }
});
root.addEventListener("click",event=>{
 if(event.target.closest?.("[data-rg-reset-yield]")){
  delete portionTargets[state.selected];render();return;
 }
 const open=event.target.closest?.("[data-rg-open-recipe]");
 if(open){
  const recipe=all().find(r=>r.id===open.getAttribute("data-rg-open-recipe"));
  if(recipe){state.selected=recipe.id;activeCategory=category(recipe);persist();render();}
  return;
 }
 const filter=event.target.closest?.("[data-rg-cook-filter]");
 if(filter){
  const value=filter.getAttribute("data-rg-cook-filter");
  cookFilter=["all","ready","near"].includes(value)?value:"all";
  render();return;
 }
 const section=event.target.closest?.("[data-rg-section]");
 if(section){
  const group=section.getAttribute("data-rg-section");
  if(activeCategory===group){activeCategory=null;render();return;}
  if(group==="cook"){activeCategory="cook";cookFilter="all";render();return;}
  const recipes=all(),next=recipes.find(r=>category(r)===group);
  if(next){
   const current=recipes.find(r=>r.id===state.selected);
   if(!current||category(current)!==group)state.selected=next.id;
   activeCategory=group;persist();render();
  }
  return;
 }
 if(event.target.id!=="rg-remove")return;
 const r=all().find(x=>x.id===state.selected);
 if(!r||!r.id.startsWith("custom-")||!confirm('Delete "'+r.name+'" and its on-hand marks?'))return;
 state.custom=state.custom.filter(x=>x.id!==r.id);
 for(const id of Object.keys(state.ready))if(id.startsWith(r.id+"/"))delete state.ready[id];
 state.selected="absinthe";activeCategory=null;persist();render();
});
root.addEventListener("submit",event=>{
 if(event.target.id!=="rg-form")return;
 event.preventDefault();
 const form=event.target,name=String(form.elements.recipe.value||"").trim();
 const lines=String(form.elements.ingredients.value||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,50);
 if(!name||!lines.length)return;
 const ingredients=lines.map((line,index)=>{
  let type="garden",value=line;
  const match=line.match(/^(garden|pantry)\s*:\s*(.+)$/i);
  if(match){type=match[1].toLowerCase();value=match[2];}
  value=value.trim();
  return item("ingredient-"+index,value,type,type==="garden"?[value]:[]);
 }).filter(x=>x.name.length);
 if(!ingredients.length)return;
 const id="custom-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
 state.custom.push({id,name,ingredients,family:"My recipe",intro:"Custom ingredient checklist."});
 state.selected=id;activeCategory="personal";
 if(!persist())alert("Local storage is unavailable. Export your DK Chef Companion backup when possible.");
 render();
});
document.getElementById("dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(render));
const recipePanel=document.getElementById("recipeGuide");
recipePanel?.addEventListener("toggle",()=>{
 if(recipePanel.open){activeCategory=null;render();}
});
checkProvisions();persist();
window.DKSeedBankRecipes=Object.freeze({
 provisionKey,provisions:()=>JSON.parse(JSON.stringify(state.provisions)),isIngredientReady:ingredient=>isReady(null,ingredient),
 saveProvision,removeProvision,setIngredientReady,postHarvestAllocation,
 exportData:()=>JSON.parse(JSON.stringify(state)),
 importData:data=>{
  if(!data||typeof data!=="object"||!Array.isArray(data.custom)||!data.ready||typeof data.ready!=="object")return false;
  state={...initial(),...data,custom:data.custom.filter(r=>r&&typeof r.id==="string"&&Array.isArray(r.ingredients)).slice(0,100)};
  checkProvisions();
  if(!persist())return false;
  provisionNotify();render();return true;
 },
 refresh:render
});
render();
})();
