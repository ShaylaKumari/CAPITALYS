import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { FinancialGoal, DecisionResult, StrategyRanking } from "@/lib/types";
import { URGENCY_LABELS, STRATEGY_LABELS } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Target,
  Plus,
  ArrowRight,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function getStrategyLabel(strategy: string): string {
  return STRATEGY_LABELS[strategy] || strategy;
}

export default function Goals() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<(FinancialGoal & { decision?: DecisionResult })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data: goalsData, error } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (goalsData) {
        const goalsWithDecisions = await Promise.all(
          goalsData.map(async (goal) => {
            const { data: decisionData } = await supabase
              .from("decision_results")
              .select("*")
              .eq("goal_id", goal.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              ...goal,
              decision: decisionData
                ? {
                    ...decisionData,
                    ranking: decisionData.ranking as unknown as StrategyRanking[],
                  }
                : undefined,
            };
          }),
        );

        setGoals(goalsWithDecisions as (FinancialGoal & { decision?: DecisionResult })[]);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
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

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Meus Objetivos</h1>
              <p className="text-muted-foreground">
                Gerencie e acompanhe seus objetivos financeiros
              </p>
            </div>
            <Button variant="hero" onClick={() => navigate("/novo-objetivo")}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Objetivo
            </Button>
          </div>

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum objetivo cadastrado</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crie seu primeiro objetivo financeiro e receba uma análise comparativa entre as
                melhores estratégias para o cenário econômico atual.
              </p>
              <Button variant="hero" size="lg" onClick={() => navigate("/novo-objetivo")}>
                <Plus className="h-5 w-5 mr-2" />
                Criar meu primeiro objetivo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="strategy-card cursor-pointer"
                  onClick={() => navigate(`/objetivo/${goal.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    {goal.is_active ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success/20 text-success">
                        <CheckCircle className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        Arquivado
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{goal.asset_type}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="font-medium">{formatCurrency(goal.estimated_value)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prazo</span>
                      <span className="font-medium">{goal.desired_term} meses</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Urgência</span>
                      <span className="font-medium">{URGENCY_LABELS[goal.urgency_level]}</span>
                    </div>
                  </div>

                  {goal.decision && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Estratégia recomendada</p>
                      <p className="font-semibold text-primary">
                        {getStrategyLabel(goal.decision.recommended_strategy)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(goal.created_at)}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
