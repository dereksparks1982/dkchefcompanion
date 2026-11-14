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
 else constraints.facingMode=/iPhone|iPad|iPod|Android/i.test(String(agent))?"environment":"user";
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
// Re-arm Quagga2's existing live stream. No new getUserMedia/permission request.
function pause(){
 if(!current)return false;
 current.recognized=true;
 return true;
}
function resume(){
 if(!current)return false;
 current.recognized=false;
 current.frames=0;
 current.holdUntil=Date.now()+1200; // Give the user time to point at the next package.
 return true;
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
 const mobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||"");
 let chosen=options.deviceId||"";
 if(!chosen&&!mobile){
  try{
   const list=await devices();
   const front=list.find(x=>/\b(front|user.?facing|selfie)\b/i.test(x.label));
   if(front)chosen=front.deviceId;
  }catch(error){/* Browser defaults still work without enumeration. */}
 }
 const session={options,detected:null,processed:null,frames:0,recognized:false,holdUntil:0,
  disconnected:false};
 current=session;
 const config=configuration(options.target,chosen,navigator.userAgent);
 const profiles=[{label:"Preferred camera",constraints:config.inputStream.constraints}];
 if(chosen){
  profiles.push({label:"Selected camera · 640×480",
   constraints:{deviceId:{exact:chosen},width:{ideal:640},height:{ideal:480}}});
  profiles.push({label:"Selected camera · no resolution request",
   constraints:{deviceId:{ideal:chosen}}});
  profiles.push({label:"Selected camera · 320×240",
   constraints:{deviceId:{ideal:chosen},width:{ideal:320},height:{ideal:240}}});
 }else{
  profiles.push({label:"Camera · 640×480",
   constraints:{facingMode:config.inputStream.constraints.facingMode,width:{ideal:640},height:{ideal:480}}});
  profiles.push({label:"Camera · 320×240",
   constraints:{facingMode:config.inputStream.constraints.facingMode,width:{ideal:320},height:{ideal:240}}});
 }
 // Never switch away from a camera explicitly chosen by the user.
 // In automatic mode, browser defaults are the last resort on Linux.
 if(!options.deviceId)profiles.push({label:"Browser camera defaults",constraints:{}});
 const index=Number.isSafeInteger(options.profileStartIndex)?Math.max(0,options.profileStartIndex):0;
 const failed=[];
 try{
  devices().then(list=>{if(current===session)options.onCameras?.(list,chosen);}).catch(()=>{});
  let ready=false,lastError=null;
  for(let i=index;i<profiles.length;i++){
   if(current!==session)return;
   const profile=profiles[i];
   config.inputStream.constraints=profile.constraints;
   options.onAttempt?.(profile.label,i+1,profiles.length);
   try{
    await new Promise((resolve,reject)=>{
     try{quagga.init(config,error=>error?reject(error):resolve());}
     catch(error){reject(error);}
    });
    if(current!==session){
     try{await quagga.stop();}catch(error){}
     return;
    }
    // A driver may accept the stream during init but fail at start().
    // Treat both phases as a capture attempt, not only init().
    session.detected=result=>{
     if(current!==session||session.recognized||Date.now()<session.holdUntil)return;
     const barcode=normalize(result?.codeResult?.code,result?.codeResult?.format);
     if(!barcode)return;
     session.recognized=true;
     options.onCode?.(barcode);
    };
    session.processed=()=>{
     if(current!==session||session.recognized)return;
     session.frames++;
     if(session.frames===1)options.onProgress?.("live");
     else if(session.frames===35)options.onProgress?.("searching");
     else if(session.frames===115||session.frames%200===0)options.onProgress?.("hint");
    };
    quagga.onDetected(session.detected);
    quagga.onProcessed?.(session.processed);
    await Promise.resolve(quagga.start());
    const track=quagga.CameraAccess?.getActiveTrack?.();
    if(track?.readyState==="ended")
     throw Object.assign(new Error("Camera stream ended during startup"),{name:"NotReadableError"});
    if(track&&current===session){
     options.onActiveCamera?.(track.label||"",track.getSettings?.()||{});
     track.addEventListener?.("ended",()=>{
      if(current===session&&!session.disconnected){
       session.disconnected=true;
       options.onProgress?.("disconnected");
      }
     });
    }
    ready=true;
    break;
   }catch(error){
    lastError=error;
    failed.push({profile:profile.label,name:String(error?.name||"Error"),message:String(error?.message||"").slice(0,160)});
    options.onFailure?.(failed[failed.length-1]);
    // Remove callbacks and release a partially initialized or started stream
    // before a lower-resolution retry. Quagga2 owns the camera throughout.
    try{if(session.detected)quagga.offDetected?.(session.detected);}catch(ignored){}
    try{if(session.processed)quagga.offProcessed?.(session.processed);}catch(ignored){}
    session.detected=null;session.processed=null;session.frames=0;
    try{await quagga.stop();}catch(releaseError){}
    const kind=String(error?.name||"");
    if(/NotAllowed|PermissionDenied|SecurityError/.test(kind))break;
   }
  }
  if(!ready){
   const error=Object.assign(lastError||new Error("Could not open camera"),{
    attempted:profiles.slice(index).map(profile=>profile.label),
    failures:failed,selectedDevice:chosen
   });
   throw error;
  }
  if(current!==session)await stop();
 }catch(error){
  if(current===session)await stop();
  throw error;
 }
}
root.DKChefBarcodeScanner=Object.freeze({
 start,stop,pause,resume,devices,normalize,validGTIN,configuration
});
})(window);
