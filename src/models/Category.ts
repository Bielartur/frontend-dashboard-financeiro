export interface Category {
  id: string;
  name: string;
  colorHex: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreate {
  name: string;
  colorHex: string;
}
