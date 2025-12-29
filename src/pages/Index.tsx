import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { MonthFilter } from '@/components/dashboard/MonthFilter';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { CategoryStackedChart } from '@/components/dashboard/CategoryStackedChart';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { CategoryTable } from '@/components/dashboard/CategoryTable';
import { financialData, getAnnualTotals, CategoryData } from '@/data/financialData';
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import { CategoryFilter } from '@/components/dashboard/CategoryFilter';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<keyof CategoryData | null>(null);

  const annualTotals = getAnnualTotals();

  const currentData =
    selectedMonth !== null
      ? {
        revenue: financialData[selectedMonth].revenue,
        expenses: financialData[selectedMonth].expenses,
        investments: financialData[selectedMonth].investments,
        balance:
          financialData[selectedMonth].revenue -
          financialData[selectedMonth].expenses -
          financialData[selectedMonth].investments,
      }
      : annualTotals;

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <DashboardHeader selectedMonth={selectedMonth} />


          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title={selectedMonth !== null ? 'Receita do Mês' : 'Receita Total'}
              value={currentData.revenue}
              icon={TrendingUp}
              variant="income"
              delay={0}
            />
            <SummaryCard
              title={selectedMonth !== null ? 'Gastos do Mês' : 'Gastos Totais'}
              value={currentData.expenses}
              icon={TrendingDown}
              variant="expense"
              delay={50}
            />
            <SummaryCard
              title={selectedMonth !== null ? 'Investimentos do Mês' : 'Investimentos Totais'}
              value={currentData.investments}
              icon={PiggyBank}
              variant="investment"
              delay={100}
            />
            <SummaryCard
              title={selectedMonth !== null ? 'Saldo do Mês' : 'Saldo Estimado'}
              value={currentData.balance}
              icon={Wallet}
              variant="balance"
              delay={150}
            />
          </div>


          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueExpenseChart selectedMonth={selectedMonth} />
            <CategoryDonutChart selectedMonth={selectedMonth} />
          </div>

          {/* Month Filter */}
          <MonthFilter selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />

          {/* Category Filter */}
          <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          
          {/* Charts Row 2 */}
          <CategoryStackedChart selectedMonth={selectedMonth} selectedCategory={selectedCategory} />



          {/* Category Table */}
          <CategoryTable selectedMonth={selectedMonth} />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            Dashboard Financeiro • Controle de Finanças Pessoais {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
