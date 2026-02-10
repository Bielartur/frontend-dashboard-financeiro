
import { apiRequest } from "@/utils/apiRequests";
import { OpenFinanceItem } from "@/models/OpenFinanceItem";
import { streamingRequest } from "@/utils/streamingResponse";

export const openFinanceService = {
  getConnectToken: async () => {
    const response = await apiRequest<{ accessToken: string }>("/open-finance/connect-token");
    return response.accessToken;
  },

  getItems: async () => {
    return await apiRequest<OpenFinanceItem[]>("/open-finance/items");
  },

  createItem: async (itemId: string, connectorId: string) => {
    return await apiRequest<{ id: string }>("/open-finance/items", "POST", {
      itemId,
      connectorId
    });
  },

  syncItem: async (localItemId: string, onProgress?: (status: string, message: string) => void) => {
    await streamingRequest(`/open-finance/items/${localItemId}/sync`, {
      method: "POST",
      onProgress
    });
  },

  syncAccount: async (input: { accountId: string, onProgress?: (status: string, message: string) => void }) => {
    await streamingRequest(`/open-finance/accounts/${input.accountId}/sync`, {
      method: "POST",
      onProgress: input.onProgress
    });
  }
};
