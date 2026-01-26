export interface Category {
  id: string;
  name: string;
  slug: string;
  alias?: string;
  colorHex: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreate {
  name: string;
  colorHex: string;
}
export interface CategoryUpdate {
  name?: string;
  colorHex?: string;
}

export interface CategorySettingsUpdate {
  alias?: string;
  colorHex?: string;
}
