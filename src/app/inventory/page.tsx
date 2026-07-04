'use client';

/**
 * Inventory Check Screen
 *
 * doc 4 §11: Inventory includes pantry, refrigerator, freezer and leftovers.
 * D-031: Inventory is dynamic and recommendations depend on it.
 *
 * Simple checklist of 15-20 common ingredients grouped by category.
 * Minimize text input — use toggles, taps, and selections (design requirements).
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHousehold, saveInventory, getInventory } from '@/lib/data-layer';
import { INVENTORY_CHECKLIST, ALL_INVENTORY_ITEMS } from '@/lib/cuisine-profiles';
import type { Household } from '@/types/domain';

export default function InventoryPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [leftovers, setLeftovers] = useState('');
  const [showLeftoverInput, setShowLeftoverInput] = useState(false);

  useEffect(() => {
    const hh = getHousehold();
    if (!hh) {
      router.push('/onboarding');
      return;
    }
    setHousehold(hh);

    // Load existing inventory, default to available=true for all
    const existing = getInventory();
    const avail: Record<string, boolean> = {};
    for (const item of ALL_INVENTORY_ITEMS) {
      const existingItem = existing.find((e) => e.ingredient === item);
      avail[item] = existingItem ? existingItem.available : true;
    }
    setAvailability(avail);
  }, [router]);

  const toggleIngredient = (ingredient: string) => {
    setAvailability((prev) => ({
      ...prev,
      [ingredient]: !prev[ingredient],
    }));
  };

  const handleSave = () => {
    if (!household) return;
    saveInventory(household.id, availability);
    // Could also save leftovers — for now just redirect
    router.push('/');
  };

  if (!household) return null;

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
          What&apos;s in the kitchen?
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Toggle what&apos;s available. I&apos;ll use this to suggest meals you can actually cook.
        </p>
      </div>

      {/* Ingredient checklist by category */}
      <div className="flex-1 space-y-6">
        {INVENTORY_CHECKLIST.map((group) => (
          <div key={group.category}>
            <h3
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--accent-secondary)' }}
            >
              {group.category}
            </h3>
            <div className="space-y-2">
              {group.items.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleIngredient(item)}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all active:scale-[0.98]"
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${availability[item] ? 'var(--accent-success)' : 'var(--border)'}`,
                    opacity: availability[item] ? 1 : 0.5,
                  }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: availability[item] ? 'var(--foreground)' : 'var(--foreground-subtle)',
                      textDecoration: availability[item] ? 'none' : 'line-through',
                    }}
                  >
                    {item}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: availability[item] ? 'var(--accent-success)' : 'var(--background)',
                      border: `1px solid ${availability[item] ? 'var(--accent-success)' : 'var(--border)'}`,
                    }}
                  >
                    {availability[item] && (
                      <span style={{ color: 'var(--background)', fontSize: '14px' }}>✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Leftovers section */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Leftovers
          </h3>
          {showLeftoverInput ? (
            <input
              type="text"
              value={leftovers}
              onChange={(e) => setLeftovers(e.target.value)}
              placeholder="e.g., cooked rice, dal from lunch"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            />
          ) : (
            <button
              onClick={() => setShowLeftoverInput(true)}
              className="w-full py-3 rounded-xl text-sm"
              style={{
                background: 'var(--surface)',
                border: '1px dashed var(--border)',
                color: 'var(--foreground-muted)',
              }}
            >
              + Any leftovers to use?
            </button>
          )}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] mt-6"
        style={{
          background: 'var(--accent-primary)',
          color: 'var(--background)',
        }}
      >
        Save & get recommendation
      </button>
    </div>
  );
}
