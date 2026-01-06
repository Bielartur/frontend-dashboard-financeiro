import { z } from "zod";

export const PaymentSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  date: z.date({
    required_error: "A data é obrigatória",
  }),
  amount: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
  paymentMethod: z.enum(["pix", "credit_card", "debit_card", "other"], {
    required_error: "Selecione um método de pagamento",
  }),
  bankId: z.string().refine((val) => val !== "none" && val !== "", {
    message: "Selecione um banco válido",
  }).refine((val) => {
    // Simple UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(val);
  }, { message: "Selecione um banco válido" }),
  categoryId: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof PaymentSchema>;
