"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import AuthLayout from "@/presentation/components/AuthLayout";
import { useAuth } from "@/presentation/hooks/useAuth";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword, isSendingForgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const redirectUrl = `${frontendUrl}/reset-password`;
    forgotPassword({ email: data.email, redirectUrl });
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-[11px] text-red-500 font-medium ml-4 text-left">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSendingForgotPassword}
          className="w-full h-15 cursor-pointer bg-black dark:bg-white text-white dark:text-black text-base font-bold flex items-center justify-center gap-2"
        >
          {isSendingForgotPassword ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Send reset link"
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
