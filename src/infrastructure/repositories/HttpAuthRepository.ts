import { AuthRepository } from "@/domain/repositories/AuthRepository";
import { AuthResponse, User } from "@/domain/entities/User";
import apiClient from "../api/client";

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async register(email: string, password: string, displayName: string, redirectUrl?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      email,
      password,
      display_name: displayName,
      redirect_url: redirectUrl,
    });
    return response.data;
  }

  async forgotPassword(email: string, redirectUrl?: string): Promise<void> {
    await apiClient.post("/auth/password-reset", {
      email,
      redirect_url: redirectUrl,
    });
  }

  async requestEmailVerification(email: string, redirectUrl?: string): Promise<void> {
    await apiClient.post("/auth/verify-email-request", {
      email,
      redirect_url: redirectUrl,
    });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/password-reset-confirm", {
      oob_code: oobCode,
      new_password: newPassword,
    });
  }

  async confirmEmailVerification(oobCode: string): Promise<void> {
    await apiClient.post("/auth/confirm-email", {
      oob_code: oobCode,
    });
  }

  async updateProfile(displayName: string, photoUrl: string | null): Promise<User> {
    const response = await apiClient.put<User>("/auth/profile", {
      display_name: displayName,
      photo_url: photoUrl,
    });
    return response.data;
  }
}
