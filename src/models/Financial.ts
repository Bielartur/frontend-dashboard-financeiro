export interface DashboardMetric {
  id: string; // Changed from name/slug to id to match backend
  name: string;
  slug: string; // Keeping slug for backward compatibility if possible, or mapping id to it
  colorHex: string;
  logoUrl?: string; // Add logoUrl
  type: 'income' | 'expense';
  total: number;
  average: number;
  status: 'above_average' | 'below_average' | 'average' | 'unknown';
  groupedIds?: string[];  // IDs of aliases grouped into "Outros"
}

export interface MonthlyData {
  month: string;
  monthShort: string;
  year: number;
  revenue: number;
  expenses: number;
  investments: number;
  balance: number;
  metrics: DashboardMetric[];
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
