/**
 * API Route: Generate Recommendation
 *
 * POST /api/recommend
 *
 * Server-side recommendation generation following the 9-step pipeline.
 * Optionally uses LLM API (Gemini/Claude) for enhanced explanation.
 *
 * D-022: Recommendation is the central product object.
 * D-024: Every recommendation must be explainable.
 * D-026: Recommendation confidence is first-class output.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateRecommendation,
  buildIngredientUsageMap,
  type RecommendationContext,
} from '@/lib/recommendation-engine';
import type { Household, Dish, Meal, CuisineRegion, DietType } from '@/types/domain';
import { SEED_DISHES } from '@/lib/seed-dishes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      household,
      availableIngredients,
      recentMeals,
      allergies,
      preferences,
      availableTimeMinutes,
      leftovers,
    } = body;

    // Convert dishes from seed data
    const dishes: Dish[] = SEED_DISHES.map((seed, index) => ({
      id: `dish-${index + 1}`,
      name: seed.name,
      cuisine: seed.cuisine as CuisineRegion,
      category: seed.category as Dish['category'],
      prep_time_minutes: seed.prep_time_minutes,
      ingredients: seed.ingredients,
      ingredient_categories: seed.ingredient_categories as Dish['ingredient_categories'],
      dietary_tags: seed.dietary_tags,
      effort_level: seed.effort_level,
      created_at: new Date().toISOString(),
    }));

    const hh: Household = {
      ...household,
      cuisine_region: household.cuisine_region as CuisineRegion,
      diet_type: household.diet_type as DietType,
      created_at: household.created_at ?? new Date().toISOString(),
      updated_at: household.updated_at ?? new Date().toISOString(),
    };

    const recentIngredientUsage = buildIngredientUsageMap(
      recentMeals as Meal[],
      dishes
    );

    const context: RecommendationContext = {
      household: hh,
      availableIngredients: new Set(availableIngredients as string[]),
      recentMeals: recentMeals as Meal[],
      recentIngredientUsage,
      dishes,
      preferences: new Map(Object.entries(preferences || {})),
      allergies: allergies || [],
      leftovers: leftovers || null,
      availableTimeMinutes: availableTimeMinutes ?? null,
    };

    const result = generateRecommendation(context);

    // Optionally enhance explanation with LLM
    let enhancedExplanation = result.explanation;
    const llmProvider = process.env.LLM_PROVIDER;
    const hasLlmKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (llmProvider && hasLlmKey) {
      try {
        enhancedExplanation = await generateLlmExplanation(result, hh, context);
      } catch {
        // Fall back to template explanation if LLM fails
        enhancedExplanation = result.explanation;
      }
    }

    return NextResponse.json({
      ...result,
      explanation: enhancedExplanation,
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}

/**
 * Generate explanation using LLM API (Gemini or Claude).
 * D-024: Every recommendation must be explainable.
 * Principle 9: Default is single-line rationale; full reasoning on demand.
 */
async function generateLlmExplanation(
  result: RecommendationResult,
  household: Household,
  context: RecommendationContext
): Promise<string> {
  const mainDish = result.primary[0];
  const sideDishes = result.primary.slice(1);

  const prompt = `You are a warm, helpful family member suggesting dinner. Not a search engine, not a nutrition coach.

Household: ${household.name}, ${household.size} people, ${household.cuisine_region} cuisine, ${household.diet_type}.
Today: ${new Date().toLocaleDateString('en-IN', { weekday: 'long' })}, ${getCurrentSeason()}.

Suggested meal: ${mainDish.dish.name} (main)${sideDishes.length > 0 ? ` with ${sideDishes.map((s) => s.dish.name).join(' and ')}` : ''}.

Reasoning factors:
${mainDish.reasons.map((r) => `- ${r}`).join('\n')}

Generate a 1-3 line warm, confident, non-judgmental explanation. Like advice from a family member who knows your cooking habits. Max 2 sentences. No bullet points. Do not start with "I recommend" or "Here's".`;

  const provider = process.env.LLM_PROVIDER;

  if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    return data.content?.[0]?.text ?? result.explanation;
  }

  // Default: Gemini
  if (process.env.GEMINI_API_KEY) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? result.explanation;
  }

  return result.explanation;
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'monsoon';
  return 'winter';
}

// Import the result type for the function signature
import type { RecommendationResult } from '@/types/domain';
