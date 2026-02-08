export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  isAdmin?: boolean; // Ensure backend sends this if needed, or default false
  itemIds: string[]; // List of connected Open Finance Item IDs
}
