import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRequests } from "@/hooks/use-requests";
import { useQuery } from "@tanstack/react-query";
import { Bank } from "@/models/Bank";
import { Category } from "@/models/Category";
import { TransactionImportResponse, TransactionCreate } from "@/models/Transaction";
import { ImportTransactionTable } from "@/components/import/ImportTransactionTable";
import { BankCombobox } from "@/components/shared/combobox/BankCombobox";
import { toast } from "sonner";
import { BreadcrumbHeader } from "@/components/shared/BreadcrumbHeader";

const ImportTransactions = () => {
  const api = useRequests();
  const [file, setFile] = useState<File | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [importType, setImportType] = useState<"invoice" | "statement">("invoice");
  const [importedTransactions, setImportedTransactions] = useState<TransactionImportResponse[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: banks = [] } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: api.getBanks,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  // Filter banks that support import (currently only Nubank)
  const supportedBanks = banks.filter(b => b.slug === "nubank");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedBank) {
      toast.error("Selecione um banco e um arquivo.");
      return;
    }

    setIsImporting(true);
    try {
      let source = "nubank"; // Default
      const bankObj = banks.find(b => b.id === selectedBank);
      if (bankObj) {
        const slug = bankObj.slug;
        if (slug === "nubank") source = "nubank";
        else if (slug === "itau") source = "itau";
      }

      const response = await api.importTransactions(file, source, importType);

      // Sort transactions: New First -> Known (Not Duplicate) -> Duplicates Last
      response.sort((a, b) => {
        const getRank = (p: TransactionImportResponse) => {
          if (p.alreadyExists) return 3; // Duplicates last
          if (p.hasMerchant) return 2;   // Known (Merchant found) second
          return 1;                      // New (No Merchant) first
        };
        return getRank(a) - getRank(b);
      });

      setImportedTransactions(response);

      // Select only non-duplicate items by default
      const nonDuplicateIndices = new Set(
        response.map((p, index) => (!p.alreadyExists ? index : -1)).filter(i => i !== -1)
      );
      setSelectedIndices(nonDuplicateIndices);

      toast.success("Fatura importada com sucesso!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao importar fatura.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleCategoryChange = (index: number, categoryId: string) => {
    const updatedTransactions = [...importedTransactions];
    const category = categories.find((c) => c.id === categoryId);

    if (category) {
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          colorHex: category.colorHex
        },
      };
      setImportedTransactions(updatedTransactions);
    }
  };

  const handleSaveTransactions = async () => {
    if (importedTransactions.length === 0) return;

    // Validate that all SELECTED transactions have a category
    const hasMissingCategories = importedTransactions.some((p, index) => selectedIndices.has(index) && !p.category?.id);
    if (hasMissingCategories) {
      toast.error("Por favor, selecione uma categoria para as transações selecionadas.");
      return;
    }

    if (!selectedBank) {
      toast.error("Banco não selecionado.");
      return;
    }

    setIsSaving(true);
    try {
      // Filter only selected transactions
      const selectedTransactions = importedTransactions.filter((_, index) => selectedIndices.has(index));

      const transactionsToCreate: TransactionCreate[] = selectedTransactions.map(p => ({
        id: p.id,
        title: p.title,
        date: p.date,
        amount: p.amount, // Allow signed values
        bankId: selectedBank,
        categoryId: p.category!.id, // Safe assertion due to validation above
        hasMerchant: p.hasMerchant,
        paymentMethod: p.paymentMethod?.value as any // Type assertion to match TransactionCreate
      }));

      await api.createTransactionsBulk(transactionsToCreate, importType);
      toast.success("Transações salvas com sucesso!");
      setImportedTransactions([]);
      setFile(null);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao salvar transações.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <BreadcrumbHeader items={[{ label: 'Transações', href: '/transactions' }, { label: 'Importar' }]} />
      </div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/transactions">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Importar Fatura</h1>
          <p className="text-muted-foreground">
            Carregue o extrato do seu banco para importar transações
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Banco</label>
            <BankCombobox
              value={selectedBank}
              banks={supportedBanks}
              onChange={setSelectedBank}
              placeholder="Selecione o banco"
              emptyText="Nenhum banco encontrado."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Importação</label>
            <Select value={importType} onValueChange={(v: "invoice" | "statement") => setImportType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Fatura do Cartão</SelectItem>
                <SelectItem value="statement">Extrato Bancário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Arquivo (CSV)</label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          <Button
            onClick={handleImport}
            isLoading={isImporting}
            disabled={!file || !selectedBank}
            className="w-full gap-2"
            variant="outline"
          >
            <Upload className="h-4 w-4" />
            Carregar Fatura
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Transações Selecionadas ({selectedIndices.size}/{importedTransactions.length})
          </h2>
          {importedTransactions.length > 0 && (
            <Button onClick={handleSaveTransactions} isLoading={isSaving} className="gap-2">
              <Check className="h-4 w-4" />
              Confirmar Importação
            </Button>
          )}
        </div>

        <ImportTransactionTable
          transactions={importedTransactions}
          categories={categories}
          selectedIndices={selectedIndices}
          onSelectionChange={setSelectedIndices}
          onCategoryChange={handleCategoryChange}
        />
      </div>
    </div>
  );
};

export default ImportTransactions;
