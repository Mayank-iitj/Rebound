export type Role = 'user' | 'analyst' | 'clinician' | 'admin';
export type Locale = 'en' | 'ar' | 'hi';
export type ActionLevel = 'none' | 'min' | 'std' | 'stretch';
export type UserState = 'ON_TRACK' | 'AT_RISK' | 'LAPSED' | 'RESTARTING' | 'PAUSED';

export interface ActionItem {
  id: string;
  catalog_id: string;
  title: Record<Locale, string>;
  cue: Record<Locale, string>;
  window: { start: string; end: string };
  levels: { min: number; std: number; stretch: number };
  fallback_catalog_id?: string;
  completed?: ActionLevel | null;
}

export interface TodayScreenResponse {
  day: string;
  state: UserState;
  capacity: {
    value: number;
    inputs: string[];
    explanation: string;
  };
  actions: ActionItem[];
  consistency_28d: {
    score: number;
    eligible_days: number;
    grace_days_used: number;
    grace_days_left: number;
  };
  restart_available: boolean;
  streak_exists: false;
  nudge_budget: { used: number; limit: number };
}

export interface CrashTestScenarioResult {
  id: string;
  title: Record<Locale, string>;
  survived: boolean;
  survive_rate: number;
  dominant_blocker?: string | null;
  description: string;
}

export interface CrashTestPatch {
  id: string;
  type: string;
  title: string;
  description: string;
  effort_cost: number;
  new_survivability: number;
}

export interface CrashTestResponse {
  survivability: {
    survived: number;
    total: number;
    score: number;
  };
  scenarios: CrashTestScenarioResult[];
  patches: CrashTestPatch[];
  assumptions_url: string;
  partial: boolean;
}

export interface RecoveryRuleItem {
  id: string;
  text: string;
  trigger: Record<string, any>;
  action: Record<string, any>;
}

export interface GovernorEvaluationResponse {
  decision: 'allow' | 'modify' | 'block';
  rule_ids: string[];
  reason: string;
  policy_hash: string;
  policy_version: string;
  modified_content?: string | null;
}

