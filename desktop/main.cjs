"use strict";
const path=require("node:path");
const fs=require("node:fs");
const {pathToFileURL}=require("node:url");
const {app,BrowserWindow,protocol,net,shell}=require("electron");
const {resolveWebPath}=require("./web-path.cjs");

const APP_URL="dkseed://app/index.html";
const ICON_PATH=path.join(__dirname,"build","icons","256x256.png");
const IS_SMOKE=process.argv.includes("--smoke-test");

protocol.registerSchemesAsPrivileged([{
 scheme:"dkseed",privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}
}]);

app.setName("DK Seed Bank");
app.setPath("userData",path.join(app.getPath("appData"),"DK Seed Bank"));
const singleInstance=app.requestSingleInstanceLock();
if(!singleInstance){app.quit();}

let mainWindow=null;
const webRoot=app.isPackaged
 ?path.join(process.resourcesPath,"seedbank")
 :path.join(__dirname,"runtime");

function externalLink(url){
 try{
  const parsed=new URL(url);
  if(parsed.protocol==="https:"||parsed.protocol==="http:")shell.openExternal(parsed.href);
 }catch(error){/* Ignore invalid URLs. */}
}

function createWindow(){
 const window=new BrowserWindow({
  width:1240,height:860,minWidth:860,minHeight:620,
  backgroundColor:"#f5f7f0",
  show:false,
  autoHideMenuBar:true,
  icon:ICON_PATH,
  webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,devTools:!app.isPackaged}
 });
 mainWindow=window;
 window.once("ready-to-show",()=>window.show());
 window.webContents.setWindowOpenHandler(({url})=>{
  externalLink(url);
  return {action:"deny"};
 });
 window.webContents.on("will-navigate",(event,url)=>{
  if(!url.startsWith("dkseed://app/")){
   event.preventDefault();
   externalLink(url);
  }
 });
 window.on("closed",()=>{if(mainWindow===window)mainWindow=null;});
 if(IS_SMOKE){
  let finished=false;
  window.webContents.once("did-fail-load",(_event,code,description)=>{
   if(finished)return;finished=true;
   console.error("Desktop smoke test failed:",code,description);
   app.exit(1);
  });
  window.webContents.once("did-finish-load",async()=>{
   if(finished)return;
   try{
    if(!fs.existsSync(ICON_PATH))throw new Error("Approved DK icon is missing from packaged application");
    const info=await window.webContents.executeJavaScript(`
      (()=>{
        const logo=document.querySelector(".dk-logo-en");
        const redLogo=document.querySelector(".dk-logo-ru");
        const key="dk-seed-bank-desktop-smoke-check";
        localStorage.setItem(key,"passed");
        const storage=localStorage.getItem(key)==="passed";
        localStorage.removeItem(key);
        const i18n=window.DKSeedBankI18n;
        const initial=i18n?.getLanguage();
        i18n?.setLanguage("ru",false);
        const russian=i18n?.getLanguage()==="ru"&&document.documentElement.lang==="ru";
        i18n?.setLanguage("en",false);
        const english=i18n?.getLanguage()==="en"&&document.documentElement.lang==="en";
        if(initial==="ru")i18n?.setLanguage("ru",false);
        return {
          cards:document.querySelectorAll(".seed").length,
          selector:!!document.getElementById("dkLanguageSelect"),
          core:!!window.DKSeedBankCore,
          storage,
          offline:!!document.getElementById("dkOfflineStatus"),
          greenLogo:logo?.getAttribute("src")==="assets/dk-seedbank-green-96.webp",
          redLogo:redLogo?.getAttribute("src")==="assets/dk-seedbank-red-96.webp",
          russian,english,
          exportBackup:!!document.getElementById("exportJournal"),
          importBackup:!!document.getElementById("importJournal")
        };
      })()
    `);
    if(Object.entries(info).some(([key,value])=>key==="cards"?value!==319:value!==true)){
     throw new Error("Desktop smoke test failed: "+JSON.stringify(info));
    }
    console.log("DK Seed Bank desktop smoke test passed:",JSON.stringify(info));
    finished=true;app.exit(0);
   }catch(error){
    console.error("Desktop smoke test failed:",error);
    finished=true;app.exit(1);
   }
  });
 }
 window.loadURL(APP_URL);
}

app.on("second-instance",()=>{if(mainWindow){mainWindow.show();mainWindow.focus();}});
app.whenReady().then(()=>{
 protocol.handle("dkseed",request=>{
  const url=new URL(request.url);
  if(url.hostname!=="app")return new Response("Not found",{status:404});
  const file=resolveWebPath(webRoot,url.pathname);
  if(!file)return new Response("Forbidden",{status:403});
  return net.fetch(pathToFileURL(file).href);
 });
 createWindow();
}).catch(error=>{console.error("Desktop launch error:",error);app.exit(1);});
app.on("window-all-closed",()=>{app.quit();});
