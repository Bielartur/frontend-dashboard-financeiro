import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardResponse } from '@/models/Financial';

interface UseDashboardViewReturn {
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
  setSelectedMetrics: (value: string[]) => void;
  handleGroupByChange: (value: string) => void;
}

export function useDashboardView(): UseDashboardViewReturn {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("last-12");
  const [availableMonthsList, setAvailableMonthsList] = useState<{ year: number, month: number, label: string }[]>([]);
  const [groupBy, setGroupBy] = useState<'category' | 'merchant' | 'bank'>('category');

  const {
    data: dashboardData,
    isLoading,
    error,
    refresh,
    getAvailableMonths
  } = useDashboard(selectedYear, groupBy);

  useEffect(() => {
    getAvailableMonths().then(data => {
      setAvailableMonthsList(data);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const monthsData = useMemo(() => dashboardData?.months || [], [dashboardData]);

  // Update selected month when data or year changes
  useEffect(() => {
    if (monthsData.length > 0) {
      if (selectedMonth === null || selectedMonth >= monthsData.length) {
        setSelectedMonth(monthsData.length - 1);
      }
    } else {
      setSelectedMonth(null);
    }
  }, [monthsData.length, selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableYears = useMemo(() => {
    return Array.from(new Set(availableMonthsList.map(m => m.year))).filter(y => y).sort((a, b) => b - a);
  }, [availableMonthsList]);

  const currentMonthData = useMemo(() =>
    (selectedMonth !== null && monthsData[selectedMonth]) ? monthsData[selectedMonth] : null
    , [selectedMonth, monthsData]);

  const currentSummary = dashboardData?.summary || {
    totalRevenue: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    balance: 0
  };

  const displayData = useMemo(() => currentMonthData ? {
    revenue: currentMonthData.revenue,
    expenses: currentMonthData.expenses,
    investments: currentMonthData.investments,
    balance: currentMonthData.balance
  } : {
    revenue: currentSummary.totalRevenue,
    expenses: currentSummary.totalExpenses,
    investments: currentSummary.totalInvestments || 0,
    balance: currentSummary.balance
  }, [currentMonthData, currentSummary]);

  const dataRangeLabel = useMemo(() => {
    if (monthsData.length > 0) {
      const first = monthsData[0];
      const last = monthsData[monthsData.length - 1];
      if (first.year === last.year) {
        return `Dados de ${first.year}`;
      } else {
        return `${first.monthShort}/${first.year} - ${last.monthShort}/${last.year}`;
      }
    }
    return "";
  }, [monthsData]);

  const handleGroupByChange = (value: string) => {
    setGroupBy(value as 'category' | 'merchant' | 'bank');
    setSelectedMetrics([]);
  };

  return {
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
    availableMonthsList,

    refresh,
    setGroupBy,
    setSelectedMonth,
    setSelectedYear,
    setSelectedMetrics,
    handleGroupByChange
  };
}
