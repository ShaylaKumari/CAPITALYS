import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Clock,
  Wallet,
  PiggyBank,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { mockGoals, mockDecisionResult, mockDecisionHistory } from "@/lib/mockData";
import { URGENCY_LABELS } from "@/lib/types";
import type { StrategyRanking } from "@/lib/types";

export default function PreviewGoalDetail() {
  const { id } = useParams();
  
  // Use first goal as default for preview
  const goal = mockGoals.find(g => g.id === id) || mockGoals[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getStrategyIcon = (tipo: string) => {
    switch (tipo) {
      case "financiamento": return Wallet;
      case "consorcio": return Target;
      case "investimento": return PiggyBank;
      default: return TrendingUp;
    }
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "alta": return <TrendingUp className="h-4 w-4 text-red-400" />;
      case "queda": return <TrendingDown className="h-4 w-4 text-green-400" />;
      default: return <Minus className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "baixa": return "bg-green-500/20 text-green-400";
      case "media": return "bg-yellow-500/20 text-yellow-400";
      case "alta": return "bg-orange-500/20 text-orange-400";
      case "urgente": return "bg-red-500/20 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          to="/preview/objetivos" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para objetivos
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{goal.asset_type}</h1>
              <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(goal.urgency_level)}`}>
                {URGENCY_LABELS[goal.urgency_level] || goal.urgency_level}
              </span>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Criado em {formatDate(goal.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Goal Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Valor estimado</p>
          <p className="text-xl font-semibold">{formatCurrency(goal.estimated_value)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Capital disponível</p>
          <p className="text-xl font-semibold">{formatCurrency(goal.available_capital)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Prazo desejado</p>
          <p className="text-xl font-semibold">{goal.desired_term} meses</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Valor a financiar</p>
          <p className="text-xl font-semibold">{formatCurrency(goal.estimated_value - goal.available_capital)}</p>
        </div>
      </div>

      {/* Current Recommendation */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Recomendação Atual</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {mockDecisionResult.ranking.map((strategy: StrategyRanking, index: number) => {
            const Icon = getStrategyIcon(strategy.tipo);
            const isRecommended = index === 0;

            return (
              <div
                key={strategy.tipo}
                className={`relative rounded-lg border p-4 ${
                  isRecommended ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-2 left-3 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                    Melhor opção
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <Icon className={`h-4 w-4 ${isRecommended ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium text-sm">{strategy.nome}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo total</span>
                    <span>{formatCurrency(strategy.custo_total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parcela</span>
                    <span>{formatCurrency(strategy.parcela_mensal)}/mês</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-lg bg-muted/30">
          <h3 className="font-medium mb-2">{mockDecisionResult.explanation_title}</h3>
          <p className="text-sm text-muted-foreground">{mockDecisionResult.explanation}</p>
        </div>
      </div>

      {/* Decision History */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold mb-6">Histórico de Alterações</h2>
        
        <div className="space-y-4">
          {mockDecisionHistory.map((history, index) => (
            <div 
              key={history.id} 
              className="relative pl-8 pb-6 border-l-2 border-border last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {history.previous_strategy} → {history.new_strategy}
                    </span>
                    {history.indicator_changed && (
                      <span className="text-xs px-2 py-0.5 rounded bg-chart-selic/20 text-chart-selic">
                        {history.indicator_changed.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(history.changed_at)}
                  </span>
                </div>

                {history.indicator_changed && (
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <span className="text-muted-foreground">Indicador:</span>
                    <div className="flex items-center gap-2">
                      <span>{history.old_indicator_value}%</span>
                      <TrendingDown className="h-4 w-4 text-green-400" />
                      <span className="font-medium">{history.new_indicator_value}%</span>
                    </div>
                  </div>
                )}

                {history.reason && (
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {history.reason}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Initial creation */}
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-card border-2 border-accent flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-accent" />
            </div>
            <div className="text-sm text-muted-foreground">
              Objetivo criado em {formatDate(goal.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Button variant="outline" asChild>
          <Link to="/preview/objetivos">Voltar</Link>
        </Button>
        <Button variant="hero">
          Atualizar análise
        </Button>
      </div>
    </div>
  );
}
