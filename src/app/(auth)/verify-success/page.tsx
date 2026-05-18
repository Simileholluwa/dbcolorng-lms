"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui/Button";
import AuthLayout from "@/presentation/components/AuthLayout";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifySuccessPage() {
  return (
    <AuthLayout
      title="Email Verified!"
      subtitle="Your email has been successfully verified. You can now access all features of dbcolorsNG."
    >
      <div className="space-y-8">
        <Link href="/login" className="block w-full">
          <Button size="lg" className="w-full h-15 font-bold text-base">
            Continue to Login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
