import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import RegisterPayment from "./pages/RegisterPayment";
import SearchPayments from "./pages/SearchPayments";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import CategoriesPage from "./pages/admin/CategoriesPage";
import BanksPage from "./pages/admin/BanksPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register-payment" element={<RegisterPayment />} />
          <Route path="/search-payments" element={<SearchPayments />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="categories" replace />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="banks" element={<BanksPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
