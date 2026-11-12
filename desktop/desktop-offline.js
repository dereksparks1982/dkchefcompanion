/* Bundled desktop content works with or without internet. */
(function(){
 "use strict";
 const status=document.getElementById("dkOfflineStatus");
 const language=document.getElementById("dkLanguageSelect");
 if(!status)return;
 function update(){
  status.textContent=language&&language.value==="ru"
   ?"Настольная версия · Работает без интернета · Данные сохраняются на этом компьютере"
   :"Desktop edition · Works offline · Records are saved on this computer";
  status.dataset.offlineState="ready";
 }
 if(language)language.addEventListener("change",update);
 update();
})();
