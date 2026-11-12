/* DK Seed Bank Watering Manager: per-plant guidance and local-first records. */
(function(){
"use strict";
const core=window.DKSeedBankCore, wb=window.DKSeedBankWorkbench;
if(!core)return;
const key="dk-seedbank-watering-v1";
const $=(s,root=document)=>root.querySelector(s);
const esc=x=>String(x==null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
const dateValue=s=>/^\d{4}-\d\d-\d\d$/.test(String(s))?new Date(s+"T12:00:00"):null;
const addDays=(s,n)=>{const d=dateValue(s);if(!d||Number.isNaN(d.getTime()))return "";d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
const iso=s=>/^\d{4}-\d\d-\d\d$/.test(String(s))&&!!dateValue(s)&&!Number.isNaN(dateValue(s).getTime());
const newId=()=>Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9);
const defaultState=()=>({version:1,records:[],preferences:{},deletedRecords:[]});
let state=defaultState();
try{const raw=JSON.parse(localStorage.getItem(key)||"null");if(raw&&typeof raw==="object"&&!Array.isArray(raw))state={...state,...raw};}catch(e){}
if(!Array.isArray(state.records))state.records=[];
if(!Array.isArray(state.deletedRecords))state.deletedRecords=[];
if(!state.preferences||typeof state.preferences!=="object"||Array.isArray(state.preferences))state.preferences={};
function save(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch(e){alert("Watering records could not be saved. Check browser storage and export a backup.");return false;}}
const types={
 vegetable:{interval:3,frequency:"Check soil every 2–3 days during active growth",weekly:"About 1 inch per week from rain plus irrigation for an established outdoor bed; up to 2 inches during hot, dry weather",soil:"Check soil about 2 inches down; water when dry at root depth",young:"Young plants need consistent shallow moisture while roots establish",peak:"Maintain consistent moisture during flowering, fruit filling and harvest",avoid:"Avoid standing water, shallow daily sprinkles and wet foliage when possible"},
 fruiting:{interval:2,frequency:"Check soil every 1–3 days while fruit is forming",weekly:"Typically 1–2 inches weekly from rain and irrigation together, depending on heat, mulch and soil",soil:"Check 2 inches below surface; soak roots deeply if dry",young:"Keep young transplants consistently moist without saturation",peak:"Steady water while setting fruit reduces stress and uneven development",avoid:"Do not swing between extreme drought and waterlogging; keep foliage dry when possible"},
 leafy:{interval:2,frequency:"Check soil every 1–2 days in warm weather",weekly:"Often around 1–1½ inches weekly from rain and irrigation; higher in heat",soil:"Check the upper 1–2 inches; water before root zone becomes very dry",young:"Keep germination and small seedlings evenly moist",peak:"Consistent water keeps leaves tender and reduces early bolting",avoid:"Avoid wilting, soggy beds and heavy overhead watering at night"},
 root:{interval:3,frequency:"Check soil every 2–3 days until roots establish; then every 3–4 days",weekly:"Roughly 1 inch weekly in established ground beds, adjusting for rain and soil",soil:"Check 2 inches below surface; water deeply when dry",young:"Keep the shallow seed zone evenly moist for germination",peak:"Uniform soil moisture promotes straight, healthy roots and helps avoid splitting",avoid:"Avoid drying out followed by a sudden soaking or persistently flooded soil"},
 cool:{interval:2,frequency:"Check every 2–3 days in cool growing weather",weekly:"About 1 inch per week in ground, including rainfall",soil:"Check 1–2 inches deep; keep moist rather than saturated",young:"New seedlings need even moisture in shallow root zone",peak:"Do not allow pea, brassica or leafy crops to dry during pod/head formation",avoid:"Avoid muddy soil, especially while temperatures are cool"},
 legume:{interval:3,frequency:"Check soil every 2–4 days, more often in hot weather",weekly:"About 1 inch per week from rainfall and irrigation; may need more while flowering",soil:"Check 2 inches down; water well if dry",young:"Moisten seed soil evenly, but avoid rot from wet, cold ground",peak:"Flowering, pod set and pod fill are critical times for consistent water",avoid:"Do not leave roots waterlogged or overwater before seed emerges"},
 peanut:{interval:3,frequency:"Check soil every 2–4 days in warm weather",weekly:"Around 1–1½ inches weekly while pegging and pods form, including rain",soil:"Check the root zone under the foliage; soak if dry without flooding",young:"Keep germination soil lightly moist, then encourage deeper rooting",peak:"Moisture matters most during flowering, pegging and pod development",avoid:"Avoid waterlogging and very wet conditions approaching harvest"},
 corn:{interval:2,frequency:"Check soil every 2–3 days, especially in summer",weekly:"Usually 1–1½ inches per week, potentially 2 inches in heat, rain included",soil:"Water deeply if the upper root zone is dry",young:"Keep soil consistently moist while young stalks establish",peak:"Tasseling, silking and ear filling are highly drought sensitive",avoid:"Do not let corn suffer prolonged dryness during silking"},
 melon:{interval:3,frequency:"Check every 2–3 days while vines and fruit grow",weekly:"Often 1–2 inches weekly from rain plus irrigation during active fruit formation",soil:"Check root zone under mulch, not just exposed topsoil",young:"Maintain even seedling moisture without saturated soil",peak:"Water consistently during flowering and fruit growth; reduce excess water as some melons near harvest",avoid:"Avoid wet foliage and standing water; adjust late-season watering to crop"},
 shrubFruit:{interval:3,frequency:"Check every 2–4 days during active growth and fruiting",weekly:"Often 1–2 inches per week depending on species, rainfall and root depth",soil:"Check beneath mulch 2–3 inches down; moisten root zone when dry",young:"Water newly planted shrubs deeply and often enough to establish roots",peak:"Fruit development and postharvest bud formation benefit from steady water",avoid:"Avoid shallow watering, soggy soil and wet foliage"},
 strawberry:{interval:2,frequency:"Check every 1–3 days during warm fruiting weather",weekly:"Approximately 1–1½ inches weekly, including rainfall",soil:"Check top 1–2 inches beneath mulch and water at base",young:"New plants need moist soil to establish roots",peak:"Consistent moisture helps berries size and keeps plants productive",avoid:"Avoid wet fruit and foliage when possible"},
 mint:{interval:2,frequency:"Check every 1–3 days; containers dry faster",weekly:"Often around 1 inch per week outdoors; pots need water to drainage when root zone dries",soil:"Check top inch; water if it feels dry",young:"Keep seedlings and fresh divisions evenly moist",peak:"Regular moisture supports tender leafy growth",avoid:"Avoid chronically soggy containers; ensure drainage holes"},
 herbMoist:{interval:2,frequency:"Check every 2–3 days during warm active growth",weekly:"Approximately 1 inch weekly in the ground; container needs are more variable",soil:"Check top 1–2 inches; water if dry",young:"Keep seedlings evenly moist until established",peak:"Maintain regular moisture for leafy harvest and new growth",avoid:"Do not let potted herbs stand in water"},
 herbDry:{interval:5,frequency:"Check soil every 4–7 days after establishment, less often in cool periods",weekly:"Often about ½–1 inch or less weekly when established; only irrigate if dry",soil:"Allow upper 2–3 inches to dry before watering again",young:"Water newly germinated plants more regularly, then taper as roots develop",peak:"Usually moderate water, not constant wetness, during bloom",avoid:"Avoid wet crowns, heavy clay and frequent small watering"},
 lavender:{interval:7,frequency:"Check every 5–7 days in active growth, less often once well rooted",weekly:"Usually supplemental watering only when soil has dried; no fixed weekly quota for established plants",soil:"Let upper 2–3 inches dry fully; verify drainage",young:"New lavender needs modest water until rooted, never soggy",peak:"Light to moderate water during active bloom; keep crown dry",avoid:"Avoid winter-wet soil, standing water, and watering automatically by calendar"},
 xeric:{interval:10,frequency:"Check every 7–14 days in the warm season; much less during cool dormancy",weekly:"No routine weekly quantity; water deeply only after the pot/root zone dries",soil:"Allow gritty soil to dry out substantially between waterings",young:"New seed starts need a gently moist, sharply draining medium until rooted",peak:"Adjust with active growth, not flower stages alone",avoid:"Never leave agave, cactus or haworthia in standing water"},
 woodland:{interval:3,frequency:"Check shaded root zone every 2–4 days in active growth",weekly:"Maintain moderate moisture from rain or irrigation rather than a fixed quota",soil:"Check below leaf mulch; keep humus moist but airy",young:"Seedbeds must not dry completely during dormancy and germination",peak:"Keep root zone evenly moist through the growing season",avoid:"Avoid stagnant wet soil and hot, direct sun"},
 camas:{interval:5,frequency:"Check every 4–7 days in spring growth; little or no irrigation during dry dormancy",weekly:"Seasonal spring moisture is more important than a fixed weekly amount",soil:"Spring soil should be moist but well drained; dry naturally as leaves die back",young:"Keep fall-sown seedbeds moist during germination seasons",peak:"Maintain spring moisture while foliage builds bulbs",avoid:"Do not keep dormant camas bulbs constantly wet"},
 flower:{interval:3,frequency:"Check every 2–4 days while actively growing",weekly:"Often around 1 inch per week in ground, including rainfall",soil:"Water if top 1–2 inches dry, aiming below surface roots",young:"Small seeds and new transplants require consistent moisture",peak:"Maintain moisture while flower buds and blooms form",avoid:"Avoid waterlogging and splashing delicate blooms"},
 ornamentalDry:{interval:5,frequency:"Check every 4–7 days once rooted",weekly:"Many established drought-tolerant ornamentals need only supplemental water during drought",soil:"Let upper 2–3 inches dry between waterings",young:"Water seedlings and divisions more regularly during establishment",peak:"Moderate moisture during new growth, then reduce",avoid:"Avoid soggy crowns and heavy wet soil"},
 tree:{interval:5,frequency:"Check every 3–7 days while young; established trees are watered much less often",weekly:"Newly planted trees need slow deep irrigation during dry spells; mature trees depend on species and rainfall",soil:"Check moisture several inches below mulch in the root zone",young:"Water new seedlings and transplants deeply as roots establish",peak:"Long dry periods may need supplementary deep watering",avoid:"Avoid wet trunks, chronic standing water and daily shallow watering"},
 tropical:{interval:3,frequency:"Check every 2–4 days in the warm growing season",weekly:"Moderate consistent moisture in well-drained soil; exact quantity depends on species and container",soil:"Check 1–2 inches down and water if dry",young:"Keep tender seedlings evenly moist in warm conditions",peak:"Increase moisture during fast growth without waterlogging",avoid:"Avoid cold, soggy roots and water standing in saucers"},
 grain:{interval:4,frequency:"Check every 3–5 days when establishing and during seed-head development",weekly:"Around 1 inch in active growth for many grains, but species needs differ",soil:"Check the root zone before watering",young:"Moisture for even germination and early rooting",peak:"Avoid prolonged drought during head filling",avoid:"Avoid saturated ground and overwatering dormant grasses"}
};
function profileFor(name,category){
 const n=String(name||"").toLowerCase(),c=String(category||"");
 if(/agave|haworthia/.test(n))return "xeric";
 if(/blue camas/.test(n))return "camas";
 if(/lavender/.test(n))return "lavender";
 if(/ginseng|herb of paris|lily of the valley/.test(n))return "woodland";
 if(/tamarillo|date palm|moringa|drumstick tree|giant bamboo/.test(n))return "tropical";
 if(/mint|lemon balm|bergamot|hyssop|nettle|borage|lovage|marsh mallow|comfrey|stevia|chervil|parsley|celery/.test(n))return "herbMoist";
 if(/thyme|oregano|marjoram|sage|rosemary|savory|wormwood|rue|fennel|anise|caraway|cumin|milk thistle|horehound/.test(n))return "herbDry";
 if(/strawberry/.test(n))return "strawberry";
 if(/blueberry|huckleberry|serviceberry|elderberry|hazelnut/.test(n))return "shrubFruit";
 if(/peanut/.test(n))return "peanut";
 if(/pea |bean|lentil|cowpea|soybean|fenugreek/.test(n)||c==="Beans and legumes")return /pea \b/.test(n)?"cool":"legume";
 if(/corn/.test(n))return "corn";
 if(/cucumber|pumpkin|melon|watermelon|squash|zucchini|cucamelon|gourd|luffa/.test(n)||c==="Gourds and squash"||c==="Pumpkins and melons")return "melon";
 if(/tomato|pepper|eggplant|okra|artichoke/.test(n)||c==="Tomatoes"||c==="Peppers"||c==="Eggplant"||c==="Other vegetables")return "fruiting";
 if(/lettuce|kale|chard|spinach|pak choi|arugula|collard|cress|endive|chicory|purslane|mâche|corn salad/.test(n)||c==="Leafy greens")return "leafy";
 if(c==="Carrots"||/beet|radish|turnip|parsnip|kohlrabi|onion|garlic|leek|chives/.test(n))return "root";
 if(/cabbage|broccoli|brussels|cauliflower|rapini/.test(n)||c==="Roots and brassicas")return "cool";
 if(c==="Trees and woody plants")return /ivy/.test(n)?"herbMoist":"tree";
 if(c==="Berries and fruit")return "shrubFruit";
 if(c==="Sunflowers")return "flower";
 if(c==="Alliums: chives, onions and leeks")return "root";
 if(c==="Grains and grasses"||c==="Fiber and historical crops")return "grain";
 if(/yarrow|echinacea|pyrethrum|edelweiss|sea holly|phlox|california poppy|blue flax/.test(n))return "ornamentalDry";
 if(c==="Herbs and medicinal plants")return "herbMoist";
 if(c==="Flowers and ornamentals"||c==="Wildflower mixes")return "flower";
 return "vegetable";
}
function guideFor(name,cat){return types[profileFor(name,cat)];}
function stageOf(entry){const status=String(entry.status||"Sown");return /sown/i.test(status)?"seed":/sprouted/i.test(status)?"young":/flowering|harvesting/i.test(status)?"peak":"mature";}
function profileForEntry(entry){
 const p=entry.seedKey&&core.plants().get(entry.seedKey);
 return p?guideFor(p.name,p.cat):guideFor(entry.variety||entry.plant,"Herbs and medicinal plants");
}
function checkEvery(entry){const pref=state.preferences[String(entry.id)]||{},p=profileForEntry(entry),setup=pref.setup||"";
 if(Number.isInteger(+pref.days)&&+pref.days>=1&&+pref.days<=60)return +pref.days;
 if(stageOf(entry)==="seed"||setup==="tray")return 1;
 if(setup==="container")return Math.max(1,Math.min(2,p.interval));
 if(setup==="greenhouse")return Math.max(1,Math.min(3,p.interval));
 return p.interval;
}
function formatPlant(entry){return entry.plant+(entry.variety&&entry.variety!==entry.plant&&!/standard type; exact cultivar not specified/i.test(entry.variety)?" · "+entry.variety:"")+(entry.location&&entry.location!=="Not recorded"?" · "+entry.location:"");}
const panel=document.createElement("details");panel.id="waterManager";panel.className="water-manager";panel.open=false;
panel.innerHTML='<summary>💧 Garden Watering Manager <small>Plant-by-plant guidance · moisture checks · watering records</small></summary>'+
 '<div class="wm-inner"><p class="wm-intro">Check the soil first. A suggested check date is <strong>not</strong> an instruction to water. Rain, heat, mulch, soil, pot size and growth stage all affect needs. Records are saved in this browser; include them in your full Seed Bank backup.</p>'+
 '<div class="wm-summary" id="wmSummary" aria-live="polite"></div>'+
 '<h3>Planting moisture checks</h3><div id="wmDue" class="wm-due"></div>'+
 '<div class="wm-columns"><section><h3>Record a check or watering</h3><form id="wmForm" class="wm-form">'+
 '<label>Recorded planting<select name="plantingId" id="wmPlanting" required></select></label>'+
 '<div id="wmSelectedGuide" class="wm-selected-guide" aria-live="polite"></div>'+
 '<label>Activity<select name="action"><option value="watered">Watered</option><option value="checked">Checked soil only</option><option value="rain">Observed rain</option><option value="skipped">Skipped watering: soil already moist</option></select></label>'+
 '<label>Date<input name="date" type="date" id="wmDate" required></label>'+
 '<label>Soil condition<select name="soil"><option value="unknown">Not measured</option><option value="dry">Dry</option><option value="slightly dry">Slightly dry</option><option value="moist">Moist</option><option value="wet">Wet / waterlogged</option></select></label>'+
 '<div class="wm-inline"><label>Amount (optional)<input name="amount" type="number" min="0" max="100000" step="0.1" placeholder="e.g. 2"></label><label>Unit<select name="unit"><option value="gallons">Gallons</option><option value="liters">Liters</option><option value="cups">Cups</option><option value="inches">Inches of water / rain</option></select></label></div>'+
 '<div class="wm-inline"><label>Growing setup<select name="setup"><option value="ground">In-ground bed</option><option value="raised">Raised bed</option><option value="container">Container / pot</option><option value="greenhouse">Greenhouse</option><option value="tray">Seed tray / cells</option></select></label><label>Check again in (days)<input name="days" type="number" min="1" max="60" required></label></div>'+
 '<label>Notes<input name="notes" maxlength="500" placeholder="Rain yesterday, soil dry 2 inches down…"></label>'+
 '<div class="wm-actions"><button type="submit" class="wm-primary" id="wmSave">Save watering record</button><button type="button" id="wmCancel" hidden>Cancel edit</button></div><p id="wmFeedback" role="status" aria-live="polite"></p>'+
 '</form></section><section><h3>Watering history</h3><div id="wmHistory" class="wm-history"></div></section></div>'+
 '<p class="wm-footnote">Guidance is a starting point, not a moisture sensor or live weather forecast. For in-ground vegetable beds, weekly totals include rainfall. For pots, water according to soil moisture and drainage rather than inches per week.</p>'+
 '<p class="wm-sources">Guidance: <a target="_blank" rel="noopener noreferrer" href="https://yardandgarden.extension.iastate.edu/how-to/watering-home-vegetable-garden">Iowa State Extension · Watering vegetables</a> · <a target="_blank" rel="noopener noreferrer" href="https://gardeningsolutions.ifas.ufl.edu/care/planting/starting-transplants-indoors/">UF/IFAS · Watering seedlings</a></p></div>';
const workbench=document.getElementById("seedWorkbench");
if(workbench)workbench.insertAdjacentElement("afterend",panel);
else document.getElementById("collection").insertAdjacentElement("beforebegin",panel);
const form=$("#wmForm",panel),sel=$("#wmPlanting",panel),feed=$("#wmFeedback",panel);
$("#wmDate",panel).value=today();$("#wmDate",panel).max=today();
let editing="";
const journal=()=>core.journal();
function journalEntry(id){return journal().find(e=>String(e.id)===String(id));}
function selectedEntry(){return journalEntry(sel.value);}
function refreshOptions(preferred){
 const current=preferred||sel.value,entries=journal().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.plant).localeCompare(String(b.plant)));
 sel.innerHTML='<option value="">Select a planting…</option>'+entries.map(e=>'<option value="'+esc(e.id)+'"'+(String(e.id)===current?' selected':'')+'>'+esc(e.date+" · "+formatPlant(e)+(e.status?" ("+e.status+")":""))+'</option>').join("");
 if(!sel.value&&entries.length===1)sel.value=entries[0].id;
 showSelected();
}
function showSelected(){
 const entry=selectedEntry(),box=$("#wmSelectedGuide",panel);
 if(!entry){box.textContent="First record an actual planting in the Planting Journal. Watering records attach to that planting, not merely to an unused seed packet.";return;}
 const p=profileForEntry(entry),pref=state.preferences[String(entry.id)]||{};
 const setup=pref.setup||(/tray|tablet|seedling/i.test(entry.medium||"")?"tray":/greenhouse/i.test(entry.location||"")?"greenhouse":/container|pot/i.test(entry.location||"")?"container":"ground");
 if(!editing){form.elements.namedItem("setup").value=setup;form.elements.namedItem("days").value=checkEvery(entry);}
 box.innerHTML='<strong>'+esc(formatPlant(entry))+'</strong><p>'+esc(p.frequency)+'. '+esc(p.soil)+'.</p><small>Current stage: '+esc(entry.status||"Sown")+'. Suggested next soil check: '+esc(checkEvery(entry))+' day(s) after your last observation. Water only if soil needs it.</small>';
}
function insertGuides(){
 let n=0;
 core.plants().forEach(p=>{
  const target=$(".plant-guide",p.card);if(!target)return;
  const current=$(".water-guidance",target);if(current)current.remove();
  const pr=guideFor(p.name,p.cat),wrap=document.createElement("section");
  wrap.className="water-guidance";
  wrap.innerHTML='<h4>💧 Watering guide · '+esc(p.name)+'</h4>'+
  '<p><strong>How often:</strong> '+esc(pr.frequency)+'. Always check soil before watering.</p>'+
  '<p><strong>How much (in-ground):</strong> '+esc(pr.weekly)+'.</p>'+
  '<p><strong>During germination:</strong> Check the seedbed daily and keep it evenly moist, never soggy. Surface-sown seeds can dry quickly.</p>'+
  '<p><strong>Young plants:</strong> '+esc(pr.young)+'.</p>'+
  '<p><strong>Established plants:</strong> '+esc(pr.soil)+'.</p>'+
  '<p><strong>Flowering / fruiting:</strong> '+esc(pr.peak)+'.</p>'+
  '<p><strong>Avoid overwatering:</strong> '+esc(pr.avoid)+'.</p>'+
  '<p><strong>Containers / heat / rain:</strong> Check pots and greenhouse plants more frequently, especially in hot or windy weather. Reduce irrigation after rain. Sandy soils dry faster than clay; drain water freely from pots.</p>'+
  '<button type="button" data-wm-seed="'+esc(p.key)+'">Record watering for an actual planting</button>';
  target.appendChild(wrap);n++;
 });
 return n;
}
function latestFor(id){return state.records.filter(r=>r.plantingId===id).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.id).localeCompare(String(a.id)))[0]||null;}
function renderDue(){
 const active=journal().filter(e=>!["Finished","Failed"].includes(e.status)),summary=$("#wmSummary",panel),due=$("#wmDue",panel);
 let needs=0,first=0;
 const list=active.map(e=>{
  const latest=latestFor(String(e.id)),days=checkEvery(e),next=latest?addDays(latest.date,days):null;
  const badge=!latest?"No check recorded":next<=today()?"Check soil today":("Next check "+next);
  if(!latest)first++;else if(next<=today())needs++;
  return {entry:e,date:next,latest,badge,rank:!latest?1:next<=today()?0:2};
 }).sort((a,b)=>a.rank-b.rank||String(a.date||"").localeCompare(String(b.date||""))||String(a.entry.plant).localeCompare(String(b.entry.plant)));
 summary.innerHTML='<span><strong>'+active.length+'</strong> active planting records</span>'+
  '<span><strong>'+needs+'</strong> checks due or past suggested date</span>'+
  '<span><strong>'+first+'</strong> without a moisture check</span>'+
  '<span><strong>'+state.records.length+'</strong> watering/history records</span>';
 if(!list.length){due.innerHTML='<p class="wm-empty">No active planting records. Use the Planting Journal to record what you actually sowed; every seed card already has a watering guide.</p>';return;}
 due.innerHTML=list.map(x=>'<div class="wm-due-row"><div><strong>'+esc(formatPlant(x.entry))+'</strong><span>'+esc(x.badge)+'</span>'+(x.latest?'<small>Last: '+esc(x.latest.date)+' · '+esc(x.latest.action)+', '+esc(x.latest.soil)+'</small>':"")+'</div><button type="button" data-wm-open="'+esc(x.entry.id)+'">Log check</button></div>').join("");
}
function history(){
 const records=state.records.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.id).localeCompare(String(a.id)));
 const target=$("#wmHistory",panel);
 if(!records.length){target.innerHTML='<p class="wm-empty">No watering or moisture checks recorded yet.</p>';return;}
 target.innerHTML=records.slice(0,200).map(r=>{
  const e=journalEntry(r.plantingId),name=e?formatPlant(e):r.label||"Planting removed from journal";
  return '<article class="wm-record"><div class="wm-record-head"><strong>'+esc(r.date)+'</strong><span>'+esc(r.action)+'</span></div><p>'+esc(name)+'</p><p>Soil: '+esc(r.soil)+(r.amount>0?' · '+esc(r.amount)+' '+esc(r.unit):"")+'</p>'+(r.notes?'<p>'+esc(r.notes)+'</p>':"")+
  '<div class="wm-record-actions"><button type="button" data-wm-edit="'+esc(r.id)+'">Edit</button><button type="button" data-wm-remove="'+esc(r.id)+'">Delete</button></div></article>';
 }).join("");
 if(records.length>200)target.insertAdjacentHTML("beforeend",'<p class="wm-empty">Showing 200 newest records; '+(records.length-200)+' older records remain saved in the backup.</p>');
}
function renderAll(){refreshOptions();renderDue();history();}
function openFor(id){
 panel.open=true;refreshOptions(String(id||""));panel.scrollIntoView({behavior:"smooth",block:"start"});
 if(sel.value)form.elements.namedItem("action").focus();
}
function endEdit(){editing="";$("#wmCancel",panel).hidden=true;$("#wmSave",panel).textContent="Save watering record";form.reset();form.elements.namedItem("date").value=today();$("#wmDate",panel).max=today();showSelected();}
sel.addEventListener("change",()=>{editing="";showSelected();});
form.elements.namedItem("action").addEventListener("change",()=>{
 const action=form.elements.namedItem("action").value;
 form.elements.namedItem("amount").disabled=action!=="watered"&&action!=="rain";
});
form.addEventListener("submit",e=>{
 e.preventDefault();
 const entry=selectedEntry();if(!entry){feed.textContent="Choose a real planting first.";return;}
 const data=new FormData(form),action=String(data.get("action")||"checked");
 const date=String(data.get("date")||""),amountRaw=String(data.get("amount")||""),amount=amountRaw?Number(amountRaw):0;
 const days=Number(data.get("days")||0),unit=String(data.get("unit")||"gallons");
 const allowed=["watered","checked","rain","skipped"];
 if(!iso(date)||date>today()||!allowed.includes(action)||!Number.isInteger(days)||days<1||days>60||!Number.isFinite(amount)||amount<0||amount>100000||!["gallons","liters","cups","inches"].includes(unit)){feed.textContent="Check date, amount, units and next-check interval.";return;}
 const record={id:editing||newId(),updatedAt:new Date().toISOString(),plantingId:String(entry.id),label:formatPlant(entry),date,action,soil:String(data.get("soil")||"unknown"),amount:(action==="watered"||action==="rain")?amount:0,unit,notes:String(data.get("notes")||"").trim().slice(0,500)};
 const existing=state.records.slice(),oldPreferences={...state.preferences};
 if(editing)state.records=state.records.filter(r=>r.id!==editing);
 state.records.push(record);
 state.preferences[String(entry.id)]={setup:String(data.get("setup")||"ground"),days};
 if(!save()){state.records=existing;state.preferences=oldPreferences;return;}
 const currentId=String(entry.id);
 endEdit();refreshOptions(currentId);renderDue();history();feed.textContent="Saved. The next date is a soil check, not an automatic watering order.";
});
$("#wmCancel",panel).addEventListener("click",()=>{endEdit();feed.textContent="Edit cancelled.";});
panel.addEventListener("click",e=>{
 const btn=e.target.closest("[data-wm-open],[data-wm-edit],[data-wm-remove]");
 if(!btn)return;
 if(btn.hasAttribute("data-wm-open")){openFor(btn.dataset.wmOpen);return;}
 if(btn.hasAttribute("data-wm-edit")){
  const r=state.records.find(x=>x.id===btn.dataset.wmEdit);if(!r)return;
  editing=r.id;refreshOptions(r.plantingId);
  if(!selectedEntry()){feed.textContent="Original planting was removed. You can still delete this orphaned record.";editing="";return;}
  for(const name of ["date","action","soil","amount","unit","notes"])form.elements.namedItem(name).value=r[name]==null?"":r[name];
  const pref=state.preferences[r.plantingId]||{};
  form.elements.namedItem("setup").value=pref.setup||"ground";
  form.elements.namedItem("days").value=pref.days||checkEvery(selectedEntry());
  $("#wmCancel",panel).hidden=false;$("#wmSave",panel).textContent="Update record";
  form.elements.namedItem("action").dispatchEvent(new Event("change"));
  panel.open=true;form.scrollIntoView({behavior:"smooth",block:"center"});return;
 }
 if(btn.hasAttribute("data-wm-remove")){
  const r=state.records.find(x=>x.id===btn.dataset.wmRemove);
  if(!r||!confirm("Delete this watering record?"))return;
  const oldRecords=state.records,oldDeletes=state.deletedRecords;
   state.records=state.records.filter(x=>x.id!==r.id);
   state.deletedRecords=[...state.deletedRecords,{id:r.id,deletedAt:new Date().toISOString()}].slice(-20000);
  if(!save()){state.records=oldRecords;state.deletedRecords=oldDeletes;return;}
  if(editing===r.id)endEdit();
  renderDue();history();feed.textContent="Watering record deleted.";
 }
});
document.addEventListener("click",event=>{
 const btn=event.target.closest("[data-wm-seed],[data-wm-journal]");
 if(!btn)return;
 if(btn.dataset.wmJournal){openFor(btn.dataset.wmJournal);return;}
 const available=journal().filter(e=>e.seedKey===btn.dataset.wmSeed);
 if(available.length){openFor(available[0].id);feed.textContent=available.length>1?"Choose the correct planting from the dropdown if needed.":"";}
 else{panel.open=true;panel.scrollIntoView({behavior:"smooth",block:"start"});feed.textContent="No exact linked planting yet. Record a planting in the journal, then log its watering here.";}
});
function enhanceJournal(){
 const journalRecords=journal().slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.plant).localeCompare(String(b.plant)));
 const cards=Array.from(document.querySelectorAll("#journalEntries .journal-entry"));
 cards.forEach((el,i)=>{
  const entry=journalRecords[i],actions=el.querySelector(".journal-actions");if(!entry||!actions)return;
  if(actions.querySelector("[data-wm-journal]"))return;
  const btn=document.createElement("button");btn.type="button";btn.dataset.wmJournal=entry.id;btn.textContent="💧 Watering";btn.title="Record moisture checks for this planting";actions.appendChild(btn);
 });
}
document.addEventListener("dkseedbank:journal-rendered",()=>{refreshOptions();renderDue();history();enhanceJournal();});
document.addEventListener("dkseedbank:inventorychange",()=>{insertGuides();refreshOptions();renderDue();});
if(workbench){
 const quick=workbench.querySelector(".wb-quick");
 if(quick){const button=document.createElement("button");button.type="button";button.textContent="💧 Watering manager";button.addEventListener("click",()=>{panel.open=true;panel.scrollIntoView({behavior:"smooth",block:"start"});});quick.appendChild(button);}
}
function importData(value){
 if(!value||typeof value!=="object"||Array.isArray(value))return false;
 const records=Array.isArray(value.records)?value.records.filter(r=>r&&typeof r.id==="string"&&typeof r.plantingId==="string"&&iso(r.date)).slice(0,20000):[];
 const preferences=value.preferences&&typeof value.preferences==="object"&&!Array.isArray(value.preferences)?value.preferences:{};
 const deletedRecords=Array.isArray(value.deletedRecords)?value.deletedRecords.filter(x=>
  x&&typeof x.id==="string"&&typeof x.deletedAt==="string").slice(-20000):[];
 const previous=state;state={version:1,records,preferences,deletedRecords};
 if(!save()){state=previous;return false;}renderAll();return true;
}
window.DKSeedBankWatering=Object.freeze({exportData:()=>JSON.parse(JSON.stringify(state)),importData,guideFor,openFor});
insertGuides();renderAll();enhanceJournal();
})();
