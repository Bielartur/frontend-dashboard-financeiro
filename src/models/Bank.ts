

export interface Bank {
  id: string;
  name: string;
  slug: string;
  colorHex: string;
  logoUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankCreate {
  name: string;
  colorHex: string;
  logoUrl: string;
}

export interface BankUpdate {
  name?: string;
  colorHex?: string;
  logoUrl?: string;
  isActive?: boolean;
}


