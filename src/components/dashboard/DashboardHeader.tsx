import { Home, Calendar, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MonthCombobox } from '../shared/combobox/MonthCombobox';
import { BreadcrumbHeader } from "@/components/shared/BreadcrumbHeader";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="flex justify-between animate-fade-in">
      {/* Top Row: Breadcrumb and Search */}
      <div className="flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="-ml-1">
          <BreadcrumbHeader items={[{ label: 'Dashboard' }]} />
        </div>
      </div>

      {/* Bottom Row: Filters */}
      <div className="flex items-center gap-4">

        {/* Search Field */}
        <div className="relative flex-1 max-w-md mr-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar"
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>

        {/* Month Selector */}
        <MonthCombobox
          selectedMonth={selectedMonth}
          months={monthsWithData}
          onSelectMonth={onSelectMonth}
          disabled={monthsWithData.length === 0}
        />


        {/* Year Selector */}
        <div className="relative flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground mr-1">
              Ano
            </span>
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
            <span className="absolute -bottom-6 text-xs text-muted-foreground font-medium px-1">
              {dataRangeLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
