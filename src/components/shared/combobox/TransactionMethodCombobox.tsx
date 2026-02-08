import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTransactionMethodIcon } from "@/utils/transaction-icons";

interface TransactionMethodComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  extraOption?: {
    label: string;
    value: string;
  };
}

const METHODS = [
  { value: "pix", label: "Pix" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "debit_card", label: "Cartão de Débito" },
  { value: "bank_transfer", label: "Transferência Bancária" },
  { value: "boleto", label: "Boleto" },
  { value: "bill_payment", label: "Pagamento de Fatura" },
  { value: "investment_redemption", label: "Resgate de Investimento" },
  { value: "cash", label: "Dinheiro" }, // Added based on typical options and backend enum
  { value: "other", label: "Outro" },
];

export function TransactionMethodCombobox({
  value,
  onChange,
  placeholder = "Selecione um método",
  extraOption,
}: TransactionMethodComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedMethod = METHODS.find((m) => m.value === value);

  const SelectedIcon = selectedMethod
    ? getTransactionMethodIcon(selectedMethod.value).icon
    : null;

  const SelectedIconConfig = selectedMethod
    ? getTransactionMethodIcon(selectedMethod.value)
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 px-3 font-normal"
        >
          {selectedMethod ? (
            <div className="flex items-center gap-2">
              {SelectedIconConfig && (
                <SelectedIconConfig.icon
                  className={cn("h-4 w-4", SelectedIconConfig.colorClass)}
                />
              )}
              <span className="truncate">{selectedMethod.label}</span>
            </div>
          ) : extraOption && value === extraOption.value ? (
            <span className="truncate">{extraOption.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar método..." />
          <CommandList>
            <CommandEmpty>Método não encontrado.</CommandEmpty>

            {extraOption && (
              <CommandGroup>
                <CommandItem
                  value={extraOption.value}
                  keywords={[extraOption.label]}
                  onSelect={() => {
                    onChange(extraOption.value);
                    setOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      value === extraOption.value
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  <span className="font-medium text-primary">{extraOption.label}</span>
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup>
              {METHODS.map((method) => {
                const iconConfig = getTransactionMethodIcon(method.value);
                const Icon = iconConfig.icon;

                return (
                  <CommandItem
                    key={method.value}
                    value={method.label}
                    keywords={[method.label]}
                    onSelect={() => {
                      onChange(method.value);
                      setOpen(false);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        value === method.value
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", iconConfig.colorClass)} />
                      <span>{method.label}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
