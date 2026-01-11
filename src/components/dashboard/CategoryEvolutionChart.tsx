import { useMemo, useState } from 'react';
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

interface CategoryEvolutionChartProps {
  selectedCategories: string[];
  data: MonthlyData[];
  selectedYear: string;
  onSelectCategories: (categories: string[]) => void;
}

export function CategoryEvolutionChart({
  selectedCategories,
  data,
  selectedYear,
  onSelectCategories,
}: CategoryEvolutionChartProps) {
  const [open, setOpen] = useState(false);

  // Extract all unique categories from the data for the dropdown
  const categoryMeta = useMemo(() => {
    const meta = new Map<string, { name: string; color: string }>();
    data.forEach(month => {
      month.categories.forEach(cat => {
        if (!meta.has(cat.slug)) {
          meta.set(cat.slug, { name: cat.name, color: cat.colorHex });
        }
      });
    });
    return meta;
  }, [data]);

  const availableCategories = Array.from(categoryMeta.keys());

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectCategories(selectedCategories.filter((c) => c !== category));
    } else {
      onSelectCategories([...selectedCategories, category]);
    }
  };

  const chartData = useMemo(() => {
    if (selectedCategories.length === 0) return [];

    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    // Map over all available months
    return data.map((month, index) => {
      // Common logic for future handling
      const yearNum = selectedYear === 'last-12' ? -1 : parseInt(selectedYear);
      // For last-12, all data is valid history/current. 
      // For specific year, we might want to zero out future months.
      const isFuture = selectedYear !== 'last-12' && yearNum === currentYear && index > currentMonthIndex;

      const monthData: any = {
        name: month.monthShort,
        fullMonth: month.month,
      };

      selectedCategories.forEach(catSlug => {
        const catMetric = month.categories.find(c => c.slug === catSlug);
        monthData[catSlug] = isFuture ? 0 : (catMetric?.total || 0);
      });

      return monthData;
    });
  }, [selectedCategories, data, selectedYear]);

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <span className="text-lg font-bold text-foreground mb-1">Evolução anual por categoria</span>
          <p className="text-sm font-medium text-muted-foreground">
            {selectedCategories.length > 0
              ? `${selectedCategories.length} categor(ias) selecionada(s) ${formatPeriodLabel(selectedYear, 'in')}`
              : `Selecione categorias para comparar`}
          </p>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[250px] justify-between h-10 px-3 text-left font-normal"
            >
              <div className="flex gap-1 flex-wrap truncate">
                {selectedCategories.length === 0 && "Selecione categorias"}
                {selectedCategories.length > 0 && selectedCategories.length <= 2 ? (
                  selectedCategories.map((cat) => (
                    <Badge variant="secondary" key={cat} className="mr-1 bg-secondary/50 text-foreground font-normal border-none px-1.5 py-0 h-5">
                      {categoryMeta.get(cat)?.name || cat}
                    </Badge>
                  ))
                ) : (
                  selectedCategories.length > 2 && (
                    <Badge variant="secondary" className="bg-secondary/50 text-foreground font-normal border-none h-5">
                      {selectedCategories.length} selecionadas
                    </Badge>
                  )
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Buscar categoria..." />
              <CommandList>
                <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                <CommandGroup>
                  {availableCategories.map((category) => (
                    <CommandItem
                      key={category}
                      onSelect={() => toggleCategory(category)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedCategories.includes(category)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{categoryMeta.get(category)?.name || category}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {selectedCategories.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => onSelectCategories([])}
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
        {selectedCategories.length > 0 ? (
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
              {selectedCategories.map((category) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  name={categoryMeta.get(category)?.name || category}
                  stroke={categoryMeta.get(category)?.color || '#888888'}
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
              Selecione pelo menos uma categoria acima para visualizar a evolução.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="mt-2"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Selecionar categorias
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

