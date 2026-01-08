import { useQuery } from "@tanstack/react-query";
import { useRequests } from "@/hooks/use-requests";
import { Category } from "@/models/Category";
import { AdminTable, Column } from "./AdminTable";
import { CategoryBadge } from "@/components/CategoryBadge";
import { getContrastVariant } from "@/lib/utils";

interface CategoryListProps {
  onAddClick?: () => void;
}

export function CategoryList({ onAddClick }: CategoryListProps) {
  const api = useRequests();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  const columns: Column<Category>[] = [
    {
      header: "ID",
      className: "w-[100px]",
      cellClassName: "font-mono text-xs text-muted-foreground",
      cell: (category) => <>{category.id.slice(0, 8)}...</>,
    },
    {
      header: "Nome",
      accessorKey: "name",
      className: "w-[420px]",
      cellClassName: "font-medium text-foreground",
      cell: (category) => <CategoryBadge category={category} />
    },
  ];

  return (
    <AdminTable
      title="Selecione categoria para alterar"
      description={isLoading ? "Carregando..." : `${categories.length} categorias encontradas`}
      addButtonLabel="Adicionar Categoria"
      columns={columns}
      data={categories}
      isLoading={isLoading}
      onAdd={() => onAddClick?.()}
      onEdit={(category) => console.log("Edit category", category)}
      onDelete={(category) => console.log("Delete category", category)}
      emptyMessage="Nenhuma categoria encontrada."
    />
  );
}
