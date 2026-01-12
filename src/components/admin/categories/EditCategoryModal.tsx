import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, CategoryUpdate } from "@/models/Category";
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

interface EditCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: CategoryUpdate) => Promise<void>;
}

export function EditCategoryModal({
  category,
  isOpen,
  onClose,
  onSave,
}: EditCategoryModalProps) {
  const form = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      colorHex: "#000000",
      type: "expense",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        colorHex: category.colorHex,
        type: category.type as "expense" | "income",
      });
    }
  }, [category, form]);

  const handleSubmit = async (values: z.infer<typeof CategorySchema>) => {
    if (!category) return;
    await onSave(category.id, values);
    onClose();
  };

  return (
    <BaseModal
      title="Editar Categoria"
      description="Faça alterações na categoria aqui. Clique em salvar quando terminar."
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da categoria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
