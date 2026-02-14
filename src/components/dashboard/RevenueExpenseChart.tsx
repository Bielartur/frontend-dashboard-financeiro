import { formatCurrency } from '@/data/financialData';
import { MonthlyData } from '@/models/Financial';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { EmptyDashboardState } from './EmptyDashboardState';

interface RevenueExpenseChartProps {
  data: MonthlyData[];
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  const filledData = useMemo(() => {
    if (data.length === 0) return [];

    // Check if we are viewing a single year (all data points have same year)
    // If so, we fill gaps for Jan-Dec.
    const years = new Set(data.map(d => d.year));
    if (years.size === 1) {
      const year = data[0].year;
      const filled = [];
      const monthsShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      for (let i = 0; i < 12; i++) {
        const mShort = monthsShort[i];
        const existing = data.find(d => d.monthShort === mShort && d.year === year);
        if (existing) {
          filled.push({
            name: existing.monthShort,
            receita: Number(existing.revenue),
            gastos: Math.abs(Number(existing.expenses))
          });
        } else {
          filled.push({
            name: mShort,
            receita: 0,
            gastos: 0
          });
        }
      }
      return filled;
    }

    // For Multi-year or other cases, just return existing data (sparse)
    return data.map((month) => ({
      name: month.monthShort,
      receita: Number(month.revenue),
      gastos: Math.abs(Number(month.expenses)),
    }));
  }, [data]);

  const hasData = data.length > 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-3 border border-border/50 shadow-xl">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-slide-up">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Evolução Mensal: Receita vs Gastos
      </h3>
      <div className="h-[300px]">
        {!hasData ? (
          <EmptyDashboardState height="h-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filledData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="name"
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
                tickFormatter={(value) => `${(value / 1000).toFixed(0)} k`}
                padding={{ top: 30 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground capitalize">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="receita"
                name="Receita"
                stroke="hsl(var(--income))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--income))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="gastos"
                name="Gastos"
                stroke="hsl(var(--expense))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--expense))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
