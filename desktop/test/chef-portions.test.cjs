"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../.."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("assets/dk-chef-recipe-match.js"),ui=read("assets/seedbank-recipes.js");
function matcher(){
 const window={};vm.runInNewContext(source,{window});return window.DKChefRecipeMatch;
}
const row=(amount,opts={})=>({id:"flour-1",name:"All-purpose flour",ingredient:"All-purpose flour",key:"all purpose flour",
 location:"pantry",available:true,packages:1,amount,size:"",...opts});
function app(){
 const saved={version:2,ready:{},custom:[],selected:"bread-test",provisions:{
  version:1,migrated:true,items:[row("500 g")],deleted:[]}};
 const storage=new Map([["dk-seedbank-recipes-v1",JSON.stringify(saved)]]);
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 const listeners={},host={innerHTML:"",addEventListener:(k,fn)=>listeners[k]=fn};
 const lang={addEventListener:(k,fn)=>lang.listener=fn};
 const document={documentElement:{lang:"en"},getElementById:id=>id==="recipeApp"?host:id==="dkLanguageSelect"?lang:null};
 const window={DKSeedBankCore:{plants:()=>new Map()}};
 vm.runInNewContext(source,{window});
 window.DKSeedBankRecipeLibrary={recipes:[{id:"bread-test",name:"Bread test",family:"Bread & Baking",
  nameRu:"Проверка хлеба",serves:"Serves 4",servesRu:"4 порции",ingredients:[
   {id:"flour",name:"All-purpose flour",nameRu:"Пшеничная мука",amount:"300 g",amountRu:"300 г",type:"pantry"},
   {id:"onion",name:"Onion",nameRu:"Лук",amount:"1 medium",amountRu:"1 средняя",type:"garden"}]}]};
 vm.runInNewContext(ui,{window,document,localStorage,queueMicrotask:fn=>fn(),confirm:()=>true,console});
 const click=(name,value)=>listeners.click({target:{closest(s){
  if(name==="section"&&s==="[data-rg-section]")return {getAttribute:()=>value};
  if(name==="reset"&&s==="[data-rg-reset-yield]")return {getAttribute:()=>""};
  return null;
 }}});
 const change=value=>listeners.change({target:{id:"rgYieldTarget",value}});
 return {window,host,document,lang,storage,saved,click,change};
}
test("allows only unambiguous serving and bread yields",()=>{
 const m=matcher();
 for(const [input,base]of [["Serves 4",4],["Makes 8 naan",8],["Makes 12 rolls",12],
  ["Makes 1 loaf (9 × 5 in / 23 × 13 cm pan)",1]]){
  assert.equal(m.yieldInfo({serves:input}).base,base,input);
 }
 for(const input of ["Serves 4–6","Makes about ⅓ cup","Makes 2 tsp",""]){
  assert.equal(m.yieldInfo({serves:input}),null,input);
 }
 assert.equal(m.yieldFactor({serves:"Serves 4"},8),2);
 assert.equal(m.yieldFactor({serves:"Serves 4"},999),1);
});
test("displayed amounts use sensible fractions and keep vague quantities manual",()=>{
 const m=matcher();
 assert.equal(m.scaledAmount({amount:"½ cup"},2).label,"1 cup");
 assert.equal(m.scaledAmount({amount:"1½ lb (680 g)"},2).label,"3 lb");
 assert.equal(m.scaledAmount({amount:"2 medium"},2).status,"manual");
 assert.equal(m.scaledAmount({amount:"2 tsp dried or 1 tbsp fresh"},2).status,"manual");
 assert.match(m.scaledAmount({amount:"300 g",amountRu:"300 г"},2,"ru").label,/600 г/);
});
test("pantry quantity checks scale up without deducting or counting nonfood",()=>{
 const m=matcher(),ing={name:"All-purpose flour",amount:"300 g"},stock=[row("500 g")],before=JSON.stringify(stock);
 assert.equal(m.assessQuantity(ing,stock).status,"enough");
 assert.equal(m.assessQuantity(ing,stock,2).status,"short");
 assert.equal(m.assessQuantity(ing,[row("1000 g",{location:"medicine"})],2).status,"not-on-hand");
 assert.equal(JSON.stringify(stock),before);
});
test("real Recipe Guide controls scale, reject invalid input, reset, and preserve storage",()=>{
 const h=app();h.click("section","bread");
 assert.match(h.host.innerHTML,/rgYieldTarget/);
 assert.match(h.host.innerHTML,/value="4"/);
 h.change("8");
 assert.match(h.host.innerHTML,/value="8"/);
 assert.match(h.host.innerHTML,/600 g/);
 assert.match(h.host.innerHTML,/Measured shortfall/);
 assert.match(h.host.innerHTML,/Adjust manually for this yield/);
 assert.deepEqual(JSON.parse(h.storage.get("dk-seedbank-recipes-v1")).provisions,h.saved.provisions);
 h.click("reset");assert.match(h.host.innerHTML,/value="4"/);
 h.change("999");assert.match(h.host.innerHTML,/value="4"/);
});
test("Russian scaled amounts and pantry finder use session-only targets",()=>{
 const h=app();h.click("section","bread");
 h.document.documentElement.lang="ru";h.lang.listener();
 assert.match(h.host.innerHTML,/Планируемое количество/);
 h.change("8");
 assert.match(h.host.innerHTML,/600 г/);
 assert.match(h.host.innerHTML,/Пересчитайте количество вручную/);
 h.click("section","cook");
 assert.match(h.host.innerHTML,/Планируемый выход/);
 assert.match(h.host.innerHTML,/8 порций/);
 assert.deepEqual(JSON.parse(h.storage.get("dk-seedbank-recipes-v1")).provisions,h.saved.provisions);
});
test("both web routes stay scanner-singleton and quantity modules load in order",()=>{
 for(const p of ["index.html","docs/index.html"]){
  const html=read(p);
  assert.ok(html.indexOf("dk-chef-recipe-match.js")<html.indexOf("seedbank-recipes.js"));
  assert.equal((html.match(/id="dkProductStation"/g)||[]).length,1);
 }
 assert.match(read("README.md"),/Optional recipe portions and batch yields/);
 assert.match(read("sw.js"),/Recipe portion controls update/);
 assert.doesNotThrow(()=>new Function(ui));
 assert.doesNotThrow(()=>new Function(source));
});

test("Russian amounts and planned yields use grammatical singular and plural forms",()=>{
 const m=matcher();
 assert.equal(m.scaledAmount({amount:"1 egg"},2,"ru").label,"2 яйца");
 assert.equal(m.scaledAmount({amount:"2 eggs"},2.5,"ru").label,"5 яиц");
 const h=app();
 h.document.documentElement.lang="ru";h.click("section","bread");
 h.change("2");h.click("section","cook");
 assert.match(h.host.innerHTML,/2 порции/);
 h.click("section","bread");
 h.change("8");h.click("section","cook");
 assert.match(h.host.innerHTML,/8 порций/);
});
