export interface MonthlyData {
  month: string;
  monthShort: string;
  revenue: number;
  expenses: number;
  investments: number;
  categories: CategoryData;
}

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

export const categoryLabels: Record<keyof CategoryData, string> = {
  alimentacao: 'Alimentação',
  apartamento: 'Apartamento',
  lazer: 'Lazer',
  outros: 'Outros',
  pagamentos: 'Pagamentos',
  restaurante: 'Restaurante',
  saude: 'Saúde',
  trabalho: 'Trabalho',
  transporte: 'Transporte',
  vestuario: 'Vestuário',
};

export const categoryColors: Record<keyof CategoryData, string> = {
  alimentacao: 'hsl(32, 95%, 55%)',
  apartamento: 'hsl(262, 83%, 58%)',
  lazer: 'hsl(330, 81%, 60%)',
  outros: 'hsl(215, 20%, 55%)',
  pagamentos: 'hsl(45, 93%, 47%)',
  restaurante: 'hsl(16, 85%, 55%)',
  saude: 'hsl(142, 76%, 36%)',
  trabalho: 'hsl(199, 89%, 48%)',
  transporte: 'hsl(280, 67%, 55%)',
  vestuario: 'hsl(350, 89%, 60%)',
};

export const financialData: MonthlyData[] = [
  {
    month: 'Janeiro',
    monthShort: 'Jan',
    revenue: 12500,
    expenses: 8750,
    investments: 2000,
    categories: {
      alimentacao: 1200,
      apartamento: 2500,
      lazer: 450,
      outros: 380,
      pagamentos: 1200,
      restaurante: 850,
      saude: 350,
      trabalho: 280,
      transporte: 890,
      vestuario: 650,
    },
  },
  {
    month: 'Fevereiro',
    monthShort: 'Fev',
    revenue: 12500,
    expenses: 9200,
    investments: 1800,
    categories: {
      alimentacao: 1150,
      apartamento: 2500,
      lazer: 680,
      outros: 420,
      pagamentos: 1350,
      restaurante: 920,
      saude: 280,
      trabalho: 320,
      transporte: 850,
      vestuario: 730,
    },
  },
  {
    month: 'Março',
    monthShort: 'Mar',
    revenue: 13200,
    expenses: 8450,
    investments: 2500,
    categories: {
      alimentacao: 1180,
      apartamento: 2500,
      lazer: 380,
      outros: 290,
      pagamentos: 1100,
      restaurante: 780,
      saude: 450,
      trabalho: 250,
      transporte: 920,
      vestuario: 600,
    },
  },
  {
    month: 'Abril',
    monthShort: 'Abr',
    revenue: 12500,
    expenses: 10200,
    investments: 1500,
    categories: {
      alimentacao: 1350,
      apartamento: 2500,
      lazer: 890,
      outros: 650,
      pagamentos: 1450,
      restaurante: 1100,
      saude: 380,
      trabalho: 350,
      transporte: 880,
      vestuario: 650,
    },
  },
  {
    month: 'Maio',
    monthShort: 'Mai',
    revenue: 14500,
    expenses: 9100,
    investments: 3000,
    categories: {
      alimentacao: 1220,
      apartamento: 2500,
      lazer: 520,
      outros: 380,
      pagamentos: 1280,
      restaurante: 890,
      saude: 420,
      trabalho: 290,
      transporte: 950,
      vestuario: 650,
    },
  },
  {
    month: 'Junho',
    monthShort: 'Jun',
    revenue: 12500,
    expenses: 8900,
    investments: 2200,
    categories: {
      alimentacao: 1190,
      apartamento: 2500,
      lazer: 450,
      outros: 320,
      pagamentos: 1150,
      restaurante: 850,
      saude: 380,
      trabalho: 280,
      transporte: 880,
      vestuario: 900,
    },
  },
  {
    month: 'Julho',
    monthShort: 'Jul',
    revenue: 15800,
    expenses: 11500,
    investments: 2500,
    categories: {
      alimentacao: 1380,
      apartamento: 2500,
      lazer: 1200,
      outros: 580,
      pagamentos: 1650,
      restaurante: 1350,
      saude: 320,
      trabalho: 380,
      transporte: 1240,
      vestuario: 900,
    },
  },
  {
    month: 'Agosto',
    monthShort: 'Ago',
    revenue: 12500,
    expenses: 8650,
    investments: 2000,
    categories: {
      alimentacao: 1150,
      apartamento: 2500,
      lazer: 420,
      outros: 350,
      pagamentos: 1180,
      restaurante: 820,
      saude: 450,
      trabalho: 260,
      transporte: 870,
      vestuario: 650,
    },
  },
  {
    month: 'Setembro',
    monthShort: 'Set',
    revenue: 12500,
    expenses: 9350,
    investments: 1800,
    categories: {
      alimentacao: 1200,
      apartamento: 2500,
      lazer: 580,
      outros: 420,
      pagamentos: 1320,
      restaurante: 950,
      saude: 380,
      trabalho: 320,
      transporte: 930,
      vestuario: 750,
    },
  },
  {
    month: 'Outubro',
    monthShort: 'Out',
    revenue: 13500,
    expenses: 9800,
    investments: 2200,
    categories: {
      alimentacao: 1280,
      apartamento: 2500,
      lazer: 650,
      outros: 480,
      pagamentos: 1380,
      restaurante: 1020,
      saude: 320,
      trabalho: 350,
      transporte: 920,
      vestuario: 900,
    },
  },
  {
    month: 'Novembro',
    monthShort: 'Nov',
    revenue: 12500,
    expenses: 10800,
    investments: 1000,
    categories: {
      alimentacao: 1320,
      apartamento: 2500,
      lazer: 720,
      outros: 550,
      pagamentos: 1580,
      restaurante: 1150,
      saude: 380,
      trabalho: 380,
      transporte: 970,
      vestuario: 1250,
    },
  },
  {
    month: 'Dezembro',
    monthShort: 'Dez',
    revenue: 18500,
    expenses: 14200,
    investments: 2000,
    categories: {
      alimentacao: 1650,
      apartamento: 2500,
      lazer: 1850,
      outros: 980,
      pagamentos: 2100,
      restaurante: 1680,
      saude: 350,
      trabalho: 420,
      transporte: 1120,
      vestuario: 1550,
    },
  },
];

export const getAnnualTotals = () => {
  const totals = financialData.reduce(
    (acc, month) => ({
      revenue: acc.revenue + month.revenue,
      expenses: acc.expenses + month.expenses,
      investments: acc.investments + month.investments,
    }),
    { revenue: 0, expenses: 0, investments: 0 }
  );

  return {
    ...totals,
    balance: totals.revenue - totals.expenses - totals.investments,
  };
};

export const getAnnualCategoryTotals = (): CategoryData => {
  return financialData.reduce(
    (acc, month) => {
      Object.keys(month.categories).forEach((key) => {
        const categoryKey = key as keyof CategoryData;
        acc[categoryKey] += month.categories[categoryKey];
      });
      return acc;
    },
    {
      alimentacao: 0,
      apartamento: 0,
      lazer: 0,
      outros: 0,
      pagamentos: 0,
      restaurante: 0,
      saude: 0,
      trabalho: 0,
      transporte: 0,
      vestuario: 0,
    }
  );
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};
