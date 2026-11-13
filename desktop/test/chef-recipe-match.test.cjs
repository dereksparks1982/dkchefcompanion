"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,"../..");
const read=pathName=>fs.readFileSync(path.join(base,pathName),"utf8");
const matcherSource=read("assets/dk-chef-recipe-match.js");
const coreSource=read("assets/seedbank-recipes.js");
const libSource=read("assets/seedbank-recipe-library.js");
function createMatcher(){const window={};vm.runInNewContext(matcherSource,{window});return window.DKChefRecipeMatch;}
function row(name,opts={}){return {name,ingredient:opts.ingredient||"",key:opts.key||name.toLowerCase(),location:opts.location||"pantry",
 available:opts.available!==false,packages:opts.packages===undefined?1:opts.packages,...opts};}
function environment(saved){
 const window={DKSeedBankCore:{plants:()=>new Map()}};
 vm.runInNewContext(libSource,{window});
 vm.runInNewContext(matcherSource,{window});
 const listeners={},host={innerHTML:"",addEventListener(k,fn){listeners[k]=fn;}};
 const language={addEventListener(k,fn){language.listener=fn;}};
 const document={documentElement:{lang:"en"},getElementById:id=>id==="recipeApp"?host:id==="dkLanguageSelect"?language:null};
 const mem=new Map();
 if(saved)mem.set("dk-seedbank-recipes-v1",JSON.stringify(saved));
 const localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};
 vm.runInNewContext(coreSource,{window,document,localStorage,confirm:()=>true,queueMicrotask:f=>f(),console});
 return {window,document,host,language,listeners,mem,api:window.DKSeedBankRecipes};
}
const click=(env,attr,value)=>env.listeners.click({target:{
 id:"",closest(selector){if(selector.includes("["+attr+"]"))return {getAttribute:key=>key===attr?value:null};return null;}
}});
test("only available kitchen food counts, never seeds, medicine, household or zero packages",()=>{
 const m=createMatcher();
 const ingredient={name:"Olive oil"};
 assert.equal(m.matches(ingredient,[row("Olive oil",{location:"medicine"})]).length,0);
 assert.equal(m.matches(ingredient,[row("Olive oil",{location:"household"})]).length,0);
 assert.equal(m.matches(ingredient,[row("Olive oil",{location:"pantry",packages:0})]).length,0);
 assert.equal(m.matches(ingredient,[row("Olive oil",{location:"cellar",available:false})]).length,0);
 assert.equal(m.matches(ingredient,[row("Olive oil",{location:"pantry",packages:2})]).length,1);
 assert.equal(m.matches({name:"Tomatoes"},[row("Seed packet: tomato",{location:"pantry"})]).length,0);
 assert.equal(m.matches({name:"Peas"},[row("Canned peas",{key:"canned peas",packages:1})]).length,1);
});
test("explicit named pantry ingredient on a branded scan counts across recipes",()=>{
 const m=createMatcher();
 const oil=row("Example Extra Virgin Oil",{key:"olive oil",ingredient:"Olive oil",barcode:"012345678901",packages:2});
 const match=m.matches({name:"Olive oil"},[oil]);
 assert.equal(match.length,1);
 assert.equal(match[0].barcode,"012345678901");
 assert.equal(m.matches({name:"Fresh garlic"},[row("Garlic",{key:"garlic"})]).length,1);
});
test("recipe-approved alternatives count, but unapproved swap suggestions do not",()=>{
 const m=createMatcher();
 const alt={name:"Pine nuts or walnuts"};
 assert.equal(m.matches(alt,[row("Walnuts",{key:"walnuts"})]).length,1);
 assert.equal(m.matches(alt,[row("Pine nuts",{key:"pine nuts"})]).length,1);
 assert.equal(m.matches(alt,[row("Almonds",{key:"almonds"})]).length,0);
 const missing={name:"Pine nuts"};
 const suggested=m.suggestion(missing,[row("Walnuts",{key:"walnuts"})]);
 assert.equal(suggested.item,"Walnuts");
 assert.equal(m.matches(missing,[row("Walnuts",{key:"walnuts"})]).length,0);
});
test("ranked recipe finder excludes historical checklist and never writes inventory",()=>{
 const m=createMatcher();
 const rows=[row("Olive oil",{key:"olive oil"}),row("Salt",{key:"salt"})];
 const before=JSON.stringify(rows);
 const recipes=[
  {id:"k1",family:"Kitchen",name:"One",ingredients:[{name:"Olive oil"},{name:"Salt"}]},
  {id:"k2",family:"Kitchen",name:"Two",ingredients:[{name:"Olive oil"},{name:"Garlic"}]},
  {id:"a",family:"Historical botanical checklist",name:"Absinthe",ingredients:[{name:"Suitable neutral spirit"}]}
 ];
 const results=m.rank(recipes,rows);
 assert.equal(results.length,2);
 assert.equal(results[0].recipe.id,"k1");
 assert.equal(results[0].complete,true);
 assert.equal(results[1].near,true);
 assert.equal(results[1].missing[0].ingredient.name,"Garlic");
 assert.equal(JSON.stringify(rows),before);
});
test("Cook from Pantry opens closed, filters across categories and opens the full recipe",()=>{
 const env=environment();
 assert.doesNotMatch(env.host.innerHTML,/rg-cook-guide/);
 assert.match(env.host.innerHTML,/Cook from Pantry/);
 assert.equal(env.api.saveProvision({name:"Olive oil",location:"pantry",packages:2}),true);
 assert.equal(env.api.saveProvision({name:"Salt",location:"cellar",packages:1}),true);
 click(env,"data-rg-section","cook");
 assert.match(env.host.innerHTML,/Cook from what you have/);
 assert.match(env.host.innerHTML,/Fresh basil pesto/);
 assert.match(env.host.innerHTML,/Missing:/);
 assert.doesNotMatch(env.host.innerHTML,/Traditional absinthe/);
 const before=JSON.stringify(env.api.provisions());
 click(env,"data-rg-cook-filter","ready");
 assert.match(env.host.innerHTML,/All ingredients on hand/);
 click(env,"data-rg-cook-filter","all");
 click(env,"data-rg-open-recipe","pesto");
 assert.match(env.host.innerHTML,/Fresh basil pesto/);
 assert.match(env.host.innerHTML,/data-rg-ready/);
 assert.equal(JSON.stringify(env.api.provisions()),before);
});
test("Russian pantry finder labels render without changing stored stock",()=>{
 const env=environment();
 click(env,"data-rg-section","cook");
 env.document.documentElement.lang="ru";
 env.language.listener();
 assert.match(env.host.innerHTML,/Что приготовить из ваших запасов/);
 assert.match(env.host.innerHTML,/Не хватает/);
 assert.match(env.host.innerHTML,/Все рецепты/);
 assert.match(env.host.innerHTML,/Продукты|продуктов/);
});
test("zero packages no longer satisfy global on-hand checkbox or finder",()=>{
 const env=environment();
 assert.equal(env.api.saveProvision({name:"Salt",location:"pantry",packages:0}),true);
 assert.equal(env.api.isIngredientReady({name:"Salt"}),false);
 click(env,"data-rg-section","cook");
 const m=env.window.DKChefRecipeMatch;
 assert.equal(m.matches({name:"Salt"},env.api.provisions().items).length,0);
});
test("routes load matcher before existing recipes, cache offline, README documents no consumption",()=>{
 for(const page of ["index.html","docs/index.html"]){
  const html=read(page);
  const matcher=html.indexOf("dk-chef-recipe-match.js?v=20261113-cook1");
  const recipes=html.indexOf("seedbank-recipes.js?v=20261113-cook1");
  assert.ok(matcher>0&&recipes>matcher,page);
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
  assert.equal((html.match(/id="dkProductStation"/g)||[]).length,1);
 }
 assert.match(read("sw.js"),/dk-seedbank-app-v60/);
 assert.match(read("sw.js"),/"assets\/dk-chef-recipe-match.js"/);
 assert.match(read("README.md"),/never automatically counted|never automatically count|never automatically deducted|not deducted/i);
 assert.doesNotThrow(()=>new Function(matcherSource));
 assert.doesNotThrow(()=>new Function(coreSource));
});
