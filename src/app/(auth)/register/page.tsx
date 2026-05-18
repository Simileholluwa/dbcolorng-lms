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
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerUser({
      email: data.email,
      password: data.password,
      displayName: `${data.firstName} ${data.lastName}`,
    });
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join dbcolorsNG and start your creative journey today."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Input 
              placeholder="First Name" 
              icon={User}
              {...register("firstName")}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-[11px] text-red-500 font-medium ml-4">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Input 
              placeholder="Last Name" 
              icon={User}
              {...register("lastName")}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-[11px] text-red-500 font-medium ml-4">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
          {errors.password && (
            <p className="text-[11px] text-red-500 font-medium ml-4">{errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit"
          size="lg" 
          disabled={isRegistering}
          className="w-full h-15 mt-6 text-base font-bold"
        >
          {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Started"}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-neutral-900 dark:text-neutral-50 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
