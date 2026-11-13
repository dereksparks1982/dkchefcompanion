"use strict";
const path=require("node:path");
const fs=require("node:fs");
const {pathToFileURL}=require("node:url");
const {app,BrowserWindow,protocol,net,shell,ipcMain}=require("electron");
const {resolveWebPath}=require("./web-path.cjs");
const {selectLatest}=require("./update-check.cjs");
const {createAuth}=require("./google-drive-auth.cjs");

const APP_URL="dkseed://app/index.html";
const ICON_PATH=path.join(__dirname,"build","icons","256x256.png");
const IS_SMOKE=process.argv.includes("--smoke-test");

protocol.registerSchemesAsPrivileged([{
 scheme:"dkseed",privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}
}]);

app.setName("DK Chef Companion");
app.setPath("userData",path.join(app.getPath("appData"),"DK Seed Bank"));
const googleAuth=createAuth({userData:app.getPath("userData"),openExternal:url=>shell.openExternal(url)});
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
  webPreferences:{preload:path.join(__dirname,"preload.cjs"),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,devTools:!app.isPackaged}
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
      (async()=>{
        const logo=document.querySelector(".dk-logo-en");
        const redLogo=document.querySelector(".dk-logo-ru");
        const key="dk-seed-bank-desktop-smoke-check";
        localStorage.setItem(key,"passed");
        const storage=localStorage.getItem(key)==="passed";
        localStorage.removeItem(key);
        const i18n=window.DKSeedBankI18n;
        const initial=i18n?.getLanguage();
        const header=document.querySelector("header");
        i18n?.setLanguage("ru",false);
        const russian=i18n?.getLanguage()==="ru"&&document.documentElement.lang==="ru";
        const russianBlack=getComputedStyle(header).backgroundColor==="rgb(0, 0, 0)";
        i18n?.setLanguage("en",false);
        const english=i18n?.getLanguage()==="en"&&document.documentElement.lang==="en";
        const englishGreen=getComputedStyle(header).backgroundImage!=="none";
        const jumpSummary=document.querySelector(".jumpbox > summary");
        const backupSummary=document.querySelector(".dk-resilience > summary");
        const panelSummary=document.querySelector(".wb-panel > summary");
        const arrowVisible=Boolean(jumpSummary&&backupSummary&&panelSummary&&
          [jumpSummary,backupSummary,panelSummary].every(summary=>
            getComputedStyle(summary,"::after").content.includes("⌄")));
        const seedChevronCount=document.querySelectorAll(".category > summary > .chevron").length;
        const growth=document.querySelector(".journal-entry .dk-growth");
        const growthCapture=growth?.querySelector('input[data-growth-camera][type="file"][capture="environment"]');
        const growthUpload=growth?.querySelector('input[data-growth-upload][type="file"]');
        const growthDate=growth?.querySelector('input[data-growth-date][type="date"]');
        const growthStage=growth?.querySelector('select[data-growth-stage]');
        const growthNotes=growth?.querySelector('input[data-growth-note]');
        if(initial==="ru")i18n?.setLanguage("ru",false);
        // Exercise the actual gallery upload path with a generated tiny photo.
        let growthUploadWorks=false;
        try{
          const before=window.DKSeedBankCore.journal()[0];
          const canvas=document.createElement("canvas");
          canvas.width=12;canvas.height=12;
          canvas.getContext("2d").fillRect(0,0,12,12);
          const png=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
          const picked=new File([png],"garden-smoke.png",{type:"image/png"});
          const chooser=document.querySelector(".journal-entry [data-growth-upload]");
          const transfer=new DataTransfer();
          transfer.items.add(picked);chooser.files=transfer.files;
          chooser.dispatchEvent(new Event("change",{bubbles:true}));
          let newPhoto=null;
          for(let i=0;i<80;i++){
            await new Promise(resolve=>setTimeout(resolve,100));
            const record=window.DKSeedBankCore.journal().find(item=>item.id===before.id);
            newPhoto=record?.growthPhotos?.[0]||null;
            if(newPhoto)break;
          }
          if(newPhoto){
            const mediaKey=window.DKSeedBankBackup.growthPhotoKey(before.id,newPhoto.id);
            const db=await new Promise(resolve=>{
              const request=indexedDB.open("dk-seedbank-media",1);
              request.onsuccess=()=>resolve(request.result);
              request.onerror=()=>resolve(null);
            });
            if(db){
              const stored=await new Promise(resolve=>{
                const request=db.transaction("photos","readonly").objectStore("photos").get(mediaKey);
                request.onsuccess=()=>resolve(request.result);
                request.onerror=()=>resolve(null);
              });
              growthUploadWorks=stored instanceof Blob&&stored.type==="image/jpeg"&&
                document.querySelector(".journal-entry .dk-growth-gallery .dk-growth-item")!==null;
              window.DKSeedBankCore.removeJournalGrowthPhoto(before.id,newPhoto);
              await new Promise(resolve=>{
                const tx=db.transaction("photos","readwrite");
                tx.objectStore("photos").delete(mediaKey);
                tx.oncomplete=resolve;tx.onerror=resolve;
              });
              db.close();
            }
          }
        }catch(error){console.error("Growth photo upload smoke failed:",error);}
        let heightChartWorks=false;
        try{
          const record=window.DKSeedBankCore.journal()[0];
          const oldIds=new Set((record.growthMeasurements||[]).map(item=>item.id));
          try{
            for(const [date,height,unit] of [["2026-11-12","5","in"],["2026-11-14","6","in"]]){
              const form=document.querySelector(".journal-entry .dk-measure-form");
              if(!form)throw Error("Measurement form missing");
              form.elements.namedItem("date").value=date;
              form.elements.namedItem("height").value=height;
              form.elements.namedItem("unit").value=unit;
              form.elements.namedItem("note").value="Smoke test";
              form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
            }
            const saved=(window.DKSeedBankCore.journal().find(item=>item.id===record.id)?.growthMeasurements||[])
              .filter(item=>!oldIds.has(item.id));
            const chart=document.querySelector(".journal-entry .dk-measure-chart svg");
            const text=document.querySelector(".journal-entry .dk-measure-stats");
            const validBackup=window.DKSeedBankBackup.validate({
              format:"dk-seedbank-v1",
              journal:[{id:record.id,plant:record.plant,date:record.date,growthMeasurements:saved}],
              photos:[]
            }).growthMeasurements===2;
            heightChartWorks=saved.length===2&&
              saved.some(item=>Math.abs(item.heightCm-12.7)<0.001)&&
              saved.some(item=>Math.abs(item.heightCm-15.24)<0.001)&&
              chart?.querySelector("polyline")!==null&&
              chart?.querySelectorAll("circle").length===2&&
              !!text&&validBackup;
          }finally{
            for(const item of window.DKSeedBankCore.journal().find(x=>x.id===record.id)?.growthMeasurements||[])
              if(!oldIds.has(item.id))window.DKSeedBankCore.deleteJournalMeasurement(record.id,item);
          }
        }catch(error){console.error("Height growth chart smoke failed:",error);}
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        const alignedJournalCards=[...document.querySelectorAll(".journal-entry")]
          .filter(card=>card.querySelector(".wb-journal-details"));
        const firstRow=alignedJournalCards.length?[alignedJournalCards[0]]:[];
        const firstTop=firstRow[0]?.getBoundingClientRect().top||0;
        for(const card of alignedJournalCards.slice(1))
          if(Math.abs(card.getBoundingClientRect().top-firstTop)<3)firstRow.push(card);
        const journalGuideAlignment=firstRow.length<2||firstRow.every(card=>
          Math.abs(card.querySelector(".wb-journal-details").getBoundingClientRect().top-
            firstRow[0].querySelector(".wb-journal-details").getBoundingClientRect().top)<=3);
        return {
          cards:document.querySelectorAll(".seed").length,
          selector:!!document.getElementById("dkLanguageSelect"),
          core:!!window.DKSeedBankCore,
          storage,
          offline:!!document.getElementById("dkOfflineStatus"),
          greenLogo:logo?.getAttribute("src")==="assets/dk-seedbank-green-96.webp",
          redLogo:redLogo?.getAttribute("src")==="assets/dk-seedbank-red-96.webp",
          russian,english,russianBlack,englishGreen,
          noCollectionEyebrow:!document.querySelector(".eyebrow"),
          rightSideArrows:arrowVisible,
          categoryArrows:seedChevronCount===19,
          growthCamera:!!growthCapture,
          growthUpload:!!growthUpload,
          growthDate:!!growthDate,
          growthStage:!!growthStage,
          growthNotes:!!growthNotes,
          growthStorageAPI:!!window.DKSeedBankGrowthPhotos,
          growthJournalAPI:typeof window.DKSeedBankCore?.addJournalGrowthPhoto==="function",
          growthPhotoRoundtrip:growthUploadWorks,
          growthMeasurementRoundtrip:heightChartWorks,
          growthChartAPI:typeof window.DKSeedBankGrowthMath?.toCm==="function",
          exportBackup:!!document.getElementById("exportJournal"),
          importBackup:!!document.getElementById("importJournal"),
          backupValidation:!!window.DKSeedBankBackup,
          seedCareAlerts:!!window.DKSeedBankAlerts,
          backupPanel:!!document.getElementById("dkResilience"),
          backupVerify:!!document.getElementById("dkRecoveryVerify"),
          desktopUpdater:typeof window.DKSeedBankDesktop?.checkForUpdates==="function",
          driveBridge:typeof window.DKSeedBankDesktop?.googleDrive?.request==="function",
          driveUIPresent:!!document.getElementById("dkDriveSync"),
          driveSyncAPI:typeof window.DKSeedBankDriveSync?.syncNow==="function",
          journalGuideAlignment
        };
      })()
    `);
    if(Object.entries(info).some(([key,value])=>key==="cards"?value!==319:value!==true)){
     throw new Error("Desktop smoke test failed: "+JSON.stringify(info));
    }
    console.log("DK Chef Companion desktop smoke test passed:",JSON.stringify(info));
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
 const desktopOnly=event=>{
  if(!event.sender.getURL().startsWith("dkseed://app/"))
   throw Error("Blocked Google Drive request from an untrusted source.");
 };
 ipcMain.handle("dkseed:google-status",event=>{desktopOnly(event);return googleAuth.status();});
 ipcMain.handle("dkseed:google-connect",(event,clientId)=>{
  desktopOnly(event);return googleAuth.connect(clientId);
 });
 ipcMain.handle("dkseed:google-disconnect",event=>{desktopOnly(event);return googleAuth.disconnect();});
 ipcMain.handle("dkseed:google-request",(event,request)=>{
  desktopOnly(event);return googleAuth.request(request);
 });
 ipcMain.handle("dkseed:check-updates",async event=>{
  if(!event.sender.getURL().startsWith("dkseed://app/"))return {status:"unavailable"};
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),9000);
  try{
   const response=await net.fetch(
    "https://api.github.com/repos/dereksparks1982/dkchefcompanion/releases?per_page=12",
    {headers:{Accept:"application/vnd.github+json"},signal:controller.signal}
   );
   if(!response.ok)return {status:"unavailable"};
   const releases=await response.json();
   const next=selectLatest(releases,app.getVersion());
   return next?{status:"available",...next}:{status:"current",version:app.getVersion()};
  }catch(error){return {status:"unavailable"};}
  finally{clearTimeout(timeout);}
 });
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
