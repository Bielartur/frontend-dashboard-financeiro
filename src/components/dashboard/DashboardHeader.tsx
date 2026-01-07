import { financialData } from '@/data/financialData';
import { BarChart3, Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface DashboardHeaderProps {
  selectedMonth: number | null;
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export function DashboardHeader({ selectedMonth, selectedYear, onSelectYear }: DashboardHeaderProps) {
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
        <Link to="/register-payment">
          <Button variant="default" size="sm">Novo Pagamento</Button>
        </Link>
        <Link to="/register-bank">
          <Button variant="outline" size="sm">Novo Banco</Button>
        </Link>
        <Link to="/search-payments">
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </Link>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground mr-1">
            Relatório anual
          </span>
          <Select
            value={selectedYear.toString()}
            onValueChange={(val) => onSelectYear(parseInt(val))}
          >
            <SelectTrigger className="w-[80px] h-6 border-none bg-transparent p-0 focus:ring-0 text-sm font-medium text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
