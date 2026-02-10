
import { Bank } from "./Bank";
import { Category } from "./Category";
import { Merchant } from "./Merchant";

export interface TransactionCreate {
  title: string;
  date: string;
  amount: number;
  paymentMethod?: "pix" | "credit_card" | "debit_card" | "bank_transfer" | "cash" | "boleto" | "bill_payment" | "investment_redemption" | "other";
  bankId: string;
  categoryId?: string | null;
  id?: string;
  hasMerchant?: boolean;
}

export interface TransactionResponse {
  id: string;
  title: string;
  date: string;
  amount: number;
  paymentMethod: {
    value: string;
    displayName: string;
  };
  bank?: Bank;
  merchant?: Merchant;
  category?: Category;
}

export interface TransactionImportResponse {
  id?: string;
  date: string;
  title: string;
  amount: number;
  category?: {
    id: string;
    slug: string;
    name: string;
    colorHex: string;
  };
  hasMerchant?: boolean;
  alreadyExists?: boolean;
  paymentMethod?: {
    value: string;
    displayName: string;
  };
}

export interface TransactionFilters {
  query?: string;
  limit?: number;
  paymentMethod?: string;
  categoryId?: string;
  bankId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  merchantAliasIds?: string[];  // Supports multiple IDs for "Outros" drilldown
}


