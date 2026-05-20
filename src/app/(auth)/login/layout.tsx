import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your dbcolorsNG LMS account to continue your interior design learning journey.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sign In — dbcolorsNG LMS",
    description:
      "Sign in to your dbcolorsNG LMS account to continue your interior design learning journey.",
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
