import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndicatorAnalysis } from "@/lib/types";
import { INDICATOR_NAMES, INDICATOR_UNITS } from "@/lib/types";

interface IndicatorCardProps {
  indicator: IndicatorAnalysis;
  className?: string;
}

export function IndicatorCard({ indicator, className }: IndicatorCardProps) {
  const getTrendIcon = () => {
    switch (indicator.trend) {
      case "alta":
        return <TrendingUp className="h-5 w-5" />;
      case "queda":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Minus className="h-5 w-5" />;
    }
  };

  const getTrendClass = () => {
    switch (indicator.trend) {
      case "alta":
        return "trend-up";
      case "queda":
        return "trend-down";
      default:
        return "trend-stable";
    }
  };

  const getTrendLabel = () => {
    switch (indicator.trend) {
      case "alta":
        return "Em alta";
      case "queda":
        return "Em queda";
      default:
        return "Estável";
    }
  };

  const formatVariation = () => {
    if (indicator.variation === null) return null;
    const sign = indicator.variation >= 0 ? "+" : "";
    return `${sign}${indicator.variation.toFixed(2)}%`;
  };

  return (
    <div className={cn("indicator-card group", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {INDICATOR_NAMES[indicator.indicator_type]}
          </p>
        </div>
        <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendClass())}>
          {getTrendIcon()}
          <span>{getTrendLabel()}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="stat-value text-foreground">
          {indicator.current_value.toFixed(2).replace(".", ",")}
        </span>
        <span className="text-lg text-muted-foreground">
          {INDICATOR_UNITS[indicator.indicator_type]}
        </span>
      </div>

      {indicator.variation !== null && (
        <div className={cn("mt-2 text-sm font-medium", getTrendClass())}>
          Variação: {formatVariation()}
        </div>
      )}
    </div>
  );
}
