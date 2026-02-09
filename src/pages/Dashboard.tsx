import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { FinancialGoal, Insight, IndicatorAnalysis } from "@/lib/types";
import { formatCurrency, formatDate, getGreeting } from "@/lib/format";
import {
  Target,
  Plus,
  Lightbulb,
  ArrowRight,
  Clock,
  Loader2,
  User
} from "lucide-react";

function getLatestByType(items: IndicatorAnalysis[]): IndicatorAnalysis[] {
  const latest = items.reduce(
    (acc, item) => {
      const existing = acc[item.indicator_type];
      if (!existing || new Date(item.created_at) > new Date(existing.created_at)) {
        acc[item.indicator_type] = item;
      }
      return acc;
    },
    {} as Record<string, IndicatorAnalysis>,
  );
  return Object.values(latest);
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [indicators, setIndicators] = useState<IndicatorAnalysis[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // nome do Google (sem depender de tabela users/profile)
  const firstName = useMemo(() => {
    const meta: any = user?.user_metadata ?? {};
    const full = (meta.full_name || meta.name || user?.email || "") as string;
    return full.split(" ")[0] || "";
  }, [user]);

  // guard: se não estiver logado, manda pro auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // carrega dados do dashboard quando tiver user
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setPageLoading(true);
      try {
        const [goalsResult, insightResult, indicatorsResult] = await Promise.all([
          supabase
            .from("financial_goals")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(5),

          supabase
            .from("insights")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),

          supabase
            .from("indicator_analysis")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (goalsResult.data) setGoals(goalsResult.data as FinancialGoal[]);
        if (insightResult.data) setInsight(insightResult.data as Insight);
        if (indicatorsResult.data) {
          setIndicators(getLatestByType(indicatorsResult.data as IndicatorAnalysis[]));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // loader geral (auth + dados)
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ainda sem user? não renderiza (useEffect já redireciona)
  if (!user) return null;

  const selicValue = indicators.find((i) => i.indicator_type === "selic")?.current_value;

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              {getGreeting()}, {firstName}!
            </h1>
            <p className="text-muted-foreground">Aqui está um resumo do seu painel financeiro</p>
          </div>

          {/* Insight Card */}
          {insight && (
            <div className="mb-8 p-6 rounded-xl bg-card border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">Cenário {insight.scenario_label.charAt(0).toUpperCase() + insight.scenario_label.slice(1)}</h3>
                    {/* <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {insight.scenario_label}
                    </span> */}
                  </div>
                  <p className="text-muted-foreground">
                    {insight.scenario_summary || insight.insight_text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="indicator-card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Objetivos Ativos</p>
                <Target className="h-5 w-5 text-primary" />
              </div>
              <p className="stat-value text-foreground">{goals.length}</p>
              <Link
                to="/objetivos"
                className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div
              className="indicator-card cursor-pointer hover:border-primary/50 transition"
              onClick={() => navigate("/perfil")}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Meu Perfil
                </p>
                <User className="h-5 w-5 text-primary" />
              </div>

              <p className="text-lg font-semibold text-foreground">
                Perfil financeiro
              </p>

              <p className="text-sm text-primary mt-2">
                Ver e editar informações
              </p>
            </div>

            <div
              className="indicator-card cursor-pointer hover:border-primary/50"
              onClick={() => navigate("/novo-objetivo")}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Criar Objetivo</p>
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground">Novo objetivo</p>
              <p className="text-sm text-primary mt-2">Clique para começar</p>
            </div>
          </div>

          {/* Recent Goals */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Seus Objetivos Recentes</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/objetivos">Ver todos</Link>
              </Button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-foreground">Nenhum objetivo ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro objetivo financeiro para receber recomendações personalizadas
                </p>
                <Button variant="hero" onClick={() => navigate("/novo-objetivo")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar objetivo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/objetivo/${goal.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{goal.asset_type.charAt(0).toUpperCase() + goal.asset_type.slice(1)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(goal.estimated_value)} • {goal.desired_term} meses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(goal.created_at)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
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