'use client';

/**
 * ConfidenceIndicator — Subtle confidence display
 * D-013: Confidence should determine how assertive recommendations are.
 * D- Principle 9: Show confidence subtly ("Based on 12 meals" / "Still learning")
 */

interface Props {
  confidence: number; // 0-1
  mealCount: number;
}

export function ConfidenceIndicator({ confidence, mealCount }: Props) {
  let label: string;
  let color: string;

  if (mealCount === 0) {
    label = 'Just getting to know your household';
    color = 'var(--confidence-low)';
  } else if (confidence < 0.5) {
    label = `Still learning — based on ${mealCount} meal${mealCount !== 1 ? 's' : ''}`;
    color = 'var(--confidence-low)';
  } else if (confidence < 0.75) {
    label = `Based on ${mealCount} meal${mealCount !== 1 ? 's' : ''}`;
    color = 'var(--confidence-medium)';
  } else {
    label = `Confident — learned from ${mealCount} meal${mealCount !== 1 ? 's' : ''}`;
    color = 'var(--confidence-high)';
  }

  return (
    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-subtle)' }}>
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
