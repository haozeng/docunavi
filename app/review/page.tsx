'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/components/providers/app-state';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { DocItem, IssueItem } from '@/lib/mock';

const diffTemplates: Record<
  string,
  {
    title: string;
    sections: Array<{ heading: string; original: string; proposed: string }>;
  }
> = {
  'exp-pol': {
    title: '経費規程 v3',
    sections: [
      {
        heading: '旅費カテゴリ',
        original:
          '国内出張では <mark class="bg-green-100">エコノミー</mark>、国際線では <mark class="bg-red-100">ビジネスクラス常時可</mark> とする。',
        proposed:
          '国内・国際ともに基本は <mark class="bg-green-100">エコノミークラス</mark>。顧客価値が最大化される場合のみ <span class="underline decoration-yellow-400">事前申請により例外運用</span> を認める。',
      },
      {
        heading: '経費申請フロー',
        original:
          '領収書は <mark class="bg-red-100">月末にまとめて提出</mark> し、承認は翌月10日までに実施する。',
        proposed:
          '領収書は発生から48時間以内にモバイルで即時提出。<mark class="bg-green-100">週次締め</mark>とし、承認リードタイムを短縮する。',
      },
      {
        heading: '透明性の確保',
        original:
          '経費申請の承認状況は経理部内で管理し、社員への共有は任意とする。',
        proposed:
          '承認状況は <span class="underline decoration-yellow-400">ダッシュボードで全社員に可視化</span>。例外承認は理由を添えて公開する。',
      },
    ],
  },
};

const decisionLabels: Record<'adopt' | 'hold' | 'reject', string> = {
  adopt: '修正を採用',
  hold: '保留',
  reject: '差戻し',
};

const decisionColor: Record<'adopt' | 'hold' | 'reject', string> = {
  adopt: 'bg-green-100 text-green-700 border-green-200',
  hold: 'bg-amber-50 text-amber-700 border-amber-200',
  reject: 'bg-red-50 text-red-600 border-red-200',
};

export default function ReviewPage() {
  const isAuthenticated = useRequireAuth();
  const {
    docs,
    selectedDocIds,
    issueDecisions,
    updateIssueDecision,
    resetIssueDecisions,
    role,
    alignmentScores,
  } = useAppState();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const targetDocs = useMemo(
    () => docs.filter((doc) => selectedDocIds.includes(doc.id)),
    [docs, selectedDocIds]
  );

  if (!isAuthenticated) {
    return null;
  }

  const renderIssueActions = (doc: DocItem, issue: IssueItem) => {
    return (
      <div className="flex flex-wrap gap-2">
        {(Object.keys(decisionLabels) as Array<'adopt' | 'hold' | 'reject'>).map(
          (decisionKey) => {
            const selected =
              issueDecisions[doc.id]?.[issue.clause] === decisionKey;
            return (
              <button
                key={decisionKey}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selected
                    ? decisionColor[decisionKey]
                    : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
                onClick={() => updateIssueDecision(doc.id, issue.clause, decisionKey)}
              >
                {decisionLabels[decisionKey]}
              </button>
            );
          }
        )}
      </div>
    );
  };

  const handleComplete = () => {
    setToast('企画室に回付しました（ダミー）。ステータスボードに移動します。');
    setTimeout(() => {
      router.push('/dashboard');
      resetIssueDecisions();
    }, 800);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">アラインメントチェック</p>
        <h1 className="text-2xl font-bold text-slate-900">
          ガードレールに照らした原文と提案版の比較
        </h1>
        <p className="text-sm text-slate-600">
          左が現行ドキュメント、右がKiteiNaviの提案。強調表示は整合度を表します。
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-700">
            ✅ 準拠
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
            ⚠️ 弱い整合
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-red-700">
            ❌ 不一致
          </span>
        </div>
      </header>

      {toast && (
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {toast}
        </div>
      )}

      {!targetDocs.length ? (
        <div className="rounded-3xl bg-white px-8 py-8 text-center text-sm text-slate-600 shadow-lg shadow-blue-50/40">
          対象ドキュメントが選択されていません。<a className="text-blue-600 underline" href="/intake">取込画面</a>に戻って資料を選びましょう。
        </div>
      ) : (
        targetDocs.map((doc) => {
          const template = diffTemplates[doc.id];
          const score = alignmentScores[doc.id] ?? 68;
          const statusLabel =
            score >= 75
              ? `整合率 ${score}%（整合）`
              : score >= 50
              ? `整合率 ${score}%（要修正）`
              : `整合率 ${score}%（不一致）`;
          return (
            <section
              key={doc.id}
              className="space-y-6 rounded-3xl bg-white px-8 py-8 shadow-lg shadow-blue-50/40"
            >
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {doc.name}（{doc.dept}）
                  </h2>
                  <p className="text-xs text-slate-500">{statusLabel}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  担当: {doc.owner}
                </span>
              </header>

              {template ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {template.sections.map((section) => (
                    <div key={section.heading} className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700">
                        {section.heading}
                      </h3>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                        <p className="mb-2 text-xs font-semibold text-slate-500">原文</p>
                        <div dangerouslySetInnerHTML={{ __html: section.original }} />
                      </div>
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-700">
                        <p className="mb-2 text-xs font-semibold text-blue-600">
                          提案版（KiteiNavi）
                        </p>
                        <div dangerouslySetInnerHTML={{ __html: section.proposed }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-6 text-sm text-slate-500">
                  現在、提案版を生成しています。簡易メモ: {statusLabel}。
                </div>
              )}

              {doc.issues?.length ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    検出された課題と提案
                  </h3>
                  <ul className="space-y-3">
                    {doc.issues.map((issue) => (
                      <li
                        key={issue.clause}
                        className="space-y-3 rounded-2xl border border-slate-200 px-5 py-4 text-sm text-slate-700"
                      >
                        <p className="text-xs font-semibold text-slate-500">
                          {issue.severity === 'high'
                            ? '重大'
                            : issue.severity === 'mid'
                            ? '中'
                            : '軽微'}{' '}
                          - {issue.clause}
                        </p>
                        <p>課題: {issue.problem}</p>
                        <p className="text-blue-700">提案: {issue.suggestion}</p>
                        {renderIssueActions(doc, issue)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                  問題は検出されませんでした。整合率は良好です。
                </p>
              )}
            </section>
          );
        })
      )}

      <div className="flex justify-end">
        {(role === 'CEO' || role === '企画室') && targetDocs.length ? (
          <button
            type="button"
            onClick={handleComplete}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
          >
            企画室に回付
          </button>
        ) : (
          <span className="rounded-full bg-slate-200 px-5 py-2 text-xs text-slate-600">
            CEO/企画室のみ回付できます（現在:{role}ビュー）
          </span>
        )}
      </div>
    </div>
  );
}
