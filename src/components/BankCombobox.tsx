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
import { Bank } from "@/models/Bank";
import { BankLogo } from "@/components/BankLogo";

interface BankComboboxProps {
  value?: string;
  banks: Bank[];
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  extraOption?: {
    label: string;
    value: string;
  };
}

export function BankCombobox({
  value,
  banks,
  onChange,
  placeholder = "Selecione um banco",
  emptyText = "Nenhum banco encontrado.",
  extraOption,
}: BankComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedBank = banks.find((b) => b.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 px-3 font-normal"
        >
          {selectedBank ? (
            <div className="flex items-center gap-2">
              <BankLogo
                name={selectedBank.name}
                logoUrl={selectedBank.logoUrl}
                colorHex={selectedBank.colorHex}
                className="w-5 h-5"
              />
              <span className="truncate">{selectedBank.name}</span>
            </div>
          ) : extraOption && value === extraOption.value ? (
            <span className="truncate">{extraOption.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar banco..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>

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
              {banks.map((bank) => (
                <CommandItem
                  key={bank.id}
                  value={bank.name}
                  keywords={[bank.name]}
                  onSelect={() => {
                    onChange(bank.id);
                    setOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      value === bank.id
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  <div className="flex items-center gap-2">
                    <BankLogo
                      name={bank.name}
                      logoUrl={bank.logoUrl}
                      colorHex={bank.colorHex}
                      className="w-8 h-8"
                    />
                    <span>{bank.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
