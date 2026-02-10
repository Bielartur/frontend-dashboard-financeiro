
import { Divide, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = ScanSearch,
  action,
  className,
  children
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500",
      className
    )}>
      <div className="bg-muted/50 p-4 rounded-full mb-4 ring-1 ring-border/50">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {children}
      {action && (
        <Button onClick={action.onClick} variant="outline" className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
