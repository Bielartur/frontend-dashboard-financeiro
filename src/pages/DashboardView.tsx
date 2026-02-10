
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { MonthlyMetricChart } from '@/components/dashboard/MonthlyMetricChart';
import { MetricEvolutionChart } from '@/components/dashboard/MetricEvolutionChart';
import { MetricDonutChart } from '@/components/dashboard/MetricDonutChart';
import { MetricTable } from '@/components/dashboard/MetricTable';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, ShoppingBag, Store, Landmark, TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardResponse } from '@/models/Financial';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export interface DashboardViewProps {
  // Data
  dashboardData: DashboardResponse | null;
  monthsData: DashboardResponse['months'];
  currentMonthData: DashboardResponse['months'][0] | null;
  displayData: {
    revenue: number;
    expenses: number;
    investments: number;
    balance: number;
  };
  isLoading: boolean;
  error: string | null;

  // State
  selectedMonth: number | null;
  selectedYear: string;
  selectedMetrics: string[];
  groupBy: 'category' | 'merchant' | 'bank';
  availableYears: number[];
  dataRangeLabel: string;
  availableMonthsList: { year: number, month: number, label: string }[];

  // Actions
  refresh: () => void;
  setGroupBy: (value: 'category' | 'merchant' | 'bank') => void;
  setSelectedMonth: (value: number | null) => void;
  setSelectedYear: (value: string) => void;
  onSelectMetrics: (value: string[]) => void;
  handleGroupByChange: (value: string) => void;
}

export const DashboardView = ({
  dashboardData,
  monthsData,
  currentMonthData,
  displayData,
  isLoading,
  error,
  selectedMonth,
  selectedYear,
  selectedMetrics,
  groupBy,
  availableYears,
  dataRangeLabel,
  refresh,
  setSelectedMonth,
  setSelectedYear,
  onSelectMetrics,
  handleGroupByChange
}: DashboardViewProps) => {

  if (isLoading) {
    return (
      <DashboardSkeleton />
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg font-medium">{error || "Não foi possível carregar os dados"}</span>
        </div>
        <Button onClick={refresh} variant="outline" isLoading={isLoading}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
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

      {/* Grouping Control */}
      <div className="-mt-2">
        <Tabs value={groupBy} onValueChange={handleGroupByChange} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="category" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="merchant" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Lojas
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              Bancos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
        <RevenueExpenseChart data={monthsData} />
        <MetricDonutChart
          selectedMonth={selectedMonth}
          data={monthsData}
          type={groupBy}
        />
      </div>

      {/* Charts Row 2 */}
      <MonthlyMetricChart
        selectedMonth={selectedMonth}
        data={monthsData}
        selectedYear={selectedYear}
        onSelectMonth={setSelectedMonth}
        type={groupBy}
      />

      {/* Category Annual Evolution */}
      <MetricEvolutionChart
        selectedMetrics={selectedMetrics}
        data={monthsData}
        selectedYear={selectedYear}
        onSelectMetrics={onSelectMetrics}
        type={groupBy}
      />

      {/* CategoryTable */}
      <MetricTable
        selectedMonth={selectedMonth}
        data={monthsData}
        selectedYear={selectedYear}
        type={groupBy}
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
