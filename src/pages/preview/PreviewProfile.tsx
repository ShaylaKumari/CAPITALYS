import { useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Save, CheckCircle } from "lucide-react";
import { mockProfile, mockUserFinancialProfile } from "@/lib/mockData";
import { RISK_PROFILE_LABELS, INCOME_STABILITY_LABELS } from "@/lib/types";

const incomeRanges = [
  "Até R$ 2.000",
  "R$ 2.000 - R$ 5.000",
  "R$ 5.000 - R$ 10.000",
  "R$ 10.000 - R$ 20.000",
  "Acima de R$ 20.000",
];

const creditStatuses = [
  { value: "score_alto", label: "Score Alto (acima de 700)" },
  { value: "score_medio", label: "Score Médio (500-700)" },
  { value: "score_baixo", label: "Score Baixo (abaixo de 500)" },
  { value: "negativado", label: "Negativado" },
  { value: "nao_sei", label: "Não sei informar" },
];

export default function PreviewProfile() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    income_range: mockUserFinancialProfile.income_range || "",
    credit_status: mockUserFinancialProfile.credit_status || "",
    risk_profile: mockUserFinancialProfile.risk_profile || "",
    income_stability: mockUserFinancialProfile.income_stability || "",
    dependents: mockUserFinancialProfile.dependents || 0,
    profession: mockUserFinancialProfile.profession || "",
  });

  const getInitials = () => {
    if (mockProfile.full_name) {
      return mockProfile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Mantenha seu perfil atualizado para recomendações mais precisas
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{mockProfile.full_name}</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {mockProfile.email}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Financial Profile Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Perfil Financeiro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income_range">Faixa de renda mensal</Label>
                <Select 
                  value={formData.income_range} 
                  onValueChange={(value) => setFormData({ ...formData, income_range: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeRanges.map((range) => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credit_status">Situação de crédito</Label>
                <Select 
                  value={formData.credit_status} 
                  onValueChange={(value) => setFormData({ ...formData, credit_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_profile">Perfil de risco</Label>
                <Select 
                  value={formData.risk_profile} 
                  onValueChange={(value) => setFormData({ ...formData, risk_profile: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservador">{RISK_PROFILE_LABELS.conservador}</SelectItem>
                    <SelectItem value="moderado">{RISK_PROFILE_LABELS.moderado}</SelectItem>
                    <SelectItem value="arrojado">{RISK_PROFILE_LABELS.arrojado}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="income_stability">Estabilidade de renda</Label>
                <Select 
                  value={formData.income_stability} 
                  onValueChange={(value) => setFormData({ ...formData, income_stability: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estavel">{INCOME_STABILITY_LABELS.estavel}</SelectItem>
                    <SelectItem value="variavel">{INCOME_STABILITY_LABELS.variavel}</SelectItem>
                    <SelectItem value="incerto">{INCOME_STABILITY_LABELS.incerto}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependents">Número de dependentes</Label>
                <Input
                  id="dependents"
                  type="number"
                  min="0"
                  value={formData.dependents}
                  onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profissão</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="Ex: Analista de Sistemas"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 mb-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-accent">Por que preencher?</strong> Seu perfil financeiro é utilizado 
          para personalizar as recomendações de estratégias. Quanto mais completo, mais precisas serão 
          as análises.
        </p>
      </div>

      {/* Save Button */}
      <Button 
        variant="hero" 
        className="w-full" 
        onClick={handleSave}
        disabled={saved}
      >
        {saved ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Salvo com sucesso!
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salvar alterações
          </>
        )}
      </Button>
    </div>
  );
}
