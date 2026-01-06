export interface CategoryData {
  alimentacao: number;
  apartamento: number;
  lazer: number;
  outros: number;
  pagamentos: number;
  restaurante: number;
  saude: number;
  trabalho: number;
  transporte: number;
  vestuario: number;
}

export interface MonthlyData {
  month: string;
  monthShort: string;
  revenue: number;
  expenses: number;
  investments: number;
  categories: CategoryData;
}
