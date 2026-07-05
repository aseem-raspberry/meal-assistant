/**
 * Preference chips for onboarding Step 2.
 *
 * Common Indian dishes/ingredients that users can tap as "loves" or "won't eat".
 * These are suggestions, not exhaustive — the user taps what applies.
 */

export interface PrefChip {
  label: string;
  emoji: string;
}

// Common dishes/ingredients for preference capture
export const PREFERENCE_CHIPS: PrefChip[] = [
  { label: 'Paneer', emoji: '🧀' },
  { label: 'Dal', emoji: '🥣' },
  { label: 'Rajma', emoji: '🫘' },
  { label: 'Chana', emoji: '🫛' },
  { label: 'Bhindi', emoji: '🟢' },
  { label: 'Aloo', emoji: '🥔' },
  { label: 'Gobi', emoji: '🥦' },
  { label: 'Spinach', emoji: '🥬' },
  { label: 'Brinjal', emoji: '🍆' },
  { label: 'Cabbage', emoji: '🥬' },
  { label: 'Carrot', emoji: '🥕' },
  { label: 'Tomato', emoji: '🍅' },
  { label: 'Chicken', emoji: '🍗' },
  { label: 'Fish', emoji: '🐟' },
  { label: 'Eggs', emoji: '🥚' },
  { label: 'Rice', emoji: '🍚' },
  { label: 'Roti', emoji: '🫓' },
  { label: 'Paratha', emoji: '🥞' },
  { label: 'Khichdi', emoji: '🍲' },
  { label: 'Pulao', emoji: '🍛' },
  { label: 'Poha', emoji: '🥘' },
  { label: 'Upma', emoji: '🥣' },
  { label: 'Dosa', emoji: '🫓' },
  { label: 'Idli', emoji: '⚪' },
];

// Common allergens
export const ALLERGEN_CHIPS: PrefChip[] = [
  { label: 'Peanuts', emoji: '🥜' },
  { label: 'Dairy', emoji: '🥛' },
  { label: 'Shellfish', emoji: '🦐' },
  { label: 'Gluten', emoji: '🌾' },
  { label: 'Soy', emoji: '🫘' },
  { label: 'Eggs', emoji: '🥚' },
  { label: 'Tree Nuts', emoji: '🌰' },
  { label: 'Sesame', emoji: '⚪' },
];
