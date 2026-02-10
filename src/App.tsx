import { Toaster } from "@/components/ui/toaster";
import { Toaster as ToasterSonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./AppRouter";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const queryClient = new QueryClient();

import { ThemeProvider } from "@/components/theme/theme-provider";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <ToasterSonner />
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
