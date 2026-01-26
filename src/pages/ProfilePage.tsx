import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategorySettingsTable } from "@/components/profile/CategorySettingsTable";
import { MerchantSettingsTable } from "@/components/profile/MerchantSettingsTable";
import { Tag, User, Settings, ArrowLeft, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type TabValues = "categories" | "merchants" | "account" | "preferences";

interface SidebarItem {
  id: TabValues;
  label: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { id: "categories", label: "Categorias", icon: Tag },
  { id: "merchants", label: "Estabelecimentos", icon: Store },
  { id: "account", label: "Conta", icon: User },
  { id: "preferences", label: "Preferências", icon: Settings },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabValues>("categories");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full justify-start gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>

            <nav className="flex flex-col gap-1">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "justify-start gap-3 px-3 py-2 w-full font-medium transition-all duration-200",
                    activeTab === item.id
                      ? "bg-secondary text-primary hover:bg-secondary/90 hover:text-primary/80 shadow-sm border-l-4 border-primary rounded-r-md rounded-l-none"
                      : "hover:bg-transparent hover:underline hover:text-foreground underline-offset-4 text-muted-foreground"
                  )}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === "categories" && (
              <div className="space-y-6 animate-in fade-in-50 duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Personalização de Categorias</h1>
                  <p className="text-muted-foreground">
                    Defina apelidos e cores personalizadas para as categorias. Isso afeta apenas a sua visualização.
                  </p>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <CategorySettingsTable />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "merchants" && (
              <div className="space-y-6 animate-in fade-in-50 duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Meus Estabelecimentos</h1>
                  <p className="text-muted-foreground">
                    Gerencie os apelidos dos estabelecimentos e agrupe nomes semelhantes.
                  </p>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <MerchantSettingsTable />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6 animate-in fade-in-50 duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Dados da Conta</h1>
                  <p className="text-muted-foreground">
                    Gerencie suas informações de login e dados pessoais.
                  </p>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                      Em breve: Alteração de senha e email.
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6 animate-in fade-in-50 duration-300">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Preferências do Sistema</h1>
                  <p className="text-muted-foreground">
                    Ajuste temas e outras configurações globais.
                  </p>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                      Em breve: Tema Escuro/Claro, Notificações.
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
