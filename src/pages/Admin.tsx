import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Wallet, LayoutDashboard, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterCategory } from "@/components/admin/RegisterCategory";
import { CategoryList } from "@/components/admin/CategoryList";
import { RegisterBankForm } from "@/components/admin/RegisterBankForm";
import { BankList } from "@/components/admin/BankList";
import { cn } from "@/lib/utils";

type AdminSection = 'categories' | 'banks';
type ViewMode = 'list' | 'create';

export default function Admin() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('categories');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    setViewMode('list');
  };

  const handleAddClick = () => {
    setViewMode('create');
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  return (
    <div className="min-h-screen bg-background flex">
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

          <Button
            variant={activeSection === 'categories' ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-3", activeSection === 'categories' && "bg-secondary/50 font-medium")}
            onClick={() => handleSectionChange('categories')}
          >
            <Wallet className="h-4 w-4" />
            Categorias
          </Button>

          <Button
            variant={activeSection === 'banks' ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-3", activeSection === 'banks' && "bg-secondary/50 font-medium")}
            onClick={() => handleSectionChange('banks')}
          >
            <Building2 className="h-4 w-4" />
            Bancos
          </Button>
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/admin" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize text-foreground font-medium">
              {activeSection === 'categories' ? 'Categorias' : 'Bancos'}
            </span>
            {viewMode === 'create' && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Adicionar</span>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Dynamic Content */}
            <div className="animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
              {activeSection === 'categories' && (
                viewMode === 'list' ? (
                  <CategoryList onAddClick={handleAddClick} />
                ) : (
                  <RegisterCategory
                    onSuccess={handleBackToList}
                    onCancel={handleBackToList}
                  />
                )
              )}

              {activeSection === 'banks' && (
                viewMode === 'list' ? (
                  <BankList onAddClick={handleAddClick} />
                ) : (
                  <RegisterBankForm
                    onSuccess={handleBackToList}
                    onCancel={handleBackToList}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
