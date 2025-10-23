'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/components/providers/app-state';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function AnalysisPage() {
  const isAuthenticated = useRequireAuth();
  const { analysis, setAnalysis, setAnalysisApproved, analysisApproved, role } =
    useAppState();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    snapshot: analysis.snapshot.join('\n'),
    risks: analysis.risks.join('\n'),
    culture: analysis.cultureKeywords.join(' / '),
  });
  const [toast, setToast] = useState<string | null>(null);

  if (!isAuthenticated) {
    return null;
  }

  const handleApprove = () => {
    setAnalysisApproved(true);
    setToast('予備分析を承認しました。ミッション設計に進みます。');
    router.push('/mission');
  };

  const handleModalSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextAnalysis = {
      ...analysis,
      snapshot: draft.snapshot.split('\n').map((item) => item.trim()).filter(Boolean),
      risks: draft.risks.split('\n').map((item) => item.trim()).filter(Boolean),
      cultureKeywords: draft.culture
        .split('/')
        .map((item) => item.trim())
        .filter(Boolean),
    };
    setAnalysis(nextAnalysis);
    setIsModalOpen(false);
    setToast('内容を反映しました。CEOレビューに戻ります。');
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-blue-600">予備分析</p>
        <h1 className="text-2xl font-bold text-slate-900">
          {analysis.company} の自動サマリー
        </h1>
        <p className="text-sm text-slate-600">
          Onboardingで入力した情報と既存資料をもとに、KiteiNaviが自動で分析した仮説レポートです。
        </p>
        {analysisApproved && (
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-700">
            ✅ CEO承認済み
          </div>
        )}
      </header>

      {toast && (
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {toast}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <article className="space-y-4 rounded-3xl bg-white px-6 py-6 shadow-md shadow-blue-50/40">
          <h2 className="text-lg font-semibold text-slate-900">会社概要（自動要約）</h2>
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {analysis.snapshot.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1 text-blue-500">●</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="space-y-4 rounded-3xl bg-white px-6 py-6 shadow-md shadow-blue-50/40">
          <h2 className="text-lg font-semibold text-slate-900">文化的キーワード</h2>
          <div className="flex flex-wrap gap-2">
            {analysis.cultureKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                #{keyword}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            「この提案は『透明性』の重み付け(75)に基づいています」
          </p>
        </article>
        <article className="space-y-4 rounded-3xl bg-white px-6 py-6 shadow-md shadow-blue-50/40 md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">組織課題の仮説</h2>
          <ul className="space-y-3">
            {analysis.risks.map((risk) => (
              <li
                key={risk}
                className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                ⚠️ {risk}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
        >
          修正を提案
        </button>
        {role === 'CEO' ? (
          <button
            type="button"
            onClick={handleApprove}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
          >
            承認して次へ
          </button>
        ) : (
          <span className="rounded-full bg-slate-200 px-4 py-2 text-xs text-slate-600">
            CEOのみ承認可能です（現在:{role}ビュー）
          </span>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-6 py-10">
          <form
            onSubmit={handleModalSave}
            className="w-full max-w-2xl space-y-6 rounded-3xl bg-white px-8 py-8 shadow-2xl shadow-blue-200/40"
          >
            <h3 className="text-lg font-semibold text-slate-900">分析の修正提案</h3>
            <label className="space-y-2 text-sm">
              <span className="text-slate-600">会社概要（1行につき1項目）</span>
              <textarea
                className="h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={draft.snapshot}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, snapshot: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-600">組織課題の仮説</span>
              <textarea
                className="h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={draft.risks}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, risks: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-600">文化的キーワード（`/`区切り）</span>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={draft.culture}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, culture: event.target.value }))
                }
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 hover:bg-blue-500"
              >
                変更を反映
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
