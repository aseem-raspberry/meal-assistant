'use client';

/**
 * Home Screen — Week-View Calendar
 *
 * Shows a 7-day week with 4 meal slots per day (breakfast, lunch, snack, dinner).
 * Users can navigate between weeks, tap any day to expand its meals, and tap a
 * meal slot to add/edit meals via /log?date=YYYY-MM-DD&slot=<slot>.
 *
 * Each meal card has an inline delete (trash) button calling deleteMeal().
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getHousehold,
  getMealsForDate,
  getDishById,
  deleteMeal,
  initializeDishes,
} from '@/lib/data-layer';
import type { Household, Meal, Dish, MealSlotName } from '@/types/domain';

// ─── Constants ───────────────────────────────────────────────────

const MEAL_SLOTS: { key: MealSlotName; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { key: 'lunch', label: 'Lunch', icon: '🍱' },
  { key: 'snack', label: 'Snack', icon: '🍵' },
  { key: 'dinner', label: 'Dinner', icon: '🍽️' },
];

const SLOT_ACCENT: Record<MealSlotName, string> = {
  breakfast: 'var(--accent-secondary)', // turmeric gold
  lunch: 'var(--accent-success)', // leafy green
  snack: 'var(--accent-info)', // muted blue
  dinner: 'var(--accent-primary)', // warm orange
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Date helpers ────────────────────────────────────────────────

/** Returns YYYY-MM-DD in local time (avoids UTC offset bugs). */
function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns the Date for Sunday of the week containing `d` (00:00 local). */
function getStartOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  date.setDate(date.getDate() - date.getDay());
  return date;
}

/** Returns an array of 7 Dates starting from Sunday. */
function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// ─── Component ───────────────────────────────────────────────────

interface DayMealMap {
  [dateStr: string]: Meal[];
}

export default function CalendarPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(() => getStartOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    toLocalDateStr(new Date())
  );
  const [mealsByDate, setMealsByDate] = useState<DayMealMap>({});
  const [reloadKey, setReloadKey] = useState(0);

  // ─── Init: load household + dishes ───────────────────────────
  useEffect(() => {
    initializeDishes();
    const hh = getHousehold();
    if (!hh) {
      router.push('/onboarding');
      return;
    }
    setHousehold(hh);
    setLoading(false);
  }, [router]);

  // ─── Load meals for the visible week ──────────────────────────
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  useEffect(() => {
    if (!household) return;
    const map: DayMealMap = {};
    for (const d of weekDays) {
      const ds = toLocalDateStr(d);
      map[ds] = getMealsForDate(household.id, ds);
    }
    setMealsByDate(map);
  }, [household, weekDays, reloadKey]);

  // ─── Week navigation ─────────────────────────────────────────
  const goPrevWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const goNextWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const goThisWeek = useCallback(() => {
    setWeekStart(getStartOfWeek(new Date()));
    setSelectedDate(toLocalDateStr(new Date()));
  }, []);

  // ─── Navigation to /log ──────────────────────────────────────
  const navigateToLog = useCallback(
    (date: string, slot: MealSlotName) => {
      router.push(`/log?date=${encodeURIComponent(date)}&slot=${slot}`);
    },
    [router]
  );

  // ─── Delete meal ─────────────────────────────────────────────
  const handleDeleteMeal = useCallback(
    (mealId: string) => {
      deleteMeal(mealId);
      setReloadKey((k) => k + 1);
    },
    []
  );

  // ─── Formatting ──────────────────────────────────────────────
  const weekRangeLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startStr = start.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    const endStr = end.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    const sameMonth = start.getMonth() === end.getMonth();
    return sameMonth
      ? `${start.toLocaleDateString('en-IN', { month: 'short' })} ${start.getDate()} – ${end.getDate()}`
      : `${startStr} – ${endStr}`;
  }, [weekDays]);

  const isThisWeek = useMemo(() => {
    const thisWeekStart = getStartOfWeek(new Date());
    return (
      weekStart.getTime() === thisWeekStart.getTime()
    );
  }, [weekStart]);

  // ─── Get meals for a slot on the selected day ────────────────
  const selectedDayMeals = mealsByDate[selectedDate] ?? [];
  const mealsBySlot = useMemo(() => {
    const map: Partial<Record<MealSlotName, Meal[]>> = {};
    for (const slot of MEAL_SLOTS) {
      map[slot.key] = selectedDayMeals.filter((m) => m.meal_slot === slot.key);
    }
    return map;
  }, [selectedDayMeals]);

  // ─── Resolve dish names for a meal ───────────────────────────
  const getDishNames = useCallback((meal: Meal): string[] => {
    return meal.dish_ids
      .map((id) => getDishById(id)?.name)
      .filter((n): n is string => Boolean(n));
  }, []);

  // ─── Count filled slots for a day ────────────────────────────
  const filledSlotsCount = useCallback(
    (dateStr: string): number => {
      const meals = mealsByDate[dateStr] ?? [];
      const slots = new Set(meals.map((m) => m.meal_slot));
      return slots.size;
    },
    [mealsByDate]
  );

  // ─── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="animate-warm-pulse text-sm"
          style={{ color: 'var(--foreground-muted)' }}
        >
          Loading your week...
        </div>
      </div>
    );
  }

  if (!household) {
    return null; // redirecting to onboarding
  }

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col">
      {/* ─── Header: Household + Week navigation ─── */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              className="text-xs"
              style={{ color: 'var(--foreground-subtle)' }}
            >
              {household.name}
            </p>
            <h1
              className="text-lg font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              Meal Calendar
            </h1>
          </div>
          {!isThisWeek && (
            <button
              onClick={goThisWeek}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--accent-primary)',
              }}
            >
              Today
            </button>
          )}
        </div>

        {/* Week navigation row */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrevWeek}
            aria-label="Previous week"
            className="p-2 rounded-lg transition-all active:scale-95"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="text-center">
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {weekRangeLabel}
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--foreground-subtle)' }}
            >
              {isThisWeek ? 'This week' : ''}
            </p>
          </div>

          <button
            onClick={goNextWeek}
            aria-label="Next week"
            className="p-2 rounded-lg transition-all active:scale-95"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Week strip: 7 day columns ─── */}
      <div
        className="px-2 py-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const dateStr = toLocalDateStr(d);
            const isSelected = dateStr === selectedDate;
            const isToday =
              dateStr === toLocalDateStr(new Date());
            const filled = filledSlotsCount(dateStr);
            const dayNum = d.getDate();
            const weekdayIdx = d.getDay();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all active:scale-95"
                style={{
                  background: isSelected
                    ? 'var(--surface-elevated)'
                    : 'transparent',
                  border: isSelected
                    ? '1px solid var(--accent-primary)'
                    : '1px solid transparent',
                }}
              >
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isSelected
                      ? 'var(--accent-primary)'
                      : 'var(--foreground-subtle)',
                  }}
                >
                  {WEEKDAY_LABELS[weekdayIdx]}
                </span>
                <span
                  className="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full"
                  style={{
                    background: isToday
                      ? 'var(--accent-primary)'
                      : 'transparent',
                    color: isToday
                      ? 'var(--background)'
                      : isSelected
                        ? 'var(--foreground)'
                        : 'var(--foreground-muted)',
                  }}
                >
                  {dayNum}
                </span>
                {/* Slot fill dots */}
                <div className="flex gap-0.5 h-1">
                  {Array.from({ length: 4 }, (_, i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{
                        background:
                          i < filled
                            ? 'var(--accent-success)'
                            : 'var(--border)',
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Selected day: meal slots ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p
          className="text-xs mb-3"
          style={{ color: 'var(--foreground-subtle)' }}
        >
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>

        <div className="space-y-3">
          {MEAL_SLOTS.map((slot) => {
            const slotMeals = mealsBySlot[slot.key] ?? [];
            const hasMeals = slotMeals.length > 0;
            const accent = SLOT_ACCENT[slot.key];

            return (
              <div key={slot.key}>
                {/* Slot header row — tap to add/edit */}
                <button
                  onClick={() => navigateToLog(selectedDate, slot.key)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all active:scale-[0.98] text-left"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: accent }}
                    />
                    <span className="text-base">{slot.icon}</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {slot.label}
                    </span>
                  </div>
                  <span
                    className="text-xs"
                    style={{
                      color: hasMeals
                        ? 'var(--foreground-subtle)'
                        : 'var(--accent-primary)',
                    }}
                  >
                    {hasMeals ? 'Edit' : '+ Add'}
                  </span>
                </button>

                {/* Meal cards for this slot */}
                {hasMeals && (
                  <div className="mt-1.5 space-y-1.5 pl-3">
                    {slotMeals.map((meal) => {
                      const dishNames = getDishNames(meal);
                      return (
                        <div
                          key={meal.id}
                          className="flex items-start gap-2 p-2.5 rounded-lg"
                          style={{
                            background: 'var(--surface-elevated)',
                            border: '1px solid var(--border)',
                            borderLeft: `3px solid ${accent}`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium leading-snug"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {dishNames.length > 0
                                ? dishNames.join(', ')
                                : 'Untitled meal'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  background: 'var(--surface)',
                                  color: 'var(--foreground-subtle)',
                                }}
                              >
                                {meal.source === 'recommended'
                                  ? '✨ Recommended'
                                  : '✍️ Manual'}
                              </span>
                              {meal.dish_ids.length > 1 && (
                                <span
                                  className="text-[10px]"
                                  style={{
                                    color: 'var(--foreground-subtle)',
                                  }}
                                >
                                  {meal.dish_ids.length} dishes
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMeal(meal.id);
                            }}
                            aria-label="Delete meal"
                            className="p-1.5 rounded-md transition-all active:scale-90 flex-shrink-0"
                            style={{
                              color: 'var(--foreground-subtle)',
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M3 4.5H13M6.5 4.5V3C6.5 2.44772 6.94772 2 7.5 2H8.5C9.05228 2 9.5 2.44772 9.5 3V4.5M5 4.5L5.5 13C5.55228 13.5523 6 14 6.5 14H9.5C10 14 10.4477 13.5523 10.5 13L11 4.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
