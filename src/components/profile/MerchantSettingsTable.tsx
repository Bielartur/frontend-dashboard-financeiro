import { useState, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useRequests, PaginatedResponse } from "@/hooks/use-requests";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

import { CreateMerchantAliasModal } from "./CreateMerchantAliasModal";
import { EditMerchantAliasModal } from "./EditMerchantAliasModal";
import { PaginationControl } from "@/components/shared/PaginationControl";
import { DebouncedSearchInput } from "@/components/shared/DebouncedSearchInput";
import { Category } from "@/models/Category";
import { CategoryBadge } from "@/components/shared/CategoryBadge";

// Define interface locally if not in models yet
interface MerchantAlias {
  id: string;
  pattern: string;
  merchantIds: string[];
  categoryId?: string;
}

export function MerchantSettingsTable() {
  const api = useRequests();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAliasId, setEditingAliasId] = useState<string | null>(null);
  // Store full objects to persist selection across pages/searches
  const [selectedItems, setSelectedItems] = useState<MerchantAlias[]>([]);
  const limit = 20;

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const { data, isLoading } = useQuery<PaginatedResponse<MerchantAlias>>({
    queryKey: ["merchant-aliases", page, searchQuery],
    queryFn: () =>
      searchQuery
        ? api.searchMerchantAliases(searchQuery, page, limit)
        : api.getMerchantAliases(page, limit),
    placeholderData: keepPreviousData,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const aliases = data?.items || [];

  const totalPages = data?.pages || 0;

  const isSelected = (id: string) => selectedItems.some((item) => item.id === id);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Add all visible aliases that aren't already selected
      const newItems = aliases.filter((a) => !isSelected(a.id));
      setSelectedItems((prev) => [...prev, ...newItems]);
    } else {
      // Remove all visible aliases from selection
      const currentPageIds = aliases.map((a) => a.id);
      setSelectedItems((prev) => prev.filter((item) => !currentPageIds.includes(item.id)));
    }
  };

  const handleSelectOne = (alias: MerchantAlias, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, alias]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item.id !== alias.id));
    }
  };

  // Check if all visible items are selected
  const isAllPageSelected = aliases.length > 0 && aliases.every((a) => isSelected(a.id));

  if (isLoading && !data) { // Only show full loader if no data is available yet
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <DebouncedSearchInput
            placeholder="Buscar estabelecimentos..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={selectedItems.length === 0}
        >
          <Store className="mr-2 h-4 w-4" />
          Novo Agrupamento
          {selectedItems.length > 0 && ` (${selectedItems.length})`}
        </Button>
      </div>

      <div className="rounded-md border h-[60vh] overflow-y-auto relative">
        <Table>
          <TableHeader className="sticky top-0 bg-secondary z-10 shadow-sm">
            <TableRow className="hover:bg-secondary">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllPageSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Selecionar todos da página"
                />
              </TableHead>
              <TableHead>Nome do Estabelecimento (Apelido)</TableHead>
              <TableHead>Qtd. Variações</TableHead>
              <TableHead>Categoria Padrão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && data ? ( // Show skeleton/loader if loading new data but old data is present
              <TableRow>
                <TableCell colSpan={5} className="h-[52vh] text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : aliases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-[52vh] text-center">
                  Nenhum estabelecimento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              aliases.map((alias: MerchantAlias) => (
                <TableRow key={alias.id} data-state={isSelected(alias.id) && "selected"}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected(alias.id)}
                      onCheckedChange={(checked) => handleSelectOne(alias, !!checked)}
                      aria-label={`Selecionar ${alias.pattern}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {alias.pattern}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {(alias.merchantIds?.length || 0) <= 1
                      ? "Sem variação"
                      : `${alias.merchantIds?.length} variações`}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {(() => {
                        const category = categories.find(c => c.id === alias.categoryId);
                        return alias.categoryId && category ? (
                          <CategoryBadge category={category} />
                        ) : (
                          <span className="opacity-50 italic">-</span>
                        );
                      })()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Elasticidade / Editar"
                      onClick={() => setEditingAliasId(alias.id)}
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

      <CreateMerchantAliasModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedAliases={selectedItems}
        onSuccess={() => setSelectedItems([])}
        categories={categories}
      />

      <EditMerchantAliasModal
        isOpen={!!editingAliasId}
        onClose={() => setEditingAliasId(null)}
        aliasId={editingAliasId}
        categories={categories}
      />
    </div>
  );
}
