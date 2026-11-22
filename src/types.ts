// ── jotly · core type system ────────────────────────────────────────────────
export type AccountType = 'Eval' | 'Funded' | 'Live' | 'Paper';
export type Side = 'long' | 'short';
export type Accent = 'amber' | 'emerald' | 'sky' | 'violet';
export type ThemeMode = 'dark' | 'light';
export type SessionName = 'Asia' | 'London' | 'NY AM' | 'NY PM' | 'Off-hours';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  startingBalance: number;
  defaultRiskPct: number;
  createdAt: number;
}

export interface StrategyRule {
  id: string;
  text: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  color: string;
  rules: StrategyRule[];
  isDefault: boolean;
  createdAt: number;
}

export interface Trade {
  id: string;
  accountId: string;
  importKey: string | null;
  sample: boolean;
  unreviewed: boolean;
  symbol: string;
  side: Side;
  qty: number;
  entry: number;
  exit: number | null;
  openTime: string; // ISO string
  closeTime: string | null; // ISO string, null → still open
  plannedRisk: number; // USD, 0 = unplanned (imports start at 0)
  pnl: number | null; // realized, null while open
  fees: number; // positive $ cost (commission + swap as cost)
  strategyId: string | null;
  ruleChecks: Record<string, boolean>; // ruleId → followed
  tags: string[];
  session: SessionName | null;
  emotion: string;
  rating: number; // 0–5, 0 = unrated
  notes: string;
  screenshots: string[]; // data URLs, max 6
  createdAt: number;
}

export interface WeeklyReview {
  id: string;
  weekKey: string; // e.g. "2026-W47"
  weekStart: string; // YYYY-MM-DD (Monday)
  q1: string; // What went well?
  q2: string; // What mistakes did I repeat?
  q3: string; // What will I change next week?
  q4: string; // A+ setup audit / execution grade
  screenshots: string[]; // data URLs, max 6
  updatedAt: number;
}

export interface JotlySettings {
  theme: ThemeMode;
  accent: Accent;
  textScale: number; // 0.9 – 1.2
  mtSyncAutoCheck: boolean;
  lastMtSyncCheck: number;
}

export interface JotlyData {
  version: 1;
  settings: JotlySettings;
  accounts: Account[];
  /** 'all' aggregates every account */
  currentAccountId: string | 'all';
  trades: Trade[];
  strategies: Strategy[];
  weeklyReviews: WeeklyReview[];
}

export const EMOTIONS = [
  'Calm',
  'Focused',
  'Anxious/FOMO',
  'Greedy',
  'Revenge',
  'Frustrated',
] as const;

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'ETB', 'INR'] as const;

export const ACCOUNT_TYPES: AccountType[] = ['Eval', 'Funded', 'Live', 'Paper'];

export const SESSIONS: SessionName[] = ['Asia', 'London', 'NY AM', 'NY PM', 'Off-hours'];

export const MAX_SCREENSHOTS = 6;
