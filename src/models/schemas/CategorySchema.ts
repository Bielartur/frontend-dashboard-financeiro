import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  colorHex: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida"),
  type: z.enum(["expense", "income"], {
    required_error: "Selecione o tipo de categoria",
  }),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;
