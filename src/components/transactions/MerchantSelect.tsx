import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { Merchant } from "@/models/Merchant";

interface MerchantSelectProps {
  merchantSearch: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  merchants: Merchant[];
  onSelect: (merchant: Merchant | null, name: string) => void;
  currentValue: string;
}

export function MerchantSelect({
  merchantSearch,
  onSearchChange,
  isLoading,
  merchants,
  onSelect,
  currentValue,
}: MerchantSelectProps) {
  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Buscar estabelecimento..."
        value={merchantSearch}
        onValueChange={onSearchChange}
      />
      <CommandList>
        {isLoading && (
          <div className="flex justify-center p-4">
            <Spinner size={20} />
          </div>
        )}
        <CommandEmpty className="py-2 px-4 text-sm text-muted-foreground">
          {merchantSearch ? (
            <div className="flex flex-col gap-1">
              <span>Nenhum estabelecimento encontrado.</span>
              <span className="font-medium text-primary">"{merchantSearch}" será cadastrado.</span>
            </div>
          ) : (
            "Digite para buscar..."
          )}
        </CommandEmpty>
        <CommandGroup heading="Sugestões">
          {merchants.map((merchant) => (
            <CommandItem
              key={merchant.id}
              value={merchant.name}
              onSelect={() => onSelect(merchant, merchant.name)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  merchant.name === currentValue
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
              {merchant.name}
            </CommandItem>
          ))}
        </CommandGroup>

        {merchantSearch && !merchants.find(m => m.name.toLowerCase() === merchantSearch.toLowerCase()) && (
          <CommandGroup heading="Novo">
            <CommandItem
              value={merchantSearch}
              onSelect={() => onSelect(null, merchantSearch)}
            >
              <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
              Usar "{merchantSearch}"
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
