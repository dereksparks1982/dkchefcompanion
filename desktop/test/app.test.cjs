"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {resolveWebPath}=require("../web-path.cjs");
const dir=path.resolve(__dirname,"..","runtime");

test("serves only bundled assets",()=>{
 assert.equal(resolveWebPath(dir,"/index.html"),path.join(dir,"index.html"));
 assert.equal(resolveWebPath(dir,"/assets/seedbank-cards.js"),path.join(dir,"assets","seedbank-cards.js"));
 assert.equal(resolveWebPath(dir,"/"),path.join(dir,"index.html"));
 for(const bad of ["/../../etc/passwd","/%2e%2e/%2e%2e/etc/passwd","/%00bad","/%E0%A4%A","/assets/../../../etc/shadow"]){
  assert.equal(resolveWebPath(dir,bad),null,bad);
 }
});

test("desktop bundle holds the complete seed bank",()=>{
 const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
 assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
 assert.ok(html.includes('value="ru">Русский</option>'));
 assert.ok(html.includes('assets/desktop-offline.js'));
 assert.ok(!html.includes('src="assets/seedbank-offline.js'));
 assert.ok(fs.existsSync(path.join(dir,"assets","dk-seedbank-green-96.webp")));
 assert.ok(fs.existsSync(path.join(dir,"assets","dk-seedbank-red-96.webp")));
 assert.ok(fs.existsSync(path.join(dir,"assets","seedbank-workbench.js")));
 assert.ok(fs.existsSync(path.join(dir,"assets","seedbank-i18n.js")));
});

test("every local asset referenced by the portable page is bundled",()=>{
 const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
 const paths=[...html.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)="([^"]+)"/g)]
  .map(m=>m[1].split("?")[0]).filter(p=>!/^https?:|^data:/.test(p));
 for(const item of paths){
  assert.ok(fs.existsSync(path.join(dir,item)),item+" is missing");
 }
});

test("generic Mint journal includes its culinary classification",()=>{
 const source=fs.readFileSync(path.join(dir,"assets","seedbank-workbench.js"),"utf8");
 const start=source.indexOf("function journalRoles(");
 const end=source.indexOf("function journalEnhance(",start);
 assert.ok(start>=0&&end>start,"Mint journal role helper missing");
 const journalRoles=new Function("journalPlantGroup",source.slice(start,end)+"return journalRoles;")(
  entry=>String(entry.plant||"").trim().toLowerCase()
 );
 const candidates=[
  {card:{dataset:{tags:"Culinary herb|Pollinator"}}},
  {card:{dataset:{tags:"Pollinator"}}}
 ];
 assert.deepEqual(journalRoles({plant:"Mint"},null,candidates),["Culinary herb","Pollinator"]);
 assert.deepEqual(journalRoles({plant:"Oregano"},null,candidates),["Pollinator"]);
 assert.deepEqual(journalRoles({plant:"Mint"},{card:{dataset:{tags:"Pollinator"}}},candidates),["Pollinator"]);
});
