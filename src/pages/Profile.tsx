// ...imports iguais aos seus
import { useEffect, useMemo, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { UserFinancialProfile } from "@/lib/types";
import { INCOME_STABILITY_LABELS, RISK_PROFILE_LABELS } from "@/lib/types";
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

const RISK_OPTIONS: Array<NonNullable<UserFinancialProfile["risk_profile"]>> = [
  "conservador",
  "moderado",
  "agressivo",
];

const INCOME_STABILITY_OPTIONS: Array<
  NonNullable<UserFinancialProfile["income_stability"]>
> = ["clt", "autonomo", "pj", "nao_informado"];

const INCOME_RANGE_OPTIONS = [
  { value: "ate_2k", label: "Até R$ 2.000" },
  { value: "2k_4k", label: "R$ 2.000 – R$ 4.000" },
  { value: "4k_6k", label: "R$ 4.000 – R$ 6.000" },
  { value: "6k_8k", label: "R$ 6.000 – R$ 8.000" },
  { value: "8k_12k", label: "R$ 8.000 – R$ 12.000" },
  { value: "acima_12k", label: "Acima de R$ 12.000" },
];

const CREDIT_STATUS_OPTIONS = [
  { value: "nome_limpo", label: "CPF sem restrição" },
  { value: "restricao_cpf", label: "CPF com restrição" },
  { value: "nao_sei", label: "Prefiro não informar" },
];

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
        <div className="container mx-auto px-4 max-w-3xl">
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
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5 text-primary" />
                  Perfil Financeiro
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Faixa de renda mensal</Label>
                    <Select
                      value={financialProfile.income_range ?? ""}
                      onValueChange={(value) =>
                        updateField("income_range", value || null)
                      }
                    >
                      <SelectTrigger className="text-muted-foreground">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCOME_RANGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Situação de crédito</Label>
                    <Select
                      value={financialProfile.credit_status ?? ""}
                      onValueChange={(value) =>
                        updateField("credit_status", value || null)
                      }
                    >
                      <SelectTrigger className="text-muted-foreground">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {CREDIT_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Perfil de risco</Label>
                    <Select
                      value={financialProfile.risk_profile ?? ""}
                      onValueChange={(value) =>
                        updateField(
                          "risk_profile",
                          (value || null) as UserFinancialProfile["risk_profile"],
                        )
                      }
                    >
                      <SelectTrigger className="text-muted-foreground">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {RISK_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {RISK_PROFILE_LABELS[opt]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Estabilidade de renda</Label>
                    <Select
                      value={financialProfile.income_stability ?? ""}
                      onValueChange={(value) =>
                        updateField(
                          "income_stability",
                          (value || null) as UserFinancialProfile["income_stability"],
                        )
                      }
                    >
                      <SelectTrigger className="text-muted-foreground">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCOME_STABILITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {INCOME_STABILITY_LABELS[opt]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Número de dependentes</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      className="text-muted-foreground"
                      value={financialProfile.dependents ?? 0}
                      onChange={(e) =>
                        updateField("dependents", Number(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="hidden md:block" />
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
