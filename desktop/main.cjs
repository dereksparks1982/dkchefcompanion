"use strict";
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const {app,BrowserWindow,protocol,net,shell}=require("electron");
const {resolveWebPath}=require("./web-path.cjs");

const APP_URL="dkseed://app/index.html";
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
  icon:path.join(__dirname,"build","icons","256x256.png"),
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
    const info=await window.webContents.executeJavaScript(
      '({cards:document.querySelectorAll(".seed").length,selector:!!document.getElementById("dkLanguageSelect"),core:!!window.DKSeedBankCore,storage:typeof localStorage.getItem==="function",offline:!!document.getElementById("dkOfflineStatus")})'
    );
    if(info.cards!==319||!info.selector||!info.core||!info.storage||!info.offline){
     throw new Error("Missing desktop features: "+JSON.stringify(info));
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
