import { z } from "zod";

export const BankSchema = z.object({
  name: z.string().min(1, "O nome do banco é obrigatório"),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  logoUrl: z.string().url("URL do logo inválida").optional().or(z.literal("")),
});

export type BankFormValues = z.infer<typeof BankSchema>;
