/* DK Chef Companion: automatic live UPC/EAN scanner.
   The browser owns the MediaStream. Quagga2 decodes pixels from the live feed,
   so decoder activity cannot shut the camera off. No photo picker is involved. */
(function(root){
"use strict";
const READERS=["ean_reader","ean_8_reader","upc_reader","upc_e_reader"];
let active=null,revision=0;
function validGTIN(value){
 const code=String(value||"");
 if(!/^(?:\d{8}|\d{12,14})$/.test(code))return false;
 let sum=0,weight=3;
 for(let i=code.length-2;i>=0;i--){sum+=Number(code[i])*weight;weight=weight===3?1:3;}
 return (10-sum%10)%10===Number(code[code.length-1]);
}
function expandUPCE(value){
 const code=String(value||"");if(!/^[01]\d{7}$/.test(code))return "";
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
 return code.length===13&&code.startsWith("0")?code.slice(1):code;
}
function cameraConstraints(deviceId,agent){
 const video={width:{ideal:1280},height:{ideal:720}};
 if(deviceId)video.deviceId={exact:deviceId};
 else if(/iPhone|iPad|iPod|Android/i.test(String(agent||"")))
  video.facingMode={ideal:"environment"};
 return {audio:false,video};
}
async function devices(){
 if(!navigator.mediaDevices?.enumerateDevices)return [];
 const result=await navigator.mediaDevices.enumerateDevices();
 return result.filter(x=>x.kind==="videoinput"&&x.deviceId)
  .map((x,i)=>({deviceId:x.deviceId,label:x.label||("Camera "+(i+1))}));
}
function stopTracks(stream){
 try{for(const track of stream?.getTracks()||[])track.stop();}catch(error){}
}
function release(){
 const old=active;active=null;if(!old)return;
 clearTimeout(old.timer);clearTimeout(old.decodeTimer);
 try{old.video.pause();}catch(error){}
 old.video.srcObject=null;
 stopTracks(old.stream);
 try{old.video.remove();}catch(error){}
}
function stop(){++revision;release();return Promise.resolve();}
function schedule(session,delay=350){
 if(active!==session||session.done)return;
 clearTimeout(session.timer);
 session.timer=setTimeout(()=>scanFrame(session),delay);
}
function scanFrame(session){
 if(active!==session||session.done)return;
 const video=session.video;
 if(video.readyState<2||!video.videoWidth||!video.videoHeight){
  if(++session.waiting===12)session.options.onProgress?.("waiting");
  schedule(session,250);return;
 }
 if(!session.live){session.live=true;session.options.onProgress?.("live");}
 if(session.busy){schedule(session,350);return;}
 const canvas=session.canvas,width=Math.min(1200,video.videoWidth);
 canvas.width=width;
 canvas.height=Math.max(1,Math.round(width*video.videoHeight/video.videoWidth));
 let src;
 try{
  canvas.getContext("2d",{willReadFrequently:true}).drawImage(video,0,0,canvas.width,canvas.height);
  src=canvas.toDataURL("image/jpeg",0.88);
 }catch(error){session.options.onProgress?.("frame-error");schedule(session,700);return;}
 session.busy=true;
 const done=(result,error)=>{
  if(!session.busy)return;
  session.busy=false;clearTimeout(session.decodeTimer);
  if(active!==session||session.done)return;
  const code=normalize(result?.codeResult?.code,result?.codeResult?.format);
  if(code){session.done=true;session.options.onCode?.(code);return;}
  session.frames++;
  if(error&&session.frames===3)session.options.onProgress?.("decoder-error");
  if(session.frames===8)session.options.onProgress?.("searching");
  if(session.frames===28||session.frames%60===0)session.options.onProgress?.("hint");
  schedule(session,350);
 };
 // A failed or blocked decode never owns and never stops the webcam.
 session.decodeTimer=setTimeout(()=>{
  if(active!==session||session.done||!session.busy)return;
  session.busy=false;session.options.onProgress?.("decoder-error");schedule(session,1000);
 },7000);
 try{
  const task=root.Quagga.decodeSingle({
   src,numOfWorkers:0,locate:true,
   inputStream:{type:"ImageStream",size:1200},
   locator:{halfSample:false,patchSize:"medium"},
   decoder:{readers:READERS}
  },result=>done(result,null));
  if(task&&typeof task.catch==="function")task.catch(error=>done(null,error));
 }catch(error){done(null,error);}
}
async function start(options){
 const token=++revision;release();
 if(!root.Quagga||typeof root.Quagga.decodeSingle!=="function")
  throw Error("Barcode decoder is not loaded");
 if(!navigator.mediaDevices?.getUserMedia)
  throw Object.assign(new Error("Camera API unavailable"),{name:"NotSupportedError"});
 if(root.isSecureContext===false)
  throw Object.assign(new Error("Camera needs HTTPS"),{name:"SecurityError"});
 if(!options?.target)throw Error("Camera preview missing");
 const stream=await navigator.mediaDevices.getUserMedia(cameraConstraints(options.deviceId||"",navigator.userAgent));
 if(token!==revision){stopTracks(stream);return;}
 const video=document.createElement("video");
 video.autoplay=true;video.muted=true;video.playsInline=true;
 video.setAttribute("playsinline","");
 video.setAttribute("autoplay","");
 video.setAttribute("muted","");
 video.srcObject=stream;
 options.target.replaceChildren(video);
 const session={options,video,stream,canvas:document.createElement("canvas"),
  frames:0,waiting:0,live:false,busy:false,done:false,timer:null,decodeTimer:null};
 active=session;
 try{
  const playing=video.play();
  if(playing?.catch)playing.catch(error=>{if(active===session)options.onProgress?.("play-error");});
 }catch(error){options.onProgress?.("play-error");}
 for(const track of stream.getVideoTracks()){
  track.addEventListener?.("ended",()=>{if(active===session)options.onProgress?.("disconnected");});
 }
 devices().then(rows=>{if(active===session)options.onCameras?.(rows);}).catch(()=>{});
 schedule(session,200);
}
root.DKChefBarcodeScanner=Object.freeze({start,stop,devices,normalize,validGTIN,cameraConstraints});
})(window);
