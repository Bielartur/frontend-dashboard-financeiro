import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClearFilterButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export function ClearFilterButton({ onClick, className, label = "Limpar filtro" }: ClearFilterButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-6 text-xs text-muted-foreground hover:text-destructive", className)}
      onClick={onClick}
    >
      <X className="h-3 w-3 mr-1" />
      {label}
    </Button>
  );
}
