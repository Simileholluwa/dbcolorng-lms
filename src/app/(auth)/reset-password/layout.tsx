import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create New Password",
  description:
    "Set a new secure password for your dbcolorsNG LMS account.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Create New Password — dbcolorsNG LMS",
    description: "Set a new secure password for your dbcolorsNG LMS account.",
  },
};

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
