import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Target, 
  TrendingUp, 
  Wallet, 
  PiggyBank,
  CheckCircle,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { mockDecisionResult, mockIndicators } from "@/lib/mockData";
import type { StrategyRanking } from "@/lib/types";

const assetTypes = [
  "Automóvel",
  "Imóvel",
  "Motocicleta",
  "Equipamento Profissional",
  "Reforma",
  "Viagem",
  "Educação",
  "Outro",
];

export default function PreviewNewGoal() {
  const [step, setStep] = useState<"form" | "result">("form");
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestConfirmed, setInterestConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    asset_type: "",
    estimated_value: "",
    available_capital: "",
    desired_term: "",
    urgency_level: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("result");
  };

  const getStrategyIcon = (tipo: string) => {
    switch (tipo) {
      case "financiamento": return Wallet;
      case "consorcio": return Target;
      case "investimento": return PiggyBank;
      default: return TrendingUp;
    }
  };

  const getStrategyColor = (index: number) => {
    if (index === 0) return "border-primary bg-primary/5";
    return "border-border";
  };

  const selicIndicator = mockIndicators.find(i => i.indicator_type === "selic");

  const handleConfirmInterest = () => {
    setInterestConfirmed(true);
    setShowInterestModal(false);
  };

  if (step === "result") {
    return (
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/preview/objetivos" className="hover:text-foreground">Objetivos</Link>
            <span>/</span>
            <span>Análise</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Análise de Estratégias</h1>
          <p className="text-muted-foreground">
            Com base no cenário atual e seu perfil, estas são as melhores opções
          </p>
        </div>

        {/* Current Indicators */}
        <div className="mb-8 p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground mb-3">Indicadores utilizados na análise</p>
          <div className="flex gap-6">
            {mockIndicators.map((ind) => (
              <div key={ind.indicator_type} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {ind.indicator_type === "selic" ? "Selic" : ind.indicator_type === "ipca" ? "IPCA" : "PIB"}:
                </span>
                <span className="font-medium">{ind.current_value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mockDecisionResult.ranking.map((strategy: StrategyRanking, index: number) => {
            const Icon = getStrategyIcon(strategy.tipo);
            const isRecommended = index === 0;

            return (
              <div
                key={strategy.tipo}
                className={`relative rounded-xl border-2 p-6 transition-all ${getStrategyColor(index)}`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Recomendado
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isRecommended ? "bg-primary/20" : "bg-muted"}`}>
                    <Icon className={`h-5 w-5 ${isRecommended ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{strategy.nome}</h3>
                    <p className="text-xs text-muted-foreground">Score: {strategy.score}/100</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Custo total</span>
                    <span className="font-medium">{formatCurrency(strategy.custo_total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Parcela mensal</span>
                    <span className="font-medium">{formatCurrency(strategy.parcela_mensal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tempo</span>
                    <span className="font-medium">{strategy.tempo_meses} meses</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Vantagens</p>
                  <ul className="space-y-1">
                    {strategy.vantagens.slice(0, 3).map((v, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-2">{mockDecisionResult.explanation_title}</h3>
          <p className="text-muted-foreground">{mockDecisionResult.explanation}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to="/preview/objetivos">Ver meus objetivos</Link>
          </Button>
          {!interestConfirmed ? (
            <Button variant="hero" onClick={() => setShowInterestModal(true)}>
              Tenho interesse
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="hero" disabled className="bg-accent">
              <CheckCircle className="h-4 w-4 mr-2" />
              Interesse registrado
            </Button>
          )}
        </div>

        {/* Interest Confirmation Modal */}
        <Dialog open={showInterestModal} onOpenChange={setShowInterestModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Confirmar Interesse
              </DialogTitle>
              <DialogDescription className="text-left space-y-4 pt-4">
                <p>
                  Um relatório detalhado com sua análise será enviado para um{" "}
                  <strong>parceiro financeiro credenciado</strong> da CAPITALYS.
                </p>
                <p>
                  A CAPITALYS <strong>não realiza contratação direta</strong> de produtos financeiros. 
                  O parceiro entrará em contato para apresentar as melhores opções disponíveis no mercado.
                </p>
                <p className="text-sm text-muted-foreground">
                  Seus dados serão tratados conforme nossa política de privacidade.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowInterestModal(false)}>
                Cancelar
              </Button>
              <Button variant="hero" onClick={handleConfirmInterest}>
                Confirmar interesse
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criar Novo Objetivo</h1>
        <p className="text-muted-foreground">
          Preencha os dados do seu objetivo e receba uma análise personalizada
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="asset_type">Tipo de bem ou objetivo</Label>
            <Select 
              value={formData.asset_type} 
              onValueChange={(value) => setFormData({ ...formData, asset_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_value">Valor estimado (R$)</Label>
              <Input
                id="estimated_value"
                type="number"
                placeholder="85000"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="available_capital">Capital disponível (R$)</Label>
              <Input
                id="available_capital"
                type="number"
                placeholder="25000"
                value={formData.available_capital}
                onChange={(e) => setFormData({ ...formData, available_capital: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desired_term">Prazo desejado (meses)</Label>
              <Input
                id="desired_term"
                type="number"
                placeholder="36"
                value={formData.desired_term}
                onChange={(e) => setFormData({ ...formData, desired_term: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency_level">Nível de urgência</Label>
              <Select 
                value={formData.urgency_level} 
                onValueChange={(value) => setFormData({ ...formData, urgency_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Current Scenario Info */}
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-sm font-medium text-accent mb-2">Cenário atual</p>
          <p className="text-sm text-muted-foreground">
            Selic a {selicIndicator?.current_value}% a.a. • Análise será baseada nos indicadores mais recentes
          </p>
        </div>

        <Button type="submit" variant="hero" className="w-full">
          Analisar estratégias
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </form>
    </div>
  );
}
