import { Card, CardContent } from "@/components/ui/card";
import { MerchantSettingsTable } from "@/components/profile/MerchantSettingsTable";

export default function ProfileMerchants() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Meus Estabelecimentos</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie os apelidos dos estabelecimentos e agrupe nomes semelhantes.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <MerchantSettingsTable />
        </CardContent>
      </Card>
    </div>
  );
}
