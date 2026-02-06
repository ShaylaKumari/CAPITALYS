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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { UserFinancialProfile } from "@/lib/types";
import { Loader2, User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function buildProfilePayload(
  userId: string,
  fp: Partial<UserFinancialProfile>,
) {
  return {
    user_id: userId,
    income_range: fp.income_range,
    credit_status: fp.credit_status,
    risk_profile: fp.risk_profile,
    income_stability: fp.income_stability,
    dependents: fp.dependents || 0,
    profession: fp.profession,
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [financialProfile, setFinancialProfile] = useState<Partial<UserFinancialProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFinancialProfile();
    }
  }, [user]);

  const fetchFinancialProfile = async () => {
    try {
      const { data } = await supabase
        .from("user_financial_profile")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (data) {
        setFinancialProfile({
          ...data,
          risk_profile: data.risk_profile as UserFinancialProfile["risk_profile"],
          income_stability: data.income_stability as UserFinancialProfile["income_stability"],
        });
      }
    } catch (error) {
      console.error("Error fetching financial profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const payload = buildProfilePayload(user.id, financialProfile);

      const { data: existingProfile } = await supabase
        .from("user_financial_profile")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const { error } = existingProfile
        ? await supabase
            .from("user_financial_profile")
            .update(payload)
            .eq("user_id", user.id)
        : await supabase.from("user_financial_profile").insert(payload);

      if (error) throw error;

      toast({
        title: "Perfil salvo!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof UserFinancialProfile>(
    field: K,
    value: UserFinancialProfile[K],
  ) => {
    setFinancialProfile((prev) => ({ ...prev, [field]: value }));
  };

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

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Complete seu perfil financeiro para receber recomendações mais personalizadas
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.full_name || "Usuário"}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Financial Profile Form */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold mb-6">Perfil Financeiro</h3>

            <div className="space-y-6">
              <div>
                <Label htmlFor="profession">Profissão</Label>
                <Input
                  id="profession"
                  placeholder="Ex: Engenheiro, Médico, Empresário..."
                  value={financialProfile.profession || ""}
                  onChange={(e) => updateField("profession", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="income_range">Faixa de Renda</Label>
                <Select
                  value={financialProfile.income_range || ""}
                  onValueChange={(value) => updateField("income_range", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione sua faixa de renda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ate_3k">Até R$ 3.000</SelectItem>
                    <SelectItem value="3k_6k">R$ 3.000 a R$ 6.000</SelectItem>
                    <SelectItem value="6k_10k">R$ 6.000 a R$ 10.000</SelectItem>
                    <SelectItem value="10k_20k">R$ 10.000 a R$ 20.000</SelectItem>
                    <SelectItem value="acima_20k">Acima de R$ 20.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="income_stability">Estabilidade de Renda</Label>
                <Select
                  value={financialProfile.income_stability || ""}
                  onValueChange={(value: any) => updateField("income_stability", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estavel">Estável (CLT, servidor público)</SelectItem>
                    <SelectItem value="variavel">Variável (comissões, autônomo)</SelectItem>
                    <SelectItem value="incerto">Incerto (sem renda fixa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="risk_profile">Perfil de Risco</Label>
                <Select
                  value={financialProfile.risk_profile || ""}
                  onValueChange={(value: any) => updateField("risk_profile", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservador">Conservador - Prefiro segurança</SelectItem>
                    <SelectItem value="moderado">Moderado - Equilíbrio risco/retorno</SelectItem>
                    <SelectItem value="arrojado">Arrojado - Aceito mais riscos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="credit_status">Situação de Crédito</Label>
                <Select
                  value={financialProfile.credit_status || ""}
                  onValueChange={(value) => updateField("credit_status", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excelente">Excelente - Score alto, sem restrições</SelectItem>
                    <SelectItem value="bom">Bom - Score médio-alto</SelectItem>
                    <SelectItem value="regular">Regular - Algumas pendências passadas</SelectItem>
                    <SelectItem value="ruim">Ruim - Restrições ativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dependents">Número de Dependentes</Label>
                <Input
                  id="dependents"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={financialProfile.dependents ?? ""}
                  onChange={(e) => updateField("dependents", parseInt(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Perfil
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
