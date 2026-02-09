import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CreateGoalForm, StrategyRanking } from "@/lib/types";
import { STRATEGY_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  Loader2,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
  Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  recommended_strategy: string;
  ranking: StrategyRanking[];
  explanation: string;
  explanation_title: string;
}

function getStrategyLabel(tipo: string): string {
  return STRATEGY_LABELS[tipo] || tipo;
}

function buildMockRanking(estimatedValue: number, availableCapital: number, desiredTerm: number): StrategyRanking[] {
  return [
    {
      tipo: "consorcio",
      nome: "Consórcio",
      custo_total: estimatedValue * 1.12,
      parcela_mensal: (estimatedValue * 1.12) / desiredTerm,
      tempo_meses: desiredTerm,
      vantagens: [
        "Sem juros, apenas taxa de administração",
        "Parcelas mais acessíveis",
        "Poder de compra à vista após contemplação",
        "Ideal para quem pode esperar",
      ],
      score: 85,
    },
    {
      tipo: "renda_fixa",
      nome: "Renda Fixa",
      custo_total: estimatedValue,
      parcela_mensal: (estimatedValue - availableCapital) / desiredTerm,
      tempo_meses: Math.ceil(desiredTerm * 0.9),
      vantagens: [
        "Rendimento acima da inflação",
        "Selic alta favorece aplicações",
        "Compra à vista com desconto",
        "Segurança e previsibilidade",
      ],
      score: 78,
    },
    {
      tipo: "credito",
      nome: "Crédito",
      custo_total: estimatedValue * 1.45,
      parcela_mensal: (estimatedValue * 1.45) / desiredTerm,
      tempo_meses: desiredTerm,
      vantagens: [
        "Acesso imediato ao bem",
        "Parcelas fixas e previsíveis",
        "Ideal para urgência alta",
        "Possibilidade de amortização",
      ],
      score: 62,
    },
  ];
}

export default function NewGoal() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState<CreateGoalForm>({
    asset_type: "",
    estimated_value: 0,
    available_capital: 0,
    desired_term: 12,
    urgency_level: "media",
  });

  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!form.asset_type.trim()) {
      toast({ title: "Erro", description: "Informe o tipo de bem", variant: "destructive" });
      return;
    }
    if (form.estimated_value <= 0) {
      toast({ title: "Erro", description: "Informe um valor válido", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setAnalyzing(true);

    try {
      const { data: goalData, error: goalError } = await supabase
        .from("financial_goals")
        .insert({
          user_id: user.id,
          asset_type: form.asset_type,
          estimated_value: form.estimated_value,
          available_capital: form.available_capital,
          desired_term: form.desired_term,
          urgency_level: form.urgency_level,
        })
        .select()
        .single();

      if (goalError) throw goalError;

      setGoalId(goalData.id);
      await runAnalysis(goalData.id);
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o objetivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const runAnalysis = async (createdGoalId: string) => {
    // Simulated delay for analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const ranking = buildMockRanking(form.estimated_value, form.available_capital, form.desired_term);

    const analysisResult: AnalysisResult = {
      recommended_strategy: "consorcio",
      explanation_title: "Consórcio é a melhor opção no cenário atual",
      explanation: `Com a taxa Selic em 13,25% a.a., o custo do crédito está elevado, tornando financiamentos menos atrativos. Para um bem de ${formatCurrency(form.estimated_value)} com prazo de ${form.desired_term} meses, o consórcio oferece menor custo total devido à ausência de juros, sendo a opção mais eficiente no cenário econômico atual.`,
      ranking,
    };

    const { error } = await supabase.from("decision_results").insert([
      {
        goal_id: createdGoalId,
        recommended_strategy: analysisResult.recommended_strategy,
        ranking: JSON.parse(JSON.stringify(analysisResult.ranking)),
        explanation: analysisResult.explanation,
        explanation_title: analysisResult.explanation_title,
      },
    ]);

    if (error) {
      console.error("Error saving decision:", error);
    }

    setResult(analysisResult);
    setAnalyzing(false);
  };

  const handleSaveSimulation = () => {
    toast({
      title: "Simulação salva!",
      description: "Você pode acessar este objetivo a qualquer momento.",
    });
    navigate(`/objetivo/${goalId}`);
  };

  const handleConfirmInterest = (strategy: string) => {
    setSelectedStrategy(strategy);
    setShowInterestModal(true);
  };

  const handleInterestConfirmed = async () => {
    if (!user || !goalId) return;

    try {
      const { data: decisionData } = await supabase
        .from("decision_results")
        .select("id")
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase.from("partner_interest").insert({
        user_id: user.id,
        goal_id: goalId,
        decision_result_id: decisionData?.id,
        selected_strategy: selectedStrategy,
      });

      toast({
        title: "Interesse registrado!",
        description: "Seu interesse foi encaminhado para nossos parceiros.",
      });

      setShowInterestModal(false);
      navigate(`/objetivo/${goalId}`);
    } catch (error) {
      console.error("Error confirming interest:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu interesse.",
        variant: "destructive",
      });
    }
  };

  const updateField = <K extends keyof CreateGoalForm>(field: K, value: CreateGoalForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {!result ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-foreground">Criar Objetivo Financeiro</h1>
                <p className="text-muted-foreground">
                  Informe os detalhes do seu objetivo e receba uma análise personalizada
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="asset_type" className="text-foreground">Tipo de Bem / Objetivo</Label>
                    <Input
                      id="asset_type"
                      placeholder="Ex: Automóvel, Imóvel, Viagem..."
                      value={form.asset_type}
                      onChange={(e) => updateField("asset_type", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimated_value" className="text-foreground">Valor Estimado (R$)</Label>
                    <Input
                      id="estimated_value"
                      type="number"
                      placeholder="0,00"
                      value={form.estimated_value || ""}
                      onChange={(e) => updateField("estimated_value", parseFloat(e.target.value) || 0)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="available_capital" className="text-foreground">Capital Disponível (R$)</Label>
                    <Input
                      id="available_capital"
                      type="number"
                      placeholder="0,00"
                      value={form.available_capital || ""}
                      onChange={(e) => updateField("available_capital", parseFloat(e.target.value) || 0)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="desired_term" className="text-foreground">Prazo Desejado (meses)</Label>
                    <Input
                      id="desired_term"
                      type="number"
                      placeholder="12"
                      value={form.desired_term || ""}
                      onChange={(e) => updateField("desired_term", parseInt(e.target.value) || 12)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency_level" className="text-foreground">Nível de Urgência</Label>
                    <Select
                      value={form.urgency_level}
                      onValueChange={(value: any) => updateField("urgency_level", value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa - Posso esperar</SelectItem>
                        <SelectItem value="media">Média - Em alguns meses</SelectItem>
                        <SelectItem value="alta">Alta - Preciso em breve</SelectItem>
                        <SelectItem value="urgente">Urgente - Preciso agora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="hero" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Analisar Objetivo
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Analysis Result */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Análise concluída</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{result.explanation_title}</h1>
                <p className="text-muted-foreground">
                  {form.asset_type} • {formatCurrency(form.estimated_value)}
                </p>
              </div>

              {/* Strategy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {result.ranking.map((strategy, index) => (
                  <div
                    key={strategy.tipo}
                    className={`strategy-card ${index === 0 ? "recommended" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {index === 0 ? (
                          <Award className="h-5 w-5 text-primary" />
                        ) : (
                          <Target className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold mb-4">{strategy.nome}</h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Custo total:</span>
                        <span className="font-medium">{formatCurrency(strategy.custo_total)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Parcela:</span>
                        <span className="font-medium">
                          {formatCurrency(strategy.parcela_mensal)}/mês
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Tempo:</span>
                        <span className="font-medium">{strategy.tempo_meses} meses</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Vantagens:</p>
                      <ul className="space-y-1">
                        {strategy.vantagens.slice(0, 3).map((vantagem, i) => (
                          <li key={i} className="text-xs flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                            <span>{vantagem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant={index === 0 ? "hero" : "outline"}
                      className="w-full"
                      onClick={() => handleConfirmInterest(strategy.tipo)}
                    >
                      Tenho interesse
                    </Button>
                  </div>
                ))}
              </div>

              {/* Explanation Block */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6 mb-8">
                <h3 className="font-semibold text-lg mb-3">Justificativa da Análise</h3>
                <p className="text-muted-foreground">{result.explanation}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" onClick={() => navigate("/objetivos")}>
                  Ver todos objetivos
                </Button>
                <Button variant="hero" size="lg" onClick={handleSaveSimulation}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salvar simulação
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Interest Confirmation Modal */}
      <Dialog open={showInterestModal} onOpenChange={setShowInterestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirmar Interesse
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-4">
              <p>
                Um relatório com sua análise será enviado para um{" "}
                <strong>parceiro financeiro credenciado</strong> da CAPITALYS.
              </p>
              <p>
                A CAPITALYS <strong>não realiza contratação direta</strong> de produtos financeiros.
                Somos uma plataforma de apoio à decisão.
              </p>
              <p>
                O parceiro poderá entrar em contato para dar continuidade ao processo de{" "}
                {getStrategyLabel(selectedStrategy)}.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowInterestModal(false)}>
              Cancelar
            </Button>
            <Button variant="hero" onClick={handleInterestConfirmed}>
              Confirmar interesse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
