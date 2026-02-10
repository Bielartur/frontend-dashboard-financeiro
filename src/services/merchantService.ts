
import { apiRequest } from "@/utils/apiRequests";
import { Merchant } from "@/models/Merchant";
import { PaginatedResponse } from "@/models/Pagination";

export const merchantService = {
  search: async (query: string, limit: number = 12) => {
    if (!query) return [];
    return await apiRequest<Merchant[]>(`merchants/search?query=${encodeURIComponent(query)}&limit=${limit}`, "GET");
  },

  getAliases: async (page: number = 1, limit: number = 20) => {
    return await apiRequest<PaginatedResponse<any>>(`aliases/?page=${page}&size=${limit}`, "GET");
  },

  searchAliases: async (query: string, page: number = 1, limit: number = 20) => {
    return await apiRequest<PaginatedResponse<any>>(`aliases/search?query=${encodeURIComponent(query)}&page=${page}&size=${limit}`, "GET");
  },

  createAliasGroup: async (payload: { pattern: string; merchant_ids: string[]; category_id?: string | null }) => {
    return await apiRequest<any>("aliases/set_group", "POST", payload);
  },

  getAliasById: async (id: string) => {
    return await apiRequest<any>(`aliases/${id}`, "GET");
  },

  addMerchantToAlias: async (aliasId: string, merchantId: string) => {
    return await apiRequest<any>(`aliases/${aliasId}/append/${merchantId}`, "POST");
  },

  removeMerchantFromAlias: async (aliasId: string, merchantId: string) => {
    return await apiRequest<void>(`aliases/${aliasId}/remove/${merchantId}`, "DELETE");
  },

  updateAlias: async (aliasId: string, payload: { pattern?: string; category_id?: string | null }) => {
    return await apiRequest<any>(`aliases/${aliasId}`, "PUT", payload);
  }
};
