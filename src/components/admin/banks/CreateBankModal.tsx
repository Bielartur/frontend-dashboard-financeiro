import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
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
import { BaseModal } from "../BaseModal";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface CreateBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBankModal({ isOpen, onClose }: CreateBankModalProps) {
  const api = useRequests();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

      toast({
        variant: "success",
        title: "Sucesso",
        description: "Banco cadastrado com sucesso!",
      });
      await queryClient.invalidateQueries({ queryKey: ["banks"] });
      form.reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao cadastrar banco",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseModal
      title="Novo Banco"
      description="Preencha os dados abaixo para cadastrar um novo banco."
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm:max-w-[600px]"
    >
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
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.startsWith("#") || value === "") {
                            field.onChange(value);
                          } else {
                            field.onChange("#" + value);
                          }
                        }}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="w-1/2" disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="w-1/2" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </BaseModal>
  );
}
