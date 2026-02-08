import { apiRequest } from "../utils/apiRequests";

// --- Interfaces ---
import { Category, CategoryCreate, CategoryUpdate } from "@/models/Category";
import { Bank, BankCreate, BankUpdate } from "@/models/Bank";
import { Merchant } from "@/models/Merchant";
import { TransactionCreate, TransactionResponse, TransactionFilters, TransactionImportResponse } from "@/models/Transaction";
import { DashboardAvailableMonth, DashboardResponse } from "@/models/Financial";
import { PaginatedResponse } from "@/models/Pagination";

import { OpenFinanceItem, getStatusLabel } from "@/models/OpenFinanceItem";


export type { Category, CategoryCreate, CategoryUpdate, Bank, BankCreate, Merchant, TransactionCreate, TransactionResponse, TransactionFilters, TransactionImportResponse, DashboardResponse, PaginatedResponse };
// Re-export OpenFinanceItem for convenience if needed, or consumers import directly.
export type { OpenFinanceItem };

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

const createTransaction = async (payload: TransactionCreate) => {
  return await apiRequest<any>("transactions/", "POST", payload as unknown as Record<string, unknown>);
};

const updateTransaction = async (id: string, payload: TransactionCreate) => {
  return await apiRequest<TransactionResponse>(`transactions/${id}`, "PUT", payload as unknown as Record<string, unknown>);
};

const deleteTransaction = async (id: string) => {
  return await apiRequest<void>(`transactions/${id}`, "DELETE");
};

const searchMerchants = async (query: string, limit: number = 12) => {
  if (!query) return [];
  return await apiRequest<Merchant[]>(`merchants/search?query=${encodeURIComponent(query)}&limit=${limit}`, "GET");
};

// Filter interface

const searchTransactions = async (filters: TransactionFilters) => {
  const queryParams = new URLSearchParams();

  if (filters.query) queryParams.append("query", filters.query);
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.page) queryParams.append("page", filters.page.toString()); // Support page
  if (filters.paymentMethod && filters.paymentMethod !== "all") queryParams.append("payment_method", filters.paymentMethod);
  if (filters.categoryId && filters.categoryId !== "all") queryParams.append("category_id", filters.categoryId);
  if (filters.bankId && filters.bankId !== "all") queryParams.append("bank_id", filters.bankId);

  if (filters.startDate) queryParams.append("start_date", filters.startDate.toISOString().split('T')[0]);
  if (filters.endDate) queryParams.append("end_date", filters.endDate.toISOString().split('T')[0]);

  if (filters.minAmount) queryParams.append("min_amount", filters.minAmount.toString());
  if (filters.maxAmount) queryParams.append("max_amount", filters.maxAmount.toString());

  return await apiRequest<PaginatedResponse<TransactionResponse>>(`transactions/search?${queryParams.toString()}`, "GET");
};


const updateCategory = async (id: string, payload: CategoryUpdate) => {
  return await apiRequest<Category>(`categories/${id}`, "PUT", payload as unknown as Record<string, unknown>);
};

const searchCategories = async (query: string, page: number = 1, limit: number = 12) => {
  return await apiRequest<PaginatedResponse<Category>>(`categories/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, "GET");
};

const updateCategorySettings = async (id: string, payload: { alias?: string; colorHex?: string }) => {
  return await apiRequest<Category>(`categories/${id}/settings`, "PUT", payload as unknown as Record<string, unknown>);
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

const importTransactions = async (file: File, source: string, type: string = "invoice") => {
  const formData = new FormData();
  formData.append("file", file);
  return await apiRequest<TransactionImportResponse[]>(`transactions/import/${source}?type=${type}`, "POST", formData);
};

const createTransactionsBulk = async (transactions: TransactionCreate[], sourceType?: string) => {
  const url = sourceType ? `transactions/bulk?import_type=${sourceType}` : "transactions/bulk";
  return await apiRequest<TransactionResponse[]>(url, "POST", transactions as unknown as Record<string, unknown>);
};



const getDashboard = async (year: string = 'last-12') => {
  const queryYear = year === 'last-12' ? 'last-12' : year;
  return await apiRequest<DashboardResponse>(`dashboard/?year=${queryYear}`, "GET");
};

const getAvailableMonths = async () => {
  return await apiRequest<DashboardAvailableMonth[]>("dashboard/available-months", "GET");
};

const getMerchantAliases = async (page: number = 1, limit: number = 20) => {
  return await apiRequest<PaginatedResponse<any>>(`aliases/?page=${page}&size=${limit}`, "GET");
};

const searchMerchantAliases = async (query: string, page: number = 1, limit: number = 20) => {
  return await apiRequest<PaginatedResponse<any>>(`aliases/search?query=${encodeURIComponent(query)}&page=${page}&size=${limit}`, "GET");
};

const createMerchantAliasGroup = async (payload: { pattern: string; merchant_ids: string[]; category_id?: string | null }) => {
  return await apiRequest<any>("aliases/set_group", "POST", payload);
};

const getMerchantAliasById = async (id: string) => {
  return await apiRequest<any>(`aliases/${id}`, "GET");
};

const addMerchantToAlias = async (aliasId: string, merchantId: string) => {
  return await apiRequest<any>(`aliases/${aliasId}/append/${merchantId}`, "POST");
};

const removeMerchantFromAlias = async (aliasId: string, merchantId: string) => {
  return await apiRequest<void>(`aliases/${aliasId}/remove/${merchantId}`, "DELETE");
};

const updateMerchantAlias = async (aliasId: string, payload: { pattern?: string; category_id?: string | null }) => {
  return await apiRequest<any>(`aliases/${aliasId}`, "PUT", payload);
};

// --- Open Finance ---

const getConnectToken = async () => {
  const response = await apiRequest<{ accessToken: string }>("/open-finance/connect-token");
  return response.accessToken;
};

const getOpenFinanceItems = async () => {
  return await apiRequest<OpenFinanceItem[]>("/open-finance/items");
};

const createOpenFinanceItem = async (itemId: string, connectorId: string) => {
  return await apiRequest<{ id: string }>("/open-finance/items", "POST", {
    itemId,
    connectorId
  });
};

import { streamingRequest } from "@/utils/streamingResponse";

const syncOpenFinanceItem = async (localItemId: string, onProgress?: (status: string, message: string) => void) => {
  await streamingRequest(`/open-finance/items/${localItemId}/sync`, {
    method: "POST",
    onProgress
  });
};

const syncOpenFinanceAccount = async (input: { accountId: string, onProgress?: (status: string, message: string) => void }) => {
  await streamingRequest(`/open-finance/accounts/${input.accountId}/sync`, {
    method: "POST",
    onProgress: input.onProgress
  });
};


// --- Hook Export ---

export const useRequests = () => ({
  getCategories,
  getBanks,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createBank,
  createCategory,
  updateCategory,
  searchCategories,
  updateCategorySettings,
  deleteCategory,
  updateBank,
  deleteBank,
  searchMerchants,
  searchTransactions,
  importTransactions,
  createTransactionsBulk,
  getDashboard,
  getAvailableMonths,
  getMerchantAliases,
  searchMerchantAliases,
  createMerchantAliasGroup,
  getMerchantAliasById,
  addMerchantToAlias,
  removeMerchantFromAlias,
  updateMerchantAlias,
  // Open Finance
  getConnectToken,
  getOpenFinanceItems,
  createOpenFinanceItem,
  syncOpenFinanceItem,
  syncOpenFinanceAccount,
});


