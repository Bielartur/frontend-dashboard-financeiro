import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, CategoryUpdate, CategorySettingsUpdate } from "@/models/Category";
import { BaseModal } from "../BaseModal";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategorySchema } from "@/models/schemas/CategorySchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create a separate schema for personal settings if needed, or refine CategorySchema
// For now, we will make fields optional/required based on usage in the form logic or just reuse strict schema and fill defaults?
// Better to check which fields are actually rendered. The Schema currently requires name/type/colorHex.
// For Personal mode, we don't edit Name/Type. We edit Alias/Color.
// Let's adjust validation or just fill hidden fields with current values.

interface EditCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>; // data typed as any to handle both update types flexibly here, or union
  mode: 'admin' | 'personal';
}

export function EditCategoryModal({
  category,
  isOpen,
  onClose,
  onSave,
  mode
}: EditCategoryModalProps) {
  const form = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      alias: "",
      colorHex: "#000000",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        alias: category.alias || "",
        colorHex: category.colorHex,
      });
    }
  }, [category, form]);

  const handleSubmit = async (values: z.infer<typeof CategorySchema>) => {
    if (!category) return;

    if (mode === 'admin') {
      // Admin saves Name, Type, Color (Global)
      // We ignore Alias here
      const payload: CategoryUpdate = {
        name: values.name,
        colorHex: values.colorHex,
      };
      await onSave(category.id, payload);
    } else {
      // Personal saves Alias, Color (Personal)
      // Name and Type are ignored (or sent but validation on backend for settings endpoint ignores them)
      // Actually, the onSave callback in ProfilePage will call updateCategorySettings which expects { alias, colorHex }
      const payload: CategorySettingsUpdate = {
        alias: values.alias,
        colorHex: values.colorHex,
      };
      await onSave(category.id, payload);
    }

    onClose();
  };

  return (
    <BaseModal
      title={mode === 'admin' ? "Editar Categoria (Global)" : "Editar Categoria (Pessoal)"}
      description={mode === 'admin'
        ? "Alterações aqui afetam todos os usuários."
        : "Personalize como você vê esta categoria."}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

          {mode === 'admin' && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Oficial</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {mode === 'personal' && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Oficial (Original)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {mode === 'personal' && (
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido (Para você)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Gasto Pessoal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}



          <FormField
            control={form.control}
            name="colorHex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="w-20 py-1.5 px-2" {...field} />
                    <Input
                      placeholder="#000000"
                      className="font-mono uppercase"
                      maxLength={7}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.startsWith("#") || value === "") {
                          field.onChange(value);
                        } else {
                          field.onChange("#" + value);
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="w-1/2">
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
