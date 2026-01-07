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
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/data/financialData';

interface PaymentTableProps {
  payments: PaymentResponse[];
  isLoading: boolean;
  emptyMessage?: string;
  showCategory?: boolean;
}

export function PaymentTable({
  payments,
  isLoading,
  emptyMessage = "Nenhum pagamento encontrado para esta categoria.",
  showCategory = false
}: PaymentTableProps) {
  return (
    <div className="relative">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={showCategory ? 6 : 5} className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                <TableCell className="text-muted-foreground">
                  {format(new Date(payment.date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="font-medium text-foreground">{payment.title}</TableCell>
                {showCategory && (
                  <TableCell>
                    {payment.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                        {payment.category.name}
                      </span>
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
                <TableCell className="text-muted-foreground">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-md shrink-0 overflow-hidden bg-muted/20 border border-border/10 shadow-sm"
                    style={{ backgroundColor: payment.bank?.colorHex }}
                  >
                    <img
                      src={payment.bank?.logoUrl || ''}
                      alt={payment.bank?.name || ''}
                      className="w-full h-full object-contain p-[0.4rem]"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">{formatCurrency(payment.amount)}</TableCell>
              </TableRow>
            ))
          )}
          <TableRow className="border-border/50 bg-secondary/10">
            <TableCell colSpan={showCategory ? 5 : 4} className="text-right font-bold">Total</TableCell>
            <TableCell className="text-right font-bold text-expense">
              {formatCurrency(payments.reduce((sum, payment) => sum + Number(payment.amount), 0))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
