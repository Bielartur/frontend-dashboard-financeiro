import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequests } from "@/hooks/use-requests";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Check } from "lucide-react";
import { DebouncedSearchInput } from "@/components/shared/DebouncedSearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryCombobox } from "@/components/shared/combobox/CategoryCombobox";

interface EditMerchantAliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  aliasId: string | null;
  categories: any[];
}

export function EditMerchantAliasModal({
  isOpen,
  onClose,
  aliasId,
  categories = [],
}: EditMerchantAliasModalProps) {
  const api = useRequests();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Local state for editing form
  const [pattern, setPattern] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Fetch Alias Details
  const { data: alias, isLoading, refetch } = useQuery({
    queryKey: ["merchant-alias", aliasId],
    queryFn: () => (aliasId ? api.getMerchantAliasById(aliasId) : null),
    enabled: !!aliasId && isOpen,
  });

  // Search Merchants to Add
  const { data: searchResults = [] } = useQuery({
    queryKey: ["merchants-search", searchQuery],
    queryFn: () => api.searchMerchants(searchQuery),
    enabled: searchQuery.length > 0 && isOpen,
  });

  useEffect(() => {
    if (alias) {
      setPattern(alias.pattern);
      setCategoryId(alias.categoryId || "all");
    }
  }, [alias]);

  const handleSaveSettings = async () => {
    if (!aliasId) return;
    setIsSavingSettings(true);
    try {
      await api.updateMerchantAlias(aliasId, {
        pattern: pattern,
        category_id: categoryId === "all" ? null : categoryId
      });
      toast.success("Configurações atualizadas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["merchant-aliases"] });
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar configurações.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRemove = async (merchantId: string, merchantName: string) => {
    if (!aliasId) return;
    try {
      await api.removeMerchantFromAlias(aliasId, merchantId);
      toast.success(`${merchantName} removido do grupo.`);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["merchant-aliases"] });
    } catch (error) {
      toast.error("Erro ao remover item.");
    }
  };

  const handleAdd = async (merchantId: string, merchantName: string) => {
    if (!aliasId) return;
    try {
      setIsAdding(true);
      await api.addMerchantToAlias(aliasId, merchantId);
      toast.success(`${merchantName} adicionado ao grupo.`);
      setSearchQuery(""); // Clear search
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["merchant-aliases"] });
    } catch (error) {
      toast.error("Erro ao adicionar item.");
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Agrupamento</DialogTitle>
          <DialogDescription>
            Gerencie os estabelecimentos vinculados a <strong>{alias?.pattern}</strong>.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">

            {/* General Settings */}
            <div className="space-y-3 border-b pb-4 bg-muted/20 p-3 rounded-md">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-primary">Configurações Gerais</Label>
                <Button
                  size="sm"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings || (alias && (pattern === alias.pattern && (categoryId === (alias.categoryId || "all"))))}
                >
                  {isSavingSettings && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Salvar Alterações
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="alias-pattern" className="text-xs text-muted-foreground">Nome do Agrupamento</Label>
                  <Input
                    id="alias-pattern"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="Ex: Uber"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Categoria Padrão</Label>
                  <div className="h-9">
                    <CategoryCombobox
                      categories={categories}
                      value={categoryId}
                      onChange={setCategoryId}
                      placeholder="Selecione..."
                      extraOption={{ label: "Sem Categoria Padrão", value: "all" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="space-y-2 border-b pb-4">
              <Label>Adicionar Estabelecimento</Label>
              <DebouncedSearchInput
                placeholder="Buscar para adicionar..."
                value={searchQuery}
                onChange={setSearchQuery}
              />

              {searchQuery && (
                <div className="border rounded-md max-h-[150px] overflow-y-auto bg-background absolute z-50 w-[550px] shadow-lg">
                  {searchResults.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">Nenhum resultado.</div>
                  ) : (
                    searchResults.map((m: any) => {
                      const isMember = alias?.merchants?.some((curr: any) => curr.id === m.id);
                      return (
                        <div
                          key={m.id}
                          className={`flex justify-between items-center p-2 cursor-pointer ${isMember ? 'bg-muted cursor-default' : 'hover:bg-muted'}`}
                          onClick={() => !isMember && !isAdding && handleAdd(m.id, m.name)}
                        >
                          <span className={`text-sm font-medium ${isMember ? 'text-muted-foreground' : ''}`}>
                            {m.name} {isMember && "(Já adicionado)"}
                          </span>
                          <Button size="sm" variant="ghost" disabled={isAdding || isMember}>
                            {isMember ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* List Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Label className="mb-2">Itens no Agrupamento ({alias?.merchants?.length || 0})</Label>
              <ScrollArea className="flex-1 border rounded-md p-2">
                {alias?.merchants?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum item neste grupo.</p>
                ) : (
                  <ul className="space-y-1">
                    {alias?.merchants?.map((m: any) => (
                      <li key={m.id} className="flex justify-between items-center p-2 rounded hover:bg-muted/50 text-sm">
                        <span>{m.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => handleRemove(m.id, m.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
