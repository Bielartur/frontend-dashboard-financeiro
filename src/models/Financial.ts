export interface CategoryMetric {
  name: string;
  slug: string;
  colorHex: string;
  type: 'income' | 'expense';
  total: number;
  average: number;
  status: 'above_average' | 'below_average' | 'average';
}

export interface MonthlyData {
  month: string;
  monthShort: string;
  year: number;
  revenue: number;
  expenses: number;
  investments: number;
  balance: number;
  categories: CategoryMetric[];
}

export interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  totalInvestments: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  months: MonthlyData[];
}


export interface DashboardAvailableMonth {
  year: number;
  month: number;
  label: string;
}
