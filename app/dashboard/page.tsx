'use client';

import { useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { useAppState } from '@/components/providers/app-state';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { DocItem, Status } from '@/lib/mock';

type DrawerState = DocItem | null;

const statusBadge: Record<Status, string> = {
  整合: 'bg-green-100 text-green-700 border-green-200',
  要修正: 'bg-amber-100 text-amber-700 border-amber-200',
  不一致: 'bg-red-100 text-red-600 border-red-200',
  検討中: 'bg-slate-200 text-slate-600 border-slate-300',
};

const deptLabels = [
  'Engineering',
  'Finance',
  'Marketing',
  'Sales',
  'CS',
  'HR',
  'Corp',
] as const;

const statusOptions: Status[] = ['整合', '要修正', '不一致', '検討中'];

export default function DashboardPage() {
  const isAuthenticated = useRequireAuth();
  const {
    docs,
    alignmentScores,
    role,
    shiftDocDueDate,
    setDocStatus,
    guardrails,
    updateAlignmentScore,
  } = useAppState();
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dueFilter, setDueFilter] = useState<string>('all');
  const [drawerDoc, setDrawerDoc] = useState<DrawerState>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      if (deptFilter !== 'all' && doc.dept !== deptFilter) {
        return false;
      }
      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false;
      }
      if (dueFilter !== 'all') {
        const diff = differenceInCalendarDays(parseISO(doc.due), new Date());
        if (dueFilter === 'dueSoon' && diff > 7) {
          return false;
        }
        if (dueFilter === 'overdue' && diff >= 0) {
          return false;
        }
        if (dueFilter === 'nextMonth' && (diff < 0 || diff > 31)) {
          return false;
        }
      }
      return true;
    });
  }, [docs, deptFilter, statusFilter, dueFilter]);

  if (!isAuthenticated) {
    return null;
  }

  const openDrawer = (doc: DocItem) => {
    setDrawerDoc(doc);
  };

  const handleNudge = (doc: DocItem) => {
    const next = format(addDays(parseISO(doc.due), 7), 'yyyy-MM-dd');
    shiftDocDueDate(doc.id, 7);
    setToast(`期限を7日後に調整しました（新期限: ${next}）。`);
    setDrawerDoc((prev) => (prev && prev.id === doc.id ? { ...prev, due: next } : prev));
  };

  const handleBulkApply = (doc: DocItem) => {
    setDocStatus(doc.id, '整合');
    const nextScore = Math.max(alignmentScores[doc.id] ?? 70, 90);
    updateAlignmentScore(doc.id, nextScore);
    setToast(`${doc.name} を「整合」に更新しました（提案版を一括適用）。`);
    setDrawerDoc((prev) =>
      prev && prev.id === doc.id ? { ...prev, status: '整合' } : prev
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">ステータスボード</p>
        <h1 className="text-2xl font-bold text-slate-900">
          部門横断でミッション整合性をトラッキング
        </h1>
        <p className="text-sm text-slate-600">
          ガードレール（ミッション・バリュー）の重み付けを基準に、各部門のドキュメント整合状況を可視化します。
        </p>
        <div className="grid gap-2 text-xs text-slate-500 md:grid-cols-2">
          <span>基準ミッション: {guardrails.mission}</span>
          <span>
            重み付け: {Object.entries(guardrails.weights)
              .map(([key, value]) => `${key}:${value}`)
              .join(' / ')}
          </span>
        </div>
      </header>

      {toast && (
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {toast}
        </div>
      )}

      <section className="flex flex-wrap gap-4 rounded-3xl bg-white px-6 py-5 shadow-lg shadow-blue-50/40">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>部門</span>
          <select
            value={deptFilter}
            onChange={(event) => setDeptFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">すべて</option>
            {deptLabels.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>ステータス</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">すべて</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>期限</span>
          <select
            value={dueFilter}
            onChange={(event) => setDueFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">すべて</option>
            <option value="dueSoon">7日以内</option>
            <option value="nextMonth">今後30日</option>
            <option value="overdue">期限切れ</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-blue-50/40">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">ドキュメント/プロジェクト</th>
              <th className="px-6 py-3 text-left">部門</th>
              <th className="px-6 py-3 text-left">ステータス</th>
              <th className="px-6 py-3 text-left">期限</th>
              <th className="px-6 py-3 text-left">担当</th>
              <th className="px-6 py-3 text-left">最終更新</th>
              <th className="px-6 py-3 text-left">整合率</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filteredDocs.map((doc) => {
              const score = alignmentScores[doc.id] ?? 70;
              const diff = differenceInCalendarDays(parseISO(doc.due), new Date());
              const dueTone =
                diff < 0
                  ? 'text-red-600'
                  : diff <= 7
                  ? 'text-amber-600'
                  : 'text-slate-600';
              return (
                <tr
                  key={doc.id}
                  className="cursor-pointer transition hover:bg-blue-50/40"
                  onClick={() => openDrawer(doc)}
                >
                  <td className="px-6 py-4 font-medium">{doc.name}</td>
                  <td className="px-6 py-4">{doc.dept}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge[doc.status]}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${dueTone}`}>{doc.due}</td>
                  <td className="px-6 py-4">{doc.owner}</td>
                  <td className="px-6 py-4">{doc.lastUpdated ?? '2025-10-15'}</td>
                  <td className="px-6 py-4">{score}%</td>
                </tr>
              );
            })}
            {!filteredDocs.length && (
              <tr>
                <td
                  className="px-6 py-6 text-center text-sm text-slate-500"
                  colSpan={7}
                >
                  条件に一致する項目がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {drawerDoc && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-end bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setDrawerDoc(null)}
        >
          <div
            className="h-full w-full max-w-lg space-y-6 overflow-y-auto border-l border-slate-200 bg-white px-6 py-8 shadow-2xl shadow-blue-200/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {drawerDoc.name}
                </h2>
                <p className="text-xs text-slate-500">
                  部門: {drawerDoc.dept} / 担当: {drawerDoc.owner}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerDoc(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600"
              >
                閉じる
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">検出された論点</p>
              {drawerDoc.issues?.length ? (
                <ul className="space-y-3 text-sm text-slate-600">
                  {drawerDoc.issues.map((issue) => (
                    <li
                      key={issue.clause}
                      className="rounded-2xl border border-slate-200 px-4 py-3 shadow-sm"
                    >
                      <p className="text-xs font-semibold text-slate-500">
                        {issue.clause}
                      </p>
                      <p>課題: {issue.problem}</p>
                      <p className="text-blue-700">提案: {issue.suggestion}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                  問題は検出されていません。
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 px-4 py-4 text-xs text-slate-500">
              <p>整合率: {alignmentScores[drawerDoc.id] ?? 70}%</p>
              <p>最終更新: {drawerDoc.lastUpdated ?? '2025-10-15'}</p>
              <p>期限: {drawerDoc.due}</p>
            </div>

            <div className="space-y-3">
              {(role === 'CEO' || role === '企画室') && (
                <button
                  type="button"
                  onClick={() => handleBulkApply(drawerDoc)}
                  className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
                >
                  一括適用（提案版で更新）
                </button>
              )}
              {role === 'CEO' && (
                <button
                  type="button"
                  onClick={() => handleNudge(drawerDoc)}
                  className="w-full rounded-full border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-600 hover:border-blue-400"
                >
                  期限を+7日延長
                </button>
              )}
              <div className="flex gap-3 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setToast('CSVをダウンロードしました（ダミー）。')}
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 hover:border-blue-300 hover:text-blue-600"
                >
                  CSVエクスポート
                </button>
                <button
                  type="button"
                  onClick={() => setToast('PDFを生成しました（ダミー）。')}
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 hover:border-blue-300 hover:text-blue-600"
                >
                  PDFプレビュー
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
