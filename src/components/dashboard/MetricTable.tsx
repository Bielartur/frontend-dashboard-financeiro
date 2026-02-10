import { useState, useMemo, useEffect } from 'react';
import {
  formatCurrency,
  formatPercent,
} from '@/data/financialData';
import { formatPeriodLabel, calculateYearForMonth } from '@/utils/formatters';
import { MonthlyData } from '@/models/Financial';
import { Category } from '@/models/Category';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { TransactionResponse } from '@/models/Transaction';
import { useRequests } from '@/hooks/use-requests';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, TrendingUp, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

import { TransactionTable } from '@/components/transactions/TransactionTable';

interface MetricTableProps {
  selectedMonth: number | null;
  selectedYear: string;
  data: MonthlyData[];
  type?: 'category' | 'merchant' | 'bank';
}

interface TableItem {
  key: string;
  name: string;
  value: number;
  color: string;
  percent: number;
  status: 'above_average' | 'below_average' | 'average' | 'unknown';
}

export function MetricTable({ selectedMonth, selectedYear, data, type = 'category' }: MetricTableProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const { getCategories, searchTransactions } = useRequests(); // TODO: Add search for Merchant/Bank transactions
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch categories if we are in category mode
    if (type === 'category') {
      getCategories().then(setCategories).catch(console.error);
    }
  }, [type]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (selectedMetric === 'all') {
        setTransactions([]);
        return;
      }

      setIsLoading(true);
      try {
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (selectedMonth !== null && data[selectedMonth]) {
          const monthData = data[selectedMonth];
          const year = monthData.year;

          const monthMap: Record<string, number> = {
            'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
            'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
          };
          const mIndex = monthMap[monthData.monthShort];

          if (mIndex !== undefined) {
            startDate = new Date(year, mIndex, 1);
            endDate = new Date(year, mIndex + 1, 0);
          }
        } else {
          // Annual
          if (selectedYear === 'last-12') {
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          } else {
            const y = parseInt(selectedYear);
            startDate = new Date(y, 0, 1);
            endDate = new Date(y, 11, 31);
          }
        }

        const filters: any = {
          page,
          startDate,
          endDate
        };

        if (type === 'category') {
          const category = categories.find(c => c.slug === selectedMetric);
          if (category) {
            filters.categoryId = category.id;
          } else {
            // Try to find by ID if slug fails (or if we set ID directly)
            filters.categoryId = selectedMetric;
          }
        } else if (type === 'merchant') {
          // Handle "Outros" (Others) - use grouped IDs from the metric
          if (selectedMetric === '__others__') {
            // Find the "Outros" metric and extract grouped IDs
            const groupedIds: string[] = [];
            const monthsToProcess = selectedMonth !== null ? [data[selectedMonth]] : data;
            monthsToProcess.forEach(month => {
              if (!month) return;
              const othersMetric = month.metrics.find(m => m.id === '__others__');
              if (othersMetric?.groupedIds) {
                groupedIds.push(...othersMetric.groupedIds);
              }
            });
            if (groupedIds.length > 0) {
              // Deduplicate and pass as array
              filters.merchantAliasIds = [...new Set(groupedIds)];
            }
          } else {
            // Regular merchant - use single ID in array
            filters.merchantAliasIds = [selectedMetric];
          }
        } else if (type === 'bank') {
          filters.bankId = selectedMetric;
        }

        const dataRes = await searchTransactions(filters);

        if (dataRes && dataRes.items) {
          setTransactions(dataRes.items);
          setTotalPages(dataRes.pages);
        } else {
          setTransactions([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedMetric, selectedMonth, selectedYear, categories, data, page, type]);

  // Aggregate or Select Data
  const tableData: TableItem[] = useMemo(() => {
    const isAnnual = selectedMonth === null;

    if (isAnnual) {
      // Aggregate all months
      const metricMap = new Map<string, TableItem>();
      let totalAnnual = 0; // Total absolute volume for percentage calculation

      data.forEach(month => {
        month.metrics.forEach(metric => {
          if (metric.type !== 'expense') return;

          const absVal = Math.abs(Number(metric.total));
          const slug = metric.id || metric.slug;
          const key = type === 'merchant' ? metric.name : slug; // Use Name for merchant search if ID not reliable or consistent for search

          // Actually, for consistency, let's use ID/Slug but ensure we can map back.
          // For Merchant, we likely want to search by Name if we don't have ID filter.
          // Let's stick to ID/Slug as Key.
          const existing = metricMap.get(slug);

          if (existing) {
            existing.value += absVal;
          } else {
            metricMap.set(slug, {
              key: slug,
              name: metric.name,
              value: absVal,
              color: metric.colorHex,
              percent: 0,
              status: 'average'
            });
          }
          totalAnnual += absVal;
        });
      });

      // Calculate percents and sort
      return Array.from(metricMap.values()).map(item => ({
        ...item,
        percent: totalAnnual > 0 ? item.value / totalAnnual : 0
      })).sort((a, b) => b.value - a.value);

    } else {
      // Specific Month
      if (!data[selectedMonth]) return [];

      const monthMetrics = data[selectedMonth].metrics.filter(c => c.type === 'expense');

      // Calculate total ABSOLUTE value for percentages
      const monthTotal = monthMetrics.reduce((sum, c) => sum + Math.abs(Number(c.total)), 0);

      return monthMetrics.map(metric => {
        const absValue = Math.abs(Number(metric.total));
        return {
          key: metric.id || metric.slug,
          name: metric.name,
          value: absValue,
          color: metric.colorHex,
          percent: monthTotal > 0 ? absValue / monthTotal : 0,
          status: metric.status
        };
      }).sort((a, b) => b.value - a.value);
    }
  }, [selectedMonth, data, type]);

  // Populate dropdown options from available data in table
  const availableOptions = tableData.map(t => ({ key: t.key, name: t.name }));

  const getTitle = () => {
    const suffix = type === 'category' ? 'Categoria' : type === 'merchant' ? 'Estabelecimento' : 'Banco';
    const noun = type === 'category' ? 'Categoria' : type === 'merchant' ? 'Estabelecimento' : 'Banco';

    return {
      label: `Filtrar por ${noun}`,
      placeholder: `Todos(as) ${noun}s`,
      selectedPrefix: `Gastos com ${availableOptions.find(c => c.key === selectedMetric)?.name || 'Selecionado'}`
    }
  }

  const uiLabels = getTitle();

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {selectedMonth !== null && data[selectedMonth]
              ? `Transações - ${data[selectedMonth].month} de ${data[selectedMonth].year}`
              : `Detalhamento ${formatPeriodLabel(selectedYear, 'of')}`}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {selectedMetric === 'all'
              ? "Visão geral dos gastos"
              : uiLabels.selectedPrefix}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMetric !== 'all' && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedMetric('all')}>
              <X className="w-4 h-4" />
            </Button>
          )}
          <Select
            value={selectedMetric}
            onValueChange={(val) => setSelectedMetric(val)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={uiLabels.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{uiLabels.placeholder}</SelectItem>
              {availableOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {selectedMetric === 'all' ? (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">Nome</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Valor</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">% do Total</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <EmptyState
                      title="Nenhum dado encontrado"
                      description="Não há gastos registrados para este período."
                      className="py-8"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((item) => (
                  <TableRow
                    key={item.key}
                    className="border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedMetric(item.key)}
                  >
                    <TableCell>
                      <CategoryBadge category={{ name: item.name, colorHex: item.color }} />
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {formatCurrency(item.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.percent * 100}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {formatPercent(item.percent)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.status === 'above_average' ? (
                        <div className="inline-flex items-center gap-1 text-expense">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs font-medium">Alto</span>
                        </div>
                      ) : item.status === 'below_average' ? (
                        <div className="inline-flex items-center gap-1 text-income">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-xs font-medium">Baixo</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">Normal</span>
                      )}
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        ) : (
          <TransactionTable
            transactions={transactions}
            isLoading={isLoading}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
            emptyMessage="Nenhuma transação encontrada para este filtro."
          />
        )}
      </div>
    </div>
  );
}
