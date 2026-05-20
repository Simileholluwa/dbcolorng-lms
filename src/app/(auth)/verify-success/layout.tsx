import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Email Verified",
  description:
    "Your email has been successfully verified. Welcome to dbcolorsNG LMS — your interior design learning journey begins now.",
  robots: { index: false, follow: false },
};

export default function VerifySuccessLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
