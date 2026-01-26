import { BarChart3, Calendar, Search, Settings, UserCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MonthCombobox } from '../MonthCombobox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/20">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Dashboard Financeiro
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Controle suas finanças pessoais
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/search-payments">
          <Button variant="default" size="sm">Novo Pagamento</Button>
        </Link>
        <Link to="/search-payments">
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </Link>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <div className="w-[180px]">
            <MonthCombobox
              selectedMonth={selectedMonth}
              months={monthsWithData}
              onSelectMonth={onSelectMonth}
              disabled={monthsWithData.length === 0}
            />
          </div>
        </div>

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Configurações">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/admin">
              <DropdownMenuItem className="cursor-pointer">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Administração</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
