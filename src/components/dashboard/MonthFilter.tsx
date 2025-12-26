import { financialData } from '@/data/financialData';
import { cn } from '@/lib/utils';
import { Calendar, RotateCcw } from 'lucide-react';

interface MonthFilterProps {
  selectedMonth: number | null;
  onSelectMonth: (month: number | null) => void;
}

export function MonthFilter({ selectedMonth, onSelectMonth }: MonthFilterProps) {
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Filtrar por Mês</h3>
        </div>
        {selectedMonth !== null && (
          <button
            onClick={() => onSelectMonth(null)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Ver ano completo
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {financialData.map((month, index) => (
          <button
            key={month.month}
            onClick={() => onSelectMonth(selectedMonth === index ? null : index)}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
              selectedMonth === index
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {month.monthShort}
          </button>
        ))}
      </div>
    </div>
  );
}
