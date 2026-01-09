import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  title = "Tem certeza?",
  description = "Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro.",
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
