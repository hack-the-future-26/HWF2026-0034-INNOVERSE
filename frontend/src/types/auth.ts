export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization_id?: number;
  organization_name?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  organization_id?: number;
}
