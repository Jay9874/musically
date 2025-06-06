// Interface for custom class ApiError
export interface ApiError extends Error {
    success: boolean;
    message: string;
    statusCode: number;
    data: [] | {};
  }
  
  // Example User interface
  export interface User {
    email?: string | undefined;
    password?: string | undefined;
  }