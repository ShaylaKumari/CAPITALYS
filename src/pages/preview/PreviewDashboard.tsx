import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Lightbulb,
  ArrowRight,
  Clock
} from "lucide-react";
import { mockProfile, mockGoals, mockInsight, mockIndicators } from "@/lib/mockData";

export default function PreviewDashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const selicIndicator = mockIndicators.find(i => i.indicator_type === "selic");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {mockProfile.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo do seu painel financeiro
        </p>
      </div>

      {/* Insight Card */}
      <div className="mb-8 p-6 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/20">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">Insight do Cenário</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                {mockInsight.scenario_label}
              </span>
            </div>
            <p className="text-muted-foreground">{mockInsight.insight_text}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="indicator-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Objetivos Ativos</p>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <p className="stat-value">{mockGoals.length}</p>
          <Link to="/preview/objetivos" className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="indicator-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Taxa Selic Atual</p>
            <TrendingUp className="h-5 w-5 text-chart-selic" />
          </div>
          <p className="stat-value">
            {selicIndicator?.current_value.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">a.a.</p>
        </div>

        <Link to="/preview/novo-objetivo" className="indicator-card cursor-pointer hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Criar Objetivo</p>
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <p className="text-lg font-semibold text-primary">Novo objetivo</p>
          <p className="text-sm text-muted-foreground mt-2">
            Clique para começar
          </p>
        </Link>
      </div>

      {/* Recent Goals */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Seus Objetivos Recentes</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/preview/objetivos">Ver todos</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {mockGoals.map((goal) => (
            <Link
              key={goal.id}
              to={`/preview/objetivo/${goal.id}`}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{goal.asset_type}</p>
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
