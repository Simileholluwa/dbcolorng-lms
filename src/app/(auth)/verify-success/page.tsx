"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/presentation/components/ui/Button";
import AuthLayout from "@/presentation/components/AuthLayout";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense } from "react";

function VerifySuccessContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "";
  const loginLink = redirectUrl 
    ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/login";

  return (
    <div className="space-y-8">
      <Link href={loginLink} className="block w-full">
        <Button size="lg" className="w-full h-15 cursor-pointer bg-black dark:bg-white text-white dark:text-black text-base font-bold">
          Continue to Login
        </Button>
      </Link>
    </div>
  );
}

export default function VerifySuccessPage() {
  return (
    <AuthLayout
      title="Email Verified!"
      subtitle="Your email has been successfully verified. You can now access all features of dbcolorsNG."
    >
      <Suspense fallback={<div className="h-20 flex items-center justify-center text-neutral-500 font-medium">Loading...</div>}>
        <VerifySuccessContent />
      </Suspense>
    </AuthLayout>
  );
}
