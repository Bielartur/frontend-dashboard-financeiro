import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Calendar as CalendarIcon, Filter, Plus, Download } from "lucide-react";
import { ClearFilterButton } from "@/components/ClearFilterButton";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRequests } from "@/hooks/use-requests";
import { PaymentResponse } from "@/models/Payment";
import { Category } from "@/models/Category";
import { Bank } from "@/models/Bank";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PaymentTable } from "@/components/dashboard/PaymentTable";
import { cn } from "@/lib/utils";
import { CreatePaymentModal } from "@/components/dashboard/CreatePaymentModal";

const SearchPayments = () => {
  const api = useRequests();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters State
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [bankId, setBankId] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  // Debounce effect for search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch filters data
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const { data: banks = [] } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: api.getBanks,
  });

  // Fetch Payments with Filters
  const { data: payments = [], isLoading } = useQuery<PaymentResponse[]>({
    queryKey: [
      "payments-search",
      debouncedSearch,
      paymentMethod,
      categoryId,
      bankId,
      startDate,
      endDate,
      minAmount,
      maxAmount
    ],
    queryFn: () => api.searchPayments({
      query: debouncedSearch,
      limit: 20,
      paymentMethod,
      categoryId,
      bankId,
      startDate,
      endDate,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    }),
  });



  const clearFilters = () => {
    setPaymentMethod("all");
    setCategoryId("all");
    setBankId("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setMinAmount("");
    setMaxAmount("");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-background relative pb-8">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header with Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Buscar Pagamentos</h1>
              <p className="text-muted-foreground">Filtragem avançada de pagamentos</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/import-payments">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Importar fatura
              </Button>
            </Link>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Pagamento
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-card border rounded-xl p-4 shadow-sm mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Filtros</h2>
            {(paymentMethod !== "all" || categoryId !== "all" || bankId !== "all" || startDate || endDate || minAmount || maxAmount || searchTerm) && (
              <ClearFilterButton onClick={clearFilters} label="Limpar filtros" className="ml-auto" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por estabelecimento..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Métodos</SelectItem>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>

            {/* Category */}
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bank */}
            <Select value={bankId} onValueChange={setBankId}>
              <SelectTrigger>
                <SelectValue placeholder="Banco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Bancos</SelectItem>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range - Start */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : <span>Data Início</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Date Range - End */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : <span>Data Fim</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Min Amount */}
            <Input
              type="number"
              placeholder="Valor Mínimo"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />

            {/* Max Amount */}
            <Input
              type="number"
              placeholder="Valor Máximo"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <PaymentTable
            payments={payments}
            isLoading={isLoading}
            emptyMessage="Nenhum pagamento encontrado."
            showCategory={true}
          />
        </div>
      </div>

      <CreatePaymentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default SearchPayments;
