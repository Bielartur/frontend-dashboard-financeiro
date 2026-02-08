import { BarChart3, ArrowLeftRight, CreditCard, Settings, Crown, ShieldCheck } from 'lucide-react';
import { SidebarMenuItem } from './SidebarMenuItem';
import { SidebarUserProfile } from './SidebarUserProfile';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-card border-r border-border/50 flex flex-col fixed left-0 top-0 z-20">
      {/* Logo Section */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Financeiro</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4">
        <SidebarUserProfile />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
        {/* Principal Section */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Principal
          </h2>
          <div className="space-y-1">
            <SidebarMenuItem icon={BarChart3} label="Dashboard" path="/" />
            <SidebarMenuItem icon={ArrowLeftRight} label="Transações" path="/transactions" />
            <SidebarMenuItem icon={CreditCard} label="Assinaturas" path="/subscriptions" />
          </div>
        </div>

        {/* Outros Section */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Outros
          </h2>
          <div className="space-y-1">
            <SidebarMenuItem icon={Settings} label="Configurações" path="/profile" />
          </div>
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-2">
        <ThemeToggle />
      </div>

      {/* Upgrade Card */}
      <div className="p-4 m-4 mt-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-full bg-primary/20">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Upgrade</h3>
            <p className="text-xs text-muted-foreground">
              Desbloqueie todos os recursos
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
