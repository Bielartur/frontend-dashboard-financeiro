import { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  categoryColors,
  categoryLabels,
  formatCurrency,
} from '@/data/financialData';
import { CategoryData, MonthlyData } from '@/models/Financial';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyCategoryChartProps {
  selectedMonth: number | null;
  data: MonthlyData[];
  selectedYear: number;
  onSelectMonth: (month: number | null) => void;
}

interface CategoryChartItem {
  name: string;
  category: keyof CategoryData;
  value: number;
  base: number;
  excess: number;
  savings: number;
  average: number;
  fill: string;
}

export function MonthlyCategoryChart({ selectedMonth, data, selectedYear, onSelectMonth }: MonthlyCategoryChartProps) {
  const categories = Object.keys(categoryLabels) as Array<keyof CategoryData>;

  // Internal state to handle "Annual Report" (-1) without affecting global selectedMonth
  const [internalMonth, setInternalMonth] = useState<number | null>(selectedMonth);

  // Sync internal state when prop changes, unless we are in "Annual" view and want to stay there?
  // Actually, standard behavior: if parent changes (e.g. from header), we should probably sync.
  useEffect(() => {
    setInternalMonth(selectedMonth);
  }, [selectedMonth]);

  const isMonthSelected = internalMonth !== null && internalMonth !== -1;
  const isAnnualReport = internalMonth === -1;

  const handleMonthChange = (val: string) => {
    const newVal = parseInt(val);
    setInternalMonth(newVal);
    // Only propagate to parent if it's a valid month, otherwise keep parent as is/null or don't call?
    // If we want "Consistency", maybe we shouldn't allow the dashboard to be out of sync.
    // But since the requirement is "option in THIS file", local state is safer to avoid breaking other charts.
    if (newVal !== -1) {
      onSelectMonth(newVal);
    }
  };

  // Calculate available months based on current date
  const availableMonths = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    if (selectedYear < currentYear) {
      return data; // All months available
    } else if (selectedYear === currentYear) {
      return data.slice(0, currentMonthIndex + 1); // Only up to current month
    } else {
      return []; // No months available for future years
    }
  }, [selectedYear, data]);

  // Calculate average for each category (excluding selected month)
  const categoryAverages = useMemo(() => {
    if (!isMonthSelected || internalMonth === null) return {} as Record<keyof CategoryData, number>;

    const averages = {} as Record<keyof CategoryData, number>;
    categories.forEach((category) => {
      const otherMonthsValues = data
        .filter((_, index) => index !== internalMonth)
        .map((month) => month.categories[category]);
      averages[category] = otherMonthsValues.reduce((a, b) => a + b, 0) / otherMonthsValues.length;
    });
    return averages;
  }, [internalMonth, isMonthSelected, data]);

  // Build category chart data
  const categoryChartData: CategoryChartItem[] = useMemo(() => {
    if (isAnnualReport) {
      // Annual Totals
      return categories.map(category => {
        const totalValue = data.reduce((sum, month) => sum + month.categories[category], 0);
        return {
          name: categoryLabels[category],
          category,
          value: totalValue,
          base: totalValue,
          excess: 0,
          savings: 0,
          average: 0, // No average line for annual
          fill: categoryColors[category],
        };
      }).sort((a, b) => b.value - a.value);
    }

    if (!isMonthSelected || internalMonth === null) return [];

    return categories
      .map((category) => {
        const value = data[internalMonth].categories[category];
        const average = categoryAverages[category];
        const isAboveAverage = value > average;
        const isBelowAverage = value < average;

        return {
          name: categoryLabels[category],
          category,
          value,
          base: isAboveAverage ? average : value,
          excess: isAboveAverage ? value - average : 0,
          savings: isBelowAverage ? average - value : 0,
          average,
          fill: categoryColors[category],
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [internalMonth, isAnnualReport, isMonthSelected, categoryAverages, data]);

  const CustomTooltipCategory = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as CategoryChartItem;
      if (!data) return null;

      if (isAnnualReport) {
        return (
          <div className="glass-card rounded-lg p-3 border border-border/50 shadow-xl min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: data.fill }}
              />
              <span className="text-sm font-medium text-foreground">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Total Anual:</span>
              <span className="text-xs font-bold text-foreground">{formatCurrency(data.value)}</span>
            </div>
          </div>
        )
      }

      const diff = data.value - data.average;
      const diffPercent = data.average > 0 ? ((diff / data.average) * 100).toFixed(1) : '0';
      const isAbove = diff > 0;
      const isBelow = diff < 0;

      return (
        <div className="glass-card rounded-lg p-3 border border-border/50 shadow-xl min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.fill }}
            />
            <span className="text-sm font-medium text-foreground">{data.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Valor:</span>
              <span className="text-xs font-bold text-foreground">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Média (outros meses):</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(data.average)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {isAbove ? 'Excesso:' : isBelow ? 'Economia:' : 'Diferença:'}
              </span>
              <span className={`text-xs font-semibold ${isAbove ? 'text-expense' : isBelow ? 'text-income' : 'text-muted-foreground'}`}>
                {formatCurrency(Math.abs(diff))} ({Math.abs(Number(diffPercent))}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom bar shape that shows the average line
  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    const data = payload as CategoryChartItem;

    // For annual report, just show simple bar
    if (data.average === 0) {
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={data.fill}
          rx={4}
          ry={4}
        />
      );
    }

    const isAbove = data.value > data.average;
    const isBelow = data.value < data.average;

    // Calculate positions based on chart scale
    const scale = width / data.value;
    const avgPosition = data.average * scale;

    return (
      <g>
        {/* Main bar - colored by category or split if above average */}
        {isAbove ? (
          <>
            {/* Base portion up to average */}
            <rect
              x={x}
              y={y}
              width={avgPosition}
              height={height}
              fill={data.fill}
              rx={0}
              ry={0}
            />
            {/* Excess portion in red */}
            <rect
              x={x + avgPosition}
              y={y}
              width={width - avgPosition}
              height={height}
              fill="hsl(var(--expense))"
              rx={4}
              ry={4}
            />
          </>
        ) : isBelow ? (
          <>
            {/* Actual value bar */}
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={data.fill}
              rx={0}
              ry={0}
            />
            {/* Savings portion in green (ghost bar showing what was saved) */}
            <rect
              x={x + width}
              y={y}
              width={avgPosition - width}
              height={height}
              fill="hsl(var(--income))"
              opacity={0.4}
              rx={4}
              ry={4}
              strokeDasharray="4 2"
              stroke="hsl(var(--income))"
              strokeWidth={1}
            />
          </>
        ) : (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={data.fill}
            rx={4}
            ry={4}
          />
        )}

        {/* Average reference line */}
        <line
          x1={x + avgPosition}
          y1={y - 2}
          x2={x + avgPosition}
          y2={y + height + 2}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
          strokeDasharray="4 2"
          opacity={0.7}
        />
        {/* Small diamond marker at average */}
        <polygon
          points={`${x + avgPosition},${y - 4} ${x + avgPosition + 4},${y} ${x + avgPosition},${y + 4} ${x + avgPosition - 4},${y}`}
          fill="hsl(var(--foreground))"
          opacity={0.8}
        />
      </g>
    );
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <span className="text-lg font-bold text-foreground mb-1">
            {isAnnualReport ? "Ranking Anual de Gastos" : "Relatório de gastos por mês"}
          </span>
          <h3 className="text-sm font-medium text-muted-foreground">
            {isAnnualReport
              ? `Acumulado de ${selectedYear}`
              : (internalMonth !== null ? `${data[internalMonth].month} de ${selectedYear}` : `Selecione um mês`)
            }
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={internalMonth !== null ? internalMonth.toString() : ""}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">Relatório Anual</SelectItem>
              {availableMonths.map((month, index) => (
                <SelectItem key={month.month} value={index.toString()}>
                  {month.month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {internalMonth !== null ? (
            <BarChart
              data={categoryChartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={true} vertical={false} />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                domain={[0, (dataMax: number) => {
                  if (isAnnualReport) return dataMax * 1.1;
                  const maxAvg = Math.max(...categoryChartData.map(d => d.average));
                  return Math.max(dataMax, maxAvg) * 1.1;
                }]}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip content={<CustomTooltipCategory />} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
              <Bar
                dataKey="value"
                shape={<CustomBar />}
                isAnimationActive={true}
              />
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Selecione um mês para visualizar o relatório.
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div >
  );
}
