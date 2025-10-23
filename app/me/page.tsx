'use client';

import { useMemo, useState } from 'react';
import { useAppState } from '@/components/providers/app-state';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { DocItem, IssueItem } from '@/lib/mock';

interface TaskItem {
  id: string;
  doc: DocItem;
  issue: IssueItem;
}

export default function MyTasksPage() {
  const isAuthenticated = useRequireAuth();
  const { docs, role } = useAppState();
  const [completed, setCompleted] = useState<string[]>([]);

  const tasks = useMemo<TaskItem[]>(() => {
    return docs
      .filter((doc) => doc.issues?.length)
      .flatMap((doc) =>
        (doc.issues ?? []).map((issue, index) => ({
          id: `${doc.id}-${index}`,
          doc,
          issue,
        }))
      );
  }, [docs]);

  if (!isAuthenticated) {
    return null;
  }

  const handleComplete = (taskId: string) => {
    setCompleted((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-blue-600">マイタスク</p>
        <h1 className="text-2xl font-bold text-slate-900">本日の対応項目</h1>
        <p className="text-sm text-slate-600">
          一般社員ビューでは、自分にアサインされたドキュメント差分と対応状況を確認できます。
          {role !== '社員' && (
            <span className="ml-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              現在:{role}ビュー（閲覧のみ）
            </span>
          )}
        </p>
      </header>

      <section className="space-y-4 rounded-3xl bg-white px-8 py-8 shadow-lg shadow-blue-50/40">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>割当タスク: {tasks.length}</span>
          <span>完了: {completed.length}</span>
        </div>
        <ul className="space-y-3">
          {tasks.map((task) => {
            const isDone = completed.includes(task.id);
            return (
              <li
                key={task.id}
                className="space-y-3 rounded-2xl border border-slate-200 px-5 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {task.doc.name} / {task.doc.owner}さん依頼
                    </p>
                    <p className="text-xs text-slate-500">
                      期限: {task.doc.due} / ステータス: {task.doc.status}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      task.issue.severity === 'high'
                        ? 'bg-red-100 text-red-600'
                        : task.issue.severity === 'mid'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    優先度: {task.issue.severity === 'high' ? '高' : task.issue.severity === 'mid' ? '中' : '低'}
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  課題: <strong>{task.issue.clause}</strong> — {task.issue.problem}
                </p>
                <div className="space-y-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">提案差分</p>
                  <p>
                    原文: <mark className="bg-red-100">{task.issue.clause}</mark>
                  </p>
                  <p>
                    提案: <mark className="bg-green-100">{task.issue.suggestion}</mark>
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleComplete(task.id)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                      isDone
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-500'
                    }`}
                  >
                    {isDone ? '確認済み' : '確認済みにする'}
                  </button>
                  <button
                    type="button"
                    className="text-xs text-blue-600 underline decoration-dotted"
                  >
                    詳細を表示
                  </button>
                </div>
              </li>
            );
          })}
          {!tasks.length && (
            <li className="rounded-2xl bg-green-50 px-6 py-6 text-center text-sm text-green-700">
              すべてのタスクが整合済みです。
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
