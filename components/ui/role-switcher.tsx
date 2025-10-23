'use client';

import { ChangeEvent, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from '@/components/providers/app-state';

const roleRoutes: Record<string, string> = {
  CEO: '/dashboard',
  企画室: '/dashboard',
  HR: '/dashboard',
  社員: '/me',
};

export function RoleSwitcher() {
  const { role, setRole } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextRole = event.target.value;
    setRole(nextRole as typeof role);
    const targetRoute = roleRoutes[nextRole] ?? pathname;
    if (targetRoute !== pathname) {
      startTransition(() => {
        router.push(targetRoute);
      });
    }
  };

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span>ロール</span>
      <select
        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
        value={role}
        onChange={handleChange}
        disabled={isPending}
      >
        <option value="CEO">CEO</option>
        <option value="企画室">企画室</option>
        <option value="HR">HR</option>
        <option value="社員">一般社員</option>
      </select>
    </label>
  );
}
