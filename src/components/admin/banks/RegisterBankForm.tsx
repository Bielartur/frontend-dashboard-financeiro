import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRequests } from "@/hooks/use-requests";
import { BankSchema, BankFormValues } from "@/models/schemas/BankSchema";

interface RegisterBankFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RegisterBankForm({ onSuccess, onCancel }: RegisterBankFormProps) {
  const api = useRequests();
  const [isLoading, setIsLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "_");
  };

  const form = useForm<BankFormValues>({
    resolver: zodResolver(BankSchema),
    defaultValues: {
      name: "",
      colorHex: "#000000",
      logoUrl: "",
    },
  });

  async function onSubmit(values: BankFormValues) {
    setIsLoading(true);
    try {
      await api.createBank({
        name: values.name,
        colorHex: values.colorHex,
        logoUrl: values.logoUrl || "https://placehold.co/600",
      });

      toast.success("Banco cadastrado com sucesso!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Banco</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Nubank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="colorHex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor do Banco</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      type="color"
                      {...field}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                  </FormControl>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      placeholder="#000000"
                      className="flex-1 font-mono uppercase"
                      maxLength={7}
                    />
                  </FormControl>
                </div>
                <FormDescription className="text-xs text-muted-foreground">
                  Cor usada em gráficos e ícones.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Logo</FormLabel>
                <FormControl>
                  <Input placeholder="https://exemplo.com/logo.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Logo Preview */}
        {form.watch("logoUrl") && (
          <div className="mt-6 flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/20 border-dashed">
            <span className="text-sm text-muted-foreground mb-3">Prévia da Logo</span>
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full shadow-sm overflow-hidden p-2">
              <img
                src={form.watch("logoUrl")}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600?text=Error";
                }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-full" disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar Banco"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
