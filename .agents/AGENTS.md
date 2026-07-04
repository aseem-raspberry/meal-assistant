# MealAssistant — Project Rules

## What This Project Is

The Household Meal Decision Assistant — an AI-powered system that helps Indian households answer "What should we cook next?" by reducing daily meal decision fatigue. This is NOT a recipe app, a nutrition tracker, or a grocery platform. It is a **decision support engine**.

## Product Documentation

All product decisions, domain models, and design philosophy live in `docs/`. Read them in numbered order:

| File | What It Defines |
|------|----------------|
| `0. Product Blueprint.md` | **Start here.** Vision, 9 principles, anti-goals, roadmap, decision log |
| `1. Problem & Decision Psychology.md` | The problem space and how households actually decide |
| `2. Users, Jobs & Archetypes.md` | JTBD framework, 8 household archetypes, roles |
| `3. Recommendation Framework & Journeys.md` | What a recommendation IS, 10 user journeys |
| `4. Domain Model & Ubiquitous Language.md` | **Reference dictionary.** 36+ entities — use these terms consistently in code |
| `5. AI, Learning & Onboarding.md` | Cold start strategy, learning loop, satisfaction function |
| `6. Architecture & Privacy.md` | System design, on-device vs cloud, privacy principles |
| `7. Business Model & Engagement.md` | Monetization strategy, gamification (deferred) |

## Critical Rules

1. **Use the ubiquitous language.** The domain model (`docs/4.`) defines precise terms: Meal ≠ Dish ≠ Recipe. MealSlot ≠ Meal. Restriction ≠ Preference. Follow these distinctions in code (variable names, types, API endpoints, database schemas).

2. **Household is the primary entity.** Everything belongs to a household. Meals, inventory, preferences, recommendations — all are household-scoped, not user-scoped.

3. **Recommendations are decision objects, not recipe cards.** A recommendation contains: a proposed meal, reasoning, confidence, alternatives, and future meal impact. Recipe instructions are secondary.

4. **AI should observe, not ask.** Minimize forms and questionnaires. Learn from behavior (accepted/rejected recommendations, cooked meals, inventory changes). The exception: dynamic context (who's eating tonight, available time) requires a lightweight daily micro-interaction.

5. **Explainability is mandatory.** Every recommendation must answer "Why this? Why today?" — even if the explanation is a single line.

6. **Privacy first.** Raw photos and voice recordings are processed and deleted. Structured data is stored. See `docs/6.` for full privacy framework.

## Code Conventions

- Keep entity names aligned with `docs/4.` (e.g., `MealSlot`, `CookingEvent`, `DecisionContext`, `FeedbackSignal`, `HouseholdTwin`, `IngredientCategory`, `DietaryProfile`, `LeftoverTransformation`).
- Decision IDs (D-001 through D-053) are referenced across docs. When implementing a feature, note which decision(s) it fulfills in code comments.
- Preserve all existing documentation. Do not modify files in `docs/` unless explicitly asked.
