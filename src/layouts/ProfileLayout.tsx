import { Outlet, useLocation, Link } from "react-router-dom";
import { BreadcrumbHeader } from "@/components/shared/BreadcrumbHeader";
import { cn } from "@/lib/utils";

export function ProfileLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { label: "Categorias", path: "/profile/categories" },
    { label: "Estabelecimentos", path: "/profile/merchants" },
    { label: "Conta", path: "/profile/account" },
    { label: "Preferências", path: "/profile/preferences" },
  ];

  return (
      <div className="space-y-6">
        <div>
          <BreadcrumbHeader items={[{ label: 'Configurações' }]} />
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações da conta.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border-b border-border/50">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = currentPath.startsWith(tab.path);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={cn(
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                      "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="animate-in fade-in-50 duration-300">
            <Outlet />
          </div>
        </div>
      </div>
  );
}
