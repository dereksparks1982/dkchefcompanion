"use strict";
const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("DKSeedBankDesktop",Object.freeze({
 checkForUpdates:()=>ipcRenderer.invoke("dkseed:check-updates")
}));
