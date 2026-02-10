
import { apiRequest } from "@/utils/apiRequests";
import { Category, CategoryCreate, CategoryUpdate } from "@/models/Category";
import { PaginatedResponse } from "@/models/Pagination";

export const categoryService = {
  getAll: async () => {
    return await apiRequest<Category[]>("categories/", "GET");
  },

  create: async (payload: CategoryCreate) => {
    return await apiRequest<any>("categories/", "POST", payload as unknown as Record<string, unknown>);
  },

  update: async (id: string, payload: CategoryUpdate) => {
    return await apiRequest<Category>(`categories/${id}`, "PUT", payload as unknown as Record<string, unknown>);
  },

  delete: async (id: string) => {
    return await apiRequest<void>(`categories/${id}`, "DELETE");
  },

  search: async (query: string, page: number = 1, limit: number = 12) => {
    return await apiRequest<PaginatedResponse<Category>>(`categories/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, "GET");
  },

  updateSettings: async (id: string, payload: { alias?: string; colorHex?: string }) => {
    return await apiRequest<Category>(`categories/${id}/settings`, "PUT", payload as unknown as Record<string, unknown>);
  }
};
