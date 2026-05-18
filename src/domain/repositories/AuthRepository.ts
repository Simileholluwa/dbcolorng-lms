import { AuthResponse, User } from "../entities/User";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthResponse>;
  register(email: string, password: string, displayName: string): Promise<AuthResponse>;
  forgotPassword(email: string): Promise<void>;
  requestEmailVerification(email: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
