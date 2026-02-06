import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IndicatorCard } from "@/components/IndicatorCard";
import { IndicatorChart } from "@/components/IndicatorChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { IndicatorAnalysis, EconomicIndicator, Insight } from "@/lib/types";
import {
  ArrowRight,
  Target,
  BarChart3,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Defina seu objetivo",
    description:
      "Informe o bem que deseja adquirir, valor estimado, capital disponível e prazo desejado.",
    icon: Target,
  },
  {
    step: 2,
    title: "Analisamos o cenário",
    description:
      "Nossa plataforma avalia os indicadores econômicos atuais e suas tendências.",
    icon: BarChart3,
  },
  {
    step: 3,
    title: "Compare estratégias",
    description:
      "Receba uma comparação clara entre Crédito, Consórcio e Renda Fixa.",
    icon: Lightbulb,
  },
  {
    step: 4,
    title: "Tome sua decisão",
    description:
      "Salve a simulação ou manifeste interesse para dar continuidade.",
    icon: CheckCircle,
  },
];

type SelectedPeriod = "12" | "24" | "60";

const PERIOD_LABELS: Record<SelectedPeriod, string> = {
  "12": "12 meses",
  "24": "24 meses",
  "60": "5 anos",
};

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

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<IndicatorAnalysis[]>([]);
  const [historicalData, setHistoricalData] = useState<EconomicIndicator[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>("12");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analysisResult, historicalResult, insightResult] = await Promise.all([
        supabase
          .from("indicator_analysis")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("economic_indicators")
          .select("*")
          .order("reference_date", { ascending: true }),
        supabase
          .from("insights")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (analysisResult.data) {
        setIndicators(getLatestByType(analysisResult.data as IndicatorAnalysis[]));
      }
      if (historicalResult.data) {
        setHistoricalData(historicalResult.data as EconomicIndicator[]);
      }
      if (insightResult.data) {
        setInsight(insightResult.data as Insight);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    navigate(user ? "/novo-objetivo" : "/auth");
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient pt-24 pb-20 min-h-[90vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Inteligência Macroeconômica para{" "}
              <span className="text-primary">Decisão Financeira</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up delay-100">
              Transformamos indicadores econômicos em estratégias claras. Compare crédito,
              consórcio e renda fixa com insights baseados no cenário real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Button variant="hero" size="xl" onClick={handleGetStarted}>
                {user ? "Criar meu objetivo" : "Entrar com Google"}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <a href="#indicadores">Ver indicadores</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Indicators Section */}
      <section id="indicadores" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="section-header">
            <h2 className="text-foreground">Indicadores Econômicos</h2>
            <p>
              Acompanhe em tempo real os principais indicadores que impactam suas decisões
              financeiras
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="indicator-card animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-4" />
                  <div className="h-10 bg-muted rounded w-32 mb-2" />
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {indicators.map((indicator) => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          )}

          {/* Insight Card */}
          {insight && (
            <div className="mt-8 p-6 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{insight.scenario_label}</h3>
                  <p className="text-muted-foreground">{insight.insight_text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chart Section */}
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-semibold">Série Temporal dos Indicadores</h3>
              <div className="flex gap-2">
                {(Object.keys(PERIOD_LABELS) as SelectedPeriod[]).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {PERIOD_LABELS[period]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <IndicatorChart data={historicalData} selectedPeriod={selectedPeriod} />
            </div>
          </div>
        </div>
      </section>

      {/* Relationship Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="text-foreground">Como os Indicadores se Relacionam</h2>
              <p>
                Entenda a dinâmica entre Selic, Inflação e PIB e como isso impacta suas decisões
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="p-3 rounded-lg bg-chart-selic/20 w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-chart-selic" />
                </div>
                <h3 className="font-semibold mb-2">Taxa Selic</h3>
                <p className="text-sm text-muted-foreground">
                  A taxa básica de juros influencia diretamente o custo do crédito e a
                  rentabilidade de investimentos em renda fixa.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="p-3 rounded-lg bg-chart-ipca/20 w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-chart-ipca" />
                </div>
                <h3 className="font-semibold mb-2">IPCA (Inflação)</h3>
                <p className="text-sm text-muted-foreground">
                  Mede a variação de preços e impacta o poder de compra. Inflação alta corrói o
                  valor do dinheiro ao longo do tempo.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="p-3 rounded-lg bg-chart-pib/20 w-fit mb-4">
                  <Zap className="h-6 w-6 text-chart-pib" />
                </div>
                <h3 className="font-semibold mb-2">Crescimento do PIB</h3>
                <p className="text-sm text-muted-foreground">
                  Indica a saúde da economia. Crescimento forte pode gerar mais oportunidades, mas
                  também pressão inflacionária.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-xl bg-card border border-border">
              <h4 className="font-semibold mb-3">Por que isso importa para você?</h4>
              <p className="text-muted-foreground">
                Quando a Selic sobe, o crédito fica mais caro, mas a renda fixa rende mais. Quando
                a inflação está alta, o consórcio pode ser mais vantajoso que esperar para comprar à
                vista. Nosso motor de decisão analisa essas relações automaticamente para indicar a
                melhor estratégia no momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="section-header">
            <h2 className="text-foreground">Como Funciona</h2>
            <p>
              Em 4 passos simples, você recebe uma análise completa para sua decisão financeira
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {HOW_IT_WORKS_STEPS.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2 mt-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={handleGetStarted}>
              Começar agora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <h2 className="text-foreground">Sobre a CAPITALYS</h2>
              <p>
                Uma plataforma de inteligência macroeconômica para apoiar suas decisões financeiras
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Confiança</h3>
                <p className="text-sm text-muted-foreground">
                  Dados oficiais do Banco Central e IBGE, atualizados regularmente.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Clareza</h3>
                <p className="text-sm text-muted-foreground">
                  Explicações simples e diretas para cada recomendação apresentada.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Estratégia</h3>
                <p className="text-sm text-muted-foreground">
                  Análise baseada em cenário real para decisões mais assertivas.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <h4 className="font-semibold text-lg mb-3">Importante</h4>
              <p className="text-muted-foreground">
                A CAPITALYS é uma plataforma de apoio à decisão e não realiza contratação direta de
                produtos financeiros. Ao manifestar interesse em uma estratégia, seus dados podem ser
                encaminhados a parceiros financeiros credenciados para dar continuidade ao processo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
