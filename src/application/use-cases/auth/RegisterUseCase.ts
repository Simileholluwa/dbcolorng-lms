import { AuthRepository } from "@/domain/repositories/AuthRepository";
import { AuthResponse } from "@/domain/entities/User";

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) { }

  async execute(email: string, password: string, displayName: string): Promise<AuthResponse> {
    return this.authRepository.register(email, password, displayName);
  }
}
