import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { MonthlyCategoryChart } from '@/components/dashboard/MonthlyCategoryChart';
import { CategoryEvolutionChart } from '@/components/dashboard/CategoryEvolutionChart';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { CategoryTable } from '@/components/dashboard/CategoryTable';
import { financialDataByYear } from '@/data/financialData';
import { CategoryData } from '@/models/Financial';
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [selectedCategories, setSelectedCategories] = useState<Array<keyof CategoryData>>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const currentYearData = financialDataByYear[selectedYear] || financialDataByYear[new Date().getFullYear()];

  // Update selected month when year changes
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (selectedYear === currentYear) {
      setSelectedMonth(new Date().getMonth());
    } else {
      setSelectedMonth(0); // Default to January for other years
    }
  }, [selectedYear]);

  const currentData =
    selectedMonth !== null
      ? {
        revenue: currentYearData[selectedMonth].revenue,
        expenses: currentYearData[selectedMonth].expenses,
        investments: currentYearData[selectedMonth].investments,
        balance:
          currentYearData[selectedMonth].revenue -
          currentYearData[selectedMonth].expenses -
          currentYearData[selectedMonth].investments,
      }
      : { revenue: 0, expenses: 0, investments: 0, balance: 0 }; // Fallback (should not happen with default month)

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <DashboardHeader
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
          />

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
            <RevenueExpenseChart selectedMonth={selectedMonth} data={currentYearData} />
            <CategoryDonutChart selectedMonth={selectedMonth} data={currentYearData} />
          </div>

          {/* Charts Row 2 */}
          <MonthlyCategoryChart
            selectedMonth={selectedMonth}
            data={currentYearData}
            selectedYear={selectedYear}
            onSelectMonth={setSelectedMonth}
          />


          {/* Category Annual Evolution */}
          <CategoryEvolutionChart
            selectedCategories={selectedCategories}
            data={currentYearData}
            selectedYear={selectedYear}
            onSelectCategories={setSelectedCategories}
          />

          {/* CategoryTable */}
          <CategoryTable
            selectedMonth={selectedMonth}
            data={currentYearData}
            selectedYear={selectedYear}
          />
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
