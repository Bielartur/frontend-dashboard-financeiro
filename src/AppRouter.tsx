import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ImportPayments from "./pages/ImportPayments";
import SearchPayments from "./pages/SearchPayments";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import CategoriesPage from "./pages/admin/CategoriesPage";
import BanksPage from "./pages/admin/BanksPage";
import OpenFinanceDemo from "./pages/OpenFinanceDemo";

import ProfilePage from "./pages/ProfilePage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search-payments" element={<SearchPayments />} />
        <Route path="/import-payments" element={<ImportPayments />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="categories" replace />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="banks" element={<BanksPage />} />
        </Route>
        <Route path="/open-finance-demo" element={<OpenFinanceDemo />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}