'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/components/providers/app-state';
import { challengePool, generateAnalysis } from '@/lib/mock';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function OnboardingPage() {
  const isAuthenticated = useRequireAuth();
  const { company, updateCompany, setAnalysis, setAnalysisApproved } = useAppState();
  const router = useRouter();
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [form, setForm] = useState({
    companyName: company.companyName,
    industry: company.industry,
    size: company.size,
    headquarters: company.headquarters,
    challenges: company.challenges,
  });

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateCompany(form);
    if (autoAnalysis) {
      setAnalysis(generateAnalysis(form));
    }
    setAnalysisApproved(false);
    router.push('/analysis');
  };

  const toggleChallenge = (challenge: string) => {
    setForm((prev) => {
      const already = prev.challenges.includes(challenge);
      return {
        ...prev,
        challenges: already
          ? prev.challenges.filter((item) => item !== challenge)
          : [...prev.challenges, challenge],
      };
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">初期設定（CEO）</p>
        <h1 className="text-2xl font-bold text-slate-900">
          会社情報と現状の経営課題を入力してください
        </h1>
        <p className="text-sm text-slate-600">
          入力内容をもとに予備分析とミッション・バリューのテンプレートを生成します。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="grid gap-6 rounded-3xl bg-white px-8 py-8 shadow-lg shadow-blue-50/40 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">会社名</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.companyName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, companyName: event.target.value }))
              }
              placeholder="株式会社デモテック"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">業種</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.industry}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, industry: event.target.value }))
              }
              placeholder="SaaS / HRテック"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">従業員数</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.size}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, size: event.target.value }))
              }
              placeholder="230"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">本社所在地</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.headquarters}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, headquarters: event.target.value }))
              }
              placeholder="東京都渋谷区"
              required
            />
          </label>
        </section>

        <section className="space-y-4 rounded-3xl bg-white px-8 py-8 shadow-lg shadow-blue-50/40">
          <h2 className="text-lg font-semibold text-slate-900">
            現在の経営課題（複数選択）
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {challengePool.map((challenge) => {
              const checked = form.challenges.includes(challenge);
              return (
                <label
                  key={challenge}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm hover:border-blue-300"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={checked}
                    onChange={() => toggleChallenge(challenge)}
                  />
                  <span>{challenge}</span>
                </label>
              );
            })}
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={autoAnalysis}
              onChange={(event) => setAutoAnalysis(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>予備分析を自動生成</span>
          </label>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
          >
            分析を作成する
          </button>
        </div>
      </form>
    </div>
  );
}
