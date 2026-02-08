import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DebouncedSearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  debounce?: number;
  placeholder?: string;
  className?: string;
}

export function DebouncedSearchInput({
  value: initialValue = "",
  onChange,
  debounce = 250,
  placeholder = "Buscar...",
  className,
}: DebouncedSearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with prop if it changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      onChange(value);
      setIsLoading(false);
    }, debounce);

    return () => {
      clearTimeout(timer);
    };
  }, [value, debounce]); // Excludes onChange to avoid loops if unstable ref

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {isLoading && value !== debouncedValue && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
