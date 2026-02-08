
import { cn } from "@/lib/utils";

interface BankLogoProps {
  logoUrl?: string | null;
  name: string;
  colorHex?: string;
  className?: string; // Allow overriding/extending styles (e.g. size)
}

export function BankLogo({ logoUrl, name, colorHex, className }: BankLogoProps) {
  // Check if the logo is likely transparent (SVG or PNG) based on extension
  // If transparent, we keep the padding. If solid (JPEG, ICO, etc), we remove padding to fill the container.
  const isTransparent = logoUrl ? /\.(svg|png|webp)(\?.*)?$/i.test(logoUrl) : true;

  return (
    <div
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-md shrink-0 overflow-hidden bg-muted/20 border border-border/10 shadow-sm",
        className
      )}
      style={{ backgroundColor: colorHex || '#ffffff' }}
    >
      <img
        src={logoUrl || ''}
        alt={name}
        className={cn(
          "w-full h-full object-contain",
          // isTransparent ? "p-[20%]" : "p-0" 
        )}
      />
    </div>
  );
}
