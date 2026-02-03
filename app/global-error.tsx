"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const payload = {
        digest: (error as any)?.digest || null,
        message: process.env.NODE_ENV === "development" ? error?.message : undefined,
        name: error?.name,
        route: pathname,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        ts: new Date().toISOString(),
      };

      fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {}
  }, [error, pathname]);

  return (
    <html>
      <body className="p-6">
        <div className="max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {process.env.NODE_ENV === "development"
              ? error?.message
              : "The page failed to render. We’ve logged the error and are investigating."}
          </p>
          <div className="flex gap-2">
            <button className="border rounded px-3 py-1" onClick={() => reset()}>Try again</button>
          </div>
          {process.env.NODE_ENV !== "development" && (error as any)?.digest && (
            <p className="text-xs text-muted-foreground">Digest: {(error as any).digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
