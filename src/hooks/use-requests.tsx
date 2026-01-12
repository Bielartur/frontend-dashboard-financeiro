import { apiRequest } from "../utils/apiRequests";

// --- Interfaces ---
import { Category, CategoryCreate, CategoryUpdate } from "@/models/Category";
import { Bank, BankCreate, BankUpdate } from "@/models/Bank";
import { Merchant } from "@/models/Merchant";
import { PaymentCreate, PaymentResponse, PaymentFilters, PaymentImportResponse } from "@/models/Payment";
import { DashboardAvailableMonth, DashboardResponse } from "@/models/Financial";

export type { Category, CategoryCreate, CategoryUpdate, Bank, BankCreate, Merchant, PaymentCreate, PaymentResponse, PaymentFilters, PaymentImportResponse, DashboardResponse };

// --- Requests ---

const getCategories = async () => {
  return await apiRequest<Category[]>("categories/", "GET");
};

const getBanks = async () => {
  return await apiRequest<Bank[]>("banks/", "GET");
};

const createBank = async (payload: BankCreate) => {
  return await apiRequest<any>("banks/", "POST", payload as unknown as Record<string, unknown>);
};

const createCategory = async (payload: CategoryCreate) => {
  return await apiRequest<any>("categories/", "POST", payload as unknown as Record<string, unknown>);
};

const createPayment = async (payload: PaymentCreate) => {
  return await apiRequest<any>("payments/", "POST", payload as unknown as Record<string, unknown>);
};

const updatePayment = async (id: string, payload: PaymentCreate) => {
  return await apiRequest<PaymentResponse>(`payments/${id}`, "PUT", payload as unknown as Record<string, unknown>);
};

const deletePayment = async (id: string) => {
  return await apiRequest<void>(`payments/${id}`, "DELETE");
};

const searchMerchants = async (query: string) => {
  if (!query) return [];
  return await apiRequest<Merchant[]>(`merchants/search?query=${encodeURIComponent(query)}`, "GET");
};

// Filter interface

const searchPayments = async (filters: PaymentFilters) => {
  const queryParams = new URLSearchParams();

  if (filters.query) queryParams.append("query", filters.query);
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.paymentMethod && filters.paymentMethod !== "all") queryParams.append("payment_method", filters.paymentMethod);
  if (filters.categoryId && filters.categoryId !== "all") queryParams.append("category_id", filters.categoryId);
  if (filters.bankId && filters.bankId !== "all") queryParams.append("bank_id", filters.bankId);

  if (filters.startDate) queryParams.append("start_date", filters.startDate.toISOString().split('T')[0]);
  if (filters.endDate) queryParams.append("end_date", filters.endDate.toISOString().split('T')[0]);

  if (filters.minAmount) queryParams.append("min_amount", filters.minAmount.toString());
  if (filters.maxAmount) queryParams.append("max_amount", filters.maxAmount.toString());

  return await apiRequest<PaymentResponse[]>(`payments/search?${queryParams.toString()}`, "GET");
};


const updateCategory = async (id: string, payload: CategoryUpdate) => {
  return await apiRequest<Category>(`categories/${id}`, "PUT", payload as unknown as Record<string, unknown>);
};

const deleteCategory = async (id: string) => {
  return await apiRequest<void>(`categories/${id}`, "DELETE");
};

const updateBank = async (id: string, payload: BankUpdate) => {
  return await apiRequest<Bank>(`banks/${id}`, "PUT", payload as unknown as Record<string, unknown>);
};

const deleteBank = async (id: string) => {
  return await apiRequest<void>(`banks/${id}`, "DELETE");
};

const importPayments = async (file: File, source: string) => {
  const formData = new FormData();
  formData.append("file", file);
  return await apiRequest<PaymentImportResponse[]>(`payments/import/${source}`, "POST", formData);
};

const createPaymentsBulk = async (payments: PaymentCreate[]) => {
  return await apiRequest<PaymentResponse[]>("payments/bulk", "POST", payments as unknown as Record<string, unknown>);
};



const getDashboard = async (year: string = 'last-12') => {
  const queryYear = year === 'last-12' ? 'last-12' : year;
  return await apiRequest<DashboardResponse>(`dashboard/?year=${queryYear}`, "GET");
};

const getAvailableMonths = async () => {
  return await apiRequest<DashboardAvailableMonth[]>("dashboard/available-months", "GET");
};

// --- Hook Export ---

export const useRequests = () => ({
  getCategories,
  getBanks,
  createPayment,
  updatePayment,
  deletePayment,
  createBank,
  createCategory,
  updateCategory,
  deleteCategory,
  updateBank,
  deleteBank,
  searchMerchants,
  searchPayments,
  importPayments,
  createPaymentsBulk,
  getDashboard,
  getAvailableMonths,
});
