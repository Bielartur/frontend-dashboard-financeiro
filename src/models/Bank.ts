

export interface Bank {
  id: string;
  name: string;
  colorHex: string;
  logoUrl: string;
}

export interface BankCreate {
  name: string;
  color_hex: string;
  logo_url: string;
  slug: string;
  is_active: boolean;
}


