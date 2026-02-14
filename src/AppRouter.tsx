import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import { ProfileLayout } from "./layouts/ProfileLayout";
import SearchTransactions from "./pages/SearchTransactions";
import ImportTransactions from "./pages/ImportTransactions";
import NotFound from "./pages/NotFound";
import BanksPage from "@/pages/admin/BanksPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import ProfileAccount from "@/pages/profile/ProfileAccount";
import ProfileCategories from "@/pages/profile/ProfileCategories";
import ProfileMerchants from "@/pages/profile/ProfileMerchants";
import ProfilePreferences from "@/pages/profile/ProfilePreferences";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardOverviewLayout from "./layouts/DashboardOverviewLayout";
import DashboardContent from "./pages/dashboard/DashboardContent";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="categories" replace />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="banks" element={<BanksPage />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardOverviewLayout />}>
              <Route index element={<Navigate to="categories" replace />} />
              <Route path="categories" element={<DashboardContent />} />
              <Route path="banks" element={<DashboardContent />} />
              <Route path="merchants" element={<DashboardContent />} />
            </Route>

            <Route path="/transactions" element={<SearchTransactions />} />
            <Route path="/import-transactions" element={<ImportTransactions />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="categories" replace />} />
              <Route path="banks" element={<BanksPage />} />
              <Route path="categories" element={<CategoriesPage />} />
            </Route>

            {/* Profile Routes */}
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<Navigate to="/profile/merchants" replace />} />
              <Route path="account" element={<ProfileAccount />} />
              <Route path="categories" element={<ProfileCategories />} />
              <Route path="merchants" element={<ProfileMerchants />} />
              <Route path="preferences" element={<ProfilePreferences />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};