'use client';

/**
 * Meal History Screen
 *
 * doc 4 §6: A meal is an eating occasion.
 * D-028: Meals belong to households.
 * doc 3 §17: Meal Diversity is a quality metric.
 *
 * Simple list of what was cooked each day.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getHousehold, getMeals, getDishById } from '@/lib/data-layer';
import type { Household, Meal, Dish } from '@/types/domain';

export default function HistoryPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dishCache, setDishCache] = useState<Map<string, Dish>>(new Map());

  useEffect(() => {
    const hh = getHousehold();
    if (!hh) {
      router.push('/onboarding');
      return;
    }
    setHousehold(hh);

    const allMeals = getMeals()
      .filter((m) => m.household_id === hh.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMeals(allMeals);

    // Build dish cache
    const cache = new Map<string, Dish>();
    for (const meal of allMeals) {
      for (const dishId of meal.dish_ids) {
        if (!cache.has(dishId)) {
          const dish = getDishById(dishId);
          if (dish) cache.set(dishId, dish);
        }
      }
    }
    setDishCache(cache);
  }, [router]);

  if (!household) return null;

  // Group meals by date
  const mealsByDate = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  const sortedDates = Object.keys(mealsByDate).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

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
          Meal History
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          {meals.length} meal{meals.length !== 1 ? 's' : ''} cooked so far
        </p>
      </div>

      {/* Empty state */}
      {meals.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-4">🍳</div>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            No meals logged yet. Log what you cooked to start your history.
          </p>
          <Link
            href="/log"
            className="mt-4 px-6 py-3 rounded-xl font-medium text-sm"
            style={{ background: 'var(--accent-secondary)', color: 'var(--background)' }}
          >
            📝 Log a meal
          </Link>
        </div>
      )}

      {/* Meal history list */}
      <div className="flex-1 space-y-4">
        {sortedDates.map((date) => {
          const dateMeals = mealsByDate[date];
          const dateObj = new Date(date);
          const isToday = date === new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isYesterday = date === yesterday.toISOString().split('T')[0];

          let dateLabel: string;
          if (isToday) dateLabel = 'Today';
          else if (isYesterday) dateLabel = 'Yesterday';
          else dateLabel = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

          return (
            <div key={date}>
              <h3
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--accent-secondary)' }}
              >
                {dateLabel}
              </h3>
              <div className="space-y-2">
                {dateMeals.map((meal) => {
                  const dishes = meal.dish_ids
                    .map((id) => dishCache.get(id))
                    .filter((d): d is Dish => d !== undefined);

                  return (
                    <div
                      key={meal.id}
                      className="rounded-xl p-4"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium uppercase" style={{ color: 'var(--foreground-subtle)' }}>
                          {meal.meal_slot}
                        </span>
                        <div className="flex gap-1.5">
                          {meal.input_method === 'manual_photo' && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-secondary)', color: 'var(--background)' }}>
                              📸 Photo
                            </span>
                          )}
                          {meal.input_method === 'manual_text' && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-info)', color: 'var(--background)' }}>
                              ✏️ Text
                            </span>
                          )}
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: meal.source === 'recommended'
                                ? 'var(--accent-secondary)'
                                : 'var(--surface-elevated)',
                              color: meal.source === 'recommended'
                                ? 'var(--background)'
                                : 'var(--foreground-subtle)',
                            }}
                          >
                            {meal.source === 'recommended' ? '✨ AI' : '✋ Manual'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {dishes.map((dish) => (
                          <div
                            key={dish.id}
                            className="flex items-center justify-between"
                          >
                            <span
                              className="text-sm font-medium"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {dish.name}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: 'var(--foreground-subtle)' }}
                            >
                              {dish.prep_time_minutes} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      {meals.length > 0 && (
        <div
          className="mt-6 p-4 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-secondary)' }}>
            RECENT TRENDS
          </h4>
          <div className="space-y-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
            <p>Meals this week: {meals.filter((m) => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(m.date) >= weekAgo;
            }).length}</p>
            <p>
              Unique dishes tried: {new Set(meals.flatMap((m) => m.dish_ids)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
