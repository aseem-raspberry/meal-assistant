/**
 * Domain Types — Household Meal Decision Assistant
 *
 * Entity names aligned with docs/4. Domain Model & Ubiquitous Language.
 * Meal ≠ Dish ≠ Recipe. MealSlot ≠ Meal. Restriction ≠ Preference.
 * D-027: Household is the primary domain entity.
 * D-028: Meals belong to households, not individuals.
 * D-029: Recipes are implementation details supporting dishes.
 * D-030: Leftovers are first-class entities.
 * D-031: Inventory includes pantry, refrigerator, freezer and leftovers.
 * D-032: Restrictions and preferences are fundamentally different concepts.
 * D-033: Household Twin is a hybrid model (structured + emergent).
 * D-033a: Decision Context is a first-class entity linked to every recommendation.
 * D-033b: Ingredient Categories required for variety tracking.
 * D-033c: Feedback Signals are the primary fuel for the learning loop.
 */

// ─── Enums & Unions ─────────────────────────────────────────────

/** doc 4 §38 — Regional cuisines supported in MVP */
export type CuisineRegion =
  | 'North Indian'
  | 'South Indian'
  | 'Gujarati'
  | 'Maharashtrian'
  | 'Punjabi'
  | 'Bengali';

/** D-039 — onboarding captures diet type */
export type DietType = 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'vegan';

/** doc 4 §29 — Meal Slot states */
export type MealSlotStatus = 'filled' | 'skipped' | 'planned' | 'empty';

/** doc 4 §6 — eating occasions */
export type MealSlotName = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** doc 4 §36 — Feedback Signal types */
export type FeedbackSignalType =
  | 'accepted'
  | 'modified'
  | 'rejected'
  | 'ignored'
  | 'saved'
  | 'liked'
  | 'disliked';

/** doc 4 §36 — recommendation status */
export type RecommendationStatus = 'accepted' | 'rejected' | 'ignored';

/** doc 4 §15 — meal components */
export type MealComponent =
  | 'main_curry'
  | 'dry_vegetable'
  | 'rice'
  | 'bread'
  | 'dal'
  | 'dessert'
  | 'starter'
  | 'side_dish'
  | 'pickle'
  | 'salad'
  | 'drink'
  | 'raita'
  | 'papad';

/** doc 4 §32 — Ingredient categories */
export type IngredientCategory =
  | 'leafy_greens'
  | 'root_vegetables'
  | 'gourds'
  | 'cruciferous'
  | 'legumes'
  | 'dairy'
  | 'grains'
  | 'proteins'
  | 'oils_and_fats'
  | 'spices_and_aromatics'
  | 'fruits'
  | 'other';

/** Structured rejection reasons for the "Not today" flow */
export type RejectionReason =
  | 'too_much_effort'
  | 'missing_ingredient'
  | 'not_in_mood'
  | 'cooked_recently'
  | 'other';

/** Recommendation categories (doc 3 §7) */
export type RecommendationCategory =
  | 'quick_meal'
  | 'comfort_food'
  | 'weekend_special'
  | 'festival_meal'
  | 'healthy_meal'
  | 'budget_meal'
  | 'leftover_meal'
  | 'guest_meal'
  | 'lunchbox_friendly'
  | 'low_effort'
  | 'high_protein'
  | 'seasonal';

// ─── Core Entities (doc 4) ──────────────────────────────────────

/** doc 4 §4 — A group of people whose meal decisions influence one another. */
export interface Household {
  id: string;
  name: string;
  size: number;
  cuisine_region: CuisineRegion;
  diet_type: DietType;
  created_at: string;
  updated_at: string;
}

/** doc 4 §5 — A person belonging to a household. */
export interface HouseholdMember {
  id: string;
  household_id: string;
  name: string;
  age: number | null;
  diet_type: DietType | null;
  allergies: string[];
  importance_weight: number; // participation-adjusted (D-045)
  created_at: string;
}

/** doc 4 §7 — One prepared food item. Dishes combine to create meals. */
export interface Dish {
  id: string;
  name: string;
  cuisine: CuisineRegion;
  category: MealComponent;
  prep_time_minutes: number;
  ingredients: string[];
  ingredient_categories: IngredientCategory[];
  dietary_tags: string[];
  effort_level: 1 | 2 | 3; // 1=quick, 2=moderate, 3=elaborate
  created_at: string;
}

/** doc 4 §6 — An eating occasion. */
export interface Meal {
  id: string;
  household_id: string;
  date: string; // YYYY-MM-DD
  meal_slot: MealSlotName;
  dish_ids: string[];
  source: 'recommended' | 'manual';
  created_at: string;
}

/** doc 4 §29 — A specific eating occasion on a specific date. */
export interface MealSlot {
  id: string;
  household_id: string;
  date: string;
  meal_slot: MealSlotName;
  status: MealSlotStatus;
  meal_id: string | null;
}

/** doc 4 §31 — Complete set of signals at recommendation time. D-033a */
export interface DecisionContext {
  id: string;
  household_id: string;
  date: string;
  meal_slot: MealSlotName;
  inventory_snapshot: Record<string, boolean>;
  active_restrictions: string[];
  available_time_minutes: number | null;
  members_present: string[];
  weather: string | null;
  day_of_week: string;
  season: string;
  recent_meal_history: string[];
  created_at: string;
}

/** doc 4 §25 / doc 3 §2 — The recommendation object. D-022, D-023, D-024 */
export interface Recommendation {
  id: string;
  household_id: string;
  date: string;
  meal_slot: MealSlotName;
  recommended_dishes: string[]; // dish IDs: [main, side1, side2]
  explanation: string;
  confidence: number; // 0-1
  status: RecommendationStatus;
  decision_context_id: string;
  alternatives: string[][]; // array of dish ID arrays
  categories: RecommendationCategory[];
  created_at: string;
}

/** doc 4 §36 — How a household responded to a recommendation. D-033c */
export interface FeedbackSignal {
  id: string;
  recommendation_id: string;
  decision_context_id: string;
  signal_type: FeedbackSignalType;
  reason: string | null; // RejectionReason or free text
  timestamp: string;
}

/** doc 4 §11 — Everything currently available in the household. D-031 */
export interface InventoryItem {
  id: string;
  household_id: string;
  ingredient: string;
  available: boolean;
  updated_at: string;
}

/** doc 4 §21 — A hard rule preventing recommendations. D-032 */
export interface Restriction {
  id: string;
  household_id: string;
  type: string; // e.g., "no_onion", "nut_allergy", "fasting"
  description: string;
  is_permanent: boolean;
}

/** doc 4 §20 — Degree of liking (soft constraint). D-032 */
export interface Preference {
  id: string;
  household_id: string;
  member_id: string | null; // null = household-level
  dish_name: string;
  score: number; // 0-10
}

// ─── Recommendation Engine Types ────────────────────────────────

/** A scored dish candidate from the recommendation pipeline (doc 6 §5) */
export interface ScoredDish {
  dish: Dish;
  score: number;
  factors: {
    availability: number;
    preference: number;
    variety: number;
    effort: number;
    seasonal: number;
  };
  reasons: string[];
}

/** The assembled recommendation output from the engine */
export interface RecommendationResult {
  primary: ScoredDish[];
  alternatives: ScoredDish[][];
  explanation: string;
  confidence: number;
  categories: RecommendationCategory[];
}

/** doc 4 §38 — Regional Cuisine Profile for meal assembly */
export interface RegionalCuisineProfile {
  region: CuisineRegion;
  meal_template: MealComponent[]; // ordered: [main, side1, side2, ...]
  primary_cooking_fats: string[];
  staple_grains: string[];
  common_sides: string[]; // dish names commonly paired
}

// ─── API Request/Response Types ─────────────────────────────────

export interface OnboardingData {
  household_name: string;
  size: number;
  cuisine_region: CuisineRegion;
  diet_type: DietType;
  members?: { name: string; age?: number; allergies?: string[] }[];
}

export interface InventoryCheckData {
  household_id: string;
  ingredients: Record<string, boolean>;
  leftovers: string | null;
}

export interface RecommendationRequest {
  household_id: string;
  date: string;
  meal_slot: MealSlotName;
}
