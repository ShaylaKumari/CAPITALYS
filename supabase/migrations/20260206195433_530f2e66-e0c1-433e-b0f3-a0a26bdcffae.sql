-- Fix security definer views by recreating them with SECURITY INVOKER
DROP VIEW IF EXISTS public.view_latest_economic_indicators;
DROP VIEW IF EXISTS public.view_latest_indicator_analysis;
DROP VIEW IF EXISTS public.view_latest_insight;

-- Recreate views with SECURITY INVOKER (default, but explicit)
CREATE VIEW public.view_latest_economic_indicators 
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (indicator_type) *
FROM public.economic_indicators
ORDER BY indicator_type, reference_date DESC, created_at DESC;

CREATE VIEW public.view_latest_indicator_analysis 
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (indicator_type) *
FROM public.indicator_analysis
ORDER BY indicator_type, created_at DESC;

CREATE VIEW public.view_latest_insight 
WITH (security_invoker = true)
AS
SELECT * FROM public.insights
ORDER BY created_at DESC
LIMIT 1;