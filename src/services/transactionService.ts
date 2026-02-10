
import { apiRequest } from "@/utils/apiRequests";
import { TransactionCreate, TransactionResponse, TransactionFilters, TransactionImportResponse } from "@/models/Transaction";
import { PaginatedResponse } from "@/models/Pagination";

export const transactionService = {
  create: async (payload: TransactionCreate) => {
    return await apiRequest<any>("transactions/", "POST", payload as unknown as Record<string, unknown>);
  },

  update: async (id: string, payload: TransactionCreate) => {
    return await apiRequest<TransactionResponse>(`transactions/${id}`, "PUT", payload as unknown as Record<string, unknown>);
  },

  delete: async (id: string) => {
    return await apiRequest<void>(`transactions/${id}`, "DELETE");
  },

  search: async (filters: TransactionFilters) => {
    const queryParams = new URLSearchParams();

    if (filters.query) queryParams.append("query", filters.query);
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.paymentMethod && filters.paymentMethod !== "all") queryParams.append("payment_method", filters.paymentMethod);
    if (filters.categoryId && filters.categoryId !== "all") queryParams.append("category_id", filters.categoryId);
    if (filters.bankId && filters.bankId !== "all") queryParams.append("bank_id", filters.bankId);

    if (filters.startDate) queryParams.append("start_date", filters.startDate.toISOString().split('T')[0]);
    if (filters.endDate) queryParams.append("end_date", filters.endDate.toISOString().split('T')[0]);

    if (filters.minAmount) queryParams.append("min_amount", filters.minAmount.toString());
    if (filters.maxAmount) queryParams.append("max_amount", filters.maxAmount.toString());

    if (filters.merchantAliasIds) {
      filters.merchantAliasIds.forEach(id => queryParams.append("merchant_alias_ids", id));
    }

    return await apiRequest<PaginatedResponse<TransactionResponse>>(`transactions/search?${queryParams.toString()}`, "GET");
  },

  import: async (file: File, source: string, type: string = "invoice") => {
    const formData = new FormData();
    formData.append("file", file);
    return await apiRequest<TransactionImportResponse[]>(`transactions/import/${source}?type=${type}`, "POST", formData);
  },

  createBulk: async (transactions: TransactionCreate[], sourceType?: string) => {
    const url = sourceType ? `transactions/bulk?import_type=${sourceType}` : "transactions/bulk";
    return await apiRequest<TransactionResponse[]>(url, "POST", transactions as unknown as Record<string, unknown>);
  }
};
