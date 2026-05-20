import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description:
    "A verification link has been sent to your inbox. Please verify your email to access your dbcolorsNG LMS account.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailSentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
