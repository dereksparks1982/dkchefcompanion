
(function(){
"use strict";
let cards=Array.from(document.querySelectorAll(".seed"));
const cats=Array.from(document.querySelectorAll(".category"));
const search=document.getElementById("search");
const storageKey="dk-seed-bank-journal-v1";
const settingsKey="dk-seed-bank-growing-profile-v1";
const journalDeletesKey="dk-seed-bank-journal-deletes-v1";
const field=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){return false;}};
const esc=(v)=>String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const def=(depth,spacing,light,germ,soil,when,where,water,harvest,mode,setup,days,extra)=>({depth,spacing,light,germ,soil,when,where,water,harvest,mode,setup,days,extra:extra||""});
const guides={

 pakChoi:def("¼ in","6–12 in for full-size heads","Full sun / partial shade","5–10 days","50–75°F","Direct sow in cool spring or late summer for fall","Fertile, well-drained bed or container","Keep evenly moist; protect from summer heat","Baby leaves about 25–35 days; full heads 45–60 days","direct-cool","outdoor","25–60 days","Brassica rapa subsp. chinensis. Hot spells and long days can trigger bolting. Canton White Stem has pale, fleshy petioles."),
 chicory:def("¼ in","8–12 in","Full sun / partial shade","7–14 days","55–75°F","Direct sow in cool spring or late summer for autumn greens","Outdoor bed with compost-rich, well-drained soil","Steady moisture reduces bitterness","Young leaves about 45–60 days; mature leaves later","direct-cool","outdoor","45–80 days","Italian dandelion is a leaf chicory (Cichorium intybus), not true dandelion (Taraxacum). Catalogna can be cut repeatedly."),
 purslaneWinter:def("Surface–⅛ in; cover very lightly","4–6 in","Partial shade / cool sun","7–21 days","45–65°F","Sow in early spring or late summer / early autumn","Cool, moist garden bed or container","Keep evenly moist; do not allow germinating seed to dry","Tender leaves about 40–60 days","direct-cool","outdoor","40–60 days","Winter purslane is Claytonia perfoliata (miner's lettuce), not common Portulaca purslane. Can self-seed."),
 chard:def("½ in","8–12 in","Full sun / partial shade","5–14 days","50–85°F","Direct sow 2–4 weeks before last frost and for fall","Fertile outdoor bed or large container","Water consistently to keep leaves tender","Baby leaves about 25–35 days; mature stalks 50–65 days","direct-cool","outdoor","25–65 days","Beta vulgaris (leaf beet). Harvest outside leaves for repeated picking. Ruby Red has red ribs; Large White has broad white ribs."),
 mache:def("¼ in","4–6 in","Full sun / partial shade","7–21 days","40–65°F","Sow in cool early spring or late summer through autumn","Outdoor cool bed or container; avoid hot soil","Moist, well-drained soil; germination slows in warmth","Small rosettes about 45–65 days","direct-cool","outdoor","45–65 days","Mâche / corn salad is Valerianella locusta, not maize. Best flavor and germination in cool weather."),
 fenugreek:def("¼–½ in","4–6 in for greens","Full sun / light shade","5–10 days","60–80°F","Direct sow after the risk of hard frost; repeat for leaf harvests","Sunny garden bed or container with drainage","Water regularly until established; avoid waterlogging","Tender leaves in 25–40 days; dry seeds about 90–120 days","direct-warm","outdoor","25–120 days","Trigonella foenum-graecum (Fabaceae). Edible greens (methi) and aromatic seeds; traditional uses are not medical advice."),
 kale:def("¼–½ in","12–18 in","Full sun / partial shade","5–10 days","50–75°F","Direct sow early spring or late summer for fall","Cool-season fertile bed or large container","Maintain even moisture for tender leaves","Baby leaves 25–35 days; mature leaves about 50–75 days","direct-cool","outdoor","25–75 days","Dwarf Siberian kale can belong to Brassica napus; Black Magic and Winter Red packet identities should be verified."),
 spinach:def("½–1 in","3–6 in","Full sun / partial shade","5–14 days","40–70°F","Direct sow as soil becomes workable in early spring, then late summer","Cool outdoor garden bed","Keep soil moist; use cool-season succession sowing","Baby leaves 25–35 days; mature leaves 40–55 days","direct-cool","outdoor","25–55 days","Bloomsdale Long Standing is a savoy-leaf spinach; hot weather can cause bolting."),
 lettuce:def("⅛–¼ in; shallow cover","6–12 in; heads need more room","Full sun / afternoon shade","4–14 days","45–75°F","Sow in cool spring and again for autumn; protect seedlings from heat","Cool outdoor bed or containers","Keep consistently moist to prevent bitter, tough leaves","Baby leaves in 25–35 days; mature heads around 55–85 days","direct-cool","outdoor","25–85 days","Leaf, romaine, butterhead and crisphead cultivars vary in spacing and maturity. Iceberg heads need a longer cool spell."),
 endive:def("¼ in","8–12 in","Full sun / part shade","5–14 days","55–75°F","Direct sow in cool spring or late summer for fall","Rich, well-drained outdoor soil","Even moisture keeps leaves tender","Approximately 60–85 days","direct-cool","outdoor","60–85 days","Curled Ruffec is Cichorium endivia, not Belgian endive."),
 collard:def("¼–½ in","12–18 in","Full sun / partial shade","5–10 days","50–80°F","Sow early spring or late summer for harvest into cool weather","Compost-rich outdoor bed","Maintain regular moisture","Baby leaves 30–40 days; mature 60–80 days","direct-cool","outdoor","30–80 days","Georgia Southern collards tolerate light frost and can become sweeter in cool weather."),
 cress:def("⅛ in; very light cover","2–4 in","Full sun / partial shade","3–7 days","50–75°F","Succession sow during cool spring or autumn","Outdoor bed or windowsill tray with suitable light","Keep seedbed evenly moist","Young leaves typically 10–20 days","direct-cool","outdoor","10–20 days","Curled garden cress is Lepidium sativum; harvest before stems turn fibrous."),
 arugula:def("¼ in","4–6 in","Full sun / part shade","4–10 days","45–75°F","Sow in early spring or late summer; repeat every few weeks","Cool-season outdoor garden bed","Consistent moisture moderates peppery bitterness","Baby leaves 20–30 days; mature leaves 35–50 days","direct-cool","outdoor","20–50 days","Roquette is arugula (Eruca vesicaria); heat hastens bolting."),
 celery:def("Surface sow; press into seed mix","8–12 in","Full sun / partial shade","14–28 days","65–75°F","Start indoors 10–12 weeks before last frost; transplant after hardening","Rich, moisture-retentive soil; long cool season","Needs reliably even moisture","Often 100–130 days from transplant","indoor","protected","100–130 days","Tall Utah celery is a long-season crop; do not bury tiny seeds deeply. Needs consistent moisture and nutrition."),
 cabbage:def("¼–½ in","12–18 in","Full sun","5–10 days","60–80°F","Start indoors 4–6 weeks before last frost for spring or start midsummer for fall","Cool-season fertile outdoor bed","Keep evenly moist and protect from cabbage pests","Early heads often 60–90 days from transplant","indoor","outdoor","60–90 days","Golden Acre and Copenhagen Market Early are early heading cabbages. Avoid sowing directly into hot weather."),
 chervil:def("¼ in","6–8 in","Partial shade / cool sun","10–21 days","50–70°F","Direct sow in cool spring and fall; repeat succession sowings","Moist, well-drained herb bed or container","Never let young plants dry out","Tender leaves about 6–8 weeks","direct-cool","outdoor","40–60 days","Curled chervil (Anthriscus cerefolium) bolts in heat and resents root disturbance."),
 mulberry:def("¼ in","Tree: 15–25 ft at maturity","Full sun / light shade","Weeks to months","65–80°F after dormancy treatment","Follow Morus alba seed pretreatment and sowing guidance; germination varies","Nursery pot to outdoor planting site with room for a tree","Keep seed-starting mix moist, not saturated","Several years to fruit","unknown","outdoor","Years","White mulberry (Morus alba) is invasive in some regions; check local planting guidance."),
 strawberry:def("Surface sow; press seeds down lightly","12–18 in for established plants","Full sun","2–6 weeks or more","60–75°F","Start indoors in a light, moist mix; many Fragaria seeds germinate better after cold treatment","Nursery trays then outdoor pots or beds","Keep germination media uniformly moist","Usually fruit from established plants after months or a season","indoor","outdoor","Varies","Species/cultivar unspecified; seed-grown plants may not match commercial varieties."),
 serviceberry:def("⅛–¼ in","Shrub or small tree: allow several feet","Full sun / light shade","Slow; may require months","Seasonal; cold moist stratification often helps","Cold stratification may be required; sow according to verified serviceberry instructions","Deep nursery pots then a suitable outdoor location","Water evenly as seedlings establish","Several seasons to fruit","unknown","outdoor","Years","Amelanchier alnifolia; botanical identity should match the seed packet."),
 elderberry:def("¼ in","6–10 ft for mature shrub","Full sun / partial shade","Often months; dormancy can be complex","Varies; may require warm/cold treatment","Follow Sambucus canadensis dormancy-specific instructions; germination can be slow","Moist but drained nursery mix, later outdoor shrub bed","Consistent moisture for young seedlings","Several seasons to fruit","unknown","outdoor","Years","Only suitably prepared fully ripe berries are used in food. Leaves, stems and unripe fruit can be poisonous."),
 blueberry:def("Surface sow; needs light","2–3 ft for lowbush groundcover","Full sun / partial shade","Often 3–8 weeks","60–75°F","Start on a moist acidic substrate; seedlings grow slowly","Well-drained acidic bed or container (typically pH 4.5–5.5)","Consistently moist, not waterlogged","Several years to fruit","unknown","outdoor","Years","Lowbush blueberry is Vaccinium angustifolium; avoid lime and alkaline soils."),
 huckleberry:def("Surface or very shallow; check packet","3–5 ft for established shrub","Partial shade / light sun","Several weeks to months","Varies; dormancy treatment may help","Sow Vaccinium ovatum in an acidic seed-starting mix; follow specific dormancy guidance","Moist, acidic, well-drained nursery pots","Even moisture; protect small seedlings from drying","Several years to fruit","unknown","outdoor","Years","Evergreen huckleberry is a true Vaccinium, not garden huckleberry."),
 gardenHuckleberry:def("¼ in","18–24 in","Full sun","7–21 days","70–80°F","Start indoors 6–8 weeks before last frost; set out after soil warms","Warm garden soil or large container","Regular moisture without waterlogging","Fruit after about 70–100 days from transplant","indoor","protected","70–110 days","Garden huckleberry is a Solanum nightshade. Confirm exact packet species and safe food use. Unripe fruit can be toxic; ripe fruit is commonly cooked, not eaten raw."),
 englishIvy:def("Follow packet; sow shallowly","Woody climbing vine; can spread widely","Shade / partial shade","Slow and irregular","Varies; dormancy treatment may help","Follow Hedera helix seed-specific guidance; cuttings are more commonly used","Contain in a pot; invasive outdoors in many locations","Keep the mix moist but well-drained","Evergreen ornamental vine","unknown","verify","Perennial","English ivy has saponins and is used traditionally for household leaf-cleaning experiments, but leaves are toxic if swallowed and can irritate skin. Never treat it as edible or as a tested skin-safe soap."),

 okra:def("½–1 in","12–18 in","Full sun","5–14 days","75–90°F","Sow outdoors once the soil is thoroughly warm and frost danger has passed","Deep fertile soil and full summer sun","Water consistently while pods develop","Usually 50–65 days until first tender pods","direct-warm","outdoor","50–65 days","Clemson Spineless and Red Burgundy are okra cultivars; harvest young pods frequently."),
 broccoli:def("¼–½ in","18–24 in","Full sun","5–10 days","60–75°F","Start 4–6 weeks before transplanting for spring, or start midsummer for autumn harvest","Fertile cool-season garden bed","Keep soil evenly moist; protect from cabbage moths","Often 60–90 days from transplant","indoor","outdoor","60–90 days","Waltham 29 is a heading broccoli. Heat can reduce head quality."),
 rapini:def("¼ in","4–8 in","Full sun / light shade","4–10 days","50–75°F","Direct sow early spring or late summer for cool-season greens","Well-drained fertile garden soil","Consistent moisture","Often 35–60 days","direct-cool","outdoor","35–60 days","Spring rapini / broccoli rabe is usually Brassica rapa (not the same species or head type as heading broccoli)."),
 cauliflower:def("¼–½ in","18–24 in","Full sun","5–10 days","60–75°F","Start indoors 4–6 weeks before spring planting, or plan for a cool fall crop","Rich, evenly moist soil; protect heads from intense heat","Keep soil moisture consistent","Often 60–85 days after transplant","indoor","outdoor","60–85 days","Snowball Y Improved cauliflower develops curds best in cool stable weather."),
 brussels:def("¼–½ in","18–24 in","Full sun","5–10 days","60–75°F","Start indoors and transplant to mature during cool autumn conditions","Fertile outdoor soil; allow space for tall stalks","Provide consistent moisture","Usually 90–120 days after transplant","indoor","outdoor","90–120 days","Long Island Improved and Rubine need a lengthy growing season; flavor can improve after light frost."),
 artichoke:def("¼–½ in","3–4 ft","Full sun","10–21 days","70–80°F","Start indoors 8–12 weeks before last frost; transplant after acclimation","Rich, well-drained soil; winter protection may be required","Deep regular watering","Often second year for perennial plants; annualized crops vary","indoor","protected","Varies","Green Globe and Purple Romagna are globe artichokes; floral buds are harvested before opening. Hardiness and vernalization requirements vary."),
 cucumber:def("½–1 in","12–24 in; or trellis","Full sun","3–10 days","70–90°F","Direct sow after frost into warm soil; start inside briefly for short seasons","Fertile, sunny garden bed with trellis optional","Keep consistently moist; water deeply","Typically 50–70 days","direct-warm","outdoor","50–70 days","Boston and National Pickling are pickling types; Marketmore 76 is a slicer. Do not use the loofah or squash guide."),
 njahi:def("1–1½ in","6–12 in; climbing types need trellis","Full sun","7–14+ days","70–90°F","Plant in reliably warm soil well after frost","Sunny soil with strong support if climbing; long warm season","Moist during emergence, then moderately drought tolerant","Often 100–150 days for dried seeds","direct-warm","protected","100–150 days","Njahi = Lablab purpureus (dolichos bean). Three bags. Varieties may climb; dry beans require proper cooking. Grocery-sourced seeds may have variable viability."),
 lentil:def("1–1½ in","2–4 in","Full sun","7–14 days","50–70°F","Direct sow early in spring as soil becomes workable","Well-drained, not waterlogged soil; cool growing season","Moderate water; avoid overhead wetting late","About 80–110 days to dry seeds","direct-cool","outdoor","80–110 days","Lens culinaris. One bag. Food-grade lentils may have reduced germination; test a sample."),
 commonBean:def("1–1½ in","4–6 in for bush types","Full sun","5–10 days","65–85°F","Direct sow only after frost when soil is warm","Fertile, well-drained garden bed","Even moisture during flowering and pod set","Typically 70–110 days for mature dry beans","direct-warm","outdoor","70–110 days","Pinto and red kidney beans are Phaseolus vulgaris. Food-store bags may not be certified for planting. Red kidney beans are poisonous if raw or undercooked; boil fully using safe food-handling guidance."),
 lima:def("1–1½ in","4–6 in","Full sun","7–14 days","70–85°F","Direct sow after soil warms; avoid planting into cold wet soil","Warm well-drained garden bed, Henderson is a bush lima bean","Water regularly without waterlogging","Typically 60–80 days for fresh beans","direct-warm","outdoor","60–80 days","Henderson lima bean is Phaseolus lunatus. One commercial packet; use fully cooked beans for eating."),
 cowpea:def("1–1½ in","4–6 in","Full sun","5–10 days","70–95°F","Direct sow into warm soil after all frost danger","Sunny warm garden bed; generally drought tolerant after establishment","Regular water when establishing; moderate after","Typically 65–90 days","direct-warm","outdoor","65–90 days","California Blackeye is a cowpea (Vigna unguiculata), not an ordinary Phaseolus bean. Two packets."),

 soyField:def("1–1½ in","3–6 in for field soybeans","Full sun","5–10 days","65–85°F","Direct sow after frost when soil is consistently warm","Fertile, well-drained outdoor garden soil","Keep consistently moist while plants establish and pods fill","Approximately 90–120 days for mature dry grain (varies with day length and location)","direct-warm","outdoor","90–120 days","Disoy is an Iowa-developed Glycine max cultivar (USDA PI 548550). Field-type soybeans are not necessarily suitable for green edamame harvest. Soy is a major food allergen; cook beans properly before eating."),
 soyEdamame:def("1–1½ in","4–6 in","Full sun","5–10 days","65–85°F","Direct sow after frost when soil is warm; sow in blocks for an orderly harvest","Fertile, well-drained bed with good air circulation","Regular moisture while pods form and fill","Around 82–83 days to harvest green edamame pods","direct-warm","outdoor","82–83 days","Chiba Green is a Glycine max edible green soybean (edamame). Harvest pods when plump and green; cook edamame before eating. Soy is a major food allergen."),

 peaSnap:def("1 in","2–4 in","Full sun / partial sun","7–14 days","40–70°F","Direct sow when spring soil is workable, then again in cool fall where possible","Well-drained garden soil; Sugar Snap uses a tall trellis, Cascadia shorter support","Keep evenly moist through flowering and pod fill","60–75 days; harvest pods when plump, tender and sweet","direct-cool","outdoor","60–75 days","Sugar Snap is tall and climbing; Cascadia is compact. Snap pea pods and peas are both edible."),
 peaSnow:def("1 in","2–4 in","Full sun / light shade","7–14 days","40–70°F","Direct sow in early spring; peas prefer cool weather","Well-drained bed; short trellis or brush support helpful","Water steadily during pod development","60–70 days; harvest edible pods flat and tender","direct-cool","outdoor","60–70 days","Oregon Sugar Pod II is a snow pea. Pick before peas swell, unlike shelling or snap varieties."),
 peaShell:def("1 in","2–4 in","Full sun / light shade","7–14 days","40–70°F","Direct sow as spring soil can be worked","Fertile well-drained bed; dwarf plants can use short supports","Keep evenly moist","60–75 days; harvest full pods and shell peas for eating","direct-cool","outdoor","60–75 days","Lincoln Homestead and Little Marvel are shelling peas; the tough pods are not eaten like snap-pea pods."),
 beanBush:def("1 in","3–6 in","Full sun","5–10 days","65–85°F","Direct sow after last spring frost once the soil is warm; succession sow in suitable seasons","Sunny, well-drained garden bed; no tall trellis needed","Water regularly around flowering; avoid saturated roots","50–65 days; harvest tender pods regularly","direct-warm","outdoor","50–65 days","Venture, Blue Lake 156 and Royal Burgundy are bush beans. Royal Burgundy pods turn green upon cooking."),
 beanPole:def("1 in","4–6 in along trellis","Full sun","5–10 days","65–85°F","Direct sow after frost into warm soil; place supports before planting","Sunny, well-drained bed with a sturdy 5–8 ft trellis","Consistent moisture during pod formation","60–80 days for green pods; shell/dry varieties take longer","direct-warm","outdoor","60–80+ days","Blue Lake pole, Kentucky Wonder and Rattlesnake climb. Bingo is often described as an Italian borlotto-type climbing bean that may be grown for mature beans."),
 peanut:def("1–2 in","6–12 in","Full sun","7–14 days","70–90°F","Sow unroasted, untreated peanut kernels only after frost when soil is thoroughly warm","Loose sandy well-drained soil; leave room for pegs to grow into soil, long hot season required","Water during flowering and pod development without waterlogging","Often 120–150 days; lift plants then dry/cure pods promptly and safely","direct-warm","protected","120–150 days","Arachis hypogaea is the cultivated peanut species. Wild Jungle Peanut is preserved from the packet name, not a confirmed wild species. Peanut allergies can be severe."),
 ginseng:def("¼–½ in","6–10 in","Deep shade (70–90%)","Often 1–2 years with dormancy","45–65°F seasonally","Sow stratified seed in fall or allow natural two-winter dormancy","Shaded woodland bed with humus-rich, well-drained soil","Moist, not soggy","Roots take several years to mature","unknown","protected","5+ years","Ginseng species must be verified; never collect wild plants without checking protection rules."),
 herbPerennial:def("⅛–¼ in","12–18 in","Full sun / partial shade","10–28 days","60–70°F","Start 6–8 weeks indoors before last frost or sow spring","Well-drained garden bed, contain vigorous spreading plants","Moist during establishment","Perennial, usually cut leaves after establishment","indoor","outdoor","Perennial","Confirm packet species, hardiness and medicinal handling."),
 mint:def("Surface–⅛ in","12–18 in","Full sun / partial shade","10–21 days","65–75°F","Start indoors 6–8 weeks before last frost","Herb container or bordered bed to prevent runner spread","Even moisture, well drained","Leaves after establishment","indoor","outdoor","Perennial","Mint family: peppermint seeds may not breed true to selected clones. Pennyroyal is NOT appropriate for medicinal use."),
 monarda:def("Surface–⅛ in","12–18 in","Full sun / partial shade","10–20 days","60–70°F","Sow indoors 6–8 weeks before last frost or direct sow spring","Sunny well-drained pollinator bed","Moderate water while establishing","Annual/biennial or perennial depending on species","indoor","outdoor","Varies","Monarda citriodora lemon mint/bergamot is not necessarily the same species as a packet simply labeled Bergamot."),
 thistle:def("¼ in","18–30 in","Full sun","7–14 days","60–75°F","Direct sow in spring after hard frost","Dry, well-drained bed, sharp thistle spines","Moderate water","Annual/biennial; seedheads by late summer","direct-cool","outdoor","90–120+ days","Wear gloves, contain self-seeding, avoid medicinal self-use."),
 camas:def("¼ in","4–6 in","Full sun / partial sun","Cold stratification; weeks to months","Seasonal cool/cold","Sow outside in fall for chilling","Moist spring meadow bed that dries in summer","Moist in spring, drier during dormancy","Bulbs take years to reach flowering size","unknown","outdoor","Several years","Camas cannot be safely identified by common name alone; death camas is a deadly look-alike."),
 annualHerb:def("¼ in","12–18 in","Full sun","5–14 days","60–75°F","Direct sow in spring","Sunny well-drained herb or pollinator bed","Moderate water","Flowers and leaves after establishment","direct-cool","outdoor","Annual","Borage is attractive to bees but plant parts can contain pyrrolizidine alkaloids."),
 warmHerb:def("Surface–⅛ in","12–18 in","Full sun / bright light","7–21 days","70–80°F","Start indoors 6–10 weeks before last frost","Warm fertile bed or container; protect from frost","Even moisture when young","Leaves or flowers in 65–110 days","indoor","protected","65–110 days","Warm-season herb; follow actual packet instructions on identity and safe use."),
 perennialFlower:def("Surface–⅛ in","12–18 in","Full sun / light shade","10–28 days","60–70°F","Start indoors 6–10 weeks before last frost; some species benefit from chilling","Sunny, well-drained pollinator bed","Moist until established","Perennial; often flowers by second year","indoor","outdoor","Perennial","Many perennial flowers take time to establish; do not assume ornamental blooms are edible."),
 coolFlower:def("⅛–¼ in","8–12 in","Cool full sun / light shade","7–21 days","55–70°F","Start indoors 6–8 weeks before last frost or direct sow spring","Cool season flower bed or container","Even moisture","Flowers often 45–90 days","indoor","outdoor","45–90 days","Cool-season flowers may slow flowering in hot weather."),
 annualFlower:def("⅛–¼ in","10–12 in","Full sun","7–21 days","60–75°F","Direct sow in spring or start indoors 4–6 weeks before frost","Sunny, well-drained flower bed","Moderate, consistent water","Flowers within 50–100 days","indoor","outdoor","50–100 days","Confirm species; Bishop's Flower can cause phototoxic sap reactions."),
 nettle:def("Surface–⅛ in","12–24 in","Sun / partial shade","10–21 days","55–70°F","Sow cool spring or start indoors 6–8 weeks before frost","Moist, fertile bed; contain spreading underground roots","Regular moisture","Perennial; leafy growth in spring","indoor","outdoor","Perennial","Stinging hairs require gloves and long sleeves."),
 succulent:def("¼ in","3–6 ft, species-dependent","Full sun / bright light","7–21 days","70–85°F","Start indoors in warmth","Gritty, sharply draining container mix; protect against freezing","Water sparingly after establishment","Many years","indoor","heated","Years","Blue agave exact species unverified. Sharp leaf tips and irritating sap."),
 vine:def("¼–½ in","6–12 ft or more on trellis","Full sun / partial shade","2–8+ weeks","70–85°F","Sow warm indoors 10–12 weeks before frost","Sunny trellis or greenhouse; hardiness varies by Passiflora species","Even moisture in active season","Varies, often multiple years","unknown","protected","Varies","Confirm species before treating Passion Flower fruits or leaves as edible."),
 bamboo:def("Species-specific, often surface–¼ in","Several feet; species dependent","Sun / partial shade","2–8+ weeks","70–85°F","Start seed warm indoors","Contained large planter or carefully selected site; determine running vs clumping rhizomes","Keep evenly moist without waterlogging","Years","unknown","protected","Years","Giant bamboo species unknown; some are invasive and may not tolerate cold winters."),
 lavender:def("⅛ in; light cover","12–18 in","Full sun","14–30 days","65–70°F","Start indoors 8–12 weeks before last frost; some seeds benefit from chilling","Gritty, very well-drained soil, protect from winter wet","Water sparingly once established","Perennial, blooms in 1–2 years","indoor","outdoor","Perennial","English/True Lavender generally Lavandula angustifolia. Six packets combined as synonyms; verify labels."),
 flaxBlue:def("⅛–¼ in","6–12 in","Full sun","14–28 days; sometimes benefits from cool stratification","60–70°F","Direct sow from fall through early spring or start indoors early","Lean, very well-drained sunny soil; good in a rock garden","Keep seedbed slightly moist until germination, then water sparingly; do not saturate mature plants","Flowers often in second year; short-lived perennial","direct-cool","outdoor","Perennial","Blue flax can refer to Linum perenne or Linum lewisii. Species not confirmed from packet. Not equivalent to the medieval fiber flax Linum usitatissimum."),
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
 onion:def("¼–½ in","4–6 in for bulbs, adjust for cultivar","Full sun","7–14 days","60–75°F","Start indoors 8–12 weeks before spring transplanting or direct sow when suitable","Sunny, well-drained fertile garden bed","Keep soil consistently moist as bulbs develop","Depends on cultivar; often 90–120+ days","indoor","outdoor","Varies","Day length matters: short-day and long-day onions need climates suited to bulbing. Follow variety packet and local extension guidance."),
 scallion:def("¼ in","2–3 in","Full sun / partial sun","7–14 days","60–75°F","Start indoors or direct sow in cool spring","Garden bed or container with loose, fertile soil","Keep evenly moist","Harvest stems young, often in 60–80 days","direct-cool","outdoor","60–80 days","Bunching and scallion types are grown mainly for edible green stems, not large dry bulbs."),
 leek:def("¼ in","4–6 in","Full sun","7–14 days","60–75°F","Start indoors 8–12 weeks before last frost; transplant after hardening off","Deep, fertile bed; hill soil gradually if desired","Keep soil evenly moist","Usually a long-season crop, often 100–150 days","indoor","outdoor","100–150 days","Leeks are cool-season plants; maturity varies with variety and growing conditions."),
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
const completeInventoryGuides={"American Ginseng":"ginseng","Panax Ginseng (species unverified)":"ginseng","Mountain Mint":"herbPerennial","Pennyroyal Mint":"mint","Spearmint":"mint","Peppermint":"mint","Lemon Mint / Lemon Bergamot":"monarda","Nettleleaf Horsemint":"herbPerennial","Bergamot":"monarda","Milk Thistle":"thistle","Blue Camas":"camas","Borage":"annualHerb","Comfrey":"herbPerennial","Stevia Sugar Plant":"warmHerb","White Yarrow":"perennialFlower","Betony":"herbPerennial","St. John's Wort":"herbPerennial","Marsh Mallow (Althaea officinalis)":"herbPerennial","Calendula Pacific Beauty":"coolFlower","Toothache Plant (Spilanthes oleracea)":"warmHerb","Echinacea Purple Coneflower":"perennialFlower","Marigold Mix":"annualFlower","Pyrethrum Daisy":"perennialFlower","Bishop's Flower":"annualFlower","Stinging Nettle":"nettle","Lovage":"herbPerennial","Pansy (Viola × wittrockiana)":"coolFlower","Blue Agave":"succulent","German Chamomile":"coolFlower","Passion Flower":"vine","Horehound":"herbPerennial","Lemon Balm":"herbPerennial","Giant Bamboo":"bamboo","English / True Lavender":"lavender","Valerian":"herbPerennial"};
const completeInventoryNotes={"American Ginseng":"Panax quinquefolius; woodland shade ginseng requiring long seed dormancy.","Panax Ginseng (species unverified)":"Two packets. Panax is a genus; exact species unverified. Check packet before treating as Asian ginseng.","Mountain Mint":"Pycnanthemum species likely; exact species unverified. Aromatic pollinator flower.","Pennyroyal Mint":"Pennyroyal species unconfirmed (Mentha pulegium or Hedeoma pulegioides). Essential oil is dangerously toxic.","Spearmint":"Mentha spicata, culinary mint that spreads by runners.","Peppermint":"Two packets. Mentha × piperita often propagates by cuttings; seedlings may not be true to type.","Lemon Mint / Lemon Bergamot":"Merged: two Lemon Mint packets and one Lemon Bergamot packet; both names commonly mean Monarda citriodora. Check packet botanical names.","Nettleleaf Horsemint":"Often Agastache urticifolia (nettleleaf giant hyssop); botanical identity unverified.","Bergamot":"Bergamot may mean Monarda fistulosa (wild bergamot); not automatically identical to lemon bergamot.","Milk Thistle":"Four packets of Silybum marianum; spiny herb with potential allergies and medication interactions.","Blue Camas":"Camassia species possibly C. quamash; death camas is a potentially fatal look-alike.","Borage":"Borago officinalis; bee-friendly blue flowers; possible liver-toxic alkaloids.","Comfrey":"Symphytum species unverified; contains liver-toxic pyrrolizidine alkaloids.","Stevia Sugar Plant":"Stevia rebaudiana, sweet-leaf herb; needs warmth and can be slow to germinate.","White Yarrow":"Achillea millefolium, white yarrow, pollinator plant that can irritate sensitive skin.","Betony":"Usually Stachys officinalis (wood betony); confirm botanical species.","St. John's Wort":"Usually Hypericum perforatum; strong medication interactions; can spread aggressively.","Marsh Mallow (Althaea officinalis)":"Althaea officinalis, a tall perennial mallow herb.","Calendula Pacific Beauty":"Two packets of Calendula officinalis 'Pacific Beauty'; daisy-family allergy possible.","Toothache Plant (Spilanthes oleracea)":"Packet name Spilanthes oleracea; often Acmella oleracea. Flowers cause oral tingling/numbness.","Echinacea Purple Coneflower":"Echinacea purpurea; perennial purple coneflower loved by pollinators.","Marigold Mix":"Two packets of Tagetes marigold mix; exact species and cultivars unverified.","Pyrethrum Daisy":"Often Tanacetum cinerariifolium; pyrethrins are insecticidal and concentrates can harm cats and fish.","Bishop's Flower":"Commonly Ammi majus; confirm species. Sap can cause skin burns when exposed to sunlight.","Stinging Nettle":"Two packets. Usually Urtica dioica; stinging hairs on stems and leaves can irritate bare skin.","Lovage":"Levisticum officinale, tall celery-scented perennial herb.","Pansy (Viola × wittrockiana)":"Garden pansy, Viola × wittrockiana; spelling standardized from dictation.","Blue Agave":"Likely Agave tequilana but exact species unverified; frost-tender spiny succulent.","German Chamomile":"Two packets. Matricaria chamomilla; daisy-family allergies possible.","Passion Flower":"Passiflora species unspecified; verify before assuming leaves or fruits are edible.","Horehound":"Usually Marrubium vulgare, white horehound perennial.","Lemon Balm":"Melissa officinalis, lemon-scented mint-family herb, NOT the same species as lemon mint/bergamot.","Giant Bamboo":"Giant bamboo species unknown; determine clumping versus running growth habit to prevent unwanted spreading.","English / True Lavender":"Merged: two English Lavender and four True Lavender packets; both names commonly mean Lavandula angustifolia. Verify packet botanical names.","Valerian":"Three packets. Valeriana officinalis; sedating extracts can interact with medicines."};
function resolveGuide(name,cat){
 const n=name.toLowerCase();
 if(n==="blue flax")return guides.flaxBlue;
 if(Object.hasOwn(completeInventoryGuides,name)){const guide=guides[completeInventoryGuides[name]];return {...guide,extra:completeInventoryNotes[name]+" "+guide.extra};}
 if(cat==="Tomatoes")return n.includes("tamarillo")?guides.tropical:guides.tomato;
 if(cat==="Peppers")return guides.pepper;
 if(cat==="Carrots")return guides.carrot;
 if(cat==="Sunflowers")return guides.sunflower;
 if(cat==="Eggplant")return guides.eggplant;
 if(cat==="Wildflower mixes")return guides.flower;
 if(cat==="Leafy greens")return /pak choi|bok choy/.test(n)?guides.pakChoi:n.includes("catalogna")?guides.chicory:n.includes("winter purslane")?guides.purslaneWinter:n.includes("swiss chard")?guides.chard:n.includes("corn salad")?guides.mache:/^kale\b/.test(n)?guides.kale:/^spinach\b/.test(n)?guides.spinach:/^lettuce\b/.test(n)?guides.lettuce:/^endive\b/.test(n)?guides.endive:/^collard\b/.test(n)?guides.collard:/^cress\b/.test(n)?guides.cress:/^arugula\b/.test(n)?guides.arugula:/^celery\b/.test(n)?guides.celery:guides.generic;
 if(cat==="Roots and brassicas")return n.includes("rapini")?guides.rapini:n.includes("brussels")?guides.brussels:n.includes("cauliflower")?guides.cauliflower:n.includes("broccoli")?guides.broccoli:n.includes("cabbage")?guides.cabbage:n.includes("parsnip")?guides.parsnip:n.includes("kohlrabi")?guides.kohlrabi:n.includes("turnip")?guides.turnip:n.includes("radish")?guides.radish:guides.beet;
 if(cat==="Pumpkins and melons")return n.includes("pumpkin")?guides.pumpkin:guides.melon;
 if(cat==="Gourds and squash")return n.includes("cucumber")?guides.cucumber:n.includes("loofah")?guides.tropical:guides.squash;
 if(cat==="Other vegetables")return n.includes("okra")?guides.okra:n.includes("artichoke")?guides.artichoke:guides.generic;
 if(cat==="Beans and legumes")return n.startsWith("pea ")?n.includes("oregon sugar pod")?guides.peaSnow:/lincoln|little marvel/.test(n)?guides.peaShell:guides.peaSnap:n.includes("peanut")?guides.peanut:n.startsWith("bush bean")?guides.beanBush:/^pole bean|kentucky wonder/.test(n)?guides.beanPole:n.includes("soybean")?(n.includes("chiba")?guides.soyEdamame:guides.soyField):n.includes("njahi")?guides.njahi:n.includes("lentil")?guides.lentil:n.includes("cowpea")?guides.cowpea:n.includes("lima")?guides.lima:guides.commonBean;
 if(cat==="Trees and woody plants")return n.includes("white mulberry")?guides.mulberry:n.includes("english ivy")?guides.englishIvy:/date palm|moringa/.test(n)?guides.tropical:guides.tree;
  if(cat==="Berries and fruit")return n.includes("strawberry")?guides.strawberry:n.includes("saskatoon")?guides.serviceberry:n.includes("elderberry")?guides.elderberry:n.includes("lowbush blueberry")?guides.blueberry:n.includes("evergreen huckleberry")?guides.huckleberry:n.includes("garden huckleberry")?guides.gardenHuckleberry:guides.generic;
 if(cat==="Flowers and ornamentals")return /poppy/.test(n)?guides.poppy:guides.flower;
 if(cat==="Fiber and historical crops")return /tobacco/.test(n)?guides.tobacco:guides.cotton;
 if(cat==="Grains and grasses")return /corn/.test(n)?guides.corn:guides.grain;
 if(cat==="Alliums: chives, onions and leeks")return n.includes("chives")?guides.chives:n.includes("leek")?guides.leek:/scallion|bunching/.test(n)?guides.scallion:guides.onion;
 if(cat==="Herbs and medicinal plants"){
  if(n.includes("fenugreek"))return guides.fenugreek;
   if(n.includes("chervil"))return guides.chervil;
  for(const k of ["basil","chives","thyme","oregano","dill","coriander","cilantro","parsley","mint","fennel"])if(n.includes(k))return guides[k==="cilantro"?"coriander":k];
  if(n.includes("marjoram"))return guides.oregano;
  if(n.includes("anise")||n.includes("caraway")||n.includes("cumin"))return guides.coriander;
  return guides.generic;
 }
 return guides.generic;
}
const commonWiki={
 "Wildflower mixes":"Wildflower","Sunflowers":"Helianthus annuus","Carrots":"Carrot","Tomatoes":"Tomato",
 "Eggplant":"Eggplant","Peppers":"Capsicum annuum","Roots and brassicas":"Root vegetable","Leafy greens":"Leaf vegetable",
 "Pumpkins and melons":"Cucurbitaceae","Gourds and squash":"Squash (plant)","Other vegetables":"Vegetable","Beans and legumes":"Legume",
 "Trees and woody plants":"Tree","Berries and fruit":"Berry","Flowers and ornamentals":"Flower",
 "Herbs and medicinal plants":"Herb","Alliums: chives, onions and leeks":"Allium","Grains and grasses":"Cereal",
 "Fiber and historical crops":"Fiber crop"
};
const completeInventoryWiki={"American Ginseng":"Panax quinquefolius","Panax Ginseng (species unverified)":"Ginseng","Mountain Mint":"Pycnanthemum","Pennyroyal Mint":"Pennyroyal","Spearmint":"Spearmint","Peppermint":"Peppermint","Lemon Mint / Lemon Bergamot":"Monarda citriodora","Nettleleaf Horsemint":"Agastache urticifolia","Bergamot":"Monarda fistulosa","Milk Thistle":"Silybum marianum","Blue Camas":"Camassia quamash","Borage":"Borago officinalis","Comfrey":"Comfrey","Stevia Sugar Plant":"Stevia","White Yarrow":"Achillea millefolium","Betony":"Stachys officinalis","St. John's Wort":"Hypericum perforatum","Marsh Mallow (Althaea officinalis)":"Althaea officinalis","Calendula Pacific Beauty":"Calendula officinalis","Toothache Plant (Spilanthes oleracea)":"Acmella oleracea","Echinacea Purple Coneflower":"Echinacea purpurea","Marigold Mix":"Tagetes","Pyrethrum Daisy":"Tanacetum cinerariifolium","Bishop's Flower":"Ammi majus","Stinging Nettle":"Urtica dioica","Lovage":"Lovage","Pansy (Viola × wittrockiana)":"Viola × wittrockiana","Blue Agave":"Agave tequilana","German Chamomile":"Matricaria chamomilla","Passion Flower":"Passiflora","Horehound":"Marrubium vulgare","Lemon Balm":"Melissa officinalis","Giant Bamboo":"Bamboo","English / True Lavender":"Lavandula angustifolia","Valerian":"Valeriana officinalis"};
function wikiFor(name,cat){
 const n=name.toLowerCase();
 if(n==="blue flax")return "Linum";
 if(Object.hasOwn(completeInventoryWiki,name))return completeInventoryWiki[name];
 if(cat==="Wildflower mixes")return n.includes("butterfly")?"Butterfly gardening":"Wildflower";
 if(cat==="Leafy greens")return /bok choy|pak choi/.test(n)?"Bok choy":n.includes("catalogna")?"Chicory":n.includes("winter purslane")?"Claytonia perfoliata":n.includes("swiss chard")?"Chard":n.includes("corn salad")?"Valerianella locusta":n.includes("kale")?"Kale":n.includes("spinach")?"Spinach":n.includes("lettuce")?"Lettuce":n.includes("endive")?"Endive":n.includes("collard")?"Collard greens":n.includes("cress")?"Garden cress":n.includes("arugula")?"Arugula":n.includes("celery")?"Celery":"Leaf vegetable";
 if(n.includes("fenugreek"))return "Fenugreek";
 if(n.includes("chervil"))return "Chervil";
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
 if(cat==="Roots and brassicas")return n.includes("rapini")?"Rapini":n.includes("brussels")?"Brussels sprout":n.includes("cauliflower")?"Cauliflower":n.includes("broccoli")?"Broccoli":n.includes("cabbage")?"Cabbage":n.includes("parsnip")?"Parsnip":n.includes("radish")?"Radish":n.includes("kohlrabi")?"Kohlrabi":n.includes("turnip")?"Turnip":"Beetroot";
 if(cat==="Pumpkins and melons")return n.includes("pumpkin")?"Pumpkin":n.includes("cucamelon")?"Melothria scabra":n.includes("watermelon")?"Watermelon":"Cantaloupe";
 if(cat==="Other vegetables")return n.includes("okra")?"Okra":"Artichoke";
 if(cat==="Beans and legumes")return n.startsWith("pea ")?"Pea":n.includes("peanut")?"Peanut":n.includes("soybean")?(n.includes("chiba")?"Edamame":"Soybean"):n.includes("njahi")?"Lablab purpureus":n.includes("lentil")?"Lentil":n.includes("cowpea")?"Cowpea":n.includes("lima")?"Lima bean":"Common bean";
 if(cat==="Gourds and squash")return n.includes("cucumber")?"Cucumber":n.includes("loofah")?"Luffa aegyptiaca":n.includes("zucchini")?"Zucchini":n.includes("butternut")?"Butternut squash":n.includes("delicata")?"Delicata squash":"Summer squash";
 if(cat==="Berries and fruit")return n.includes("strawberry")?"Strawberry":n.includes("serviceberry")?"Amelanchier alnifolia":n.includes("elderberry")?"Sambucus canadensis":n.includes("blueberry")?"Vaccinium angustifolium":n.includes("evergreen huckleberry")?"Vaccinium ovatum":n.includes("garden huckleberry")?"Solanum scabrum":"Berry";
  if(cat==="Trees and woody plants")return n.includes("mulberry")?"Morus alba":n.includes("english ivy")?"Hedera helix":n.includes("date")?"Date palm":n.includes("hazelnut")?"Hazelnut":n.includes("pine")?"Pine":n.includes("moringa")?"Moringa oleifera":n.includes("sequoia")?"Sequoiadendron giganteum":n.includes("pecan")?"Pecan":n.includes("sugar maple")?"Acer saccharum":n.includes("boxwood")?"Buxus":commonWiki[cat];
 if(cat==="Flowers and ornamentals")return n.includes("rose")?"Rose":n.includes("poppy")?(n.includes("california")?"Eschscholzia californica":"Papaver somniferum"):n.includes("morning glory")?"Ipomoea tricolor":n.includes("sea holly")?"Eryngium planum":n.includes("edelweiss")?"Leontopodium alpinum":n.includes("zinnia")?"Zinnia elegans":n.includes("lily of the valley")?"Convallaria majalis":n.includes("pokeberry")?"Phytolacca americana":n.includes("larkspur")?"Consolida ajacis":n.includes("coleus")?"Coleus":n.includes("celosia")?"Celosia argentea":n.includes("haworthia")?"Haworthia":n.includes("dahlia")?"Dahlia":n.includes("phlox")?"Phlox subulata":n.includes("balsam")?"Impatiens balsamina":n.includes("forget")?"Myosotis":"Flower";
 if(cat==="Alliums: chives, onions and leeks")return n.includes("garlic chives")?"Allium tuberosum":n.includes("chives")?"Chives":n.includes("leek")?"Leek":/scallion|bunching/.test(n)?"Welsh onion":"Onion";
 if(cat==="Herbs and medicinal plants")return n.includes("dill")?"Dill":n.includes("basil")?(n.includes("tulsi")?"Ocimum tenuiflorum":"Basil"):n.includes("oregano")?"Oregano":n.includes("marjoram")?"Origanum majorana":n.includes("cilantro")||n.includes("coriander")?"Coriander":n.includes("fennel")?"Fennel":n.includes("parsley")?"Parsley":n.includes("ashwagandha")?"Withania somnifera":n.includes("hyssop")?"Hyssopus officinalis":n.includes("wormwood")?"Artemisia absinthium":n.includes("mugwort")?"Artemisia vulgaris":n.includes("rue")?"Ruta graveolens":n.includes("nightshade")?"Atropa belladonna":n.includes("henbane")?"Hyoscyamus":n.includes("foxglove")?"Digitalis":n.includes("caraway")?"Caraway":n.includes("anise")?"Anise":n.includes("cumin")?"Cumin":n.includes("savory")?"Satureja":n.includes("mimosa")?"Mimosa pudica":n.includes("herb of paris")?"Paris quadrifolia":commonWiki[cat];
 if(cat==="Grains and grasses")return n.includes("corn")?"Maize":n.includes("quinoa")?"Quinoa":n.includes("amaranth")?"Amaranth":n.includes("rye")?"Rye":n.includes("wheat")?"Wheat":n.includes("plantain")?"Plantago":n.includes("fescue")?"Festuca glauca":commonWiki[cat];
 if(cat==="Fiber and historical crops")return n.includes("tobacco")?"Nicotiana tabacum":"Gossypium";
 return commonWiki[cat]||null;
}
const referenceGuides={
 peaSnap:["Oregon State University Extension · Snap peas","https://extension.oregonstate.edu/imported-publication/snap-peas"],
 peaSnow:["Utah State University Extension · Peas","https://extension.usu.edu/yardandgarden/research/peas-in-the-garden"],
 peaShell:["Utah State University Extension · Peas","https://extension.usu.edu/yardandgarden/research/peas-in-the-garden"],
 beanPole:["Cornell · Kentucky Wonder beans","https://vegvariety.cce.cornell.edu/main/detail.php?filterBy=0&variety_id=2834"],
 beanBush:["University of Minnesota Extension · Beans","https://extension.umn.edu/vegetables/growing-beans"],
 peanut:["University of Georgia Extension","https://extension.uga.edu/"],

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
const pictureIcons={"Sunflowers":"🌻","Tomatoes":"🍅","Carrots":"🥕","Peppers":"🌶️","Herbs and medicinal plants":"🌿","Alliums: chives, onions and leeks":"🧅","Wildflower mixes":"🌼","Trees and woody plants":"🌳","Berries and fruit":"🫐","Grains and grasses":"🌾","Pumpkins and melons":"🎃","Gourds and squash":"🥒","Other vegetables":"🌿","Beans and legumes":"🫘","Flowers and ornamentals":"🌸","Eggplant":"🍆","Roots and brassicas":"🌱","Leafy greens":"🥬","Fiber and historical crops":"🌱"};

const squashSVG='<svg class="seed-squash-svg" viewBox="0 0 100 86" role="img" aria-label="Generic yellow squash illustration" xmlns="http://www.w3.org/2000/svg"><path d="M50 23C42 20 39 15 44 7" stroke="#587536" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M53 25C44 20 37 24 38 35C26 39 14 47 15 60C16 76 30 81 49 81C70 81 84 73 84 59C84 46 75 39 61 35C61 28 58 25 53 25Z" fill="#F2C460" stroke="#AC7A28" stroke-width="2.5"/><path d="M32 51C26 63 35 72 45 74" stroke="#FFEDB2" stroke-width="6" fill="none" opacity=".85" stroke-linecap="round"/><path d="M61 24C74 13 80 22 75 31C69 33 65 31 61 24Z" fill="#64914D" stroke="#396232" stroke-width="2"/></svg>';
const zucchiniSVG='<svg class="seed-squash-svg" viewBox="0 0 100 86" role="img" aria-label="Generic zucchini squash illustration" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-28 50 44)"><path d="M48 9C57 9 62 21 62 35L66 68C67 76 57 82 47 82C36 82 29 76 31 68L36 35C37 21 40 9 48 9Z" fill="#4B783E" stroke="#254B2D" stroke-width="2.5"/><path d="M44 22C42 40 38 62 39 73" stroke="#89AC65" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/><path d="M53 22C57 41 57 60 57 70" stroke="#34643A" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M41 9L40 1M47 9L47 1M53 9L55 1" stroke="#8C9561" stroke-width="4" stroke-linecap="round"/></g></svg>';
function seedFallbackMarkup(name,cat){
 const n=String(name||"").toLowerCase();
 if(/\bwatermelon\b/.test(n))return '🍉';
 if(/\bcantaloupe\b|\bhoneydew\b/.test(n))return '🍈';
 if(/\bpumpkin\b/.test(n))return '🎃';
 if(/\bcucumber\b/.test(n))return '🥒';
 if(/\bblue flax\b/.test(n))return '🌸';
 if(/\blavender\b/.test(n))return '🪻';
 if(/\bbamboo\b/.test(n))return '🎋';
 if(/\bagave\b/.test(n))return '🌵';
 if(/\b(blue camas|pansy|passion flower)\b/.test(n))return '🌸';
 if(/\b(echinacea|marigold|pyrethrum|calendula|chamomile|yarrow|milk thistle|borage)\b/.test(n))return '🌼';
 if(/\b(ginseng|nettle|mint|horsemint|bergamot|comfrey|betony|lovage|valerian|lemon balm|horehound|john's wort|marsh mallow|stevia)\b/.test(n))return '🌿';
 if(/^pea\b/.test(n))return '🫛';
 if(/\bpeanut\b/.test(n))return '🥜';
 if(/\b(bush bean|pole bean|garden bean)\b/.test(n))return '🫘';
 if(/\b(okra|artichoke)\b/.test(n))return '🌿';
 if(/\b(njahi|lentil|pinto|kidney bean|lima bean|cowpea|beans)\b/.test(n))return '🫘';
 if(/\b(broccoli|rapini|cauliflower|brussels)\b/.test(n))return '🥦';
 if(cat==="Gourds and squash")return /zucchini/.test(n)?zucchiniSVG:squashSVG;
 if(/\bstrawberry\b/.test(n))return '🍓';
 if(/\bblueberry\b|\bhuckleberry\b|\belderberry\b|\bserviceberry\b/.test(n))return '🫐';
 if(/\bmulberry\b/.test(n))return '🌳';
 if(/\benglish ivy\b/.test(n))return '🍃';
 return pictureIcons[cat]||'🌱';
}
function placeSeedFallback(thumb,name,cat){
 const icon=document.createElement('span');icon.className='seed-illustration';
 icon.innerHTML=seedFallbackMarkup(name,cat);thumb.appendChild(icon);
}

const checkedPhotoCatalog=window.DKSeedBankVarietyImages||{};
const photoPreferenceKey="dk-seedbank-photo-view-v2";
const remoteImageStorageKey="dk-seedbank-remote-image-urls-v1";
const photoChangesKey="dk-seedbank-photo-changes-v1";
let photoChanges=field(photoChangesKey,{});
if(!photoChanges||typeof photoChanges!=="object"||Array.isArray(photoChanges))photoChanges={};
function markPhotoChange(key,deleted){
 photoChanges[key]={at:new Date().toISOString(),deleted:!!deleted};
 if(!save(photoChangesKey,photoChanges))alert("Photo change history could not be saved. Export a full backup.");
}
function restorePhotoChanges(data){
 const record=data&&typeof data==="object"&&!Array.isArray(data)?data:{};
 const clean={};
 for(const [key,change] of Object.entries(record)){
  if(typeof key!=="string"||key.length>320||!change||typeof change.at!=="string")continue;
  if(Number.isNaN(Date.parse(change.at)))continue;
  clean[key]={at:change.at,deleted:change.deleted===true};
 }
 return clean;
}
let remoteImageUrls=field(remoteImageStorageKey,{});
if(!remoteImageUrls||typeof remoteImageUrls!=="object"||Array.isArray(remoteImageUrls))remoteImageUrls={};
function validImageLink(value){
 if(typeof value!=="string"||value.length>2048)return false;
 try{const url=new URL(value);return (url.protocol==="https:"||url.protocol==="http:")&&!url.username&&!url.password;}
 catch(e){return false;}
}
function savedImageLink(p,kind){
 const urls=remoteImageUrls[p.key];
 return urls&&validImageLink(urls[kind])?urls[kind]:null;
}
function saveImageLinks(){return save(remoteImageStorageKey,remoteImageUrls);}
let photoPreferences=field(photoPreferenceKey,{});
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
async function dbDelete(key){
 const db=await openDB();if(!db)return false;
 return new Promise(resolve=>{
  try{
   const tx=db.transaction("photos","readwrite");
   tx.objectStore("photos").delete(key);
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>resolve(false);
   tx.onabort=()=>resolve(false);
  }catch(error){resolve(false);}
 });
}
async function dbAll(){const db=await openDB();if(!db)return [];return new Promise(resolve=>{try{const t=db.transaction("photos","readonly").objectStore("photos"), req=t.getAllKeys();req.onsuccess=()=>{const keys=req.result;Promise.all(keys.map(key=>new Promise(r=>{const request=t.get(key);request.onsuccess=()=>r([key,request.result]);request.onerror=()=>r(null);}))).then(x=>resolve(x.filter(Boolean)));};req.onerror=()=>resolve([]);}catch(e){resolve([]);}});}
let journal=field(storageKey,null);
let journalDeletes=field(journalDeletesKey,[]);
if(!Array.isArray(journalDeletes))journalDeletes=[];
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
/* Explain every caution tag with plant-specific risks and precautions. */
const seedCautionInfo={
 "Red Kidney Beans": {
  "why": "Raw or undercooked red kidney beans contain the lectin phytohaemagglutinin, which can cause severe vomiting and diarrhea.",
  "how": "Soak dried beans for at least 5 hours, discard that water, then vigorously boil in fresh water for at least 30 minutes and cook until fully tender. Do not cook dry kidney beans only in a slow cooker.",
  "who": "Anyone eating the beans, especially children; keep uncooked beans away from pets.",
  "source": "https://www.fda.gov/files/food/published/Bad-Bug-Book-2nd-Edition-%28PDF%29.pdf"
 },
 "Boxwood": {
  "why": "Boxwood (Buxus) contains toxic compounds in its leaves and other plant parts. Eating it can poison people or animals.",
  "how": "Do not use any part as food or tea. Wear gardening gloves when pruning, wash hands afterward and collect clippings where pets cannot chew them.",
  "who": "Children, dogs, cats and grazing animals.",
  "source": "https://www.poison.org/"
 },
 "English Ivy": {
  "why": "English ivy leaves and berries are poisonous if swallowed; sap and leaves can cause allergic or irritant skin reactions. It can also spread invasively.",
  "how": "Wear gloves when harvesting leaves or pruning. Keep leaves out of mouths and away from pets. Traditional ivy-leaf cleaning preparations are NOT automatically safe for hand, face or body soap; avoid skin use without reliable safety evidence.",
  "who": "Children, pets and anyone with sensitive skin or allergies.",
  "source": "https://www.poison.org/"
 },
 "American Elderberry": {
  "why": "Leaves, stems, roots and unripe elderberries can contain cyanogenic compounds, and even raw ripe berries can cause stomach upset.",
  "how": "Use only correctly identified, fully ripe berries that are properly cooked, with stems and leaves removed. Do not use leaves, unripe berries or raw berry preparations as food or medicine.",
  "who": "Anyone consuming berries, especially children and pets.",
  "source": "https://www.poison.org/"
 },
 "Garden Huckleberry": {
  "why": "Garden huckleberry is a Solanum nightshade, not a true blueberry. Green/unripe berries and leaves may contain toxic glycoalkaloids; exact species matters.",
  "how": "Verify the packet's botanical identity. Do not eat unripe fruit, leaves or stems. If confirmed as an edible garden-huckleberry species, use fully ripe berries according to reputable cooking guidance; do not assume unidentified Solanum berries are edible.",
  "who": "People eating the fruit, especially children; keep pets away from unknown berries.",
  "source": "https://www.poison.org/"
 },
 "Pokeberry (Phytolacca americana)": {
  "why": "Pokeweed contains toxic substances in roots, leaves, stems and berries; eating it can cause significant poisoning. Cooking does not make unidentified or improperly prepared material reliably safe.",
  "how": "Treat it as an ornamental, not a food crop. Do not eat berries, roots or leaves or make homemade remedies. Wear gloves when removing plants and keep cut material away from children and animals.",
  "who": "Children, pets and anyone tempted by the berries or traditional food uses.",
  "source": "https://www.poison.org/"
 },
 "Afghan Poppy": {
  "why": "The exact botanical species is unconfirmed. Some poppies contain poisonous alkaloids in milky sap and pods; the common name alone cannot establish edible or legal uses.",
  "how": "Verify the seed packet's botanical name. Do not consume stems, green pods, latex or home extracts. Grow only after checking applicable local requirements and keep plant material away from children and pets.",
  "who": "Anyone handling or ingesting unidentified poppy plant material, plus children and pets.",
  "source": "https://www.poison.org/"
 },
 "Giant Exotic Poppy (Papaver somniferum)": {
  "why": "Papaver somniferum green seed pods and milky latex contain potent alkaloids; ingestion or preparation of concentrated extracts can be dangerous. Local cultivation rules may apply.",
  "how": "Do not ingest pod latex, raw pods or homemade preparations, and do not extract alkaloids. Keep plants inaccessible to children and pets; check local restrictions before growing.",
  "who": "Children, pets and anyone handling or consuming poppy plant material.",
  "source": "https://www.poison.org/"
 },
 "Lily of the Valley (Convallaria majalis)": {
  "why": "All parts contain cardiac glycosides that can disturb heart rhythm; the red berries are especially tempting to children.",
  "how": "Never consume any part or use it as a remedy. Wear gloves when dividing or pulling plants, clean tools and hands, and prevent access by children and pets.",
  "who": "Children, pets and anyone who might mistake the plant for an edible green.",
  "source": "https://www.poison.org/"
 },
 "Rue": {
  "why": "Rue sap contains phototoxic compounds that can cause painful skin inflammation or blistering when exposed skin receives sunlight.",
  "how": "Wear gloves, long sleeves and eye protection when pruning; avoid sap on skin and wash promptly if it contacts you. Keep exposed skin out of sunlight after contact. Do not ingest rue or use it as a homemade medicinal preparation.",
  "who": "Gardeners with exposed skin, children and pregnant people considering medicinal use.",
  "source": "https://www.poison.org/"
 },
 "Herb of Paris (Paris quadrifolia)": {
  "why": "Herb of Paris (Paris quadrifolia) is poisonous; its dark berry may be mistaken for an edible woodland fruit.",
  "how": "Never eat the berries or other parts. Label the planting clearly, wear gloves for handling, and do not leave berries where children or pets can reach them.",
  "who": "Children, foragers and pets.",
  "source": "https://www.poison.org/"
 },
 "Henbane (species unspecified)": {
  "why": "Henbane species contain tropane alkaloids such as hyoscyamine and scopolamine. All plant parts can be highly poisonous.",
  "how": "Never ingest, brew or use henbane as a home remedy. Wear gloves when handling, wash hands and keep the planting secure from children, pets and livestock; confirm species on the seed packet.",
  "who": "Children, pets, livestock and anyone handling or consuming the plant.",
  "source": "https://www.poison.org/"
 },
 "Foxglove (species unspecified)": {
  "why": "Foxglove contains cardiac glycosides, including digitalis-related compounds. Eating leaves, flowers or seeds can cause life-threatening heart rhythm problems.",
  "how": "Never consume any part or make herbal remedies. Label the plant, wear gloves for garden work, wash hands and keep children and pets away.",
  "who": "Children, pets and anyone who could confuse leaves with an edible herb.",
  "source": "https://www.poison.org/"
 },
 "Deadly Nightshade / Belladonna (Atropa belladonna)": {
  "why": "Belladonna berries, leaves and other parts contain atropine and related tropane alkaloids. Even small ingestions can cause severe poisoning.",
  "how": "Never eat the berries or use the plant for home medicine. Wear gloves, wash hands after contact, label clearly and grow only where children and pets cannot reach it.",
  "who": "Children attracted to berries, pets and anyone handling or ingesting plant material.",
  "source": "https://www.poison.org/"
 },
 "Virginia Gold Tobacco (Nicotiana tabacum)": {
  "why": "Tobacco contains nicotine, which is toxic if swallowed and can be absorbed through skin, especially from wet leaves (green tobacco sickness).",
  "how": "Wear waterproof gloves and long sleeves, especially when foliage is wet; wash after handling. Never ingest leaves or extracts, and keep seeds, leaves and curing material away from children and pets.",
  "who": "Gardeners handling wet tobacco, children, pets and livestock.",
  "source": "https://www.cdc.gov/niosh/"
 }
,
 "Wild Jungle Peanut (Arachis hypogaea)": {
 "why": "Peanuts are a major food allergen and can cause anaphylaxis. Improperly dried or damp-stored peanut pods can develop molds that produce aflatoxins.",
 "how": "Do not serve or expose peanuts to anyone with a known peanut allergy. Harvest mature pods, cure and store promptly in clean, dry conditions; discard spoiled, damp or moldy peanuts instead of tasting them. Avoid consuming untreated planting seeds.",
 "who": "People with peanut allergies, including children, and anyone eating improperly stored nuts.",
 "source": "https://www.fda.gov/food/food-labeling-nutrition/food-allergies"
}
,
"American Ginseng":{"why":"Ginseng preparations may affect blood sugar and interact with medicines; wild ginseng collection can be restricted.","how":"Do not self-medicate with roots or extracts. Check medication interactions and local ginseng conservation/harvest rules.","who":"People using blood thinners, blood-sugar medicines, and children.","source":"https://www.nccih.nih.gov/health/asian-ginseng"},
"Panax Ginseng (species unverified)":{"why":"Panax identifies a genus, not the exact species. Ginseng products can interact with medicines and change blood sugar.","how":"Verify packet species. Do not ingest or make medicinal extracts without professional medicine-interaction advice.","who":"People taking prescriptions, pregnant people and children.","source":"https://www.nccih.nih.gov/health/asian-ginseng"},
"Pennyroyal Mint":{"why":"Pennyroyal oil contains pulegone and can cause severe liver injury, seizures and death; it is particularly unsafe in pregnancy.","how":"Never swallow pennyroyal oil or use it as tea, a medicine, or to induce menstruation. Keep oil and plant preparations away from children and pets.","who":"Pregnant people, children, pets and anyone using essential oils.","source":"https://www.poison.org/"},
"Milk Thistle":{"why":"Milk thistle has sharp spines; extracts can cause allergies or interact with medicines.","how":"Wear gloves for handling. Do not self-prescribe medicinal supplements without checking allergies and medication interactions. Prevent unwanted self-seeding.","who":"People allergic to daisies or ragweed and people taking prescriptions.","source":"https://www.nccih.nih.gov/health/milk-thistle"},
"Blue Camas":{"why":"Some edible camas species closely resemble poisonous death camas; mistaken bulb identity can be fatal.","how":"Treat planted bulbs as ornamental only. Never eat any camas-like bulb without expert botanical identification. Label clearly and keep away from pets/children.","who":"Foragers, children and pets.","source":"https://www.poison.org/"},
"Borage":{"why":"Borage plant parts can contain pyrrolizidine alkaloids that may injure the liver if ingested repeatedly or concentrated.","how":"Grow for bees; avoid self-medicating or regularly eating leaves, flowers or concentrated extracts, especially with liver disease.","who":"Pregnant people, people with liver disease, and users of herbal concentrates.","source":"https://www.poison.org/"},
"Comfrey":{"why":"Comfrey contains pyrrolizidine alkaloids that can seriously damage the liver.","how":"Do not eat comfrey, brew tea or prepare internal remedies; avoid use on broken skin and wash hands after handling.","who":"Children, pregnant people and anyone using medicinal preparations.","source":"https://www.nccih.nih.gov/health/comfrey"},
"White Yarrow":{"why":"Yarrow may cause allergic skin reactions in people sensitive to daisy-family plants.","how":"Wear gloves if it causes irritation, avoid ingesting medicinal preparations, and discontinue handling if a rash develops.","who":"People with ragweed/chrysanthemum allergies and sensitive skin.","source":"https://www.poison.org/"},
"St. John's Wort":{"why":"St. John's wort changes metabolism of many medicines, reducing effects of some birth control, transplant or HIV drugs; combining with antidepressants can cause serotonin toxicity.","how":"Never take preparations with prescription drugs without a pharmacist review; monitor and control unwanted self-seeding.","who":"People taking medicines, especially antidepressants and hormonal contraception.","source":"https://www.nccih.nih.gov/health/st-johns-wort-and-depression-in-depth"},
"Calendula Pacific Beauty":{"why":"Calendula may cause allergic contact reactions, especially in people sensitive to other daisy-family flowers.","how":"Do not assume flowers are edible or skin-safe. Confirm botanical identity and avoid skin contact if allergic.","who":"People with daisy/ragweed allergies.","source":"https://www.poison.org/"},
"Toothache Plant (Spilanthes oleracea)":{"why":"Flowers contain compounds that cause tingling and temporary numbness and can irritate the mouth.","how":"Do not use as a substitute for dental care or apply extracts to eyes or wounds; avoid giving concentrated preparations to children.","who":"Children and anyone with oral sensitivity or untreated dental infections.","source":"https://www.poison.org/"},
"Pyrethrum Daisy":{"why":"Natural pyrethrins in pyrethrum have insecticidal effects; concentrates can harm cats, fish and aquatic animals.","how":"Do not make homemade concentrated insecticides. Avoid sprays around cats, ponds and aquariums. Wear gloves if skin reacts.","who":"Cats, fish, aquatic animals and people allergic to daisies.","source":"https://vcahospitals.com/three-notch/know-your-pet/pyrethrinpyrethroid-poisoning-in-cats"},
"Bishop's Flower":{"why":"Ammi majus can contain phototoxic chemicals: sap plus sunlight may cause painful blistering skin inflammation.","how":"Confirm species and wear gloves, long sleeves and eye protection while cutting; wash skin and avoid direct sunlight after sap contact.","who":"Gardeners with sun-exposed skin, especially sensitive individuals.","source":"https://www.poison.org/"},
"Stinging Nettle":{"why":"Fine hairs on living nettle leaves and stems inject skin irritants, causing burning, welts and itching.","how":"Wear thick gloves, long sleeves and eye protection for harvesting or removal; do not touch raw foliage with bare skin.","who":"Children, pets and people with exposed skin.","source":"https://www.poison.org/"},
"Blue Agave":{"why":"Agave leaves have sharp spines and the sap can irritate skin and eyes.","how":"Use gloves, long sleeves and eye protection; avoid eyes and wash skin after sap contact. Keep thorny tips away from paths.","who":"Gardeners, children, pets, and sensitive skin.","source":"https://www.poison.org/"},
"German Chamomile":{"why":"Chamomile can provoke allergies, especially in people sensitive to ragweed and daisy-family flowers; remedies may interact with some medicines.","how":"Avoid tea or cosmetic use if allergic and consult a clinician before medicinal use with prescription drugs.","who":"People with daisy/ragweed allergies or taking interacting medicines.","source":"https://www.nccih.nih.gov/health/chamomile"},
"Passion Flower":{"why":"Passiflora species vary in their edible parts and toxicity. Some medicinal extracts can increase sedative effects.","how":"Verify exact species before eating leaves/fruit. Do not self-prescribe extracts or combine with sedatives or alcohol.","who":"Children, pets, people taking sedatives and pregnant people.","source":"https://www.nccih.nih.gov/health/passionflower"},
"Giant Bamboo":{"why":"The species is unknown and some giant bamboos spread aggressively via running rhizomes, escaping gardens and damaging adjacent spaces.","how":"Identify the species and whether it is running or clumping before planting. Use a designed rhizome barrier or container where appropriate.","who":"Adjacent gardeners, neighbors and property owners.","source":"https://www.rhs.org.uk/plants/bamboo/growing-guide"},
"Valerian":{"why":"Valerian extracts can cause drowsiness and may add to sedative medicines or alcohol.","how":"Avoid combining preparations with sedatives or alcohol; do not self-medicate. Keep extracts out of children's reach.","who":"People using sedatives, drivers, pregnant people and children.","source":"https://www.nccih.nih.gov/health/valerian"}
};
function safetyForSeed(name,tags){
 const flagged=String(tags||"").split("|").includes("Caution");
 if(!flagged)return null;
 return seedCautionInfo[name]||{
  why:"This seed is marked Caution, but the species-specific risk has not been verified for this label.",
  how:"Confirm the precise botanical identity and consult authoritative plant-safety instructions before eating, handling or using it medicinally. Keep it away from children and pets until identified.",
  who:"Anyone handling or consuming a plant with an unverified identity.",
  source:"https://www.poison.org/"
 };
}
function seedSafetyBrief(safety){
 if(!safety)return "";
 return '<div class="seed-caution-summary" role="note"><p><strong>⚠️ Why Caution:</strong> '+esc(safety.why)+'</p>'+
  '<p><strong>How to stay safe:</strong> '+esc(safety.how)+'</p></div>';
}
function seedSafetyDetails(safety){
 if(!safety)return "";
 return '<section class="seed-safety-details" aria-label="Plant-specific caution details">'+
  '<h4>⚠️ Caution: what is dangerous and what to do</h4>'+
  '<p><strong>Why:</strong> '+esc(safety.why)+'</p>'+
  '<p><strong>How:</strong> '+esc(safety.how)+'</p>'+
  '<p><strong>Who is at risk:</strong> '+esc(safety.who)+'</p>'+
  '<p class="safety-ref">General safety reference: <a href="'+esc(safety.source)+'" target="_blank" rel="noopener noreferrer">View source / poison safety guidance</a></p>'+
  '</section>';
}
function refreshSeedSafety(p){
 const card=p.card,safety=safetyForSeed(p.name,card.dataset.tags);
 const oldBrief=card.querySelector(".seed-caution-summary"),oldDetails=card.querySelector(".seed-safety-details");
 if(oldBrief)oldBrief.remove();if(oldDetails)oldDetails.remove();
 if(!safety)return;
 card.querySelector(".seed-actions").insertAdjacentHTML("beforebegin",seedSafetyBrief(safety));
 card.querySelector(".plant-links").insertAdjacentHTML("beforebegin",seedSafetyDetails(safety));
}

function tagContent(card){
 const name=card.dataset.name,cat=card.dataset.category,g=resolveGuide(name,cat);
  const safety=safetyForSeed(name,card.dataset.tags);
 const wiki=wikiFor(name,cat), key=cat+"|"+name;
 const kind=Object.keys(guides).find(k=>guides[k]===g)||"generic";
 const wikiUrl=wiki?"https://en.wikipedia.org/wiki/"+encodeURIComponent(wiki.replace(/ /g,"_")):null;
 const link=wiki?'<a href="'+esc(wikiUrl)+'" target="_blank" rel="noopener noreferrer">Wikipedia · '+esc(wiki)+'</a>':'';
 const ext=referenceGuides[kind];
 const links=link+(ext?' <a href="'+esc(ext[1])+'" target="_blank" rel="noopener noreferrer">'+esc(ext[0])+'</a>':'')+' <a href="https://www.uaf.edu/ces/garden/greenhouses/index.php" target="_blank" rel="noopener noreferrer">UAF · Alaska greenhouse gardening</a>';
 const tip=cat==="Peppers"?"Use the Scoville scale above to compare heat.":"Growing values are general crop guidance unless the actual cultivar is verified.";
 const age=g.days;
 const where=setupDescription(g);
 const quick='<div class="seed-brief">'+esc(g.depth)+' deep · '+esc(g.light)+'</div><p class="seed-photo-state" aria-live="polite">Checking photo…</p>';
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
  '<p class="calendar-date" data-method="'+esc(g.mode)+'">Calendar: Choose a last frost date in Garden Planner to get a suggested window.</p>'+
  '<p class="uncertain">General species or crop guidance, not a test of this seed packet. Follow a verified packet label when it differs.</p></div>'+
  seedSafetyDetails(safety)+'<div class="plant-links">'+links+'</div>'+
  '<div class="seed-photo-tools" aria-label="Your photos">'+
   '<label>📷 Add / replace plant photo<input class="upload-photo" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Add or replace plant photo of '+esc(name)+'"></label>'+
   '<label>📦 Add / replace packet photo<input class="upload-packet-photo" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Add or replace packet photo of '+esc(name)+'"></label></div>'+
   '<div class="photo-url-tools" aria-label="Pictures from the web">'+
   '<div class="photo-url-field" data-kind="plant"><label>Plant picture web address<input class="remote-photo-input" type="url" maxlength="2048" placeholder="https://example.org/variety.jpg" aria-label="Plant picture URL for '+esc(name)+'"></label><div class="photo-url-actions"><button type="button" class="preview-photo-url">Preview plant image</button><button type="button" class="save-photo-url">Save plant URL</button><button type="button" class="delete-photo-url" hidden>Remove plant URL</button></div><img class="remote-photo-preview" alt="Preview of plant image" hidden><p class="remote-photo-feedback" role="status" aria-live="polite">Paste a direct picture link, not a webpage address.</p></div>'+
   '<div class="photo-url-field" data-kind="packet"><label>Seed-packet picture web address<input class="remote-photo-input" type="url" maxlength="2048" placeholder="https://example.org/packet.jpg" aria-label="Seed packet picture URL for '+esc(name)+'"></label><div class="photo-url-actions"><button type="button" class="preview-photo-url">Preview packet image</button><button type="button" class="save-photo-url">Save packet URL</button><button type="button" class="delete-photo-url" hidden>Remove packet URL</button></div><img class="remote-photo-preview" alt="Preview of seed packet image" hidden><p class="remote-photo-feedback" role="status" aria-live="polite">You do not have to download the picture first.</p></div>'+
   '</div>'+
   '<div class="photo-switcher" aria-label="Choose which photo appears on card">'+
   '<button type="button" class="photo-mode-button" data-photo-mode="variety" hidden>Show sourced image</button>'+
   '<button type="button" class="photo-mode-button" data-photo-mode="plant" hidden>Show my plant</button>'+
   '<button type="button" class="photo-mode-button" data-photo-mode="packet" hidden>Show my packet</button></div>'+
   '<div class="photo-delete-controls">'+
   '<button class="remove-photo" type="button" hidden>Delete my plant photo</button>'+
   '<button class="remove-packet-photo" type="button" hidden>Delete my packet photo</button></div>'+
   '<p class="photo-search-link"><a class="find-variety-photo" href="#" rel="noopener noreferrer" target="_blank">Find more photos of this variety on Wikimedia Commons</a></p>'+
  '<p class="photo-credit">Exact variety image not yet confirmed. You can upload your own.</p>'+
  '<div class="plant-guide-close"><button type="button" class="close-planting-guide" aria-label="Close planting details for '+esc(name)+'">× Close planting details</button></div>'+
  '</details>';
 const thumb='<button type="button" class="seed-thumb" aria-label="View photo for '+esc(name)+'" title="Open plant photo"><span class="seed-illustration">'+seedFallbackMarkup(name,cat)+'</span></button>';
 const top=card.querySelector(".seed-top");
 const stock=top.querySelector(".stock-badge");
 const existingTop=top.outerHTML;
 const nameText=top.querySelector(".seed-name").textContent;
 const replacement='<div class="seed-overview">'+thumb+'<div class="seed-text">'+existingTop+quick+'</div></div>';
 top.outerHTML=replacement;
 card.insertAdjacentHTML("beforeend",details+seedSafetyBrief(safety)+'<div class="seed-actions"><button class="log-planting" type="button">＋ Log planting</button><button class="manage-photos" type="button">📷 Manage photos</button></div>');
 card.dataset.growMode=g.mode;card.dataset.growingSetup=g.setup;card.dataset.userPhoto="no";card.dataset.guideKind=kind;
 plants.set(key,{key,name:nameText,cat,guide:g,kind,wiki,wikiUrl,card});
}
cards.forEach(tagContent);

// Native details elements open and close independently for each seed card.
cards.forEach(card=>{
 const guide=card.querySelector(".seed-details");
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

// The legend and every card purpose chip share the existing Purpose / role filter.
// Toggle the same chip to return to the unfiltered, initially collapsed collection.
const purposeSelect=document.getElementById("purposeFilter");
const purposeChips=Array.from(document.querySelectorAll("button[data-purpose-tag]"));
const knownPurposes=new Set(Array.from(purposeSelect.options).map(option=>option.value).filter(Boolean));
function syncPurposeChips(){
 const current=purposeSelect.value;
 document.querySelectorAll("button[data-purpose-tag]").forEach(chip=>{
  const active=chip.dataset.purposeTag===current;
  chip.setAttribute("aria-pressed",String(active));
  chip.classList.toggle("is-selected",active);
  chip.title=active?"Clear "+current+" filter":"Show all "+chip.dataset.purposeTag+" seeds";
 });
}
function selectPurposeByChip(value){
 if(!knownPurposes.has(value))return;
 const next=purposeSelect.value===value?"":value;
 // Chips mean 'all matching seeds', so older unrelated filters must not hide results.
 search.value="";
 ["categoryFilter","sourceFilter","quantityFilter","heatFilter","growFilter","photoFilter"].forEach(id=>{
  const input=document.getElementById(id);
  if(input)input.value="";
 });
 purposeSelect.value=next;
 search.dispatchEvent(new Event("input",{bubbles:true}));
 purposeSelect.dispatchEvent(new Event("change",{bubbles:true}));
 if(!next)cats.forEach(section=>{section.open=false;});
 syncPurposeChips();
 const collection=document.getElementById("collection");
 if(collection)collection.scrollIntoView({behavior:"auto",block:"start"});
}
document.addEventListener("click",event=>{
 const chip=event.target.closest&&event.target.closest("button[data-purpose-tag]");
 if(!chip)return;
 selectPurposeByChip(chip.dataset.purposeTag);
});
purposeSelect.addEventListener("change",syncPurposeChips);
document.getElementById("reset").addEventListener("click",syncPurposeChips);
document.querySelectorAll("[data-jump]").forEach(button=>button.addEventListener("click",syncPurposeChips));
syncPurposeChips();

function applyExtraFilters(){
 const grow=growFilter.value,photo=photoFilter.value;
 let count=0,units=0,unknownCounts=0,sectionsCount=0;
 cats.forEach(section=>{
  let n=0;
  section.querySelectorAll(".seed").forEach(card=>{
   const alreadyVisible=!card.hidden;
   const goodGrow=!grow||(grow==="outdoor"?card.dataset.growingSetup==="outdoor":grow==="protected"?card.dataset.growingSetup==="protected":grow==="heated"?card.dataset.growingSetup==="heated":card.dataset.growingSetup==="verify");
   const goodPhoto=!photo||photo===card.dataset.userPhoto;
   const visible=alreadyVisible&&goodGrow&&goodPhoto;
   card.hidden=!visible;
   if(visible){n++;count++;units+=Number(card.dataset.amount);if(card.dataset.quantityKnown==="no")unknownCounts++;}
  });
  section.hidden=n===0;
  section.querySelector(".visible-num").textContent=n;
  if(n)sectionsCount++;
 });
 document.getElementById("count").textContent="Showing "+count+" of "+cards.length+" seed entries · "+units+" known packets / lots"+(unknownCounts?" · "+unknownCounts+" count(s) unconfirmed":"")+" · "+sectionsCount+" categories";
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
const planner=document.createElement("details");planner.id="growPlanner";
planner.innerHTML='<summary>🌱 Garden Planner</summary><div class="planner-body"><p>Choose a region and growing setup. Alaska varies enormously from town to town; planting dates depend on your actual frost dates and greenhouse heating.</p>'+
'<div class="planner-controls"><label>Growing region<select id="regionSelect"><option value="alaska">Alaska (location TBD)</option><option value="kansas">Kansas</option><option value="custom">Other location</option></select></label>'+
'<label>Growing space<select id="envSelect"><option value="outdoors">Outdoor garden</option><option value="unheated">Unheated greenhouse</option><option value="heated">Heated greenhouse</option><option value="indoors">Indoors / grow lights</option></select></label>'+
'<label>Expected last spring frost<input id="frostDate" type="date" aria-label="Estimated last spring frost date"></label></div><div class="journal-toolbar"><button class="journal-btn" id="plantNow" type="button">🌱 What could I plant now?</button></div><div id="plantNowResult" class="plant-now" hidden></div>'+
'<p id="plannerNotice" role="status">Set your expected last spring frost to calculate approximate sowing windows.</p></div>';
// Garden Planner stays at the top, immediately beneath the main search controls.
// Medieval Monastery Garden is a separate sibling beneath Recipe Guide.
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
const section=document.createElement("details");section.id="seedJournal";
section.innerHTML='<summary>📔 Planting Journal</summary>'+
'<div class="journal-body"><p id="journalCount" class="journal-count">8 recorded plantings</p><p class="journal-note">Track sowing, sprouting, transplanting and harvests. Entries and photos are stored in this browser, not automatically synced to GitHub or other devices. Export a backup to keep them safe.</p>'+
'<div class="journal-toolbar"><button class="journal-btn primary" id="addJournal" type="button">＋ Record planting</button><button hidden class="journal-btn" id="exportJournal" type="button">↓ Export backup (with photos)</button><label hidden class="journal-btn" style="cursor:pointer">↑ Import backup<input id="importJournal" type="file" accept="application/json,.json" hidden></label></div>'+
'<div class="journal-card-list" id="journalEntries"></div>'+
'<form id="journalForm" hidden><h3 id="journalFormTitle">Record planting</h3><div class="form-grid">'+
'<label>Plant name<input name="plant" required maxlength="100" placeholder="e.g. Basil"></label>'+
'<label>Variety (optional)<input name="variety" maxlength="120" placeholder="Unknown / basic variety"></label>'+
'<label class="full-span">Link exact variety from my Seed Bank<select name="seedKey" id="journalSeedKey"><option value="">Unknown / not selected</option></select><small>Only choose a specific seed if you know it was planted. Reference pictures alone do not identify a variety.</small></label>'+
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
function updateJournalGrowth(id,photo,remove=false){
 const index=journal.findIndex(entry=>String(entry.id)===String(id));
 if(index<0||!photo||typeof photo.id!=="string")return false;
 const current=journal[index];
 const existing=Array.isArray(current.growthPhotos)?current.growthPhotos:[];
 if(!remove&&(existing.length>=200||existing.some(item=>item.id===photo.id)))return false;
 if(remove&&!existing.some(item=>item.id===photo.id))return false;
 const growthPhotos=remove?existing.filter(item=>item.id!==photo.id):[...existing,photo];
 const updated=journal.slice();
 const removed=remove?[...(Array.isArray(current.growthPhotosRemoved)?current.growthPhotosRemoved:[]),
  {id:photo.id,at:new Date().toISOString()}]:current.growthPhotosRemoved||[];
 updated[index]={...current,growthPhotos,growthPhotosRemoved:removed,syncUpdatedAt:new Date().toISOString()};
 if(!save(storageKey,updated))return false;
 journal=updated;renderJournal();return true;
}
function updateJournalMeasurement(id,record,remove=false){
 const index=journal.findIndex(entry=>String(entry.id)===String(id));
 if(index<0||!record||typeof record.id!=="string")return false;
 const existing=Array.isArray(journal[index].growthMeasurements)?journal[index].growthMeasurements:[];
 const found=existing.findIndex(item=>item.id===record.id);
 if(remove&&found<0)return false;
 if(!remove&&found<0&&existing.length>=500)return false;
 const next=remove?existing.filter(item=>item.id!==record.id):
  found>=0?existing.map(item=>item.id===record.id?record:item):[...existing,record];
 const current=journal[index];
 const removed=remove?[...(Array.isArray(current.growthMeasurementsRemoved)?current.growthMeasurementsRemoved:[]),
  {id:record.id,at:new Date().toISOString()}]:current.growthMeasurementsRemoved||[];
 const updated=journal.slice();updated[index]={...current,growthMeasurements:next,
  growthMeasurementsRemoved:removed,syncUpdatedAt:new Date().toISOString()};
 if(!save(storageKey,updated))return false;
 journal=updated;renderJournal();return true;
}
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
 document.dispatchEvent(new CustomEvent("dkseedbank:journal-rendered",{detail:{entries:sorted}}));
}
function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function openForm(entry){
 section.open=true;journalForm.hidden=false;editId=entry?entry.id:null;journalForm.dataset.seedKey=entry&&entry.seedKey?entry.seedKey:"";
 const select=journalForm.elements.namedItem("seedKey");
 select.innerHTML='<option value="">Unknown / not selected</option>'+[...plants.values()].map(p=>'<option value="'+esc(p.key)+'">'+esc(p.cat+" · "+p.name)+'</option>').join("");

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
 if(del){const item=journal.find(x=>x.id===del.dataset.delete);
  if(item&&window.confirm("Delete the "+item.plant+" planting record?")){
   const remaining=journal.filter(x=>x.id!==item.id);
   if(!save(storageKey,remaining)){alert("Unable to delete planting: local storage is unavailable.");return;}
   journal=remaining;
   journalDeletes=[...journalDeletes.filter(row=>row.id!==item.id),
    {id:item.id,deletedAt:new Date().toISOString()}];
   save(journalDeletesKey,journalDeletes);
   document.dispatchEvent(new CustomEvent("dkseedbank:journal-deleted",{detail:{entry:item}}));
   renderJournal();
  }
 }
});
journalForm.addEventListener("submit",event=>{
 event.preventDefault();
 const f=new FormData(journalForm);
 const requestedKey=String(f.get("seedKey")||"");
 const selectedKey=plants.has(requestedKey)?requestedKey:"";
 const item={id:editId||"log-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),seedKey:selectedKey,
 plant:String(f.get("plant")||"").trim(),variety:selectedKey&&(!String(f.get("variety")||"").trim()||/standard type; exact cultivar not specified/i.test(String(f.get("variety")||"")))?plants.get(selectedKey).name:String(f.get("variety")||"").trim(),
 date:String(f.get("date")||""),time:String(f.get("time")||""),approxTime:false,
 minSeeds:Number(f.get("minSeeds")||0),maxSeeds:Number(f.get("maxSeeds")||0),
 soakHours:Number(f.get("soakHours")||0),medium:String(f.get("medium")||"").trim(),
 location:String(f.get("location")||"").trim(),status:String(f.get("status")||"Sown"),
 sprouted:String(f.get("sprouted")||""),germinatedCount:f.get("germinatedCount")===""?null:Number(f.get("germinatedCount")),survivedCount:f.get("survivedCount")===""?null:Number(f.get("survivedCount")),notes:String(f.get("notes")||"").trim()};
 if(!item.plant||!item.date||item.maxSeeds&&item.minSeeds>item.maxSeeds){alert("Check the plant name, date and seed count range.");return;}
 if(editId){
  const previous=journal.find(x=>x.id===editId);
  if(Array.isArray(previous?.growthPhotos))item.growthPhotos=previous.growthPhotos;
  if(Array.isArray(previous?.growthMeasurements))item.growthMeasurements=previous.growthMeasurements;
  if(Array.isArray(previous?.growthPhotosRemoved))item.growthPhotosRemoved=previous.growthPhotosRemoved;
  if(Array.isArray(previous?.growthMeasurementsRemoved))item.growthMeasurementsRemoved=previous.growthMeasurementsRemoved;
  item.syncUpdatedAt=new Date().toISOString();
  journal=journal.map(x=>x.id===editId?item:x);
 }else {item.syncUpdatedAt=new Date().toISOString();journal.push(item);}
 if(!save(storageKey,journal))alert("This browser blocked local storage. Export a backup to preserve your entries.");
 editId=null;journalForm.hidden=true;renderJournal();
});
cards.forEach(card=>card.querySelector(".log-planting").addEventListener("click",()=>openForm({seedKey:card.dataset.category+"|"+card.dataset.name,plant:card.dataset.name,variety:card.dataset.name,date:today(),status:"Sown"})));
renderJournal();
const photoDialog=document.createElement("dialog");photoDialog.id="photoDialog";photoDialog.innerHTML='<div class="photo-modal-body"><div class="photo-modal-header"><strong id="modalPhotoTitle">Plant reference</strong><button id="closePhoto" type="button" aria-label="Close photo">×</button></div><img id="modalPhotoImage" alt="Plant photograph"><p id="modalPhotoCredit" class="photo-credit"></p></div>';
document.body.appendChild(photoDialog);
document.getElementById("closePhoto").addEventListener("click",()=>photoDialog.close());
photoDialog.addEventListener("click",e=>{if(e.target===photoDialog)photoDialog.close();});

function photoMatch(p){return p.key===p.cat+"|"+p.name&&Object.prototype.hasOwnProperty.call(checkedPhotoCatalog,p.key)?checkedPhotoCatalog[p.key]:null;}
function commonsFilePage(meta){
 if(meta.url)return meta.source||meta.url;
 return "https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(meta.file.replace(/ /g,"_"));
}
function commonsImageUrl(meta){
 if(meta.url)return meta.url;
 return "https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(meta.file.replace(/ /g,"_"))+"?width=560";
}
function availablePhotoUrls(p){
 const match=photoMatch(p);
 return {variety:match?commonsImageUrl(match):null,plant:savedImageLink(p,"plant")||userPhotos.get(p.key)||null,packet:savedImageLink(p,"packet")||packetPhotos.get(p.key)||null};
}
function showPhoto(p){
 const img=p.card.querySelector(".seed-thumb img");
 if(!img)return openPhotoTools(p);
 const mode=p.currentPhotoMode;
 const credit=document.getElementById("modalPhotoCredit");
 const title=document.getElementById("modalPhotoTitle");
 document.getElementById("modalPhotoImage").src=img.src;
 title.textContent=p.name+(mode==="packet"?" · your packet":mode==="plant"?" · your photo":" · sourced photograph");
 credit.textContent="";
 if(mode==="variety"&&photoMatch(p)){
  const meta=photoMatch(p);
  credit.appendChild(document.createTextNode((meta.url?"Source: ":"Photographer: ")+meta.author+" · "+(meta.url?"External image; reuse rights unverified":"License: "+meta.license)+" · "));
  const a=document.createElement("a");a.href=commonsFilePage(meta);a.target="_blank";a.rel="noopener noreferrer";a.textContent=meta.url?"View original source page":"Original image, source and licensing details";credit.appendChild(a);
 }else if(savedImageLink(p,mode)){
  const link=document.createElement("a");link.href=savedImageLink(p,mode);link.target="_blank";link.rel="noopener noreferrer";link.textContent="Original image address";
  credit.appendChild(document.createTextNode("Web picture selected by you. Check the original website for usage rights. "));
  credit.appendChild(link);
 }else credit.textContent="Your uploaded photograph is stored on this browser. Export a backup to preserve it.";
 if(typeof photoDialog.showModal==="function")photoDialog.showModal();
 else photoDialog.setAttribute("open","");
}
function refreshPhoto(p){
 const match=photoMatch(p), images=availablePhotoUrls(p);
 let mode=photoPreferences[p.key];
 if(!images[mode])mode=images.plant?"plant":images.variety?"variety":images.packet?"packet":"none";
 p.currentPhotoMode=mode;
 const thumb=p.card.querySelector(".seed-thumb");
 thumb.textContent="";
 if(mode==="none"){
  placeSeedFallback(thumb,p.name,p.cat);
  thumb.title="Generic plant illustration, not a photograph of this variety. Choose Manage photos to add your own.";
 }else{
  const image=document.createElement("img");image.src=images[mode];image.alt=(mode==="variety"?(match.level==="packet"?"Source image of named seed packet":"Sourced "+(match.level==="cultivar"?"named cultivar":"plant type")+" photo"):mode==="plant"?"Your growing plant":"Your seed packet")+" of "+p.name;
  image.loading="lazy";image.decoding="async";
  image.addEventListener("error",()=>{
   if(image.parentNode!==thumb)return;
   thumb.textContent="";placeSeedFallback(thumb,p.name,p.cat);
   p.card.querySelector(".seed-photo-state").textContent="Image unavailable. View source or add your photo.";
  });
  thumb.appendChild(image);
  thumb.title="Enlarge "+(mode==="packet"?"your packet photo":mode==="plant"?"your plant photo":"the sourced variety photo");
 }
 let status="No exact variety photo verified";
 if(mode==="plant")status=savedImageLink(p,"plant")?"Showing your linked plant photograph":"Showing your plant photo";
 else if(mode==="packet")status=savedImageLink(p,"packet")?"Showing your linked seed packet photograph":"Showing your packet photo";
 else if(mode==="variety")status=match.level==="packet"?"Named seed-packet photo (not growing carrots)":match.level==="cultivar"?(match.url?"Seller's photo of named cultivar":"Photo of named cultivar"):match.level==="type"?"Matching plant type · exact strain unverified":match.level==="species"?"Correct species · exact seed strain unknown":"One example of this seed blend";
 p.card.querySelector(".seed-photo-state").textContent=status;
 p.card.dataset.userPhoto=(images.plant||images.packet)?"yes":"no";
 const credit=p.card.querySelector(".photo-credit");credit.textContent="";
 if(match){
  credit.appendChild(document.createTextNode("Sourced photo: "+match.author+" · "+(match.url?"External image; reuse rights unverified":match.license)+" · "));
  const link=document.createElement("a");link.href=commonsFilePage(match);link.target="_blank";link.rel="noopener noreferrer";link.textContent=match.url?"View original supplier source":"View original, attribution and reuse license";credit.appendChild(link);
  if(match.level!=="cultivar")credit.appendChild(document.createTextNode(match.level==="packet"?". This shows a commercial seed packet, not harvested carrots.":". This is a type/species/example image, not a guaranteed exact seed-packet cultivar."));
  if(match.note)credit.appendChild(document.createTextNode(" "+match.note));
  if(match.url)credit.appendChild(document.createTextNode(" Image is linked from the seller's site, not copied to this repository."));
 }else credit.textContent="No reliable exact-variety photo was found and none has been substituted. Add your own plant or seed-packet picture.";
 for(const button of p.card.querySelectorAll("[data-photo-mode]")){
  const kind=button.dataset.photoMode;button.hidden=!images[kind];button.setAttribute("aria-pressed",String(kind===mode));
 }
 p.card.querySelector(".remove-photo").hidden=!userPhotos.has(p.key);
 p.card.querySelector(".remove-packet-photo").hidden=!packetPhotos.has(p.key);
 for(const kind of ["plant","packet"]){
  const control=p.card.querySelector('.photo-url-field[data-kind="'+kind+'"]');
  const stored=savedImageLink(p,kind);
  control.querySelector(".delete-photo-url").hidden=!stored;
  const input=control.querySelector(".remote-photo-input");
  if(document.activeElement!==input)input.value=stored||"";
 }
 if(savedImageLink(p,"plant")||savedImageLink(p,"packet")){
  credit.appendChild(document.createTextNode(" Linked image addresses are saved in your browser and in exported backups."));
 }
}
function choosePhotoMode(p,mode){
 if(!availablePhotoUrls(p)[mode])return;
 photoPreferences[p.key]=mode;save(photoPreferenceKey,photoPreferences);
 refreshPhoto(p);
}
function openPhotoTools(p){
 const guide=p.card.querySelector(".seed-details");
 if(!guide.open)guide.open=true;
 guide.querySelector(".seed-photo-tools").scrollIntoView({behavior:"smooth",block:"nearest"});
}
async function storeUpload(p,kind,input){
 const file=input.files&&input.files[0];input.value="";
 if(!file)return;
 if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>6000000){alert("Choose a JPG, PNG or WebP image under 6 MB.");return;}
 const key=kind==="packet"?p.key+"|packet":p.key;
 const stored=await dbPut(key,file);
 if(!stored){alert("This browser could not save the photo. No changes were made. Try freeing storage space or using another browser.");return;}
  markPhotoChange(key,false);
 const target=kind==="packet"?packetPhotos:userPhotos;
 const prior=target.get(p.key);if(prior)URL.revokeObjectURL(prior);
 target.set(p.key,URL.createObjectURL(file));
 if(remoteImageUrls[p.key]&&remoteImageUrls[p.key][kind]){
  delete remoteImageUrls[p.key][kind];saveImageLinks();
 }
 choosePhotoMode(p,kind);
 requestFiltering();
}
async function deleteUpload(p,kind){
 const target=kind==="packet"?packetPhotos:userPhotos;
 if(!target.has(p.key))return;
 const label=kind==="packet"?"packet":"plant";
 if(!window.confirm("Delete your uploaded "+label+" photo for "+p.name+" from this browser?"))return;
 try{if(!await dbDelete(kind==="packet"?p.key+"|packet":p.key))throw Error("Local image deletion failed.");}
 catch(e){alert("Unable to delete photo from local storage.");return;}
 const old=target.get(p.key);if(old)URL.revokeObjectURL(old);
 target.delete(p.key);
  markPhotoChange(kind==="packet"?p.key+"|packet":p.key,true);
 delete photoPreferences[p.key];save(photoPreferenceKey,photoPreferences);
 refreshPhoto(p);requestFiltering();
}

function photoUrlControl(p,kind){return p.card.querySelector('.photo-url-field[data-kind="'+kind+'"]');}
function commitPictureLink(p,kind,url){
 const old=remoteImageUrls[p.key];
 remoteImageUrls[p.key]={...(old||{}),[kind]:url};
 if(!saveImageLinks()){
  if(old)remoteImageUrls[p.key]=old;else delete remoteImageUrls[p.key];
  alert("Browser storage is unavailable; the image address could not be saved.");return;
 }
 photoPreferences[p.key]=kind;save(photoPreferenceKey,photoPreferences);
 refreshPhoto(p);requestFiltering();
 photoUrlControl(p,kind).querySelector(".remote-photo-feedback").textContent="Saved. This picture is now selected for the card.";
}
function previewPictureLink(p,kind,saveAfter){
 const control=photoUrlControl(p,kind),input=control.querySelector(".remote-photo-input");
 const preview=control.querySelector(".remote-photo-preview"),feedback=control.querySelector(".remote-photo-feedback");
 const url=input.value.trim();
 if(!validImageLink(url)){
  preview.hidden=true;feedback.textContent="Enter a complete http:// or https:// direct image address.";input.focus();return;
 }
 if(input.dataset.previewedUrl===url&&!preview.hidden){
  if(saveAfter)commitPictureLink(p,kind,url);return;
 }
 input.dataset.previewedUrl="";preview.hidden=true;feedback.textContent="Checking picture address…";
 const img=new Image();
 img.onload=()=>{
  if(input.value.trim()!==url)return;
  preview.src=url;preview.hidden=false;input.dataset.previewedUrl=url;
  feedback.textContent="Picture preview loaded. Select Save to use it.";
  if(saveAfter)commitPictureLink(p,kind,url);
 };
 img.onerror=()=>{
  if(input.value.trim()!==url)return;
  preview.hidden=true;
  feedback.textContent="Could not display this picture. Use a direct image address (not a store product page). Some sites block external images.";
 };
 img.src=url;
}
function deletePictureLink(p,kind){
 if(!savedImageLink(p,kind))return;
 if(!window.confirm("Remove the linked "+(kind==="packet"?"seed-packet":"plant")+" picture for "+p.name+"?"))return;
 const old={...remoteImageUrls[p.key]};
 delete remoteImageUrls[p.key][kind];
 if(!Object.keys(remoteImageUrls[p.key]).length)delete remoteImageUrls[p.key];
 if(!saveImageLinks()){remoteImageUrls[p.key]=old;alert("Browser storage is unavailable.");return;}
 delete photoPreferences[p.key];save(photoPreferenceKey,photoPreferences);
 const control=photoUrlControl(p,kind),input=control.querySelector(".remote-photo-input");
 input.value="";input.dataset.previewedUrl="";
 control.querySelector(".remote-photo-preview").hidden=true;
 control.querySelector(".remote-photo-feedback").textContent="Picture URL removed.";
 refreshPhoto(p);requestFiltering();
}
plants.forEach(p=>{
 for(const kind of ["plant","packet"]){
  const control=photoUrlControl(p,kind),input=control.querySelector(".remote-photo-input");
  input.value=savedImageLink(p,kind)||"";
  input.addEventListener("input",()=>{
   input.dataset.previewedUrl="";
   control.querySelector(".remote-photo-preview").hidden=true;
   control.querySelector(".remote-photo-feedback").textContent="Preview or save this image address.";
  });
  control.querySelector(".preview-photo-url").addEventListener("click",()=>previewPictureLink(p,kind,false));
  control.querySelector(".save-photo-url").addEventListener("click",()=>previewPictureLink(p,kind,true));
  control.querySelector(".delete-photo-url").addEventListener("click",()=>deletePictureLink(p,kind));
 }
});
plants.forEach(p=>{
 const q=p.name.replace(/\([^)]*\)/g,"").replace(/\b(?:spoken name|verify packet|variety unknown)\b/gi,"").trim();
 const searchUrl="https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search="+encodeURIComponent(q+" "+(p.cat==="Tomatoes"?"tomato":p.cat==="Peppers"?"pepper":p.cat==="Carrots"?"carrot":p.cat==="Grains and grasses"?"corn wheat grain":p.cat==="Alliums: chives, onions and leeks"?"chives onion leek":"plant"));
 p.card.querySelector(".find-variety-photo").href=searchUrl;
 p.card.querySelector(".seed-thumb").addEventListener("click",()=>showPhoto(p));
 p.card.querySelector(".manage-photos").addEventListener("click",()=>openPhotoTools(p));
 p.card.querySelector(".upload-photo").addEventListener("change",event=>storeUpload(p,"plant",event.target));
 p.card.querySelector(".upload-packet-photo").addEventListener("change",event=>storeUpload(p,"packet",event.target));
 p.card.querySelector(".remove-photo").addEventListener("click",()=>deleteUpload(p,"plant"));
 p.card.querySelector(".remove-packet-photo").addEventListener("click",()=>deleteUpload(p,"packet"));
 p.card.querySelectorAll("[data-photo-mode]").forEach(button=>button.addEventListener("click",()=>choosePhotoMode(p,button.dataset.photoMode)));
 refreshPhoto(p);
});
// Variety photo catalog is checked by inventory entry. No Wikipedia species-wide auto-fill is allowed.
// Unverified varieties deliberately retain a neutral placeholder and a manual photo option.
async function restorePhotos(){
 for(const [key,blob] of await dbAll()){
  if(typeof key!=="string")continue;
  const packet=key.endsWith("|packet");
  const plantKey=packet?key.slice(0,-7):key,p=plants.get(plantKey);
  if(!p)continue;
  const photoUrl=URL.createObjectURL(blob);
  if(packet){const previous=packetPhotos.get(plantKey);if(previous)URL.revokeObjectURL(previous);packetPhotos.set(plantKey,photoUrl);}
  else{const previous=userPhotos.get(plantKey);if(previous)URL.revokeObjectURL(previous);userPhotos.set(plantKey,photoUrl);}
  refreshPhoto(p);
 }
}
restorePhotos().then(()=>requestFiltering());
function fileToDataURL(blob){return new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>resolve(null);r.readAsDataURL(blob);});}
async function createFullBackup(){
 const photos=await dbAll();
 const serialized=[];
 const growthKeys=window.DKSeedBankBackup?.growthPhotoKeys(journal)||new Set();
 for(const [key,blob] of photos){
  if(typeof key==="string"&&key.startsWith("journal-photo|")&&!growthKeys.has(key))continue;
  const data=await fileToDataURL(blob);
  if(!data)throw Error("Could not read an uploaded photo. No incomplete backup was downloaded.");
  serialized.push({key,data,updatedAt:photoChanges[key]&&!photoChanges[key].deleted?photoChanges[key].at:undefined});
 }
 // Normalize the export through JSON so the checksum covers exactly what will be saved.
 // This also strips undefined values that cannot survive a round trip through a file.
 const draft={
  format:"dk-seedbank-v1",backupSchema:2,exportedAt:new Date().toISOString(),
  journal,journalDeletes,settings,photoUrls:remoteImageUrls,photoPreferences,photoChanges,
  workbench:window.DKSeedBankWorkbench?window.DKSeedBankWorkbench.exportData():null,
  watering:window.DKSeedBankWatering?window.DKSeedBankWatering.exportData():null,
  recipeGuide:window.DKSeedBankRecipes?window.DKSeedBankRecipes.exportData():null,
  suppliers:window.DKSeedBankSuppliers?window.DKSeedBankSuppliers.exportData():[],
  photos:serialized
 };
 const serializedBackup=JSON.stringify(draft);
 if(new Blob([serializedBackup]).size>95000000)
  throw Error("Backup would exceed the 100 MB restore limit. Reduce large uploaded photos before exporting.");
 const snapshot=JSON.parse(serializedBackup);
 const helper=window.DKSeedBankBackup;
 if(!helper)throw Error("Backup protection tools are unavailable. Reload before exporting.");
 helper.validate(snapshot);
 const digest=await helper.checksum(snapshot);
 if(digest)snapshot.integrity={algorithm:"SHA-256",digest};
 return snapshot;
}
function downloadJSON(data,prefix="dk-seedbank-backup"){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=prefix+"-"+today()+".json";
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function backupLanguage(en,ru){return document.documentElement.lang==="ru"?ru:en;}
document.getElementById("exportJournal").addEventListener("click",async()=>{
 const button=document.getElementById("exportJournal");
 if(button.disabled)return;
 button.disabled=true;
 try{
  const snapshot=await createFullBackup();
  downloadJSON(snapshot);
  try{localStorage.setItem("dk-seedbank-last-export-v1",new Date().toISOString());}catch(error){}
  document.dispatchEvent(new Event("dkseedbank:backup-exported"));
 }catch(error){
  alert(backupLanguage("Backup could not be prepared: ","Не удалось создать резервную копию: ")+error.message);
 }finally{button.disabled=false;}
});
async function dbReplacePhotos(entries){
 const db=await openDB();
 if(!db)return entries.length===0;
 return new Promise(resolve=>{
  try{
   const tx=db.transaction("photos","readwrite"),store=tx.objectStore("photos");
   store.clear();
   entries.forEach(([key,blob])=>store.put(blob,key));
   tx.oncomplete=()=>resolve(true);
   tx.onerror=()=>resolve(false);
   tx.onabort=()=>resolve(false);
  }catch(error){resolve(false);}
 });
}
document.getElementById("importJournal").addEventListener("change",async e=>{
 const file=e.target.files&&e.target.files[0];
 if(!file)return;
 try{
  if(file.size>100000000)throw Error("Backup file is too large (limit 100 MB).");
  const data=JSON.parse(await file.text());
  const helper=window.DKSeedBankBackup;
  if(!helper)throw Error("Backup protection tools are unavailable. Reload and try again.");
  const summary=helper.validate(data);
  const integrity=await helper.verify(data);
  const review=backupLanguage(
   "Review backup before replacing local records:\n","Проверьте резервную копию перед заменой записей:\n")+
   backupLanguage("Plantings: ","Посадки: ")+summary.plantings+"\n"+
   backupLanguage("Custom varieties: ","Добавленные сорта: ")+summary.addedVarieties+"\n"+
   backupLanguage("Seed lots: ","Партии семян: ")+summary.seedLots+"\n"+
   backupLanguage("Uploaded photos: ","Загруженные фотографии: ")+summary.uploadedPhotos+"\n"+
   backupLanguage("Growth photos: ","Фотографии роста: ")+summary.growthPhotos+"\n"+
   backupLanguage("Height records: ","Измерения высоты: ")+summary.growthMeasurements+"\n"+
   (integrity.verified?backupLanguage("Integrity check passed.\n","Проверка целостности пройдена.\n"):
    backupLanguage("Older backup without a checksum.\n","Старая копия без контрольной суммы.\n"))+
   backupLanguage("A safety copy of your current records will be downloaded before restoration. Continue?",
   "Перед восстановлением будет загружена резервная копия текущих записей. Продолжить?");
  if(!window.confirm(review))return;
  // A safety export is created before any local content is replaced.
  const previous=await createFullBackup();
  downloadJSON(previous,"dk-seedbank-before-restore");
  const keys=new Set(plants.keys());
  for(const addition of data.workbench?.additions||[]){
   if(addition&&typeof addition.category==="string"&&typeof addition.name==="string")
    keys.add(addition.category+"|"+addition.name);
  }
  const photos=[];
  for(const image of data.photos||[]){
   const growthPhoto=helper.isGrowthPhotoKey(image.key,data.journal);
   const key=image.key.endsWith("|packet")?image.key.slice(0,-7):image.key;
   if(!growthPhoto&&!keys.has(key))continue;
   const blob=await (await fetch(image.data)).blob();
   if(blob.size>6000000)throw Error("An uploaded photo exceeds the 6 MB limit.");
   photos.push([image.key,blob]);
  }
  // Commit all stored images in one atomic IndexedDB transaction.
  if(!await dbReplacePhotos(photos))throw Error("Unable to restore uploaded photos. Existing journal was not replaced.");
  const nextJournal=data.journal.map(x=>({...x}));
  const nextDeletes=Array.isArray(data.journalDeletes)?data.journalDeletes:[];
  const nextSettings={...settings};
  if(data.settings){
   for(const name of ["region","environment","lastFrost"]){
    if(typeof data.settings[name]==="string")nextSettings[name]=data.settings[name];
   }
  }
  if(!save(storageKey,nextJournal)||!save(settingsKey,nextSettings))
   throw Error("Local browser storage is full or blocked. Check your safety backup.");
  journal=nextJournal;settings=nextSettings;
   photoChanges=restorePhotoChanges(data.photoChanges);
   if(!save(photoChangesKey,photoChanges))throw Error("Could not save photo change history.");
  journalDeletes=nextDeletes;
  save(journalDeletesKey,nextDeletes);
  if(data.photoUrls){
   const links={};
   for(const [key,record] of Object.entries(data.photoUrls)){
    if(!keys.has(key)||!record||typeof record!=="object")continue;
    for(const kind of ["plant","packet"]){
     if(validImageLink(record[kind])){
      if(!links[key])links[key]={};
      links[key][kind]=record[kind];
     }
    }
   }
   remoteImageUrls=links;
   if(!saveImageLinks())throw Error("Could not save image links.");
  }
  if(data.photoPreferences){
   const preferences={};
   for(const [key,mode] of Object.entries(data.photoPreferences)){
    if(keys.has(key)&&["plant","packet","variety","none"].includes(mode))preferences[key]=mode;
   }
   photoPreferences=preferences;
   if(!save(photoPreferenceKey,preferences))throw Error("Could not save photo preferences.");
  }
  for(const url of [...userPhotos.values(),...packetPhotos.values()])URL.revokeObjectURL(url);
  userPhotos.clear();packetPhotos.clear();
  for(const [key,blob] of photos){
   if(helper.isGrowthPhotoKey(key,data.journal))continue;
   const packet=key.endsWith("|packet"),plantKey=packet?key.slice(0,-7):key,photo=URL.createObjectURL(blob);
   (packet?packetPhotos:userPhotos).set(plantKey,photo);
  }
  if(data.watering&&window.DKSeedBankWatering&&!window.DKSeedBankWatering.importData(data.watering))
   throw Error("Watering records could not be restored.");
  if(data.recipeGuide&&window.DKSeedBankRecipes&&!window.DKSeedBankRecipes.importData(data.recipeGuide))
   throw Error("Recipe checklist could not be restored.");
  if(data.suppliers&&window.DKSeedBankSuppliers&&!window.DKSeedBankSuppliers.importData(data.suppliers))
   throw Error("Favorite supplier links could not be restored.");
  if(data.workbench&&window.DKSeedBankWorkbench&&!window.DKSeedBankWorkbench.importData(data.workbench))
   throw Error("Inventory changes could not be restored.");
  requestFiltering();
  document.getElementById("regionSelect").value=settings.region;
  document.getElementById("envSelect").value=settings.environment;
  document.getElementById("frostDate").value=settings.lastFrost||"";
  plants.forEach(p=>refreshPhoto(p));
  updatePlanner();renderJournal();requestFiltering();
  document.dispatchEvent(new Event("dkseedbank:backup-restored"));
  alert(backupLanguage("Backup restored. Your previous records were downloaded as a safety copy.",
   "Резервная копия восстановлена. Предыдущие записи сохранены отдельной копией."));
 }catch(error){
  alert(backupLanguage("Could not restore backup: ","Не удалось восстановить копию: ")+error.message);
 }finally{e.target.value="";}
});



async function applySyncedBackup(data){
 const helper=window.DKSeedBankBackup;
 if(!helper)throw Error("Backup validation is unavailable.");
 helper.validate(data);
 await helper.verify(data);
 const nextJournal=data.journal.map(entry=>({...entry}));
 const nextDeletes=Array.isArray(data.journalDeletes)?data.journalDeletes:[];
 const names=new Set(plants.keys());
 for(const addition of data.workbench?.additions||[]){
  if(addition&&typeof addition.category==="string"&&typeof addition.name==="string")
   names.add(addition.category+"|"+addition.name);
 }
 const media=[];
 for(const image of data.photos||[]){
  const isGrowth=helper.isGrowthPhotoKey(image.key,nextJournal);
  const seedKey=image.key.endsWith("|packet")?image.key.slice(0,-7):image.key;
  if(!isGrowth&&!names.has(seedKey))continue;
  const blob=await (await fetch(image.data)).blob();
  if(blob.size>6000000)throw Error("An uploaded photo exceeds the 6 MB limit.");
  media.push([image.key,blob]);
 }
 const nextSettings={...settings};
 if(data.settings){
  for(const name of ["region","environment","lastFrost"])
   if(typeof data.settings[name]==="string")nextSettings[name]=data.settings[name];
 }
 const links={};
 for(const [key,record] of Object.entries(data.photoUrls||{})){
  if(!names.has(key)||!record||typeof record!=="object")continue;
  for(const kind of ["plant","packet"]){
   if(validImageLink(record[kind])){
    if(!links[key])links[key]={};
    links[key][kind]=record[kind];
   }
  }
 }
 const preferences={};
 for(const [key,mode] of Object.entries(data.photoPreferences||{})){
  if(names.has(key)&&["plant","packet","variety","none"].includes(mode))preferences[key]=mode;
 }
 // Prepare local JSON before touching photographs; preserve previous values
 // if browser quota or an IndexedDB transaction prevents completing sync.
 const nextPhotoChanges=restorePhotoChanges(data.photoChanges);
 const transaction=window.DKSeedBankStorageTransaction;
 if(!transaction)throw Error("Local sync recovery helper missing. Reload the application.");
 await transaction.apply(localStorage,[
  [storageKey,nextJournal],
  [journalDeletesKey,nextDeletes],
  [settingsKey,nextSettings],
  [remoteImageStorageKey,links],
  [photoPreferenceKey,preferences],
  [photoChangesKey,nextPhotoChanges]
 ],()=>dbReplacePhotos(media));
 journal=nextJournal;journalDeletes=nextDeletes;settings=nextSettings;
 remoteImageUrls=links;photoPreferences=preferences;photoChanges=nextPhotoChanges;
 for(const url of [...userPhotos.values(),...packetPhotos.values()])URL.revokeObjectURL(url);
 userPhotos.clear();packetPhotos.clear();
 for(const [key,blob] of media){
  if(helper.isGrowthPhotoKey(key,nextJournal))continue;
  const packet=key.endsWith("|packet"),plantKey=packet?key.slice(0,-7):key;
  (packet?packetPhotos:userPhotos).set(plantKey,URL.createObjectURL(blob));
 }
 if(data.watering&&window.DKSeedBankWatering&&
    JSON.stringify(window.DKSeedBankWatering.exportData())!==JSON.stringify(data.watering)&&
    !window.DKSeedBankWatering.importData(data.watering))
  throw Error("Watering records could not be synchronized.");
 if(data.recipeGuide&&window.DKSeedBankRecipes&&
    JSON.stringify(window.DKSeedBankRecipes.exportData())!==JSON.stringify(data.recipeGuide)&&
    !window.DKSeedBankRecipes.importData(data.recipeGuide))
  throw Error("Recipe records could not be synchronized.");
 if(data.suppliers&&window.DKSeedBankSuppliers&&
    JSON.stringify(window.DKSeedBankSuppliers.exportData())!==JSON.stringify(data.suppliers)&&
    !window.DKSeedBankSuppliers.importData(data.suppliers))
  throw Error("Favorite supplier links could not be synchronized.");
 const oldWorkbench=window.DKSeedBankWorkbench?.exportData();
 const changeWorkbench=data.workbench&&window.DKSeedBankWorkbench&&
    JSON.stringify(oldWorkbench)!==JSON.stringify(data.workbench);
 if(changeWorkbench&&!window.DKSeedBankWorkbench.importData(data.workbench,{noReload:true}))
  throw Error("Inventory changes could not be synchronized.");
 document.getElementById("regionSelect").value=settings.region;
 document.getElementById("envSelect").value=settings.environment;
 document.getElementById("frostDate").value=settings.lastFrost||"";
 plants.forEach(plant=>refreshPhoto(plant));
 updatePlanner();renderJournal();requestFiltering();
 document.dispatchEvent(new Event("dkseedbank:backup-restored"));
 return {reload:!!changeWorkbench};
}
const seedRoleClasses={"Food crop":"food","Culinary herb":"culinary","Pollinator":"pollinator","Ornamental":"ornamental","Tree / woody":"tree","Grain":"grain","Fiber / heritage":"fiber","Botanical / traditional":"botanical","Caution":"caution"};
function patchInventoryCard(key,patch){
 const p=plants.get(key);if(!p)return false;
 const card=p.card;
 if(patch.name&&typeof patch.name==="string"){
  p.name=patch.name.trim().slice(0,140);card.dataset.name=p.name;
  card.querySelector(".seed-name").textContent=p.name;
 }
 const dest=cats.find(s=>s.dataset.category===patch.category);
 if(dest){p.cat=patch.category;card.dataset.category=p.cat;dest.querySelector(".entries").appendChild(card);}
 if(Array.isArray(patch.tags)){
  const names=[...new Set(patch.tags)].filter(v=>Object.hasOwn(seedRoleClasses,v));
  card.dataset.tags=names.join("|");
  const area=card.querySelector(".tagline");area.textContent="";
  names.forEach(v=>{const chip=document.createElement("button");chip.type="button";chip.className="tag tag-"+seedRoleClasses[v]+" purpose-tag";chip.dataset.purposeTag=v;chip.textContent=v;chip.title="Filter by "+v;chip.setAttribute("aria-pressed",String(v===purposeSelect.value));area.appendChild(chip);});
 }
 if(Number.isInteger(patch.amount)&&patch.amount>=0&&patch.amount<=999999){
  card.dataset.amount=String(patch.amount);
  card.dataset.quantityKnown="yes";
  card.querySelector(".stock-badge").textContent=patch.amount+" "+(patch.amount===1?"packet":"packets");
 }
 if(["packet","bag","saved","harvested","unknown"].includes(patch.source))card.dataset.source=patch.source;
  if(patch.source||Number.isInteger(patch.amount)){const num=Number(card.dataset.amount)||0;const unit=card.dataset.source==="packet"?"packet":card.dataset.source==="bag"?"bag":"lot";card.querySelector(".stock-badge").textContent=num+" "+(num===1?unit:unit+"s");}
 if(typeof patch.archived==="boolean")card.dataset.archived=patch.archived?"yes":"no";
 p.guide=resolveGuide(p.name,p.cat);
 p.kind=Object.keys(guides).find(k=>guides[k]===p.guide)||"generic";
 card.dataset.growMode=p.guide.mode;card.dataset.growingSetup=p.guide.setup;
 card.querySelector(".seed-brief").textContent=p.guide.depth+" deep · "+p.guide.light;
 const values=[p.guide.depth,p.guide.spacing,p.guide.light,p.guide.germ,p.guide.soil,p.guide.days];
 card.querySelectorAll(".plant-fact strong").forEach((node,i)=>{node.textContent=values[i];});
 refreshSeedSafety(p);refreshPhoto(p);updatePlanner();requestFiltering();syncPurposeChips();
 document.dispatchEvent(new Event("dkseedbank:inventorychange"));
 return true;
}
function initializeNewSeedCard(p){
 const c=p.card,g=c.querySelector(".seed-details");
 c.querySelector(".close-planting-guide").addEventListener("click",()=>{g.open=false;});
 c.querySelector(".log-planting").addEventListener("click",()=>openForm({seedKey:p.key,plant:p.name,variety:p.name,date:today(),status:"Sown"}));
 c.querySelector(".manage-photos").addEventListener("click",()=>openPhotoTools(p));
 c.querySelector(".seed-thumb").addEventListener("click",()=>showPhoto(p));
 c.querySelector(".find-variety-photo").href="https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search="+encodeURIComponent(p.name+" plant");
 for(const kind of ["plant","packet"]){
  const f=photoUrlControl(p,kind),input=f.querySelector(".remote-photo-input");
  input.value=savedImageLink(p,kind)||"";
  input.addEventListener("input",()=>{input.dataset.previewedUrl="";f.querySelector(".remote-photo-preview").hidden=true;f.querySelector(".remote-photo-feedback").textContent="Preview or save this image address.";});
  f.querySelector(".preview-photo-url").addEventListener("click",()=>previewPictureLink(p,kind,false));
  f.querySelector(".save-photo-url").addEventListener("click",()=>previewPictureLink(p,kind,true));
  f.querySelector(".delete-photo-url").addEventListener("click",()=>deletePictureLink(p,kind));
 }
 c.querySelector(".upload-photo").addEventListener("change",e=>storeUpload(p,"plant",e.target));
 c.querySelector(".upload-packet-photo").addEventListener("change",e=>storeUpload(p,"packet",e.target));
 c.querySelector(".remove-photo").addEventListener("click",()=>deleteUpload(p,"plant"));
 c.querySelector(".remove-packet-photo").addEventListener("click",()=>deleteUpload(p,"packet"));
 c.querySelectorAll("[data-photo-mode]").forEach(button=>button.addEventListener("click",()=>choosePhotoMode(p,button.dataset.photoMode)));
 refreshPhoto(p);
}
function deleteInventoryCard(key){
 const p=plants.get(key);if(!p)return false;
 p.card.remove();plants.delete(key);cards=cards.filter(x=>x!==p.card);
 requestFiltering();syncPurposeChips();document.dispatchEvent(new Event("dkseedbank:inventorychange"));
 return true;
}
function createInventoryCard(entry){
 const name=String(entry.name||"").trim(),cat=String(entry.category||"");
 const section=cats.find(x=>x.dataset.category===cat),key=cat+"|"+name;
 if(!name||!section||plants.has(key))return null;
 const card=document.createElement("article");card.className="seed";
 Object.assign(card.dataset,{name,category:cat,tags:"",source:"packet",amount:"0",quantityKnown:"yes",archived:"no"});
 card.innerHTML='<div class="seed-top"><strong class="seed-name">'+esc(name)+'</strong><span class="stock-badge">0 packets</span></div><div class="tagline"></div>';
 section.querySelector(".entries").appendChild(card);tagContent(card);cards.push(card);
 const p=plants.get(key);initializeNewSeedCard(p);patchInventoryCard(key,entry);return key;
}
function setJournalSeedKey(entryId,key){
 const record=journal.find(entry=>entry.id===entryId);
 if(!record||key&&!plants.has(key))return false;
 const old=record.seedKey&&plants.get(record.seedKey);
 if(!key&&old&&record.variety===old.name)record.variety="Standard type; exact cultivar not specified";
 record.seedKey=key;
 if(key)record.variety=plants.get(key).name;
 if(!save(storageKey,journal))return false;
 renderJournal();return true;
}
window.DKSeedBankCore=Object.freeze({
 plants:()=>plants,cards:()=>cards.slice(),categories:()=>cats.map(x=>x.dataset.category),
 exportForSync:createFullBackup,applySyncedBackup,
 journal:()=>journal.slice(),journalDeletes:()=>journalDeletes.slice(),
 settings:()=>({...settings}),renderJournal,guideFor:resolveGuide,setJournalSeedKey,
 addJournalGrowthPhoto:(id,meta)=>updateJournalGrowth(id,meta),
 removeJournalGrowthPhoto:(id,meta)=>updateJournalGrowth(id,meta,true),
 saveJournalMeasurement:(id,record)=>updateJournalMeasurement(id,record),
 deleteJournalMeasurement:(id,record)=>updateJournalMeasurement(id,record,true),
 patchInventoryCard,createInventoryCard,deleteInventoryCard,refreshFilters:requestFiltering,
 logPlanting:(key)=>{const p=plants.get(key);if(p)openForm({seedKey:p.key,plant:p.name,variety:p.name,date:today(),status:"Sown"});},
 showJournal:()=>{section.open=true;section.scrollIntoView({behavior:"smooth",block:"start"});},
 showPlanner:()=>{planner.open=true;planner.scrollIntoView({behavior:"smooth",block:"start"});}
});

})();
