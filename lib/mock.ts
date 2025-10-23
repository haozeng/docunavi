import { isAfter, parseISO } from "date-fns";

export type Role = "CEO" | "企画室" | "HR" | "社員";
export type Dept =
  | "Engineering"
  | "Finance"
  | "Marketing"
  | "Sales"
  | "CS"
  | "HR"
  | "Corp";
export type Status = "整合" | "要修正" | "不一致" | "検討中";

export interface Guardrails {
  mission: string;
  values: string[];
  tone: string[];
  weights: Record<string, number>;
}

export interface IssueItem {
  clause: string;
  problem: string;
  suggestion: string;
  severity: "low" | "mid" | "high";
  decision?: "adopt" | "hold" | "reject";
}

export interface DocItem {
  id: string;
  name: string;
  dept: Dept;
  owner: string;
  due: string;
  status: Status;
  issues?: IssueItem[];
  lastUpdated?: string;
}

export interface AnalysisSummary {
  company: string;
  snapshot: string[];
  risks: string[];
  cultureKeywords: string[];
}

export interface CompanyProfile {
  companyName: string;
  industry: string;
  size: string;
  headquarters: string;
  challenges: string[];
}

export const challengePool = [
  "部門間でミッション理解にばらつき",
  "規程の更新が属人的",
  "スピード重視だが品質担保が課題",
  "経営方針の現場伝達が遅い",
  "顧客志向をどう浸透させるか",
];

export const demoAnalysis: AnalysisSummary = {
  company: "株式会社デモテック",
  snapshot: [
    "SaaS/人事領域で成長中。SMB中心に300社導入。",
    "現場の裁量が大きく、スピード重視の文化。",
    "海外展開を視野に内部統制の再整備を検討中。",
  ],
  risks: [
    "部門ごとに規程の最新版が分散し、整合性が低下。",
    "経費規程が顧客価値・透明性の重み付けと矛盾。",
    "ドキュメント承認フローが不明確で意思決定が遅延。",
  ],
  cultureKeywords: ["現場主義", "チーム志向", "スピード", "顧客起点"],
};

export const defaultGuardrails: Guardrails = {
  mission: "テクノロジーで働く人の潜在力を最大化する",
  values: ["顧客起点", "透明性", "スピード", "オーナーシップ"],
  tone: ["謙虚", "データドリブン"],
  weights: {
    顧客価値: 80,
    スピード: 60,
    品質: 70,
    透明性: 75,
    オーナーシップ: 65,
  },
};

export const docs: DocItem[] = [
  {
    id: "exp-pol",
    name: "経費規程 v3",
    dept: "Finance",
    owner: "田中",
    due: "2025-11-10",
    status: "要修正",
    lastUpdated: "2025-10-22",
    issues: [
      {
        clause: "出張時のビジネスクラスは原則許可",
        problem: "コスト意識と透明性への重視と不一致",
        suggestion:
          "原則エコノミー。顧客価値が最大化される場合のみ事前申請で例外許可。",
        severity: "high",
      },
      {
        clause: "領収書は月末にまとめて提出",
        problem: "迅速性/スピードの重み付けに反する",
        suggestion: "モバイル即時提出を推奨。週次締めへの変更を提案。",
        severity: "mid",
      },
    ],
  },
  {
    id: "sales-script",
    name: "セールストーク Q4",
    dept: "Sales",
    owner: "佐藤",
    due: "2025-11-05",
    status: "整合",
    lastUpdated: "2025-10-18",
  },
  {
    id: "eng-dod",
    name: "DoD（Definition of Done）",
    dept: "Engineering",
    owner: "鈴木",
    due: "2025-11-20",
    status: "検討中",
    lastUpdated: "2025-10-16",
    issues: [
      {
        clause: "レビューは任意で実施",
        problem: "品質基準が曖昧でバグ流出の懸念",
        suggestion: "コードレビューを必須化し、チェックリストに透明性観点を追加。",
        severity: "low",
      },
    ],
  },
  {
    id: "brand-guide",
    name: "ブランドガイドライン",
    dept: "Marketing",
    owner: "高橋",
    due: "2025-11-18",
    status: "不一致",
    lastUpdated: "2025-10-19",
    issues: [
      {
        clause: "社内限定で情報共有",
        problem: "透明性重視の方針と矛盾",
        suggestion:
          "原則公開とし、顧客視点のQ&Aセクションを追加。情報更新フローを明確化。",
        severity: "mid",
      },
    ],
  },
  {
    id: "hr-policy",
    name: "人事評価ポリシー",
    dept: "HR",
    owner: "山本",
    due: "2025-11-12",
    status: "要修正",
    lastUpdated: "2025-10-21",
    issues: [
      {
        clause: "評価指標は管理職が任意選択",
        problem: "オーナーシップと透明性が希薄",
        suggestion: "指標テンプレを定義し、評価理由の共有を必須化。",
        severity: "mid",
      },
      {
        clause: "顧客価値の観点は任意",
        problem: "顧客価値の重み付けに反する",
        suggestion: "顧客価値指標を評価配点の30%以上に設定。",
        severity: "high",
      },
    ],
  },
];

export const intakeOptions = [
  {
    id: "exp-pol",
    label: "経費規程（expense_policy_v3.pdf）",
  },
  {
    id: "hr-policy",
    label: "人事評価ポリシー（hr_performance_guidelines.docx）",
  },
  {
    id: "sales-script",
    label: "セールストークスクリプト（sales_script_Q4.pptx）",
  },
  {
    id: "brand-guide",
    label: "マーケ資料（mk_brand_guidelines.pdf）",
  },
  {
    id: "eng-dod",
    label: "エンジニアリングDoD（eng_DoD.md）",
  },
];

const keywordMap: Record<string, keyof Guardrails["weights"]> = {
  顧客: "顧客価値",
  透明: "透明性",
  迅速: "スピード",
  スピード: "スピード",
  品質: "品質",
  オーナーシップ: "オーナーシップ",
};

const severityPenalty: Record<IssueItem["severity"], number> = {
  high: 15,
  mid: 8,
  low: 4,
};

export function scoreDoc(guardrails: Guardrails, doc: DocItem): number {
  const base = 88;
  if (!doc.issues?.length) {
    return doc.status === "検討中" ? 68 : Math.min(95, base + 4);
  }

  const penaltyFromIssues = doc.issues.reduce((acc, issue) => {
    const severity = severityPenalty[issue.severity] ?? 8;
    const keywordPenalty = Object.entries(keywordMap).reduce(
      (sum, [needle, weightKey]) => {
        if (
          issue.problem.includes(needle) ||
          issue.suggestion.includes(needle) ||
          issue.clause.includes(needle)
        ) {
          return (
            sum +
            Math.round((guardrails.weights[weightKey] ?? 60) * 0.07) / 1
          );
        }
        return sum;
      },
      0
    );
    return acc + severity + keywordPenalty;
  }, 0);

  const score = base - penaltyFromIssues;
  return Math.max(10, Math.round(score));
}

export function statusFromScore(score: number): Status {
  if (score >= 75) {
    return "整合";
  }
  if (score >= 50) {
    return "要修正";
  }
  return "不一致";
}

export function sortDocsByPriority(items: DocItem[]): DocItem[] {
  return [...items].sort((a, b) => {
    if (a.status === b.status) {
      return isAfter(parseISO(a.due), parseISO(b.due)) ? 1 : -1;
    }
    const statusOrder: Status[] = ["不一致", "要修正", "検討中", "整合"];
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  });
}

export function generateAnalysis(profile: CompanyProfile): AnalysisSummary {
  return {
    company: profile.companyName || demoAnalysis.company,
    snapshot: [
      `${profile.industry || "SaaS"}/${profile.companyName || "貴社"}は${
        profile.size || "約200名"
      }規模で成長を継続中。`,
      `本社は${profile.headquarters || "東京都"}。${profile.challenges[0] || "ミッション浸透"}に課題意識。`,
      "チームはスピード重視で、現場裁量が大きい組織文化。",
    ],
    cultureKeywords: demoAnalysis.cultureKeywords,
    risks: [
      "方針伝達と運用ルールの整合が不足。部署単位での解釈が分散。",
      "経営層の意図を示すミッション・バリューが明文化されていない。",
      "規程更新フローが属人的。透明性や顧客視点が欠落する懸念。",
    ],
  };
}
