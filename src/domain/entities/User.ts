export interface User {
  id: string;
  email: string;
  display_name: string;
  photo_url: string | null;
  roles: string[];
  is_active: boolean;
  email_verified: boolean;
}

export interface AuthResponse {
  status: string;
  access_token: string;
  token_type: string;
  user: User;
}
