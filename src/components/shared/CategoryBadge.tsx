import { Category } from "@/models/Category";

interface CategoryBadgeProps {
  variant?: "default" | "subtle";
  category: Pick<Category, "name" | "colorHex">;
}

export function CategoryBadge({ variant = "default", category }: CategoryBadgeProps) {
  if (!category) {
    return (
      <span className="text-muted-foreground opacity-50 italic text-sm">
        Sem Categoria
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3`}>
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: category.colorHex || '#ccc' }}
      />
      <span
        className={`font-medium text-foreground ${variant === "subtle" ? "text-muted-foreground" : ""}`}
      >
        {typeof category.name === 'string' ? category.name : (category.name as any)?.name || 'Invalid Name'}
      </span>
    </div>
  );
}
