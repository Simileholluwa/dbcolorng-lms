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

  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      email,
      password,
      display_name: displayName,
    });
    return response.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/password-reset", { email });
  }

  async requestEmailVerification(email: string): Promise<void> {
    await apiClient.post("/auth/verify-email-request", { email });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      return null;
    }
  }
}
