// CAPITALYS Type Definitions

export interface EconomicIndicator {
  id: string;
  indicator_type: 'selic' | 'ipca' | 'pib_crescimento';
  value: number;
  reference_date: string;
  source: string | null;
  created_at: string;
}

export interface IndicatorAnalysis {
  id: string;
  indicator_type: 'selic' | 'ipca' | 'pib_crescimento';
  current_value: number;
  variation: number | null;
  trend: 'alta' | 'queda' | 'estavel' | null;
  created_at: string;
}

export interface Insight {
  id: string;
  scenario_label: string;
  insight_text: string;
  scenario_summary: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type IncomeRange =
  | "ate_2k"
  | "2k_4k"
  | "4k_6k"
  | "6k_8k"
  | "8k_12k"
  | "acima_12k";

export type CreditStatus = "excelente" | "bom" | "regular" | "baixo";

export type RiskProfile = "conservador" | "moderado" | "agressivo";

export type IncomeStability =
  | "clt"
  | "servidor_publico"
  | "pj"
  | "autonomo"
  | "estagio"
  | "nao_informado";

export interface UserFinancialProfile {
  id: string;
  user_id: string;
  income_range: IncomeRange | null;
  credit_status: CreditStatus | null;
  risk_profile: RiskProfile | null;
  income_stability: IncomeStability | null;
  dependents: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  asset_type: string;
  estimated_value: number;
  available_capital: number;
  desired_term: number;
  urgency_level: 'baixa' | 'media' | 'alta' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StrategyRanking {
  tipo: string;
  nome: string;
  custo_total: number;
  parcela_mensal: number;
  tempo_meses: number;
  vantagens: string[];
  score: number;
}

export interface DecisionResult {
  id: string;
  goal_id: string;
  recommended_strategy: string;
  ranking: StrategyRanking[];
  explanation: string;
  explanation_title: string | null;
  analysis_date: string;
  created_at: string;
}

export interface DecisionHistory {
  id: string;
  goal_id: string;
  previous_strategy: string;
  new_strategy: string;
  previous_explanation: string | null;
  new_explanation: string | null;
  indicator_changed: string | null;
  old_indicator_value: number | null;
  new_indicator_value: number | null;
  reason: string | null;
  changed_at: string;
}

export interface CreateGoalForm {
  asset_type: string;
  estimated_value: number;
  available_capital: number;
  desired_term: number;
  urgency_level: 'baixa' | 'media' | 'alta' | null;
}

// Indicator display names
export const INDICATOR_NAMES: Record<string, string> = {
  selic: 'Taxa Selic',
  ipca: 'IPCA',
  pib_crescimento: 'PIB',
};

export const INDICATOR_UNITS: Record<string, string> = {
  selic: '%',
  ipca: '%',
  pib_crescimento: '%',
};

export const URGENCY_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export const RISK_PROFILE_LABELS: Record<RiskProfile, string> = {
  conservador: "Conservador",
  moderado: "Moderado",
  agressivo: "Agressivo",
};

export const INCOME_STABILITY_LABELS: Record<IncomeStability, string> = {
  clt: "CLT",
  servidor_publico: "Servidor Público",
  pj: "PJ",
  autonomo: "Autônomo",
  estagio: "Estágio",
  nao_informado: "Não informado",
};

export const CREDIT_STATUS_LABELS: Record<CreditStatus, string> = {
  excelente: "Excelente",
  bom: "Bom",
  regular: "Regular",
  baixo: "Baixo",
};

export const INCOME_RANGE_LABELS: Record<IncomeRange, string> = {
  ate_2k: "Até R$ 2.000",
  "2k_4k": "R$ 2.000 – R$ 4.000",
  "4k_6k": "R$ 4.000 – R$ 6.000",
  "6k_8k": "R$ 6.000 – R$ 8.000",
  "8k_12k": "R$ 8.000 – R$ 12.000",
  acima_12k: "Acima de R$ 12.000",
};

export const STRATEGY_LABELS: Record<string, string> = {
  emprestimo: 'Empréstimo',
  consorcio: 'Consórcio',
  renda_fixa: 'Renda Fixa',
};
