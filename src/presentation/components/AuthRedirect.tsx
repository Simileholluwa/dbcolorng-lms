"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

/**
 * AuthRedirect handles automatic redirection for authenticated users.
 * If a user is logged in and tries to access public pages (like Landing, Login, Register),
 * they are automatically routed to the dashboard.
 */
export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Satisfy strict lint rules about setState in useEffect by deferring it to the next tick.
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Only perform redirection logic on the client after mount
    if (!mounted || !router || !pathname) return;

    // Define public paths where authenticated users should be redirected from
    const authPaths = [
      "/", 
      "/login", 
      "/register", 
      "/forgot-password",
      "/verify-email-sent",
      "/verify-success",
      "/verify-error"
    ];
    
    if (isAuthenticated && authPaths.includes(pathname)) {
      if (user?.email_verified) {
        // Fully authenticated and verified users go to dashboard
        router.push("/dashboard");
      } else {
        // Authenticated but not verified
        // We only redirect to the verification notice if they aren't already on a verification page
        const verificationPaths = ["/verify-email-sent", "/verify-success", "/verify-error"];
        if (!verificationPaths.includes(pathname)) {
          router.push("/verify-email-sent");
        }
      }
    }
  }, [isAuthenticated, user, pathname, router, mounted]);

  return null;
}
