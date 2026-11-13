"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("every caution-tagged seed card uses one visible warning per guide state",()=>{
 const css=read("assets/seedbank-cards.css");
 const js=read("assets/seedbank-cards.js");
 const index=read("index.html");
 const cards=[...index.matchAll(/<article class="seed"[^>]*data-tags="([^"]+)"/g)];
 const caution=cards.filter(match=>match[1].split("|").includes("Caution"));
 assert.equal(cards.length,319,"expected seed collection layout");
 assert.ok(caution.length>=2,"expected multiple caution-tagged seeds");
 // Both snippets are useful, but never visually present together.
 assert.match(js,/const details='<details class="seed-details"/);
 assert.match(js,/seedSafetyDetails\(safety\)\+'<div class="plant-links">/);
 assert.match(js,/details\+seedSafetyBrief\(safety\)\+'<div class="seed-actions">/);
 assert.match(css,/article\.seed\s*>\s*\.seed-details\[open\]\s*~\s*\.seed-caution-summary\s*\{\s*display\s*:\s*none\s*\}/);
 assert.match(js,/if\(oldBrief\)oldBrief\.remove\(\);if\(oldDetails\)oldDetails\.remove\(\)/);
 assert.match(js,/card\.querySelector\("\.seed-actions"\)\.insertAdjacentHTML\("beforebegin",seedSafetyBrief\(safety\)\)/);
 assert.match(js,/card\.querySelector\("\.plant-links"\)\.insertAdjacentHTML\("beforebegin",seedSafetyDetails\(safety\)\)/);
});

test("no workbench or Russian safety text creates an additional visible duplicate",()=>{
 const wb=read("assets/seedbank-workbench.js");
 const ruJs=read("assets/seedbank-i18n.js");
 const ruCss=read("assets/seedbank-i18n.css");
 assert.match(wb,/const danger=\$\("\.seed-safety-details",p\.card\)\?"":dangerFor\(p\)/);
 assert.match(ruJs,/if\(!host\|\|host\.querySelector\("\.dk-ru-safety"\)\)continue/);
 assert.match(ruCss,/html\[lang="ru"\] \.seed-caution-summary>p/);
 assert.match(ruCss,/html\[lang="en"\] \.dk-ru-growing/);
 for(const file of ["index.html","docs/index.html"]){
  assert.match(read(file),/seedbank-cards\.css\?v=20261112-single-caution1/);
 }
 assert.match(read("sw.js"),/const APP_CACHE="dk-seedbank-app-v\d+"/);
});
