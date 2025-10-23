'use client';

import { ReactNode, createContext, useContext, useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import {
  AnalysisSummary,
  CompanyProfile,
  DocItem,
  Guardrails,
  Role,
  defaultGuardrails,
  demoAnalysis,
  docs as initialDocs,
  scoreDoc,
  statusFromScore,
} from '@/lib/mock';

type AlignmentDecision = 'adopt' | 'hold' | 'reject';

interface AppStateContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  company: CompanyProfile;
  updateCompany: (profile: Partial<CompanyProfile>) => void;
  analysis: AnalysisSummary;
  setAnalysis: (analysis: AnalysisSummary) => void;
  analysisApproved: boolean;
  setAnalysisApproved: (value: boolean) => void;
  guardrails: Guardrails;
  updateGuardrails: (next: Guardrails) => void;
  docs: DocItem[];
  alignmentScores: Record<string, number>;
  runAlignmentCheck: (docIds: string[]) => void;
  selectedDocIds: string[];
  setSelectedDocIds: (ids: string[]) => void;
  issueDecisions: Record<string, Record<string, AlignmentDecision>>;
  updateIssueDecision: (docId: string, clause: string, decision: AlignmentDecision) => void;
  resetIssueDecisions: (docId?: string) => void;
  setDocStatus: (docId: string, status: DocItem['status']) => void;
  guardrailToneOptions: string[];
  shiftDocDueDate: (docId: string, days: number) => void;
  updateAlignmentScore: (docId: string, score: number) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const toneOptions = ['挑戦的', '謙虚', 'データドリブン', '顧客起点'];

const defaultCompany: CompanyProfile = {
  companyName: '株式会社デモテック',
  industry: 'SaaS / HRテック',
  size: '230',
  headquarters: '東京都渋谷区',
  challenges: [],
};

const initialScores = Object.fromEntries(
  initialDocs.map((doc) => [doc.id, scoreDoc(defaultGuardrails, doc)])
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('CEO');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [company, setCompany] = useState<CompanyProfile>(defaultCompany);
  const [analysis, setAnalysis] = useState<AnalysisSummary>(demoAnalysis);
  const [analysisApproved, setAnalysisApproved] = useState(false);
  const [guardrails, setGuardrails] = useState<Guardrails>(defaultGuardrails);
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [alignmentScores, setAlignmentScores] =
    useState<Record<string, number>>(initialScores);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [issueDecisions, setIssueDecisions] = useState<
    Record<string, Record<string, AlignmentDecision>>
  >({});

  const login = (email: string, password: string) => {
    if (email === 'ceo@demo.jp' && password === 'demo1234') {
      setIsAuthenticated(true);
      setRole('CEO');
      return { success: true };
    }
    return { success: false, message: 'メールアドレスまたはパスワードが正しくありません。' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole('CEO');
    setSelectedDocIds([]);
    setIssueDecisions({});
    setAnalysisApproved(false);
  };

  const updateCompany = (profile: Partial<CompanyProfile>) => {
    setCompany((prev) => ({
      ...prev,
      ...profile,
      challenges: profile.challenges ?? prev.challenges,
    }));
  };

  const updateGuardrails = (next: Guardrails) => {
    setGuardrails(next);
    const computedScores: Record<string, number> = {};
    setDocs((prev) =>
      prev.map((doc) => {
        if (doc.status === '検討中') {
          const score = scoreDoc(next, doc);
          computedScores[doc.id] = score;
          return doc;
        }
        const score = scoreDoc(next, doc);
        computedScores[doc.id] = score;
        return {
          ...doc,
          status: statusFromScore(score),
        };
      })
    );
    setAlignmentScores((prev) => ({ ...prev, ...computedScores }));
  };

  const runAlignmentCheck = (docIds: string[]) => {
    const computedScores: Record<string, number> = {};
    const today = format(new Date(), 'yyyy-MM-dd');
    setDocs((prev) =>
      prev.map((doc) => {
        if (!docIds.includes(doc.id)) {
          return doc;
        }
        const score = scoreDoc(guardrails, doc);
        computedScores[doc.id] = score;
        const nextStatus =
          doc.status === '検討中' && (!doc.issues || doc.issues.length === 0)
            ? '検討中'
            : statusFromScore(score);

        return {
          ...doc,
          status: nextStatus,
          lastUpdated: today,
        };
      })
    );
    setAlignmentScores((prev) => ({ ...prev, ...computedScores }));
    setSelectedDocIds(docIds);
  };

  const updateIssueDecision = (
    docId: string,
    clause: string,
    decision: AlignmentDecision
  ) => {
    setIssueDecisions((prev) => ({
      ...prev,
      [docId]: {
        ...(prev[docId] ?? {}),
        [clause]: decision,
      },
    }));
  };

  const resetIssueDecisions = (docId?: string) => {
    if (!docId) {
      setIssueDecisions({});
      return;
    }
    setIssueDecisions((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  const setDocStatus = (docId: string, status: DocItem['status']) => {
    setDocs((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status } : doc))
    );
  };

  const shiftDocDueDate = (docId: string, days: number) => {
    setDocs((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) {
          return doc;
        }
        const nextDate = addDays(parseISO(doc.due), days);
        return {
          ...doc,
          due: format(nextDate, 'yyyy-MM-dd'),
        };
      })
    );
  };

  const updateAlignmentScore = (docId: string, score: number) => {
    setAlignmentScores((prev) => ({
      ...prev,
      [docId]: Math.round(score),
    }));
  };

  const value: AppStateContextType = {
    role,
    setRole,
    isAuthenticated,
    login,
    logout,
    company,
    updateCompany,
    analysis,
    setAnalysis,
    analysisApproved,
    setAnalysisApproved,
    guardrails,
    updateGuardrails,
    docs,
    alignmentScores,
    runAlignmentCheck,
    selectedDocIds,
    setSelectedDocIds,
    issueDecisions,
    updateIssueDecision,
    resetIssueDecisions,
    setDocStatus,
    guardrailToneOptions: toneOptions,
    shiftDocDueDate,
    updateAlignmentScore,
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('AppStateContext is not available');
  }
  return context;
};
