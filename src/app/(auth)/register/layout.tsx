import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join dbcolorsNG LMS and start learning interior design, colour theory, and space planning today. Sign up for free.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Create Account — dbcolorsNG LMS",
    description:
      "Join dbcolorsNG LMS and start learning interior design, colour theory, and space planning today.",
  },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
