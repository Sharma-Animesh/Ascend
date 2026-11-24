// Template meal plans keyed by cuisine region — two alternating day templates
// (Day A / Day B) per diet preference, for every cuisine region. Everyday,
// authentic regional dishes at ≈1800–2200 kcal/day and ≈90–130 g protein/day.
// veg = vegetarian (dairy ok; no meat/fish/egg unless an eggless swap is
// labeled). vegan = zero animal products (no dairy, egg, honey or whey).
// General information, not medical or dietary advice.

import type { CuisineRegion } from './regions'

export type MealPlanDay = {
  label: string
  meals: Array<{
    meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    name: string
    desc: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }>
}

export type MealPlanDiet = 'veg' | 'nonveg' | 'vegan'

type PlanMeal = MealPlanDay['meals'][number]

function m(
  slot: PlanMeal['meal'],
  name: string,
  desc: string,
  calories: number,
  protein_g: number,
  carbs_g: number,
  fat_g: number,
): PlanMeal {
  return { meal: slot, name, desc, calories, protein_g, carbs_g, fat_g }
}

function days(a: PlanMeal[], b: PlanMeal[]): MealPlanDay[] {
  return [
    { label: 'Day A', meals: a },
    { label: 'Day B', meals: b },
  ]
}

export const MEAL_PLANS: Record<CuisineRegion, Record<MealPlanDiet, MealPlanDay[]>> = {
  // ---------------------------------------------------------------- INDIAN
  indian: {
    veg: days(
      [
        m('breakfast', 'Masala Oats + Paneer Bhurji', 'Savoury oats with peas and carrot, side of scrambled paneer with onion and turmeric.', 430, 22, 50, 15),
        m('lunch', 'Rajma Chawal Bowl', 'Kidney-bean curry over brown rice with cucumber raita and a squeeze of lime.', 580, 24, 84, 16),
        m('snack', 'Greek Yogurt + Roasted Chana', 'Thick yogurt topped with crunchy roasted chickpeas and seasonal fruit.', 290, 20, 36, 8),
        m('dinner', 'Palak Paneer + 2 Rotis', 'Spinach-paneer curry with whole-wheat rotis and a simple kachumber salad.', 560, 28, 46, 28),
      ],
      [
        m('breakfast', 'Moong Dal Chilla', 'Two lentil crepes stuffed with onion and coriander, served with mint chutney.', 390, 21, 46, 13),
        m('lunch', 'Paneer Tikka Wrap', 'Whole-wheat wrap with charred paneer tikka, peppers and a yogurt-mint drizzle.', 560, 30, 58, 22),
        m('snack', 'Banana Whey Smoothie', 'Milk, banana and a scoop of whey blended with a pinch of cinnamon.', 300, 28, 32, 7),
        m('dinner', 'Dal Tadka + Jeera Rice', 'Tempered yellow dal with cumin rice, steamed greens and a side salad.', 590, 24, 88, 15),
      ],
    ),
    nonveg: days(
      [
        m('breakfast', 'Masala Egg Scramble + Toast', 'Three-egg bhurji with tomato and chilli on two slices of whole-grain toast.', 430, 26, 34, 21),
        m('lunch', 'Home-style Chicken Curry + Rice', 'Light chicken curry with steamed rice and a crunchy onion-cucumber salad.', 620, 42, 66, 20),
        m('snack', 'Yogurt Fruit Parfait', 'Greek yogurt layered with berries or mango and a spoon of granola.', 250, 16, 30, 7),
        m('dinner', 'Tandoori Chicken + Roti', 'Grilled tandoori chicken with whole-wheat roti and garlicky sautéed greens.', 560, 45, 42, 22),
      ],
      [
        m('breakfast', 'Egg Bhurji Wrap', 'Whole-wheat wrap filled with spiced egg scramble, onion and coriander.', 420, 24, 40, 18),
        m('lunch', 'Grilled Fish + Lemon Rice', 'Pan-grilled fish fillet with tangy lemon rice and kachumber salad.', 580, 38, 62, 18),
        m('snack', 'Banana Whey Smoothie', 'Milk, banana and a scoop of whey — quick fuel between quests.', 300, 28, 34, 5),
        m('dinner', 'Chicken Keema + 2 Rotis', 'Minced chicken with peas and warm spices, whole-wheat rotis and salad.', 580, 40, 48, 24),
      ],
    ),
    vegan: days(
      [
        m('breakfast', 'Tofu Bhurji + Multigrain Toast', 'Turmeric-spiced tofu scramble with onion and tomato on toasted multigrain bread.', 400, 24, 38, 17),
        m('lunch', 'Chole + Brown Rice', 'Chickpea curry simmered with tomato and spices over brown rice, side salad.', 600, 24, 92, 15),
        m('snack', 'Roasted Chana + Almonds', 'A crunchy handful of roasted chickpeas and almonds with a piece of fruit.', 290, 14, 28, 14),
        m('dinner', 'Soya Chunk Curry + Rice', 'Soya chunks simmered in an onion-tomato gravy with steamed rice and greens.', 550, 32, 62, 18),
      ],
      [
        m('breakfast', 'Peanut Butter Chia Oats', 'Overnight oats in soy milk with peanut butter, chia seeds and sliced banana.', 460, 20, 56, 18),
        m('lunch', 'Masoor Dal + Bajra Roti', 'Red-lentil dal with millet rotis, lemon-dressed salad and steamed greens.', 560, 24, 82, 14),
        m('snack', 'Soy Protein Date Shake', 'Soy milk blended with dates, cocoa, cardamom and a scoop of plant protein.', 300, 24, 34, 7),
        m('dinner', 'Rajma + Rice + Crispy Tofu', 'Kidney-bean curry over brown rice topped with pan-crisped tofu cubes.', 620, 30, 82, 20),
      ],
    ),
  },

  // ------------------------------------------------------------ EAST-ASIAN
  'east-asian': {
    veg: days(
      [
        m('breakfast', 'Silken Tofu Ginger Congee', 'Rice porridge with silken tofu, ginger, scallions and crushed peanuts.', 410, 20, 58, 11),
        m('lunch', 'Tofu Stir-Fry with Rice', 'Crisp tofu, broccoli and peppers in garlic sauce over steamed rice.', 580, 30, 70, 19),
        m('snack', 'Edamame + Orange', 'Steamed edamame with sea salt and a juicy orange on the side.', 250, 17, 26, 9),
        m('dinner', 'Miso Soup + Veggie Yaki Udon', 'Kombu-dashi miso soup beside stir-fried udon with cabbage, carrot and tofu.', 560, 24, 80, 16),
      ],
      [
        m('breakfast', 'Veggie-Tofu Bao + Soy Milk', 'Two steamed buns stuffed with tofu and vegetables, with warm sweet soy milk.', 440, 22, 62, 12),
        m('lunch', "Buddha's Delight + Rice", 'Braised mixed vegetables, tofu skin and shiitake over steamed rice.', 560, 24, 78, 16),
        m('snack', 'Matcha Yogurt Bowl', 'Thick yogurt whisked with matcha, topped with kiwi and toasted sesame.', 260, 18, 30, 7),
        m('dinner', 'Veg Mapo Tofu + Rice', 'Meat-free Sichuan tofu in chilli-bean sauce with steamed rice and bok choy.', 590, 28, 70, 21),
      ],
    ),
    nonveg: days(
      [
        m('breakfast', 'Tamagoyaki Breakfast Set', 'Japanese rolled omelette with a small rice bowl and miso soup.', 430, 24, 50, 15),
        m('lunch', 'Chicken Teriyaki Bowl', 'Grilled chicken glazed in teriyaki over rice with steamed broccoli.', 620, 42, 74, 16),
        m('snack', 'Edamame + Boiled Egg', 'Salted edamame pods and a soft-boiled egg — clean, quick fuel.', 240, 18, 14, 12),
        m('dinner', 'Cantonese Steamed Fish + Rice', 'Steamed white fish with ginger and scallion, rice and choy sum.', 530, 38, 58, 15),
      ],
      [
        m('breakfast', 'Chicken Congee', 'Rice porridge with shredded chicken, ginger, scallions and white pepper.', 420, 28, 52, 11),
        m('lunch', 'Beef & Broccoli + Rice', 'Wok-seared beef and broccoli in a light soy-garlic sauce over rice.', 600, 38, 64, 20),
        m('snack', 'Tuna Onigiri + Edamame', 'A tuna-filled rice ball wrapped in nori with a side of edamame.', 280, 18, 38, 6),
        m('dinner', 'Chicken Pho', 'Rice-noodle soup with poached chicken, herbs, bean sprouts and lime.', 510, 34, 68, 10),
      ],
    ),
    vegan: days(
      [
        m('breakfast', 'Lemongrass Tofu Banh Mi', 'Crusty roll with lemongrass tofu, pickled carrot-daikon and cilantro.', 460, 22, 60, 15),
        m('lunch', 'Kung Pao Tofu + Rice', 'Wok-tossed tofu with peanuts, dried chillies and peppers over steamed rice.', 600, 28, 72, 22),
        m('snack', 'Chilli-Salt Edamame', 'Steamed edamame pods tossed with chilli flakes and flaky salt.', 220, 18, 18, 9),
        m('dinner', 'Vegetable Miso Ramen', 'Kombu-dashi miso broth with noodles, corn, spinach and seared tofu.', 570, 26, 78, 17),
      ],
      [
        m('breakfast', 'Sweet Potato Congee + Soy Milk', 'Rice porridge with sweet potato and peanuts, plus a glass of warm soy milk.', 420, 16, 64, 12),
        m('lunch', 'Tofu Bibimbap', 'Korean rice bowl with sautéed vegetables, gochujang and seared tofu — no egg.', 620, 26, 86, 19),
        m('snack', 'Soy Matcha Latte + Edamame', 'Matcha whisked into hot soy milk with a small bowl of salted edamame.', 280, 18, 22, 13),
        m('dinner', 'Tempeh Pad See Ew', 'Wide rice noodles with tempeh and Chinese broccoli in a soy glaze — egg-free.', 590, 30, 74, 20),
      ],
    ),
  },

  // --------------------------------------------------------- MEDITERRANEAN
  mediterranean: {
    veg: days(
      [
        m('breakfast', 'Greek Yogurt, Honey & Walnuts', 'Thick Greek yogurt with honey, walnuts and sliced figs or banana.', 400, 26, 40, 15),
        m('lunch', 'Greek Salad + Grilled Halloumi + Pita', 'Tomato-cucumber-olive salad with grilled halloumi and warm pita.', 580, 28, 52, 29),
        m('snack', 'Hummus + Wholegrain Pita', 'Creamy hummus with olive oil and wedges of toasted wholegrain pita.', 280, 12, 34, 11),
        m('dinner', 'Pasta e Fagioli', 'Italian pasta-and-bean soup with tomato, rosemary and grated parmesan.', 560, 26, 82, 14),
      ],
      [
        m('breakfast', 'Ricotta & Fig Toast', 'Wholegrain toast with ricotta, sliced figs, honey and crushed pistachios.', 420, 20, 50, 16),
        m('lunch', 'Margherita Flatbread + Salad', 'Tomato-mozzarella-basil flatbread with a lemony green side salad.', 600, 26, 74, 21),
        m('snack', 'Yogurt, Orange & Pistachios', 'Greek yogurt with orange segments and a scatter of pistachios.', 280, 18, 30, 10),
        m('dinner', 'Gigantes Plaki + Feta + Bread', 'Greek giant beans baked in tomato, crumbled feta and wholegrain bread.', 560, 26, 70, 19),
      ],
    ),
    nonveg: days(
      [
        m('breakfast', 'Mediterranean Omelette + Toast', 'Two-egg omelette with tomato, olives and feta on wholegrain toast.', 430, 26, 32, 21),
        m('lunch', 'Chicken Souvlaki Pita Wraps', 'Grilled chicken skewers folded into pita with tzatziki and salad.', 610, 42, 60, 21),
        m('snack', 'Greek Yogurt with Honey', 'Thick strained yogurt with a drizzle of honey — simple and protein-rich.', 240, 20, 28, 6),
        m('dinner', 'Fakes Lentil Soup + Grilled Sardines', 'Greek lentil soup with red-wine vinegar, sardines and crusty bread.', 530, 34, 56, 18),
      ],
      [
        m('breakfast', 'Tostada con Tomate + Jamón', 'Spanish toast rubbed with tomato and olive oil, topped with lean ham.', 400, 20, 46, 15),
        m('lunch', 'Weeknight Seafood Paella', 'Saffron rice with shrimp, peas and peppers — a simple pan paella.', 600, 34, 72, 18),
        m('snack', 'Greek Yogurt + Walnuts', 'Strained yogurt with toasted walnuts and a little cinnamon.', 260, 18, 22, 12),
        m('dinner', 'Grilled Chicken + Horiatiki + Pita', 'Lemon-oregano chicken with village salad, olives and warm pita.', 580, 42, 46, 24),
      ],
    ),
    vegan: days(
      [
        m('breakfast', 'Soy Yogurt, Berries & Almonds', 'Plain soy yogurt with berries, toasted almonds and a spoon of oats.', 400, 20, 42, 17),
        m('lunch', 'Chickpea & Farro Salad', 'Farro and chickpeas with cucumber, olives, herbs and lemon-oil dressing.', 590, 26, 80, 19),
        m('snack', 'Edamame Hummus + Pita', 'Green edamame hummus with warm pita wedges and cucumber sticks.', 280, 14, 30, 12),
        m('dinner', 'Red-Lentil Pasta al Pomodoro', 'Red-lentil penne in a rich tomato-basil sauce with olive oil.', 580, 34, 74, 16),
      ],
      [
        m('breakfast', 'Tahini-Date Overnight Oats', 'Oats soaked in soy milk with tahini, chopped dates and cinnamon.', 450, 18, 58, 16),
        m('lunch', 'White Bean & Kale Minestrone + Bread', 'Chunky vegetable-bean minestrone with a slice of wholegrain bread.', 560, 28, 78, 15),
        m('snack', 'Soy-Berry Protein Smoothie', 'Soy milk, frozen berries and pea protein blended until creamy.', 280, 24, 30, 7),
        m('dinner', 'Briam with Butter Beans', 'Greek roasted vegetables in tomato and olive oil with butter beans and bread.', 580, 22, 76, 21),
      ],
    ),
  },

  // ---------------------------------------------------------------- WESTERN
  western: {
    veg: days(
      [
        m('breakfast', 'Berry Overnight Oats + Greek Yogurt', 'Oats soaked with milk and Greek yogurt, topped with mixed berries.', 430, 24, 56, 12),
        m('lunch', 'Veggie Burger + Sweet-Potato Fries', 'Black-bean patty in a wholegrain bun with salad and baked sweet-potato fries.', 600, 26, 74, 22),
        m('snack', 'Cottage Cheese + Pineapple', 'A bowl of cottage cheese with fresh pineapple chunks.', 240, 22, 24, 6),
        m('dinner', 'Pesto Pasta with White Beans', 'Wholegrain pasta tossed with basil pesto, white beans and cherry tomatoes.', 580, 24, 76, 20),
      ],
      [
        m('breakfast', 'Protein Pancakes with Berries', 'Blended oat, whey and yogurt pancakes — no egg needed — with berries.', 450, 28, 58, 12),
        m('lunch', 'Caprese Sandwich + Side Salad', 'Mozzarella, tomato and basil on ciabatta with a balsamic side salad.', 560, 24, 60, 24),
        m('snack', 'Trail Mix + String Cheese', 'Nuts, seeds and raisins with a stick of string cheese.', 290, 12, 22, 17),
        m('dinner', "Mushroom & Lentil Shepherd's Pie", 'Mushroom-lentil filling under golden mashed potato with green peas.', 560, 26, 70, 20),
      ],
    ),
    nonveg: days(
      [
        m('breakfast', 'Banana Oatmeal + Boiled Eggs', 'Warm oats with banana and cinnamon plus two boiled eggs.', 440, 22, 56, 14),
        m('lunch', 'Chicken, Rice & Broccoli', 'The classic: grilled chicken breast, steamed rice and broccoli with olive oil.', 590, 44, 68, 14),
        m('snack', 'Greek Yogurt + Granola', 'Thick yogurt with a crunchy spoonful of granola.', 250, 18, 32, 6),
        m('dinner', 'Steak, Baked Potato & Green Beans', 'Lean sirloin with a baked potato, green beans and mustard butter.', 590, 40, 48, 26),
      ],
      [
        m('breakfast', 'Scrambled Eggs on Toast + Fruit', 'Soft scrambled eggs on wholegrain toast with a piece of fruit.', 420, 24, 42, 17),
        m('lunch', 'Tuna Salad Sandwich + Apple', 'Wholegrain tuna-salad sandwich with crisp lettuce and an apple.', 530, 34, 58, 17),
        m('snack', 'Protein Shake + Banana', 'Whey shaken with milk or water and a banana on the side.', 280, 26, 34, 5),
        m('dinner', 'Baked Salmon, Quinoa & Asparagus', 'Oven-baked salmon fillet with fluffy quinoa and roasted asparagus.', 580, 38, 50, 24),
      ],
    ),
    vegan: days(
      [
        m('breakfast', 'PB-Banana Oats (Soy Milk)', 'Oats cooked in soy milk with peanut butter and sliced banana.', 450, 18, 60, 15),
        m('lunch', "Chickpea 'Tuna' Sandwich", 'Mashed chickpea salad with lemon-tahini dressing on wholegrain bread.', 540, 22, 70, 18),
        m('snack', 'Pea-Protein Shake + Banana', 'Plant protein blended with soy milk, plus a banana.', 260, 24, 32, 4),
        m('dinner', 'Tofu, Rice & Broccoli Bowl', 'Seared tofu, steamed rice and broccoli with a garlic-herb sauce.', 570, 32, 66, 19),
      ],
      [
        m('breakfast', 'Tofu Scramble Toast + Avocado', 'Turmeric tofu scramble on wholegrain toast with sliced avocado.', 440, 24, 40, 21),
        m('lunch', 'Hearty Lentil Soup + Wholegrain Roll', 'Slow-simmered lentil-vegetable soup with a crusty wholegrain roll.', 520, 28, 74, 12),
        m('snack', 'Roasted Chickpeas + Apple', 'Crunchy spiced roasted chickpeas with a crisp apple.', 270, 12, 40, 7),
        m('dinner', 'Bean Burger + Roast Potatoes + Slaw', 'Homestyle bean burger with roasted potato wedges and vinegar slaw.', 620, 26, 82, 20),
      ],
    ),
  },

  // --------------------------------------------------------- MIDDLE-EASTERN
  'middle-eastern': {
    veg: days(
      [
        m('breakfast', "Labneh & Za'atar Flatbread", "Warm flatbread with labneh, za'atar, olive oil, cucumber and tomato.", 430, 22, 48, 17),
        m('lunch', 'Halloumi Shawarma-Style Wrap', 'Grilled halloumi in a wrap with pickles, salad and garlic sauce.', 600, 28, 60, 28),
        m('snack', 'Laban, Dates & Pistachios', 'A glass of yogurt drink with two dates and a few pistachios.', 280, 14, 38, 8),
        m('dinner', 'Ful Medames + Pita + Salad', 'Stewed fava beans with olive oil, lemon and warm pita, plus chopped salad.', 560, 26, 74, 17),
      ],
      [
        m('breakfast', 'Cheese Manakish', "Flatbread baked with melty cheese and za'atar, with cucumber and mint tea.", 460, 22, 52, 19),
        m('lunch', 'Eggplant Fatteh', 'Roasted eggplant and chickpeas over crispy pita with yogurt-tahini sauce.', 570, 26, 62, 25),
        m('snack', 'Labneh Bowl with Cucumber & Mint', 'Thick strained yogurt with cucumber, mint and an olive-oil drizzle.', 220, 18, 14, 10),
        m('dinner', 'Vegetable Tagine + Couscous', 'Chickpea-vegetable tagine with apricots and almonds over fluffy couscous.', 610, 24, 86, 19),
      ],
    ),
    nonveg: days(
      [
        m('breakfast', 'Shakshuka + Pita', 'Eggs poached in spiced tomato-pepper sauce with warm pita to scoop.', 430, 22, 40, 20),
        m('lunch', 'Chicken Shawarma Plate', 'Marinated chicken over rice with garlic sauce, pickles and salad.', 610, 42, 64, 20),
        m('snack', 'Laban + Dates', 'A cold glass of yogurt drink with two or three dates.', 230, 12, 36, 5),
        m('dinner', 'Grilled Kofta + Tabbouleh + Pita', 'Charred spiced kofta skewers with parsley-bulgur tabbouleh and pita.', 580, 36, 48, 26),
      ],
      [
        m('breakfast', 'Ful with Boiled Eggs + Pita', 'Fava beans with lemon and cumin, two boiled eggs and warm pita.', 440, 24, 52, 15),
        m('lunch', 'Chicken Kabsa', 'Fragrant spiced rice with chicken, raisins and toasted almonds.', 610, 38, 72, 18),
        m('snack', 'Ayran + Almonds', 'Salted yogurt drink with a small handful of almonds.', 250, 12, 14, 17),
        m('dinner', 'Grilled Fish + Freekeh Pilaf', 'Lemony grilled fish over smoky freekeh pilaf with chopped salad.', 550, 38, 56, 18),
      ],
    ),
    vegan: days(
      [
        m('breakfast', 'Ful Medames Breakfast Bowl', 'Stewed fava beans with olive oil, lemon, tomato and warm pita.', 450, 24, 60, 13),
        m('lunch', 'Falafel Bowl with Tahini', 'Crisp falafel over tabbouleh with pickled turnip and tahini drizzle.', 610, 26, 68, 27),
        m('snack', 'Hummus + Pita', 'Classic creamy hummus with olive oil and warm pita wedges.', 290, 13, 36, 11),
        m('dinner', 'Mujadara with Extra Lentils', 'Lentils and rice crowned with crispy onions, cucumber-tomato salad beside.', 600, 28, 88, 16),
      ],
      [
        m('breakfast', 'Balila + Pita', 'Warm chickpeas with cumin, lemon and olive oil, scooped with pita.', 440, 20, 62, 13),
        m('lunch', 'Koshari', 'Egyptian lentils, rice and pasta under spiced tomato sauce and crispy onions.', 630, 28, 100, 14),
        m('snack', 'Roasted Chickpeas + Dates', 'Crunchy spiced chickpeas with a couple of sweet dates.', 270, 14, 42, 5),
        m('dinner', 'Loubia + Bread', 'Moroccan white-bean stew in tomato and paprika with crusty bread.', 550, 28, 78, 14),
      ],
    ),
  },

  // ------------------------------------------------------------------ LATIN
  latin: {
    veg: days(
      [
        m('breakfast', 'Arepas with Cheese & Black Beans', 'Griddled corn arepas split and filled with cheese and seasoned black beans.', 470, 24, 56, 17),
        m('lunch', 'Black-Bean Burritos', 'Flour tortillas stuffed with black beans, rice, cheese and salsa roja.', 630, 28, 86, 20),
        m('snack', 'Elote-Style Corn Salad', 'Charred corn with lime, chilli and cotija — street-corn flavours in a cup.', 270, 11, 32, 11),
        m('dinner', 'Veggie Quesadillas + Guacamole', 'Toasted tortillas with melted cheese, peppers and beans, served with guac.', 570, 28, 54, 27),
      ],
      [
        m('breakfast', 'Chilaquiles Verdes (Eggless Swap)', 'Tortilla chips simmered in salsa verde with crema and extra queso fresco instead of egg.', 460, 20, 48, 21),
        m('lunch', 'Rajas con Crema Tacos + Pinto Beans', 'Roasted poblano strips in crema folded into tortillas with a side of pintos.', 590, 26, 68, 24),
        m('snack', 'Requesón Tostada with Honey', 'A crisp tostada spread with requesón cheese and a drizzle of honey.', 260, 16, 30, 9),
        m('dinner', 'Enfrijoladas + Cabbage Slaw', 'Tortillas bathed in silky black-bean sauce with queso fresco and lime slaw.', 570, 28, 66, 22),
      ],
    ),
    nonveg: days(
      [
        m('breakfast', 'Huevos Rancheros', 'Fried eggs on tortillas with warm ranchero salsa and refried beans.', 460, 22, 42, 23),
        m('lunch', 'Chicken Burrito Bowl', 'Rice, black beans, grilled chicken, salsa and guacamole in one bowl.', 640, 42, 70, 20),
        m('snack', 'Yogurt + Mango con Tajín', 'Thick yogurt with mango cubes dusted in chilli-lime seasoning.', 240, 16, 34, 5),
        m('dinner', 'Carne Asada Tacos + Frijoles', 'Grilled steak tacos with onion, cilantro and lime, plus a cup of beans.', 600, 38, 56, 24),
      ],
      [
        m('breakfast', 'Gallo Pinto with Eggs', 'Costa Rican rice and beans with fried eggs and a little salsa Lizano-style.', 460, 22, 54, 17),
        m('lunch', 'Pollo a la Plancha + Rice, Beans & Plantain', 'Griddled chicken breast with rice, beans and caramelised sweet plantain.', 590, 40, 66, 18),
        m('snack', 'Shrimp Ceviche Tostada', 'Citrus-cured shrimp with tomato, onion and cilantro on a crisp tostada.', 250, 18, 28, 7),
        m('dinner', 'Lighter Feijoada + Rice & Greens', 'Brazilian black-bean stew with lean pork, rice and garlicky sautéed greens.', 600, 36, 62, 22),
      ],
    ),
    vegan: days(
      [
        m('breakfast', 'Avena (Cinnamon Oats, Soy Milk)', 'Creamy cinnamon oatmeal made with soy milk and a spoon of peanut butter.', 440, 18, 56, 16),
        m('lunch', 'Sofritas Burrito Bowl', 'Rice and black beans with spicy tofu sofritas, salsa and guacamole.', 630, 34, 78, 20),
        m('snack', 'Bean Tostada with Avocado', 'A crisp tostada spread with refried beans, avocado and salsa — no cheese.', 280, 12, 30, 12),
        m('dinner', 'Lentil Tacos + Cabbage Slaw', 'Spiced lentil filling in warm tortillas with crunchy lime-cabbage slaw.', 550, 26, 70, 19),
      ],
      [
        m('breakfast', 'Tofu Scramble Breakfast Tacos', 'Soft tortillas with turmeric tofu scramble, salsa and avocado.', 430, 24, 42, 19),
        m('lunch', 'Quinoa & Black-Bean Bowl', 'Peruvian-style quinoa with black beans, corn, avocado and lime.', 610, 28, 80, 20),
        m('snack', 'Fruit con Tajín + Pepitas', 'Fresh fruit dusted with chilli-lime seasoning and toasted pumpkin seeds.', 280, 12, 30, 13),
        m('dinner', 'Veggie Fajita Bowl with Pinto Beans', 'Sizzled peppers and onions over rice with pinto beans and guacamole.', 600, 26, 82, 19),
      ],
    ),
  },

  // -------------------------------------------------------- INTERNATIONAL
  international: {
    veg: days(
      [
        m('breakfast', 'Greek Yogurt Parfait', 'Layers of thick yogurt, granola and mixed berries.', 420, 24, 52, 12),
        m('lunch', 'Vegetable Fried Rice with Tofu', 'Wok-fried rice with mixed vegetables and tofu in place of egg.', 590, 28, 76, 19),
        m('snack', 'Cheese, Crackers & Grapes', 'Wholegrain crackers with cheese and a small bunch of grapes.', 280, 12, 26, 14),
        m('dinner', 'Vegetable Lasagna + Salad', 'Baked lasagna layered with vegetables and ricotta, plus a green salad.', 570, 26, 62, 24),
      ],
      [
        m('breakfast', 'Cottage Cheese Toast with Tomato', 'Wholegrain toast piled with cottage cheese, tomato and black pepper.', 400, 24, 44, 14),
        m('lunch', 'Mild Chickpea Curry + Rice', 'Gently spiced chickpea-coconut curry over steamed rice with greens.', 580, 24, 82, 17),
        m('snack', 'Skyr with Fruit & Nuts', 'Icelandic-style thick yogurt with chopped fruit and toasted nuts.', 270, 18, 28, 10),
        m('dinner', 'Pesto Gnocchi with White Beans', 'Pan-tossed gnocchi in basil pesto with white beans and green beans.', 570, 24, 74, 20),
      ],
    ),
    nonveg: days(
      [
        m('breakfast', 'Eggs, Toast & Fruit', 'Two eggs any style with wholegrain toast and a piece of fruit.', 430, 24, 44, 17),
        m('lunch', 'Grilled Chicken Wrap + Salad', 'Grilled chicken, crunchy veg and yogurt dressing in a wholegrain wrap.', 570, 38, 56, 20),
        m('snack', 'Greek Yogurt + Berries', 'Thick yogurt with a handful of fresh berries.', 220, 18, 24, 5),
        m('dinner', 'Salmon, Potatoes & Greens', 'Pan-seared salmon with baby potatoes and buttered leafy greens.', 580, 36, 50, 26),
      ],
      [
        m('breakfast', 'Vegetable Omelette + Toast', 'Fluffy omelette with peppers, onion and spinach on wholegrain toast.', 420, 26, 36, 19),
        m('lunch', 'Chicken Fried Rice (Light Oil)', 'Takeaway favourite made lighter — chicken, rice, peas and scallions.', 590, 36, 72, 17),
        m('snack', 'Tuna + Crackers', 'Lemony tuna on wholegrain crackers with cucumber slices.', 250, 20, 24, 9),
        m('dinner', 'Lean Beef Chilli with Rice', 'Slow-simmered beef-and-bean chilli served over steamed rice.', 600, 38, 64, 20),
      ],
    ),
    vegan: days(
      [
        m('breakfast', 'Chia-Peanut Overnight Oats', 'Oats and chia soaked in soy milk with peanut butter and berries.', 440, 20, 58, 14),
        m('lunch', 'Chickpea-Quinoa Buddha Bowl', 'Quinoa, roasted vegetables and chickpeas with a lemon-tahini dressing.', 620, 28, 74, 24),
        m('snack', 'Soy Yogurt + Maple Granola', 'Plain soy yogurt with a crunchy spoonful of maple granola.', 270, 14, 34, 9),
        m('dinner', 'Vegan Chilli with Rice & Avocado', 'Three-bean chilli over rice, finished with avocado and lime.', 590, 28, 80, 18),
      ],
      [
        m('breakfast', 'PB-Banana Toast + Soy Latte', 'Wholegrain toast with peanut butter and banana, plus a hot soy latte.', 430, 18, 50, 17),
        m('lunch', 'Falafel Wrap with Hummus', 'Falafel, hummus, pickles and salad rolled in a soft flatbread.', 620, 24, 72, 26),
        m('snack', 'Edamame + Fruit', 'Steamed salted edamame with a piece of seasonal fruit.', 230, 16, 24, 8),
        m('dinner', 'Tempeh Stir-Fry + Brown Rice', 'Caramelised tempeh with mixed vegetables in ginger-soy over brown rice.', 600, 32, 68, 22),
      ],
    ),
  },
}
