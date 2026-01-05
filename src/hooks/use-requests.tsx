import { apiRequest } from "../utils/apiRequests";

// --- Interfaces ---

export interface Category {
  id: string;
  name: string;
}

export interface Bank {
  id: string;
  name: string;
}

export interface Merchant {
  id: string;
  name: string;
  categoryId?: string;
  userId?: string;
}

export interface PaymentCreate {
  title: string;
  date: string;
  amount: number;
  paymentMethod: "pix" | "credit_card" | "debit_card" | "other";
  bankId: string;
  categoryId?: string | null;
}

// --- Requests ---

const getCategories = async () => {
  return await apiRequest<Category[]>("categories/", "GET");
};

const getBanks = async () => {
  return await apiRequest<Bank[]>("banks/", "GET");
};

const createPayment = async (payload: PaymentCreate) => {
  return await apiRequest<any>("payments/", "POST", payload as unknown as Record<string, unknown>);
};

const searchMerchants = async (query: string) => {
  if (!query) return [];
  return await apiRequest<Merchant[]>(`merchants/search?query=${encodeURIComponent(query)}`, "GET");
};

// --- Hook Export ---

export const useRequests = () => ({
  getCategories,
  getBanks,
  createPayment,
  searchMerchants,
});
