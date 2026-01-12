export interface Category {
  id: string;
  name: string;
  slug: string;
  colorHex: string;
  type: "income" | "expense";
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreate {
  name: string;
  colorHex: string;
  type: "income" | "expense";
}
export interface CategoryUpdate {
  name?: string;
  colorHex?: string;
  type?: "income" | "expense";
}
