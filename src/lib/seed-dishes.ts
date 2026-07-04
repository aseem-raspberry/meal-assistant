/**
 * Seed Data — Common Indian Dishes
 *
 * 120 dishes across 6 cuisine regions with ingredients, prep time,
 * meal components, dietary tags, and effort levels.
 *
 * D-029: Recipes are implementation details supporting dishes.
 * Dishes support meals. Meals support decisions.
 */

export interface SeedDish {
  name: string;
  cuisine: string;
  category: string;
  prep_time_minutes: number;
  ingredients: string[];
  ingredient_categories: string[];
  dietary_tags: string[];
  effort_level: 1 | 2 | 3;
}

export const SEED_DISHES: SeedDish[] = [
  // ═══ North Indian (20) ═══
  {
    name: 'Dal Tadka', cuisine: 'North Indian', category: 'dal', prep_time_minutes: 30,
    ingredients: ['Toor Dal', 'Onion', 'Tomato', 'Garlic', 'Cumin', 'Turmeric', 'Ghee'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'high_protein'], effort_level: 1,
  },
  {
    name: 'Dal Makhani', cuisine: 'North Indian', category: 'dal', prep_time_minutes: 60,
    ingredients: ['Urad Dal', 'Rajma', 'Tomato', 'Onion', 'Ginger', 'Garlic', 'Cream', 'Butter'],
    ingredient_categories: ['legumes', 'root_vegetables', 'dairy', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 3,
  },
  {
    name: 'Paneer Butter Masala', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Paneer', 'Tomato', 'Onion', 'Cream', 'Ginger', 'Garlic', 'Garam Masala'],
    ingredient_categories: ['dairy', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Palak Paneer', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Spinach', 'Paneer', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Cream'],
    ingredient_categories: ['leafy_greens', 'dairy', 'root_vegetables'],
    dietary_tags: ['vegetarian', 'healthy_meal'], effort_level: 2,
  },
  {
    name: 'Aloo Gobi', cuisine: 'North Indian', category: 'dry_vegetable', prep_time_minutes: 30,
    ingredients: ['Potato', 'Cauliflower', 'Onion', 'Tomato', 'Turmeric', 'Cumin'],
    ingredient_categories: ['root_vegetables', 'cruciferous', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Aloo Matar', cuisine: 'North Indian', category: 'dry_vegetable', prep_time_minutes: 25,
    ingredients: ['Potato', 'Peas', 'Onion', 'Tomato', 'Cumin', 'Turmeric'],
    ingredient_categories: ['root_vegetables', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Chole', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 45,
    ingredients: ['Chana', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Tea Leaves', 'Garam Masala'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Rajma', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 50,
    ingredients: ['Rajma', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Cumin', 'Garam Masala'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Kadai Paneer', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 30,
    ingredients: ['Paneer', 'Capsicum', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Coriander'],
    ingredient_categories: ['dairy', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Matar Paneer', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Paneer', 'Peas', 'Onion', 'Tomato', 'Ginger', 'Cream', 'Garam Masala'],
    ingredient_categories: ['dairy', 'legumes', 'root_vegetables'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Jeera Rice', cuisine: 'North Indian', category: 'rice', prep_time_minutes: 20,
    ingredients: ['Rice', 'Cumin', 'Ghee'],
    ingredient_categories: ['grains', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Vegetable Pulao', cuisine: 'North Indian', category: 'rice', prep_time_minutes: 30,
    ingredients: ['Rice', 'Carrot', 'Peas', 'Onion', 'Cumin', 'Bay Leaf', 'Ghee'],
    ingredient_categories: ['grains', 'root_vegetables', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Khichdi', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 25,
    ingredients: ['Rice', 'Moong Dal', 'Turmeric', 'Cumin', 'Ghee', 'Ginger'],
    ingredient_categories: ['grains', 'legumes', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan', 'comfort_food', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Cucumber Raita', cuisine: 'North Indian', category: 'raita', prep_time_minutes: 10,
    ingredients: ['Curd', 'Cucumber', 'Cumin', 'Mint'],
    ingredient_categories: ['dairy', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 1,
  },
  {
    name: 'Boondi Raita', cuisine: 'North Indian', category: 'raita', prep_time_minutes: 10,
    ingredients: ['Curd', 'Boondi', 'Cumin', 'Chaat Masala'],
    ingredient_categories: ['dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 1,
  },
  {
    name: 'Gobi Paratha', cuisine: 'North Indian', category: 'bread', prep_time_minutes: 40,
    ingredients: ['Wheat Flour', 'Cauliflower', 'Onion', 'Ginger', 'Cumin', 'Ghee'],
    ingredient_categories: ['grains', 'cruciferous', 'root_vegetables', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Aloo Paratha', cuisine: 'North Indian', category: 'bread', prep_time_minutes: 40,
    ingredients: ['Wheat Flour', 'Potato', 'Onion', 'Ginger', 'Cumin', 'Ghee'],
    ingredient_categories: ['grains', 'root_vegetables', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Mix Veg Curry', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Potato', 'Carrot', 'Peas', 'Cauliflower', 'Tomato', 'Onion', 'Ginger', 'Garam Masala'],
    ingredient_categories: ['root_vegetables', 'legumes', 'cruciferous', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 2,
  },
  {
    name: 'Shahi Paneer', cuisine: 'North Indian', category: 'main_curry', prep_time_minutes: 40,
    ingredients: ['Paneer', 'Tomato', 'Cream', 'Cashew', 'Ginger', 'Cardamom', 'Saffron'],
    ingredient_categories: ['dairy', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'weekend_special'], effort_level: 3,
  },
  {
    name: 'Bhindi Masala', cuisine: 'North Indian', category: 'dry_vegetable', prep_time_minutes: 25,
    ingredients: ['Bhindi', 'Onion', 'Tomato', 'Ginger', 'Coriander', 'Amchur'],
    ingredient_categories: ['gourds', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },

  // ═══ South Indian (20) ═══
  {
    name: 'Sambar', cuisine: 'South Indian', category: 'dal', prep_time_minutes: 35,
    ingredients: ['Toor Dal', 'Tamarind', 'Drumstick', 'Carrot', 'Tomato', 'Curry Leaves', 'Mustard Seeds'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Rasam', cuisine: 'South Indian', category: 'dal', prep_time_minutes: 20,
    ingredients: ['Toor Dal', 'Tamarind', 'Tomato', 'Garlic', 'Cumin', 'Pepper', 'Curry Leaves'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Lemon Rice', cuisine: 'South Indian', category: 'rice', prep_time_minutes: 20,
    ingredients: ['Rice', 'Lemon', 'Peanut', 'Curry Leaves', 'Mustard Seeds', 'Turmeric'],
    ingredient_categories: ['grains', 'fruits', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Curd Rice', cuisine: 'South Indian', category: 'rice', prep_time_minutes: 15,
    ingredients: ['Rice', 'Curd', 'Curry Leaves', 'Mustard Seeds', 'Ginger'],
    ingredient_categories: ['grains', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'comfort_food', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Coconut Rice', cuisine: 'South Indian', category: 'rice', prep_time_minutes: 20,
    ingredients: ['Rice', 'Coconut', 'Curry Leaves', 'Mustard Seeds', 'Cashew'],
    ingredient_categories: ['grains', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Tamarind Rice', cuisine: 'South Indian', category: 'rice', prep_time_minutes: 20,
    ingredients: ['Rice', 'Tamarind', 'Peanut', 'Curry Leaves', 'Mustard Seeds', 'Turmeric'],
    ingredient_categories: ['grains', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Poriyal', cuisine: 'South Indian', category: 'dry_vegetable', prep_time_minutes: 20,
    ingredients: ['Carrot', 'Beans', 'Coconut', 'Mustard Seeds', 'Curry Leaves', 'Turmeric'],
    ingredient_categories: ['root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'healthy_meal'], effort_level: 1,
  },
  {
    name: 'Avial', cuisine: 'South Indian', category: 'dry_vegetable', prep_time_minutes: 30,
    ingredients: ['Carrot', 'Beans', 'Drumstick', 'Coconut', 'Curd', 'Curry Leaves'],
    ingredient_categories: ['root_vegetables', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'healthy_meal'], effort_level: 2,
  },
  {
    name: 'Kootu', cuisine: 'South Indian', category: 'dal', prep_time_minutes: 30,
    ingredients: ['Moong Dal', 'Carrot', 'Beans', 'Coconut', 'Cumin', 'Curry Leaves'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 2,
  },
  {
    name: 'Vendakkai Poriyal', cuisine: 'South Indian', category: 'dry_vegetable', prep_time_minutes: 20,
    ingredients: ['Bhindi', 'Coconut', 'Mustard Seeds', 'Curry Leaves', 'Turmeric'],
    ingredient_categories: ['gourds', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Tomato Rasam', cuisine: 'South Indian', category: 'dal', prep_time_minutes: 20,
    ingredients: ['Tomato', 'Tamarind', 'Toor Dal', 'Garlic', 'Cumin', 'Pepper', 'Coriander'],
    ingredient_categories: ['root_vegetables', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Moru Kachiyathu', cuisine: 'South Indian', category: 'dal', prep_time_minutes: 20,
    ingredients: ['Curd', 'Coconut', 'Cumin', 'Mustard Seeds', 'Curry Leaves', 'Turmeric'],
    ingredient_categories: ['dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Cabbage Poriyal', cuisine: 'South Indian', category: 'dry_vegetable', prep_time_minutes: 20,
    ingredients: ['Cabbage', 'Coconut', 'Mustard Seeds', 'Curry Leaves', 'Turmeric'],
    ingredient_categories: ['cruciferous', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'healthy_meal'], effort_level: 1,
  },
  {
    name: 'Beetroot Poriyal', cuisine: 'South Indian', category: 'dry_vegetable', prep_time_minutes: 20,
    ingredients: ['Beetroot', 'Coconut', 'Mustard Seeds', 'Curry Leaves', 'Turmeric'],
    ingredient_categories: ['root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'healthy_meal'], effort_level: 1,
  },
  {
    name: 'Steamed Rice', cuisine: 'South Indian', category: 'rice', prep_time_minutes: 20,
    ingredients: ['Rice'],
    ingredient_categories: ['grains'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Coconut Chutney', cuisine: 'South Indian', category: 'side_dish', prep_time_minutes: 10,
    ingredients: ['Coconut', 'Curry Leaves', 'Mustard Seeds', 'Chana Dal', 'Ginger'],
    ingredient_categories: ['spices_and_aromatics', 'legumes'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Tomato Chutney', cuisine: 'South Indian', category: 'side_dish', prep_time_minutes: 15,
    ingredients: ['Tomato', 'Onion', 'Garlic', 'Mustard Seeds', 'Curry Leaves'],
    ingredient_categories: ['root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Uppuma', cuisine: 'South Indian', category: 'main_curry', prep_time_minutes: 20,
    ingredients: ['Rava', 'Onion', 'Mustard Seeds', 'Curry Leaves', 'Ginger', 'Ghee'],
    ingredient_categories: ['grains', 'root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Bisi Bele Bath', cuisine: 'South Indian', category: 'rice', prep_time_minutes: 40,
    ingredients: ['Rice', 'Toor Dal', 'Tamarind', 'Carrot', 'Peas', 'Beans', 'Ghee', 'Cashew'],
    ingredient_categories: ['grains', 'legumes', 'root_vegetables', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Papad', cuisine: 'South Indian', category: 'papad', prep_time_minutes: 5,
    ingredients: ['Urad Dal', 'Salt', 'Oil'],
    ingredient_categories: ['legumes', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },

  // ═══ Gujarati (20) ═══
  {
    name: 'Gujarati Kadhi', cuisine: 'Gujarati', category: 'dal', prep_time_minutes: 25,
    ingredients: ['Curd', 'Besan', 'Curry Leaves', 'Mustard Seeds', 'Ginger', 'Green Chilli'],
    ingredient_categories: ['dairy', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'comfort_food', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Undhiyu', cuisine: 'Gujarati', category: 'main_curry', prep_time_minutes: 60,
    ingredients: ['Bottle Gourd', 'Brinjal', 'Beans', 'Peas', 'Coconut', 'Coriander', 'Ginger'],
    ingredient_categories: ['gourds', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'weekend_special', 'seasonal'], effort_level: 3,
  },
  {
    name: 'Sev Tameta', cuisine: 'Gujarati', category: 'main_curry', prep_time_minutes: 25,
    ingredients: ['Tomato', 'Sev', 'Onion', 'Garlic', 'Turmeric', 'Coriander'],
    ingredient_categories: ['root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Ringan Olo', cuisine: 'Gujarati', category: 'dry_vegetable', prep_time_minutes: 25,
    ingredients: ['Brinjal', 'Garlic', 'Green Chilli', 'Coriander', 'Peanut', 'Mustard Oil'],
    ingredient_categories: ['gourds', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Bhinda Kadhi', cuisine: 'Gujarati', category: 'dal', prep_time_minutes: 30,
    ingredients: ['Bhindi', 'Curd', 'Besan', 'Curry Leaves', 'Mustard Seeds', 'Ginger'],
    ingredient_categories: ['gourds', 'dairy', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Khandvi', cuisine: 'Gujarati', category: 'side_dish', prep_time_minutes: 30,
    ingredients: ['Besan', 'Curd', 'Ginger', 'Mustard Seeds', 'Curry Leaves', 'Sesame'],
    ingredient_categories: ['legumes', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'weekend_special'], effort_level: 2,
  },
  {
    name: 'Dhokla', cuisine: 'Gujarati', category: 'side_dish', prep_time_minutes: 35,
    ingredients: ['Besan', 'Curd', 'Green Chilli', 'Ginger', 'Mustard Seeds', 'Curry Leaves', 'Lemon'],
    ingredient_categories: ['legumes', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Handvo', cuisine: 'Gujarati', category: 'side_dish', prep_time_minutes: 45,
    ingredients: ['Rice', 'Toor Dal', 'Curd', 'Bottle Gourd', 'Sesame', 'Mustard Seeds'],
    ingredient_categories: ['grains', 'legumes', 'dairy', 'gourds', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Gujarati Dal', cuisine: 'Gujarati', category: 'dal', prep_time_minutes: 30,
    ingredients: ['Toor Dal', 'Tomato', 'Jaggery', 'Tamarind', 'Curry Leaves', 'Mustard Seeds'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'comfort_food'], effort_level: 1,
  },
  {
    name: 'Fafda Jalebi', cuisine: 'Gujarati', category: 'side_dish', prep_time_minutes: 40,
    ingredients: ['Besan', 'Cumin', 'Turmeric', 'Sugar', 'Ghee'],
    ingredient_categories: ['legumes', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'weekend_special'], effort_level: 3,
  },
  {
    name: 'Patra', cuisine: 'Gujarati', category: 'side_dish', prep_time_minutes: 40,
    ingredients: ['Arbi', 'Besan', 'Tamarind', 'Mustard Seeds', 'Curry Leaves', 'Sesame'],
    ingredient_categories: ['root_vegetables', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 2,
  },
  {
    name: 'Gota', cuisine: 'Gujarati', category: 'side_dish', prep_time_minutes: 30,
    ingredients: ['Besan', 'Onion', 'Green Chilli', 'Ginger', 'Coriander'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Tindora Nu Shaak', cuisine: 'Gujarati', category: 'dry_vegetable', prep_time_minutes: 25,
    ingredients: ['Tindora', 'Onion', 'Tomato', 'Turmeric', 'Coriander', 'Mustard Seeds'],
    ingredient_categories: ['gourds', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Sukhdi', cuisine: 'Gujarati', category: 'dessert', prep_time_minutes: 20,
    ingredients: ['Wheat Flour', 'Ghee', 'Jaggery'],
    ingredient_categories: ['grains', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 1,
  },
  {
    name: 'Mohanthal', cuisine: 'Gujarati', category: 'dessert', prep_time_minutes: 35,
    ingredients: ['Besan', 'Ghee', 'Sugar', 'Cardamom', 'Almond'],
    ingredient_categories: ['legumes', 'oils_and_fats', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'weekend_special'], effort_level: 2,
  },
  {
    name: 'Kadhi Pakora', cuisine: 'Gujarati', category: 'dal', prep_time_minutes: 35,
    ingredients: ['Curd', 'Besan', 'Onion', 'Mustard Seeds', 'Curry Leaves', 'Ginger'],
    ingredient_categories: ['dairy', 'legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Ghatia', cuisine: 'Gujarati', category: 'side_dish', prep_time_minutes: 30,
    ingredients: ['Besan', 'Turmeric', 'Chilli Powder', 'Oil'],
    ingredient_categories: ['legumes', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 2,
  },
  {
    name: 'Bharela Bhinda', cuisine: 'Gujarati', category: 'dry_vegetable', prep_time_minutes: 30,
    ingredients: ['Bhindi', 'Besan', 'Turmeric', 'Coriander', 'Mustard Seeds', 'Ginger'],
    ingredient_categories: ['gourds', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Tindora', cuisine: 'Gujarati', category: 'dry_vegetable', prep_time_minutes: 25,
    ingredients: ['Tindora', 'Onion', 'Mustard Seeds', 'Curry Leaves', 'Turmeric'],
    ingredient_categories: ['gourds', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Chaas', cuisine: 'Gujarati', category: 'drink', prep_time_minutes: 5,
    ingredients: ['Curd', 'Cumin', 'Mint', 'Ginger', 'Salt'],
    ingredient_categories: ['dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'low_effort'], effort_level: 1,
  },

  // ═══ Maharashtrian (20) ═══
  {
    name: 'Varan', cuisine: 'Maharashtrian', category: 'dal', prep_time_minutes: 25,
    ingredients: ['Toor Dal', 'Turmeric', 'Ghee', 'Cumin', 'Mustard Seeds'],
    ingredient_categories: ['legumes', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan', 'comfort_food', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Amti', cuisine: 'Maharashtrian', category: 'dal', prep_time_minutes: 30,
    ingredients: ['Toor Dal', 'Tamarind', 'Jaggery', 'Mustard Seeds', 'Curry Leaves', 'Goda Masala'],
    ingredient_categories: ['legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Pithla', cuisine: 'Maharashtrian', category: 'main_curry', prep_time_minutes: 20,
    ingredients: ['Besan', 'Onion', 'Garlic', 'Green Chilli', 'Mustard Seeds', 'Coriander'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort', 'budget_meal'], effort_level: 1,
  },
  {
    name: 'Bharli Vangi', cuisine: 'Maharashtrian', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Brinjal', 'Coconut', 'Peanut', 'Sesame', 'Goda Masala', 'Tamarind'],
    ingredient_categories: ['gourds', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 2,
  },
  {
    name: 'Aloo Bhaji', cuisine: 'Maharashtrian', category: 'dry_vegetable', prep_time_minutes: 25,
    ingredients: ['Potato', 'Onion', 'Mustard Seeds', 'Curry Leaves', 'Turmeric', 'Ginger'],
    ingredient_categories: ['root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Kanda Poha', cuisine: 'Maharashtrian', category: 'main_curry', prep_time_minutes: 20,
    ingredients: ['Poha', 'Onion', 'Potato', 'Mustard Seeds', 'Curry Leaves', 'Turmeric', 'Lemon'],
    ingredient_categories: ['grains', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Batata Vada', cuisine: 'Maharashtrian', category: 'side_dish', prep_time_minutes: 35,
    ingredients: ['Potato', 'Besan', 'Mustard Seeds', 'Curry Leaves', 'Green Chilli', 'Ginger'],
    ingredient_categories: ['root_vegetables', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Sabudana Khichdi', cuisine: 'Maharashtrian', category: 'main_curry', prep_time_minutes: 25,
    ingredients: ['Sabudana', 'Potato', 'Peanut', 'Cumin', 'Curry Leaves', 'Ghee'],
    ingredient_categories: ['grains', 'root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 1,
  },
  {
    name: 'Vada Pav', cuisine: 'Maharashtrian', category: 'bread', prep_time_minutes: 40,
    ingredients: ['Potato', 'Besan', 'Pav', 'Garlic', 'Green Chilli', 'Coriander'],
    ingredient_categories: ['root_vegetables', 'legumes', 'grains', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Modak', cuisine: 'Maharashtrian', category: 'dessert', prep_time_minutes: 50,
    ingredients: ['Rice Flour', 'Coconut', 'Jaggery', 'Cardamom', 'Ghee'],
    ingredient_categories: ['grains', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'festival_meal', 'weekend_special'], effort_level: 3,
  },
  {
    name: 'Puran Poli', cuisine: 'Maharashtrian', category: 'dessert', prep_time_minutes: 60,
    ingredients: ['Wheat Flour', 'Chana', 'Jaggery', 'Ghee', 'Cardamom'],
    ingredient_categories: ['grains', 'legumes', 'oils_and_fats', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'festival_meal'], effort_level: 3,
  },
  {
    name: 'Sol Kadhi', cuisine: 'Maharashtrian', category: 'drink', prep_time_minutes: 10,
    ingredients: ['Coconut', 'Kokum', 'Garlic', 'Green Chilli', 'Coriander'],
    ingredient_categories: ['spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Thecha', cuisine: 'Maharashtrian', category: 'side_dish', prep_time_minutes: 15,
    ingredients: ['Green Chilli', 'Garlic', 'Peanut', 'Salt', 'Oil'],
    ingredient_categories: ['spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Koshimbir', cuisine: 'Maharashtrian', category: 'salad', prep_time_minutes: 15,
    ingredients: ['Carrot', 'Curd', 'Peanut', 'Cumin', 'Coriander', 'Lemon'],
    ingredient_categories: ['root_vegetables', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'healthy_meal', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Bhakri', cuisine: 'Maharashtrian', category: 'bread', prep_time_minutes: 20,
    ingredients: ['Jowar Flour', 'Water', 'Salt'],
    ingredient_categories: ['grains'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Masale Bhat', cuisine: 'Maharashtrian', category: 'rice', prep_time_minutes: 35,
    ingredients: ['Rice', 'Peas', 'Carrot', 'Goda Masala', 'Ghee', 'Cashew'],
    ingredient_categories: ['grains', 'legumes', 'root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Danyachi Usal', cuisine: 'Maharashtrian', category: 'main_curry', prep_time_minutes: 25,
    ingredients: ['Peanut', 'Coconut', 'Mustard Seeds', 'Curry Leaves', 'Goda Masala'],
    ingredient_categories: ['spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'budget_meal'], effort_level: 1,
  },
  {
    name: 'Matki Usal', cuisine: 'Maharashtrian', category: 'main_curry', prep_time_minutes: 30,
    ingredients: ['Matki', 'Onion', 'Tomato', 'Goda Masala', 'Mustard Seeds', 'Curry Leaves'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Rassa', cuisine: 'Maharashtrian', category: 'main_curry', prep_time_minutes: 45,
    ingredients: ['Chicken', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Goda Masala', 'Kanda Lasun Masala'],
    ingredient_categories: ['proteins', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['non-vegetarian'], effort_level: 2,
  },
  {
    name: 'Aamti Bhat', cuisine: 'Maharashtrian', category: 'rice', prep_time_minutes: 30,
    ingredients: ['Rice', 'Toor Dal', 'Tamarind', 'Jaggery', 'Mustard Seeds', 'Curry Leaves'],
    ingredient_categories: ['grains', 'legumes', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'comfort_food'], effort_level: 1,
  },

  // ═══ Punjabi (20) ═══
  {
    name: 'Sarson Ka Saag', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 50,
    ingredients: ['Mustard Leaves', 'Spinach', 'Ginger', 'Garlic', 'Ghee', 'Cornmeal'],
    ingredient_categories: ['leafy_greens', 'spices_and_aromatics', 'oils_and_fats', 'grains'],
    dietary_tags: ['vegetarian', 'seasonal'], effort_level: 3,
  },
  {
    name: 'Makki Di Roti', cuisine: 'Punjabi', category: 'bread', prep_time_minutes: 25,
    ingredients: ['Cornmeal', 'Ghee', 'Salt'],
    ingredient_categories: ['grains', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Chana Masala', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Chana', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Garam Masala', 'Tea Leaves'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Pindi Chana', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 40,
    ingredients: ['Chana', 'Tomato', 'Ginger', 'Garlic', 'Pomegranate Seeds', 'Garam Masala'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Paneer Tikka', cuisine: 'Punjabi', category: 'starter', prep_time_minutes: 35,
    ingredients: ['Paneer', 'Curd', 'Ginger', 'Garlic', 'Garam Masala', 'Capsicum', 'Onion'],
    ingredient_categories: ['dairy', 'spices_and_aromatics', 'root_vegetables'],
    dietary_tags: ['vegetarian', 'weekend_special'], effort_level: 2,
  },
  {
    name: 'Amritsari Chole', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 45,
    ingredients: ['Chana', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Tea Leaves', 'Garam Masala'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Dal Fry', cuisine: 'Punjabi', category: 'dal', prep_time_minutes: 25,
    ingredients: ['Toor Dal', 'Onion', 'Tomato', 'Garlic', 'Cumin', 'Ghee'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'comfort_food', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Baingan Bharta', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 40,
    ingredients: ['Brinjal', 'Onion', 'Tomato', 'Garlic', 'Ginger', 'Garam Masala'],
    ingredient_categories: ['gourds', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 2,
  },
  {
    name: 'Stuffed Paratha', cuisine: 'Punjabi', category: 'bread', prep_time_minutes: 40,
    ingredients: ['Wheat Flour', 'Ghee', 'Paneer', 'Onion', 'Coriander'],
    ingredient_categories: ['grains', 'oils_and_fats', 'dairy', 'root_vegetables'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Tandoori Chicken', cuisine: 'Punjabi', category: 'starter', prep_time_minutes: 45,
    ingredients: ['Chicken', 'Curd', 'Ginger', 'Garlic', 'Garam Masala', 'Kashmiri Chilli'],
    ingredient_categories: ['proteins', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['non-vegetarian', 'weekend_special', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Butter Chicken', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 50,
    ingredients: ['Chicken', 'Tomato', 'Cream', 'Butter', 'Ginger', 'Garlic', 'Garam Masala'],
    ingredient_categories: ['proteins', 'root_vegetables', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['non-vegetarian', 'weekend_special'], effort_level: 3,
  },
  {
    name: 'Kadhi Pakora', cuisine: 'Punjabi', category: 'dal', prep_time_minutes: 40,
    ingredients: ['Curd', 'Besan', 'Onion', 'Mustard Seeds', 'Curry Leaves', 'Ginger'],
    ingredient_categories: ['dairy', 'legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Mutton Curry', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 60,
    ingredients: ['Mutton', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Garam Masala', 'Mustard Oil'],
    ingredient_categories: ['proteins', 'root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['non-vegetarian', 'high_protein', 'weekend_special'], effort_level: 3,
  },
  {
    name: 'Aloo Tikki', cuisine: 'Punjabi', category: 'side_dish', prep_time_minutes: 30,
    ingredients: ['Potato', 'Peas', 'Onion', 'Coriander', 'Garam Masala', 'Oil'],
    ingredient_categories: ['root_vegetables', 'legumes', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Rajma Masala', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 50,
    ingredients: ['Rajma', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Garam Masala', 'Cumin'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Pakora', cuisine: 'Punjabi', category: 'side_dish', prep_time_minutes: 25,
    ingredients: ['Besan', 'Onion', 'Potato', 'Spinach', 'Green Chilli', 'Ginger'],
    ingredient_categories: ['legumes', 'root_vegetables', 'leafy_greens', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 1,
  },
  {
    name: 'Lassi', cuisine: 'Punjabi', category: 'drink', prep_time_minutes: 5,
    ingredients: ['Curd', 'Sugar', 'Cardamom'],
    ingredient_categories: ['dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Gajar Halwa', cuisine: 'Punjabi', category: 'dessert', prep_time_minutes: 45,
    ingredients: ['Carrot', 'Milk', 'Ghee', 'Sugar', 'Cardamom', 'Cashew'],
    ingredient_categories: ['root_vegetables', 'dairy', 'oils_and_fats', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'seasonal', 'festival_meal'], effort_level: 2,
  },
  {
    name: 'Methi Malai Matar', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Methi', 'Peas', 'Cream', 'Ginger', 'Garam Masala', 'Cashew'],
    ingredient_categories: ['leafy_greens', 'legumes', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'seasonal'], effort_level: 2,
  },
  {
    name: 'Chicken Curry', cuisine: 'Punjabi', category: 'main_curry', prep_time_minutes: 45,
    ingredients: ['Chicken', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Garam Masala'],
    ingredient_categories: ['proteins', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['non-vegetarian', 'high_protein'], effort_level: 2,
  },

  // ═══ Bengali (20) ═══
  {
    name: 'Shorshe Ilish', cuisine: 'Bengali', category: 'main_curry', prep_time_minutes: 40,
    ingredients: ['Hilsa', 'Mustard', 'Mustard Oil', 'Green Chilli', 'Turmeric'],
    ingredient_categories: ['proteins', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['non-vegetarian', 'high_protein', 'seasonal'], effort_level: 2,
  },
  {
    name: 'Cholar Dal', cuisine: 'Bengali', category: 'dal', prep_time_minutes: 30,
    ingredients: ['Chana Dal', 'Coconut', 'Ginger', 'Cumin', 'Ghee', 'Bay Leaf'],
    ingredient_categories: ['legumes', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'comfort_food'], effort_level: 1,
  },
  {
    name: 'Begun Bhaja', cuisine: 'Bengali', category: 'side_dish', prep_time_minutes: 20,
    ingredients: ['Brinjal', 'Turmeric', 'Mustard Oil', 'Salt'],
    ingredient_categories: ['gourds', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Aloo Posto', cuisine: 'Bengali', category: 'dry_vegetable', prep_time_minutes: 25,
    ingredients: ['Potato', 'Poppy Seeds', 'Green Chilli', 'Mustard Oil'],
    ingredient_categories: ['root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Shukto', cuisine: 'Bengali', category: 'dry_vegetable', prep_time_minutes: 35,
    ingredients: ['Bitter Gourd', 'Potato', 'Brinjal', 'Raw Banana', 'Milk', 'Mustard Seeds'],
    ingredient_categories: ['gourds', 'root_vegetables', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'healthy_meal'], effort_level: 2,
  },
  {
    name: 'Fish Curry', cuisine: 'Bengali', category: 'main_curry', prep_time_minutes: 40,
    ingredients: ['Rohu', 'Onion', 'Tomato', 'Ginger', 'Garlic', 'Turmeric', 'Mustard Oil'],
    ingredient_categories: ['proteins', 'root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['non-vegetarian', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Macher Jhol', cuisine: 'Bengali', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Fish', 'Potato', 'Onion', 'Tomato', 'Ginger', 'Turmeric', 'Cumin'],
    ingredient_categories: ['proteins', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['non-vegetarian', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Chholar Dal', cuisine: 'Bengali', category: 'dal', prep_time_minutes: 30,
    ingredients: ['Chana Dal', 'Coconut', 'Ginger', 'Cumin', 'Ghee', 'Cinnamon'],
    ingredient_categories: ['legumes', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian'], effort_level: 1,
  },
  {
    name: 'Moong Dal', cuisine: 'Bengali', category: 'dal', prep_time_minutes: 25,
    ingredients: ['Moong Dal', 'Onion', 'Ginger', 'Cumin', 'Ghee', 'Bay Leaf'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan', 'low_effort'], effort_level: 1,
  },
  {
    name: 'Sandesh', cuisine: 'Bengali', category: 'dessert', prep_time_minutes: 30,
    ingredients: ['Chenna', 'Sugar', 'Cardamom'],
    ingredient_categories: ['dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'festival_meal'], effort_level: 2,
  },
  {
    name: 'Rasgulla', cuisine: 'Bengali', category: 'dessert', prep_time_minutes: 45,
    ingredients: ['Chenna', 'Sugar', 'Flour', 'Cardamom'],
    ingredient_categories: ['dairy', 'spices_and_aromatics', 'grains'],
    dietary_tags: ['vegetarian', 'festival_meal'], effort_level: 3,
  },
  {
    name: 'Misti Doi', cuisine: 'Bengali', category: 'dessert', prep_time_minutes: 20,
    ingredients: ['Milk', 'Curd', 'Jaggery'],
    ingredient_categories: ['dairy'],
    dietary_tags: ['vegetarian', 'festival_meal'], effort_level: 1,
  },
  {
    name: 'Luchi', cuisine: 'Bengali', category: 'bread', prep_time_minutes: 30,
    ingredients: ['Wheat Flour', 'Oil', 'Salt'],
    ingredient_categories: ['grains', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Koraishuti Nir Chocori', cuisine: 'Bengali', category: 'dry_vegetable', prep_time_minutes: 25,
    ingredients: ['Cauliflower', 'Peas', 'Onion', 'Ginger', 'Cumin', 'Turmeric'],
    ingredient_categories: ['cruciferous', 'legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Paturi', cuisine: 'Bengali', category: 'main_curry', prep_time_minutes: 40,
    ingredients: ['Fish', 'Mustard', 'Coconut', 'Mustard Leaves', 'Mustard Oil', 'Green Chilli'],
    ingredient_categories: ['proteins', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['non-vegetarian', 'high_protein', 'weekend_special'], effort_level: 3,
  },
  {
    name: 'Ghugni', cuisine: 'Bengali', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Dried Peas', 'Onion', 'Tomato', 'Ginger', 'Garam Masala', 'Tamarind'],
    ingredient_categories: ['legumes', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan', 'high_protein'], effort_level: 2,
  },
  {
    name: 'Payesh', cuisine: 'Bengali', category: 'dessert', prep_time_minutes: 35,
    ingredients: ['Rice', 'Milk', 'Sugar', 'Cardamom', 'Cashew'],
    ingredient_categories: ['grains', 'dairy', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'festival_meal'], effort_level: 2,
  },
  {
    name: 'Alur Dom', cuisine: 'Bengali', category: 'main_curry', prep_time_minutes: 30,
    ingredients: ['Potato', 'Onion', 'Tomato', 'Ginger', 'Garam Masala', 'Cumin'],
    ingredient_categories: ['root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian', 'vegan'], effort_level: 1,
  },
  {
    name: 'Chhanar Dalna', cuisine: 'Bengali', category: 'main_curry', prep_time_minutes: 35,
    ingredients: ['Chenna', 'Potato', 'Onion', 'Tomato', 'Ginger', 'Garam Masala'],
    ingredient_categories: ['dairy', 'root_vegetables', 'spices_and_aromatics'],
    dietary_tags: ['vegetarian'], effort_level: 2,
  },
  {
    name: 'Tomato Chutney', cuisine: 'Bengali', category: 'side_dish', prep_time_minutes: 20,
    ingredients: ['Tomato', 'Jaggery', 'Panch Phoron', 'Mustard Oil', 'Raisin'],
    ingredient_categories: ['root_vegetables', 'spices_and_aromatics', 'oils_and_fats'],
    dietary_tags: ['vegetarian', 'low_effort'], effort_level: 1,
  },
];
