import { useState, useMemo, useEffect } from 'react';
import {
  formatCurrency,
  formatPercent,
} from '@/data/financialData';
import { formatPeriodLabel, calculateYearForMonth } from '@/utils/formatters';
import { MonthlyData } from '@/models/Financial';
import { Category } from '@/models/Category';
import { CategoryBadge } from '@/components/CategoryBadge';
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
  selectedYear: string;
  data: MonthlyData[];
}

interface TableItem {
  key: string;
  name: string;
  value: number;
  color: string;
  percent: number;
  status: 'above_average' | 'below_average' | 'average';
}

export function CategoryTable({ selectedMonth, selectedYear, data }: CategoryTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
        const category = categories.find(c => c.slug === selectedCategory);

        if (!category) {
          console.warn(`Category not found for slug: ${selectedCategory}`);
          setPayments([]);
          return;
        }

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (selectedMonth !== null && data[selectedMonth]) {
          // Specific month selected
          const monthData = data[selectedMonth];
          const year = monthData.year;
          // monthData.month is string "Janeiro", need index. 
          // But we know the index from selectedMonth if it's standard year?
          // Actually `data` is ordered. But converting "Janeiro" to index 0 is safer?
          // Wait, we don't have month index in MonthlyData.
          // But we have `selectedMonth` index if it matches the data array.
          // If `selectedYear` is 'last-12', `data` is [Month-11, ... Month-0].
          // If `selectedMonth` is passed, it is the index in `data`.
          // So to get the actual date range:

          // We need 1st day of that month and Last day of that month.
          // We have `year`. We assume `data` is correct. 
          // Using a helper or parsing `monthData.month` to index?
          // OR simpler: Date parsing from `monthData.month` + `year`? Portuguese months...
          // A safer bet: The backend could return month index. It doesn't right now.
          // However, `data` is sorted.
          // If standard year: selectedMonth 0 = Jan.
          // If last-12: selectedMonth 0 = (CurrentMonth - 11).

          // Let's use the `year` from data, but for Month index?
          // We can trust `selectedMonth` as index relative to `data`.
          // BUT we need the actual calendar month (0-11) for Date constructor.

          // Workaround: Use a Map for month names if needed, or rely on `selectedYear` logic if standard.
          // For 'last-12', it's harder.

          // Alternative: `data` could contain `monthIndex` (0-11)? No.
          // `data` has `monthShort`: 'Jan', 'Fev'...
          // Let's rely on `data[selectedMonth]` as the source of truth for Year.
          // For Month index... let's try to map `monthShort` back to index 0-11.
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
          // Annual (no specific month selected)
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

        const dataRes = await searchPayments({
          categoryId: category.id,
          startDate,
          endDate
        });
        setPayments(dataRes);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [selectedCategory, selectedMonth, selectedYear, categories, data]);

  // Aggregate or Select Data
  const tableData: TableItem[] = useMemo(() => {
    const isAnnual = selectedMonth === null;

    if (isAnnual) {
      // Aggregate all months
      const categoryMap = new Map<string, TableItem>();
      let totalVal = 0;

      data.forEach(month => {
        month.categories.forEach(cat => {
          if (cat.type !== 'expense') return; // Only expenses in table usually? Or let's show all? Dashboard is usually expenses.

          const existing = categoryMap.get(cat.slug);
          if (existing) {
            existing.value += Number(cat.total);
          } else {
            categoryMap.set(cat.slug, {
              key: cat.slug,
              name: cat.name,
              value: Number(cat.total),
              color: cat.colorHex,
              percent: 0,
              status: 'average' // Annual status doesn't make sense or is average
            });
          }
          totalVal += Number(cat.total);
        });
      });

      // Calculate percents
      return Array.from(categoryMap.values()).map(item => ({
        ...item,
        percent: totalVal > 0 ? item.value / totalVal : 0
      })).sort((a, b) => b.value - a.value);

    } else {
      // Specific Month
      if (!data[selectedMonth]) return [];
      const monthCats = data[selectedMonth].categories.filter(c => c.type === 'expense');
      const monthTotal = monthCats.reduce((sum, c) => sum + Number(c.total), 0);


      return monthCats.map(cat => ({
        key: cat.slug,
        name: cat.name,
        value: cat.total,
        color: cat.colorHex,
        percent: monthTotal > 0 ? cat.total / monthTotal : 0,
        status: cat.status
      })).sort((a, b) => b.value - a.value);
    }
  }, [selectedMonth, data]);

  // Populate dropdown options from available data in table
  const availableCategories = tableData.map(t => ({ key: t.key, name: t.name }));

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {selectedMonth !== null && data[selectedMonth]
              ? `Pagamentos - ${data[selectedMonth].month} de ${data[selectedMonth].year}`
              : `Detalhamento ${formatPeriodLabel(selectedYear, 'of')}`}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {selectedCategory === 'all'
              ? "Visão geral dos gastos por categoria"
              : `Gastos com ${availableCategories.find(c => c.key === selectedCategory)?.name || 'Categoria Selecionada'}`}
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
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {availableCategories.map((cat) => (
                <SelectItem key={cat.key} value={cat.key}>
                  {cat.name}
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
