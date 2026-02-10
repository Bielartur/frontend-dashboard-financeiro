import { useMemo, useState, useEffect } from 'react';
import { formatPeriodLabel } from '@/utils/formatters';
import { MonthCombobox } from '@/components/shared/combobox/MonthCombobox';
import {
  formatCurrency,
} from '@/data/financialData';
import { MonthlyData } from '@/models/Financial';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EmptyDashboardState } from './EmptyDashboardState';

interface MonthlyMetricChartProps {
  selectedMonth: number | null;
  data: MonthlyData[];
  selectedYear: string;
  onSelectMonth: (month: number | null) => void;
  type?: 'category' | 'merchant' | 'bank';
}

interface MetricChartItem {
  name: string;
  metricId: string;
  value: number;
  base: number;
  excess: number;
  savings: number;
  average: number;
  fill: string;
  status: 'above_average' | 'below_average' | 'average' | 'unknown';
}

export function MonthlyMetricChart({ selectedMonth, data, selectedYear, onSelectMonth, type = 'category' }: MonthlyMetricChartProps) {
  // Internal state to handle "Annual Report" (-1) without affecting global selectedMonth
  const [internalMonth, setInternalMonth] = useState<number | null>(selectedMonth);

  useEffect(() => {
    setInternalMonth(selectedMonth);
  }, [selectedMonth]);

  const isMonthSelected = internalMonth !== null && internalMonth !== -1;
  const isAnnualReport = internalMonth === -1 || internalMonth === null;

  const handleMonthChange = (val: number) => {
    setInternalMonth(val);
    if (val !== -1) {
      onSelectMonth(val);
    }
  };

  // Calculate available months based on data provided
  const availableMonths = useMemo(() => {
    // Just map the available data. 
    // The parent ensures data is correct for the selected year/period.
    return data;
  }, [data]);

  // Check if we have data to show
  const hasData = useMemo(() => {
    if (isAnnualReport) {
      return data.some(m => m.metrics.length > 0);
    }
    return internalMonth !== null && data[internalMonth] && data[internalMonth].metrics.length > 0;
  }, [isAnnualReport, internalMonth, data]);


  // Build chart data
  const chartData: MetricChartItem[] = useMemo(() => {
    if (isAnnualReport) {
      // Annual Totals - Need to aggregate since backend provides monthly breakdown
      // For Annual, we don't have a "status" or "average" really, just total.
      const metricMap = new Map<string, MetricChartItem>();

      data.forEach(month => {
        month.metrics.forEach(metric => {
          // Usually we show Expenses here
          if (metric.type !== 'expense') return;

          const slug = metric.id || metric.slug;
          const existing = metricMap.get(slug);
          if (existing) {
            existing.value += Math.abs(Number(metric.total));
            existing.base += Math.abs(Number(metric.total));
          } else {
            metricMap.set(slug, {
              name: metric.name,
              metricId: slug,
              value: Math.abs(Number(metric.total)),
              base: Math.abs(Number(metric.total)),
              excess: 0,
              savings: 0,
              average: 0,
              fill: metric.colorHex,
              status: 'average'
            });
          }
        });
      });
      return Array.from(metricMap.values()).sort((a, b) => b.value - a.value);
    }

    if (!isMonthSelected || internalMonth === null || !data[internalMonth]) return [];

    const monthData = data[internalMonth];

    // Convert DashboardMetric[] to ChartItem
    return monthData.metrics
      .filter(metric => metric.type === 'expense') // Filter for expenses
      .map((metric) => {
        const value = Math.abs(Number(metric.total));
        const average = Math.abs(Number(metric.average));
        const isAboveAverage = value > average;
        const isBelowAverage = value < average;

        return {
          name: metric.name,
          metricId: metric.id || metric.slug,
          value,
          base: isAboveAverage ? average : value,
          excess: isAboveAverage ? value - average : 0,
          savings: isBelowAverage && average > 0 ? average - value : 0,
          average,
          fill: metric.colorHex,
          status: metric.status
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [internalMonth, isAnnualReport, isMonthSelected, data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as MetricChartItem;
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
              <span className="text-xs text-muted-foreground">Média (12 meses):</span>
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

  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    const data = payload as MetricChartItem;

    if (data.average === 0 || isAnnualReport) {
      return (
        <rect x={x} y={y} width={width} height={height} fill={data.fill} rx={4} ry={4} />
      );
    }

    const isAbove = data.value > data.average;
    const isBelow = data.value < data.average;

    // Calculate positions based on chart scale
    const scale = width / data.value;
    const avgPosition = data.average * scale;

    return (
      <g>
        {isAbove ? (
          <>
            <rect x={x} y={y} width={avgPosition} height={height} fill={data.fill} rx={0} ry={0} />
            <rect x={x + avgPosition} y={y} width={width - avgPosition} height={height} fill="hsl(var(--expense))" rx={4} ry={4} />
          </>
        ) : isBelow ? (
          <>
            <rect x={x} y={y} width={width} height={height} fill={data.fill} rx={0} ry={0} />
            <rect x={x + width} y={y} width={avgPosition - width} height={height} fill="hsl(var(--income))" opacity={0.4} rx={4} ry={4} strokeDasharray="4 2" stroke="hsl(var(--income))" strokeWidth={1} />
          </>
        ) : (
          <rect x={x} y={y} width={width} height={height} fill={data.fill} rx={4} ry={4} />
        )}

        <line x1={x + avgPosition} y1={y - 2} x2={x + avgPosition} y2={y + height + 2} stroke="hsl(var(--foreground))" strokeWidth={2} strokeDasharray="4 2" opacity={0.7} />
        <polygon points={`${x + avgPosition},${y - 4} ${x + avgPosition + 4},${y} ${x + avgPosition},${y + 4} ${x + avgPosition - 4},${y}`} fill="hsl(var(--foreground))" opacity={0.8} />
      </g>
    );
  };

  const getTitle = () => {
    const suffix = type === 'category' ? 'categoria' : type === 'merchant' ? 'estabelecimento' : 'banco';
    return isAnnualReport ? `Ranking Anual de Gastos` : `Relatório de gastos por ${suffix}`;
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <span className="text-lg font-bold text-foreground mb-1">
            {getTitle()}
          </span>
          <h3 className="text-sm font-medium text-muted-foreground">
            {isAnnualReport
              ? `Acumulado ${formatPeriodLabel(selectedYear, 'of')}`
              : (internalMonth !== null && data[internalMonth] ? `${data[internalMonth].month} de ${data[internalMonth].year}` : `Selecione um mês`)
            }
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-[180px]">
            <MonthCombobox
              selectedMonth={internalMonth}
              months={availableMonths}
              onSelectMonth={handleMonthChange}
            />
          </div>
        </div>
      </div>

      <div className="h-[350px]">
        {!hasData ? (
          <EmptyDashboardState height="h-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {(isAnnualReport || (internalMonth !== null && data[internalMonth])) ? (
              <BarChart
                data={chartData}
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
                    const maxAvg = Math.max(...chartData.map(d => d.average));
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
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
        )}
      </div>
    </div >
  );
}
