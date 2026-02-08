import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";
import { CategoryCombobox } from "@/components/shared/combobox/CategoryCombobox";
import { Category } from "@/models/Category";

// Reuse interface or import
interface MerchantAlias {
  id: string;
  pattern: string;
  merchantIds: string[];
}

interface CreateMerchantAliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAliases?: MerchantAlias[];
  onSuccess?: () => void;
  categories?: Category[];
}

export function CreateMerchantAliasModal({
  isOpen,
  onClose,
  selectedAliases = [],
  onSuccess,
  categories = [],
}: CreateMerchantAliasModalProps) {
  const api = useRequests();
  const queryClient = useQueryClient();
  const [pattern, setPattern] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Reset pattern when opening
  useEffect(() => {
    if (isOpen) {
      setPattern("");
      setCategoryId("all");
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!pattern.trim()) {
      toast.error("O nome do agrupamento é obrigatório");
      return;
    }

    if (selectedAliases.length === 0) {
      toast.error("Selecione pelo menos um estabelecimento para agrupar.");
      return;
    }

    setIsLoading(true);
    try {
      const allMerchantIds = selectedAliases.flatMap(a => a.merchantIds);

      await api.createMerchantAliasGroup({
        pattern: pattern,
        merchant_ids: allMerchantIds,
        category_id: categoryId === "all" ? null : categoryId
      });

      toast.success("Agrupamento criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["merchant-aliases"] });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erro ao criar agrupamento:", error);
      toast.error("Erro ao criar agrupamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Agrupamento</DialogTitle>
          <DialogDescription>
            Defina um nome único para os estabelecimentos selecionados.
            Isso irá mesclar <strong>{selectedAliases.length}</strong> itens em um só.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {selectedAliases.length > 0 && (
            <div className="bg-muted p-3 rounded-md text-sm max-h-[150px] overflow-y-auto">
              <p className="font-semibold mb-2">Itens selecionados:</p>
              <ul className="list-disc pl-5 space-y-1">
                {selectedAliases.map(alias => (
                  <li key={alias.id}>
                    {alias.pattern} <span className="text-muted-foreground text-xs">({alias.merchantIds.length} variações)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Apelido (Ex: Uber)</Label>
            <Input
              id="name"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Digite o nome do agrupamento..."
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoria Padrão (Opcional)</Label>
            <CategoryCombobox
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Selecione uma categoria..."
              extraOption={{ label: "Sem Categoria Padrão", value: "all" }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar e Agrupar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
