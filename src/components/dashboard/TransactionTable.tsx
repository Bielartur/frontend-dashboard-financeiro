import { useState } from 'react';
import { TransactionResponse } from '@/models/Transaction';
import { getTransactionMethodIcon } from '@/utils/transaction-icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaginationControl } from '../shared/PaginationControl';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/data/financialData';
import { BankLogo } from '../shared/BankLogo';
import { CategoryBadge } from '../shared/CategoryBadge';
import { Button } from '@/components/ui/button';
import { EditTransactionModal } from './EditTransactionModal';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { useRequests } from '@/hooks/use-requests';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TransactionTableProps {
  transactions: TransactionResponse[];
  isLoading: boolean;
  emptyMessage?: string;
  showCategory?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function TransactionTable({
  transactions,
  isLoading,
  emptyMessage = "Nenhuma transação encontrada para esta categoria.",
  showCategory = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange
}: TransactionTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useRequests();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!deletingTransactionId) return;
    setIsDeleting(true);
    try {
      await api.deleteTransaction(deletingTransactionId);
      toast.success("Transação excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["transactions-search"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setDeletingTransactionId(null);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast.error("Erro ao excluir transação.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="relative space-y-4">

      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <div className="rounded-md border relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Carregando transações...</span>
            </div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Data</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Título</TableHead>
              {showCategory && <TableHead className="text-muted-foreground font-semibold">Categoria</TableHead>}
              <TableHead className="text-muted-foreground font-semibold">Forma de pagamento</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Banco</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Valor</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-center w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={showCategory ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-border/30 hover:bg-secondary/30 transition-colors group">
                  <TableCell className="text-muted-foreground">
                    {transaction.date.split('-').reverse().join('/')}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{transaction.title}</TableCell>
                  {showCategory && (
                    <TableCell>
                      {transaction.category && (
                        <CategoryBadge variant="subtle" category={transaction.category} />
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {(() => {
                      const { icon: Icon, colorClass } = getTransactionMethodIcon(transaction.paymentMethod?.value || 'other');
                      return (
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                            <Icon className={`w-4 h-4 ${colorClass}`} />
                          </div>
                          <span className="font-medium">{transaction.paymentMethod?.displayName || '-'}</span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-muted-foreground flex items-center gap-2">
                    <BankLogo
                      logoUrl={transaction.bank?.logoUrl}
                      name={transaction.bank?.name || ''}
                      colorHex={transaction.bank?.colorHex}
                    />
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${Number(transaction.amount) < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {Number(transaction.amount) > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingTransaction(transaction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeletingTransactionId(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow className="border-border/50 bg-secondary/10">
              <TableCell colSpan={showCategory ? 5 : 4} className="text-right font-bold">Total (Página)</TableCell>
              <TableCell className="text-right font-bold text-expense">
                {formatCurrency(transactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0))}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {editingTransaction && (
        <EditTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
