"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const out=path.join(__dirname,"runtime");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const original=/src="assets\/seedbank-offline\.js\?[^"]+"/g;
if((index.match(original)||[]).length!==1)throw new Error("Expected exactly one web offline-status script");
const rendered=index.replace(original,'src="assets/desktop-offline.js"')
 .replace("</head>",'<link rel="stylesheet" href="assets/desktop-update.css"></head>');
if((rendered.match(/<article class="seed"/g)||[]).length!==319)throw new Error("Catalog card count changed");
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
fs.cpSync(path.join(root,"assets"),path.join(out,"assets"),{recursive:true});
fs.copyFileSync(path.join(root,"manifest.webmanifest"),path.join(out,"manifest.webmanifest"));
fs.writeFileSync(path.join(out,"index.html"),rendered);
fs.copyFileSync(path.join(__dirname,"desktop-offline.js"),path.join(out,"assets","desktop-offline.js"));
fs.copyFileSync(path.join(__dirname,"desktop-update.css"),path.join(out,"assets","desktop-update.css"));
console.log("Bundled DK Seed Bank catalog and assets:",(rendered.match(/<article class="seed"/g)||[]).length,"seed cards");
