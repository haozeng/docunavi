'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/components/providers/app-state';
import { intakeOptions } from '@/lib/mock';
import { useRequireAuth } from '@/hooks/use-require-auth';

const allowSubmitRoles = ['CEO', '企画室'] as const;

export default function IntakePage() {
  const isAuthenticated = useRequireAuth();
  const {
    selectedDocIds,
    setSelectedDocIds,
    runAlignmentCheck,
    role,
    guardrails,
    alignmentScores,
  } = useAppState();
  const router = useRouter();
  const [localSelections, setLocalSelections] = useState<string[]>(selectedDocIds);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = (id: string) => {
    setLocalSelections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!localSelections.length) {
      setError('最低1つのドキュメントを選択してください。');
      return;
    }
    setSelectedDocIds(localSelections);
    runAlignmentCheck(localSelections);
    router.push('/review');
  };

  const canSubmit = allowSubmitRoles.includes(role as (typeof allowSubmitRoles)[number]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">ドキュメント取込</p>
        <h1 className="text-2xl font-bold text-slate-900">
          既存の規程や資料を選択し、整合性チェックを開始します
        </h1>
        <p className="text-sm text-slate-600">
          選択した資料がガードレール（ミッション/バリュー/重み付け）にどの程度沿っているかを自動判定します。
        </p>
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
          「この提案は『透明性』の重み付け({guardrails.weights['透明性']})に基づいています」
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-3xl bg-white px-8 py-8 shadow-lg shadow-blue-50/40">
          <h2 className="text-lg font-semibold text-slate-900">対象ドキュメント</h2>
          <div className="grid gap-4">
            {intakeOptions.map((option) => {
              const checked = localSelections.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 shadow-sm transition ${
                    checked ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggle(option.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </div>
                    {alignmentScores[option.id] && (
                      <span className="text-xs text-slate-500">
                        整合率 {alignmentScores[option.id]}%
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}
        </section>

        <div className="flex justify-end">
          {canSubmit ? (
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
            >
              アラインメントをチェック
            </button>
          ) : (
            <span className="rounded-full bg-slate-200 px-5 py-2 text-xs text-slate-600">
              CEOまたは企画室のみチェックを開始できます（現在:{role}ビュー）
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
