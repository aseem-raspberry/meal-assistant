/**
 * Regional Cuisine Profiles (doc 4 §38)
 *
 * These profiles allow the recommendation engine to assemble *meals*
 * rather than merely suggesting isolated *dishes*.
 *
 * When the system recommends "Dal Fry," the Regional Cuisine Profile
 * determines whether to pair it with "Jeera Rice and Roti" (North Indian)
 * or "Steamed Rice and Papad" (South Indian).
 */
import type { RegionalCuisineProfile, CuisineRegion } from '@/types/domain';

export const REGIONAL_CUISINE_PROFILES: Record<CuisineRegion, RegionalCuisineProfile> = {
  'North Indian': {
    region: 'North Indian',
    meal_template: ['main_curry', 'bread', 'rice', 'salad', 'pickle'],
    primary_cooking_fats: ['ghee', 'mustard oil'],
    staple_grains: ['wheat', 'rice'],
    common_sides: ['Jeera Rice', 'Roti', 'Cucumber Raita', 'Pickle', 'Salad'],
  },
  'South Indian': {
    region: 'South Indian',
    meal_template: ['rice', 'dal', 'dry_vegetable', 'raita', 'papad', 'pickle'],
    primary_cooking_fats: ['coconut oil', 'sesame oil'],
    staple_grains: ['rice'],
    common_sides: ['Steamed Rice', 'Papad', 'Curd', 'Pickle', 'Coconut Chutney'],
  },
  Gujarati: {
    region: 'Gujarati',
    meal_template: ['main_curry', 'bread', 'dal', 'rice', 'side_dish'],
    primary_cooking_fats: ['groundnut oil', 'ghee'],
    staple_grains: ['wheat', 'rice', 'bajra'],
    common_sides: ['Rotli', 'Bhat', 'Kadhi', 'Farsan', 'Salad'],
  },
  Maharashtrian: {
    region: 'Maharashtrian',
    meal_template: ['main_curry', 'bread', 'rice', 'dal', 'salad'],
    primary_cooking_fats: ['groundnut oil', 'ghee'],
    staple_grains: ['rice', 'jowar', 'wheat'],
    common_sides: ['Bhakri', 'Varan Bhat', 'Thecha', 'Koshimbir', 'Papad'],
  },
  Punjabi: {
    region: 'Punjabi',
    meal_template: ['main_curry', 'bread', 'rice', 'salad', 'raita'],
    primary_cooking_fats: ['ghee', 'mustard oil'],
    staple_grains: ['wheat', 'rice'],
    common_sides: ['Tandoori Roti', 'Jeera Rice', 'Boondi Raita', 'Salad', 'Pickle'],
  },
  Bengali: {
    region: 'Bengali',
    meal_template: ['rice', 'main_curry', 'dal', 'side_dish', 'pickle'],
    primary_cooking_fats: ['mustard oil', 'ghee'],
    staple_grains: ['rice'],
    common_sides: ['Steamed Rice', 'Dal', 'Begun Bhaja', 'Achar', 'Papad'],
  },
};

/**
 * Common ingredients for the quick inventory check screen.
 * Grouped by IngredientCategory (doc 4 §32).
 * 15-20 ingredients as specified in MVP requirements.
 */
export const INVENTORY_CHECKLIST: { category: string; items: string[] }[] = [
  {
    category: 'Vegetables',
    items: ['Potato', 'Onion', 'Tomato', 'Spinach', 'Cauliflower', 'Bhindi', 'Cabbage', 'Carrot'],
  },
  {
    category: 'Dairy',
    items: ['Milk', 'Curd', 'Paneer', 'Ghee'],
  },
  {
    category: 'Grains',
    items: ['Rice', 'Wheat Flour', 'Toor Dal', 'Moong Dal'],
  },
  {
    category: 'Protein',
    items: ['Eggs', 'Chicken', 'Chana', 'Rajma'],
  },
];

/** Flatten the inventory checklist for quick lookups */
export const ALL_INVENTORY_ITEMS = INVENTORY_CHECKLIST.flatMap((g) => g.items);
