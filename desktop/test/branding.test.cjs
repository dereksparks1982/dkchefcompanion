"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../.."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("English/Russian web titles, tagline, footer, PWA install identity and source collection survive rename",()=>{
 const manifest=JSON.parse(read("manifest.webmanifest"));
 assert.equal(manifest.name,"DK Chef Companion");
 assert.equal(manifest.short_name,"DK Chef");
 assert.match(manifest.description,/From Seed to Table/);
 assert.match(manifest.icons[0].src,/dk-seedbank-green-96\.webp/);
 for(const file of ["index.html","docs/index.html"]){
  const html=read(file);
  assert.match(html,/<title>DK Chef Companion \| From Seed to Table<\/title>/);
  assert.match(html,/data-dk-no-translate>DK Chef Companion<\/span>/);
  assert.match(html,/data-dk-no-translate>ДК Компаньон шеф-повара<\/span>/);
  assert.match(html,/From seed to table: plan your garden/);
  assert.match(html,/DK Chef Companion · From Seed to Table · DK Softworks/);
  assert.equal((html.match(/<article class="seed"/g)||[]).length,319);
  assert.match(html,/seedbank-i18n\.js\?v=20261112-kitchen1/);
 }
 const i18n=read("assets/seedbank-i18n.js");
 assert.match(i18n,/ДК Компаньон шеф-повара \| От семени до стола/);
 assert.match(i18n,/От семени до стола: планируйте сад/);
 assert.match(i18n,/ДК Софтворкс/);
});
test("Desktop product, launcher and updater use new name and repository",()=>{
 const pkg=JSON.parse(read("desktop/package.json"));
 assert.equal(pkg.productName,"DK Chef Companion");
 assert.equal(pkg.build.productName,"DK Chef Companion");
 assert.equal(pkg.build.linux.executableName,"dk-chef-companion");
 assert.equal(pkg.name,"dk-chef-companion-desktop");
 const main=read("desktop/main.cjs"),launcher=read("desktop/launcher.c");
 assert.match(main,/app\.setName\("DK Chef Companion"\)/);
 assert.match(launcher,/\/dk-chef-companion/);
 assert.match(main,/dereksparks1982\/dkchefcompanion\/releases/);
 assert.match(read("desktop/update-check.cjs"),/DK-Chef-Companion-/);
 assert.doesNotMatch(read("desktop/update-check.cjs"),/dereksparks1982\/seedrepo/);
});
test("All legacy local profile, Drive folder and backup schema names remain unchanged",()=>{
 const pkg=JSON.parse(read("desktop/package.json"));
 assert.equal(pkg.build.appId,"com.dksoftworks.seedbank");
 assert.equal(pkg.build.extraResources[0].to,"seedbank");
 assert.match(read("desktop/main.cjs"),/app\.setPath\("userData",path\.join\(app\.getPath\("appData"\),"DK Seed Bank"\)\)/);
 assert.match(read("assets/seedbank-cards.js"),/format:"dk-seedbank-v1"/);
 assert.match(read("assets/seedbank-watering.js"),/dk-seedbank-watering-v1/);
 assert.match(read("assets/seedbank-drive-visible.js"),/name = 'DK Seed Bank'/);
 assert.match(read("assets/seedbank-drive-sync.js"),/dk-seedbank-sync-v1-/);
 const workflow=read(".github/workflows/linux-portable.yml");
 assert.match(workflow,/workflow_dispatch:/);
 assert.doesNotMatch(workflow,/  push:/);
 assert.match(workflow,/DK-Chef-Companion-0\.9\.9-Linux-x86_64\.tar\.gz/);
 assert.match(read("sw.js"),/dk-seedbank-app-v55/);
});
