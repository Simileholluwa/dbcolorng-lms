"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthLayout from "@/presentation/components/AuthLayout";
import { useAuth } from "@/presentation/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6">
      <Loader2 className="w-10 h-10 animate-spin text-neutral-500" />
      <p className="text-neutral-400 font-medium">Verifying your email address, please wait...</p>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode");
  const redirectUrl = searchParams.get("redirect_url") || "";
  const { confirmEmailVerification } = useAuth();
  const triggered = React.useRef(false);

  React.useEffect(() => {
    // Prevent double invocation in React StrictMode
    if (triggered.current) return;
    triggered.current = true;

    if (!oobCode) {
      router.push("/verify-error?detail=Missing verification code.");
      return;
    }

    const verify = async () => {
      try {
        await confirmEmailVerification({ oobCode });
        toast.success("Email verified!", {
          description: "Your email has been successfully verified.",
        });
        const successUrl = redirectUrl
          ? `/verify-success?redirect_url=${encodeURIComponent(redirectUrl)}`
          : "/verify-success";
        router.push(successUrl);
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || error.message || "Invalid or expired verification code.";
        router.push(`/verify-error?detail=${encodeURIComponent(errorMsg)}`);
      }
    };

    verify();
  }, [oobCode, redirectUrl, confirmEmailVerification, router]);

  return <LoadingIndicator />;
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verifying Email"
      subtitle="Connecting to authentication servers to verify your account."
    >
      <React.Suspense fallback={<LoadingIndicator />}>
        <VerifyEmailContent />
      </React.Suspense>
    </AuthLayout>
  );
}
