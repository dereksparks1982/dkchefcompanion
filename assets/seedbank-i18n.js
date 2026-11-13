/* DK Seed Bank bilingual interface. Keep source names and all stored identifiers in English. */
(function(){
"use strict";
const STORAGE="dk-seedbank-language-v1",core=window.DKSeedBankCore,water=window.DKSeedBankWatering;
if(!core)return;
const selector=document.getElementById("dkLanguageSelect");
if(!selector)return;
const esc=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const ruCategories={
"Wildflower mixes":"Смеси полевых цветов","Sunflowers":"Подсолнечники","Carrots":"Морковь","Tomatoes":"Томаты","Eggplant":"Баклажаны","Peppers":"Перцы","Leafy greens":"Листовые овощи","Other vegetables":"Прочие овощи","Roots and brassicas":"Корнеплоды и капустные","Beans and legumes":"Фасоль и бобовые","Pumpkins and melons":"Тыквы и дыни","Gourds and squash":"Кабачки и тыквенные","Trees and woody plants":"Деревья и древесные растения","Berries and fruit":"Ягоды и фрукты","Flowers and ornamentals":"Цветы и декоративные растения","Herbs and medicinal plants":"Травы и лекарственные растения","Alliums: chives, onions and leeks":"Луковые: шнитт-лук, лук и порей","Grains and grasses":"Злаки и травы","Fiber and historical crops":"Прядильные и исторические культуры"};
const ruRoles={"Food crop":"Пищевая культура","Culinary herb":"Пряная трава","Pollinator":"Для опылителей","Ornamental":"Декоративное","Tree / woody":"Дерево / кустарник","Grain":"Злак","Fiber / heritage":"Волокно / традиция","Botanical / traditional":"Ботаника / традиции","Caution":"Осторожно"};
const exactNames={
"Wildflower Mix":"Смесь полевых цветов","Butterfly Garden Mix":"Смесь цветов для бабочек",
"Blue Flax":"Лён голубой (вид не уточнён)","Balsam Bush Double Mixed Colors":"Бальзамин махровый, смесь","Mr. Lincoln Rose":"Роза «Mr. Lincoln»","Climbing Rose, unspecified":"Роза плетистая (сорт не указан)","Coleus":"Колеус","White Creeping Phlox":"Флокс стелющийся белый","Pokeberry (Phytolacca americana)":"Лаконос американский (Phytolacca americana)","White Day Lily":"Лилейник белый","Afghan Poppy":"Мак афганский","California Poppy":"Эшшольция калифорнийская","Giant Exotic Poppy (Papaver somniferum)":"Мак снотворный гигантский (Papaver somniferum)","Poppy, unknown variety":"Мак (неизвестный сорт)","Dahlia Moonflower (spoken label, exact species uncertain)":"Георгина «Moonflower» (название требует проверки)","Clark's Heavenly Blue Morning Glory (Ipomoea tricolor)":"Ипомея трёхцветная «Heavenly Blue»","Double Larkspur (Consolida ajacis)":"Живокость махровая (Consolida ajacis)","Lily of the Valley (Convallaria majalis)":"Ландыш майский (Convallaria majalis)","Haworthia, unspecified species":"Хавортия (вид не указан)","Celosia plumosa, mixed colors":"Целозия перистая, смесь","Edelweiss (Leontopodium alpinum)":"Эдельвейс альпийский","Cape Forget-Me-Not":"Капская незабудка","Barb Skullcap (spoken name, verify)":"Шлемник «Barb» (название уточнить)","Blue Sea Holly (Eryngium planum)":"Синеголовник плосколистный","Zinnia California Giant":"Цинния «California Giant»","Blue Camas":"Камассия голубая","Calendula Pacific Beauty":"Календула «Pacific Beauty»","Marigold Mix":"Бархатцы, смесь","Pyrethrum Daisy":"Пиретрум (далматская ромашка)","Bishop's Flower":"Амми большая («цветок епископа»)","Pansy (Viola × wittrockiana)":"Анютины глазки (Viola × wittrockiana)",
"Fenugreek (Trigonella foenum-graecum)":"Пажитник сенной","Ashwagandha":"Ашваганда","Hyssop":"Иссоп","Wormwood (Artemisia absinthium)":"Полынь горькая","Rue":"Рута душистая","Herb of Paris (Paris quadrifolia)":"Вороний глаз четырёхлистный","Mugwort":"Полынь обыкновенная","Mimosa pudica (sensitive plant)":"Мимоза стыдливая","Henbane (species unspecified)":"Белена (вид не указан)","Butcher's Button (common name, botanical identity to verify)":"«Butcher's Button» (вид требуется уточнить)","Foxglove (species unspecified)":"Наперстянка (вид не указан)","Green Anise (Pimpinella anisum)":"Анис обыкновенный","Florence Fennel":"Фенхель флорентийский","Bronze Fennel":"Фенхель бронзовый","Deadly Nightshade / Belladonna (Atropa belladonna)":"Красавка (белладонна)","Caraway (Carum carvi)":"Тмин обыкновенный","Dill (Anethum graveolens), harvested from user's own grown plant":"Укроп, семена собственного урожая","Dill, unspecified variety":"Укроп (сорт не указан)","Dill Ducat":"Укроп «Ducat»","Dill Banquet":"Укроп «Banquet»","Dill Mammoth":"Укроп «Mammoth»","Dill Bouquet":"Укроп «Bouquet»","Sweet Marjoram (Origanum majorana)":"Майоран садовый","Sweet Basil":"Базилик душистый","Dark Opal / Purple Dark Opal Basil":"Базилик фиолетовый «Dark Opal»","Lime Basil":"Базилик лаймовый","Thai Basil":"Базилик тайский","Italian Large Leaf Basil":"Базилик итальянский крупнолистный","Holy Tulsi Green Basil":"Базилик священный (тулси)","Lemon Basil":"Базилик лимонный","Spicy Globe Basil":"Базилик «Spicy Globe»","Licorice Basil":"Базилик лакричный","Genovese Basil":"Базилик генуэзский","Greek Oregano":"Орегано греческий","Oregano, unspecified variety":"Орегано (сорт не указан)","Italian Vulgare Oregano (spoken as 'Italian Volgaire'; label spelling to verify)":"Орегано итальянский (этикетку проверить)","White / Regular Cumin (Cuminum cyminum)":"Кумин обыкновенный (зира)","Black Cumin (botanical species unspecified; verify packet)":"Чёрный кумин (вид уточнить)","Santo Coriander / Cilantro (spoken once as 'Santa')":"Кориандр «Santo»","Slow Bolting Cilantro":"Кориандр поздноцветущий","Standard Cilantro, unspecified variety":"Кориандр (сорт не указан)","Coriandrum sativum Cilantro (species-only label)":"Кориандр посевной (Coriandrum sativum)","Coriander Cilantro (label as spoken)":"Кориандр (кинза)","Winter Savory":"Чабер зимний","Summer Savory":"Чабер летний","Big Italy Parsley (packet name as spoken)":"Петрушка «Big Italy»","Chervil Curled":"Кервель курчавый",
"American Ginseng":"Женьшень американский","Panax Ginseng (species unverified)":"Женьшень Panax (вид не уточнён)","Mountain Mint":"Горная мята","Pennyroyal Mint":"Мята болотная (пулегий)","Spearmint":"Мята колосистая","Peppermint":"Мята перечная","Lemon Mint / Lemon Bergamot":"Монарда лимонная (лимонная мята / бергамот)","Nettleleaf Horsemint":"Агастахе крапиволистный","Bergamot":"Монарда (бергамот; вид не уточнён)","Milk Thistle":"Расторопша пятнистая","Borage":"Огуречная трава (бораго)","Comfrey":"Окопник","Stevia Sugar Plant":"Стевия медовая","White Yarrow":"Тысячелистник белый","Betony":"Буквица лекарственная","St. John's Wort":"Зверобой продырявленный","Marsh Mallow (Althaea officinalis)":"Алтей лекарственный","Toothache Plant (Spilanthes oleracea)":"Акмелла огородная (зубная трава)","Echinacea Purple Coneflower":"Эхинацея пурпурная","Stinging Nettle":"Крапива двудомная","Lovage":"Любисток","German Chamomile":"Ромашка аптечная","Passion Flower":"Пассифлора","Horehound":"Шандра обыкновенная","Lemon Balm":"Мелисса лекарственная","English / True Lavender":"Лаванда узколистная (английская)","Valerian":"Валериана лекарственная",
"Blue Agave":"Агава голубая","Giant Bamboo":"Бамбук гигантский",
"Strawberry":"Земляника","Saskatoon Serviceberry":"Ирга канадская","American Elderberry":"Бузина американская","Lowbush Blueberry":"Голубика низкорослая","Evergreen Huckleberry":"Гекльберри вечнозелёная","Garden Huckleberry":"Садовый паслён",
"Date palm, harvested from dates":"Финиковая пальма (семена из фиников)","Hazelnut":"Лещина (фундук)","Pine, from cones, species unknown":"Сосна (семена из шишек; вид неизвестен)","Drumstick Tree / Moringa oleifera":"Моринга масличная","Giant Sequoia":"Секвойядендрон гигантский","Pecan":"Пекан","Sugar Maple":"Клён сахарный","Boxwood":"Самшит","White Mulberry":"Шелковица белая","English Ivy":"Плющ обыкновенный",
"Common Cat Grass (species unspecified)":"Трава для кошек (вид не указан)","Black Ornamental Wheat / Black Night Wheat":"Пшеница декоративная чёрная","Unlabeled grain seeds (possibly barley; identification unconfirmed)":"Неопознанные злаки (возможно, ячмень)","Unidentified Wheat (variety unknown)":"Пшеница (сорт неизвестен)","Winter Rye":"Рожь озимая","Bio Bio Quinoa (spelled B-I-O B-I-O; also sounded like 'Bobo')":"Киноа «Bio Bio»","Mint Vanilla Quinoa":"Киноа «Mint Vanilla»","Bronze Amaranth":"Амарант бронзовый","Green Garnet Amaranth":"Амарант зелёный «Garnet»","Red Garnet Amaranth":"Амарант красный «Garnet»","Blue Fescue":"Овсяница голубая","Glass Gem Corn":"Кукуруза «Glass Gem»","Country Gentleman Corn":"Кукуруза «Country Gentleman»","Common Plantain (Plantago species; exact species unconfirmed)":"Подорожник (вид не уточнён)","Golden Bantam Corn":"Кукуруза «Golden Bantam»","Yellow Sweet Corn":"Кукуруза сладкая жёлтая","Oaxacan Green Indian Corn":"Кукуруза «Oaxacan Green»","Blue Hopi Corn":"Кукуруза «Blue Hopi»","Peaches and Cream Sweet Corn":"Кукуруза сладкая «Peaches and Cream»","Bloody Butcher Ornamental Corn":"Кукуруза декоративная «Bloody Butcher»",
"Civil War Heirloom Red Cotton":"Хлопчатник красный старинный","Traditional White Cotton":"Хлопчатник белый традиционный","Gold Heirloom Cotton":"Хлопчатник золотистый старинный","Virginia Gold Tobacco (Nicotiana tabacum)":"Табак «Virginia Gold»"};

/* Cyrillic display for seed names and cultivar labels. Never mutate stored English identifiers. */
const dkTransWords={
"sunflower":"подсолнечник","tomato":"томат","pepper":"перец","carrot":"морковь","bean":"фасоль","pea":"горох","corn":"кукуруза","pumpkin":"тыква","squash":"тыква","cucumber":"огурец","lettuce":"салат","radish":"редис","kale":"кейл","spinach":"шпинат","basil":"базилик","dill":"укроп","mint":"мята","lavender":"лаванда","flax":"лён","poppy":"мак","rose":"роза","thyme":"тимьян","oregano":"душица","coriander":"кориандр","cilantro":"кинза","parsley":"петрушка",
"giant":"гигант","gray":"серый","grey":"серый","stripe":"полосатый","striped":"полосатый","red":"красный","green":"зелёный","purple":"фиолетовый","blue":"голубой","yellow":"жёлтый","black":"чёрный","white":"белый","pink":"розовый","gold":"золотой","golden":"золотой","orange":"оранжевый","dark":"тёмный","sweet":"сладкий","early":"ранний","late":"поздний","large":"крупный","little":"маленький","long":"длинный","short":"короткий","mammoth":"мамонт","beauty":"красавица","wonder":"чудо","queen":"королева","royal":"королевский","sun":"солнце","mix":"смесь","mixed":"смешанные","blend":"смесь","colors":"цвета","color":"цвет",
"italian":"итальянский","english":"английский","american":"американский","russian":"русский","german":"немецкий","california":"Калифорния","afghan":"афганский","dwarf":"карликовый","bush":"кустовой","pole":"вьющийся",
"and":"и","or":"или","with":"с","from":"из","the":"","of":"","for":"для","variety":"сорт","varieties":"сорта","species":"вид","unknown":"неизвестный","unspecified":"неуточнённый","unidentified":"неопознанный","seed":"семя","seeds":"семена","bag":"мешок","packet":"пакет","packets":"пакеты","commercial":"покупной","harvested":"собранный","grown":"выращенный","store":"магазин","derived":"полученный","generic":"обычный","label":"этикетка","verify":"уточнить","spoken":"продиктованный","name":"название","exact":"точный","type":"тип","garden":"сад",
"sativum":"сативум","vulgaris":"вульгарис","officinalis":"официналис","annuus":"аннуус","perenne":"перенне","oleracea":"олерацеа","lewisii":"левизии",
"dk":"ДК","media":"медиа","plus":"плюс"
};
function dkCyrillic(input){
 const map={a:"а",b:"б",c:"к",d:"д",e:"е",f:"ф",g:"г",h:"х",i:"и",j:"дж",k:"к",l:"л",m:"м",n:"н",o:"о",p:"п",q:"к",r:"р",s:"с",t:"т",u:"у",v:"в",w:"в",x:"кс",y:"й",z:"з"};
 return String(input||"").replace(/[A-Za-zÀ-ž]+(?:['’][A-Za-zÀ-ž]+)*/g,raw=>{
  const word=raw.normalize("NFKD").replace(/[\u0300-\u036f]/g,""),lower=word.toLowerCase();
  if(Object.prototype.hasOwnProperty.call(dkTransWords,lower))return dkTransWords[lower];
  return word.replace(/sch/gi,"щ").replace(/sh/gi,"ш").replace(/ch/gi,"ч").replace(/zh/gi,"ж").replace(/kh/gi,"х").replace(/ph/gi,"ф").replace(/th/gi,"т").replace(/qu/gi,"кв").replace(/ck/gi,"к").replace(/ee/gi,"и").replace(/oo/gi,"у").replace(/ai/gi,"эй").replace(/ay/gi,"ей").replace(/ea/gi,"и").replace(/ou/gi,"ау").replace(/c(?=[eyi])/gi,"с").replace(/g(?=[eyi])/gi,"дж").replace(/[A-Za-z]/g,c=>map[c.toLowerCase()]||c).replace(/['’]/g,"");
 });
}
const dkNameOverrides={"Peredovik Sunflower Mix":"Подсолнечник «Передовик», смесь","Giant Gray Stripe":"Подсолнечник «Гигантский серополосатый»","Ruby Eclipse":"Подсолнечник «Рубиновое затмение»","Velvet Queen":"Подсолнечник «Бархатная королева»","Mammoth":"Подсолнечник «Мамонт»","Autumn Beauty Mixed Colors":"Подсолнечник «Осенняя красавица», смесь расцветок","Black Oil":"Подсолнечник масличный, чёрные семена","Fun in the Sun Blend":"Подсолнечник «Веселье на солнце», смесь","Sunflower, unspecified":"Подсолнечник, сорт не уточнён","Helianthus annuus Sunflower Blend":"Подсолнечник однолетний, смесь","Solar Yellow":"Морковь «Солнечно-жёлтая»","Cosmic Purple":"Морковь «Космическая фиолетовая»","Dragon":"Морковь «Дракон»","Starburst":"Морковь «Звёздный взрыв»","Little Finger":"Морковь «Мизинчик»","Nantes":"Морковь «Нантская»","Scarlet Nantes":"Морковь «Алая нантская»","Royal Chantenay":"Морковь «Королевская Шантенэ»","Imperator 58":"Морковь «Император 58»","Cherokee Green":"Томат «Чероки зелёный»","Black from Tula":"Томат «Чёрный из Тулы»","Tamarillo (tree tomato)":"Тамарилло (томатное дерево)","Aunt Ruby's German Green":"Томат «Немецкий зелёный тёти Руби»","Cherokee Purple":"Томат «Чероки фиолетовый»","Black Cherry":"Томат «Чёрная вишня»","Black Beauty":"Томат «Чёрная красавица»","Red Cherry":"Томат «Красная вишня»","Red Beefsteak":"Томат «Красный Бифштекс»","Roma UF":"Томат «Рома УФ»","Large Red Cherry":"Томат «Крупная красная вишня»","Green Grape":"Томат «Зелёный виноград»","Early Long Purple":"Баклажан «Ранний длинный фиолетовый»","California Wonder Bell":"Перец сладкий «Калифорнийское чудо»","Sweet Banana":"Перец сладкий «Банан»","Carolina Reaper":"Перец «Каролинский жнец»","Ghost Pepper":"Перец «Призрак»","Scotch Bonnet":"Перец «Шотландский колпак»","Blue Flax":"Лён голубой (вид уточняется)"};
function dkSeedDisplay(name,cat){return dkNameOverrides[name]||dkCyrillic(seedName(name,cat));}

function seedName(name,cat){
 if(Object.prototype.hasOwnProperty.call(exactNames,name))return exactNames[name];
 const s=String(name||""),c=String(cat||"");
 const rules=[
 ["Sunflowers","Подсолнечник"],["Carrots","Морковь"],["Tomatoes","Томат"],["Eggplant","Баклажан"],["Peppers","Перец"]];
 for(const [category,label]of rules)if(c===category)return label+" «"+s+"»";
 let label="";
 if(c==="Leafy greens"){
  label=/bok choy|pak choi/i.test(s)?"Пак-чой":/chicory|dandelion/i.test(s)?"Цикорий":/purslane/i.test(s)?"Портулак":/chard/i.test(s)?"Мангольд":/corn salad|mâche/i.test(s)?"Валерианелла":/kale/i.test(s)?"Капуста кейл":/spinach/i.test(s)?"Шпинат":/lettuce/i.test(s)?"Салат":/endive/i.test(s)?"Эндивий":/collard/i.test(s)?"Листовая капуста":/arugula/i.test(s)?"Руккола":/cress/i.test(s)?"Кресс-салат":/celery/i.test(s)?"Сельдерей":"Зелень";
 }else if(c==="Other vegetables")label=/okra/i.test(s)?"Бамия":"Артишок";
 else if(c==="Roots and brassicas")label=/kohlrabi/i.test(s)?"Кольраби":/radish/i.test(s)?"Редис":/turnip/i.test(s)?"Репа":/parsnip/i.test(s)?"Пастернак":/beet/i.test(s)?"Свёкла":/cabbage/i.test(s)?"Капуста":/broccoli/i.test(s)?"Брокколи":/cauliflower/i.test(s)?"Цветная капуста":/brussels/i.test(s)?"Брюссельская капуста":"Корнеплод";
 else if(c==="Beans and legumes")label=/pea /i.test(s)?"Горох":/peanut/i.test(s)?"Арахис":/soybean/i.test(s)?"Соя":/cowpea/i.test(s)?"Вигна":/lentil/i.test(s)?"Чечевица":/kidney|bean|pinto|lima/i.test(s)?"Фасоль":"Бобовые";
 else if(c==="Pumpkins and melons")label=/pumpkin/i.test(s)?"Тыква":/cantaloupe/i.test(s)?"Дыня":/watermelon/i.test(s)?"Арбуз":/cucamelon/i.test(s)?"Мелотрия":"Тыквенная культура";
 else if(c==="Gourds and squash")label=/cucumber/i.test(s)?"Огурец":/zucchini/i.test(s)?"Цукини":/loofah|luffa/i.test(s)?"Люффа":/butternut/i.test(s)?"Мускатная тыква":"Кабачок / тыква";
 else if(c==="Alliums: chives, onions and leeks")label=/leek/i.test(s)?"Лук-порей":/chives/i.test(s)?"Шнитт-лук":"Лук";
 else if(c==="Herbs and medicinal plants")label=/dill/i.test(s)?"Укроп":/basil/i.test(s)?"Базилик":/parsley/i.test(s)?"Петрушка":/cilantro|coriander/i.test(s)?"Кориандр":"Лекарственная трава";
 else if(c==="Flowers and ornamentals")label="Декоративный цветок";
 else if(c==="Wildflower mixes")label="Смесь полевых цветов";
 else if(c==="Trees and woody plants")label="Дерево / кустарник";
 else if(c==="Berries and fruit")label="Ягодная культура";
 else if(c==="Grains and grasses")label="Злак";
 else if(c==="Fiber and historical crops")label="Техническая культура";
 else label=ruCategories[c]||"Растение";
 return label+" «"+s.replace(/&#39;/g,"'")+"»";
}
const pairs=[
["My seed collection","Моя коллекция семян"],["Explore the whole collection. Search varieties, browse plant families, and filter by what each plant is grown for.","Просматривайте коллекцию, ищите сорта, изучайте семейства растений и отбирайте культуры по назначению."],
["Seed varieties","Разновидности семян"],["Varieties in collection","Сортов в коллекции"],["Commercial packets","Покупные пакеты"],["Bags of beans/lentils","Пакеты бобовых"],["Saved seed lots","Собранные партии семян"],["Plant categories","Категории растений"],
["Search your seeds","Поиск семян"],["Category","Категория"],["All categories","Все категории"],["Purpose / role","Назначение"],["All purposes","Все назначения"],["Seed source","Источник семян"],["All recorded sources","Все источники"],["Seed bags (beans / lentils)","Пакеты бобов и чечевицы"],["Saved / loose seeds","Собранные / россыпные семена"],
["Quantity","Количество"],["Any quantity","Любое количество"],["2+ units","2 и более"],["1 unit","1 единица"],["Count unconfirmed","Количество не подтверждено"],
["Pepper heat (SHU)","Острота перца (SHU)"],["All heat levels","Любая острота"],["No heat (0)","Без остроты (0)"],["Mild","Слабая"],["Medium","Средняя"],["Hot","Острая"],["Very hot","Очень острая"],["Superhot","Экстремально острая"],
["Expand all","Развернуть всё"],["Collapse all","Свернуть всё"],["Clear filters","Сбросить фильтры"],["Jump to a category","Перейти к категории"],["What the colors mean","Что обозначают цвета"],["Color key","Цветовые обозначения"],
["Monastery garden","Монастырский сад"],["All plants","Все растения"],["Historically attested plant types","Исторически известные культуры"],["Later / New World introductions","Поздние и американские культуры"],["Not historically verified","Историческая принадлежность не подтверждена"],
["📖 Recipe Guide","📖 Сборник рецептов"],["🥫 Food Preservation","🥫 Сохранение продуктов"],["What can I make? Check seeds, ingredients and what is missing","Что можно приготовить: семена, ингредиенты и недостающие продукты"],
["Loading your recipe collection…","Загружаем рецепты…"],["Tap a category heading to expand or collapse it.","Нажмите на название категории, чтобы открыть или закрыть её."],
["Planting guide & details","Инструкция по посадке и уходу"],["Planting depth","Глубина посева"],["Plant spacing","Расстояние между растениями"],["Light","Освещение"],["Germination","Прорастание"],["Soil temperature","Температура почвы"],["Maturity / lifespan","Созревание / срок жизни"],
["When, where & how to plant","Когда, где и как сажать"],["When:","Когда:"],["Where:","Где:"],["For Alaska:","Для Аляски:"],["Water:","Полив:"],["Harvest:","Урожай:"],["Notes:","Примечания:"],["Calendar:","Календарь:"],["Safety:","Безопасность:"],["Why:","Причина:"],["How:","Как действовать:"],["Who is at risk:","Кому угрожает:"],["Reference:","Источник:"],
["Choose a last frost date in Garden Planner to get a suggested window.","Укажите дату последнего заморозка в планировщике сада для расчёта сроков."],
["General species or crop guidance, not a test of this seed packet. Follow a verified packet label when it differs.","Это общие рекомендации для вида; сведения с подтверждённой упаковки имеют приоритет."],
["Add / replace plant photo","Добавить / заменить фото растения"],["Add / replace packet photo","Добавить / заменить фото упаковки"],["Plant picture web address","Ссылка на фото растения"],["Seed-packet picture web address","Ссылка на фото упаковки"],
["Preview plant image","Предпросмотр фото растения"],["Save plant URL","Сохранить ссылку на фото"],["Remove plant URL","Удалить ссылку на фото"],["Preview packet image","Предпросмотр фото упаковки"],["Save packet URL","Сохранить ссылку на упаковку"],["Remove packet URL","Удалить ссылку на упаковку"],
["Your photos","Ваши фотографии"],["Checking photo…","Проверяем фотографию…"],["No photo yet","Фото пока нет"],["Photo unavailable","Фотография недоступна"],["No matching image","Подходящее изображение не найдено"],
["Record planting","Записать посадку"],["View full seed card and picture settings","Открыть карточку семян и настройки фотографий"],["Growing guide and full planting record","Инструкция по выращиванию и полная запись о посадке"],
["📔 Planting Journal","📔 Журнал посадок"],["Planting Journal","Журнал посадок"],["＋ Record planting","＋ Добавить посадку"],["↓ Export backup (with photos)","↓ Скачать резервную копию (с фото)"],["↑ Import backup","↑ Восстановить резервную копию"],["Record planting","Записать посадку"],["Plant name","Название растения"],["Variety (optional)","Сорт (необязательно)"],["Date planted","Дата посадки"],["Approximate time","Приблизительное время"],["Minimum seeds","Минимум семян"],["Maximum seeds","Максимум семян"],["Soaked hours","Часов замачивания"],["Medium / containers","Грунт / ёмкости"],["Location / setup","Место / условия"],["Status","Состояние"],["Date sprouted","Дата всходов"],["Germinated count","Количество проросших"],["Survived count","Количество выживших"],["Notes","Примечания"],["Cancel","Отмена"],["Save","Сохранить"],["Delete","Удалить"],["Edit","Изменить"],["Sown","Посеяно"],["Sprouted","Взошло"],["Growing","Растёт"],["Transplanted","Пересажено"],["Flowering","Цветёт"],["Harvesting","Плодоношение"],["Finished","Завершено"],["Failed","Не удалось"],
["Planted:","Посажено:"],["Quantity:","Количество:"],["Variety:","Сорт:"],["Method:","Способ:"],["Sprouted:","Взошло:"],["Germinated:","Проросло:"],["Survived:","Выжило:"],["Location:","Место:"],["Planting observations and progress","Наблюдения за посадкой"],
["🌱 Garden Planner","🌱 Планировщик сада"],["Garden Planner","Планировщик сада"],["Growing region","Регион выращивания"],["Growing setup","Условия выращивания"],["Last spring frost","Последний весенний заморозок"],
["Garden management tools","Инструменты планирования сада"],["☁ Sync & Backup","☁ Синхронизация и резервные копии"],
["＋ Add or edit seeds","＋ Добавить или изменить семена"],["📅 This month","📅 Этот месяц"],["▦ Garden beds","▦ Грядки"],["↓ Backup","↓ Резервная копия"],["💧 Watering manager","💧 Учёт полива"],
["🌱 Inventory editor and seed lots","🌱 Редактор коллекции и партий семян"],["Add a seed variety","Добавить разновидность семян"],["Variety or seed name","Название сорта или семян"],["Packets / lots owned","Имеется пакетов / партий"],["Color-coded roles","Назначения по цветам"],["Add to Seed Bank","Добавить в коллекцию"],["Edit a seed already in your collection","Изменить уже записанные семена"],["Seed entry","Запись о семенах"],["Seed name","Название семян"],["Packets / lots","Пакеты / партии"],["Source","Источник"],["Archive / hide this entry","Архивировать / скрыть запись"],["Purpose labels","Назначения"],["Save seed changes","Сохранить изменения"],["Record a packet or seed lot","Записать пакет или партию семян"],["Seed lot / packet label","Обозначение партии / пакета"],["Year packed / harvested","Год фасовки / сбора"],["Known seeds in lot","Количество семян в партии"],["Storage place","Место хранения"],["Supplier","Поставщик"],["Add seed lot","Добавить партию"],["Seed variety","Сорт семян"],
["Date obtained (optional)","Дата получения (необязательно)"],["Record type","Тип записи"],
["Edit packet or seed lot","Изменить пакет или партию семян"],["Packet / lot label","Обозначение пакета или партии"],
["Known seeds in packet","Известное число семян в пакете"],["Leave blank if unknown","Оставьте пустым, если неизвестно"],
["Changing a packet does not change its variety, archive status, or linked plantings. Seed-count corrections are kept in its history.","Редактирование не меняет сорт, статус архива и связанные посадки. Исправления количества семян сохраняются в истории."],
["Save packet changes","Сохранить изменения пакета"],["Cancel editing","Отменить редактирование"],
["Edit packet","Изменить пакет"],["Seed-count corrections","Исправления количества семян"],
["📦 Packets & history","📦 Пакеты и история"],["No individual records","Без отдельных записей"],
["Manage packets for this variety","Управлять пакетами этого сорта"],["No individual packet records yet. Register an already-owned packet to link its plantings without increasing the variety card count.","Отдельные пакеты пока не учтены. Зарегистрируйте уже имеющийся пакет, чтобы связывать с ним посадки, не увеличивая число пакетов в карточке."],
["This packet is already included in the variety card count","Этот пакет уже учтён в количестве на карточке сорта"],
["Check this for a packet you already own and counted in DK Seed Bank. Registration adds a history without increasing the card total. Leave unchecked for a separately recorded lot. Record each physical packet only once.","Отметьте поле, если пакет уже учтён в коллекции. Он получит отдельную историю без увеличения числа пакетов в карточке. Для отдельной партии снимите отметку. Каждый пакет учитывайте только один раз."],
["Already counted on variety card","Уже учтён в карточке сорта"],
["Individual seed packet","Отдельный пакет семян"],["Loose seeds / bulk lot","Семена россыпью / большая партия"],
["For separate packet histories, record each physical packet as its own entry.","Для отдельной истории учитывайте каждый физический пакет отдельно."],
["Finish a packet already in your collection","Завершить пакет из коллекции"],
["For packets counted on an existing seed card, mark one empty without deleting the variety or its other packets.","Для пакетов, уже учтённых в карточке, отметьте один как пустой, не удаляя сорт и остальные пакеты."],
["Packet variety","Сорт пакета"],["Choose an existing packet variety…","Выберите сорт имеющегося пакета…"],
["Packet label (optional)","Название пакета (необязательно)"],["Date emptied","Дата окончания"],
["Mark one packet empty","Отметить один пакет пустым"],["📦 Packet archive and history","📦 Архив пакетов и история"],
["An empty packet stays in your history. Restore it if you marked it empty by mistake. Other packets stay untouched.","Пустой пакет остаётся в истории. Если он отмечен по ошибке, восстановите его. Другие пакеты не меняются."],
["Mark empty","Отметить пустым"],["Seed variety","Сорт семян"],
["📅 Monthly planting assistant and succession reminders","📅 Месячный календарь посевов и повторные посадки"],["Month","Месяц"],["See this month","Показать месяц"],["Change frost date","Изменить дату заморозка"],["Succession-sowing reminder","Напоминание о повторном посеве"],["Start date","Дата начала"],["Repeat every (days)","Повторять каждые (дней)"],["Planned sowings","Количество посевов"],["Schedule repeat sowings","Запланировать повторные посевы"],
["🧪 Seed viability, germination and low stock","🧪 Всхожесть семян и остатки"],["Date tested","Дата проверки"],["Seeds tested","Проверено семян"],["Seeds sprouted","Взошло семян"],["Record germination test","Записать проверку всхожести"],["Low stock alert at or below","Предупреждать при остатке не более"],["known remaining seeds","известных семян"],
["▦ Garden beds, containers and crop rotation","▦ Грядки, контейнеры и севооборот"],["Bed or container name","Название грядки или контейнера"],["Growing area","Место выращивания"],["Previous crop family","Предыдущее семейство культуры"],["Plant or assign variety","Посадить или назначить сорт"],["Add garden space","Добавить место выращивания"],["Outdoor garden","Открытый грунт"],["Unheated greenhouse","Неотапливаемая теплица"],["Heated greenhouse","Отапливаемая теплица"],["Indoor container","Контейнер в помещении"],["Unknown / new bed","Неизвестно / новая грядка"],["Other / verify","Другое / проверить"],
["🧺 Harvest records","🧺 Учёт урожая"],["Harvest date","Дата сбора урожая"],["Yield","Объём урожая"],["Unit","Единица"],["Garden space","Место в саду"],["Quality and notes","Качество и примечания"],["Record harvest","Записать урожай"],
["🌾 Seeds saved from your plants","🌾 Собранные семена своих растений"],["Parent variety","Исходный сорт"],["Seed harvest date","Дата сбора семян"],["Seeds collected","Собрано семян"],["Storage location","Место хранения"],["Isolation, cross-pollination and observations","Изоляция, переопыление и наблюдения"],["Save seed-harvest record","Сохранить запись о сборе семян"],
["Source packet (optional)","Исходный пакет (необязательно)"],
["Not linked to a packet","Без привязки к пакету"],
["Choose a packet you actually used. Leaving this blank does not deduct seeds from another packet.","Выберите пакет, который действительно использовали. Если оставить поле пустым, семена из других пакетов не списываются."],
["Previously linked packet","Ранее связанный пакет"],
["Previously linked packet (record unavailable)","Ранее связанный пакет (запись недоступна)"],
["Source packet:","Исходный пакет:"],
["packets on cards","пакетов в карточках"],
["individually tracked packets (may overlap)","отдельно учтённых пакетов (могут совпадать)"],
["Linked planting (optional)","Связанная посадка (необязательно)"],["No linked planting","Без связи с посадкой"],["Seed batch label","Название партии семян"],["Parent seed type","Тип исходных семян"],["Not verified","Не проверено"],["Open-pollinated","Открытоопыляемый сорт"],["Heirloom / open-pollinated","Старинный / открытоопыляемый сорт"],["F1 hybrid","Гибрид F1"],["Pollination / isolation","Опыление / изоляция"],["Isolated from compatible varieties","Изолировано от совместимых сортов"],["Flowers protected / hand-pollinated","Цветки защищены / ручное опыление"],["Open pollination (not isolated)","Свободное опыление (без изоляции)"],["Possible cross-pollination","Возможно переопыление"],["Seed cleaning method","Способ очистки семян"],["Not recorded","Не записано"],["Dry thresh / winnow","Сухой обмолот / веяние"],["Wet seed wash","Промывка мокрых семян"],["Wet seed fermentation","Ферментация мокрых семян"],["Other crop-specific method","Другой способ для этой культуры"],["🏷️ Printable seed packet labels","🏷️ Этикетки для печати"],["Add label","Добавить этикетку"],["Print selected labels","Печатать выбранные этикетки"],["Clear sheet","Очистить лист"],
["💾 Backups, moving devices and data safety","💾 Резервные копии, перенос и сохранность данных"],["↓ Export full backup","↓ Скачать полную резервную копию"],["↑ Restore a backup","↑ Восстановить резервную копию"],
["Select a planting…","Выберите посадку…"],["Choose a seed variety…","Выберите сорт семян…"],["Unknown / not selected","Неизвестно / не выбрано"],["Commercial packet","Покупной пакет"],["Bag of beans / lentils","Пакет бобовых / чечевицы"],["Saved from my garden","Собрано в моём саду"],["Harvested seeds","Собранные семена"],["Unknown","Неизвестно"],
["💧 Garden Watering Manager","💧 Учёт полива сада"],["Plant-by-plant guidance · moisture checks · watering records","Рекомендации для каждого растения · проверка влажности · записи поливов"],["Planting moisture checks","Проверка влажности посадок"],["Record a check or watering","Записать проверку или полив"],["Recorded planting","Записанная посадка"],["Activity","Действие"],["Watered","Полито"],["Checked soil only","Проверена почва без полива"],["Observed rain","Отмечен дождь"],["Skipped watering: soil already moist","Полив не нужен: почва влажная"],["Date","Дата"],["Soil condition","Состояние почвы"],["Not measured","Не измерено"],["Dry","Сухая"],["Slightly dry","Слегка сухая"],["Moist","Влажная"],["Wet / waterlogged","Мокрая / переувлажнённая"],["Amount (optional)","Количество (необязательно)"],["Gallons","Галлоны"],["Liters","Литры"],["Cups","Чашки"],["Inches of water / rain","Дюймы осадков / воды"],["In-ground bed","Грядка в грунте"],["Raised bed","Приподнятая грядка"],["Container / pot","Контейнер / горшок"],["Greenhouse","Теплица"],["Seed tray / cells","Лоток для рассады"],["Check again in (days)","Проверить снова через (дней)"],["Save watering record","Сохранить запись полива"],["Cancel edit","Отменить изменение"],["Update record","Обновить запись"],["Watering history","История полива"],["Log check","Записать проверку"],
["Watering guide","Рекомендации по поливу"],["How often:","Как часто:"],["How much (in-ground):","Сколько воды (грунт):"],["During germination:","Во время прорастания:"],["Young plants:","Молодые растения:"],["Established plants:","Взрослые растения:"],["Flowering / fruiting:","Цветение / плодоношение:"],["Avoid overwatering:","Избегайте переувлажнения:"],["Containers / heat / rain:","Контейнеры / жара / дождь:"],
["Record watering for an actual planting","Записать полив конкретной посадки"],["Watering","Полив"],["💧 Watering","💧 Полив"],
["🏛️ Monastic Garden","🏛️ Монастырский сад"],["Historical plant types · Saint Gall · herb garden, kitchen garden and orchard","Исторические культуры · Санкт-Галлен · аптекарский огород, кухня и плодовый сад"],
["Three parts of a monastery garden","Три части монастырского сада"],["Sources:","Источники:"],["References:","Источники:"],
["Choose a recipe","Выберите рецепт"],["Delete this recipe","Удалить рецепт"],["Historical botanical checklist","Исторический список растений"],["Kitchen","Кухня"],["Personal recipe","Личный рецепт"],["My recipe","Мой рецепт"],
["Traditional absinthe · Pontarlier-style","Традиционный абсент в стиле Понтарлье"],["Fresh basil pesto","Свежий песто из базилика"],["Fresh garden tomato salsa","Сальса из садовых томатов"],["Refrigerator dill pickles","Маринованные огурцы с укропом (хранить в холодильнике)"],
["Growable ingredients with seeds","Ингредиенты, семена которых есть"],["Ingredients marked on hand","Ингредиенты в наличии"],["Still not ready","Ещё не готовы"],["On hand","В наличии"],["✓ Ingredient on hand","✓ Ингредиент в наличии"],["Not tracked as a seed","Не учитывается как семена"],["✓ Seeds recorded; ingredient not confirmed ready","✓ Семена есть; готовый ингредиент не подтверждён"],["✕ No matching seed recorded","✕ Соответствующих семян нет"],["Your seed records:","Ваши семена:"],["Preparation:","Приготовление:"],["Important:","Важно:"],["＋ Add your own recipe","＋ Добавить свой рецепт"],["Recipe name","Название рецепта"],["Ingredients, one per line","Ингредиенты по одному в строке"],["Save recipe","Сохранить рецепт"],["Not found in the seed bank:","Нет в коллекции семян:"],["Other supplies not marked on hand:","Прочие ингредиенты не отмечены:"],
["Grand wormwood (Artemisia absinthium)","Полынь горькая (Artemisia absinthium)"],["Green anise (Pimpinella anisum)","Анис обыкновенный (Pimpinella anisum)"],["Fennel seed (Foeniculum vulgare)","Семена фенхеля (Foeniculum vulgare)"],["Petite/Roman wormwood (Artemisia pontica)","Полынь понтийская (Artemisia pontica)"],["Hyssop (Hyssopus officinalis)","Иссоп (Hyssopus officinalis)"],["Lemon balm (Melissa officinalis)","Мелисса (Melissa officinalis)"],["Suitable neutral spirit","Подходящий нейтральный спирт"],["Potable water","Питьевая вода"],["Fresh basil","Свежий базилик"],["Garlic","Чеснок"],["Pine nuts or walnuts","Кедровые или грецкие орехи"],["Olive oil","Оливковое масло"],["Hard grating cheese","Твёрдый тёртый сыр"],["Salt","Соль"],["Ripe tomatoes","Спелые томаты"],["Fresh peppers","Свежий перец"],["Cilantro leaves","Листья кинзы"],["Onion","Лук"],["Lime juice","Сок лайма"],["Pickling cucumbers","Огурцы для засолки"],["Fresh dill","Свежий укроп"],["Food-grade vinegar","Пищевой уксус"],
["↑ Back to category top","↑ К началу категории"],["↑ Back to page top","↑ Наверх страницы"],
["Edit","Изменить"],["Delete","Удалить"],["Add","Добавить"],["Remove","Удалить"],["Check variety","Уточнить сорт"],["seeds","семена"],["Seed Bank","Банк семян"]
];
for(const [en,ru] of Object.entries(ruCategories))pairs.push([en,ru]);
for(const [en,ru] of Object.entries(ruRoles))pairs.push([en,ru]);
const dictionary=new Map(pairs);
// Pepper heat explanations, source labels, help text and units must localize as complete strings.
for(const [en,ru] of Object.entries({
"Edit your garden records, plan sowing, track harvests, and save seed lots. For cloud synchronization or downloadable backups, open Sync & Backup below.":"Редактируйте записи о саде, планируйте посевы, учитывайте урожай и собранные семена. Для синхронизации с облаком или скачивания копий откройте ниже раздел «Синхронизация и резервные копии».",
"Calendar dates are approximations based on your last frost date in Garden Planner, not local weather forecasts or packet-specific guarantees.":"Даты в календаре приблизительны и основаны на указанной дате последних заморозков, а не на прогнозе погоды или гарантиях для конкретного сорта.",
"Set your actual last spring frost date in Garden Planner first. Region alone is not accurate enough for a planting calendar.":"Сначала укажите дату последних весенних заморозков в планировщике сада. Одного региона недостаточно для точного календаря.",
"Set a last spring frost date in Garden Planner for estimated planting windows.":"Укажите дату последних весенних заморозков в планировщике сада, чтобы рассчитать примерные сроки посева.",
"No matching seed variety is currently listed. You can add one in Garden Planner, but this journal record is preserved.":"Подходящий сорт семян не найден. Его можно добавить в планировщике сада; запись журнала сохранится.",

  "🌶 Scoville Heat Units (SHU)": "🌶 Шкала остроты Сковилла",
  "Scoville Heat Units": "Единицы остроты по шкале Сковилла",
  "SHU": "ед. Сковилла",
  "ⓘ Check variety": "ⓘ Уточнить сорт",
  "Typical heat ranges, not tests of your seeds. Color shows general heat; cultivar, growing conditions and maturity affect the actual result. Entries marked “Check variety” use an approximate or conditional match.": "Указаны типичные диапазоны остроты, а не результаты измерений ваших семян. Цвет обозначает примерный уровень остроты. Фактическая острота зависит от сорта, условий выращивания и зрелости плодов. Для записей с пометкой «Уточнить сорт» диапазон приблизительный или применим только при определённых условиях.",
  "Iowa State Extension": "Сельскохозяйственная служба Университета штата Айова",
  "Penn State Extension": "Сельскохозяйственная служба Университета штата Пенсильвания",
  "Tozer (Count Dracula)": "Tozer (сорт «Граф Дракула»)",
  "True Leaf Market (specialty habaneros)": "True Leaf Market (особые сорта хабанеро)",
  "Typical poblano range; saved seeds may vary.": "Типичный диапазон для поблано; растения из сохранённых семян могут отличаться.",
  "Paprika-type estimate; the specific NuMex cultivar needs confirmation.": "Приблизительная оценка для перца типа паприки; точный сорт NuMex нужно подтвердить.",
  "Only if this is Count Dracula; verify the variety printed on the packet.": "Диапазон верен, только если это сорт «Граф Дракула». Сверьте название на упаковке.",
  "Typical jalapeño range; saved seeds may not grow true to type.": "Типичный диапазон для халапеньо; растения из сохранённых семян могут не повторять признаки исходного сорта.",
  "General jalapeño reference. A mild selection can be lower; packet needs verification.": "Общий диапазон для халапеньо. У мягкого сорта острота может быть ниже; проверьте упаковку.",
  "General jalapeño range; this cultivar may differ.": "Типичный диапазон для халапеньо; у этого сорта острота может отличаться.",
  "Chocolate habanero published seed-supplier range; varies by line.": "Диапазон для шоколадного хабанеро по данным поставщика семян; у разных линий он отличается.",
  "General habanero reference; exact white variety not confirmed.": "Общий диапазон для хабанеро; точный белый сорт не подтверждён.",
  "If this is the Lemon Habanero cultivar; verify the packet.": "Диапазон подходит, если это сорт «Лимонный хабанеро»; проверьте упаковку."
}))dictionary.set(en,ru);
const recipeText={
"The classic distilled style uses grand wormwood, green anise and fennel for its principal character, with petite wormwood, hyssop and lemon balm often used for the green coloration. This is an ingredient inventory, not a distillation tutorial.":"Классический дистиллированный вариант основан на горькой полыни, анисе и фенхеле; для зелёного оттенка традиционно используют понтийскую полынь, иссоп и мелиссу. Это только учёт ингредиентов, а не инструкция по перегонке.",
"A classic basil-based sauce. Harvest mature edible leaves; seed packets are not cooking ingredients.":"Классический соус из базилика. Используйте зрелые съедобные листья; семена из пакета не являются пищевым ингредиентом.",
"A fresh chopped tomato salsa using garden vegetables and basic pantry staples.":"Свежая сальса из нарезанных садовых помидоров, овощей и обычных продуктов.",
"A refrigerator pickle checklist, not a shelf-stable canning or fermentation procedure.":"Список ингредиентов для огурцов, которые хранятся в холодильнике. Это не инструкция по консервированию или ферментации.",
"Finely crush or blend basil, garlic and nuts, then combine with oil and cheese. Season to taste. Refrigerate promptly.":"Измельчите базилик, чеснок и орехи, добавьте масло и сыр, посолите по вкусу. Сразу поставьте в холодильник.",
"Chop tomatoes, peppers, cilantro and onion; mix with lime juice and salt. Keep refrigerated. This is not a shelf-stable canning recipe.":"Нарежьте томаты, перец, кинзу и лук, смешайте с соком лайма и солью. Храните в холодильнике; это не рецепт консервирования.",
"Use a tested refrigerator-pickle recipe with food-safe vinegar strength, proper proportions and refrigeration. This guide tracks ingredients only.":"Используйте проверенный рецепт с правильной концентрацией пищевого уксуса и холодильным хранением. Здесь учитываются только ингредиенты.",
"Safety: do not consume packet seeds, unidentified plants or concentrated essential oils. Alcohol distillation can be dangerous and restricted. U.S. domestic spirits containing wormwood require regulatory compliance and thujone limits; check applicable laws. No home-distillation instructions are provided.":"Безопасность: не употребляйте посевные семена, неопознанные растения или концентрированные эфирные масла. Перегонка спирта опасна и может регулироваться законом. Для напитков с полынью действуют ограничения по туйону; инструкции по домашней перегонке здесь нет.",
"Your wormwood packet lists Artemisia absinthium; verify species and food-safe suitability.":"На упаковке указана Artemisia absinthium; подтвердите вид и пригодность растения к употреблению.",
"True green anise, not star anise.":"Именно анис обыкновенный, не бадьян.",
"Florence and Bronze fennel seeds are recorded; verify botanical identity and culinary seed quality.":"Записаны фенхель флорентийский и бронзовый; проверьте вид и пригодность семян для кухни.",
"Different species from grand wormwood; not interchangeable.":"Другой вид полыни, заменять без проверки нельзя.",
"Verify true hyssop; 'anise hyssop' is a different plant.":"Проверьте, что это настоящий иссоп; анисовый иссоп относится к другому растению.",
"Traditional green coloring herb.":"Традиционная трава для зелёного оттенка.",
"Not supplied by the seed bank. Traditional absinthe is a distilled spirit, not simply a wormwood soak.":"В коллекции семян этого нет. Традиционный абсент получают перегонкой, а не простым настаиванием полыни.",
"For the finished beverage; record when available.":"Для готового напитка; отмечайте наличие отдельно.",
"Use ordinary culinary tomatoes rather than a tamarillo; check the matching variety.":"Используйте обычные пищевые томаты, а не тамарилло; проверьте сорт.",
"Cucamelons are a different species; verify which type you intend.":"Мелотрия относится к другому виду; уточните, какие огурцы нужны."
};
for(const [en,ru] of Object.entries(recipeText))dictionary.set(en,ru);
const fullParagraphs=new Map([
["Match recipes against your actual seed collection. Owning seeds means you can","Сверяйте рецепты с фактической коллекцией. Наличие семян позволяет"],
["only when you have usable ingredients.","только когда готовые продукты действительно имеются."],
["Check the soil first. A suggested check date is","Сначала проверьте почву. Рекомендуемая дата проверки"],
["an instruction to water.","не означает обязательный полив."]
]);
for(const [en,ru] of fullParagraphs)dictionary.set(en,ru);
const additionalTranslations=[["Language","Язык"],["Select language","Выбор языка"],["grow","вырастить"],["not","не"],["an ingredient, not that it is already harvested or food-safe. Tick","ингредиент, но это ещё не означает, что он собран и безопасен в пищу. Отмечайте"],["Match recipes against your actual seed collection. Owning seeds means you can","Сверяйте рецепты с вашей коллекцией семян. Наличие семян позволяет"],["Your garden records stay in this browser. Use","Данные о саде сохраняются в этом браузере. Используйте"],["to move them to another device. Automatic cloud sync needs a private backend and is not enabled.","для переноса на другое устройство. Автоматическая облачная синхронизация требует закрытого сервера и сейчас не включена."],["Export full backup","Экспорт полной резервной копии"],["Check the soil first. A suggested check date is","Сначала проверьте влажность почвы. Рекомендуемая дата проверки"],["an instruction to water. Rain, heat, mulch, soil, pot size and growth stage all affect needs. Records are saved in this browser; include them in your full Seed Bank backup.","не является указанием обязательно поливать. Дождь, жара, мульча, состав грунта, размер горшка и стадия роста влияют на потребность во влаге. Записи хранятся в браузере; сохраняйте их в полной резервной копии."],["Guidance is a starting point, not a moisture sensor or live weather forecast. For in-ground vegetable beds, weekly totals include rainfall. For pots, water according to soil moisture and drainage rather than inches per week.","Рекомендации ориентировочные: приложение не измеряет влажность и не получает прогноз погоды в реальном времени. Для грядок недельная норма включает дождь. В горшках ориентируйтесь на влажность почвы и дренаж, а не только на нормы осадков."],["Guidance:","Рекомендации:"],["Iowa State Extension · Watering vegetables","Университет штата Айова · Полив овощей"],["UF/IFAS · Watering seedlings","Университет Флориды · Полив рассады"],["Historical reference, not an endorsement of ancient medicines and not proof that any modern packet or cultivar was available in the Middle Ages. The filter identifies","Историческая справка, а не одобрение древних лекарств и не доказательство существования современных сортов в Средние века. Фильтр выделяет"],["plant types","виды и группы культур"],["documented in pre-modern European gardening, not the age of your particular varieties.","известные в европейском садоводстве до Нового времени, а не возраст конкретных сортов из ваших пакетов."],["Herbularius:","Аптекарский огород:"],["medicinal and aromatic herbs such as rue, fennel, lovage, wormwood, sage and mint.","лечебные и ароматные травы: рута, фенхель, любисток, полынь, шалфей и мята."],["Hortus:","Кухонный огород:"],["kitchen crops such as leeks, onions, parsley, cabbage and root vegetables.","овощи и зелень: порей, лук, петрушка, капуста и корнеплоды."],["Orchard:","Плодовый сад:"],["fruit and nut trees and useful shrubs.","плодовые и орехоплодные деревья, полезные кустарники."],["Species and period matter: tomatoes, peppers, maize and most American squashes entered Europe after medieval times. Blue Flax is not confirmed as the linen flax (","Вид и эпоха имеют значение: томаты, стручковые перцы, кукуруза и многие американские тыквенные появились в Европе после Средневековья. Голубой лён не подтверждён как лён посевной для ткани ("],[") grown for fiber. Many named modern cultivars are historical","), выращиваемый ради волокна. Многие современные сорта относятся лишь к историческим"],["crop types","типам культур"],["only.","без подтверждения конкретного средневекового сорта."],["Safety:","Безопасность:"],["historically used medicinal plants such as henbane, belladonna and foxglove can be poisonous. Historical use never implies safety or edible status.","старинные лекарственные растения, например белена, белладонна и наперстянка, могут быть ядовиты. Историческое использование не означает безопасность или съедобность."],["Plan of Saint Gall","План монастыря Санкт-Галлен"],["Research on medieval monastic herb and kitchen gardens","Исследование средневековых монастырских огородов"],["Blue flax identification","Определение голубого льна"],["Calendar dates are approximations based on the last frost date in your Growing Planner, not local weather forecasts or packet-specific guarantees.","Календарные сроки приблизительные и основаны на дате последних заморозков в Планировщике, а не на прогнозе погоды или гарантиях на упаковке."],["A germination test is more useful than treating a seed packet date as an automatic expiration. Different species age differently.","Проверка всхожести полезнее, чем автоматическое признание старых семян негодными. Семена разных видов стареют по-разному."],["Crop-family warnings are a planning aid, not proof that a bed is disease-free. Rotation history should be verified.","Предупреждения о семействе культуры помогают планировать севооборот, но не гарантируют отсутствие болезней. Историю грядки проверяйте отдельно."],["Saved seed does not guarantee the parent traits, especially from hybrids or cross-pollinating plants.","Собранные семена могут не повторять свойства родительского растения, особенно у гибридов и переопыляемых культур."],["Print dialog opens in your browser; no print job is sent by DK Seed Bank.","Печать открывается в браузере. Само приложение не отправляет задания на принтер."],["Seed edits, lots, beds, tests, harvests and photos are saved locally on this browser. Your GitHub Pages website does not currently have a user database or encrypted sign-in, so","Редактирование коллекции, партии семян, грядки, тесты, урожай и фотографии хранятся в этом браузере. На GitHub Pages нет пользовательской базы данных и защищённых учётных записей, поэтому"],["live synchronization between devices is not available","синхронизация между устройствами недоступна"],["The full backup contains your journal, photos, customized picture URLs and all workbench records. Store it somewhere safe. Restoring can replace existing records: read the confirmation carefully.","Полная резервная копия содержит журнал, фотографии, ссылки на изображения и все записи садового учёта. Храните файл в безопасном месте. При восстановлении существующие данные могут быть заменены."],["Built-in seeds can be archived, not permanently erased. Newly added varieties remain in your browser until exported.","Исходные записи семян можно архивировать, но не удалять навсегда. Новые сорта сохраняются только в браузере до экспорта."],["A germination test is more useful than treating a seed packet date as an automatic expiration.","Проверка всхожести полезнее, чем признание семян негодными только по дате на упаковке."],["Plant a seed only when it is safe to grow in your local region.","Выращивайте растения с учётом безопасности и местных климатических условий."],["No active planting records. Use the Planting Journal to record what you actually sowed; every seed card already has a watering guide.","Активных посадок пока нет. Записывайте фактические посевы в Журнале; рекомендации по поливу уже есть у каждого растения."],["No watering or moisture checks recorded yet.","Записей о поливе или проверках почвы пока нет."],["First record an actual planting in the Planting Journal. Watering records attach to that planting, not merely to an unused seed packet.","Сначала запишите посадку в Журнале. Учёт полива привязан к реальной посадке, а не просто к пакету семян."],["No exact linked planting yet. Record a planting in the journal, then log its watering here.","Точной связанной посадки пока нет. Добавьте посадку в Журнал, затем записывайте полив."],["The next date is a soil check, not an automatic watering order.","Следующая дата означает проверку почвы, а не обязательный полив."],["Saved. The next date is a soil check, not an automatic watering order.","Сохранено. Следующая дата означает проверку почвы, а не обязательный полив."],["Watering record deleted.","Запись полива удалена."],["Edit cancelled.","Редактирование отменено."],["No watering or moisture checks recorded yet.","Пока нет записей о поливе или влажности почвы."],["Every ingredient has been checked on hand.","Все ингредиенты отмечены в наличии."],["Compare each ingredient with your seed inventory and pantry.","Сверяйте каждый ингредиент с коллекцией семян и продуктами на кухне."],["Custom ingredient checklist.","Собственный список ингредиентов."],["Start each line with","Начинайте каждую строку с"],["to match your seed collection, or","для сопоставления с коллекцией семян, или"],["for other supplies. Your recipes and on-hand marks stay in this browser and are included in full backups.","для прочих продуктов. Рецепты и отметки о наличии хранятся в браузере и входят в полную резервную копию."],["garden:","огород:"],["pantry:","кладовая:"],["My herb bread","Мой хлеб с травами"],["✓ Seeds recorded; ingredient not confirmed ready","✓ Семена записаны, но готовый ингредиент ещё не подтверждён"],["obtain/confirm supply","получить или подтвердить наличие"],["grow, harvest or otherwise obtain usable ingredient","вырастить, собрать или получить пригодный ингредиент"],["obtain the seed or prepared ingredient","получить семена или готовый ингредиент"],["Edit planting","Изменить посадку"],["Delete selected custom seed","Удалить добавленный сорт"],["Not recorded","Не записано"],["Count unconfirmed","Количество не подтверждено"],["Check variety","Уточнить сорт"],["Packaged seeds","Упакованные семена"],["No photo available","Фотография недоступна"],["Wikipedia","Википедия"]];
for(const [en,ru] of additionalTranslations)dictionary.set(en,ru);

for(const [en,ru] of Object.entries({"Кустовой":"Кустовой","Unverified seed packet photo":"Фотография пакетика не подтверждена","Checking photo…":"Проверяется фотография…","No exact variety photo verified":"Точная фотография сорта не подтверждена","Named seed-packet photo (not growing carrots)":"Фото фирменного пакетика семян (не выращенная морковь)","Photo of named cultivar":"Фото указанного сорта","Seller's photo of named cultivar":"Фото сорта от продавца","One example of this seed blend":"Пример растения из смеси","Seed photo cannot be loaded":"Не удалось загрузить фотографию семян"}))dictionary.set(en,ru);
for(const [en,ru] of Object.entries({"English":"Английский","Nightshade (Solanaceae)":"Паслёновые (Solanaceae)","Brassica (Brassicaceae)":"Капустные (Brassicaceae)","Gourd (Cucurbitaceae)":"Тыквенные (Cucurbitaceae)","Carrot (Apiaceae)":"Зонтичные (Apiaceae)","Allium (Amaryllidaceae)":"Амариллисовые (Amaryllidaceae)","Amaranth (Amaranthaceae)":"Амарантовые (Amaranthaceae)","Grass (Poaceae)":"Злаковые (Poaceae)","Mint (Lamiaceae)":"Яснотковые (Lamiaceae)","Legume (Fabaceae)":"Бобовые (Fabaceae)","Daisy (Asteraceae)":"Астровые (Asteraceae)","Miner's lettuce (Montiaceae)":"Монтиевые (Montiaceae)","Honeysuckle (Caprifoliaceae)":"Жимолостные (Caprifoliaceae)","count":"штуки","bunches":"пучки","🌱 Your monthly seed-starting checklist":"🌱 Список посевов на этот месяц","Dismiss for this month":"Закрыть на этот месяц","Close":"Закрыть","Estimated last spring frost:":"Предполагаемый последний весенний заморозок:","No matching sowing windows in this month for your recorded varieties. Check earlier or later months.":"В этом месяце для ваших записанных сортов нет подходящих сроков посева. Проверьте соседние месяцы.","(due)":"(пора выполнить)","Mark next sown":"Отметить следующий посев","Remove plan":"Удалить план","No repeat-sowing reminders set.":"Напоминания о повторных посевах пока не установлены.","No viability tests recorded.":"Тесты на всхожесть пока не записаны.","Known low-stock seed counts":"Учитываемые остатки семян с малым запасом","⚠ Same crop family as the previous season. Consider rotating to a different family if practical.":"⚠ В предыдущем сезоне здесь выращивалась культура того же семейства. По возможности измените севооборот.","Add a variety":"Добавить сорт","Assign":"Назначить","Remove bed":"Удалить грядку","No saved seed harvests recorded yet.":"Сбор собственных семян пока не записывался.","Select a seed to create print-ready labels.":"Выберите семена для подготовки этикеток к печати.","Link a specific variety only if you know it was planted":"Указывайте конкретный сорт, только если уверены, что именно он был посеян.","Species notes:":"Примечания о виде:","Growing instructions":"Рекомендации по выращиванию","Seeds sown:":"Посеяно семян:","active varieties":"активных сортов","plantings":"посадок","garden spaces":"мест выращивания","harvests":"сборов урожая","How to stay safe:":"Как обезопасить себя:","General safety reference:":"Общие сведения о безопасности:","Planting guide & details":"Инструкция по посадке и уходу","When, where & how to plant":"Когда, где и как сажать","📷 Add / replace plant photo":"📷 Добавить или заменить фото растения","📦 Add / replace packet photo":"📦 Добавить или заменить фото пакета семян","Paste a direct picture link, not a webpage address.":"Вставьте прямую ссылку на изображение, а не ссылку на веб-страницу.","You do not have to download the picture first.":"Предварительно скачивать фотографию не требуется.","Show sourced image":"Показать изображение из источника","Show my plant":"Показать моё растение","Show my packet":"Показать мой пакет семян","Delete my plant photo":"Удалить моё фото растения","Delete my packet photo":"Удалить моё фото пакета","Find more photos of this variety on Wikimedia Commons":"Найти другие фотографии сорта в Викискладе","Exact variety image not yet confirmed. You can upload your own.":"Точное изображение сорта пока не подтверждено. Вы можете загрузить своё фото.","× Close planting details":"× Закрыть подробности посадки","Growing method":"Способ выращивания","All methods":"Все способы","Greenhouse recommended":"Рекомендуется теплица","Needs species verification":"Необходимо уточнить вид","My photos":"Мои фотографии","All seeds":"Все семена","Has my photo":"Есть моё фото","No personal photo yet":"Моего фото пока нет","Choose a region and growing setup. Alaska varies enormously from town to town; planting dates depend on your actual frost dates and greenhouse heating.":"Выберите регион и условия выращивания. На Аляске климат сильно меняется от места к месту; сроки посева зависят от фактических заморозков и обогрева теплицы.","Alaska (location TBD)":"Аляска (место уточняется)","Kansas":"Канзас","Other location":"Другой регион","Growing space":"Место выращивания","Indoors / grow lights":"В помещении / под фитолампами","Expected last spring frost":"Ожидаемый последний весенний заморозок","🌱 What could I plant now?":"🌱 Что можно посадить сейчас?","Set your expected last spring frost to calculate approximate sowing windows.":"Укажите предполагаемую дату последнего весеннего заморозка для расчёта примерных сроков посева.","Protected-growing candidates":"Культуры для защищённого грунта","Frost-date-based planting candidates":"Культуры для посева с учётом заморозков","Germinating":"Прорастает","Harvested":"Урожай собран","Plant reference":"Справка о растении","active planting records":"активных посадок","checks due or past suggested date":"проверок влажности пора выполнить","without a moisture check":"без проверки влажности","watering/history records":"записей о поливе и влажности"}))dictionary.set(en,ru);
// Russian quantity nouns depend on both the last digit and the last two digits.
function ruCount(n,one,few,many){
 const value=Math.abs(Number(n)),last=value%10,lastTwo=value%100;
 return lastTwo>=11&&lastTwo<=14?many:last===1?one:last>=2&&last<=4?few:many;
}
const dkDynamicRules=[
 [/Planting Journal/gi,"Журнал посадок"],
 [/Garden Planner/gi,"Планировщик сада"],
 [/Growing Planner/gi,"Планировщик сада"],
 [/Garden Watering Manager/gi,"Учёт полива сада"],
 [/Monastic Garden/gi,"Монастырский сад"],
 [/Recipe Guide/gi,"Сборник рецептов"],
 [/(\d+)\s+recorded plantings?\b/gi,"$1 записанных посадок"],
 [/(\d+)\s+active varieties\b/gi,"$1 активных сортов"],
 [/(\d+)\s+plantings\b/gi,"$1 посадок"],
 [/(\d+)\s+garden spaces\b/gi,"$1 мест выращивания"],
 [/(\d+)\s+harvests\b/gi,"$1 сборов урожая"],
 [/(\d+)\s+germination tests\b/gi,"$1 проверок всхожести"],
 [/(\d+)\s+count\(s\) unconfirmed\b/gi,"$1 без уточнённого количества"],
 [/(\d+)\s+packets?\b/gi,(_,n)=>n+" "+ruCount(n,"пакет","пакета","пакетов")],
 [/(\d+)\s+saved lots?\b/gi,(_,n)=>n+" "+ruCount(n,"партия","партии","партий")+" семян"],
 [/(\d+)\s+(?:batches|batchs|batch)\b/gi,(_,n)=>n+" "+ruCount(n,"партия","партии","партий")],
 [/\bLog planting\b/gi,"Записать посадку"],
 [/\bManage photos\b/gi,"Управление фотографиями"]
];
function dkDynamic(text){let value=String(text||"");for(const [rule,replacement] of dkDynamicRules)value=value.replace(rule,replacement);return value;}
for(const [en,rus] of Object.entries({"DK Seed Bank":"ДК Банк семян","DK Media Plus":"ДК Медиа Плюс","Try tomato, tomatoe, Peredovik, pollinator…":"Например: томат, Передовик, медоносы…","📔 Planting Journal":"📔 Журнал посадок","Planting Journal":"Журнал посадок","📷 Manage photos":"📷 Управление фотографиями","＋ Log planting":"＋ Записать посадку","Log planting":"Записать посадку","Manage photos":"Управление фотографиями","Seller's photo of named cultivar":"Фото сорта от продавца","Photo of named cultivar":"Фотография указанного сорта","One example of this seed blend":"Пример растения из этой смеси","No exact variety photo verified":"Точная фотография сорта не подтверждена","Named seed-packet photo (not growing carrots)":"Фото упаковки семян (не растущей моркови)","Growing Planner":"Планировщик выращивания","Garden Workbench":"Учёт садовых работ","Recipe Guide":"Сборник рецептов","Monastery Garden":"Монастырский сад","Garden Watering Manager":"Учёт полива сада","Track sowing, sprouting, transplanting and harvests. Entries and photos are stored in this browser, not automatically synced to GitHub or other devices. Export a backup to keep them safe.":"Записывайте посев, всходы, пересадки и урожай. Записи и фотографии хранятся в браузере, а не синхронизируются автоматически. Сохраняйте резервные копии.","Only choose a specific seed if you know it was planted. Reference pictures alone do not identify a variety.":"Выбирайте конкретный сорт, только если знаете, что именно он был посеян. По одной фотографии нельзя надёжно определить сорт.","Link exact variety from my Seed Bank":"Связать с точным сортом из коллекции","Clear search":"Очистить поиск","Clear entire search":"Очистить весь поиск","UAF · Alaska greenhouse gardening":"Университет Аляски: выращивание в теплице","⚠️ Why Caution:":"⚠️ Почему нужна осторожность:","⚠️ Caution: what is dangerous and what to do":"⚠️ Опасность растения и меры предосторожности","View full seed card and picture settings":"Открыть карточку семян и настройки фотографий","View photo for":"Просмотреть фото:","Add / replace plant photo":"Добавить или заменить фото растения","Add / replace packet photo":"Добавить или заменить фото упаковки","Your garden records stay in this browser. Use":"Данные о саде хранятся в этом браузере. Используйте","No photo available":"Фото недоступно","Photo by":"Автор фотографии:","Unknown":"Неизвестно","Not specified":"Не указано","Not recorded":"Не записано","Quantity not recorded":"Количество не записано","Edit planting":"Изменить посадку","Save planting":"Сохранить посадку","Date germinated":"Дата прорастания","Seeds germinated":"Проросло семян","Plants survived":"Выжило растений","No seed lots recorded yet. Add one above to track actual seed counts.":"Партии семян пока не добавлены. Добавьте партию выше для учёта количества.","No garden beds or containers created yet.":"Грядки и контейнеры пока не добавлены.","No harvests recorded yet.":"Записей об урожае пока нет.","No active planting records. Use the Planting Journal to record what you actually sowed; every seed card already has a watering guide.":"Активных посадок пока нет. Запишите фактические посевы в журнал. Инструкция по поливу доступна для каждого растения.","No watering or moisture checks recorded yet.":"Записей о поливе и проверках влажности пока нет.","Check soil today":"Проверить почву сегодня","No check recorded":"Проверок пока нет","Next check":"Следующая проверка","First record an actual planting in the Planting Journal. Watering records attach to that planting, not merely to an unused seed packet.":"Сначала запишите посадку в журнал. Учёт полива связан с фактической посадкой, а не просто с пакетом семян.","Added":"Добавлено","No matching records":"Нет подходящих записей","Try another name or clear filters.":"Введите другое название или сбросьте фильтры.","Not recorded in your collection":"Нет в вашей коллекции","No entries match these filters":"Ничего не найдено по выбранным фильтрам"}))dictionary.set(en,rus);

const replacements=[
[/\b(\d+)\s+packets?\b/gi,(_,n)=>n+" "+ruCount(n,"пакет","пакета","пакетов")],
[/\b(\d+)\s+bags?\b/gi,(_,n)=>n+" "+ruCount(n,"пакет","пакета","пакетов")],
[/\b(\d+)\s+saved lots?\b/gi,(_,n)=>n+" "+ruCount(n,"партия","партии","партий")+" сохранённых семян"],
[/\b(\d+)\s+entries\b/gi,"$1 записей"],
[/\b(\d+)\s+units\b/gi,"$1 единиц"],
[/\b(\d+)\s+categories\b/gi,"$1 категорий"],
[/\b(\d+)\s+known\b/gi,"$1 учтено"],
[/\b(\d+)\s+recorded plantings\b/gi,"$1 записанных посадок"],
[/\b(\d+)\s+plants?\b/gi,"$1 растений"],
[/\b(\d+)\s+seeds?\b/gi,"$1 семян"],
[/\b(\d+)\s+days?\b/gi,"$1 дней"],
[/\b(\d+)\s+weeks?\b/gi,"$1 недель"],
[/\b(\d+)\s+months?\b/gi,"$1 месяцев"],
[/\b(\d+)\s+years?\b/gi,"$1 лет"],
[/\b(\d+)\s+in\b/gi,"$1 дюйма"],
[/\b(\d+)\s+ft\b/gi,"$1 фута"],
[/\bperennial\b/gi,"многолетник"],[/\bannual\b/gi,"однолетник"],[/\bbiennial\b/gi,"двулетник"],
[/\bfull sun\b/gi,"полное солнце"],[/\bpartial shade\b/gi,"полутень"],[/\blight shade\b/gi,"лёгкая тень"],
[/\bdeep shade\b/gi,"глубокая тень"],[/\bbright light\b/gi,"яркий свет"],
[/\bwell.drained\b/gi,"хорошо дренированный"],[/\boutdoor\b/gi,"открытый грунт"],[/\bindoor\b/gi,"в помещении"],
[/\bseedlings?\b/gi,"рассада"],[/\bgermination\b/gi,"прорастание"],
[/\bnot recorded\b/gi,"не записано"],[/\bnot specified\b/gi,"не указано"],
[/\bnot confirmed\b/gi,"не подтверждено"],[/\bunknown\b/gi,"неизвестно"],
[/\bcheck soil\b/gi,"проверьте влажность почвы"],[/\bsoil\b/gi,"почва"],[/\bwater\b/gi,"полив"],
[/\bsource\b/gi,"источник"]
];
function generalTranslation(value){
 const raw=String(value||""),txt=raw.trim();if(!txt)return raw;
 if(dictionary.has(txt))return raw.replace(txt,dictionary.get(txt));
 const mixed=dkDynamic(txt);if(mixed!==txt)return raw.replace(txt,mixed);
 if(/^(\d+)\s*(packets?|batch|batchs|batches|lots?|bags?)$/.test(txt)){
  const m=txt.match(/^(\d+)\s*(packets?|batch|batchs|batches|lots?|bags?)$/);
  const kind=m[2],isPacket=/^packet|^bag/.test(kind),isLot=/^lot/.test(kind);
  return m[1]+" "+(isPacket?ruCount(m[1],"пакет","пакета","пакетов"):ruCount(m[1],"партия","партии","партий"))+(isLot?" семян":"");
 }
 if(/^Showing \d+ of \d+ seed entries\b/.test(txt)){
  return txt.replace(/^Showing (\d+) of (\d+) seed entries/,"Показано $1 из $2 записей")
  .replace(/packets?/gi,"пакетов").replace(/bags?/gi,"мешков").replace(/saved seed lots?/gi,"собранных партий семян").replace(/known packets \/ lots/gi,"учтённых пакетов / партий").replace(/categories/gi,"категорий").replace(/count\(s\) unconfirmed/gi,"количество не подтверждено");
 }
 if(/^\d+\s+historical crop-type entries/.test(txt))return txt.replace("historical crop-type entries","исторических типов культур").replace("later/New World entries","поздних или американских культур").replace("unverified or other entries","неподтверждённых и прочих культур");
 if(/^\d+\s+active varieties/.test(txt)||/^\d+\s+active planting records/.test(txt)||/^\d+\s+watering\/history records/.test(txt)){
  return txt.replace("active varieties","активных сортов").replace("active planting records","активных посадок").replace("watering/history records","записей полива").replace("plantings","посадок").replace("garden spaces","мест выращивания").replace("harvests","урожаев").replace("germination tests","проверок всхожести").replace("checks due or past suggested date","проверок почвы пора выполнить").replace("without a moisture check","без проверки почвы");
 }
 if(/^(?:No check recorded|Next check \d|Check soil today)/.test(txt))return txt.replace("No check recorded","Проверок ещё нет").replace("Next check","Следующая проверка").replace("Check soil today","Проверить почву сегодня");
 if(/^Last:/.test(txt))return txt.replace("Last:","Последняя запись:").replace("checked","проверена").replace("watered","полито").replace("rain","дождь").replace("skipped","без полива");
 if(/^Check soil every|^Check every|^Check shaded root|^Check the|^Usually|^Often|^Typically|^Maintain|^Keep |^Avoid /.test(txt))return "Учитывайте состояние почвы, стадию роста, осадки и температуру; подробности см. в русскоязычных рекомендациях ниже.";
 if(/^Calendar:/.test(txt))return "Календарь: укажите дату последнего заморозка для расчёта посева.";
 if(/^Guide/.test(txt))return "Рекомендации по выращиванию.";
 if(/^No active planting records/.test(txt))return "Активных посадок пока нет. Запишите посев в журнал, чтобы вести учёт полива.";
 if(/^No watering or moisture checks recorded yet/.test(txt))return "Пока нет записей о поливе и влажности почвы.";
 if(/^Saved\. The next date/.test(txt))return "Запись сохранена. Следующая дата означает проверку почвы, а не обязательный полив.";
 if(/^Record a real planting/.test(txt)||/^First record an actual planting/.test(txt))return "Сначала внесите реальную посадку в журнал. Учёт полива привязан к посаженному растению.";
 if(/^No exact linked planting/.test(txt))return "У этого сорта ещё нет связанной посадки. Сначала добавьте её в журнал.";
 if(/^You still need to obtain or prepare/.test(txt))return "Остались ингредиенты, которые нужно получить или подготовить.";
 if(/^All ingredients marked on hand/.test(txt))return "Все ингредиенты отмечены в наличии. Перед использованием подтвердите свежесть, вид и безопасность.";
 if(/^Not found in the seed bank:/.test(txt))return txt.replace(/^Not found in the seed bank:/,"Не найдено в коллекции:");
 if(/^Other supplies not marked on hand:/.test(txt))return txt.replace(/^Other supplies not marked on hand:/,"Прочие продукты не отмечены в наличии:");
 if(/^Your seed records:/.test(txt))return txt.replace(/^Your seed records:/,"Записанные семена:");
 if(/^Record planting for/.test(txt))return "Записать посадку";
 let result=txt;
 for(const [re,to]of replacements)result=result.replace(re,to);
 return result;
}
function noteFor(p){
 const n=p.name;
 const specific={
 "Blue Flax":"Точное ботаническое название пока не подтверждено: голубым льном называют Linum perenne и Linum lewisii. Не путайте с посевным льном для тканей (Linum usitatissimum). Лучше всего растёт на солнце в бедной, хорошо дренированной почве.",
 "Panax Ginseng (species unverified)":"Два пакета с надписью Panax. Род указан, но точный вид пока неизвестен. Для посадки требуется уточнить ботаническое название.",
 "Lemon Mint / Lemon Bergamot":"Три пакета объединены: два «Lemon Mint» и один «Lemon Bergamot». Обычно оба названия относятся к Monarda citriodora. Уточните вид по этикетке.",
 "English / True Lavender":"Шесть пакетов объединены: два с надписью «English Lavender» и четыре «True Lavender». Обычно это Lavandula angustifolia. Проверьте этикетки.",
 "American Ginseng":"Американский женьшень, Panax quinquefolius. Лесное теневыносливое растение; семенам часто требуется длительный период покоя.",
 "Pennyroyal Mint":"Вид мяты требует проверки. Эфирное масло пулегия очень токсично; растение нельзя использовать для самолечения.",
 "Blue Camas":"Проверьте вид камассии. Её луковицы можно спутать со смертельно ядовитой «death camas»; не употребляйте неопознанные луковицы.",
 "Comfrey":"Окопник содержит пирролизидиновые алкалоиды, способные повредить печень. Не используйте внутрь.",
 "St. John's Wort":"Зверобой может серьёзно взаимодействовать со многими лекарствами, включая антидепрессанты и контрацептивы.",
 "Pyrethrum Daisy":"Пиретрум содержит природные инсектицидные пиретрины. Концентрированные препараты опасны для кошек и водных животных.",
 "Bishop's Flower":"Амми большая: сок на коже под воздействием солнца может вызвать сильное раздражение и ожоги.",
 "Giant Bamboo":"Вид не установлен. Некоторые гигантские бамбуки быстро распространяются корневищами; сначала установите вид и характер роста.",
 "Milk Thistle":"Четыре пакета расторопши пятнистой. Листья и соцветия колючие; учитывайте аллергию и лекарственные взаимодействия."
 };
 if(specific[n])return specific[n];
 const v=seedName(n,p.cat);
 return "Исходная упаковка: «"+n+"». "+v+". Точное название сорта, особенности и пригодность к употреблению уточняйте по этикетке и инструкциям ниже.";
}
const hazards={
 "Red Kidney Beans":["Сырая и недоваренная красная фасоль содержит токсичный лектин, вызывающий тяжёлые нарушения пищеварения.","Замачивайте сушёную фасоль, сливайте воду и тщательно кипятите в свежей воде; медленноварка без полноценного кипячения небезопасна.","Все, кто ест фасоль; особенно дети."],
 "Boxwood":["Самшит содержит токсичные вещества; при проглатывании может вызвать отравление.","Не используйте растение как пищу или лекарство. Не допускайте поедания детьми и животными.","Дети, домашние животные и люди, принимающие самодельные препараты."],
 "English Ivy":["Плющ токсичен при проглатывании; сок может раздражать кожу.","Не ешьте листья, работайте в перчатках и учитывайте способность растения разрастаться.","Дети, домашние животные и люди с чувствительной кожей."],
 "American Elderberry":["Незрелые ягоды, листья и стебли бузины могут вызвать отравление.","Используйте только правильно определённые, полностью зрелые и безопасно приготовленные ягоды; другие части не употребляйте.","Дети, домашние животные и люди, которые едят сырую бузину."],
 "Garden Huckleberry":["Неопознанные паслёновые и незрелые плоды могут быть токсичны.","Подтвердите вид; не ешьте незрелые ягоды и не используйте непроверенные рецепты.","Дети, домашние животные и собиратели."],
 "Pokeberry (Phytolacca americana)":["Лаконос ядовит: особенно корни и семена, но и другие части могут вызвать тяжёлое отравление.","Не употребляйте без компетентной идентификации и профессиональной оценки. Храните вдали от детей.","Дети, животные и люди, использующие самодельные травяные смеси."],
 "Afghan Poppy":["Сорт мака и содержание алкалоидов не подтверждены; возможны токсичность и правовые ограничения.","Не готовьте препараты и не ешьте неизвестные части мака. Уточняйте ботанический вид и местные требования.","Дети, животные и люди, использующие мак без подтверждения вида."],
 "Giant Exotic Poppy (Papaver somniferum)":["Мак снотворный содержит опиоидные алкалоиды в отдельных частях растения.","Не готовьте домашние экстракты или настои из коробочек и стеблей; учитывайте местные ограничения.","Дети, животные и люди, использующие непроверенные препараты."],
 "Lily of the Valley (Convallaria majalis)":["Ландыш содержит сердечные гликозиды; все части ядовиты.","Не ешьте растение и не используйте в домашних лекарствах; не путайте листья с черемшой.","Дети, животные и люди с болезнями сердца."],
 "Rue":["Рута может вызвать светочувствительность и химическое раздражение кожи; приём внутрь опасен.","Работайте в перчатках, избегайте контакта с соком и солнцем; не используйте при беременности.","Беременные, дети и люди с чувствительной кожей."],
 "Herb of Paris (Paris quadrifolia)":["Вороний глаз ядовит; ягоды и другие части растения могут вызвать отравление.","Не употребляйте и не допускайте случайного сбора ягод.","Дети, животные и собиратели ягод."],
 "Henbane (species unspecified)":["Белена содержит сильнодействующие тропановые алкалоиды, опасные для жизни.","Не прикасайтесь к лицу после работы с растением; не ешьте и не делайте настойки.","Дети, животные и любые потребители растения."],
 "Foxglove (species unspecified)":["Наперстянка содержит сердечные гликозиды; даже небольшое количество может быть опасно.","Не употребляйте и не делайте лекарства самостоятельно; храните отдельно от съедобной зелени.","Дети, животные и люди с нарушениями сердечного ритма."],
 "Deadly Nightshade / Belladonna (Atropa belladonna)":["Белладонна смертельно ядовита из-за тропановых алкалоидов.","Не употребляйте никакие части и не позволяйте детям или животным контактировать с ягодами.","Дети, домашние животные и люди, собирающие неизвестные ягоды."],
 "Virginia Gold Tobacco (Nicotiana tabacum)":["Табак содержит никотин, который токсичен при проглатывании и может всасываться через влажную кожу.","Надевайте перчатки при работе с мокрыми листьями, не используйте как пищу и держите подальше от детей.","Дети, домашние животные и работники с влажной листвой."],
 "Wild Jungle Peanut (Arachis hypogaea)":["Арахис вызывает опасные аллергические реакции у чувствительных людей; плохо высушенные орехи могут заплесневеть.","Не употребляйте при аллергии; храните урожай сухим и отбрасывайте заплесневелые орехи.","Люди с аллергией на арахис, дети и потребители плохо хранившегося урожая."],
 "American Ginseng":["Женьшень может менять уровень сахара в крови и взаимодействовать с лекарствами; дикие популяции могут охраняться.","Не лечитесь корнями самостоятельно; проверьте совместимость с лекарствами и правила сбора.","Люди, принимающие лекарства, особенно от диабета или для разжижения крови; дети."],
 "Panax Ginseng (species unverified)":["Panax обозначает род, но не точный вид; взаимодействия лекарственных препаратов могут различаться.","Проверьте вид по упаковке; не принимайте корни и экстракты без консультации специалиста.","Беременные, дети и люди на лекарственной терапии."],
 "Pennyroyal Mint":["Эфирное масло болотной мяты содержит пулегон и способно вызвать тяжёлое поражение печени и смерть.","Не принимайте масло или настои внутрь и не используйте для самолечения; особенно опасно при беременности.","Беременные, дети, животные и пользователи эфирных масел."],
 "Milk Thistle":["Листья расторопши колючие; возможны аллергия и взаимодействия добавок с лекарствами.","Работайте в перчатках; не принимайте экстракты без проверки лекарственных взаимодействий.","Люди с аллергией на сложноцветные и принимающие лекарства."],
 "Blue Camas":["Камассию можно перепутать с ядовитой «death camas»; ошибка при употреблении луковиц смертельно опасна.","Выращивайте как декоративное растение; не ешьте луковицы без экспертного определения вида.","Дети, животные и люди, собирающие дикие луковицы."],
 "Borage":["Огуречная трава может содержать пирролизидиновые алкалоиды, повреждающие печень.","Не используйте растение и концентраты для самолечения; ограничивайте пищевое использование.","Беременные, люди с болезнями печени и пользователи экстрактов."],
 "Comfrey":["Окопник содержит пирролизидиновые алкалоиды, опасные для печени.","Не готовьте настои и внутренние препараты; не наносите на повреждённую кожу.","Дети, беременные и люди с болезнями печени."],
 "White Yarrow":["Тысячелистник способен вызывать аллергические кожные реакции.","Надевайте перчатки при раздражении; избегайте самодельных медицинских средств.","Люди с аллергией на ромашковые растения."],
 "St. John's Wort":["Зверобой взаимодействует со множеством лекарств и может снижать действие контрацептивов; сочетание с антидепрессантами опасно.","Не принимайте зверобой одновременно с лекарствами без консультации фармацевта.","Люди на медикаментозном лечении, особенно антидепрессантами."],
 "Calendula Pacific Beauty":["Календула может вызывать реакции у людей с аллергией на семейство астровых.","Не считайте декоративные цветы автоматически съедобными; проверьте вид и наличие обработки пестицидами.","Люди с аллергией на ромашку и амброзию."],
 "Toothache Plant (Spilanthes oleracea)":["Соцветия акмеллы вызывают покалывание и временное онемение во рту, иногда раздражение.","Не заменяйте этим стоматологическую помощь; не наносите экстракты на глаза и раны.","Дети и люди с чувствительной слизистой."],
 "Pyrethrum Daisy":["Пиретрум содержит инсектицидные пиретрины; концентраты особенно опасны для кошек и рыб.","Не делайте самодельные концентраты и не применяйте их у аквариумов и рядом с кошками.","Кошки, рыбы, водные беспозвоночные и люди с аллергией."],
 "Bishop's Flower":["Сок амми может вызвать болезненные ожоги кожи при воздействии солнечного света.","Работайте в перчатках и длинной одежде; смойте сок и избегайте солнца после контакта.","Садоводы, особенно с чувствительной кожей."],
 "Stinging Nettle":["Волоски свежей крапивы вызывают жжение, зуд и волдыри.","Используйте плотные перчатки и длинные рукава; избегайте касания голой кожей.","Дети, животные и все, кто касается растения."],
 "Blue Agave":["Агава имеет острые шипы; сок может раздражать глаза и кожу.","Используйте перчатки и защиту глаз, не размещайте острые листья у проходов.","Садоводы, дети и животные."],
 "German Chamomile":["Ромашка может вызвать аллергию, особенно при реакции на амброзию и другие астровые.","Избегайте чаёв и косметики при аллергии; проверьте взаимодействия с лекарствами.","Люди с аллергией на астровые и принимающие лекарства."],
 "Passion Flower":["У разных видов пассифлоры разные безопасные части; экстракты могут усиливать седативное действие лекарств.","Определите точный вид и не употребляйте неопознанные части; не сочетайте настои с седативными средствами.","Беременные, дети и люди, принимающие снотворные."],
 "Giant Bamboo":["Некоторые виды гигантского бамбука быстро распространяются корневищами и выходят за пределы участка.","Уточните вид: кустовой или ползучий; для ползучих используйте подходящий барьер.","Владельцы соседних участков и садоводы."],
 "Valerian":["Валериана может усиливать сонливость и действие снотворных, успокоительных и алкоголя.","Не смешивайте препараты с седативными средствами и не занимайтесь самолечением.","Водители, беременные, дети и люди, принимающие снотворные."]
};
function lightRU(s){
 let t=String(s||"");
 t=t.replace(/full sun/gi,"полное солнце").replace(/partial shade/gi,"полутень").replace(/part shade/gi,"полутень").replace(/deep shade/gi,"глубокая тень").replace(/light shade/gi,"лёгкая тень").replace(/bright light/gi,"яркий свет").replace(/cool sun/gi,"прохладное солнце").replace(/shade/gi,"тень").replace(/bright/gi,"яркий");
 return t;
}
function numberRU(s){
 const value=String(s||"").replace(/\bto\b/g,"–").replace(/([¼½¾⅛⅜⅝⅞])\s*in\b/gi,"$1 дюйма");
 return generalTranslation(value);
}
function growingRules(p,g){
 const cat=p.cat,n=p.name.toLowerCase();
 const cold=/Peppers|Tomatoes|Eggplant|Pumpkins and melons|Gourds and squash/.test(cat)||/stevia|agave|tropical|passion flower|peanut/.test(n);
 const woodland=/ginseng|woodland|lily of the valley/.test(n);
 const succulent=/agave|haworthia/.test(n);
 const dry=/lavender|thyme|oregano|marjoram|wormwood|rosemary|blue flax|pyrethrum|yarrow|fescue/.test(n);
 const direct=/Carrots|Roots and brassicas|Beans and legumes|Grains and grasses/.test(cat)&&!/pea /i.test(n);
 let when=cold?"Начните посев в помещении за 6–10 недель до окончания весенних заморозков; высаживайте после устойчивого потепления.":direct?"Сейте сразу в грунт в подходящий сезон, когда температура почвы отвечает потребностям культуры.":"Высевайте весной или осенью в соответствии с холодостойкостью растения; при необходимости начните рассаду заранее.";
 if(woodland)when="Для лесных видов учитывайте естественную стратификацию семян; прорастание иногда занимает больше одного сезона.";
 if(succulent)when="Сейте в тепле в защищённых условиях, избегайте холодной влажной почвы.";
 const where=woodland?"Тенистая грядка с богатым листовым перегноем и хорошим дренажем.":succulent?"Тёплый контейнер с очень рыхлой минеральной почвой и быстрым оттоком воды.":dry?"Солнечное место с бедной или умеренно плодородной, хорошо дренированной почвой.":cold?"Тёплая плодородная грядка, горшок или теплица; беречь от заморозков.":"Подходящая по освещению грядка или контейнер с рыхлой почвой и дренажем.";
 const harvest=g&&g.days?"Ориентир по срокам: "+numberRU(g.days)+". Проверяйте фактическую зрелость растения и описание на упаковке.":"Сроки зависят от культуры и условий; следите за зрелостью.";
 const alaska=g&&g.setup==="heated"?"В холодных районах необходим обогреваемый парник или помещение.":g&&g.setup==="protected"?"В холодном климате полезна теплица или другое укрытие.":"Сверяйтесь с местными заморозками и зимостойкостью вида.";
 return {when,where,harvest,alaska};
}
const waterRU=[
["Check soil every 2–3 days during active growth","Проверяйте каждые 2–3 дня в период роста.","Обычно около 25 мм воды в неделю с учётом дождя; в жару может понадобиться до 50 мм."],
["Check soil every 1–3 days while fruit is forming","Во время формирования плодов проверяйте почву каждые 1–3 дня.","Ориентир 25–50 мм воды в неделю вместе с осадками."],
["Check soil every 1–2 days in warm weather","В тёплую погоду проверяйте почву каждые 1–2 дня.","Обычно около 25–38 мм воды в неделю с учётом осадков."],
["Check soil every 2–3 days until roots establish; then every 3–4 days","До укоренения проверяйте каждые 2–3 дня, затем каждые 3–4 дня.","Обычно около 25 мм в неделю вместе с дождём."],
["Check every 2–3 days in cool growing weather","В прохладную погоду проверяйте каждые 2–3 дня.","Обычно около 25 мм воды в неделю вместе с дождём."],
["Check soil every 2–4 days, more often in hot weather","Проверяйте каждые 2–4 дня; чаще при сильной жаре.","Около 25 мм в неделю, иногда больше во время цветения."],
["Check soil every 2–4 days in warm weather","В тёплую погоду проверяйте каждые 2–4 дня.","Около 25–38 мм в неделю при образовании завязей и плодов."],
["Check soil every 2–3 days, especially in summer","Летом проверяйте каждые 2–3 дня.","Обычно 25–38 мм в неделю; в жару до 50 мм."],
["Check every 2–3 days while vines and fruit grow","При росте плетей и плодов проверяйте каждые 2–3 дня.","Обычно 25–50 мм в неделю с учётом дождя."],
["Check every 2–4 days during active growth and fruiting","При росте и плодоношении проверяйте каждые 2–4 дня.","Многим ягодным кустарникам нужно 25–50 мм в неделю, но нормы зависят от вида."],
["Check every 1–3 days during warm fruiting weather","В тёплое время плодоношения проверяйте каждые 1–3 дня.","Примерно 25–38 мм воды в неделю вместе с осадками."],
["Check every 1–3 days; containers dry faster","Проверяйте каждые 1–3 дня; горшки высыхают быстрее.","В грунте около 25 мм в неделю; горшки поливайте по сухости субстрата."],
["Check every 2–3 days during warm active growth","Проверяйте каждые 2–3 дня в тёплый период роста.","В грунте ориентир около 25 мм в неделю; в контейнерах по влажности почвы."],
["Check soil every 4–7 days after establishment, less often in cool periods","После укоренения проверяйте каждые 4–7 дней, реже в прохладу.","Часто достаточно 12–25 мм воды или меньше; поливайте только при подсыхании."],
["Check every 5–7 days in active growth, less often once well rooted","Во время роста проверяйте каждые 5–7 дней; укоренившуюся лаванду ещё реже.","Постоянная недельная норма не нужна: дождитесь подсыхания почвы."],
["Check every 7–14 days in the warm season; much less during cool dormancy","В тёплый сезон проверяйте каждые 7–14 дней; во время покоя ещё реже.","Поливайте обильно, но только после значительного просыхания грунта."],
["Check shaded root zone every 2–4 days in active growth","В период роста проверяйте затенённую корневую зону каждые 2–4 дня.","Поддерживайте умеренную влажность рыхлой лесной почвы без застоя воды."],
["Check every 4–7 days in spring growth; little or no irrigation during dry dormancy","Весной проверяйте каждые 4–7 дней; во время сухого летнего покоя почти не поливайте.","Весной нужна влажная почва, летом луковицы могут уходить в покой."],
["Check every 2–4 days while actively growing","Во время роста проверяйте каждые 2–4 дня.","Обычно около 25 мм воды в неделю с учётом дождя."],
["Check every 4–7 days once rooted","После укоренения проверяйте каждые 4–7 дней.","Засухоустойчивым цветам обычно нужен лишь дополнительный полив в засуху."],
["Check every 3–7 days while young; established trees are watered much less often","Пока дерево молодое, проверяйте каждые 3–7 дней; взрослые деревья поливают реже.","Молодым деревьям нужен редкий глубокий полив при засухе; нормы зависят от породы."],
["Check every 2–4 days in the warm growing season","В тёплое время проверяйте каждые 2–4 дня.","Поливайте умеренно в хорошо дренированной почве; объём зависит от вида."],
["Check every 3–5 days when establishing and during seed-head development","При укоренении и наливе зерна проверяйте каждые 3–5 дней.","Ориентир около 25 мм в неделю в период роста; потребности видов различаются."]
];
const waterMap=new Map(waterRU.map(([en,how,amt])=>[en,{how,amt}]));
function appendRuGuides(){
 core.plants().forEach(p=>{
  const card=p.card,guide=card.querySelector(".plant-guide"),waterGuide=card.querySelector(".water-guidance");
  if(guide&&!guide.querySelector(".dk-ru-growing")){
   const g=core.guideFor(p.name,p.cat),rule=growingRules(p,g),pdiv=document.createElement("div");pdiv.className="dk-ru-growing";pdiv.setAttribute("data-dk-ru","yes");
   pdiv.innerHTML='<h4>Посадка и выращивание</h4>'+
   '<p><strong>Глубина:</strong> '+esc(numberRU(g.depth))+' · <strong>Расстояние:</strong> '+esc(numberRU(g.spacing))+'</p>'+
   '<p><strong>Свет:</strong> '+esc(lightRU(g.light))+' · <strong>Прорастание:</strong> '+esc(numberRU(g.germ))+'</p>'+
   '<p><strong>Температура почвы:</strong> '+esc(g.soil)+' · <strong>Срок развития:</strong> '+esc(numberRU(g.days))+'</p>'+
   '<p><strong>Когда сеять:</strong> '+esc(rule.when)+'</p><p><strong>Где сажать:</strong> '+esc(rule.where)+'</p>'+
   '<p><strong>Для Аляски и холодных районов:</strong> '+esc(rule.alaska)+'</p>'+
   '<p><strong>Сроки сбора:</strong> '+esc(rule.harvest)+'</p>'+
   '<p><strong>Важная пометка:</strong> '+esc(noteFor(p))+'</p>'+
   '<p>Это общие рекомендации. Сверяйте вид, сорт и сроки с оригинальной упаковкой и местными условиями.</p>';
   guide.insertAdjacentElement("afterbegin",pdiv);
  }
  if(waterGuide&&!waterGuide.querySelector(".dk-ru-water")){
   const pr=water?water.guideFor(p.name,p.cat):null,m=pr?waterMap.get(pr.frequency):null;
   const div=document.createElement("div");div.className="dk-ru-water";div.setAttribute("data-dk-ru","yes");
   const how=m?m.how:"Проверяйте почву по мере роста, а не по жёсткому графику.";
   const amount=m?m.amt:"Поливайте по влажности корневой зоны, размеру контейнера и погоде.";
   div.innerHTML='<h4>💧 Полив: '+esc(seedName(p.name,p.cat))+'</h4>'+
   '<p><strong>Как часто:</strong> '+esc(how)+' При необходимости поливайте только после проверки земли.</p>'+
   '<p><strong>Сколько:</strong> '+esc(amount)+'</p>'+
   '<p><strong>Посев:</strong> Ежедневно следите, чтобы верхний слой с семенами не пересыхал. Не заливайте посевы.</p>'+
   '<p><strong>Молодые растения:</strong> Поддерживайте умеренную влажность, пока не разовьются корни; избегайте застоя воды.</p>'+
   '<p><strong>Взрослые растения:</strong> Проверьте грунт на глубине 2–5 см, затем поливайте корневую зону по необходимости.</p>'+
   '<p><strong>Цветение и плоды:</strong> Не допускайте сильной засухи в период формирования бутонов и плодов, кроме видов с естественным сухим периодом покоя.</p>'+
   '<p><strong>Переувлажнение:</strong> Застой воды, мокрая почва и плохой дренаж вызывают проблемы с корнями.</p>'+
   '<p><strong>Контейнеры, жара и осадки:</strong> Горшки и теплицы проверяйте чаще в жару, учитывайте дождь; песчаная почва высыхает быстрее глинистой.</p>'+
   '<button type="button" data-wm-seed="'+esc(p.key)+'">Записать полив этой посадки</button>';
   waterGuide.appendChild(div);
  }
  const hazard=card.dataset.tags.split("|").includes("Caution");
  if(hazard){
   const msg=hazards[p.name]||["У этого растения есть риск отравления, раздражения или опасной путаницы видов.","Не употребляйте до подтверждения точного вида; соблюдайте рекомендации по безопасности и держите вне доступа детей и животных.","Дети, животные и люди, использующие неопознанные растения."];
   const summary=card.querySelector(".seed-caution-summary"),detail=card.querySelector(".seed-safety-details");
   for(const [host,full]of [[summary,false],[detail,true]]){
    if(!host||host.querySelector(".dk-ru-safety"))continue;
    const block=document.createElement("div");block.className="dk-ru-safety";block.setAttribute("data-dk-ru","yes");
    const link=detail&&detail.querySelector(".safety-ref a");
    block.innerHTML='<p><strong>⚠️ Опасность:</strong> '+esc(msg[0])+'</p><p><strong>Как обезопасить себя:</strong> '+esc(msg[1])+'</p>'+
       (full?'<p><strong>Кому угрожает:</strong> '+esc(msg[2])+'</p>'+(link?'<p><a href="'+esc(link.href)+'" target="_blank" rel="noopener noreferrer">Источник по безопасности</a></p>':""):"");
    host.appendChild(block);
   }
  }
  card.dataset.ruName=dkSeedDisplay(p.name,p.cat);
  card.dataset.ruCategory=ruCategories[p.cat]||p.cat;
 });
}
const originals=new WeakMap(), translatedLast=new WeakMap(),attrStore=new WeakMap(),attrLast=new WeakMap();
let language="en",observer=null,scheduled=false;
function isOwn(node){return node&&node.nodeType===1&&node.closest&&node.closest("[data-dk-ru]");}
function translateText(value,el){
 if(!el||!String(value||"").trim())return value;
 if(el.closest("[data-dk-ru],[data-dk-no-translate]"))return value;
 const raw=String(value),trim=raw.trim();
 const seed=el.closest(".seed"),p=seed&&core.plants().get(seed.dataset.category+"|"+seed.dataset.name);
 let out=trim;
 if(el.classList.contains("seed-name")&&seed)out=dkSeedDisplay(seed.dataset.name,seed.dataset.category);
 else if(el.tagName==="IMG"&&seed)out="Фото: "+dkSeedDisplay(seed.dataset.name,seed.dataset.category);
 else if(el.classList.contains("entry-note")&&p)out=dkCyrillic(noteFor(p));
 else if(el.classList.contains("seed-brief")&&p)out="Глубина посева: "+numberRU(p.guide.depth)+" · "+lightRU(p.guide.light);
 else if(el.classList.contains("seed-photo-state"))out=dictionary.get(trim)||"Иллюстрация растения. Уточните соответствие сорту.";
 else if(el.matches(".journal-entry h3"))out=dkCyrillic(trim);
 else if(el.matches(".wm-due-row strong,#wmSelectedGuide strong"))out=dkCyrillic(trim);
 else if(el.classList.contains("category-name"))out=ruCategories[trim]||trim;
 else if(el.classList.contains("category-count")||el.classList.contains("stock-badge"))out=generalTranslation(trim);
 else if(el.tagName==="OPTION"&&trim.includes(" · ")){
  const [category,...name]=trim.split(" · ");
  const originalName=name.join(" · "),item=[...core.plants().values()].find(z=>z.name===originalName&&z.cat===category);
  out=(ruCategories[category]||category)+" · "+(item?dkSeedDisplay(item.name,item.cat):dkCyrillic(originalName));
 }else if(el.tagName==="OPTION"&&exactNames[trim])out=dkCyrillic(exactNames[trim]);
 else if(el.tagName==="OPTION"&&ruCategories[trim])out=ruCategories[trim];
 else if(dictionary.has(trim))out=dictionary.get(trim);
 else out=generalTranslation(trim);
 if(out===trim&&el.closest(".seed")&&/^[\w\s,.'’\-()/:;]{2,110}$/.test(trim))out=dkCyrillic(trim);
 if(out===trim)return value;
 return raw.replace(trim,out);
}
function translateAttribute(el,key){
 const raw=el.getAttribute(key);if(raw===null||!raw||isOwn(el))return;
 let store=attrStore.get(el)||{},last=attrLast.get(el)||{};
 if(language==="en"){
  if(Object.prototype.hasOwnProperty.call(store,key)){el.setAttribute(key,store[key]);delete store[key];delete last[key];attrStore.set(el,store);attrLast.set(el,last);}
  return;
 }
 if(last[key]===raw)return;
 const translated=translateText(raw,el);
 if(translated!==raw){store[key]=raw;last[key]=translated;attrStore.set(el,store);attrLast.set(el,last);el.setAttribute(key,translated);}
}
function translateNode(node){
 if(!node||node.nodeType!==3||!node.parentElement)return;
 const el=node.parentElement;
 if(/SCRIPT|STYLE|NOSCRIPT|TEXTAREA/.test(el.tagName)||isOwn(el)||el.closest("code,pre"))return;
 const current=node.nodeValue;
 if(language==="ru"){
  if(translatedLast.get(node)===current)return;
  const value=translateText(current,el);
  if(value!==current){originals.set(node,current);translatedLast.set(node,value);node.nodeValue=value;}
 }else if(originals.has(node)){
  node.nodeValue=originals.get(node);originals.delete(node);translatedLast.delete(node);
 }
}
function scan(root){
 if(!root)return;
 const node=root.nodeType===1?root:root.parentElement;
 if(root.nodeType===3){translateNode(root);return;}
 if(!node||isOwn(node))return;
 if(node.nodeType===1){for(const a of ["placeholder","title","aria-label","alt"])translateAttribute(node,a);}
 const walker=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 let current=walker.nextNode(),n=0;
 while(current){
  if(current.nodeType===3)translateNode(current);
  else if(!isOwn(current)){for(const a of ["placeholder","title","aria-label","alt"])translateAttribute(current,a);}
  n++;current=walker.nextNode();
  if(n>250000)break;
 }
}
function schedule(){
 if(language!=="ru"||scheduled)return;
 scheduled=true;queueMicrotask(()=>{scheduled=false;appendRuGuides();scan(document.body);});
}
function changeLang(value,persist=true){
 language=value==="ru"?"ru":"en";
 document.documentElement.lang=language;document.documentElement.dataset.dkLanguage=language;
 selector.value=language;
 
 if(persist){try{localStorage.setItem(STORAGE,language);}catch(e){}}
 if(language==="ru")appendRuGuides();
 scan(document.body);
 document.title=language==="ru"?"ДК Банк семян | Коллекция":"DK Seed Bank | Seed Collection";
 const search=document.getElementById("search");if(search)search.dispatchEvent(new Event("input",{bubbles:true}));
}
selector.addEventListener("change",()=>changeLang(selector.value));
document.addEventListener("dkseedbank:inventorychange",schedule);
document.addEventListener("dkseedbank:journal-rendered",schedule);
document.addEventListener("dkseedbank:monastery-updated",schedule);
observer=new MutationObserver(changes=>{
 if(language!=="ru")return;
 const targets=new Set();
 for(const change of changes){
  if(change.type==="characterData"){targets.add(change.target);}
  else for(const node of change.addedNodes){if(node.nodeType===1||node.nodeType===3)targets.add(node);}
 }
 if(!targets.size)return;
 queueMicrotask(()=>{for(const node of targets)scan(node);});
});
observer.observe(document.body,{childList:true,subtree:true,characterData:true});
let saved="en";try{saved=localStorage.getItem(STORAGE)==="ru"?"ru":"en";}catch(e){}
changeLang(saved,false);
window.DKSeedBankI18n=Object.freeze({setLanguage:changeLang,getLanguage:()=>language,translate:generalTranslation,name:seedName});
})();
