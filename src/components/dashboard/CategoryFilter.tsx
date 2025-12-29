import { categoryLabels, categoryColors, CategoryData } from '@/data/financialData';
import { cn } from '@/lib/utils';
import { Tag, RotateCcw } from 'lucide-react';

interface CategoryFilterProps {
    selectedCategory: keyof CategoryData | null;
    onSelectCategory: (category: keyof CategoryData | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
    const categories = Object.keys(categoryLabels) as Array<keyof CategoryData>;

    return (
        <div className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Filtrar por Categoria</h3>
                </div>
                {selectedCategory !== null && (
                    <button
                        onClick={() => onSelectCategory(null)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Ver todas
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(selectedCategory === category ? null : category)}
                        className={cn(
                            'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border border-transparent',
                            selectedCategory === category
                                ? 'text-white shadow-lg transform scale-105'
                                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border/50'
                        )}
                        style={
                            selectedCategory === category
                                ? {
                                    backgroundColor: categoryColors[category],
                                    boxShadow: `0 4px 12px ${categoryColors[category]}40`
                                }
                                : {}
                        }
                    >
                        {categoryLabels[category]}
                    </button>
                ))}
            </div>
        </div>
    );
}
