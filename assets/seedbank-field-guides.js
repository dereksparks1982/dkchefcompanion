/* DK Seed Bank: optional seed-saving, planting-linked harvest context and food preservation references. */
(function(root){
"use strict";
const saving=[
 {id:"pods",en:"Beans, peas and dry pods",ru:"Фасоль, горох и сухие стручки",
  stepsEn:["Choose healthy, true-to-type plants and let pods mature until brown and dry.","Shell or gently thresh the pods; winnow away chaff and discard damaged seed.","Air-dry thoroughly, then label the variety and harvest year."],
  stepsRu:["Выберите здоровые растения с нужными признаками; дождитесь побурения и высыхания стручков.","Вылущите или осторожно обмолотите стручки, отделите мусор и повреждённые семена.","Полностью просушите семена, подпишите сорт и год сбора."],
  cautionEn:"Most common beans and peas usually self-pollinate, but runner beans and some other legumes cross more readily. Check the exact species.",
  cautionRu:"Обыкновенная фасоль и горох чаще самоопыляются, но огненная фасоль и некоторые другие бобовые переопыляются чаще. Уточните вид."},
 {id:"heads",en:"Herbs, lettuce and dry seed heads",ru:"Пряные травы, салат и сухие соцветия",
  stepsEn:["Leave selected flowers or seed heads until fully mature and mostly dry.","Collect before wind, birds or shattering scatter the seeds.","Rub or thresh over a tray, remove chaff, and finish drying before packing."],
  stepsRu:["Дайте выбранным цветкам и соцветиям полностью созреть и подсохнуть.","Соберите их до того, как ветер, птицы или осыпание приведут к потере семян.","Обмолотите над подносом, удалите мякину и досушите перед упаковкой."],
  cautionEn:"Pollination differs by species. Lettuce is commonly self-pollinating; dill, brassicas and many flowers may cross with compatible plants.",
  cautionRu:"Опыление зависит от вида. Салат обычно самоопыляется, а укроп, капустные и многие цветы могут переопыляться с совместимыми растениями."},
 {id:"tomato",en:"Tomatoes",ru:"Томаты",
  stepsEn:["Pick fully ripe fruit from healthy plants and scoop out seed with its gel.","Use a crop-specific seed-cleaning or fermentation method from an extension guide; rinse away the pulp.","Spread seed thinly, dry completely, then label and store."],
  stepsRu:["Возьмите полностью спелые плоды здоровых растений и извлеките семена с желеобразной оболочкой.","Очистите семена или проведите ферментацию по инструкции сельскохозяйственной службы; смойте мякоть.","Разложите тонким слоем, полностью высушите, подпишите и уберите на хранение."],
  cautionEn:"F1 hybrid offspring may differ from the parent. Tomatoes often self-pollinate, but crossing is still possible.",
  cautionRu:"Потомство гибридов F1 может отличаться от родительских растений. Томаты чаще самоопыляются, но переопыление возможно."},
 {id:"pepper",en:"Peppers and eggplants",ru:"Перцы и баклажаны",
  stepsEn:["Allow the fruit to reach full seed maturity; peppers often change to their ripe color.","Remove seeds, clean off fruit tissue and air-dry fully before storage.","Record the parent plant and any nearby compatible varieties."],
  stepsRu:["Дождитесь полной зрелости семян; перцы часто меняют окраску при созревании.","Извлеките семена, удалите остатки мякоти и тщательно просушите.","Запишите родительское растение и соседние совместимые сорта."],
  cautionEn:"Insects can cross-pollinate peppers. Use a species-appropriate isolation or flower-bagging method if true-to-type seed matters.",
  cautionRu:"Насекомые могут переопылять перцы. Для сохранения признаков сорта применяйте изоляцию или мешочки на цветки с учётом вида."},
 {id:"cucurbits",en:"Squash, pumpkins, cucumbers and melons",ru:"Тыквы, кабачки, огурцы и дыни",
  stepsEn:["Leave seed fruit to fully mature, often beyond the usual eating stage.","Scoop out seeds, wash away pulp where appropriate, and dry in a single layer.","Record the botanical species and other compatible varieties grown nearby."],
  stepsRu:["Дайте семенным плодам полностью созреть, часто дольше обычного пищевого срока.","Извлеките семена, при необходимости смойте мякоть и сушите одним слоем.","Запишите ботанический вид и совместимые сорта, росшие рядом."],
  cautionEn:"These crops are often insect-pollinated. Crosses depend on botanical species, not merely the common word ‘squash’. Verify compatible species and isolation guidance.",
  cautionRu:"Эти культуры часто опыляются насекомыми. Переопыление зависит от ботанического вида, а не общего названия «тыква». Проверьте совместимость видов и правила изоляции."},
 {id:"biennials",en:"Roots, brassicas and alliums",ru:"Корнеплоды, капустные и луковые",
  stepsEn:["Confirm whether the crop needs a second growing season to flower and set seed.","Keep healthy parent plants alive through their crop-specific overwintering requirements.","Harvest fully mature dry seed heads, clean, dry and label."],
  stepsRu:["Проверьте, нужен ли культуре второй сезон для цветения и образования семян.","Сохраните здоровые маточные растения зимой с учётом требований культуры.","Соберите зрелые сухие соцветия, очистите и подпишите семена."],
  cautionEn:"Many of these crops cross with related varieties and require a sizeable population or special overwintering. Follow a species-specific guide; no universal isolation distance is reliable.",
  cautionRu:"Многие из этих культур переопыляются с родственными сортами, требуют достаточного числа маточных растений или особой зимовки. Универсального расстояния изоляции нет."},
 {id:"woody",en:"Trees, shrubs and unusual seeds",ru:"Деревья, кустарники и особые семена",
  stepsEn:["Identify the botanical species before collecting seed.","Check species-specific ripeness, dormancy and stratification requirements.","Record the collection date and source; follow the correct storage protocol."],
  stepsRu:["Сначала определите ботанический вид растения.","Уточните признаки зрелости, период покоя и необходимость стратификации именно для этого вида.","Запишите дату и источник сбора и соблюдайте подходящий режим хранения."],
  cautionEn:"Some tree and tropical seeds are damaged by drying, chilling or freezing. General vegetable-seed storage rules do not apply.",
  cautionRu:"Некоторые семена деревьев и тропических растений повреждаются при сушке, охлаждении или заморозке. Правила для овощных семян к ним неприменимы."}
];
const preservation=[
 {id:"freezing",en:"Freezing vegetables and fruit",ru:"Замораживание овощей и фруктов",
  stepsEn:["Harvest sound, food-safe produce, wash and sort it.","Use tested blanching instructions for vegetables where required; cool quickly, drain, portion and pack.","Label the contents and date, freeze promptly and maintain a reliably frozen temperature."],
  stepsRu:["Возьмите доброкачественные съедобные продукты, вымойте и переберите.","Для овощей при необходимости используйте проверенные инструкции по бланшированию, быстро охладите и упакуйте порциями.","Подпишите продукт и дату, сразу заморозьте и поддерживайте надёжное замораживание."],
  warningEn:"Freezing pauses microbial growth but does not sterilize food. Use official crop-specific prep guidance.",
  warningRu:"Замораживание приостанавливает рост микробов, но не стерилизует пищу. Проверяйте рекомендации для конкретного продукта."},
 {id:"drying",en:"Drying and dehydrating",ru:"Сушка и обезвоживание",
  stepsEn:["Choose sound produce and follow recommended preparation for that crop.","Use a safe drying temperature and adequate airflow for the specific food.","Cool, condition if recommended, package airtight, label and check for moisture or mold."],
  stepsRu:["Выберите доброкачественные продукты и подготовьте их по рекомендациям для конкретной культуры.","Соблюдайте подходящую температуру и обеспечьте достаточный поток воздуха.","Остудите, при необходимости выровняйте влажность, герметично упакуйте, подпишите и проверяйте на плесень."],
  warningEn:"Visible dryness alone is not proof of safe storage, especially for meat. Follow tested food-specific directions.",
  warningRu:"Внешняя сухость не доказывает безопасность хранения, особенно для мяса. Следуйте проверенным инструкциям для конкретного продукта."},
 {id:"refrigerator-pickles",en:"Refrigerator pickles",ru:"Маринады для холодильника",
  stepsEn:["Use a reliable refrigerator-pickle recipe and clean equipment.","Prepare vinegar, salt and produce according to that recipe.","Refrigerate immediately; label the preparation date and observe the recipe's refrigerated keeping period."],
  stepsRu:["Возьмите надёжный рецепт маринада для холодильника и чистое оборудование.","Подготовьте уксус, соль и овощи строго по рецепту.","Сразу уберите в холодильник, подпишите дату и соблюдайте указанный срок хранения."],
  warningEn:"Refrigerator pickles are NOT shelf-stable canned food. Do not store them at room temperature.",
  warningRu:"Маринады для холодильника НЕ являются консервами длительного хранения. Не держите их при комнатной температуре."},
 {id:"fermenting",en:"Vegetable fermentation",ru:"Ферментация овощей",
  stepsEn:["Choose a tested process for the vegetable and batch size.","Use the prescribed salt concentration, equipment, temperature and submersion method.","Follow the tested process through completion and refrigerate unless a separate tested shelf-stable preservation method is used."],
  stepsRu:["Выберите проверенный способ ферментации для конкретных овощей и объёма.","Соблюдайте указанную концентрацию соли, температуру, оборудование и погружение в рассол.","Завершите процесс по инструкции и храните в холодильнике, если не применялся отдельный проверенный способ консервирования."],
  warningEn:"Do not guess the salt ratio or assume that bubbles, smell or taste establish safety.",
  warningRu:"Не подбирайте концентрацию соли наугад; пузыри, запах и вкус сами по себе не подтверждают безопасность."},
 {id:"water-bath",en:"Boiling-water canning",ru:"Консервирование в кипящей воде",
  stepsEn:["Select a current, laboratory-tested recipe for the exact food and jar size.","Follow specified acidity, acidification, headspace, jar preparation and processing time.","Apply altitude adjustments and check jar seals and storage according to the recipe."],
  stepsRu:["Выберите современный проверенный рецепт для конкретного продукта и размера банки.","Соблюдайте требования к кислотности, добавлению кислоты, свободному пространству и времени обработки.","Учитывайте высоту над уровнем моря, проверяйте герметичность и условия хранения по рецепту."],
  warningEn:"Boiling-water processing is NOT suitable for ordinary low-acid vegetables, meat or improvised mixed dishes. Do not invent processing times.",
  warningRu:"Кипящая водяная баня НЕ подходит для обычных низкокислотных овощей, мяса и произвольных смесей. Нельзя угадывать время обработки."},
 {id:"pressure",en:"Pressure canning",ru:"Консервирование под давлением",
  stepsEn:["For low-acid foods, choose a tested pressure-canning recipe.","Use an appropriate pressure canner, jar size, pressure, time and altitude adjustment.","Follow the tested venting, cooling, depressurizing and seal-check instructions."],
  stepsRu:["Для низкокислотных продуктов выбирайте проверенный рецепт консервирования под давлением.","Используйте подходящий автоклав для домашнего консервирования, размер банки, давление, время и поправку на высоту.","Соблюдайте правила удаления воздуха, охлаждения, снижения давления и проверки крышек."],
  warningEn:"A pressure cooker or multicooker is not automatically an approved pressure canner. Untested recipes can cause botulism.",
  warningRu:"Скороварка или мультиварка не обязательно подходит для безопасного консервирования. Непроверенные рецепты могут привести к ботулизму."}
];
root.DKSeedBankFieldGuides=Object.freeze({saving,preservation});
if(typeof document==="undefined")return;
const $=selector=>document.querySelector(selector);
const ru=()=>document.documentElement.lang==="ru";
const say=(en,russian)=>ru()?russian:en;
const esc=value=>String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const seedPanel=$("#wb-saved .wb-panel-body"),calendar=$("#wbMonthResults"),preservationPanel=$("#dkPreservationGuide");
if(!seedPanel||!calendar||!preservationPanel)return;
const seed=document.createElement("details");seed.className="dk-field-guide";seed.id="dkSeedSavingGuide";
seed.innerHTML='<summary></summary><div class="dk-field-body"><p class="dk-field-intro"></p><label class="dk-field-select"><span></span><select id="dkSavingCrop"></select></label><div id="dkSavingDetails"></div></div>';
seedPanel.insertBefore(seed,seedPanel.firstChild);
const season=document.createElement("section");season.className="dk-season-checklist";season.id="dkSeasonChecklist";
calendar.parentNode.insertBefore(season,calendar.nextSibling);
const savingSelect=$("#dkSavingCrop"),preservationSelect=$("#dkPreservationMethod");
function link(url,label){return '<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>';}
function renderDetails(selected,data,kind){
 const entry=data.find(x=>x.id===selected)||data[0];if(!entry)return "";
 const steps=ru()?entry.stepsRu:entry.stepsEn;
 const caution=ru()?(entry.cautionRu||entry.warningRu):(entry.cautionEn||entry.warningEn);
 return '<h4>'+esc(ru()?entry.ru:entry.en)+'</h4><ol>'+steps.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>'+
  '<p class="dk-field-caution"><strong>'+say("Important:","Важно:")+'</strong> '+esc(caution)+'</p>'+
  (kind==="saving"?
    '<p class="dk-field-links">'+say("Further reading:","Подробнее:")+' '+
    link("https://extension.uga.edu/publications/detail.html?number=C1242",say("UGA Extension seed-saving guide","Руководство UGA по сбору семян"))+' · '+
    link("https://yardandgarden.extension.iastate.edu/how-to/how-harvest-and-store-seeds",say("Iowa State Extension","Университет штата Айова"))+'</p>':
    '<p class="dk-field-links">'+say("Tested instructions and recipes:","Проверенные инструкции и рецепты:")+' '+
    link("https://nchfp.uga.edu/",say("National Center for Home Food Preservation","Национальный центр домашнего консервирования (США)"))+'</p>');
}
function populate(select,rows){
 const value=select.value;select.innerHTML=rows.map(x=>'<option value="'+esc(x.id)+'">'+esc(ru()?x.ru:x.en)+'</option>').join("");
 if(rows.some(x=>x.id===value))select.value=value;
}
function renderSeed(){
 seed.querySelector("summary").textContent=say("📘 Seed Saving Guide: collect, clean and store","📘 Руководство по сбору и хранению семян");
 seed.querySelector(".dk-field-intro").textContent=say(
  "Guidance by crop group. The exact species, open-pollinated status and isolation method matter. No seed-saving step is mandatory.",
  "Рекомендации по группам культур. Важны точный вид, тип опыления и способ изоляции. Ведение записей необязательно.");
 seed.querySelector(".dk-field-select span").textContent=say("Crop group","Группа культур");
 populate(savingSelect,saving);
 $("#dkSavingDetails").innerHTML=renderDetails(savingSelect.value,saving,"saving")+
  '<p class="dk-field-note">'+say(
   "Before storage: use fully mature, clean, thoroughly dry orthodox seeds; keep them cool, dry and dark, with a name and year label. Some species, especially tropical and woody plants, need different treatment. Saved F1 seed may not breed true.",
   "Перед хранением: обычные семена полностью дозревают, очищают и высушивают; держат в прохладном, сухом и тёмном месте с этикеткой и годом. Некоторым видам, особенно тропическим и древесным, нужны другие условия. Семена гибридов F1 могут не сохранять признаки.")+'</p>';
}
function renderPreservation(){
 preservationPanel.querySelector("summary").textContent=say("🥫 Food Preservation","🥫 Сохранение продуктов");
 preservationPanel.querySelector(".dk-field-intro").textContent=say(
  "Practical method overview, not a replacement for a tested preservation recipe. Your existing recipes remain unchanged.",
  "Краткий обзор методов, не заменяющий проверенный рецепт консервирования. Существующие рецепты не изменяются.");
 preservationPanel.querySelector(".dk-field-select span").textContent=say("Preservation method","Способ сохранения");
 populate(preservationSelect,preservation);
 $("#dkPreservationDetails").innerHTML=renderDetails(preservationSelect.value,preservation,"preservation")+
  '<p class="dk-field-note">'+say(
   "For shelf-stable canning, use an up-to-date tested recipe with the exact jar size, acidity, processing method and altitude. Never substitute a refrigerator pickle or untested sauce for a canning recipe.",
   "Для консервов длительного хранения используйте современные проверенные рецепты с точным размером банки, кислотностью, способом обработки и поправкой на высоту. Не заменяйте рецепт консервирования маринадом для холодильника или непроверенным соусом.")+'</p>';
}
function renderSeason(){
 const core=root.DKSeedBankCore,journal=core&&typeof core.journal==="function"?core.journal():[];
 const active=journal.filter(e=>["Sown","Sprouted","Growing","Transplanted","Flowering","Harvesting"].includes(e.status||"Sown"));
 const flowering=active.filter(e=>e.status==="Flowering");
 const harvesting=active.filter(e=>e.status==="Harvesting");
 const early=active.filter(e=>["Sown","Sprouted","Growing","Transplanted"].includes(e.status||"Sown"));
 const month=$("#wbMonth")?.value||new Date().toISOString().slice(0,7);
 const count=(n,en,rus)=>'<strong>'+n+'</strong> '+say(en,rus);
 season.innerHTML='<h3>'+say("Seasonal garden check-ins","Сезонные задачи в саду")+'</h3>'+
 '<p class="dk-field-note">'+esc(month)+' · '+say(
 "Optional prompts based on recorded planting stages, not predictions of ripeness or local weather.",
 "Необязательные подсказки по записям о стадиях роста, а не прогноз спелости или погоды.")+'</p>'+
 (active.length?
 '<ul><li>'+count(early.length,"plantings to check for growth, moisture and transplant readiness","посадок для проверки роста, влажности и готовности к пересадке")+'</li>'+
 '<li>'+count(flowering.length,"flowering plantings to monitor for pollination and fruit set","цветущих посадок для контроля опыления и завязывания плодов")+'</li>'+
 '<li>'+count(harvesting.length,"plantings marked harvesting; record yields and inspect seed maturity","посадок на стадии сбора урожая; учитывайте урожай и зрелость семян")+'</li></ul>':
 '<p class="dk-field-note">'+say("No active journal plantings recorded. Planting, harvest and seed-saving records are optional.","В журнале пока нет активных посадок. Учёт посевов, урожая и семян необязателен.")+'</p>')+
 '<p class="dk-field-note">'+say(
 "For any seeds collected this month, label the variety, year, location and pollination notes. For future sowings, use the frost-date suggestions above and your local weather.",
 "Собранные в этом месяце семена подпишите: сорт, год, место и сведения об опылении. Для будущих посевов используйте календарь заморозков выше и местный прогноз.")+'</p>';
}
savingSelect.addEventListener("change",renderSeed);
preservationSelect.addEventListener("change",renderPreservation);
$("#wbMonth")?.addEventListener("change",renderSeason);
$("#wbShowMonth")?.addEventListener("click",()=>queueMicrotask(renderSeason));
document.addEventListener("dkseedbank:journal-rendered",renderSeason);
$("#dkLanguageSelect")?.addEventListener("change",()=>queueMicrotask(()=>{renderSeed();renderPreservation();renderSeason();}));
renderSeed();renderPreservation();renderSeason();
})(window);
