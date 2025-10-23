'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppState } from '@/components/providers/app-state';

export default function LoginPage() {
  const { login, isAuthenticated } = useAppState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('ceo@demo.jp');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      setError(result.message);
      return;
    }
    const next = searchParams.get('next');
    router.push(next && next !== '/login' ? next : '/onboarding');
  };

  useEffect(() => {
    if (isAuthenticated) {
      const next = searchParams.get('next');
      router.replace(next && next !== '/login' ? next : '/dashboard');
    }
  }, [isAuthenticated, router, searchParams]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="grid gap-10 rounded-3xl bg-white px-10 py-12 shadow-xl shadow-blue-50/50 md:grid-cols-2">
        <section className="space-y-4">
          <p className="text-sm font-semibold text-blue-600">KiteiNavi</p>
          <h1 className="text-3xl font-bold text-slate-900">CEOアラインメントデモ</h1>
          <p className="text-sm leading-6 text-slate-600">
            CEOの意思をミッション・バリューに落とし込み、日々の規程運用と整合させるデモアプリです。
            3分でミッション定義から部門別整合チェックまで体験できます。
          </p>
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
            デモ用クレデンシャル: <strong>ceo@demo.jp</strong> / <strong>demo1234</strong>
          </div>
        </section>
        <section>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-4">
              <label className="block space-y-2 text-sm">
                <span className="text-slate-600">メールアドレス</span>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ceo@demo.jp"
                  required
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="text-slate-600">パスワード</span>
                <input
                  type="password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="demo1234"
                  required
                />
              </label>
              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="ml-auto inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
            >
              ログイン
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
