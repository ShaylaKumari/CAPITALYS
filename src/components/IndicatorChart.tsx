import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EconomicIndicator } from "@/lib/types";
import { INDICATOR_NAMES } from "@/lib/types";

interface IndicatorChartProps {
  data: EconomicIndicator[];
  selectedPeriod: "12" | "24" | "60";
}

function groupByDate(data: EconomicIndicator[]): Record<string, Record<string, unknown>> {
  return data.reduce(
    (acc, indicator) => {
      const date = indicator.reference_date;
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][indicator.indicator_type] = indicator.value;
      return acc;
    },
    {} as Record<string, Record<string, unknown>>,
  );
}

function formatAxisDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

function formatTooltipLabel(label: string): string {
  return new Date(label).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function formatTooltipValue(value: number, name: string): [string, string] {
  return [`${value.toFixed(2)}%`, INDICATOR_NAMES[name] || name];
}

export function IndicatorChart({ data, selectedPeriod }: IndicatorChartProps) {
  const chartData = useMemo(() => {
    const grouped = groupByDate(data);

    const sorted = Object.values(grouped).sort(
      (a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime(),
    );

    const periodMonths = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - periodMonths);

    return sorted.filter((item) => new Date(item.date as string) >= cutoffDate);
  }, [data, selectedPeriod]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "var(--shadow-lg)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={formatTooltipValue}
            labelFormatter={formatTooltipLabel}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => INDICATOR_NAMES[value] || value}
          />
          <Line
            type="monotone"
            dataKey="selic"
            name="selic"
            stroke="hsl(var(--chart-selic))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-selic))", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="ipca"
            name="ipca"
            stroke="hsl(var(--chart-ipca))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-ipca))", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="pib_crescimento"
            name="pib_crescimento"
            stroke="hsl(var(--chart-pib))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-pib))", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
