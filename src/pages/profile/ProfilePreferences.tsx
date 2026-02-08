import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePreferences() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Preferências do Sistema</h2>
        <p className="text-sm text-muted-foreground">
          Ajuste temas e outras configurações globais.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
            Em breve: Tema Escuro/Claro, Notificações.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
