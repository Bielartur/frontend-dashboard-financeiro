
import { apiRequest } from "@/utils/apiRequests";
import { Bank, BankCreate, BankUpdate } from "@/models/Bank";

export const bankService = {
  getAll: async () => {
    return await apiRequest<Bank[]>("banks/", "GET");
  },

  create: async (payload: BankCreate) => {
    return await apiRequest<any>("banks/", "POST", payload as unknown as Record<string, unknown>);
  },

  update: async (id: string, payload: BankUpdate) => {
    return await apiRequest<Bank>(`banks/${id}`, "PUT", payload as unknown as Record<string, unknown>);
  },

  delete: async (id: string) => {
    return await apiRequest<void>(`banks/${id}`, "DELETE");
  }
};
