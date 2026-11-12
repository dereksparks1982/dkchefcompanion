/* Local-first recovery: restore original browser records if a sync commit fails.
   Media replacement must itself use a single atomic IndexedDB transaction. */
(function(root){
"use strict";
async function apply(store,entries,commitMedia){
 if(!store||typeof store.getItem!=="function"||typeof store.setItem!=="function"||
    !Array.isArray(entries)||typeof commitMedia!=="function")
  throw Error("Invalid local sync transaction.");
 const old=new Map(),seen=new Set();
 for(const item of entries){
  if(!Array.isArray(item)||item.length!==2||typeof item[0]!=="string"||seen.has(item[0]))
   throw Error("Invalid or duplicate local sync key.");
  seen.add(item[0]);
  old.set(item[0],store.getItem(item[0]));
 }
 try{
  // Prepare local JSON before touching photographs. If storage is full,
  // the existing IndexedDB collection remains unmodified.
  for(const [key,value] of entries)store.setItem(key,JSON.stringify(value));
  if(!await commitMedia())throw Error("Could not commit synchronized photographs.");
  return true;
 }catch(error){
  const failures=[];
  for(const [key,value] of [...old].reverse()){
   try{
    if(value===null)store.removeItem(key);
    else store.setItem(key,value);
   }catch(rollbackError){failures.push(key);}
  }
  if(failures.length)
   throw Error("Local sync failed and browser storage could not be fully rolled back. Restore from the verified Google Drive snapshot. Affected keys: "+failures.join(", "));
  throw error;
 }
}
root.DKSeedBankStorageTransaction=Object.freeze({apply});
})(window);
