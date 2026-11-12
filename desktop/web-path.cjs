"use strict";
const path=require("node:path");
/* Serve only the bundled DK Seed Bank web directory. */
function resolveWebPath(root,pathname){
 if(typeof pathname!=="string"||pathname.includes("\0"))return null;
 let decoded;
 try{decoded=decodeURIComponent(pathname);}catch(error){return null;}
 if(decoded.includes("\0")||decoded.includes("\\"))return null;
 const relative=decoded.replace(/^\/+/,"")||"index.html";
 const base=path.resolve(root);
 const target=path.resolve(base,relative);
 if(target!==base&&!target.startsWith(base+path.sep))return null;
 return target;
}
module.exports={resolveWebPath};
