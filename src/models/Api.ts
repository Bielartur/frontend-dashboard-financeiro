export interface ApiError {
  success: boolean;
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  // Some backends return directly the data, or a paginated response
  [key: string]: any;
}
