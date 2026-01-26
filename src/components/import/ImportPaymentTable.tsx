import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentImportResponse } from "@/models/Payment";
import { getPaymentMethodIcon } from "@/utils/payment-icons";
import { formatCurrency } from "@/data/financialData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Category } from "@/models/Category";

import { CategoryBadge } from "@/components/CategoryBadge";
import { CategoryCombobox } from "@/components/CategoryCombobox";
import { UploadCloud, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


interface ImportPaymentTableProps {
  payments: PaymentImportResponse[];
  categories: Category[];
  selectedIndices: Set<number>;
  onCategoryChange: (index: number, categoryId: string) => void;
  onSelectionChange: (indices: Set<number>) => void;
}

export function ImportPaymentTable({
  payments,
  categories,
  selectedIndices,
  onCategoryChange,
  onSelectionChange,
}: ImportPaymentTableProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card/50 rounded-xl border border-dashed text-muted-foreground animate-in fade-in-50">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <UploadCloud className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Aguardando Importação
        </h3>
        <p className="max-w-sm text-sm">
          Selecione o banco e faça o upload do arquivo CSV para que o sistema possa pré-preencher e categorizar seus pagamentos automaticamente.
        </p>
      </div>
    );
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select ALL items, including duplicates if user really wants
      const allIndices = new Set(payments.map((_, i) => i));
      onSelectionChange(allIndices);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleToggleRow = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    onSelectionChange(newSelected);
  };

  const allSelected = payments.length > 0 && selectedIndices.size === payments.length;

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Estabelecimento</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment, index) => {
            const isSelected = selectedIndices.has(index);
            const isDuplicate = payment.alreadyExists;

            const isNew = !payment.hasMerchant && !isDuplicate;
            const isExpense = payment.amount < 0;

            const filteredCategories = categories.filter((c) => {
              // Exclude system categories
              if (c.slug === "pagamento-de-fatura") {
                return false;
              }

              // Allow neutral categories for both flows
              if (c.type === "neutral") return true;

              // Otherwise match exact flow
              return isExpense ? c.type === "expense" : c.type === "income";
            });

            return (
              <TableRow
                key={`${index}-${payment.title}`}
                className={
                  isDuplicate
                    ? "bg-yellow-500/10 hover:bg-yellow-500/20"
                    : isNew
                      ? "bg-blue-500/5 hover:bg-blue-500/10"
                      : undefined
                }
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleRow(index)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {format(new Date(payment.date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className={cn("flex", isDuplicate ? "flex-col" : isNew ? "items-center gap-2" : undefined)}>
                    <span className="font-medium">{payment.title}</span>
                    <div className="flex gap-2 mt-1">
                      {isDuplicate && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-yellow-600 border-yellow-200 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                          <AlertTriangle className="h-3 w-3" />
                          Duplicado
                        </Badge>
                      )}
                      {!payment.hasMerchant && !isDuplicate && (
                        <Badge variant="outline" className="text-[10px] bg-green-900/30 text-green-400 border-green-800">Novo</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    // Fix: extract value safely
                    const methodValue = payment.paymentMethod?.value || 'other';
                    const { icon: Icon, colorClass } = getPaymentMethodIcon(methodValue);
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                          <Icon className={`w-4 h-4 ${colorClass}`} />
                        </div>
                        <span className="font-medium text-xs">
                          {payment.paymentMethod?.displayName || "Desconhecido"}
                        </span>
                      </div>
                    );
                  })()}
                </TableCell>
                <TableCell className="w-[300px]">
                  {(payment.paymentMethod?.value === "bill_payment" || payment.paymentMethod?.value === "investment_redemption") && payment.category ? (
                    <div className="flex items-center">
                      <CategoryBadge category={payment.category} />
                    </div>
                  ) : (
                    <CategoryCombobox
                      value={payment.category?.id || "uncategorized"}
                      categories={filteredCategories}
                      onChange={(value) => onCategoryChange(index, value)}
                    />
                  )}
                </TableCell>
                <TableCell className={cn("text-right font-medium", isExpense ? "text-red-500" : "text-green-500")}>
                  {formatCurrency(payment.amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
