import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Forgot your dbcolorsNG LMS password? Enter your email address and we'll send you a reset link.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Reset Password — dbcolorsNG LMS",
    description:
      "Forgot your password? Enter your email and we'll send you a reset link.",
  },
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
