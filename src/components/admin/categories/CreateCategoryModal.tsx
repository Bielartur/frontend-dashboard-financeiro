import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { BaseModal } from "../BaseModal";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySchema, CategoryFormValues } from "@/models/schemas/CategorySchema";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCategoryModal({ isOpen, onClose }: CreateCategoryModalProps) {
  const api = useRequests();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      colorHex: "#000000",
      type: "expense",
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    setIsLoading(true);
    try {
      await api.createCategory({
        name: values.name,
        colorHex: values.colorHex,
        type: values.type,
      });

      toast({
        variant: "success",
        title: "Sucesso",
        description: "Categoria cadastrada com sucesso!",
      });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      form.reset({
        name: "",
        colorHex: values.colorHex,
        type: "expense",
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao cadastrar categoria.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseModal
      title="Nova Categoria"
      description="Preencha os dados abaixo para criar uma nova categoria."
      isOpen={isOpen}
      onClose={onClose}
    >
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Categoria</FormLabel>
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
                <FormLabel>Cor da Categoria</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      type="color"
                      {...field}
                      className="w-20 py-1.5 px-2 cursor-pointer"
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
                  Escolha uma cor para identificar esta categoria nos gráficos.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
