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
 assert.equal(saved.ready["five-spice/star-anise"],true);
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
