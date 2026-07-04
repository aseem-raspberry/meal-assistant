-- ═══════════════════════════════════════════════════════════════════════
-- Household Meal Decision Assistant — Database Schema
-- Entity names aligned with docs/4. Domain Model & Ubiquitous Language
-- ═══════════════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Households (doc 4 §4) ──────────────────────────────────────
-- D-027: Household is the primary domain entity.
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 2,
  cuisine_region TEXT NOT NULL DEFAULT 'North Indian',
  diet_type TEXT NOT NULL DEFAULT 'vegetarian',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Household Members (doc 4 §5) ───────────────────────────────
-- Members participate in meals but do not own them (D-028).
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  diet_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  importance_weight NUMERIC DEFAULT 1.0, -- participation-adjusted (D-045)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Dishes (doc 4 §7) ──────────────────────────────────────────
-- D-029: Recipes are implementation details supporting dishes.
-- The recommendation engine recommends dishes, not recipes.
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  cuisine TEXT NOT NULL,
  category TEXT NOT NULL, -- MealComponent
  prep_time_minutes INTEGER NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  ingredient_categories TEXT[] NOT NULL DEFAULT '{}',
  dietary_tags TEXT[] NOT NULL DEFAULT '{}',
  effort_level INTEGER NOT NULL DEFAULT 2, -- 1=quick, 2=moderate, 3=elaborate
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dishes_cuisine ON dishes(cuisine);
CREATE INDEX idx_dishes_category ON dishes(category);
CREATE INDEX idx_dishes_dietary_tags ON dishes USING GIN(dietary_tags);

-- ─── Meals (doc 4 §6) ───────────────────────────────────────────
-- A meal is an eating occasion. Meals belong to households (D-028).
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_slot TEXT NOT NULL DEFAULT 'dinner', -- breakfast, lunch, dinner, snack
  dish_ids UUID[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual', -- 'recommended' | 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meals_household_date ON meals(household_id, date DESC);

-- ─── Recommendations (doc 4 §25, doc 3 §2) ──────────────────────
-- D-022: Recommendation is the central product object.
-- D-023: Recommendations optimize expected household satisfaction.
-- D-024: Every recommendation must be explainable.
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_slot TEXT NOT NULL DEFAULT 'dinner',
  recommended_dishes UUID[] NOT NULL DEFAULT '{}',
  explanation TEXT NOT NULL DEFAULT '',
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'ignored', -- accepted, rejected, ignored
  decision_context_id UUID,
  alternatives UUID[][] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rec_household_date ON recommendations(household_id, date DESC);

-- ─── Feedback Signals (doc 4 §36) ───────────────────────────────
-- D-033c: Feedback Signals are the primary fuel for the learning loop.
CREATE TABLE feedback_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  decision_context_id UUID,
  signal_type TEXT NOT NULL, -- accepted, modified, rejected, ignored, saved, liked, disliked
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_rec ON feedback_signals(recommendation_id);

-- ─── Inventory (doc 4 §11) ──────────────────────────────────────
-- D-031: Inventory includes pantry, refrigerator, freezer and leftovers.
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, ingredient)
);

CREATE INDEX idx_inventory_household ON inventory(household_id);

-- ─── Restrictions (doc 4 §21) ───────────────────────────────────
-- D-032: Restrictions are hard constraints (vs preferences = soft).
CREATE TABLE restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  is_permanent BOOLEAN DEFAULT true
);

-- ─── Preferences (doc 4 §20) ────────────────────────────────────
-- D-032: Preferences are soft constraints. Numeric scores.
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 5.0 -- 0-10 scale
);

CREATE INDEX idx_prefs_household ON preferences(household_id);

-- ─── Decision Contexts (doc 4 §31) ──────────────────────────────
-- D-033a: Decision Context is a first-class entity linked to every recommendation.
CREATE TABLE decision_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_slot TEXT NOT NULL DEFAULT 'dinner',
  inventory_snapshot JSONB,
  active_restrictions TEXT[] DEFAULT '{}',
  available_time_minutes INTEGER,
  members_present TEXT[] DEFAULT '{}',
  weather TEXT,
  day_of_week TEXT,
  season TEXT,
  recent_meal_history TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
