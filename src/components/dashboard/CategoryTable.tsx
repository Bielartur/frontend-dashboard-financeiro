import {
  financialData,
  getAnnualCategoryTotals,
  categoryColors,
  categoryLabels,
  formatCurrency,
  formatPercent,
  CategoryData,
} from '@/data/financialData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface CategoryTableProps {
  selectedMonth: number | null;
}

export function CategoryTable({ selectedMonth }: CategoryTableProps) {
  const categoryTotals =
    selectedMonth !== null
      ? financialData[selectedMonth].categories
      : getAnnualCategoryTotals();

  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  const tableData = (Object.keys(categoryTotals) as Array<keyof CategoryData>)
    .map((key) => ({
      key,
      name: categoryLabels[key],
      value: categoryTotals[key],
      color: categoryColors[key],
      percent: categoryTotals[key] / total,
    }))
    .sort((a, b) => b.value - a.value);

  const avgPercent = 1 / tableData.length;

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">
        {selectedMonth !== null
          ? `Detalhamento - ${financialData[selectedMonth].month}`
          : 'Detalhamento Anual por Categoria'}
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Categoria</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">
                Valor
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">
                % do Total
              </TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((item) => (
              <TableRow
                key={item.key}
                className="border-border/30 hover:bg-secondary/30 transition-colors"
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
      </div>
      <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Total de Gastos</span>
        <span className="text-lg font-bold text-expense">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
