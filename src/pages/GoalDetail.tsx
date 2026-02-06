import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { FinancialGoal, DecisionResult, DecisionHistory, StrategyRanking } from "@/lib/types";
import { URGENCY_LABELS, STRATEGY_LABELS } from "@/lib/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import {
  Loader2,
  Target,
  ArrowLeft,
  Clock,
  CheckCircle,
  History,
  AlertCircle,
} from "lucide-react";

function getStrategyLabel(tipo: string): string {
  return STRATEGY_LABELS[tipo] || tipo;
}

export default function GoalDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();

  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [history, setHistory] = useState<DecisionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchGoalData();
    }
  }, [user, id]);

  const fetchGoalData = async () => {
    try {
      const { data: goalData, error: goalError } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("id", id)
        .eq("user_id", user!.id)
        .single();

      if (goalError) throw goalError;
      setGoal(goalData as FinancialGoal);

      const { data: decisionData } = await supabase
        .from("decision_results")
        .select("*")
        .eq("goal_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (decisionData) {
        setDecision({
          ...decisionData,
          ranking: decisionData.ranking as unknown as StrategyRanking[],
        } as DecisionResult);
      }

      const { data: historyData } = await supabase
        .from("decision_history")
        .select("*")
        .eq("goal_id", id)
        .order("changed_at", { ascending: false });

      if (historyData) {
        setHistory(historyData as DecisionHistory[]);
      }
    } catch (error) {
      console.error("Error fetching goal data:", error);
      navigate("/objetivos");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Objetivo não encontrado</h2>
          <Button variant="outline" onClick={() => navigate("/objetivos")}>
            Voltar aos objetivos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/objetivos")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos objetivos
          </Button>

          {/* Goal Header */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{goal.asset_type}</h1>
                  <p className="text-muted-foreground">
                    Criado em {formatDate(goal.created_at)}
                  </p>
                </div>
              </div>
              {goal.is_active ? (
                <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-success/20 text-success">
                  <CheckCircle className="h-4 w-4" />
                  Ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Arquivado
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor estimado</p>
                <p className="text-lg font-semibold">{formatCurrency(goal.estimated_value)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Capital disponível</p>
                <p className="text-lg font-semibold">{formatCurrency(goal.available_capital)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prazo desejado</p>
                <p className="text-lg font-semibold">{goal.desired_term} meses</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Urgência</p>
                <p className="text-lg font-semibold">{URGENCY_LABELS[goal.urgency_level]}</p>
              </div>
            </div>
          </div>

          {/* Decision Result */}
          {decision && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Resultado da Análise</h2>

              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6 mb-6">
                <h3 className="font-semibold text-lg mb-2">{decision.explanation_title}</h3>
                <p className="text-muted-foreground">{decision.explanation}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Análise realizada em {formatDate(decision.analysis_date)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {decision.ranking.map((strategy, index) => (
                  <div
                    key={strategy.tipo}
                    className={`rounded-xl border p-5 ${
                      index === 0
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      {index === 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                          Recomendado
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold mb-3">{strategy.nome}</h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Custo total</span>
                        <span className="font-medium">
                          {formatCurrency(strategy.custo_total)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parcela</span>
                        <span className="font-medium">
                          {formatCurrency(strategy.parcela_mensal)}/mês
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo</span>
                        <span className="font-medium">{strategy.tempo_meses} meses</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision History */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Histórico de Alterações</h2>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma alteração registrada ainda. Quando os indicadores mudarem e a
                  estratégia for recalculada, o histórico aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {history.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          Estratégia alterada: {getStrategyLabel(item.previous_strategy)} →{" "}
                          {getStrategyLabel(item.new_strategy)}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(item.changed_at)}
                      </p>
                    </div>
                    {item.indicator_changed && (
                      <div className="bg-muted/30 rounded-lg p-3 text-sm">
                        <p className="text-muted-foreground">
                          Indicador alterado:{" "}
                          <span className="font-medium">{item.indicator_changed}</span>
                          {item.old_indicator_value !== null &&
                            item.new_indicator_value !== null && (
                              <span className="ml-2">
                                ({item.old_indicator_value}% → {item.new_indicator_value}%)
                              </span>
                            )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
