import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Verification Failed",
  description:
    "The email verification link is invalid or has expired. Please request a new verification link.",
  robots: { index: false, follow: false },
};

export default function VerifyErrorLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
