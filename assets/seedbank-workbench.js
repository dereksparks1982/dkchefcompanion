
/* DK Seed Bank Garden Workbench: local-first records, not a cloud account. */
(function(){
"use strict";
const core=window.DKSeedBankCore;
if(!core){return;}
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const esc=(v)=>String(v===undefined||v===null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const defaultState=()=>({version:2,additions:[],overrides:{},lots:[],beds:[],harvests:[],savedSeeds:[],tests:[],succession:[],reminderMonth:"",lowStock:30});
const storageKey="dk-seedbank-workbench-v2";
let state=defaultState();
try{const raw=JSON.parse(localStorage.getItem(storageKey)||"null");if(raw&&typeof raw==="object"&&!Array.isArray(raw))state={...state,...raw};}catch(e){}
for(const key of ["additions","lots","beds","harvests","savedSeeds","tests","succession"]){if(!Array.isArray(state[key]))state[key]=[];}
if(!state.overrides||typeof state.overrides!=="object"||Array.isArray(state.overrides))state.overrides={};
const allRoles=["Food crop","Culinary herb","Pollinator","Ornamental","Tree / woody","Grain","Fiber / heritage","Botanical / traditional","Caution"];
const roleClass={"Food crop":"food","Culinary herb":"culinary","Pollinator":"pollinator","Ornamental":"ornamental","Tree / woody":"tree","Grain":"grain","Fiber / heritage":"fiber","Botanical / traditional":"botanical","Caution":"caution"};
const statuses=["Sown","Sprouted","Growing","Transplanted","Flowering","Harvesting","Finished","Failed"];
const id=()=>Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const parseDate=(value)=>{const d=new Date(String(value||"")+"T12:00:00");return Number.isNaN(d.getTime())?null:d;};
const dateOffset=(date,offset)=>{const d=new Date(date);d.setDate(d.getDate()+offset);return d;};
const dateText=(date)=>date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
const monthName=(date)=>date.toLocaleDateString(undefined,{month:"long",year:"numeric"});
const number=(n)=>Number.isFinite(Number(n))?Math.max(0,Number(n)):0;
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));return true;}catch(e){alert("This browser could not save your Seed Bank changes. Export a backup and check browser storage.");return false;}}
function item(key){return core.plants().get(key);}
function matchesName(entry){
 if(entry.seedKey&&item(entry.seedKey))return entry.seedKey;
 const variety=String(entry.variety||"").trim().toLowerCase();
 const plant=String(entry.plant||"").trim().toLowerCase();
 const all=[...core.plants().values()];
 if(variety&&!/standard type|unspecified|unknown|not specified/i.test(variety)){
  const exact=all.filter(p=>p.name.toLowerCase()===variety);
  if(exact.length===1)return exact[0].key;
 }
 const exactPlant=all.filter(p=>p.name.toLowerCase()===plant);
 return exactPlant.length===1?exactPlant[0].key:null;
}
function seedOptions(selected=""){
 const values=[...core.plants().values()].filter(p=>p.card.dataset.archived!=="yes").sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name));
 return '<option value="">Choose a seed variety…</option>'+values.map(p=>'<option value="'+esc(p.key)+'"'+(p.key===selected?' selected':'')+'>'+esc(p.cat+" · "+p.name)+'</option>').join("");
}
function categoryOptions(selected=""){
 return core.categories().map(cat=>'<option value="'+esc(cat)+'"'+(cat===selected?" selected":"")+'>'+esc(cat)+'</option>').join("");
}
function rolesHTML(selected=[]){
 return allRoles.map(role=>'<label class="wb-role"><input type="checkbox" name="role" value="'+esc(role)+'"'+(selected.includes(role)?" checked":"")+'><span class="tag tag-'+roleClass[role]+'">'+esc(role)+'</span></label>').join("");
}
function formSelect(name,required=true,klass=""){
 return '<select name="'+name+'" class="'+klass+'" data-seed-select'+(required?" required":"")+'>'+seedOptions()+'</select>';
}
function familyOf(p){
 if(!p)return "Unknown";
 const name=(p.name+" "+p.cat).toLowerCase();
 if(p.cat==="Tomatoes"||p.cat==="Eggplant"||p.cat==="Peppers"||/belladonna|henbane|tobacco|pokeberry/.test(name))return "Nightshade (Solanaceae)";
 if(/pak choi|bok choy|radish|turnip|kohlrabi|cabbage|kale|collard|brassica/.test(name))return "Brassica (Brassicaceae)";
 if(/garden huckleberry/.test(name))return "Nightshade (Solanaceae)";
  if(/elderberry/.test(name))return "Moschatel (Adoxaceae)";
  if(/strawberry|serviceberry/.test(name))return "Rose (Rosaceae)";
  if(/blueberry|evergreen huckleberry/.test(name))return "Heath (Ericaceae)";
  if(/white mulberry/.test(name))return "Mulberry (Moraceae)";
  if(/english ivy/.test(name))return "Ginseng (Araliaceae)";
  if(/fenugreek/.test(name))return "Legume (Fabaceae)";
 if(/catalogna|chicory|italian dandelion/.test(name))return "Daisy (Asteraceae)";
 if(/winter purslane/.test(name))return "Miner's lettuce (Montiaceae)";
 if(/mâche|mache|corn salad/.test(name))return "Honeysuckle (Caprifoliaceae)";
 if(/swiss chard/.test(name))return "Amaranth (Amaranthaceae)";
 if(/cucumber|cucamelon|melon|watermelon|gourd|pumpkin|squash|zucchini|luffa/.test(name)||p.cat==="Pumpkins and melons"||p.cat==="Gourds and squash")return "Gourd (Cucurbitaceae)";
 if(/carrot|dill|parsley|cilantro|coriander|fennel|anise|parsnip|caraway|cumin/.test(name)||p.cat==="Carrots")return "Carrot (Apiaceae)";
 if(/onion|leek|chives|allium/.test(name)||p.cat.startsWith("Alliums:"))return "Allium (Amaryllidaceae)";
 if(/beet|amaranth|quinoa/.test(name))return "Amaranth (Amaranthaceae)";
 if(/corn|wheat|rye|grass|fescue|barley/.test(name))return "Grass (Poaceae)";
 if(/basil|sage|thyme|oregano|mint|marjoram|savory/.test(name))return "Mint (Lamiaceae)";
 return "Other / verify";
}
function dangerFor(p){
 if(!p)return "";
 const name=p.name.toLowerCase();
 if(/belladonna|deadly nightshade|henbane|foxglove|lily of the valley/.test(name))return "Highly poisonous. Do not consume; protect children and pets.";
 if(/pokeberry|pokeweed|afghan poppy|papaver somniferum/.test(name))return "Potentially toxic or legally restricted plant. Verify handling and local requirements; keep away from pets and children.";
 if(/english ivy/.test(name))return "Leaves are toxic if swallowed and can irritate skin; traditional leaf-cleaning use is not a guarantee of skin-safe soap. Plant can be invasive.";
  if(/garden huckleberry/.test(name))return "Nightshade: unripe fruit may be poisonous. Confirm botanical species and proper preparation; keep away from pets and children.";
  if(/elderberry/.test(name))return "Unripe berries, foliage and stems may be poisonous. Use only correctly prepared ripe berries.";
  if(/wormwood|rue|mugwort/.test(name))return "Contains potentially irritating or toxic compounds; avoid self-medicating and follow species-specific precautions.";
 if(p.card.dataset.tags.split("|").includes("Caution"))return "Use caution: verify the plant's identity, toxicity and safe handling.";
 return "";
}
function onionAdvice(p){
 if(!p)return "";
 const n=p.name.toLowerCase();
 if(/short day|short-day|red burgundy|texas early grano|granex|crystal white wax|red creole/.test(n))return "Short-day onion: generally forms bulbs at about 10–12 hours of daylight; best suited to lower latitudes. Local conditions and cultivar matter.";
 if(/long day|long-day|utah jumbo|sweet spanish/.test(n))return "Long-day onion: generally needs about 14–16 hours of daylight to bulb well; often better suited to northern latitudes.";
 if(/onion/.test(n))return "Check whether this cultivar is short-day, intermediate-day or long-day before planning bulb production.";
 return "";
}
const host=document.createElement("details");host.id="seedWorkbench";host.className="wb-main";
host.innerHTML=
 '<summary>🪴 Garden Workbench <small>Edit inventory · planting calendar · beds · harvests · seed saving · labels</small></summary>'+
 '<div class="wb-inner"><p class="wb-intro">Your garden records stay in this browser. Use <strong>Export full backup</strong> to move them to another device. Automatic cloud sync needs a private backend and is not enabled.</p>'+
 '<div class="wb-quick"><button type="button" data-wb-open="wb-inventory">＋ Add or edit seeds</button><button type="button" data-wb-open="wb-calendar">📅 This month</button><button type="button" data-wb-open="wb-beds">▦ Garden beds</button><button type="button" data-wb-open="wb-backup">↓ Backup</button></div>'+
 '<div class="wb-summary" id="wbSummary"></div>'+
 '<details class="wb-panel" id="wb-inventory"><summary>🌱 Inventory editor and seed lots</summary><div class="wb-panel-body">'+
 '<h3>Add a seed variety</h3><form id="wbAddSeed" class="wb-form">'+
 '<label>Variety or seed name<input name="name" maxlength="140" required placeholder="e.g. Purple Dragon Carrot"></label>'+
 '<label>Category<select name="category" required>'+categoryOptions()+'</select></label>'+
 '<label>Packets / lots owned<input name="amount" type="number" min="0" max="999999" value="1" required></label>'+
 '<label>Seed source<select name="source"><option value="packet">Commercial packet</option><option value="harvested">Saved from my garden</option><option value="unknown">Unknown</option></select></label>'+
 '<fieldset class="wb-span"><legend>Color-coded roles</legend><div class="wb-roles">'+rolesHTML(["Food crop"])+'</div></fieldset>'+
 '<button type="submit" class="wb-primary">Add to Seed Bank</button></form>'+
 '<h3>Edit a seed already in your collection</h3><form id="wbEditSeed" class="wb-form">'+
 '<label class="wb-span">Seed entry'+formSelect("seedKey",true,"wb-edit-seed")+'</label>'+
 '<label>Seed name<input name="name" maxlength="140" required></label>'+
 '<label>Category<select name="category" required>'+categoryOptions()+'</select></label>'+
 '<label>Packets / lots<input name="amount" type="number" min="0" max="999999" required></label>'+
 '<label>Source<select name="source"><option value="packet">Commercial packet</option><option value="harvested">Harvested seeds</option><option value="unknown">Unknown</option></select></label>'+
 '<label class="wb-check"><input name="archived" type="checkbox">Archive / hide this entry</label>'+
 '<fieldset class="wb-span"><legend>Purpose labels</legend><div class="wb-roles">'+rolesHTML()+'</div></fieldset>'+
 '<button type="submit" class="wb-primary">Save seed changes</button></form>'+
 '<p class="wb-note">Built-in seeds can be archived, not permanently erased. Newly added varieties remain in your browser until exported.</p>'+
 '<h3>Record a packet or seed lot</h3><form id="wbLotForm" class="wb-form">'+
 '<label class="wb-span">Variety'+formSelect("seedKey")+'</label>'+
 '<label>Seed lot / packet label<input name="lot" maxlength="90" placeholder="Supplier or lot code"></label>'+
 '<label>Year packed / harvested<input name="year" type="number" min="1900" max="2100" placeholder="2026"></label>'+
 '<label>Known seeds in lot<input name="count" type="number" min="0" max="9999999" placeholder="Leave 0 if unknown"></label>'+
 '<label>Storage place<input name="place" maxlength="100" placeholder="Tin, fridge, freezer…"></label>'+
 '<label>Supplier<input name="supplier" maxlength="100"></label>'+
 '<button type="submit">Add seed lot</button></form><div id="wbLotList"></div>'+
 '</div></details>'+
 '<details class="wb-panel" id="wb-calendar"><summary>📅 Monthly planting assistant and succession reminders</summary><div class="wb-panel-body">'+
 '<p class="wb-note">Calendar dates are approximations based on the last frost date in your Growing Planner, not local weather forecasts or packet-specific guarantees.</p>'+
 '<div class="wb-inline"><label>Month<input id="wbMonth" type="month"></label><button type="button" id="wbShowMonth">See this month</button><button type="button" id="wbOpenPlanner">Change frost date</button></div><div id="wbMonthResults"></div>'+
 '<h3>Succession-sowing reminder</h3><form id="wbSuccessionForm" class="wb-form">'+
 '<label class="wb-span">Seed variety'+formSelect("seedKey")+'</label>'+
 '<label>Start date<input type="date" name="start" required></label>'+
 '<label>Repeat every (days)<input type="number" name="days" min="7" max="120" value="21" required></label>'+
 '<label>Planned sowings<input type="number" name="times" min="1" max="30" value="4"></label>'+
 '<button type="submit">Schedule repeat sowings</button></form><div id="wbSuccessionList"></div>'+
 '</div></details>'+
 '<details class="wb-panel" id="wb-viability"><summary>🧪 Seed viability, germination and low stock</summary><div class="wb-panel-body">'+
 '<p class="wb-note">A germination test is more useful than treating a seed packet date as an automatic expiration. Different species age differently.</p>'+
 '<form id="wbTestForm" class="wb-form"><label class="wb-span">Seed variety'+formSelect("seedKey")+'</label>'+
 '<label>Date tested<input name="date" type="date" required></label>'+
 '<label>Seeds tested<input name="tested" type="number" min="1" max="10000" required></label>'+
 '<label>Seeds sprouted<input name="sprouted" type="number" min="0" max="10000" required></label>'+
 '<button type="submit">Record germination test</button></form>'+
 '<label class="wb-inline">Low stock alert at or below <input type="number" id="wbLowStock" min="0" max="100000" value="30"> known remaining seeds</label>'+
 '<div id="wbViabilityList"></div></div></details>'+
 '<details class="wb-panel" id="wb-beds"><summary>▦ Garden beds, containers and crop rotation</summary><div class="wb-panel-body">'+
 '<form id="wbBedForm" class="wb-form"><label>Bed or container name<input name="name" required maxlength="90" placeholder="Raised bed 1"></label>'+
 '<label>Growing area<select name="type"><option>Outdoor garden</option><option>Unheated greenhouse</option><option>Heated greenhouse</option><option>Indoor container</option></select></label>'+
 '<label>Previous crop family<select name="previous"><option value="">Unknown / new bed</option><option>Nightshade (Solanaceae)</option><option>Brassica (Brassicaceae)</option><option>Gourd (Cucurbitaceae)</option><option>Carrot (Apiaceae)</option><option>Allium (Amaryllidaceae)</option><option>Amaranth (Amaranthaceae)</option><option>Grass (Poaceae)</option><option>Mint (Lamiaceae)</option><option>Legume (Fabaceae)</option><option>Daisy (Asteraceae)</option><option>Miner&#39;s lettuce (Montiaceae)</option><option>Honeysuckle (Caprifoliaceae)</option><option>Other / verify</option></select></label>'+
 '<label class="wb-span">Plant or assign variety'+formSelect("seedKey",false)+'</label>'+
 '<label class="wb-span">Notes<input name="notes" maxlength="220" placeholder="Size, light, watering…"></label>'+
 '<button type="submit">Add garden space</button></form><div id="wbBedList"></div>'+
 '<p class="wb-note">Crop-family warnings are a planning aid, not proof that a bed is disease-free. Rotation history should be verified.</p>'+
 '</div></details>'+
 '<details class="wb-panel" id="wb-harvest"><summary>🧺 Harvest records</summary><div class="wb-panel-body">'+
 '<form id="wbHarvestForm" class="wb-form"><label class="wb-span">Variety'+formSelect("seedKey")+'</label>'+
 '<label>Harvest date<input type="date" name="date" required></label>'+
 '<label>Yield<input type="number" name="amount" min="0.01" step="any" required></label>'+
 '<label>Unit<select name="unit"><option>lb</option><option>oz</option><option>kg</option><option>g</option><option>count</option><option>bunches</option></select></label>'+
 '<label>Garden space<input name="place" maxlength="100" placeholder="Bed / greenhouse"></label>'+
 '<label class="wb-span">Quality and notes<input name="notes" maxlength="240" placeholder="Taste, pest damage, would grow again…"></label>'+
 '<button type="submit">Record harvest</button></form><div id="wbHarvestList"></div></div></details>'+
 '<details class="wb-panel" id="wb-saved"><summary>🌾 Seeds saved from your plants</summary><div class="wb-panel-body">'+
 '<form id="wbSavedForm" class="wb-form"><label class="wb-span">Parent variety'+formSelect("seedKey")+'</label>'+
 '<label>Seed harvest date<input type="date" name="date" required></label>'+
 '<label>Seeds collected<input type="number" min="0" name="count" placeholder="Approximate count"></label>'+
 '<label>Storage location<input name="place" maxlength="100" placeholder="Paper envelope in pantry"></label>'+
 '<label class="wb-span">Isolation, cross-pollination and observations<input name="notes" maxlength="300" placeholder="Isolated? Open pollinated?"></label>'+
 '<button type="submit">Save seed-harvest record</button></form><div id="wbSavedList"></div>'+
 '<p class="wb-note">Saved seed does not guarantee the parent traits, especially from hybrids or cross-pollinating plants.</p></div></details>'+
 '<details class="wb-panel" id="wb-labels"><summary>🏷️ Printable seed packet labels</summary><div class="wb-panel-body">'+
 '<div class="wb-inline"><label>Variety'+formSelect("seedKey")+'</label><button type="button" id="wbAddLabel">Add label</button><button type="button" id="wbPrintLabels">Print selected labels</button><button type="button" id="wbClearLabels">Clear sheet</button></div>'+
 '<div id="wbLabelSheet" class="wb-label-sheet"></div><p class="wb-note">Print dialog opens in your browser; no print job is sent by DK Seed Bank.</p></div></details>'+
 '<details class="wb-panel" id="wb-backup"><summary>💾 Backups, moving devices and data safety</summary><div class="wb-panel-body">'+
 '<p>Seed edits, lots, beds, tests, harvests and photos are saved locally on this browser. Your GitHub Pages website does not currently have a user database or encrypted sign-in, so <strong>live synchronization between devices is not available</strong>.</p>'+
 '<div class="wb-quick"><button id="wbExport" type="button" class="wb-primary">↓ Export full backup</button><button id="wbImport" type="button">↑ Restore a backup</button></div>'+
 '<p class="wb-note">The full backup contains your journal, photos, customized picture URLs and all workbench records. Store it somewhere safe. Restoring can replace existing records: read the confirmation carefully.</p>'+
 '</div></details>'+
 '</div>';
const journalNode=$("#seedJournal");
(journalNode||document.querySelector(".controls")).insertAdjacentElement("afterend",host);
const monthDialog=document.createElement("dialog");monthDialog.id="wbReminderDialog";
monthDialog.innerHTML='<div class="wb-dialog"><h2>🌱 Your monthly seed-starting checklist</h2><p id="wbDialogIntro"></p><div id="wbDialogSuggestions"></div><div class="wb-quick"><button type="button" id="wbDialogSnooze">Dismiss for this month</button><button type="button" id="wbDialogJournal">Open planting journal</button><button type="button" id="wbDialogClose">Close</button></div></div>';
document.body.appendChild(monthDialog);
function notice(text){const area=$("#wbLiveNotice");if(area){area.textContent=text;}else{const p=document.createElement("p");p.id="wbLiveNotice";p.className="wb-note";p.setAttribute("role","status");p.textContent=text;$(".wb-inner").prepend(p);}}
function applyRecords(){
 // Reconstruct custom inventory before touching overrides; baseline HTML stays intact.
 for(const record of state.additions){
  if(!record||!record.name||!record.category)continue;
  core.createInventoryCard(record);
 }
 for(const [key,patch] of Object.entries(state.overrides)){
  if(patch&&typeof patch==="object"&&item(key))core.patchInventoryCard(key,patch);
 }
}
function refreshSelects(){
 const existing=core.plants();
 $$("[data-seed-select]",host).forEach(select=>{
  const current=select.value;select.innerHTML=seedOptions(current);
  if(existing.has(current))select.value=current;
 });
 const set=$("#wbEditSeed [name=seedKey]");if(set&&!set.value){const first=[...existing.keys()][0];if(first){set.value=first;fillEdit();}}
}
function fillEdit(){
 const f=$("#wbEditSeed"),p=item(f.elements.seedKey.value);
 if(!p)return;
 f.elements.name.value=p.name;f.elements.category.value=p.cat;
 f.elements.amount.value=p.card.dataset.amount||0;f.elements.source.value=p.card.dataset.source||"packet";
 f.elements.archived.checked=p.card.dataset.archived==="yes";
 const labels=p.card.dataset.tags.split("|");
 $$('input[name="role"]',f).forEach(c=>{c.checked=labels.includes(c.value);});
}
function getRoles(form){return $$('input[name="role"]:checked',form).map(x=>x.value);}
function savePatch(key,patch){
 if(!item(key))return false;
 const old=state.overrides[key]||{};
 const next={...old,...patch};
 if(!core.patchInventoryCard(key,next))return false;
 state.overrides[key]=next;
 persist();renderAll();return true;
}
$("#wbAddSeed").addEventListener("submit",event=>{
 event.preventDefault();const f=event.currentTarget,values=new FormData(f);
 const name=String(values.get("name")||"").trim().slice(0,140),category=String(values.get("category")||"");
 const key=category+"|"+name;
 if(item(key)||state.additions.some(x=>x.category+"|"+x.name===key)){notice("That seed variety is already in the collection. Use Edit seed instead.");return;}
 const record={name,category,amount:Math.floor(number(values.get("amount"))),source:String(values.get("source")),tags:getRoles(f),archived:false};
 const newKey=core.createInventoryCard(record);
 if(!newKey){notice("Could not create that seed entry. Check the name and category.");return;}
 state.additions.push(record);persist();
 f.reset();refreshSelects();renderAll();notice("Added "+name+". This new entry is stored in this browser and included in backups.");
});
const customDelete=document.createElement("button");customDelete.type="button";customDelete.id="wbDeleteCustom";customDelete.className="wb-danger-button";customDelete.textContent="Delete selected custom seed";
$("#wbEditSeed").appendChild(customDelete);
customDelete.addEventListener("click",()=>{
 const key=$("#wbEditSeed").elements.seedKey.value;
 const original=state.additions.find(r=>r.category+"|"+r.name===key);
 if(!original){notice("Built-in seed entries can be archived, not deleted. Select Archive and save.");return;}
 if(!window.confirm("Permanently remove this custom variety from this browser? Related journal and harvest records will remain as history."))return;
 state.additions=state.additions.filter(r=>r!==original);
 delete state.overrides[key];
 core.deleteInventoryCard(key);
 persist();refreshSelects();renderAll();notice("Removed custom seed from inventory.");
});
$("#wbEditSeed").elements.seedKey.addEventListener("change",fillEdit);
$("#wbEditSeed").addEventListener("submit",event=>{
 event.preventDefault();const f=event.currentTarget,v=new FormData(f);
 const key=String(v.get("seedKey")||""),name=String(v.get("name")||"").trim().slice(0,140);
 if(!name||!item(key))return;
 const duplicate=[...core.plants().entries()].some(([k,p])=>k!==key&&p.cat===v.get("category")&&p.name.toLowerCase()===name.toLowerCase());
 if(duplicate){notice("A seed with that name already exists in the selected category.");return;}
 const patch={name,category:String(v.get("category")),amount:Math.floor(number(v.get("amount"))),source:String(v.get("source")),tags:getRoles(f),archived:!!v.get("archived")};
 if(savePatch(key,patch))notice("Saved changes to "+name+".");
});
$("#wbLotForm").addEventListener("submit",event=>{
 event.preventDefault();const form=event.currentTarget,v=new FormData(form),seedKey=String(v.get("seedKey")||"");
 if(!item(seedKey))return;
 state.lots.push({id:id(),seedKey,lot:String(v.get("lot")||"").slice(0,90),year:number(v.get("year"))||null,count:number(v.get("count")),place:String(v.get("place")||"").slice(0,100),supplier:String(v.get("supplier")||"").slice(0,100)});
 persist();form.reset();renderAll();notice("Seed lot recorded.");
});
function usedSeeds(key){
 return core.journal().filter(e=>matchesName(e)===key).reduce((n,e)=>n+number(e.maxSeeds||e.minSeeds),0);
}
function countSeeds(key){
 return state.lots.filter(x=>x.seedKey===key).reduce((n,x)=>n+number(x.count),0)+state.savedSeeds.filter(x=>x.seedKey===key).reduce((n,x)=>n+number(x.count),0);
}
function renderLots(){
 const grouped=new Map();state.lots.forEach(l=>{const k=l.seedKey;if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(l);});
 $("#wbLotList").innerHTML=grouped.size?[...grouped].map(([key,lots])=>{
  const p=item(key);if(!p)return "";
  const count=countSeeds(key),used=usedSeeds(key),remaining=Math.max(0,count-used);
  return '<div class="wb-record"><strong>'+esc(p.name)+'</strong> · '+count+' known seeds − '+used+' recorded sown = <strong>'+remaining+' estimated remaining</strong>'+
   '<ul>'+lots.map(l=>'<li>'+esc(l.lot||"Unlabeled lot")+' · '+(l.year||"year unknown")+' · '+number(l.count)+' seeds · '+esc(l.place||"storage unrecorded")+' <button type="button" class="wb-small" data-wb-delete="lots" data-id="'+esc(l.id)+'">Remove</button></li>').join("")+'</ul></div>';
 }).join(""):'<p class="wb-empty">No seed lots recorded yet. Add one above to track actual seed counts.</p>';
}
function monthlyCandidates(year,month){
 const settings=core.settings(),frost=parseDate(settings.lastFrost);
 if(!frost)return {error:"Set your actual last spring frost date in Growing Planner first. Region alone is not accurate enough for a planting calendar.",items:[]};
 frost.setFullYear(year);
 const start=new Date(year,month,1,12),end=new Date(year,month+1,0,12),env=settings.environment;
 const windows={
  indoor:[-70,-35],
  "direct-cool":[-35,14],
  "direct-warm":[7,45]
 };
 const matched=[];
 core.plants().forEach(p=>{
  if(p.card.dataset.archived==="yes")return;
  const w=windows[p.guide.mode];if(!w)return;
  const begin=dateOffset(frost,w[0]),finish=dateOffset(frost,w[1]);
  if(begin>end||finish<start)return;
  if(env==="unheated"&&(p.guide.mode==="indoor"||p.guide.mode==="direct-warm")){/* still show; user must provide frost protection */}
  matched.push({key:p.key,begin,finish,name:p.name,cat:p.cat,mode:p.guide.mode});
 });
 matched.sort((a,b)=>a.begin-b.begin||a.name.localeCompare(b.name));
 return {items:matched,month:start,frost,env};
}
function renderMonth(year,month,dialog=false){
 const data=monthlyCandidates(year,month);
 if(data.error){const msg='<p class="wb-warning">'+esc(data.error)+'</p>';if(dialog){$("#wbDialogSuggestions").innerHTML=msg;}else $("#wbMonthResults").innerHTML=msg;return;}
 const list=data.items.slice(0,40).map(x=>
  '<li><span><strong>'+esc(x.name)+'</strong> <small>'+esc(x.cat)+' · '+esc(x.mode==="indoor"?"Start indoors":x.mode==="direct-cool"?"Cool-season direct sow":"Warm-season direct sow")+'</small><small>'+esc(dateText(x.begin))+' to '+esc(dateText(x.finish))+'</small></span>'+
  '<button type="button" data-wb-plant="'+esc(x.key)+'">Record planting</button></li>'
 ).join("");
 const html='<p>Estimated last spring frost: <strong>'+esc(dateText(data.frost))+'</strong> · '+esc(data.env)+'. These ranges are general guidance; verify each packet and the actual weather.</p>'+
 (list?'<ol class="wb-month-list">'+list+'</ol>':'<p>No matching sowing windows in this month for your recorded varieties. Check earlier or later months.</p>')+
 (data.items.length>40?'<p>Showing the first 40 of '+data.items.length+' candidates.</p>':'');
 if(dialog)$("#wbDialogSuggestions").innerHTML=html;else $("#wbMonthResults").innerHTML=html;
}
function showMonth(){
 const value=$("#wbMonth").value,match=/^(\d{4})-(\d{2})$/.exec(value);
 if(!match)return;
 renderMonth(Number(match[1]),Number(match[2])-1);
}
$("#wbMonth").value=today().slice(0,7);
$("#wbShowMonth").addEventListener("click",showMonth);
$("#wbOpenPlanner").addEventListener("click",()=>core.showPlanner());
function showReminder(force=false){
 const d=new Date(),month=dateText(d).slice(0,7);
 if(!force&&(!core.settings().lastFrost||state.reminderMonth===month))return;
 $("#wbDialogIntro").textContent="Recommendations for "+monthName(d)+". Choose Record planting to make a journal entry for anything you sow.";
 renderMonth(d.getFullYear(),d.getMonth(),true);
 if(typeof monthDialog.showModal==="function"&&!monthDialog.open)monthDialog.showModal();
}
$("#wbDialogSnooze").addEventListener("click",()=>{state.reminderMonth=today().slice(0,7);persist();monthDialog.close();});
$("#wbDialogClose").addEventListener("click",()=>monthDialog.close());
$("#wbDialogJournal").addEventListener("click",()=>{monthDialog.close();core.showJournal();});
document.addEventListener("click",event=>{
 const log=event.target.closest("[data-wb-plant]");if(!log)return;
 const key=log.dataset.wbPlant;
 if(monthDialog.open)monthDialog.close();
 core.logPlanting(key);
});
$("#wbSuccessionForm").elements.start.value=today();
$("#wbSuccessionForm").addEventListener("submit",event=>{
 event.preventDefault();const f=event.currentTarget,v=new FormData(f);
 if(!item(String(v.get("seedKey"))))return;
 state.succession.push({id:id(),seedKey:String(v.get("seedKey")),start:String(v.get("start")),days:Math.floor(number(v.get("days"))),times:Math.floor(number(v.get("times"))),done:[]});
 persist();f.reset();f.elements.start.value=today();renderAll();
});
function renderSuccession(){
 const now=parseDate(today());
 $("#wbSuccessionList").innerHTML=state.succession.length?state.succession.map(plan=>{
  const p=item(plan.seedKey),start=parseDate(plan.start);if(!start||!p)return "";
  const due=Array.from({length:Math.min(30,plan.times)},(_,i)=>({i,date:dateOffset(start,i*plan.days)}));
  const pending=due.filter(x=>!plan.done?.includes(x.i));
  const next=pending[0],overdue=next&&next.date<=now;
  return '<div class="wb-record"><strong>'+esc(p.name)+'</strong> · every '+plan.days+' days · '+pending.length+' sowings remain'+
  (next?' · next '+dateText(next.date)+(overdue?' <strong>(due)</strong>':''):' · complete')+
  ' <button type="button" class="wb-small" data-wb-succession="'+esc(plan.id)+'"'+(!next?' disabled':'')+'>Mark next sown</button> '+
  '<button type="button" class="wb-small" data-wb-delete="succession" data-id="'+esc(plan.id)+'">Remove plan</button></div>';
 }).join(""):'<p class="wb-empty">No repeat-sowing reminders set.</p>';
}
document.addEventListener("click",event=>{
 const button=event.target.closest("[data-wb-succession]");if(!button)return;
 const plan=state.succession.find(x=>x.id===button.dataset.wbSuccession);if(!plan)return;
 if(!Array.isArray(plan.done))plan.done=[];
 const i=Array.from({length:plan.times},(_,x)=>x).find(x=>!plan.done.includes(x));
 if(i===undefined)return;plan.done.push(i);persist();renderSuccession();core.logPlanting(plan.seedKey);
});
$("#wbTestForm").elements.date.value=today();
$("#wbTestForm").addEventListener("submit",event=>{
 event.preventDefault();const f=event.currentTarget,v=new FormData(f);
 const tested=number(v.get("tested")),sprouted=number(v.get("sprouted"));
 if(!tested||sprouted>tested){notice("The number sprouted cannot exceed the number tested.");return;}
 state.tests.push({id:id(),seedKey:String(v.get("seedKey")),date:String(v.get("date")),tested,sprouted});
 persist();f.reset();f.elements.date.value=today();renderAll();
});
$("#wbLowStock").value=state.lowStock;
$("#wbLowStock").addEventListener("change",e=>{state.lowStock=number(e.target.value);persist();renderAll();});
function renderViability(){
 const last=[...state.tests].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const tests=last.map(t=>{
  const p=item(t.seedKey);if(!p)return "";
  return '<div class="wb-record"><strong>'+esc(p.name)+'</strong> · '+esc(t.date)+' · <strong>'+Math.round(100*t.sprouted/t.tested)+'% sprouted</strong> ('+t.sprouted+'/'+t.tested+') <button type="button" class="wb-small" data-wb-delete="tests" data-id="'+esc(t.id)+'">Remove</button></div>';
 }).join("");
 const low=[...core.plants()].filter(([k,p])=>p.card.dataset.archived!=="yes"&&countSeeds(k)>0&&Math.max(0,countSeeds(k)-usedSeeds(k))<=state.lowStock);
 const yearWarnings=state.lots.filter(l=>l.year&&new Date().getFullYear()-l.year>=3);
 $("#wbViabilityList").innerHTML='<h3>Recent germination tests</h3>'+(tests||'<p class="wb-empty">No viability tests recorded.</p>')+
 '<h3>Known low-stock seed counts</h3>'+(low.length?'<p>'+low.slice(0,40).map(([k,p])=>esc(p.name)+" ("+Math.max(0,countSeeds(k)-usedSeeds(k))+" seeds)").join(" · ")+'</p>':'<p class="wb-empty">No recorded lots are below the threshold. Unknown counts are not treated as zero.</p>')+
 (yearWarnings.length?'<p class="wb-note">'+yearWarnings.length+' seed lots are three or more years old. Consider germination tests; this does not mean they are dead.</p>':'');
}
$("#wbBedForm").addEventListener("submit",event=>{
 event.preventDefault();const f=event.currentTarget,v=new FormData(f);
 state.beds.push({id:id(),name:String(v.get("name")).slice(0,90),type:String(v.get("type")),previous:String(v.get("previous")),seedKeys:v.get("seedKey")?[String(v.get("seedKey"))]:[],notes:String(v.get("notes")||"").slice(0,220)});
 persist();f.reset();renderAll();
});
function renderBeds(){
 $("#wbBedList").innerHTML=state.beds.length?state.beds.map(b=>{
  const assigned=(b.seedKeys||[]).map(key=>item(key)).filter(Boolean);
  const warning=assigned.some(p=>familyOf(p)===b.previous);
  const list=assigned.map(p=>esc(p.name)+" <small>("+esc(familyOf(p))+")</small>").join(", ");
  return '<div class="wb-record"><strong>'+esc(b.name)+'</strong> · '+esc(b.type)+'<p>Assigned: '+(list||"None")+'</p>'+
  (warning?'<p class="wb-warning">⚠ Same crop family as the previous season. Consider rotating to a different family if practical.</p>':'')+
  '<p>Previous: '+esc(b.previous||"Unknown")+' · '+esc(b.notes||"")+'</p>'+
  '<label>Add a variety <select data-wb-bed-select="'+esc(b.id)+'">'+seedOptions()+'</select></label> '+
  '<button type="button" class="wb-small" data-wb-assign="'+esc(b.id)+'">Assign</button> '+
  '<button type="button" class="wb-small" data-wb-delete="beds" data-id="'+esc(b.id)+'">Remove bed</button></div>';
 }).join(""):'<p class="wb-empty">No garden beds or containers created yet.</p>';
}
document.addEventListener("click",event=>{
 const btn=event.target.closest("[data-wb-assign]");if(!btn)return;
 const bed=state.beds.find(b=>b.id===btn.dataset.wbAssign),select=$('[data-wb-bed-select="'+btn.dataset.wbAssign+'"]');
 if(!bed||!select?.value||!item(select.value))return;
 bed.seedKeys??=[];if(!bed.seedKeys.includes(select.value))bed.seedKeys.push(select.value);
 persist();renderBeds();
});
$("#wbHarvestForm").elements.date.value=today();
$("#wbHarvestForm").addEventListener("submit",event=>{
 event.preventDefault();const f=event.currentTarget,v=new FormData(f);
 state.harvests.push({id:id(),seedKey:String(v.get("seedKey")),date:String(v.get("date")),amount:number(v.get("amount")),unit:String(v.get("unit")),place:String(v.get("place")||"").slice(0,100),notes:String(v.get("notes")||"").slice(0,240)});
 persist();f.reset();f.elements.date.value=today();renderAll();
});
function renderHarvests(){
 $("#wbHarvestList").innerHTML=state.harvests.length?state.harvests.slice().reverse().map(r=>{
  const p=item(r.seedKey);
  return '<div class="wb-record"><strong>'+esc(p?.name||r.seedKey)+'</strong> · '+esc(r.date)+' · '+number(r.amount)+' '+esc(r.unit)+
  ' · '+esc(r.place||"location unspecified")+(r.notes?'<p>'+esc(r.notes)+'</p>':'')+
  ' <button type="button" class="wb-small" data-wb-delete="harvests" data-id="'+esc(r.id)+'">Remove</button></div>';
 }).join(""):'<p class="wb-empty">No harvests recorded yet.</p>';
}
$("#wbSavedForm").elements.date.value=today();
$("#wbSavedForm").addEventListener("submit",event=>{
 event.preventDefault();const f=event.currentTarget,v=new FormData(f);
 state.savedSeeds.push({id:id(),seedKey:String(v.get("seedKey")),date:String(v.get("date")),count:number(v.get("count")),place:String(v.get("place")||"").slice(0,100),notes:String(v.get("notes")||"").slice(0,300)});
 persist();f.reset();f.elements.date.value=today();renderAll();
});
function renderSavedSeeds(){
 $("#wbSavedList").innerHTML=state.savedSeeds.length?state.savedSeeds.slice().reverse().map(r=>{
  const p=item(r.seedKey);
  return '<div class="wb-record"><strong>'+esc(p?.name||r.seedKey)+'</strong> · '+esc(r.date)+' · '+number(r.count)+' collected seeds · '+esc(r.place||"storage unrecorded")+
  (r.notes?'<p>'+esc(r.notes)+'</p>':'')+' <button type="button" class="wb-small" data-wb-delete="savedSeeds" data-id="'+esc(r.id)+'">Remove</button></div>';
 }).join(""):'<p class="wb-empty">No saved seed harvests recorded yet.</p>';
}
let labelKeys=[];
$("#wbAddLabel").addEventListener("click",()=>{
 const key=$("#wb-labels [data-seed-select]").value;if(item(key))labelKeys.push(key);renderLabels();
});
$("#wbClearLabels").addEventListener("click",()=>{labelKeys=[];renderLabels();});
$("#wbPrintLabels").addEventListener("click",()=>{
 if(!labelKeys.length){notice("Add at least one variety to the label sheet.");return;}
 document.body.classList.add("wb-print-labels");window.print();
});
window.addEventListener("afterprint",()=>{document.body.classList.remove("wb-print-labels");});
function renderLabels(){
 $("#wbLabelSheet").innerHTML=labelKeys.map(key=>{
  const p=item(key);if(!p)return "";
  const guide=p.guide,danger=dangerFor(p);
  return '<article class="wb-print-label"><h3>'+esc(p.name)+'</h3><p>'+esc(p.cat)+'</p><p>Depth: '+esc(guide.depth)+' · Spacing: '+esc(guide.spacing)+'</p>'+
  '<p>Light: '+esc(guide.light)+' · '+esc(guide.days)+'</p>'+
  (danger?'<strong>'+esc(danger)+'</strong>':'')+'<small>DK Seed Bank · '+esc(today())+'</small></article>';
 }).join("")||'<p class="wb-empty">Select a seed to create print-ready labels.</p>';
}
document.addEventListener("click",event=>{
 const btn=event.target.closest("[data-wb-delete]");if(!btn)return;
 const list=btn.dataset.wbDelete,record=state[list]?.find(x=>x.id===btn.dataset.id);
 if(!record||!["lots","beds","harvests","savedSeeds","tests","succession"].includes(list))return;
 if(!window.confirm("Remove this "+list+" record?"))return;
 state[list]=state[list].filter(x=>x.id!==btn.dataset.id);
 persist();renderAll();
});
// Species-level journal illustrations are REFERENCES, never proof of the planted cultivar.
// Commons file sources are linked beside each image, and no image is copied into the repo.
const journalReferencePhotos={
 basil:{file:"Starr 080607-7268 Ocimum basilicum.jpg",species:"Ocimum basilicum",by:"Forest & Kim Starr"},
 chives:{file:"20170509Allium schoenoprasum1.jpg",species:"Allium schoenoprasum",by:"Wikimedia Commons contributor"},
 coriander:{file:"CoriandrumSativum.jpg",species:"Coriandrum sativum",by:"Jonathunder"},
 dill:{file:"Starr-081031-0428-Anethum graveolens-leaves-Makawao-Maui (24926744115).jpg",species:"Anethum graveolens",by:"Forest & Kim Starr"},
 thyme:{file:"Flowering Thymus vulgaris.jpg",species:"Thymus vulgaris",by:"Pharmattila"},
 mint:{file:"Mint leaves (Mentha spicata).jpg",species:"Mentha spicata (spearmint)",by:"Commonists"},
 oregano:{file:"Origanum vulgare vulgare 378325973.jpg",species:"Origanum vulgare",by:"Alex Abair"},
 parsley:{file:"Petroselinum crispum leaves.png",species:"Petroselinum crispum",by:"Wikimedia Commons contributor"}
};
function journalPlantGroup(entry){
 const plant=String(entry.plant||"").trim().toLowerCase();
 if(/^(coriander|cilantro)$/.test(plant))return "coriander";
 if(/^(basil|chives|dill|thyme|mint|oregano|parsley)$/.test(plant))return plant;
 return "";
}
function journalCandidates(entry){
 const group=journalPlantGroup(entry);
 if(!group)return [];
 return [...core.plants().values()].filter(p=>{
  const n=p.name.toLowerCase(),cat=p.cat;
  if(group==="chives")return cat.startsWith("Alliums:")&&n.includes("chives");
  if(cat!=="Herbs and medicinal plants")return false;
  if(group==="coriander")return n.includes("coriander")||n.includes("cilantro");
  if(group==="dill")return /^dill\b/.test(n);
  if(group==="mint")return /\bmint\b/.test(n);
  return n.includes(group);
 }).sort((a,b)=>a.name.localeCompare(b.name));
}
function journalGuide(entry,linked,candidates){
 if(linked)return linked.guide;
 if(candidates.length)return candidates[0].guide;
 // Mint and thyme appear in the historic journal, but not in the seed inventory.
 // Provide a crop-level guide without fabricating a seed card or a cultivar.
 const group=journalPlantGroup(entry);
 return group?core.guideFor(group,"Herbs and medicinal plants"):null;
}
function journalCalendar(guide){
 if(!guide)return "Choose a specific seed or confirm the plant species for a schedule.";
 const frost=parseDate(core.settings().lastFrost);
 if(!frost)return "Set a last spring frost date in Growing Planner for estimated planting windows.";
 const offsets=guide.mode==="indoor"?[-70,-35]:guide.mode==="direct-cool"?[-35,14]:guide.mode==="direct-warm"?[7,45]:null;
 if(!offsets)return "Confirm species-specific timing; frost date alone is insufficient.";
 return "Approximate sowing window: "+dateText(dateOffset(frost,offsets[0]))+" to "+dateText(dateOffset(frost,offsets[1]))+". Check local weather and your packet.";
}
function journalDetailsHTML(entry,linked,candidates,guide){
 const label=linked?"Linked variety: "+linked.name:"Plant type only; exact variety unconfirmed";
 const comparison=linked?"These instructions follow your selected seed entry.":candidates.length?
  "Multiple varieties exist in your Seed Bank. This is general crop guidance, not proof of which was planted.":
  "This herb does not currently have a matching seed card in your inventory. General plant-type guidance only.";
 const options='<option value="">Exact variety unknown / not linked</option>'+candidates.map(p=>
  '<option value="'+esc(p.key)+'"'+(linked&&linked.key===p.key?' selected':'')+'>'+esc(p.name)+'</option>').join("");
 const chooser=candidates.length?
  '<label class="wb-journal-link-label">Link a specific variety only if you know it was planted<select data-journal-link="'+esc(entry.id)+'">'+options+'</select></label>':
  '<p class="wb-note">No matching seed variety is currently listed. You can add one in Garden Workbench, but this journal record is preserved.</p>';
 let facts="";
 if(guide){
  const data=[["Depth",guide.depth],["Spacing",guide.spacing],["Sunlight",guide.light],["Germination",guide.germ],["Soil temperature",guide.soil],["Maturity / lifespan",guide.days]];
  facts='<div class="wb-journal-guide-facts">'+data.map(([key,value])=>'<div><small>'+esc(key)+'</small><strong>'+esc(value)+'</strong></div>').join("")+'</div>'+
   '<p><strong>When:</strong> '+esc(guide.when)+'</p>'+
   '<p><strong>Where:</strong> '+esc(guide.where)+'</p>'+
   '<p><strong>Water:</strong> '+esc(guide.water)+'</p>'+
   '<p><strong>Harvest:</strong> '+esc(guide.harvest)+'</p>'+
   (guide.extra?'<p><strong>Species notes:</strong> '+esc(guide.extra)+'</p>':'')+
   '<p class="wb-note">'+esc(journalCalendar(guide))+'</p>';
 }
 return '<p class="wb-journal-link-state">'+esc(label)+'</p>'+chooser+
  '<p class="wb-note">'+esc(comparison)+'</p>'+
  '<h4>Growing instructions</h4>'+facts+
  (linked?'<button type="button" class="wb-small" data-wb-guide="'+esc(linked.key)+'">View full seed card and picture settings</button>':'');
}
function journalEnhance(){
 const entries=core.journal().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.plant).localeCompare(String(b.plant)));
 const cards=$$(".journal-entry",$("#journalEntries"));
 cards.forEach((card,i)=>{
  const entry=entries[i];if(!entry)return;
  const key=matchesName(entry),linked=key?item(key):null,candidates=journalCandidates(entry);
  const guide=journalGuide(entry,linked,candidates);
  const roleList=linked?linked.card.dataset.tags.split("|"):
   candidates.length?candidates.map(p=>p.card.dataset.tags.split("|")).reduce((acc,arr)=>acc.filter(role=>arr.includes(role))):
   journalPlantGroup(entry)?["Culinary herb"]:[];
  const tags=[...new Set(roleList)].filter(r=>roleClass[r]).map(r=>
   '<button type="button" class="tag tag-'+roleClass[r]+' purpose-tag" data-purpose-tag="'+esc(r)+'" aria-pressed="false">'+esc(r)+'</button>').join("");
  const old=$(".wb-journal-overview",card);if(old)old.remove();
  let expanded=$(".wb-journal-details",card);
  if(!expanded){
   expanded=document.createElement("details");expanded.className="wb-journal-details";
   expanded.innerHTML='<summary>Growing guide and full planting record</summary><div class="wb-journal-guide"></div><div class="wb-journal-original"><h4>Planting observations and progress</h4></div>';
   const original=$$(":scope > p",card);
   original.forEach(node=>$(".wb-journal-original",expanded).appendChild(node));
   card.insertBefore(expanded,$(".journal-actions",card));
  }
  $(".wb-journal-guide",expanded).innerHTML=journalDetailsHTML(entry,linked,candidates,guide);
  const photoData=journalReferencePhotos[journalPlantGroup(entry)];
  const seedPhoto=linked?$(".seed-thumb img",linked.card):null;
  const imageURL=seedPhoto?.src||(photoData?"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(photoData.file.replace(/ /g,"_"))+"?width=480":null);
  const sourceLink=photoData?"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(photoData.file.replace(/ /g,"_")):"";
  const plantName=photoData?photoData.species:String(entry.plant||"plant");
  const photoLabel=seedPhoto?"From your selected seed card":"Botanical reference: "+plantName+"; exact planted variety not confirmed";
  const overview=document.createElement("div");overview.className="wb-journal-overview";
  const visual=document.createElement("div");visual.className="wb-journal-visual";
  if(imageURL){
   const image=document.createElement("img");image.loading="lazy";image.alt=photoLabel;image.src=imageURL;
   image.addEventListener("error",()=>{
    if(image.parentNode===visual){image.replaceWith(Object.assign(document.createElement("span"),{textContent:"🌱",className:"wb-journal-placeholder"}));}
    const caption=$(".wb-journal-photo-credit",overview);if(caption)caption.textContent="Reference photo unavailable. No other variety was substituted.";
   });
   visual.appendChild(image);
  }else{
   const placeholder=document.createElement("span");placeholder.className="wb-journal-placeholder";placeholder.textContent="🌱";visual.appendChild(placeholder);
  }
  overview.appendChild(visual);
  const body=document.createElement("div");body.className="wb-journal-headline";
  body.innerHTML='<div class="wb-journal-tags">'+tags+'</div>'+
   '<p><strong>Planted:</strong> '+esc(entry.date)+(entry.time?' · '+esc(entry.time):'')+'</p>'+
   '<p><strong>Seeds sown:</strong> '+esc(entry.minSeeds&&entry.maxSeeds?(entry.minSeeds===entry.maxSeeds?entry.minSeeds:entry.minSeeds+"–"+entry.maxSeeds):"Not recorded")+'</p>'+
   '<p><strong>Variety:</strong> '+esc(linked?linked.name:"Not yet identified")+'</p>'+
   '<p class="wb-journal-photo-credit">'+esc(photoLabel)+'</p>';
  if(!seedPhoto&&photoData){
   const link=document.createElement("a");link.href=sourceLink;link.target="_blank";link.rel="noopener noreferrer";link.className="wb-photo-source";link.textContent="Photo source and license · "+photoData.by;
   body.appendChild(link);
  }
  overview.appendChild(body);
  card.insertBefore(overview,expanded);
 });
}
document.addEventListener("change",event=>{
 const control=event.target.closest?.("select[data-journal-link]");
 if(!control)return;
 const id=control.dataset.journalLink,key=control.value;
 if(key&&!item(key))return;
 core.setJournalSeedKey(id,key);
});
document.addEventListener("dkseedbank:journal-rendered",()=>{journalEnhance();renderSummary();renderLots();renderViability();});
document.addEventListener("dkseedbank:inventorychange",()=>{refreshSelects();renderAll();});
document.addEventListener("click",event=>{
 const btn=event.target.closest("[data-wb-guide]");if(!btn)return;
 const p=item(btn.dataset.wbGuide);if(!p)return;
 const cat=p.card.closest(".category");cat.open=true;
 $(".seed-details",p.card).open=true;p.card.scrollIntoView({behavior:"smooth",block:"start"});
});
function renderSummary(){
 const packets=[...core.plants().values()].filter(p=>p.card.dataset.archived!=="yes");
 $("#wbSummary").innerHTML='<span><strong>'+packets.length+'</strong> active varieties</span>'+
  '<span><strong>'+core.journal().length+'</strong> plantings</span>'+
  '<span><strong>'+state.beds.length+'</strong> garden spaces</span>'+
  '<span><strong>'+state.harvests.length+'</strong> harvests</span>'+
  '<span><strong>'+state.tests.length+'</strong> germination tests</span>';
}
function renderPlantWarnings(){
 core.plants().forEach(p=>{
  const guide=$(".plant-guide",p.card);if(!guide)return;
  const danger=dangerFor(p),onion=onionAdvice(p);
  let box=$(".wb-safety-guidance",guide);
  if(!danger&&!onion){if(box)box.remove();return;}
  if(!box){box=document.createElement("div");box.className="wb-safety-guidance";guide.appendChild(box);}
  box.textContent="";
  if(danger){const el=document.createElement("p");el.className="wb-warning";el.textContent="Safety: "+danger;box.appendChild(el);}
  if(onion){const el=document.createElement("p");el.className="wb-note";el.textContent="Daylength guidance: "+onion;box.appendChild(el);}
 });
}
function renderAll(){
 renderPlantWarnings();renderSummary();renderLots();renderSuccession();renderViability();renderBeds();renderHarvests();renderSavedSeeds();renderLabels();showMonth();journalEnhance();updateBackToTop();
}
function importData(data){
 if(!data||typeof data!=="object"||Array.isArray(data))return false;
 const fresh=defaultState();
 for(const key of ["additions","lots","beds","harvests","savedSeeds","tests","succession"]){
  if(Array.isArray(data[key]))fresh[key]=data[key].filter(x=>x&&typeof x==="object").slice(0,3000);
 }
 if(data.overrides&&typeof data.overrides==="object"&&!Array.isArray(data.overrides))fresh.overrides=data.overrides;
 if(typeof data.reminderMonth==="string")fresh.reminderMonth=data.reminderMonth;
 fresh.lowStock=number(data.lowStock)||30;
 state=fresh;
 if(!persist())return false;
 // Reload from the HTML baseline so an imported backup can also remove
 // custom seeds and reset overrides from the previous browser collection.
 setTimeout(()=>window.location.reload(),500);
 return true;
}
window.DKSeedBankWorkbench=Object.freeze({exportData:()=>structuredClone(state),importData});
$("#wbExport").addEventListener("click",()=>$("#exportJournal").click());
$("#wbImport").addEventListener("click",()=>$("#importJournal").click());
$$("[data-wb-open]",host).forEach(button=>button.addEventListener("click",()=>{
 host.open=true;const panel=document.getElementById(button.dataset.wbOpen);if(panel){panel.open=true;panel.scrollIntoView({behavior:"smooth",block:"start"});}
}));
function makeBackTopButton(className){
 const button=document.createElement("button");button.type="button";button.className=className;
 const withinCategory=className.includes("wb-back-category");
 button.textContent=withinCategory?"↑ Back to category top":"↑ Back to page top";
 button.setAttribute("aria-label",withinCategory?"Back to the beginning of this seed category":"Back to the top of DK Seed Bank");
 button.addEventListener("click",()=>{
  const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior=reduced?"auto":"smooth";
  if(withinCategory){
   const category=button.closest(".category");
   const heading=category?.querySelector(":scope > summary");
   if(heading){heading.scrollIntoView({behavior,block:"start"});return;}
  }
  window.scrollTo({top:0,behavior});
 });
 return button;
}
const backFooter=document.createElement("div");backFooter.className="wb-page-top";
backFooter.appendChild(makeBackTopButton("wb-back-to-top wb-back-final"));document.body.appendChild(backFooter);
function updateBackToTop(){
 $$(".category").forEach(cat=>{
  const cards=$$(".seed",cat),visible=cards.filter(c=>!c.hidden);
  let button=$(".wb-back-to-top",cat);
  const long=cards.length>=9&&visible.length>=7;
  if(long&&!button){button=makeBackTopButton("wb-back-to-top wb-back-category");cat.appendChild(button);}
  if(button)button.hidden=!long;
 });
}
const observer=new MutationObserver(records=>{
 if(records.some(r=>r.attributeName==="hidden"||r.attributeName==="open"))queueMicrotask(updateBackToTop);
});
$$(".category").forEach(cat=>observer.observe(cat,{attributes:true,subtree:false}));
document.addEventListener("click",()=>queueMicrotask(updateBackToTop));
window.addEventListener("resize",updateBackToTop);
document.addEventListener("input",()=>queueMicrotask(updateBackToTop));
document.addEventListener("change",()=>queueMicrotask(updateBackToTop));
applyRecords();refreshSelects();renderAll();
if(core.settings().lastFrost){setTimeout(()=>showReminder(false),1200);}
})();
