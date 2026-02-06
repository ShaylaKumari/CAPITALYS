// Mock data for UI preview (no authentication required)

import type {
  Profile,
  FinancialGoal,
  Insight,
  IndicatorAnalysis,
  DecisionResult,
  DecisionHistory,
  UserFinancialProfile,
} from "./types";

export const mockProfile: Profile = {
  id: "mock-profile-1",
  user_id: "mock-user-1",
  email: "joao.silva@exemplo.com",
  full_name: "João Silva",
  avatar_url: null,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-02-01T14:30:00Z",
};

export const mockUserFinancialProfile: UserFinancialProfile = {
  id: "mock-fp-1",
  user_id: "mock-user-1",
  income_range: "R$ 5.000 - R$ 10.000",
  credit_status: "score_alto",
  risk_profile: "moderado",
  income_stability: "estavel",
  dependents: 2,
  profession: "Analista de Sistemas",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-02-01T14:30:00Z",
};

export const mockInsight: Insight = {
  id: "mock-insight-1",
  scenario_label: "Cenário Favorável",
  insight_text:
    "Com a Selic em trajetória de queda e IPCA controlado, o momento é propício para financiamentos de longo prazo. Considere aproveitar as taxas atuais antes de possíveis ajustes.",
  scenario_summary: "Selic em queda • IPCA controlado • PIB estável",
  created_at: new Date().toISOString(),
};

export const mockIndicators: IndicatorAnalysis[] = [
  {
    id: "mock-ind-1",
    indicator_type: "selic",
    current_value: 10.75,
    variation: -0.5,
    trend: "queda",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-ind-2",
    indicator_type: "ipca",
    current_value: 4.62,
    variation: 0.12,
    trend: "estavel",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-ind-3",
    indicator_type: "pib_crescimento",
    current_value: 2.9,
    variation: 0.3,
    trend: "alta",
    created_at: new Date().toISOString(),
  },
];

export const mockGoals: FinancialGoal[] = [
  {
    id: "mock-goal-1",
    user_id: "mock-user-1",
    asset_type: "Automóvel",
    estimated_value: 85000,
    available_capital: 25000,
    desired_term: 36,
    urgency_level: "media",
    is_active: true,
    created_at: "2024-01-20T09:00:00Z",
    updated_at: "2024-02-05T11:30:00Z",
  },
  {
    id: "mock-goal-2",
    user_id: "mock-user-1",
    asset_type: "Imóvel",
    estimated_value: 450000,
    available_capital: 90000,
    desired_term: 240,
    urgency_level: "baixa",
    is_active: true,
    created_at: "2024-01-25T14:00:00Z",
    updated_at: "2024-02-01T08:00:00Z",
  },
  {
    id: "mock-goal-3",
    user_id: "mock-user-1",
    asset_type: "Equipamento Profissional",
    estimated_value: 15000,
    available_capital: 5000,
    desired_term: 12,
    urgency_level: "alta",
    is_active: true,
    created_at: "2024-02-01T16:00:00Z",
    updated_at: "2024-02-05T10:00:00Z",
  },
];

export const mockDecisionResult: DecisionResult = {
  id: "mock-decision-1",
  goal_id: "mock-goal-1",
  recommended_strategy: "Financiamento",
  ranking: [
    {
      tipo: "financiamento",
      nome: "Financiamento Bancário",
      custo_total: 102500,
      parcela_mensal: 2847.22,
      tempo_meses: 36,
      vantagens: [
        "Aquisição imediata do bem",
        "Taxas competitivas com Selic em queda",
        "Possibilidade de quitação antecipada",
        "Bem como garantia reduz juros",
      ],
      score: 92,
    },
    {
      tipo: "consorcio",
      nome: "Consórcio",
      custo_total: 91800,
      parcela_mensal: 2127.78,
      tempo_meses: 36,
      vantagens: [
        "Sem juros, apenas taxa administrativa",
        "Parcelas menores",
        "Disciplina financeira",
        "Possibilidade de lance",
      ],
      score: 78,
    },
    {
      tipo: "investimento",
      nome: "Investimento + Compra à Vista",
      custo_total: 85000,
      parcela_mensal: 1666.67,
      tempo_meses: 51,
      vantagens: [
        "Menor custo total",
        "Sem dívidas",
        "Rendimento sobre capital",
        "Poder de negociação à vista",
      ],
      score: 65,
    },
  ],
  explanation:
    "Com base no seu perfil moderado e na urgência média declarada, o financiamento oferece o melhor equilíbrio entre custo e tempo de aquisição. A Selic em queda (10.75% a.a.) torna as taxas de financiamento mais atrativas, e seu capital disponível de R$ 25.000 como entrada reduz significativamente o valor financiado.",
  explanation_title: "Por que Financiamento?",
  analysis_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

export const mockDecisionHistory: DecisionHistory[] = [
  {
    id: "mock-history-1",
    goal_id: "mock-goal-1",
    previous_strategy: "Consórcio",
    new_strategy: "Financiamento",
    previous_explanation: "Com Selic a 11.25%, consórcio era mais vantajoso",
    new_explanation: "Queda da Selic torna financiamento mais competitivo",
    indicator_changed: "selic",
    old_indicator_value: 11.25,
    new_indicator_value: 10.75,
    reason:
      "Redução de 0.5 p.p. na taxa Selic tornou financiamento mais atrativo",
    changed_at: "2024-02-05T08:00:00Z",
  },
  {
    id: "mock-history-2",
    goal_id: "mock-goal-1",
    previous_strategy: "Investimento",
    new_strategy: "Consórcio",
    previous_explanation: "IPCA alto favorecia investimentos",
    new_explanation: "Estabilização do IPCA reduziu atratividade de renda fixa",
    indicator_changed: "ipca",
    old_indicator_value: 5.19,
    new_indicator_value: 4.62,
    reason: "Queda no IPCA reduziu rendimento real de investimentos",
    changed_at: "2024-01-28T14:30:00Z",
  },
];
