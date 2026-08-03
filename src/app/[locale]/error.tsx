"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in the future (e.g., Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 select-none text-7xl">😵</div>
      <h1 className="text-2xl font-bold mb-3">Something Went Wrong</h1>
      <p className="text-muted-foreground max-w-md mb-10 text-base leading-relaxed">
        An unexpected error occurred. Our team has been notified. You can try again or head back home.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-owl-violet text-white font-semibold hover:bg-owl-violet/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition-colors"
        >
          <Home className="h-4 w-4" />
          Go Home
        </a>
      </div>
    </div>
  );
}
