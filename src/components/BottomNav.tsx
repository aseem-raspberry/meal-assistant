'use client';

/**
 * BottomNav — Fixed bottom navigation bar
 *
 * 4 tabs: Calendar (home), Recommend, Log, Dashboard
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Calendar', icon: '📅' },
  { href: '/recommend', label: 'Suggest', icon: '✨' },
  { href: '/log', label: 'Log', icon: '📝' },
  { href: '/dashboard', label: 'Insights', icon: '📊' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 flex-shrink-0 flex items-center justify-around px-2 py-2"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all active:scale-95"
            style={{
              opacity: isActive ? 1 : 0.5,
            }}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span
              className="text-xs font-medium"
              style={{
                color: isActive ? 'var(--accent-primary)' : 'var(--foreground-subtle)',
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
