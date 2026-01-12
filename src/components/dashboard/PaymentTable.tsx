import { useState } from 'react';
import { PaymentResponse } from '@/models/Payment';
import { getPaymentMethodIcon } from '@/utils/payment-icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/data/financialData';
import { BankLogo } from '../BankLogo';
import { CategoryBadge } from '../CategoryBadge';
import { Button } from '@/components/ui/button';
import { EditPaymentModal } from './EditPaymentModal';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { useRequests } from '@/hooks/use-requests';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PaymentTableProps {
  payments: PaymentResponse[];
  isLoading: boolean;
  emptyMessage?: string;
  showCategory?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function PaymentTable({
  payments,
  isLoading,
  emptyMessage = "Nenhum pagamento encontrado para esta categoria.",
  showCategory = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange
}: PaymentTableProps) {
  const [editingPayment, setEditingPayment] = useState<PaymentResponse | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useRequests();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!deletingPaymentId) return;
    setIsDeleting(true);
    try {
      await api.deletePayment(deletingPaymentId);
      toast.success("Pagamento excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["payments-search"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setDeletingPaymentId(null);
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error("Erro ao excluir pagamento.");
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

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent className='w-full flex justify-between items-center'>
            <PaginationItem>
              <PaginationPrevious
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>

            <PaginationItem>
              <span className="text-sm text-muted-foreground mx-4">
                Página {currentPage} de {totalPages}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="rounded-md border relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Carregando pagamentos...</span>
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
            {payments.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={showCategory ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="border-border/30 hover:bg-secondary/30 transition-colors group">
                  <TableCell className="text-muted-foreground">
                    {format(new Date(payment.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{payment.title}</TableCell>
                  {showCategory && (
                    <TableCell>
                      {payment.category && (
                        <CategoryBadge variant="subtle" category={payment.category} />
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {(() => {
                      const { icon: Icon, colorClass } = getPaymentMethodIcon(payment.paymentMethod?.value || 'other');
                      return (
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                            <Icon className={`w-4 h-4 ${colorClass}`} />
                          </div>
                          <span className="font-medium">{payment.paymentMethod?.displayName || '-'}</span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-muted-foreground flex items-center gap-2">
                    <BankLogo
                      logoUrl={payment.bank?.logoUrl}
                      name={payment.bank?.name || ''}
                      colorHex={payment.bank?.colorHex}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingPayment(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeletingPaymentId(payment.id)}>
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
                {formatCurrency(payments.reduce((sum, payment) => sum + Number(payment.amount), 0))}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {editingPayment && (
        <EditPaymentModal
          isOpen={!!editingPayment}
          onClose={() => setEditingPayment(null)}
          payment={editingPayment}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingPaymentId}
        onClose={() => setDeletingPaymentId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Pagamento"
        description="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
