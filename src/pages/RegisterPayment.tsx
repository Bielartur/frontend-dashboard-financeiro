import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

import {
  useRequests,
  Category,
  Bank,
  Merchant
} from "@/hooks/use-requests";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  date: z.date({
    required_error: "A data é obrigatória",
  }),
  amount: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
  paymentMethod: z.enum(["pix", "credit_card", "debit_card", "other"], {
    required_error: "Selecione um método de pagamento",
  }),
  bankId: z.string().refine((val) => val !== "none" && val !== "", {
    message: "Selecione um banco válido",
  }).refine((val) => {
    // Simple UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(val);
  }, { message: "Selecione um banco válido" }),
  categoryId: z.string().optional(),
});

// Interfaces imported from hook

const RegisterPayment = () => {
  const api = useRequests();
  const [isLoading, setIsLoading] = useState(false);
  const [openMerchant, setOpenMerchant] = useState(false);
  const [merchantSearch, setMerchantSearch] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch Merchants (Search)
  const { data: merchants = [], isLoading: isLoadingMerchants } = useQuery<Merchant[]>({
    queryKey: ["merchants", debouncedSearch],
    queryFn: () => api.searchMerchants(debouncedSearch),
  });

  // Custom debounce effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(merchantSearch);
    }, 200);
    return () => clearTimeout(timer);
  }, [merchantSearch]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      bankId: "",
      categoryId: "",
      paymentMethod: "credit_card",
    },
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  // Fetch Banks
  const { data: banks = [] } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: api.getBanks,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await api.createPayment({
        title: values.title,
        date: format(values.date, "yyyy-MM-dd"),
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        bankId: values.bankId,
        categoryId: values.categoryId === "none" || !values.categoryId ? null : values.categoryId,
      });

      // if (!response.ok) handled by axios interceptor/normalizer

      toast.success("Pagamento cadastrado com sucesso!");
      form.reset({
        title: "",
        amount: 0,
        date: new Date(),
        paymentMethod: "credit_card",
        bankId: "none",
        categoryId: "none",
      });
      setMerchantSearch("");
      setSelectedMerchant(null);
    } catch (error) {
      toast.error(error.message ? error.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 w-full p-6 z-20">
        <Link to="/">
          <Button variant="secondary" className="gap-2 pl-2 hover:text-foreground hover:backdrop-blur-sm transition-all duration-300">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Voltar para Dashboard</span>
          </Button>
        </Link>
      </nav>

      <Card className="w-full max-w-lg z-10 shadow-lg">
        <CardHeader>
          <CardTitle>Cadastrar Pagamento</CardTitle>
          <CardDescription>
            Preencha os dados do novo pagamento abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Buscar estabelecimento..."
                            value={merchantSearch}
                            onValueChange={(val) => {
                              setMerchantSearch(val);
                              // Also update user input as they type if they want a custom name
                              if (!selectedMerchant) {
                                form.setValue("title", val);
                              }
                            }}
                          />
                          <CommandList>
                            {isLoadingMerchants && (
                              <div className="flex justify-center p-4">
                                <Spinner size={20} />
                              </div>
                            )}
                            <CommandEmpty className="py-2 px-4 text-sm text-muted-foreground">
                              {merchantSearch ? (
                                <div className="flex flex-col gap-1">
                                  <span>Nenhum estabelecimento encontrado.</span>
                                  <span className="font-medium text-primary">"{merchantSearch}" será cadastrado.</span>
                                </div>
                              ) : (
                                "Digite para buscar..."
                              )}
                            </CommandEmpty>
                            <CommandGroup heading="Sugestões">
                              {merchants.map((merchant) => (
                                <CommandItem
                                  key={merchant.id}
                                  value={merchant.name}
                                  onSelect={() => {
                                    form.setValue("title", merchant.name);
                                    setSelectedMerchant(merchant);
                                    if (merchant.categoryId) {
                                      form.setValue("categoryId", merchant.categoryId);
                                    }
                                    setMerchantSearch(merchant.name); // Keep the selected name in search
                                    setOpenMerchant(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      merchant.name === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {merchant.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>

                            {/* Allow free typing selection if search has value but no match, or explicit override */}
                            {merchantSearch && !merchants.find(m => m.name.toLowerCase() === merchantSearch.toLowerCase()) && (
                              <CommandGroup heading="Novo">
                                <CommandItem
                                  value={merchantSearch}
                                  onSelect={() => {
                                    form.setValue("title", merchantSearch);
                                    setSelectedMerchant(null);
                                    setOpenMerchant(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                                  Usar "{merchantSearch}"
                                </CommandItem>
                              </CommandGroup>
                            )}

                          </CommandList>
                        </Command>
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
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix">Pix</SelectItem>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um banco" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            Selecione um banco
                          </SelectItem>
                          {banks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            Categoria padrão ({selectedMerchant?.categoryId ? categories.find((category) => category.id === selectedMerchant.categoryId)?.name : "Nenhuma"})
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-muted-foreground">Categoria padrão do estabelecimento.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Cadastrando..." : "Cadastrar Pagamento"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPayment;
