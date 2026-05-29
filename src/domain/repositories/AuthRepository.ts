import { AuthResponse, User } from "../entities/User";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthResponse>;
  register(email: string, password: string, displayName: string, redirectUrl?: string): Promise<AuthResponse>;
  forgotPassword(email: string, redirectUrl?: string): Promise<void>;
  requestEmailVerification(email: string, redirectUrl?: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void>;
  confirmEmailVerification(oobCode: string): Promise<void>;
  updateProfile(displayName: string, photoUrl: string | null): Promise<User>;
}
