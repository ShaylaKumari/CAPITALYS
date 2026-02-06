-- CAPITALYS Database Schema
-- Ecossistema de Inteligência Macroeconômica para Decisão Financeira

-- 1. Economic Indicators table
CREATE TABLE public.economic_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('selic', 'ipca', 'pib_crescimento')),
  value NUMERIC NOT NULL,
  reference_date DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Indicator Analysis table (processed data with trends)
CREATE TABLE public.indicator_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('selic', 'ipca', 'pib_crescimento')),
  current_value NUMERIC NOT NULL,
  variation NUMERIC,
  trend TEXT CHECK (trend IN ('alta', 'queda', 'estavel')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Insights table (AI-generated macroeconomic insights)
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_label TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  scenario_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. User Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. User Financial Profile table
CREATE TABLE public.user_financial_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  income_range TEXT,
  credit_status TEXT,
  risk_profile TEXT CHECK (risk_profile IN ('conservador', 'moderado', 'arrojado')),
  income_stability TEXT CHECK (income_stability IN ('estavel', 'variavel', 'incerto')),
  dependents INTEGER DEFAULT 0,
  profession TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 6. Financial Goals table
CREATE TABLE public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  estimated_value NUMERIC NOT NULL,
  available_capital NUMERIC NOT NULL DEFAULT 0,
  desired_term INTEGER NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('baixa', 'media', 'alta', 'urgente')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Decision Results table (analysis results with 3 strategies)
CREATE TABLE public.decision_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  recommended_strategy TEXT NOT NULL,
  ranking JSONB NOT NULL,
  explanation TEXT NOT NULL,
  explanation_title TEXT,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Decision History table (tracks changes when indicators change)
CREATE TABLE public.decision_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  previous_strategy TEXT NOT NULL,
  new_strategy TEXT NOT NULL,
  previous_explanation TEXT,
  new_explanation TEXT,
  indicator_changed TEXT,
  old_indicator_value NUMERIC,
  new_indicator_value NUMERIC,
  reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Partner Interest table (when user confirms interest)
CREATE TABLE public.partner_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  decision_result_id UUID REFERENCES public.decision_results(id) ON DELETE SET NULL,
  selected_strategy TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'contacted', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create views for latest data
CREATE OR REPLACE VIEW public.view_latest_economic_indicators AS
SELECT DISTINCT ON (indicator_type) *
FROM public.economic_indicators
ORDER BY indicator_type, reference_date DESC, created_at DESC;

CREATE OR REPLACE VIEW public.view_latest_indicator_analysis AS
SELECT DISTINCT ON (indicator_type) *
FROM public.indicator_analysis
ORDER BY indicator_type, created_at DESC;

CREATE OR REPLACE VIEW public.view_latest_insight AS
SELECT * FROM public.insights
ORDER BY created_at DESC
LIMIT 1;

-- Enable RLS on all tables
ALTER TABLE public.economic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_financial_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_interest ENABLE ROW LEVEL SECURITY;

-- Public read policies for economic data (accessible to everyone)
CREATE POLICY "Anyone can view economic indicators"
  ON public.economic_indicators FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view indicator analysis"
  ON public.indicator_analysis FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view insights"
  ON public.insights FOR SELECT
  USING (true);

-- Profile policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Financial profile policies
CREATE POLICY "Users can view own financial profile"
  ON public.user_financial_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial profile"
  ON public.user_financial_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial profile"
  ON public.user_financial_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- Financial goals policies
CREATE POLICY "Users can view own goals"
  ON public.financial_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.financial_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.financial_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.financial_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Decision results policies (via goal ownership)
CREATE POLICY "Users can view own decision results"
  ON public.decision_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_goals
      WHERE financial_goals.id = decision_results.goal_id
      AND financial_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert decision results for own goals"
  ON public.decision_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.financial_goals
      WHERE financial_goals.id = goal_id
      AND financial_goals.user_id = auth.uid()
    )
  );

-- Decision history policies (via goal ownership)
CREATE POLICY "Users can view own decision history"
  ON public.decision_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_goals
      WHERE financial_goals.id = decision_history.goal_id
      AND financial_goals.user_id = auth.uid()
    )
  );

-- Partner interest policies
CREATE POLICY "Users can view own partner interests"
  ON public.partner_interest FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own partner interests"
  ON public.partner_interest FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_financial_profile_updated_at
  BEFORE UPDATE ON public.user_financial_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert seed data for economic indicators (demo data)
INSERT INTO public.economic_indicators (indicator_type, value, reference_date, source) VALUES
-- Selic histórico
('selic', 13.75, '2024-01-01', 'BCB'),
('selic', 13.25, '2024-02-01', 'BCB'),
('selic', 12.75, '2024-03-01', 'BCB'),
('selic', 12.25, '2024-04-01', 'BCB'),
('selic', 11.75, '2024-05-01', 'BCB'),
('selic', 11.25, '2024-06-01', 'BCB'),
('selic', 10.75, '2024-07-01', 'BCB'),
('selic', 10.50, '2024-08-01', 'BCB'),
('selic', 10.50, '2024-09-01', 'BCB'),
('selic', 10.75, '2024-10-01', 'BCB'),
('selic', 11.25, '2024-11-01', 'BCB'),
('selic', 12.25, '2024-12-01', 'BCB'),
('selic', 13.25, '2025-01-01', 'BCB'),
('selic', 13.25, '2025-02-01', 'BCB'),
-- IPCA histórico
('ipca', 4.62, '2024-01-01', 'IBGE'),
('ipca', 4.50, '2024-02-01', 'IBGE'),
('ipca', 4.32, '2024-03-01', 'IBGE'),
('ipca', 4.18, '2024-04-01', 'IBGE'),
('ipca', 3.93, '2024-05-01', 'IBGE'),
('ipca', 4.23, '2024-06-01', 'IBGE'),
('ipca', 4.45, '2024-07-01', 'IBGE'),
('ipca', 4.24, '2024-08-01', 'IBGE'),
('ipca', 4.42, '2024-09-01', 'IBGE'),
('ipca', 4.56, '2024-10-01', 'IBGE'),
('ipca', 4.87, '2024-11-01', 'IBGE'),
('ipca', 4.83, '2024-12-01', 'IBGE'),
('ipca', 4.56, '2025-01-01', 'IBGE'),
-- PIB histórico (anual)
('pib_crescimento', 2.9, '2023-01-01', 'IBGE'),
('pib_crescimento', 3.2, '2024-01-01', 'IBGE'),
('pib_crescimento', 2.5, '2025-01-01', 'IBGE');

-- Insert seed data for indicator analysis
INSERT INTO public.indicator_analysis (indicator_type, current_value, variation, trend) VALUES
('selic', 13.25, 0.00, 'estavel'),
('ipca', 4.56, -0.27, 'queda'),
('pib_crescimento', 2.5, -0.7, 'queda');

-- Insert seed insight
INSERT INTO public.insights (scenario_label, insight_text, scenario_summary) VALUES
(
  'Cenário Cauteloso',
  'Com a Selic elevada em 13,25% a.a. e inflação controlada em 4,56%, o momento é favorável para investimentos em renda fixa. Crédito está mais caro, portanto consórcios podem ser uma alternativa interessante para aquisições de médio prazo.',
  'Juros altos favorecem renda fixa. Crédito encarecido. Consórcio competitivo para prazos médios.'
);