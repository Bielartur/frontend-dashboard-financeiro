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

import { TransactionTable } from './TransactionTable';

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
  const { getCategories, searchTransactions } = useRequests();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (selectedCategory === 'all') {
        setTransactions([]);
        return;
      }

      setIsLoading(true);
      try {
        const category = categories.find(c => c.slug === selectedCategory);

        if (!category) {
          console.warn(`Category not found for slug: ${selectedCategory}`);
          setTransactions([]);
          return;
        }

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

        const dataRes = await searchTransactions({
          categoryId: category.id,
          page,
          startDate,
          endDate
        });
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
  }, [selectedCategory, selectedMonth, selectedYear, categories, data, page]);

  // Aggregate or Select Data
  const tableData: TableItem[] = useMemo(() => {
    const isAnnual = selectedMonth === null;

    if (isAnnual) {
      // Aggregate all months
      const categoryMap = new Map<string, TableItem>();
      let totalAnnualId = 0; // Total absolute volume for percentage calculation

      data.forEach(month => {
        month.categories.forEach(cat => {
          if (cat.type !== 'expense') return;

          const absVal = Math.abs(Number(cat.total));
          const existing = categoryMap.get(cat.slug);

          if (existing) {
            existing.value += absVal;
          } else {
            categoryMap.set(cat.slug, {
              key: cat.slug,
              name: cat.name,
              value: absVal,
              color: cat.colorHex,
              percent: 0,
              status: 'average'
            });
          }
          totalAnnualId += absVal;
        });
      });

      // Calculate percents and sort
      return Array.from(categoryMap.values()).map(item => ({
        ...item,
        percent: totalAnnualId > 0 ? item.value / totalAnnualId : 0
      })).sort((a, b) => b.value - a.value);

    } else {
      // Specific Month
      if (!data[selectedMonth]) return [];

      const monthCats = data[selectedMonth].categories.filter(c => c.type === 'expense');

      // Calculate total ABSOLUTE value for percentages
      const monthTotal = monthCats.reduce((sum, c) => sum + Math.abs(Number(c.total)), 0);

      return monthCats.map(cat => {
        const absValue = Math.abs(Number(cat.total));
        return {
          key: cat.slug,
          name: cat.name,
          value: absValue,
          color: cat.colorHex,
          percent: monthTotal > 0 ? absValue / monthTotal : 0,
          status: cat.status
        };
      }).sort((a, b) => b.value - a.value);
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
              ? `Transações - ${data[selectedMonth].month} de ${data[selectedMonth].year}`
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
          <TransactionTable
            transactions={transactions}
            isLoading={isLoading}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
