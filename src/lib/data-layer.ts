/**
 * Local-First Data Layer
 *
 * Architecture note (docs/6 §4): The product should work offline.
 * This layer uses localStorage as the primary store for MVP,
 * with a Supabase sync path ready for when credentials are configured.
 *
 * All data is household-scoped (D-027, D-028).
 */
import type {
  Household,
  HouseholdMember,
  Meal,
  Recommendation,
  FeedbackSignal,
  InventoryItem,
  Dish,
} from '@/types/domain';
import { SEED_DISHES } from './seed-dishes';

const STORAGE_PREFIX = 'meal-assistant:';

// ─── Storage Keys ───────────────────────────────────────────────

const KEYS = {
  household: `${STORAGE_PREFIX}household`,
  members: `${STORAGE_PREFIX}members`,
  meals: `${STORAGE_PREFIX}meals`,
  recommendations: `${STORAGE_PREFIX}recommendations`,
  feedback: `${STORAGE_PREFIX}feedback`,
  inventory: `${STORAGE_PREFIX}inventory`,
  dishes: `${STORAGE_PREFIX}dishes`,
  initialized: `${STORAGE_PREFIX}initialized`,
};

// ─── Generic helpers ────────────────────────────────────────────

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Dish initialization ────────────────────────────────────────

/**
 * Initialize the dish database from seed data.
 * Called once on first app load.
 */
export function initializeDishes(): void {
  const initialized = getItem<boolean>(KEYS.initialized, false);
  if (initialized) return;

  const dishes: Dish[] = SEED_DISHES.map((seed, index) => ({
    id: `dish-${index + 1}`,
    name: seed.name,
    cuisine: seed.cuisine as Dish['cuisine'],
    category: seed.category as Dish['category'],
    prep_time_minutes: seed.prep_time_minutes,
    ingredients: seed.ingredients,
    ingredient_categories: seed.ingredient_categories as Dish['ingredient_categories'],
    dietary_tags: seed.dietary_tags,
    effort_level: seed.effort_level,
    created_at: new Date().toISOString(),
  }));

  setItem(KEYS.dishes, dishes);
  setItem(KEYS.initialized, true);
}

export function getDishes(): Dish[] {
  return getItem<Dish[]>(KEYS.dishes, []);
}

export function getDishById(id: string): Dish | undefined {
  return getDishes().find((d) => d.id === id);
}

// ─── Household ──────────────────────────────────────────────────

export function getHousehold(): Household | null {
  return getItem<Household | null>(KEYS.household, null);
}

export function saveHousehold(household: Household): void {
  setItem(KEYS.household, household);
}

export function createHousehold(data: {
  name: string;
  size: number;
  cuisine_region: Household['cuisine_region'];
  diet_type: Household['diet_type'];
}): Household {
  const household: Household = {
    id: generateId(),
    name: data.name,
    size: data.size,
    cuisine_region: data.cuisine_region,
    diet_type: data.diet_type,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveHousehold(household);
  return household;
}

// ─── Members ────────────────────────────────────────────────────

export function getMembers(): HouseholdMember[] {
  return getItem<HouseholdMember[]>(KEYS.members, []);
}

export function saveMembers(members: HouseholdMember[]): void {
  setItem(KEYS.members, members);
}

export function addMember(
  householdId: string,
  data: { name: string; age?: number; allergies?: string[] }
): HouseholdMember {
  const members = getMembers();
  const member: HouseholdMember = {
    id: generateId(),
    household_id: householdId,
    name: data.name,
    age: data.age ?? null,
    diet_type: null,
    allergies: data.allergies ?? [],
    importance_weight: 1.0,
    created_at: new Date().toISOString(),
  };
  members.push(member);
  saveMembers(members);
  return member;
}

export function getAllergies(): string[] {
  const members = getMembers();
  return [...new Set(members.flatMap((m) => m.allergies))];
}

// ─── Inventory ──────────────────────────────────────────────────

export function getInventory(): InventoryItem[] {
  return getItem<InventoryItem[]>(KEYS.inventory, []);
}

export function saveInventory(
  householdId: string,
  ingredients: Record<string, boolean>
): void {
  const items: InventoryItem[] = Object.entries(ingredients).map(
    ([ingredient, available]) => ({
      id: generateId(),
      household_id: householdId,
      ingredient,
      available,
      updated_at: new Date().toISOString(),
    })
  );
  setItem(KEYS.inventory, items);
}

export function getAvailableIngredients(): Set<string> {
  return new Set(
    getInventory()
      .filter((item) => item.available)
      .map((item) => item.ingredient)
  );
}

// ─── Meals ──────────────────────────────────────────────────────

export function getMeals(): Meal[] {
  return getItem<Meal[]>(KEYS.meals, []);
}

export function getRecentMeals(days: number = 14): Meal[] {
  const meals = getMeals();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return meals.filter((m) => new Date(m.date) >= cutoff);
}

export function addMeal(
  householdId: string,
  date: string,
  mealSlot: Meal['meal_slot'],
  dishIds: string[],
  source: 'recommended' | 'manual'
): Meal {
  const meals = getMeals();
  const meal: Meal = {
    id: generateId(),
    household_id: householdId,
    date,
    meal_slot: mealSlot,
    dish_ids: dishIds,
    source,
    created_at: new Date().toISOString(),
  };
  meals.push(meal);
  setItem(KEYS.meals, meals);
  return meal;
}

export function getTodayMeals(householdId: string): Meal[] {
  const today = new Date().toISOString().split('T')[0];
  return getMeals().filter(
    (m) => m.household_id === householdId && m.date === today
  );
}

// ─── Recommendations ────────────────────────────────────────────

export function getRecommendations(): Recommendation[] {
  return getItem<Recommendation[]>(KEYS.recommendations, []);
}

export function saveRecommendation(rec: Recommendation): void {
  const recs = getRecommendations();
  recs.push(rec);
  setItem(KEYS.recommendations, recs);
}

export function updateRecommendationStatus(
  recId: string,
  status: Recommendation['status']
): void {
  const recs = getRecommendations();
  const rec = recs.find((r) => r.id === recId);
  if (rec) {
    rec.status = status;
    setItem(KEYS.recommendations, recs);
  }
}

export function getTodayRecommendation(householdId: string): Recommendation | null {
  const today = new Date().toISOString().split('T')[0];
  const recs = getRecommendations().filter(
    (r) => r.household_id === householdId && r.date === today
  );
  return recs.length > 0 ? recs[recs.length - 1] : null;
}

// ─── Feedback Signals ───────────────────────────────────────────

export function getFeedbackSignals(): FeedbackSignal[] {
  return getItem<FeedbackSignal[]>(KEYS.feedback, []);
}

export function addFeedbackSignal(
  recommendationId: string,
  decisionContextId: string | undefined,
  signalType: FeedbackSignal['signal_type'],
  reason: string | null
): FeedbackSignal {
  const signals = getFeedbackSignals();
  const signal: FeedbackSignal = {
    id: generateId(),
    recommendation_id: recommendationId,
    decision_context_id: decisionContextId ?? '',
    signal_type: signalType,
    reason,
    timestamp: new Date().toISOString(),
  };
  signals.push(signal);
  setItem(KEYS.feedback, signals);
  return signal;
}

// ─── Preferences (learning) ─────────────────────────────────────

const PREF_KEY = `${STORAGE_PREFIX}preferences`;

interface PreferenceRecord {
  dish_name: string;
  score: number;
  times_recommended: number;
  times_accepted: number;
  times_rejected: number;
}

export function getPreferences(): Map<string, number> {
  const records = getItem<PreferenceRecord[]>(PREF_KEY, []);
  const map = new Map<string, number>();
  for (const rec of records) {
    map.set(rec.dish_name, rec.score);
  }
  return map;
}

export function recordAcceptance(dishNames: string[]): void {
  const records = getItem<PreferenceRecord[]>(PREF_KEY, []);
  for (const name of dishNames) {
    const rec = records.find((r) => r.dish_name === name);
    if (rec) {
      rec.times_accepted++;
      rec.times_recommended++;
      // Boost score: acceptance increases preference
      rec.score = Math.min(10, rec.score + 0.3);
    } else {
      records.push({
        dish_name: name,
        score: 6.0,
        times_recommended: 1,
        times_accepted: 1,
        times_rejected: 0,
      });
    }
  }
  setItem(PREF_KEY, records);
}

export function recordRejection(dishNames: string[], reason: string | null): void {
  const records = getItem<PreferenceRecord[]>(PREF_KEY, []);
  for (const name of dishNames) {
    const rec = records.find((r) => r.dish_name === name);
    if (rec) {
      rec.times_rejected++;
      rec.times_recommended++;
      // Penalize score: rejection decreases preference
      // "cooked_recently" is a weaker signal than other rejections
      const penalty = reason === 'cooked_recently' ? 0.1 : 0.4;
      rec.score = Math.max(1, rec.score - penalty);
    } else {
      records.push({
        dish_name: name,
        score: 4.0,
        times_recommended: 1,
        times_accepted: 0,
        times_rejected: 1,
      });
    }
  }
  setItem(PREF_KEY, records);
}

// ─── Reset (for testing) ────────────────────────────────────────

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(PREF_KEY);
}
