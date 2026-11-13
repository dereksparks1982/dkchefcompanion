/* DK Chef Companion retail barcode decoder.
   Quagga2 is bundled locally under assets/vendor; no remote decoder or camera upload. */
(function(root){
"use strict";
const READERS=["ean_reader","ean_8_reader","upc_reader","upc_e_reader","code_128_reader"];
let active=null,sequence=Promise.resolve();
function queue(action){
 const result=sequence.then(action,action);
 sequence=result.catch(()=>{});
 return result;
}
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
 const kind=String(format||"").toLowerCase();
 if(kind==="upc_e")code=expandUPCE(code);
 if(!validGTIN(code))return "";
 // An EAN-13 number beginning with 0 encodes the same UPC-A as its last 12 digits.
 if(code.length===13&&code.startsWith("0"))code=code.slice(1);
 return code;
}
function configuration(target,deviceId,agent){
 const constraints={width:{ideal:1280},height:{ideal:720}};
 if(deviceId)constraints.deviceId={exact:deviceId};
 else if(/iPhone|iPad|iPod|Android/i.test(agent||""))constraints.facingMode={ideal:"environment"};
 return {
  inputStream:{name:"Live",type:"LiveStream",target,size:1280,constraints},
  locate:true,frequency:10,numOfWorkers:0,
  locator:{halfSample:false,patchSize:"medium"},
  decoder:{readers:READERS}
 };
}
async function devices(){
 if(typeof navigator==="undefined"||!navigator.mediaDevices?.enumerateDevices)return [];
 const list=await navigator.mediaDevices.enumerateDevices();
 return list.filter(x=>x.kind==="videoinput"&&x.deviceId)
  .map((x,i)=>({deviceId:x.deviceId,label:x.label||("Camera "+(i+1))}));
}
function release(){
 const previous=active;active=null;
 if(!previous)return;
 const scanner=root.Quagga;
 try{if(previous.detected)scanner?.offDetected(previous.detected);}catch(error){}
 try{if(previous.processed)scanner?.offProcessed(previous.processed);}catch(error){}
 try{scanner?.stop();}catch(error){}
 // CameraAccess.stop is normally sufficient. Release tracks too on WebKit.
 try{
  for(const video of previous.target.querySelectorAll("video")){
   const stream=video.srcObject;
   if(stream&&typeof stream.getTracks==="function")
    for(const track of stream.getTracks())track.stop();
   video.srcObject=null;
  }
 }catch(error){}
}
function stop(){return queue(()=>release());}
function start(options){
 return queue(async()=>{
  release();
  const scanner=root.Quagga;
  if(!scanner||typeof scanner.init!=="function")throw Error("Scanner library unavailable");
  if(typeof navigator==="undefined"||!navigator.mediaDevices?.getUserMedia)throw Object.assign(new Error("Camera API unavailable"),{name:"NotSupportedError"});
  if(root.isSecureContext===false)throw Object.assign(new Error("Camera requires HTTPS"),{name:"SecurityError"});
  if(!options?.target)throw Error("Missing camera preview");
  const config=configuration(options.target,options.deviceId||"",navigator.userAgent);
  return new Promise((resolve,reject)=>{
   try{
    scanner.init(config,error=>{
     if(error){try{scanner.stop();}catch(e){}reject(error);return;}
     const session={target:options.target,detected:null,processed:null};
     let processed=0;
     session.detected=reading=>{
      if(active!==session)return;
      const code=normalize(reading?.codeResult?.code,reading?.codeResult?.format);
      if(code)options.onCode?.(code);
     };
     session.processed=()=>{
      if(active!==session)return;
      processed++;
      if(processed===45)options.onProgress?.("searching");
      if(processed===130)options.onProgress?.("hint");
     };
     active=session;
     try{
      scanner.onDetected(session.detected);
      scanner.onProcessed(session.processed);
      scanner.start();
      resolve();
      devices().then(list=>{if(active===session)options.onCameras?.(list);}).catch(()=>{});
     }catch(startError){release();reject(startError);}
    });
   }catch(initError){reject(initError);}
  });
 });
}
function scanFile(file){
 return queue(async()=>{
  release();
  if(!file||!String(file.type||"").startsWith("image/"))throw Error("Select a barcode image");
  const scanner=root.Quagga;
  if(!scanner||typeof scanner.decodeSingle!=="function")throw Error("Scanner library unavailable");
  if(!root.URL?.createObjectURL)throw Error("Image files unsupported");
  const src=root.URL.createObjectURL(file);
  return new Promise((resolve,reject)=>{
   let settled=false;
   const finish=(error,code)=>{
    if(settled)return;
    settled=true;clearTimeout(timer);
    root.URL.revokeObjectURL(src);
    if(error)reject(error);else resolve(code);
   };
   const timer=setTimeout(()=>finish(new Error("Image decoding timed out")),20000);
   try{
    const task=scanner.decodeSingle({
     src,numOfWorkers:0,locate:true,inputStream:{size:1600},
     locator:{halfSample:false,patchSize:"medium"},
     decoder:{readers:READERS}
    },result=>finish(null,normalize(result?.codeResult?.code,result?.codeResult?.format)));
    if(task&&typeof task.catch==="function")task.catch(error=>finish(error));
   }catch(error){finish(error);}
  });
 });
}
root.DKChefBarcodeScanner=Object.freeze({start,stop,scanFile,devices,normalize,validGTIN,configuration});
})(window);
