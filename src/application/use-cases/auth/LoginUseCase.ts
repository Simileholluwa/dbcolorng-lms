import { AuthRepository } from "@/domain/repositories/AuthRepository";
import { AuthResponse } from "@/domain/entities/User";

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthResponse> {
    return this.authRepository.login(email, password);
  }
}
