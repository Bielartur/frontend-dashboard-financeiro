import { useState, useMemo, useEffect } from 'react';
import {
  financialData,
  getAnnualCategoryTotals,
  categoryColors,
  categoryLabels,
  formatCurrency,
  formatPercent,
} from '@/data/financialData';
import { CategoryData, MonthlyData } from '@/models/Financial';
import { Category } from '@/models/Category';
import { PaymentResponse } from '@/models/Payment';
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

import { PaymentTable } from './PaymentTable';

interface CategoryTableProps {
  selectedMonth: number | null;
  selectedYear: number;
  data: MonthlyData[];
}

export function CategoryTable({ selectedMonth, selectedYear, data }: CategoryTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof CategoryData | 'all'>('all');
  const { getCategories, searchPayments } = useRequests();
  const [categories, setCategories] = useState<Category[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      if (selectedCategory === 'all') {
        setPayments([]);
        return;
      }

      setIsLoading(true);
      try {
        const categoryLabel = categoryLabels[selectedCategory];
        const category = categories.find(c => c.name === categoryLabel);

        if (!category) {
          console.warn(`Category not found for label: ${categoryLabel}`);
          setPayments([]);
          return;
        }

        // Calculate start/end date for selectedMonth (year 2026 as per mock data context)
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (selectedMonth !== null) {
          startDate = new Date(selectedYear, selectedMonth, 1);
          endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of month
        } else {
          startDate = new Date(selectedYear, 0, 1);
          endDate = new Date(selectedYear, 11, 31);
        }

        const data = await searchPayments({
          categoryId: category.id,
          startDate,
          endDate
        });
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [selectedCategory, selectedMonth, selectedYear, categories]);

  const categoryTotals = useMemo(() => {
    return selectedMonth !== null
      ? data[selectedMonth].categories
      : getAnnualCategoryTotals(data);
  }, [selectedMonth, data]);

  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  const tableData = useMemo(() => {
    return (Object.keys(categoryTotals) as Array<keyof CategoryData>)
      .map((key) => ({
        key,
        name: categoryLabels[key],
        value: categoryTotals[key],
        color: categoryColors[key],
        percent: total > 0 ? categoryTotals[key] / total : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [categoryTotals, total]);

  const avgPercent = tableData.length > 0 ? 1 / tableData.length : 0;

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {selectedMonth !== null ? `Pagamentos - ${data[selectedMonth].month} de ${selectedYear}` : `Detalhamento de ${selectedYear}`}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {selectedCategory === 'all'
              ? "Visão geral dos gastos por categoria"
              : `Gastos com ${categoryLabels[selectedCategory]}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategory !== 'all' && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedCategory('all')}>
              <X className="w-4 h-4" />
            </Button>
          )}
          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val as keyof CategoryData | 'all')}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {Object.keys(categoryLabels).map((key) => (
                <SelectItem key={key} value={key}>
                  {categoryLabels[key as keyof CategoryData]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {selectedCategory === 'all' ? (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">Categoria</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Valor</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">% do Total</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item) => (
                <TableRow
                  key={item.key}
                  className="border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedCategory(item.key)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
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
                    {item.percent > avgPercent * 1.5 ? (
                      <div className="inline-flex items-center gap-1 text-expense">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Alto</span>
                      </div>
                    ) : item.percent < avgPercent * 0.5 ? (
                      <div className="inline-flex items-center gap-1 text-income">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs font-medium">Baixo</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">Normal</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <PaymentTable payments={payments} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
