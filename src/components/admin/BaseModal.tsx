import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BaseModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function BaseModal({
  title,
  description,
  isOpen,
  onClose,
  children,
  maxWidth = "sm:max-w-[425px]",
}: BaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
