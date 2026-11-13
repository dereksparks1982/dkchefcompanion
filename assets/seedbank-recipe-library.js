/* DK Seed Bank: additive cooked recipes and multi-ingredient spice blends.
   Does not alter legacy recipes, user-created recipes, or on-hand flags. */
(function(root){"use strict";
const recipes=[
 {
  "id": "salisbury-steak",
  "name": "Salisbury steak",
  "family": "Kitchen",
  "intro": "Four tender beef patties in onion-and-mushroom gravy. Serve with mashed potatoes.",
  "serves": "Serves 4",
  "ingredients": [
   {
    "id": "beef",
    "name": "Ground beef",
    "type": "pantry",
    "amount": "1 lb (450 g)",
    "aliases": [],
    "nameRu": "Говяжий фарш",
    "amountRu": "450 г"
   },
   {
    "id": "crumbs",
    "name": "Plain breadcrumbs",
    "type": "pantry",
    "amount": "1/3 cup",
    "aliases": [],
    "nameRu": "Панировочные сухари",
    "amountRu": "⅓ стакана"
   },
   {
    "id": "egg",
    "name": "Egg",
    "type": "pantry",
    "amount": "1 large",
    "aliases": [],
    "nameRu": "Яйцо",
    "amountRu": "1 крупная"
   },
   {
    "id": "onion",
    "name": "Onion",
    "type": "garden",
    "amount": "1 medium, divided",
    "aliases": [
     "onion"
    ],
    "nameRu": "Лук",
    "amountRu": "1 средняя, разделить"
   },
   {
    "id": "garlic",
    "name": "Garlic",
    "type": "garden",
    "amount": "2 cloves",
    "aliases": [
     "garlic"
    ],
    "nameRu": "Чеснок",
    "amountRu": "2 зубчика"
   },
   {
    "id": "worcestershire",
    "name": "Worcestershire sauce",
    "type": "pantry",
    "amount": "2 tsp, divided",
    "aliases": [],
    "nameRu": "Вустерский соус",
    "amountRu": "2 ч. л., разделить"
   },
   {
    "id": "mustard",
    "name": "Dijon mustard",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Дижонская горчица",
    "amountRu": "1 ч. л."
   },
   {
    "id": "mushrooms",
    "name": "Mushrooms",
    "type": "pantry",
    "amount": "8 oz (225 g), sliced; optional",
    "aliases": [],
    "nameRu": "Шампиньоны",
    "amountRu": "225 г, ломтиками, по желанию"
   },
   {
    "id": "butter",
    "name": "Butter",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Сливочное масло",
    "amountRu": "1 ст. л."
   },
   {
    "id": "flour",
    "name": "All-purpose flour",
    "type": "pantry",
    "amount": "2 tbsp",
    "aliases": [],
    "nameRu": "Пшеничная мука",
    "amountRu": "2 ст. л."
   },
   {
    "id": "broth",
    "name": "Beef broth",
    "type": "pantry",
    "amount": "2 cups (475 mL)",
    "aliases": [],
    "nameRu": "Говяжий бульон",
    "amountRu": "475 мл"
   },
   {
    "id": "salt",
    "name": "Salt and black pepper",
    "type": "pantry",
    "amount": "to taste",
    "aliases": [],
    "nameRu": "Соль и чёрный перец",
    "amountRu": "по вкусу"
   }
  ],
  "steps": [
   "Finely mince half the onion and the garlic; slice the remaining onion. Mix beef, breadcrumbs, egg, minced onion, half the garlic, 1 tsp Worcestershire, mustard, salt, and pepper just until combined.",
   "Shape into four oval patties. Brown in a lightly oiled skillet over medium-high heat, about 3–4 minutes per side; transfer to a plate. They do not need to be fully cooked yet.",
   "Reduce heat to medium. Add butter, sliced onion, mushrooms if using, and remaining garlic. Cook until softened. Stir in flour for 1 minute, then gradually whisk in broth and remaining Worcestershire.",
   "Return patties and juices to skillet; gently simmer in gravy until patties reach 160°F (71°C) inside, about 8–12 minutes depending on thickness. Adjust gravy consistency and seasoning."
  ],
  "nameRu": "Стейк Солсбери",
  "introRu": "Четыре нежные говяжьи котлеты с луково-грибной подливой. Подавайте с картофельным пюре.",
  "servesRu": "4 порции",
  "stepsRu": [
   "Мелко нарежьте половину луковицы и чеснок; оставшийся лук нарежьте ломтиками. Смешайте фарш, сухари, яйцо, мелкий лук, половину чеснока, 1 ч. л. вустерского соуса, горчицу, соль и перец. Не вымешивайте слишком долго.",
   "Сформуйте четыре овальные котлеты. Подрумяньте на слегка смазанной сковороде по 3–4 минуты с каждой стороны и переложите на тарелку.",
   "Убавьте огонь. Добавьте масло, лук, грибы (по желанию) и чеснок. Обжарьте до мягкости. Вмешайте муку на 1 минуту, затем постепенно влейте бульон и оставшийся соус.",
   "Верните котлеты в подливу и томите до внутренней температуры 71°C (160°F), примерно 8–12 минут в зависимости от толщины. Отрегулируйте густоту и вкус."
  ]
 },
 {
  "id": "chicken-tikka-masala",
  "name": "Chicken tikka masala",
  "family": "Kitchen",
  "intro": "Yogurt-marinated chicken in a spiced tomato and cream sauce. A stovetop and broiler method.",
  "serves": "Serves 4–6",
  "ingredients": [
   {
    "id": "chicken",
    "name": "Boneless chicken thighs",
    "type": "pantry",
    "amount": "1½ lb (680 g)",
    "aliases": [],
    "nameRu": "Куриные бёдра без кости",
    "amountRu": "680 г"
   },
   {
    "id": "yogurt",
    "name": "Plain yogurt",
    "type": "pantry",
    "amount": "½ cup",
    "aliases": [],
    "nameRu": "Натуральный йогурт",
    "amountRu": "½ стакана"
   },
   {
    "id": "lemon",
    "name": "Lemon juice",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Лимонный сок",
    "amountRu": "1 ст. л."
   },
   {
    "id": "garam",
    "name": "Garam masala",
    "type": "pantry",
    "amount": "2 tsp, divided",
    "aliases": [],
    "nameRu": "Гарам масала",
    "amountRu": "2 ч. л., разделить"
   },
   {
    "id": "paprika",
    "name": "Paprika",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Паприка",
    "amountRu": "1 ч. л."
   },
   {
    "id": "salt",
    "name": "Salt",
    "type": "pantry",
    "amount": "1 tsp, divided",
    "aliases": [],
    "nameRu": "Соль",
    "amountRu": "1 ч. л., разделить"
   },
   {
    "id": "onion",
    "name": "Onion",
    "type": "garden",
    "amount": "1 large, diced",
    "aliases": [
     "onion"
    ],
    "nameRu": "Лук",
    "amountRu": "1 крупная, кубиками"
   },
   {
    "id": "garlic",
    "name": "Garlic",
    "type": "garden",
    "amount": "4 cloves, minced",
    "aliases": [
     "garlic"
    ],
    "nameRu": "Чеснок",
    "amountRu": "4 зубчика, измельчить"
   },
   {
    "id": "ginger",
    "name": "Fresh ginger",
    "type": "garden",
    "amount": "1 tbsp grated",
    "aliases": [
     "ginger"
    ],
    "nameRu": "Свежий имбирь",
    "amountRu": "1 ст. л. тёртого"
   },
   {
    "id": "tomato",
    "name": "Crushed tomatoes",
    "type": "garden",
    "amount": "1 can (14 oz / 400 g)",
    "aliases": [
     "tomato"
    ],
    "nameRu": "Протёртые томаты",
    "amountRu": "1 банка (400 г)"
   },
   {
    "id": "paste",
    "name": "Tomato paste",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Томатная паста",
    "amountRu": "1 ст. л."
   },
   {
    "id": "cumin",
    "name": "Ground cumin",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Молотый кумин",
    "amountRu": "1 ч. л."
   },
   {
    "id": "turmeric",
    "name": "Ground turmeric",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Молотая куркума",
    "amountRu": "½ ч. л."
   },
   {
    "id": "cream",
    "name": "Heavy cream",
    "type": "pantry",
    "amount": "½ cup (120 mL)",
    "aliases": [],
    "nameRu": "Жирные сливки",
    "amountRu": "120 мл"
   },
   {
    "id": "oil",
    "name": "Neutral cooking oil",
    "type": "pantry",
    "amount": "2 tbsp",
    "aliases": [],
    "nameRu": "Растительное масло",
    "amountRu": "2 ст. л."
   },
   {
    "id": "cilantro",
    "name": "Fresh cilantro",
    "type": "garden",
    "amount": "to garnish; optional",
    "aliases": [
     "cilantro",
     "coriander"
    ],
    "nameRu": "Свежая кинза",
    "amountRu": "для украшения, по желанию"
   }
  ],
  "steps": [
   "Combine yogurt, lemon juice, 1 tsp garam masala, paprika, and ½ tsp salt. Coat chicken and marinate covered in the refrigerator for at least 30 minutes (up to overnight).",
   "Heat broiler. Spread chicken on a foil-lined tray and broil, turning once, until browned and cooked through to 165°F (74°C); check the thickest piece with a thermometer.",
   "Meanwhile, heat oil in a skillet; soften diced onion for 6–8 minutes. Add garlic, ginger, cumin, turmeric, remaining garam masala, and tomato paste; cook 1 minute.",
   "Add crushed tomatoes and simmer 12–15 minutes. Stir in cream, then cooked chicken and its juices; gently heat through. Season with remaining salt, garnish with cilantro, and serve with rice."
  ],
  "nameRu": "Курица тикка масала",
  "introRu": "Курица в йогуртовом маринаде и пряном томатно-сливочном соусе.",
  "servesRu": "4–6 порций",
  "stepsRu": [
   "Смешайте йогурт, лимонный сок, 1 ч. л. гарам масалы, паприку и ½ ч. л. соли. Замаринуйте курицу под крышкой в холодильнике минимум на 30 минут, можно на ночь.",
   "Разогрейте верхний гриль. Запекайте курицу на противне, один раз перевернув, до румяной корочки и температуры 74°C (165°F) внутри.",
   "Обжарьте лук на масле 6–8 минут. Добавьте чеснок, имбирь, кумин, куркуму, оставшуюся гарам масалу и томатную пасту. Готовьте минуту.",
   "Добавьте томаты и тушите 12–15 минут. Вмешайте сливки, готовую курицу и соки; прогрейте. Посолите по вкусу и подавайте с рисом и кинзой."
  ]
 },
 {
  "id": "classic-meatloaf",
  "name": "Classic meatloaf",
  "family": "Kitchen",
  "intro": "Traditional tender beef meatloaf with a tangy ketchup glaze.",
  "serves": "Serves 6",
  "ingredients": [
   {
    "id": "beef",
    "name": "Ground beef",
    "type": "pantry",
    "amount": "1½ lb (680 g)",
    "aliases": [],
    "nameRu": "Говяжий фарш",
    "amountRu": "680 г"
   },
   {
    "id": "crumbs",
    "name": "Plain breadcrumbs",
    "type": "pantry",
    "amount": "1 cup",
    "aliases": [],
    "nameRu": "Панировочные сухари",
    "amountRu": "1 стакан"
   },
   {
    "id": "milk",
    "name": "Milk",
    "type": "pantry",
    "amount": "½ cup (120 mL)",
    "aliases": [],
    "nameRu": "Молоко",
    "amountRu": "120 мл"
   },
   {
    "id": "egg",
    "name": "Egg",
    "type": "pantry",
    "amount": "1 large",
    "aliases": [],
    "nameRu": "Яйцо",
    "amountRu": "1 крупная"
   },
   {
    "id": "onion",
    "name": "Onion",
    "type": "garden",
    "amount": "1 small, finely diced",
    "aliases": [
     "onion"
    ],
    "nameRu": "Лук",
    "amountRu": "1 маленькая, мелко нарезать"
   },
   {
    "id": "garlic",
    "name": "Garlic",
    "type": "garden",
    "amount": "2 cloves, minced",
    "aliases": [
     "garlic"
    ],
    "nameRu": "Чеснок",
    "amountRu": "2 зубчика, измельчить"
   },
   {
    "id": "worcestershire",
    "name": "Worcestershire sauce",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Вустерский соус",
    "amountRu": "1 ст. л."
   },
   {
    "id": "salt",
    "name": "Salt",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Соль",
    "amountRu": "1 ч. л."
   },
   {
    "id": "pepper",
    "name": "Black pepper",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Чёрный перец",
    "amountRu": "½ ч. л."
   },
   {
    "id": "ketchup",
    "name": "Ketchup",
    "type": "pantry",
    "amount": "⅓ cup",
    "aliases": [],
    "nameRu": "Кетчуп",
    "amountRu": "⅓ стакана"
   },
   {
    "id": "sugar",
    "name": "Brown sugar",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Коричневый сахар",
    "amountRu": "1 ст. л."
   },
   {
    "id": "mustard",
    "name": "Prepared mustard",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Готовая горчица",
    "amountRu": "1 ч. л."
   }
  ],
  "steps": [
   "Heat oven to 350°F (175°C). Mix breadcrumbs with milk and let stand 5 minutes. Stir together with egg, onion, garlic, Worcestershire, salt and pepper.",
   "Add ground beef and mix gently until just combined. Shape into a loaf on a lined rimmed pan; do not pack tightly.",
   "Mix ketchup, brown sugar, and mustard; spread over the loaf. Bake approximately 55–70 minutes, checking until the center reaches 160°F (71°C).",
   "Rest 10 minutes before slicing so the meatloaf holds together."
  ],
  "nameRu": "Мясной рулет",
  "introRu": "Традиционный сочный мясной рулет с кисло-сладкой глазурью из кетчупа.",
  "servesRu": "6 порций",
  "stepsRu": [
   "Разогрейте духовку до 175°C (350°F). Замочите сухари в молоке на 5 минут, затем добавьте яйцо, лук, чеснок, вустерский соус, соль и перец.",
   "Добавьте фарш, осторожно смешайте и сформуйте рулет на противне с бортиками, не утрамбовывая.",
   "Смешайте кетчуп, коричневый сахар и горчицу. Смажьте рулет и запекайте около 55–70 минут до температуры 71°C (160°F) в центре.",
   "Перед нарезкой дайте мясу отдохнуть 10 минут."
  ]
 },
 {
  "id": "ratatouille",
  "name": "Ratatouille",
  "family": "Kitchen",
  "intro": "Rustic Provençal vegetables simmered until tender. Excellent warm or at room temperature.",
  "serves": "Serves 4–6",
  "ingredients": [
   {
    "id": "eggplant",
    "name": "Eggplant",
    "type": "garden",
    "amount": "1 medium, diced",
    "aliases": [
     "eggplant"
    ],
    "nameRu": "Баклажан",
    "amountRu": "1 средняя, кубиками"
   },
   {
    "id": "zucchini",
    "name": "Zucchini",
    "type": "garden",
    "amount": "2 medium, sliced",
    "aliases": [
     "zucchini",
     "courgette"
    ],
    "nameRu": "Кабачки цукини",
    "amountRu": "2 средних, ломтиками"
   },
   {
    "id": "peppers",
    "name": "Bell peppers",
    "type": "garden",
    "amount": "2, sliced",
    "aliases": [
     "bell pepper",
     "sweet pepper"
    ],
    "nameRu": "Сладкий перец",
    "amountRu": "2 шт., ломтиками"
   },
   {
    "id": "tomatoes",
    "name": "Ripe tomatoes",
    "type": "garden",
    "amount": "4 large, chopped",
    "aliases": [
     "tomato"
    ],
    "nameRu": "Спелые помидоры",
    "amountRu": "4 больших, нарезать"
   },
   {
    "id": "onion",
    "name": "Onion",
    "type": "garden",
    "amount": "1 large, diced",
    "aliases": [
     "onion"
    ],
    "nameRu": "Лук",
    "amountRu": "1 крупная, кубиками"
   },
   {
    "id": "garlic",
    "name": "Garlic",
    "type": "garden",
    "amount": "4 cloves, minced",
    "aliases": [
     "garlic"
    ],
    "nameRu": "Чеснок",
    "amountRu": "4 зубчика, измельчить"
   },
   {
    "id": "olive-oil",
    "name": "Olive oil",
    "type": "pantry",
    "amount": "¼ cup, divided",
    "aliases": [],
    "nameRu": "Оливковое масло",
    "amountRu": "¼ стакана, разделить"
   },
   {
    "id": "thyme",
    "name": "Thyme",
    "type": "garden",
    "amount": "1 tsp dried or 1 tbsp fresh",
    "aliases": [
     "thyme"
    ],
    "nameRu": "Тимьян",
    "amountRu": "1 ч. л. сушёного или 1 ст. л. свежего"
   },
   {
    "id": "rosemary",
    "name": "Rosemary",
    "type": "garden",
    "amount": "½ tsp dried or 1 tsp fresh",
    "aliases": [
     "rosemary"
    ],
    "nameRu": "Розмарин",
    "amountRu": "½ ч. л. сушёного или 1 ч. л. свежего"
   },
   {
    "id": "basil",
    "name": "Basil leaves",
    "type": "garden",
    "amount": "handful to finish",
    "aliases": [
     "basil"
    ],
    "nameRu": "Листья базилика",
    "amountRu": "горсть для подачи"
   },
   {
    "id": "salt",
    "name": "Salt and black pepper",
    "type": "pantry",
    "amount": "to taste",
    "aliases": [],
    "nameRu": "Соль и чёрный перец",
    "amountRu": "по вкусу"
   }
  ],
  "steps": [
   "Heat 2 tbsp olive oil in a wide pan. Brown eggplant in batches, then remove. Cook zucchini and bell peppers separately until just starting to soften; remove.",
   "Add remaining oil and onion; cook 5 minutes. Add garlic, tomatoes, thyme, rosemary, salt, and pepper; simmer 10 minutes.",
   "Return eggplant, zucchini, and peppers. Cover and gently simmer 20–30 minutes until tender but not mushy; uncover to reduce excess liquid.",
   "Adjust seasoning, scatter fresh basil over the top, and serve warm or at room temperature."
  ],
  "nameRu": "Рататуй",
  "introRu": "Овощное рагу по-провансальски. Вкусно горячим и комнатной температуры.",
  "servesRu": "4–6 порций",
  "stepsRu": [
   "Разогрейте 2 ст. л. масла. Партиями подрумяньте баклажан и переложите. Отдельно слегка обжарьте цукини и сладкий перец.",
   "Добавьте оставшееся масло и лук; готовьте 5 минут. Добавьте чеснок, помидоры, тимьян, розмарин, соль и перец. Тушите 10 минут.",
   "Верните баклажан, цукини и перец. Под крышкой тушите 20–30 минут до мягкости, не превращая овощи в кашу.",
   "Добавьте свежий базилик и подавайте."
  ]
 },
 {
  "id": "curry-powder",
  "name": "Homemade curry powder",
  "family": "Spice Blends",
  "intro": "A flexible, turmeric-forward curry blend. Adjust the heat to your taste.",
  "serves": "Makes about ⅓ cup",
  "ingredients": [
   {
    "id": "coriander",
    "name": "Ground coriander",
    "type": "pantry",
    "amount": "2 tbsp",
    "aliases": [],
    "nameRu": "Молотый кориандр",
    "amountRu": "2 ст. л."
   },
   {
    "id": "cumin",
    "name": "Ground cumin",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Молотый кумин",
    "amountRu": "1 ст. л."
   },
   {
    "id": "turmeric",
    "name": "Ground turmeric",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Молотая куркума",
    "amountRu": "1 ст. л."
   },
   {
    "id": "ginger",
    "name": "Ground ginger",
    "type": "pantry",
    "amount": "2 tsp",
    "aliases": [],
    "nameRu": "Молотый имбирь",
    "amountRu": "2 ч. л."
   },
   {
    "id": "paprika",
    "name": "Paprika",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Паприка",
    "amountRu": "1 ч. л."
   },
   {
    "id": "mustard",
    "name": "Ground mustard",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Горчичный порошок",
    "amountRu": "1 ч. л."
   },
   {
    "id": "pepper",
    "name": "Black pepper",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Чёрный перец",
    "amountRu": "½ ч. л."
   },
   {
    "id": "cayenne",
    "name": "Cayenne pepper",
    "type": "pantry",
    "amount": "¼–½ tsp",
    "aliases": [],
    "nameRu": "Кайенский перец",
    "amountRu": "¼–½ ч. л."
   }
  ],
  "steps": [
   "Measure all ground spices into a dry bowl.",
   "Whisk thoroughly until the color is even. For smoother powder, pulse briefly in a clean spice grinder.",
   "Transfer to a labeled airtight jar. Keep cool, dark, and dry; make small batches for best aroma. Start with 1–2 tbsp in a curry and adjust."
  ],
  "nameRu": "Домашняя смесь карри",
  "introRu": "Ароматная смесь с куркумой. Остроту можно менять по вкусу.",
  "servesRu": "Около ⅓ стакана",
  "stepsRu": [
   "Отмерьте все молотые специи в сухую миску.",
   "Тщательно перемешайте до однородного цвета, при необходимости кратко измельчите в кофемолке для специй.",
   "Пересыпьте в подписанную герметичную баночку и храните в прохладе и темноте. На блюдо начните с 1–2 ст. л. и добавляйте по вкусу."
  ]
 },
 {
  "id": "five-spice",
  "name": "Chinese five-spice powder",
  "family": "Spice Blends",
  "intro": "A warm, aromatic five-spice blend. Sichuan peppercorn and star anise give it its distinctive character.",
  "serves": "Makes about 2 tbsp",
  "ingredients": [
   {
    "id": "star-anise",
    "name": "Ground star anise",
    "type": "pantry",
    "amount": "2 tsp",
    "aliases": [],
    "nameRu": "Молотый бадьян",
    "amountRu": "2 ч. л."
   },
   {
    "id": "fennel",
    "name": "Ground fennel seed",
    "type": "pantry",
    "amount": "2 tsp",
    "aliases": [],
    "nameRu": "Молотые семена фенхеля",
    "amountRu": "2 ч. л."
   },
   {
    "id": "cinnamon",
    "name": "Ground cinnamon (cassia)",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Молотая корица (кассия)",
    "amountRu": "1 ч. л."
   },
   {
    "id": "sichuan",
    "name": "Ground Sichuan peppercorn",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Молотый сычуаньский перец",
    "amountRu": "1 ч. л."
   },
   {
    "id": "cloves",
    "name": "Ground cloves",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Молотая гвоздика",
    "amountRu": "½ ч. л."
   }
  ],
  "steps": [
   "If using whole spices, toast lightly in a dry pan just until aromatic; cool completely, then grind finely. Avoid scorching.",
   "Combine all five spices and mix until uniform. Sift if needed.",
   "Store airtight away from heat and light. Use sparingly in marinades, roasted vegetables, and braises. Star anise is not the same as ordinary anise seed."
  ],
  "nameRu": "Китайская смесь «Пять специй»",
  "introRu": "Пряная смесь из пяти компонентов с бадьяном и сычуаньским перцем.",
  "servesRu": "Около 2 ст. л.",
  "stepsRu": [
   "Если используете цельные специи, слегка прогрейте их на сухой сковороде до появления аромата; остудите и смелите.",
   "Смешайте пять специй, при необходимости просейте.",
   "Храните герметично вдали от света и тепла. Бадьян отличается от обычного аниса."
  ]
 },
 {
  "id": "garam-masala",
  "name": "Homemade garam masala",
  "family": "Spice Blends",
  "intro": "A fragrant finishing blend suited to Indian-style curries, vegetables, and chicken.",
  "serves": "Makes about ¼ cup",
  "ingredients": [
   {
    "id": "cumin",
    "name": "Ground cumin",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Молотый кумин",
    "amountRu": "1 ст. л."
   },
   {
    "id": "coriander",
    "name": "Ground coriander",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Молотый кориандр",
    "amountRu": "1 ст. л."
   },
   {
    "id": "cardamom",
    "name": "Ground cardamom",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Молотый кардамон",
    "amountRu": "1 ч. л."
   },
   {
    "id": "cinnamon",
    "name": "Ground cinnamon",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Молотая корица",
    "amountRu": "1 ч. л."
   },
   {
    "id": "pepper",
    "name": "Black pepper",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Чёрный перец",
    "amountRu": "½ ч. л."
   },
   {
    "id": "cloves",
    "name": "Ground cloves",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Молотая гвоздика",
    "amountRu": "½ ч. л."
   },
   {
    "id": "nutmeg",
    "name": "Ground nutmeg",
    "type": "pantry",
    "amount": "¼ tsp",
    "aliases": [],
    "nameRu": "Молотый мускатный орех",
    "amountRu": "¼ ч. л."
   }
  ],
  "steps": [
   "Mix all spices thoroughly in a dry bowl.",
   "For a fresher blend, lightly toast whole seeds first, let cool, then grind before mixing with other ground spices.",
   "Jar and label. Add toward the end of cooking, starting with ½–1 tsp per dish and adjusting to taste."
  ],
  "nameRu": "Домашняя гарам масала",
  "introRu": "Ароматная смесь для индийских блюд, овощей и курицы.",
  "servesRu": "Около ¼ стакана",
  "stepsRu": [
   "Тщательно смешайте все специи в сухой миске.",
   "Для более яркого аромата слегка прогрейте цельные специи, остудите и смелите.",
   "Храните в баночке и добавляйте ближе к концу приготовления, начиная с ½–1 ч. л. на блюдо."
  ]
 },
 {
  "id": "allspice-substitute",
  "name": "Allspice-style substitute blend",
  "family": "Spice Blends",
  "intro": "A quick substitute when you have no ground allspice. Real allspice is one dried berry, not a mixture; this blend approximates its flavor.",
  "serves": "Makes 2 tsp",
  "ingredients": [
   {
    "id": "cinnamon",
    "name": "Ground cinnamon",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Молотая корица",
    "amountRu": "1 ч. л."
   },
   {
    "id": "cloves",
    "name": "Ground cloves",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Молотая гвоздика",
    "amountRu": "½ ч. л."
   },
   {
    "id": "nutmeg",
    "name": "Ground nutmeg",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Молотый мускатный орех",
    "amountRu": "½ ч. л."
   }
  ],
  "steps": [
   "Mix cinnamon, cloves, and nutmeg until evenly combined.",
   "Use in place of 2 tsp ground allspice where a substitute is acceptable. Flavor will differ from true allspice.",
   "Keep in a sealed jar and use promptly for best aroma."
  ],
  "nameRu": "Смесь-заменитель душистого перца",
  "introRu": "Заменитель душистого перца из нескольких специй. Настоящий душистый перец представляет собой высушенные ягоды одного растения.",
  "servesRu": "2 ч. л.",
  "stepsRu": [
   "Равномерно смешайте корицу, гвоздику и мускатный орех.",
   "Используйте вместо 2 ч. л. молотого душистого перца, если рецепт допускает замену. Вкус будет отличаться от настоящего.",
   "Храните в плотно закрытой баночке и используйте, пока смесь ароматна."
  ]
 },
 {
  "id": "taco-seasoning",
  "name": "Taco seasoning blend",
  "family": "Spice Blends",
  "intro": "A savory homemade blend for tacos, beans, roasted vegetables, or minced meat.",
  "serves": "Makes about ¼ cup",
  "ingredients": [
   {
    "id": "chili",
    "name": "Chili powder (mild blend)",
    "type": "pantry",
    "amount": "2 tbsp",
    "aliases": [],
    "nameRu": "Порошок чили (мягкая смесь)",
    "amountRu": "2 ст. л."
   },
   {
    "id": "cumin",
    "name": "Ground cumin",
    "type": "pantry",
    "amount": "1 tbsp",
    "aliases": [],
    "nameRu": "Молотый кумин",
    "amountRu": "1 ст. л."
   },
   {
    "id": "paprika",
    "name": "Paprika",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Паприка",
    "amountRu": "1 ч. л."
   },
   {
    "id": "oregano",
    "name": "Dried oregano",
    "type": "garden",
    "amount": "1 tsp",
    "aliases": [
     "oregano"
    ],
    "nameRu": "Сушёный орегано",
    "amountRu": "1 ч. л."
   },
   {
    "id": "onion",
    "name": "Onion powder",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Луковый порошок",
    "amountRu": "1 ч. л."
   },
   {
    "id": "garlic",
    "name": "Garlic powder",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Чесночный порошок",
    "amountRu": "1 ч. л."
   },
   {
    "id": "cayenne",
    "name": "Cayenne pepper",
    "type": "pantry",
    "amount": "¼ tsp, optional",
    "aliases": [],
    "nameRu": "Кайенский перец",
    "amountRu": "¼ ч. л., по желанию"
   },
   {
    "id": "salt",
    "name": "Salt",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Соль",
    "amountRu": "½ ч. л."
   }
  ],
  "steps": [
   "Stir all spices together thoroughly. Omit cayenne for a mild version.",
   "Store dry in a labeled jar. Start with about 2 tbsp per 1 lb (450 g) of cooked filling, adding a splash of water as needed."
  ],
  "nameRu": "Приправа для тако",
  "introRu": "Домашняя смесь для тако, фасоли, овощей и мясного фарша.",
  "servesRu": "Около ¼ стакана",
  "stepsRu": [
   "Смешайте все специи. Для мягкой версии не добавляйте кайенский перец.",
   "Храните сухую смесь в подписанной баночке. Используйте примерно 2 ст. л. на 450 г готовой начинки, добавляя при необходимости немного воды."
  ]
 },
 {
  "id": "italian-herb-blend",
  "name": "Italian herb seasoning",
  "family": "Spice Blends",
  "intro": "A versatile salt-free mix for tomato sauces, roasted vegetables, and breads.",
  "serves": "Makes about ⅓ cup",
  "ingredients": [
   {
    "id": "basil",
    "name": "Dried basil",
    "type": "garden",
    "amount": "2 tbsp",
    "aliases": [
     "basil"
    ],
    "nameRu": "Сушёный базилик",
    "amountRu": "2 ст. л."
   },
   {
    "id": "oregano",
    "name": "Dried oregano",
    "type": "garden",
    "amount": "2 tbsp",
    "aliases": [
     "oregano"
    ],
    "nameRu": "Сушёный орегано",
    "amountRu": "2 ст. л."
   },
   {
    "id": "thyme",
    "name": "Dried thyme",
    "type": "garden",
    "amount": "1 tbsp",
    "aliases": [
     "thyme"
    ],
    "nameRu": "Сушёный тимьян",
    "amountRu": "1 ст. л."
   },
   {
    "id": "rosemary",
    "name": "Dried rosemary",
    "type": "garden",
    "amount": "1 tbsp",
    "aliases": [
     "rosemary"
    ],
    "nameRu": "Сушёный розмарин",
    "amountRu": "1 ст. л."
   },
   {
    "id": "marjoram",
    "name": "Dried marjoram",
    "type": "garden",
    "amount": "1 tbsp",
    "aliases": [
     "marjoram"
    ],
    "nameRu": "Сушёный майоран",
    "amountRu": "1 ст. л."
   }
  ],
  "steps": [
   "Check that all home-dried herbs are fully dry before mixing. Crush rosemary leaves finely between fingers or with a mortar.",
   "Mix the dried herbs and transfer to an airtight container.",
   "Use 1–2 tsp in tomato sauce, bread dough, soups, or vegetables."
  ],
  "nameRu": "Итальянская смесь трав",
  "introRu": "Смесь сушёных трав без соли для соусов, овощей и выпечки.",
  "servesRu": "Около ⅓ стакана",
  "stepsRu": [
   "Убедитесь, что все домашние травы полностью высушены. Мелко разотрите розмарин.",
   "Смешайте травы и пересыпьте в герметичную баночку.",
   "Добавляйте 1–2 ч. л. в томатные соусы, хлеб, супы или овощи."
  ]
 },
 {
  "id": "pumpkin-pie-spice",
  "name": "Pumpkin pie spice blend",
  "family": "Spice Blends",
  "intro": "A warm baking mixture for pies, oats, muffins, and autumn desserts.",
  "serves": "Makes about 3 tbsp",
  "ingredients": [
   {
    "id": "cinnamon",
    "name": "Ground cinnamon",
    "type": "pantry",
    "amount": "2 tbsp",
    "aliases": [],
    "nameRu": "Молотая корица",
    "amountRu": "2 ст. л."
   },
   {
    "id": "ginger",
    "name": "Ground ginger",
    "type": "pantry",
    "amount": "2 tsp",
    "aliases": [],
    "nameRu": "Молотый имбирь",
    "amountRu": "2 ч. л."
   },
   {
    "id": "nutmeg",
    "name": "Ground nutmeg",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Молотый мускатный орех",
    "amountRu": "1 ч. л."
   },
   {
    "id": "allspice",
    "name": "Ground allspice",
    "type": "pantry",
    "amount": "1 tsp",
    "aliases": [],
    "nameRu": "Молотый душистый перец",
    "amountRu": "1 ч. л."
   },
   {
    "id": "cloves",
    "name": "Ground cloves",
    "type": "pantry",
    "amount": "½ tsp",
    "aliases": [],
    "nameRu": "Молотая гвоздика",
    "amountRu": "½ ч. л."
   }
  ],
  "steps": [
   "Whisk all ground spices together.",
   "Store in an airtight jar away from light. Use approximately 1–2 tsp per pie, adjusting to the recipe and your taste."
  ],
  "nameRu": "Смесь специй для тыквенного пирога",
  "introRu": "Тёплая пряная смесь для пирогов, каш и десертов.",
  "servesRu": "Около 3 ст. л.",
  "stepsRu": [
   "Венчиком тщательно смешайте молотые специи.",
   "Храните герметично в тёмном месте. На один пирог обычно берут примерно 1–2 ч. л., учитывая свой рецепт."
  ]
 },
{
  "id": "homemade-spaghetti-sauce",
  "name": "Homemade spaghetti sauce",
  "family": "Kitchen",
  "intro": "Slow-simmered Italian-American tomato sauce with onions, garlic, basil and oregano. Brown ground beef for a hearty meat sauce, or omit it for a meatless version. Not a tested canning recipe.",
  "serves": "Makes about 6 servings (for 1 lb / 450 g dry spaghetti)",
  "ingredients": [
    {
      "id": "tomatoes",
      "name": "Crushed tomatoes",
      "type": "garden",
      "amount": "2 cans (28 oz / 794 g each)",
      "aliases": [
        "tomato"
      ],
      "nameRu": "Измельчённые томаты",
      "amountRu": "2 банки по 794 г"
    },
    {
      "id": "onion",
      "name": "Yellow onion",
      "type": "garden",
      "amount": "1 medium, diced",
      "aliases": [
        "onion"
      ],
      "nameRu": "Жёлтый репчатый лук",
      "amountRu": "1 средняя луковица, кубиками"
    },
    {
      "id": "garlic",
      "name": "Garlic",
      "type": "garden",
      "amount": "4 cloves, minced",
      "aliases": [
        "garlic"
      ],
      "nameRu": "Чеснок",
      "amountRu": "4 зубчика, измельчить"
    },
    {
      "id": "oil",
      "name": "Olive oil",
      "type": "pantry",
      "amount": "2 tbsp",
      "aliases": [],
      "nameRu": "Оливковое масло",
      "amountRu": "2 ст. л."
    },
    {
      "id": "paste",
      "name": "Tomato paste",
      "type": "pantry",
      "amount": "2 tbsp",
      "aliases": [],
      "nameRu": "Томатная паста",
      "amountRu": "2 ст. л."
    },
    {
      "id": "basil",
      "name": "Dried basil or fresh basil",
      "type": "garden",
      "amount": "2 tsp dried or 2 tbsp fresh",
      "aliases": [
        "basil"
      ],
      "nameRu": "Сушёный или свежий базилик",
      "amountRu": "2 ч. л. сушёного или 2 ст. л. свежего"
    },
    {
      "id": "oregano",
      "name": "Dried oregano",
      "type": "garden",
      "amount": "1½ tsp",
      "aliases": [
        "oregano"
      ],
      "nameRu": "Сушёный орегано",
      "amountRu": "1½ ч. л."
    },
    {
      "id": "bay",
      "name": "Bay leaf",
      "type": "pantry",
      "amount": "1 leaf",
      "aliases": [],
      "nameRu": "Лавровый лист",
      "amountRu": "1 лист"
    },
    {
      "id": "salt",
      "name": "Salt",
      "type": "pantry",
      "amount": "1 tsp to start; adjust to taste",
      "aliases": [],
      "nameRu": "Соль",
      "amountRu": "1 ч. л. для начала, затем по вкусу"
    },
    {
      "id": "pepper",
      "name": "Black pepper",
      "type": "pantry",
      "amount": "½ tsp",
      "aliases": [],
      "nameRu": "Чёрный перец",
      "amountRu": "½ ч. л."
    },
    {
      "id": "sugar",
      "name": "Sugar (optional, if tomatoes taste sharp)",
      "type": "pantry",
      "amount": "½–1 tsp",
      "aliases": [],
      "nameRu": "Сахар (по желанию, если томаты слишком кислые)",
      "amountRu": "½–1 ч. л."
    },
    {
      "id": "beef",
      "name": "Ground beef (optional for meat sauce)",
      "type": "pantry",
      "amount": "1 lb (450 g)",
      "aliases": [],
      "nameRu": "Говяжий фарш (по желанию, для мясного соуса)",
      "amountRu": "450 г"
    },
    {
      "id": "parsley",
      "name": "Fresh parsley (optional)",
      "type": "garden",
      "amount": "2 tbsp, chopped",
      "aliases": [
        "parsley"
      ],
      "nameRu": "Свежая петрушка (по желанию)",
      "amountRu": "2 ст. л., нарезать"
    }
  ],
  "steps": [
    "If making meat sauce, brown ground beef in a heavy pot over medium heat, breaking it into small pieces. Drain excess fat if needed. If making a meatless sauce, skip the beef.",
    "Add olive oil and diced onion to the pot; cook gently 5–7 minutes until soft. Stir in minced garlic and tomato paste; cook 1 minute without scorching.",
    "Add crushed tomatoes, basil, oregano, bay leaf, salt, and black pepper. Stir well, bring to a gentle bubble, then lower the heat. Simmer partly covered for 35–50 minutes, stirring occasionally so the bottom does not catch. If adding beef, simmer until fully cooked (160°F / 71°C for ground beef).",
    "Taste and adjust salt and pepper. Add up to 1 tsp sugar only if the tomatoes need balancing. Remove the bay leaf, stir in parsley if using, and serve over freshly cooked spaghetti.",
    "Refrigerate leftovers promptly in shallow containers and use within 3–4 days, or freeze. Do not use this recipe for shelf-stable home canning: a tested canning formula is required."
  ],
  "nameRu": "Домашний соус для спагетти",
  "introRu": "Томатный соус в итало-американском стиле с луком, чесноком, базиликом и орегано. Для мясного варианта можно добавить говяжий фарш. Это не проверенный рецепт для консервирования.",
  "servesRu": "Около 6 порций (на 450 г сухих спагетти)",
  "stepsRu": [
    "Для мясного варианта обжарьте говяжий фарш в кастрюле с толстым дном на среднем огне, разбивая комочки. При необходимости слейте лишний жир. Для постного варианта пропустите этот шаг.",
    "Добавьте оливковое масло и лук, готовьте на слабом огне 5–7 минут до мягкости. Вмешайте чеснок и томатную пасту, прогрейте 1 минуту, не допуская подгорания.",
    "Добавьте измельчённые томаты, базилик, орегано, лавровый лист, соль и чёрный перец. Доведите до слабого кипения, затем убавьте огонь. Томите под неплотно закрытой крышкой 35–50 минут, иногда помешивая. Если добавлен фарш, готовьте его до внутренней температуры 71°C.",
    "Попробуйте соус, добавьте соль и перец по вкусу. Если томаты слишком кислые, положите немного сахара (не более 1 ч. л.). Выньте лавровый лист, добавьте петрушку по желанию и подавайте со свежесваренными спагетти.",
    "Быстро охладите остатки в неглубоких ёмкостях и храните в холодильнике 3–4 дня либо заморозьте. Для консервирования без холодильника требуется отдельный проверенный рецепт."
  ]
},
{
  "id": "classic-hollandaise",
  "name": "Classic Hollandaise sauce",
  "family": "Kitchen",
  "intro": "A traditional lemony butter-and-egg-yolk emulsion, seasoned with salt, white pepper and a pinch of cayenne. Includes both clarified butter and ordinary melted-butter methods.",
  "serves": "Makes about ¾ cup (4 small servings)",
  "ingredients": [
    {
      "id": "yolks",
      "name": "Egg yolks (preferably pasteurized)",
      "type": "pantry",
      "amount": "3 large",
      "aliases": [],
      "nameRu": "Яичные желтки (предпочтительно пастеризованные)",
      "amountRu": "3 крупных"
    },
    {
      "id": "butter",
      "name": "Unsalted butter",
      "type": "pantry",
      "amount": "⅔ cup (150 g) to clarify, or ½ cup (115 g) for whole melted butter",
      "aliases": [],
      "nameRu": "Несолёное сливочное масло",
      "amountRu": "150 г для осветления или 115 г растопленного обычного масла"
    },
    {
      "id": "lemon",
      "name": "Fresh lemon juice",
      "type": "pantry",
      "amount": "1 tbsp, plus more to taste",
      "aliases": [],
      "nameRu": "Свежий лимонный сок",
      "amountRu": "1 ст. л., затем по вкусу"
    },
    {
      "id": "water",
      "name": "Water",
      "type": "pantry",
      "amount": "1 tbsp, plus a little warm water if needed",
      "aliases": [],
      "nameRu": "Вода",
      "amountRu": "1 ст. л., при необходимости ещё немного тёплой"
    },
    {
      "id": "salt",
      "name": "Fine salt",
      "type": "pantry",
      "amount": "¼ tsp, or to taste",
      "aliases": [],
      "nameRu": "Мелкая соль",
      "amountRu": "¼ ч. л. или по вкусу"
    },
    {
      "id": "whitepepper",
      "name": "Ground white pepper",
      "type": "pantry",
      "amount": "⅛ tsp",
      "aliases": [],
      "nameRu": "Молотый белый перец",
      "amountRu": "⅛ ч. л."
    },
    {
      "id": "cayenne",
      "name": "Cayenne pepper",
      "type": "pantry",
      "amount": "tiny pinch, optional",
      "aliases": [],
      "nameRu": "Кайенский перец",
      "amountRu": "маленькая щепотка, по желанию"
    }
  ],
  "steps": [
    "Choose the butter method. For clarified butter, gently melt ⅔ cup (150 g) unsalted butter over low heat without stirring. Skim off white foam, let the milky solids settle, and carefully pour the clear golden fat into a warm jug, leaving solids behind. Alternatively, simply melt ½ cup (115 g) unsalted butter gently and use it as-is.",
    "Place egg yolks, 1 tbsp lemon juice and 1 tbsp water in a heatproof bowl set over a saucepan of barely simmering water; the bowl must not touch the water. Whisk constantly until the yolks become pale, slightly thickened and warm. Do not let them scramble. Pasteurized egg yolks are the safer choice for this gently heated sauce.",
    "Take the bowl off the heat. While whisking continuously, add the warm (not sizzling-hot) clarified or ordinary melted butter a few drops at a time, then in a thin steady stream as the sauce thickens. If it becomes too thick, whisk in 1 tsp warm water at a time.",
    "Season with salt, white pepper and, if desired, a tiny pinch of cayenne. Taste and adjust lemon juice. The sauce should be glossy and pourable. If it begins to separate, whisk 1 tsp warm water in a clean bowl and slowly whisk the broken sauce into it.",
    "Serve promptly with eggs Benedict, asparagus, fish or vegetables. Because this sauce contains lightly heated eggs, use pasteurized yolks, especially for people at higher risk of foodborne illness; do not leave it standing lukewarm. Refrigerate leftovers promptly, but freshly made Hollandaise has the best texture."
  ],
  "nameRu": "Классический голландский соус",
  "introRu": "Традиционный соус-эмульсия из желтков, сливочного масла и лимонного сока с солью, белым и кайенским перцем. Описаны способы с осветлённым и обычным растопленным маслом.",
  "servesRu": "Около ¾ стакана (4 небольшие порции)",
  "stepsRu": [
    "Выберите способ подготовки масла. Для осветлённого масла медленно растопите 150 г несолёного сливочного масла на слабом огне, не перемешивая. Снимите белую пену, дайте молочным частицам осесть и осторожно перелейте прозрачный золотистый жир в тёплую посуду, оставив осадок. Либо просто растопите 115 г обычного масла и используйте его целиком.",
    "Соедините желтки, 1 ст. л. лимонного сока и 1 ст. л. воды в жаропрочной миске над кастрюлей с едва кипящей водой; дно миски не должно касаться воды. Постоянно взбивайте, пока масса не станет светлой, тёплой и немного густой. Не допускайте сворачивания желтков. Для соуса с таким мягким нагревом безопаснее использовать пастеризованные желтки.",
    "Снимите миску с нагрева. Непрерывно взбивая, добавляйте тёплое, но не горячее масло сначала по каплям, затем тонкой струйкой, пока соус не загустеет. Если соус слишком густой, добавляйте по 1 ч. л. тёплой воды.",
    "Приправьте солью, белым перцем и, по желанию, щепоткой кайенского перца. Добавьте лимонный сок по вкусу. Соус должен быть гладким и текучим. Если он расслоился, взбейте 1 ч. л. тёплой воды в чистой миске и понемногу вмешайте расслоившийся соус.",
    "Подавайте сразу к яйцам бенедикт, спарже, рыбе или овощам. Поскольку яйца подвергаются лишь мягкому нагреву, особенно для людей с повышенным риском пищевых инфекций используйте пастеризованные желтки. Не оставляйте соус надолго тёплым; остатки быстро уберите в холодильник. Свежий голландский соус имеет лучшую текстуру."
  ]
}
];
root.DKSeedBankRecipeLibrary=Object.freeze({recipes});
})(window);
