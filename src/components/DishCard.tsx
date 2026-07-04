'use client';

/**
 * DishCard — displays a dish as part of a recommendation
 * Not a recipe card (D-029) — a decision support card.
 */

import type { Dish } from '@/types/domain';

interface Props {
  dish: Dish;
  isPrimary?: boolean;
}

export function DishCard({ dish, isPrimary = false }: Props) {
  const effortLabel =
    dish.effort_level === 1 ? 'Quick' : dish.effort_level === 2 ? 'Moderate' : 'Elaborate';

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{
        background: isPrimary ? 'var(--surface-elevated)' : 'var(--surface)',
        border: isPrimary ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3
            className="font-semibold text-base sm:text-lg"
            style={{ color: 'var(--foreground)' }}
          >
            {dish.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>
            {dish.cuisine} · {effortLabel} · {dish.prep_time_minutes} min
          </p>
        </div>
        {isPrimary && (
          <span
            className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--background)',
            }}
          >
            Main
          </span>
        )}
      </div>

      {/* Ingredients */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {dish.ingredients.slice(0, 6).map((ing) => (
          <span
            key={ing}
            className="text-xs px-2 py-0.5 rounded-md"
            style={{
              background: 'var(--surface)',
              color: 'var(--foreground-muted)',
            }}
          >
            {ing}
          </span>
        ))}
        {dish.ingredients.length > 6 && (
          <span
            className="text-xs px-2 py-0.5"
            style={{ color: 'var(--foreground-subtle)' }}
          >
            +{dish.ingredients.length - 6} more
          </span>
        )}
      </div>

      {/* Dietary tags */}
      {dish.dietary_tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {dish.dietary_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                color: 'var(--accent-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
