/* DK Chef Companion: read-only recipe-to-pantry matching.
   This module makes no localStorage writes, consumes no stock, and never
   treats seed packets, medicine or household supplies as edible food. */
(function(root){
"use strict";
const canonical={
 "fine salt":"salt","sea salt":"salt","table salt":"salt",
 "extra virgin olive oil":"olive oil","extra virgin oil":"olive oil",
 "all purpose flour":"all purpose flour","plain flour":"all purpose flour",
 "fresh garlic":"garlic","garlic cloves":"garlic","cloves of garlic":"garlic",
 "ripe tomatoes":"tomatoes","fresh tomatoes":"tomatoes","tomato":"tomatoes",
 "potato":"potatoes","canned peas":"peas","sweet peas":"peas",
 "peas":"peas","green beans":"green beans",
 "yellow onion":"onion","white onion":"onion","onions":"onion",
 "fresh lemon juice":"lemon juice","fresh lime juice":"lime juice",
 "fresh cilantro":"cilantro","cilantro leaves":"cilantro",
 "scallions":"green onions","spring onions":"green onions",
 "ground black pepper":"black pepper","ground white pepper":"white pepper",
 "eggs":"eggs","large eggs":"eggs","egg":"eggs",
 "granulated sugar":"sugar"
};
const substitutes={
 "pine nuts":["walnuts"],"walnuts":["pine nuts"],"sour cream":["plain yogurt"],
 "plain yogurt":["sour cream"],"lemon juice":["lime juice"],"lime juice":["lemon juice"],
 "buttermilk":["plain yogurt"],"white wine vinegar":["apple cider vinegar"]
};
function normalize(value){
 const raw=String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/\([^)]*\)/g," ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
 return canonical[raw]||raw;
}
function alternatives(name){
 const raw=String(name||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/\([^)]*\)/g," ").replace(/[^a-z0-9 ]+/g," ").trim();
 // "or" denotes a recipe-approved alternative. Do not invent other choices.
 const split=raw.split(/\s+or\s+/).map(normalize).filter(Boolean);
 return split.length>1&&split.length<=3?[normalize(raw),...split]:[normalize(raw)];
}
function isEdibleStock(row){
 return row&&["pantry","cellar"].includes(row.location)&&row.available!==false&&
  (row.packages==null||Number(row.packages)>0);
}
function stockKey(row){
 // "ingredient" is the explicit food identity chosen by the user when
 // scanning branded packages. Never guess from a product description.
 return normalize(row.ingredient||row.key||row.name||"");
}
function matches(ingredient,records){
 const keys=alternatives(ingredient?.name||"");
 return (Array.isArray(records)?records:[]).filter(row=>isEdibleStock(row)&&keys.includes(stockKey(row)));
}
function suggestion(ingredient,records){
 const keys=alternatives(ingredient?.name||"");
 for(const key of keys){
  const candidates=substitutes[key]||[];
  for(const candidate of candidates){
   const found=(Array.isArray(records)?records:[]).find(row=>isEdibleStock(row)&&stockKey(row)===candidate);
   if(found)return {item:found.name||candidate,for:ingredient.name,recordId:found.id||""};
  }
 }
 return null;
}
function evaluate(recipe,records,multiplier=1){
 const ingredients=Array.isArray(recipe?.ingredients)?recipe.ingredients:[];
 const details=ingredients.map(ing=>{
  const stock=matches(ing,records);
  return {ingredient:ing,ready:stock.length>0,stocks:stock,
   quantity:assessQuantity(ing,records,multiplier),suggestion:stock.length?null:suggestion(ing,records)};
 });
 const ready=details.filter(x=>x.ready).length,missing=details.filter(x=>!x.ready);
 return {recipe,ready,total:details.length,missing,details,
  measuredEnough:details.filter(x=>x.quantity.status==="enough").length,
  measuredShort:details.filter(x=>x.quantity.status==="short").length,
  quantityUnverified:details.filter(x=>x.ready&&["not-specified","unverified"].includes(x.quantity.status)).length,
  complete:details.length>0&&missing.length===0,
  near:missing.length>0&&missing.length<=2&&ready>0,
  coverage:details.length?ready/details.length:0};
}
function rank(recipes,records,factors=null){
 return (Array.isArray(recipes)?recipes:[])
  .filter(recipe=>recipe?.ingredients?.length&&recipe.family!=="Historical botanical checklist")
  .map(recipe=>evaluate(recipe,records,typeof factors==="function"?factors(recipe):1))
  .sort((a,b)=>Number(b.complete)-Number(a.complete)||
    a.missing.length-b.missing.length||b.coverage-a.coverage||
    String(a.recipe.name||"").localeCompare(String(b.recipe.name||"")));
}

// Advisory checks only. Explicit amount is TOTAL stock; size is PER PACKAGE.
// Never infer that mass, volume, or different counted objects are interchangeable.
const fractions={"½":" 1/2","⅓":" 1/3","⅔":" 2/3","¼":" 1/4","¾":" 3/4",
 "⅛":" 1/8","⅜":" 3/8","⅝":" 5/8","⅞":" 7/8"};
const units={
 g:["g",1],gram:["g",1],grams:["g",1],kg:["g",1000],kilogram:["g",1000],kilograms:["g",1000],
 mg:["g",0.001],oz:["g",28.349523125],ounce:["g",28.349523125],ounces:["g",28.349523125],
 lb:["g",453.59237],lbs:["g",453.59237],pound:["g",453.59237],pounds:["g",453.59237],
 ml:["ml",1],milliliter:["ml",1],milliliters:["ml",1],millilitre:["ml",1],millilitres:["ml",1],
 l:["ml",1000],liter:["ml",1000],liters:["ml",1000],litre:["ml",1000],litres:["ml",1000],
 tsp:["ml",4.92892159375],teaspoon:["ml",4.92892159375],teaspoons:["ml",4.92892159375],
 tbsp:["ml",14.78676478125],tablespoon:["ml",14.78676478125],tablespoons:["ml",14.78676478125],
 cup:["ml",236.5882365],cups:["ml",236.5882365],
 "fl oz":["ml",29.5735295625],"fluid ounce":["ml",29.5735295625],
 "fluid ounces":["ml",29.5735295625],pint:["ml",473.176473],pints:["ml",473.176473],
 quart:["ml",946.352946],quarts:["ml",946.352946],
 clove:["clove",1],cloves:["clove",1],egg:["egg",1],eggs:["egg",1],
 can:["can",1],cans:["can",1],leaf:["leaf",1],leaves:["leaf",1],
 piece:["piece",1],pieces:["piece",1]
};
function parseQuantity(value){
 let raw=String(value??"").toLowerCase().trim();
 if(!raw||/\s+or\s+/.test(raw))return null;
 for(const [symbol,part]of Object.entries(fractions))raw=raw.replaceAll(symbol,part);
 raw=raw.trim();
 if(/^(?:about\b|approx(?:\.|\b)|approximately\b|roughly\b)/.test(raw))return null;
 const number=raw.match(/^(\d+\/\d+)|^(\d+(?:\.\d+)?)(?:\s+(\d+\/\d+))?/);
 if(!number)return null;
 let count=0;
 if(number[1]){const [a,b]=number[1].split("/").map(Number);count=a/b;}
 else{
  count=Number(number[2]);
  if(number[3]){const [a,b]=number[3].split("/").map(Number);count+=a/b;}
 }
 if(!Number.isFinite(count)||count<=0)return null;
 const rest=raw.slice(number[0].length).trim();
 if(/^(?:-|–|—|to\b)/.test(rest))return null;
 const known=Object.keys(units).sort((a,b)=>b.length-a.length).find(u=>
  rest===u||rest.startsWith(u+" ")||rest.startsWith(u+",")||rest.startsWith(u+";")||rest.startsWith(u+"("));
 if(!known)return null;
 const [unit,factor]=units[known];
 return {amount:count*factor,unit,original:String(value),count,displayUnit:known};
}
function assessQuantity(ingredient,records,multiplier=1){
 const stocked=matches(ingredient,records);
 if(!stocked.length)return {status:"not-on-hand"};
 const target=parseQuantity(ingredient?.amount);
 if(!target)return {status:"not-specified"};
 const ratio=Number.isFinite(multiplier)&&multiplier>0&&multiplier<=4?multiplier:1;
 const needed=target.amount*ratio;
 let measured=0,unknown=0;
 for(const row of stocked){
  const explicit=String(row.amount??"").trim();
  const found=parseQuantity(explicit||row.size);
  const packages=Number(row.packages??1);
  if(!found||found.unit!==target.unit||!Number.isSafeInteger(packages)||packages<=0){unknown++;continue;}
  measured+=found.amount*(explicit?1:packages);
 }
 const sufficient=measured+Math.max(0.000001,needed*1e-8)>=needed;
 return {status:sufficient?"enough":unknown?"unverified":"short",
  unit:target.unit,required:needed,measured,unknown};
}


// Scaling is an in-memory planning projection, not an inventory mutation.
// Ambiguous yields ("Serves 4–6", "Makes about ...") are deliberately excluded.
function yieldInfo(recipe){
 const raw=String(recipe?.serves||"").trim();
 const serves=raw.match(/^Serves\s+([1-9]\d?)\s*$/i);
 if(serves)return {base:Number(serves[1]),unit:"servings",max:Math.min(48,Number(serves[1])*4)};
 const makes=raw.match(/^Makes\s+([1-9]\d?)\s+(naan|pitas?|chapati|rolls?|biscuits?|wedges?|loaves?|loaf)(?:\s*\([^)]*\))?\s*$/i);
 if(!makes)return null;
 const base=Number(makes[1]),unit=makes[2].toLowerCase();
 return {base,unit,max:Math.min(48,base*4)};
}
function yieldFactor(recipe,target){
 const info=yieldInfo(recipe);
 if(!info)return 1;
 const amount=Number(target);
 return Number.isSafeInteger(amount)&&amount>=1&&amount<=info.max?amount/info.base:1;
}
function prettyNumber(value){
 const whole=Math.floor(value+1e-9),rem=value-whole;
 const fractions=[
  [1/8,"⅛"],[1/6,"1/6"],[1/4,"¼"],[1/3,"⅓"],[3/8,"⅜"],
  [1/2,"½"],[5/8,"⅝"],[2/3,"⅔"],[3/4,"¾"],[5/6,"5/6"],[7/8,"⅞"]
 ];
 const nearby=fractions.find(([n])=>Math.abs(n-rem)<0.001);
 if(nearby)return whole?whole+nearby[1]:nearby[1];
 if(Math.abs(rem)<0.001)return String(whole);
 return String(Number(value.toFixed(3)));
}
function scaledAmount(ingredient,multiplier=1,language="en"){
 const original=String(ingredient?.amount||"").trim();
 if(!original)return {status:"missing",original};
 if(multiplier===1)return {status:"original",label:language==="ru"?String(ingredient?.amountRu||original):original,original};
 const parsed=parseQuantity(original);
 if(!parsed||!Number.isFinite(multiplier)||multiplier<=0||multiplier>4)
  return {status:"manual",original};
 if(language==="ru"){
  const labels={g:"г",ml:"мл",clove:"зубчиков",egg:"яиц",can:"банок",leaf:"листьев",piece:"шт."};
  const amount=parsed.amount*multiplier;
  return {status:"scaled",label:prettyNumber(amount)+" "+(labels[parsed.unit]||""),original};
 }
 const plural={cup:"cups",teaspoon:"teaspoons",tablespoon:"tablespoons",clove:"cloves",
  egg:"eggs",can:"cans",leaf:"leaves",ounce:"ounces",pound:"pounds",gram:"grams",
  liter:"liters",litre:"litres",pint:"pints",quart:"quarts",piece:"pieces"};
 const quantity=parsed.count*multiplier;
 const unit=quantity===1?parsed.displayUnit:(plural[parsed.displayUnit]||parsed.displayUnit);
 return {status:"scaled",label:prettyNumber(quantity)+" "+unit,original};
}

root.DKChefRecipeMatch=Object.freeze({normalize,alternatives,isEdibleStock,stockKey,matches,suggestion,evaluate,rank,parseQuantity,assessQuantity,yieldInfo,yieldFactor,scaledAmount});
})(window);
