'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/components/providers/app-state';
import { useRequireAuth } from '@/hooks/use-require-auth';

const WEIGHT_KEYS = ['顧客価値', 'スピード', '品質', '透明性', 'オーナーシップ'] as const;

export default function MissionPage() {
  const isAuthenticated = useRequireAuth();
  const {
    guardrails,
    updateGuardrails,
    guardrailToneOptions,
    role,
    setAnalysisApproved,
  } = useAppState();
  const router = useRouter();
  const [draft, setDraft] = useState(() => ({
    mission: guardrails.mission,
    values: guardrails.values,
    tone: guardrails.tone,
    weights: guardrails.weights,
  }));
  const [toast, setToast] = useState<string | null>(null);

  if (!isAuthenticated) {
    return null;
  }

  const isEditable = role === 'CEO';

  const updateValue = (index: number, value: string) => {
    setDraft((prev) => {
      const nextValues = [...prev.values];
      nextValues[index] = value;
      return { ...prev, values: nextValues };
    });
  };

  const addValue = () => {
    setDraft((prev) => ({ ...prev, values: [...prev.values, ''] }));
  };

  const removeValue = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      values: prev.values.filter((_, idx) => idx !== index),
    }));
  };

  const toggleTone = (tone: string) => {
    setDraft((prev) => {
      if (prev.tone.includes(tone)) {
        return { ...prev, tone: prev.tone.filter((item) => item !== tone) };
      }
      return { ...prev, tone: [...prev.tone, tone] };
    });
  };

  const updateWeight = (key: string, value: number) => {
    setDraft((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    updateGuardrails({
      mission: draft.mission,
      values: draft.values.filter(Boolean),
      tone: draft.tone,
      weights: draft.weights,
    });
    setAnalysisApproved(true);
    setToast('ガードレールを保存しました。ドキュメント取込に進めます。');
    router.push('/intake');
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-blue-600">ミッション / バリュー整備</p>
        <h1 className="text-2xl font-bold text-slate-900">
          CEOの意思を言語化し、組織のガードレールを設定します
        </h1>
        <p className="text-sm text-slate-600">
          ここで決めた内容が後続のアラインメントチェックの評価基準になります。
        </p>
      </header>

      {toast && (
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {toast}
        </div>
      )}

      <section className="space-y-6 rounded-3xl bg-white px-8 py-8 shadow-lg shadow-blue-50/40">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">ミッション</h2>
            {!isEditable && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                CEOビュー以外は閲覧のみ
              </span>
            )}
          </div>
          <textarea
            className="h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            value={draft.mission}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, mission: event.target.value }))
            }
            disabled={!isEditable}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">バリュー（3〜5個）</h2>
          <div className="space-y-3">
            {draft.values.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 shadow-sm"
              >
                <input
                  className="flex-1 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-transparent"
                  value={value}
                  onChange={(event) => updateValue(index, event.target.value)}
                  disabled={!isEditable}
                />
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => removeValue(index)}
                    className="text-xs text-slate-500 hover:text-red-500"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditable && (
            <button
              type="button"
              onClick={addValue}
              className="rounded-full border border-dashed border-blue-300 px-4 py-2 text-xs font-semibold text-blue-600 hover:border-blue-400"
            >
              ＋ バリューを追加
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="space-y-4 rounded-3xl bg-white px-6 py-6 shadow-lg shadow-blue-50/40">
          <h3 className="text-lg font-semibold text-slate-900">トーン（複数選択）</h3>
          <div className="flex flex-wrap gap-3">
            {guardrailToneOptions.map((tone) => {
              const checked = draft.tone.includes(tone);
              return (
                <label
                  key={tone}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold shadow-sm ${
                    checked
                      ? 'border-blue-400 bg-blue-50 text-blue-600'
                      : 'border-slate-200 text-slate-600'
                  } ${!isEditable ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() => toggleTone(tone)}
                    disabled={!isEditable}
                  />
                  {tone}
                </label>
              );
            })}
          </div>
        </article>
        <article className="space-y-4 rounded-3xl bg-white px-6 py-6 shadow-lg shadow-blue-50/40">
          <h3 className="text-lg font-semibold text-slate-900">重要度スライダー</h3>
          <p className="text-xs text-slate-500">
            バリューの重み付けを設定します。整合率判定に利用されます。
          </p>
          <div className="space-y-4">
            {WEIGHT_KEYS.map((key) => (
              <label key={key} className="block space-y-1 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{key}</span>
                  <span className="text-xs text-slate-500">{draft.weights[key]}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={draft.weights[key]}
                  onChange={(event) => updateWeight(key, Number(event.target.value))}
                  className="w-full accent-blue-600"
                  disabled={!isEditable}
                />
              </label>
            ))}
          </div>
        </article>
      </section>

      <div className="flex justify-end">
        {isEditable ? (
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
          >
            この内容でガードレールを設定
          </button>
        ) : (
          <span className="rounded-full bg-slate-200 px-5 py-2 text-xs text-slate-600">
            CEOのみガードレールを確定できます（現在:{role}ビュー）
          </span>
        )}
      </div>
    </div>
  );
}
