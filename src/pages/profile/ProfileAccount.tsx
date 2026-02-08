import { Card, CardContent } from "@/components/ui/card";

export default function ProfileAccount() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dados da Conta</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações de login e dados pessoais.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
            Em breve: Alteração de senha e email.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
