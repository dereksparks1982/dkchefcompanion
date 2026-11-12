"use strict";
const http=require("node:http"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const SCOPE="https://www.googleapis.com/auth/drive.appdata";
const CLIENT=/^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/;
function safeDriveUrl(value){
 const url=new URL(value);
 if(url.protocol!=="https:"||url.hostname!=="www.googleapis.com"||url.port||url.username||url.password||
  !/^\/(upload\/)?drive\/v3\/files(?:\/[A-Za-z0-9_-]+)?$/.test(url.pathname))
  throw Error("Invalid Google Drive API endpoint");
 return url.href;
}
function createAuth({userData,openExternal,fetchImpl=globalThis.fetch}){
 const filename=path.join(userData,"google-drive-auth.json");
 let creds={clientId:"",refreshToken:"",accessToken:"",expires:0},pending=false;
 try{
  const existing=JSON.parse(fs.readFileSync(filename,"utf8"));
  if(CLIENT.test(existing.clientId)&&typeof existing.refreshToken==="string")
   creds={clientId:existing.clientId,refreshToken:existing.refreshToken,accessToken:"",expires:0};
 }catch(error){}
 const status=()=>({connected:!!creds.refreshToken,clientId:creds.clientId});
 const store=()=>{
  fs.mkdirSync(userData,{recursive:true,mode:0o700});
  fs.writeFileSync(filename,JSON.stringify({clientId:creds.clientId,refreshToken:creds.refreshToken}),{mode:0o600});
  fs.chmodSync(filename,0o600);
 };
 async function refresh(){
  if(creds.accessToken&&Date.now()<creds.expires-65000)return creds.accessToken;
  if(!creds.refreshToken)throw Error("Connect your Google account first.");
  const reply=await fetchImpl("https://oauth2.googleapis.com/token",{
   method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams({client_id:creds.clientId,refresh_token:creds.refreshToken,grant_type:"refresh_token"})
  });
  const data=await reply.json();
  if(!reply.ok||!data.access_token){
   if(data.error==="invalid_grant"){
    creds.refreshToken="";creds.accessToken="";
    try{fs.rmSync(filename,{force:true});}catch(error){}
   }
   throw Error("Google authorization expired. Reconnect your account.");
  }
  creds.accessToken=data.access_token;
  creds.expires=Date.now()+Math.max(0,Number(data.expires_in)||3500)*1000;
  return creds.accessToken;
 }
 async function connect(clientId){
  if(pending)throw Error("Google sign-in already in progress.");
  if(!CLIENT.test(clientId))throw Error("Enter a valid Desktop OAuth Client ID.");
  pending=true;
  let server,timeout;
  const state=crypto.randomBytes(24).toString("hex");
  const verifier=crypto.randomBytes(48).toString("base64url");
  const challenge=crypto.createHash("sha256").update(verifier).digest("base64url");
  try{
   server=http.createServer();
   await new Promise((resolve,reject)=>{
    server.once("error",reject);server.listen(0,"127.0.0.1",resolve);
   });
   const redirect="http://127.0.0.1:"+server.address().port+"/oauth2callback";
   const code=new Promise((resolve,reject)=>{
    timeout=setTimeout(()=>reject(Error("Google sign-in timed out.")),180000);
    server.on("request",(request,response)=>{
     try{
      const url=new URL(request.url,"http://127.0.0.1");
      if(url.pathname!=="/oauth2callback"){response.writeHead(404).end("Not found");return;}
      if(url.searchParams.get("state")!==state){
       response.writeHead(400).end("Invalid sign-in session.");
       reject(Error("OAuth state verification failed."));return;
      }
      if(url.searchParams.has("error")){
       response.writeHead(200).end("Google sign-in cancelled. Return to DK Seed Bank.");
       reject(Error("Sign-in cancelled."));return;
      }
      const value=url.searchParams.get("code");
      if(!value){response.writeHead(400).end("Missing authorization code.");reject(Error("Google did not return an authorization code."));return;}
      response.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"})
       .end("<!doctype html><title>DK Seed Bank</title><p>Google Drive connected. Return to DK Seed Bank. You may close this tab.</p>");
      resolve(value);
     }catch(error){response.writeHead(400).end("Invalid response.");reject(error);}
    });
   });
   const params=new URLSearchParams({client_id:clientId,redirect_uri:redirect,response_type:"code",
    scope:SCOPE,access_type:"offline",prompt:"consent",state,code_challenge:challenge,code_challenge_method:"S256"});
   await openExternal("https://accounts.google.com/o/oauth2/v2/auth?"+params);
   const authCode=await code;
   const response=await fetchImpl("https://oauth2.googleapis.com/token",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({client_id:clientId,code:authCode,code_verifier:verifier,
     redirect_uri:redirect,grant_type:"authorization_code"})
   });
   const body=await response.json();
   if(!response.ok||!body.access_token||!body.refresh_token)
    throw Error("Google offline authorization was not granted. Reconnect and approve Drive access.");
   creds={clientId,refreshToken:body.refresh_token,accessToken:body.access_token,
    expires:Date.now()+Math.max(0,Number(body.expires_in)||3500)*1000};
   store();return status();
  }finally{pending=false;if(timeout)clearTimeout(timeout);if(server)server.close();}
 }
 async function disconnect(){
  creds={clientId:"",refreshToken:"",accessToken:"",expires:0};
  try{fs.rmSync(filename,{force:true});}catch(error){}
  return status();
 }
 async function request(input){
  if(!input||typeof input!=="object")throw Error("Invalid Drive request.");
  const url=safeDriveUrl(input.url),method=String(input.method||"GET").toUpperCase();
  if(!["GET","POST","PATCH","PUT"].includes(method))throw Error("Unsupported Drive method.");
  const body=input.body==null?undefined:String(input.body);
  if(body&&body.length>104000000)throw Error("Sync exceeds the 100 MB size limit.");
  const contentType=String(input.contentType||"application/json");
  if(contentType.length>150||!/^(application\/json|multipart\/related; boundary=[a-zA-Z0-9_-]+)$/.test(contentType))
   throw Error("Unsupported Drive content type.");
  async function send(token){
   const reply=await fetchImpl(url,{method,headers:{Authorization:"Bearer "+token,Accept:"application/json",
    ...(body!==undefined?{"Content-Type":contentType}:{})},body});
   return {ok:reply.ok,status:reply.status,text:await reply.text(),
    location:reply.headers.get("location")||""};
  }
  let result=await send(await refresh());
  if(result.status===401){creds.accessToken="";creds.expires=0;result=await send(await refresh());}
  return result;
 }
 return Object.freeze({status,connect,disconnect,request});
}
module.exports={createAuth,safeDriveUrl,CLIENT,SCOPE};
