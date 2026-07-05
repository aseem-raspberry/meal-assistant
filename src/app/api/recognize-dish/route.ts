/**
 * API Route: Recognize dish from photo
 *
 * POST /api/recognize-dish
 *
 * Takes a base64-encoded photo and returns recognized dish data.
 * Uses Gemini Vision or Claude Vision for recognition.
 * Falls back to a "manual entry" response if no API key is configured.
 *
 * D-047: Photos are processed for structured data and then deleted.
 * This route does NOT store the photo — it processes and returns structured data.
 *
 * Design Revision v2: Photo recognition is Phase 1, not Phase 4.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SEED_DISHES } from '@/lib/seed-dishes';
import type { ParsedDish, CuisineRegion, MealComponent } from '@/types/domain';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_base64, cuisine_region } = body as {
      image_base64: string;
      cuisine_region?: CuisineRegion;
    };

    if (!image_base64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const hasGemini = process.env.GEMINI_API_KEY;
    const hasClaude = process.env.ANTHROPIC_API_KEY;
    const provider = process.env.LLM_PROVIDER;

    let dishes: ParsedDish[];
    let overallConfidence: number;

    if (hasGemini || (hasClaude && provider === 'claude')) {
      try {
        const result = await recognizeWithVision(
          image_base64,
          cuisine_region,
          provider,
          !!hasClaude
        );
        dishes = result.dishes;
        overallConfidence = result.confidence;
      } catch {
        // Fallback: return empty — user will use manual entry
        return NextResponse.json({
          dishes: [],
          overallConfidence: 0,
          error: 'Vision recognition unavailable — please use text or browse mode',
        });
      }
    } else {
      // No API key — can't do vision recognition
      return NextResponse.json({
        dishes: [],
        overall_confidence: 0,
        error: 'Photo recognition requires an AI API key. Set GEMINI_API_KEY or ANTHROPIC_API_KEY. Use text or browse mode for now.',
      });
    }

    return NextResponse.json({ dishes, overallConfidence });
  } catch (error) {
    console.error('Recognize dish error:', error);
    return NextResponse.json({ error: 'Failed to recognize dish' }, { status: 500 });
  }
}

/**
 * Recognize dishes using Vision AI (Gemini Vision or Claude Vision).
 * D-047: Photo is processed and not stored.
 */
async function recognizeWithVision(
  imageBase64: string,
  cuisineRegion: CuisineRegion | undefined,
  provider: string | undefined,
  useClaude: boolean
): Promise<{ dishes: ParsedDish[]; confidence: number }> {
  const knownDishes = SEED_DISHES.map((d) => d.name).join(', ');

  const textPrompt = `You are an expert in Indian cuisine. Look at this food photo and identify all the dishes you can see.

${cuisineRegion ? `The household's cuisine region is ${cuisineRegion}.` : ''}

Known dishes in our database: ${knownDishes}

For each dish you can identify, return a JSON array with these fields:
- name: the dish name
- ingredients: array of visible/inferred ingredients
- cuisine: one of "North Indian", "South Indian", "Gujarati", "Maharashtrian", "Punjabi", "Bengali"
- category: one of "main_curry", "dry_vegetable", "rice", "bread", "dal", "dessert", "starter", "side_dish", "pickle", "salad", "drink", "raita", "papad"
- effort_level: 1, 2, or 3
- confidence: 0-1 how sure you are

Return ONLY a valid JSON array. No markdown.`;

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
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: textPrompt,
              },
            ],
          },
        ],
      }),
    });
    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? '[]';
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const dishes = JSON.parse(cleaned) as ParsedDish[];
    const confidence = dishes.length > 0
      ? dishes.reduce((sum, d) => sum + d.confidence, 0) / dishes.length
      : 0;
    return { dishes, confidence };
  }

  // Gemini Vision
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: textPrompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
      }),
    }
  );
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const dishes = JSON.parse(cleaned) as ParsedDish[];
  const confidence = dishes.length > 0
    ? dishes.reduce((sum, d) => sum + d.confidence, 0) / dishes.length
    : 0;
  return { dishes, confidence };
}
