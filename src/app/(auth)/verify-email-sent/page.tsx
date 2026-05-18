"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui/Button";
import AuthLayout from "@/presentation/components/AuthLayout";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/presentation/hooks/useAuth";
import { useAuthStore } from "@/presentation/store/useAuthStore";

export default function VerifyEmailSentPage() {
  const { resendVerification, isResending } = useAuth();
  const { user } = useAuthStore();

  const handleResend = () => {
    if (user?.email) {
      resendVerification(user.email);
    }
  };

  return (
    <AuthLayout
      title="Check your email"
      subtitle="We've sent a verification link to your inbox. Please click the link to activate your account."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm text-neutral-500 font-medium">
            Didn&apos;t receive the email? Check your spam folder or
          </p>
          <Button
            size="lg"
            className="w-full h-15 cursor-pointer bg-black dark:bg-white text-white dark:text-black text-base font-bold"
            onClick={handleResend}
            disabled={isResending || !user?.email}
          >
            {isResending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Resend verification email"}
          </Button>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-semibold gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
