import { useEffect } from "react";
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
import { Bank } from "@/models/Bank";
import { BankSchema, BankFormValues } from "@/models/schemas/BankSchema";
import { BaseModal } from "../BaseModal";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface EditBankModalProps {
  bank: Bank | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<BankFormValues>) => Promise<void>;
}

export function EditBankModal({ bank, isOpen, onClose, onSave }: EditBankModalProps) {
  const form = useForm<BankFormValues>({
    resolver: zodResolver(BankSchema),
    defaultValues: {
      name: "",
      colorHex: "#000000",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (bank) {
      form.reset({
        name: bank.name,
        colorHex: bank.colorHex,
        logoUrl: bank.logoUrl,
      });
    }
  }, [bank, form]);

  const handleSubmit = async (values: BankFormValues) => {
    if (!bank) return;
    await onSave(bank.id, values);
    onClose();
  };

  return (
    <BaseModal
      title="Editar Banco"
      description="Faça alterações no banco aqui. Clique em salvar quando terminar."
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm:max-w-[600px]"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
            <Button type="button" variant="outline" onClick={onClose} className="w-1/2" disabled={form.formState.isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-1/2"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </BaseModal>
  );
}
