"use strict";
const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("DKSeedBankDesktop",Object.freeze({
 checkForUpdates:()=>ipcRenderer.invoke("dkseed:check-updates"),
 googleDrive:Object.freeze({
  status:()=>ipcRenderer.invoke("dkseed:google-status"),
  connect:clientId=>ipcRenderer.invoke("dkseed:google-connect",clientId),
  disconnect:()=>ipcRenderer.invoke("dkseed:google-disconnect"),
  request:request=>ipcRenderer.invoke("dkseed:google-request",request)
 })
}));
