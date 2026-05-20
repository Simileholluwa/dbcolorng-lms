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
      setAuth(data.user, data.access_token, data.refresh_token);

      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectUrl = searchParams?.get("redirect_url") || "/dashboard";

      if (!data.user.email_verified) {
        toast.info("Email verification required", {
          description: "Please verify your email to access your dashboard.",
        });
        const verifyRedirect = redirectUrl !== "/dashboard"
          ? `/verify-email-sent?redirect_url=${encodeURIComponent(redirectUrl)}`
          : "/verify-email-sent";
        router.push(verifyRedirect);
        return;
      }

      toast.success("Welcome back!", {
        description: `Logged in as ${data.user.display_name}`,
      });
      router.push(redirectUrl);
    },
    onError: (error: any) => {
      toast.error("Login failed", {
        description: error.response?.data?.detail || "Invalid credentials",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, displayName }: any) => {
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
      const redirectUrl = `${frontendUrl}/verify-success`;
      return registerUseCase.execute(email, password, displayName, redirectUrl);
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      toast.success("Account created!", {
        description: "Please check your email to verify your account.",
      });
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectUrl = searchParams?.get("redirect_url");
      const verifyRedirect = redirectUrl
        ? `/verify-email-sent?redirect_url=${encodeURIComponent(redirectUrl)}`
        : "/verify-email-sent";
      router.push(verifyRedirect);
    },
    onError: (error: any) => {
      toast.error("Registration failed", {
        description: error.response?.data?.message || "Something went wrong",
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: ({ email, redirectUrl }: { email: string; redirectUrl?: string }) =>
      authRepository.requestEmailVerification(email, redirectUrl),
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

  const forgotPasswordMutation = useMutation({
    mutationFn: ({ email, redirectUrl }: { email: string; redirectUrl?: string }) =>
      authRepository.forgotPassword(email, redirectUrl),
    onSuccess: () => {
      toast.success("Reset email sent!", {
        description: "Please check your inbox for a password reset link.",
      });
    },
    onError: (error: any) => {
      toast.error("Request failed", {
        description: error.response?.data?.detail || "Something went wrong",
      });
    },
  });

  const confirmPasswordResetMutation = useMutation({
    mutationFn: ({ oobCode, newPassword }: { oobCode: string; newPassword: string }) =>
      authRepository.confirmPasswordReset(oobCode, newPassword),
    onSuccess: () => {
      toast.success("Password reset successful!", {
        description: "You can now log in with your new password.",
      });
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error("Failed to reset password", {
        description: error.response?.data?.detail || "Invalid or expired reset link",
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
    forgotPassword: forgotPasswordMutation.mutate,
    isSendingForgotPassword: forgotPasswordMutation.isPending,
    confirmPasswordReset: confirmPasswordResetMutation.mutate,
    isConfirmingPasswordReset: confirmPasswordResetMutation.isPending,
    logout,
  };
};
