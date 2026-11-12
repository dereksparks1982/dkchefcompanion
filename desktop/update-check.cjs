"use strict";
/* Prefer the newest verified portable folder release; no automatic download/install. */
function parseVersion(value){
 const match=/^(\d+)\.(\d+)\.(\d+)$/.exec(String(value||""));
 return match?match.slice(1).map(Number):null;
}
function isNewer(next,current){
 const a=parseVersion(next),b=parseVersion(current);
 if(!a||!b)return false;
 for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]>b[i];}
 return false;
}
function selectLatest(releases,current){
 if(!Array.isArray(releases))return null;
 let found=null;
 for(const r of releases){
  if(!r||r.draft||typeof r.tag_name!=="string")continue;
  const match=/^v(\d+\.\d+\.\d+)-linux-portable$/.exec(r.tag_name);
  if(!match||!isNewer(match[1],current))continue;
  const expected="DK-Seed-Bank-"+match[1]+"-Linux-x86_64.tar.gz";
  const asset=Array.isArray(r.assets)?r.assets.find(a=>a&&a.name===expected&&
   a.state==="uploaded"&&typeof a.browser_download_url==="string"&&
   a.browser_download_url===
    "https://github.com/dereksparks1982/seedrepo/releases/download/"+r.tag_name+"/"+expected):null;
  const url="https://github.com/dereksparks1982/seedrepo/releases/tag/"+r.tag_name;
  if(!asset||r.html_url!==url)continue;
  if(!found||isNewer(match[1],found.version))
   found={version:match[1],url,download:asset.browser_download_url};
 }
 return found;
}
module.exports={parseVersion,isNewer,selectLatest};
