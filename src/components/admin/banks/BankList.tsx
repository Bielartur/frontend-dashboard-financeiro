import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequests } from "@/hooks/use-requests";
import { Bank } from "@/models/Bank";
import { AdminTable, Column } from "../AdminTable";
import { CreateBankModal } from "../banks/CreateBankModal";
import { EditBankModal } from "../banks/EditBankModal";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
// import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { BankLogo } from "@/components/shared/BankLogo";


export function BankList() {
  const api = useRequests();

  // const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [deletingBank, setDeletingBank] = useState<Bank | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: banks = [], isLoading } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: api.getBanks,
  });

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setIsEditModalOpen(true);
  };

  const handleSave = async (id: string, data: any) => {
    try {
      await api.updateBank(id, data);
      await queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Banco atualizado com sucesso!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update bank:", error);
      toast.error("Erro ao atualizar banco.");
    }
  };

  const handleDeleteClick = (bank: Bank) => {
    setDeletingBank(bank);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBank) return;
    setIsDeleting(true);
    try {
      await api.deleteBank(deletingBank.id);
      await queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Banco excluído", {
        description: "O banco foi excluído com sucesso.",
      });
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete bank:", error);
      toast.error("Erro ao excluir banco.");
    } finally {
      setIsDeleting(false);
      setDeletingBank(null);
    }
  };

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
          <BankLogo
            logoUrl={bank.logoUrl}
            name={bank.name}
            colorHex={bank.colorHex}
          />
          <span className="font-medium text-foreground">{bank.name}</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminTable
        title="Selecione banco para alterar"
        description={isLoading ? "Carregando..." : `${banks.length} bancos encontrados`}
        addButtonLabel="Adicionar Banco"
        columns={columns}
        data={banks}
        isLoading={isLoading}
        onAdd={() => setIsCreateModalOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        emptyMessage="Nenhum banco encontrado."
      />

      <CreateBankModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditBankModal
        bank={editingBank}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Excluir ${deletingBank?.name}?`}
        description="Esta ação não pode ser desfeita. Isso excluirá permanentemente o banco e pode afetar os registros vinculados."
      />
    </>
  );
}
