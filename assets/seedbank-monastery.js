/* Monastery Garden reference: crop-type history, not proof of a medieval cultivar. */
(function(){
"use strict";
const core=window.DKSeedBankCore;
if(!core)return;
const term=document.getElementById("monasteryFilter");
if(!term)return;
const american=/tomato|tamarillo|pepper|paprika|jalapeño|cayenne|habanero|scotch bonnet|reaper|tabasco|sunflower|zinnia|marigold|california poppy|pumpkin|zucchini|cucamelon|butternut squash|squash|quinoa|blue agave|tobacco|peanut|soybean|lima bean|cowpea|pinto|kidney bean|pole bean|bush bean|garden bean|blueberry|serviceberry|huckleberry|blue hopi|sweet potato|black oil|ginseng|ashwagandha|tulsi|thai basil|mountain mint|nettleleaf horsemint|monarda|bergamot/i;
const medievalHerbs=/henbane|rue|hyssop|wormwood|lovage|fennel|spearmint|peppermint|pennyroyal|betony|sage|chervil|parsley|coriander|cilantro|dill|anise|caraway|cumin|savory|marjoram|oregano|horehound|comfrey|valerian|marsh mallow|calendula|borage|st john|john's wort|yarrow|mugwort|fenugreek|lemon balm|lavender|thyme|stinging nettle|nettle|basil/i;
const oldWorldFlowers=/rose|lily|papaver somniferum|poppy, unknown|edelweiss/i;
const medievalVeg=/lettuce|chicory|cress|arugula|endive|kale|spinach|collard|celery|radish|turnip|parsnip|beet|cabbage|broccoli|brussels|cauliflower|kohlrabi|carrot|onion|scallion|leek|cucumber|pea sugar snap|pea oregon|pea lincoln|pea little marvel|pea cascadia|lentil|strawberry|hazelnut|mulberry|winter rye|wheat|barley/i;
function classify(p){
 const n=p.name.toLowerCase(),cat=p.cat;
 if(/blue flax|giant bamboo|unknown|unidentified|species unverified|spoken|unspecified|possibly|generic|dahlia moonflower|mache|mâche/.test(n))return "unverified";
 if(c==="Grains and grasses"&&/corn\b|amaranth|quinoa/.test(n))return "later";
 if(/corn salad|mâche/.test(n))return "unverified";
 if(/watermelon/.test(n))return "unverified";
 if(american.test(n))return "later";
 if(medievalHerbs.test(n)||oldWorldFlowers.test(n)||medievalVeg.test(n))return "historical";
 if(["Tomatoes","Peppers","Sunflowers","Pumpkins and melons","Gourds and squash"].includes(cat))return "later";
 return "unverified";
}
function update(){
 core.plants().forEach(p=>{p.card.dataset.monastery=classify(p);});
 document.dispatchEvent(new CustomEvent("dkseedbank:monastery-updated"));
}
const guide=document.createElement("details");
guide.id="monasteryGuide";guide.className="monastery-guide";
guide.innerHTML='<summary>🏛️ Medieval Monastery Garden <small>Historical plant types · Saint Gall · herb garden, kitchen garden and orchard</small></summary>'+
'<div class="monastery-inner"><p>Historical reference, not an endorsement of ancient medicines and not proof that any modern packet or cultivar was available in the Middle Ages. The filter identifies <strong>plant types</strong> documented in pre-modern European gardening, not the age of your particular varieties.</p>'+
'<div id="monasteryCounts" class="monastery-counts"></div>'+
'<h3>Three parts of a monastery garden</h3><p><strong>Herbularius:</strong> medicinal and aromatic herbs such as rue, fennel, lovage, wormwood, sage and mint. <strong>Hortus:</strong> kitchen crops such as leeks, onions, parsley, cabbage and root vegetables. <strong>Orchard:</strong> fruit and nut trees and useful shrubs.</p>'+
'<p>Species and period matter: tomatoes, peppers, maize and most American squashes entered Europe after medieval times. Blue Flax is not confirmed as the linen flax (<em>Linum usitatissimum</em>) grown for fiber. Many named modern cultivars are historical <em>crop types</em> only.</p>'+
'<p><strong>Safety:</strong> historically used medicinal plants such as henbane, belladonna and foxglove can be poisonous. Historical use never implies safety or edible status.</p>'+
'<p class="monastery-sources">Sources: <a href="https://www.medievalists.net/2022/01/ST-GALL-PLAN-MEDIEVAL-MONASTERIES/" target="_blank" rel="noopener noreferrer">Plan of Saint Gall</a> · <a href="https://etheses.dur.ac.uk/1311/1/1311.pdf" target="_blank" rel="noopener noreferrer">Research on medieval monastic herb and kitchen gardens</a> · <a href="https://plants.ces.ncsu.edu/plants/linum-lewisii/common-name/blue-flax/" target="_blank" rel="noopener noreferrer">Blue flax identification</a></p></div>';
const watering=document.getElementById("waterManager"),workbench=document.getElementById("seedWorkbench");
(watering||workbench||document.querySelector(".controls")).insertAdjacentElement("afterend",guide);
update();
const count={historical:0,later:0,unverified:0};
core.plants().forEach(p=>{if(p.card.dataset.archived!=="yes")count[p.card.dataset.monastery]++;});
document.getElementById("monasteryCounts").textContent=count.historical+" historical crop-type entries · "+count.later+" later/New World entries · "+count.unverified+" unverified or other entries";
term.addEventListener("change",()=>document.getElementById("search").dispatchEvent(new Event("input",{bubbles:true})));
document.addEventListener("dkseedbank:inventorychange",()=>{
 update();
 if(term.value)document.getElementById("search").dispatchEvent(new Event("input",{bubbles:true}));
});
window.DKSeedBankMonastery=Object.freeze({classify,update});
})();