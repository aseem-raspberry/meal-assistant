'use client';

/**
 * Home Screen — Daily Recommendation
 *
 * The core loop (doc 3 §13):
 *   Uncertainty → Need a meal → Receive recommendation →
 *   Understand reasoning → Choose confidently → Cook →
 *   Lightweight feedback → AI learns → Better tomorrow
 *
 * D-024: Every recommendation must be explainable.
 * D-013: Confidence determines assertiveness.
 * D-035: Every rejection is valuable learning.
 * D-038: Reduce time and mental effort to reach confident decision.
 *
 * Target: open → see recommendation → accept or swap → done in under 30 seconds.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getHousehold,
  getDishes,
  getDishesForHousehold,
  getRecentMeals,
  getAvailableIngredients,
  getAllergies,
  saveRecommendation,
  getTodayRecommendation,
  updateRecommendationStatus,
  addMeal,
  addFeedbackSignal,
  recordAcceptance,
  recordRejection,
  getPreferences,
  initializeDishes,
} from '@/lib/data-layer';
import {
  generateRecommendation,
  buildIngredientUsageMap,
  type RecommendationContext,
} from '@/lib/recommendation-engine';
import type {
  Household,
  Dish,
  Recommendation,
  RecommendationResult,
  ScoredDish,
  RejectionReason,
} from '@/types/domain';
import { DishCard } from '@/components/DishCard';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';

const REJECTION_REASONS: { value: RejectionReason; label: string; icon: string }[] = [
  { value: 'too_much_effort', label: 'Too much effort', icon: '😅' },
  { value: 'missing_ingredient', label: 'Missing ingredient', icon: '🥕' },
  { value: 'not_in_mood', label: 'Not in the mood', icon: '🤔' },
  { value: 'cooked_recently', label: 'Already cooked recently', icon: '🔁' },
  { value: 'other', label: 'Other reason', icon: '✏️' },
];

export default function HomePage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [currentRec, setCurrentRec] = useState<Recommendation | null>(null);
  const [altIndex, setAltIndex] = useState(0); // 0=primary, 1=alt1, 2=alt2
  const [showRejection, setShowRejection] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  // Initialize and load data
  useEffect(() => {
    initializeDishes();
    const hh = getHousehold();
    if (!hh) {
      router.push('/onboarding');
      return;
    }
    setHousehold(hh);

    // Check if we already have a recommendation for today
    const existingRec = getTodayRecommendation(hh.id);
    if (existingRec && existingRec.status === 'accepted') {
      // Already accepted today — show the meal
      setCurrentRec(existingRec);
      setLoading(false);
      return;
    }

    // Generate recommendation
    generateRec(hh);
    setLoading(false);
  }, [router]);

  const generateRec = (hh: Household) => {
    const dishes = getDishesForHousehold(hh.id);
    const recentMeals = getRecentMeals(14);
    const availableIngredients = getAvailableIngredients();
    const allergies = getAllergies();
    const preferences = getPreferences();

    // Build ingredient usage map (D-009)
    const recentIngredientUsage = buildIngredientUsageMap(recentMeals, dishes);

    const context: RecommendationContext = {
      household: hh,
      availableIngredients,
      recentMeals,
      recentIngredientUsage,
      dishes,
      preferences,
      allergies,
      leftovers: null,
      availableTimeMinutes: null,
    };

    const recResult = generateRecommendation(context);
    setResult(recResult);

    // Save recommendation to storage
    const today = new Date().toISOString().split('T')[0];
    const rec: Recommendation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      household_id: hh.id,
      date: today,
      meal_slot: 'dinner',
      recommended_dishes: recResult.primary.map((s) => s.dish.id),
      explanation: recResult.explanation,
      confidence: recResult.confidence,
      status: 'ignored',
      decision_context_id: '',
      alternatives: recResult.alternatives.map((alt) => alt.map((s) => s.dish.id)),
      categories: recResult.categories,
      created_at: new Date().toISOString(),
    };
    saveRecommendation(rec);
    setCurrentRec(rec);
    setAltIndex(0);
  };

  // ─── Get current meal to display ──────────────────────────────
  const getCurrentMeal = (): ScoredDish[] | null => {
    if (!result) return null;
    if (altIndex === 0) return result.primary;
    if (altIndex === 1 && result.alternatives[0]) return result.alternatives[0];
    if (altIndex === 2 && result.alternatives[1]) return result.alternatives[1];
    return result.primary;
  };

  // ─── Accept recommendation ────────────────────────────────────
  const handleAccept = () => {
    if (!currentRec || !household) return;
    const meal = getCurrentMeal();
    if (!meal) return;

    // Update recommendation status
    updateRecommendationStatus(currentRec.id, 'accepted');

    // Log as a meal (D-028: meals belong to household)
    const today = new Date().toISOString().split('T')[0];
    addMeal(household.id, today, 'dinner', meal.map((s) => s.dish.id), 'recommended');

    // Record feedback signal (D-033c)
    addFeedbackSignal(currentRec.id, currentRec.decision_context_id, 'accepted', null);

    // Update preferences — learning loop (D- Principle 7)
    recordAcceptance(meal.map((s) => s.dish.name));

    // Update local state
    setCurrentRec({ ...currentRec, status: 'accepted' });
  };

  // ─── Reject recommendation ────────────────────────────────────
  const handleReject = (reason: RejectionReason) => {
    if (!currentRec || !household) return;
    const meal = getCurrentMeal();
    if (!meal) return;

    // Update recommendation status
    updateRecommendationStatus(currentRec.id, 'rejected');

    // Record feedback signal (D-035: every rejection is valuable learning)
    addFeedbackSignal(currentRec.id, currentRec.decision_context_id, 'rejected', reason);

    // Update preferences — rejection decreases preference
    recordRejection(meal.map((s) => s.dish.name), reason);

    // Show next alternative if available
    const nextAlt = altIndex + 1;
    if (result && nextAlt <= result.alternatives.length) {
      setAltIndex(nextAlt);
      setShowRejection(false);
    } else {
      // No more alternatives — regenerate
      generateRec(household);
      setShowRejection(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-warm-pulse text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Thinking about tonight...
          </div>
        </div>
      </div>
    );
  }

  // ─── No household ─────────────────────────────────────────────
  if (!household) {
    return null; // redirecting
  }

  // ─── Already accepted today ──────────────────────────────────
  if (currentRec?.status === 'accepted') {
    const meal = getCurrentMeal();
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Tonight&apos;s sorted!
          </h2>
          {meal && (
            <div className="space-y-2 mt-4 w-full">
              {meal.map((s, i) => (
                <DishCard key={s.dish.id} dish={s.dish} isPrimary={i === 0} />
              ))}
            </div>
          )}
          <p className="text-sm mt-6" style={{ color: 'var(--foreground-muted)' }}>
            Enjoy your dinner. I&apos;ll have a fresh suggestion tomorrow.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <Link
            href="/history"
            className="block w-full py-3 rounded-xl text-sm font-medium text-center"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
            }}
          >
            View meal history
          </Link>
        </div>
      </div>
    );
  }

  // ─── No recommendation generated ──────────────────────────────
  if (!result || !currentRec) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p style={{ color: 'var(--foreground-muted)' }}>
          Having trouble generating a recommendation. Try checking your inventory.
        </p>
        <button
          onClick={() => router.push('/inventory')}
          className="mt-4 px-6 py-3 rounded-xl font-medium"
          style={{ background: 'var(--accent-primary)', color: 'var(--background)' }}
        >
          Check inventory
        </button>
      </div>
    );
  }

  const meal = getCurrentMeal();

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            {household.name}
          </h1>
        </div>
        <Link
          href="/inventory"
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--foreground-muted)',
          }}
        >
          🥕 Inventory
        </Link>
      </div>

      {/* Recommendation card */}
      {meal && (
        <div className="animate-fade-in-up flex-1 flex flex-col">
          {/* Explanation */}
          <div
            className="mb-4 p-4 rounded-xl"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
              {result.explanation}
            </p>
            <div className="mt-3">
              <ConfidenceIndicator
                confidence={result.confidence}
                mealCount={household ? getRecentMeals(14).length : 0}
              />
            </div>
          </div>

          {/* Dishes */}
          <div className="space-y-2 flex-1">
            {meal.map((s, i) => (
              <DishCard key={s.dish.id} dish={s.dish} isPrimary={i === 0} />
            ))}
          </div>

          {/* Alternatives indicator */}
          {altIndex < result.alternatives.length && (
            <p className="text-xs text-center mt-3" style={{ color: 'var(--foreground-subtle)' }}>
              {altIndex === 0 ? '2 alternatives available' : `${result.alternatives.length - altIndex} more alternative${result.alternatives.length - altIndex !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      )}

      {/* Rejection reason picker */}
      {showRejection ? (
        <div className="mt-4 space-y-2 animate-fade-in-up">
          <p className="text-sm text-center mb-3" style={{ color: 'var(--foreground-muted)' }}>
            No worries — what&apos;s the reason?
          </p>
          {REJECTION_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => handleReject(r.value)}
              className="w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-3"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <span className="text-lg">{r.icon}</span>
              {r.label}
            </button>
          ))}
          <button
            onClick={() => setShowRejection(false)}
            className="w-full py-2 text-sm"
            style={{ color: 'var(--foreground-subtle)' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        /* Action buttons */
        <div className="mt-4 space-y-2">
          <button
            onClick={handleAccept}
            className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
            style={{
              background: 'var(--accent-success)',
              color: 'var(--background)',
            }}
          >
            ✓ Cook this tonight
          </button>
          <button
            onClick={() => setShowRejection(true)}
            className="w-full py-3.5 rounded-xl font-medium text-base transition-all active:scale-[0.98]"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
            }}
          >
            Not today
          </button>
          <div className="flex gap-2 pt-2">
            <Link
              href="/log"
              className="flex-1 py-2.5 rounded-xl text-xs text-center font-medium"
              style={{
                background: 'var(--accent-secondary)',
                color: 'var(--background)',
              }}
            >
              📝 Log a meal
            </Link>
            <Link
              href="/history"
              className="flex-1 py-2.5 rounded-xl text-xs text-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground-subtle)',
              }}
            >
              📖 History
            </Link>
            <button
              onClick={() => household && generateRec(household)}
              className="flex-1 py-2.5 rounded-xl text-xs"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground-subtle)',
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
