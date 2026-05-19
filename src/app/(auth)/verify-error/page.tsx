"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/presentation/components/ui/Button";
import AuthLayout from "@/presentation/components/AuthLayout";
import { Loader2, ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { useAuth } from "@/presentation/hooks/useAuth";
import { useAuthStore } from "@/presentation/store/useAuthStore";

function VerifyErrorContent() {
  const searchParams = useSearchParams();
  const detail = searchParams.get("detail") || "The verification link is invalid or has expired.";
  const { resendVerification, isResending } = useAuth();
  const { user, logout } = useAuthStore();

  const handleResend = () => {
    if (user?.email) {
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
      const redirectUrl = `${frontendUrl}/verify-success`;

      resendVerification({ email: user.email, redirectUrl });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-red-50 p-4 rounded-xl border border-red-100">
        <p className="text-sm text-red-800 font-medium leading-relaxed text-center">
          {detail}
        </p>
      </div>

      <div className="space-y-4">
        <Button
          size="lg"
          className="w-full h-15 cursor-pointer text-base bg-black dark:bg-white text-white dark:text-black font-bold"
          onClick={handleResend}
          disabled={isResending || !user?.email}
        >
          {isResending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Resend verification email"}
        </Button>
        <div className="text-center pt-2">
          <Link
            href="/login"
            onClick={() => logout()}
            className="inline-flex items-center text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-semibold gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyErrorPage() {
  return (
    <AuthLayout
      title="Verification Failed"
      subtitle="We couldn't verify your email address."
    >
      <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
        <VerifyErrorContent />
      </Suspense>
    </AuthLayout>
  );
}
