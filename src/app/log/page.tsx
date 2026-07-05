'use client';

/**
 * Meal Logging Screen — /log
 *
 * Design Revision v2: A first-class meal logging screen with 3 input modes:
 *   1. Photo upload → AI dish recognition (vision model)
 *   2. Free text → LLM parsing into structured dishes
 *   3. Browse known dishes → multi-select from seed DB + custom dishes
 *
 * This is the foundation of the learning loop. If logging is easy,
 * the AI has data to learn from.
 *
 * D-047: Photos are processed for structured data and then deleted.
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getHousehold,
  getDishesForHousehold,
  createCustomDish,
  addMeal,
  recordAcceptance,
} from '@/lib/data-layer';
import type { Household, Dish, ParsedDish, MealSlotName } from '@/types/domain';
import { DishCard } from '@/components/DishCard';

type LogMode = 'photo' | 'text' | 'browse';

export default function LogMealPage() {
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [mode, setMode] = useState<LogMode>('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Text mode
  const [text, setText] = useState('');
  const [parsedDishes, setParsedDishes] = useState<ParsedDish[] | null>(null);

  // Photo mode
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Browse mode
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDishIds, setSelectedDishIds] = useState<Set<string>>(new Set());

  // Common: meal metadata
  const [mealSlot, setMealSlot] = useState<MealSlotName>('dinner');
  const [confirmedDishes, setConfirmedDishes] = useState<Dish[]>([]);

  useEffect(() => {
    const hh = getHousehold();
    if (!hh) {
      router.push('/onboarding');
      return;
    }
    setHousehold(hh);
    setAllDishes(getDishesForHousehold(hh.id).sort((a, b) => a.name.localeCompare(b.name)));
  }, [router]);

  // ─── Text mode: parse ────────────────────────────────────────
  const handleParseText = async () => {
    if (!text.trim() || !household) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/parse-dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, cuisine_region: household.cuisine_region }),
      });
      const data = await response.json();
      setParsedDishes(data.dishes || []);
    } catch {
      setError('Could not parse — check your connection and try again.');
    }
    setLoading(false);
  };

  // ─── Photo mode: upload + recognize ──────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      // Extract base64 data (strip the data URL prefix)
      const base64 = result.split(',')[1];
      setPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRecognizePhoto = async () => {
    if (!photoBase64 || !household) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recognize-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: photoBase64, cuisine_region: household.cuisine_region }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setParsedDishes([]);
      } else {
        // Convert recognized dishes to ParsedDish format
        setParsedDishes(data.dishes || []);
        if (!data.dishes || data.dishes.length === 0) {
          setError('Could not identify dishes — try text or browse mode.');
        }
      }
    } catch {
      setError('Could not recognize photo — try text or browse mode.');
    }
    setLoading(false);
  };

  // ─── Confirm parsed dishes → create custom dishes if needed ──
  const handleConfirmParsed = () => {
    if (!household || !parsedDishes) return;
    const dishes: Dish[] = [];
    for (const parsed of parsedDishes) {
      // Check if dish already exists in DB
      const existing = allDishes.find(
        (d) => d.name.toLowerCase() === parsed.name.toLowerCase()
      );
      if (existing) {
        dishes.push(existing);
      } else {
        // Create custom dish with AI-inferred metadata
        const custom = createCustomDish(household.id, {
          name: parsed.name,
          cuisine: parsed.cuisine,
          category: parsed.category,
          prep_time_minutes: parsed.effort_level === 1 ? 20 : parsed.effort_level === 2 ? 35 : 55,
          ingredients: parsed.ingredients,
          ingredient_categories: inferCategories(parsed.ingredients) as Dish['ingredient_categories'],
          dietary_tags: household.diet_type === 'vegetarian' ? ['vegetarian'] : [],
          effort_level: parsed.effort_level,
          ai_inferred: true,
        });
        dishes.push(custom);
      }
    }
    setConfirmedDishes(dishes);
  };

  // ─── Browse mode: toggle dish selection ───────────────────────
  const toggleDishSelection = (dishId: string) => {
    setSelectedDishIds((prev) => {
      const next = new Set(prev);
      if (next.has(dishId)) next.delete(dishId);
      else next.add(dishId);
      return next;
    });
  };

  // ─── Final: log the meal ─────────────────────────────────────
  const handleLogMeal = (inputMethod: 'manual_text' | 'manual_photo' | 'manual_browse') => {
    if (!household) return;

    let dishesToLog: Dish[] = confirmedDishes;

    if (inputMethod === 'manual_browse') {
      dishesToLog = allDishes.filter((d) => selectedDishIds.has(d.id));
    }

    if (dishesToLog.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    addMeal(
      household.id,
      today,
      mealSlot,
      dishesToLog.map((d) => d.id),
      'manual',
      inputMethod,
      inputMethod === 'manual_photo'
    );

    // Update preference scores for logged dishes
    recordAcceptance(dishesToLog.map((d) => d.name));

    router.push('/');
  };

  if (!household) return null;

  const filteredDishes = allDishes.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Confirmation screen ─────────────────────────────────────
  if (confirmedDishes.length > 0) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <button onClick={() => setConfirmedDishes([])} className="text-sm mb-2" style={{ color: 'var(--foreground-subtle)' }}>← Back</button>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Log this meal</h2>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Does this look right?</p>
        </div>

        {/* Meal slot selector */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--foreground)' }}>Which meal?</label>
          <div className="flex gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlotName[]).map((slot) => (
              <button key={slot} onClick={() => setMealSlot(slot)}
                className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all active:scale-95"
                style={{ background: mealSlot === slot ? 'var(--accent-primary)' : 'var(--surface)', color: mealSlot === slot ? 'var(--background)' : 'var(--foreground-muted)', border: '1px solid var(--border)' }}>
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes */}
        <div className="flex-1 space-y-2">
          {confirmedDishes.map((dish, i) => (
            <DishCard key={dish.id} dish={dish} isPrimary={i === 0} />
          ))}
        </div>

        <button
          onClick={() => handleLogMeal(mode === 'photo' ? 'manual_photo' : mode === 'text' ? 'manual_text' : 'manual_browse')}
          className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] mt-6"
          style={{ background: 'var(--accent-success)', color: 'var(--background)' }}>
          ✓ Log this meal
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="mb-4">
        <button onClick={() => router.push('/')} className="text-sm mb-2" style={{ color: 'var(--foreground-subtle)' }}>← Back</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Log a meal</h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>What did you cook?</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        {(['text', 'photo', 'browse'] as LogMode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setParsedDishes(null); setError(null); }}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all active:scale-95"
            style={{
              background: mode === m ? 'var(--accent-primary)' : 'var(--surface)',
              color: mode === m ? 'var(--background)' : 'var(--foreground-muted)',
              border: '1px solid var(--border)',
            }}>
            {m === 'text' ? '✏️ Text' : m === 'photo' ? '📸 Photo' : '🔍 Browse'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)' }}>
          {error}
        </div>
      )}

      {/* ─── Text mode ──────────────────────────────────────── */}
      {mode === 'text' && (
        <div className="flex-1 flex flex-col">
          <textarea value={text} onChange={(e) => { setText(e.target.value); setParsedDishes(null); }}
            placeholder={"e.g.,\naloo methi, dal fry, and some rice\npaneer butter masala with roti"}
            rows={5} autoFocus
            className="w-full px-4 py-3 rounded-xl text-sm resize-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />

          <button onClick={handleParseText} disabled={!text.trim() || loading}
            className="w-full py-3 rounded-xl text-sm font-medium mt-3 transition-all active:scale-[0.98]"
            style={{ background: loading ? 'var(--surface)' : 'var(--accent-secondary)', color: 'var(--background)', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'Parsing...' : '✨ Parse my meals'}
          </button>

          {parsedDishes && (
            <div className="mt-4 space-y-2 flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>I found {parsedDishes.length} dish{parsedDishes.length !== 1 ? 'es' : ''}:</p>
              {parsedDishes.map((dish, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{dish.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: dish.confidence > 0.7 ? 'var(--accent-success)' : 'var(--accent-secondary)', color: 'var(--background)' }}>
                      {Math.round(dish.confidence * 100)}%
                    </span>
                  </div>
                  {dish.ingredients.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--foreground-subtle)' }}>{dish.ingredients.join(', ')}</p>
                  )}
                </div>
              ))}
              <button onClick={handleConfirmParsed}
                className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
                style={{ background: 'var(--accent-success)', color: 'var(--background)' }}>
                Looks right — log it
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Photo mode ────────────────────────────────────── */}
      {mode === 'photo' && (
        <div className="flex-1 flex flex-col">
          {photoPreview ? (
            <div>
              <img src={photoPreview} alt="Meal preview" className="w-full rounded-xl max-h-64 object-cover" />
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setPhotoPreview(null); setPhotoBase64(null); setParsedDishes(null); }}
                  className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}>
                  Retake
                </button>
                <button onClick={handleRecognizePhoto} disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--accent-secondary)', color: 'var(--background)', opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Recognizing...' : '✨ Recognize'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center rounded-xl py-16"
              style={{ background: 'var(--surface)', border: '2px dashed var(--border)' }}>
              <span className="text-4xl mb-3">📸</span>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Take or upload a photo</span>
              <span className="text-xs mt-1" style={{ color: 'var(--foreground-subtle)' }}>of what you cooked</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />

          {parsedDishes && parsedDishes.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>I see:</p>
              {parsedDishes.map((dish, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{dish.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: dish.confidence > 0.7 ? 'var(--accent-success)' : 'var(--accent-secondary)', color: 'var(--background)' }}>
                      {Math.round(dish.confidence * 100)}%
                    </span>
                  </div>
                  {dish.ingredients.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--foreground-subtle)' }}>{dish.ingredients.join(', ')}</p>
                  )}
                </div>
              ))}
              <button onClick={handleConfirmParsed}
                className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
                style={{ background: 'var(--accent-success)', color: 'var(--background)' }}>
                Looks right — log it
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Browse mode ───────────────────────────────────── */}
      {mode === 'browse' && (
        <div className="flex-1 flex flex-col">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes..." className="w-full px-4 py-3 rounded-xl text-sm mb-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[50vh]">
            {filteredDishes.map((dish) => {
              const selected = selectedDishIds.has(dish.id);
              return (
                <button key={dish.id} onClick={() => toggleDishSelection(dish.id)}
                  className="w-full text-left p-3 rounded-xl transition-all active:scale-[0.98]"
                  style={{
                    background: selected ? 'var(--surface-elevated)' : 'var(--surface)',
                    border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--border)'}`,
                  }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{dish.name}</span>
                      <span className="text-xs ml-2" style={{ color: 'var(--foreground-subtle)' }}>{dish.cuisine} · {dish.prep_time_minutes}min</span>
                    </div>
                    {selected && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedDishIds.size > 0 && (
            <button
              onClick={() => {
                const dishes = allDishes.filter((d) => selectedDishIds.has(d.id));
                setConfirmedDishes(dishes);
              }}
              className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98] mt-3"
              style={{ background: 'var(--accent-success)', color: 'var(--background)' }}>
              Log {selectedDishIds.size} dish{selectedDishIds.size !== 1 ? 'es' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function inferCategories(ingredients: string[]): string[] {
  const categoryMap: Record<string, string> = {
    potato: 'root_vegetables', onion: 'root_vegetables', carrot: 'root_vegetables',
    tomato: 'root_vegetables', spinach: 'leafy_greens', palak: 'leafy_greens',
    methi: 'leafy_greens', paneer: 'dairy', milk: 'dairy', curd: 'dairy',
    ghee: 'oils_and_fats', oil: 'oils_and_fats', rice: 'grains',
    'wheat flour': 'grains',
    'toor dal': 'legumes', 'moong dal': 'legumes',
    rajma: 'legumes', chana: 'legumes',
    chicken: 'proteins', fish: 'proteins', eggs: 'proteins',
  };
  const categories = new Set<string>();
  for (const ing of ingredients) {
    const cat = categoryMap[ing.toLowerCase()];
    if (cat) categories.add(cat);
    else categories.add('other');
  }
  return [...categories] as any;
}
