/**
 * Recommendation Engine — Household Meal Decision Assistant
 *
 * Implements the 9-step pipeline from docs/6 §5:
 *   1. Context Assembly
 *   2. Candidate Generation (cuisine profile + inventory filter)
 *   3. Hard Constraint Filtering (diet, allergies, restrictions)
 *   4. Scoring (preference, variety, effort, seasonal)
 *   5. Satisfaction Estimation
 *   6. Meal Assembly (main dish + sides via Regional Cuisine Profile)
 *   7. Explanation Generation
 *   8. Confidence Scoring
 *   9. Presentation (top 1 + alternatives)
 *
 * Key decisions implemented:
 *   D-008/D-010: Optimize household satisfaction under constraints
 *   D-009: Prioritize ingredient repetition over recipe repetition
 *   D-012: Consider future meals
 *   D-013: Confidence determines assertiveness
 *   D-023: Recommendations optimize expected household satisfaction
 *   D-024: Every recommendation must be explainable
 *   D-026: Recommendation confidence is first-class output
 *   D-040: Day One uses population priors and seasonal defaults
 */

import type {
  Dish,
  ScoredDish,
  Household,
  Meal,
  RecommendationResult,
  RecommendationCategory,
  CuisineRegion,
  MealComponent,
} from '@/types/domain';
import { REGIONAL_CUISINE_PROFILES } from './cuisine-profiles';
import { SEED_DISHES } from './seed-dishes';

// ─── Types for engine internals ─────────────────────────────────

export interface RecommendationContext {
  household: Household;
  availableIngredients: Set<string>;
  recentMeals: Meal[]; // last 7-14 days
  recentIngredientUsage: Map<string, number>; // ingredient → times used recently
  dishes: Dish[]; // all dishes from DB
  preferences: Map<string, number>; // dish_name → score (0-10)
  allergies: string[];
  leftovers: string | null;
  availableTimeMinutes: number | null;
}

// ─── Step 1-2: Context Assembly + Candidate Generation ──────────

/**
 * Filter dishes by cuisine region and diet type.
 * D-039: Cuisine region is a required onboarding field.
 */
function generateCandidates(
  dishes: Dish[],
  household: Household
): Dish[] {
  return dishes.filter((dish) => {
    // Cuisine match: prefer same region, but allow adjacent cuisines
    const cuisineMatch =
      dish.cuisine === household.cuisine_region ||
      isCompatibleCuisine(dish.cuisine, household.cuisine_region);

    // Diet type filter (hard constraint — Step 3)
    const dietMatch = matchesDietType(dish, household.diet_type);

    return cuisineMatch && dietMatch;
  });
}

/**
 * Check if a cuisine is compatible with the household's region.
 * This allows cross-cuisine recommendations while prioritizing regional dishes.
 */
function isCompatibleCuisine(
  dishCuisine: CuisineRegion,
  householdCuisine: CuisineRegion
): boolean {
  const compatible: Record<CuisineRegion, CuisineRegion[]> = {
    'North Indian': ['Punjabi', 'Gujarati'],
    'South Indian': ['Maharashtrian'],
    Gujarati: ['North Indian', 'Maharashtrian'],
    Maharashtrian: ['South Indian', 'Gujarati'],
    Punjabi: ['North Indian'],
    Bengali: ['North Indian'],
  };
  return compatible[householdCuisine]?.includes(dishCuisine) ?? false;
}

/**
 * D-032: Restrictions are hard constraints.
 * Filter dishes that violate dietary restrictions.
 */
function matchesDietType(
  dish: Dish,
  dietType: Household['diet_type']
): boolean {
  const tags = dish.dietary_tags;
  switch (dietType) {
    case 'vegetarian':
      return !tags.includes('non-vegetarian');
    case 'vegan':
      return !tags.includes('non-vegetarian') && !tags.includes('vegetarian-dairy');
    case 'eggetarian':
      return !tags.includes('non-vegetarian') || tags.includes('eggetarian');
    case 'non-vegetarian':
      return true; // non-veg households can eat anything
    default:
      return true;
  }
}

// ─── Step 3: Hard Constraint Filtering ──────────────────────────

/**
 * Filter out dishes containing allergens.
 * D-032: Restrictions are hard constraints.
 */
function filterAllergens(dishes: Dish[], allergies: string[]): Dish[] {
  if (!allergies.length) return dishes;
  return dishes.filter((dish) =>
    !dish.ingredients.some((ing) =>
      allergies.some((allergy) =>
        ing.toLowerCase().includes(allergy.toLowerCase())
      )
    )
  );
}

// ─── Step 4: Scoring ────────────────────────────────────────────

/**
 * Score a dish across multiple factors.
 * Weights follow the Meal Decision Pyramid (docs/1 §7):
 *   Hard constraints > Inventory > Repetition > Preferences > Effort > Nutrition
 *
 * D-009: Track ingredient repetition, not just recipe repetition.
 * D-010: Optimize household satisfaction.
 */
function scoreDish(
  dish: Dish,
  context: RecommendationContext
): ScoredDish {
  const reasons: string[] = [];

  // Factor 1: Availability (0-1) — how many ingredients are available
  const availableCount = dish.ingredients.filter((ing) =>
    context.availableIngredients.has(ing)
  ).length;
  const availability = availableCount / dish.ingredients.length;
  if (availability < 1) {
    reasons.push(`Missing ${dish.ingredients.length - availableCount} ingredient(s)`);
  } else {
    reasons.push('All ingredients available');
  }

  // Factor 2: Variety / Repetition penalty (D-009)
  // Track ingredient repetition, not just recipe repetition
  let repetitionPenalty = 0;
  const recentUses = dish.ingredients.map(
    (ing) => context.recentIngredientUsage.get(ing) ?? 0
  );
  const avgRecentUse =
    recentUses.reduce((a, b) => a + b, 0) / recentUses.length;
  const maxRecentUse = Math.max(...recentUses);
  // Penalize dishes whose ingredients were recently used heavily
  const variety = Math.max(0, 1 - avgRecentUse * 0.15 - maxRecentUse * 0.05);
  if (maxRecentUse > 0) {
    const recentIngredient = dish.ingredients[
      recentUses.indexOf(maxRecentUse)
    ];
    reasons.push(`${recentIngredient} used recently — varying it up`);
  } else {
    reasons.push("Haven't used these ingredients recently");
  }

  // Factor 3: Preference (0-1) — household preference score
  const prefScore = context.preferences.get(dish.name) ?? 5.0; // default neutral
  const preference = prefScore / 10;
  if (prefScore >= 7) {
    reasons.push('A household favourite');
  }

  // Factor 4: Effort match (0-1) — does effort match available time?
  let effort = 0.5;
  if (context.availableTimeMinutes !== null) {
    if (context.availableTimeMinutes >= dish.prep_time_minutes) {
      effort = 1.0 - (dish.effort_level - 1) * 0.15;
      if (dish.effort_level === 1) {
        reasons.push('Quick to cook');
      }
    } else {
      effort = 0.2;
      reasons.push('May take longer than available time');
    }
  } else {
    // No time constraint: moderate effort is fine
    effort = dish.effort_level === 1 ? 0.8 : dish.effort_level === 2 ? 0.7 : 0.5;
  }

  // Factor 5: Seasonal fit (simplified — could integrate weather API)
  const season = getCurrentSeason();
  const seasonal = getSeasonalFit(dish, season);
  if (seasonal > 0.7) {
    reasons.push(`Good for ${season}`);
  }

  // Weighted score following the decision pyramid
  const score =
    availability * 0.30 + // inventory is foundational
    variety * 0.25 + // repetition check is next
    preference * 0.20 + // preferences are soft constraints
    effort * 0.15 + // practical constraints
    seasonal * 0.10; // seasonal is a bonus

  return {
    dish,
    score,
    factors: { availability, preference, variety, effort, seasonal },
    reasons,
  };
}

// ─── Step 5: Satisfaction Estimation ────────────────────────────

/**
 * D-010/D-045: Household satisfaction = weighted member satisfaction.
 * For MVP without per-member data, we use preference history +
 * acceptance rate as a proxy.
 */
function estimateConfidence(
  scoredDishes: ScoredDish[],
  context: RecommendationContext
): number {
  const mealCount = context.recentMeals.length;
  // D-013: Confidence increases with history
  if (mealCount === 0) return 0.3; // cold start — D-040
  if (mealCount < 5) return 0.4 + mealCount * 0.04;
  if (mealCount < 15) return 0.6 + Math.min(mealCount * 0.02, 0.2);

  // Above 15 meals: confidence from top score quality
  const topScore = scoredDishes[0]?.score ?? 0;
  return Math.min(0.95, 0.7 + topScore * 0.25);
}

// ─── Step 6: Meal Assembly ──────────────────────────────────────

/**
 * Assemble a complete meal using Regional Cuisine Profile templates.
 * doc 4 §38: Regional Cuisine Profiles determine sides pairing.
 *
 * Example: Dal Fry → North Indian profile pairs with Jeera Rice + Roti
 *          Dal Fry → South Indian profile pairs with Steamed Rice + Papad
 *
 * The main dish is the top-scored "main" dish (curry, dal, or dry_vegetable).
 * Sides are selected from the cuisine template's remaining components.
 */
function assembleMeal(
  mainDish: ScoredDish,
  allScoredDishes: ScoredDish[],
  cuisineRegion: CuisineRegion
): ScoredDish[] {
  const profile = REGIONAL_CUISINE_PROFILES[cuisineRegion];
  const meal: ScoredDish[] = [mainDish];

  // Determine which components the main dish already covers
  const mainCategory = mainDish.dish.category;

  // Build the list of side components we need, excluding the main's category
  // Priority: rice, bread, then raita/salad/papad/pickle/side_dish
  const sidePriority: MealComponent[] = ['rice', 'bread', 'raita', 'salad', 'papad', 'pickle', 'side_dish', 'dessert', 'drink'];
  let neededComponents = sidePriority.filter(
    (c) => c !== mainCategory && profile.meal_template.includes(c)
  );

  // If main is rice-based, we need a curry/dal side (bread may not be in the template for South Indian)
  // If main is bread-based or dal, we need rice
  if (mainCategory === 'rice') {
    // For rice-heavy cuisines (South Indian), prefer dal/dry_vegetable as side
    const curryPriority: MealComponent[] = ['dal', 'dry_vegetable', 'main_curry'];
    const currySides = curryPriority.filter(
      (c) => c !== mainCategory && profile.meal_template.includes(c)
    );
    neededComponents = [...currySides, ...neededComponents];
  } else if (mainCategory === 'bread' || mainCategory === 'dal') {
    neededComponents.unshift('rice');
  }

  // Deduplicate
  neededComponents = [...new Set(neededComponents)];

  // Pick 1-2 sides from the needed components
  const maxSides = 2;
  let sidesAdded = 0;

  for (const component of neededComponents) {
    if (sidesAdded >= maxSides) break;

    // Find the best-scoring dish for this component that isn't already in the meal
    // and isn't in the same category as the main dish (avoid e.g. two rice dishes)
    const side = allScoredDishes.find(
      (sd) =>
        sd.dish.category === component &&
        sd.dish.id !== mainDish.dish.id &&
        !meal.some((m) => m.dish.id === sd.dish.id) &&
        sd.dish.category !== mainDish.dish.category &&
        sd.score > 0.3 // only include sides with reasonable availability
    );

    if (side) {
      meal.push(side);
      sidesAdded++;
    }
  }

  // Fallback: if we couldn't find enough sides from scored dishes, 
  // try common sides from the cuisine profile
  if (sidesAdded < 1) {
    for (const sideName of profile.common_sides) {
      if (sidesAdded >= maxSides) break;
      if (meal.some((m) => m.dish.name === sideName)) continue;

      const fallbackDish = allScoredDishes.find(
        (sd) => sd.dish.name === sideName && !meal.some((m) => m.dish.id === sd.dish.id)
      );
      if (fallbackDish) {
        meal.push(fallbackDish);
        sidesAdded++;
      }
    }
  }

  return meal;
}

// ─── Step 7: Explanation Generation ─────────────────────────────

/**
 * D-024: Every recommendation must be explainable.
 * D- Principle 9: Progressive Explanation — single-line default.
 *
 * For MVP, we generate a templated explanation.
 * The API route can optionally use an LLM (Gemini/Claude) to enhance this.
 */
export function generateExplanation(
  primary: ScoredDish[],
  confidence: number,
  mealCount: number
): string {
  const mainDish = primary[0];
  const sideNames = primary.slice(1).map((s) => s.dish.name);

  // D- Principle 9: Default is a single-line rationale
  const topReason = mainDish.reasons[0];
  const sideText = sideNames.length > 0 ? ` with ${sideNames.join(' and ')}` : '';

  // Confidence-based phrasing (D-013)
  if (mealCount === 0) {
    return `Tonight I'd suggest ${mainDish.dish.name}${sideText}. ${topReason}. This is a popular weeknight choice — let me know if it suits your household!`;
  }

  if (confidence < 0.5) {
    return `How about ${mainDish.dish.name}${sideText}? ${topReason}. Still learning your household, so here are some alternatives too.`;
  }

  if (confidence > 0.8) {
    return `${mainDish.dish.name}${sideText} — ${topReason}. Based on ${mealCount} meals, this should work well tonight.`;
  }

  return `${mainDish.dish.name}${sideText}. ${topReason}. Based on ${mealCount} meals so far.`;
}

// ─── Step 8: Categories ─────────────────────────────────────────

function categorizeRecommendation(
  dishes: ScoredDish[],
  context: RecommendationContext
): RecommendationCategory[] {
  const categories: RecommendationCategory[] = [];
  const mainDish = dishes[0].dish;

  if (mainDish.effort_level === 1) categories.push('low_effort', 'quick_meal');
  if (mainDish.dietary_tags.includes('comfort_food')) categories.push('comfort_food');
  if (mainDish.dietary_tags.includes('healthy_meal')) categories.push('healthy_meal');
  if (mainDish.dietary_tags.includes('high_protein')) categories.push('high_protein');
  if (mainDish.dietary_tags.includes('weekend_special')) categories.push('weekend_special');
  if (mainDish.dietary_tags.includes('seasonal')) categories.push('seasonal');
  if (mainDish.dietary_tags.includes('festival_meal')) categories.push('festival_meal');
  if (mainDish.dietary_tags.includes('budget_meal')) categories.push('budget_meal');

  // Leftover-based
  if (context.leftovers) categories.push('leftover_meal');

  // Day of week
  const day = new Date().getDay();
  if (day === 0 || day === 6) {
    if (!categories.includes('weekend_special')) categories.push('weekend_special');
  }

  return categories;
}

// ─── Helpers ────────────────────────────────────────────────────

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'monsoon';
  return 'winter';
}

function getSeasonalFit(dish: Dish, season: string): number {
  if (dish.dietary_tags.includes('seasonal')) {
    // Rough heuristic: leafy greens better in winter, gourds in summer
    if (season === 'winter' && dish.ingredient_categories.includes('leafy_greens')) return 0.9;
    if (season === 'summer' && dish.ingredient_categories.includes('gourds')) return 0.8;
    if (season === 'monsoon' && dish.dietary_tags.includes('comfort_food')) return 0.85;
  }
  // Comfort food is always moderately good in monsoon/winter
  if ((season === 'monsoon' || season === 'winter') && dish.dietary_tags.includes('comfort_food')) {
    return 0.75;
  }
  return 0.5;
}

/**
 * Build ingredient usage map from recent meals.
 * D-009: Track ingredient frequency, not just recipe frequency.
 */
export function buildIngredientUsageMap(
  recentMeals: Meal[],
  dishes: Dish[]
): Map<string, number> {
  const dishMap = new Map(dishes.map((d) => [d.id, d]));
  const usage = new Map<string, number>();

  for (const meal of recentMeals) {
    for (const dishId of meal.dish_ids) {
      const dish = dishMap.get(dishId);
      if (dish) {
        for (const ingredient of dish.ingredients) {
          usage.set(ingredient, (usage.get(ingredient) ?? 0) + 1);
        }
      }
    }
  }

  return usage;
}

// ─── Main Engine ────────────────────────────────────────────────

/**
 * Generate a recommendation following the 9-step pipeline.
 * This is the core function called by the API route.
 */
export function generateRecommendation(
  context: RecommendationContext
): RecommendationResult {
  const { household } = context;

  // Step 1-2: Candidate generation
  let candidates = generateCandidates(context.dishes, household);

  // Step 3: Hard constraint filtering — allergens
  candidates = filterAllergens(candidates, context.allergies);

  // Also filter by ingredient availability — at least 60% available
  candidates = candidates.filter((dish) => {
    const availableCount = dish.ingredients.filter((ing) =>
      context.availableIngredients.has(ing)
    ).length;
    return availableCount / dish.ingredients.length >= 0.6;
  });

  // If no candidates pass the 60% threshold, relax to any availability
  if (candidates.length === 0) {
    candidates = generateCandidates(context.dishes, household);
    candidates = filterAllergens(candidates, context.allergies);
  }

  // Step 4: Score all candidates
  const scoredDishes = candidates
    .map((dish) => scoreDish(dish, context))
    .sort((a, b) => b.score - a.score);

  // Step 5-6: Assemble meals — primary + 2 alternatives
  const cuisineRegion = household.cuisine_region;
  const primary = assembleMeal(scoredDishes[0], scoredDishes, cuisineRegion);

  // Build alternatives from next top-scoring mains
  const usedDishIds = new Set(primary.map((s) => s.dish.id));
  const alternativeMains = scoredDishes.filter(
    (sd) =>
      !usedDishIds.has(sd.dish.id) &&
      sd.dish.category !== 'rice' &&
      sd.dish.category !== 'bread' &&
      sd.dish.category !== 'raita' &&
      sd.dish.category !== 'papad' &&
      sd.dish.category !== 'side_dish' &&
      sd.dish.category !== 'salad' &&
      sd.dish.category !== 'pickle'
  );

  const alternatives: ScoredDish[][] = [];
  for (const alt of alternativeMains.slice(0, 2)) {
    usedDishIds.add(alt.dish.id);
    const altMeal = assembleMeal(alt, scoredDishes, cuisineRegion);
    alternatives.push(altMeal);
  }

  // Step 7: Explanation
  const mealCount = context.recentMeals.length;
  const confidence = estimateConfidence(scoredDishes, context);
  const explanation = generateExplanation(primary, confidence, mealCount);

  // Step 8: Categories
  const categories = categorizeRecommendation(primary, context);

  return {
    primary,
    alternatives,
    explanation,
    confidence,
    categories,
  };
}
