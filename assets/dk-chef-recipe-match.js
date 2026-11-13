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
function evaluate(recipe,records){
 const ingredients=Array.isArray(recipe?.ingredients)?recipe.ingredients:[];
 const details=ingredients.map(ing=>{
  const stock=matches(ing,records);
  return {ingredient:ing,ready:stock.length>0,stocks:stock,
   suggestion:stock.length?null:suggestion(ing,records)};
 });
 const ready=details.filter(x=>x.ready).length,missing=details.filter(x=>!x.ready);
 return {recipe,ready,total:details.length,missing,details,
  complete:details.length>0&&missing.length===0,
  near:missing.length>0&&missing.length<=2&&ready>0,
  coverage:details.length?ready/details.length:0};
}
function rank(recipes,records){
 return (Array.isArray(recipes)?recipes:[])
  .filter(recipe=>recipe?.ingredients?.length&&recipe.family!=="Historical botanical checklist")
  .map(recipe=>evaluate(recipe,records))
  .sort((a,b)=>Number(b.complete)-Number(a.complete)||
    a.missing.length-b.missing.length||b.coverage-a.coverage||
    String(a.recipe.name||"").localeCompare(String(b.recipe.name||"")));
}
root.DKChefRecipeMatch=Object.freeze({normalize,alternatives,isEdibleStock,stockKey,matches,suggestion,evaluate,rank});
})(window);
