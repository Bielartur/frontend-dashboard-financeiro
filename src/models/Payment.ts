
import { Bank } from "./Bank";
import { Category } from "./Category";
import { Merchant } from "./Merchant";

export interface PaymentCreate {
  title: string;
  date: string;
  amount: number;
  paymentMethod: "pix" | "credit_card" | "debit_card" | "other";
  bankId: string;
  categoryId?: string | null;
  hasMerchant?: boolean;
}

export interface PaymentResponse {
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

export interface PaymentImportResponse {
  date: string;
  title: string;
  amount: number;
  category?: {
    id: string;
    slug: string;
    name: string;
    type: string;
  };
  hasMerchant?: boolean;
  alreadyExists?: boolean;
}

export interface PaymentFilters {
  query?: string;
  limit?: number;
  paymentMethod?: string;
  categoryId?: string;
  bankId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}


