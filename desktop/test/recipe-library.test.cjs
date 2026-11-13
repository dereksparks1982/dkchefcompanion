"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const librarySource=fs.readFileSync(path.join(root,"assets/seedbank-recipe-library.js"),"utf8");
const recipeSource=fs.readFileSync(path.join(root,"assets/seedbank-recipes.js"),"utf8");
function environment({lang="en",saved}={}){
 const win={DKSeedBankCore:{plants:()=>new Map()}};
 vm.runInNewContext(librarySource,{window:win},{filename:"seedbank-recipe-library.js"});
 const host={innerHTML:"",listeners:{},addEventListener(type,cb){this.listeners[type]=cb;}};
 const language={listeners:{},addEventListener(type,cb){this.listeners[type]=cb;}};
 const document={
  documentElement:{lang},
  getElementById:id=>id==="recipeApp"?host:id==="dkLanguageSelect"?language:null
 };
 const values=new Map();
 if(saved)values.set("dk-seedbank-recipes-v1",JSON.stringify(saved));
 const localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value)};
 vm.runInNewContext(recipeSource,{
  window:win,document,localStorage,queueMicrotask:fn=>fn(),confirm:()=>true,
  console
 },{filename:"seedbank-recipes.js"});
 return {win,host,language,document,values};
}
test("existing four recipes remain in the library",()=>{
 const source=recipeSource;
 for(const id of ["absinthe","pesto","salsa","pickles"])
  assert.ok(source.includes('id:"'+id+'"'),id);
 const env=environment();
 assert.match(env.host.innerHTML,/Meals & Kitchen/);
 assert.doesNotMatch(env.host.innerHTML,/Traditional absinthe/);
 assert.doesNotMatch(env.host.innerHTML,/id="rg-recipe"/);
 env.host.listeners.click({target:{id:"",closest:()=>({getAttribute:()=>"historical"})}});
 assert.match(env.host.innerHTML,/Traditional absinthe/);
});
test("four added meals have ingredients, amounts, and complete methods",()=>{
 const lib=environment().win.DKSeedBankRecipeLibrary.recipes;
 const meals=["salisbury-steak","chicken-tikka-masala","classic-meatloaf","ratatouille"];
 for(const id of meals){
  const recipe=lib.find(r=>r.id===id);
  assert.ok(recipe,id);
  assert.ok(recipe.ingredients.length>=8,id);
  assert.ok(recipe.ingredients.every(i=>i.amount&&i.amountRu&&i.nameRu),id);
  assert.ok(recipe.steps.length>=3,id);
  assert.equal(recipe.steps.length,recipe.stepsRu.length,id);
 }
});
test("spice section contains only multi-ingredient mixtures, never single spices",()=>{
 const lib=environment().win.DKSeedBankRecipeLibrary.recipes;
 const blends=lib.filter(r=>r.family==="Spice Blends");
 assert.equal(blends.length,7);
 assert.ok(blends.every(r=>r.ingredients.length>=3));
 assert.ok(blends.some(r=>r.id==="curry-powder"));
 assert.ok(blends.some(r=>r.id==="five-spice"));
 assert.ok(blends.some(r=>r.id==="allspice-substitute"));
 assert.ok(!blends.some(r=>r.name==="Allspice"));
});
test("Spice Blends tab switches recipes and preserves ingredient checks",()=>{
 const env=environment();
 env.host.listeners.click({target:{
  id:"",closest:()=>({getAttribute:()=>"spices"})
 }});
 assert.match(env.host.innerHTML,/Homemade curry powder/);
 assert.match(env.host.innerHTML,/class="rg-method"/);
 assert.match(env.host.innerHTML,/2 tbsp/);
 env.host.listeners.change({target:{id:"rg-recipe",value:"five-spice"}});
 env.host.listeners.change({target:{
  id:"",hasAttribute:()=>true,getAttribute:()=>"star-anise",checked:true
 }});
 const saved=JSON.parse(env.values.get("dk-seedbank-recipes-v1"));
 assert.ok(saved.provisions.items.some(x=>x.key==="ground star anise"&&x.available===true));
});
test("Russian headings, directions, and amounts render without losing selected recipe",()=>{
 const env=environment();
 env.host.listeners.click({target:{id:"",closest:()=>({getAttribute:()=>"spices"})}});
 env.host.listeners.change({target:{id:"rg-recipe",value:"five-spice"}});
 env.document.documentElement.lang="ru";
 env.language.listeners.change();
 assert.match(env.host.innerHTML,/Китайская смесь/);
 assert.match(env.host.innerHTML,/Смеси специй/);
 assert.match(env.host.innerHTML,/ч\. л\./);
 assert.match(env.host.innerHTML,/Бадьян/);
});
test("previously saved recipe selections and custom recipes are retained",()=>{
 const original={
  version:1,selected:"custom-previous",ready:{"custom-previous/ingredient-0":true},
  custom:[{id:"custom-previous",name:"Family soup",family:"My recipe",
   ingredients:[{id:"ingredient-0",name:"Fresh thyme",type:"garden",aliases:["thyme"]}]}]
 };
 const env=environment({saved:original});
 assert.doesNotMatch(env.host.innerHTML,/Family soup/);
 env.host.listeners.click({target:{id:"",closest:()=>({getAttribute:()=>"personal"})}});
 assert.match(env.host.innerHTML,/Family soup/);
 const after=JSON.parse(env.values.get("dk-seedbank-recipes-v1")||JSON.stringify(original));
 assert.equal(after.ready["custom-previous/ingredient-0"],true);
 assert.equal(after.custom.length,1);
});

test("recipe category buttons are initially closed and toggle closed",()=>{
 const env=environment();
 assert.doesNotMatch(env.host.innerHTML,/id="rg-recipe"/);
 env.host.listeners.click({target:{id:"",closest:()=>({getAttribute:()=>"kitchen"})}});
 assert.match(env.host.innerHTML,/id="rg-recipe"/);
 env.host.listeners.click({target:{id:"",closest:()=>({getAttribute:()=>"kitchen"})}});
 assert.doesNotMatch(env.host.innerHTML,/id="rg-recipe"/);
});
test("Food Preservation is a separate top-level tab immediately below Recipe Guide",()=>{
 for(const file of ["index.html","docs/index.html"]){
  const source=fs.readFileSync(path.join(root,file),"utf8");
  const recipe=source.indexOf('<details id="recipeGuide"');
  const preservation=source.indexOf('<details id="dkPreservationGuide"');
  const line=source.indexOf('<div class="result-line">');
  assert.ok(recipe>=0&&preservation>recipe&&line>preservation,file);
  assert.ok(source.slice(recipe,preservation).includes('</details>'));
 }
 const guide=fs.readFileSync(path.join(root,"assets/seedbank-field-guides.js"),"utf8");
 assert.ok(guide.includes('preservationPanel=$("#dkPreservationGuide")'));
 assert.ok(!guide.includes("recipePanel.appendChild(preservationPanel)"));
});

test("two new classic sauces have measured ingredients and Russian instructions",()=>{
 const recipes=environment().win.DKSeedBankRecipeLibrary.recipes;
 const target=["homemade-spaghetti-sauce","classic-hollandaise"];
 for(const id of target){
  const recipe=recipes.find(r=>r.id===id);
  assert.ok(recipe,id+" missing");
  assert.equal(recipe.family,"Kitchen");
  assert.ok(recipe.ingredients.length>=6,id);
  assert.ok(recipe.ingredients.every(i=>i.id&&i.name&&i.nameRu&&i.amount&&i.amountRu),id);
  assert.ok(recipe.steps.length>=4,id);
  assert.equal(recipe.steps.length,recipe.stepsRu.length,id);
 }
 const sauce=recipes.find(r=>r.id===target[0]);
 assert.match(sauce.steps.join(" "),/simmer/i);
 assert.match(sauce.steps.join(" "),/not use this recipe for shelf-stable home canning/i);
 assert.ok(sauce.ingredients.some(i=>i.name.includes("Ground beef")&&i.amount.includes("optional")===false));
 const holl=recipes.find(r=>r.id===target[1]);
 assert.match(holl.steps.join(" "),/clarified butter/);
 assert.match(holl.steps.join(" "),/ordinary melted butter/);
 assert.match(holl.steps.join(" "),/skim off white foam/i);
 assert.match(holl.steps.join(" "),/white pepper/);
 assert.match(holl.steps.join(" "),/pasteurized/);
 assert.match(holl.stepsRu.join(" "),/осветлённого масла/);
});
test("sauce recipes appear in the kitchen picker in English and Russian",()=>{
 const en=environment();
 en.host.listeners.click({target:{id:"",closest:()=>({getAttribute:()=>"kitchen"})}});
 assert.match(en.host.innerHTML,/Homemade spaghetti sauce/);
 assert.match(en.host.innerHTML,/Classic Hollandaise sauce/);
 en.host.listeners.change({target:{id:"rg-recipe",value:"classic-hollandaise"}});
 assert.match(en.host.innerHTML,/skim off white foam/i);
 en.document.documentElement.lang="ru";
 en.language.listeners.change();
 assert.match(en.host.innerHTML,/Классический голландский соус/);
 assert.match(en.host.innerHTML,/пастеризованные желтки/);
 for(const file of ["index.html","docs/index.html"]){
  const html=fs.readFileSync(path.join(root,file),"utf8");
  assert.match(html,/seedbank-recipe-library\\.js\\?v=20261112-breads1/);
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
 }
 assert.match(fs.readFileSync(path.join(root,"sw.js"),"utf8"),/dk-seedbank-app-v57/);
});

test("Bread & Baking includes ten complete bilingual breads, with naan for tikka masala",()=>{
 const env=environment();
 const breads=env.win.DKSeedBankRecipeLibrary.recipes.filter(x=>x.family==="Bread & Baking");
 assert.equal(breads.length,10);
 assert.ok(breads.some(x=>x.id==="traditional-naan"));
 assert.ok(breads.some(x=>x.id==="garlic-naan"));
 assert.ok(breads.some(x=>x.id==="sourdough-boule"));
 for(const bread of breads){
  assert.ok(bread.ingredients.length>=4,bread.id);
  assert.ok(bread.ingredients.every(i=>i.amount&&i.amountRu&&i.nameRu),bread.id);
  assert.ok(bread.steps.length>=4,bread.id);
  assert.equal(bread.steps.length,bread.stepsRu.length,bread.id);
 }
 env.host.listeners.click({target:{id:"",closest:()=>({getAttribute:()=>"bread"})}});
 assert.match(env.host.innerHTML,/Garlic and cilantro naan/);
 env.document.documentElement.lang="ru";env.language.listeners.change();
 assert.match(env.host.innerHTML,/Хлеб и выпечка/);
 assert.match(env.host.innerHTML,/Наан/);
});
test("Old per-recipe ticks become shared Pantry ingredients across recipes",()=>{
 const saved={version:1,selected:"pesto",custom:[],ready:{"pesto/oil":true,"pesto/salt":true}};
 const env=environment({saved}),api=env.win.DKSeedBankRecipes;
 assert.ok(api.provisions().items.some(x=>x.key==="olive oil"));
 assert.equal(api.isIngredientReady({name:"Olive oil"}),true);
 assert.equal(api.isIngredientReady({name:"Salt"}),true);
 assert.equal(api.isIngredientReady({name:"Salt and black pepper"}),false);
 assert.equal(api.setIngredientReady({id:"pesto"},{name:"Salt"},false),true);
 assert.equal(api.isIngredientReady({name:"Salt"}),false);
 assert.ok(api.provisions().items.some(x=>x.key==="salt"&&x.available===false));
});
