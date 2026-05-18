"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import AuthLayout from "@/presentation/components/AuthLayout";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <form className="space-y-6">
        <Input
          type="email"
          placeholder="Enter your email"
          icon={Mail}
        />

        <Button size="lg" className="w-full h-15 cursor-pointer bg-black dark:bg-white text-white dark:text-black text-base font-bold">
          Send reset link
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
