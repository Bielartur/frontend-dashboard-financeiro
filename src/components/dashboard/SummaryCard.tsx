import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/data/financialData';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'investment' | 'balance';
  delay?: number;
}



const iconStyles = {
  income: 'bg-income/20 text-income',
  expense: 'bg-expense/20 text-expense',
  investment: 'bg-investment/20 text-investment',
  balance: 'bg-balance/20 text-balance',
};

const valueStyles = {
  income: 'text-income',
  expense: 'text-expense',
  investment: 'text-investment',
  balance: 'text-balance',
};

export function SummaryCard({ title, value, icon: Icon, variant, delay = 0 }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-up'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-2xl font-bold tracking-tight', valueStyles[variant])}>
            {formatCurrency(value)}
          </p>
        </div>
        <div className={cn('rounded-lg p-3', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
