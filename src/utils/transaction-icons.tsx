import { CreditCard, Banknote, Landmark, Smartphone, MoreHorizontal, FileText, TrendingUp } from "lucide-react";

export type TransactionMethodType = "pix" | "credit_card" | "debit_card" | "bank_transfer" | "transfer" | "cash" | "bill_payment" | "boleto" | "investment_redemption" | "other";

export const getTransactionMethodIcon = (method: string) => {
  switch (method) {
    case 'credit_card':
      return { icon: CreditCard, colorClass: 'text-purple-500' };
    case 'debit_card':
      return { icon: CreditCard, colorClass: 'text-blue-500' };
    case 'pix':
      return { icon: Smartphone, colorClass: 'text-teal-500' };
    case 'bank_transfer':
      return { icon: Landmark, colorClass: 'text-green-500' };
    case 'cash':
      return { icon: Banknote, colorClass: 'text-emerald-500' };
    case 'bill_payment':
    case 'boleto':
      return { icon: FileText, colorClass: 'text-orange-500' };
    case 'investment_redemption':
      return { icon: TrendingUp, colorClass: 'text-indigo-500' };
    default:
      return { icon: MoreHorizontal, colorClass: 'text-gray-500' };
  }
};
