"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import AuthRedirect from "./AuthRedirect";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const chunkErrorPatterns = ["ChunkLoadError", "Failed to load chunk", "Loading chunk"];
      
      const isChunkError = chunkErrorPatterns.some((pattern) =>
        event.message?.includes(pattern) || 
        event.error?.message?.includes(pattern)
      );

      if (isChunkError) {
        console.warn("Chunk load error detected. Reloading page...");
        window.location.reload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const chunkErrorPatterns = ["ChunkLoadError", "Failed to load chunk", "Loading chunk"];
      const isChunkError = chunkErrorPatterns.some((pattern) =>
        event.reason?.message?.includes(pattern) || 
        event.reason?.stack?.includes(pattern) ||
        (event.reason && String(event.reason).includes(pattern))
      );

      if (isChunkError) {
        console.warn("Unhandled chunk load rejection detected. Reloading page...");
        window.location.reload();
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleChunkError);
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
