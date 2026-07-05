/**
 * API Route: Parse free text into structured dishes
 *
 * POST /api/parse-dishes
 *
 * Takes free text like "aloo methi, dal fry, and some rice"
 * and returns structured dish data with inferred metadata.
 *
 * Uses Gemini or Claude LLM for parsing.
 * Falls back to a simple local parser if no API key is configured.
 *
 * Design Revision v2: Free text input is a first-class input method.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SEED_DISHES } from '@/lib/seed-dishes';
import type { ParsedDish, CuisineRegion, MealComponent, IngredientCategory } from '@/types/domain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, cuisine_region } = body as { text: string; cuisine_region?: CuisineRegion };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Try LLM parsing first
    const hasGemini = process.env.GEMINI_API_KEY;
    const hasClaude = process.env.ANTHROPIC_API_KEY;
    const provider = process.env.LLM_PROVIDER;

    let dishes: ParsedDish[];

    if (hasGemini || hasClaude) {
      try {
        dishes = await parseWithLLM(text, cuisine_region, provider, !!hasClaude);
        // If LLM returned nothing, fall back to local parser
        if (dishes.length === 0) {
          dishes = parseLocally(text, cuisine_region);
        }
      } catch {
        dishes = parseLocally(text, cuisine_region);
      }
    } else {
      // No LLM key — use local fuzzy matching against seed DB
      dishes = parseLocally(text, cuisine_region);
    }

    return NextResponse.json({ dishes, raw_text: text });
  } catch (error) {
    console.error('Parse dishes error:', error);
    return NextResponse.json({ error: 'Failed to parse dishes' }, { status: 500 });
  }
}

/**
 * Parse free text using LLM (Gemini or Claude).
 * The LLM identifies dish names, infers ingredients, cuisine, category, and effort.
 */
async function parseWithLLM(
  text: string,
  cuisineRegion: CuisineRegion | undefined,
  provider: string | undefined,
  useClaude: boolean
): Promise<ParsedDish[]> {
  const knownDishes = SEED_DISHES.map((d) => d.name).join(', ');

  const prompt = `You are an expert in Indian cuisine. Parse the following text into individual dishes.

User input: "${text}"
${cuisineRegion ? `Household cuisine region: ${cuisineRegion}` : ''}

Known dishes in our database: ${knownDishes}

For each dish mentioned, return a JSON array with these fields:
- name: the dish name (capitalize properly, e.g., "Aloo Methi" not "aloo methi")
- ingredients: array of main ingredients (strings)
- cuisine: one of "North Indian", "South Indian", "Gujarati", "Maharashtrian", "Punjabi", "Bengali"
- category: one of "main_curry", "dry_vegetable", "rice", "bread", "dal", "dessert", "starter", "side_dish", "pickle", "salad", "drink", "raita", "papad"
- effort_level: 1 (quick, <25 min), 2 (moderate, 25-45 min), or 3 (elaborate, >45 min)
- confidence: 0-1 how sure you are this is a real dish

Return ONLY a valid JSON array. No markdown, no explanation. Example:
[{"name":"Aloo Methi","ingredients":["Potato","Fenugreek","Onion","Tomato","Ginger"],"cuisine":"North Indian","category":"dry_vegetable","effort_level":2,"confidence":0.95}]`;

  if (useClaude && provider === 'claude') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? '[]';
    return JSON.parse(rawText);
  }

  // Gemini
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
      }),
    }
  );
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';

  // Clean up markdown if present
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Local fallback parser — fuzzy matches text against seed DB dish names.
 * No LLM required. Less accurate but works offline.
 */
function parseLocally(text: string, cuisineRegion: CuisineRegion | undefined): ParsedDish[] {
  const words = text.toLowerCase().split(/[,\n]/).map((w) => w.trim()).filter(Boolean);
  const dishes: ParsedDish[] = [];

  for (const word of words) {
    // Try to match against seed DB
    const match = SEED_DISHES.find((d) => {
      const dishName = d.name.toLowerCase();
      // Exact match or the word contains the dish name (or vice versa)
      return (
        dishName === word ||
        word.includes(dishName) ||
        (dishName.includes(word) && word.length > 3)
      );
    });

    if (match) {
      dishes.push({
        name: match.name,
        ingredients: match.ingredients,
        cuisine: match.cuisine as CuisineRegion,
        category: match.category as MealComponent,
        effort_level: match.effort_level,
        confidence: 0.8,
        existing_dish_id: `dish-${SEED_DISHES.indexOf(match) + 1}`,
      });
    } else {
      // Unknown dish — create a basic entry
      // Capitalize the name
      const name = word
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      dishes.push({
        name,
        ingredients: [],
        cuisine: cuisineRegion ?? 'North Indian',
        category: 'main_curry',
        effort_level: 2,
        confidence: 0.4,
      });
    }
  }

  return dishes;
}
