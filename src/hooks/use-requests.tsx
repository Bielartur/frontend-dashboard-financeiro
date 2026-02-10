
import { categoryService } from "@/services/categoryService";
import { bankService } from "@/services/bankService";
import { transactionService } from "@/services/transactionService";
import { merchantService } from "@/services/merchantService";
import { dashboardService } from "@/services/dashboardService";
import { openFinanceService } from "@/services/openFinanceService";

import { Category, CategoryCreate, CategoryUpdate } from "@/models/Category";
import { Bank, BankCreate } from "@/models/Bank";
import { Merchant } from "@/models/Merchant";
import { TransactionCreate, TransactionResponse, TransactionFilters, TransactionImportResponse } from "@/models/Transaction";
import { DashboardResponse } from "@/models/Financial";
import { PaginatedResponse } from "@/models/Pagination";
import { OpenFinanceItem } from "@/models/OpenFinanceItem";

export type { Category, CategoryCreate, CategoryUpdate, Bank, BankCreate, Merchant, TransactionCreate, TransactionResponse, TransactionFilters, TransactionImportResponse, DashboardResponse, PaginatedResponse };
export type { OpenFinanceItem };

export const useRequests = () => ({
  // Categories
  getCategories: categoryService.getAll,
  createCategory: categoryService.create,
  updateCategory: categoryService.update,
  deleteCategory: categoryService.delete,
  searchCategories: categoryService.search,
  updateCategorySettings: categoryService.updateSettings,

  // Banks
  getBanks: bankService.getAll,
  createBank: bankService.create,
  updateBank: bankService.update,
  deleteBank: bankService.delete,

  // Transactions
  createTransaction: transactionService.create,
  updateTransaction: transactionService.update,
  deleteTransaction: transactionService.delete,
  searchTransactions: transactionService.search,
  importTransactions: transactionService.import,
  createTransactionsBulk: transactionService.createBulk,

  // Merchants & Aliases
  searchMerchants: merchantService.search,
  getMerchantAliases: merchantService.getAliases,
  searchMerchantAliases: merchantService.searchAliases,
  createMerchantAliasGroup: merchantService.createAliasGroup,
  getMerchantAliasById: merchantService.getAliasById,
  addMerchantToAlias: merchantService.addMerchantToAlias,
  removeMerchantFromAlias: merchantService.removeMerchantFromAlias,
  updateMerchantAlias: merchantService.updateAlias,

  // Dashboard
  getDashboard: dashboardService.getDashboard,
  getAvailableMonths: dashboardService.getAvailableMonths,

  // Open Finance
  getConnectToken: openFinanceService.getConnectToken,
  getOpenFinanceItems: openFinanceService.getItems,
  createOpenFinanceItem: openFinanceService.createItem,
  syncOpenFinanceItem: openFinanceService.syncItem,
  syncOpenFinanceAccount: openFinanceService.syncAccount,
});
