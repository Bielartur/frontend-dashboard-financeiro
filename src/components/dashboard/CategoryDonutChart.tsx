import { useMemo } from 'react';
import {
  formatCurrency,
  formatPercent,
} from '@/data/financialData';
import { MonthlyData } from '@/models/Financial';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryDonutChartProps {
  selectedMonth: number | null;
  data: MonthlyData[];
}

export function CategoryDonutChart({ selectedMonth, data }: CategoryDonutChartProps) {
  // Aggregate data based on selection
  const aggregatedCategories = useMemo(() => {
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();

    const monthsToProcess = selectedMonth !== null ? [data[selectedMonth]] : data;

    monthsToProcess.forEach(month => {
      if (!month) return;
      month.categories.forEach(cat => {
        // Filter for EXPENSES only for the donut chart to make sense
        if (cat.type !== 'expense') return;

        const current = categoryMap.get(cat.slug) || { name: cat.name, value: 0, color: cat.colorHex };
        current.value += Number(cat.total);
        categoryMap.set(cat.slug, current);
      });
    });

    return Array.from(categoryMap.values());
  }, [selectedMonth, data]);

  const total = aggregatedCategories.reduce((sum, item) => sum + item.value, 0);

  const chartData = aggregatedCategories
    .map((item) => ({
      name: item.name,
      value: item.value,
      color: item.color,
      percent: total > 0 ? item.value / total : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card rounded-lg p-3 border border-border/50 shadow-xl">
          <p className="text-sm font-semibold text-foreground">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-muted-foreground">{formatPercent(data.percent)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">
        {selectedMonth !== null && data[selectedMonth]
          ? `Distribuição - ${data[selectedMonth].month}`
          : 'Distribuição Anual por Categoria'}
      </h3>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="h-[250px] w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-2">
          {chartData.slice(0, 10).map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">{item.name}</p>
                <p className="text-xs font-semibold text-foreground">
                  {formatPercent(item.percent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
