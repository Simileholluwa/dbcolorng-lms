import { useMutation } from "@tanstack/react-query";
import { HttpAuthRepository } from "@/infrastructure/repositories/HttpAuthRepository";
import { LoginUseCase } from "@/application/use-cases/auth/LoginUseCase";
import { RegisterUseCase } from "@/application/use-cases/auth/RegisterUseCase";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const authRepository = new HttpAuthRepository();
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);

export const useAuth = () => {
  const { setAuth, logout } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: any) => loginUseCase.execute(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      
      if (!data.user.email_verified) {
        toast.info("Email verification required", {
          description: "Please verify your email to access your dashboard.",
        });
        router.push("/verify-email-sent");
        return;
      }

      toast.success("Welcome back!", {
        description: `Logged in as ${data.user.display_name}`,
      });
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Login failed", {
        description: error.response?.data?.detail || "Invalid credentials",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, displayName }: any) => registerUseCase.execute(email, password, displayName),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      toast.success("Account created!", {
        description: "Please check your email to verify your account.",
      });
      router.push("/verify-email-sent");
    },
    onError: (error: any) => {
      toast.error("Registration failed", {
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => authRepository.requestEmailVerification(email),
    onSuccess: () => {
      toast.success("Verification email sent!", {
        description: "Please check your inbox.",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to resend email", {
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    resendVerification: resendVerificationMutation.mutate,
    isResending: resendVerificationMutation.isPending,
    logout,
  };
};
