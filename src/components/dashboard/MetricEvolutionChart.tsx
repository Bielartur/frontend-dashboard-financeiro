import { useMemo, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { formatPeriodLabel } from '@/utils/formatters';
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  formatCurrency,
} from '@/data/financialData';
import { MonthlyData } from '@/models/Financial';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { EmptyDashboardState } from './EmptyDashboardState';

interface MetricEvolutionChartProps {
  selectedMetrics: string[];
  data: MonthlyData[];
  selectedYear: string;
  onSelectMetrics: (metrics: string[]) => void;
  type?: 'category' | 'merchant' | 'bank';
}

export function MetricEvolutionChart({
  selectedMetrics,
  data,
  selectedYear,
  onSelectMetrics,
  type = 'category'
}: MetricEvolutionChartProps) {
  const [open, setOpen] = useState(false);

  // Extract all unique metrics from the data for the dropdown
  const metricMeta = useMemo(() => {
    const meta = new Map<string, { name: string; color: string }>();
    data.forEach(month => {
      month.metrics.forEach(metric => {
        const slug = metric.id || metric.slug;
        if (!meta.has(slug)) {
          meta.set(slug, { name: metric.name, color: metric.colorHex });
        }
      });
    });
    return meta;
  }, [data]);

  const availableMetrics = Array.from(metricMeta.keys());
  const hasData = availableMetrics.length > 0;

  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onSelectMetrics(selectedMetrics.filter((c) => c !== metric));
    } else {
      onSelectMetrics([...selectedMetrics, metric]);
    }
  };

  // Gap filling logic
  const filledData = useMemo(() => {
    if (data.length === 0) return [];

    // Check if we are viewing a single year
    const years = new Set(data.map(d => d.year));
    if (years.size === 1) {
      const year = data[0].year;
      const filled = [];
      const monthsShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      // We need full months for the data object if we want to be consistent, but chart usually uses monthShort.
      // The original code used `month.month` (full) for `fullMonth`.
      // We need to map short to full manually if missing.
      const monthsFull = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

      for (let i = 0; i < 12; i++) {
        const mShort = monthsShort[i];
        const existing = data.find(d => d.monthShort === mShort && d.year === year);
        if (existing) {
          filled.push(existing);
        } else {
          // Mock empty month
          filled.push({
            month: monthsFull[i],
            monthShort: mShort,
            year: year,
            revenue: 0,
            expenses: 0,
            investments: 0,
            balance: 0,
            metrics: []
          });
        }
      }
      return filled;
    }
    return data;
  }, [data]);

  useEffect(() => {
    // Only set defaults if no categories are selected and we have data
    if (selectedMetrics.length === 0 && filledData.length > 0) {
      const totals = new Map<string, number>();

      filledData.forEach(month => {
        month.metrics?.forEach(metric => {
          const slug = metric.id || metric.slug;
          if (metric.type === 'expense') {
            totals.set(slug, (totals.get(slug) || 0) + Math.abs(Number(metric.total)));
          }
        });
      });

      const topMetrics = Array.from(totals.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by total descending
        .slice(0, 2)
        .map(entry => entry[0]);

      if (topMetrics.length > 0) {
        onSelectMetrics(topMetrics);
      }
    }
  }, [filledData, onSelectMetrics]); // Intentionally omitting selectedCategories to avoid fighting user clear action

  const chartData = useMemo(() => {
    if (selectedMetrics.length === 0) return [];

    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    // Map over filledData
    return filledData.map((month, index) => {
      const yearNum = selectedYear === 'last-12' ? -1 : parseInt(selectedYear);
      // Logic relies on index 0=Jan for single year. `filledData` ensures this if single year.
      // If multi-year (sparse), `index` is just position. Logic might be off for multi-year but 'last-12' usually implies past data anyway.
      const isFuture = selectedYear !== 'last-12' && yearNum === currentYear && index > currentMonthIndex;

      const monthData: any = {
        name: month.monthShort,
        fullMonth: month.month,
      };

      selectedMetrics.forEach(slug => {
        // Need to check if categories exists (mock object has empty list)
        const metric = month.metrics?.find(c => (c.id || c.slug) === slug);
        monthData[slug] = isFuture ? 0 : Math.abs(Number(metric?.total || 0));
      });

      return monthData;
    });
  }, [selectedMetrics, filledData, selectedYear]);

  const getTitle = () => {
    const noun = type === 'category' ? 'Categoria' : type === 'merchant' ? 'Estabelecimento' : 'Banco';
    return {
      title: `Evolução mensal por ${noun.toLowerCase()}`,
      placeholder: `Buscar ${noun.toLowerCase()}...`,
      selected: `${selectedMetrics.length} ${noun.toLowerCase()}(s) selecionado(s)`,
      empty: `Nenhum(a) ${noun.toLowerCase()} encontrado(a).`
    }
  }

  const uiLabels = getTitle();

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <span className="text-lg font-bold text-foreground mb-1">{uiLabels.title}</span>
          <p className="text-sm font-medium text-muted-foreground">
            {selectedMetrics.length > 0
              ? `${selectedMetrics.length} selecionado(s) ${formatPeriodLabel(selectedYear, 'in')}`
              : `Selecione para comparar`}
          </p>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[250px] justify-between h-10 px-3 text-left font-normal"
              disabled={!hasData}
            >
              <div className="flex gap-1 flex-wrap truncate">
                {selectedMetrics.length === 0 && "Selecione..."}
                {selectedMetrics.length > 0 && selectedMetrics.length <= 2 ? (
                  selectedMetrics.map((met) => (
                    <Badge variant="secondary" key={met} className="mr-1 bg-secondary/50 text-foreground font-normal border-none px-1.5 py-0 h-5">
                      {metricMeta.get(met)?.name || met}
                    </Badge>
                  ))
                ) : (
                  selectedMetrics.length > 2 && (
                    <Badge variant="secondary" className="bg-secondary/50 text-foreground font-normal border-none h-5">
                      {selectedMetrics.length} selecionados
                    </Badge>
                  )
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="end">
            <Command>
              <CommandInput placeholder={uiLabels.placeholder} />
              <CommandList>
                <CommandEmpty>{uiLabels.empty}</CommandEmpty>
                <CommandGroup>
                  {availableMetrics.map((met) => (
                    <CommandItem
                      key={met}
                      onSelect={() => toggleMetric(met)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedMetrics.includes(met)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{metricMeta.get(met)?.name || met}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {selectedMetrics.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => onSelectMetrics([])}
                        className="justify-center text-center cursor-pointer"
                      >
                        Limpar filtros
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-[300px]">
        {!hasData ? (
          <EmptyDashboardState height="h-full" />
        ) : selectedMetrics.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
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
                padding={{ top: 30 }}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--muted)/0.5)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card rounded-lg p-3 border border-border/50 shadow-xl max-h-[300px] overflow-y-auto">
                        <p className="text-sm font-semibold text-foreground mb-2">{payload[0].payload.fullMonth}</p>
                        <div className="flex flex-col gap-1">
                          {payload.sort((a, b) => (b.value as number) - (a.value as number)).map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.stroke }}
                                />
                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                              </div>
                              <span className="text-xs font-medium text-foreground">
                                {formatCurrency(entry.value as number)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {selectedMetrics.map((met) => (
                <Line
                  key={met}
                  type="monotone"
                  dataKey={met}
                  name={metricMeta.get(met)?.name || met}
                  stroke={metricMeta.get(met)?.color || '#888888'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="p-3 rounded-full bg-secondary/50">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[300px]">
              Selecione pelo menos um item acima para visualizar a evolução.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="mt-2"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Selecionar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
