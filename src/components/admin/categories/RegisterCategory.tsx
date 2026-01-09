import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const CategorySchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  colorHex: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida"),
});

type CategoryFormValues = z.infer<typeof CategorySchema>;

interface RegisterCategoryProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RegisterCategory({ onSuccess, onCancel }: RegisterCategoryProps) {
  const api = useRequests();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      colorHex: "#000000",
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    setIsLoading(true);
    try {
      // NOTE: "color_hex" is intentionally omitted from the payload
      // as the backend does not support it yet, per user instruction.
      await api.createCategory({
        name: values.name,
        colorHex: values.colorHex,
      });

      toast.success("Categoria cadastrada com sucesso!");
      form.reset({
        name: "",
        colorHex: values.colorHex
      });
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar categoria");
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
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Alimentação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colorHex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor da Categoria</FormLabel>
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
                Escolha uma cor para identificar esta categoria nos gráficos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-full" disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar Categoria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
