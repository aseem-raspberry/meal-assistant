'use client';

/**
 * Onboarding Screen — Household Setup
 *
 * D-039: Onboarding captures no more than three required data points:
 *        household size, cuisine region, diet type.
 * D-040: Day One recommendations use population priors.
 * D-042: Progressive profiling through natural interactions, not forms.
 *
 * Optional: member names and allergies (first week progressive).
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createHousehold,
  addMember,
  initializeDishes,
} from '@/lib/data-layer';
import type { CuisineRegion, DietType } from '@/types/domain';

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Required fields (D-039)
  const [name, setName] = useState('');
  const [size, setSize] = useState(2);
  const [cuisineRegion, setCuisineRegion] = useState<CuisineRegion>('North Indian');
  const [dietType, setDietType] = useState<DietType>('vegetarian');

  // Optional fields
  const [members, setMembers] = useState<{ name: string; allergies: string }[]>([]);
  const [showOptional, setShowOptional] = useState(false);

  useEffect(() => {
    initializeDishes();
  }, []);

  const handleComplete = () => {
    const household = createHousehold({
      name: name || 'Our Household',
      size,
      cuisine_region: cuisineRegion,
      diet_type: dietType,
    });

    // Save optional members
    for (const m of members) {
      if (m.name.trim()) {
        addMember(household.id, {
          name: m.name.trim(),
          allergies: m.allergies
            ? m.allergies.split(',').map((a) => a.trim()).filter(Boolean)
            : [],
        });
      }
    }

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
          style={{
            background: 'var(--accent-primary)',
            color: 'var(--background)',
          }}
        >
          Let&apos;s get started
        </button>
        <p className="text-xs mt-4" style={{ color: 'var(--foreground-subtle)' }}>
          Takes less than a minute
        </p>
      </div>
    );
  }

  // ─── Step 1: Household basics ────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <button
            onClick={() => setStep(0)}
            className="text-sm mb-4"
            style={{ color: 'var(--foreground-subtle)' }}
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            Tell me about your household
          </h2>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Just the basics — I&apos;ll learn the rest as we go.
          </p>
        </div>

        {/* Household name */}
        <div className="mb-5">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
            Household name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sharma Family"
            className="w-full px-4 py-3 rounded-xl text-base"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        {/* Household size */}
        <div className="mb-5">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
            How many people?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, '6+'].map((n) => (
              <button
                key={n}
                onClick={() => setSize(typeof n === 'number' ? n : 6)}
                className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{
                  background:
                    size === (typeof n === 'number' ? n : 6)
                      ? 'var(--accent-primary)'
                      : 'var(--surface)',
                  color:
                    size === (typeof n === 'number' ? n : 6)
                      ? 'var(--background)'
                      : 'var(--foreground-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine region */}
        <div className="mb-5">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
            Cuisine region
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CUISINE_REGIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setCuisineRegion(c.value)}
                className="py-3 px-3 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{
                  background:
                    cuisineRegion === c.value
                      ? 'var(--accent-primary)'
                      : 'var(--surface)',
                  color:
                    cuisineRegion === c.value
                      ? 'var(--background)'
                      : 'var(--foreground-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diet type */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>
            Dietary preference
          </label>
          <div className="space-y-2">
            {DIET_TYPES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDietType(d.value)}
                className="w-full py-3 px-4 rounded-xl text-left transition-all active:scale-[0.98]"
                style={{
                  background:
                    dietType === d.value
                      ? 'var(--accent-primary)'
                      : 'var(--surface)',
                  color:
                    dietType === d.value
                      ? 'var(--background)'
                      : 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="font-semibold text-sm">{d.label}</div>
                <div
                  className="text-xs"
                  style={{
                    color: dietType === d.value ? 'var(--background)' : 'var(--foreground-subtle)',
                  }}
                >
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] mt-auto"
          style={{
            background: 'var(--accent-primary)',
            color: 'var(--background)',
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // ─── Step 2: Optional members ────────────────────────────────
  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-6">
        <button
          onClick={() => setStep(1)}
          className="text-sm mb-4"
          style={{ color: 'var(--foreground-subtle)' }}
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
          Family members <span className="text-sm font-normal" style={{ color: 'var(--foreground-subtle)' }}>(optional)</span>
        </h2>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Add names and allergies. Skip this — I&apos;ll learn preferences over time.
        </p>
      </div>

      {members.map((m, i) => (
        <div key={i} className="mb-3 p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={m.name}
              onChange={(e) => {
                const updated = [...members];
                updated[i].name = e.target.value;
                setMembers(updated);
              }}
              placeholder={`Member ${i + 1} name`}
              className="flex-1 px-3 py-2.5 rounded-lg text-sm"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            />
            <button
              onClick={() => setMembers(members.filter((_, idx) => idx !== i))}
              className="px-3 rounded-lg text-sm"
              style={{ color: 'var(--accent-danger)' }}
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            value={m.allergies}
            onChange={(e) => {
              const updated = [...members];
              updated[i].allergies = e.target.value;
              setMembers(updated);
            }}
            placeholder="Allergies (comma separated, e.g., nuts, dairy)"
            className="w-full mt-2 px-3 py-2.5 rounded-lg text-sm"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
      ))}

      <button
        onClick={() => setMembers([...members, { name: '', allergies: '' }])}
        className="w-full py-3 rounded-xl text-sm font-medium mb-6"
        style={{
          background: 'var(--surface)',
          border: '1px dashed var(--border)',
          color: 'var(--foreground-muted)',
        }}
      >
        + Add member
      </button>

      <div className="mt-auto space-y-2">
        <button
          onClick={handleComplete}
          className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
          style={{
            background: 'var(--accent-primary)',
            color: 'var(--background)',
          }}
        >
          {members.length > 0 ? 'Complete setup' : 'Skip for now'}
        </button>
        {members.length === 0 && (
          <button
            onClick={handleComplete}
            className="w-full py-2 text-sm"
            style={{ color: 'var(--foreground-subtle)' }}
          >
            I&apos;ll add this later
          </button>
        )}
      </div>
    </div>
  );
}
