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

export interface Selectable<valueType, labelType> {
  value: valueType;
  label: labelType;
}

export interface SidebarLink {
  title: string;
  value: string;
  iconUrl: string;
  href: string;
}
