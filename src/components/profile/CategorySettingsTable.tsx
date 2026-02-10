import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequests } from "@/hooks/use-requests";
import { Category, CategorySettingsUpdate } from "@/models/Category";
import { PaginationControl } from "@/components/shared/PaginationControl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// Removed Input import as it is now inside DebouncedSearchInput
import { Pencil, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { EditCategoryModal } from "@/components/admin/EditCategoryModal";
import { toast } from "sonner";
import { DebouncedSearchInput } from "@/components/shared/DebouncedSearchInput";

export function CategorySettingsTable() {
  const api = useRequests();
  const queryClient = useQueryClient();
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", searchQuery, page],
    queryFn: () => api.searchCategories(searchQuery, page, 10),
    placeholderData: (previousData) => previousData,
  });

  const categories = data?.items || [];
  const totalPages = data?.pages || 1;

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

  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <DebouncedSearchInput
          placeholder="Buscar categorias..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full"
        />
      </div>

      <div className="rounded-md border h-[60vh] overflow-y-auto relative flex flex-col justify-between">
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
            {isLoading && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-[52vh] text-center">
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-[52vh] text-center">
                  Nenhuma categoria encontrada.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
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

      <PaginationControl
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

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
