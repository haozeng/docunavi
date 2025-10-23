'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { RoleSwitcher } from '@/components/ui/role-switcher';
import { useAppState } from '@/components/providers/app-state';

interface AppShellProps {
  children: ReactNode;
}

const hideNavOn: string[] = ['/login'];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { role, isAuthenticated, logout } = useAppState();
  const hideNav = hideNavOn.includes(pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!hideNav && isAuthenticated && (
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-xl font-semibold text-slate-900"
              >
                KiteiNavi
              </Link>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {role}ビュー
              </span>
            </div>
            <div className="flex items-center gap-4">
              <RoleSwitcher />
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  CEO
                </span>
                <div className="leading-tight">
                  <p className="font-medium">ceo@demo.jp</p>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-blue-600 underline decoration-dotted hover:text-blue-500"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
      <main className="pb-24">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}
