'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '@/components/providers/app-state';

export function useRequireAuth() {
  const { isAuthenticated } = useAppState();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      const search = pathname && pathname !== '/login' ? `?next=${pathname}` : '';
      router.replace(`/login${search}`);
    }
  }, [isAuthenticated, router, pathname]);

  return isAuthenticated;
}
