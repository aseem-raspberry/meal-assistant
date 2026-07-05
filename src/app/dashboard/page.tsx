'use client';

/**
 * Dashboard Screen — Meal Analytics
 *
 * Visualizes cooking insights derived from logged meals:
 * - Most cooked dishes (horizontal bar chart)
 * - Veg vs Non-veg ratio (donut-style)
 * - Cuisine distribution (horizontal bar chart)
 * - Meal slot distribution (vertical bar chart)
 * - Ingredient variety (top ingredients)
 * - Cooking effort trends (grouped bars)
 *
 * All charts are built with plain divs and CSS — no chart library.
 * All colors use CSS custom properties via inline styles.
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getHousehold,
  getMeals,
  getDishById,
  initializeDishes,
  getPreferenceRecords,
  type PreferenceRecord,
} from '@/lib/data-layer';
import type { Household, Meal, Dish, MealSlotName } from '@/types/domain';

// ─── Constants ──────────────────────────────────────────────────

const SLOT_LABELS: Record<MealSlotName, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const SLOT_COLORS: Record<MealSlotName, string> = {
  breakfast: 'var(--accent-secondary)',
  lunch: 'var(--accent-info)',
  dinner: 'var(--accent-primary)',
  snack: 'var(--accent-success)',
};

const EFFORT_LABELS: Record<number, string> = {
  1: 'Quick',
  2: 'Moderate',
  3: 'Elaborate',
};

const EFFORT_COLORS: Record<number, string> = {
  1: 'var(--accent-success)',
  2: 'var(--accent-secondary)',
  3: 'var(--accent-danger)',
};

// ─── Helper components ──────────────────────────────────────────

/** A card container with surface background and border */
function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs mb-3" style={{ color: 'var(--foreground-subtle)' }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

/** Horizontal bar row for bar charts */
function BarRow({
  label,
  count,
  max,
  color = 'var(--accent-primary)',
  showCount = true,
}: {
  label: string;
  count: number;
  max: number;
  color?: string;
  showCount?: boolean;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-medium truncate"
          style={{ color: 'var(--foreground-muted)', maxWidth: '60%' }}
        >
          {label}
        </span>
        {showCount && (
          <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
            {count}
          </span>
        )}
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ background: 'var(--background)', height: '8px' }}
      >
        <div
          className="rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, height: '100%', background: color }}
        />
      </div>
    </div>
  );
}

/** Donut segment for the veg/non-veg ratio */
function RatioDonut({
  vegCount,
  nonVegCount,
}: {
  vegCount: number;
  nonVegCount: number;
}) {
  const total = vegCount + nonVegCount;
  if (total === 0) {
    return (
      <p className="text-xs text-center py-4" style={{ color: 'var(--foreground-subtle)' }}>
        No dishes logged yet
      </p>
    );
  }
  const vegPct = Math.round((vegCount / total) * 100);
  const nonVegPct = 100 - vegPct;

  return (
    <div className="flex items-center gap-4">
      {/* Donut visual */}
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{
          width: '80px',
          height: '80px',
          background: `conic-gradient(var(--accent-success) 0% ${vegPct}%, var(--accent-danger) ${vegPct}% 100%)`,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: '56px',
            height: '56px',
            background: 'var(--surface)',
          }}
        >
          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {total}
          </span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: 'var(--accent-success)' }}
          />
          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Veg
          </span>
          <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--foreground)' }}>
            {vegPct}% ({vegCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: 'var(--accent-danger)' }}
          />
          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Non-Veg
          </span>
          <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--foreground)' }}>
            {nonVegPct}% ({nonVegCount})
          </span>
        </div>
      </div>
    </div>
  );
}

/** Vertical bar for meal slot distribution */
function SlotBars({
  data,
}: {
  data: { slot: MealSlotName; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end justify-around gap-2" style={{ height: '100px' }}>
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={d.slot} className="flex-1 flex flex-col items-center gap-1">
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {d.count > 0 ? d.count : ''}
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.max(pct, 2)}%`,
                background: SLOT_COLORS[d.slot],
                minHeight: d.count > 0 ? '4px' : '0',
              }}
            />
            <span
              className="text-xs"
              style={{ color: 'var(--foreground-subtle)' }}
            >
              {SLOT_LABELS[d.slot].slice(0, 2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page component ────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [preferences, setPreferences] = useState<PreferenceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDishes();
    const hh = getHousehold();
    if (!hh) {
      router.push('/onboarding');
      return;
    }
    setHousehold(hh);
    setMeals(getMeals().filter((m) => m.household_id === hh.id));
    setPreferences(getPreferenceRecords());
    setLoading(false);
  }, [router]);

  // ─── Resolve dishes from meal data ────────────────────────────
  const dishMap = useMemo(() => {
    const map = new Map<string, Dish>();
    for (const meal of meals) {
      for (const id of meal.dish_ids) {
        if (!map.has(id)) {
          const dish = getDishById(id);
          if (dish) map.set(id, dish);
        }
      }
    }
    return map;
  }, [meals]);

  // ─── Compute analytics ────────────────────────────────────────
  const analytics = useMemo(() => {
    // Most cooked dishes
    const dishCountMap = new Map<string, number>();
    for (const meal of meals) {
      for (const id of meal.dish_ids) {
        dishCountMap.set(id, (dishCountMap.get(id) ?? 0) + 1);
      }
    }
    const topDishes = [...dishCountMap.entries()]
      .map(([id, count]) => ({
        dish: dishMap.get(id),
        count,
      }))
      .filter((d): d is { dish: Dish; count: number } => d.dish !== undefined)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Veg vs Non-Veg
    let vegCount = 0;
    let nonVegCount = 0;
    for (const meal of meals) {
      for (const id of meal.dish_ids) {
        const dish = dishMap.get(id);
        if (!dish) continue;
        if (dish.dietary_tags.includes('non-vegetarian')) {
          nonVegCount++;
        } else {
          vegCount++;
        }
      }
    }

    // Cuisine distribution
    const cuisineMap = new Map<string, number>();
    for (const meal of meals) {
      for (const id of meal.dish_ids) {
        const dish = dishMap.get(id);
        if (!dish) continue;
        cuisineMap.set(dish.cuisine, (cuisineMap.get(dish.cuisine) ?? 0) + 1);
      }
    }
    const cuisineData = [...cuisineMap.entries()]
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count);

    // Meal slot distribution
    const slotMap = new Map<MealSlotName, number>();
    (['breakfast', 'lunch', 'dinner', 'snack'] as MealSlotName[]).forEach((s) =>
      slotMap.set(s, 0)
    );
    for (const meal of meals) {
      slotMap.set(meal.meal_slot, (slotMap.get(meal.meal_slot) ?? 0) + 1);
    }
    const slotData = (['breakfast', 'lunch', 'dinner', 'snack'] as MealSlotName[]).map(
      (s) => ({ slot: s, count: slotMap.get(s) ?? 0 })
    );

    // Ingredient variety
    const ingredientMap = new Map<string, number>();
    for (const meal of meals) {
      for (const id of meal.dish_ids) {
        const dish = dishMap.get(id);
        if (!dish) continue;
        for (const ing of dish.ingredients) {
          ingredientMap.set(ing, (ingredientMap.get(ing) ?? 0) + 1);
        }
      }
    }
    const topIngredients = [...ingredientMap.entries()]
      .map(([ingredient, count]) => ({ ingredient, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Cooking effort trends — count dishes by effort level per meal slot
    const effortTrends: { effort: number; label: string; count: number }[] = [
      { effort: 1, label: EFFORT_LABELS[1], count: 0 },
      { effort: 2, label: EFFORT_LABELS[2], count: 0 },
      { effort: 3, label: EFFORT_LABELS[3], count: 0 },
    ];
    for (const meal of meals) {
      for (const id of meal.dish_ids) {
        const dish = dishMap.get(id);
        if (!dish) continue;
        const trend = effortTrends.find((e) => e.effort === dish.effort_level);
        if (trend) trend.count++;
      }
    }

    // Effort by week — last 4 weeks
    const now = new Date();
    const weeks: { label: string; quick: number; moderate: number; elaborate: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];
      const weekMeals = meals.filter((m) => m.date >= startStr && m.date <= endStr);
      let quick = 0, moderate = 0, elaborate = 0;
      for (const meal of weekMeals) {
        for (const id of meal.dish_ids) {
          const dish = dishMap.get(id);
          if (!dish) continue;
          if (dish.effort_level === 1) quick++;
          else if (dish.effort_level === 2) moderate++;
          else elaborate++;
        }
      }
      weeks.push({
        label: w === 0 ? 'This wk' : `${w}wk ago`,
        quick,
        moderate,
        elaborate,
      });
    }

    return {
      topDishes,
      vegCount,
      nonVegCount,
      cuisineData,
      slotData,
      topIngredients,
      effortTrends,
      weeks,
      totalDishes: dishCountMap.size,
      totalMeals: meals.length,
      totalIngredients: ingredientMap.size,
    };
  }, [meals, dishMap]);

  // ─── Render ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-warm-pulse text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Loading insights...
        </div>
      </div>
    );
  }

  if (!household) return null;

  // Empty state
  if (meals.length === 0) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm"
            style={{ color: 'var(--foreground-subtle)' }}
          >
            ← Back
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            No data to analyze yet
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
            Log a few meals and your cooking insights will appear here.
          </p>
          <Link
            href="/log"
            className="px-6 py-3 rounded-xl font-medium text-sm"
            style={{ background: 'var(--accent-secondary)', color: 'var(--background)' }}
          >
            📝 Log a meal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-sm mb-4"
          style={{ color: 'var(--foreground-subtle)' }}
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
          Cooking Insights
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          {analytics.totalMeals} meals · {analytics.totalDishes} unique dishes · {analytics.totalIngredients} ingredients
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {/* Most Cooked Dishes */}
        {analytics.topDishes.length > 0 && (
          <Card title="Most Cooked Dishes" subtitle="Your go-to recipes">
            {analytics.topDishes.map(({ dish, count }) => (
              <BarRow
                key={dish.id}
                label={dish.name}
                count={count}
                max={analytics.topDishes[0].count}
                color="var(--accent-primary)"
              />
            ))}
          </Card>
        )}

        {/* Veg vs Non-Veg Ratio */}
        <Card title="Dietary Balance" subtitle="Vegetarian vs non-vegetarian">
          <RatioDonut vegCount={analytics.vegCount} nonVegCount={analytics.nonVegCount} />
        </Card>

        {/* Cuisine Distribution */}
        {analytics.cuisineData.length > 0 && (
          <Card title="Cuisine Distribution" subtitle="Regional spread of your cooking">
            {analytics.cuisineData.map(({ cuisine, count }) => (
              <BarRow
                key={cuisine}
                label={cuisine}
                count={count}
                max={analytics.cuisineData[0].count}
                color="var(--accent-info)"
              />
            ))}
          </Card>
        )}

        {/* Meal Slot Distribution */}
        <Card title="Meal Slot Distribution" subtitle="When you cook the most">
          <SlotBars data={analytics.slotData} />
        </Card>

        {/* Ingredient Variety */}
        {analytics.topIngredients.length > 0 && (
          <Card title="Ingredient Variety" subtitle="Most used ingredients">
            {analytics.topIngredients.map(({ ingredient, count }) => (
              <BarRow
                key={ingredient}
                label={ingredient}
                count={count}
                max={analytics.topIngredients[0].count}
                color="var(--accent-success)"
              />
            ))}
          </Card>
        )}

        {/* Cooking Effort Trends */}
        <Card title="Cooking Effort Trends" subtitle="Last 4 weeks by effort level">
          {/* Overall breakdown */}
          <div className="flex gap-2 mb-4">
            {analytics.effortTrends.map((trend) => (
              <div
                key={trend.effort}
                className="flex-1 rounded-lg p-2 text-center"
                style={{ background: 'var(--surface-elevated)' }}
              >
                <div
                  className="w-2 h-2 rounded-full mx-auto mb-1"
                  style={{ background: EFFORT_COLORS[trend.effort] }}
                />
                <div className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                  {trend.label}
                </div>
                <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {trend.count}
                </div>
              </div>
            ))}
          </div>

          {/* Weekly stacked bars */}
          <div className="flex items-end justify-around gap-2" style={{ height: '80px' }}>
            {analytics.weeks.map((week, i) => {
              const total = week.quick + week.moderate + week.elaborate;
              const maxWeek = Math.max(
                ...analytics.weeks.map((w) => w.quick + w.moderate + w.elaborate),
                1
              );
              const totalPct = (total / maxWeek) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                    {total > 0 ? total : ''}
                  </span>
                  <div
                    className="w-full rounded-t-md overflow-hidden flex flex-col-reverse transition-all duration-500"
                    style={{
                      height: `${Math.max(totalPct, 2)}%`,
                      minHeight: total > 0 ? '4px' : '0',
                    }}
                  >
                    {week.elaborate > 0 && (
                      <div
                        style={{
                          background: EFFORT_COLORS[3],
                          height: `${(week.elaborate / total) * 100}%`,
                        }}
                      />
                    )}
                    {week.moderate > 0 && (
                      <div
                        style={{
                          background: EFFORT_COLORS[2],
                          height: `${(week.moderate / total) * 100}%`,
                        }}
                      />
                    )}
                    {week.quick > 0 && (
                      <div
                        style={{
                          background: EFFORT_COLORS[1],
                          height: `${(week.quick / total) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                    {week.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Preference Insights */}
        {preferences.length > 0 && (
          <Card title="Preference Insights" subtitle="Acceptance rate by dish">
            {preferences
              .sort((a, b) => {
                const aRate = a.times_recommended > 0 ? a.times_accepted / a.times_recommended : 0;
                const bRate = b.times_recommended > 0 ? b.times_accepted / b.times_recommended : 0;
                return bRate - aRate;
              })
              .slice(0, 5)
              .map((pref) => {
                const rate =
                  pref.times_recommended > 0
                    ? Math.round((pref.times_accepted / pref.times_recommended) * 100)
                    : 0;
                return (
                  <div key={pref.dish_name} className="mb-2 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-medium truncate"
                        style={{ color: 'var(--foreground-muted)', maxWidth: '50%' }}
                      >
                        {pref.dish_name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                        {pref.times_accepted}/{pref.times_recommended} · {rate}%
                      </span>
                    </div>
                    <div
                      className="rounded-full overflow-hidden"
                      style={{ background: 'var(--background)', height: '6px' }}
                    >
                      <div
                        className="rounded-full transition-all duration-500"
                        style={{
                          width: `${rate}%`,
                          height: '100%',
                          background:
                            rate >= 70
                              ? 'var(--accent-success)'
                              : rate >= 40
                              ? 'var(--accent-secondary)'
                              : 'var(--accent-danger)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </Card>
        )}
      </div>
    </div>
  );
}
