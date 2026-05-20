"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import AuthLayout from "@/presentation/components/AuthLayout";
import { useAuth } from "@/presentation/hooks/useAuth";
import { Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const { confirmPasswordReset, isConfirmingPasswordReset, logout } = useAuth();

  React.useEffect(() => {
    logout();
  }, [logout]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!oobCode) return;
    confirmPasswordReset({ oobCode, newPassword: data.password });
  };

  if (!oobCode) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This password reset link is invalid or expired."
      >
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-2 text-red-500 py-4 font-medium">
            <AlertCircle className="w-6 h-6" />
            <span>Missing reset code.</span>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/forgot-password"
              className="inline-flex items-center text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-semibold gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Request new link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Please enter your new password below."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <Input
              type="password"
              placeholder="New password"
              icon={Lock}
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-[11px] text-red-500 font-medium ml-4 text-left">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              type="password"
              placeholder="Confirm new password"
              icon={Lock}
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-500 font-medium ml-4 text-left">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isConfirmingPasswordReset}
          className="w-full h-15 cursor-pointer bg-black dark:bg-white text-white dark:text-black text-base font-bold flex items-center justify-center gap-2"
        >
          {isConfirmingPasswordReset ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Reset Password"
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-semibold gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
