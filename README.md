# 🍽️ Meal Assistant — Household Meal Decision Assistant

**What should we cook tonight?**

An AI-powered decision support engine that helps Indian households answer this daily question — reducing decision fatigue, not adding another recipe app to your phone.

> This is NOT a recipe app, a calorie tracker, or a grocery platform. It is a **decision support engine** that learns how your household eats and suggests meals you'll actually cook.

---

## Why This Exists

Every day, millions of households ask: *"What should we cook today?"*

The exhausting part isn't cooking — it's **deciding**. The answer depends on available ingredients, family preferences, dietary restrictions, what was cooked recently, available time, weather, mood, and dozens of other variables. The human brain solves this manually. This product assists that process.

**The goal:** Help every household answer "What should we cook next?" with confidence, consistency, and almost no mental effort.

---

## What It Does

### The Core Loop (under 30 seconds)

```
Open app → See tonight's recommendation → Accept or swap → Done
```

1. **Get a recommendation** — A complete meal (main dish + sides) with a 1-3 line explanation of *why*
2. **Check your inventory** — Toggle what ingredients you have; recommendations adapt
3. **Accept or reject** — Accept logs the meal; reject asks a lightweight reason and shows the next alternative
4. **The AI learns** — Every accept/reject improves future recommendations

### Key Features

| Feature | What It Does |
|---------|-------------|
| **Onboarding** | 3 required fields: household size, cuisine region, diet type. Under a minute. |
| **Daily Recommendation** | 1 primary meal (main + 1-2 sides) with explanation, confidence level, and 2 alternatives |
| **Inventory Check** | Quick toggle of 16 common ingredients grouped by category + leftovers input |
| **Meal History** | Chronological list of cooked meals with diversity stats |
| **Recommendation Engine** | Server-side scoring with ingredient repetition tracking and regional meal assembly |
| **Feedback Loop** | Every accept/reject updates household preference scores |

---

## How Recommendations Work

The recommendation engine follows a 9-step pipeline:

1. **Context Assembly** — Inventory, household profile, recent meals, preferences
2. **Candidate Generation** — Filter dishes by cuisine region and diet type
3. **Hard Constraint Filtering** — Remove dishes with allergens or unavailable ingredients
4. **Scoring** — Weighted scoring across 5 factors:
   - Ingredient availability (30%)
   - Variety / ingredient repetition penalty (25%)
   - Household preference history (20%)
   - Effort match (15%)
   - Seasonal fit (10%)
5. **Meal Assembly** — Assemble main dish + sides using Regional Cuisine Profile templates
6. **Explanation Generation** — 1-3 line reasoning (templated or LLM-enhanced)
7. **Confidence Scoring** — Based on how much history the AI has learned from

### Regional Cuisine Profiles

Meals are assembled, not just individual dishes. When the engine recommends **Dal Fry**, the Regional Cuisine Profile determines the pairing:

| Cuisine Region | Meal Structure | Example Pairing |
|---------------|---------------|-----------------|
| North Indian | Roti + Sabzi + Dal + Rice + Salad | Dal Tadka + Jeera Rice + Gobi Paratha |
| South Indian | Rice + Sambar + Poriyal + Curd + Papad | Curd Rice + Moru Kachiyathu + Poriyal |
| Gujarati | Roti + Sabzi + Dal + Rice + Kadhi | Gujarati Kadhi + Rotli + Bhat |
| Maharashtrian | Bhakri + Sabzi + Varan + Bhat | Varan + Bhakri + Koshimbir |
| Punjabi | Roti + Sabzi + Dal + Raita | Dal Fry + Jeera Rice + Boondi Raita |
| Bengali | Rice + Dal + Bhaja + Achar | Cholar Dal + Steamed Rice + Begun Bhaja |

---

## Dish Database

The MVP ships with **120 common Indian dishes** across 6 cuisine regions, each with:

- Ingredients list and ingredient categories (for variety tracking)
- Prep time and effort level (quick / moderate / elaborate)
- Dietary tags (vegetarian, vegan, high protein, comfort food, etc.)
- Meal component classification (main curry, dal, rice, bread, etc.)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 (dark mode, warm food-friendly palette)
- **Backend:** Supabase (schema included; app runs local-first via localStorage for MVP)
- **AI:** Optional LLM integration (Gemini or Claude) for enhanced explanation generation
- **PWA:** Installable, mobile-first responsive design

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 26)
- npm

### Installation

```bash
git clone https://github.com/aseem-raspberry/meal-assistant.git
cd meal-assistant
npm install
```

### Environment Variables

Copy the example file and fill in your keys (optional for MVP — the app works without them):

```bash
cp .env.local.example .env.local
```

```env
# Supabase (optional for MVP — app uses localStorage by default)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# LLM API (optional — enables AI-enhanced explanations)
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
```

### Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be guided through onboarding.

### Production Build

```bash
npm run build
npm run start
```

---

## Database Schema

The full SQL schema is in [`supabase/schema.sql`](supabase/schema.sql). Core tables:

| Table | Purpose |
|-------|---------|
| `households` | Primary entity — name, size, cuisine region, diet type |
| `members` | Household members with allergies and importance weights |
| `dishes` | Seed dish database (120 Indian dishes) |
| `meals` | Eating occasions — what was cooked, when, by whom |
| `recommendations` | The recommendation object — dishes, explanation, confidence, status |
| `feedback_signals` | How the household responded (accepted/rejected/ignored + reason) |
| `inventory` | Available ingredients per household |
| `decision_contexts` | Snapshot of context at recommendation time (for learning) |
| `preferences` | Numeric preference scores per dish (0-10) |
| `restrictions` | Hard constraints (allergies, fasting, dietary rules) |

---

## Project Structure

```
src/
├── types/domain.ts                ← All domain entities (Household, Meal, Dish, MealSlot, etc.)
├── lib/
│   ├── recommendation-engine.ts   ← 9-step scoring & meal assembly pipeline
│   ├── cuisine-profiles.ts        ← Regional Cuisine Profiles (doc 4 §38)
│   ├── seed-dishes.ts             ← 120 Indian dishes with full metadata
│   ├── data-layer.ts              ← Local-first storage (localStorage)
│   └── supabase.ts                ← Supabase client utilities
├── components/
│   ├── DishCard.tsx               ← Dish display component
│   └── ConfidenceIndicator.tsx    ← Subtle confidence display
├── app/
│   ├── page.tsx                   ← Home: daily recommendation
│   ├── onboarding/page.tsx        ← Household setup
│   ├── inventory/page.tsx         ← Quick inventory check
│   ├── history/page.tsx           ← Meal history
│   ├── api/recommend/route.ts     ← Server-side recommendation API
│   ├── layout.tsx                 ← Mobile-first layout
│   └── globals.css                ← Warm dark theme

docs/                              ← Product documentation (8 files, read in order)
supabase/schema.sql                ← Database schema
```

---

## Design Principles

The app follows 9 core product principles from the product blueprint:

1. **Reduce thinking before reducing clicks**
2. **Recommend meals, not recipes**
3. **Optimize households, not individuals**
4. **Learn continuously, never remain static**
5. **Explain every recommendation** — trust is built through transparency
6. **Respect traditions** — technology adapts to households, not vice versa
7. **Every interaction should improve tomorrow's recommendation**
8. **Distinguish static context (learned) from dynamic context (asked)**
9. **Progressive explanation** — single-line default, full reasoning on demand

### Design Language

- **Tone:** Warm, confident, non-judgmental — like advice from a family member
- **Visual:** Dark mode with warm, food-friendly colors (deep brown background, turmeric gold, leafy green)
- **Interaction:** Minimal text input — use toggles, taps, and selections
- **Pacing:** The daily flow takes under 30 seconds

---

## The Learning Loop

```
Recommend → Cook → Observe → Learn → Recommend Better
```

The app tracks:
- **Ingredient frequency** — avoids repeating ingredients too often (not just recipes)
- **Accepted vs. rejected recommendations** — adjusts preference scores
- **Household acceptance patterns** — improves confidence over time

Every rejection is valuable training data. Reasons captured: *too much effort*, *missing ingredient*, *not in the mood*, *already cooked recently*.

---

## Documentation

Full product documentation lives in `docs/` — read in numbered order:

| File | What It Covers |
|------|---------------|
| `0. Product Blueprint.md` | Vision, 9 principles, anti-goals, roadmap |
| `1. Problem & Decision Psychology.md` | Why deciding is harder than cooking |
| `2. Users, Jobs & Archetypes.md` | Who we design for and what progress they seek |
| `3. Recommendation Framework & Journeys.md` | What a recommendation IS, user journeys |
| `4. Domain Model & Ubiquitous Language.md` | Entity definitions (Meal ≠ Dish ≠ Recipe) |
| `5. AI, Learning & Onboarding.md` | Cold start, learning loop, confidence |
| `6. Architecture & Privacy.md` | System design, on-device vs. cloud |
| `7. Business Model & Engagement.md` | Monetization strategy (deferred) |

---

## License

MIT

---

*Built with the philosophy that every household deserves an AI assistant that understands its cooking habits as well as the person who usually plans meals.*
