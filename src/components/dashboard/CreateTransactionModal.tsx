import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRequests } from "@/hooks/use-requests";
import { TransactionSchema, TransactionFormValues } from "@/models/schemas/TransactionSchema";
import { Category } from "@/models/Category";
import { Bank } from "@/models/Bank";
import { Merchant } from "@/models/Merchant";
import { BaseModal } from "@/components/admin/BaseModal";
import { MerchantSelect } from "./MerchantSelect";
import { CategoryCombobox } from "@/components/shared/combobox/CategoryCombobox";
import { BankCombobox } from "@/components/shared/combobox/BankCombobox";
import { TransactionMethodCombobox } from "@/components/shared/combobox/TransactionMethodCombobox";

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTransactionModal({ isOpen, onClose, onSuccess }: CreateTransactionModalProps) {
  const api = useRequests();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Merchant Search State
  const [openMerchant, setOpenMerchant] = useState(false);
  const [merchantSearch, setMerchantSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(merchantSearch);
    }, 200);
    return () => clearTimeout(timer);
  }, [merchantSearch]);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      title: "",
      amount: 0,
      bankId: "",
      categoryId: "",
      paymentMethod: "credit_card",
      date: new Date(),
    },
  });

  // Form persisted across opens/closes since component remains mounted in SearchPayments


  // Queries
  const { data: merchants = [], isLoading: isLoadingMerchants } = useQuery<Merchant[]>({
    queryKey: ["merchants", debouncedSearch],
    queryFn: () => api.searchMerchants(debouncedSearch),
    enabled: isOpen, // Only fetch when open
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: api.getCategories,
    enabled: isOpen,
  });

  const { data: banks = [] } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: api.getBanks,
    enabled: isOpen,
  });

  async function onSubmit(values: TransactionFormValues) {
    setIsLoading(true);
    try {
      await api.createTransaction({
        title: values.title,
        date: format(values.date, "yyyy-MM-dd"),
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        bankId: values.bankId,
        categoryId: values.categoryId === "none" || !values.categoryId ? null : values.categoryId,
      });

      toast.success("Transação registrada!", {
        description: `Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(values.amount)}`,
      });

      // Invalidate queries to update lists
      queryClient.invalidateQueries({ queryKey: ["transactions-search"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // Reset only amount to allow rapid entry
      form.setValue("amount", 0);

      // Optional: focus logic could go here if we had a ref to the input, 
      // but standard React flow is enough for now.
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao registrar", {
        description: error.message || "Ocorreu um erro ao salvar a transação."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Transação"
      description="Preencha os dados da nova transação abaixo."
      maxWidth="sm:max-w-[520px]"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Título / Estabelecimento</FormLabel>
                <Popover open={openMerchant} onOpenChange={setOpenMerchant}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMerchant}
                        className={cn(
                          "w-full justify-between pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Selecione ou digite o estabelecimento"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <MerchantSelect
                      merchantSearch={merchantSearch}
                      onSearchChange={(val) => {
                        setMerchantSearch(val);
                        if (!selectedMerchant) {
                          form.setValue("title", val);
                        }
                      }}
                      isLoading={isLoadingMerchants}
                      merchants={merchants}
                      currentValue={field.value}
                      onSelect={(merchant, name) => {
                        form.setValue("title", name);
                        setSelectedMerchant(merchant);
                        if (merchant && merchant.categoryId) {
                          form.setValue("categoryId", merchant.categoryId);
                        }
                        setMerchantSearch(name);
                        setOpenMerchant(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de Pagamento</FormLabel>
                <FormControl>
                  <TransactionMethodCombobox
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione o método"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bankId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <FormControl>
                    <BankCombobox
                      value={field.value}
                      banks={banks}
                      onChange={field.onChange}
                      placeholder="Selecione um banco"
                      emptyText="Nenhum banco encontrado."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <CategoryCombobox
                    value={field.value}
                    categories={categories}
                    onChange={field.onChange}
                    extraOption={{
                      value: "none",
                      label: `Categoria sugerida (${selectedMerchant?.categoryId ? categories.find((category) => category.id === selectedMerchant.categoryId)?.name : "Nenhuma"})`
                    }}
                  />
                  <FormDescription className="text-xs text-muted-foreground">Categoria padrão do estabelecimento.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button className="w-1/2" type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button className="w-1/2" type="submit" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar Transação"}
            </Button>
          </div>
        </form>
      </Form>
    </BaseModal>
  );
}
