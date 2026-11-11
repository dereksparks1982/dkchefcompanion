
(function(){
"use strict";
const cards=Array.from(document.querySelectorAll(".seed"));
const cats=Array.from(document.querySelectorAll(".category"));
const search=document.getElementById("search");
const storageKey="dk-seed-bank-journal-v1";
const settingsKey="dk-seed-bank-growing-profile-v1";
const field=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){return false;}};
const esc=(v)=>String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const def=(depth,spacing,light,germ,soil,when,where,water,harvest,mode,setup,days,extra)=>({depth,spacing,light,germ,soil,when,where,water,harvest,mode,setup,days,extra:extra||""});
const guides={
 generic:def("Check packet","Check species","Check packet","Varies","Varies","Follow species and packet guidance","Unknown until species is confirmed","Keep evenly moist during germination, avoid saturation","Varies","unknown","verify","Varies","General botanical guidance only; this variety needs verification."),
 tomato:def("¼ in","24–36 in","Full sun","5–10 days","75–85°F","Start indoors about 5–8 weeks before last spring frost","Warm bed or greenhouse; harden off before transplanting","Water evenly, especially during fruiting","Typically 65–90 days from transplant","indoor","protected", "65–90 days","Support vining plants; long-season cultivars often benefit from protected growing."),
 pepper:def("¼ in","12–24 in","Full sun","7–21 days","75–90°F","Start indoors about 8–10 weeks before last spring frost","Warm greenhouse or sheltered bed; transplant after soil warms","Keep consistently moist; good drainage","Roughly 60–120 days from transplant","indoor","protected","60–120 days","Very hot varieties can mature slowly; provide extra warmth in short seasons."),
 carrot:def("¼ in","2–3 in after thinning","Full sun","10–21 days","50–80°F","Direct sow early spring as soil becomes workable; sow again for fall","Deep, loose, stone-free garden soil","Maintain steady moisture while sprouting","Generally 55–85 days","direct-cool","outdoor","55–85 days","Do not transplant taproots; thin seedlings gently."),
 parsnip:def("½ in","3–4 in","Full sun","14–28 days","50–70°F","Direct sow early in spring","Deep, loose soil; outdoor bed","Keep seedbed consistently damp","Typically 100–130 days","direct-cool","outdoor","100–130 days","Slow germination and long season; fresh seed helps."),
 radish:def("½ in","1–2 in","Full sun / partial sun","3–10 days","45–75°F","Direct sow in cool spring or fall","Outdoor bed or deep container","Even moisture for tender roots","Typically 25–50 days","direct-cool","outdoor","25–50 days"),
 beet:def("½ in","3–4 in","Full sun","5–14 days","50–85°F","Direct sow in cool spring or late summer","Loose outdoor soil or deep containers","Keep evenly moist","Typically 50–70 days","direct-cool","outdoor","50–70 days"),
 turnip:def("¼–½ in","4–6 in","Full sun","4–10 days","50–80°F","Direct sow in spring or late summer","Cool-season outdoor bed","Even moisture","Typically 40–60 days","direct-cool","outdoor","40–60 days"),
 kohlrabi:def("¼–½ in","6–8 in","Full sun","5–10 days","55–75°F","Start early spring or sow for fall","Cool-season outdoor bed","Consistent moisture","Typically 45–70 days","direct-cool","outdoor","45–70 days"),
 sunflower:def("1 in","12–24 in; larger giants need more room","Full sun","7–14 days","65–80°F","Direct sow once soil is warm and hard frosts have passed","Sunny outdoor bed, protected from wind","Moist during establishment; moderate thereafter","Typically 70–110 days","direct-warm","outdoor","70–110 days","Giant and oilseed types differ in height, branching and harvest."),
 eggplant:def("¼ in","18–24 in","Full sun","7–14 days","75–90°F","Start indoors 8–10 weeks before last frost","Warm greenhouse or very warm garden","Regular moisture and warm root zone","Typically 65–90 days from transplant","indoor","protected","65–90 days"),
 pumpkin:def("1 in","3–6 ft, depending on vine","Full sun","5–10 days","70–95°F","Direct sow after frost when soil is thoroughly warm","Sunny, fertile bed with room for vines","Deep and regular watering","Typically 90–120 days","direct-warm","protected","90–120 days","Giant cultivars may need much more space and growing time."),
 melon:def("½–1 in","24–48 in or trellised","Full sun","5–10 days","70–90°F","Sow after frost; indoor start 2–4 weeks early if season is short","Warm greenhouse or sheltered outdoor bed","Keep soil evenly moist; reduce excess water near ripe fruit","Typically 70–110 days","direct-warm","protected","70–110 days"),
 squash:def("1 in","18–48 in by growth habit","Full sun","5–10 days","70–95°F","Direct sow after frost or start 2–3 weeks indoors","Rich, sunny soil; greenhouse possible with pollination plan","Water deeply, avoiding waterlogged roots","Typically 45–110 days depending on type","direct-warm","protected","45–110 days","Bush and vining cultivars need very different space."),
 corn:def("1–1½ in","8–12 in; plant in blocks","Full sun","5–10 days","60–95°F","Direct sow after soil reaches at least 60°F","Outdoor fertile soil; shelter from high winds","Consistent water, especially at silking","Typically 65–120 days","direct-warm","outdoor","65–120 days","Plant in blocks for pollination; isolate seed-saving varieties."),
 grain:def("¼–1 in depending on crop","Check species","Full sun","4–14 days","Varies","Match sowing to crop and local season","Outdoor grain bed or trial plot","Keep seedbed moist through emergence","Varies","unknown","outdoor","Varies","Quinoa, amaranth, rye, and wheat have different requirements; verify crop."),
 flower:def("Species-specific; often surface–¼ in","Varies","Full sun to partial shade","7–21+ days","Varies","Spring sowing or frost-based starting, depending on species","Outdoor beds, greenhouse starts for tender species","Keep germinating seed evenly damp","Bloom time varies","unknown","verify","Varies","Mixes contain multiple species with different depth and sun needs."),
 poppy:def("Surface sow; press lightly","6–12 in","Full sun","10–21 days","Cool soil","Direct sow early spring or fall where suitable","Well-drained outdoor bed","Water lightly until established","Seasonal flowering","direct-cool","outdoor","Varies","Poppy seed often needs light to germinate; do not bury deeply."),
 basil:def("¼ in","10–12 in","Full sun","5–10 days","70–85°F","Start indoors 4–6 weeks before last frost; transplant after frost","Warm garden, indoor grow lights or greenhouse","Keep moist but well drained","Harvest leaves repeatedly after establishment","indoor","protected","About 60–90 days","Pinch tips to encourage branching."),
 chives:def("¼ in","8–12 in","Full sun / partial sun","7–21 days","60–70°F","Start indoors 6–8 weeks before transplant or sow spring","Outdoor herb bed or container","Keep moderately moist","Snip leaves once established","indoor","outdoor","Perennial","Often overwinters in cold climates with suitable conditions."),
 thyme:def("Surface–⅛ in","8–12 in","Full sun","14–28 days","65–75°F","Start indoors 8–10 weeks before frost","Well-drained, not soggy soil; greenhouse or outdoor","Water sparingly once established","Cut sprigs after plants establish","indoor","protected","Perennial","Fine seeds need light or only very light cover."),
 oregano:def("Surface–⅛ in","12–18 in","Full sun","7–14 days","65–75°F","Start indoors 6–10 weeks before last frost","Herb bed, container or greenhouse","Moderate; avoid waterlogging","Harvest before or during flowering","indoor","protected","Perennial","Hardiness varies by oregano type."),
 dill:def("¼ in","12–18 in","Full sun","7–14 days","60–75°F","Direct sow when spring soil is workable; repeat sow for leaves","Outdoor herb bed or deep container","Regular moisture, especially when small","Leaves early; umbels and seeds later","direct-cool","outdoor","Annual","Taproot dislikes transplanting."),
 coriander:def("¼–½ in","6–8 in","Full sun / light afternoon shade","7–14 days","55–70°F","Direct sow in cool spring; repeat sow; fall in mild climates","Cool-season bed or deep container","Moderate and even; avoid heat stress","Harvest leaves early or dry coriander seed later","direct-cool","outdoor","Annual","Bolts faster in heat; succession planting helps."),
 parsley:def("¼ in","8–12 in","Full sun / partial sun","14–28 days","65–75°F","Start indoors 8–10 weeks before last frost or direct sow","Outdoor herb bed or container","Keep soil evenly moist","Harvest outer stems after growth","indoor","outdoor","Biennial","Parsley commonly germinates slowly."),
 mint:def("Surface–⅛ in","12–18 in","Partial sun / full sun","10–21 days","65–75°F","Start indoors 6–8 weeks before frost","Grow in a container to control spread","Keep moderately moist","Harvest leafy stems repeatedly","indoor","outdoor","Perennial","Mint seed may not match named cultivars; often propagated by cuttings."),
 fennel:def("¼ in","12–18 in","Full sun","7–14 days","60–75°F","Sow in spring after last severe freezes","Sunny outdoor bed or deep container","Moist, well-drained soil","Leaves, seed or bulbs depending on type","direct-cool","outdoor","Varies","Florence fennel forms bulbs, bronze fennel usually does not."),
 cotton:def("½–1 in","18–30 in","Full sun","5–12 days","70–85°F","Start indoors for short seasons; transplant after soil warms","Long, warm season; greenhouse may be necessary in Alaska","Moderate, well-drained","Typically 140–180 frost-free days","indoor","heated","140–180 days","Fiber colors and harvest requirements vary by cultivar."),
 tobacco:def("⅛ in or surface; very light cover","18–24 in","Full sun","7–14 days","70–80°F","Start indoors 6–8 weeks before last frost","Warm outdoor site or greenhouse; keep away from children/pets","Moderate, well-drained","Typically 90–120+ days","indoor","protected","90–120+ days","Caution: nicotine is toxic. Avoid handling wet leaves without protection."),
 tree:def("Species-specific; check seed instructions","Varies","Species-specific","Weeks to months","Species-specific","Many tree seeds need stratification or special pretreatment","Outdoor nursery, protected propagation or containers","Avoid drying out or waterlogging","Years; varies","unknown","verify","Years","Check botanical identity, dormancy and cold-hardiness before planting."),
 tropical:def("Species-specific; check packet","Varies","Bright light / full sun","Weeks or longer","Warm medium","Start under reliably warm conditions","Heated greenhouse or indoor growing in cold regions","Moist but well drained","Varies, often years","unknown","heated","Years","Some tropical trees cannot overwinter outdoors in Alaska.")
};
function resolveGuide(name,cat){
 const n=name.toLowerCase();
 if(cat==="Tomatoes")return n.includes("tamarillo")?guides.tropical:guides.tomato;
 if(cat==="Peppers")return guides.pepper;
 if(cat==="Carrots")return guides.carrot;
 if(cat==="Sunflowers")return guides.sunflower;
 if(cat==="Eggplant")return guides.eggplant;
 if(cat==="Wildflower mixes")return guides.flower;
 if(cat==="Roots and brassicas")return n.includes("parsnip")?guides.parsnip:n.includes("kohlrabi")?guides.kohlrabi:n.includes("turnip")?guides.turnip:n.includes("radish")?guides.radish:guides.beet;
 if(cat==="Pumpkins and melons")return n.includes("pumpkin")?guides.pumpkin:guides.melon;
 if(cat==="Gourds and squash")return n.includes("loofah")?guides.tropical:guides.squash;
 if(cat==="Trees and woody plants")return /date palm|moringa/.test(n)?guides.tropical:guides.tree;
 if(cat==="Flowers and ornamentals")return /poppy/.test(n)?guides.poppy:guides.flower;
 if(cat==="Fiber and historical crops")return /tobacco/.test(n)?guides.tobacco:guides.cotton;
 if(cat==="Grains and grasses")return /corn/.test(n)?guides.corn:guides.grain;
 if(cat==="Herbs and medicinal plants"){
  for(const k of ["basil","chives","thyme","oregano","dill","coriander","cilantro","parsley","mint","fennel"])if(n.includes(k))return guides[k==="cilantro"?"coriander":k];
  if(n.includes("marjoram"))return guides.oregano;
  if(n.includes("anise")||n.includes("caraway")||n.includes("cumin"))return guides.coriander;
  return guides.generic;
 }
 return guides.generic;
}
const commonWiki={
 "Wildflower mixes":"Wildflower","Sunflowers":"Helianthus annuus","Carrots":"Carrot","Tomatoes":"Tomato",
 "Eggplant":"Eggplant","Peppers":"Capsicum annuum","Roots and brassicas":"Root vegetable",
 "Pumpkins and melons":"Cucurbitaceae","Gourds and squash":"Squash (plant)",
 "Trees and woody plants":"Tree","Flowers and ornamentals":"Flower",
 "Herbs and medicinal plants":"Herb","Grains and grasses":"Cereal",
 "Fiber and historical crops":"Fiber crop"
};
function wikiFor(name,cat){
 const n=name.toLowerCase();
 if(cat==="Wildflower mixes")return n.includes("butterfly")?"Butterfly gardening":"Wildflower";
 if(cat==="Tomatoes"&&n.includes("tamarillo"))return "Tamarillo";
 if(cat==="Peppers"){
  if(n.includes("ghost"))return "Bhut jolokia";
  if(n.includes("scotch bonnet"))return "Scotch bonnet";
  if(n.includes("carolina reaper"))return "Carolina Reaper";
  if(n.includes("habanero"))return "Habanero";
  if(n.includes("tabasco"))return "Tabasco pepper";
  if(n.includes("serrano"))return "Serrano pepper";
  if(n.includes("jalape"))return "Jalapeño";
  if(n.includes("poblano"))return "Poblano";
  if(n.includes("cayenne"))return "Cayenne pepper";
  return commonWiki[cat];
 }
 if(cat==="Roots and brassicas")return n.includes("parsnip")?"Parsnip":n.includes("radish")?"Radish":n.includes("kohlrabi")?"Kohlrabi":n.includes("turnip")?"Turnip":"Beetroot";
 if(cat==="Pumpkins and melons")return n.includes("pumpkin")?"Pumpkin":n.includes("cucamelon")?"Melothria scabra":n.includes("watermelon")?"Watermelon":"Cantaloupe";
 if(cat==="Gourds and squash")return n.includes("loofah")?"Luffa aegyptiaca":n.includes("zucchini")?"Zucchini":n.includes("butternut")?"Butternut squash":n.includes("delicata")?"Delicata squash":"Summer squash";
 if(cat==="Trees and woody plants")return n.includes("date")?"Date palm":n.includes("hazelnut")?"Hazelnut":n.includes("pine")?"Pine":n.includes("moringa")?"Moringa oleifera":n.includes("sequoia")?"Sequoiadendron giganteum":n.includes("pecan")?"Pecan":n.includes("sugar maple")?"Acer saccharum":n.includes("boxwood")?"Buxus":commonWiki[cat];
 if(cat==="Flowers and ornamentals")return n.includes("rose")?"Rose":n.includes("poppy")?(n.includes("california")?"Eschscholzia californica":"Papaver somniferum"):n.includes("morning glory")?"Ipomoea tricolor":n.includes("sea holly")?"Eryngium planum":n.includes("edelweiss")?"Leontopodium alpinum":n.includes("zinnia")?"Zinnia elegans":n.includes("lily of the valley")?"Convallaria majalis":n.includes("pokeberry")?"Phytolacca americana":n.includes("larkspur")?"Consolida ajacis":n.includes("coleus")?"Coleus":n.includes("celosia")?"Celosia argentea":n.includes("haworthia")?"Haworthia":n.includes("dahlia")?"Dahlia":n.includes("phlox")?"Phlox subulata":n.includes("balsam")?"Impatiens balsamina":n.includes("forget")?"Myosotis":"Flower";
 if(cat==="Herbs and medicinal plants")return n.includes("dill")?"Dill":n.includes("basil")?(n.includes("tulsi")?"Ocimum tenuiflorum":"Basil"):n.includes("oregano")?"Oregano":n.includes("marjoram")?"Origanum majorana":n.includes("cilantro")||n.includes("coriander")?"Coriander":n.includes("fennel")?"Fennel":n.includes("parsley")?"Parsley":n.includes("ashwagandha")?"Withania somnifera":n.includes("hyssop")?"Hyssopus officinalis":n.includes("wormwood")?"Artemisia absinthium":n.includes("mugwort")?"Artemisia vulgaris":n.includes("rue")?"Ruta graveolens":n.includes("nightshade")?"Atropa belladonna":n.includes("henbane")?"Hyoscyamus":n.includes("foxglove")?"Digitalis":n.includes("caraway")?"Caraway":n.includes("anise")?"Anise":n.includes("cumin")?"Cumin":n.includes("savory")?"Satureja":n.includes("mimosa")?"Mimosa pudica":n.includes("herb of paris")?"Paris quadrifolia":commonWiki[cat];
 if(cat==="Grains and grasses")return n.includes("corn")?"Maize":n.includes("quinoa")?"Quinoa":n.includes("amaranth")?"Amaranth":n.includes("rye")?"Rye":n.includes("wheat")?"Wheat":n.includes("plantain")?"Plantago":n.includes("fescue")?"Festuca glauca":commonWiki[cat];
 if(cat==="Fiber and historical crops")return n.includes("tobacco")?"Nicotiana tabacum":"Gossypium";
 return commonWiki[cat]||null;
}
const referenceGuides={
 pepper:["University of Minnesota Extension · Growing peppers","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-peppers"],
 pumpkin:["University of Minnesota Extension · Pumpkins and squash","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/pumpkins-and-winter-squash"],
 squash:["University of Minnesota Extension · Pumpkins and squash","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/pumpkins-and-winter-squash"],
 tomato:["University of Minnesota Extension · Growing tomatoes","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-tomatoes"],
 carrot:["University of Minnesota Extension · Carrots and parsnips","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-carrots-and-parsnips"],
 parsnip:["University of Minnesota Extension · Carrots and parsnips","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-carrots-and-parsnips"],
 basil:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"],
 oregano:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"],
 dill:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"],
 coriander:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"],
 mint:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"],
 thyme:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"],
 chives:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"],
 parsley:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"],
 fennel:["University of Minnesota Extension · Growing herbs","https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs"]
};
const pictureIcons={"Sunflowers":"🌻","Tomatoes":"🍅","Carrots":"🥕","Peppers":"🌶️","Herbs and medicinal plants":"🌿","Wildflower mixes":"🌼","Trees and woody plants":"🌳","Grains and grasses":"🌾","Pumpkins and melons":"🎃","Gourds and squash":"🥒","Flowers and ornamentals":"🌸","Eggplant":"🍆","Roots and brassicas":"🌱","Fiber and historical crops":"🌱"};
const plants=new Map();
const wikiCache=new Map();
const userPhotos=new Map();
const packetPhotos=new Map();
let dbPromise=null;
function openDB(){
 if(!("indexedDB" in window))return Promise.resolve(null);
 if(dbPromise)return dbPromise;
 dbPromise=new Promise(resolve=>{try{
  const req=indexedDB.open("dk-seedbank-media",1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("photos"))req.result.createObjectStore("photos");};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);
 }catch(e){resolve(null);}});
 return dbPromise;
}
async function dbPut(key,blob){const db=await openDB();if(!db)return false;return new Promise(resolve=>{try{const tx=db.transaction("photos","readwrite");tx.objectStore("photos").put(blob,key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);}catch(e){resolve(false);}});}
async function dbDelete(key){const db=await openDB();if(!db)return;return new Promise(resolve=>{const t=db.transaction("photos","readwrite");t.objectStore("photos").delete(key);t.oncomplete=resolve;t.onerror=resolve;});}
async function dbAll(){const db=await openDB();if(!db)return [];return new Promise(resolve=>{try{const t=db.transaction("photos","readonly").objectStore("photos"), req=t.getAllKeys();req.onsuccess=()=>{const keys=req.result;Promise.all(keys.map(key=>new Promise(r=>{const request=t.get(key);request.onsuccess=()=>r([key,request.result]);request.onerror=()=>r(null);}))).then(x=>resolve(x.filter(Boolean)));};req.onerror=()=>resolve([]);}catch(e){resolve([]);}});}
let journal=field(storageKey,null);
const initialNames=["Basil","Chives","Oregano","Dill","Thyme","Mint","Coriander","Parsley"];
const initialEntries=initialNames.map((plant,i)=>({id:"2026-11-11-"+i,plant:plant,variety:"Standard type; exact cultivar not specified",date:"2026-11-11",time:"12:00",approxTime:true,minSeeds:20,maxSeeds:30,soakHours:24,medium:"Peat moss tablets in burlap sacks",location:"Not recorded",status:"Sown",sprouted:"",germinatedCount:null,survivedCount:null,notes:"Seeds soaked for 24 hours before planting. Approximately 20–30 seeds of this herb."}));
if(!Array.isArray(journal)){journal=initialEntries.slice();save(storageKey,journal);}
let settings=Object.assign({region:"alaska",environment:"unheated",lastFrost:""},field(settingsKey,{}));
function setupDescription(profile){
 if(profile.setup==="heated")return "Heated greenhouse / indoors in cold regions";
 if(profile.setup==="protected")return "Greenhouse helpful in Alaska; outdoors only with sufficient warmth and season";
 if(profile.setup==="outdoor")return "Outdoor garden possible, subject to local frost and hardiness";
 return "Confirm hardiness and protection for this species";
}
function tagContent(card){
 const name=card.dataset.name,cat=card.dataset.category,g=resolveGuide(name,cat);
 const wiki=wikiFor(name,cat), key=cat+"|"+name;
 const kind=Object.keys(guides).find(k=>guides[k]===g)||"generic";
 const wikiUrl=wiki?"https://en.wikipedia.org/wiki/"+encodeURIComponent(wiki.replace(/ /g,"_")):null;
 const link=wiki?'<a href="'+esc(wikiUrl)+'" target="_blank" rel="noopener noreferrer">Wikipedia · '+esc(wiki)+'</a>':'';
 const ext=referenceGuides[kind];
 const links=link+(ext?' <a href="'+esc(ext[1])+'" target="_blank" rel="noopener noreferrer">'+esc(ext[0])+'</a>':'')+' <a href="https://www.uaf.edu/ces/garden/greenhouses/index.php" target="_blank" rel="noopener noreferrer">UAF · Alaska greenhouse gardening</a>';
 const tip=cat==="Peppers"?"Use the Scoville scale above to compare heat.":"Growing values are general crop guidance unless the actual cultivar is verified.";
 const age=g.days;
 const where=setupDescription(g);
 const quick='<div class="seed-brief">'+esc(g.depth)+' deep · '+esc(g.light)+'</div>';
 const details='<details class="seed-details"><summary>Planting guide &amp; details</summary>'+
  '<div class="plant-facts">'+[
   ["Planting depth",g.depth],["Plant spacing",g.spacing],["Light",g.light],["Germination",g.germ],
   ["Soil temperature",g.soil],["Maturity / lifespan",age]
  ].map(([k,v])=>'<div class="plant-fact"><small>'+esc(k)+'</small><strong>'+esc(v)+'</strong></div>').join("")+'</div>'+
  '<div class="plant-guide"><h4>When, where &amp; how to plant</h4>'+
  '<p><strong>When:</strong> '+esc(g.when)+'</p>'+
  '<p><strong>Where:</strong> '+esc(g.where)+'</p>'+
  '<p><strong>For Alaska:</strong> '+esc(where)+'</p>'+
  '<p><strong>Water:</strong> '+esc(g.water)+'</p>'+
  '<p><strong>Harvest:</strong> '+esc(g.harvest)+'</p>'+
  (g.extra?'<p class="uncertain"><strong>Notes:</strong> '+esc(g.extra)+'</p>':'')+
  '<p class="calendar-date" data-method="'+esc(g.mode)+'">Calendar: Choose a last frost date in Growing Planner to get a suggested window.</p>'+
  '<p class="uncertain">General species or crop guidance, not a test of this seed packet. Follow a verified packet label when it differs.</p></div>'+
  '<div class="plant-links">'+links+'</div>'+
  '<div class="seed-photo-tools"><label>📷 Add plant photo<input class="upload-photo" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Add plant photo of '+esc(name)+'"></label> <label>📦 Add packet photo<input class="upload-packet-photo" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Add seed packet photo of '+esc(name)+'"></label></div><div class="plant-links"><button type="button" class="view-reference" hidden>View species reference photo</button><button type="button" class="view-packet" hidden>View my packet photo</button></div>'+
  '<div class="seed-custom-photo" hidden><span>My photo is saved on this device.</span><button class="remove-photo" type="button">Remove photo</button></div>'+
  '<p class="photo-credit">Images from Wikipedia / Wikimedia Commons are species references, not guaranteed photographs of your exact variety. Open the image for credits.</p>'+
  '<div class="plant-guide-close"><button type="button" class="close-planting-guide" aria-label="Close planting details for '+esc(name)+'">× Close planting details</button></div>'+
  '</details>';
 const thumb='<button type="button" class="seed-thumb" aria-label="View photo for '+esc(name)+'" title="Open plant photo"><span class="seed-illustration">'+(pictureIcons[cat]||"🌱")+'</span></button>';
 const top=card.querySelector(".seed-top");
 const stock=top.querySelector(".stock-badge");
 const existingTop=top.outerHTML;
 const nameText=top.querySelector(".seed-name").textContent;
 const replacement='<div class="seed-overview">'+thumb+'<div class="seed-text">'+existingTop+quick+'</div></div>';
 top.outerHTML=replacement;
 card.insertAdjacentHTML("beforeend",details+'<div class="seed-actions"><button class="log-planting" type="button">＋ Log planting</button></div>');
 card.dataset.growMode=g.mode;card.dataset.growingSetup=g.setup;card.dataset.userPhoto="no";card.dataset.guideKind=kind;
 plants.set(key,{key,name:nameText,cat,guide:g,kind,wiki,wikiUrl,card});
}
cards.forEach(tagContent);

// Opening a guide expands the visible seed cards sharing its actual CSS-grid row.
// Closing a guide, via its summary or its Close button, affects only that card.
// Measure when clicked so search filters, screen width and wrapping are respected.
function seedCardsInSameVisualRow(selected){
 const grid=selected.closest(".entries");
 if(!grid)return [selected];
 const rowTop=selected.getBoundingClientRect().top;
 return Array.from(grid.querySelectorAll(".seed")).filter(card=>
  !card.hidden && card.getClientRects().length>0 &&
  Math.abs(card.getBoundingClientRect().top-rowTop)<2
 );
}
cards.forEach(card=>{
 const guide=card.querySelector(".seed-details");
 const summary=guide.querySelector("summary");
 summary.addEventListener("click",()=>{
  if(guide.open)return; // Native summary click will close ONLY this guide.
  seedCardsInSameVisualRow(card).forEach(peer=>{
   if(peer!==card){
    const otherGuide=peer.querySelector(".seed-details");
    if(otherGuide)otherGuide.open=true;
   }
  });
  // The native summary action opens the selected card.
 });
 guide.querySelector(".close-planting-guide").addEventListener("click",()=>{
  guide.open=false;
 });
});
cats.forEach(section=>section.removeAttribute("open"));
const box=document.querySelector(".search-wrap");
const x=document.createElement("button");x.className="clear-search";x.type="button";x.textContent="×";x.title="Clear search";x.setAttribute("aria-label","Clear entire search");
box.appendChild(x);
function syncClear(){x.hidden=!search.value;}
x.addEventListener("click",()=>{search.value="";search.dispatchEvent(new Event("input",{bubbles:true}));search.focus();});
search.addEventListener("input",syncClear);syncClear();
const filterArea=document.querySelector(".filter-grid");
filterArea.insertAdjacentHTML("beforeend",'<div><label for="growFilter">Growing method</label><select id="growFilter"><option value="">All methods</option><option value="outdoor">Outdoor-friendly</option><option value="protected">Greenhouse recommended</option><option value="heated">Heated / indoor protection</option><option value="verify">Needs species verification</option></select></div><div><label for="photoFilter">My photos</label><select id="photoFilter"><option value="">All seeds</option><option value="yes">Has my photo</option><option value="no">No personal photo yet</option></select></div>');
const growFilter=document.getElementById("growFilter"),photoFilter=document.getElementById("photoFilter");
function applyExtraFilters(){
 const grow=growFilter.value,photo=photoFilter.value;
 let count=0,units=0,sectionsCount=0;
 cats.forEach(section=>{
  let n=0;
  section.querySelectorAll(".seed").forEach(card=>{
   const alreadyVisible=!card.hidden;
   const goodGrow=!grow||(grow==="outdoor"?card.dataset.growingSetup==="outdoor":grow==="protected"?card.dataset.growingSetup==="protected":grow==="heated"?card.dataset.growingSetup==="heated":card.dataset.growingSetup==="verify");
   const goodPhoto=!photo||photo===card.dataset.userPhoto;
   const visible=alreadyVisible&&goodGrow&&goodPhoto;
   card.hidden=!visible;
   if(visible){n++;count++;units+=Number(card.dataset.amount);}
  });
  section.hidden=n===0;
  section.querySelector(".visible-num").textContent=n;
  if(n)sectionsCount++;
 });
 document.getElementById("count").textContent="Showing "+count+" of "+cards.length+" seed entries · "+units+" recorded packets / lots · "+sectionsCount+" categories";
 document.getElementById("empty").hidden=count>0;
}
function requestFiltering(){search.dispatchEvent(new Event("input",{bubbles:true}));}
growFilter.addEventListener("change",requestFiltering);
photoFilter.addEventListener("change",requestFiltering);
search.addEventListener("input",()=>{queueMicrotask(applyExtraFilters);});
["categoryFilter","purposeFilter","sourceFilter","quantityFilter","heatFilter"].forEach(id=>document.getElementById(id).addEventListener("change",()=>queueMicrotask(applyExtraFilters)));
const clearOriginal=document.getElementById("reset");
clearOriginal.addEventListener("click",()=>{growFilter.value="";photoFilter.value="";queueMicrotask(applyExtraFilters);});
document.querySelectorAll("[data-jump]").forEach(j=>j.addEventListener("click",()=>{growFilter.value="";photoFilter.value="";queueMicrotask(applyExtraFilters);}));
const planner=document.createElement("section");planner.id="growPlanner";
planner.innerHTML='<h2>🌱 Growing Planner</h2><p>Choose a region and growing setup. Alaska varies enormously from town to town; planting dates depend on your actual frost dates and greenhouse heating.</p>'+
'<div class="planner-controls"><label>Growing region<select id="regionSelect"><option value="alaska">Alaska (location TBD)</option><option value="kansas">Kansas</option><option value="custom">Other location</option></select></label>'+
'<label>Growing space<select id="envSelect"><option value="outdoors">Outdoor garden</option><option value="unheated">Unheated greenhouse</option><option value="heated">Heated greenhouse</option><option value="indoors">Indoors / grow lights</option></select></label>'+
'<label>Expected last spring frost<input id="frostDate" type="date" aria-label="Estimated last spring frost date"></label></div><div class="journal-toolbar"><button class="journal-btn" id="plantNow" type="button">🌱 What could I plant now?</button></div><div id="plantNowResult" class="plant-now" hidden></div>'+
'<p id="plannerNotice" role="status">Set your expected last spring frost to calculate approximate sowing windows.</p>';
document.querySelector(".controls").insertAdjacentElement("afterend",planner);
document.getElementById("regionSelect").value=settings.region;
document.getElementById("envSelect").value=settings.environment;
document.getElementById("frostDate").value=settings.lastFrost;
function frostOffset(d,days){const dt=new Date(d+"T12:00:00");if(Number.isNaN(dt.getTime()))return null;dt.setDate(dt.getDate()+days);return dt.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
function calendarMethod(g){
 if(!settings.lastFrost)return "Set a frost date to estimate this plant's schedule.";
 const f=settings.lastFrost;
 if(g.mode==="indoor")return "Indoor seed-starting estimate: "+frostOffset(f,-56)+" to "+frostOffset(f,-35)+". Transplant after frost and when soil is warm.";
 if(g.mode==="direct-cool")return "Cool-season direct-sowing guide: roughly "+frostOffset(f,-28)+" to "+frostOffset(f,-7)+", depending on workable soil and species.";
 if(g.mode==="direct-warm")return "Warm-season sowing begins after around "+frostOffset(f,7)+" to "+frostOffset(f,21)+" when soil is adequately warm.";
 return "This seed requires species-specific timing; the frost date alone cannot determine it.";
}
function updatePlanner(){
 settings={region:document.getElementById("regionSelect").value,environment:document.getElementById("envSelect").value,lastFrost:document.getElementById("frostDate").value};save(settingsKey,settings);
 document.getElementById("plannerNotice").textContent=settings.lastFrost?
   "Estimated windows use your entered frost date, not a forecast. "+(settings.region==="alaska"?"In Alaska, an unheated greenhouse can still freeze, and long summer daylight does not replace warmth.":"Check soil temperatures and local weather before transplanting."):
   "No frost date entered. Guides show relative timing only. Confirm local dates for your exact area.";
 plants.forEach(p=>{p.card.querySelector(".calendar-date").textContent="Planting window: "+calendarMethod(p.guide);});
}
["regionSelect","envSelect","frostDate"].forEach(id=>document.getElementById(id).addEventListener("change",updatePlanner));updatePlanner();
document.getElementById("plantNow").addEventListener("click",()=>{
 const result=document.getElementById("plantNowResult");result.hidden=false;
 if(!settings.lastFrost){
   result.textContent="Enter the expected last spring frost date for your actual garden location. Alaska's sowing season cannot be inferred from the state name alone.";
   return;
 }
 const frost=new Date(settings.lastFrost+"T12:00:00"),todayDate=new Date(),days=Math.round((todayDate-frost)/86400000);
 const isProtected=settings.environment==="heated"||settings.environment==="indoors";
 const relevant=Array.from(plants.values()).filter(p=>{
  const mode=p.guide.mode;
  if(isProtected)return mode==="indoor"||mode==="direct-warm";
  if(mode==="direct-cool")return days>=-35&&days<=35;
  if(mode==="direct-warm")return days>=7&&days<=45;
  if(mode==="indoor")return days>=-70&&days<=-28;
  return false;
 }).slice(0,15);
 result.innerHTML="<strong>"+(isProtected?"Protected-growing candidates":"Frost-date-based planting candidates")+"</strong><p>"+
  esc(isProtected?"Heated and indoor growing also requires enough light, warmth and space. This is a starter shortlist, not a guarantee.":"These are rough schedule matches. Check soil temperature, weather, species and the actual microclimate before planting.")+"</p>"+
  (relevant.length?"<ul>"+relevant.map(p=>"<li>"+esc(p.name)+" · "+esc(p.guide.depth)+" deep</li>").join("")+"</ul>":"<p>No reliable outdoor sowing matches for this date and setup. Try a greenhouse option or adjust your frost date.</p>");
});
const section=document.createElement("details");section.id="seedJournal";section.open=true;
section.innerHTML='<summary>📔 Planting Journal · <span id="journalCount">8 recorded plantings</span></summary>'+
'<div class="journal-body"><p class="journal-note">Track sowing, sprouting, transplanting and harvests. Entries and photos are stored in this browser, not automatically synced to GitHub or other devices. Export a backup to keep them safe.</p>'+
'<div class="journal-toolbar"><button class="journal-btn primary" id="addJournal" type="button">＋ Record planting</button><button class="journal-btn" id="exportJournal" type="button">↓ Export backup (with photos)</button><label class="journal-btn" style="cursor:pointer">↑ Import backup<input id="importJournal" type="file" accept="application/json,.json" hidden></label></div>'+
'<div class="journal-card-list" id="journalEntries"></div>'+
'<form id="journalForm" hidden><h3 id="journalFormTitle">Record planting</h3><div class="form-grid">'+
'<label>Plant name<input name="plant" required maxlength="100" placeholder="e.g. Basil"></label>'+
'<label>Variety (optional)<input name="variety" maxlength="120" placeholder="Unknown / basic variety"></label>'+
'<label>Date planted<input name="date" type="date" required></label>'+
'<label>Approximate time<input name="time" type="time"></label>'+
'<label>Minimum seeds<input name="minSeeds" type="number" min="0" max="999999" inputmode="numeric"></label>'+
'<label>Maximum seeds<input name="maxSeeds" type="number" min="0" max="999999" inputmode="numeric"></label>'+
'<label>Soaked hours<input name="soakHours" type="number" min="0" max="500"></label>'+
'<label>Medium / containers<input name="medium" maxlength="180" placeholder="Peat tablets"></label>'+
'<label>Location / setup<input name="location" maxlength="150" placeholder="Indoor, greenhouse, bed A…"></label>'+
'<label>Status<select name="status"><option>Sown</option><option>Germinating</option><option>Sprouted</option><option>Transplanted</option><option>Harvested</option><option>Failed</option></select></label>'+
'<label>Date germinated<input name="sprouted" type="date"></label><label>Seeds germinated<input name="germinatedCount" type="number" min="0" max="999999" inputmode="numeric"></label><label>Plants survived<input name="survivedCount" type="number" min="0" max="999999" inputmode="numeric"></label>'+
'<label class="full-span">Notes<textarea name="notes" maxlength="2000" placeholder="Observations, watering, growth, results…"></textarea></label></div>'+
'<div class="journal-toolbar"><button type="submit" class="journal-btn primary">Save planting</button><button id="cancelJournal" type="button" class="journal-btn">Cancel</button></div></form>'+
'<p class="offline-warning">Your eight November 11 entries are included by default. New entries are local to this browser unless you export them. Photos can take time to load and may require an internet connection.</p></div>';
planner.insertAdjacentElement("afterend",section);
const journalList=document.getElementById("journalEntries"), journalForm=document.getElementById("journalForm");
let editId=null;
function renderJournal(){
 const sorted=journal.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.plant).localeCompare(String(b.plant)));
 document.getElementById("journalCount").textContent=journal.length+" recorded plantings";
 journalList.innerHTML=sorted.map(entry=>{
  const min=entry.minSeeds||0,max=entry.maxSeeds||0;
  const qty=min&&max?(min===max?min:min+"–"+max)+" seeds":"Quantity not recorded";
  const when=esc(entry.date)+(entry.time?' · '+esc(entry.time)+(entry.approxTime?' (approx.)':''):'');
  return '<article class="journal-entry"><h3>'+esc(entry.plant)+'</h3><span class="status">'+esc(entry.status||"Sown")+'</span>'+
   '<p><strong>Planted:</strong> '+when+'</p><p><strong>Quantity:</strong> '+esc(qty)+'</p>'+
   '<p><strong>Variety:</strong> '+esc(entry.variety||"Not specified")+'</p>'+
   '<p><strong>Method:</strong> '+esc(entry.medium||"Not recorded")+'; '+esc(entry.soakHours||0)+' h soak</p>'+
   (entry.sprouted?'<p><strong>Sprouted:</strong> '+esc(entry.sprouted)+'</p>':'')+(entry.germinatedCount!=null?'<p><strong>Germinated:</strong> '+esc(entry.germinatedCount)+' plants</p>':'')+(entry.survivedCount!=null?'<p><strong>Survived:</strong> '+esc(entry.survivedCount)+' plants</p>':'')+
   (entry.location&&entry.location!=="Not recorded"?'<p><strong>Location:</strong> '+esc(entry.location)+'</p>':'')+
   (entry.notes?'<p><strong>Notes:</strong> '+esc(entry.notes)+'</p>':'')+
   '<div class="journal-actions"><button data-edit="'+esc(entry.id)+'" type="button">Edit</button><button data-delete="'+esc(entry.id)+'" type="button">Delete</button></div></article>';
 }).join("");
}
function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function openForm(entry){
 section.open=true;journalForm.hidden=false;editId=entry?entry.id:null;
 const obj=entry||{plant:"",date:today(),time:"",minSeeds:"",maxSeeds:"",soakHours:"",medium:"",location:"",status:"Sown",sprouted:"",germinatedCount:"",survivedCount:"",variety:"",notes:""};
 Array.from(journalForm.elements).forEach(el=>{if(el.name)el.value=obj[el.name]==null?"":obj[el.name];});
 document.getElementById("journalFormTitle").textContent=entry?"Edit planting":"Record planting";
 journalForm.scrollIntoView({behavior:"smooth",block:"center"});
 journalForm.elements.namedItem("plant").focus();
}
document.getElementById("addJournal").addEventListener("click",()=>openForm(null));
document.getElementById("cancelJournal").addEventListener("click",()=>{journalForm.hidden=true;editId=null;});
journalList.addEventListener("click",event=>{
 const edit=event.target.closest("[data-edit]"),del=event.target.closest("[data-delete]");
 if(edit){const item=journal.find(x=>x.id===edit.dataset.edit);if(item)openForm(item);}
 if(del){const item=journal.find(x=>x.id===del.dataset.delete);if(item&&window.confirm("Delete the "+item.plant+" planting record?")){journal=journal.filter(x=>x.id!==item.id);save(storageKey,journal);renderJournal();}}
});
journalForm.addEventListener("submit",event=>{
 event.preventDefault();
 const f=new FormData(journalForm);
 const item={id:editId||"log-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),
 plant:String(f.get("plant")||"").trim(),variety:String(f.get("variety")||"").trim(),
 date:String(f.get("date")||""),time:String(f.get("time")||""),approxTime:false,
 minSeeds:Number(f.get("minSeeds")||0),maxSeeds:Number(f.get("maxSeeds")||0),
 soakHours:Number(f.get("soakHours")||0),medium:String(f.get("medium")||"").trim(),
 location:String(f.get("location")||"").trim(),status:String(f.get("status")||"Sown"),
 sprouted:String(f.get("sprouted")||""),germinatedCount:f.get("germinatedCount")===""?null:Number(f.get("germinatedCount")),survivedCount:f.get("survivedCount")===""?null:Number(f.get("survivedCount")),notes:String(f.get("notes")||"").trim()};
 if(!item.plant||!item.date||item.maxSeeds&&item.minSeeds>item.maxSeeds){alert("Check the plant name, date and seed count range.");return;}
 if(editId){journal=journal.map(x=>x.id===editId?item:x);}else journal.push(item);
 if(!save(storageKey,journal))alert("This browser blocked local storage. Export a backup to preserve your entries.");
 editId=null;journalForm.hidden=true;renderJournal();
});
cards.forEach(card=>card.querySelector(".log-planting").addEventListener("click",()=>openForm({plant:card.dataset.name,variety:card.dataset.name,date:today(),status:"Sown"})));
renderJournal();
const photoDialog=document.createElement("dialog");photoDialog.id="photoDialog";photoDialog.innerHTML='<div class="photo-modal-body"><div class="photo-modal-header"><strong id="modalPhotoTitle">Plant reference</strong><button id="closePhoto" type="button" aria-label="Close photo">×</button></div><img id="modalPhotoImage" alt="Plant photograph"><p id="modalPhotoCredit" class="photo-credit"></p></div>';
document.body.appendChild(photoDialog);
document.getElementById("closePhoto").addEventListener("click",()=>photoDialog.close());
photoDialog.addEventListener("click",e=>{if(e.target===photoDialog)photoDialog.close();});
function showPhoto(p){
 const img=p.card.querySelector(".seed-thumb img");
 if(!img)return;
 document.getElementById("modalPhotoImage").src=img.src;
 document.getElementById("modalPhotoTitle").textContent=p.name;
 const credit=document.getElementById("modalPhotoCredit");
 credit.textContent="";
 if(p.card.dataset.userPhoto==="yes"){credit.textContent="Your personal photo, stored locally in this browser.";}
 else if(p.imageFile){const a=document.createElement("a");a.href="https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(p.imageFile.replace(/ /g,"_"));a.target="_blank";a.rel="noopener noreferrer";a.textContent="View photographer, licensing and attribution on Wikimedia Commons";credit.appendChild(a);}
 else credit.textContent="Reference image from Wikipedia. See the linked article for attribution.";
 if(typeof photoDialog.showModal==="function")photoDialog.showModal();else photoDialog.setAttribute("open","");
}
function setPhoto(p,url,personal){const thumb=p.card.querySelector(".seed-thumb");thumb.innerHTML="";const img=document.createElement("img");img.src=url;img.loading="lazy";img.alt=(personal?"Personal photo":"Reference species photo")+" of "+p.name;thumb.appendChild(img);p.card.dataset.userPhoto=personal?"yes":"no";p.card.querySelector(".seed-custom-photo").hidden=!personal;}
plants.forEach(p=>{
 p.card.querySelector(".seed-thumb").addEventListener("click",()=>showPhoto(p));
 const uploader=p.card.querySelector(".upload-photo");
 uploader.addEventListener("change",async()=>{
  const file=uploader.files&&uploader.files[0];if(!file)return;
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>6000000){alert("Choose a PNG, JPG or WebP photo under 6 MB.");return;}
  if(await dbPut(p.key,file)){const prev=userPhotos.get(p.key);if(prev)URL.revokeObjectURL(prev);const url=URL.createObjectURL(file);userPhotos.set(p.key,url);setPhoto(p,url,true);requestFiltering();}
  else alert("Photo storage unavailable in this browser. Save a separate copy of your photo.");
 });
 const packetUpload=p.card.querySelector(".upload-packet-photo");
 packetUpload.addEventListener("change",async()=>{
  const file=packetUpload.files&&packetUpload.files[0];if(!file)return;
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>6000000){alert("Choose a JPG, PNG or WebP photo under 6 MB.");return;}
  if(await dbPut(p.key+"|packet",file)){const old=packetPhotos.get(p.key);if(old)URL.revokeObjectURL(old);packetPhotos.set(p.key,URL.createObjectURL(file));p.card.querySelector(".view-packet").hidden=false;}
  else alert("Packet photo storage unavailable in this browser.");
 });
 p.card.querySelector(".view-reference").addEventListener("click",()=>{
  if(!p.referenceUrl)return;
  document.getElementById("modalPhotoImage").src=p.referenceUrl;
  document.getElementById("modalPhotoTitle").textContent="Species reference: "+p.name;
  const credit=document.getElementById("modalPhotoCredit");credit.textContent="";
  const a=document.createElement("a");a.href=p.imageFile?"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(p.imageFile.replace(/ /g,"_")):p.wikiUrl;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Image author, source and license details";credit.appendChild(a);
  if(typeof photoDialog.showModal==="function")photoDialog.showModal();else photoDialog.setAttribute("open","");
 });
 p.card.querySelector(".view-packet").addEventListener("click",()=>{
  const src=packetPhotos.get(p.key);if(!src)return;
  document.getElementById("modalPhotoImage").src=src;
  document.getElementById("modalPhotoTitle").textContent="Your seed packet: "+p.name;
  document.getElementById("modalPhotoCredit").textContent="Your seed packet photograph, stored in this browser.";
  if(typeof photoDialog.showModal==="function")photoDialog.showModal();else photoDialog.setAttribute("open","");
 });
 p.card.querySelector(".remove-photo").addEventListener("click",async()=>{await dbDelete(p.key);const prev=userPhotos.get(p.key);if(prev)URL.revokeObjectURL(prev);userPhotos.delete(p.key);p.card.dataset.userPhoto="no";p.card.querySelector(".seed-custom-photo").hidden=true;p.card.querySelector(".seed-thumb").innerHTML='<span class="seed-illustration">'+(pictureIcons[p.cat]||"🌱")+'</span>';if(p.wiki)loadCategoryPhoto(p.cat);requestFiltering();});
});
async function loadWikiBatch(titles){
 const missing=titles.filter(t=>!wikiCache.has(t));if(!missing.length)return;
 missing.forEach(t=>wikiCache.set(t,null));
 for(let i=0;i<missing.length;i+=20){
  const part=missing.slice(i,i+20);
  try{
   const query="https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=400&pilicense=free&titles="+encodeURIComponent(part.join("|"))+"&origin=*";
   const resp=await fetch(query,{mode:"cors"});if(!resp.ok)continue;
   const data=await resp.json();
   (data.query&&data.query.pages||[]).forEach(page=>{if(page.title&&page.thumbnail&&page.thumbnail.source){wikiCache.set(page.title,{src:page.thumbnail.source,file:page.pageimage||""});}});
   (data.query&&data.query.redirects||[]).forEach(red=>{if(wikiCache.has(red.to))wikiCache.set(red.from,wikiCache.get(red.to));});
  }catch(e){/* Illustrations remain available offline. */}
 }
}
async function loadCategoryPhoto(cat){
 const list=Array.from(plants.values()).filter(p=>p.cat===cat&&p.wiki);
 await loadWikiBatch([...new Set(list.map(p=>p.wiki))]);
 list.forEach(p=>{
  const info=wikiCache.get(p.wiki);
  if(info&&info.src){p.imageFile=info.file;p.referenceUrl=info.src;p.card.querySelector(".view-reference").hidden=false;if(!userPhotos.has(p.key))setPhoto(p,info.src,false);}
 });
}
cats.forEach(section=>{
 const cat=section.dataset.category;
 section.addEventListener("toggle",()=>{if(section.open)loadCategoryPhoto(cat);});
});
async function restorePhotos(){
 for(const pair of await dbAll()){
  if(pair[0].endsWith("|packet")){const key=pair[0].slice(0,-7),p=plants.get(key);if(!p)continue;packetPhotos.set(key,URL.createObjectURL(pair[1]));p.card.querySelector(".view-packet").hidden=false;continue;}
  const p=plants.get(pair[0]);if(!p)continue;const url=URL.createObjectURL(pair[1]);userPhotos.set(pair[0],url);setPhoto(p,url,true);
 }
}
restorePhotos().then(()=>requestFiltering());
function fileToDataURL(blob){return new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>resolve(null);r.readAsDataURL(blob);});}
function downloadJSON(data){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="dk-seedbank-backup-"+today()+".json";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
document.getElementById("exportJournal").addEventListener("click",async()=>{
 const photos=await dbAll();
 const serialized=await Promise.all(photos.map(async ([key,blob])=>({key,data:await fileToDataURL(blob)})));
 downloadJSON({format:"dk-seedbank-v1",exportedAt:new Date().toISOString(),journal,settings,photos:serialized.filter(x=>x.data)});
});
document.getElementById("importJournal").addEventListener("change",async e=>{
 const f=e.target.files&&e.target.files[0];if(!f)return;
 if(f.size>100000000){alert("Backup file is too large.");return;}
 try{
  const data=JSON.parse(await f.text());
  if(data.format!=="dk-seedbank-v1"||!Array.isArray(data.journal))throw Error("Not a DK Seed Bank backup");
  if(!window.confirm("Replace your local journal and growing settings with this backup?"))return;
  journal=data.journal.filter(x=>x&&typeof x.plant==="string"&&typeof x.date==="string").slice(0,3000);
  settings=Object.assign(settings,data.settings||{});
  save(storageKey,journal);save(settingsKey,settings);
  for(const item of data.photos||[]){
   if(!item||typeof item.key!=="string"||!(plants.has(item.key)||item.key.endsWith("|packet")&&plants.has(item.key.slice(0,-7)))||typeof item.data!=="string"||!/^data:image\/(jpeg|png|webp);base64,/.test(item.data))continue;
   const blob=await (await fetch(item.data)).blob();if(blob.size>6000000)continue;
   await dbPut(item.key,blob);const p=plants.get(item.key);const old=item.key.endsWith("|packet")?packetPhotos.get(item.key.slice(0,-7)):userPhotos.get(item.key);if(old)URL.revokeObjectURL(old);
   const url=URL.createObjectURL(blob);
   if(item.key.endsWith("|packet")){const key=item.key.slice(0,-7);packetPhotos.set(key,url);plants.get(key).card.querySelector(".view-packet").hidden=false;}
   else{userPhotos.set(item.key,url);setPhoto(p,url,true);}
  }
  document.getElementById("regionSelect").value=settings.region;
  document.getElementById("envSelect").value=settings.environment;
  document.getElementById("frostDate").value=settings.lastFrost||"";
  updatePlanner();renderJournal();requestFiltering();alert("Backup restored on this browser.");
 }catch(err){alert("Could not import this backup: "+err.message);}
 e.target.value="";
});
})();
