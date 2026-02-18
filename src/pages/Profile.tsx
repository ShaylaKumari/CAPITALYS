// ...imports iguais aos seus
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { UserFinancialProfile } from "@/lib/types";
import type { IncomeRange, CreditStatus, RiskProfile, IncomeStability } from "@/lib/types";
import { Loader2, Save, User, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function buildProfilePayload(userId: string, fp: Partial<UserFinancialProfile>) {
  return {
    user_id: userId,
    income_range: fp.income_range!,
    credit_status: fp.credit_status!,
    risk_profile: fp.risk_profile!,
    income_stability: fp.income_stability!,
    dependents: fp.dependents ?? 0,
    updated_at: new Date().toISOString(),
  };
}

const INCOME_RANGE_OPTIONS: Array<{ id: IncomeRange; label: string; description?: string }> = [
  { id: "ate_2k", label: "Até R$ 2.000" },
  { id: "2k_4k", label: "R$ 2.000 – R$ 4.000" },
  { id: "4k_6k", label: "R$ 4.000 – R$ 6.000" },
  { id: "6k_8k", label: "R$ 6.000 – R$ 8.000" },
  { id: "8k_12k", label: "R$ 8.000 – R$ 12.000" },
  { id: "acima_12k", label: "Acima de R$ 12.000" },
];

const CREDIT_STATUS_OPTIONS: Array<{ id: CreditStatus; label: string; description: string }> = [
  { id: "excelente", label: "Excelente", description: "Score acima de 800" },
  { id: "bom", label: "Bom", description: "Score entre 600 e 800" },
  { id: "regular", label: "Regular", description: "Score entre 400 e 600" },
  { id: "baixo", label: "Baixo", description: "Score abaixo de 400" },
];

const RISK_PROFILE_OPTIONS: Array<{ id: RiskProfile; label: string; description: string }> = [
  { id: "conservador", label: "Conservador", description: "Prefiro segurança a rentabilidade" },
  { id: "moderado", label: "Moderado", description: "Busco equilíbrio entre risco e retorno" },
  { id: "agressivo", label: "Agressivo", description: "Aceito riscos para maior retorno" },
];

const INCOME_SOURCE_OPTIONS: Array<{ id: IncomeStability; label: string; description: string }> = [
  { id: "clt", label: "CLT", description: "Contrato formal com carteira assinada" },
  { id: "servidor_publico", label: "Servidor Público", description: "Cargo público com vínculo estatutário" },
  { id: "pj", label: "PJ", description: "Atua como pessoa jurídica prestando serviços" },
  { id: "autonomo", label: "Autônomo", description: "Trabalho por conta própria ou comissionado" },
  { id: "estagio", label: "Estágio", description: "Vínculo temporário voltado à formação profissional" },
  { id: "nao_informado", label: "Não informado", description: "Prefiro não informar minha fonte de renda" },
];

type CardOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

function OptionCardsGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = "md:grid-cols-2",
}: {
  label: string;
  value: T | "" | null | undefined;
  options: CardOption<T>[];
  onChange: (val: T) => void;
  columns?: string; // ex: "md:grid-cols-3"
}) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>

      <div className={`grid grid-cols-1 ${columns} gap-3`}>
        {options.map((opt) => {
          const selected = value === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "text-left rounded-xl border p-4 transition",
                "bg-background/40 hover:bg-background/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
                selected
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-border",
              ].join(" ")}
              aria-pressed={selected}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground">
                    {opt.label}
                  </div>
                  {opt.description ? (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {opt.description}
                    </div>
                  ) : null}
                </div>

                {selected ? (
                  <div className="mt-0.5 shrink-0 rounded-full bg-primary/15 p-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <div className="mt-0.5 shrink-0 h-6 w-6 rounded-full border border-border" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [financialProfile, setFinancialProfile] =
    useState<Partial<UserFinancialProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchFinancialProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchFinancialProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_financial_profile")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFinancialProfile({
          ...data,
          risk_profile: data.risk_profile as UserFinancialProfile["risk_profile"],
          income_stability:
            data.income_stability as UserFinancialProfile["income_stability"],
          dependents: data.dependents ?? 0,
        });
      } else {
        setFinancialProfile({ dependents: 0 });
      }
    } catch (error) {
      console.error("Error fetching financial profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu perfil financeiro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ valida e devolve lista de campos faltantes (sem mostrar badge no form)
  const validate = (fp: Partial<UserFinancialProfile>) => {
    const missing: string[] = [];
    if (!fp.income_range) missing.push("Faixa de renda");
    if (!fp.credit_status) missing.push("Situação de crédito");
    if (!fp.risk_profile) missing.push("Perfil de risco");
    if (!fp.income_stability) missing.push("Estabilidade de renda");
    return missing;
  };

  const handleSave = async () => {
    if (!user) return;

    const missing = validate(financialProfile);
    if (missing.length > 0) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: `Faltando: ${missing.join(", ")}.`,
        variant: "destructive",
      });
      return; // ✅ não envia pro Supabase
    }

    toast({
      title: "Perfil salvo!",
      description: "Suas informações foram atualizadas com sucesso.",
    });

    setSaved(true);

    // volta o botão ao normal depois de 2 segundos
    setTimeout(() => {
      setSaved(false);
    }, 6000);


    try {
      const payload = buildProfilePayload(user.id, financialProfile);

      // ✅ 1 chamada só
      const { error } = await supabase
        .from("user_financial_profile")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const updateField = <K extends keyof UserFinancialProfile>(
    field: K,
    value: UserFinancialProfile[K],
  ) => setFinancialProfile((prev) => ({ ...prev, [field]: value }));

  const { displayName, avatarUrl, email } = useMemo(() => {
    const meta: any = user?.user_metadata ?? {};

    const metaName = (meta.full_name || meta.name) as string | undefined;
    const metaAvatar = (meta.avatar_url || meta.picture) as string | undefined;

    const tableName = profile?.full_name as string | undefined;
    const tableAvatar = (profile as any)?.avatar_url as string | undefined;

    const finalName =
      (tableName && tableName.trim()) ||
      (metaName && metaName.trim()) ||
      (user?.email ?? "").split("@")[0] ||
      "Usuário";

    const finalAvatar =
      (tableAvatar && tableAvatar.trim()) ||
      (metaAvatar && metaAvatar.trim()) ||
      null;

    return {
      displayName: finalName,
      avatarUrl: finalAvatar,
      email: user?.email ?? "",
    };
  }, [user, profile]);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  }, [displayName]);

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

      <main className="pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Complete seu perfil financeiro para receber recomendações mais personalizadas
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <Avatar className="h-16 w-16">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {displayName}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {email}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5 text-primary" />
                  Perfil Financeiro
                </h3>

                <div className="space-y-6">
                  <OptionCardsGroup<IncomeRangeId>
                    label="Faixa de renda"
                    value={financialProfile.income_range as IncomeRangeId | "" | null}
                    options={INCOME_RANGE_OPTIONS.map((o) => ({
                      value: o.id,
                      label: o.label,
                    }))}
                    onChange={(val) => updateField("income_range", val as any)}
                    columns="md:grid-cols-3"
                  />

                  <OptionCardsGroup<CreditStatusId>
                    label="Situação de Crédito"
                    value={financialProfile.credit_status as CreditStatusId | "" | null}
                    options={CREDIT_STATUS_OPTIONS.map((o) => ({
                      value: o.id,
                      label: o.label,
                      description: o.description,
                    }))}
                    onChange={(val) => updateField("credit_status", val as any)}
                    columns="md:grid-cols-2"
                  />

                  <OptionCardsGroup<RiskProfileId>
                    label="Perfil de Risco"
                    value={financialProfile.risk_profile as RiskProfileId | "" | null}
                    options={RISK_PROFILE_OPTIONS.map((o) => ({
                      value: o.id,
                      label: o.label,
                      description: o.description,
                    }))}
                    onChange={(val) => updateField("risk_profile", val as any)}
                    columns="md:grid-cols-3"
                  />

                  <OptionCardsGroup<IncomeSourceId>
                    label="Fonte de Renda"
                    value={financialProfile.income_stability as IncomeSourceId | "" | null}
                    options={INCOME_SOURCE_OPTIONS.map((o) => ({
                      value: o.id,
                      label: o.label,
                      description: o.description,
                    }))}
                    onChange={(val) => updateField("income_stability", val as any)}
                    columns="md:grid-cols-2"
                  />

                  <div className="space-y-2 md:max-w-sm">
                    <Label className="text-foreground">Número de dependentes</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      className="text-muted-foreground"
                      value={financialProfile.dependents ?? 0}
                      onChange={(e) => updateField("dependents", Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Por que preencher?</strong> Seu perfil
              financeiro é utilizado para personalizar as recomendações de estratégias.
              Quanto mais completo, mais precisas serão as análises.
            </p>
          </div>
          <Button
            variant="hero"
            className="w-full mt-6"
            onClick={handleSave}
            disabled={saved} // ✅ só desabilita enquanto salva
          >
            {saved ? (
              <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvo com sucesso!
              </>
            ) : (
              <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Perfil
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
