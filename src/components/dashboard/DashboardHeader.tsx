import { Home, Calendar, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MonthCombobox } from '../shared/combobox/MonthCombobox';
import { BreadcrumbHeader } from "@/components/shared/BreadcrumbHeader";
import { useLocation } from 'react-router-dom';

interface DashboardHeaderProps {
  selectedMonth: number | null;
  selectedYear: string;
  onSelectYear: (year: string) => void;
  onSelectMonth: (index: number) => void;
  monthsWithData: { month: string; year: number }[];
  availableYears: number[];
  dataRangeLabel?: string;
}

export function DashboardHeader({
  selectedMonth,
  selectedYear,
  onSelectYear,
  onSelectMonth,
  monthsWithData,
  availableYears,
  dataRangeLabel
}: DashboardHeaderProps) {
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    if (path.includes('/merchants')) return [{ label: 'Lojas' }];
    if (path.includes('/banks')) return [{ label: 'Bancos' }];
    if (path.includes('/categories')) return [{ label: 'Categorias' }];
    return [{ label: 'Dashboard' }];
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in w-full">
      <div className="hidden md:block">
        <BreadcrumbHeader items={getBreadcrumbItems()} className="mb-0" />
      </div>

      {/* Filters */}
      <div className="flex gap-4 w-full md:w-auto justify-end">

        {/* Month Selector */}
          <MonthCombobox
            selectedMonth={selectedMonth}
            months={monthsWithData}
            onSelectMonth={onSelectMonth}
            disabled={monthsWithData.length === 0}
          />


        {/* Year Selector */}
        <div className="relative flex flex-col items-end gap-1 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground mr-1">
                Ano
              </span>
            </div>
            <Select
              value={selectedYear}
              onValueChange={onSelectYear}
            >
              <SelectTrigger className="w-[100px] h-6 border-none bg-transparent p-0 focus:ring-0 text-sm font-medium text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-12">Últimos 12</SelectItem>
                {availableYears.filter(y => y !== null).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {dataRangeLabel && (
            <span className="absolute -bottom-6 text-xs text-muted-foreground font-medium px-1 right-0 hidden sm:block">
              {dataRangeLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
