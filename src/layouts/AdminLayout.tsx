
import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, Building2, Wallet, LayoutDashboard, ChevronRight } from "lucide-react";
import { BreadcrumbHeader } from "@/components/shared/BreadcrumbHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const location = useLocation();

  const isCategoriesActive = location.pathname.includes('/categories');
  const isBanksActive = location.pathname.includes('/banks');

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
            <LayoutDashboard className="h-5 w-5" />
            <span>Finanças Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-4 uppercase tracking-wider">
            Cadastros
          </div>

          <Link to="/admin/categories">
            <Button
              variant={isCategoriesActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3", isCategoriesActive && "bg-secondary/50 font-medium")}
            >
              <Wallet className="h-4 w-4" />
              Categorias
            </Button>
          </Link>

          <Link to="/admin/banks">
            <Button
              variant={isBanksActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3", isBanksActive && "bg-secondary/50 font-medium")}
            >
              <Building2 className="h-4 w-4" />
              Bancos
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <Link to="/">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50">
        {/* Header */}
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
          <BreadcrumbHeader
            items={[
              { label: 'Admin', href: '/admin' },
              ...(isCategoriesActive ? [{ label: 'Categorias' }] : []),
              ...(isBanksActive ? [{ label: 'Bancos' }] : [])
            ]}
            className="my-auto"
          />
        </header>

        {/* Content */}
        <div className="p-6 flex-1 overflow-hidden">
          <div className="h-full w-full max-w-5xl mx-auto">
            <div className="h-full animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
