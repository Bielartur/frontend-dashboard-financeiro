import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { MonthlyCategoryChart } from '@/components/dashboard/MonthlyCategoryChart';
import { CategoryEvolutionChart } from '@/components/dashboard/CategoryEvolutionChart';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { CategoryTable } from '@/components/dashboard/CategoryTable';
import { useDashboard } from '@/hooks/use-dashboard';
import { TrendingUp, TrendingDown, PiggyBank, Wallet, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("last-12");
  const [availableMonthsList, setAvailableMonthsList] = useState<{ year: number, month: number, label: string }[]>([]);

  const { data: dashboardData, isLoading, error, refresh, getAvailableMonths } = useDashboard(selectedYear);

  useEffect(() => {
    // Fetch available months on mount
    getAvailableMonths().then(data => {
      setAvailableMonthsList(data);
      if (data.length > 0 && selectedYear === 'last-12') {
        // Maybe default to the year of the last data?
        // For now, let's keep 'last-12' as default unless explicit requirement to change YEAR on load.
        // But the requirement is "mês padrão ... sim o último mês com dados"
        // If monthsData is populated, we select the last one.
      }
    });
  }, []);

  const monthsData = dashboardData?.months || [];

  // Update selected month when data or year changes
  useEffect(() => {
    if (monthsData.length > 0) {
      // Default to the last available month in the CURRENT data set
      if (selectedMonth === null || selectedMonth >= monthsData.length) {
        setSelectedMonth(monthsData.length - 1);
      }
    } else {
      setSelectedMonth(null);
    }
  }, [monthsData.length, selectedYear]);

  // Create available years list
  const availableYears = Array.from(new Set(availableMonthsList.map(m => m.year))).filter(y => y).sort((a, b) => b - a);

  // Auto-switch to latest year if "last-12" is empty but we have data in specific years
  // This handles the case where users have data (e.g. Jan 2025) but "last-12" (Feb 2025-Jan 2026) is empty.
  // Auto-switch removed in favor of backend "smart last-12" logic


  const currentMonthData =
    (selectedMonth !== null && monthsData[selectedMonth])
      ? monthsData[selectedMonth]
      : null;

  const currentSummary = dashboardData?.summary || {
    totalRevenue: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    balance: 0
  };

  // For SummaryCards, if a month is selected, show that month's data.
  // If no month is selected (e.g. Annual View request?), show Annual Summary.
  // The current UI enforces "selectedMonth" is almost always set, except maybe if we allow "Annual View".
  // Let's support Annual View if selectedMonth is null.

  const displayData = currentMonthData ? {
    revenue: currentMonthData.revenue,
    expenses: currentMonthData.expenses,
    investments: currentMonthData.investments,
    balance: currentMonthData.balance
  } : {
    revenue: currentSummary.totalRevenue,
    expenses: currentSummary.totalExpenses,
    investments: currentSummary.totalInvestments || 0,
    balance: currentSummary.balance
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg font-medium">{error || "Não foi possível carregar os dados"}</span>
        </div>
        <Button onClick={refresh} variant="outline">Tentar Novamente</Button>
      </div>
    );
  }

  // Calculate range label for display
  let dataRangeLabel = "";
  if (monthsData.length > 0) {
    const first = monthsData[0];
    const last = monthsData[monthsData.length - 1];
    if (first.year === last.year) {
      dataRangeLabel = `Dados de ${first.year}`;
    } else {
      dataRangeLabel = `${first.monthShort}/${first.year} - ${last.monthShort}/${last.year}`;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        onSelectMonth={(idx) => setSelectedMonth(idx === -1 ? null : idx)}
        monthsWithData={monthsData.map(m => ({ month: m.month, year: m.year }))}
        availableYears={availableYears}
        dataRangeLabel={dataRangeLabel}
      />


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title={selectedMonth !== null ? `Receita - ${currentMonthData?.monthShort}` : 'Receita Total'}
          value={displayData.revenue}
          icon={TrendingUp}
          variant="income"
          delay={0}
        />
        <SummaryCard
          title={selectedMonth !== null ? `Gastos - ${currentMonthData?.monthShort}` : 'Gastos Totais'}
          value={displayData.expenses}
          icon={TrendingDown}
          variant="expense"
          delay={50}
        />
        <SummaryCard
          title={selectedMonth !== null ? `Investimentos - ${currentMonthData?.monthShort}` : 'Investimentos Totais'}
          value={displayData.investments}
          icon={PiggyBank}
          variant="investment"
          delay={100}
        />
        <SummaryCard
          title={selectedMonth !== null ? `Saldo - ${currentMonthData?.monthShort}` : 'Saldo Estimado'}
          value={displayData.balance}
          icon={Wallet}
          variant="balance"
          delay={150}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueExpenseChart selectedMonth={selectedMonth} data={monthsData} />
        <CategoryDonutChart selectedMonth={selectedMonth} data={monthsData} />
      </div>

      {/* Charts Row 2 */}
      <MonthlyCategoryChart
        selectedMonth={selectedMonth}
        data={monthsData}
        selectedYear={selectedYear}
        onSelectMonth={setSelectedMonth}
      />


      {/* Category Annual Evolution */}
      <CategoryEvolutionChart
        selectedCategories={selectedCategories}
        data={monthsData}
        selectedYear={selectedYear}
        onSelectCategories={setSelectedCategories}
      />

      {/* CategoryTable */}
      <CategoryTable
        selectedMonth={selectedMonth}
        data={monthsData}
        selectedYear={selectedYear}
      />

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-border/30 text-center">
        <p className="text-sm text-muted-foreground">
          Dashboard Financeiro • Controle de Finanças Pessoais {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Index;
