import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequests } from "@/hooks/use-requests";
import { Category, CategorySettingsUpdate } from "@/models/Category";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2, Search } from "lucide-react";
import { EditCategoryModal } from "@/components/admin/categories/EditCategoryModal";
import { toast } from "sonner";

export function CategorySettingsTable() {
  const api = useRequests();
  const queryClient = useQueryClient();
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const handleSave = async (id: string, data: CategorySettingsUpdate) => {
    try {
      await api.updateCategorySettings(id, data);
      toast.success("Preferências atualizadas");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // Invalidate dashboard too
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Erro ao atualizar preferências");
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((category) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = category.name.toLowerCase().includes(query);
    const aliasMatch = category.alias?.toLowerCase().includes(query);
    return nameMatch || aliasMatch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar categorias..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border h-[60vh] overflow-y-auto relative">
        <Table>
          <TableHeader className="sticky top-0 bg-secondary z-10 shadow-sm">
            <TableRow className="hover:bg-secondary">
              <TableHead>Cor</TableHead>
              <TableHead>Nome Original</TableHead>
              <TableHead>Apelido (Seu)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-[52vh] text-center">
                  Nenhuma categoria encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: category.colorHex }}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">{category.name}</TableCell>
                  <TableCell className="font-medium">
                    {category.alias ? (
                      <span>{category.alias}</span>
                    ) : (
                      <span className="italic text-muted-foreground opacity-50">Sem apelido</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCategoryToEdit(category)}
                      title="Personalizar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditCategoryModal
        category={categoryToEdit}
        isOpen={!!categoryToEdit}
        onClose={() => setCategoryToEdit(null)}
        onSave={handleSave}
        mode="personal"
      />
    </div>
  );
}
