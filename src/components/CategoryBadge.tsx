import { Category } from "@/models/Category";

interface CategoryBadgeProps {
  variant?: "default" | "subtle";
  category: Pick<Category, "name" | "colorHex">;
}

export function CategoryBadge({ variant = "default", category }: CategoryBadgeProps) {
  return (
    <div className={`flex items-center gap-3`}>
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: category.colorHex }}
      />
      <span
        className={`font-medium text-foreground ${variant === "subtle" ? "text-muted-foreground" : ""}`}
      >
        {category.name}
      </span>
    </div>
  );
}
