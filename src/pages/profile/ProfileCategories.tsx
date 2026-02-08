import { Card, CardContent } from "@/components/ui/card";
import { CategorySettingsTable } from "@/components/profile/CategorySettingsTable";

export default function ProfileCategories() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Personalização de Categorias</h2>
        <p className="text-sm text-muted-foreground">
          Defina apelidos e cores personalizadas para as categorias. Isso afeta apenas a sua visualização.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <CategorySettingsTable />
        </CardContent>
      </Card>
    </div>
  );
}
