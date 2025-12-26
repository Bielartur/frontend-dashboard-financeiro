import { useMemo } from 'react';
import {
  financialData,
  categoryColors,
  categoryLabels,
  formatCurrency,
  CategoryData,
} from '@/data/financialData';
import {
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Scatter,
  ZAxis,
} from 'recharts';

interface CategoryStackedChartProps {
  selectedMonth: number | null;
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

export function CategoryStackedChart({ selectedMonth }: CategoryStackedChartProps) {
  const categories = Object.keys(categoryLabels) as Array<keyof CategoryData>;

  const isMonthSelected = selectedMonth !== null;

  const monthlyChartData = financialData.map((month) => ({
    name: month.monthShort,
    ...month.categories,
  }));

  // Calculate average for each category (excluding selected month)
  const categoryAverages = useMemo(() => {
    if (!isMonthSelected) return {} as Record<keyof CategoryData, number>;
    
    const averages = {} as Record<keyof CategoryData, number>;
    categories.forEach((category) => {
      const otherMonthsValues = financialData
        .filter((_, index) => index !== selectedMonth)
        .map((month) => month.categories[category]);
      averages[category] = otherMonthsValues.reduce((a, b) => a + b, 0) / otherMonthsValues.length;
    });
    return averages;
  }, [selectedMonth, isMonthSelected]);

  // Build category chart data with base, excess, and savings
  const categoryChartData: CategoryChartItem[] = useMemo(() => {
    if (!isMonthSelected) return [];

    return categories
      .map((category) => {
        const value = financialData[selectedMonth].categories[category];
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
  }, [selectedMonth, isMonthSelected, categoryAverages]);

  const CustomTooltipStacked = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="glass-card rounded-lg p-4 border border-border/50 shadow-xl max-h-80 overflow-y-auto">
          <p className="text-sm font-semibold text-foreground mb-3">{label}</p>
          <div className="space-y-1.5">
            {payload
              .sort((a: any, b: any) => b.value - a.value)
              .map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipCategory = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as CategoryChartItem;
      if (!data) return null;

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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          {isMonthSelected
            ? `Gastos por Categoria - ${financialData[selectedMonth].month}`
            : 'Gastos Mensais por Categoria'}
        </h3>
        {isMonthSelected && (
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-expense" />
              <span className="text-muted-foreground">Acima da média</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-income opacity-60 border border-dashed border-income" />
              <span className="text-muted-foreground">Economia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-foreground opacity-70" style={{ borderTop: '2px dashed' }} />
              <span className="text-muted-foreground">Média</span>
            </div>
          </div>
        )}
      </div>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {isMonthSelected ? (
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
            <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltipStacked />} />
              {categories.map((category) => (
                <Bar
                  key={category}
                  dataKey={category}
                  name={categoryLabels[category]}
                  stackId="a"
                  fill={categoryColors[category]}
                  radius={[0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
