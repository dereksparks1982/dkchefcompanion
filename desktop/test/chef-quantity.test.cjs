"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const base=path.resolve(__dirname,"../.."),read=p=>fs.readFileSync(path.join(base,p),"utf8");
function match(){const window={};vm.runInNewContext(read("assets/dk-chef-recipe-match.js"),{window});return window.DKChefRecipeMatch;}
const item=(amount,other={})=>({name:"Flour",ingredient:"All-purpose flour",location:"pantry",packages:1,available:true,amount,size:"",...other});
test("unit parser handles mixed fractions, metric and imperial; ambiguous amounts unverified",()=>{
 const m=match();
 assert.ok(Math.abs(m.parseQuantity("1½ lb").amount-680.388555)<0.01);
 assert.ok(Math.abs(m.parseQuantity("⅓ cup").amount-78.8627455)<0.01);
 assert.ok(Math.abs(m.parseQuantity("1/2 tsp").amount-2.4644608)<0.01);
 for(const x of ["¼–½ tsp","1 tsp dried or 2 tbsp fresh","to taste","1 large"])assert.equal(m.parseQuantity(x),null);
 assert.equal(m.parseQuantity("2 eggs").unit,"egg");
});
test("explicit stock total is not multiplied; per-package size is",()=>{
 const m=match(),ing={name:"All-purpose flour",amount:"1 lb"};
 const a=m.assessQuantity(ing,[item("500 g",{packages:3})]);
 assert.equal(a.status,"enough");assert.ok(a.measured<1000);
 const b=m.assessQuantity(ing,[item("",{size:"250 g",packages:2})]);
 assert.equal(b.status,"enough");assert.equal(b.measured,500);
 assert.equal(m.assessQuantity(ing,[item("",{packages:6})]).status,"unverified");
});
test("unknown units, partial measures, and missing items never become false positives",()=>{
 const m=match(),ing={name:"All-purpose flour",amount:"500 g"};
 assert.equal(m.assessQuantity(ing,[]).status,"not-on-hand");
 assert.equal(m.assessQuantity(ing,[item("100 g")]).status,"short");
 assert.equal(m.assessQuantity(ing,[item("100 mL")]).status,"unverified");
 assert.equal(m.assessQuantity(ing,[item("100 g"),item("400 g")]).status,"enough");
 assert.equal(m.assessQuantity(ing,[item("100 g"),item("")]).status,"unverified");
 assert.equal(m.assessQuantity({...ing,amount:"to taste"},[item("500 g")]).status,"not-specified");
});
test("nonfood stock, zero packages and unavailable ingredients do not count",()=>{
 const m=match(),ing={name:"All-purpose flour",amount:"1 cup"};
 for(const loc of ["medicine","household"])assert.equal(m.assessQuantity(ing,[item("10 cups",{location:loc})]).status,"not-on-hand");
 assert.equal(m.assessQuantity(ing,[item("10 cups",{packages:0})]).status,"not-on-hand");
 assert.equal(m.assessQuantity(ing,[item("10 cups",{available:false})]).status,"not-on-hand");
});
test("recipe rank stays read only and never guesses conversions between grams and cups",()=>{
 const m=match(),rows=[item("600 g")],before=JSON.stringify(rows);
 const results=m.rank([{id:"bread",name:"Bread",family:"Bread & Baking",ingredients:[{name:"All-purpose flour",amount:"2 cups"}]}],rows);
 assert.equal(results[0].complete,true);assert.equal(results[0].measuredEnough,0);
 assert.equal(results[0].quantityUnverified,1);
 assert.equal(JSON.stringify(rows),before);
});
test("English and Russian UI, service worker refresh, and original stock schema are kept",()=>{
 const ui=read("assets/seedbank-recipes.js"),pantry=read("assets/dk-chef-provisions-ui.js");
 assert.match(ui,/recipeQuantityNote/);assert.match(ui,/Measured short/);assert.match(ui,/По меркам мало/);
 assert.match(pantry,/Total amount on hand/);assert.match(pantry,/Всего в наличии/);
 assert.match(read("sw.js"),/cache:"reload"/);
 assert.doesNotThrow(()=>new Function(ui));assert.doesNotThrow(()=>new Function(read("assets/dk-chef-recipe-match.js")));
});
