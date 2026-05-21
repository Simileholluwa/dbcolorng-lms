"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import AuthRedirect from "./AuthRedirect";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const triggerReload = () => {
      try {
        const now = Date.now();
        const lastReload = sessionStorage.getItem("chunk-error-last-reload");

        // Prevent infinite reload loops if user is offline or a chunk is permanently missing
        if (lastReload && now - parseInt(lastReload, 10) < 10000) {
          console.error("Chunk load error occurred, but page was already reloaded recently. Stopping reload loop.");
          return;
        }

        sessionStorage.setItem("chunk-error-last-reload", now.toString());
        console.warn("Chunk load error detected. Reloading page to fetch latest build...");
        window.location.reload();
      } catch (e) {
        // Fallback reload if sessionStorage is disabled or throws
        window.location.reload();
      }
    };

    const handleGlobalError = (event: ErrorEvent | Event) => {
      // 1. Detect resource loading failures (script/link tag 404s).
      // Since resource load errors do not bubble, this requires the listener to be registered in the capture phase.
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "SCRIPT" || target.tagName === "LINK")) {
        const url = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href;
        if (url && (url.includes("/_next/static/") || url.includes("chunks"))) {
          console.warn("Static resource chunk failed to load:", url);
          triggerReload();
          return;
        }
      }

      // 2. Detect runtime code-splitting exceptions (webpack / turbopack throw).
      const error = (event as ErrorEvent).error || event;
      const errorMessage = (event as ErrorEvent).message || error?.message || "";
      const errorStack = error?.stack || "";
      
      const chunkErrorPatterns = ["ChunkLoadError", "Failed to load chunk", "Loading chunk"];
      const isChunkError = chunkErrorPatterns.some((pattern) =>
        errorMessage.includes(pattern) || errorStack.includes(pattern)
      );

      if (isChunkError) {
        triggerReload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || "";
      const stack = reason?.stack || "";
      const stringified = reason ? String(reason) : "";

      const chunkErrorPatterns = ["ChunkLoadError", "Failed to load chunk", "Loading chunk"];
      const isChunkError = chunkErrorPatterns.some((pattern) =>
        message.includes(pattern) || 
        stack.includes(pattern) || 
        stringified.includes(pattern)
      );

      if (isChunkError) {
        triggerReload();
      }
    };

    // Register global listeners. Note 'true' as the third argument for the error listener
    // to enable the CAPTURE phase so resource load errors (which don't bubble) are caught.
    window.addEventListener("error", handleGlobalError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthRedirect />
      {children}
    </QueryClientProvider>
  );
}
