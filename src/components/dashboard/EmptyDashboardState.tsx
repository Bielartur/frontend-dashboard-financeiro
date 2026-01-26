import { BarChart3 } from "lucide-react";

interface EmptyDashboardStateProps {
  title?: string;
  description?: string;
  height?: string;
}

export function EmptyDashboardState({
  title = "Sem dados para exibir",
  description = "Comece a cadastrar suas transações para ver os gráficos estatísticos.",
  height = "h-[300px]"
}: EmptyDashboardStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${height} text-center p-6 border-2 border-dashed border-border/50 rounded-lg bg-secondary/10`}>
      <div className="p-4 rounded-full bg-secondary/30 mb-4 ring-8 ring-secondary/10">
        <BarChart3 className="w-8 h-8 text-muted-foreground opacity-50" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        {description}
      </p>
    </div>
  );
}
