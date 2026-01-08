import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string; // For header styling
  cellClassName?: string; // For cell styling
}

interface AdminTableProps<T> {
  title: string;
  description: string;
  addButtonLabel: string;
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
}

export function AdminTable<T extends { id: string; createdAt?: string; updatedAt?: string }>({
  title,
  description,
  addButtonLabel,
  columns,
  data,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  emptyMessage = "Nenhum registro encontrado.",
}: AdminTableProps<T>) {

  const allColumns: Column<T>[] = [
    ...columns,
    {
      header: "Última modificação",
      className: "w-[148px]",
      cellClassName: "text-muted-foreground",
      cell: (item) => {
        const date = item.updatedAt || item.createdAt;
        if (!date) return "-";
        return formatDistanceToNow(new Date(date), {
          addSuffix: true,
          locale: ptBR,
        });
      },
    },
  ];

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {addButtonLabel}
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                {allColumns.map((col, index) => (
                  <TableHead
                    key={index}
                    className={cn("text-muted-foreground font-semibold", col.className)}
                  >
                    {col.header}
                  </TableHead>
                ))}
                <TableHead className="w-[100px] text-right text-muted-foreground font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={allColumns.length + 1} className="h-24 text-center">
                    <Spinner size={24} className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={allColumns.length + 1}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    {allColumns.map((col, index) => (
                      <TableCell
                        key={index}
                        className={cn(col.cellClassName)}
                      >
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                            ? (item[col.accessorKey] as ReactNode)
                            : null}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => onEdit?.(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete?.(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
