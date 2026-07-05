'use client';

/**
 * Onboarding Screen v2 — Household Setup (Revised)
 *
 * Design Revision v2: 5-step onboarding for better Day 1 experience.
 *   0. Welcome
 *   1. Household basics (name, size, cuisine, diet)
 *   2. Family + preferences (members, loves/dislikes, allergens)
 *   3. What's in your kitchen? (baseline inventory)
 *   4. What did you cook recently? (seed meal history)
 *
 * Philosophy: 60 extra seconds of taps for recommendations
 * that feel personal from Day 1.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createHousehold,
  addMember,
  saveInventory,
  saveOnboardingPreferences,
  initializeDishes,
} from '@/lib/data-layer';
import { INVENTORY_CHECKLIST, ALL_INVENTORY_ITEMS } from '@/lib/cuisine-profiles';
import { PREFERENCE_CHIPS, ALLERGEN_CHIPS } from '@/lib/preference-chips';
import type { CuisineRegion, DietType, ParsedDish } from '@/types/domain';

const CUISINE_REGIONS: { value: CuisineRegion; label: string }[] = [
  { value: 'North Indian', label: 'North Indian' },
  { value: 'South Indian', label: 'South Indian' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Maharashtrian', label: 'Maharashtrian' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Bengali', label: 'Bengali' },
];

const DIET_TYPES: { value: DietType; label: string; desc: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', desc: 'No meat or eggs' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian', desc: 'Eat everything' },
  { value: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian + eggs' },
  { value: 'vegan', label: 'Vegan', desc: 'No animal products' },
];

interface MemberData {
  name: string;
  loves: string[];
  dislikes: string[];
  allergies: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1: Household basics
  const [name, setName] = useState('');
  const [size, setSize] = useState(2);
  const [cuisineRegion, setCuisineRegion] = useState<CuisineRegion>('North Indian');
  const [dietType, setDietType] = useState<DietType>('vegetarian');

  // Step 2: Family + preferences
  const [members, setMembers] = useState<MemberData[]>([]);
  const [activeMemberIdx, setActiveMemberIdx] = useState(0);

  // Step 3: Inventory
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  // Step 4: Recent meals
  const [recentMealsText, setRecentMealsText] = useState('');
  const [parsedDishes, setParsedDishes] = useState<ParsedDish[] | null>(null);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    initializeDishes();
    // Initialize availability to all true
    const avail: Record<string, boolean> = {};
    ALL_INVENTORY_ITEMS.forEach((item) => (avail[item] = true));
    setAvailability(avail);
  }, []);

  const toggleChip = (
    memberIdx: number,
    field: 'loves' | 'dislikes',
    chip: string
  ) => {
    setMembers((prev) => {
      const updated = [...prev];
      const member = updated[memberIdx];
      const list = member[field];
      if (list.includes(chip)) {
        member[field] = list.filter((c) => c !== chip);
      } else {
        member[field] = [...list, chip];
      }
      return updated;
    });
  };

  const toggleAllergen = (memberIdx: number, allergen: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      const member = updated[memberIdx];
      if (member.allergies.includes(allergen)) {
        member.allergies = member.allergies.filter((a) => a !== allergen);
      } else {
        member.allergies = [...member.allergies, allergen];
      }
      return updated;
    });
  };

  const toggleIngredient = (ingredient: string) => {
    setAvailability((prev) => ({ ...prev, [ingredient]: !prev[ingredient] }));
  };

  const handleParseRecentMeals = async () => {
    if (!recentMealsText.trim()) return;
    setParsing(true);
    try {
      const response = await fetch('/api/parse-dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: recentMealsText, cuisine_region: cuisineRegion }),
      });
      const data = await response.json();
      setParsedDishes(data.dishes || []);
    } catch {
      setParsedDishes([]);
    }
    setParsing(false);
  };

  const handleComplete = () => {
    const household = createHousehold({
      name: name || 'Our Household',
      size,
      cuisine_region: cuisineRegion,
      diet_type: dietType,
    });

    // Save members with allergies
    for (const m of members) {
      if (m.name.trim()) {
        addMember(household.id, {
          name: m.name.trim(),
          allergies: m.allergies,
        });
      }
    }

    // Save onboarding preferences (loves/dislikes)
    saveOnboardingPreferences(household.id, {
      members: members.filter((m) => m.name.trim()).map((m) => ({
        name: m.name.trim(),
        loves: m.loves,
        dislikes: m.dislikes,
      })),
    });

    // Save inventory
    saveInventory(household.id, availability);

    router.push('/');
  };

  // ─── Step 0: Welcome ─────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Meal Assistant
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            What should we cook tonight?
          </p>
          <p className="text-xs mt-4 max-w-xs" style={{ color: 'var(--foreground-subtle)' }}>
            Let&apos;s end the daily decision fatigue. I&apos;ll learn your household&apos;s
            preferences and suggest meals you&apos;ll actually cook.
          </p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
          style={{ background: 'var(--accent-primary)', color: 'var(--background)' }}
        >
          Let&apos;s get started
        </button>
        <p className="text-xs mt-4" style={{ color: 'var(--foreground-subtle)' }}>
          Takes about 2 minutes
        </p>
      </div>
    );
  }

  // ─── Step 1: Household basics ────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <ProgressDots step={1} total={4} />
        <div className="mb-6 mt-4">
          <button onClick={() => setStep(0)} className="text-sm mb-2" style={{ color: 'var(--foreground-subtle)' }}>← Back</button>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Tell me about your household</h2>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Just the basics — I&apos;ll learn the rest as we go.</p>
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Household name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sharma Family"
            className="w-full px-4 py-3 rounded-xl text-base" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>How many people?</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, '6+'].map((n) => (
              <button key={n} onClick={() => setSize(typeof n === 'number' ? n : 6)}
                className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{ background: size === (typeof n === 'number' ? n : 6) ? 'var(--accent-primary)' : 'var(--surface)', color: size === (typeof n === 'number' ? n : 6) ? 'var(--background)' : 'var(--foreground-muted)', border: '1px solid var(--border)' }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Cuisine region</label>
          <div className="grid grid-cols-2 gap-2">
            {CUISINE_REGIONS.map((c) => (
              <button key={c.value} onClick={() => setCuisineRegion(c.value)}
                className="py-3 px-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ background: cuisineRegion === c.value ? 'var(--accent-primary)' : 'var(--surface)', color: cuisineRegion === c.value ? 'var(--background)' : 'var(--foreground-muted)', border: '1px solid var(--border)' }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Dietary preference</label>
          <div className="space-y-2">
            {DIET_TYPES.map((d) => (
              <button key={d.value} onClick={() => setDietType(d.value)}
                className="w-full py-3 px-4 rounded-xl text-left transition-all active:scale-[0.98]"
                style={{ background: dietType === d.value ? 'var(--accent-primary)' : 'var(--surface)', color: dietType === d.value ? 'var(--background)' : 'var(--foreground)', border: '1px solid var(--border)' }}>
                <div className="font-semibold text-sm">{d.label}</div>
                <div className="text-xs" style={{ color: dietType === d.value ? 'var(--background)' : 'var(--foreground-subtle)' }}>{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] mt-auto"
          style={{ background: 'var(--accent-primary)', color: 'var(--background)' }}>
          Continue
        </button>
      </div>
    );
  }

  // ─── Step 2: Family + preferences ────────────────────────────
  if (step === 2) {
    const activeMember = members[activeMemberIdx];

    return (
      <div className="flex-1 flex flex-col p-6">
        <ProgressDots step={2} total={4} />
        <div className="mb-4 mt-4">
          <button onClick={() => setStep(1)} className="text-sm mb-2" style={{ color: 'var(--foreground-subtle)' }}>← Back</button>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Who&apos;s at the table?</h2>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Tap what each person loves and won&apos;t eat. Skip anyone you don&apos;t want to add.</p>
        </div>

        {/* Member tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {members.map((m, i) => (
            <button key={i} onClick={() => setActiveMemberIdx(i)}
              className="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
              style={{ background: activeMemberIdx === i ? 'var(--accent-primary)' : 'var(--surface)', color: activeMemberIdx === i ? 'var(--background)' : 'var(--foreground-muted)', border: '1px solid var(--border)' }}>
              {m.name || `Person ${i + 1}`}
            </button>
          ))}
          <button onClick={() => { setMembers([...members, { name: '', loves: [], dislikes: [], allergies: [] }]); setActiveMemberIdx(members.length); }}
            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap"
            style={{ background: 'var(--surface)', border: '1px dashed var(--border)', color: 'var(--foreground-muted)' }}>
            + Add
          </button>
        </div>

        {activeMember ? (
          <div className="flex-1 space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Name</label>
              <input type="text" value={activeMember.name}
                onChange={(e) => { const updated = [...members]; updated[activeMemberIdx].name = e.target.value; setMembers(updated); }}
                placeholder="e.g., Aarav"
                className="w-full px-4 py-3 rounded-xl text-base" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </div>

            {/* Loves */}
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--accent-success)' }}>❤️ Loves</p>
              <div className="flex flex-wrap gap-2">
                {PREFERENCE_CHIPS.map((chip) => {
                  const selected = activeMember.loves.includes(chip.label);
                  return (
                    <button key={chip.label} onClick={() => toggleChip(activeMemberIdx, 'loves', chip.label)}
                      className="px-3 py-1.5 rounded-full text-sm transition-all active:scale-95"
                      style={{
                        background: selected ? 'var(--accent-success)' : 'var(--surface)',
                        color: selected ? 'var(--background)' : 'var(--foreground-muted)',
                        border: `1px solid ${selected ? 'var(--accent-success)' : 'var(--border)'}`,
                      }}>
                      {chip.emoji} {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Won't eat */}
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--accent-danger)' }}>🚫 Won&apos;t eat</p>
              <div className="flex flex-wrap gap-2">
                {PREFERENCE_CHIPS.map((chip) => {
                  const selected = activeMember.dislikes.includes(chip.label);
                  return (
                    <button key={chip.label} onClick={() => toggleChip(activeMemberIdx, 'dislikes', chip.label)}
                      className="px-3 py-1.5 rounded-full text-sm transition-all active:scale-95"
                      style={{
                        background: selected ? 'var(--accent-danger)' : 'var(--surface)',
                        color: selected ? 'var(--background)' : 'var(--foreground-muted)',
                        border: `1px solid ${selected ? 'var(--accent-danger)' : 'var(--border)'}`,
                      }}>
                      {chip.emoji} {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--accent-secondary)' }}>⚠️ Allergies</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGEN_CHIPS.map((chip) => {
                  const selected = activeMember.allergies.includes(chip.label);
                  return (
                    <button key={chip.label} onClick={() => toggleAllergen(activeMemberIdx, chip.label)}
                      className="px-3 py-1.5 rounded-full text-sm transition-all active:scale-95"
                      style={{
                        background: selected ? 'var(--accent-secondary)' : 'var(--surface)',
                        color: selected ? 'var(--background)' : 'var(--foreground-muted)',
                        border: `1px solid ${selected ? 'var(--accent-secondary)' : 'var(--border)'}`,
                      }}>
                      {chip.emoji} {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Tap &quot;+ Add&quot; to add a family member. Or skip this step.</p>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <button onClick={() => setStep(3)} className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
            style={{ background: 'var(--accent-primary)', color: 'var(--background)' }}>
            Continue
          </button>
          <button onClick={() => setStep(3)} className="w-full py-2 text-sm" style={{ color: 'var(--foreground-subtle)' }}>
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 3: Inventory ───────────────────────────────────────
  if (step === 3) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <ProgressDots step={3} total={4} />
        <div className="mb-6 mt-4">
          <button onClick={() => setStep(2)} className="text-sm mb-2" style={{ color: 'var(--foreground-subtle)' }}>← Back</button>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>What&apos;s in your kitchen?</h2>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Toggle what you usually have. I&apos;ll only suggest meals you can actually cook.</p>
        </div>

        <div className="flex-1 space-y-6">
          {INVENTORY_CHECKLIST.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--accent-secondary)' }}>{group.category}</h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <button key={item} onClick={() => toggleIngredient(item)}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all active:scale-[0.98]"
                    style={{ background: 'var(--surface)', border: `1px solid ${availability[item] ? 'var(--accent-success)' : 'var(--border)'}`, opacity: availability[item] ? 1 : 0.5 }}>
                    <span className="text-sm font-medium" style={{ color: availability[item] ? 'var(--foreground)' : 'var(--foreground-subtle)', textDecoration: availability[item] ? 'none' : 'line-through' }}>{item}</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: availability[item] ? 'var(--accent-success)' : 'var(--background)', border: `1px solid ${availability[item] ? 'var(--accent-success)' : 'var(--border)'}` }}>
                      {availability[item] && <span style={{ color: 'var(--background)', fontSize: '14px' }}>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setStep(4)} className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] mt-6"
          style={{ background: 'var(--accent-primary)', color: 'var(--background)' }}>
          Continue
        </button>
      </div>
    );
  }

  // ─── Step 4: Recent meals ────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col p-6">
      <ProgressDots step={4} total={4} />
      <div className="mb-6 mt-4">
        <button onClick={() => setStep(3)} className="text-sm mb-2" style={{ color: 'var(--foreground-subtle)' }}>← Back</button>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>What did you cook recently?</h2>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>This helps me avoid suggesting repeats and learn your style from Day 1.</p>
      </div>

      <div className="flex-1">
        <textarea value={recentMealsText} onChange={(e) => { setRecentMealsText(e.target.value); setParsedDishes(null); }}
          placeholder={"e.g.,\ndal chawal, paneer butter masala\nbhindi, roti\nchicken curry, rice"}
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />

        <button onClick={handleParseRecentMeals} disabled={!recentMealsText.trim() || parsing}
          className="w-full py-3 rounded-xl text-sm font-medium mt-3 transition-all active:scale-[0.98]"
          style={{ background: parsing ? 'var(--surface)' : 'var(--accent-secondary)', color: 'var(--background)', opacity: parsing ? 0.5 : 1 }}>
          {parsing ? 'Parsing...' : '✨ Parse my meals'}
        </button>

        {/* Parsed results */}
        {parsedDishes && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>I found:</p>
            {parsedDishes.length > 0 ? (
              parsedDishes.map((dish, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{dish.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: dish.confidence > 0.7 ? 'var(--accent-success)' : 'var(--accent-secondary)', color: 'var(--background)' }}>
                      {Math.round(dish.confidence * 100)}% match
                    </span>
                  </div>
                  {dish.ingredients.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--foreground-subtle)' }}>
                      {dish.ingredients.join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>Couldn&apos;t parse — I&apos;ll learn as you log meals.</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <button onClick={handleComplete} className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
          style={{ background: 'var(--accent-primary)', color: 'var(--background)' }}>
          {parsedDishes && parsedDishes.length > 0 ? 'Looks good — finish setup' : 'Finish setup'}
        </button>
        <button onClick={handleComplete} className="w-full py-2 text-sm" style={{ color: 'var(--foreground-subtle)' }}>
          Skip — I&apos;ll log meals as I go
        </button>
      </div>
    </div>
  );
}

// ─── Progress Dots ──────────────────────────────────────────────

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full"
          style={{ background: i < step ? 'var(--accent-primary)' : 'var(--border)' }} />
      ))}
    </div>
  );
}
