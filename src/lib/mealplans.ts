// Template meal plans — two alternating day templates per diet preference.
// Indian-friendly + international mix, ~1800–2200 kcal/day with sensible macros.
// General information, not medical or dietary advice.

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

export const MEAL_PLANS: Record<'veg' | 'nonveg' | 'vegan', MealPlanDay[]> = {
  veg: [
    {
      label: 'Day A',
      meals: [
        {
          meal: 'breakfast',
          name: 'Masala Oats + Paneer Bhurji',
          desc: 'Savoury oats with peas and carrot, side of scrambled paneer with onion and turmeric.',
          calories: 430,
          protein_g: 22,
          carbs_g: 50,
          fat_g: 15,
        },
        {
          meal: 'lunch',
          name: 'Rajma Chawal Bowl',
          desc: 'Kidney-bean curry over brown rice with cucumber raita and a squeeze of lime.',
          calories: 580,
          protein_g: 24,
          carbs_g: 84,
          fat_g: 16,
        },
        {
          meal: 'snack',
          name: 'Greek Yogurt + Roasted Chana',
          desc: 'Thick yogurt topped with crunchy roasted chickpeas and seasonal fruit.',
          calories: 290,
          protein_g: 20,
          carbs_g: 36,
          fat_g: 8,
        },
        {
          meal: 'dinner',
          name: 'Palak Paneer + 2 Rotis',
          desc: 'Spinach-paneer curry with whole-wheat rotis and a simple kachumber salad.',
          calories: 560,
          protein_g: 28,
          carbs_g: 46,
          fat_g: 28,
        },
      ],
    },
    {
      label: 'Day B',
      meals: [
        {
          meal: 'breakfast',
          name: 'Moong Dal Chilla',
          desc: 'Two lentil crepes stuffed with onion and coriander, served with mint chutney.',
          calories: 390,
          protein_g: 21,
          carbs_g: 46,
          fat_g: 13,
        },
        {
          meal: 'lunch',
          name: 'Paneer Tikka Wrap',
          desc: 'Whole-wheat wrap with charred paneer tikka, peppers and a yogurt-mint drizzle.',
          calories: 560,
          protein_g: 30,
          carbs_g: 58,
          fat_g: 22,
        },
        {
          meal: 'snack',
          name: 'Banana Whey Smoothie',
          desc: 'Milk, banana and a scoop of whey blended with a pinch of cinnamon.',
          calories: 300,
          protein_g: 28,
          carbs_g: 32,
          fat_g: 7,
        },
        {
          meal: 'dinner',
          name: 'Dal Tadka + Jeera Rice',
          desc: 'Tempered yellow dal with cumin rice, steamed greens and a side salad.',
          calories: 590,
          protein_g: 24,
          carbs_g: 88,
          fat_g: 15,
        },
      ],
    },
  ],
  nonveg: [
    {
      label: 'Day A',
      meals: [
        {
          meal: 'breakfast',
          name: 'Masala Egg Scramble + Toast',
          desc: 'Three-egg bhurji with tomato and chilli on two slices of whole-grain toast.',
          calories: 430,
          protein_g: 26,
          carbs_g: 34,
          fat_g: 21,
        },
        {
          meal: 'lunch',
          name: 'Home-style Chicken Curry + Rice',
          desc: 'Light chicken curry with steamed rice and a crunchy onion-cucumber salad.',
          calories: 620,
          protein_g: 42,
          carbs_g: 66,
          fat_g: 20,
        },
        {
          meal: 'snack',
          name: 'Yogurt Fruit Parfait',
          desc: 'Greek yogurt layered with berries or mango and a spoon of granola.',
          calories: 260,
          protein_g: 18,
          carbs_g: 30,
          fat_g: 7,
        },
        {
          meal: 'dinner',
          name: 'Tandoori Chicken + Roti',
          desc: 'Grilled tandoori chicken with whole-wheat roti and garlicky sautéed greens.',
          calories: 560,
          protein_g: 45,
          carbs_g: 42,
          fat_g: 22,
        },
      ],
    },
    {
      label: 'Day B',
      meals: [
        {
          meal: 'breakfast',
          name: 'Egg Bhurji Wrap',
          desc: 'Whole-wheat wrap filled with spiced egg scramble, onion and coriander.',
          calories: 420,
          protein_g: 24,
          carbs_g: 40,
          fat_g: 18,
        },
        {
          meal: 'lunch',
          name: 'Grilled Fish + Lemon Rice',
          desc: 'Pan-grilled fish fillet with tangy lemon rice and kachumber salad.',
          calories: 580,
          protein_g: 38,
          carbs_g: 62,
          fat_g: 18,
        },
        {
          meal: 'snack',
          name: 'Banana Whey Smoothie',
          desc: 'Milk, banana and a scoop of whey — quick fuel between quests.',
          calories: 300,
          protein_g: 28,
          carbs_g: 34,
          fat_g: 5,
        },
        {
          meal: 'dinner',
          name: 'Chicken Keema + 2 Rotis',
          desc: 'Minced chicken with peas and warm spices, whole-wheat rotis and salad.',
          calories: 580,
          protein_g: 40,
          carbs_g: 48,
          fat_g: 24,
        },
      ],
    },
  ],
  vegan: [
    {
      label: 'Day A',
      meals: [
        {
          meal: 'breakfast',
          name: 'Tofu Bhurji + Multigrain Toast',
          desc: 'Turmeric-spiced tofu scramble with onion and tomato on toasted multigrain bread.',
          calories: 400,
          protein_g: 24,
          carbs_g: 38,
          fat_g: 17,
        },
        {
          meal: 'lunch',
          name: 'Chole + Brown Rice',
          desc: 'Chickpea curry simmered with tomato and spices over brown rice, side salad.',
          calories: 600,
          protein_g: 22,
          carbs_g: 92,
          fat_g: 15,
        },
        {
          meal: 'snack',
          name: 'Roasted Chana + Almonds',
          desc: 'A crunchy handful of roasted chickpeas and almonds with a piece of fruit.',
          calories: 290,
          protein_g: 13,
          carbs_g: 28,
          fat_g: 14,
        },
        {
          meal: 'dinner',
          name: 'Teriyaki Tofu Quinoa Bowl',
          desc: 'Seared tofu and stir-fried vegetables over quinoa with sesame and scallion.',
          calories: 560,
          protein_g: 28,
          carbs_g: 64,
          fat_g: 20,
        },
      ],
    },
    {
      label: 'Day B',
      meals: [
        {
          meal: 'breakfast',
          name: 'Peanut Butter Chia Oats',
          desc: 'Overnight oats with peanut butter, chia seeds and sliced banana.',
          calories: 450,
          protein_g: 16,
          carbs_g: 58,
          fat_g: 17,
        },
        {
          meal: 'lunch',
          name: 'Masoor Dal + Bajra Roti',
          desc: 'Red-lentil dal with millet rotis, lemon-dressed salad and steamed greens.',
          calories: 560,
          protein_g: 24,
          carbs_g: 82,
          fat_g: 14,
        },
        {
          meal: 'snack',
          name: 'Soy Milk Date Shake',
          desc: 'Soy milk blended with dates, cocoa and a pinch of cardamom.',
          calories: 280,
          protein_g: 14,
          carbs_g: 40,
          fat_g: 8,
        },
        {
          meal: 'dinner',
          name: 'Rajma Burrito Bowl',
          desc: 'Kidney beans, rice, corn salsa and guacamole — a Mexican spin on rajma.',
          calories: 620,
          protein_g: 22,
          carbs_g: 88,
          fat_g: 20,
        },
      ],
    },
  ],
}
