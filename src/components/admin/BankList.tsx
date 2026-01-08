import { useQuery } from "@tanstack/react-query";
import { useRequests } from "@/hooks/use-requests";
import { Bank } from "@/models/Bank";
import { AdminTable, Column } from "./AdminTable";

interface BankListProps {
  onAddClick?: () => void;
}

export function BankList({ onAddClick }: BankListProps) {
  const api = useRequests();

  const { data: banks = [], isLoading } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: api.getBanks,
  });

  const columns: Column<Bank>[] = [
    {
      header: "ID",
      className: "w-[100px]",
      cellClassName: "font-mono text-xs text-muted-foreground",
      cell: (bank) => <>{bank.id.slice(0, 8)}...</>,
    },
    {
      header: "Banco",
      className: "w-[420px]",
      cell: (bank) => (
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-md shrink-0 overflow-hidden bg-muted/20 border border-border/10 shadow-sm"
            style={{ backgroundColor: bank.colorHex }}
          >
            <img
              src={bank.logoUrl || ''}
              alt={bank.name}
              className="w-full h-full object-contain p-[0.4rem]"
            />
          </div>
          <span className="font-medium text-foreground">{bank.name}</span>
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      title="Selecione banco para alterar"
      description={isLoading ? "Carregando..." : `${banks.length} bancos encontrados`}
      addButtonLabel="Adicionar Banco"
      columns={columns}
      data={banks}
      isLoading={isLoading}
      onAdd={() => onAddClick?.()}
      onEdit={(bank) => console.log("Edit bank", bank)}
      onDelete={(bank) => console.log("Delete bank", bank)}
      emptyMessage="Nenhum banco encontrado."
    />
  );
}
