/* DK Chef Companion barcode scanner.
   Uses the upstream MIT-licensed Quagga2 LIVE CAMERA API, unchanged:
   Quagga.init -> Quagga.start -> Quagga.onDetected / onProcessed -> Quagga.stop.
   No homemade video frame processing and no photo-file workflow. */
(function(root){
"use strict";
const READERS=["ean_reader","ean_8_reader","upc_reader","upc_e_reader"];
let current=null;
let lastStop=Promise.resolve();
function validGTIN(value){
 const code=String(value||"");
 if(!/^(?:\d{8}|\d{12,14})$/.test(code))return false;
 let sum=0,weight=3;
 for(let i=code.length-2;i>=0;i--){sum+=Number(code[i])*weight;weight=weight===3?1:3;}
 return (10-sum%10)%10===Number(code[code.length-1]);
}
function expandUPCE(value){
 const code=String(value||"");
 if(!/^[01]\d{7}$/.test(code))return "";
 const n=code[0],digits=code.slice(1,7),last=digits[5],check=code[7];
 if("012".includes(last))return n+digits.slice(0,2)+last+"0000"+digits.slice(2,5)+check;
 if(last==="3")return n+digits.slice(0,3)+"00000"+digits.slice(3,5)+check;
 if(last==="4")return n+digits.slice(0,4)+"00000"+digits[4]+check;
 return n+digits.slice(0,5)+"0000"+last+check;
}
function normalize(raw,format){
 let code=String(raw||"").trim();
 if(String(format||"").toLowerCase()==="upc_e")code=expandUPCE(code);
 if(!validGTIN(code))return "";
 // UPC-A and the equivalent zero-prefixed EAN-13 identify the same item.
 return code.length===13&&code.startsWith("0")?code.slice(1):code;
}
function configuration(target,deviceId="",agent=""){
 const constraints={width:{ideal:1280},height:{ideal:720}};
 if(deviceId)constraints.deviceId={exact:deviceId};
 else if(/iPhone|iPad|iPod|Android/i.test(String(agent)))constraints.facingMode="environment";
 return {
  inputStream:{type:"LiveStream",target,constraints,size:960},
  locate:true,
  frequency:10,
  numOfWorkers:0,
  locator:{patchSize:"medium",halfSample:false},
  decoder:{readers:READERS},
  canvas:{createOverlay:false}
 };
}
async function devices(){
 const quagga=root.Quagga;
 if(quagga?.CameraAccess?.enumerateVideoDevices){
  return (await quagga.CameraAccess.enumerateVideoDevices()).map((item,i)=>({
   deviceId:item.deviceId||item.id||"",label:item.label||("Camera "+(i+1))
  })).filter(item=>item.deviceId);
 }
 if(typeof navigator==="undefined"||!navigator.mediaDevices?.enumerateDevices)return [];
 return (await navigator.mediaDevices.enumerateDevices())
  .filter(item=>item.kind==="videoinput"&&item.deviceId)
  .map((item,i)=>({deviceId:item.deviceId,label:item.label||("Camera "+(i+1))}));
}
function stop(){
 const old=current;current=null;
 if(!old)return lastStop;
 const quagga=root.Quagga;
 try{if(old.detected)quagga?.offDetected(old.detected);}catch(error){}
 try{if(old.processed)quagga?.offProcessed(old.processed);}catch(error){}
 try{
  lastStop=Promise.resolve(quagga?.stop()).catch(()=>{});
 }catch(error){lastStop=Promise.resolve();}
 return lastStop;
}
async function start(options){
 await stop();
 const quagga=root.Quagga;
 if(!quagga||typeof quagga.init!=="function"||typeof quagga.start!=="function"||
   typeof quagga.onDetected!=="function"||typeof quagga.stop!=="function")
  throw Error("Quagga2 live scanner did not load");
 if(typeof navigator==="undefined"||!navigator.mediaDevices?.getUserMedia)
  throw Object.assign(new Error("Camera API unavailable"),{name:"NotSupportedError"});
 if(root.isSecureContext===false)
  throw Object.assign(new Error("Camera requires HTTPS"),{name:"SecurityError"});
 if(!options?.target)throw Error("Camera preview element missing");
 const session={options,detected:null,processed:null,frames:0,recognized:false};
 current=session;
 const config=configuration(options.target,options.deviceId||"",navigator.userAgent);
 try{
  await new Promise((resolve,reject)=>{
   try{quagga.init(config,error=>error?reject(error):resolve());}
   catch(error){reject(error);}
  });
  if(current!==session)return;
  session.detected=result=>{
   if(current!==session||session.recognized)return;
   const barcode=normalize(result?.codeResult?.code,result?.codeResult?.format);
   if(!barcode)return;
   session.recognized=true;
   options.onCode?.(barcode);
  };
  session.processed=()=>{
   if(current!==session)return;
   session.frames++;
   if(session.frames===1)options.onProgress?.("live");
   else if(session.frames===35)options.onProgress?.("searching");
   else if(session.frames===115||session.frames%200===0)options.onProgress?.("hint");
  };
  quagga.onDetected(session.detected);
  quagga.onProcessed?.(session.processed);
  quagga.start();
  devices().then(list=>{if(current===session)options.onCameras?.(list);}).catch(()=>{});
  const track=quagga.CameraAccess?.getActiveTrack?.();
  track?.addEventListener?.("ended",()=>{
   if(current===session)options.onProgress?.("disconnected");
  });
 }catch(error){
  if(current===session)await stop();
  throw error;
 }
}
root.DKChefBarcodeScanner=Object.freeze({
 start,stop,devices,normalize,validGTIN,configuration
});
})(window);
