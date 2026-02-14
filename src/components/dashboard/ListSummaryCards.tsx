import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import { MonthlyData } from '@/models/Financial';

type Props = {
  selectedMonth: number | null,
  currentMonthData: MonthlyData | null,
  displayData: {
    revenue: number,
    expenses: number,
    investments: number,
    balance: number
  },
  isLoading: boolean
}

export function ListSummaryCards({ selectedMonth, currentMonthData, displayData, isLoading }: Props) {

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title={selectedMonth !== null ? `Receita - ${currentMonthData?.monthShort}` : 'Receita Total'}
        value={displayData.revenue}
        icon={TrendingUp}
        variant="income"
        delay={0}
        isLoading={isLoading}
      />
      <SummaryCard
        title={selectedMonth !== null ? `Gastos - ${currentMonthData?.monthShort}` : 'Gastos Totais'}
        value={displayData.expenses}
        icon={TrendingDown}
        variant="expense"
        isLoading={isLoading}
        delay={50}
      />
      <SummaryCard
        title={selectedMonth !== null ? `Investimentos - ${currentMonthData?.monthShort}` : 'Investimentos Totais'}
        value={displayData.investments}
        icon={PiggyBank}
        variant="investment"
        isLoading={isLoading}
        delay={100}
      />
      <SummaryCard
        title={selectedMonth !== null ? `Saldo - ${currentMonthData?.monthShort}` : 'Saldo Estimado'}
        value={displayData.balance}
        icon={Wallet}
        variant="balance"
        isLoading={isLoading}
        delay={150}
      />
    </div>
  );
}