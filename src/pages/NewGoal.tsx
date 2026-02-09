import { useState, useEffect, useRef, useMemo } from "react";
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
import type { CreateGoalForm } from "@/lib/types";
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
  User as UserIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RealtimeChannel } from "@supabase/supabase-js";

type RankingRowDB = {
  tipo?: string; // "Consórcio" | "Investimento" | "Empréstimo"
  custoTotal?: string; // "R$ 55.000,00"
  parcelaMensal?: string; // "R$ 1.527,78"
  tempoParaConquista?: string; // "9 a 36 meses" | "Imediato"
};

type ResultForUI = {
  id: string;
  goal_id: string;
  recommended_strategy: string; // "Consórcio"
  ranking: RankingRowDB[];
  explanation: string;
  explanation_title: string | null;
  analysis_date: string;
  created_at: string;
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  imovel: "Imóvel",
  reforma: "Reforma",
  veiculo: "Veículo",
  equipamentos: "Equipamentos",
  viagem: "Viagem",
  outros: "Outros",
};

function getAssetLabel(v: string): string {
  return ASSET_TYPE_LABELS[v] || v;
}

export const URGENCY_OPTIONS = [
  { label: "Alta", value: "alta" },
  { label: "Média", value: "media" },
  { label: "Baixa", value: "baixa" },
] as const;

const STRATEGY_BULLETS: Record<string, string[]> = {
  "Empréstimo": [
    "Aquisição imediata do bem",
    "Previsibilidade das parcelas",
    "Possibilidade de quitação antecipada",
  ],
  "Consórcio": ["Sem juros, apenas taxa administrativa", "Parcelas menores", "Disciplina financeira"],
  "Investimento": ["Menor custo total", "Sem dívidas", "Rendimento sobre capital"],
};

const getStrategyBullets = (tipo: string) => {
  if (STRATEGY_BULLETS[tipo]) return STRATEGY_BULLETS[tipo];

  const normalized = (tipo || "").toLowerCase();
  if (normalized.includes("emprest") || normalized.includes("créd") || normalized.includes("credit"))
    return STRATEGY_BULLETS["Empréstimo"];
  if (normalized.includes("consor")) return STRATEGY_BULLETS["Consórcio"];
  if (normalized.includes("invest")) return STRATEGY_BULLETS["Investimento"];

  return [];
};

const onlyDigits = (v: string) => v.replace(/\D/g, "");
const formatBRL = (value: number) => new Intl.NumberFormat("pt-BR").format(value);

function normalizeDecisionResult(raw: any): ResultForUI | null {
  if (!raw) return null;

  const rankingRaw = raw.ranking;

  const ranking: RankingRowDB[] = Array.isArray(rankingRaw)
    ? rankingRaw.map((r: any) => ({
        tipo: r?.tipo ?? "",
        custoTotal: r?.custoTotal ?? "",
        parcelaMensal: r?.parcelaMensal ?? "",
        tempoParaConquista: r?.tempoParaConquista ?? "",
      }))
    : [];

  return {
    id: String(raw.id),
    goal_id: String(raw.goal_id),
    recommended_strategy: String(raw.recommended_strategy ?? ""),
    ranking,
    explanation: String(raw.explanation ?? ""),
    explanation_title: raw.explanation_title ?? null,
    analysis_date: String(raw.analysis_date ?? ""),
    created_at: String(raw.created_at ?? ""),
  };
}

export default function NewGoal() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState<CreateGoalForm>({
    asset_type: "",
    estimated_value: 0,
    available_capital: 0,
    desired_term: 0,
    urgency_level: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ResultForUI | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");

  // ✅ gate: perfil financeiro
  const [financialProfile, setFinancialProfile] = useState<{
    income_range: string | null;
    credit_status: string | null;
    risk_profile: string | null;
    income_stability: string | null;
  } | null>(null);
  const [profileGateOpen, setProfileGateOpen] = useState(false);

  const isProfileComplete = useMemo(() => {
    if (!financialProfile) return false;
    return (
      !!financialProfile.income_range &&
      !!financialProfile.credit_status &&
      !!financialProfile.risk_profile &&
      !!financialProfile.income_stability
    );
  }, [financialProfile]);

  // ✅ guarda canal pra limpar certinho
  const channelRef = useRef<RealtimeChannel | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const fetchFinancialProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_financial_profile")
      .select("income_range, credit_status, risk_profile, income_stability")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching financial profile:", error);
      setFinancialProfile(null);
      return;
    }

    setFinancialProfile(data ?? null);
  };

  const fetchDecisionResult = async (createdGoalId: string) => {
    const { data, error } = await supabase
      .from("decision_results")
      .select("*")
      .eq("goal_id", createdGoalId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return normalizeDecisionResult(data);
  };

  const cleanupChannel = async () => {
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    if (channelRef.current) {
      try {
        await supabase.removeChannel(channelRef.current);
      } catch {
        // ignore
      }
      channelRef.current = null;
    }
  };

  // ✅ Real-time: escuta insert/update da decision_results pro goal_id
  const subscribeToDecisionResult = async (createdGoalId: string) => {
    await cleanupChannel();

    const channel = supabase
      .channel(`decision_results_goal_${createdGoalId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "decision_results",
          filter: `goal_id=eq.${createdGoalId}`,
        },
        async () => {
          try {
            const dbResult = await fetchDecisionResult(createdGoalId);
            if (dbResult) {
              setResult(dbResult);
              setAnalyzing(false);
              await cleanupChannel();
            }
          } catch (e) {
            console.error("Realtime fetch error:", e);
          }
        }
      );

    channelRef.current = channel;

    const { error } = await channel.subscribe((status) => {
      // opcional: debug
      // console.log("Realtime status:", status);
    });

    if (error) {
      console.error("Realtime subscribe error:", error);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // ✅ carrega perfil para o gate
  useEffect(() => {
    if (user) fetchFinancialProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ✅ atualiza perfil ao voltar pra janela (usuário pode ter preenchido em outra aba/tela)
  useEffect(() => {
    const onFocus = () => fetchFinancialProfile();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ✅ limpeza ao sair da tela
  useEffect(() => {
    return () => {
      cleanupChannel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalysis = async (createdGoalId: string) => {
    setAnalyzing(true);

    // 1) liga realtime antes (pra não perder o evento)
    await subscribeToDecisionResult(createdGoalId);

    // 2) tenta buscar imediatamente (caso n8n já tenha gravado)
    try {
      const immediate = await fetchDecisionResult(createdGoalId);
      if (immediate) {
        setResult(immediate);
        setAnalyzing(false);
        await cleanupChannel();
        return;
      }
    } catch (e) {
      console.error("Immediate fetch error:", e);
    }

    // 3) fallback: se não chegar evento em 20s, tenta buscar e mostra msg
    fallbackTimerRef.current = window.setTimeout(async () => {
      try {
        const retry = await fetchDecisionResult(createdGoalId);
        if (retry) {
          setResult(retry);
        } else {
          toast({
            title: "Análise em processamento",
            description:
              "Seu objetivo foi criado, mas a análise ainda não ficou pronta. Aguarde alguns instantes e tente abrir o objetivo novamente.",
            variant: "destructive",
          });
        }
      } catch (e) {
        console.error("Fallback fetch error:", e);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o resultado da análise.",
          variant: "destructive",
        });
      } finally {
        setAnalyzing(false);
        await cleanupChannel();
      }
    }, 20000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // ✅ GATE: só cria objetivo com perfil completo
    if (!isProfileComplete) {
      setProfileGateOpen(true);
      toast({
        title: "Complete seu perfil primeiro",
        description: "Para criar um objetivo, precisamos do seu perfil financeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!form.asset_type.trim()) {
      toast({ title: "Erro", description: "Informe o tipo de bem", variant: "destructive" });
      return;
    }
    if (form.estimated_value <= 0) {
      toast({ title: "Erro", description: "Informe um valor válido", variant: "destructive" });
      return;
    }
    if (!form.desired_term || form.desired_term <= 0) {
      toast({ title: "Erro", description: "Informe o prazo desejado", variant: "destructive" });
      return;
    }
    if (!form.urgency_level) {
      toast({ title: "Erro", description: "Informe o nível de urgência", variant: "destructive" });
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

      // ✅ agora espera realtime
      await runAnalysis(goalData.id);
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o objetivo. Tente novamente.",
        variant: "destructive",
      });
      setAnalyzing(false);
    } finally {
      setSubmitting(false);
    }
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
            analyzing ? (
              <div className="bg-card rounded-xl border border-border p-10 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Gerando análise...</span>
              </div>
            ) : (
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
                      <Label htmlFor="asset_type" className="text-foreground">
                        Tipo de Bem / Objetivo
                      </Label>

                      <Select value={form.asset_type} onValueChange={(value) => updateField("asset_type", value)}>
                        <SelectTrigger className="mt-2 text-muted-foreground">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imovel">Imóvel</SelectItem>
                          <SelectItem value="reforma">Reforma</SelectItem>
                          <SelectItem value="veiculo">Veículo</SelectItem>
                          <SelectItem value="equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="viagem">Viagem</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="estimated_value" className="text-foreground">
                        Valor Estimado (R$)
                      </Label>

                      <Input
                        id="estimated_value"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="0"
                        value={form.estimated_value ? formatBRL(form.estimated_value) : ""}
                        onChange={(e) => {
                          const digits = onlyDigits(e.target.value);
                          const value = digits ? Number(digits) : 0;
                          updateField("estimated_value", value);
                        }}
                        className="mt-2 text-muted-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="available_capital" className="text-foreground">
                        Capital Disponível (R$)
                      </Label>

                      <Input
                        id="available_capital"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="0"
                        value={form.available_capital ? formatBRL(form.available_capital) : ""}
                        onChange={(e) => {
                          const digits = onlyDigits(e.target.value);
                          const value = digits ? Number(digits) : 0;
                          updateField("available_capital", value);
                        }}
                        className="mt-2 text-muted-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="desired_term" className="text-foreground">
                        Prazo Desejado
                      </Label>

                      <Select
                        value={form.desired_term ? String(form.desired_term) : ""}
                        onValueChange={(value) => updateField("desired_term", Number(value))}
                      >
                        <SelectTrigger className="mt-2 text-muted-foreground">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {[6, 12, 18, 24, 36, 48, 60, 72, 84, 96, 120].map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {m} meses
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="urgency_level" className="text-foreground">
                        Nível de Urgência
                      </Label>

                      <Select
                        value={form.urgency_level ?? ""}
                        onValueChange={(value) => updateField("urgency_level", value as CreateGoalForm["urgency_level"])}
                      >
                        <SelectTrigger className="mt-2 text-muted-foreground">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
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
            )
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Análise concluída</span>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-foreground">
                  {result.recommended_strategy} é a melhor opção no cenário atual
                </h1>

                <p className="text-muted-foreground">
                  {getAssetLabel(form.asset_type)} • {formatCurrency(form.estimated_value)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {result.ranking.map((strategy, index) => {
                  const tipo = strategy.tipo ?? "";
                  const isRecommended = tipo === result.recommended_strategy;
                  const bullets = getStrategyBullets(tipo);

                  return (
                    <div key={`${tipo}-${index}`} className={`strategy-card ${isRecommended ? "recommended" : ""}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {isRecommended ? (
                            <Award className="h-5 w-5 text-primary" />
                          ) : (
                            <Target className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      </div>

                      <h3 className="text-xl font-semibold mb-4 text-foreground">{tipo}</h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">Custo total:</span>
                          <span className="font-medium text-muted-foreground">{strategy.custoTotal || "-"}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">Parcela:</span>
                          <span className="font-medium text-muted-foreground">
                            {strategy.parcelaMensal ? `${strategy.parcelaMensal}/mês` : "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">Tempo:</span>
                          <span className="font-medium text-muted-foreground">{strategy.tempoParaConquista || "-"}</span>
                        </div>
                      </div>

                      {bullets.length > 0 && (
                        <div className="border-t border-border pt-4 mb-5">
                          <p className="text-xs text-foreground mb-2">Vantagens:</p>
                          <ul className="space-y-1 text-muted-foreground">
                            {bullets.map((text, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                                <span>{text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        variant={isRecommended ? "hero" : "outline"}
                        className="w-full"
                        onClick={() => handleConfirmInterest(tipo)}
                      >
                        Tenho interesse
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6 mb-8">
                <h3 className="font-semibold text-lg mb-3 text-foreground">{result.explanation_title || "Explicação"}</h3>
                <p className="text-muted-foreground">{result.explanation}</p>
              </div>

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
                Um relatório com sua análise será enviado para um <strong>parceiro financeiro credenciado</strong> da
                CAPITALYS.
              </p>
              <p>
                A CAPITALYS <strong>não realiza contratação direta</strong> de produtos financeiros. Somos uma plataforma
                de apoio à decisão.
              </p>
              <p>
                O parceiro poderá entrar em contato para dar continuidade ao processo de <strong>{selectedStrategy}</strong>.
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

      {/* ✅ Profile Gate Modal */}
      <Dialog open={profileGateOpen} onOpenChange={setProfileGateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Perfil necessário
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <p>
                Para criar um objetivo, você precisa completar seu <strong>perfil financeiro</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Isso melhora a qualidade da análise e evita recomendações genéricas.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProfileGateOpen(false)}>
              Agora não
            </Button>
            <Button
              variant="hero"
              onClick={() => {
                setProfileGateOpen(false);
                navigate("/perfil");
              }}
            >
              Ir para meu perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
