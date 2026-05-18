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
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <AuthLayout
      title="Sign in with email"
      subtitle="Begin your interior design journey with dbcolorsNG"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="Email"
            icon={Mail}
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-[11px] text-red-500 font-medium ml-4">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              icon={Lock}
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors" />
                  )}
                </button>
              }
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-500 font-medium ml-4">{errors.password.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <Link href="/forgot-password" title="reset password" className="text-[13px] text-neutral-900 dark:text-neutral-50 font-semibold hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isLoggingIn}
          className="w-full h-15 cursor-pointer bg-black dark:bg-white text-white dark:text-black mt-6 text-base font-bold"
        >
          {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to dashboard"}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-neutral-900 dark:text-neutral-50 font-bold hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
