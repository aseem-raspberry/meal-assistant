'use client';

/**
 * History screen — redirects to calendar home.
 * The calendar IS the new history view.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/');
  }, [router]);
  return null;
}
