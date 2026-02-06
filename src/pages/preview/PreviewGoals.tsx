import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Plus, Clock, ArrowRight } from "lucide-react";
import { mockGoals } from "@/lib/mockData";
import { URGENCY_LABELS } from "@/lib/types";

export default function PreviewGoals() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Meus Objetivos</h1>
          <p className="text-muted-foreground">
            Gerencie seus objetivos financeiros e acompanhe as recomendações
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/preview/novo-objetivo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Objetivo
          </Link>
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {mockGoals.map((goal) => (
          <Link
            key={goal.id}
            to={`/preview/objetivo/${goal.id}`}
            className="block"
          >
            <div className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{goal.asset_type}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(goal.urgency_level)}`}>
                        {URGENCY_LABELS[goal.urgency_level] || goal.urgency_level}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor estimado</p>
                        <p className="font-medium">{formatCurrency(goal.estimated_value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Capital disponível</p>
                        <p className="font-medium">{formatCurrency(goal.available_capital)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prazo</p>
                        <p className="font-medium">{goal.desired_term} meses</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Criado em</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(goal.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground mt-2" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total de objetivos ativos</span>
          <span className="font-medium">{mockGoals.length}</span>
        </div>
      </div>
    </div>
  );
}
